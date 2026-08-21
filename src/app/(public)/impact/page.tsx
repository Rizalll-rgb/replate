import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';
import { CO2Calculator } from '@/components/impact/CO2Calculator';

export default function ImpactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />
      <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#D4A843] uppercase tracking-widest">
            Transparansi Dampak
          </span>
          <h1 className="text-3xl font-black text-[#1B3A5C]">Laporan Dampak Lingkungan & Sosial</h1>
        </div>

        <ImpactDashboard
          foodWeightKg={145.8}
          co2SavedKg={364.5}
          peopleFed={290}
          wasteDivertedPercent={88.5}
        />

        <CO2Calculator />
      </main>
      <Footer />
    </div>
  );
}
