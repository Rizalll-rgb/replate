'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
    }
  };

  const handleSimulatedScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onScanSuccess(manualCode.trim() || 'FB-SBY-DEMO-CLAIM-123');
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto space-y-4">
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

      <div className="relative aspect-square max-w-[240px] mx-auto bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#D4A843]">
        {isScanning ? (
          <div className="text-white text-center space-y-2">
            <svg className="w-8 h-8 mx-auto animate-spin text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-xs font-semibold text-slate-200">Memindai QR Code...</p>
          </div>
        ) : (
          <div className="text-center p-4 text-slate-400">
            <svg className="w-12 h-12 mx-auto text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p className="text-xs text-slate-300">Arahkan QR Code ke area ini</p>
          </div>
        )}
      </div>

      <Button
        variant="gold"
        size="md"
        className="w-full text-xs font-bold"
        onClick={handleSimulatedScan}
        isLoading={isScanning}
      >
        Simulasi Pindai Kamera (Camera Scan)
      </Button>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-bold uppercase">atau</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-3">
        <Input
          placeholder="Masukkan Kode (cth: FB-SBY-20260819-XXXX)"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
        />
        <Button type="submit" variant="primary" size="sm" className="w-full text-xs font-bold">
          Verifikasi Kode Transaksi
        </Button>
      </form>
    </div>
  );
};
