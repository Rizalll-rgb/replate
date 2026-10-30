'use client';

import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  TreePine,
  Coins,
  ShieldCheck,
  TrendingUp,
  Flame,
  CheckCircle2,
  Lock,
  Gift,
  ArrowRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export interface ImpactGamificationProps {
  currentPoints?: number;
  totalPortionsSaved?: number;
  totalCo2SavedKg?: number;
  userName?: string;
  onRedeemRewards?: () => void;
}

export const ImpactGamification: React.FC<ImpactGamificationProps> = ({
  currentPoints = 140,
  totalPortionsSaved = 3,
  totalCo2SavedKg = 7.5,
  userName = 'Pahlawan Pangan',
  onRedeemRewards,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

  const nextLevelThreshold = 250;
  const progressPercent = Math.min(100, Math.round((currentPoints / nextLevelThreshold) * 100));

  const badges = [
    {
      id: 'badge-1',
      title: 'Penyelamat Pemula',
      level: 'Tier Bronze',
      desc: 'Berhasil menyelamatkan makanan surplus pertama layak konsumsi.',
      icon: '🥉',
      unlocked: totalPortionsSaved >= 1,
      requirement: '1 Porsi Makanan Surplus',
      progress: '1/1 Selesai',
      badgeColor: 'from-amber-700/20 to-amber-900/30 border-amber-600/50 text-amber-300',
    },
    {
      id: 'badge-2',
      title: 'Pahlawan Zero-Waste',
      level: 'Tier Silver',
      desc: 'Mencegah lebih dari 5 kg akumulasi jejak emisi gas rumah kaca.',
      icon: '🥈',
      unlocked: totalCo2SavedKg >= 5,
      requirement: '5 Kg CO2e Dicegah',
      progress: `${totalCo2SavedKg}/5 Kg Selesai`,
      badgeColor: 'from-slate-400/20 to-slate-600/30 border-slate-400/50 text-slate-200',
    },
    {
      id: 'badge-3',
      title: 'Guardian Panti Asuhan',
      level: 'Tier Gold',
      desc: 'Menyalurkan donasi steril atau mendukung redistribusi pangan ke yayasan panti.',
      icon: '🥇',
      unlocked: true,
      requirement: '1 Donasi Panti Terlaksana',
      progress: '1/1 Selesai',
      badgeColor: 'from-amber-400/20 to-yellow-600/30 border-amber-400/60 text-amber-200',
    },
    {
      id: 'badge-4',
      title: 'Eco-Champion Nusantara',
      level: 'Tier Platinum',
      desc: 'Konsisten berkontribusi dalam gerakan bebas sampah pangan selama 30 hari.',
      icon: '👑',
      unlocked: false,
      requirement: '30 Hari Aksi Berkelanjutan',
      progress: '14/30 Hari (Sedang Berjalan)',
      badgeColor: 'from-purple-500/20 to-indigo-700/30 border-purple-400/40 text-purple-200',
    },
  ];

  const pointHistory = [
    { label: 'Penyelamatan Paket Nasi Ayam Bakar', points: '+40 Poin', time: 'Hari ini', icon: '🍲' },
    { label: 'Penyelamatan Roti Croissant & Pastry', points: '+40 Poin', time: 'Kemarin', icon: '🥐' },
    { label: 'Penyelamatan Sop Daging Sapi Steril', points: '+40 Poin', time: '2 hari lalu', icon: '🥣' },
    { label: 'Bonus Aktivasi Pahlawan Pangan Replate', points: '+20 Poin', time: 'Minggu ini', icon: '✨' },
  ];

  return (
    <div className="bg-gradient-to-br from-[#1B3A5C] via-[#162e49] to-[#0F1923] text-white rounded-3xl p-5 sm:p-7 border border-[#2C5A8F]/60 shadow-xl space-y-6">
      {/* Header Gamifikasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#D4A843] text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-slate-950" />
              Sistem Gamifikasi Berdampak
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersinkronisasi Real-Time
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Papan Kontribusi & Pahlawan Pangan
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            Setiap aksi penyelamatan makanan menghasilkan Poin Dampak (EcoPoints) dan membuka lencana prestasi SDGs.
          </p>
        </div>

        {/* Kotak Saldo Poin */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 sm:p-4 text-center sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
          <span className="text-[11px] font-bold text-slate-300 block">Total Poin Dampak</span>
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#D4A843] animate-bounce" />
            <span className="text-3xl font-black text-[#D4A843] font-mono leading-none">
              {currentPoints}
            </span>
            <span className="text-xs font-bold text-slate-200">Pts</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Kontribusi */}
      <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Level Pahlawan Pangan Anda:</span>
            <strong className="text-white text-sm sm:text-base font-black flex items-center gap-1.5 mt-0.5">
              <span>🌱 Level 2: Pejuang Bumi Lestari</span>
            </strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-medium block text-[11px]">Target Level 3 (Duta SDGs 12.3):</span>
            <span className="text-[#D4A843] font-black text-xs sm:text-sm font-mono">
              {currentPoints} / {nextLevelThreshold} Pts ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress bar visual */}
        <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#D4A843] to-amber-400 rounded-full transition-all duration-700 relative shadow-sm"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 animate-pulse rounded-full" />
          </div>
        </div>

        {/* Metrik Mini Kontribusi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-slate-400 block text-[10px]">Porsi Terselamatkan</span>
            <strong className="text-white font-extrabold text-xs sm:text-sm">{totalPortionsSaved} Porsi</strong>
          </div>
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-slate-400 block text-[10px]">CO2e Dicegah</span>
            <strong className="text-emerald-400 font-extrabold text-xs sm:text-sm">{totalCo2SavedKg} Kg</strong>
          </div>
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-slate-400 block text-[10px]">Metana (CH4) Ditekan</span>
            <strong className="text-purple-300 font-extrabold text-xs sm:text-sm">{(totalCo2SavedKg * 0.25).toFixed(1)} Kg</strong>
          </div>
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-slate-400 block text-[10px]">Setara Serapan Pohon</span>
            <strong className="text-[#D4A843] font-extrabold text-xs sm:text-sm">~{(totalCo2SavedKg / 21).toFixed(1)} Pohon</strong>
          </div>
        </div>
      </div>

      {/* Grid Badge Pencapaian (Achievements) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#D4A843]" />
            <span>Badge &amp; Lencana Pencapaian SDGs</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-semibold">
            {badges.filter((b) => b.unlocked).length} dari {badges.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden bg-gradient-to-br ${
                badge.unlocked
                  ? `${badge.badgeColor} hover:scale-102 shadow-md`
                  : 'from-slate-800/40 to-slate-900/60 border-slate-700/50 text-slate-500 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl filter drop-shadow-sm">{badge.icon}</span>
                <span
                  className={`text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    badge.unlocked
                      ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                      : 'bg-slate-700 text-slate-300 flex items-center gap-1'
                  }`}
                >
                  {badge.unlocked ? 'TERBUKA' : <><Lock className="w-2.5 h-2.5" /> TERKUNCI</>}
                </span>
              </div>

              <div className="mt-2.5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold">{badge.level}</span>
                <h5 className="font-black text-xs text-white leading-snug">{badge.title}</h5>
                <p className="text-[10.5px] text-slate-300 font-medium line-clamp-2 leading-relaxed">
                  {badge.desc}
                </p>
                <div className="pt-2 text-[10px] text-[#D4A843] font-bold border-t border-white/10 flex items-center justify-between">
                  <span>Progres:</span>
                  <span className="font-mono">{badge.progress}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Riwayat Perolehan Poin & Tukar Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
        <div className="md:col-span-2 bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5">
          <span className="text-xs font-extrabold text-white block">Log Perolehan Poin Terakhir:</span>
          <div className="space-y-1.5 text-xs">
            {pointHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{h.icon}</span>
                  <span className="text-slate-200 font-medium text-[11px]">{h.label}</span>
                </div>
                <div className="text-right shrink-0">
                  <strong className="text-emerald-400 font-mono font-black text-xs">{h.points}</strong>
                  <span className="text-[10px] text-slate-400 block font-normal">{h.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#D4A843]/20 via-[#D4A843]/10 to-amber-900/20 rounded-2xl p-4 border border-[#D4A843]/40 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4A843] text-slate-950 flex items-center justify-center font-black">
              <Gift className="w-5 h-5" />
            </div>
            <h5 className="font-black text-sm text-white">Tukar Poin Berdampak</h5>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Tukarkan EcoPoints Anda dengan voucer potongan belanja surplus, sembako panti, atau bibit mangrove nusantara.
            </p>
          </div>

          <Link href="/dashboard/consumer/rewards" className="block">
            <button
              type="button"
              onClick={onRedeemRewards}
              className="w-full py-2.5 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Katalog Hadiah &amp; Voucher</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

