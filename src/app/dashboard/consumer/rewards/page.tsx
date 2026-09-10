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
    title: 'Penanaman 1 Bibit Pohon Mangrove Wonorejo',
    category: 'DONATION',
    pointsCost: 100,
    description: 'Konversikan poin dampak Anda untuk aksi iklim nyata bersama Komunitas Mangrove Wonorejo Rungkut.',
    provider: 'Eco Action Surabaya & Replate',
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
  const [ecoPoints, setEcoPoints] = useState<number>(140);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'VOUCHER' | 'DONATION' | 'MERCHANDISE'>('ALL');
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [redeemSuccess, setRedeemSuccess] = useState<boolean>(false);

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
      {/* Mobile Sticky App Bar (Ala Gojek) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-3 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
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
                Tukar EcoPoints
              </h1>
              <span className="text-[10px] text-slate-500 font-medium block">
                Katalog Voucer &amp; Hadiah
              </span>
            </div>
          </div>

          {/* Mini Points Wallet Pill */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 px-2.5 py-1 rounded-full shadow-2xs">
            <Coins className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-xs font-black text-amber-950 font-mono">
              {ecoPoints} Poin
            </span>
          </div>
        </div>
      </header>

      {/* Main Mobile Feed */}
      <main className="max-w-md mx-auto px-3.5 py-3.5 space-y-3.5">
        {/* Tier Progress Card (Gojek Club Style) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1B3A5C] via-[#163854] to-[#0E2F26] text-white shadow-md border border-[#D4A843]/30 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 bg-[#D4A843] text-slate-950 text-[9.5px] font-black uppercase rounded-md inline-block">
                Level 2 • Warga Peduli
              </span>
              <h2 className="text-sm font-black text-white leading-snug">
                Pahlawan Pangan Replate
              </h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Award className="w-5 h-5 text-[#D4A843]" />
            </div>
          </div>

          {/* Points & CO2 Balance */}
          <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
            <div>
              <span className="text-[10px] text-slate-300 block font-medium">Saldo Poin Aktif</span>
              <div className="flex items-baseline gap-1.5">
                <strong className="text-2xl font-black text-[#D4A843] font-mono leading-none">
                  {ecoPoints}
                </strong>
                <span className="text-xs font-bold text-slate-200">Poin</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block font-medium">Dampak Lingkungan</span>
              <span className="text-xs font-black text-emerald-300">
                ~{(ecoPoints * 0.9 / 40).toFixed(1)} kg CO2e Dicegah
              </span>
            </div>
          </div>

          {/* Progress Bar to next tier */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-300 font-bold">
              <span>Progress Menuju Level 3</span>
              <span>{ecoPoints} / 200 Poin</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4A843] to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((ecoPoints / 200) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: 'Semua Hadiah', icon: Gift },
            { id: 'VOUCHER', label: 'Voucer Diskon', icon: Tag },
            { id: 'DONATION', label: 'Aksi Lingkungan', icon: TreePine },
            { id: 'MERCHANDISE', label: 'Merchandise', icon: ShoppingBag },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border shrink-0 flex items-center gap-1.5 ${
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

        {/* Single-Column Voucher Card Feed (Mobile-First) */}
        <div className="space-y-3">
          {filteredRewards.map((reward) => {
            const canAfford = ecoPoints >= reward.pointsCost;

            return (
              <div
                key={reward.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex gap-3">
                  {/* Voucher Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 relative border border-slate-200 shrink-0">
                    <img
                      src={reward.imageUrl}
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-slate-950/80 backdrop-blur-xs text-white text-[8.5px] font-black rounded">
                      {reward.badge}
                    </span>
                  </div>

                  {/* Voucher Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block truncate">
                      {reward.provider}
                    </span>
                    <h3 className="text-xs font-black text-slate-900 leading-tight line-clamp-2">
                      {reward.title}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-medium line-clamp-1">
                      {reward.description}
                    </p>

                    <div className="pt-0.5 flex items-center gap-1.5">
                      <div className="px-2 py-0.5 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-700" />
                        <span className="text-[11px] font-black text-amber-950 font-mono">
                          {reward.pointsCost} Poin
                        </span>
                      </div>
                      <span className="text-[9.5px] text-slate-400 font-medium">
                        • {reward.validUntil}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Garansi Replate Rewards</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRedeemClick(reward)}
                    disabled={!canAfford}
                    className={`h-7 px-3 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                      canAfford
                        ? 'bg-[#1B3A5C] hover:bg-[#142C47] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <span>{canAfford ? 'Tukar' : 'Poin Kurang'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Gojek-Style Slide-Up Bottom Sheet Confirmation Modal */}
      {confirmModalOpen && selectedReward && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            {/* Drag handle */}
            <div className="flex justify-center -mt-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
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
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {redeemSuccess ? (
              /* Success State */
              <div className="space-y-4 py-2 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">
                    Penukaran Hadiah Berhasil!
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Voucer <strong>{selectedReward.title}</strong> telah tersimpan di akun Anda.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Poin Ditukar:</span>
                    <strong className="text-amber-700 font-mono">-{selectedReward.pointsCost} Poin</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sisa Saldo:</span>
                    <strong className="text-slate-800 font-mono">{ecoPoints} Poin</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="w-full py-3 bg-[#1B3A5C] text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  Selesai &amp; Gunakan Voucer
                </button>
              </div>
            ) : (
              /* Confirmation Detail State */
              <div className="space-y-3 text-xs">
                {/* Reward summary */}
                <div className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <img
                    src={selectedReward.imageUrl}
                    alt={selectedReward.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block truncate">
                      {selectedReward.provider}
                    </span>
                    <h4 className="font-black text-xs text-slate-900 leading-tight">
                      {selectedReward.title}
                    </h4>
                    <div className="flex items-center gap-1 text-amber-700 font-black font-mono pt-1">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{selectedReward.pointsCost} EcoPoints</span>
                    </div>
                  </div>
                </div>

                {/* Balance check */}
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Saldo Poin Anda:</span>
                    <strong className="text-slate-900 font-mono">{ecoPoints} Poin</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Biaya Penukaran:</span>
                    <strong className="text-amber-700 font-mono">-{selectedReward.pointsCost} Poin</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-amber-200/80 font-bold">
                    <span className="text-slate-700">Sisa Saldo Setelah Tukar:</span>
                    <strong className="text-[#1B3A5C] font-mono">{ecoPoints - selectedReward.pointsCost} Poin</strong>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-1.5">
                  <span className="font-black text-slate-700 text-[11px] block">
                    Syarat &amp; Ketentuan:
                  </span>
                  <ul className="space-y-1 text-slate-600 text-[10.5px]">
                    {selectedReward.terms.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-black shrink-0">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmRedeem}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#D4A843] to-[#E5B954] text-slate-950 font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Konfirmasi Tukar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav user={session?.user} />
    </div>
  );
}
