'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function OnboardingProfilePage() {
  const router = useRouter();

  const [role, setRole] = useState<'FOOD_PROVIDER' | 'FOOD_BENEFICIARY' | 'RESCUE_VOLUNTEER' | 'FOOD_CONSUMER'>('FOOD_PROVIDER');
  const [formData, setFormData] = useState({
    entityName: 'Warung Bakso Pak Kumis Surabaya',
    category: 'RESTAURANT',
    address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya Pusat',
    contactPerson: 'Mas Doni (Penanggung Jawab Outlet)',
    phone: '0812-3456-7890',
    capacity: '50 Porsi / Hari',
    vehiclePlate: 'L 4582 ABC',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryRole = new URLSearchParams(window.location.search).get('role');
      if (queryRole === 'FOOD_BENEFICIARY' || queryRole === 'RESCUE_PARTNER' || queryRole === 'RESCUE_VOLUNTEER') {
        setRole('FOOD_BENEFICIARY');
        setFormData((prev) => ({
          ...prev,
          entityName: 'Panti Asuhan Kasih Ibu Surabaya',
          category: 'YAYASAN_PANTI',
          capacity: '80 Anak Asuh & Lansia',
        }));
      } else if (queryRole === 'VOLUNTEER' || queryRole === 'RESCUE_VOLUNTEER') {
        setRole('RESCUE_VOLUNTEER');
        setFormData((prev) => ({
          ...prev,
          entityName: 'Kurir Relawan Mas Rizky',
          category: 'COMMUNITY_COURIER',
        }));
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('replate_onboarding_profile', JSON.stringify({ ...formData, role }));
    } catch (_) {}
    router.push(`/onboarding/documents?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="w-full max-w-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4A843] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md">
            <span>LANGKAH 2 DARI 4 — SETUP PROFIL ENTITAS VERIFIKASI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Lengkapi Profil Operasional {role === 'FOOD_BENEFICIARY' ? 'Yayasan / Panti' : role === 'RESCUE_VOLUNTEER' ? 'Kurir Relawan' : 'Outlet Provider'}
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-md mx-auto">
            Informasi ini digunakan oleh Smart Matching Engine 2.0 untuk mencocokkan rute distribusi pangan Surabaya.
          </p>
        </div>

        {/* High-Contrast Container Card */}
        <div className="bg-[#1B3A5C] border-2 border-[#2C5A8F] text-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#2C5A8F] pb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>🏪 Detail Identitas Operasional Resmi</span>
            </h3>
            <span className="text-xs bg-slate-900 text-amber-300 font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-700">
              ROLE: {role}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                1. Nama Resmi {role === 'FOOD_BENEFICIARY' ? 'Panti Asuhan / Yayasan' : role === 'RESCUE_VOLUNTEER' ? 'Kurir Relawan' : 'Restoran / Toko / Outlet'}:
              </label>
              <input
                type="text"
                value={formData.entityName}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Nama lengkap entitas"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                  2. Kategori Entitas:
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                >
                  <option value="RESTAURANT">Restoran / Warung Kuliner</option>
                  <option value="BAKERY">Bakery & Toko Roti</option>
                  <option value="SUPERMARKET">Supermarket / Retail</option>
                  <option value="HOTEL">Hotel & Buffet Catering</option>
                  <option value="YAYASAN_PANTI">Yayasan Panti Asuhan / Werdha</option>
                  <option value="COMMUNITY_COURIER">Kurir Relawan Komunitas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                  3. {role === 'FOOD_BENEFICIARY' ? 'Jumlah Anak Asuh / Lansia' : 'Kapasitas Porsi / Hari'}:
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                  placeholder="Contoh: 50 Porsi"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                4. Alamat Lengkap Operasional Surabaya:
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                placeholder="Jl. Raya Gubeng No. 88, Surabaya..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                  5. Nama Penanggung Jawab (PJ):
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                  placeholder="Nama lengkap PJ"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                  6. No. WhatsApp Aktif (OTP Verified):
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                  placeholder="0812-xxxx-xxxx"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2C5A8F] flex justify-end">
              <Button variant="gold" size="md" type="submit" className="font-black text-xs py-3 px-6 shadow-md">
                <span>Lanjut Ke Upload Dokumen Legalitas ➔</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
