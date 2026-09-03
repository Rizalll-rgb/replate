'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'MATCHING' | 'BPOM' | 'DISCOUNT' | 'ALERTS' | 'INFAQ'>('BPOM');
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [infaqRules, setInfaqRules] = useState({
    defaultInfaqPercent: 5,
    courierSubsidyPerDelivery: 10000,
    packagingSubsidyPerBox: 2500,
    totalPoolAccumulated: 4850000,
    totalDisbursed: 3200000,
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

  // 8 Parametrisasi SOP BPOM & Permenkes No. 1096/2011 + Grace Period Platform
  const [bpomRules, setBpomRules] = useState({
    cookedMealMaxHours: 6,
    bakeryMaxHours: 24,
    dairyChillerTemp: 4,
    freezerTemp: -18,
    foodWarmerTemp: 60,
    sealedPackagingRequired: true,
    minOrganolepticScore: 8,
    slhsCertificateValidityMonths: 12,
    defaultGracePeriodMins: 30,
    maxGracePeriodCapMins: 60,
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
    try {
      localStorage.setItem('replate_admin_grace_period_default', String(bpomRules.defaultGracePeriodMins));
      localStorage.setItem('replate_admin_grace_period_max', String(bpomRules.maxGracePeriodCapMins));
      localStorage.setItem('replate_admin_sync_radius', String(alertRules.defaultRadiusKm));
    } catch (_) {}

    setToastState({
      isOpen: true,
      message: 'Seluruh Parameter SOP BPOM, Grace Period Platform & Kebijakan Bisnis Berhasil Disimpan!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Konfigurasi Sistem & Pengaturan Bisnis Platform</h2>
        <p className="text-xs text-slate-500 font-medium">
          Kelola parameter algoritma Smart Matching, 8 aturan SOP kelayakan BPOM RI, batas diskon, radius, serta Manajemen Dana Kemanusiaan Infaq.
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
        <button
          onClick={() => setActiveTab('INFAQ')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            activeTab === 'INFAQ'
              ? 'bg-[#1B3A5C] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          5. Dana Kemanusiaan & Infaq
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

              <div className="p-4 bg-[#1B3A5C]/5 rounded-xl border border-[#1B3A5C]/20 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">7. Grace Period Pickup Default Platform (SuperAdmin Base):</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bpomRules.defaultGracePeriodMins}
                    onChange={(e) => setBpomRules({ ...bpomRules, defaultGracePeriodMins: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold text-[#1B3A5C]"
                  />
                  <span className="font-bold text-slate-600">Menit (Default Kebijakan Platform)</span>
                </div>
              </div>

              <div className="p-4 bg-[#1B3A5C]/5 rounded-xl border border-[#1B3A5C]/20 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">8. Batas Maksimal Grace Period Diizinkan Toko (Max Cap):</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bpomRules.maxGracePeriodCapMins}
                    onChange={(e) => setBpomRules({ ...bpomRules, maxGracePeriodCapMins: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold text-[#1B3A5C]"
                  />
                  <span className="font-bold text-slate-600">Menit (Batas Keamanan BPOM Puncak)</span>
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

      {/* Tab Content 5: Dana Kemanusiaan & Alokasi Infaq */}
      {activeTab === 'INFAQ' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <CardTitle className="text-base font-extrabold text-[#1B3A5C]">
                Pengelolaan Kas Dana Kemanusiaan Replate & Subsidisi Alokasi
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">
                Kas infaq yang terakumulasi dari transaksi Rescue Sale disalurkan untuk mensubsidi boks steril dan ongkir relawan Panti Asuhan.
              </p>
            </div>
            <div className="bg-[#1B3A5C] text-amber-300 px-4 py-2 rounded-xl text-right shrink-0 border border-amber-400/30 shadow-xs">
              <span className="text-[10px] uppercase font-extrabold block text-slate-300">TOTAL SALDO KAS TERKUMPUL</span>
              <span className="text-lg font-black font-mono">Rp {infaqRules.totalPoolAccumulated.toLocaleString('id-ID')}</span>
            </div>
          </CardHeader>
          <CardBody className="space-y-4 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">Potongan Auto-Infaq Default Outlet:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={infaqRules.defaultInfaqPercent}
                    onChange={(e) => setInfaqRules({ ...infaqRules, defaultInfaqPercent: parseInt(e.target.value) || 0 })}
                    className="w-24 font-bold"
                  />
                  <span className="font-bold text-slate-600">% Dari Transaksi Rescue Sale</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">Subsidi Bensin Kurir Relawan / Paket:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={infaqRules.courierSubsidyPerDelivery}
                    onChange={(e) => setInfaqRules({ ...infaqRules, courierSubsidyPerDelivery: parseInt(e.target.value) || 0 })}
                    className="w-32 font-bold"
                  />
                  <span className="font-bold text-slate-600">Rupiah (Rp) / Pengantaran</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-[#1B3A5C] block">Subsidi Boks Kemasan Steril Panti:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={infaqRules.packagingSubsidyPerBox}
                    onChange={(e) => setInfaqRules({ ...infaqRules, packagingSubsidyPerBox: parseInt(e.target.value) || 0 })}
                    className="w-32 font-bold"
                  />
                  <span className="font-bold text-slate-600">Rupiah (Rp) / Boks Makanan</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
              <div className="space-y-0.5">
                <span className="font-extrabold text-xs block text-amber-950">Statistik Alokasi Pencairan Dana Kemanusiaan:</span>
                <p className="text-[11px] font-medium text-amber-800">
                  Total Disbursed Subsidi: <strong>Rp {infaqRules.totalDisbursed.toLocaleString('id-ID')}</strong> (Telah mendanai 320 pengantaran donasi gratis panti & 1.280 boks kemasan steril).
                </p>
              </div>
              <Button
                type="button"
                variant="gold"
                size="sm"
                className="font-extrabold text-slate-950 shrink-0"
                onClick={() => {
                  setInfaqRules((prev) => ({ ...prev, totalDisbursed: prev.totalDisbursed + 500000 }));
                  setToastState({
                    isOpen: true,
                    message: ' Dana Subsidi Sebesar Rp 500.000 Berhasil Dicairkan Ke Kas Kurir Relawan Komunitas!',
                    type: 'success',
                  });
                }}
              >
                 Cairkan Subsidi Kurir Relawan (Rp 500rb) 
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button variant="gold" size="lg" className="font-extrabold shadow-md" onClick={handleSave}>
          Simpan Seluruh Parameter Bisnis Platform 
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
