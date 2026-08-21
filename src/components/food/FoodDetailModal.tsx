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

  const modalFooter = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" size="sm" onClick={onClose} className="font-bold">
        Tutup
      </Button>
      {onClaim && (
        <Button
          variant="gold"
          size="sm"
          className="font-extrabold"
          onClick={() => {
            onClaim(food.id);
            onClose();
          }}
        >
          Klaim Sekarang ➔
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Makanan: ${food.foodName}`}
      size="md"
      footer={modalFooter}
    >
      <div className="space-y-4 text-xs text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <Badge variant="primary">{food.foodCategory}</Badge>
          <span className="text-base font-extrabold text-[#D4A843]">
            {isFree ? 'GRATIS / DONASI' : `Rp ${food.price?.toLocaleString('id-ID')}`}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {food.description || 'Makanan surplus layak konsumsi dari penyedia terverifikasi Replate.'}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 block font-medium">Kuantitas Tersedia:</span>
            <span className="font-extrabold text-[#1B3A5C]">{food.quantity} {food.quantityUnit}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Batas Waktu Pickup:</span>
            <span className="font-bold text-amber-700">{new Date(food.pickupDeadline).toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Penyimpanan:</span>
            <span className="font-bold text-slate-800">{food.storageCondition}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Jenis Kemasan:</span>
            <span className="font-bold text-slate-800">{food.packagingType}</span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs bg-blue-50/50 p-3 rounded-xl">
          <p className="font-bold text-[#1B3A5C]">Provider: {food.provider?.organizationName || food.provider?.name || 'Warung Bakso Pak Kumis'}</p>
          <p className="text-slate-700 font-medium">Alamat: {food.address}</p>
          {food.provider?.phone && <p className="text-slate-700 font-medium">Kontak HP: {food.provider.phone}</p>}
        </div>
      </div>
    </Modal>
  );
};
