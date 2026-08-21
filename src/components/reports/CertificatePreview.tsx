'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CertificateData } from '@/lib/pdf';
import { Logo } from '../ui/Logo';

export interface CertificatePreviewProps {
  data: CertificateData;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ data }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#0F1923] text-white border-2 border-[#D4A843] p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center max-w-2xl mx-auto">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4A843] via-emerald-400 to-[#D4A843]"></div>

        <div className="space-y-4">
          <div className="flex justify-center items-center">
            <Logo variant="light" size="md" />
          </div>

          <p className="text-xs text-[#D4A843] tracking-widest uppercase font-extrabold">
            SERTIFIKAT PENGHARGAAN PENYELAMAT PANGAN
          </p>

          <h2 className="text-2xl font-extrabold text-white mt-2">{data.recipientName}</h2>
          {data.organizationName && (
            <p className="text-sm text-slate-300 font-semibold">{data.organizationName}</p>
          )}

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-2 font-normal">
            Diberikan atas kontribusi nyata dalam redistribusi makanan berlebih, pengurangan emisi CO2, dan penanggulangan food waste secara transparan melalui platform Replate.
          </p>

          <div className="grid grid-cols-3 gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 max-w-lg mx-auto my-4 text-center">
            <div>
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Diselamatkan</span>
              <span className="text-lg font-extrabold text-[#D4A843]">{data.totalSavedKg} Kg</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">CO2 Prev.</span>
              <span className="text-lg font-extrabold text-emerald-400">{data.totalCo2SavedKg} Kg</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Penerima</span>
              <span className="text-lg font-extrabold text-blue-300">{data.totalPeopleFed} Orang</span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-white/10 text-[11px] text-slate-400">
            <div className="text-left">
              <p>ID Sertifikat: <span className="font-mono text-white font-bold">{data.certificateId}</span></p>
              <p>Diterbitkan: {data.issuedDate}</p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-[#D4A843]">Infinitera 2.0 Certified</p>
              <p className="text-[10px]">Replate Platform</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="gold" size="md" className="font-extrabold flex items-center gap-2" onClick={handlePrint}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Cetak / Simpan Sertifikat PDF</span>
        </Button>
      </div>
    </div>
  );
};
