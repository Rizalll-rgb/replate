'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Clock } from 'lucide-react';

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
  pickupDeadline?: string;
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
  } = props;

  const title = props.title || props.foodName || 'Makanan Surplus';
  const providerName =
    props.providerName ||
    (props as any).provider?.name ||
    (props as any).provider?.organizationName ||
    (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}').entityName || JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}').name) : null) ||
    'Warung Bakso Pak Kumis';
  const category = props.category || props.foodCategory || 'MEALS';
  
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

  let pickupTimeStr = props.pickupTime || 'Hari ini';
  if (!props.pickupTime && props.pickupDeadline) {
    try {
      const deadlineDate = new Date(props.pickupDeadline);
      if (!isNaN(deadlineDate.getTime())) {
        pickupTimeStr = `Hari ini ${deadlineDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
      }
    } catch (_) {}
  }

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
          : 'border-slate-200 hover:border-[#1B3A5C]/40'
      } ${onDetail ? 'cursor-pointer' : ''}`}
      onClick={() => onDetail && onDetail(id)}
    >
      <div className="relative h-28 sm:h-44 w-full bg-slate-100 overflow-hidden">
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
        </div>
        {props.distance && (
          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-[8.5px] sm:text-[10px] bg-slate-900/80 text-amber-300 font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-0.5 sm:gap-1 z-20">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
            <span>{props.distance}</span>
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[9.5px] sm:text-[11px] font-semibold text-slate-500 block truncate">
            {providerName}
          </span>
          <h4 className={`font-extrabold text-xs sm:text-base line-clamp-1 leading-snug transition-colors ${
            isOutOfStock ? 'text-slate-500 line-through' : 'text-[#1B3A5C] group-hover:text-blue-900'
          }`}>
            {title}
          </h4>
          <p className="text-[9.5px] sm:text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
            <span>{isOutOfStock ? 'Porsi telah habis terbagi' : pickupTimeStr}</span>
          </p>
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
