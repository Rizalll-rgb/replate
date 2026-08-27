'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function OnboardingProfilePage() {
  const router = useRouter();

  const [role, setRole] = useState<'FOOD_PROVIDER' | 'FOOD_BENEFICIARY' | 'RESCUE_VOLUNTEER' | 'FOOD_CONSUMER'>('FOOD_PROVIDER');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    entityName: '',
    category: 'RESTAURANT',
    address: '',
    contactPerson: '',
    phone: '',
    capacity: '',
    vehiclePlate: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryRole = new URLSearchParams(window.location.search).get('role');

      let detectedRole: 'FOOD_PROVIDER' | 'FOOD_BENEFICIARY' | 'RESCUE_VOLUNTEER' | 'FOOD_CONSUMER' = 'FOOD_PROVIDER';

      if (queryRole === 'FOOD_BENEFICIARY' || queryRole === 'YAYASAN') {
        detectedRole = 'FOOD_BENEFICIARY';
      } else if (queryRole === 'RESCUE_VOLUNTEER' || queryRole === 'VOLUNTEER' || queryRole === 'RESCUE_PARTNER') {
        detectedRole = 'RESCUE_VOLUNTEER';
      } else if (queryRole === 'FOOD_CONSUMER' || queryRole === 'CONSUMER') {
        detectedRole = 'FOOD_CONSUMER';
      } else {
        detectedRole = 'FOOD_PROVIDER';
      }

      setRole(detectedRole);

      let defaultCategory = 'RESTAURANT';
      if (detectedRole === 'FOOD_BENEFICIARY') defaultCategory = 'YAYASAN_PANTI';
      else if (detectedRole === 'RESCUE_VOLUNTEER') defaultCategory = 'COMMUNITY_ORGANIZATION';
      else if (detectedRole === 'FOOD_CONSUMER') defaultCategory = 'STUDENT';

      setFormData({
        entityName: '',
        category: defaultCategory,
        address: '',
        contactPerson: '',
        phone: '',
        capacity: '',
        vehiclePlate: '',
      });
    }
  }, []);

  const handleQuickFillDemo = () => {
    if (role === 'FOOD_BENEFICIARY') {
      setFormData({
        entityName: 'Panti Asuhan Kasih Ibu Surabaya',
        category: 'YAYASAN_PANTI',
        address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya Pusat',
        contactPerson: 'Ibu Hajjah Maryam (Ketua Pengurus)',
        phone: '0812-3456-7890',
        capacity: '80 Anak Asuh & Lansia',
        vehiclePlate: '',
      });
    } else if (role === 'RESCUE_VOLUNTEER') {
      setFormData({
        entityName: 'Komunitas Foodbank Surabaya Center',
        category: 'COMMUNITY_ORGANIZATION',
        address: 'Jl. Pemuda No. 45, Genteng, Surabaya Pusat',
        contactPerson: 'Mas Rizky Multazam (Ketua Komunitas Logistik)',
        phone: '0812-3456-7890',
        capacity: '35 Kurir Relawan Aktif',
        vehiclePlate: '',
      });
    } else if (role === 'FOOD_CONSUMER') {
      setFormData({
        entityName: 'Budi Santoso',
        category: 'STUDENT',
        address: 'Jl. Ketintang No. 12, Gayungan, Surabaya Pusat',
        contactPerson: 'Budi Santoso',
        phone: '0812-3456-7890',
        capacity: 'Mahasiswa / Anak Kos',
        vehiclePlate: '',
      });
    } else {
      setFormData({
        entityName: 'Warung Bakso Pak Kumis Surabaya',
        category: 'RESTAURANT',
        address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya Pusat',
        contactPerson: 'Mas Doni (Penanggung Jawab Outlet)',
        phone: '0812-3456-7890',
        capacity: '50 Porsi / Hari',
        vehiclePlate: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('replate_onboarding_profile', JSON.stringify({ ...formData, role }));
    } catch (_) {}

    if (role === 'FOOD_CONSUMER') {
      setLoading(true);
      setSuccessMessage('🎉 Akun Food Consumer Anda Resmi Aktif! Mengalihkan ke Dashboard...');

      try {
        localStorage.setItem(
          'replate_onboarding_docs',
          JSON.stringify({
            status: 'APPROVED_ACTIVE',
            submittedAt: new Date().toISOString(),
            role: 'FOOD_CONSUMER',
          })
        );

        setTimeout(async () => {
          await signIn('credentials', {
            email: 'budi.santoso@gmail.com',
            password: 'password123',
            callbackUrl: '/dashboard/consumer',
          });
        }, 1000);
      } catch (_) {
        router.push('/dashboard/consumer');
      }
    } else {
      router.push(`/onboarding/documents?role=${role}`);
    }
  };

  const isBeneficiary = role === 'FOOD_BENEFICIARY';
  const isVolunteer = role === 'RESCUE_VOLUNTEER';
  const isConsumer = role === 'FOOD_CONSUMER';

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
            Lengkapi Profil Operasional{' '}
            {isBeneficiary
              ? 'Food Beneficiary (Panti / Yayasan)'
              : isVolunteer
              ? 'Food Rescue Volunteer (Organisasi / Komunitas)'
              : isConsumer
              ? 'Food Consumer (Pembeli Rescue Sale)'
              : 'Food Provider (Restoran / Outlet)'}
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
            {isConsumer
              ? 'Lengkapi profil akun konsumen Anda untuk menikmati makanan diskon murah Rescue Sale Surabaya.'
              : isVolunteer
              ? 'Daftarkan organisasi/komunitas relawan penyelamat pangan Anda. Manajemen driver armada akan diatur terpusat di dashboard.'
              : 'Informasi ini digunakan oleh Smart Matching Engine 2.0 untuk mencocokkan rute distribusi pangan Surabaya.'}
          </p>
        </div>

        {/* High-Contrast Container Card */}
        <div className="bg-[#1B3A5C] border-2 border-[#2C5A8F] text-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#2C5A8F] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>Detail Identitas Operasional Resmi</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
              >
                ⚡ Isi Contoh Simulasi Demo
              </button>
              <span className="text-xs bg-slate-900 text-amber-300 font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                ROLE: {role}
              </span>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg animate-bounce text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                1. Nama Resmi{' '}
                {isBeneficiary
                  ? 'Panti Asuhan / Yayasan:'
                  : isVolunteer
                  ? 'Organisasi / Komunitas Food Rescue:'
                  : isConsumer
                  ? 'Pengguna Pembeli:'
                  : 'Restoran / Toko / Outlet:'}
              </label>
              <input
                type="text"
                value={formData.entityName}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder={
                  isBeneficiary
                    ? 'Contoh: Panti Asuhan Kasih Ibu Surabaya'
                    : isVolunteer
                    ? 'Contoh: Komunitas Garda Pangan Surabaya'
                    : isConsumer
                    ? 'Contoh: Budi Santoso'
                    : 'Contoh: Warung Bakso Pak Kumis'
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                  2. {isVolunteer ? 'Jenis Organisasi Komunitas:' : 'Kategori Entitas:'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                >
                  {isBeneficiary ? (
                    <>
                      <option value="YAYASAN_PANTI">Yayasan Panti Asuhan Anak</option>
                      <option value="PANTI_WERDHA">Panti Werdha Lansia</option>
                      <option value="SHELTER_DHUAFA">Shelter Dhuafa & Rumah Singgah</option>
                    </>
                  ) : isVolunteer ? (
                    <>
                      <option value="COMMUNITY_ORGANIZATION">Komunitas Rescue Pangan Non-Profit</option>
                      <option value="FOODBANK_FOUNDATION">Organisasi Bank Pangan (Foodbank)</option>
                      <option value="LOGISTICS_FOUNDATION">Yayasan Logistik Sosial & Kemanusiaan</option>
                    </>
                  ) : isConsumer ? (
                    <>
                      <option value="STUDENT">Mahasiswa / Anak Kos</option>
                      <option value="PUBLIC">Konsumen Umum</option>
                      <option value="WORKER">Pekerja Mandiri</option>
                    </>
                  ) : (
                    <>
                      <option value="RESTAURANT">Restoran / Warung Kuliner</option>
                      <option value="BAKERY">Bakery & Toko Roti</option>
                      <option value="SUPERMARKET">Supermarket / Retail</option>
                      <option value="HOTEL">Hotel & Buffet Catering</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                  3.{' '}
                  {isBeneficiary
                    ? 'Jumlah Anak Asuh / Lansia:'
                    : isVolunteer
                    ? 'Jumlah Anggota Kurir Relawan Aktif:'
                    : isConsumer
                    ? 'Pekerjaan / Status:'
                    : 'Kapasitas Porsi / Hari:'}
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                  placeholder={
                    isBeneficiary
                      ? 'Contoh: 80 Anak Asuh'
                      : isVolunteer
                      ? 'Contoh: 35 Kurir Relawan'
                      : isConsumer
                      ? 'Contoh: Mahasiswa / Pekerja'
                      : 'Contoh: 50 Porsi / Hari'
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                4.{' '}
                {isVolunteer
                  ? 'Alamat Posko Utama / Basecamp Logistik Komunitas Surabaya:'
                  : isConsumer
                  ? 'Alamat Domisili Pengiriman / Penjemputan Makanan Surabaya:'
                  : 'Alamat Lengkap Bangunan Operasional Surabaya:'}
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                placeholder="Contoh: Jl. Raya Gubeng No. 88, Gubeng, Surabaya Pusat..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                  5. {isBeneficiary ? 'Nama Ketua / Pengurus Panti:' : isVolunteer ? 'Nama Ketua / Koordinator Komunitas (PJ):' : 'Nama Lengkap Pengguna (PJ):'}
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                  placeholder="Contoh: Budi Santoso"
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
                  placeholder="Contoh: 0812-3456-7890"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2C5A8F] flex justify-end">
              <Button variant="gold" size="md" type="submit" isLoading={loading} className="font-black text-xs py-3 px-6 shadow-md cursor-pointer">
                <span>
                  {isConsumer
                    ? 'Selesaikan Registrasi & Masuk Dashboard Consumer ➔'
                    : 'Lanjut Ke Upload Dokumen Legalitas ➔'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
