'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';

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
  
  let quantityStr = '1 Porsi';
  if (typeof props.quantity === 'string') {
    quantityStr = props.quantity;
  } else if (typeof props.quantity === 'number') {
    quantityStr = `${props.quantity} ${props.quantityUnit || 'Porsi'}`;
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
      className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-2xs sm:shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group ${onDetail ? 'cursor-pointer' : ''}`}
      onClick={() => onDetail && onDetail(id)}
    >
      <div className="relative aspect-square sm:aspect-video bg-slate-100 overflow-hidden">
        <img src={imageSrc} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1">
          <span className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-xs ${
            isFree
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-[#D4A843] text-slate-950'
          }`}>
            {isFree ? 'DONASI' : 'SALE'}
          </span>
          <span className="text-[9px] sm:text-[10px] bg-slate-950/80 text-white font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-xs">
            {quantityStr}
          </span>
        </div>
        {props.distance && (
          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-[9px] sm:text-[10px] bg-slate-900/80 text-amber-300 font-bold px-1.5 sm:px-2 py-0.5 rounded">
            {props.distance}
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block truncate">
            {providerName}
          </span>
          <h4 className="font-extrabold text-xs sm:text-base text-[#1B3A5C] line-clamp-1 sm:line-clamp-2 leading-snug">{title}</h4>
          <p className="text-[9.5px] sm:text-[11px] text-slate-500 font-medium truncate">
            ⏰ {pickupTimeStr}
          </p>
        </div>

        {/* Desktop only secondary link */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDetail && onDetail(id);
          }}
          className="hidden sm:flex w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1B3A5C] font-black text-[11px] rounded-xl border border-blue-200 items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Lihat Detail & Peta GPS ➔</span>
        </button>

        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <span className="text-xs sm:text-lg font-black text-[#1B3A5C] block">
              {isFree ? 'Rp 0' : `Rp ${discountPrice.toLocaleString('id-ID')}`}
            </span>
            {!isFree && originalPrice && (
              <span className="text-[9.5px] sm:text-[11px] text-slate-400 line-through font-bold block sm:inline">
                Rp {originalPrice.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {onManage ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onManage(id);
              }}
              className="w-full sm:w-auto px-2 sm:px-4 py-1.5 sm:py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Kelola ➔</span>
            </button>
          ) : (onClaim && (!props.status || props.status === 'AVAILABLE' || props.status === 'ACTIVE')) ? (
            <div className="flex gap-1 w-full sm:w-auto">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(id);
                  }}
                  className="p-1.5 sm:px-3 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1B3A5C] font-black text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
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
                className="flex-1 sm:flex-initial px-2 sm:px-4 py-1.5 sm:py-2.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-black text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Beli ➔</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
