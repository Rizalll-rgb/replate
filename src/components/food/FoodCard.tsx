'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Flame,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { calculateThermalDecayRUI, FoodSafetyCategory } from '@/lib/thermalRescueEngine';

export interface FoodCardProps {
  id: string;
  foodName?: string;
  title?: string;
  category?: string;
  foodCategory?: string;
  bpomCategory?: string;
  quantity?: number | string;
  quantityUnit?: string;
  price?: number | null;
  discountPrice?: number | null;
  originalPrice?: number | null;
  pickupDeadline?: string | Date;
  pickupTime?: string;
  address?: string;
  providerName?: string;
  status?: string;
  distributionType?: string;
  photoUrl?: string | null;
  imageUrl?: string | null;
  photos?: string[];
  photo?: string;
  isFree?: boolean;
  distance?: string;
  hideIfExpired?: boolean;
  isVerifiedProvider?: boolean;
  onClaim?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  onDetail?: (id: string) => void;
  onManage?: (id: string) => void;
  customActionLabel?: string;
}

/**
 * Menghasilkan informasi kepatuhan standar BPOM berdasarkan kategori makanan
 * Sesuai Regulasi BPOM RI No. 13/2019 & SOP Sanitasi Higienitas Kemenkes RI.
 */
export function getBpomComplianceInfo(category?: string, foodName?: string, bpomCat?: string) {
  const cat = (bpomCat || category || '').toUpperCase();
  const name = (foodName || '').toUpperCase();

  // 1. Pangan Berkuah / Santan Panas (Sup, Soto, Rawon, Gulai)
  if (
    cat.includes('GRAVY') ||
    cat.includes('KUAH') ||
    cat.includes('SOUP') ||
    name.includes('BAKSO') ||
    name.includes('SOTO') ||
    name.includes('RAWON') ||
    name.includes('GULAI')
  ) {
    return {
      categoryKey: 'COOKED_HOT_GRAVY',
      label: 'Standar BPOM: Pangan Berkuah/Santan - Suhu >60°C Max 2.5 Jam',
      shortLabel: 'BPOM Kuah/Santan • Max 2.5 Jam',
      detail: 'SOP BPOM RI: Rentan mikroba anaerob & fermentasi santan, wajib suhu >60°C & batas konsumsi maks 2.5 jam.',
      badgeColor: 'bg-amber-50 text-amber-950 border-amber-300',
      iconColor: 'text-amber-600',
    };
  }

  // 2. Roti, Pastry, & Kue Basah
  if (
    cat.includes('BAKERY') ||
    cat.includes('ROTI') ||
    cat.includes('PASTRY') ||
    cat.includes('KUE') ||
    name.includes('ROTI') ||
    name.includes('DONAT') ||
    name.includes('PASTRY')
  ) {
    return {
      categoryKey: 'BAKERY_PASTRY',
      label: 'Standar BPOM: Roti & Pastry - Kemasan Rapat Higienis Max 24-48 Jam',
      shortLabel: 'BPOM Roti & Pastry • Kemasan Rapat',
      detail: 'SOP BPOM RI: Roti/pastry disimpan dalam kemasan kedap udara food-grade untuk mencegah kontaminasi kapang/jamur.',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
      iconColor: 'text-amber-600',
    };
  }

  // 3. Olahan Susu & Produk Dingin (Cold Chain)
  if (
    cat.includes('DAIRY') ||
    cat.includes('SUSU') ||
    cat.includes('COLD') ||
    cat.includes('DINGIN') ||
    name.includes('SUSU') ||
    name.includes('YOGURT') ||
    name.includes('KEJU')
  ) {
    return {
      categoryKey: 'DAIRY_COLD',
      label: 'Standar BPOM: Olahan Susu & Dingin - Chilled 2-4°C Max 4 Jam',
      shortLabel: 'BPOM Chilled • Cold Chain 2-4°C',
      detail: 'SOP BPOM RI: Kontrol rantai dingin 2-4°C wajib terjaga demi mencegah proliferasi bakteri asam laktat & patogen.',
      badgeColor: 'bg-sky-50 text-sky-950 border-sky-300',
      iconColor: 'text-sky-600',
    };
  }

  // 4. Sayur & Buah Segar
  if (
    cat.includes('PRODUCE') ||
    cat.includes('SAYUR') ||
    cat.includes('BUAH') ||
    name.includes('BUAH') ||
    name.includes('SALAD')
  ) {
    return {
      categoryKey: 'FRESH_PRODUCE',
      label: 'Standar BPOM: Sayur & Buah Segar - Steril Higienis Max 12 Jam',
      shortLabel: 'BPOM Segar • Mutu Terjaga',
      detail: 'SOP BPOM RI: Sortir kesegaran prima, dicuci air mengalir food-safe berstandar sanitasi bahan pangan segar.',
      badgeColor: 'bg-emerald-50 text-emerald-950 border-emerald-300',
      iconColor: 'text-emerald-600',
    };
  }

  // 5. Pangan Kering & Kemasan Pabrik
  if (
    cat.includes('DRY') ||
    cat.includes('CANNED') ||
    cat.includes('KERING') ||
    cat.includes('SNACK') ||
    name.includes('KERIPIK') ||
    name.includes('BISKUIT')
  ) {
    return {
      categoryKey: 'DRY_BAKERY_CANNED',
      label: 'Standar BPOM: Pangan Olahan Kering - Kemasan Segel Utuh BPOM',
      shortLabel: 'BPOM Kemasan • Segel Utuh',
      detail: 'SOP BPOM RI: Kemasan bersegel utuh, bebas penyok atau kebocoran, aman dari kontaminasi silang.',
      badgeColor: 'bg-indigo-50 text-indigo-950 border-indigo-200',
      iconColor: 'text-indigo-600',
    };
  }

  // 6. Default: Makanan Siap Saji (Nasi Kotak & Lauk Matang)
  return {
    categoryKey: 'COOKED_MEALS',
    label: 'Standar BPOM: Makanan Siap Saji - Suhu Ruang Max 4 Jam',
    shortLabel: 'BPOM Siap Saji • Suhu Ruang Max 4 Jam',
    detail: 'SOP BPOM RI: Nasi kotak & masakan matang siap saji wajib dikonsumsi maks 4 jam pada suhu ruang 25-34°C.',
    badgeColor: 'bg-emerald-50 text-emerald-950 border-emerald-300',
    iconColor: 'text-emerald-600',
  };
}

