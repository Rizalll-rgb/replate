'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../ui/Button';
import {
  FileText,
  Download,
  Lock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Droplet,
  CloudRain,
  Flame,
  Users,
  Utensils,
  Award,
  Sparkles,
} from 'lucide-react';

export interface CSRCategoryItem {
  category: string;
  label: string;
  weightKg: number;
  portions: number;
  percentage: number;
  color: string;
}

export interface CSRReportPreviewProps {
  organizationName?: string;
  period?: string;
  month?: string;
  year?: string;
  totalSurplusCount?: number;
  totalWeightKg?: number;
  totalPortions?: number;
  totalCo2SavedKg?: number;
  totalWaterSavedL?: number;
  totalBeneficiaries?: number;
  isUnlocked?: boolean;
  onUnlockRequest?: () => void;
  categories?: CSRCategoryItem[];
}

export const CSRReportPreview: React.FC<CSRReportPreviewProps> = ({
  organizationName = 'Warung Bakso Pak Kumis',
  period = 'Oktober 2026',
  month = 'Oktober',
  year = '2026',
  totalSurplusCount = 14,
  totalWeightKg = 48.5,
  totalPortions,
  totalCo2SavedKg,
  totalWaterSavedL,
  totalBeneficiaries = 121,
  isUnlocked = true,
  onUnlockRequest,
  categories,
}) => {
  const portions = totalPortions ?? Math.round(totalWeightKg * 2.5);
  const co2 = totalCo2SavedKg ?? Math.round(totalWeightKg * 2.5 * 10) / 10;
  const water = totalWaterSavedL ?? Math.round(totalWeightKg * 500);

  const defaultCategories: CSRCategoryItem[] = [
    {
      category: 'Meals',
      label: 'Makanan Siap Saji (Meals)',
      weightKg: Math.round(totalWeightKg * 0.42 * 10) / 10,
      portions: Math.round(portions * 0.42),
      percentage: 42,
      color: '#1B3A5C',
    },
    {
      category: 'Bakery',
      label: 'Roti, Kue & Pastry (Bakery)',
      weightKg: Math.round(totalWeightKg * 0.30 * 10) / 10,
      portions: Math.round(portions * 0.30),
      percentage: 30,
      color: '#D4A843',
    },
    {
      category: 'Produce',
      label: 'Buah & Sayur Segar (Produce)',
      weightKg: Math.round(totalWeightKg * 0.18 * 10) / 10,
      portions: Math.round(portions * 0.18),
      percentage: 18,
      color: '#10B981',
    },
    {
      category: 'Dairy',
      label: 'Susu & Olahan (Dairy)',
      weightKg: Math.round(totalWeightKg * 0.10 * 10) / 10,
      portions: Math.round(portions * 0.10),
      percentage: 10,
      color: '#3B82F6',
    },
  ];

  const catList = categories || defaultCategories;

  const handlePrint = () => {
    if (!isUnlocked) {
      if (onUnlockRequest) onUnlockRequest();
      return;
    }
    window.print();
  };

  const reportDocId = `RPT-RPL-CSR-${year}-8812`;
  const verificationQrValue = `https://replate.id/verify/report?id=${reportDocId}&provider=${encodeURIComponent(organizationName)}&period=${encodeURIComponent(period)}&weight=${totalWeightKg}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Strict Print CSS Isolation to print ONLY this Report on 1 clean A4 portrait page */}
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
            padding: 24px 32px !important;
            box-shadow: none !important;
            border: 2px solid #1B3A5C !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-after: always !important;
            font-size: 10pt !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      {/* Access Gate Warning Banner if locked */}
      {!isUnlocked && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/60 text-amber-900 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-amber-950">
                Fitur Unduh / Cetak Laporan Terkunci
              </h4>
              <p className="text-[11px] text-amber-800 font-medium">
                Tombol cetak/download hanya dapat diakses oleh provider dengan paket langganan aktif (Business/Growth) atau yang telah membayar layanan Pay-Per-Use Rp 25.000 untuk periode ini.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onUnlockRequest}
            className="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Buka Akses (Rp 25.000 / Langganan)
          </button>
        </div>
      )}

      {/* Main Printable Document Area */}
      <div
        id="csr-isolated-area"
        className="bg-white border-2 border-[#1B3A5C] p-6 sm:p-8 space-y-6 shadow-md rounded-3xl text-slate-900 relative overflow-hidden"
      >
        {/* Kop Surat Resmi Replate */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#1B3A5C] pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1B3A5C] text-[#D4A843] flex items-center justify-center font-black text-lg tracking-wider">
                R
              </div>
              <div>
                <h1 className="text-xl font-black text-[#1B3A5C] tracking-wide leading-tight">
                  REPLATE INDONESIA
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Sistem Platform Penyelamatan Surplus Pangan Nasional &amp; Assurance ESG
                </p>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-medium">
              Menara Replate Tech, Surabaya, Jawa Timur • contact@replate.id • www.replate.id
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
            <span className="text-[9.5px] font-black text-[#D4A843] uppercase tracking-wider block">
              DOKUMEN RESMI CSR &amp; SUSTAINABILITY
            </span>
            <span className="text-sm font-black text-[#1B3A5C] block">
              Periode: {period}
            </span>
            <span className="text-[9px] font-mono text-slate-400 font-bold block">
              No: {reportDocId}
            </span>
          </div>
        </div>

        {/* Info Mitra Provider & Otoritas */}
        <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-semibold text-[10px] block">Mitra Food Provider (Donatur):</span>
            <strong className="text-sm font-black text-[#1B3A5C] block truncate">{organizationName}</strong>
            <span className="text-[10px] text-slate-400">Terdaftar di Ekosistem Replate</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold text-[10px] block">Wilayah Otoritas Operasional:</span>
            <strong className="text-xs font-bold text-slate-800 block">Kota Surabaya &amp; Sekitarnya</strong>
            <span className="text-[10px] text-slate-400">Jawa Timur, Indonesia</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold text-[10px] block">Standar Kepatuhan Keamanan:</span>
            <strong className="text-xs font-bold text-emerald-700 block">BPOM RI Standar 8-Poin Higienitas</strong>
            <span className="text-[10px] text-slate-400">Suhu Terjaga &amp; Wadah Food-Grade</span>
          </div>
        </div>

        {/* 4 Pilar Metrik Kinerja (Lingkungan & Sosial) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs text-[#1B3A5C] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4A843]" />
              Ringkasan Dampak Lingkungan &amp; Sosial (SDG Alignment)
            </h3>
            <span className="text-[10px] font-bold text-slate-500">
              {totalSurplusCount} Transaksi Rescue Berhasil
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Surplus Makanan Diselamatkan (Kg & Porsi) */}
            <div className="p-3.5 bg-gradient-to-br from-blue-900 to-[#1B3A5C] text-white rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] text-slate-300 font-bold block">Pangan Terselamatkan</span>
              <strong className="text-xl font-black text-white font-mono block">
                {totalWeightKg} Kg
              </strong>
              <span className="text-[10px] text-amber-300 font-bold block">
                Setara ~{portions} Porsi
              </span>
            </div>

            {/* 2. Reduksi Emisi GRK (SDG 12 & 13) */}
            <div className="p-3.5 bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300 font-bold">Reduksi Gas GRK</span>
                <span className="text-[8.5px] px-1 bg-emerald-700 text-emerald-100 rounded font-black">SDG 13</span>
              </div>
              <strong className="text-xl font-black text-emerald-300 font-mono block">
                {co2} Kg
              </strong>
              <span className="text-[10px] text-emerald-100 font-bold block">
                CO2e Emisi Tercegah
              </span>
            </div>

            {/* 3. Konservasi Air Bersih (SDG 12) */}
            <div className="p-3.5 bg-gradient-to-br from-cyan-900 to-blue-900 text-white rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300 font-bold">Konservasi Air</span>
                <span className="text-[8.5px] px-1 bg-cyan-700 text-cyan-100 rounded font-black">SDG 12</span>
              </div>
              <strong className="text-xl font-black text-cyan-300 font-mono block">
                {water.toLocaleString('id-ID')} L
              </strong>
              <span className="text-[10px] text-cyan-100 font-bold block">
                Virtual Water Saved
              </span>
            </div>

            {/* 4. Penerima Manfaat Sosial (SDG 2 Zero Hunger) */}
            <div className="p-3.5 bg-gradient-to-br from-amber-900 to-orange-900 text-white rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300 font-bold">Penerima Manfaat</span>
                <span className="text-[8.5px] px-1 bg-amber-700 text-amber-100 rounded font-black">SDG 2</span>
              </div>
              <strong className="text-xl font-black text-amber-300 font-mono block">
                {totalBeneficiaries} Jiwa
              </strong>
              <span className="text-[10px] text-amber-200 font-bold block">
                Zero Hunger Target
              </span>
            </div>
          </div>
        </div>

        {/* Tabel & Grafik Visual Distribusi Kategori Pangan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs text-[#1B3A5C] uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-emerald-600" />
              Distribusi Kategori Pangan Yang Berhasil Diselamatkan
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">
              Meals, Bakery, Produce, Dairy
            </span>
          </div>

          {/* Visual Bar Distribusi Kategori */}
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
            {catList.map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                title={`${item.label}: ${item.percentage}%`}
                className="h-full transition-all"
              />
            ))}
          </div>

          {/* Tabel Distribusi Lengkap */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1B3A5C] text-white uppercase text-[9.5px] tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-2.5">Kategori Pangan</th>
                  <th className="px-4 py-2.5 text-right">Berat (Kg)</th>
                  <th className="px-4 py-2.5 text-right">Porsi</th>
                  <th className="px-4 py-2.5 text-right">Proporsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                {catList.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-slate-800">{cat.label}</span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-slate-900">{cat.weightKg} Kg</td>
                    <td className="px-4 py-2 text-right font-mono">{cat.portions} Porsi</td>
                    <td className="px-4 py-2 text-right font-mono font-black text-slate-800">{cat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metodologi & Komitmen SDGs Resmi */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 space-y-1.5 text-[11px] leading-relaxed">
          <strong className="text-slate-900 font-black block text-xs">
            Metodologi Perhitungan Dampak Lingkungan &amp; Sosial:
          </strong>
          <p>
            • <strong>SDG 12 &amp; 13 (Climate Action &amp; Responsible Consumption):</strong> Reduksi emisi GRK dihitung berdasarkan koefisien dekomposisi anaerobik sampah makanan IPCC sebesar <strong>2.5 kg CO2e per 1 kg makanan</strong> yang berhasil dicegah dari Tempat Pemrosesan Akhir (TPA). Konservasi air virtual dihitung dengan rata-rata 500 liter air/kg pangan.
          </p>
          <p>
            • <strong>SDG 2 (Zero Hunger):</strong> Makanan yang masih layak dan higienis berstandar BPOM disalurkan langsung kepada keluarga rentan dan yayasan panti asuhan terdaftar melalui ekosistem Replate.
          </p>
        </div>

        {/* Pengesahan Tanda Tangan & QR Code Verifikasi Dokumen */}
        <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border border-slate-300 rounded-xl shrink-0 shadow-2xs">
              <QRCodeSVG value={verificationQrValue} size={64} level="M" />
            </div>
            <div className="space-y-0.5 text-left">
              <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block">
                Verifikasi Dokumen Digital
              </span>
              <strong className="text-slate-900 font-black text-xs block">REPLATE ASSURANCE ESG</strong>
              <span className="font-mono text-[9px] text-slate-500 block">Hash: {reportDocId}</span>
              <span className="text-[9px] text-emerald-700 font-bold block">Status: Sah &amp; Terdaftar</span>
            </div>
          </div>

          <div className="text-right space-y-1 sm:min-w-[200px]">
            <p className="text-slate-500 text-[10px]">Surabaya, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-black text-slate-900 text-xs">{organizationName}</p>
            <div className="h-8 flex items-center justify-end">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[9px] font-black">
                TERVERIFIKASI DIGITAL
              </span>
            </div>
            <p className="text-slate-400 text-[9.5px]">Penanggung Jawab Mitra Provider</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="text-xs text-slate-500 font-medium">
          {isUnlocked ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Akses Laporan Terbuka (Langganan / Pay-Per-Use Aktif)
            </span>
          ) : (
            <span className="text-amber-700 font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-600" />
              Akses Terkunci: Butuh Langganan Business/Growth atau Pay-Per-Use Rp 25.000
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {isUnlocked ? (
            <>
              <a
                href={`/api/reports/impact?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}&format=html`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto font-black text-xs py-3 px-4 shadow-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-2 cursor-pointer no-print transition-colors"
                title="Buka dokumen cetak resmi dari API Server"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Format Cetak API</span>
              </a>
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto font-black text-xs py-3 px-6 shadow-md bg-[#1B3A5C] hover:bg-[#2C5A8F] text-[#D4A843] flex items-center justify-center gap-2 cursor-pointer"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Download Laporan PDF (A4)</span>
              </Button>
            </>
          ) : (
            <Button
              variant="gold"
              size="md"
              className="w-full sm:w-auto font-black text-xs py-3 px-6 shadow-md text-slate-950 flex items-center justify-center gap-2 cursor-pointer"
              onClick={onUnlockRequest}
            >
              <Lock className="w-4 h-4" />
              <span>Buka Akses Unduh (Rp 25.000 / Langganan)</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
