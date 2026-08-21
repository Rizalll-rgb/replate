'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { CertificateData } from '@/lib/pdf';

export interface CertificatePreviewProps {
  data: CertificateData;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ data }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Print CSS Styles to strictly isolate certificate print area to 1 clean page */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible !important;
          }
          #certificate-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: 4px solid #D4A843 !important;
            background: #0F1923 !important;
            color: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* Redesigned High-Contrast Luxury Executive Certificate */}
      <div
        id="certificate-print-area"
        className="bg-[#0F1923] text-white border-4 border-[#D4A843] p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center max-w-3xl mx-auto space-y-6"
      >
        {/* Luxury Gold Corner Ornaments */}
        <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#D4A843]"></div>
        <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#D4A843]"></div>
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#D4A843]"></div>
        <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#D4A843]"></div>

        {/* Certificate Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#D4A843]/20 border border-[#D4A843] rounded-full">
            <span className="text-xl">🏆</span>
            <span className="text-xs font-black tracking-widest text-[#D4A843] uppercase">
              REPLATE SUSTAINABILITY AWARD 2026
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#D4A843] uppercase tracking-wider">
            SERTIFIKAT PENGHARGAAN PENYELAMAT PANGAN
          </h2>
          <p className="text-[11px] text-slate-300 font-mono tracking-widest">
            SERTIFIKAT RESMI NOMOR: {data.certificateId || 'CERT-RPL-2026-88'}
          </p>
        </div>

        {/* Recipient Identity */}
        <div className="space-y-1 py-2">
          <p className="text-xs text-slate-300 font-semibold uppercase tracking-widest">
            DIBERIKAN KEPADA MITRA PENYELAMAT PANGAN:
          </p>
          <h1 className="text-3xl font-black text-white tracking-wide underline decoration-[#D4A843] decoration-2 underline-offset-8">
            {data.recipientName || 'Warung Bakso Pak Kumis'}
          </h1>
          {data.organizationName && (
            <p className="text-sm font-bold text-[#D4A843] pt-1">{data.organizationName}</p>
          )}
        </div>

        {/* Citation Description */}
        <p className="text-xs text-slate-200 max-w-xl mx-auto leading-relaxed font-normal italic px-4">
          &quot;Atas dedikasi dan kontribusi nyata dalam penanggulangan food waste, redistribusi makanan berlebih yang terverifikasi SOP BPOM & WHO, serta dampak pengurangan emisi gas rumah kaca di wilayah Kota Surabaya.&quot;
        </p>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 bg-white/10 p-5 rounded-2xl border border-[#D4A843]/40 max-w-xl mx-auto text-center">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-300 uppercase font-black tracking-wider block">Surplus Diselamatkan</span>
            <span className="text-2xl font-black text-[#D4A843]">{data.totalSavedKg || 42.5} Kg</span>
          </div>
          <div className="space-y-1 border-x border-white/20 px-2">
            <span className="text-[10px] text-slate-300 uppercase font-black tracking-wider block">Pengurangan CO2</span>
            <span className="text-2xl font-black text-emerald-400">{data.totalCo2SavedKg || 106.3} Kg</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-300 uppercase font-black tracking-wider block">Penerima Manfaat</span>
            <span className="text-2xl font-black text-blue-300">{data.totalPeopleFed || 85} Jiwa</span>
          </div>
        </div>

        {/* Footer Signature & Watermark */}
        <div className="flex justify-between items-end pt-6 border-t border-white/20 text-xs">
          <div className="text-left space-y-1">
            <p className="text-slate-400 text-[10px]">Diterbitkan Resmi Pada:</p>
            <p className="font-bold text-white">{data.issuedDate || '21 Agustus 2026'}</p>
            <p className="text-slate-400 text-[10px]">Kota Surabaya, Jawa Timur</p>
          </div>

          {/* Gold Stamp Seal */}
          <div className="w-16 h-16 rounded-full border-2 border-[#D4A843] bg-[#D4A843]/10 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-lg">🌟</span>
            <span className="text-[8px] font-black text-[#D4A843] tracking-tighter">REPLATE SEAL</span>
          </div>

          <div className="text-right space-y-1">
            <p className="font-extrabold text-[#D4A843] text-sm">Replate Platform Executive</p>
            <p className="text-slate-400 text-[10px]">Infinitera 2.0 Verification</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center gap-3 no-print">
        <Button variant="gold" size="md" className="font-extrabold flex items-center gap-2 shadow-md" onClick={handlePrint}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>🖨️ Cetak / Simpan Sertifikat PDF (1 Halaman Clean)</span>
        </Button>
      </div>
    </div>
  );
};
