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
  pricingScheme: 'RESCUE_SALE' | 'DONATION_YAYASAN' | 'DONATION_INDIVIDUAL';
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

  const [pricingScheme, setPricingScheme] = useState<'RESCUE_SALE' | 'DONATION_YAYASAN' | 'DONATION_INDIVIDUAL'>('RESCUE_SALE');
  const [deliveryMethod, setDeliveryMethod] = useState<'SELF_PICKUP' | 'RESCUE_PARTNER'>('SELF_PICKUP');
  const [allowSelfPickup, setAllowSelfPickup] = useState<boolean>(true);
  const [allowRescueCourier, setAllowRescueCourier] = useState<boolean>(true);
  const [allowDirectFleet, setAllowDirectFleet] = useState<boolean>(true);

  React.useEffect(() => {
    try {
      const savedCanDeliver = localStorage.getItem('replate_provider_can_deliver_direct');
      const savedFleetStatus = localStorage.getItem('replate_provider_fleet_status');
      const savedFleetList = localStorage.getItem('replate_provider_fleet_list');
      let hasApprovedVehicle = false;
      if (savedFleetList) {
        const parsed = JSON.parse(savedFleetList);
        if (Array.isArray(parsed)) {
          hasApprovedVehicle = parsed.some((flt: any) => flt.status === 'APPROVED');
        }
      }

      // Default true for verified provider accounts (Pak Kumis - Driver Mas Doni L 4582 ABC)
      const isEnabled =
        savedCanDeliver !== 'false' ||
        savedFleetStatus === 'APPROVED' ||
        hasApprovedVehicle ||
        savedCanDeliver === null;

      if (isEnabled && savedCanDeliver !== 'true') {
        localStorage.setItem('replate_provider_can_deliver_direct', 'true');
        localStorage.setItem('replate_provider_fleet_status', 'APPROVED');
      }

      setAllowDirectFleet(isEnabled);
    } catch (_) {
      setAllowDirectFleet(true);
    }
  }, []);

  // Helper to format local Date into YYYY-MM-DDTHH:mm input string
  const formatLocalDateTime = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${date}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<Partial<FoodFormData>>({
    foodCategory: 'MEALS',
    quantityUnit: 'porsi',
    quantity: 15,
    storageCondition: 'ROOM_TEMP',
    packagingType: 'PACKAGED',
    distributionType: 'SALE',
    price: 5000,
    weightPerUnitKg: 0.5,
    address: defaultAddress,
    latitude: -7.2575,
    longitude: 112.7521,
    pickupDeadline: formatLocalDateTime(new Date(Date.now() + 4 * 3600000)),
  });

  // Quick Preset Date Time Handler (Local Timezone Corrected)
  const handleQuickPresetTime = (hoursFromNow: number, setFixedHour?: number) => {
    const target = new Date();
    if (setFixedHour !== undefined) {
      target.setHours(setFixedHour, 0, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
    } else {
      target.setHours(target.getHours() + hoursFromNow);
    }
    setFormData((prev) => ({ ...prev, pickupDeadline: formatLocalDateTime(target) }));
  };

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

  // Custom Select Dropdown CSS Class
  const customSelectClass =
    "w-full rounded-xl border border-slate-300 text-xs sm:text-sm px-4 py-2.5 bg-white text-[#1B3A5C] font-bold focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/20 focus:outline-none shadow-xs appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231B3A5C%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem_1.25rem] pr-10 hover:border-[#1B3A5C] transition-all";

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

  const handlePricingSchemeChange = (scheme: 'RESCUE_SALE' | 'DONATION_YAYASAN' | 'DONATION_INDIVIDUAL') => {
    setPricingScheme(scheme);
    if (scheme === 'DONATION_YAYASAN' || scheme === 'DONATION_INDIVIDUAL') {
      setFormData((prev) => ({ ...prev, price: 0, distributionType: 'FREE' }));
    } else {
      setFormData((prev) => ({ ...prev, price: 5000, distributionType: 'SALE' }));
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

    const finalDistributionType: 'SALE' | 'FREE' =
      pricingScheme === 'RESCUE_SALE' ? 'SALE' : 'FREE';

    const payload: FoodFormData = {
      foodName: formData.foodName || '',
      description: formData.description || '',
      foodCategory: formData.foodCategory || 'MEALS',
      quantity: Number(formData.quantity),
      quantityUnit: formData.quantityUnit || 'porsi',
      pickupDeadline: formData.pickupDeadline || new Date(Date.now() + 4 * 3600000).toISOString(),
      storageCondition: formData.storageCondition || 'ROOM_TEMP',
      packagingType: formData.packagingType || 'PACKAGED',
      distributionType: finalDistributionType,
      pricingScheme,
      price: pricingScheme === 'RESCUE_SALE' ? Number(formData.price || 5000) : 0,
      weightPerUnitKg: Number(formData.weightPerUnitKg || 0.5),
      address: useDefaultAddress ? defaultAddress : formData.address || defaultAddress,
      latitude: formData.latitude || -7.2575,
      longitude: formData.longitude || 112.7521,
      photos: previewPhoto ? [previewPhoto] : [],
      rescueReadiness: checklistData,
    };

    // Store in localStorage cache so newly added items show in My Listings immediately
    try {
      const existing = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      const newItem = {
        id: `SRP-LOCAL-${Date.now()}`,
        ...payload,
        remainingQuantity: payload.quantity,
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        provider: { name: 'Warung Bakso Pak Kumis', organizationName: 'Warung Bakso Pak Kumis' },
      };
      localStorage.setItem('replate_local_surplus', JSON.stringify([newItem, ...existing]));
    } catch (_) {}

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
      {/* Skema Distribusi & Logika Harga */}
      <div className="p-5 bg-[#1B3A5C]/5 border border-[#1B3A5C]/20 rounded-2xl space-y-3">
        <label className="text-xs font-extrabold text-[#1B3A5C] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Pilih Skema Distribusi & Penyelamatan Makanan</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Option 1: Rescue Sale */}
          <div
            onClick={() => handlePricingSchemeChange('RESCUE_SALE')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              pricingScheme === 'RESCUE_SALE'
                ? 'bg-amber-50 border-[#D4A843] shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="font-extrabold text-slate-900 block text-xs">Rescue Sale (Diskon)</span>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Dijual murah di bawah harga normal untuk masyarakat umum & anak kos.
            </p>
          </div>

          {/* Option 2: Donasi Skala Besar Yayasan */}
          <div
            onClick={() => handlePricingSchemeChange('DONATION_YAYASAN')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              pricingScheme === 'DONATION_YAYASAN'
                ? 'bg-blue-50 border-[#1B3A5C] shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="font-extrabold text-slate-900 block text-xs">Donasi Yayasan / Panti</span>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Gratis 100% (Porsi Besar). Otomatis masuk Smart Matching Panti Surabaya.
            </p>
          </div>

          {/* Option 3: Donasi Skala Kecil Individu */}
          <div
            onClick={() => handlePricingSchemeChange('DONATION_INDIVIDUAL')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              pricingScheme === 'DONATION_INDIVIDUAL'
                ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="font-extrabold text-slate-900 block text-xs">Donasi Gratis Individu</span>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Gratis 100% (Porsi Sedikit). Untuk warga / individu yang membutuhkan.
            </p>
          </div>
        </div>
      </div>

      {/* Photo Upload Section */}
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
                Ganti Foto Produk
                <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoUploadMock} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer space-y-2 block">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-[#D4A843] flex items-center justify-center text-xl font-bold">
                +
              </div>
              <p className="text-xs font-bold text-[#1B3A5C]">Klik atau Drag & Drop foto produk di sini</p>
              <p className="text-[11px] text-slate-500 font-medium">
                Hint: Disarankan rasio <strong className="text-slate-700">16:9 atau 4:3</strong>, maksimal ukuran file <strong className="text-slate-700">5 MB</strong> (JPG/PNG).
              </p>
              <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoUploadMock} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Main Product Info Fields with Custom Styled Dropdowns (Poin 2) */}
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
            className={customSelectClass}
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
          label="Jumlah Kuantitas Porsi"
          type="number"
          placeholder="15"
          value={formData.quantity || ''}
          onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
          required
        />

        {pricingScheme === 'RESCUE_SALE' ? (
          <div className="space-y-2">
            <Input
              label="Harga Diskon Surplus (Rp per Unit)"
              type="number"
              placeholder="5000"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
            {/* Breakdown Transparansi Alokasi Infaq 5% (Sesuai Brainstorming Poin 7) */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-950">
              <div className="flex justify-between items-center font-black">
                <span>Alokasi Auto-Infaq Kemanusiaan (5%):</span>
                <span className="text-amber-950 font-mono">Rp {((formData.price || 0) * 0.05).toLocaleString('id-ID')} / porsi</span>
              </div>
              <p className="text-[11px] font-medium text-amber-800 leading-snug">
                *Otomatis dialokasikan ke Kas Dana Kemanusiaan Replate untuk mendanai boks steril & subsidi bensin kurir relawan Panti Asuhan. Pendapatan bersih toko: <strong>Rp {((formData.price || 0) * 0.95).toLocaleString('id-ID')}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Harga Penyelamatan</label>
            <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs sm:text-sm rounded-xl">
              GRATIS (Rp 0 - Skema Donasi Sosial Panti/Rentan)
            </div>
          </div>
        )}
      </div>

      {/* Logistik & Pilihan Opsi Pengiriman Outlet (Poin 2: Global Outlet Setup - Tanpa Bolak-Balik) */}
      <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-2">
          <div>
            <label className="text-xs font-extrabold text-[#1B3A5C] flex items-center gap-1.5">
              <span>🚚 Opsi Pengiriman Didukung Outlet Ini (Pengaturan Global Toko)</span>
              <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">AUTOMATIC GLOBAL</span>
            </label>
            <p className="text-[11px] text-slate-600 font-medium">
              Metode pengiriman mengikuti konfigurasi terpusat toko Anda di Modul Pengaturan.
            </p>
          </div>
          <a
            href="/dashboard/provider/settings"
            className="px-3 py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-extrabold text-[11px] rounded-xl transition-all shrink-0 shadow-xs flex items-center gap-1"
          >
            <span>Ubah di Pengaturan Toko ⚙️</span>
          </a>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="px-3 py-1 bg-white border border-slate-300 font-extrabold text-slate-800 rounded-lg shadow-2xs">
            🏬 Ambil Mandiri (Self Pickup)
          </span>
          <span className="px-3 py-1 bg-white border border-slate-300 font-extrabold text-slate-800 rounded-lg shadow-2xs">
            🛵 Kurir Relawan Replate
          </span>
          <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 font-extrabold text-emerald-900 rounded-lg shadow-2xs">
            🚚 Armada Toko Direct (Mas Doni - L 4582 ABC) ✓ TERVERIFIKASI
          </span>
        </div>
      </div>

      {/* Custom Date & Time Picker */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#1B3A5C]">
            Batas Waktu Penjemputan (Pickup Deadline)
          </label>
          <span className="text-[11px] text-slate-500 font-medium">Pilih preset cepat atau tentukan tanggal & jam</span>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickPresetTime(2)}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition-colors"
          >
            2 Jam Lagi
          </button>
          <button
            type="button"
            onClick={() => handleQuickPresetTime(4)}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition-colors"
          >
            4 Jam Lagi
          </button>
          <button
            type="button"
            onClick={() => handleQuickPresetTime(0, 21)}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-lg transition-colors"
          >
            Malam Ini 21.00 WIB
          </button>
          <button
            type="button"
            onClick={() => handleQuickPresetTime(0, 8)}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg transition-colors"
          >
            Besok Pagi 08.00 WIB
          </button>
        </div>

        <Input
          type="datetime-local"
          value={formData.pickupDeadline || ''}
          onChange={(e) => setFormData({ ...formData, pickupDeadline: e.target.value })}
          required
        />
      </div>

      {/* Logistik & Penyimpanan Dropdowns (Poin 2 - Custom Styled Select) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#343A40]">Metode Penjemputan / Logistik</label>
          <select
            className={customSelectClass}
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value as 'SELF_PICKUP' | 'RESCUE_PARTNER')}
          >
            <option value="SELF_PICKUP">Ambil Sendiri (Penerima datang langsung ke lokasi)</option>
            <option value="RESCUE_PARTNER">Diantar Komunitas (Armada Kurir Rescue Partner)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#343A40]">Kondisi Penyimpanan</label>
          <select
            className={customSelectClass}
            value={formData.storageCondition}
            onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
          >
            <option value="ROOM_TEMP">Suhu Ruangan</option>
            <option value="REFRIGERATED">Pendingin (Kulkas)</option>
            <option value="FROZEN">Beku (Freezer)</option>
          </select>
        </div>
      </div>

      {/* Auto-Fill Address Toggle */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#1B3A5C]">Alamat Penjemputan Makanan</label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={useDefaultAddress}
              onChange={(e) => setUseDefaultAddress(e.target.checked)}
              className="rounded border-slate-300 text-[#1B3A5C] focus:ring-0"
            />
            <span>Gunakan Alamat Toko Utama Saya ({defaultAddress})</span>
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

      {/* Hybrid BPOM SOP Readiness Checklist */}
      <RescueReadinessForm
        onChange={(checkData, isComplete) => {
          setChecklistData(checkData);
          setChecklistReady(isComplete);
        }}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="gold" size="lg" isLoading={isLoading} disabled={!checklistReady} className="font-extrabold shadow-md">
          Publikasikan Surplus & Trigger Smart Matching ➔
        </Button>
      </div>
    </form>
  );
};
