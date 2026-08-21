'use client';

import React from 'react';
import { MatchResultCard } from '@/components/matching/MatchResultCard';
import { useRouter } from 'next/navigation';

export default function PartnerRequestsPage() {
  const router = useRouter();

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch('/api/rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: 'seed-food-1', quantity: 30 }),
      });
      const result = await res.json();
      if (result.success) {
        alert('🚚 Tugas rescue diterima! Buka menu Penjemputan Aktif untuk memverifikasi SOP.');
        router.push('/dashboard/rescue-partner/active');
      } else {
        alert(result.error || 'Gagal menerima tugas.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const sampleMatches = [
    {
      id: 'match-1',
      foodName: 'Nasi Goreng Buffet + Ayam Bakar (30 Porsi)',
      matchedUserName: 'Food Bank Surabaya',
      score: 0.96,
      scoreBreakdown: {
        distance: { normalized: 0.95 },
        urgency: { normalized: 1.0 },
        foodTypeMatch: { normalized: 0.9 },
        quantityFit: { normalized: 1.0 },
        reliabilityScore: { normalized: 0.95 },
        partnerCapacity: { normalized: 0.9 },
        routeEfficiency: { normalized: 0.8 },
      },
      matchType: 'RESCUE_PARTNER' as const,
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Permintaan Rescue Ter-Match (Smart Matching)</h2>
        <p className="text-xs text-[#6C757D]">
          Peluang penyelematan makanan yang direkomendasikan algoritma untuk organisasi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleMatches.map((m) => (
          <MatchResultCard key={m.id} {...m} onAccept={handleAccept} />
        ))}
      </div>
    </div>
  );
}
