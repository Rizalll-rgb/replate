'use client';

import React from 'react';
import {
  Utensils,
  Leaf,
  Globe2,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';

export const SDGSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-[#1B3A5C] bg-amber-100 border border-amber-300 px-3.5 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
            UN SUSTAINABLE DEVELOPMENT GOALS • BMC TDC FEST PITCH
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1B3A5C] tracking-tight">
            Komitmen Nyata Akselerasi 3 Pilar Utama SDGs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Replate mengintegrasikan model bisnis sirkular (Circular Economy) yang secara langsung menyasar tiga target keberlanjutan global Perserikatan Bangsa-Bangsa (PBB):
          </p>
        </div>

        {/* 3 Core SDG Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SDG 2: ZERO HUNGER */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#1B3A5C] p-6 sm:p-8 space-y-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#DDA63A] text-white font-black text-xs uppercase tracking-wider shadow-xs">
                  SDG 2 • ZERO HUNGER
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">UN SDG 2</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#1B3A5C] leading-snug">
                  Tanpa Kelaparan &amp; Ketahanan Gizi Panti
                </h3>
                <span className="text-xs font-bold text-[#DDA63A] block mt-0.5">
                  Target 2.1 &amp; 2.2: Akses Pangan Bergizi untuk Semua
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Menghubungkan kelebihan makanan bergizi layak santap dari hotel bintang lima dan katering pesta ke panti asuhan, panti jompo, dan masyarakat rentan secara gratis 100% (Rp 0) didukung armada logistik Food Rescue.
              </p>

              {/* Action Bullets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Smart Matching Panti:</strong> Distribusi porsi besar tepat sasaran sesuai kapasitas anak asuh.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Standar Steril BPOM:</strong> Jaminan keamanan pangan siap santap dengan boks termal higienis.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bebas Biaya Logistik:</strong> 100% disubsidi melalui platform dan kas infaq kemanusiaan.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Capaian Terukur:</span>
              <strong className="text-sm font-black text-amber-950 font-mono">
                3,700+ Porsi Bergizi Telah Tersalurkan
              </strong>
            </div>
          </div>

          {/* SDG 12: RESPONSIBLE CONSUMPTION & PRODUCTION */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#1B3A5C] p-6 sm:p-8 space-y-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#BF8B2E] text-white font-black text-xs uppercase tracking-wider shadow-xs">
                  SDG 12 • RESPONSIBLE CONSUMPTION
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">UN SDG 12</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#1B3A5C] leading-snug">
                  Konsumsi &amp; Produksi Pangan Bertanggung Jawab
                </h3>
                <span className="text-xs font-bold text-[#BF8B2E] block mt-0.5">
                  Target 12.3: Pangkas Separuh Food Waste Tingkat Ritel
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Mengubah surplus makanan komersial bernilai ekonomi tinggi menjadi peluang penyelamatan melalui skema Rescue Sale (diskon 50-70%) sebelum waktu kedaluwarsa, meminimalkan timbulan sampah organik di hulu.
              </p>

              {/* Action Bullets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ekonomi Sirkular Ritel:</strong> Provider memulihkan biaya modal sebelum makanan terbuang sia-sia.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Solusi Terjangkau Konsumen:</strong> Mahasiswa &amp; pekerja mendapatkan makanan lezat hemat anggaran.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Audit Rantai Pasok:</strong> Laporan bulanan transparan untuk efisiensi inventaris toko.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Capaian Terukur:</span>
              <strong className="text-sm font-black text-amber-950 font-mono">
                1,482+ Kg Surplus Pangan Berhasil Diselamatkan
              </strong>
            </div>
          </div>

          {/* SDG 13: CLIMATE ACTION */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#1B3A5C] p-6 sm:p-8 space-y-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#3F7E44] text-white font-black text-xs uppercase tracking-wider shadow-xs">
                  SDG 13 • CLIMATE ACTION
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">UN SDG 13</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#1B3A5C] leading-snug">
                  Aksi Iklim &amp; Mitigasi Gas Metana (CH4)
                </h3>
                <span className="text-xs font-bold text-[#3F7E44] block mt-0.5">
                  Target 13: Dekarbonisasi Berbasis Metodologi IPCC
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Mencegah pembusukan anaerobik timbunan sampah sisa makanan di TPA yang melepaskan gas metana ($CH_4$) dengan potensi pemanasan global (GWP100) 28 kali lebih merusak daripada karbon dioksida ($CO_2$).
              </p>

              {/* Action Bullets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Standar IPCC Vol 5:</strong> Perhitungan emisi akurat model First Order Decay (FOD) TPA.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sertifikat ESG Karbon:</strong> Dokumen terverifikasi resmi untuk klaim dekarbonisasi korporasi.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pengurangan Emisi Logistik:</strong> Algoritma rute jemput terdekat minim polusi knalpot.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Capaian Terukur:</span>
              <strong className="text-sm font-black text-emerald-950 font-mono">
                3,706+ Kg CO2e Emisi Gas Rumah Kaca Dicegah
              </strong>
            </div>
          </div>
        </div>

        {/* Bottom Partnership Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#1B3A5C] to-[#0F1D2E] rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                Kolaborasi Ekosistem Keberlanjutan
              </span>
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white">
              Bawa Bisnis Kuliner Anda Menjadi Bagian dari Solusi SDGs
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Daftarkan hotel, katering, atau restoran Anda sebagai mitra Replate untuk mendapatkan Laporan Dampak Lingkungan resmi dan lencana verifikasi keberlanjutan.
            </p>
          </div>

          <a
            href="/register?role=PROVIDER"
            className="px-6 py-3 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all shrink-0 cursor-pointer whitespace-nowrap"
          >
            Gabung Mitra Keberlanjutan →
          </a>
        </div>
      </div>
    </section>
  );
};
