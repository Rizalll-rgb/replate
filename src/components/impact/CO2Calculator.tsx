'use client';

import React, { useState } from 'react';
import { calculateImpactMetrics } from '@/lib/impact';

export const CO2Calculator: React.FC = () => {
  const [weightKg, setWeightKg] = useState<number>(10);
  const [people, setPeople] = useState<number>(25);

  const metrics = calculateImpactMetrics(weightKg, people);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6 text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-100 text-amber-950 font-black px-2.5 py-1 rounded-md border border-amber-300 uppercase tracking-wider">
               BAPPENAS & KLH STANDARDIZED ENGINE
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
              Faktor FW: 4.0515 kg CO2e/kg
            </span>
          </div>
          <h3 className="text-xl font-black text-[#1B3A5C] tracking-tight">
            Kalkulator Dampak Lingkungan, Ekonomi, & Gizi Replate
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-medium max-w-xs">
          Dihitung berbasis data Laporan Kajian Food Loss & Waste Bappenas RI & KLH 2025.
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs text-[#1B3A5C] font-extrabold block uppercase tracking-wider">
              1. Berat Makanan Diselamatkan (Kg):
            </label>
            <input
              type="number"
              min={1}
              value={weightKg}
              onChange={(e) => {
                const val = Math.max(1, Number(e.target.value));
                setWeightKg(val);
                setPeople(Math.round(val * 2.5));
              }}
              className="w-full p-3.5 bg-slate-50 text-slate-900 font-black text-lg rounded-2xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/20 shadow-xs"
            />
            <span className="text-[11px] text-slate-500 block font-medium">
              Setara ~{Math.round(weightKg * 2.5)} porsi makanan siap santap
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#1B3A5C] font-extrabold block uppercase tracking-wider">
              2. Estimasi Porsi / Penerima Manfaat:
            </label>
            <input
              type="number"
              min={1}
              value={people}
              onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
              className="w-full p-3.5 bg-slate-50 text-slate-900 font-black text-lg rounded-2xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/20 shadow-xs"
            />
            <span className="text-[11px] text-slate-500 block font-medium">
              Anak panti asuhan, dhuafa, atau konsumen rescue sale
            </span>
          </div>
        </div>

        {/* Results High-Contrast Card Grid */}
        <div className="bg-[#1B3A5C] text-white p-6 rounded-3xl shadow-xl border border-[#2C5A8F] space-y-4">
          <span className="text-[11px] font-black text-[#D4A843] uppercase tracking-widest block text-center sm:text-left">
            HASIL KALKULASI DAMPAK RIIL (BAPPENAS STANDARDS)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3.5 bg-[#142C47] rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">Reduksi CO2e</span>
              <span className="text-lg font-black text-cyan-300 block font-mono">{metrics.totalCo2SavedKg} Kg</span>
              <span className="text-[9px] text-slate-400 block font-medium">4.0515 kg/kg FW</span>
            </div>

            <div className="p-3.5 bg-[#142C47] rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">Nilai Ekonomi</span>
              <span className="text-base font-black text-emerald-300 block font-mono">Rp {metrics.economicValueSavedRp.toLocaleString('id-ID')}</span>
              <span className="text-[9px] text-slate-400 block font-medium">Rp 12.500/kg</span>
            </div>

            <div className="p-3.5 bg-[#142C47] rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">Energi Nutrisi</span>
              <span className="text-base font-black text-amber-300 block font-mono">{metrics.energySavedKcal.toLocaleString('id-ID')} Kkal</span>
              <span className="text-[9px] text-slate-400 block font-medium">840 kkal/kg AKG</span>
            </div>

            <div className="p-3.5 bg-[#142C47] rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">Cegah Metana CH4</span>
              <span className="text-lg font-black text-purple-300 block font-mono">{metrics.methanePreventedKg} Kg</span>
              <span className="text-[9px] text-slate-400 block font-medium">0.07 kg CH4/kg</span>
            </div>

            <div className="p-3.5 bg-[#142C47] rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-wider block">Setara Pohon</span>
              <span className="text-lg font-black text-teal-300 block font-mono">{metrics.treesEquivalent} Pohon</span>
              <span className="text-[9px] text-slate-400 block font-medium">Serapan 21 kg/th</span>
            </div>

            <div className="p-3.5 bg-[#142C47] rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block">Jarak Mobil</span>
              <span className="text-lg font-black text-blue-300 block font-mono">~{metrics.carKmEquivalent} Km</span>
              <span className="text-[9px] text-slate-400 block font-medium">0.192 kg CO2/km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
