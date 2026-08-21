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

  useEffect(() => {
    // Dynamic real-time calculation from local cache & database APIs (Poin 1, 2, 3)
    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
    } catch (_) {}

    let localCompleted: any[] = [];
    try {
      localCompleted = JSON.parse(localStorage.getItem('replate_completed_claims') || '[]');
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

        // Calculate dynamic rescued weight
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

    // Sync Completed Claims count with Tab Selesai di Klaim & Penyelamatan (Poin 1 & 2)
    const baseCompleted = 1;
    setCompletedClaimsCount(baseCompleted + localCompleted.length);
  }, [session]);

  return (
    <div className="space-y-8">
      {/* Header Info (Poin 3 - Removed Pak Kumis text below headline) */}
      <div className="border-b border-slate-200 pb-3">
        <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-widest block">
          Dashboard Food Provider
        </span>
        <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Mitra Restoran & Toko Pangan</h2>
      </div>

      {/* High-Contrast Hero Action Banner */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#2C5A8F]">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
              Aksi Utama Provider
            </span>
            <span className="text-xs text-slate-200 font-semibold">100% Terverifikasi SOP BPOM</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight text-white">Punya Makanan Berlebih Hari Ini?</h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            Publikasikan porsi surplus makanan Anda untuk disalurkan ke panti asuhan, yayasan, atau konsumen target secara aman & transparan.
          </p>
        </div>

        <Link href="/dashboard/provider/add-surplus" className="shrink-0">
          <Button variant="gold" size="lg" className="font-black shadow-lg flex items-center gap-2 px-6 text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Surplus Makanan Baru</span>
          </Button>
        </Link>
      </div>

      {/* Dynamic KPI Cards (Poin 1, 2, 3, 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Surplus Aktif -> my-listings (Poin 1) */}
        <Link href="/dashboard/provider/my-listings" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#1B3A5C] hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
            <div className="p-3 bg-blue-50 text-[#1B3A5C] rounded-xl group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                Surplus Aktif <span className="text-[10px] text-[#1B3A5C] font-bold">➔</span>
              </span>
              <span className="text-2xl font-extrabold text-[#1B3A5C]">{activeSurplusCount} Listing</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Total Diselamatkan -> impact?tab=analytics (Poin 3 & 4) */}
        <Link href="/dashboard/provider/impact?tab=analytics" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                Total Diselamatkan <span className="text-[10px] text-emerald-700 font-bold">➔</span>
              </span>
              <span className="text-2xl font-extrabold text-emerald-700">{totalRescuedKg} Kg</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Klaim Selesai -> claims (Poin 1 & 2 - Synced with Tab Selesai) */}
        <Link href="/dashboard/provider/claims" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#D4A843] hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
            <div className="p-3 bg-amber-50 text-[#D4A843] rounded-xl group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                Klaim Selesai <span className="text-[10px] text-[#D4A843] font-bold">➔</span>
              </span>
              <span className="text-2xl font-extrabold text-[#D4A843]">{completedClaimsCount} Transaksi</span>
            </div>
          </div>
        </Link>
      </div>

      {/* CORE BUSINESS ACTIONS */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Fitur Operasional Bisnis Utama</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4A843] flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-[#1B3A5C]">1. Post Makanan & SOP BPOM</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Input porsi makanan berlebih harian dan lengkapi 8-poin verifikasi standar kelayakan pangan BPOM RI.
              </p>
            </div>
            <Link href="/dashboard/provider/add-surplus">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                Tambah Surplus Baru ➔
              </Button>
            </Link>
          </div>

          {/* Action Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B3A5C] flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-[#1B3A5C]">2. Verifikasi Scan Kode QR</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Verifikasi kode QR dari penerima atau kurir komunitas saat penjemputan fisik porsi makanan di lokasi.
              </p>
            </div>
            <Link href="/dashboard/provider/claims">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                Buka Scan Kode QR ➔
              </Button>
            </Link>
          </div>

          {/* Action Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-[#1B3A5C]">3. Unduh Sertifikat & CSR</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Dapatkan Laporan Dampak Lingkungan dan Sertifikat Penyelamat Pangan resmi untuk laporan CSR perusahaan.
              </p>
            </div>
            <Link href="/dashboard/provider/impact?tab=analytics">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                Lihat Laporan Dampak ➔
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
