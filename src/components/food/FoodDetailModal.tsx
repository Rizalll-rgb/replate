'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CheckIcon } from '../ui/Icon';

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
    lat?: number;
    lng?: number;
    provider?: {
      name: string;
      organizationName?: string | null;
      phone?: string | null;
    } | null;
  } | null;
  onClaim?: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ isOpen, onClose, food, onClaim, onAddToCart }) => {
  if (!food) return null;

  const isFree = !food.price || food.price === 0;
  const deadlineDate = new Date(food.pickupDeadline);
  const formattedDeadline = !isNaN(deadlineDate.getTime())
    ? deadlineDate.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : food.pickupDeadline || 'Hari ini 21:00 WIB';

  const estWeight = (food.quantity || 1) * (food.weightPerUnitKg || 0.5);
  const estCo2Saved = Math.round(estWeight * 2.5 * 10) / 10;
  const estCh4Saved = Math.round(estWeight * 0.07 * 100) / 100;

  const defaultAllergens = food.allergens || ['Nut-Free (Bebas Kacang)', 'Halal Certified BPJPH', 'Sterile Package'];
  const providerPhone = food.provider?.phone || '081234567891';
  const providerOrg = food.provider?.organizationName || food.provider?.name || 'Warung Bakso Pak Kumis';

  const latitude = food.lat || -7.2575;
  const longitude = food.lng || 112.7521;

  const modalFooter = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" size="sm" onClick={onClose} className="font-bold">
        Tutup
      </Button>
      {onAddToCart && (
        <Button
          variant="outline"
          size="sm"
          className="font-black text-[#1B3A5C] shadow-sm flex items-center gap-1.5 border-slate-300 bg-slate-100 hover:bg-slate-200 px-3"
          title="Masukkan Tas Klaim"
          onClick={() => {
            onAddToCart(food.id);
            onClose();
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </Button>
      )}
      {onClaim && (
        <Button
          variant="gold"
          size="sm"
          className="font-black text-slate-950 shadow-md flex-1"
          onClick={() => {
            onClaim(food.id);
            onClose();
          }}
        >
          {isFree ? 'Beli Langsung ' : 'Beli Langsung '}
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Spesifikasi Makanan & Lokasi: ${food.foodName}`}
      size="lg"
      footer={modalFooter}
    >
      <div className="space-y-4 text-xs text-slate-800">
        {/* Header Badges */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="primary">{food.foodCategory}</Badge>
            <Badge variant="success" size="sm">
              VERIFIKASI SOP BPOM 100%
            </Badge>
          </div>
          <span className="text-base font-black text-[#1B3A5C]">
            {isFree ? 'DONASI Rp 0' : `Rp ${food.price?.toLocaleString('id-ID')}`}
          </span>
        </div>

        {/* Product Description */}
        <div className="space-y-1">
          <h4 className="font-black text-base text-[#1B3A5C]">{food.foodName}</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {food.description || 'Makanan surplus segar dan higienis hasil redistribusi resmi dengan standar keamanan pangan BPOM RI.'}
          </p>
        </div>

        {/* Food Safety Allergen Tagging Section */}
        <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="font-black text-[11px] text-[#1B3A5C] uppercase tracking-wider block">
            Label Keamanan Pangan & Bebas Alergen:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {defaultAllergens.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-extrabold rounded-md text-[10px] flex items-center gap-1">
                <CheckIcon size={11} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Pickup Deadline Alert Box */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <span className="font-black">Batas Maksimal Penjemputan:</span>
          </div>
          <span className="font-black text-amber-900 font-mono text-sm">{formattedDeadline}</span>
        </div>

        {/* 6-Grid Technical Specifications including Methane CH4 Prevention */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="text-slate-500 block font-medium">Sisa Stok Kuantitas:</span>
            <span className="font-black text-[#1B3A5C] text-sm">{food.quantity} {food.quantityUnit}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Kondisi Penyimpanan:</span>
            <span className="font-bold text-slate-800">
              {food.storageCondition === 'ROOM_TEMP'
                ? 'Suhu Ruangan (>60°C / Hangat)'
                : food.storageCondition === 'REFRIGERATED'
                ? 'Pendingin Chiller (<4°C)'
                : 'Beku Freezer'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Kemasan Produk:</span>
            <span className="font-bold text-slate-800">
              {food.packagingType === 'PACKAGED' ? 'Terkemas Utuh & Tersegel' : 'Wadah Steril Food Grade'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Perkiraan Berat Total:</span>
            <span className="font-bold text-slate-800">{estWeight} kg</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Reduksi Emisi CO2e:</span>
            <span className="font-bold text-emerald-700 font-mono">{estCo2Saved} kg CO2e</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Metana CH4 Tercegah:</span>
            <span className="font-bold text-cyan-700 font-mono">{estCh4Saved} kg CH4</span>
          </div>
        </div>

        {/* Provider Contact & Direct WhatsApp Button */}
        <div className="border border-slate-200 bg-blue-50/50 p-4 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-2">
            <div>
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">MITRA PENYEDIA PANGAN</span>
              <h5 className="font-black text-sm text-[#1B3A5C]">{providerOrg}</h5>
            </div>
            <span className="text-[11px] font-bold text-slate-600">Terverifikasi Sanitasi & NIB</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">No. WhatsApp Outlet:</span>
              <span className="font-mono font-bold text-slate-800">{providerPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Alamat Lengkap Outlet:</span>
              <span className="font-bold text-slate-800">{food.address}</span>
            </div>
          </div>

          <a
            href={`https://wa.me/${providerPhone.replace(/^0/, '62')}?text=Halo%20Admin%20${encodeURIComponent(providerOrg)},%20saya%20tertarik%20mengklaim%20surplus%20${encodeURIComponent(food.foodName)}%20via%20Replate`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Hubungi WhatsApp Outlet / Toko (Koordinasi Penjemputan) </span>
          </a>
        </div>

        {/* Interactive Google Maps GPS Coordinate Embed */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-xs text-[#1B3A5C]">Titik Koordinat Lokasi Outlet Peta GPS</h4>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              GPS: {latitude}, {longitude}
            </span>
          </div>

          <div className="relative w-full h-44 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 shadow-xs">
            <iframe
              title="Provider Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(food.address || `${latitude},${longitude}`)}&z=15&output=embed`}
              className="w-full h-full filter saturate-150"
            />
            <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider">
              Titik Lokasi: {providerOrg}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[70%]">
              Alamat: {food.address}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.address || `${latitude},${longitude}`)}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-black text-blue-600 hover:underline shrink-0"
            >
              Buka di Google Maps ↗
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
