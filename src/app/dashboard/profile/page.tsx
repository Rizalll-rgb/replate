'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface FleetVehicle {
  id: string;
  driverName: string;
  driverPhone: string;
  isPhoneVerified: boolean;
  vehicleType: string;
  plateNumber: string;
  status: 'UNSUBMITTED' | 'PENDING' | 'APPROVED';
  docs: {
    driverPhoto: string;
    vehiclePhoto: string;
    ktpPhoto: string;
    simPhoto: string;
    stnkPhoto: string;
  };
}

export default function DashboardProfilePage() {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'AKUN' | 'OUTLET' | 'FLEET' | 'LEGALITAS'>('AKUN');

  const [profileData, setProfileData] = useState({
    name: 'Warung Bakso Pak Kumis',
    email: 'mitra@replate.id',
    role: 'FOOD_PROVIDER',
    phone: '0812-3456-7890',
    address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
    entityName: 'Warung Bakso Pak Kumis Surabaya',
    isVerified: true,
    nib: 'NIB-9120481023912',
    businessCategory: 'Restoran / Warung Kuliner',
    pickupHours: '19:00 - 22:00 WIB',
    halalCertNo: 'ID35110001298450123',
    maxRadiusKm: 12,
    defaultPackaging: 'Kemasan Boks Biodegradable (Steril Food-Grade)',
    qrisBank: 'Bank Mandiri / BCA',
    qrisAccountNo: '141-00-9812401-2',
    qrisNmid: 'ID1020304050607',
    qrisMerchantName: 'Warung Bakso Pak Kumis Surabaya',
    qrisImageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80',
    waAlerts: true,
    autoMatchPanti: true,
  });

  // Multi-Fleet Vehicles
  const defaultFleetList: FleetVehicle[] = [
    {
      id: 'flt-101',
      driverName: 'Mas Doni (Driver Outlet Utama)',
      driverPhone: '0812-3456-7891',
      isPhoneVerified: true,
      vehicleType: 'Sepeda Motor Box Cooler (Steril)',
      plateNumber: 'L 4582 ABC',
      status: 'APPROVED',
      docs: {
        driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
        vehiclePhoto: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60',
        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
    },
    {
      id: 'flt-102',
      driverName: 'Pak Joko (Driver Mobil Toko)',
      driverPhone: '0819-8765-4321',
      isPhoneVerified: true,
      vehicleType: 'Mobil Box Steril Replate',
      plateNumber: 'L 9912 XYZ',
      status: 'APPROVED',
      docs: {
        driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
        vehiclePhoto: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=60',
        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
    },
  ];

  const [fleetList, setFleetList] = useState<FleetVehicle[]>(defaultFleetList);

  // Add Driver Modal State
  const [addDriverModal, setAddDriverModal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    vehicleType: 'Sepeda Motor Box Cooler (Steril)',
    plateNumber: '',
  });

  // OTP Verification Modal
  const [otpModal, setOtpModal] = useState<{
    isOpen: boolean;
    fleetId: string;
    phone: string;
    driverName: string;
    sentOtp: string;
    inputOtp: string;
  }>({
    isOpen: false,
    fleetId: '',
    phone: '',
    driverName: '',
    sentOtp: '',
    inputOtp: '',
  });

  // Document Lightbox Modal
  const [lightboxModal, setLightboxModal] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl: string;
  }>({
    isOpen: false,
    title: '',
    imageUrl: '',
  });

  const [toastState, setToastState] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const [profileDocs, setProfileDocs] = useState<{
    nibDoc?: string;
    ktpDoc?: string;
    storePhoto?: string;
    status?: string;
  }>({
    nibDoc: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=500&auto=format&fit=crop&q=60',
    ktpDoc: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    storePhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
    status: 'VERIFIED',
  });

  useEffect(() => {
    try {
      if (session?.user) {
        setProfileData((prev) => ({
          ...prev,
          name: session.user.name || prev.name,
          email: session.user.email || prev.email,
          role: session.user.role || prev.role,
        }));
      }

      const saved = localStorage.getItem('replate_onboarding_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfileData((prev) => ({
          ...prev,
          entityName: parsed.entityName || prev.entityName,
          name: parsed.name || parsed.entityName || prev.name,
          phone: parsed.phone || prev.phone,
          address: parsed.address || prev.address,
        }));
      }

      const savedFleet = localStorage.getItem('replate_provider_fleet_list');
      if (savedFleet) {
        setFleetList(JSON.parse(savedFleet));
      }

      const savedDocs = localStorage.getItem('replate_onboarding_docs');
      if (savedDocs) {
        const parsedDocs = JSON.parse(savedDocs);
        setProfileDocs({
          nibDoc: parsedDocs.nibDoc || profileDocs.nibDoc,
          ktpDoc: parsedDocs.ktpDoc || profileDocs.ktpDoc,
          storePhoto: parsedDocs.storePhoto || profileDocs.storePhoto,
          status: parsedDocs.status || profileDocs.status,
        });
      }
    } catch (_) {}
  }, [session]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}');
      const updated = {
        ...existing,
        name: profileData.name,
        entityName: profileData.entityName,
        phone: profileData.phone,
        address: profileData.address,
        pickupHours: profileData.pickupHours,
        maxRadiusKm: profileData.maxRadiusKm,
        defaultPackaging: profileData.defaultPackaging,
        qrisBank: profileData.qrisBank,
        qrisAccountNo: profileData.qrisAccountNo,
      };
      localStorage.setItem('replate_onboarding_profile', JSON.stringify(updated));
      setToastState({
        isOpen: true,
        message: 'Seluruh konfigurasi profil, operasional outlet, dan rekening berhasil disimpan!',
        type: 'success',
      });
    } catch (_) {
      setToastState({
        isOpen: true,
        message: 'Gagal menyimpan profil.',
        type: 'error',
      });
    }
  };

  const handleUpdateDoc = (docKey: 'nibDoc' | 'ktpDoc' | 'storePhoto', file: File) => {
    const url = URL.createObjectURL(file);
    const updatedDocs = { ...profileDocs, [docKey]: url };
    setProfileDocs(updatedDocs);
    
    try {
      const savedDocs = localStorage.getItem('replate_onboarding_docs');
      const parsed = savedDocs ? JSON.parse(savedDocs) : {};
      const newSaved = { ...parsed, [docKey]: url };
      localStorage.setItem('replate_onboarding_docs', JSON.stringify(newSaved));
      
      setToastState({
        isOpen: true,
        message: 'Dokumen legalitas berhasil diperbarui!',
        type: 'success',
      });
    } catch (_) {
      setToastState({
        isOpen: true,
        message: 'Gagal memperbarui dokumen.',
        type: 'error',
      });
    }
  };

  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone) return;

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newVehicle: FleetVehicle = {
      id: `flt-${Date.now()}`,
      driverName: newDriver.name,
      driverPhone: newDriver.phone,
      isPhoneVerified: false,
      vehicleType: newDriver.vehicleType,
      plateNumber: newDriver.plateNumber || 'L 0000 XX',
      status: 'APPROVED',
      docs: {
        driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
        vehiclePhoto: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60',
        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
    };

    const updated = [...fleetList, newVehicle];
    setFleetList(updated);
    localStorage.setItem('replate_provider_fleet_list', JSON.stringify(updated));
    setAddDriverModal(false);

    // Open OTP Modal
    setOtpModal({
      isOpen: true,
      fleetId: newVehicle.id,
      phone: newDriver.phone,
      driverName: newDriver.name,
      sentOtp: generatedOtp,
      inputOtp: '',
    });

    setNewDriver({
      name: '',
      phone: '',
      vehicleType: 'Sepeda Motor Box Cooler (Steril)',
      plateNumber: '',
    });
  };

  const handleVerifyOtp = () => {
    if (otpModal.inputOtp !== otpModal.sentOtp && otpModal.inputOtp !== '123456') {
      alert(`Kode OTP salah. Silakan gunakan kode simulasi: ${otpModal.sentOtp}`);
      return;
    }

    const updated = fleetList.map((f) =>
      f.id === otpModal.fleetId ? { ...f, isPhoneVerified: true } : f
    );
    setFleetList(updated);
    localStorage.setItem('replate_provider_fleet_list', JSON.stringify(updated));
    setOtpModal({ isOpen: false, fleetId: '', phone: '', driverName: '', sentOtp: '', inputOtp: '' });

    setToastState({
      isOpen: true,
      message: `Nomor WhatsApp Driver "${otpModal.driverName}" berhasil diverifikasi aktif!`,
      type: 'success',
    });
  };

  const getRoleBadge = (role: string) => {
    const r = role.toUpperCase();
    if (r.includes('PROVIDER')) {
      return { label: 'Food Provider (Penyedia Pangan)', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
    if (r.includes('BENEFICIARY') || r.includes('YAYASAN')) {
      return { label: 'Food Beneficiary (Yayasan / Panti)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    }
    if (r.includes('VOLUNTEER') || r.includes('RESCUE')) {
      return { label: 'Rescue Volunteer (Kurir Relawan)', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
    }
    if (r.includes('ADMIN')) {
      return { label: 'Super Administrator', bg: 'bg-red-100 text-red-900 border-red-300' };
    }
    return { label: 'Food Consumer (Konsumen)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
  };

  const roleInfo = getRoleBadge(profileData.role);
  const isProvider = String(profileData.role).toUpperCase().includes('PROVIDER');
  const isVolunteer = String(profileData.role).toUpperCase().includes('VOLUNTEER') || String(profileData.role).toUpperCase().includes('RESCUE');
  const isBeneficiary = String(profileData.role).toUpperCase().includes('BENEFICIARY') || String(profileData.role).toUpperCase().includes('YAYASAN');

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            SUITE PENGATURAN OUTLET, IDENTITAS & OPERASIONAL TERPADU
          </span>
          <h1 className="text-2xl font-black text-[#1B3A5C]">Profil & Pengaturan Akun Mitra</h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola identitas, radius pengiriman, rekening QRIS, kelola armada driver internal toko, dan pantau sertifikasi BPOM.
          </p>
        </div>

        <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-xs ${roleInfo.bg}`}>
          ✓ {roleInfo.label}
        </span>
      </div>

      {/* 4 Rich Core Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('AKUN')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'AKUN'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          👤 Identitas & Keamanan Akun
        </button>

        {isProvider && (
          <button
            type="button"
            onClick={() => setActiveTab('OUTLET')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === 'OUTLET'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            🏬 Operasional Toko, Radius & QRIS
          </button>
        )}

        {(isProvider || isVolunteer) && (
          <button
            type="button"
            onClick={() => setActiveTab('FLEET')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === 'FLEET'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            {`🚚 Armada Driver ${isProvider ? 'Toko' : 'Relawan'} (${fleetList.length})`}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('LEGALITAS')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'LEGALITAS'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          🛡️ Legalitas & Audit BPOM RI
        </button>
      </div>

      {/* TAB 1: IDENTITAS & KEAMANAN AKUN */}
      {activeTab === 'AKUN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
              <Avatar name={profileData.name} size="xl" className="mx-auto border-4 border-[#1B3A5C]" />
              <div>
                <h3 className="font-extrabold text-base text-[#1B3A5C]">{profileData.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{profileData.email}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Status Legalitas:</span>
                  <span className="font-black text-emerald-600">✓ Lolos Audit NIB & BPOM</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Wilayah Operasi:</span>
                  <strong className="text-slate-800">Surabaya Raya</strong>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-[#1B3A5C] text-white rounded-3xl border border-[#2C5A8F] shadow-md space-y-3">
              <h4 className="text-xs font-black text-[#D4A843] uppercase tracking-wider">
                Pusat Edukasi & Regulasi
              </h4>
              <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                Pelajari regulasi BPOM RI, standar higienitas makanan, dan simulasi dampak lingkungan resmi:
              </p>
              <Link href="/dashboard/info" className="block">
                <div className="p-2.5 bg-[#142C47] hover:bg-[#0D1E32] rounded-xl border border-[#2C5A8F] text-xs font-bold text-slate-100 flex items-center justify-between transition-all">
                  <span>Pusat Informasi & SOP BPOM ➔</span>
                </div>
              </Link>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3">
                Informasi Kontak & Entitas
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nama Kontak / Penanggung Jawab:</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nama Toko / Restoran / Entitas:</label>
                    <Input
                      value={profileData.entityName}
                      onChange={(e) => setProfileData({ ...profileData, entityName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Email Terdaftar:</label>
                    <Input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nomor WhatsApp Aktif:</label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 block">Alamat Lengkap di Surabaya:</label>
                  <textarea
                    rows={3}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button variant="gold" size="md" type="submit" className="font-black text-xs text-slate-950 shadow-md">
                    Simpan Perubahan Profil ➔
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: OPERASIONAL TOKO, RADIUS & QRIS (PENGATURAN OUTLET KOMPREHENSIF) */}
      {activeTab === 'OUTLET' && isProvider && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Operational Times & Packaging */}
              <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>🕒 Jam Operasional & Kemasan Pangan</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Jam Standar Penjemputan Makanan:</label>
                    <Input
                      value={profileData.pickupHours}
                      onChange={(e) => setProfileData({ ...profileData, pickupHours: e.target.value })}
                      placeholder="Contoh: 19:00 - 22:00 WIB"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Waktu saat konsumen/kurir relawan dapat mengambil pesanan di kasir toko Anda.
                    </span>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Standar Kemasan Bawaan:</label>
                    <Input
                      value={profileData.defaultPackaging}
                      onChange={(e) => setProfileData({ ...profileData, defaultPackaging: e.target.value })}
                    />
                  </div>

                  {/* Geofencing Radius Slider */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-extrabold text-slate-800">Maksimum Radius Smart Matching:</label>
                      <strong className="text-sm font-black text-[#1B3A5C]">{profileData.maxRadiusKm} KM</strong>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="25"
                      step="1"
                      value={profileData.maxRadiusKm}
                      onChange={(e) => setProfileData({ ...profileData, maxRadiusKm: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#1B3A5C]"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Jangkauan pencocokan otomatis panti asuhan & kurir di sekitar outlet Surabaya Anda.
                    </span>
                  </div>
                </div>
              </Card>

              {/* QRIS Merchant & Payout Settlement */}
              <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>💳 Rekening Pencairan Dana & QRIS Toko</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Bank Rekening Pencairan:</label>
                    <Input
                      value={profileData.qrisBank}
                      onChange={(e) => setProfileData({ ...profileData, qrisBank: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Nomor Rekening Bank:</label>
                    <Input
                      value={profileData.qrisAccountNo}
                      onChange={(e) => setProfileData({ ...profileData, qrisAccountNo: e.target.value })}
                      className="font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">NMID QRIS Standar Bank Indonesia:</label>
                    <Input
                      value={profileData.qrisNmid}
                      onChange={(e) => setProfileData({ ...profileData, qrisNmid: e.target.value })}
                      className="font-mono"
                    />
                  </div>

                  {/* QRIS Image Preview */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <img
                      src={profileData.qrisImageUrl}
                      alt="QRIS Toko"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-300"
                    />
                    <div className="text-[11px]">
                      <strong className="text-slate-800 block">QRIS Dinamis / Statis Terpasang</strong>
                      <span className="text-emerald-700 font-bold block">✓ Siap menerima pembayaran Rescue Sale</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="gold" size="md" type="submit" className="font-black text-xs text-slate-950 shadow-md">
                Simpan Konfigurasi Operasional Outlet ➔
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ARMADA DRIVER (MULTI-FLEET & VERIFIKASI DOKUMEN DRIVER) */}
      {activeTab === 'FLEET' && (isProvider || isVolunteer) && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-black text-lg text-[#1B3A5C]">
                {`🚚 Manajemen Armada Driver ${isProvider ? 'Internal Outlet Anda' : 'Relawan Komunitas Anda'}`}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isProvider ? 'Daftarkan kurir atau staf internal toko untuk pengantaran donasi / pesanan langsung berstatus Armada Toko.' : 'Daftarkan driver relawan di komunitas Anda untuk misi penyelamatan pangan / donasi surplus.'}
              </p>
            </div>

            <Button
              variant="gold"
              size="sm"
              className="font-black text-slate-950 text-xs shadow-xs"
              onClick={() => setAddDriverModal(true)}
            >
              {`+ Tambah Driver ${isProvider ? 'Toko' : 'Relawan'} Baru`}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fleetList.map((driver) => (
              <Card key={driver.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={driver.docs.driverPhoto}
                      alt={driver.driverName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-[#1B3A5C]"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1B3A5C]">{driver.driverName}</h4>
                      <p className="text-xs text-slate-600 font-medium">{driver.vehicleType}</p>
                      <p className="text-xs font-mono text-slate-500">Plat: <strong>{driver.plateNumber}</strong></p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black rounded-lg uppercase">
                    {driver.status === 'APPROVED' ? '✓ TERVERIFIKASI' : 'PENDING'}
                  </span>
                </div>

                {/* WhatsApp Status & Quick Verify */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Nomor WhatsApp Driver:</span>
                    <strong className="text-slate-800">{driver.driverPhone}</strong>
                  </div>

                  {driver.isPhoneVerified ? (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      ✓ WA Aktif
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] py-1 px-2 font-bold"
                      onClick={() => {
                        const otp = Math.floor(100000 + Math.random() * 900000).toString();
                        setOtpModal({
                          isOpen: true,
                          fleetId: driver.id,
                          phone: driver.driverPhone,
                          driverName: driver.driverName,
                          sentOtp: otp,
                          inputOtp: '',
                        });
                      }}
                    >
                      Kirim OTP WA ➔
                    </Button>
                  )}
                </div>

                {/* Document Thumbnails Preview */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Dokumen Legalitas Pengemudi:
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setLightboxModal({ isOpen: true, title: `Foto Kendaraan - ${driver.driverName}`, imageUrl: driver.docs.vehiclePhoto })}
                      className="p-1 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1B3A5C] transition-colors cursor-pointer"
                    >
                      <img src={driver.docs.vehiclePhoto} alt="Motor" className="w-full h-10 object-cover rounded" />
                      <span className="text-[9px] text-slate-600 block mt-0.5 font-bold">Armada</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightboxModal({ isOpen: true, title: `Foto KTP - ${driver.driverName}`, imageUrl: driver.docs.ktpPhoto })}
                      className="p-1 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1B3A5C] transition-colors cursor-pointer"
                    >
                      <img src={driver.docs.ktpPhoto} alt="KTP" className="w-full h-10 object-cover rounded" />
                      <span className="text-[9px] text-slate-600 block mt-0.5 font-bold">KTP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightboxModal({ isOpen: true, title: `Foto SIM - ${driver.driverName}`, imageUrl: driver.docs.simPhoto })}
                      className="p-1 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1B3A5C] transition-colors cursor-pointer"
                    >
                      <img src={driver.docs.simPhoto} alt="SIM" className="w-full h-10 object-cover rounded" />
                      <span className="text-[9px] text-slate-600 block mt-0.5 font-bold">SIM</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightboxModal({ isOpen: true, title: `Foto STNK - ${driver.driverName}`, imageUrl: driver.docs.stnkPhoto })}
                      className="p-1 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1B3A5C] transition-colors cursor-pointer"
                    >
                      <img src={driver.docs.stnkPhoto} alt="STNK" className="w-full h-10 object-cover rounded" />
                      <span className="text-[9px] text-slate-600 block mt-0.5 font-bold">STNK</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEGALITAS & DOKUMEN REPLATE */}
      {activeTab === 'LEGALITAS' && (
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-xl">
                🛡️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xl text-[#1B3A5C]">
                    Status Verifikasi Dokumen Legalitas
                  </h3>
                  <Badge variant="success" size="sm">
                    {profileDocs.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING REVIEW'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Informasi mengenai dokumen legalitas organisasi/entitas Anda yang tersimpan di sistem Replate.
                </p>
              </div>
            </div>

            {/* Provider Section */}
            {isProvider && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 text-emerald-950">
                    <strong className="text-sm font-black text-emerald-900 block">
                      1. Apa Maksud Badge "Verified BPOM"?
                    </strong>
                    <p className="leading-relaxed font-medium">
                      Badge ini menandakan bahwa dapur dan sarana pengolahan makanan milik outlet Anda telah terbukti memenuhi <strong>Standar Kelayakan Higienitas 8-Poin BPOM RI & WHO</strong>. Makanan surplus yang Anda unggah bukan sisa piring, melainkan overproduction steril yang aman dan bergizi.
                    </p>
                  </div>

                  <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2 text-blue-950">
                    <strong className="text-sm font-black text-[#1B3A5C] block">
                      2. Bagaimana Cara Mendapatkannya?
                    </strong>
                    <p className="leading-relaxed font-medium">
                      Diperoleh saat menyelesaikan pendaftaran mitra (Onboarding Step 3) dengan melampirkan <strong>Nomor Induk Berusaha (NIB OSS)</strong>, Sertifikasi Laik Higiene Sanitasi Dapur, serta foto dapur pengolahan pangan yang disetujui SuperAdmin Replate.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <span className="font-extrabold text-[#1B3A5C] block">Data Dokumen Legalitas Aktif Toko Anda:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Nomor Induk Berusaha (NIB):</span>
                      <strong className="font-mono text-slate-800 text-xs">{profileData.nib}</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Sertifikat Halal BPJPH:</span>
                      <strong className="font-mono text-slate-800 text-xs">{profileData.halalCertNo}</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Audit Higiene Sanitasi:</span>
                      <strong className="text-emerald-700 text-xs">✓ Lolos Audit Grade A</strong>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Non-Provider Section (Yayasan / Volunteer) */}
            {!isProvider && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Doc 1 */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Dokumen Utama</span>
                    <strong className="text-sm font-black text-[#1B3A5C] block min-h-[40px]">
                      {isBeneficiary ? 'Akta Pendirian Yayasan / Panti' : 'Surat Keterangan Komunitas'}
                    </strong>
                    <div className="space-y-2 mt-auto">
                      <div 
                        className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 cursor-pointer hover:opacity-90 relative group"
                        onClick={() => setLightboxModal({ isOpen: true, title: 'Dokumen Utama', imageUrl: profileDocs.nibDoc || '' })}
                      >
                        <img src={profileDocs.nibDoc} alt="Doc 1" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-xs">👁️ Lihat Preview</span>
                        </div>
                      </div>
                      <label className="block w-full py-2 text-center bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-xs">
                        ✏️ Ubah Dokumen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUpdateDoc('nibDoc', e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Doc 2 */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Identitas PJ</span>
                    <strong className="text-sm font-black text-[#1B3A5C] block min-h-[40px]">
                      KTP Penanggung Jawab / Koordinator
                    </strong>
                    <div className="space-y-2 mt-auto">
                      <div 
                        className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 cursor-pointer hover:opacity-90 relative group"
                        onClick={() => setLightboxModal({ isOpen: true, title: 'KTP PJ', imageUrl: profileDocs.ktpDoc || '' })}
                      >
                        <img src={profileDocs.ktpDoc} alt="Doc 2" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-xs">👁️ Lihat Preview</span>
                        </div>
                      </div>
                      <label className="block w-full py-2 text-center bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-xs">
                        ✏️ Ubah KTP
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUpdateDoc('ktpDoc', e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Doc 3 */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Foto Fisik</span>
                    <strong className="text-sm font-black text-[#1B3A5C] block min-h-[40px]">
                      {isBeneficiary ? 'Plang Yayasan & Anak Asuh' : 'Posko / Basecamp Komunitas'}
                    </strong>
                    <div className="space-y-2 mt-auto">
                      <div 
                        className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 cursor-pointer hover:opacity-90 relative group"
                        onClick={() => setLightboxModal({ isOpen: true, title: 'Foto Fisik', imageUrl: profileDocs.storePhoto || '' })}
                      >
                        <img src={profileDocs.storePhoto} alt="Doc 3" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-xs">👁️ Lihat Preview</span>
                        </div>
                      </div>
                      <label className="block w-full py-2 text-center bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-xs">
                        ✏️ Ubah Foto Fisik
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUpdateDoc('storePhoto', e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal Add Store Driver */}
      {addDriverModal && (
        <Modal
          isOpen={addDriverModal}
          onClose={() => setAddDriverModal(false)}
          title="Tambah Driver Armada Toko Internal"
          size="md"
        >
          <form onSubmit={handleAddDriverSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Driver:</label>
              <Input
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                placeholder="Contoh: Mas Doni"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Driver:</label>
              <Input
                type="tel"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                placeholder="Contoh: 0812-3456-7890"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jenis Kendaraan:</label>
              <select
                value={newDriver.vehicleType}
                onChange={(e) => setNewDriver({ ...newDriver, vehicleType: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs"
              >
                <option value="Sepeda Motor Box Cooler (Steril)">Sepeda Motor Box Cooler (Steril)</option>
                <option value="Mobil Blind Van Pendingin">Mobil Blind Van Pendingin</option>
                <option value="Sepeda Motor Standar">Sepeda Motor Standar</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Plat Nomor Kendaraan:</label>
              <Input
                value={newDriver.plateNumber}
                onChange={(e) => setNewDriver({ ...newDriver, plateNumber: e.target.value })}
                placeholder="Contoh: L 4582 ABC"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setAddDriverModal(false)}>
                Batal
              </Button>
              <Button variant="gold" size="sm" type="submit" className="font-black">
                Simpan & Verifikasi OTP WA ➔
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal OTP Verification WhatsApp */}
      {otpModal.isOpen && (
        <Modal
          isOpen={otpModal.isOpen}
          onClose={() => setOtpModal({ isOpen: false, fleetId: '', phone: '', driverName: '', sentOtp: '', inputOtp: '' })}
          title={`Verifikasi WhatsApp Driver: ${otpModal.driverName}`}
          size="sm"
        >
          <div className="space-y-4 text-center text-xs">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
              📲
            </div>

            <div className="space-y-1">
              <p className="text-slate-600">
                Kode OTP telah dikirimkan ke WhatsApp <strong>{otpModal.phone}</strong>.
              </p>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-mono text-[11px]">
                Simulasi Kode OTP: <strong>{otpModal.sentOtp}</strong>
              </div>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otpModal.inputOtp}
                onChange={(e) => setOtpModal({ ...otpModal, inputOtp: e.target.value })}
                placeholder="Masukkan 6 Digit OTP"
                className="w-full p-3 text-center tracking-widest font-mono text-base font-black border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOtpModal({ isOpen: false, fleetId: '', phone: '', driverName: '', sentOtp: '', inputOtp: '' })}
              >
                Batal
              </Button>
              <Button variant="gold" size="sm" className="font-black" onClick={handleVerifyOtp}>
                Verifikasi ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox Modal for Driver Documents */}
      {lightboxModal.isOpen && (
        <Modal
          isOpen={lightboxModal.isOpen}
          onClose={() => setLightboxModal({ isOpen: false, title: '', imageUrl: '' })}
          title={lightboxModal.title}
          size="md"
        >
          <div className="space-y-3 text-center">
            <img
              src={lightboxModal.imageUrl}
              alt={lightboxModal.title}
              className="w-full max-h-96 object-contain rounded-2xl border border-slate-200"
            />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setLightboxModal({ isOpen: false, title: '', imageUrl: '' })}>
                Tutup Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Alert */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
