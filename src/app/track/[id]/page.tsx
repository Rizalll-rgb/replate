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
    // 1. Check dynamic local storage claims for real-time resi tracking
    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      if (savedClaimsStr) {
        const parsed = JSON.parse(savedClaimsStr);
        const cleanId = currentId.trim().toUpperCase();
        const matched = parsed.find(
          (c: any) =>
            (c.claimCode && c.claimCode.toUpperCase() === cleanId) ||
            (c.code && c.code.toUpperCase() === cleanId) ||
            (c.id && c.id.toUpperCase() === cleanId)
        );

        if (matched) {
          setFoodName(matched.foodName || 'Makanan Surplus Steril');
          const isDone = matched.status === 'COMPLETED' || matched.status === 'VERIFIED';
          const isOTW = matched.status === 'IN_TRANSIT' || matched.status === 'PROVIDER_DELIVERING';

          setSteps([
            {
              status: 'LISTED',
              title: '📦 1. Surplus Dipublikasikan di Replate Engine',
              description: 'Provider mengunggah makanan surplus & lulus 8 Checklist Kelayakan Pangan BPOM RI.',
              timestamp: matched.createdAt || new Date(Date.now() - 3600000 * 4).toISOString(),
              actor: matched.storeName || 'Warung Bakso Pak Kumis',
              completed: true,
              current: false,
            },
            {
              status: 'MATCHED',
              title: '🔍 2. Smart Matching Engine 2.0 Calculated',
              description: 'Algoritma memberikan skor kecocokan gizi & jarak lokasi terdekat.',
              timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
              actor: 'Replate Smart Engine',
              completed: true,
              current: false,
            },
            {
              status: 'CLAIMED',
              title: '✅ 3. Penyelamatan Makanan Disetujui',
              description: 'Klaim booking diverifikasi lunas & Kode Resi QR aktif.',
              timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
              actor: matched.userName || 'Panti Asuhan / Konsumen',
              completed: true,
              current: false,
            },
            {
              status: 'IN_TRANSIT',
              title: '🚚 4. Pengiriman / Penjemputan Makanan OTW',
              description: `Makanan sedang diantar oleh ${matched.courierName || matched.driverName || 'Armada Toko Direct'}.`,
              timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
              actor: matched.courierName || matched.driverName || 'Armada Toko Direct',
              completed: isDone || isOTW,
              current: isOTW && !isDone,
            },
            {
              status: 'VERIFIED',
              title: '✔️ 5. Verifikasi Makanan Sampai di Tujuan (Selesai)',
              description: isDone
                ? `Makanan telah diterima dengan baik di ${matched.address || 'lokasi tujuan'}. Bukti foto serah terima terverifikasi.`
                : 'Menunggu konfirmasi foto serah terima & QR scan dari penerima.',
              timestamp: isDone ? new Date().toISOString() : undefined,
              actor: matched.userName || 'Pengurus Penerima',
              completed: isDone,
              current: isDone,
            },
          ]);
          return;
        }
      }
    } catch (_) {}

    // 2. Fallback API fetch
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
              actor: 'Replate Smart Engine',
              completed: true,
              current: false,
            },
            {
              status: 'CLAIMED',
              title: '✅ 3. Penyelamatan Diklaim & Disetujui',
              description: 'Tugas rescue diterima dan QR verification code diterbitkan.',
              timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
              actor: 'Panti Asuhan Kasih Ibu',
              completed: true,
              current: false,
            },
            {
              status: 'PICKUP_READY',
              title: '🚚 4. Dalam Pengantaran / Penjemputan (OTW)',
              description: 'Driver Armada Toko Mas Agus dalam perjalanan menuju lokasi tujuan.',
              timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
              actor: 'Driver B: Mas Agus (Plat L 1234 XYZ)',
              completed: true,
              current: true,
            },
            {
              status: 'VERIFIED',
              title: '✔️ 5. Verifikasi Keamanan Pangan & Serah Terima Selesai',
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
