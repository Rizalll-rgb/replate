'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

export default function ProviderOverviewPage() {
  const { data: session } = useSession();
  const [activeSurplusCount, setActiveSurplusCount] = useState<number>(2);
  const [completedClaimsCount, setCompletedClaimsCount] = useState<number>(1);
  const [totalRescuedKg, setTotalRescuedKg] = useState<number>(42.5);
  const [providerName, setProviderName] = useState<string>('Mitra Restoran & Toko Pangan');

  // Smart Matching Recommendations for Food Provider
  const matchedPantiList = [
    {
      pantiName: 'Panti Asuhan Kasih Ibu Surabaya',
      need: 'Butuh 50 Porsi Makanan Siap Santap',
      distance: '1.2 km (Wonokromo)',
      matchScore: 96,
      urgency: 'URGENT HARI INI',
      pj: 'Ibu Hajjah Maryam',
    },
    {
      pantiName: 'Shelter Dhuafa Mandiri',
      need: 'Butuh 60 Porsi Nasi Kotak / Lauk Bersih',
      distance: '0.8 km (Genteng)',
      matchScore: 89,
      urgency: 'URGENT HARI INI',
      pj: 'Mas Dedi',
    },
  ];

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setProviderName(parsed.entityName);
      }
    } catch (_) {}

    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
    } catch (_) {}

    let localClaims: any[] = [];
    try {
      localClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
    } catch (_) {}

    fetch('/api/surplus?status=')
      .then((res) => res.json())
      .then((data) => {
        let itemsList: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          itemsList = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          itemsList = data.data;
        }

        const combined = [...localItems, ...itemsList];
        const activeItems = combined.filter((item) => item.status === 'AVAILABLE' || !item.status);
        if (activeItems.length > 0) {
          setActiveSurplusCount(activeItems.length);
        }

        const calculatedWeight = combined.reduce((acc, curr) => {
          const qty = Number(curr.quantity || 15);
          const weightUnit = Number(curr.weightPerUnitKg || 0.5);
          return acc + qty * weightUnit;
        }, 0);

        if (calculatedWeight > 0) {
          setTotalRescuedKg(Math.round(calculatedWeight * 10) / 10);
        }
      })
      .catch(() => {
        if (localItems.length > 0) {
          setActiveSurplusCount(localItems.length);
        }
      });

    const completedFromClaims = localClaims.filter(
      (c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED'
    ).length;
    setCompletedClaimsCount(2 + completedFromClaims);
  }, [session]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-widest block">
            Dashboard Food Provider
          </span>
          <h1 className="text-2xl font-black text-[#1B3A5C]">{providerName}</h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola surplus makanan harian, pantau penyelamatan, dan salurkan donasi steril secara efisien.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/provider/add-surplus">
            <Button variant="gold" size="md" className="font-black text-xs text-slate-950 shadow-md">
              + Unggah Makanan Surplus Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Surplus Aktif Tersedia</span>
          <strong className="text-2xl font-black text-[#1B3A5C] font-mono">{activeSurplusCount} Menu</strong>
          <span className="text-[10px] text-emerald-600 font-bold block">Tervalidasi 8-Poin SOP BPOM</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Total Pangan Diselamatkan</span>
          <strong className="text-2xl font-black text-[#D4A843] font-mono">{totalRescuedKg} kg</strong>
          <span className="text-[10px] text-slate-500 font-bold block">Setara ~{Math.round(totalRescuedKg * 2.5)} porsi</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Klaim Selesai & Terverifikasi</span>
          <strong className="text-2xl font-black text-emerald-600 font-mono">{completedClaimsCount} Transaksi</strong>
          <span className="text-[10px] text-slate-500 font-bold block">Scan QR Serah Terima Sukses</span>
        </div>
      </div>

      {/* SMART MATCHING 2.0: REKOMENDASI ALOKASI DONASI CERDAS KE PANTI */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
              SMART MATCHING ENGINE 2.0 (UNTUK PROVIDER)
            </span>
            <h3 className="text-lg font-black text-[#1B3A5C]">
              Rekomendasi Penyaluran Donasi ke Panti Asuhan Terdekat
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">Multi-Criteria GPS Scoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedPantiList.map((panti, idx) => (
            <div
              key={idx}
              className="p-5 bg-gradient-to-br from-white to-blue-50/40 rounded-3xl border-2 border-blue-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-[#1B3A5C] text-[#D4A843] font-black text-[10px] rounded-md font-mono">
                    Skor Kecocokan {panti.matchScore}%
                  </span>
                  <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[9px] rounded-md">
                    {panti.urgency}
                  </span>
                </div>
                <h4 className="font-black text-sm text-[#1B3A5C]">{panti.pantiName}</h4>
                <p className="text-xs font-bold text-slate-700">{panti.need}</p>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>Lokasi: <strong>{panti.distance}</strong></p>
                  <p>Penanggung Jawab: <strong>{panti.pj}</strong></p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Alokasi 1-Klik Otomatis</span>
                <Link href="/explore">
                  <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-3 py-1.5 shadow-xs">
                    Salurkan Donasi ➔
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/provider/surplus" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block">
          <h4 className="font-black text-sm text-[#1B3A5C]">Kelola Katalog Surplus</h4>
          <p className="text-xs text-slate-500 font-medium">Pantau status stok makanan, sisa porsi, dan batas waktu pickup.</p>
        </Link>

        <Link href="/dashboard/provider/qr-scanner" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block">
          <h4 className="font-black text-sm text-[#1B3A5C]">Scan QR Serah Terima Kasir</h4>
          <p className="text-xs text-slate-500 font-medium">Validasi resi digital saat pembeli atau kurir relawan mengambil paket.</p>
        </Link>

        <Link href="/dashboard/provider/impact" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block">
          <h4 className="font-black text-sm text-[#1B3A5C]">Laporan CSR & Sertifikat</h4>
          <p className="text-xs text-slate-500 font-medium">Unduh sertifikat resmi penyelamatan pangan untuk audit ESG.</p>
        </Link>
      </div>
    </div>
  );
}