export const FoodCard: React.FC<FoodCardProps> = (props) => {
  const {
    id,
    onClaim,
    onAddToCart,
    onDetail,
    onManage,
    customActionLabel,
    hideIfExpired = true,
  } = props;

  const title = props.title || props.foodName || 'Makanan Surplus';
  const providerName =
    props.providerName ||
    (props as any).provider?.name ||
    (props as any).provider?.organizationName ||
    (typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}').entityName ||
        JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}').name
      : null) ||
    'Warung Bakso Pak Kumis';

  const category = props.category || props.foodCategory || 'MEALS';

  // 4. Badge "Verified Business" pada provider dengan langganan aktif
  const isVerifiedBusiness = useMemo(() => {
    if (props.isVerifiedProvider) return true;
    if ((props as any).isVerified) return true;
    if ((props as any).provider?.verifiedBadge) return true;
    if ((props as any).provider?.subscription?.status === 'ACTIVE') return true;

    if (typeof window !== 'undefined') {
      try {
        const sub = localStorage.getItem('replate_provider_subscription');
        if (sub) {
          const parsed = JSON.parse(sub);
          if (
            parsed.status === 'ACTIVE' &&
            (parsed.planId === 'BUSINESS' ||
              parsed.planId === 'GROWTH' ||
              parsed.tier === 'BUSINESS' ||
              parsed.tier === 'GROWTH')
          ) {
            return true;
          }
        }
      } catch (_) {}
    }

    const nameLower = (providerName || '').toLowerCase();
    if (
      nameLower.includes('pak kumis') ||
      nameLower.includes('rotiboy') ||
      nameLower.includes('majapahit') ||
      nameLower.includes('bu rudy') ||
      nameLower.includes('hypermart') ||
      nameLower.includes('indomaret')
    ) {
      return true;
    }

    return false;
  }, [props.isVerifiedProvider, (props as any).isVerified, providerName]);

  // Out of Stock detection
  let rawQtyNum = 1;
  if (typeof props.quantity === 'number') {
    rawQtyNum = props.quantity;
  } else if (typeof props.quantity === 'string') {
    const match = props.quantity.match(/\d+/);
    rawQtyNum = match ? parseInt(match[0], 10) : 1;
    if (props.quantity.toLowerCase().includes('0 porsi') || props.quantity.trim() === '0') {
      rawQtyNum = 0;
    }
  }

  const isOutOfStock =
    rawQtyNum <= 0 ||
    props.status === 'OUT_OF_STOCK' ||
    props.status === 'SOLD_OUT' ||
    props.status === 'CLAIMED' ||
    (props as any).remainingQuantity === 0;

  let quantityStr = isOutOfStock ? '0 Porsi (Habis)' : '1 Porsi';
  if (!isOutOfStock) {
    if (typeof props.quantity === 'string') {
      quantityStr = props.quantity;
    } else if (typeof props.quantity === 'number') {
      quantityStr = `${props.quantity} ${props.quantityUnit || 'Porsi'}`;
    }
  }

  const isFree =
    props.isFree !== undefined
      ? props.isFree
      : props.price === 0 ||
        props.discountPrice === 0 ||
        props.distributionType === 'FREE' ||
        props.distributionType === 'DONATION';

  const discountPrice =
    props.discountPrice !== undefined && props.discountPrice !== null
      ? props.discountPrice
      : props.price || 0;

  const originalPrice = props.originalPrice || undefined;

  // 1. Dynamic Countdown Waktu Batas Ambil (Pickup Deadline)
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000); // Reactive update every 15s
    return () => clearInterval(timer);
  }, []);

  const deadlineInfo = useMemo(() => {
    let targetDate: Date | null = null;

    if (props.pickupDeadline) {
      const parsed = new Date(props.pickupDeadline);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }

    if (!targetDate && props.pickupTime) {
      // 1. Text format like "Sisa 1 Jam 30 Menit"
      const sisaMatch = props.pickupTime.match(/Sisa\s*(\d+)?\s*(?:Jam)?\s*(\d+)?\s*Menit/i);
      if (sisaMatch) {
        const h = sisaMatch[1] ? parseInt(sisaMatch[1], 10) : 0;
        const m = sisaMatch[2] ? parseInt(sisaMatch[2], 10) : 0;
        if (h > 0 || m > 0) {
          targetDate = new Date(currentTime + (h * 60 + m) * 60000);
        }
      }

      // 2. Exact end time like "19:30 - 21:30 WIB" or "s/d 21:30 WIB"
      if (!targetDate) {
        const timeMatches = props.pickupTime.match(/(\d{1,2})[:.](\d{2})/g);
        if (timeMatches && timeMatches.length > 0) {
          const lastTime = timeMatches[timeMatches.length - 1];
          const parts = lastTime.split(/[:.]/).map(Number);
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const d = new Date(currentTime);
            d.setHours(parts[0], parts[1], 0, 0);
            if (d.getTime() < currentTime - 12 * 3600 * 1000) {
              d.setDate(d.getDate() + 1);
            }
            targetDate = d;
          }
        }
      }
    }

    // Default fallback: 2 jam 15 menit dari sekarang
    if (!targetDate) {
      targetDate = new Date(currentTime + 135 * 60 * 1000);
    }

    const diffMs = targetDate.getTime() - currentTime;
    const isPast = diffMs <= 0 || props.status === 'EXPIRED';
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const timeFormatted = targetDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Format countdown dinamis (contoh: "Tersisa 1j 45m", "Tersisa 45m")
    let countdownLabel = '';
    if (isPast) {
      countdownLabel = 'Waktu Habis / Expired';
    } else if (hours > 0 && minutes > 0) {
      countdownLabel = `Tersisa ${hours}j ${minutes}m`;
    } else if (hours > 0) {
      countdownLabel = `Tersisa ${hours}j`;
    } else {
      countdownLabel = `Tersisa ${minutes}m`;
    }

    // Indikator Warna:
    // Hijau: > 3 jam (totalMinutes > 180)
    // Kuning: 1 - 3 jam (60 <= totalMinutes <= 180)
    // Merah: < 1 jam (totalMinutes < 60)
    let colorTier: 'green' | 'yellow' | 'red' = 'green';
    if (isPast || totalMinutes < 60) {
      colorTier = 'red';
    } else if (totalMinutes <= 180) {
      colorTier = 'yellow';
    } else {
      colorTier = 'green';
    }

    return {
      targetDate,
      isExpired: isPast,
      diffMinutes: totalMinutes,
      timeFormatted,
      countdownLabel,
      colorTier,
    };
  }, [props.pickupDeadline, props.pickupTime, props.status, currentTime]);

  // 2. Logika Auto-Hide: jika waktu telah terlewati dan hideIfExpired aktif (tanpa mode manajemen)
  if (hideIfExpired && deadlineInfo.isExpired && !onManage) {
    return null;
  }

  // 3. Badge kepatuhan keamanan pangan standar BPOM
  const bpomInfo = useMemo(() => {
    return getBpomComplianceInfo(category, title, props.bpomCategory);
  }, [category, title, props.bpomCategory]);

  // Warna countdown sesuai indikator: Hijau (>3 jam), Kuning (1-3 jam), Merah (<1 jam)
  const countdownStyles = {
    green: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      pill: 'bg-emerald-600 text-white shadow-2xs',
      icon: 'text-emerald-600',
      topBadge: 'bg-emerald-700/90 text-white border-emerald-400/40',
    },
    yellow: {
      container: 'bg-amber-50 border-amber-300 text-amber-950',
      pill: 'bg-amber-500 text-slate-950 font-black shadow-2xs',
      icon: 'text-amber-600',
      topBadge: 'bg-amber-500 text-slate-950 border-amber-300',
    },
    red: {
      container: 'bg-rose-50 border-rose-300 text-rose-950',
      pill: 'bg-rose-600 text-white font-black animate-pulse shadow-2xs',
      icon: 'text-rose-600 animate-spin-slow',
      topBadge: 'bg-rose-600 text-white border-rose-400 animate-pulse',
    },
  }[deadlineInfo.colorTier];

  const defaultPhotos: Record<string, string> = {
    MEALS: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    BAKERY: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    PRODUCE: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=60',
    DAIRY: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60',
    BEVERAGES: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop&q=60',
    SNACKS: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60',
  };

  const catKey = category.toUpperCase();
  const imageSrc =
    props.imageUrl ||
    props.photoUrl ||
    props.photos?.[0] ||
    (props as any).photo ||
    defaultPhotos[catKey] ||
    defaultPhotos.MEALS;

  return (
    <div
      className={`relative bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
        isOutOfStock
          ? 'border-slate-300 bg-slate-50/70 opacity-90'
          : deadlineInfo.isExpired
          ? 'border-rose-300 bg-rose-50/20'
          : deadlineInfo.colorTier === 'red'
          ? 'border-rose-300 hover:border-rose-500'
          : deadlineInfo.colorTier === 'yellow'
          ? 'border-amber-300 hover:border-amber-500'
          : 'border-slate-200 hover:border-[#1B3A5C]/40'
      } ${onDetail ? 'cursor-pointer' : ''}`}
      onClick={() => onDetail && onDetail(id)}
    >
      {/* 2. Overlay Status "Waktu Habis / Expired" jika terlewati dan tidak auto-hidden */}
      {deadlineInfo.isExpired && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-4 z-30 text-center space-y-2">
          <span className="px-3 py-1.5 bg-rose-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-rose-400 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            Waktu Habis / Expired
          </span>
          <p className="text-[10.5px] sm:text-xs text-slate-200 font-medium max-w-[220px] leading-snug">
            Batas waktu penjemputan telah lewat. Produk otomatis dinonaktifkan demi higienitas SOP BPOM.
          </p>
          {onManage ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onManage(id);
              }}
              className="mt-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Kelola Produk
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="mt-1 px-3 py-1 bg-slate-800 text-slate-400 font-bold text-[11px] rounded-lg border border-slate-700 cursor-not-allowed"
            >
              Tidak Dapat Diklaim
            </button>
          )}
        </div>
      )}

      {/* Gambar Produk & Floating Top Badges */}
      <div className="relative h-36 sm:h-44 w-full bg-slate-100 overflow-hidden shrink-0">
        <img
          src={imageSrc}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isOutOfStock || deadlineInfo.isExpired
              ? 'grayscale-[40%] contrast-90'
              : 'group-hover:scale-105'
          }`}
        />

        {/* Out of Stock Overlay Banner */}
        {isOutOfStock && !deadlineInfo.isExpired && (
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-[10px] sm:text-xs rounded-xl shadow-lg border border-rose-300/40 uppercase tracking-wider">
              Habis Terdistribusi
            </span>
          </div>
        )}

        {/* Top Badges (Kategori & Stok) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1 sm:gap-1.5 z-20">
          <span
            className={`text-[8.5px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-xs ${
              isOutOfStock
                ? 'bg-rose-600 text-white'
                : isFree
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-[#D4A843] text-slate-950'
            }`}
          >
            {isOutOfStock ? 'HABIS' : isFree ? 'DONASI' : 'SALE'}
          </span>
          <span
            className={`text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg backdrop-blur-xs ${
              isOutOfStock
                ? 'bg-rose-950/90 text-rose-200 border border-rose-400/30'
                : 'bg-slate-950/80 text-white'
            }`}
          >
            {quantityStr}
          </span>
        </div>

        {/* Distance Badge */}
        {props.distance && (
          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-[8.5px] sm:text-[10px] bg-slate-900/80 text-amber-300 font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-0.5 sm:gap-1 z-20">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
            <span>{props.distance}</span>
          </span>
        )}
      </div>

      {/* Konten Kartu */}
      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Baris Provider & Badge "Verified Business" */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate max-w-[150px] sm:max-w-[180px]">
              {providerName}
            </span>
            {isVerifiedBusiness && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/90 rounded-md text-[9px] sm:text-[10px] font-extrabold shrink-0 shadow-2xs"
                title="Mitra Provider Resmi Terverifikasi (Verified Business)"
              >
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>Verified Business</span>
              </span>
            )}
          </div>

          {/* Judul Produk */}
          <h4
            className={`font-extrabold text-xs sm:text-sm line-clamp-1 leading-snug transition-colors ${
              isOutOfStock || deadlineInfo.isExpired
                ? 'text-slate-500 line-through'
                : 'text-[#1B3A5C] group-hover:text-blue-900'
            }`}
          >
            {title}
          </h4>

          {/* 3. Badge Kepatuhan Keamanan Pangan Standar BPOM */}
          <div
            className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-bold ${bpomInfo.badgeColor}`}
            title={`${bpomInfo.label}. ${bpomInfo.detail}`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${bpomInfo.iconColor}`} />
            <span className="truncate hidden sm:inline">{bpomInfo.label}</span>
            <span className="truncate sm:hidden">{bpomInfo.shortLabel}</span>
          </div>

          {/* 1. Countdown Waktu Batas Ambil Dinamis (Pickup Deadline) */}
          <div
            className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 text-[10px] sm:text-[11px] font-bold ${
              isOutOfStock
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : deadlineInfo.isExpired
                ? 'bg-rose-100 border-rose-300 text-rose-950'
                : countdownStyles.container
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Clock
                className={`w-3.5 h-3.5 shrink-0 ${
                  isOutOfStock
                    ? 'text-slate-400'
                    : deadlineInfo.isExpired
                    ? 'text-rose-600'
                    : countdownStyles.icon
                }`}
              />
              <span className="truncate">
                {isOutOfStock
                  ? 'Habis terdistribusi'
                  : deadlineInfo.isExpired
                  ? 'Batas penjemputan terlewati'
                  : `Batas Ambil: s/d ${deadlineInfo.timeFormatted} WIB`}
              </span>
            </div>
            {!isOutOfStock && (
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black shrink-0 ${
                  deadlineInfo.isExpired
                    ? 'bg-rose-600 text-white'
                    : countdownStyles.pill
                }`}
              >
                {deadlineInfo.countdownLabel}
              </span>
            )}
          </div>
        </div>

        {/* Quick detail secondary link */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDetail && onDetail(id);
          }}
          className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-[#1B3A5C] font-extrabold text-[10px] sm:text-[11px] rounded-lg sm:rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Detail & Titik Jemput GPS</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Bagian Bawah: Harga & Tombol Aksi */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <span
              className={`text-xs sm:text-base font-black block leading-tight ${
                isOutOfStock || deadlineInfo.isExpired
                  ? 'text-slate-400 line-through'
                  : 'text-[#1B3A5C]'
              }`}
            >
              {isFree ? 'Rp 0' : `Rp ${discountPrice.toLocaleString('id-ID')}`}
            </span>
            {!isFree && originalPrice && (
              <span className="text-[9px] sm:text-[10px] text-slate-400 line-through font-bold block leading-tight">
                Rp {originalPrice.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {onManage ? (
            <div className="flex items-center gap-1.5">
              {isOutOfStock && (
                <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  Habis
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onManage(id);
                }}
                className={`w-full sm:w-auto px-2.5 sm:px-3 py-1 sm:py-1.5 font-black text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isOutOfStock || deadlineInfo.isExpired
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                }`}
              >
                <span>
                  {isOutOfStock || deadlineInfo.isExpired ? 'Restock / Kelola' : 'Kelola'}
                </span>
              </button>
            </div>
          ) : isOutOfStock || deadlineInfo.isExpired ? (
            <div className="w-full sm:w-auto">
              <button
                type="button"
                disabled
                className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-1.5 bg-slate-100 text-slate-400 font-bold text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl cursor-not-allowed border border-slate-300 flex items-center justify-center gap-1"
                title={
                  deadlineInfo.isExpired
                    ? 'Batas waktu ambil telah terlewati'
                    : 'Porsi makanan ini telah habis'
                }
              >
                <span>{deadlineInfo.isExpired ? 'Waktu Habis' : 'Stok Habis'}</span>
              </button>
            </div>
          ) : onClaim && (!props.status || props.status === 'AVAILABLE' || props.status === 'ACTIVE') ? (
            <div className="flex gap-1 w-full sm:w-auto">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(id);
                  }}
                  className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 text-[#1B3A5C] font-black rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                  title="Masukkan Tas Klaim"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClaim(id);
                }}
                className="flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-black text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{customActionLabel || (isFree ? 'Klaim' : 'Beli')}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
