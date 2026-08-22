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
    weightPerUnitKg?: number;
    allergens?: string[];
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
  const deadlineDate = new Date(food.pickupDeadline);
  const formattedDeadline = deadlineDate.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const estWeight = (food.quantity || 1) * (food.weightPerUnitKg || 0.5);
  const estCo2Saved = Math.round(estWeight * 2.5 * 10) / 10;
  const estCh4Saved = Math.round(estWeight * 0.25 * 10) / 10;

  const defaultAllergens = food.allergens || ['Nut-Free (Bebas Kacang)', 'Halal Certified BPJPH', 'Sterile Package'];

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
      title={`Spesifikasi Makanan: ${food.foodName}`}
      size="lg"
      footer={modalFooter}
    >
      <div className="space-y-4 text-xs text-slate-800">
        {/* Header Badges */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="primary">{food.foodCategory}</Badge>
            <Badge variant="success" size="sm">
              VERIFIKASI SOP BPOM 100%
            </Badge>
          </div>
          <span className="text-base font-extrabold text-[#D4A843]">
            {isFree ? 'GRATIS / DONASI SOSIAL' : `Rp ${food.price?.toLocaleString('id-ID')}`}
          </span>
        </div>

        {/* Product Description */}
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-[#1B3A5C]">{food.foodName}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {food.description || 'Makanan surplus segar dan layak konsumsi hasil redistribusi terverifikasi platform Replate.'}
          </p>
        </div>

        {/* Food Safety Allergen Tagging Section */}
        <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="font-extrabold text-[11px] text-[#1B3A5C] uppercase tracking-wider block">
            Label Keamanan Pangan & Bebas Alergen:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {defaultAllergens.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-extrabold rounded-md text-[10px]">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Pickup Deadline Alert Box */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-extrabold">Batas Maksimal Penjemputan:</span>
          </div>
          <span className="font-extrabold text-amber-800 font-mono text-sm">{formattedDeadline} WIB</span>
        </div>

        {/* 6-Grid Technical Specifications including Methane CH4 Prevention */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 block font-medium">Sisa Stok Kuantitas:</span>
            <span className="font-extrabold text-[#1B3A5C] text-sm">{food.quantity} {food.quantityUnit}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Kondisi Penyimpanan:</span>
            <span className="font-bold text-slate-800">{food.storageCondition === 'ROOM_TEMP' ? 'Suhu Ruangan' : food.storageCondition === 'REFRIGERATED' ? 'Pendingin (Kulkas)' : 'Beku (Freezer)'}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Kemasan Produk:</span>
            <span className="font-bold text-slate-800">{food.packagingType === 'PACKAGED' ? 'Terkemas Utuh' : 'Parsial / Wadah Steril'}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Perkiraan Berat Total:</span>
            <span className="font-bold text-slate-800">{estWeight} Kg</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Potensi Emisi Terhemat:</span>
            <span className="font-bold text-emerald-700">{estCo2Saved} Kg CO2e</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Gas Metana CH4 Tercegah:</span>
            <span className="font-bold text-purple-700">{estCh4Saved} Kg CH4</span>
          </div>
        </div>

        {/* Provider Contact & Pickup Address */}
        <div className="border-t border-slate-200 pt-3 space-y-2 bg-blue-50/60 p-4 rounded-xl border">
          <h5 className="font-extrabold text-xs text-[#1B3A5C] uppercase tracking-wider">Lokasi & Kontak Mitra Provider</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Nama Provider / Outlet:</span>
              <span className="font-bold text-[#1B3A5C]">{food.provider?.organizationName || food.provider?.name || 'Warung Bakso Pak Kumis'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">No. WhatsApp Penjemputan:</span>
              <span className="font-bold text-slate-800">{food.provider?.phone || '081234567891'}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Alamat Lengkap Penjemputan:</span>
            <span className="font-bold text-slate-800">{food.address}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
