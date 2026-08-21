'use client';

import React from 'react';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';
import { ImpactChart } from '@/components/impact/ImpactChart';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Analitik Platform & Dampak Lingkungan</h2>
        <p className="text-xs text-[#6C757D]">Data akumulatif redistribusi makanan di seluruh kota Surabaya.</p>
      </div>

      <ImpactDashboard foodWeightKg={145.8} co2SavedKg={364.5} peopleFed={290} wasteDivertedPercent={88.5} />
      <ImpactChart />
    </div>
  );
}
