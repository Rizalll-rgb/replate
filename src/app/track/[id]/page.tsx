'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TrackingTimeline, TrackingStep } from '@/components/tracking/TrackingTimeline';
import { TrackingSearch } from '@/components/tracking/TrackingSearch';
import { useParams } from 'next/navigation';

export default function PublicTrackPage() {
  const params = useParams();
  const idParam = (params?.id as string) || 'FB-SBY-DEMO';
  const [currentId, setCurrentId] = useState(idParam);
  const [steps, setSteps] = useState<TrackingStep[]>([]);
  const [foodName, setFoodName] = useState<string>('Bakso Sapi Komplit');

  useEffect(() => {
    fetch(`/api/tracking/${currentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFoodName(data.data.foodName || 'Makanan Surplus');
          setSteps(data.data.steps || []);
        } else {
          // Fallback mock steps for demo
          setSteps([
            {
              status: 'LISTED',
              title: '📦 1. Makanan Dipublikasikan (Listed)',
              description: 'Provider mengunggah makanan surplus dan lulus 8 SOP Readiness Checklist.',
              timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
              actor: 'Warung Bakso Pak Kumis',
              completed: true,
              current: false,
            },
            {
              status: 'MATCHED',
              title: '🔍 2. Smart Matching Calculated',
              description: 'Algoritma memberikan skor match 96% kepada Food Bank Surabaya.',
              timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
              actor: 'FoodBridge Smart Engine',
              completed: true,
              current: false,
            },
            {
              status: 'CLAIMED',
              title: '✅ 3. Penyelamatan Diklaim & Disetujui',
              description: 'Tugas rescue diterima dan QR verification code diterbitkan.',
              timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
              actor: 'Food Bank Surabaya',
              completed: true,
              current: false,
            },
            {
              status: 'PICKUP_READY',
              title: '📋 4. Dalam Penjemputan (Pickup Ready)',
              description: 'Kurir dalam perjalanan menuju lokasi Provider.',
              timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
              actor: 'Tim Armada Rescue',
              completed: true,
              current: true,
            },
            {
              status: 'VERIFIED',
              title: '✔️ 5. Verifikasi Keamanan Pangan & Selesai',
              description: 'QR Code di-scan, SOP 5-point food safety diverifikasi.',
              completed: false,
              current: false,
            },
          ]);
        }
      })
      .catch(() => {});
  }, [currentId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#D4A843] uppercase tracking-widest">
            Transparansi Rantai Pasok
          </span>
          <h1 className="text-3xl font-black text-[#1B3A5C]">Pelacak Publik Food Rescue ID</h1>
        </div>

        <TrackingSearch initialValue={currentId} onSearch={(id) => setCurrentId(id)} />

        <TrackingTimeline referenceId={currentId} foodName={foodName} steps={steps} />
      </main>

      <Footer />
    </div>
  );
}
