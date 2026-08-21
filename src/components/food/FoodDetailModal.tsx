'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface FoodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  food?: {
    id: string;
    foodName: string;
    description?: string | null;
    foodCategory: string;
    quantity: number;
    quantityUnit: string;
    price?: number | null;
    pickupDeadline: string;
    address: string;
    storageCondition: string;
    packagingType: string;
    provider?: {
      name: string;
      organizationName?: string | null;
      phone?: string | null;
    } | null;
  } | null;
  onClaim?: (id: string) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ isOpen, onClose, food, onClaim }) => {
  if (!food) return null;

  const isFree = !food.price || food.price === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detail: ${food.foodName}`} size="lg">
      <div className="space-y-4 text-sm text-[#212529]">
        <div className="flex items-center justify-between border-b pb-3">
          <Badge variant="primary">{food.foodCategory}</Badge>
          <span className="text-base font-extrabold text-[#D4A843]">
            {isFree ? 'GRATIS' : `Rp ${food.price?.toLocaleString('id-ID')}`}
          </span>
        </div>

        <p className="text-xs text-[#495057] leading-relaxed">
          {food.description || 'Makanan surplus layak konsumsi dari penyedia terpilih Replate.'}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8F9FA] p-3 rounded-xl">
          <div>
            <span className="text-[#6C757D] block">Kuantitas Tersedia:</span>
            <span className="font-bold">{food.quantity} {food.quantityUnit}</span>
          </div>
          <div>
            <span className="text-[#6C757D] block">Batas Pickup:</span>
            <span className="font-bold text-[#C0392B]">{new Date(food.pickupDeadline).toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span className="text-[#6C757D] block">Penyimpanan:</span>
            <span className="font-bold">{food.storageCondition}</span>
          </div>
          <div>
            <span className="text-[#6C757D] block">Kemasan:</span>
            <span className="font-bold">{food.packagingType}</span>
          </div>
        </div>

        <div className="border-t pt-3 space-y-1 text-xs">
          <p className="font-bold text-[#1B3A5C]">🏪 Provider: {food.provider?.organizationName || food.provider?.name || 'Penyedia Replate'}</p>
          <p className="text-[#495057]">📍 Alamat: {food.address}</p>
          {food.provider?.phone && <p className="text-[#495057]">📞 Kontak: {food.provider.phone}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
          {onClaim && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => {
                onClaim(food.id);
                onClose();
              }}
            >
              Klaim Sekarang
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
