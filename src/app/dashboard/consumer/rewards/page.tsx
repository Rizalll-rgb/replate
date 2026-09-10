'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Coins,
  Award,
  Sparkles,
  Gift,
  TreePine,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Check,
  Clock,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';

interface RewardItem {
  id: string;
  title: string;
  category: 'VOUCHER' | 'DONATION' | 'MERCHANDISE';
  pointsCost: number;
  description: string;
  provider: string;
  validUntil: string;
  badge: string;
  imageUrl: string;
}

const REWARDS_CATALOG: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'Voucer Potongan Rp 10.000 Rescue Sale',
    category: 'VOUCHER',
    pointsCost: 80,
    description: 'Dapat digunakan di seluruh gerai mitra bakery & restoran Food Provider Replate tanpa minimum transaksi.',
    provider: 'Semua Mitra Toko Replate',
    validUntil: '30 Hari Setelah Ditukar',
    badge: 'Paling Populer',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'rew-2',
    title: 'Voucer Potongan Rp 25.000 Spesial Resto',
    category: 'VOUCHER',
    pointsCost: 160,
    description: 'Potongan langsung untuk pesanan paket makan malam surplus di gerai resto terdaftar.',
    provider: 'Mitra Resto Pilihan Surabaya',
    validUntil: '45 Hari Setelah Ditukar',
    badge: 'Hemat Maksimal',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'rew-3',
    title: 'Penanaman 1 Bibit Pohon Mangrove Wonorejo',
    category: 'DONATION',
    pointsCost: 100,
    description: 'Konversikan poin dampak Anda untuk aksi iklim nyata bersama Komunitas Mangrove Wonorejo Rungkut.',
    provider: 'Eco Action Surabaya & Replate',
    validUntil: 'Program Berkelanjutan',
    badge: 'Aksi Lingkungan',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'rew-4',
    title: 'Paket Sembako Bergizi untuk Adik Panti',
    category: 'DONATION',
    pointsCost: 120,
    description: 'Poin Anda dialokasikan untuk pengadaan beras, susu, dan telur bagi 12 panti asuhan binaan Replate.',
    provider: 'Jaringan Panti Asuhan Jatim',
    validUntil: 'Penyaluran Tiap Akhir Pekan',
    badge: 'Sosial & Kemanusiaan',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'rew-5',
    title: 'Tote Bag Kanvas Eksklusif Replate Hero',
    category: 'MERCHANDISE',
    pointsCost: 140,
    description: 'Tas belanja kanvas tebal ramah lingkungan anti-plastik dengan sablon ilustrasi Pahlawan Pangan.',
    provider: 'Official Replate Merch',
    validUntil: 'Stok Terbatas',
    badge: 'Edisi Terbatas',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'rew-6',
    title: 'Set Alat Makan Sendok-Garpu Bambu Higienis',
    category: 'MERCHANDISE',
    pointsCost: 90,
    description: 'Set sendok, garpu, dan sumpit bambu alami lengkap dengan pouch kanvas praktis dibawa bepergian.',
    provider: 'Official Replate Merch',
    validUntil: 'Stok Tersedia',
    badge: 'Eco Living',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
  },
];

export default function EcoPointsRewardsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [ecoPoints, setEcoPoints] = useState<number>(140);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'VOUCHER' | 'DONATION' | 'MERCHANDISE'>('ALL');
  const [futureDevModalOpen, setFutureDevModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('replate_ecopoints');
      if (saved) {
        setEcoPoints(parseInt(saved, 10));
      }
    } catch (_) {}
  }, []);

  const handleRedeemClick = (reward: RewardItem) => {
    setSelectedReward(reward);
    setFutureDevModalOpen(true);
  };

  const filteredRewards = REWARDS_CATALOG.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Mobile-first Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3.5 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/consumer">
              <button
                type="button"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-[#1B3A5C]">
                  Tukar EcoPoints
                </h1>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black rounded-full">
                  Katalog Hadiah
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold block">
                Ubah Poin Penyelamatan Jadi Voucer & Donasi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-xl">
            <Coins className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-xs font-black text-amber-900 font-mono">
              {ecoPoints} Poin
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Future Development Status Banner */}
        <div className="p-4 bg-gradient-to-r from-[#1B3A5C] via-[#1A4568] to-[#123653] text-white rounded-2xl shadow-md border border-[#D4A843]/40 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#D4A843] text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-md">
              Future Development • Beta Sandbox
            </span>
            <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Sistem Penukaran Poin</span>
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-white leading-tight">
            Katalog Penukaran Hadiah Pahlawan Pangan
          </h2>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Halaman ini adalah pratinjau antarmuka penukaran EcoPoints Replate. Seluruh voucer, bibit pohon, dan suvenir di bawah ini sedang dipersiapkan untuk integrasi gateway sistem pada peluncuran fase berikutnya.
          </p>
        </div>

        {/* Balance Card Detail */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Saldo EcoPoints Anda Saat Ini
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-2xl font-black text-[#1B3A5C] font-mono">
                {ecoPoints}
              </strong>
              <span className="text-xs font-black text-[#D4A843]">EcoPoints Aktif</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Setara dengan pencegahan ~{(ecoPoints * 0.9 / 40).toFixed(1)} kg emisi CO2e limbah pangan
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-[#D4A843]" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: 'Semua Hadiah' },
            { id: 'VOUCHER', label: 'Voucer Belanja' },
            { id: 'DONATION', label: 'Aksi & Donasi' },
            { id: 'MERCHANDISE', label: 'Merchandise' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rewards List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                <img
                  src={reward.imageUrl}
                  alt={reward.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-black rounded-md">
                  {reward.badge}
                </span>
                <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-[#D4A843] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-slate-950" />
                  <span>{reward.pointsCost} Poin</span>
                </div>
              </div>

              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {reward.provider}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {reward.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 font-medium">
                    {reward.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>{reward.validUntil}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRedeemClick(reward)}
                    disabled={ecoPoints < reward.pointsCost}
                    className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      ecoPoints >= reward.pointsCost
                        ? 'bg-[#1B3A5C] hover:bg-[#142C47] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <span>{ecoPoints >= reward.pointsCost ? 'Tukar Poin' : 'Poin Kurang'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Future Development Confirmation Modal */}
      {futureDevModalOpen && selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                <Sparkles className="w-6 h-6 text-[#D4A843]" />
              </div>
              <div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-md">
                  Informasi Pengembangan
                </span>
                <h3 className="text-base font-black text-[#1B3A5C] leading-tight mt-0.5">
                  Fitur Penukaran Hadiah (Beta)
                </h3>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Item Hadiah:</span>
                <strong className="text-slate-800 font-black">{selectedReward.title}</strong>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Biaya EcoPoints:</span>
                <strong className="text-amber-600 font-mono font-black">{selectedReward.pointsCost} Poin</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status Fitur:</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                  Future Development Terjadwal
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Sistem telah mencatat minat penukaran Anda untuk <strong>{selectedReward.title}</strong>. Saldo EcoPoints Anda akan tetap aman dan penukaran otomatis dapat diproses saat integrasi voucher merchant selesai dirilis secara menyeluruh.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFutureDevModalOpen(false)}
                className="flex-1 py-3 bg-[#1B3A5C] hover:bg-[#152e4a] text-white font-black text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Mengerti & Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav user={session?.user} />
    </div>
  );
}
