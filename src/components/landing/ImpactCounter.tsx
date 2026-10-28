'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Leaf,
  Users,
  Building,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Droplet,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

export const ImpactCounter: React.FC = () => {
  // Interactive Simulator State: Monthly surplus rescued in Kg
  const [interactiveKg, setInteractiveKg] = useState<number>(50);

  // Live dynamic calculations (Standard IPCC & Bappenas)
  const calcCo2 = Math.round(interactiveKg * 2.5 * 10) / 10;
  const calcPortions = Math.round(interactiveKg * 2.5);
  const calcWater = interactiveKg * 500;
  const calcEconomicValue = interactiveKg * 25000;

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-br from-[#0F1D2E] via-[#1B3A5C] to-[#122438] text-white relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4A843]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-[#D4A843] text-slate-950 font-black text-xs uppercase tracking-widest inline-flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            NARASI DAMPAK KEBERLANJUTAN • PITCH BMC TDC FEST
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Metrik Nyata Penyelamatan Pangan Nasional
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Platform Replate menghubungkan hotel, restoran, dan katering dengan konsumen serta panti asuhan untuk menghentikan timbulan <em>Food Loss &amp; Waste</em> secara transparan dan terukur.
          </p>
        </div>

        {/* 3 Core Impact Counters Sesuai Pitch BMC TDC Fest */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric 1: Total Pangan Terselamatkan (Kg) */}
          <div className="bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 hover:border-emerald-400 transition-all shadow-xl text-center space-y-3 group">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Package className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
                Target Reduksi Food Loss &amp; Waste
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                1,482.5 <span className="text-lg text-emerald-400 font-bold">Kg</span>
              </h3>
              <strong className="text-sm sm:text-base font-extrabold text-slate-200 block">
                Total Pangan Terselamatkan (Kg)
              </strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Makanan layak santap dari puluhan mitra donor yang dicegah dari pembusukan di Tempat Pemrosesan Akhir (TPA).
            </p>
          </div>

          {/* Metric 2: Emisi Karbon Dicegah (Kg CO2e) */}
          <div className="bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl border-2 border-amber-400/40 hover:border-[#D4A843] transition-all shadow-xl text-center space-y-3 group">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/20 text-[#D4A843] flex items-center justify-center border border-amber-400/30 group-hover:scale-110 transition-transform">
              <Leaf className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                Standar IPCC Vol 5 Methane First Order Decay
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-[#D4A843] font-mono tracking-tight">
                3,706.3 <span className="text-lg text-amber-300 font-bold">Kg</span>
              </h3>
              <strong className="text-sm sm:text-base font-extrabold text-slate-200 block">
                Emisi Karbon Dicegah (Kg CO2e)
              </strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Pencegahan pelepasan gas metana ($CH_4$) berbahaya dengan faktor GWP100 = 28 sesuai pedoman emisi iklim PBB.
            </p>
          </div>

          {/* Metric 3: Porsi Makanan Terbagi ke Panti Asuhan */}
          <div className="bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl border-2 border-blue-400/40 hover:border-blue-300 transition-all shadow-xl text-center space-y-3 group">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/20 text-cyan-300 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black text-cyan-300 uppercase tracking-wider block">
                Klaim Donasi &amp; Porsi Binaan Rp 0
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                3,700+ <span className="text-lg text-cyan-400 font-bold">Porsi</span>
              </h3>
              <strong className="text-sm sm:text-base font-extrabold text-slate-200 block">
                Porsi Makanan Terbagi ke Panti Asuhan
              </strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Disalurkan langsung ke 45+ panti asuhan dan warga prasejahtera melalui koordinasi relawan Food Rescue terverifikasi.
            </p>
          </div>
        </div>

        {/* Counter Stat Interaktif: Live Sustainability Impact Simulator */}
        <div className="bg-gradient-to-br from-slate-900 to-[#10243C] rounded-3xl p-6 sm:p-10 border-2 border-[#D4A843]/50 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#D4A843]" />
                <h4 className="text-lg sm:text-xl font-black text-white">
                  Kalkulator Dampak Interaktif (Simulasi Bisnis &amp; Komunitas)
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                Geser slider untuk mensimulasikan dampak nyata jika restoran / katering Anda menyelamatkan makanan surplus bersama Replate:
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 shrink-0">
              <span className="text-xs font-bold text-slate-400">Volume Surplus:</span>
              <strong className="text-xl font-black text-[#D4A843] font-mono">
                {interactiveKg} Kg
              </strong>
              <span className="text-xs text-slate-400">/ bulan</span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={interactiveKg}
              onChange={(e) => setInteractiveKg(parseInt(e.target.value) || 10)}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
            />
            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
              <span>10 Kg (Warung Kecil)</span>
              <span>100 Kg (Restoran Menengah)</span>
              <span>250 Kg (Katering Hajatan)</span>
              <span>500 Kg (Hotel Bintang 5)</span>
            </div>
          </div>

          {/* Dynamic Interactive Computation Results */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reduksi Emisi GRK</span>
              <strong className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">
                {calcCo2} kg
              </strong>
              <span className="text-[10px] text-slate-400 block">CO2e Ekuivalen</span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Porsi untuk Anak Panti</span>
              <strong className="text-xl sm:text-2xl font-black text-cyan-300 font-mono block">
                {calcPortions} Porsi
              </strong>
              <span className="text-[10px] text-slate-400 block">Makanan Bergizi Siap Santap</span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Air Virtual Dihemat</span>
              <strong className="text-xl sm:text-2xl font-black text-blue-300 font-mono block">
                {calcWater.toLocaleString('id-ID')} L
              </strong>
              <span className="text-[10px] text-slate-400 block">Air Siklus Produksi Pangan</span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Nilai Ekonomi Dipulihkan</span>
              <strong className="text-xl sm:text-2xl font-black text-[#D4A843] font-mono block">
                Rp {calcEconomicValue.toLocaleString('id-ID')}
              </strong>
              <span className="text-[10px] text-slate-400 block">Berdampak Sosial &amp; Pajak CSR</span>
            </div>
          </div>

          {/* Simulator Footer CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700 text-xs">
            <span className="text-slate-300 font-medium">
              Ingin mendapatkan Sertifikat IPCC &amp; Laporan Dampak Resmi untuk bisnis Anda?
            </span>
            <Link href="/register?role=PROVIDER">
              <button
                type="button"
                className="px-5 py-2.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Daftar Sebagai Provider Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
