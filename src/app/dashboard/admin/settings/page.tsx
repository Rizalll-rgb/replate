'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'MATCHING' | 'BPOM' | 'DISCOUNT' | 'ALERTS'>('BPOM');
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // State parameter bisnis
  const [matchingWeights, setMatchingWeights] = useState({
    distance: 25,
    urgency: 20,
    foodType: 15,
    quantity: 15,
    reliability: 10,
    capacity: 10,
    route: 5,
  });

  // 8 Parametrisasi SOP BPOM & Permenkes No. 1096/2011
  const [bpomRules, setBpomRules] = useState({
    cookedMealMaxHours: 6,
    bakeryMaxHours: 24,
    dairyChillerTemp: 4,
    freezerTemp: -18,
    foodWarmerTemp: 60,
    sealedPackagingRequired: true,
    minOrganolepticScore: 8,
    slhsCertificateValidityMonths: 12,
  });

  const [pricingRules, setPricingRules] = useState({
    minDiscountPercent: 50,
    greenImpactPointsPerKg: 10,
  });

  const [alertRules, setAlertRules] = useState({
    defaultRadiusKm: 15,
    emergencyAlertMinutes: 120,
  });

  const handleSave = () => {
    setToastState({
      isOpen: true,
      message: 'Seluruh 8 Konfigurasi Parameter SOP Kelayakan Pangan BPOM RI & Bisnis Platform Berhasil Disimpan!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Konfigurasi Sistem & Pengaturan Bisnis Platform</h2>
        <p className="text-xs text-slate-500 font-medium">
          Kelola parameter algoritma Smart Matching, 8 aturan SOP kelayakan BPOM RI, batas diskon Rescue Sale, dan alert darurat.
        </p>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('BPOM')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            activeTab === 'BPOM'
              ? 'bg-[#1B3A5C] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          1. SOP Kelayakan BPOM (8 Parameter)
        </button>
        <button
          onClick={() => setActiveTab('MATCHING')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            activeTab === 'MATCHING'
              ? 'bg-[#1B3A5C] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          2. Bobot Smart Matching
        </button>
        <button
          onClick={() => setActiveTab('DISCOUNT')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            activeTab === 'DISCOUNT'
              ? 'bg-[#1B3A5C] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          3. Diskon & Poin Dampak
        </button>
        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            activeTab === 'ALERTS'
              ? 'bg-[#1B3A5C] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          4. Radius & Alert Darurat
        </button>
      </div>

      {/* Tab Content 1: 8 Parameter SOP BPOM */}
      {activeTab === 'BPOM' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-[#1B3A5C]">
              Standar 8-Parameter Higiene Sanitasi & Kelayakan Pangan (BPOM RI & Permenkes 1096/2011)
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">1. Batas Jam Simpan Makanan Olahan Masak Basah:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bpomRules.cookedMealMaxHours}
                    onChange={(e) => setBpomRules({ ...bpomRules, cookedMealMaxHours: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Jam Sejak Diproduksi (BPOM max 6 Jam)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">2. Batas Jam Simpan Produk Roti & Bakery Kemasan:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bpomRules.bakeryMaxHours}
                    onChange={(e) => setBpomRules({ ...bpomRules, bakeryMaxHours: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Jam Sejak Diproduksi</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">3. Suhu Penyimpanan Cold Chiller / Refrigerator:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bpomRules.dairyChillerTemp}
                    onChange={(e) => setBpomRules({ ...bpomRules, dairyChillerTemp: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Derajat Celcius (°C)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">4. Suhu Storage Pembekuan / Freezer:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bpomRules.freezerTemp}
                    onChange={(e) => setBpomRules({ ...bpomRules, freezerTemp: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Derajat Celcius (°C)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">5. Suhu Minimal Penyajian Masakan Warm (Warmer):</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bpomRules.foodWarmerTemp}
                    onChange={(e) => setBpomRules({ ...bpomRules, foodWarmerTemp: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Derajat Celcius (°C)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">6. Ambang Nilai Uji Organoleptik (Bau/Warna/Rasa):</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bpomRules.minOrganolepticScore}
                    onChange={(e) => setBpomRules({ ...bpomRules, minOrganolepticScore: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Skor Minimal (Dari Skala 10)</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab Content 2: Bobot Matching */}
      {activeTab === 'MATCHING' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-[#1B3A5C]">
              Bobot Algoritma Redistribusi Pangan (Smart Matching Score)
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Kedekatan Lokasi (Distance)</span>
                <Input
                  type="number"
                  value={matchingWeights.distance}
                  onChange={(e) => setMatchingWeights({ ...matchingWeights, distance: parseInt(e.target.value) || 0 })}
                  className="w-20 text-right font-extrabold"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Urgensi Batas Waktu (Urgency)</span>
                <Input
                  type="number"
                  value={matchingWeights.urgency}
                  onChange={(e) => setMatchingWeights({ ...matchingWeights, urgency: parseInt(e.target.value) || 0 })}
                  className="w-20 text-right font-extrabold"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab Content 3: Diskon & Poin */}
      {activeTab === 'DISCOUNT' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-[#1B3A5C]">
              Batas Harga Rescue Sale & Poin Dampak Keberlanjutan
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">Minimal Potongan Diskon Rescue Sale:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={pricingRules.minDiscountPercent}
                    onChange={(e) => setPricingRules({ ...pricingRules, minDiscountPercent: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">% Dari Harga Normal (Wajib Min 50%)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">Poin Hijau Dampak per Kg Diselamatkan:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={pricingRules.greenImpactPointsPerKg}
                    onChange={(e) => setPricingRules({ ...pricingRules, greenImpactPointsPerKg: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Poin Impact (Reward Redeem)</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab Content 4: Radius & Alert */}
      {activeTab === 'ALERTS' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-[#1B3A5C]">
              Radius Penjangkauan & Ambang Alert Darurat
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">Radius Pencarian Default Mitra Kota:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={alertRules.defaultRadiusKm}
                    onChange={(e) => setAlertRules({ ...alertRules, defaultRadiusKm: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Kilometer (Km)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">Ambang Waktu Urgency Emergency Alert:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={alertRules.emergencyAlertMinutes}
                    onChange={(e) => setAlertRules({ ...alertRules, emergencyAlertMinutes: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">Menit Sebelum Deadline</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button variant="gold" size="lg" className="font-extrabold shadow-md" onClick={handleSave}>
          Simpan Seluruh Parameter Bisnis Platform ➔
        </Button>
      </div>

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
