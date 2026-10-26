'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Clock, Flame, ShieldCheck, Thermometer } from 'lucide-react';
import { calculateThermalDecayRUI, FoodSafetyCategory } from '@/lib/thermalRescueEngine';

export interface FoodCardProps {
  id: string;
  foodName?: string;
  title?: string;
  category?: string;
  foodCategory?: string;
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
    (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}').entityName || JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}').name) : null) ||
    'Warung Bakso Pak Kumis';
  const category = props.category || props.foodCategory || 'MEALS';
  
  // Check Verified Provider Badge from subscription or props
  const isVerified = useMemo(() => {
    if (props.isVerifiedProvider) return true;
    if (typeof window !== 'undefined') {
      try {
        const sub = localStorage.getItem('replate_provider_subscription');
        if (sub) {
          const parsed = JSON.parse(sub);
          if (parsed.status === 'ACTIVE' && (parsed.planId === 'BUSINESS' || parsed.planId === 'GROWTH')) {
            return true;
          }
        }
      } catch (_) {}
    }
    return (props as any).isVerified || false;
  }, [props.isVerifiedProvider, (props as any).isVerified]);

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

  const isFree = props.isFree !== undefined ? props.isFree : (props.price === 0 || props.discountPrice === 0 || props.distributionType === 'FREE' || props.distributionType === 'DONATION');
  const discountPrice = props.discountPrice !== undefined && props.discountPrice !== null ? props.discountPrice : (props.price || 0);
  const originalPrice = props.originalPrice || undefined;

  // Deadline & Auto-Expiration Calculation
  const deadlineInfo = useMemo(() => {
    const now = new Date();
    let targetDate: Date | null = null;

    if (props.pickupDeadline) {
      const parsed = new Date(props.pickupDeadline);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }

    if (!targetDate && props.pickupTime) {
      // Try to parse end time from string like "19:30 - 21:30 WIB" or "21:30 WIB"
      const timeMatches = props.pickupTime.match(/(\d{1,2})[:.](\d{2})/g);
      if (timeMatches && timeMatches.length > 0) {
        const lastTime = timeMatches[timeMatches.length - 1];
        const parts = lastTime.split(/[:.]/).map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const d = new Date();
          d.setHours(parts[0], parts[1], 0, 0);
          targetDate = d;
        }
      }
    }

    // Default fallback: 3 hours from now if no deadline provided
    if (!targetDate) {
      targetDate = new Date(now.getTime() + 3 * 3600 * 1000);
    }

    const diffMs = targetDate.getTime() - now.getTime();
    const isPast = diffMs <= 0 || props.status === 'EXPIRED';
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const timeFormatted = targetDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let countdownLabel = '';
    if (isPast) {
      countdownLabel = 'Kedaluwarsa';
    } else if (hours > 0) {
      countdownLabel = `Sisa ${hours}j ${minutes}m`;
    } else {
      countdownLabel = `Sisa ${minutes} menit!`;
    }

    return {
      targetDate,
      isExpired: isPast,
      diffMinutes: totalMinutes,
      timeFormatted,
      countdownLabel,
      isUrgent: !isPast && totalMinutes <= 75,
    };
  }, [props.pickupDeadline, props.pickupTime, props.status]);

  // Auto-remove expired card from public exploration
  if (hideIfExpired && deadlineInfo.isExpired && !onManage) {
    return null;
  }

  // Pilar 3 BPOM Thermal RUI calculation
  let safetyCat: FoodSafetyCategory = 'COOKED_MEALS';
  const rawCat = (category || props.foodCategory || '').toUpperCase();
  const rawTitle = (title || '').toUpperCase();
  if (rawCat.includes('SOUP') || rawCat.includes('KUAH') || rawTitle.includes('BAKSO') || rawTitle.includes('SOTO') || rawTitle.includes('RAWON')) {
    safetyCat = 'COOKED_HOT_GRAVY';
  } else if (rawCat.includes('BAKERY') || rawCat.includes('ROTI') || rawCat.includes('PASTRY') || rawCat.includes('KUE')) {
    safetyCat = 'BAKERY_PASTRY';
  } else if (rawCat.includes('DAIRY') || rawCat.includes('SUSU') || rawCat.includes('COLD')) {
    safetyCat = 'DAIRY_COLD';
  } else if (rawCat.includes('PRODUCE') || rawCat.includes('SAYUR') || rawCat.includes('BUAH')) {
    safetyCat = 'FRESH_PRODUCE';
  } else if (rawCat.includes('DRY') || rawCat.includes('CANNED') || rawCat.includes('KERING')) {
    safetyCat = 'DRY_BAKERY_CANNED';
  }

  const ruiResult = useMemo(() => {
    return calculateThermalDecayRUI({
      category: safetyCat,
      ambientTemperatureC: 31,
      portions: rawQtyNum,
      cookedOrPackedTime: (props as any).createdAt || new Date(Date.now() - 60 * 60 * 1000),
    });
  }, [safetyCat, rawQtyNum, (props as any).createdAt]);

  // Synchronized BPOM & Pickup Deadline Status
  const isBpomUrgent = deadlineInfo.isUrgent || ruiResult.rescueUrgencyIndex >= 65 || deadlineInfo.diffMinutes <= 60;

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
      className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
        isOutOfStock
          ? 'border-slate-300 bg-slate-50/70 opacity-90'
          : deadlineInfo.isUrgent
          ? 'border-amber-300 hover:border-amber-500'
          : 'border-slate-200 hover:border-[#1B3A5C]/40'
      } ${onDetail ? 'cursor-pointer' : ''}`}
      onClick={() => onDetail && onDetail(id)}
    >
      <div className="relative h-36 sm:h-44 w-full bg-slate-100 overflow-hidden shrink-0">
        <img
          src={imageSrc}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isOutOfStock ? 'grayscale-[40%] contrast-90' : 'group-hover:scale-105'
          }`}
        />

        {/* Out of Stock Overlay Banner */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-[10px] sm:text-xs rounded-xl shadow-lg border border-rose-300/40 uppercase tracking-wider">
              Habis Terdistribusi
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1 sm:gap-1.5 z-20">
          <span className={`text-[8.5px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-xs ${
            isOutOfStock
              ? 'bg-rose-600 text-white'
              : isFree
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-[#D4A843] text-slate-950'
          }`}>
            {isOutOfStock ? 'HABIS' : isFree ? 'DONASI' : 'SALE'}
          </span>
          <span className={`text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg backdrop-blur-xs ${
            isOutOfStock
              ? 'bg-rose-950/90 text-rose-200 border border-rose-400/30'
              : 'bg-slate-950/80 text-white'
          }`}>
            {quantityStr}
          </span>
          {/* Synchronized BPOM Safety & Deadline Badge */}
          {!isOutOfStock && (
            <span
              className={`text-[8.5px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg backdrop-blur-xs flex items-center gap-0.5 sm:gap-1 ${
                isBpomUrgent
                  ? 'bg-rose-600/95 text-white border border-rose-400/50 shadow-xs'
                  : 'bg-emerald-900/90 text-emerald-200 border border-emerald-400/30'
              }`}
              title={`Standar Keamanan Pangan BPOM: Batas konsumsi s/d ${deadlineInfo.timeFormatted} WIB (${deadlineInfo.countdownLabel}). Mutu terjaga.`}
            >
              {isBpomUrgent ? (
                <>
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                  <span>BPOM Urgen • {deadlineInfo.countdownLabel}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                  <span>BPOM Aman • s/d {deadlineInfo.timeFormatted}</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Distance Badge */}
        {props.distance && (
          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-[8.5px] sm:text-[10px] bg-slate-900/80 text-amber-300 font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-0.5 sm:gap-1 z-20">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
            <span>{props.distance}</span>
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] sm:text-[11px] font-semibold text-slate-500 truncate">
              {providerName}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[8.5px] font-black shrink-0" title="Mitra Terverifikasi Replate">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
                Verified
              </span>
            )}
          </div>
          
          <h4 className={`font-extrabold text-xs sm:text-base line-clamp-1 leading-snug transition-colors ${
            isOutOfStock ? 'text-slate-500 line-through' : 'text-[#1B3A5C] group-hover:text-blue-900'
          }`}>
            {title}
          </h4>

          {/* Prominent Pickup Deadline Banner (Feedback 1: Batas waktu ambil tampil di setiap card produk) */}
          <div className={`p-1.5 rounded-lg border flex items-center justify-between gap-1 text-[9.5px] sm:text-[11px] font-bold ${
            isOutOfStock
              ? 'bg-slate-100 border-slate-200 text-slate-400'
              : deadlineInfo.isUrgent
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-1 truncate">
              <Clock className={`w-3 h-3 shrink-0 ${
                isOutOfStock ? 'text-slate-400' : deadlineInfo.isUrgent ? 'text-amber-600 animate-spin-slow' : 'text-emerald-700'
              }`} />
              <span className="truncate">
                {isOutOfStock
                  ? 'Habis terdistribusi'
                  : `Batas Ambil: s/d ${deadlineInfo.timeFormatted} WIB`}
              </span>
            </div>
            {!isOutOfStock && (
              <span className={`px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-black shrink-0 ${
                deadlineInfo.isUrgent ? 'bg-amber-200 text-amber-950' : 'bg-emerald-200 text-emerald-900'
              }`}>
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
          className="w-full py-1 sm:py-1.5 bg-slate-50 hover:bg-slate-100 text-[#1B3A5C] font-extrabold text-[10px] sm:text-[11px] rounded-lg sm:rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Detail & GPS</span>
          <span>→</span>
        </button>

        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div>
            <span className={`text-xs sm:text-base font-black block leading-tight ${
              isOutOfStock ? 'text-slate-400 line-through' : 'text-[#1B3A5C]'
            }`}>
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
                className={`w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-1.5 font-black text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                }`}
              >
                <span>{isOutOfStock ? 'Restock / Kelola' : 'Kelola'}</span>
              </button>
            </div>
          ) : isOutOfStock ? (
            /* Disabled button for consumers / beneficiaries when 0 portions left */
            <div className="w-full sm:w-auto">
              <button
                type="button"
                disabled
                className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-1.5 bg-slate-100 text-slate-400 font-bold text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl cursor-not-allowed border border-slate-300 flex items-center justify-center gap-1"
                title="Porsi makanan ini telah habis"
              >
                <span>Stok Habis</span>
              </button>
            </div>
          ) : (onClaim && (!props.status || props.status === 'AVAILABLE' || props.status === 'ACTIVE')) ? (
            <div className="flex gap-1 w-full sm:w-auto">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(id);
                  }}
                  className="p-1 sm:p-2 bg-slate-100 hover:bg-slate-200 text-[#1B3A5C] font-black rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                  title="Masukkan Tas Klaim"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClaim(id);
                }}
                className="flex-1 sm:flex-initial px-2 sm:px-3.5 py-1 sm:py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-black text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
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
