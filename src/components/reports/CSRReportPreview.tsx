'use client';

import React from 'react';
import { Button } from '../ui/Button';

export interface CSRReportPreviewProps {
  organizationName?: string;
  period?: string;
  totalSurplusCount?: number;
  totalWeightKg?: number;
  totalCo2SavedKg?: number;
  totalBeneficiaries?: number;
}

export const CSRReportPreview: React.FC<CSRReportPreviewProps> = ({
  organizationName = 'Warung Bakso Pak Kumis',
  period = 'Agustus 2026',
  totalSurplusCount = 12,
  totalWeightKg = 42.5,
  totalCo2SavedKg = 106.25,
  totalBeneficiaries = 85,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Strict Print CSS Isolation to print ONLY CSR Report on 1 clean A4 portrait page */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #csr-isolated-area, #csr-isolated-area * {
            visibility: visible !important;
          }
          #csr-isolated-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 32px !important;
            box-shadow: none !important;
            border: 2px solid #1B3A5C !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-after: always !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      <div
        id="csr-isolated-area"
        className="bg-white border-2 border-[#1B3A5C] p-8 space-y-6 shadow-md rounded-2xl text-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1B3A5C] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <h2 className="text-xl font-black text-[#1B3A5C]">LAPORAN KEBERLANJUTAN CSR REPLATE</h2>
            </div>
            <p className="text-xs text-slate-600 font-bold mt-0.5">
              Dokumen Resmi Dampak Pengurangan Food Waste & Emisi Karbon Perusahaan
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-[#D4A843] uppercase block">PERIODE LAPORAN</span>
            <span className="text-sm font-black text-[#1B3A5C]">{period}</span>
          </div>
        </div>

        {/* Mitra Info */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Mitra Food Provider / Donatur:</span>
            <span className="font-extrabold text-[#1B3A5C] text-sm">{organizationName}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Wilayah Otoritas Operasional:</span>
            <span className="font-bold text-slate-800 text-sm">Kota Surabaya (Pusat & Genteng)</span>
          </div>
        </div>

        {/* Real-Time Impact Metric Grid (Poin 4 & 14) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0F1923] text-white p-5 rounded-2xl shadow-xs">
          <div>
            <span className="text-[11px] text-slate-300 block font-bold">Total Batch Surplus</span>
            <span className="text-lg font-black text-[#D4A843]">{totalSurplusCount} Transaksi</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-300 block font-bold">Makanan Terdistribusi</span>
            <span className="text-lg font-black text-white">{totalWeightKg} Kg</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-300 block font-bold">Pengurangan CO2</span>
            <span className="text-lg font-black text-emerald-400">{totalCo2SavedKg} Kg</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-300 block font-bold">Penerima Manfaat</span>
            <span className="text-lg font-black text-blue-300">{totalBeneficiaries} Jiwa</span>
          </div>
        </div>

        {/* Metodologi & SDG Standard */}
        <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="font-extrabold text-[#1B3A5C] text-sm">Metodologi Perhitungan & Pengesahan Standar SDG</h4>
          <p className="leading-relaxed">
            Perhitungan pengurangan emisi CO2 didasarkan pada standar koefisien dekomposisi sampah organik food waste sebesar <strong className="text-slate-900">2.5 kg CO2e per 1 kg makanan</strong> diselamatkan (Standar FAO & BPOM RI). Dokumen ini mengesahkan kontribusi aktif perusahaan dalam mendukung <strong className="text-slate-900">SDG 12.3 (Food Loss & Waste Reduction)</strong> dan <strong className="text-slate-900">SDG 13 (Climate Action)</strong>.
          </p>
        </div>

        {/* Official Signatures */}
        <div className="flex justify-between items-end pt-6 border-t border-slate-200 text-xs">
          <div className="text-left space-y-1">
            <p className="text-slate-500 text-[11px]">Diverifikasi Oleh:</p>
            <p className="font-extrabold text-[#1B3A5C]">Audit Internal Replate Platform</p>
            <p className="text-slate-400 text-[10px]">ID Laporan: RPT-CSR-2026-8812</p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-extrabold text-[#1B3A5C]">{organizationName}</p>
            <p className="text-slate-500 text-[11px]">Penanggung Jawab Operasional</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end gap-3 no-print">
        <Button
          variant="primary"
          size="md"
          className="font-extrabold flex items-center gap-2 shadow-md bg-[#1B3A5C] hover:bg-[#2C5A8F]"
          onClick={handlePrint}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>🖨️ Cetak Laporan CSR PDF (1 Halaman Clean)</span>
        </Button>
      </div>
    </div>
  );
};
