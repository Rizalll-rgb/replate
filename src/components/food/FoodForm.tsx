'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { RescueReadinessForm, RescueReadinessChecklist } from './RescueReadinessForm';

export interface FoodFormData {
  foodName: string;
  description: string;
  foodCategory: string;
  quantity: number;
  quantityUnit: string;
  pickupDeadline: string;
  storageCondition: string;
  packagingType: string;
  distributionType: string;
  price: number;
  weightPerUnitKg: number;
  address: string;
  latitude: number;
  longitude: number;
  photos?: string[];
  rescueReadiness: RescueReadinessChecklist;
}

export interface FoodFormProps {
  onSubmit: (data: FoodFormData) => Promise<void>;
  isLoading?: boolean;
}

export const FoodForm: React.FC<FoodFormProps> = ({ onSubmit, isLoading = false }) => {
  const defaultAddress = 'Jl. Genteng Kali No. 45, Genteng, Surabaya';
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  );

  const [formData, setFormData] = useState<Partial<FoodFormData>>({
    foodCategory: 'MEALS',
    quantityUnit: 'porsi',
    storageCondition: 'ROOM_TEMP',
    packagingType: 'PACKAGED',
    distributionType: 'BOTH',
    price: 0,
    weightPerUnitKg: 0.5,
    address: defaultAddress,
    latitude: -7.2575,
    longitude: 112.7521,
    pickupDeadline: new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16),
  });

  const [checklistReady, setChecklistReady] = useState<boolean>(true);
  const [checklistData, setChecklistData] = useState<RescueReadinessChecklist>({
    infoComplete: true,
    notExpired: true,
    storageProper: true,
    packagingIntact: true,
    noSpoilage: true,
    photoClear: true,
    pickupRealistic: true,
    locationAccurate: true,
  });

  // Quick Preset Date Time Handler
  const handleQuickPresetTime = (hoursFromNow: number, setFixedHour?: number) => {
    const target = new Date();
    if (setFixedHour !== undefined) {
      target.setHours(setFixedHour, 0, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
    } else {
      target.setTime(target.getTime() + hoursFromNow * 3600000);
    }
    const formattedStr = target.toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, pickupDeadline: formattedStr }));
  };

  const handlePhotoUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file melebihi batas 5MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistReady) {
      alert('Mohon lengkapi seluruh kriteria SOP BPOM Rescue Readiness (100%) sebelum publikasi!');
      return;
    }
    if (!formData.foodName || !formData.quantity || !formData.pickupDeadline) {
      alert('Mohon isi nama makanan, kuantitas porsi, dan batas waktu penjemputan!');
      return;
    }

    await onSubmit({
      foodName: formData.foodName || '',
      description: formData.description || '',
      foodCategory: formData.foodCategory || 'MEALS',
      quantity: Number(formData.quantity),
      quantityUnit: formData.quantityUnit || 'porsi',
      pickupDeadline: formData.pickupDeadline || new Date(Date.now() + 4 * 3600000).toISOString(),
      storageCondition: formData.storageCondition || 'ROOM_TEMP',
      packagingType: formData.packagingType || 'PACKAGED',
      distributionType: formData.distributionType || 'BOTH',
      price: Number(formData.price || 0),
      weightPerUnitKg: Number(formData.weightPerUnitKg || 0.5),
      address: useDefaultAddress ? defaultAddress : formData.address || defaultAddress,
      latitude: formData.latitude || -7.2575,
      longitude: formData.longitude || 112.7521,
      photos: previewPhoto ? [previewPhoto] : [],
      rescueReadiness: checklistData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
      {/* Photo Upload Section with Hint Ratio & Preview (Poin 3) */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-[#1B3A5C] block">
          Upload Foto Produk Surplus Makanan
        </label>
        <div className="border-2 border-dashed border-slate-300 hover:border-[#1B3A5C] rounded-2xl p-5 bg-slate-50 transition-colors text-center relative overflow-hidden">
          {previewPhoto ? (
            <div className="relative max-w-sm mx-auto group">
              <img
                src={previewPhoto}
                alt="Preview Produk"
                className="w-full h-44 object-cover rounded-xl shadow-xs border border-slate-200"
              />
              <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-bold text-xs cursor-pointer">
                📷 Ganti Foto Produk
                <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoUploadMock} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-[#D4A843] flex items-center justify-center text-2xl">
                📸
              </div>
              <p className="text-xs font-bold text-[#1B3A5C]">Klik atau Drag & Drop foto produk di sini</p>
              <p className="text-[11px] text-slate-500 font-medium">
                💡 Hint: Disarankan rasio <strong className="text-slate-700">16:9 atau 4:3</strong>, maksimal ukuran file <strong className="text-slate-700">5 MB</strong> (JPG/PNG). Foto jernih meningkatkan klaim hingga 80%.
              </p>
              <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoUploadMock} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Main Product Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nama Makanan Surplus"
          placeholder="Contoh: Bakso Sapi Komplit / Roti Tawar Gandum"
          value={formData.foodName || ''}
          onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#343A40]">Kategori Makanan</label>
          <select
            className="w-full rounded-lg border border-[#DEE2E6] text-sm px-3.5 py-2 bg-white focus:border-[#1B3A5C] focus:outline-none"
            value={formData.foodCategory}
            onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
          >
            <option value="MEALS">Makanan Olahan (Meals)</option>
            <option value="BAKERY">Roti & Pastry (Bakery)</option>
            <option value="PRODUCE">Buah & Sayur (Produce)</option>
            <option value="DAIRY">Susu & Olahan (Dairy)</option>
            <option value="BEVERAGES">Minuman (Beverages)</option>
            <option value="SNACKS">Camilan (Snacks)</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>

        <Input
          label="Jumlah Kuantitas"
          type="number"
          placeholder="15"
          value={formData.quantity || ''}
          onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
          required
        />

        <Input
          label="Satuan Kuantitas"
          placeholder="porsi / pcs / kotak / kg"
          value={formData.quantityUnit || ''}
          onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
        />
      </div>

      {/* Custom Authentic Date & Time Picker with Preset Chips (Poin 4) */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#1B3A5C]">
            ⏱️ Batas Waktu Penjemputan (Pickup Deadline)
          </label>
          <span className="text-[11px] text-slate-500 font-medium">Pilih preset cepat atau tentukan tanggal & jam</span>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickPresetTime(2)}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition-colors shadow-xs"
          >
            ⚡ 2 Jam Lagi
          </button>
          <button
            type="button"
            onClick={() => handleQuickPresetTime(4)}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition-colors shadow-xs"
          >
            🔥 4 Jam Lagi
          </button>
          <button
            type="button"
            onClick={() => handleQuickPresetTime(0, 21)}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-lg transition-colors shadow-xs"
          >
            🌙 Malam Ini 21.00 WIB
          </button>
          <button
            type="button"
            onClick={() => handleQuickPresetTime(0, 8)}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg transition-colors shadow-xs"
          >
            ☀️ Besok Pagi 08.00 WIB
          </button>
        </div>

        <Input
          type="datetime-local"
          value={formData.pickupDeadline || ''}
          onChange={(e) => setFormData({ ...formData, pickupDeadline: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Estimasi Berat per Unit (Kg)"
          type="number"
          step="0.05"
          placeholder="0.5"
          value={formData.weightPerUnitKg || 0.5}
          onChange={(e) => setFormData({ ...formData, weightPerUnitKg: Number(e.target.value) })}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#343A40]">Kondisi Penyimpanan</label>
          <select
            className="w-full rounded-lg border border-[#DEE2E6] text-sm px-3.5 py-2 bg-white focus:border-[#1B3A5C] focus:outline-none"
            value={formData.storageCondition}
            onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
          >
            <option value="ROOM_TEMP">Suhu Ruangan</option>
            <option value="REFRIGERATED">Pendingin (Kulkas)</option>
            <option value="FROZEN">Beku (Freezer)</option>
          </select>
        </div>
      </div>

      {/* Auto-Fill Address Toggle (Poin 5) */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#1B3A5C]">📍 Alamat Penjemputan Makanan</label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={useDefaultAddress}
              onChange={(e) => setUseDefaultAddress(e.target.checked)}
              className="rounded border-slate-300 text-[#1B3A5C] focus:ring-0"
            />
            <span>Gunakan Alamat Toko Saya ({defaultAddress})</span>
          </label>
        </div>

        {!useDefaultAddress && (
          <Input
            placeholder="Masukkan alamat lokasi penjemputan alternatif..."
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#343A40]">Deskripsi Makanan & Catatan Kemasan</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-[#DEE2E6] text-sm p-3 bg-white focus:border-[#1B3A5C] focus:outline-none"
          placeholder="Jelaskan kondisi makanan, rekomendasi wadah, atau catatan penjemputan..."
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Hybrid BPOM SOP Readiness Checklist (Poin 6) */}
      <RescueReadinessForm
        onChange={(checkData, isComplete) => {
          setChecklistData(checkData);
          setChecklistReady(isComplete);
        }}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="gold" size="lg" isLoading={isLoading} disabled={!checklistReady} className="font-extrabold shadow-md">
          🚀 Publikasikan Surplus & Trigger Smart Matching
        </Button>
      </div>
    </form>
  );
};
