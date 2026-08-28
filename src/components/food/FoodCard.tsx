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
  isFree?: boolean;
  distance?: string;
  onClaim?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  onDetail?: (id: string) => void;
  onManage?: (id: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = (props) => {
  const {
    id,
    onClaim,
    onAddToCart,
    onDetail,
    onManage,
  } = props;

  const title = props.title || props.foodName || 'Makanan Surplus';
  const providerName = props.providerName || 'Provider Tidak Diketahui';
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
  const imageSrc = props.imageUrl || props.photoUrl || defaultPhotos[catKey] || defaultPhotos.MEALS;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <img src={imageSrc} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm ${
            isFree
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-[#D4A843] text-slate-950'
          }`}>
            {isFree ? 'DONASI Rp 0' : 'RESCUE SALE'}
          </span>
          <span className="text-[10px] bg-slate-950/80 text-white font-bold px-2 py-1 rounded-lg backdrop-blur-xs">
            {quantityStr}
          </span>
        </div>
        {props.distance && (
          <span className="absolute bottom-2 right-2 text-[10px] bg-slate-900/80 text-amber-300 font-bold px-2 py-0.5 rounded-md">
            Jarak: {props.distance}
          </span>
        )}
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block truncate">
            Toko: {providerName}
          </span>
          <h4 className="font-extrabold text-base text-[#1B3A5C] line-clamp-1">{title}</h4>
          <p className="text-[11px] text-slate-600 font-medium">
            Waktu Ambil: <strong>{pickupTimeStr}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDetail && onDetail(id)}
          className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1B3A5C] font-black text-[11px] rounded-xl border border-blue-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Lihat Detail Spesifikasi & Peta GPS ➔</span>
        </button>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-lg font-black text-[#1B3A5C] block">
              {isFree ? 'Rp 0' : `Rp ${discountPrice.toLocaleString('id-ID')}`}
            </span>
            {!isFree && originalPrice && (
              <span className="text-[11px] text-slate-400 line-through font-bold">
                Rp {originalPrice.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {onManage ? (
            <button
              type="button"
              onClick={() => onManage(id)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Kelola Stok ➔</span>
            </button>
          ) : (onClaim && (!props.status || props.status === 'AVAILABLE' || props.status === 'ACTIVE')) ? (
            <div className="flex gap-1.5">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => onAddToCart(id)}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1B3A5C] font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer border border-slate-200"
                  title="Masukkan Tas Klaim"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => onClaim(id)}
                className="px-4 py-2.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Beli Langsung ➔</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
