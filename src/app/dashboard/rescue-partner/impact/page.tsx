'use client';

import React from 'react';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';
import { ImpactChart } from '@/components/impact/ImpactChart';

export default function PartnerImpactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Dampak Komunitas Rescue Partner</h2>
        <p className="text-xs text-[#6C757D]">Statistik dampak makanan yang berhasil diselamatkan dan disalurkan.</p>
      </div>

      <ImpactDashboard foodWeightKg={103.3} co2SavedKg={258.25} peopleFed={205} />
      <ImpactChart />
    </div>
  );
}
