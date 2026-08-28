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

export default function DashboardProfilePage() {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'AKUN' | 'OUTLET' | 'LEGALITAS'>('AKUN');

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
    qrisBank: 'Bank Mandiri / BCA',
    qrisAccountNo: '141-00-9812401-2',
    qrisNmid: 'ID1020304050607',
  });

  // Store Fleet Drivers
  const [storeDrivers, setStoreDrivers] = useState([
    { id: 'drv-1', name: 'Mas Doni', vehicle: 'Sepeda Motor Box Cooler (Plat L 4582 ABC)', phone: '0812-3456-7891', status: 'VERIFIED' },
    { id: 'drv-2', name: 'Mas Agus', vehicle: 'Mobil Blind Van Pendingin (Plat L 1234 XYZ)', phone: '0813-9876-5432', status: 'VERIFIED' },
  ]);

  const [addDriverModal, setAddDriverModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: '' });

  const [toastState, setToastState] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error',
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
      };
      localStorage.setItem('replate_onboarding_profile', JSON.stringify(updated));
      setToastState({
        isOpen: true,
        message: 'Pengaturan profil dan identitas akun berhasil diperbarui secara permanen!',
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

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone) return;
    setStoreDrivers((prev) => [
      ...prev,
      {
        id: `drv-${Date.now()}`,
        name: newDriver.name,
        phone: newDriver.phone,
        vehicle: newDriver.vehicle || 'Sepeda Motor Box (Plat L Standar)',
        status: 'VERIFIED',
      },
    ]);
    setNewDriver({ name: '', phone: '', vehicle: '' });
    setAddDriverModal(false);
    setToastState({
      isOpen: true,
      message: `Driver "${newDriver.name}" berhasil didaftarkan ke armada outlet toko!`,
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            MANAJEMEN IDENTITAS, OPERASIONAL & PENGATURAN TERPADU
          </span>
          <h1 className="text-2xl font-black text-[#1B3A5C]">Profil & Pengaturan Akun</h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola data akun, konfigurasi operasional toko/outlet, audit verifikasi BPOM, dan kelola driver armada internal.
          </p>
        </div>

        <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-xs ${roleInfo.bg}`}>
          ✓ {roleInfo.label}
        </span>
      </div>

      {/* 3 Core Navigation Tabs */}
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
          👤 Identitas Akun & Profil
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
            🏬 Operasional Toko & Armada Driver
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
          🛡️ Legalitas & Verifikasi BPOM
        </button>
      </div>

      {/* TAB 1: IDENTITAS AKUN & PROFIL */}
      {activeTab === 'AKUN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Profile Card */}
          <div className="space-y-6">
            <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
              <Avatar name={profileData.name} size="xl" className="mx-auto border-4 border-[#1B3A5C]" />
              <div>
                <h3 className="font-extrabold text-base text-[#1B3A5C]">{profileData.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{profileData.email}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Status Verifikasi:</span>
                  <span className="font-black text-emerald-600">✓ Terverifikasi BPOM & NIB</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Wilayah Operasional:</span>
                  <strong className="text-slate-800">Surabaya Raya</strong>
                </div>
              </div>
            </Card>

            {/* Help & SOP Box */}
            <Card className="p-5 bg-[#1B3A5C] text-white rounded-3xl border border-[#2C5A8F] shadow-md space-y-3">
              <h4 className="text-xs font-black text-[#D4A843] uppercase tracking-wider">
                Pusat Edukasi & Regulasi
              </h4>
              <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                Pelajari regulasi BPOM RI, standar higienitas makanan, dan simulasi dampak lingkungan resmi:
              </p>
              <Link href="/dashboard/info" className="block">
                <div className="p-2.5 bg-[#142C47] hover:bg-[#0D1E32] rounded-xl border border-[#2C5A8F] text-xs font-bold text-slate-100 flex items-center justify-between transition-all">
                  <span>Pusat Informasi & SOP ➔</span>
                </div>
              </Link>
            </Card>
          </div>

          {/* Right: Edit Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3">
                Informasi Kontak & Entitas
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nama Kontak / Penanggung Jawab:</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nama Toko / Lembaga / Panti:</label>
                    <input
                      type="text"
                      value={profileData.entityName}
                      onChange={(e) => setProfileData({ ...profileData, entityName: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Email Terdaftar:</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nomor WhatsApp Aktif:</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
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

      {/* TAB 2: OPERASIONAL TOKO & ARMADA DRIVER (PENGATURAN OUTLET TERPADU) */}
      {activeTab === 'OUTLET' && isProvider && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operational Times & Business Category */}
            <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>🕒 Jam Operasional & Pengambilan Surplus</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Jam Standar Penjemputan Makanan:</label>
                  <input
                    type="text"
                    value={profileData.pickupHours}
                    onChange={(e) => setProfileData({ ...profileData, pickupHours: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                    placeholder="Contoh: 19:00 - 22:00 WIB"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Waktu saat konsumen/kurir relawan dapat mengambil pesanan di kasir toko Anda.
                  </span>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Kategori Usaha:</label>
                  <input
                    type="text"
                    value={profileData.businessCategory}
                    disabled
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 cursor-not-allowed text-xs"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Metode Pengiriman yang Didukung:</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-emerald-800 block">✓ Ambil Mandiri di Toko (Self-Pickup)</span>
                    <span className="text-xs font-bold text-purple-800 block">✓ Kurir Relawan Replate (Auto-Assigned)</span>
                    <span className="text-xs font-bold text-blue-800 block">✓ Armada Toko Direct (Driver Mas Doni & Mas Agus)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* QRIS Merchant & Settlement Account */}
            <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>💳 Rekening Pencairan Dana & QRIS Toko</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Bank Rekening Mitra:</label>
                  <input
                    type="text"
                    value={profileData.qrisBank}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                    onChange={(e) => setProfileData({ ...profileData, qrisBank: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Nomor Rekening Pencairan Penjualan:</label>
                  <input
                    type="text"
                    value={profileData.qrisAccountNo}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-mono font-bold text-xs"
                    onChange={(e) => setProfileData({ ...profileData, qrisAccountNo: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">NMID QRIS Standar Bank Indonesia:</label>
                  <input
                    type="text"
                    value={profileData.qrisNmid}
                    disabled
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 cursor-not-allowed text-xs"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Manage Store Fleet Drivers Section */}
          <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-lg text-[#1B3A5C]">
                  🚚 Kelola Armada Driver Internal Toko Anda
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Daftarkan staf atau kurir internal Anda untuk pengantaran donasi / pesanan berstatus Armada Toko.
                </p>
              </div>

              <Button
                variant="gold"
                size="sm"
                className="font-black text-slate-950 text-xs shadow-xs"
                onClick={() => setAddDriverModal(true)}
              >
                + Tambah Driver Baru
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {storeDrivers.map((driver) => (
                <div key={driver.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md uppercase">
                      ✓ TERDAFTAR RESMI
                    </span>
                    <h4 className="font-extrabold text-sm text-[#1B3A5C] mt-1">{driver.name}</h4>
                    <p className="text-xs text-slate-600 font-medium">{driver.vehicle}</p>
                    <p className="text-xs font-mono text-slate-500">WA: {driver.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: LEGALITAS & AUDIT VERIFIKASI BPOM */}
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
                    Status Verifikasi BPOM & Legalitas Usaha
                  </h3>
                  <Badge variant="success" size="sm">
                    VERIFIED BPOM RI
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Informasi mengenai arti lencana &quot;Verified BPOM&quot; dan status audit dapur Anda di Replate.
                </p>
              </div>
            </div>

            {/* Explanation Box: Apa itu Verified BPOM & Cara Mendapatkannya */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 text-emerald-950">
                <strong className="text-sm font-black text-emerald-900 block">
                  1. Apa Maksud Badge &quot;Verified BPOM&quot;?
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

            {/* Document Details Table */}
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
          <form onSubmit={handleAddDriver} className="space-y-4 text-xs">
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
              <label className="font-bold text-slate-700 block mb-1">Jenis Kendaraan & Plat Nomor:</label>
              <Input
                value={newDriver.vehicle}
                onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                placeholder="Contoh: Motor Box Cooler (L 1234 XY)"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setAddDriverModal(false)}>
                Batal
              </Button>
              <Button variant="gold" size="sm" type="submit" className="font-black">
                Simpan Driver ➔
              </Button>
            </div>
          </form>
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
