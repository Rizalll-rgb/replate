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
        <CardTitle className="text-white text-base">🧮 Kalkulator Dampak Lingkungan FoodBridge</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-1">
              Berat Makanan Diselamatkan (Kg)
            </label>
            <Input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="bg-white/10 text-white border-white/20 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-1">
              Estimasi Porsi Makanan
            </label>
            <Input
              type="number"
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              className="bg-white/10 text-white border-white/20 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 p-4 rounded-xl border border-white/10 text-center">
          <div>
            <span className="text-[10px] text-gray-300 uppercase block">CO2 Saved</span>
            <span className="text-xl font-black text-[#D4A843]">{metrics.totalCo2SavedKg} Kg</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-300 uppercase block">Penerima</span>
            <span className="text-xl font-black text-green-400">{metrics.totalPeopleFed} Orang</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-300 uppercase block">Setara Pohon</span>
            <span className="text-xl font-black text-emerald-300">{metrics.treesEquivalent} Pohon</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-300 uppercase block">Mobil Jarak</span>
            <span className="text-xl font-black text-blue-300">{metrics.carKmEquivalent} Km</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
