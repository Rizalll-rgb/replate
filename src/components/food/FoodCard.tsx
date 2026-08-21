'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface FoodCardProps {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  quantityUnit: string;
  price?: number | null;
  pickupDeadline: string;
  address: string;
  providerName?: string;
  status: string;
  distributionType: string;
  photoUrl?: string | null;
  onClaim?: (id: string) => void;
  onDetail?: (id: string) => void;
  onManage?: (id: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  id,
  foodName,
  category,
  quantity,
  quantityUnit,
  price = 0,
  pickupDeadline,
  address,
  providerName,
  status,
  photoUrl,
  onClaim,
  onDetail,
  onManage,
}) => {
  const isFree = !price || price === 0;

  const categoryBadgeVariants: Record<string, 'primary' | 'secondary' | 'gold' | 'success' | 'warning' | 'info'> = {
    MEALS: 'primary',
    BAKERY: 'gold',
    PRODUCE: 'success',
    DAIRY: 'info',
    BEVERAGES: 'secondary',
    SNACKS: 'warning',
    OTHER: 'secondary',
  };

  // Fallback high-quality food photography illustrations if no custom photo uploaded
  const defaultPhotos: Record<string, string> = {
    MEALS: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    BAKERY: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    PRODUCE: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=60',
    DAIRY: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60',
    BEVERAGES: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop&q=60',
    SNACKS: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60',
  };

  const imageSrc = photoUrl || defaultPhotos[category] || defaultPhotos.MEALS;

  const deadlineDate = new Date(pickupDeadline);
  const formattedTime = deadlineDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="flex flex-col justify-between border-slate-200 hover:border-[#1B3A5C]/40 transition-all shadow-xs overflow-hidden group">
      <div>
        {/* Food Product Photo Image Preview */}
        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
          <img
            src={imageSrc}
            alt={foodName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={categoryBadgeVariants[category] || 'primary'} size="sm">
              {category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            {isFree ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-md">
                GRATIS
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-[#1B3A5C] text-[#D4A843] font-extrabold text-xs shadow-md">
                Rp {price?.toLocaleString('id-ID')}
              </span>
            )}
          </div>
        </div>

        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-base font-extrabold text-[#1B3A5C] line-clamp-1">
            {foodName}
          </CardTitle>
          {providerName && (
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">{providerName}</p>
          )}
        </CardHeader>

        <CardBody className="space-y-2 py-2 text-xs text-slate-600">
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-500">Sisa Stok:</span>
            <span className="font-extrabold text-[#1B3A5C]">
              {quantity} {quantityUnit}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-500">Batas Pickup:</span>
            <span className="font-extrabold text-red-700">Hari ini {formattedTime}</span>
          </div>

          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">{address}</p>
        </CardBody>
      </div>

      <CardFooter className="pt-3 border-t border-slate-200 gap-2">
        <Button variant="outline" size="sm" className="w-full text-xs font-bold" onClick={() => onDetail && onDetail(id)}>
          Lihat Detail
        </Button>
        {status === 'AVAILABLE' && onClaim && (
          <Button variant="gold" size="sm" className="w-full text-xs font-bold" onClick={() => onClaim(id)}>
            {isFree ? 'Klaim Rescue' : 'Beli Sale'}
          </Button>
        )}
        {onManage && (
          <Button variant="primary" size="sm" className="w-full text-xs font-bold" onClick={() => onManage(id)}>
            Kelola Stok
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
