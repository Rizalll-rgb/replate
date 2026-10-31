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
  ShieldCheck,
  Clock,
  ChevronRight,
  Info,
  X,
  CheckCircle2,
  Tag,
  Flame,
  TrendingUp,
  Users,
  Target,
  Globe2,
  FileText,
  Share2,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { ImpactGamification } from '@/components/impact/ImpactGamification';

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
  terms: string[];
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
    terms: [
      'Berlaku untuk semua transaksi Rescue Sale',
      'Tidak ada minimum belanja',
      'Maksimal 1 voucer per transaksi',
    ],
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
    terms: [
      'Berlaku di resto bertanda Mitra Pilihan',
      'Minimum transaksi Rp 40.000',
      'Dapat digabung dengan promo ongkir kurir',
    ],
  },
  {
    id: 'rew-3',
    title: 'Penanaman 1 Bibit Pohon Mangrove Nusantara',
    category: 'DONATION',
    pointsCost: 100,
    description: 'Konversikan poin dampak Anda untuk aksi iklim nyata bersama Jaringan Konservasi Pesisir Nusantara.',
    provider: 'Eco Action Indonesia & Replate',
    validUntil: 'Program Berkelanjutan',
    badge: 'Aksi Lingkungan',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60',
    terms: [
      'Penanaman dilakukan tiap tanggal 28',
      'Sertifikat aksi iklim digital dikirim ke email',
      'Dokumentasi koordinat GPS pohon tertanam',
    ],
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
    terms: [
      'Laporan penyaluran transparan via dashboard',
      'Didistribusikan bersama relawan rescue',
      'Bebas biaya administrasi 100%',
    ],
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
    terms: [
      'Bahan kanvas katun organik 12 oz',
      'Dapat diambil di drop point Replate Surabaya',
      'Stok terbatas 50 pcs per bulan',
    ],
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
    terms: [
      '100% bambu alami bersertifikasi steril',
      'Termasuk sedotan bambu & sikat pembersih',
      'Tahan lama dan ramah lingkungan',
    ],
  },
];

