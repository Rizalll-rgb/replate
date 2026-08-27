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
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Strict Print CSS Isolation to print ONLY certificate on 1 clean A4 landscape page */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cert-isolated-area, #cert-isolated-area * {
            visibility: visible !important;
          }
          #cert-isolated-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 40px !important;
            box-shadow: none !important;
            border: 6px double #C5A059 !important;
            background: #FCFBF7 !important;
            color: #1B3A5C !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-after: always !important;
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

      {/* Authentic Formal Natural Certificate (Off-White Parchment, Elegant Serif, Official Seal) */}
      <div
        id="cert-isolated-area"
        className="bg-[#FCFBF7] text-[#1B3A5C] border-[6px] border-double border-[#C5A059] p-10 rounded-2xl shadow-xl relative overflow-hidden text-center space-y-6"
      >
        {/* Subtle Watermark Seal Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-[260px] font-serif font-black text-[#1B3A5C]">R</span>
        </div>

        {/* Certificate Formal Top Header */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm font-black tracking-widest text-[#1B3A5C] uppercase font-serif">
              REPLATE DIGITAL FOOD REDISTRIBUTION ECOSYSTEM
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#C5A059] uppercase tracking-wider">
            SERTIFIKAT PENGHARGAAN PENYELAMAT PANGAN
          </h2>
          <p suppressHydrationWarning className="text-[11px] text-slate-500 font-mono tracking-widest uppercase">
            NO. REGISTRASI SERTIFIKAT: {data.certificateId || 'CERT-RPL-2026-8812'}
          </p>
        </div>

        {/* Recipient Name Citation */}
        <div className="space-y-2 relative z-10 py-2">
          <p className="text-xs text-slate-600 font-medium uppercase tracking-widest">
            DIBERIKAN DENGAN HORMAT KEPADA:
          </p>
          <h1 className="text-3xl font-bold font-serif text-[#1B3A5C] border-b-2 border-[#C5A059] inline-block pb-1 px-8">
            {data.recipientName || 'Warung Bakso Pak Kumis'}
          </h1>
          {data.organizationName && (
            <p className="text-sm font-semibold text-slate-600 pt-1">{data.organizationName}</p>
          )}
        </div>

        {/* Formal Citation Text */}
        <p className="text-xs text-slate-700 max-w-2xl mx-auto leading-relaxed font-serif italic px-6 relative z-10">
          &quot;Atas apresiasi tinggi dan kontribusi nyata dalam redistribusi makanan berlebih, pencegahan emisi gas rumah kaca, serta partisipasi aktif mendukung pencapaian 5 Pilar SDGs: Zero Hunger (SDG 2), Inovasi Distribusi (SDG 9), Kota Berkelanjutan (SDG 11), Konsumsi Bertanggung Jawab (SDG 12), dan Aksi Iklim (SDG 13) melalui platform Replate.&quot;
        </p>

        {/* Real-Time Impact Metric Summary Box */}
        <div className="grid grid-cols-3 gap-4 bg-white/80 p-4 rounded-xl border border-[#C5A059]/40 max-w-xl mx-auto text-center shadow-xs relative z-10">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Surplus Diselamatkan</span>
            <span className="text-xl font-black text-[#1B3A5C]">{data.totalSavedKg || 142.5} Kg</span>
          </div>
          <div className="border-x border-slate-200 px-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Pengurangan CO2</span>
            <span className="text-xl font-black text-emerald-700">{data.totalCo2SavedKg || 356.3} Kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Penerima Manfaat</span>
            <span className="text-xl font-black text-[#C5A059]">{data.totalPeopleFed || 285} Jiwa</span>
          </div>
        </div>

        {/* Natural Official Signatures (Poin 6 - Removed Rizal & Daffa, Replace with Komite Ekosistem Replate) */}
        <div className="grid grid-cols-3 items-end pt-6 border-t border-[#C5A059]/30 text-xs relative z-10">
          <div className="text-center space-y-1">
            <p className="text-slate-500 text-[10px]">Diterbitkan Resmi:</p>
            <p className="font-bold text-[#1B3A5C]">{data.issuedDate || '21 Agustus 2026'}</p>
            <p className="text-slate-400 text-[10px]">Surabaya, Indonesia</p>
          </div>

          {/* Official Gold Embossed Stamp */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#C5A059] bg-[#FCFBF7] flex flex-col items-center justify-center shadow-sm p-2">
              <svg className="w-6 h-6 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-[7px] font-black text-[#C5A059] tracking-tighter uppercase mt-0.5">REPLATE AUDITED</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="font-serif font-bold text-[#1B3A5C] italic text-sm">Komite Ekosistem Replate</div>
            <p className="font-bold text-[#1B3A5C] text-[11px]">Dewan Pengarah Pangan Replate</p>
            <p className="text-slate-400 text-[10px]">Digital Food Ecosystem</p>
          </div>
        </div>
      </div>

      {/* Action Button (Poin 7 - SVG Icon instead of emoji) */}
      <div className="flex justify-center gap-3 no-print">
        <Button variant="gold" size="md" className="font-extrabold flex items-center gap-2 shadow-md" onClick={handlePrint}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Cetak Sertifikat Penghargaan (1 Halaman Clean)</span>
        </Button>
      </div>
    </div>
  );
};
