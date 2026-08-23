'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';
import { Input } from '../ui/Input';
import { calculateImpactMetrics } from '@/lib/impact';

export const CO2Calculator: React.FC = () => {
  const [weightKg, setWeightKg] = useState<number>(10);
  const [people, setPeople] = useState<number>(20);

  const metrics = calculateImpactMetrics(weightKg, people);

  return (
    <Card className="bg-[#1B3A5C] text-white border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-white text-base">🧮 Kalkulator Dampak Lingkungan Replate</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-amber-300 font-black block mb-1 uppercase tracking-wider">
              Berat Makanan Diselamatkan (Kg)
            </label>
            <Input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="bg-white text-slate-900 font-black text-base border-2 border-amber-400 shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs text-amber-300 font-black block mb-1 uppercase tracking-wider">
              Estimasi Porsi Makanan
            </label>
            <Input
              type="number"
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              className="bg-white text-slate-900 font-black text-base border-2 border-amber-400 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0F1923] p-4 rounded-xl border border-slate-700 text-center">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Emisi CO2 Dicegah</span>
            <span className="text-xl font-black text-[#D4A843]">{metrics.totalCo2SavedKg} Kg</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Penerima Terbantu</span>
            <span className="text-xl font-black text-emerald-400">{metrics.totalPeopleFed} Orang</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Setara Pohon</span>
            <span className="text-xl font-black text-emerald-300">{metrics.treesEquivalent} Pohon</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Jarak Mobil</span>
            <span className="text-xl font-black text-blue-300">{metrics.carKmEquivalent} Km</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
