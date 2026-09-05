'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Check } from 'lucide-react';

export default function OnboardingProfilePage() {
  const router = useRouter();

  const [role, setRole] = useState<'FOOD_PROVIDER' | 'FOOD_BENEFICIARY' | 'RESCUE_VOLUNTEER' | 'FOOD_CONSUMER'>('FOOD_PROVIDER');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredUser, setRegisteredUser] = useState<any>(null);
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

      // Load registered user if available
      let reg: any = null;
      try {
        const raw = localStorage.getItem('replate_registered_user');
        if (raw) reg = JSON.parse(raw);
        setRegisteredUser(reg);
      } catch (_) {}

      const initialName = reg?.name || '';
      const initialPhone = reg?.phone || '';

      setFormData({
        entityName: initialName,
        category: defaultCategory,
        address: '',
        contactPerson: initialName,
        phone: initialPhone,
        capacity: detectedRole === 'FOOD_CONSUMER' ? 'Mahasiswa / Anak Kos' : '',
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
        entityName: registeredUser?.name || 'Farhan Ramadhan',
        category: 'STUDENT',
        address: 'Jl. Ketintang No. 12, Gayungan, Surabaya',
        contactPerson: registeredUser?.name || 'Farhan Ramadhan',
        phone: registeredUser?.phone || '0812-3456-7890',
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

    const finalName = role === 'FOOD_CONSUMER' ? (formData.entityName || formData.contactPerson) : formData.entityName;
    const finalProfile = {
      ...formData,
      name: finalName,
      entityName: finalName,
      contactPerson: finalName,
      email: registeredUser?.email || 'konsumen@replate.id',
      role,
    };

    try {
      localStorage.setItem('replate_onboarding_profile', JSON.stringify(finalProfile));
    } catch (_) {}

    if (role === 'FOOD_CONSUMER') {
      setLoading(true);
      setSuccessMessage(' Akun Food Consumer Anda Resmi Aktif! Mengalihkan ke Dashboard...');

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
          if (registeredUser?.email && registeredUser?.password) {
            try {
              const res = await signIn('credentials', {
                email: registeredUser.email,
                password: registeredUser.password,
                redirect: false,
              });
              if (res?.ok) {
                router.push('/dashboard/consumer');
                return;
              }
            } catch (_) {}
          }
          router.push('/dashboard/consumer');
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

  const formatRoleLabel = (r: string) => {
    if (r === 'FOOD_PROVIDER' || r === 'PROVIDER') return 'Food Provider';
    if (r === 'FOOD_BENEFICIARY' || r === 'YAYASAN') return 'Food Beneficiary';
    if (r === 'RESCUE_VOLUNTEER' || r === 'VOLUNTEER' || r === 'RESCUE_PARTNER') return 'Food Rescue Volunteer';
    if (r === 'FOOD_CONSUMER' || r === 'CONSUMER') return 'Food Consumer';
    if (r === 'SUPER_ADMIN' || r === 'ADMIN') return 'SuperAdmin';
    return r.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="w-full max-w-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4A843] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md">
            <span>
              {isConsumer
                ? 'LANGKAH 2 DARI 2 — SETUP PROFIL KONSUMEN PRIBADI'
                : 'LANGKAH 2 DARI 4 — SETUP PROFIL ENTITAS OPERASIONAL'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isConsumer
              ? 'Lengkapi Profil Akun Food Consumer (Pribadi)'
              : `Lengkapi Profil Operasional ${
                  isBeneficiary
                    ? 'Food Beneficiary (Panti / Yayasan)'
                    : isVolunteer
                    ? 'Food Rescue Volunteer (Organisasi / Komunitas)'
                    : 'Food Provider (Restoran / Hotel / Supermarket)'
                }`}
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-md mx-auto">
            {isConsumer
              ? 'Informasi nama dan alamat ini digunakan untuk tiket klaim QR serta penentuan radius restoran terdekat dari tempat tinggal Anda.'
              : 'Informasi identitas dan kontak ini akan terintegrasi langsung pada surat jalan logistik & sertifikat transparansi IPCC.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1B3A5C] border-2 border-[#2C5A8F] text-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#2C5A8F] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>{isConsumer ? 'Detail Profil Pribadi Konsumen' : 'Detail Identitas Operasional Resmi'}</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
              >
                 Isi Contoh Simulasi Demo
              </button>
              <span className="text-xs bg-slate-900 text-amber-300 font-extrabold px-3 py-1 rounded-lg border border-slate-700">
                Peran: {formatRoleLabel(role)}
              </span>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg animate-bounce text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {isConsumer ? (
              /* STREAMLINED CLEAN CONSUMER FORM */
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                    1. Nama Lengkap Pengguna:
                  </label>
                  <input
                    type="text"
                    value={formData.entityName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        entityName: e.target.value,
                        contactPerson: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Contoh: Farhan Ramadhan"
                    required
                  />
                  <span className="text-[10px] text-slate-300">
                    Nama ini akan digunakan pada resi penjemputan makanan dan tiket pesanan Anda.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                      2. Status / Tipe Konsumen:
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const labelMap: Record<string, string> = {
                          STUDENT: 'Mahasiswa / Anak Kos',
                          WORKER: 'Pekerja / Karyawan',
                          FAMILY: 'Keluarga / Rumah Tangga',
                          PUBLIC: 'Konsumen Umum Mandiri',
                        };
                        setFormData({
                          ...formData,
                          category: val,
                          capacity: labelMap[val] || val,
                        });
                      }}
                      className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                    >
                      <option value="STUDENT">Mahasiswa / Anak Kos / Pelajar</option>
                      <option value="WORKER">Pekerja / Karyawan / Mandiri</option>
                      <option value="FAMILY">Keluarga / Rumah Tangga</option>
                      <option value="PUBLIC">Konsumen Umum</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                        3. No. WhatsApp Aktif:
                      </label>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-400/40 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>OTP Verified</span>
                      </span>
                    </div>
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

                <div className="space-y-1.5">
                  <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                    4. Alamat Domisili Pengantaran / Penjemputan Makanan:
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                    placeholder="Contoh: Jl. Ketintang No. 12, Kel. Ketintang, Kec. Gayungan, Kota Surabaya, Jawa Timur"
                    required
                  />
                  <span className="text-[10px] text-slate-300">
                    Alamat ini tersinkronisasi otomatis dengan modul Checkout dan penentuan radius makanan terdekat.
                  </span>
                </div>
              </>
            ) : (
              /* STANDARD MULTI-STEP FOR PROVIDER / BENEFICIARY / VOLUNTEER */
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                    1. Nama Resmi{' '}
                    {isBeneficiary
                      ? 'Panti Asuhan / Yayasan:'
                      : isVolunteer
                      ? 'Organisasi / Komunitas Food Rescue:'
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
                      ? 'Alamat Posko Utama / Basecamp Logistik Komunitas di Indonesia:'
                      : 'Alamat Lengkap Bangunan Operasional di Indonesia:'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                    placeholder="Contoh: Jl. Sudirman No. 45, Jakarta / Jl. Raya Gubeng No. 88, Surabaya / Jl. Dago No. 12, Bandung..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                      5. {isBeneficiary ? 'Nama Ketua / Pengurus Panti:' : isVolunteer ? 'Nama Ketua / Koordinator Komunitas (PJ):' : 'Nama Penanggung Jawab Outlet:'}
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none"
                      placeholder="Contoh: Mas Doni (Penanggung Jawab Outlet)"
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
              </>
            )}

            <div className="pt-4 border-t border-[#2C5A8F] flex justify-end">
              <Button variant="gold" size="md" type="submit" isLoading={loading} className="font-black text-xs py-3 px-6 shadow-md cursor-pointer">
                <span>
                  {isConsumer
                    ? 'Selesaikan Registrasi & Masuk Dashboard Consumer '
                    : 'Lanjut Ke Upload Dokumen Legalitas '}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