export default function EcoPointsRewardsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Primary Tab state: REWARDS, IMPACT_AUDIT, CHALLENGES, LEADERBOARD
  const [activeMainTab, setActiveMainTab] = useState<'REWARDS' | 'IMPACT_AUDIT' | 'CHALLENGES' | 'LEADERBOARD'>('REWARDS');

  const [ecoPoints, setEcoPoints] = useState<number>(140);
  const [totalSavedPortions, setTotalSavedPortions] = useState<number>(3);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'VOUCHER' | 'DONATION' | 'MERCHANDISE'>('ALL');
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [redeemSuccess, setRedeemSuccess] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(4);

  const userName = session?.user?.name || 'Ahmad Fauzan';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('replate_ecopoints');
      if (saved) {
        setEcoPoints(parseInt(saved, 10));
      }
      const rawClaims = localStorage.getItem('replate_claims');
      if (rawClaims) {
        const parsed = JSON.parse(rawClaims);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTotalSavedPortions(Math.max(3, parsed.length));
        }
      }
    } catch (_) {}
  }, []);

  const handleRedeemClick = (reward: RewardItem) => {
    setSelectedReward(reward);
    setRedeemSuccess(false);
    setConfirmModalOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;
    if (ecoPoints >= selectedReward.pointsCost) {
      const remaining = ecoPoints - selectedReward.pointsCost;
      setEcoPoints(remaining);
      try {
        localStorage.setItem('replate_ecopoints', String(remaining));
      } catch (_) {}
      setRedeemSuccess(true);
    }
  };

  const filteredRewards = REWARDS_CATALOG.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/consumer">
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer active:scale-95"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black text-[#1B3A5C] leading-tight">
                Gamifikasi &amp; Laporan Berdampak
              </h1>
              <span className="text-[10px] text-slate-500 font-medium block">
                Portal EcoPoints, Audit Emisi Karbon &amp; Lencana Pahlawan Pangan
              </span>
            </div>
          </div>

          {/* Mini Points Wallet Pill */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
            <Coins className="w-4 h-4 text-amber-700" />
            <span className="text-xs sm:text-sm font-black text-amber-950 font-mono">
              {ecoPoints} Poin
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* Tier Hero Header Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1B3A5C] via-[#163854] to-[#0E2F26] text-white shadow-lg border border-[#D4A843]/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-[#D4A843] text-slate-950 text-[10px] font-black uppercase rounded-md inline-block">
                Level 2 • Pahlawan Pangan Madya
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                {userName}
              </h2>
              <p className="text-xs text-slate-300">
                Peringkat #8 Komunitas Surabaya • Kontribusi aktif gerakan zero food waste
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Award className="w-6 h-6 text-[#D4A843]" />
              </div>
            </div>
          </div>

          {/* 3 Metrics Mini Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
              <span className="text-[10px] text-slate-300 block font-medium">Saldo Poin Aktif</span>
              <strong className="text-xl sm:text-2xl font-black text-[#D4A843] font-mono leading-none">
                {ecoPoints}
              </strong>
            </div>
            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
              <span className="text-[10px] text-slate-300 block font-medium">Porsi Diselamatkan</span>
              <strong className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                {totalSavedPortions}
              </strong>
            </div>
            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
              <span className="text-[10px] text-slate-300 block font-medium">CO2e Dicegah</span>
              <strong className="text-xl sm:text-2xl font-black text-emerald-300 font-mono leading-none">
                {(totalSavedPortions * 2.5).toFixed(1)} <span className="text-xs font-normal">kg</span>
              </strong>
            </div>
          </div>

          {/* Progress Bar towards Next Tier */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10.5px] text-slate-200 font-bold">
              <span>Progress Menuju Level 3 (Guardian Pangan)</span>
              <span>{ecoPoints} / 250 Poin</span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4A843] via-amber-300 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((ecoPoints / 250) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Komprehensif Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveMainTab('REWARDS')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'REWARDS'
                ? 'bg-[#1B3A5C] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            <Gift className="w-4 h-4 text-[#D4A843]" />
            <span>Katalog Hadiah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('IMPACT_AUDIT')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'IMPACT_AUDIT'
                ? 'bg-[#1B3A5C] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span>Laporan &amp; Lencana</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('CHALLENGES')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'CHALLENGES'
                ? 'bg-[#1B3A5C] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Misi &amp; Streak ({streakDays}d)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('LEADERBOARD')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'LEADERBOARD'
                ? 'bg-[#1B3A5C] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* TAB 1: KATALOG HADIAH & VOUCHER */}
        {activeMainTab === 'REWARDS' && (
          <div className="space-y-4">
            {/* Filter Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'ALL', label: 'Semua Hadiah', icon: Gift },
                { id: 'VOUCHER', label: 'Voucer Belanja', icon: Tag },
                { id: 'DONATION', label: 'Aksi Iklim & Panti', icon: TreePine },
                { id: 'MERCHANDISE', label: 'Merchandise Resmi', icon: ShoppingBag },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Reward Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredRewards.map((reward) => {
                const canAfford = ecoPoints >= reward.pointsCost;

                return (
                  <div
                    key={reward.id}
                    className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs hover:border-[#1B3A5C] transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex gap-3">
                      <div className="w-22 h-22 rounded-2xl overflow-hidden bg-slate-100 relative border border-slate-200 shrink-0">
                        <img
                          src={reward.imageUrl}
                          alt={reward.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-slate-950/80 backdrop-blur-xs text-white text-[8.5px] font-black rounded">
                          {reward.badge}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block truncate">
                          {reward.provider}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2">
                          {reward.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
                          {reward.description}
                        </p>

                        <div className="pt-1 flex items-center gap-1.5">
                          <div className="px-2.5 py-0.5 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-amber-700" />
                            <span className="text-xs font-black text-amber-950 font-mono">
                              {reward.pointsCost} Poin
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {reward.validUntil}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10.5px] text-slate-500 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Garansi Resmi Replate</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRedeemClick(reward)}
                        disabled={!canAfford}
                        className={`h-8 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          canAfford
                            ? 'bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <span>{canAfford ? 'Tukar Poin' : 'Poin Belum Cukup'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LAPORAN BERDAMPAK, AUDIT KARBON & LENCANA */}
        {activeMainTab === 'IMPACT_AUDIT' && (
          <div className="space-y-5">
            {/* Full Impact Gamification Component */}
            <ImpactGamification
              currentPoints={ecoPoints}
              totalPortionsSaved={totalSavedPortions}
              totalCo2SavedKg={Number((totalSavedPortions * 2.5).toFixed(1))}
              userName={userName}
              onRedeemRewards={() => setActiveMainTab('REWARDS')}
            />

            {/* Audit Karbon & SDG Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Globe2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#1B3A5C]">
                      Sertifikat Audit Dampak Lingkungan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Metodologi perhitungan emisi berbasis standar IPCC &amp; SDGs PBB
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10.5px] font-mono font-bold">
                  Audit Terverifikasi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">SDG 12.3: Zero Food Waste</span>
                  <strong className="text-base font-black text-slate-900 block">
                    {(totalSavedPortions * 0.4).toFixed(1)} Kg Pangan
                  </strong>
                  <span className="text-[11px] text-slate-600">Diselamatkan dari Tempat Pembuangan Akhir (TPA)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">SDG 13: Climate Action</span>
                  <strong className="text-base font-black text-emerald-700 block">
                    {(totalSavedPortions * 2.5).toFixed(1)} Kg CO2e
                  </strong>
                  <span className="text-[11px] text-slate-600">Setara dengan menanam {(totalSavedPortions * 0.2).toFixed(1)} pohon selama 1 tahun</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">SDG 2: Zero Hunger</span>
                  <strong className="text-base font-black text-[#1B3A5C] block">
                    {totalSavedPortions} Porsi Makanan
                  </strong>
                  <span className="text-[11px] text-slate-600">Nutrisi layak tersalurkan tepat sasaran</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TANTANGAN & MISI HARIAN (DAILY STREAK) */}
        {activeMainTab === 'CHALLENGES' && (
          <div className="space-y-4">
            {/* Daily Streak Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-yellow-200 animate-pulse" />
                  <div>
                    <h3 className="text-base font-black">Streak Penyelamatan: {streakDays} Hari Berturut-turut!</h3>
                    <p className="text-xs text-amber-100">Lanjutkan streak harian Anda untuk melipatgandakan perolehan EcoPoints</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white text-slate-900 rounded-xl text-xs font-black shadow-xs">
                  +10 Poin / Hari
                </span>
              </div>

              {/* 7 Days Streak Visual */}
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => {
                  const isCompleted = idx < streakDays;
                  const isToday = idx === streakDays - 1;
                  return (
                    <div
                      key={day}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-white text-slate-950 border-white shadow-xs'
                          : 'bg-white/20 text-white/70 border-white/20'
                      }`}
                    >
                      <span className="text-[10px] block opacity-80">{day}</span>
                      <span className="text-sm font-black mt-0.5 block">
                        {isCompleted ? '✓' : idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List Misi Harian & Mingguan */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#1B3A5C] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#D4A843]" />
                <span>Misi Hijau Hari Ini</span>
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 font-black text-[9.5px]">SELESAI</span>
                      <strong className="text-slate-900 font-bold">Klaim 1 Makanan Surplus Hari Ini</strong>
                    </div>
                    <p className="text-[11px] text-slate-600">Bantu restoran mengosongkan rak makanan sebelum waktu tutup</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white font-black rounded-xl shrink-0">
                    +40 Poin Diterima
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[9.5px]">AKTIF</span>
                      <strong className="text-slate-900 font-bold">Coba Eksplor Tab Produk Rp 0 (Donasi)</strong>
                    </div>
                    <p className="text-[11px] text-slate-600">Cek ketersediaan donasi pangan gratis untuk disalurkan ke kerabat dhuafa</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/explore')}
                    className="px-3 py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-black rounded-xl shrink-0 cursor-pointer"
                  >
                    Buka (+25 Poin)
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-black text-[9.5px]">MINGGUAN</span>
                      <strong className="text-slate-900 font-bold">Ajak 2 Teman Bergabung dengan Replate</strong>
                    </div>
                    <p className="text-[11px] text-slate-600">Bagikan kode referral pahlawan pangan Anda ke WhatsApp</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Link referral berhasil disalin ke clipboard!')}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan (+50 Poin)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD KOMUNITAS */}
        {activeMainTab === 'LEADERBOARD' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#1B3A5C] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#D4A843]" />
                  <span>Leaderboard Pahlawan Pangan Surabaya</span>
                </h3>
                <p className="text-xs text-slate-500">Peringkat kontribusi penyelamatan makanan surplus bulan ini</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Minggu ke-4 Oktober
              </span>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                <span className="text-xl">🥈</span>
                <span className="text-[10px] font-bold text-slate-500 block">Juara 2</span>
                <strong className="text-xs font-black text-slate-800 block truncate">Rina Kusuma</strong>
                <span className="text-[11px] font-mono font-black text-[#1B3A5C] block">420 Poin</span>
                <span className="text-[9.5px] text-emerald-700 font-medium">32 Porsi</span>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-50 border-2 border-[#D4A843] space-y-1 transform -translate-y-1 shadow-xs">
                <span className="text-2xl">🥇</span>
                <span className="text-[10px] font-bold text-amber-800 block">Juara 1</span>
                <strong className="text-xs font-black text-[#1B3A5C] block truncate">Bambang S.</strong>
                <span className="text-xs font-mono font-black text-amber-900 block">580 Poin</span>
                <span className="text-[9.5px] text-emerald-700 font-bold">48 Porsi</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-xl">🥉</span>
                <span className="text-[10px] font-bold text-amber-800 block">Juara 3</span>
                <strong className="text-xs font-black text-slate-800 block truncate">Dian Permata</strong>
                <span className="text-[11px] font-mono font-black text-[#1B3A5C] block">390 Poin</span>
                <span className="text-[9.5px] text-emerald-700 font-medium">29 Porsi</span>
              </div>
            </div>

            {/* List Peringkat 4 - 10 */}
            <div className="space-y-2 text-xs pt-2">
              {[
                { rank: 4, name: 'Hendra Wijaya', points: 310, portions: 24, badge: 'Pahlawan Pangan' },
                { rank: 5, name: 'Siti Aminah', points: 280, portions: 20, badge: 'Pahlawan Pangan' },
                { rank: 6, name: 'Kevin Pratama', points: 210, portions: 16, badge: 'Warga Peduli' },
                { rank: 7, name: 'Dewi Lestari', points: 190, portions: 14, badge: 'Warga Peduli' },
                { rank: 8, name: `${userName} (Anda)`, points: ecoPoints, portions: totalSavedPortions, badge: 'Pahlawan Pangan Madya', isUser: true },
                { rank: 9, name: 'Agus Subagyo', points: 120, portions: 9, badge: 'Penyelamat Pemula' },
                { rank: 10, name: 'Maya Safitri', points: 95, portions: 7, badge: 'Penyelamat Pemula' },
              ].map((item) => (
                <div
                  key={item.rank}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 border transition-all ${
                    item.isUser
                      ? 'bg-amber-50/80 border-[#D4A843] font-black'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-mono font-bold ${item.isUser ? 'text-[#1B3A5C]' : 'text-slate-400'}`}>
                      #{item.rank}
                    </span>
                    <div>
                      <strong className={`block ${item.isUser ? 'text-[#1B3A5C]' : 'text-slate-800'}`}>
                        {item.name}
                      </strong>
                      <span className="text-[10px] text-slate-500">{item.badge}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-amber-900 block">{item.points} Poin</span>
                    <span className="text-[10px] text-slate-500">{item.portions} porsi diselamatkan</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Redeem Modal */}
      {confirmModalOpen && selectedReward && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] sm:max-h-[90vh] font-sans overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 shrink-0 space-y-2">
              <div className="flex justify-center -mt-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-300" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Konfirmasi Penukaran
                    </span>
                    <h3 className="text-sm font-black text-[#1B3A5C]">
                      Detail Voucer &amp; Hadiah
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {redeemSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-black text-[#1B3A5C]">Penukaran Berhasil!</h3>
                  <p className="text-slate-600 text-xs">
                    Voucer <strong>{selectedReward.title}</strong> telah aktif dan tersimpan di dompet hadiah akun Anda.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                    KODE VOUCER: REPLATE-HERO-{Date.now().toString().slice(-6)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmModalOpen(false)}
                    className="w-full py-2.5 bg-[#1B3A5C] text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Tutup &amp; Lihat Dompet
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <img
                      src={selectedReward.imageUrl}
                      alt={selectedReward.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold">{selectedReward.provider}</span>
                      <h4 className="font-black text-slate-900 text-xs leading-snug">{selectedReward.title}</h4>
                      <span className="text-[11px] font-mono font-black text-amber-900 block">
                        Biaya: {selectedReward.pointsCost} Poin
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <strong className="text-slate-900 block">Ketentuan Penukaran:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      {selectedReward.terms.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
                    <span>Sisa Poin Setelah Tukar:</span>
                    <strong className="font-mono text-sm font-black">
                      {ecoPoints - selectedReward.pointsCost} Poin
                    </strong>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRedeem}
                      className="flex-1 py-2.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-[#D4A843] font-black text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Konfirmasi Tukar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav user={{ role: 'CONSUMER' }} />
    </div>
  );
}
