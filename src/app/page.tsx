'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ImpactCounter } from '@/components/landing/ImpactCounter';
import { SDGSection } from '@/components/landing/SDGSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2-in-1 Dual Tracker State
  const [trackerTab, setTrackerTab] = useState<'AUDIT_PARTNER' | 'FOOD_CLAIM'>('AUDIT_PARTNER');
  const [landingSearchQuery, setLandingSearchQuery] = useState('');

  useEffect(() => {
    const defaultMockFoods = [
      {
        id: 'food-demo-1',
        title: 'Nasi Paket Ayam Bakar Specialty Pak Kumis',
        providerName: 'Warung Bakso Pak Kumis Surabaya',
        originalPrice: 25000,
        discountPrice: 10000,
        quantity: '45 Porsi',
        pickupTime: 'Hari ini 21:00 WIB',
        distance: '1.2 km',
        category: 'MAKANAN_BERAT',
        isFree: false,
        matchScore: 98,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'food-demo-2',
        title: 'Paket Rice Bowl Ayam Geprek Steril',
        providerName: 'Warung Bakso Pak Kumis Surabaya',
        originalPrice: 20000,
        discountPrice: 0,
        quantity: '40 Porsi',
        pickupTime: 'Hari ini 20:30 WIB',
        distance: '2.5 km',
        category: 'MAKANAN_BERAT',
        isFree: true,
        matchScore: 96,
        imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'food-demo-3',
        title: 'Bakso Sapi Urat Super & Kuah Steril',
        providerName: 'Warung Bakso Pak Kumis Surabaya',
        originalPrice: 18000,
        discountPrice: 5000,
        quantity: '15 Porsi',
        pickupTime: 'Hari ini 21:30 WIB',
        distance: '0.8 km',
        category: 'MAKANAN_BERAT',
        isFree: false,
        matchScore: 94,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60',
      },
    ];

    try {
      const localStr = localStorage.getItem('replate_local_surplus');
      const localItems = localStr ? JSON.parse(localStr) : [];
      const mappedLocal = localItems.map((item: any, idx: number) => ({
        id: item.id || `local-surplus-${idx}`,
        title: item.name || item.title || 'Surplus Makanan Steril',
        providerName: item.providerName || item.storeName || 'Warung Bakso Pak Kumis',
        originalPrice: item.originalPrice ? Number(item.originalPrice) : 25000,
        discountPrice: item.discountPrice !== undefined ? Number(item.discountPrice) : (item.type === 'DONATION' ? 0 : 8000),
        quantity: item.quantity ? `${item.quantity} Porsi` : '10 Porsi',
        pickupTime: item.pickupTime || 'Hari ini 21:00 WIB',
        distance: item.distance || '1.0 km',
        category: item.category || 'MAKANAN_BERAT',
        isFree: item.discountPrice === 0 || item.type === 'DONATION' || item.isFree,
        matchScore: item.matchScore || 96,
        imageUrl: item.photo || item.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
      }));

      fetch('/api/surplus')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setFoods([...mappedLocal, ...data.data]);
          } else {
            setFoods([...mappedLocal, ...defaultMockFoods]);
          }
        })
        .catch(() => {
          setFoods([...mappedLocal, ...defaultMockFoods]);
        });
    } catch (_) {
      setFoods(defaultMockFoods);
    }
  }, []);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(foods.length / itemsPerPage) || 1;
  const paginatedFoods = foods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClaim = (id: string) => {
    router.push(`/explore?claim=${id}`);
  };

  const handleDetail = (id: string) => {
    const item = foods.find((f) => f.id === id);
    if (item) {
      setSelectedFood(item);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar user={session?.user} />

      <main className="flex-1">
        <Hero />
        <HowItWorks />

        {/* 2-in-1 Dual Tracker Section (Audit Pendaftaran & Resi Klaim Makanan) */}
        <section className="py-14 bg-[#1B3A5C] border-y border-[#2C5A8F] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0F1923] rounded-3xl p-6 sm:p-10 border-2 border-[#D4A843]/40 shadow-2xl space-y-6">
              {/* Tracker Tab Selector */}
              <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900 rounded-2xl max-w-md border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setTrackerTab('AUDIT_PARTNER');
                    setLandingSearchQuery('');
                  }}
                  className={`flex-1 py-2 px-3.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    trackerTab === 'AUDIT_PARTNER'
                      ? 'bg-[#D4A843] text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔍 Status Audit Mitra
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTrackerTab('FOOD_CLAIM');
                    setLandingSearchQuery('');
                  }}
                  className={`flex-1 py-2 px-3.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    trackerTab === 'FOOD_CLAIM'
                      ? 'bg-[#D4A843] text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📦 Lacak Resi Klaim Pangan
                </button>
              </div>

              {/* Form & Description Layout */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 max-w-xl text-center md:text-left">
                  <span className="px-3 py-1 bg-slate-800 text-[#D4A843] border border-amber-400/30 font-black text-[11px] uppercase tracking-wider rounded-lg inline-block">
                    {trackerTab === 'AUDIT_PARTNER'
                      ? 'AUDIT LEGALITAS MITRA REPLATE 24/7'
                      : 'FOOD RESCUE LIVE TRACKER BPOM'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {trackerTab === 'AUDIT_PARTNER'
                      ? 'Cek Status Pendaftaran & Audit Berkas Partner'
                      : 'Lacak Status Resi Penjemputan & Pengantaran Pangan'}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {trackerTab === 'AUDIT_PARTNER'
                      ? 'Pernah mendaftar sebagai Provider, Yayasan Panti, atau Food Rescue Volunteer? Masukkan Kode Tracking, Email, atau No. WA Anda untuk memantau status audit secara real-time.'
                      : 'Sudah mengklaim makanan surplus atau donasi panti? Masukkan Kode Resi Anda (contoh: CLM-CNS-2026-9812) untuk melihat posisi kurir dan status penyiapan makanan.'}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!landingSearchQuery.trim()) return;

                    if (trackerTab === 'AUDIT_PARTNER') {
                      router.push(`/track-status?id=${encodeURIComponent(landingSearchQuery.trim())}`);
                    } else {
                      router.push(`/track-status?id=${encodeURIComponent(landingSearchQuery.trim())}`);
                    }
                  }}
                  className="w-full md:w-auto shrink-0 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-700 shadow-lg">
                    <input
                      type="text"
                      placeholder={
                        trackerTab === 'AUDIT_PARTNER'
                          ? 'Kode Tracking / Email / No. WA...'
                          : 'Kode Resi (CLM-CNS-XXXX)...'
                      }
                      value={landingSearchQuery}
                      onChange={(e) => setLandingSearchQuery(e.target.value)}
                      className="px-4 py-3 bg-slate-800 text-white font-mono font-bold text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-[#D4A843] min-w-[260px]"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <span>Lacak Status ➔</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-300 font-medium text-center md:text-left">
                    💡 Contoh ID:{' '}
                    <strong className="font-mono">
                      {trackerTab === 'AUDIT_PARTNER' ? 'REPLATE-REG-2026-9812' : 'CLM-CNS-2026-9812'}
                    </strong>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Live Available Surplus Section with 3-Card Pagination Limit */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#D4A843] uppercase tracking-widest">
                Surplus Makanan Aktif Surabaya
              </span>
              <h2 className="text-3xl font-black text-[#1B3A5C] mt-1">Eksplor Pangan Surabaya</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/explore">
                <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 shadow-md">
                  Lihat Semua di Eksplor Pangan ➔
                </Button>
              </Link>
            </div>
          </div>

          {/* Paginated Food Grid */}
          <FoodGrid foods={paginatedFoods} onClaim={handleClaim} onDetail={handleDetail} />

          {/* Pagination Controls */}
          {foods.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-b border-slate-200 py-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="font-extrabold text-xs"
              >
                ◀ Sebelumnya
              </Button>

              <span className="text-xs font-bold text-[#1B3A5C]">
                Halaman {currentPage} dari {totalPages} (Total {foods.length} Makanan)
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="font-extrabold text-xs"
              >
                Selanjutnya ▶
              </Button>
            </div>
          )}

          {/* Direct CTA Banner to Explore */}
          <div className="p-6 bg-[#1B3A5C] text-white rounded-3xl shadow-xl border border-[#2C5A8F] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[#D4A843] font-black text-xs uppercase tracking-wider block">
                ⚡ PUSAT RESCUE SALE, DONASI Rp 0 & KEBUTUHAN PANTI
              </span>
              <h3 className="text-xl font-black text-white">Eksplorasi Lengkap dengan Filter Jarak & Kategori</h3>
              <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-xl">
                Temukan puluhan makanan surplus layak konsumsi di Surabaya dengan diskon hingga 70% atau donasi steril Rp 0 untuk yayasan dan warga rentan.
              </p>
            </div>
            <Link href="/explore" className="shrink-0">
              <button
                type="button"
                className="px-6 py-3.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Buka Eksplor Pangan ➔</span>
              </button>
            </Link>
          </div>
        </section>

        <ImpactCounter />
        <SDGSection />
        <Testimonials />
      </main>

      <Footer />

      <FoodDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        food={selectedFood}
        onClaim={handleClaim}
      />
    </div>
  );
}
