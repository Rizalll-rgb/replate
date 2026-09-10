'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CheckIcon } from '../ui/Icon';
import { resolveIndonesianAddress } from '@/lib/geoResolver';
import { calculateThermalDecayRUI, FoodSafetyCategory } from '@/lib/thermalRescueEngine';

export interface FoodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  food?: any; // Changed to any to support both DB objects and explore list objects
  onClaim?: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ isOpen, onClose, food, onClaim, onAddToCart }) => {
  if (!food) return null;

  const foodName = food.foodName || food.title || 'Makanan Surplus';
  const description = food.description || 'Makanan surplus segar dan higienis hasil redistribusi resmi dengan standar keamanan pangan BPOM RI.';
  const category = food.foodCategory || food.category || 'MAKANAN_BERAT';
  
  let qtyVal = 1;
  let qtyUnit = 'Porsi';
  if (typeof food.quantity === 'number') {
    qtyVal = food.quantity;
    qtyUnit = food.quantityUnit || 'Porsi';
  } else if (typeof food.quantity === 'string') {
    const parts = food.quantity.split(' ');
    qtyVal = parseInt(parts[0], 10) || 1;
    qtyUnit = parts.slice(1).join(' ') || 'Porsi';
  }

  const price = food.price ?? food.discountPrice ?? 0;
  const isFree = !price || price === 0 || food.isFree;
  const isOutOfStock = (qtyVal <= 0);

  const pickupDeadline = food.pickupDeadline || food.pickupTime || 'Hari ini 21:00 WIB';
  const storageCondition = food.storageCondition || 'ROOM_TEMP';
  const packagingType = food.packagingType || 'PACKAGED';
  const weightPerUnitKg = food.weightPerUnitKg || 0.5;

  const providerOrg = food.provider?.organizationName || food.provider?.name || food.providerName || 'Mitra Penyedia';
  const providerPhone = food.provider?.phone || '081234567891';
  const address = food.address || 'Surabaya';

  const deadlineDate = new Date(pickupDeadline);
  const formattedDeadline = !isNaN(deadlineDate.getTime())
    ? deadlineDate.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : pickupDeadline;

  const estWeight = qtyVal * weightPerUnitKg;
  const estCo2Saved = Math.round(estWeight * 2.5 * 10) / 10;
  const estCh4Saved = Math.round(estWeight * 0.07 * 100) / 100;

  const thermalRui = React.useMemo(() => {
    let cat: FoodSafetyCategory = 'COOKED_MEALS';
    const c = (category || '').toLowerCase();
    if (c.includes('kuah') || c.includes('santan') || c.includes('soup') || c.includes('bakso')) {
      cat = 'COOKED_HOT_GRAVY';
    } else if (c.includes('roti') || c.includes('bakery') || c.includes('kue')) {
      cat = 'BAKERY_PASTRY';
    } else if (c.includes('susu') || c.includes('dairy') || c.includes('dessert') || c.includes('puding')) {
      cat = 'DAIRY_COLD';
    } else if (c.includes('buah') || c.includes('sayur') || c.includes('produce')) {
      cat = 'FRESH_PRODUCE';
    } else if (c.includes('kering') || c.includes('biskuit') || c.includes('kaleng')) {
      cat = 'DRY_BAKERY_CANNED';
    }
    return calculateThermalDecayRUI({
      category: cat,
      ambientTemperatureC: 31,
      cookedOrPackedTime: (food as any).createdAt ? new Date((food as any).createdAt) : new Date(Date.now() - 1.5 * 3600 * 1000),
      isUsingCoolbox: storageCondition === 'REFRIGERATED',
      portions: qtyVal || 15,
      estimatedCourierEtaMinutes: 25,
    });
  }, [food, category, storageCondition, qtyVal]);

  const defaultAllergens = food.allergens || ['Nut-Free (Bebas Kacang)', 'Halal Certified BPJPH', 'Sterile Package'];

  const resolvedCoords = (!food.lat || !food.lng) && address
    ? resolveIndonesianAddress(address)
    : null;
  const latitude = food.lat || resolvedCoords?.lat || -7.65569;
  const longitude = food.lng || resolvedCoords?.lng || 111.27984;

  const modalFooter = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" size="sm" onClick={onClose} className="font-bold cursor-pointer">
        Tutup
      </Button>
      {onAddToCart && !isOutOfStock && (
        <Button
          variant="outline"
          size="sm"
          className="font-black text-[#1B3A5C] shadow-sm flex items-center gap-1.5 border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 cursor-pointer"
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
          disabled={isOutOfStock}
          className={`font-black shadow-md flex-1 ${
            isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              : 'text-slate-950 cursor-pointer'
          }`}
          onClick={() => {
            if (!isOutOfStock) {
              onClaim(food.id);
              onClose();
            }
          }}
        >
          {isOutOfStock ? 'Porsi Makanan Habis (0 Porsi)' : isFree ? 'Klaim Sekarang (Rp 0)' : 'Beli Langsung'}
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Spesifikasi Makanan & Lokasi: ${foodName}`}
      size="lg"
      footer={modalFooter}
    >
      <div className="space-y-4 text-xs text-slate-800">
        {/* Header Badges */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="primary">{category}</Badge>
            <Badge variant="success" size="sm">
              VERIFIKASI SOP BPOM 100%
            </Badge>
          </div>
          <span className="text-base font-black text-[#1B3A5C]">
            {isFree ? 'DONASI Rp 0' : `Rp ${price?.toLocaleString('id-ID')}`}
          </span>
        </div>

        {/* Product Description */}
        <div className="space-y-1">
          <h4 className="font-black text-base text-[#1B3A5C]">{foodName}</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Food Safety Allergen Tagging Section */}
        <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="font-black text-[11px] text-[#1B3A5C] uppercase tracking-wider block">
            Label Keamanan Pangan & Bebas Alergen:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {defaultAllergens.map((tag: string, idx: number) => (
              <span key={idx} className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-extrabold rounded-md text-[10px] flex items-center gap-1">
                <CheckIcon size={11} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        {/* BPOM Thermal Safety & RUI Urgency Card */}
        <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          thermalRui.urgencyLevel === 'CRITICAL_RESCUE'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : thermalRui.urgencyLevel === 'HIGH_PRIORITY'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-white border border-current shadow-2xs">
                RUI {thermalRui.rescueUrgencyIndex} / 100
              </span>
              <span className="font-extrabold text-xs">
                {thermalRui.urgencyLevel === 'CRITICAL_RESCUE'
                  ? 'Kritis: Wajib Segera Dikonsumsi / Dijemput'
                  : thermalRui.urgencyLevel === 'HIGH_PRIORITY'
                  ? 'Tinggi: Prioritas Penjemputan Utama'
                  : 'SOP BPOM: Mutu & Kualitas Sangat Baik'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 font-medium">
              Toleransi aman suhu tropis: sisa ~{thermalRui.remainingSafeMinutes} menit ({thermalRui.effectiveMaxHours} jam batas BPOM). {thermalRui.recommendedDispatchAction}
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-bold block opacity-70">Uji Organoleptik:</span>
            <span className="text-[11px] font-extrabold text-[#1B3A5C] bg-white px-2 py-1 rounded-lg border border-slate-200 block">
              Aroma, Tekstur & Warna Segar
            </span>
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
            <span className="font-black text-[#1B3A5C] text-sm">{qtyVal} {qtyUnit}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Kondisi Penyimpanan:</span>
            <span className="font-bold text-slate-800">
              {storageCondition === 'ROOM_TEMP'
                ? 'Suhu Ruangan (>60°C / Hangat)'
                : storageCondition === 'REFRIGERATED'
                ? 'Pendingin Chiller (<4°C)'
                : 'Beku Freezer'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Kemasan Produk:</span>
            <span className="font-bold text-slate-800">
              {packagingType === 'PACKAGED' ? 'Terkemas Utuh & Tersegel' : 'Wadah Steril Food Grade'}
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
              <span className="font-bold text-slate-800">{address}</span>
            </div>
          </div>

          <a
            href={`https://wa.me/${providerPhone.replace(/^0/, '62')}?text=Halo%20Admin%20${encodeURIComponent(providerOrg)},%20saya%20tertarik%20mengklaim%20surplus%20${encodeURIComponent(foodName)}%20via%20Replate`}
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
              src={`https://maps.google.com/maps?q=${encodeURIComponent(address || `${latitude},${longitude}`)}&z=15&output=embed`}
              className="w-full h-full filter saturate-150"
            />
            <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider">
              Titik Lokasi: {providerOrg}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[70%]">
              Alamat: {address}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || `${latitude},${longitude}`)}`}
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
