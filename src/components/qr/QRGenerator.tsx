'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface QRGeneratorProps {
  value: string;
  codeTitle?: string;
  codeSubtitle?: string;
  recipientName?: string;
  foodName?: string;
  portions?: string;
  deliveryMethod?: string;
  expiryTime?: string;
  courierName?: string;
  courierVehicle?: string;
  courierPhone?: string;
  picPanti?: string;
  providerName?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  value,
  codeTitle = 'REPLATE DIGITAL MANIFEST & QR PASS',
  codeSubtitle = 'Tunjukkan QR Code ini kepada Petugas / Driver saat serah terima',
  recipientName,
  foodName,
  portions,
  deliveryMethod,
  expiryTime,
  courierName,
  courierVehicle,
  courierPhone,
  picPanti,
  providerName,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  /** Download as PNG using canvas */
  const handleDownloadPNG = async () => {
    try {
      const svgEl = printAreaRef.current?.querySelector('svg');
      if (!svgEl) return;

      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 3; // high res
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `Replate_QR_${value.replace(/[^a-zA-Z0-9-]/g, '_')}.png`;
          a.click();
          URL.revokeObjectURL(a.href);
          setDownloaded(true);
          setTimeout(() => setDownloaded(false), 3000);
        }, 'image/png', 1.0);

        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (_) {
      // Fallback to print
      handlePrintIsolated();
    }
  };

  /** Print only the QR card, not the whole page */
  const handlePrintIsolated = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  /** Copy resi code to clipboard */
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (_) {}
  };

  /** Share to WhatsApp */
  const handleShareWhatsApp = () => {
    const text = `📋 *REPLATE - Surat Jalan Donasi*\n\n🔖 Kode Resi: ${value}\n🍽️ Menu: ${foodName || '-'}\n📦 Porsi: ${portions || '-'}\n🏠 Penerima: ${recipientName || '-'}\n🚚 Kurir: ${courierName || '-'}\n⏰ Batas: ${expiryTime || '-'}\n\n✅ Tunjukkan kode ini saat serah terima.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      {/* Strict Print CSS - isolate only the QR card area */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #unified-qr-print-area, #unified-qr-print-area * { visibility: visible !important; }
          #unified-qr-print-area {
            position: fixed !important;
            left: 0 !important; top: 0 !important;
            width: 100vw !important; height: auto !important;
            margin: 0 !important; padding: 24px !important;
            background: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 16mm; }
        }
      `}</style>

      <div
        id="unified-qr-print-area"
        ref={printAreaRef}
        className="flex flex-col items-center justify-center p-5 sm:p-6 bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200 shadow-md max-w-sm mx-auto text-center space-y-4"
      >
        {/* Brand Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#1B3A5C] text-[#D4A843] flex items-center justify-center font-black text-xs">
              R
            </div>
            <span className="font-black text-xs tracking-wider text-[#1B3A5C]">REPLATE 2.0</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-black uppercase">
            ✓ BPOM VERIFIED
          </span>
        </div>

        {/* Title */}
        <div>
          <h4 className="font-black text-[#1B3A5C] text-xs text-center">{codeTitle}</h4>
          <p className="text-[10.5px] text-slate-500 text-center mt-0.5 leading-tight">{codeSubtitle}</p>
        </div>

        {/* Resi Code Badge */}
        <div className="w-full text-center">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-4 py-2 bg-slate-950 text-[#D4A843] rounded-xl font-mono text-sm font-black shadow-xs inline-flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-all"
            title="Klik untuk menyalin kode resi"
          >
            {value}
            <svg className="w-3.5 h-3.5 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#1B3A5C]/30 shadow-xs relative">
          <QRCodeSVG
            value={JSON.stringify({
              ticket: value,
              food: foodName,
              recipient: recipientName,
              portions,
              time: expiryTime,
            })}
            size={180}
            level="H"
            includeMargin={true}
            fgColor="#1B3A5C"
          />
          <div className="absolute inset-x-0 bottom-1 text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest">
            SISTEM KEAMANAN PANGAN
          </div>
        </div>

        {/* Info Table */}
        <div className="w-full p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-[10.5px] space-y-1.5 font-medium text-slate-700">
          {providerName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Pengirim:</span>
              <strong className="text-[#1B3A5C] truncate max-w-[170px]">{providerName}</strong>
            </div>
          )}
          {foodName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Menu:</span>
              <strong className="text-slate-900 truncate max-w-[170px]">{foodName}</strong>
            </div>
          )}
          {portions && (
            <div className="flex justify-between">
              <span className="text-slate-500">Jumlah:</span>
              <strong className="text-[#1B3A5C]">{portions}</strong>
            </div>
          )}
          {recipientName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Penerima:</span>
              <strong className="text-slate-900 truncate max-w-[170px]">{recipientName}</strong>
            </div>
          )}
          {picPanti && (
            <div className="flex justify-between">
              <span className="text-slate-500">PIC Penerima:</span>
              <strong className="text-slate-900 truncate max-w-[170px]">{picPanti}</strong>
            </div>
          )}
          {deliveryMethod === 'RESCUE_COURIER' && !courierName && (
            <div className="border-t border-slate-200 pt-2 mt-1">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-center space-y-0.5">
                <span className="font-black text-[10.5px] block text-amber-950">⏳ Menunggu Driver Mengambil di Pool Siaga</span>
                <p className="text-[9.5px] text-amber-800 font-medium">
                  Transaksi berada di Pool Siaga Relawan Komunitas. Informasi pengemudi & plat kendaraan akan otomatis muncul saat ada driver kurir komunitas yang mengambil pesanan ini.
                </p>
              </div>
            </div>
          )}
          {courierName && (
            <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
              <span className="text-slate-500">Kurir Ditugaskan:</span>
              <strong className="text-slate-900 truncate max-w-[170px]">{courierName}</strong>
            </div>
          )}
          {courierVehicle && (
            <div className="flex justify-between">
              <span className="text-slate-500">Armada:</span>
              <strong className="text-slate-900 truncate max-w-[170px]">{courierVehicle}</strong>
            </div>
          )}
          {courierPhone && (
            <div className="flex justify-between">
              <span className="text-slate-500">Telepon Kurir:</span>
              <strong className="text-slate-900">{courierPhone}</strong>
            </div>
          )}
          {deliveryMethod && (
            <div className="flex justify-between">
              <span className="text-slate-500">Metode Penjemputan:</span>
              <strong className="text-slate-900">
                {deliveryMethod === 'RESCUE_COURIER' || deliveryMethod === 'RESCUE_PARTNER' 
                  ? 'Kurir Komunitas (Pool Siaga)' 
                  : deliveryMethod === 'PROVIDER_DIRECT' || deliveryMethod === 'COURIER_DELIVERY' 
                    ? 'Armada Driver Toko' 
                    : 'Ambil Mandiri (Self-Pickup)'}
              </strong>
            </div>
          )}
          {expiryTime && (
            <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
              <span className="text-slate-500">Batas Konsumsi:</span>
              <strong className="text-red-700">{expiryTime}</strong>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full pt-2 border-t border-slate-100 space-y-2 no-print">
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="w-full py-2.5 px-3 bg-[#1B3A5C] hover:bg-[#142C47] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>💾 Unduh QR Tiket (PNG)</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrintIsolated}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              🖨️ Cetak PDF
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              📲 WhatsApp
            </button>
          </div>
          {downloaded && (
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">
              ✓ Berhasil! Dokumen siap disimpan atau dikirim.
            </span>
          )}
        </div>

        {/* Footer */}
        <p className="text-[9px] text-slate-400 font-medium leading-snug">
          Tunjukkan kode QR ini ke kurir relawan atau petugas panti saat serah terima di kasir. Tiket ini berlaku selama batas waktu konsumsi yang tertera.
        </p>
      </div>
    </>
  );
};
