'use client';

import React, { useState, useEffect } from 'react';
import { MatchResultCard } from '@/components/matching/MatchResultCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PartnerRequestsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      if (isFresh) {
        setMatches([]);
        return;
      }

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
      setMatches(sampleMatches);
    } catch (_) {}
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Permintaan Rescue Ter-Match (Smart Matching)</h2>
        <p className="text-xs text-[#6C757D]">
          Peluang penyelamatan makanan yang direkomendasikan algoritma untuk organisasi relawan Anda.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            🤝
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm text-[#1B3A5C]">Belum Ada Rekomendasi Match Baru</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
              Algoritma Smart Matching 2.0 akan otomatis memasangkan outlet donatur terdekat di Surabaya begitu ada surplus makanan yang membutuhkan bantuan pengantaran relawan.
            </p>
          </div>
          <Link href="/explore" className="inline-block pt-2">
            <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs">
              Jelajahi Listing Surplus Surabaya ➔
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((m) => (
            <MatchResultCard key={m.id} {...m} onAccept={handleAccept} />
          ))}
        </div>
      )}
    </div>
  );
}
