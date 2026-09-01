'use client';

import React, { useState } from 'react';
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
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadOfflineCard = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
    // Trigger browser print/save card
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200 shadow-md max-w-sm mx-auto text-center space-y-4">
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

      {/* QR Code Container */}
      <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#1B3A5C]/30 shadow-xs relative group">
        <QRCodeSVG
          value={value}
          size={180}
          level="H"
          includeMargin={true}
          fgColor="#1B3A5C"
        />
        <div className="absolute inset-x-0 bottom-1 text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest">
          SISTEM KEAMANAN PANGAN
        </div>
      </div>

      {/* Details Breakdown */}
      <div className="w-full space-y-2 text-left">
        <div>
          <h4 className="font-black text-[#1B3A5C] text-xs text-center">{codeTitle}</h4>
          <p className="text-[10.5px] text-slate-500 text-center mt-0.5 leading-tight">{codeSubtitle}</p>
        </div>

        {/* Resi Code Badge */}
        <div className="w-full text-center">
          <div className="px-3 py-1 bg-[#1B3A5C] text-[#D4A843] rounded-xl font-mono text-xs font-black shadow-xs inline-block">
            {value}
          </div>
        </div>

        {(foodName || portions || recipientName) && (
          <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-[10.5px] space-y-1 font-medium text-slate-700">
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
            {expiryTime && (
              <div className="flex justify-between">
                <span className="text-slate-500">Batas Konsumsi:</span>
                <strong className="text-red-700">{expiryTime}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Offline Download / Save Button */}
      <div className="w-full pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleDownloadOfflineCard}
          className="w-full py-2 px-3 bg-[#1B3A5C] hover:bg-[#142C47] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>📥 Unduh QR Tiket Offline (Cetak / PDF)</span>
        </button>
        {downloaded && (
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">
            ✓ Dokumen siap dicetak / disimpan offline!
          </span>
        )}
      </div>
    </div>
  );
};
