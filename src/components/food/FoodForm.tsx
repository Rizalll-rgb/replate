'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  PackageIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
} from '../ui/Icon';
import { RescueReadinessForm, RescueReadinessChecklist, FormValidationSignals } from './RescueReadinessForm';
import { resolveIndonesianAddress } from '@/lib/geoResolver';
import { calculateIppcEsgImpact } from '@/lib/esgCarbonEngine';

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
  const [defaultAddress, setDefaultAddress] = useState('Jl. Raya Sarangan, Kwarigan, Sidorejo, Magetan');
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

    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.address) {
          const resolved = resolveIndonesianAddress(parsed.address);
          setDefaultAddress(parsed.address);
          setFormData((prev) => ({
            ...prev,
            address: parsed.address,
            latitude: parsed.lat || parsed.latitude || resolved.lat,
            longitude: parsed.lng || parsed.longitude || resolved.lng,
          }));
        }
      }
    } catch (_) {}
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

  const estTotalWeight = Number(((Number(formData.quantity) || 1) * (Number(formData.weightPerUnitKg) || 0.5)).toFixed(1));
  const liveIppc = useMemo(() => calculateIppcEsgImpact(estTotalWeight), [estTotalWeight]);

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

  // SOP Rescue Readiness Checklist State
  const [checklistReady, setChecklistReady] = useState<boolean>(false);
  const [checklistData, setChecklistData] = useState<RescueReadinessChecklist>({
    infoComplete: false,
    notExpired: false,
    storageProper: false,
    packagingIntact: false,
    noSpoilage: false,
    photoClear: false,
    pickupRealistic: false,
    locationAccurate: false,
  });

  const handleChecklistChange = useCallback((checkData: RescueReadinessChecklist, isComplete: boolean) => {
    setChecklistData((prev) => (JSON.stringify(prev) === JSON.stringify(checkData) ? prev : checkData));
    setChecklistReady((prev) => (prev === isComplete ? prev : isComplete));
  }, []);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const handleNextToStep2 = () => {
    if (!formData.foodName?.trim()) {
      alert('Mohon masukkan nama makanan surplus terlebih dahulu.');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      alert('Mohon tentukan jumlah kuantitas porsi yang valid.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextToStep3 = () => {
    const deadlineMs = formData.pickupDeadline ? new Date(formData.pickupDeadline).getTime() : 0;
    const twoHoursFromNow = Date.now() + (2 * 60 * 60 * 1000);
    if (!formData.pickupDeadline || deadlineMs < twoHoursFromNow) {
      alert('Batas waktu penjemputan harus minimal 2 jam dari sekarang! Silakan atur ulang.');
      return;
    }
    setCurrentStep(3);
  };

  // Derive form validation signals from actual form state for auto-validation checklist
  const formSignals: FormValidationSignals = useMemo(() => {
    const deadlineMs = formData.pickupDeadline ? new Date(formData.pickupDeadline).getTime() : 0;
    return {
      hasName: !!(formData.foodName && formData.foodName.trim().length > 0),
      hasCategory: !!(formData.foodCategory && formData.foodCategory.trim().length > 0),
      hasQuantity: !!(formData.quantity && Number(formData.quantity) > 0),
      hasWeight: !!(formData.weightPerUnitKg && Number(formData.weightPerUnitKg) > 0),
      pickupDeadlineMs: deadlineMs || 0,
      hasStorageCondition: !!(formData.storageCondition && formData.storageCondition.trim().length > 0),
      hasPackagingType: !!(formData.packagingType && formData.packagingType.trim().length > 0),
      hasPhoto: !!previewPhoto,
      hasAddress: !!(useDefaultAddress || (formData.address && formData.address.trim().length > 0)),
      hasCoordinates: !!(formData.latitude && formData.longitude),
    };
  }, [
    formData.foodName,
    formData.foodCategory,
    formData.quantity,
    formData.weightPerUnitKg,
    formData.pickupDeadline,
    formData.storageCondition,
    formData.packagingType,
    formData.address,
    formData.latitude,
    formData.longitude,
    previewPhoto,
    useDefaultAddress,
    defaultAddress,
  ]);

  // Custom Select Dropdown CSS Class
  const customSelectClass =
    "w-full rounded-xl border border-slate-300 text-xs sm:text-sm px-4 py-2.5 bg-white text-[#1B3A5C] font-bold focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/20 focus:outline-none shadow-xs appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231B3A5C%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem_1.25rem] pr-10 hover:border-[#1B3A5C] transition-all";

  const handlePhotoUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Ukuran file melebihi batas 15MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        // Ultra-lightweight Canvas compression (resizes to max 800px & 0.75 JPEG quality, ~40KB)
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.75);
              setPreviewPhoto(compressed);
              return;
            }
          } catch (_) {}
          setPreviewPhoto(rawUrl);
        };
        img.onerror = () => setPreviewPhoto(rawUrl);
        img.src = rawUrl;
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

    // Detailed field validation with specific error messages
    const missingFields: string[] = [];
    if (!formData.foodName?.trim()) missingFields.push('Nama Makanan');
    if (!formData.quantity || Number(formData.quantity) <= 0) missingFields.push('Jumlah Porsi');
    if (!formData.pickupDeadline) missingFields.push('Batas Waktu Penjemputan');
    if (!formData.weightPerUnitKg || Number(formData.weightPerUnitKg) <= 0) missingFields.push('Berat per Unit');

    if (missingFields.length > 0) {
      alert(`Mohon lengkapi field berikut:\n• ${missingFields.join('\n• ')}`);
      return;
    }

    // Validate pickup deadline is at least 2 hours from now
    const deadlineMs = new Date(formData.pickupDeadline!).getTime();
    const twoHoursFromNow = Date.now() + (2 * 60 * 60 * 1000);
    if (deadlineMs < twoHoursFromNow) {
      alert('Batas waktu penjemputan harus minimal 2 jam dari sekarang! Silakan atur ulang.');
      return;
    }

    if (!checklistReady) {
      alert('Mohon lengkapi seluruh kriteria SOP BPOM Rescue Readiness (100%) sebelum publikasi! Pastikan Anda telah mengonfirmasi uji sensorik dapur.');
      return;
    }

    const finalDistributionType: 'SALE' | 'FREE' =
      pricingScheme === 'RESCUE_SALE' ? 'SALE' : 'FREE';

    const finalAddress = useDefaultAddress ? defaultAddress : (formData.address || defaultAddress);
    const resolvedGeo = resolveIndonesianAddress(finalAddress);

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
      address: finalAddress,
      latitude: formData.latitude || resolvedGeo.lat,
      longitude: formData.longitude || resolvedGeo.lng,
      photos: previewPhoto ? [previewPhoto] : [],
      rescueReadiness: checklistData,
    };

    // Store in localStorage cache safely with quota guard
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
      // Keep up to 25 items so localStorage quota is never exceeded
      const updated = [newItem, ...existing.filter((item: any) => item.id !== newItem.id)].slice(0, 25);
      localStorage.setItem('replate_local_surplus', JSON.stringify(updated));
    } catch (_) {
      try {
        const newItem = {
          id: `SRP-LOCAL-${Date.now()}`,
          ...payload,
          remainingQuantity: payload.quantity,
          status: 'AVAILABLE',
          createdAt: new Date().toISOString(),
          provider: { name: 'Warung Bakso Pak Kumis', organizationName: 'Warung Bakso Pak Kumis' },
        };
        localStorage.setItem('replate_local_surplus', JSON.stringify([newItem]));
      } catch (_) {}
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
      {/* 3-Step Wizard Navigation Header */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200 gap-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            currentStep === 1
              ? 'bg-[#1B3A5C] text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 bg-white/60'
          }`}
        >
          <PackageIcon size={14} />
          <span className="hidden sm:inline">1.</span>
          <span>Info Makanan</span>
        </button>
        <button
          type="button"
          onClick={handleNextToStep2}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            currentStep === 2
              ? 'bg-[#1B3A5C] text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 bg-white/60'
          }`}
        >
          <CreditCardIcon size={14} />
          <span className="hidden sm:inline">2.</span>
          <span>Harga & Waktu</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (!formData.foodName?.trim()) {
              alert('Mohon lengkapi info makanan di Langkah 1 terlebih dahulu.');
              setCurrentStep(1);
              return;
            }
            setCurrentStep(3);
          }}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            currentStep === 3
              ? 'bg-[#1B3A5C] text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 bg-white/60'
          }`}
        >
          <ShieldCheckIcon size={14} />
          <span className="hidden sm:inline">3.</span>
          <span>SOP BPOM</span>
        </button>
      </div>

      {/* LANGKAH 1: IDENTITAS & PORSI MAKANAN */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {/* Photo Upload Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#1B3A5C] block">
              Upload Foto Produk Surplus Makanan
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-[#1B3A5C] rounded-2xl p-4 bg-slate-50 transition-colors text-center relative overflow-hidden">
              {previewPhoto ? (
                <div className="relative max-w-sm mx-auto group">
                  <img
                    src={previewPhoto}
                    alt="Preview Produk"
                    className="w-full h-40 object-cover rounded-xl shadow-xs border border-slate-200"
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
                    Rasio disarankan 16:9 atau 4:3, maksimal ukuran 5 MB.
                  </p>
                  <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoUploadMock} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Main Product Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#343A40]">Deskripsi / Rincian Menu</label>
              <input
                type="text"
                placeholder="Rincian lauk, bahan utama, atau info alergen..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D4A843]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Jumlah Kuantitas"
                type="number"
                placeholder="15"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Satuan</label>
                <select
                  className={customSelectClass}
                  value={formData.quantityUnit}
                  onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
                >
                  <option value="porsi">Porsi</option>
                  <option value="kotak">Kotak</option>
                  <option value="kg">Kg</option>
                  <option value="pcs">Pcs</option>
                </select>
              </div>
            </div>

            <Input
              label="Estimasi Berat Bersih (Kg per Unit)"
              type="number"
              step="0.1"
              placeholder="0.5"
              value={formData.weightPerUnitKg || ''}
              onChange={(e) => setFormData({ ...formData, weightPerUnitKg: Number(e.target.value) })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#343A40]">Kondisi Penyimpanan Higienis</label>
              <select
                className={customSelectClass}
                value={formData.storageCondition}
                onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
              >
                <option value="ROOM_TEMP">Suhu Ruangan (&gt;60°C / Hangat)</option>
                <option value="REFRIGERATED">Pendingin Chiller (&lt;4°C)</option>
                <option value="FROZEN">Beku (Freezer)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#343A40]">Jenis Wadah / Kemasan Makanan</label>
              <select
                className={customSelectClass}
                value={formData.packagingType}
                onChange={(e) => setFormData({ ...formData, packagingType: e.target.value })}
              >
                <option value="PACKAGED">Kotak Makanan / Food Box Steril</option>
                <option value="VACUUM_SEALED">Vakum Tersegel (Vacuum Sealed)</option>
                <option value="PLASTIC_WRAP">Mika / Wrap Rapat</option>
                <option value="BULK">Wadah Bersama / Prasmanan</option>
              </select>
            </div>

            {/* Live BPOM & IPCC Intelligence Hint */}
            <div className="md:col-span-2 p-3.5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-black text-[#1B3A5C]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Dampak Nyata & Panduan Keamanan BPOM:</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Donasi {estTotalWeight} kg ini mencegah <strong>{liveIppc.methaneAvoidedKg.toFixed(2)} kg metana (CH4)</strong> dan <strong>{liveIppc.totalNetCo2eSavedKg.toFixed(1)} kg CO2e</strong> (IPCC Vol 5).
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-[10.5px] font-bold text-slate-700 shadow-2xs">
                  🛡️ Batas BPOM: {
                    formData.foodCategory === 'BEVERAGES' ? '6 Jam' :
                    formData.foodCategory === 'BAKERY' ? '8 Jam' :
                    formData.foodCategory === 'PRODUCE' ? '24 Jam' : '4 Jam (Suhu Ruang)'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNextToStep2}
              className="font-black text-xs py-2 px-3.5 shadow-xs cursor-pointer"
            >
              Lanjut ke Langkah 2: Harga & Waktu 
            </Button>
          </div>
        </div>
      )}

      {/* LANGKAH 2: SKEMA HARGA, WAKTU & LOGISTIK */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Skema Distribusi & Penyelamatan */}
          <div className="p-4 bg-[#1B3A5C]/5 border border-[#1B3A5C]/20 rounded-2xl space-y-2.5">
            <label className="text-xs font-extrabold text-[#1B3A5C] flex items-center gap-1.5">
              <CreditCardIcon size={14} className="text-[#D4A843]" />
              <span>Pilih Skema Distribusi & Penyelamatan Makanan</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div
                onClick={() => handlePricingSchemeChange('RESCUE_SALE')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  pricingScheme === 'RESCUE_SALE'
                    ? 'bg-amber-50 border-[#D4A843] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-extrabold text-slate-900 block text-xs">Rescue Sale (Diskon)</span>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Dijual murah di bawah harga normal untuk konsumen umum & anak kos.
                </p>
              </div>

              <div
                onClick={() => handlePricingSchemeChange('DONATION_YAYASAN')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  pricingScheme === 'DONATION_YAYASAN'
                    ? 'bg-blue-50 border-[#1B3A5C] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-extrabold text-slate-900 block text-xs">Donasi Yayasan / Panti</span>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Gratis 100% (Porsi Besar). Otomatis dialirkan ke Smart Matching Panti Surabaya.
                </p>
              </div>

              <div
                onClick={() => handlePricingSchemeChange('DONATION_INDIVIDUAL')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  pricingScheme === 'DONATION_INDIVIDUAL'
                    ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-extrabold text-slate-900 block text-xs">Donasi Gratis Individu</span>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Gratis 100% (Porsi Sedikit). Untuk warga / individu rentan yang membutuhkan.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
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
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-950">
                <div className="flex justify-between items-center font-black">
                  <span>Alokasi Auto-Infaq Kemanusiaan (5%):</span>
                  <span className="text-amber-950 font-mono">Rp {((formData.price || 0) * 0.05).toLocaleString('id-ID')} / porsi</span>
                </div>
                <p className="text-[11px] font-medium text-amber-800 leading-snug">
                  *Dialokasikan ke Kas Dana Kemanusiaan Replate untuk subsidi logistik boks steril & bensin relawan Panti Asuhan. Pendapatan bersih toko: <strong>Rp {((formData.price || 0) * 0.95).toLocaleString('id-ID')}</strong>.
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

          {/* Custom Date & Time Picker */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#1B3A5C]">
                Batas Waktu Penjemputan (Pickup Deadline)
              </label>
              <span className="text-[10.5px] text-slate-500 font-medium">Pilih preset atau tentukan jam</span>
            </div>

            {/* Preset Chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPresetTime(2)}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition-colors cursor-pointer"
              >
                2 Jam Lagi
              </button>
              <button
                type="button"
                onClick={() => handleQuickPresetTime(4)}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition-colors cursor-pointer"
              >
                4 Jam Lagi
              </button>
              <button
                type="button"
                onClick={() => handleQuickPresetTime(0, 21)}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Malam Ini 21.00 WIB
              </button>
              <button
                type="button"
                onClick={() => handleQuickPresetTime(0, 8)}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg transition-colors cursor-pointer"
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

          {/* Logistik & Pilihan Opsi Pengiriman Outlet (Global Setup) */}
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-2">
              <div>
                <label className="text-xs font-extrabold text-[#1B3A5C] flex items-center gap-1.5">
                  <TruckIcon size={14} className="text-[#1B3A5C]" />
                  <span>Opsi Pengiriman Didukung Outlet Ini (Pengaturan Global Toko)</span>
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
                <span>Ubah di Pengaturan Toko </span>
              </a>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 bg-white border border-slate-300 font-extrabold text-slate-800 rounded-lg shadow-2xs">
                Ambil Mandiri (Self Pickup)
              </span>
              <span className="px-3 py-1 bg-white border border-slate-300 font-extrabold text-slate-800 rounded-lg shadow-2xs">
                Kurir Relawan Replate
              </span>
              <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 font-extrabold text-emerald-900 rounded-lg shadow-2xs">
                Armada Toko Direct (Mas Doni - L 4582 ABC) (Terverifikasi)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(1)}
              className="font-bold text-xs py-2 px-3 cursor-pointer"
            >
              ‹ Kembali ke Info Makanan
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNextToStep3}
              className="font-black text-xs py-2 px-3.5 shadow-xs cursor-pointer"
            >
              Lanjut ke Langkah 3: Standar BPOM 
            </Button>
          </div>
        </div>
      )}

      {/* LANGKAH 3: STANDAR BPOM & ALAMAT TOKO */}
      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Auto-Fill Address Toggle with Driver GPS & Loading Dock Notes */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#1B3A5C]">Alamat Penjemputan Makanan</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={useDefaultAddress}
                  onChange={(e) => setUseDefaultAddress(e.target.checked)}
                  className="rounded border-slate-300 text-[#1B3A5C] focus:ring-0 cursor-pointer"
                />
                <span>Gunakan Alamat Toko Utama ({defaultAddress})</span>
              </label>
            </div>

            {!useDefaultAddress && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <Input
                  label="Alamat Lengkap Lokasi Penjemputan Alternatif"
                  placeholder="Contoh: Jl. Panglima Sudirman No. 12, Pintu Loading Dock Samping, Surabaya"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Titik Koordinat GPS / Link Google Maps"
                    placeholder="Contoh: -7.2625, 112.7482 atau https://maps.app.goo.gl/..."
                    value={(formData as any).gpsLink || ''}
                    onChange={(e) => setFormData({ ...formData, gpsLink: e.target.value } as any)}
                  />
                  <Input
                    label="Catatan Khusus Titik Temu Driver"
                    placeholder="Contoh: Masuk lewat pintu loading dock samping pos satpam"
                    value={(formData as any).driverNotes || ''}
                    onChange={(e) => setFormData({ ...formData, driverNotes: e.target.value } as any)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hybrid BPOM SOP Readiness Checklist — Auto-validated from form signals */}
          <RescueReadinessForm
            formSignals={formSignals}
            onChange={handleChecklistChange}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(2)}
              className="font-bold text-xs py-2 px-3 cursor-pointer w-full sm:w-auto"
            >
              ‹ Kembali ke Harga & Waktu
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              isLoading={isLoading}
              disabled={!checklistReady}
              className="font-black text-xs py-2 px-4 shadow-sm cursor-pointer w-full sm:w-auto"
            >
              Publikasikan & Smart Matching
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};
