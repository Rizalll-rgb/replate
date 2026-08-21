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
  rescueReadiness: RescueReadinessChecklist;
}

export interface FoodFormProps {
  onSubmit: (data: FoodFormData) => Promise<void>;
  isLoading?: boolean;
}

export const FoodForm: React.FC<FoodFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<Partial<FoodFormData>>({
    foodCategory: 'MEALS',
    quantityUnit: 'porsi',
    storageCondition: 'ROOM_TEMP',
    packagingType: 'PACKAGED',
    distributionType: 'BOTH',
    price: 0,
    weightPerUnitKg: 0.5,
    address: 'Jl. Pemuda No. 1, Surabaya',
    latitude: -7.2654,
    longitude: 112.7483,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistReady) {
      alert('Mohon lengkapi semua checklist SOP Rescue Readiness (100%) sebelum submit!');
      return;
    }
    if (!formData.foodName || !formData.quantity || !formData.pickupDeadline) {
      alert('Mohon isi nama makanan, jumlah, dan batas waktu pickup!');
      return;
    }

    await onSubmit({
      foodName: formData.foodName || '',
      description: formData.description || '',
      foodCategory: formData.foodCategory || 'MEALS',
      quantity: Number(formData.quantity),
      quantityUnit: formData.quantityUnit || 'porsi',
      pickupDeadline: formData.pickupDeadline || new Date(Date.now() + 6 * 3600000).toISOString(),
      storageCondition: formData.storageCondition || 'ROOM_TEMP',
      packagingType: formData.packagingType || 'PACKAGED',
      distributionType: formData.distributionType || 'BOTH',
      price: Number(formData.price || 0),
      weightPerUnitKg: Number(formData.weightPerUnitKg || 0.5),
      address: formData.address || 'Surabaya',
      latitude: formData.latitude || -7.2654,
      longitude: formData.longitude || 112.7483,
      rescueReadiness: checklistData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        <Input
          label="Batas Waktu Penjemputan (Deadline)"
          type="datetime-local"
          value={formData.pickupDeadline || ''}
          onChange={(e) => setFormData({ ...formData, pickupDeadline: e.target.value })}
          required
        />

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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#343A40]">Skema Distribusi</label>
          <select
            className="w-full rounded-lg border border-[#DEE2E6] text-sm px-3.5 py-2 bg-white focus:border-[#1B3A5C] focus:outline-none"
            value={formData.distributionType}
            onChange={(e) => setFormData({ ...formData, distributionType: e.target.value })}
          >
            <option value="BOTH">Bisa Rescue Sale (Jual Murah) & Food Rescue (Gratis)</option>
            <option value="SALE">Hanya Rescue Sale (Jual Murah)</option>
            <option value="FREE">Hanya Food Rescue (Gratis / Panti)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Harga per Unit (Rp)"
          type="number"
          placeholder="0 untuk gratis"
          value={formData.price || 0}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
        />

        <Input
          label="Alamat Penjemputan"
          placeholder="Jl. Genteng Kali No. 45, Genteng, Surabaya"
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#343A40]">Deskripsi Makanan & Catatan</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-[#DEE2E6] text-sm p-3 bg-white focus:border-[#1B3A5C] focus:outline-none"
          placeholder="Jelaskan kondisi makanan, bahan, wadah yang perlu dibawa, dll."
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Mandatory Rescue Readiness SOP Checklist */}
      <RescueReadinessForm
        onChange={(checkData, isComplete) => {
          setChecklistData(checkData);
          setChecklistReady(isComplete);
        }}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="gold" size="lg" isLoading={isLoading} disabled={!checklistReady}>
          🚀 Submit & Trigger Smart Matching
        </Button>
      </div>
    </form>
  );
};
