'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Toast } from '@/components/ui/Toast';

export default function DashboardProfilePage() {
  const { data: session } = useSession();

  const [profileData, setProfileData] = useState({
    name: 'Pengguna Replate',
    email: 'user@replate.id',
    role: 'FOOD_CONSUMER',
    phone: '0812-3456-7890',
    address: 'Surabaya, Jawa Timur',
    entityName: 'Personal Account',
    isVerified: true,
  });

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
          phone: parsed.phone || prev.phone,
          address: parsed.address || prev.address,
        }));
      }
    } catch (_) {}
  }, [session]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('replate_onboarding_profile', JSON.stringify(profileData));
      setToastState({
        isOpen: true,
        message: '✓ Pengaturan profil dan preferensi berhasil disimpan.',
        type: 'success',
      });
    } catch (_) {}
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'FOOD_PROVIDER':
        return { label: 'Food Provider (Penyedia)', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'FOOD_BENEFICIARY':
        return { label: 'Food Beneficiary (Yayasan / Panti)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'RESCUE_VOLUNTEER':
        return { label: 'Food Rescue Volunteer (Kurir)', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'SUPER_ADMIN':
        return { label: 'Super Administrator', bg: 'bg-red-100 text-red-900 border-red-300' };
      default:
        return { label: 'Food Consumer (Konsumen)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
  };

  const roleInfo = getRoleBadge(profileData.role);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            MANAJEMEN AKUN & PANDUAN PLATFORM
          </span>
          <h2 className="text-2xl font-black text-[#1B3A5C]">Profil & Pengaturan Akun</h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola identitas, pantau legalitas, dan pelajari panduan operasional tanpa perlu keluar workspace.
          </p>
        </div>

        <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-xs ${roleInfo.bg}`}>
          ✓ {roleInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Links */}
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
                <span className="font-black text-emerald-600">✓ Terverifikasi</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Wilayah Operasi:</span>
                <strong className="text-slate-800">Surabaya Raya</strong>
              </div>
            </div>
          </Card>

          {/* Quick Informational Center Links */}
          <Card className="p-5 bg-[#1B3A5C] text-white rounded-3xl border border-[#2C5A8F] shadow-md space-y-3">
            <h4 className="text-xs font-black text-[#D4A843] uppercase tracking-wider">
              📚 Pusat Edukasi & Bantuan
            </h4>
            <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
              Pelajari panduan cara kerja, regulasi SOP BPOM, dan kalkulasi jejak karbon IPCC langsung di dalam akun Anda:
            </p>

            <div className="space-y-2 pt-1">
              <Link href="/dashboard/how-it-works" className="block">
                <div className="p-2.5 bg-[#142C47] hover:bg-[#0D1E32] rounded-xl border border-[#2C5A8F] text-xs font-bold text-slate-100 flex items-center justify-between transition-all">
                  <span>📖 Panduan Cara Kerja</span>
                  <span className="text-[#D4A843]">➔</span>
                </div>
              </Link>

              <Link href="/dashboard/faq" className="block">
                <div className="p-2.5 bg-[#142C47] hover:bg-[#0D1E32] rounded-xl border border-[#2C5A8F] text-xs font-bold text-slate-100 flex items-center justify-between transition-all">
                  <span>❓ FAQ & Pusat Bantuan 24/7</span>
                  <span className="text-[#D4A843]">➔</span>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3">
              Informasi Akun & Entitas
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 block">Nama Lengkap / Kontak PJ:</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 block">Nama Entitas / Resto / Panti:</label>
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

          {/* SOP BPOM & Standar Higienitas Card */}
          <Card className="p-6 bg-slate-50 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-[#1B3A5C] uppercase tracking-wider">
              🛡️ Kepatuhan Regulasi Pangan BPOM & Sertifikasi Replate
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Seluruh transaksi surplus dan bantuan pangan di akun Anda dilindungi oleh protokol kelayakan 8-poin BPOM RI, termasuk batas aman suhu simpan, inspeksi visual, serta surat jalan digital terenkripsi.
            </p>
          </Card>
        </div>
      </div>

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
