'use client';

import React, { useState, useEffect } from 'react';
import { MatchResultCard } from '@/components/matching/MatchResultCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { TruckIcon, ShieldCheckIcon, SearchIcon } from '@/components/ui/Icon';

export default function PartnerRequestsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [actionLoader, setActionLoader] = useState<{
    isOpen: boolean;
    message: string;
    submessage?: string;
  }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

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
    setActionLoader({
      isOpen: true,
      message: 'Menerima Tugas Logistik...',
      submessage: 'Memvalidasi rute dan menerbitkan nomor resi rescue',
    });

    const match = matches.find((m) => m.id === id);
    const claimCode = `RPL-RSC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClaim = {
      id: claimCode,
      code: claimCode,
      claimCode,
      foodName: match?.foodName || 'Nasi Goreng Buffet + Ayam Bakar (30 Porsi)',
      shelterName: match?.matchedUserName || 'Food Bank Surabaya',
      quantity: 30,
      quantityUnit: 'Porsi',
      status: 'AWAITING_RESCUE_PICKUP',
      readyTime: 'Hari ini',
      createdAt: new Date().toISOString(),
    };

    setTimeout(async () => {
      try {
        const savedClaimsStr = localStorage.getItem('replate_claims');
        const existingClaims = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
        existingClaims.unshift(newClaim);
        localStorage.setItem('replate_claims', JSON.stringify(existingClaims));

        setMatches((prev) => prev.filter((m) => m.id !== id));

        try {
          await fetch('/api/rescue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodId: 'seed-food-1', quantity: 30 }),
          });
        } catch (_) {}

        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: `Tugas rescue ${claimCode} diterima! Buka menu Penjemputan Aktif untuk verifikasi SOP.`,
          type: 'success',
        });

        setTimeout(() => {
          router.push('/dashboard/rescue-partner/active');
        }, 1200);
      } catch {
        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: 'Terjadi kendala saat menerima tugas rescue.',
          type: 'error',
        });
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Permintaan Rescue Ter-Match (Smart Matching)</h2>
        <p className="text-xs text-[#6C757D]">
          Peluang penyelamatan makanan yang direkomendasikan algoritma untuk organisasi relawan Anda.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <TruckIcon size={26} />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm text-[#1B3A5C]">Belum Ada Rekomendasi Match Baru</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
              Algoritma Smart Matching 2.0 akan otomatis memasangkan outlet donatur terdekat di Surabaya begitu ada surplus makanan yang membutuhkan bantuan pengantaran relawan.
            </p>
          </div>
          <Link href="/dashboard/explore" className="inline-block pt-2">
            <Button variant="gold" size="sm" leftIcon={<SearchIcon size={12} className="text-slate-950" />} className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs cursor-pointer">
              Jelajahi Listing Surplus Surabaya
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
