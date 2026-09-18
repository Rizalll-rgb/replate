'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Check, HelpCircle, MapPin, Tag, ShieldCheck, Sparkles, Building2, Store } from 'lucide-react';
import {
  resolveIndonesianAddress,
  reverseGeocodeIndonesianCoords,
  mergeAddressWithLocalDetails,
  extractIndonesianAddressMicroTokens,
} from '@/lib/geoResolver';

export default function OnboardingProfilePage() {
  const router = useRouter();

  const [role, setRole] = useState<'FOOD_PROVIDER' | 'FOOD_BENEFICIARY' | 'RESCUE_VOLUNTEER' | 'FOOD_CONSUMER'>('FOOD_PROVIDER');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    entityName: '',
    category: 'RESTAURANT',
    province: 'Jawa Timur',
    city: '',
    district: '',
    address: '',
    houseNumber: '',
    rtRw: '',
    landmark: '',
    contactPerson: '',
    phone: '',
    capacity: '',
    vehiclePlate: '',
    operationalCoverage: 'Radius 5-10 Km Area Sekitar Outlet',
    lat: -7.6749,
    lng: 111.2201,
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

      // Load registered user if available (from step 1 register)
      let reg: any = null;
      try {
        const raw = localStorage.getItem('replate_registered_user');
        if (raw) reg = JSON.parse(raw);
        setRegisteredUser(reg);
      } catch (_) {}

      const initialName = reg?.name || '';
      const initialPhone = reg?.phone || '';

      const defaultCapacity =
        detectedRole === 'FOOD_CONSUMER'
          ? 'Pribadi / Mahasiswa / Anak Kos'
          : detectedRole === 'FOOD_BENEFICIARY'
          ? '26 - 50 Jiwa'
          : detectedRole === 'RESCUE_VOLUNTEER'
          ? '16 - 30 Relawan'
          : '31 - 50 Porsi / Hari';

      setFormData({
        // Poin 1: Untuk Consumer, nama pribadi menjadi nama entitas. Untuk Provider/Yayasan/Relawan, biarkan kosong agar diisi nama toko/instansi
        entityName: detectedRole === 'FOOD_CONSUMER' ? initialName : '',
        category: defaultCategory,
        province: 'Jawa Timur',
        city: '',
        district: '',
        address: '',
        houseNumber: '',
        rtRw: '',
        landmark: '',
        // Poin 1: Auto-fill nama penanggung jawab & nomor WhatsApp dari data register di langkah 1
        contactPerson: initialName,
        phone: initialPhone,
        capacity: defaultCapacity,
        vehiclePlate: '',
        operationalCoverage: '',
        lat: -7.6749,
        lng: 111.2201,
      });
    }
  }, []);

  const handleAddressChange = (addr: string) => {
    const extracted = extractIndonesianAddressMicroTokens(addr);
    const res = resolveIndonesianAddress(addr);

    setFormData((prev: any) => ({
      ...prev,
      address: addr,
      ...(extracted.houseNumber ? { houseNumber: extracted.houseNumber } : {}),
      ...(extracted.rtRw ? { rtRw: extracted.rtRw } : {}),
      ...(extracted.landmark ? { landmark: extracted.landmark } : {}),
      province: res.province || prev.province || 'Jawa Timur',
      city: res.city || prev.city,
      district: res.district || prev.district,
      lat: res.lat,
      lng: res.lng,
    }));
  };

  const handleMicroDetailChange = (field: 'houseNumber' | 'rtRw' | 'landmark', value: string) => {
    setFormData((prev: any) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      const merged = mergeAddressWithLocalDetails({
        baseAddress: prev.address,
        houseNumber: field === 'houseNumber' ? value : prev.houseNumber,
        rtRw: field === 'rtRw' ? value : prev.rtRw,
        landmark: field === 'landmark' ? value : prev.landmark,
        city: prev.city,
        district: prev.district,
        province: prev.province,
      });
      return {
        ...updated,
        address: merged,
      };
    });
  };

  const handleQuickFillDemo = () => {
    if (role === 'FOOD_BENEFICIARY') {
      setFormData({
        entityName: 'Panti Asuhan Kasih Ibu Surabaya',
        category: 'YAYASAN_PANTI',
        province: 'Jawa Timur',
        city: 'Kota Surabaya',
        district: 'Gubeng',
        address: 'Jl. Raya Gubeng No. 88, RT 03 / RW 05, Gubeng, Surabaya Pusat (Patokan: Sebelah RS Siloam Gubeng)',
        houseNumber: 'No. 88',
        rtRw: 'RT 03 / RW 05',
        landmark: 'Sebelah RS Siloam Gubeng',
        contactPerson: 'Ibu Hajjah Maryam (Ketua Pengurus)',
        phone: '0812-3456-7890',
        capacity: '51 - 100 Jiwa',
        vehiclePlate: '',
        operationalCoverage: 'Kota Surabaya & Sekitarnya',
        lat: -7.2754,
        lng: 112.7541,
      });
    } else if (role === 'RESCUE_VOLUNTEER') {
      setFormData({
        entityName: 'Komunitas Foodbank Surabaya Center',
        category: 'COMMUNITY_ORGANIZATION',
        province: 'Jawa Timur',
        city: 'Kota Surabaya',
        district: 'Genteng',
        address: 'Jl. Pemuda No. 45, RT 02 / RW 01, Genteng, Surabaya Pusat (Patokan: Depan Balai Pemuda)',
        houseNumber: 'No. 45',
        rtRw: 'RT 02 / RW 01',
        landmark: 'Depan Balai Pemuda',
        contactPerson: 'Mas Rizky Multazam (Ketua Komunitas Logistik)',
        phone: '0812-3456-7890',
        capacity: '16 - 30 Relawan',
        vehiclePlate: '',
        operationalCoverage: 'Aglomerasi Surabaya Raya',
        lat: -7.2589,
        lng: 112.7478,
      });
    } else if (role === 'FOOD_CONSUMER') {
      setFormData({
        entityName: registeredUser?.name || 'Farhan Ramadhan',
        category: 'STUDENT',
        province: 'Jawa Timur',
        city: 'Kota Surabaya',
        district: 'Gayungan',
        address: 'Jl. Ketintang No. 12, RT 04 / RW 02, Gayungan, Surabaya (Patokan: Dekat Kampus Unesa)',
        houseNumber: 'No. 12',
        rtRw: 'RT 04 / RW 02',
        landmark: 'Dekat Kampus Unesa',
        contactPerson: registeredUser?.name || 'Farhan Ramadhan',
        phone: registeredUser?.phone || '0812-3456-7890',
        capacity: 'Pribadi / Mahasiswa / Anak Kos',
        vehiclePlate: '',
        operationalCoverage: 'Radius 10 km dari Tempat Tinggal',
        lat: -7.3112,
        lng: 112.7289,
      });
    } else {
      setFormData({
        entityName: 'Warung Bakso Pak Kumis Surabaya',
        category: 'RESTAURANT',
        province: 'Jawa Timur',
        city: 'Kota Surabaya',
        district: 'Gubeng',
        address: 'Jl. Raya Gubeng No. 88, RT 03 / RW 05, Gubeng, Surabaya Pusat (Patokan: Sebelah Apotek Kimia Farma)',
        houseNumber: 'No. 88',
        rtRw: 'RT 03 / RW 05',
        landmark: 'Sebelah Apotek Kimia Farma, Pagar Hijau',
        contactPerson: 'Mas Doni (Penanggung Jawab Outlet)',
        phone: '0812-3456-7890',
        capacity: '31 - 50 Porsi / Hari',
        vehiclePlate: '',
        operationalCoverage: 'Kec. Gubeng & Kota Surabaya',
        lat: -7.2754,
        lng: 112.7541,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = role === 'FOOD_CONSUMER' ? (formData.entityName || formData.contactPerson || registeredUser?.name || '') : formData.entityName;
    const finalContactPerson = formData.contactPerson || registeredUser?.name || finalName;
    const finalPhone = formData.phone || registeredUser?.phone || '';
    const resolvedGeo = resolveIndonesianAddress(formData.address || '');
    const resolvedLat = formData.lat || resolvedGeo.lat;
    const resolvedLng = formData.lng || resolvedGeo.lng;

    const finalProfile = {
      ...formData,
      name: finalName,
      entityName: finalName,
      contactPerson: finalContactPerson,
      phone: finalPhone,
      email: registeredUser?.email || (role === 'FOOD_CONSUMER' ? 'konsumen@replate.id' : 'mitra@replate.id'),
      role,
      province: formData.province || resolvedGeo.province || 'Jawa Timur',
      city: formData.city || resolvedGeo.city || 'Kabupaten Magetan',
      district: formData.district || resolvedGeo.district || 'Sidorejo',
      address: formData.address,
      capacity: formData.capacity,
      operationalCoverage: `${formData.district ? 'Kec. ' + formData.district + ', ' : ''}${formData.city || 'Kab. Magetan'} (Radius 12 km)`,
      lat: resolvedLat,
      lng: resolvedLng,
      latitude: resolvedLat,
      longitude: resolvedLng,
    };

    try {
      localStorage.setItem('replate_onboarding_profile', JSON.stringify(finalProfile));
      document.cookie = `replate_demo_session=${role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `replate_role=${role}; path=/; max-age=604800; SameSite=Lax`;
    } catch (_) {}

    if (role === 'FOOD_CONSUMER') {
      setLoading(true);
      setSuccessMessage('Selamat! Akun Food Consumer Anda berhasil diaktifkan. Mengalihkan ke Dashboard...');

      try {
        localStorage.setItem(
          'replate_onboarding_docs',
          JSON.stringify({
            status: 'APPROVED_ACTIVE',
            submittedAt: new Date().toISOString(),
            role: 'FOOD_CONSUMER',
          })
        );

        document.cookie = 'replate_demo_session=FOOD_CONSUMER; path=/; max-age=604800; SameSite=Lax';
        document.cookie = 'replate_role=FOOD_CONSUMER; path=/; max-age=604800; SameSite=Lax';

        try {
          await fetch('/api/auth/demo-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'FOOD_CONSUMER', email: registeredUser?.email || finalProfile.email }),
          });
        } catch (_) {}

        setTimeout(async () => {
          if (registeredUser?.email && registeredUser?.password) {
            try {
              const res = await signIn('credentials', {
                email: registeredUser.email,
                password: registeredUser.password,
                role: 'CONSUMER',
                redirect: false,
              });
              if (res?.ok) {
                window.location.href = '/dashboard/consumer';
                return;
              }
            } catch (_) {}
          }
          window.location.href = '/dashboard/consumer';
        }, 800);
      } catch (_) {
        window.location.href = '/dashboard/consumer';
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
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-3 sm:p-6 font-sans relative overflow-x-hidden w-full max-w-full box-border">
      <div className="w-full max-w-2xl space-y-6 relative z-10 box-border px-1">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A843] text-slate-950 font-black text-[10.5px] sm:text-xs uppercase tracking-wider rounded-xl shadow-md max-w-full text-center break-words">
            <span>
              {isConsumer
                ? 'LANGKAH 2 DARI 2 — SETUP PROFIL KONSUMEN PRIBADI'
                : 'LANGKAH 2 DARI 4 — SETUP PROFIL ENTITAS OPERASIONAL'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight break-words text-center px-1">
            {isConsumer
              ? 'Lengkapi Profil Akun Food Consumer (Pribadi)'
              : `Lengkapi Profil Operasional ${
                  isBeneficiary
                    ? 'Food Beneficiary (Panti / Yayasan)'
                    : isVolunteer
                    ? 'Food Rescue Volunteer (Komunitas Relawan)'
                    : 'Food Provider (Restoran / Hotel / Supermarket)'
                }`}
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-md mx-auto break-words text-center px-1">
            {isConsumer
              ? 'Informasi nama dan alamat ini digunakan untuk tiket klaim QR serta penentuan radius restoran terdekat dari tempat tinggal Anda.'
              : 'Informasi identitas dan kontak ini akan terintegrasi langsung pada surat jalan logistik & sertifikat transparansi IPCC.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1B3A5C] border-2 border-[#2C5A8F] text-white rounded-2xl p-3.5 sm:p-6 md:p-8 shadow-2xl space-y-6 w-full max-w-full box-border">
          <div className="border-b border-[#2C5A8F] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>{isConsumer ? 'Detail Profil Pribadi Konsumen' : 'Detail Identitas Operasional Resmi'}</span>
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#D4A843]" />
                <span>Isi Contoh Simulasi Demo</span>
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

          <form onSubmit={handleSubmit} className="space-y-5 text-xs w-full max-w-full box-border">
            {isConsumer ? (
              /* STREAMLINED CLEAN CONSUMER FORM */
              <>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                      1. Nama Lengkap Pengguna:
                    </label>
                    {registeredUser?.name && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-400/40 inline-flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Terisi Otomatis Dari Pendaftaran</span>
                      </span>
                    )}
                  </div>
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
                    className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300 box-border"
                    placeholder="Contoh: Farhan Ramadhan"
                    required
                  />
                  <span className="text-[10px] text-slate-300 block">
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
                      className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none box-border"
                    >
                      <option value="STUDENT">Mahasiswa / Anak Kos / Pelajar</option>
                      <option value="WORKER">Pekerja / Karyawan / Mandiri</option>
                      <option value="FAMILY">Keluarga / Rumah Tangga</option>
                      <option value="PUBLIC">Konsumen Umum</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                        3. No. WhatsApp Aktif:
                      </label>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-400/40 inline-flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Terisi Otomatis (OTP Verified)</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none box-border"
                      placeholder="Contoh: 0812-3456-7890"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 p-3.5 sm:p-4 bg-[#142C47] rounded-xl border border-slate-700 w-full max-w-full box-border">
                  <div className="space-y-1.5">
                    <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                      4. Alamat Domisili Pengantaran / Penjemputan Makanan:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none box-border"
                      placeholder="Contoh: Jl. Raya Sarangan No. 45, Plaosan, Magetan / Jl. Ketintang No. 12, Surabaya..."
                      required
                    />
                    <p className="text-[11px] text-amber-200/90 font-medium flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span>Ketik alamat Anda. Sistem otomatis mendeteksi Kota dan Kecamatan di bawah.</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-200 font-bold block">Provinsi:</label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-200 font-bold block">Kota / Kabupaten:</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                        placeholder="Contoh: Kabupaten Magetan"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-200 font-bold block">Kecamatan:</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                        placeholder="Contoh: Plaosan"
                        required
                      />
                    </div>
                  </div>
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
                      ? 'Komunitas / Organisasi Relawan Food Rescue:'
                      : 'Outlet / Restoran / Badan Usaha:'}
                  </label>
                  <input
                    type="text"
                    value={formData.entityName}
                    onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                    className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300 box-border"
                    placeholder={
                      isBeneficiary
                        ? 'Contoh: Panti Asuhan Kasih Ibu'
                        : isVolunteer
                        ? 'Contoh: Garda Pangan Surabaya'
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
                      className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none box-border"
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
                        ? 'Jumlah Anggota Tim Relawan Aktif:'
                        : 'Kapasitas Porsi / Hari:'}
                    </label>
                    {isBeneficiary ? (
                      <select
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none cursor-pointer box-border"
                        required
                      >
                        <option value="">-- Pilih Jumlah Penerima Manfaat --</option>
                        <option value="1 - 25 Jiwa">1 - 25 Jiwa (Panti Asuhan / Shelter Kecil)</option>
                        <option value="26 - 50 Jiwa">26 - 50 Jiwa (Panti Asuhan Menengah)</option>
                        <option value="51 - 100 Jiwa">51 - 100 Jiwa (Panti Asuhan Skala Besar)</option>
                        <option value="> 100 Jiwa">&gt; 100 Jiwa (Kompleks Panti Asuhan & Lansia)</option>
                      </select>
                    ) : isVolunteer ? (
                      <select
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none cursor-pointer box-border"
                        required
                      >
                        <option value="">-- Pilih Jumlah Tim Relawan --</option>
                        <option value="1 - 5 Relawan">1 - 5 Kurir Relawan (Komunitas Perintis)</option>
                        <option value="6 - 15 Relawan">6 - 15 Kurir Relawan (Tim Logistik Wilayah)</option>
                        <option value="16 - 30 Relawan">16 - 30 Kurir Relawan (Armada Komunitas Aktif)</option>
                        <option value="> 30 Relawan">&gt; 30 Kurir Relawan (Organisasi Skala Kota)</option>
                      </select>
                    ) : (
                      <select
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none cursor-pointer box-border"
                        required
                      >
                        <option value="">-- Pilih Kapasitas Porsi per Hari --</option>
                        <option value="1 - 15 Porsi / Hari">1 - 15 Porsi / Hari (Usaha Mikro / Warung Kecil)</option>
                        <option value="16 - 30 Porsi / Hari">16 - 30 Porsi / Hari (Warung Makan / Bakery Rumahan)</option>
                        <option value="31 - 50 Porsi / Hari">31 - 50 Porsi / Hari (Restoran Menengah / Kafe)</option>
                        <option value="51 - 100 Porsi / Hari">51 - 100 Porsi / Hari (Restoran Ramai / Bakery Besar)</option>
                        <option value="101 - 250 Porsi / Hari">101 - 250 Porsi / Hari (Katering / Hotel / Resto Besar)</option>
                        <option value="> 250 Porsi / Hari">&gt; 250 Porsi / Hari (Supermarket / Sentra Pangan)</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-3.5 sm:p-4 bg-[#142C47] rounded-xl border border-slate-700 w-full max-w-full box-border">
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
                      onChange={(e) => handleAddressChange(e.target.value)}
                      className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none box-border"
                      placeholder="Contoh: Jl. Raya Sarangan No. 45, Plaosan, Magetan / Jl. Raya Gubeng No. 88, Surabaya..."
                      required
                    />

                    {/* Micro-Location Details: No. Bangunan, RT / RW, & Patokan Kurir */}
                    <div className="p-3 bg-white/10 backdrop-blur-xs border border-amber-300/40 rounded-xl space-y-2.5 w-full max-w-full box-border">
                      <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold flex-wrap gap-1">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-300 shrink-0" />
                          <span>Detail Tambahan (Nomor, RT/RW, Patokan):</span>
                        </span>
                        <span className="text-[10px] text-slate-300">Otomatis gabung ke alamat</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10.5px] text-slate-200 font-semibold block">Nomor Bangunan / Rumah:</label>
                          <input
                            type="text"
                            value={formData.houseNumber || ''}
                            onChange={(e) => handleMicroDetailChange('houseNumber', e.target.value)}
                            className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                            placeholder="Contoh: No. 45 / Blok B-12"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10.5px] text-slate-200 font-semibold block">RT / RW:</label>
                          <input
                            type="text"
                            value={formData.rtRw || ''}
                            onChange={(e) => handleMicroDetailChange('rtRw', e.target.value)}
                            className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                            placeholder="Contoh: RT 03 / RW 05"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10.5px] text-slate-200 font-semibold block">Patokan / Catatan Kurir:</label>
                          <input
                            type="text"
                            value={formData.landmark || ''}
                            onChange={(e) => handleMicroDetailChange('landmark', e.target.value)}
                            className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                            placeholder="Contoh: Sebelah Apotek, Pagar Putih"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-200/90 font-medium flex items-start gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                      <span>Ketik alamat Anda atau sesuaikan Nomor, RT/RW, dan Patokan di atas untuk akurasi pengantaran kurir.</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-200 font-bold block">Provinsi:</label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-200 font-bold block">Kota / Kabupaten:</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                        placeholder="Contoh: Kabupaten Magetan"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-200 font-bold block">Kecamatan:</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full max-w-full p-2 bg-white text-slate-900 font-bold text-xs rounded-lg border border-amber-400 focus:outline-none box-border"
                        placeholder="Contoh: Plaosan"
                        required
                      />
                    </div>
                  </div>

                  {/* Visual Click-to-Pin Interactive Mini Map for Onboarding */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                      <span className="text-amber-300 font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Peta Penanda Titik Lokasi GPS:</span>
                      </span>
                      <span className="text-[10.5px] font-mono text-slate-300 font-bold">
                        GPS: {formData.lat || -7.2754}, {formData.lng || 112.7541}
                      </span>
                    </div>

                    <div
                      onClick={async (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const xPercent = (x / rect.width) - 0.5;
                        const yPercent = (y / rect.height) - 0.5;
                        const currentLat = formData.lat || -7.2754;
                        const currentLng = formData.lng || 112.7541;
                        const newLng = Number((currentLng + (xPercent * 0.012)).toFixed(5));
                        const newLat = Number((currentLat - (yPercent * 0.012)).toFixed(5));
                        setFormData((prev: any) => ({ ...prev, lat: newLat, lng: newLng }));
                        try {
                          const res = await reverseGeocodeIndonesianCoords(newLat, newLng);
                          if (res.formattedAddress) {
                            const merged = mergeAddressWithLocalDetails({
                              baseAddress: res.formattedAddress,
                              street: res.street,
                              houseNumber: formData.houseNumber || res.houseNumber,
                              rtRw: formData.rtRw || res.rtRw,
                              landmark: formData.landmark,
                              village: res.village,
                              district: res.district,
                              city: res.city,
                              province: res.province,
                              postalCode: res.postalCode,
                            });
                            setFormData((prev: any) => ({
                              ...prev,
                              address: merged,
                              ...(res.houseNumber && !prev.houseNumber ? { houseNumber: res.houseNumber } : {}),
                              ...(res.rtRw && !prev.rtRw ? { rtRw: res.rtRw } : {}),
                              city: res.city || prev.city,
                              district: res.district || prev.district,
                              province: res.province || prev.province,
                              lat: newLat,
                              lng: newLng,
                            }));
                          }
                        } catch (_) {}
                      }}
                      className="relative w-full h-36 rounded-xl border-2 border-amber-400 overflow-hidden bg-slate-900 shadow-inner cursor-crosshair group"
                    >
                      <iframe
                        title="Onboarding Location Pinpoint"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        src={`https://maps.google.com/maps?q=${formData.lat || -7.2754},${formData.lng || 112.7541}&z=15&output=embed`}
                        className="w-full h-full filter saturate-150 pointer-events-none"
                      />
                      <div className="absolute top-2 left-2 bg-[#1B3A5C]/90 text-white px-2.5 py-1 rounded-lg text-[9px] sm:text-[9.5px] font-black shadow-md flex items-center gap-1.5 max-w-[88%] truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                        <span className="truncate">Klik peta untuk menggeser pin & isi otomatis alamat</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 5: Auto-fill penanggung jawab */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                        5. {isBeneficiary ? 'Nama Ketua / Pengurus Panti:' : isVolunteer ? 'Nama Koordinator Komunitas (PJ):' : 'Nama Penanggung Jawab Outlet:'}
                      </label>
                      {registeredUser?.name && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-400/40 inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Terisi Otomatis Dari Pendaftaran</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none box-border"
                      placeholder="Nama Penanggung Jawab Resmi"
                      required
                    />
                    <p className="text-[10.5px] text-slate-300 leading-tight">
                      Sesuai data PIC penanggung jawab yang Anda daftarkan di formulir awal pendaftaran.
                    </p>
                  </div>

                  {/* Field 6: Auto-fill nomor WhatsApp */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <label className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                        6. No. WhatsApp Aktif:
                      </label>
                      {registeredUser?.phone && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-400/40 inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Terisi Otomatis (OTP Verified)</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full max-w-full p-3 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-amber-400 shadow-sm focus:outline-none box-border"
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                    <p className="text-[10.5px] text-slate-300 leading-tight">
                      Nomor telepon WhatsApp aktif yang telah lolos verifikasi OTP awal.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-[#2C5A8F] flex justify-end">
              <Button variant="gold" size="md" type="submit" isLoading={loading} className="w-full sm:w-auto font-black text-xs py-3 px-6 shadow-md cursor-pointer text-center">
                <span>
                  {isConsumer
                    ? 'Selesaikan Registrasi & Masuk Dashboard Consumer'
                    : 'Lanjut Ke Upload Dokumen Legalitas'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
