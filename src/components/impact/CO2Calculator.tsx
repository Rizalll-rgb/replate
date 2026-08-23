'use client';

import React, { useState } from 'react';
import { calculateImpactMetrics } from '@/lib/impact';

export const CO2Calculator: React.FC = () => {
  const [weightKg, setWeightKg] = useState<number>(10);
  const [people, setPeople] = useState<number>(20);

  const metrics = calculateImpactMetrics(weightKg, people);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 text-slate-900">
      {/* High Contrast Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[10px] bg-amber-100 text-amber-950 font-black px-2.5 py-1 rounded-md border border-amber-300 uppercase tracking-wider">
            🧮 INTERACTIVE CALCULATOR ENGINE
          </span>
          <h3 className="text-xl font-black text-[#1B3A5C] tracking-tight">
            Kalkulator Dampak Lingkungan Replate
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-medium max-w-xs">
          Hitung otomatis estimasi penghematan CO2e & pencegahan gas metana TPA.
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
              onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
              className="w-full p-3 bg-slate-50 text-slate-900 font-extrabold text-base rounded-xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/20 shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#1B3A5C] font-extrabold block uppercase tracking-wider">
              2. Estimasi Porsi Makanan:
            </label>
            <input
              type="number"
              min={1}
              value={people}
              onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
              className="w-full p-3 bg-slate-50 text-slate-900 font-extrabold text-base rounded-xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/20 shadow-xs"
            />
          </div>
        </div>

        {/* Results High-Contrast Card Grid */}
        <div className="bg-[#1B3A5C] text-white p-5 rounded-2xl shadow-lg border border-[#2C5A8F] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-[#142C47] rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">Emisi CO2 Dicegah</span>
            <span className="text-xl font-black text-amber-300 block">{metrics.totalCo2SavedKg} Kg</span>
          </div>

          <div className="p-3 bg-[#142C47] rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">Penerima Terbantu</span>
            <span className="text-xl font-black text-emerald-300 block">{metrics.totalPeopleFed} Orang</span>
          </div>

          <div className="p-3 bg-[#142C47] rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-wider block">Setara Pohon</span>
            <span className="text-xl font-black text-teal-300 block">{metrics.treesEquivalent} Pohon</span>
          </div>

          <div className="p-3 bg-[#142C47] rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block">Jarak Mobil</span>
            <span className="text-xl font-black text-blue-300 block">{metrics.carKmEquivalent} Km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
