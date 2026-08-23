'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';

export default function OnboardingProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    entityName: 'Warung Bakso Pak Kumis Surabaya',
    category: 'RESTAURANT',
    address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya Pusat',
    contactPerson: 'Mas Doni (Penanggung Jawab Outlet)',
    phone: '0812-3456-7890',
    capacity: '50 Porsi / Hari',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('replate_onboarding_profile', JSON.stringify(formData));
    } catch (_) {}
    router.push('/onboarding/documents');
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4A843] text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-md">
            <span>LANGKAH 2 DARI 4 — SETUP PROFIL ENTITAS</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Lengkapi Profil Outlet / Yayasan Anda
          </h1>
          <p className="text-xs text-slate-300">
            Informasi ini digunakan oleh Smart Matching Engine 2.0 untuk mencocokkan rute distribusi pangan.
          </p>
        </div>

        <Card className="bg-slate-900/90 border-slate-700 text-slate-100 shadow-xl">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-sm font-extrabold text-[#D4A843] flex items-center gap-2">
              <span>🏪 Detail Profil Identitas Operasional</span>
            </CardTitle>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-200 block">Nama Toko / Restoran / Yayasan Panti:</label>
                <Input
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  placeholder="Contoh: Warung Bakso Pak Kumis"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">Kategori Entitas Usaha / Social:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none"
                  >
                    <option value="RESTAURANT">Restoran / Rumah Makan</option>
                    <option value="BAKERY">Bakery / Toko Roti</option>
                    <option value="SUPERMARKET">Supermarket / Retail</option>
                    <option value="HOTEL">Hotel & Catering</option>
                    <option value="YAYASAN_PANTI">Yayasan / Panti Asuhan</option>
                    <option value="SHELTER">Shelter & Rumah Singgah</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">Kapasitas Porsi Rata-rata / Hari:</label>
                  <Input
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Contoh: 50 Porsi"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-200 block">Alamat GPS Lengkap Pengambilan / Penyerahan:</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 text-white rounded-xl border border-slate-700 text-xs font-bold focus:outline-none"
                  placeholder="Jl. Raya Gubeng No. 88, Surabaya..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">Nama Kontak Person (Penanggung Jawab):</label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Nama lengkap PJ"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">Nomor Telepon / WhatsApp Aktif:</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <Button variant="gold" size="md" type="submit" className="font-black text-xs">
                  <span>Lanjut Ke Upload Dokumen Legalitas ➔</span>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
