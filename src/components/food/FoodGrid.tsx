'use client';

import React from 'react';
import { FoodCard, FoodCardProps } from './FoodCard';

export interface FoodGridProps {
  foods: FoodCardProps[];
  onClaim?: (id: string) => void;
  onDetail?: (id: string) => void;
  onManage?: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

export const FoodGrid: React.FC<FoodGridProps> = ({ foods, onClaim, onDetail, onManage, onAddToCart }) => {
  if (!foods || foods.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#1B3A5C]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-[#1B3A5C]">Tidak Ada Surplus Makanan Aktif</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
          Saat ini belum ada daftar makanan berlebih yang aktif pada filter ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
      {foods.map((food, idx) => (
        <FoodCard key={`${food.id || 'food'}-${idx}`} {...food} onClaim={onClaim} onDetail={onDetail} onManage={onManage} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};
