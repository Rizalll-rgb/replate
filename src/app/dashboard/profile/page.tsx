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
    province: 'Jawa Timur',
    city: 'Kota Surabaya',
    district: 'Gubeng',
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
    lat: -7.2754,
    lng: 112.7541,
    waAlerts: true,
    autoMatchPanti: true,
  });

  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [activeIslandTab, setActiveIslandTab] = useState<'SEMUA' | 'JABODETABEK' | 'JATENG_DIY' | 'JATIM' | 'SUMATERA' | 'BALI_NUSA' | 'KALIMANTAN' | 'SULAWESI_PAPUA'>('SEMUA');

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

                {/* Indonesian Regional Hierarchy (Province, City, District) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Provinsi di Indonesia:</label>
                    <select
                      value={profileData.province}
                      onChange={(e) => {
                        const prov = e.target.value;
                        const provCenterMap: Record<string, { lat: number; lng: number }> = {
                          'DKI Jakarta': { lat: -6.2088, lng: 106.8456 },
                          'Jawa Barat': { lat: -6.9175, lng: 107.6191 },
                          'Jawa Tengah': { lat: -6.9932, lng: 110.4203 },
                          'DI Yogyakarta': { lat: -7.7956, lng: 110.3695 },
                          'Jawa Timur': { lat: -7.2754, lng: 112.7541 },
                          'Banten': { lat: -6.1104, lng: 106.1554 },
                          'Bali': { lat: -8.6705, lng: 115.2126 },
                          'Sumatera Utara': { lat: 3.5952, lng: 98.6722 },
                          'Sumatera Barat': { lat: -0.9471, lng: 100.4172 },
                          'Riau': { lat: 0.5071, lng: 101.4478 },
                          'Kepulauan Riau': { lat: 1.1301, lng: 104.0529 },
                          'Sumatera Selatan': { lat: -2.9909, lng: 104.7565 },
                          'Lampung': { lat: -5.4297, lng: 105.2625 },
                          'Kalimantan Timur': { lat: -0.9634, lng: 116.7058 },
                          'Kalimantan Selatan': { lat: -3.3194, lng: 114.5908 },
                          'Kalimantan Barat': { lat: -0.0263, lng: 109.3425 },
                          'Sulawesi Selatan': { lat: -5.1477, lng: 119.4327 },
                          'Sulawesi Utara': { lat: 1.4748, lng: 124.8428 },
                          'Nusa Tenggara Barat': { lat: -8.5833, lng: 116.1167 },
                          'Papua': { lat: -2.5916, lng: 140.6690 },
                        };
                        const center = provCenterMap[prov] || { lat: -7.2754, lng: 112.7541 };
                        setProfileData(prev => ({ ...prev, province: prov, lat: center.lat, lng: center.lng }));
                        setToastState({ isOpen: true, message: `Peta dipusatkan ke Provinsi ${prov}!`, type: 'success' });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#D4A843]"
                    >
                      <option value="Jawa Timur">Jawa Timur</option>
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="Jawa Tengah">Jawa Tengah</option>
                      <option value="DI Yogyakarta">DI Yogyakarta</option>
                      <option value="Banten">Banten</option>
                      <option value="Bali">Bali</option>
                      <option value="Sumatera Utara">Sumatera Utara</option>
                      <option value="Sumatera Barat">Sumatera Barat</option>
                      <option value="Riau">Riau</option>
                      <option value="Kepulauan Riau">Kepulauan Riau (Batam)</option>
                      <option value="Sumatera Selatan">Sumatera Selatan</option>
                      <option value="Lampung">Lampung</option>
                      <option value="Kalimantan Timur">Kalimantan Timur (IKN)</option>
                      <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                      <option value="Kalimantan Barat">Kalimantan Barat</option>
                      <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                      <option value="Sulawesi Utara">Sulawesi Utara</option>
                      <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
                      <option value="Papua">Papua</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Kota / Kabupaten:</label>
                    <Input
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      placeholder="Contoh: Kota Surabaya / Jakarta Selatan / Bandung"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Kecamatan:</label>
                    <Input
                      value={profileData.district}
                      onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                      placeholder="Contoh: Gubeng / Kebayoran Baru / Coblong"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 block">Alamat Lengkap Outlet / Resto:</label>
                  <textarea
                    rows={2}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="Nama Jalan, Nomor Bangunan, Kelurahan, Patokan Lokasi..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D4A843]"
                  />
                </div>

                {/* GPS Location & Visual Interactive Map Pin Picker (Skala Nasional Indonesia) */}
                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="font-black text-slate-900 text-sm block">
                          🗺️ Peta Interaktif GPS Outlet (Cakupan Nasional Indonesia):
                        </label>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black rounded-md">
                          🇮🇩 Seluruh Nusantara
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Cari alamat di seluruh kota di Indonesia, klik langsung pada peta luas, atau perbesar layar penuh.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="px-3.5 py-1.5 bg-[#D4A843] hover:bg-[#c49835] text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>🖥️ Mode Layar Penuh (Perbesar)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== 'undefined' && navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                setProfileData(prev => ({
                                  ...prev,
                                  lat: Number(pos.coords.latitude.toFixed(5)),
                                  lng: Number(pos.coords.longitude.toFixed(5)),
                                }));
                                setToastState({ isOpen: true, message: 'Titik GPS berhasil disinkronkan ke lokasi presisi Anda!', type: 'success' });
                              },
                              () => {
                                setProfileData(prev => ({ ...prev, lat: -7.2754, lng: 112.7541 }));
                                setToastState({ isOpen: true, message: 'Koordinat GPS diset default', type: 'success' });
                              }
                            );
                          }
                        }}
                        className="px-3.5 py-1.5 bg-[#1B3A5C] hover:bg-[#142C47] text-[#D4A843] text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                      >
                        <span>📍 Deteksi GPS Saya</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Bar for ANY Indonesian City / Address / Landmark */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ketik alamat jalan, kota, mall di Indonesia (contoh: Sudirman Jakarta, Malioboro Jogja, Dago Bandung, IKN Sepaku, Losari Makassar, Kuta Bali)..."
                        value={mapSearchQuery}
                        onChange={(e) => setMapSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const query = mapSearchQuery.toLowerCase();
                            const nationalLandmarks = [
                              // Jabodetabek & Jabar
                              { key: 'jakarta', name: 'DKI Jakarta (Monas / Thamrin)', lat: -6.1754, lng: 106.8272 },
                              { key: 'monas', name: 'Monas, Jakarta Pusat', lat: -6.1754, lng: 106.8272 },
                              { key: 'scbd', name: 'SCBD, Jakarta Selatan', lat: -6.2297, lng: 106.8074 },
                              { key: 'senopati', name: 'Senopati, Jakarta Selatan', lat: -6.2341, lng: 106.8123 },
                              { key: 'bandung', name: 'Kota Bandung (Jl. Riau / Dago)', lat: -6.9039, lng: 107.6186 },
                              { key: 'dago', name: 'Dago, Bandung', lat: -6.8833, lng: 107.6144 },
                              { key: 'bekasi', name: 'Summarecon Bekasi', lat: -6.2383, lng: 106.9756 },
                              { key: 'tangerang', name: 'BSD City, Tangerang Selatan', lat: -6.3016, lng: 106.6524 },
                              { key: 'bsd', name: 'BSD City, Tangerang Selatan', lat: -6.3016, lng: 106.6524 },
                              { key: 'depok', name: 'Margonda Raya, Depok', lat: -6.3728, lng: 106.8335 },
                              { key: 'bogor', name: 'Pajajaran, Kota Bogor', lat: -6.5971, lng: 106.8060 },
                              // Jateng & DIY
                              { key: 'semarang', name: 'Simpang Lima, Semarang', lat: -6.9904, lng: 110.4228 },
                              { key: 'solo', name: 'Slamet Riyadi, Solo / Surakarta', lat: -7.5666, lng: 110.8166 },
                              { key: 'surakarta', name: 'Slamet Riyadi, Solo / Surakarta', lat: -7.5666, lng: 110.8166 },
                              { key: 'jogja', name: 'Malioboro, Kota Yogyakarta', lat: -7.7956, lng: 110.3695 },
                              { key: 'yogyakarta', name: 'Malioboro, Kota Yogyakarta', lat: -7.7956, lng: 110.3695 },
                              { key: 'malioboro', name: 'Malioboro, Kota Yogyakarta', lat: -7.7956, lng: 110.3695 },
                              // Jatim
                              { key: 'surabaya', name: 'Kota Surabaya (Gubeng / Darmo)', lat: -7.2754, lng: 112.7541 },
                              { key: 'gubeng', name: 'Raya Gubeng / Siloam, Surabaya', lat: -7.2754, lng: 112.7541 },
                              { key: 'darmo', name: 'Raya Darmo / Taman Bungkul, Surabaya', lat: -7.2920, lng: 112.7390 },
                              { key: 'tunjungan', name: 'Tunjungan Plaza, Surabaya', lat: -7.2580, lng: 112.7440 },
                              { key: 'malang', name: 'Kota Malang (Ijen / Tugu)', lat: -7.9797, lng: 112.6304 },
                              { key: 'sidoarjo', name: 'Alun-Alun Sidoarjo', lat: -7.4478, lng: 112.7183 },
                              { key: 'gresik', name: 'Gresik Kota Baru', lat: -7.1566, lng: 112.6555 },
                              // Sumatera
                              { key: 'medan', name: 'Merdeka Walk, Kota Medan', lat: 3.5952, lng: 98.6722 },
                              { key: 'palembang', name: 'Jembatan Ampera, Palembang', lat: -2.9909, lng: 104.7565 },
                              { key: 'batam', name: 'Batam Centre / Nagoya', lat: 1.1301, lng: 104.0529 },
                              { key: 'pekanbaru', name: 'Jl. Sudirman, Pekanbaru', lat: 0.5071, lng: 101.4478 },
                              { key: 'padang', name: 'Pantai Padang, Kota Padang', lat: -0.9471, lng: 100.4172 },
                              { key: 'lampung', name: 'Tanjung Karang, Bandar Lampung', lat: -5.4297, lng: 105.2625 },
                              { key: 'aceh', name: 'Masjid Raya Baiturrahman, Banda Aceh', lat: 5.5483, lng: 95.3238 },
                              // Bali & Nusa Tenggara
                              { key: 'bali', name: 'Kuta / Seminyak, Bali', lat: -8.7185, lng: 115.1686 },
                              { key: 'denpasar', name: 'Renon, Kota Denpasar', lat: -8.6705, lng: 115.2126 },
                              { key: 'kuta', name: 'Pantai Kuta, Badung, Bali', lat: -8.7185, lng: 115.1686 },
                              { key: 'mataram', name: 'Lombok Epicentrum, Mataram', lat: -8.5833, lng: 116.1167 },
                              { key: 'lombok', name: 'Lombok Epicentrum, Mataram', lat: -8.5833, lng: 116.1167 },
                              // Kalimantan & IKN
                              { key: 'ikn', name: 'KIPP Ibu Kota Nusantara (IKN Sepaku)', lat: -0.9634, lng: 116.7058 },
                              { key: 'nusantara', name: 'KIPP Ibu Kota Nusantara (IKN Sepaku)', lat: -0.9634, lng: 116.7058 },
                              { key: 'balikpapan', name: 'Sudirman / Permai, Balikpapan', lat: -1.2379, lng: 116.8529 },
                              { key: 'samarinda', name: 'Tepian Mahakam, Samarinda', lat: -0.5022, lng: 117.1536 },
                              { key: 'banjarmasin', name: 'Menara Pandang, Banjarmasin', lat: -3.3194, lng: 114.5908 },
                              { key: 'pontianak', name: 'Tugu Khatulistiwa, Pontianak', lat: -0.0263, lng: 109.3425 },
                              // Sulawesi & Papua
                              { key: 'makassar', name: 'Pantai Losari / Pettarani, Makassar', lat: -5.1477, lng: 119.4327 },
                              { key: 'losari', name: 'Pantai Losari, Makassar', lat: -5.1477, lng: 119.4327 },
                              { key: 'manado', name: 'Boulevard / Malalayang, Manado', lat: 1.4748, lng: 124.8428 },
                              { key: 'jayapura', name: 'Teluk Youtefa / Abepura, Jayapura', lat: -2.5916, lng: 140.6690 },
                              { key: 'ambon', name: 'Pattimura Park, Kota Ambon', lat: -3.6954, lng: 128.1814 },
                            ];
                            const found = nationalLandmarks.find(l => query.includes(l.key));
                            if (found) {
                              setProfileData(prev => ({ ...prev, lat: found.lat, lng: found.lng }));
                              setToastState({ isOpen: true, message: `Pin dipindahkan ke ${found.name}!`, type: 'success' });
                            } else {
                              setToastState({ isOpen: true, message: `Mencari "${mapSearchQuery}" di peta Indonesia...`, type: 'success' });
                            }
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const query = (mapSearchQuery || '').toLowerCase();
                        const nationalLandmarks = [
                          { key: 'jakarta', name: 'DKI Jakarta (Monas / Thamrin)', lat: -6.1754, lng: 106.8272 },
                          { key: 'bandung', name: 'Kota Bandung (Jl. Riau / Dago)', lat: -6.9039, lng: 107.6186 },
                          { key: 'semarang', name: 'Simpang Lima, Semarang', lat: -6.9904, lng: 110.4228 },
                          { key: 'jogja', name: 'Malioboro, Kota Yogyakarta', lat: -7.7956, lng: 110.3695 },
                          { key: 'surabaya', name: 'Kota Surabaya (Gubeng / Darmo)', lat: -7.2754, lng: 112.7541 },
                          { key: 'malang', name: 'Kota Malang (Ijen / Tugu)', lat: -7.9797, lng: 112.6304 },
                          { key: 'medan', name: 'Merdeka Walk, Kota Medan', lat: 3.5952, lng: 98.6722 },
                          { key: 'palembang', name: 'Jembatan Ampera, Palembang', lat: -2.9909, lng: 104.7565 },
                          { key: 'batam', name: 'Batam Centre / Nagoya', lat: 1.1301, lng: 104.0529 },
                          { key: 'bali', name: 'Kuta / Seminyak, Bali', lat: -8.7185, lng: 115.1686 },
                          { key: 'denpasar', name: 'Renon, Kota Denpasar', lat: -8.6705, lng: 115.2126 },
                          { key: 'ikn', name: 'KIPP Ibu Kota Nusantara (IKN Sepaku)', lat: -0.9634, lng: 116.7058 },
                          { key: 'balikpapan', name: 'Sudirman / Permai, Balikpapan', lat: -1.2379, lng: 116.8529 },
                          { key: 'makassar', name: 'Pantai Losari / Pettarani, Makassar', lat: -5.1477, lng: 119.4327 },
                          { key: 'manado', name: 'Boulevard / Malalayang, Manado', lat: 1.4748, lng: 124.8428 },
                          { key: 'jayapura', name: 'Teluk Youtefa / Abepura, Jayapura', lat: -2.5916, lng: 140.6690 },
                        ];
                        const found = nationalLandmarks.find(l => query.includes(l.key));
                        if (found) {
                          setProfileData(prev => ({ ...prev, lat: found.lat, lng: found.lng }));
                          setToastState({ isOpen: true, message: `Pin dipindahkan ke ${found.name}!`, type: 'success' });
                        } else {
                          setToastState({ isOpen: true, message: `Lokasi "${mapSearchQuery || 'Indonesia'}" dipetakan!`, type: 'success' });
                        }
                      }}
                      className="px-4 py-2.5 bg-[#1B3A5C] text-white font-black text-xs rounded-xl hover:bg-[#142C47] transition-all cursor-pointer shrink-0"
                    >
                      🔍 Cari Lokasi
                    </button>
                  </div>

                  {/* Regional Tabs for 8 Regions Across Indonesia */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {[
                        { key: 'SEMUA', label: '🇮🇩 Seluruh Nusantara' },
                        { key: 'JABODETABEK', label: '🏙️ Jabodetabek & Jabar' },
                        { key: 'JATENG_DIY', label: '🏛️ Jateng & DIY' },
                        { key: 'JATIM', label: '🌊 Jawa Timur' },
                        { key: 'SUMATERA', label: '🌴 Sumatera' },
                        { key: 'BALI_NUSA', label: '🏖️ Bali & Nusa Tenggara' },
                        { key: 'KALIMANTAN', label: '🌳 Kalimantan & IKN' },
                        { key: 'SULAWESI_PAPUA', label: '⛰️ Sulawesi & Papua' },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveIslandTab(tab.key as any)}
                          className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                            activeIslandTab === tab.key
                              ? 'bg-[#1B3A5C] text-[#D4A843] shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Quick Landmark & City Pills Across Indonesia */}
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200">
                      {[
                        // JABODETABEK & JABAR
                        { name: '📍 Jakarta Pusat (Monas)', region: 'JABODETABEK', lat: -6.1754, lng: 106.8272 },
                        { name: '📍 Jakarta Selatan (SCBD)', region: 'JABODETABEK', lat: -6.2297, lng: 106.8074 },
                        { name: '📍 Bandung (Dago / Riau)', region: 'JABODETABEK', lat: -6.9039, lng: 107.6186 },
                        { name: '📍 Tangerang Selatan (BSD City)', region: 'JABODETABEK', lat: -6.3016, lng: 106.6524 },
                        { name: '📍 Bekasi (Summarecon)', region: 'JABODETABEK', lat: -6.2383, lng: 106.9756 },
                        { name: '📍 Bogor (Pajajaran)', region: 'JABODETABEK', lat: -6.5971, lng: 106.8060 },
                        
                        // JATENG & DIY
                        { name: '📍 Semarang (Simpang Lima)', region: 'JATENG_DIY', lat: -6.9904, lng: 110.4228 },
                        { name: '📍 Solo / Surakarta (Slamet Riyadi)', region: 'JATENG_DIY', lat: -7.5666, lng: 110.8166 },
                        { name: '📍 Yogyakarta (Malioboro)', region: 'JATENG_DIY', lat: -7.7956, lng: 110.3695 },
                        { name: '📍 Sleman, DIY (UGM / Kaliurang)', region: 'JATENG_DIY', lat: -7.7713, lng: 110.3775 },
                        
                        // JATIM
                        { name: '📍 Surabaya (Gubeng / Darmo)', region: 'JATIM', lat: -7.2754, lng: 112.7541 },
                        { name: '📍 Malang (Ijen / Tugu)', region: 'JATIM', lat: -7.9797, lng: 112.6304 },
                        { name: '📍 Sidoarjo (Alun-Alun)', region: 'JATIM', lat: -7.4478, lng: 112.7183 },
                        { name: '📍 Gresik (Gresik Kota Baru)', region: 'JATIM', lat: -7.1566, lng: 112.6555 },
                        { name: '📍 Kediri (Jl. Dhoho)', region: 'JATIM', lat: -7.8166, lng: 112.0166 },
                        
                        // SUMATERA
                        { name: '📍 Medan (Merdeka Walk)', region: 'SUMATERA', lat: 3.5952, lng: 98.6722 },
                        { name: '📍 Palembang (Jembatan Ampera)', region: 'SUMATERA', lat: -2.9909, lng: 104.7565 },
                        { name: '📍 Batam (Batam Centre / Nagoya)', region: 'SUMATERA', lat: 1.1301, lng: 104.0529 },
                        { name: '📍 Pekanbaru (Jl. Sudirman)', region: 'SUMATERA', lat: 0.5071, lng: 101.4478 },
                        { name: '📍 Padang (Pantai Padang)', region: 'SUMATERA', lat: -0.9471, lng: 100.4172 },
                        { name: '📍 Bandar Lampung (Tj. Karang)', region: 'SUMATERA', lat: -5.4297, lng: 105.2625 },
                        { name: '📍 Banda Aceh (Baiturrahman)', region: 'SUMATERA', lat: 5.5483, lng: 95.3238 },
                        
                        // BALI & NUSA
                        { name: '📍 Denpasar (Renon / Sanur)', region: 'BALI_NUSA', lat: -8.6705, lng: 115.2126 },
                        { name: '📍 Badung (Kuta / Seminyak / Canggu)', region: 'BALI_NUSA', lat: -8.7185, lng: 115.1686 },
                        { name: '📍 Mataram (Lombok Epicentrum)', region: 'BALI_NUSA', lat: -8.5833, lng: 116.1167 },
                        { name: '📍 Kupang (Pantai Lasiana)', region: 'BALI_NUSA', lat: -10.1772, lng: 123.6070 },
                        
                        // KALIMANTAN & IKN
                        { name: '📍 IKN Nusantara (KIPP Sepaku)', region: 'KALIMANTAN', lat: -0.9634, lng: 116.7058 },
                        { name: '📍 Balikpapan (Sudirman / Permai)', region: 'KALIMANTAN', lat: -1.2379, lng: 116.8529 },
                        { name: '📍 Samarinda (Tepian Mahakam)', region: 'KALIMANTAN', lat: -0.5022, lng: 117.1536 },
                        { name: '📍 Banjarmasin (Menara Pandang)', region: 'KALIMANTAN', lat: -3.3194, lng: 114.5908 },
                        { name: '📍 Pontianak (Tugu Khatulistiwa)', region: 'KALIMANTAN', lat: -0.0263, lng: 109.3425 },
                        
                        // SULAWESI & PAPUA
                        { name: '📍 Makassar (Pantai Losari / Pettarani)', region: 'SULAWESI_PAPUA', lat: -5.1477, lng: 119.4327 },
                        { name: '📍 Manado (Boulevard / Malalayang)', region: 'SULAWESI_PAPUA', lat: 1.4748, lng: 124.8428 },
                        { name: '📍 Palu (Teluk Palu)', region: 'SULAWESI_PAPUA', lat: -0.9003, lng: 119.8779 },
                        { name: '📍 Jayapura (Teluk Youtefa / Abepura)', region: 'SULAWESI_PAPUA', lat: -2.5916, lng: 140.6690 },
                        { name: '📍 Ambon (Pattimura Park)', region: 'SULAWESI_PAPUA', lat: -3.6954, lng: 128.1814 },
                        { name: '📍 Sorong (Papua Barat Daya)', region: 'SULAWESI_PAPUA', lat: -0.8762, lng: 131.2558 },
                      ]
                        .filter(loc => activeIslandTab === 'SEMUA' || loc.region === activeIslandTab)
                        .map((loc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setProfileData(prev => ({ ...prev, lat: loc.lat, lng: loc.lng }));
                              setToastState({ isOpen: true, message: `Peta dipindahkan ke ${loc.name}!`, type: 'success' });
                            }}
                            className={`px-2.5 py-1 text-[11px] rounded-lg font-bold border transition-all cursor-pointer ${
                              profileData.lat === loc.lat && profileData.lng === loc.lng
                                ? 'bg-[#1B3A5C] text-[#D4A843] border-[#1B3A5C] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {loc.name}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Visual Large Click-to-Pin Map Viewport (Spacious on Laptop) */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const xPercent = (x / rect.width) - 0.5;
                      const yPercent = (y / rect.height) - 0.5;
                      
                      // Scale offset dynamically according to zoom
                      const zoomScale = Math.pow(2, 16 - mapZoom);
                      const newLng = Number((profileData.lng + (xPercent * 0.012 * zoomScale)).toFixed(5));
                      const newLat = Number((profileData.lat - (yPercent * 0.012 * zoomScale)).toFixed(5));
                      
                      setProfileData(prev => ({ ...prev, lat: newLat, lng: newLng }));
                      setToastState({ isOpen: true, message: `Pin dititikkan ke koordinat (${newLat}, ${newLng})!`, type: 'success' });
                    }}
                    className="relative w-full h-80 sm:h-96 lg:h-[440px] rounded-2xl border-2 border-slate-300 overflow-hidden bg-slate-200 shadow-inner cursor-crosshair group transition-all"
                  >
                    <iframe
                      title="Outlet Map Coordinate Picker"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://maps.google.com/maps?q=${profileData.lat || -7.2754},${profileData.lng || 112.7541}&z=${mapZoom}&output=embed`}
                      className="w-full h-full pointer-events-none filter saturate-125"
                    />

                    {/* Central Target Pin Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center -translate-y-4">
                        <div className="px-2.5 py-1 bg-slate-950/90 text-[#D4A843] rounded-lg font-mono text-[10px] font-black shadow-lg whitespace-nowrap mb-1 border border-slate-700">
                          📍 {profileData.lat || -7.2754}, {profileData.lng || 112.7541}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-sm font-black animate-bounce">
                          📍
                        </div>
                        <div className="w-4 h-2 bg-slate-950/40 rounded-full blur-[1px]"></div>
                      </div>
                    </div>

                    {/* Top Left Helper Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-[#1B3A5C]/95 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>🎯 Klik di titik manapun pada peta untuk memindahkan pin outlet</span>
                    </div>

                    {/* Bottom Right Zoom & Control Buttons */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-xs p-1.5 rounded-xl shadow-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMapZoom(prev => Math.min(19, prev + 1));
                          setToastState({ isOpen: true, message: `Zoom Level: ${Math.min(19, mapZoom + 1)} (Mendekat)`, type: 'success' });
                        }}
                        className="px-2.5 py-1 bg-white/20 hover:bg-white/40 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                        title="Perbesar (Zoom In)"
                      >
                        🔍+ Zoom In
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMapZoom(prev => Math.max(12, prev - 1));
                          setToastState({ isOpen: true, message: `Zoom Level: ${Math.max(12, mapZoom - 1)} (Menjauh)`, type: 'success' });
                        }}
                        className="px-2.5 py-1 bg-white/20 hover:bg-white/40 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                        title="Perkecil (Zoom Out)"
                      >
                        🔍- Zoom Out
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMapModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#D4A843] hover:bg-[#c49835] text-slate-950 font-black text-xs rounded-lg transition-colors cursor-pointer"
                        title="Layar Penuh"
                      >
                        🖥️ Fullscreen
                      </button>
                    </div>
                  </div>

                  {/* Directional Precision Nudge Controls */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-800 block">
                        🕹️ Geser Presisi Pin Koordinat (±100m):
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Gunakan tombol arah mata angin untuk menyempurnakan lokasi gang/titik presisi:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-center sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, lat: Number((prev.lat + 0.0012).toFixed(5)) }));
                          setToastState({ isOpen: true, message: 'Pin digeser ke Utara (+100m)', type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 text-xs font-black cursor-pointer shadow-2xs"
                      >
                        ⬆️ Utara
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, lat: Number((prev.lat - 0.0012).toFixed(5)) }));
                          setToastState({ isOpen: true, message: 'Pin digeser ke Selatan (-100m)', type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 text-xs font-black cursor-pointer shadow-2xs"
                      >
                        ⬇️ Selatan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, lng: Number((prev.lng - 0.0012).toFixed(5)) }));
                          setToastState({ isOpen: true, message: 'Pin digeser ke Barat (-100m)', type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 text-xs font-black cursor-pointer shadow-2xs"
                      >
                        ⬅️ Barat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, lng: Number((prev.lng + 0.0012).toFixed(5)) }));
                          setToastState({ isOpen: true, message: 'Pin digeser ke Timur (+100m)', type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 text-xs font-black cursor-pointer shadow-2xs"
                      >
                        ➡️ Timur
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Latitude:</span>
                      <Input
                        value={profileData.lat || -7.2754}
                        onChange={(e) => setProfileData({ ...profileData, lat: parseFloat(e.target.value) || 0 })}
                        className="font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Longitude:</span>
                      <Input
                        value={profileData.lng || 112.7541}
                        onChange={(e) => setProfileData({ ...profileData, lng: parseFloat(e.target.value) || 0 })}
                        className="font-mono text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/90 rounded-xl border border-blue-200 text-xs text-blue-950 font-medium">
                    🗺️ <strong>Google Maps Precision:</strong> Titik koordinat ini digunakan oleh algoritma Smart Matching Replate untuk menghitung jarak presisi ke panti asuhan & kurir relawan terdekat.
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button variant="gold" size="sm" type="submit" className="font-black text-xs text-slate-950 shadow-md">
                    Simpan Perubahan Identitas ➔
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: OPERASIONAL TOKO & PENGATURAN OUTLET (Point 17 & 18) */}
      {activeTab === 'OUTLET' && isProvider && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Windows & Packaging */}
              <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>⏰ Waktu Operasional & Standar Kemasan</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Batas Waktu Penjemputan Makanan:</label>
                    <Input
                      value={profileData.pickupHours}
                      onChange={(e) => setProfileData({ ...profileData, pickupHours: e.target.value })}
                      placeholder="Contoh: 19:00 - 22:00 WIB"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Standar Kemasan Bawaan:</label>
                    <Input
                      value={profileData.defaultPackaging}
                      onChange={(e) => setProfileData({ ...profileData, defaultPackaging: e.target.value })}
                    />
                  </div>

                  {/* Geofencing Radius Locked (Point 17) */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-extrabold text-slate-800 text-xs">Maksimum Radius Smart Matching:</label>
                      <span className="px-2.5 py-1 bg-[#1B3A5C] text-[#D4A843] text-xs font-black rounded-lg shadow-xs">
                        Radius 5.0 KM (Terkunci Otomatis)
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium space-y-0.5">
                      <span className="font-extrabold block">🔒 Ditetapkan Otomatis oleh Sistem Replate Engine 2.0:</span>
                      <p className="text-[10.5px] leading-relaxed">
                        Untuk menjaga kualitas makanan hangat &gt;60°C dan dingin &lt;4°C sesuai standar BPOM RI, radius geofencing donasi dikunci otomatis maksimal <strong>5.0 KM</strong> dari outlet Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Direct QRIS Payment & Settlement Info (Point 18) */}
              <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>⚡ Sistem Pembayaran Langsung QRIS Dinamis</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1.5 font-medium">
                    <strong className="block font-black text-emerald-900 text-xs">✓ Tanpa Saldo Mengendap (Direct Settlement)</strong>
                    <p className="text-[11px] leading-relaxed">
                      Platform Replate tidak menggunakan sistem penarikan saldo dompet manual. Setiap pembayaran transaksi Rescue Sale langsung diteruskan seketika ke kasir outlet via QRIS Dinamis Standar Bank Indonesia / pembayaran langsung saat serah terima.
                    </p>
                  </div>

                  {/* QRIS Image Preview */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <img
                      src={profileData.qrisImageUrl}
                      alt="QRIS Toko"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-2xs"
                    />
                    <div className="text-[11px] space-y-0.5">
                      <strong className="text-slate-800 block text-xs">QRIS Standar Bank Indonesia</strong>
                      <span className="text-emerald-700 font-bold block">✓ Siap menerima pembayaran Rescue Sale</span>
                      <span className="text-[10px] text-slate-500 block">NMID: ID102030405060 (Terverifikasi)</span>
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
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Nomor Induk Kependudukan (NIK KTP Driver):</label>
              <Input
                type="text"
                placeholder="Contoh: 3578012304900001 (16 Digit)"
                maxLength={16}
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Jenis Kendaraan & Karakteristik Muatan:</label>
              <select
                value={newDriver.vehicleType}
                onChange={(e) => setNewDriver({ ...newDriver, vehicleType: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs"
              >
                <option value="Sepeda Motor Box Cooler (Steril)">Sepeda Motor + Box Cooler Steril (Kapasitas 1-35 Porsi, Suhu Dingin &lt;4°C / Panas &gt;60°C)</option>
                <option value="Mobil Blind Van Pendingin">Mobil Blind Van Pendingin (Kapasitas 35-150 Porsi Besar)</option>
                <option value="Sepeda Motor Standar">Sepeda Motor Standar (Khusus Makanan Kering / Suhu Ruang 1-20 Porsi)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Plat Nomor Kendaraan:</label>
              <Input
                value={newDriver.plateNumber}
                onChange={(e) => setNewDriver({ ...newDriver, plateNumber: e.target.value })}
                placeholder="Contoh: L 4582 ABC"
                required
              />
            </div>

            {/* Document Uploads for SuperAdmin Approval */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="font-extrabold text-[#1B3A5C] text-[11px] block">
                📑 Upload Dokumen Verifikasi Driver (Wajib 4 Dokumen — Diaudit SuperAdmin):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: '1. Foto KTP Driver', key: 'ktp' },
                  { label: '2. Foto SIM C/A Aktif', key: 'sim' },
                  { label: '3. Foto STNK Kendaraan Aktif', key: 'stnk' },
                  { label: '4. Foto Boks Cooler / Bagasi Armada', key: 'armada' },
                ].map((doc) => {
                  const storageKey = `replate_fleet_doc_${doc.key}`;
                  const hasFile = typeof window !== 'undefined' && !!localStorage.getItem(storageKey);
                  return (
                    <div key={doc.key} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5 text-center">
                      <span className="text-[10px] font-bold text-slate-600 block">{doc.label}</span>
                      {hasFile ? (
                        <>
                          <span className="text-[9px] text-emerald-700 font-black block">✓ {doc.key.toUpperCase()}_Driver.jpg</span>
                          <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded block border border-emerald-200">Tersimpan</span>
                        </>
                      ) : (
                        <label className="cursor-pointer block">
                          <span className="text-[9px] text-amber-700 font-bold block">📤 Belum Diunggah</span>
                          <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg inline-block mt-1 font-bold border border-amber-200 hover:bg-amber-100 transition-colors">Pilih File Dokumen</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                localStorage.setItem(storageKey, file.name);
                                // Force re-render
                                setNewDriver({ ...newDriver });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium pt-1">
                🛡️ Dokumen driver akan otomatis masuk ke antrean verifikasi <strong>SuperAdmin Replate</strong>. Setelah diapprove, armada ini langsung dapat dipilih pada penugasan pengantaran langsung.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setAddDriverModal(false)}>
                Batal
              </Button>
              <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950">
                Ajukan Driver & Verifikasi OTP WA ➔
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

      {/* Fullscreen Map Coordinate Picker Modal for Laptop / Desktop Freedom (Point 5) */}
      {isMapModalOpen && (
        <Modal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          title="🗺️ Penentuan Titik Koordinat GPS Outlet (Layar Penuh)"
          size="xl"
        >
          <div className="space-y-3.5 text-xs text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-slate-900 text-white rounded-xl shadow-md">
              <div>
                <strong className="text-[#D4A843] text-sm block">📍 Koordinat Terpilih: {profileData.lat || -7.2754}, {profileData.lng || 112.7541}</strong>
                <span className="text-[11px] text-slate-300">Klik di mana saja pada peta luas ini untuk memindahkan pin lokasi outlet Anda.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMapZoom(prev => Math.min(19, prev + 1))}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/40 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                >
                  🔍+ Zoom In
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom(prev => Math.max(12, prev - 1))}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/40 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                >
                  🔍- Zoom Out
                </button>
                <Button variant="gold" size="sm" className="font-black text-slate-950" onClick={() => setIsMapModalOpen(false)}>
                  ✓ Gunakan Titik Ini
                </Button>
              </div>
            </div>

            {/* Gigantic Interactive Canvas for Laptop */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPercent = (x / rect.width) - 0.5;
                const yPercent = (y / rect.height) - 0.5;
                const zoomScale = Math.pow(2, 16 - mapZoom);
                const newLng = Number((profileData.lng + (xPercent * 0.018 * zoomScale)).toFixed(5));
                const newLat = Number((profileData.lat - (yPercent * 0.018 * zoomScale)).toFixed(5));
                setProfileData(prev => ({ ...prev, lat: newLat, lng: newLng }));
                setToastState({ isOpen: true, message: `Titik pin dipindahkan ke (${newLat}, ${newLng})!`, type: 'success' });
              }}
              className="relative w-full h-[60vh] rounded-2xl border-2 border-slate-300 overflow-hidden bg-slate-200 shadow-inner cursor-crosshair"
            >
              <iframe
                title="Fullscreen Map Coordinate Picker"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://maps.google.com/maps?q=${profileData.lat || -7.2754},${profileData.lng || 112.7541}&z=${mapZoom}&output=embed`}
                className="w-full h-full pointer-events-none filter saturate-125"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center -translate-y-4">
                  <div className="px-3 py-1 bg-slate-950/95 text-[#D4A843] rounded-lg font-mono text-xs font-black shadow-2xl mb-1 border border-slate-700">
                    📍 {profileData.lat || -7.2754}, {profileData.lng || 112.7541}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-base font-black animate-bounce">
                    📍
                  </div>
                  <div className="w-4 h-2 bg-slate-950/40 rounded-full blur-[1px]"></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-medium text-[11px]">
                Tip: Tekan pada peta untuk langsung menitikkan lokasi outlet Anda secara presisi.
              </span>
              <Button variant="gold" size="md" className="font-black text-slate-950 shadow-md" onClick={() => setIsMapModalOpen(false)}>
                ✓ Selesai & Simpan Titik Ini
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
