'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface CSRReportPreviewProps {
  organizationName: string;
  period: string;
  totalSurplusCount: number;
  totalWeightKg: number;
  totalCo2SavedKg: number;
  totalBeneficiaries: number;
}

export const CSRReportPreview: React.FC<CSRReportPreviewProps> = ({
  organizationName = 'Warung Bakso Pak Kumis',
  period = 'Agustus 2026',
  totalSurplusCount = 28,
  totalWeightKg = 142.5,
  totalCo2SavedKg = 356.25,
  totalBeneficiaries = 285,
}) => {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Card className="bg-white border-slate-200 p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#1B3A5C]">Laporan Keberlanjutan CSR Replate</h2>
            <p className="text-xs text-slate-500 font-medium">Ringkasan Dampak Lingkungan & Sosial Perusahaan</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#D4A843] block">Periode Laporan</span>
            <span className="text-sm font-extrabold text-[#1B3A5C]">{period}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">Mitra Provider: {organizationName}</p>
          <p className="text-xs text-slate-500">Lokasi: Surabaya, Jawa Timur</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Total Batch Surplus</span>
            <span className="text-base font-extrabold text-[#1B3A5C]">{totalSurplusCount} Transaksi</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Makanan Terdistribusi</span>
            <span className="text-base font-extrabold text-[#1B3A5C]">{totalWeightKg} Kg</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Pengurangan CO2</span>
            <span className="text-base font-extrabold text-emerald-700">{totalCo2SavedKg} Kg</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Penerima Manfaat</span>
            <span className="text-base font-extrabold text-[#D4A843]">{totalBeneficiaries} Jiwa</span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <h4 className="font-extrabold text-[#1B3A5C]">Metodologi & Standar SDG</h4>
          <p>
            Perhitungan emisi CO2 didasarkan pada standar pengganda emisi dekomposisi organik food waste sebesar 2.5 kg CO2e per 1 kg makanan. Laporan ini mendukung pencapaian target SDG 11 (Kota Berkelanjutan) & SDG 13 (Aksi Perubahan Iklim).
          </p>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="primary" size="md" className="font-bold flex items-center gap-2" onClick={() => window.print()}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Unduh Laporan CSR (PDF)</span>
        </Button>
      </div>
    </div>
  );
};
