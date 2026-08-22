'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { useSession } from 'next-auth/react';

export default function ProviderSettingsPage() {
  const { data: session } = useSession();

  const [orgName, setOrgName] = useState(session?.user?.name || 'Warung Bakso Pak Kumis');
  const [phone, setPhone] = useState(session?.user?.phone || '081234567891');
  const [email, setEmail] = useState(session?.user?.email || 'mitra@replate.id');
  const [address, setAddress] = useState(session?.user?.address || 'Jl. Genteng Kali No. 45, Genteng, Surabaya');
  const [district, setDistrict] = useState('Surabaya Pusat (Genteng)');
  const [nib, setNib] = useState('NIB-9120481023912');
  const [businessCategory, setBusinessCategory] = useState('Restoran / Warung Kuliner');
  const [pickupHours, setPickupHours] = useState('19:00 - 22:00 WIB');
  const [autoMatchPanti, setAutoMatchPanti] = useState(true);
  const [waAlerts, setWaAlerts] = useState(true);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastState({
      isOpen: true,
      message: 'Pengaturan outlet & profil usaha mitra berhasil disimpan!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner (Poin 5) */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
            Pengaturan Akun Provider
          </span>
          <span className="text-xs text-slate-200 font-semibold">100% Terverifikasi SOP BPOM</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Pengaturan Outlet & Profil Usaha</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-2xl font-medium">
          Kelola informasi legalitas bisnis, lokasi penjemputan utama, jam operasional pickup, dan preferensi notifikasi klaim otomatis.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Profil Organisasi & Identitas Usaha */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
                </svg>
                <span>1. Identitas Usaha & Legalitas Bisnis</span>
              </h3>
              <Badge variant="success">VERIFIED PRO</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Input
                label="Nama Restoran / Toko Pangan"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Kategori Usaha Kuliner</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                >
                  <option value="Restoran / Warung Kuliner">Restoran / Warung Kuliner</option>
                  <option value="Hotel & Catering Buffet">Hotel & Catering Buffet</option>
                  <option value="Toko Roti & Bakery">Toko Roti & Bakery</option>
                  <option value="Supermarket / Toko Sembako">Supermarket / Toko Sembako</option>
                </select>
              </div>

              <Input
                label="Nomor NIB / Izin Usaha Resmi"
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                required
              />

              <Input
                label="Email Resmi Outlet"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardBody>
        </Card>

        {/* Section 2: Lokasi & Jam Operasional Pickup */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>2. Lokasi Penjemputan & Jam Operasional</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Wilayah Surabaya</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="Surabaya Pusat (Genteng)">Surabaya Pusat (Genteng, Tegalsari)</option>
                  <option value="Surabaya Timur (Gubeng)">Surabaya Timur (Gubeng, Sukolilo)</option>
                  <option value="Surabaya Selatan (Wonokromo)">Surabaya Selatan (Wonokromo)</option>
                  <option value="Surabaya Barat (Tandes)">Surabaya Barat (Tandes)</option>
                  <option value="Surabaya Utara (Pabean)">Surabaya Utara (Pabean)</option>
                </select>
              </div>

              <Input
                label="Kontak HP / WhatsApp PIC Penjemputan"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Alamat Utama Penjemputan Makanan Surplus"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Jendela Jam Operasional Pickup Surplus"
                value={pickupHours}
                onChange={(e) => setPickupHours(e.target.value)}
                placeholder="19:00 - 22:00 WIB"
                required
              />
            </div>
          </CardBody>
        </Card>

        {/* Section 3: Preferensi Smart Matching & Notifikasi */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>3. Preferensi Notifikasi & Algoritma Otomatis</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-extrabold text-[#1B3A5C] block">Otomatiskan Match Panti Asuhan Surabaya</span>
                  <span className="text-slate-500 block text-[11px]">Ijinkan Smart Matching Engine langsung menyalurkan donasi surplus porsi besar ke panti terverifikasi.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoMatchPanti}
                  onChange={(e) => setAutoMatchPanti(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-extrabold text-[#1B3A5C] block">Notifikasi WhatsApp Real-Time</span>
                  <span className="text-slate-500 block text-[11px]">Kirimkan notifikasi WhatsApp instan setiap ada klaim baru atau serah terima QR.</span>
                </div>
                <input
                  type="checkbox"
                  checked={waAlerts}
                  onChange={(e) => setWaAlerts(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="gold" size="lg" className="font-extrabold shadow-md">
            Simpan Seluruh Pengaturan Outlet ➔
          </Button>
        </div>
      </form>

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
