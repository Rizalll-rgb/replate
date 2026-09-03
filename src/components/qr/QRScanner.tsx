'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Html5Qrcode } from 'html5-qrcode';

export interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const [manualCode, setManualCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileScannerRef = useRef<Html5Qrcode | null>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (fileScannerRef.current) {
        try {
          fileScannerRef.current.clear();
        } catch (_) {}
      }
    };
  }, [stopCamera]);

  // Start direct native camera stream
  const startCamera = async (overrideDeviceId?: string) => {
    setCameraError(null);
    setIsStartingCamera(true);

    try {
      // 1. Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // 2. Build constraints
      const targetDevice = overrideDeviceId || selectedDeviceId;
      const constraints: MediaStreamConstraints = {
        video: targetDevice
          ? { deviceId: { exact: targetDevice } }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // 3. Enumerate camera devices for user selection dropdown
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
        if (!selectedDeviceId && videoInputs.length > 0) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (_) {}

      // 4. Attach stream to native video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      setIsCameraActive(true);

      // 5. Start real-time QR code detection
      startQRScannerLoop();
    } catch (err: any) {
      console.error('Camera start error:', err);
      // If environment camera fails, retry with any default camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
        setIsCameraActive(true);
        startQRScannerLoop();
        return;
      } catch (fallbackErr: any) {
        setCameraError(
          fallbackErr?.message?.includes('NotAllowedError') || fallbackErr?.name === 'NotAllowedError'
            ? 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.'
            : 'Kamera tidak dapat diakses atau sedang digunakan aplikasi lain: ' + (fallbackErr?.message || '')
        );
        setIsCameraActive(false);
      }
    } finally {
      setIsStartingCamera(false);
    }
  };

  // Real-time QR barcode scanner loop
  const startQRScannerLoop = () => {
    // A. Native BarcodeDetector (Chrome, Edge, Opera on Windows 11)
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13', 'upc_a'],
        });

        const scanFrame = async () => {
          if (!streamRef.current || !videoRef.current) return;
          if (videoRef.current.readyState >= 2) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const detectedCode = barcodes[0].rawValue;
                if (detectedCode) {
                  stopCamera();
                  onScanSuccess(detectedCode);
                  return;
                }
              }
            } catch (_) {}
          }
          animFrameRef.current = requestAnimationFrame(scanFrame);
        };

        animFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      } catch (_) {}
    }

    // B. Canvas + Html5Qrcode file scan fallback
    scanIntervalRef.current = setInterval(async () => {
      if (!streamRef.current || !videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2 || video.videoWidth === 0) return;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(640, video.videoWidth);
        canvas.height = Math.min(640, video.videoHeight);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'frame.png', { type: 'image/png' });
          try {
            if (!fileScannerRef.current) {
              fileScannerRef.current = new Html5Qrcode('qr-hidden-scanner-canvas');
            }
            const decoded = await fileScannerRef.current.scanFile(file, false);
            if (decoded) {
              stopCamera();
              onScanSuccess(decoded);
            }
          } catch (_) {}
        }, 'image/png');
      } catch (_) {}
    }, 500);
  };

  const handleToggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isCameraActive) {
      startCamera(deviceId);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!fileScannerRef.current) {
        fileScannerRef.current = new Html5Qrcode('qr-hidden-scanner-canvas');
      }
      const decodedText = await fileScannerRef.current.scanFile(file, true);
      if (decodedText) {
        onScanSuccess(decodedText);
      }
    } catch (err) {
      alert('Tidak menemukan QR Code yang valid pada gambar tersebut. Coba gambar lain atau gunakan kamera live.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
    }
  };

  const handleSimulatedScan = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      onScanSuccess(manualCode.trim() || 'RPL-DON-2026-88192');
    }, 800);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto space-y-4">
      {/* Hidden container for file scan fallback */}
      <div id="qr-hidden-scanner-canvas" className="hidden" />

      <div className="text-center">
        <h4 className="font-extrabold text-[#1B3A5C] text-base flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-[#1B3A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Pindai QR Code Penjemputan</span>
        </h4>
        <p className="text-xs text-slate-500 mt-1">Gunakan kamera atau masukkan kode transaksi secara manual</p>
      </div>

      {/* Real Live Camera Video Box */}
      <div className="relative aspect-square max-w-[260px] mx-auto bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#D4A843] shadow-inner">
        {/* Direct HTML5 Video Element with Native Hardware Acceleration */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
        />

        {/* Laser Animation when Camera Active */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-10">
            <div className="w-[190px] h-[190px] border-2 border-emerald-400/80 rounded-xl relative overflow-hidden">
              <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34D399] animate-[bounce_2s_infinite]"></div>
              <span className="absolute bottom-2 inset-x-0 text-center text-[9px] font-bold text-emerald-300 bg-slate-950/70 py-0.5 rounded">
                Arahkan QR ke dalam kotak
              </span>
            </div>
          </div>
        )}

        {/* Placeholder when Camera is inactive */}
        {!isCameraActive && (
          <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center text-center p-5 text-slate-400 space-y-3">
            {isStartingCamera ? (
              <div className="space-y-2">
                <svg className="w-8 h-8 mx-auto animate-spin text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-xs font-semibold text-slate-200">Menghubungkan ke kamera...</p>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-xs text-slate-300 font-medium">Kamera belum aktif</p>
                <p className="text-[10px] text-slate-400">Klik tombol di bawah untuk menyalakan kamera scanner</p>
              </>
            )}
          </div>
        )}
      </div>

      {cameraError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs text-center font-medium">
          {cameraError}
        </div>
      )}

      {/* Multiple Camera Device Selector if more than 1 camera */}
      {availableDevices.length > 1 && (
        <div className="space-y-1">
          <label className="text-[10.5px] font-bold text-slate-600 block">Pilih Kamera:</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-1 focus:ring-[#1B3A5C]"
          >
            {availableDevices.map((device, idx) => (
              <option key={device.deviceId || idx} value={device.deviceId}>
                {device.label || `Kamera ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Camera Toggle Button */}
      <div className="space-y-2">
        <Button
          variant={isCameraActive ? 'danger' : 'primary'}
          size="md"
          className="w-full text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          onClick={handleToggleCamera}
          isLoading={isStartingCamera}
        >
          {isCameraActive ? (
            <>
              <span>⏹️ Matikan Kamera Scanner</span>
            </>
          ) : (
            <>
              <span>📷 Buka Kamera Scanner Live</span>
            </>
          )}
        </Button>

        {/* Scan from file input option */}
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>📁 Unggah Foto QR</span>
          </button>

          <button
            type="button"
            onClick={handleSimulatedScan}
            disabled={isSimulating}
            className="flex-1 py-2 px-3 bg-[#D4A843]/15 hover:bg-[#D4A843]/25 text-[#1B3A5C] font-extrabold text-xs rounded-xl border border-[#D4A843]/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isSimulating ? '⏳ Memindai...' : '⚡ Demo Scan'}</span>
          </button>
        </div>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-bold uppercase">atau ketik manual</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-2.5">
        <Input
          placeholder="Masukkan Kode (cth: RPL-DON-2026-88192)"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
        />
        <Button type="submit" variant="primary" size="sm" className="w-full text-xs font-bold py-2.5">
          Verifikasi Kode Transaksi
        </Button>
      </form>
    </div>
  );
};
