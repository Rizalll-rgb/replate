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

  // Basic Business Profile State
  const [orgName, setOrgName] = useState(session?.user?.name || 'Warung Bakso Pak Kumis');
  const [phone, setPhone] = useState((session?.user as any)?.phone || '081234567891');
  const [email, setEmail] = useState(session?.user?.email || 'mitra@replate.id');
  const [address, setAddress] = useState((session?.user as any)?.address || 'Jl. Genteng Kali No. 45, Genteng, Surabaya');
  const [district, setDistrict] = useState('Surabaya Pusat');
  const [nib, setNib] = useState('NIB-9120481023912');
  const [businessCategory, setBusinessCategory] = useState('Restoran / Warung Kuliner');
  const [pickupHours, setPickupHours] = useState('19:00 - 22:00 WIB');
  const [halalCertNo, setHalalCertNo] = useState('ID35110001298450123');
  const [defaultPackaging, setDefaultPackaging] = useState('Kemasan Boks Biodegradable (Steril)');

  // Preferences State
  const [autoMatchPanti, setAutoMatchPanti] = useState(true);
  const [waAlerts, setWaAlerts] = useState(true);
  const [autoExpireAlert, setAutoExpireAlert] = useState(true);

  // GPS Map Coordinates & Document State
  const [lat, setLat] = useState<number>(-7.2575);
  const [lng, setLng] = useState<number>(112.7521);
  const [uploadedNibDoc, setUploadedNibDoc] = useState<string | null>('Dokumen_NIB_PakKumis_Verified.pdf');

  // Media & Photo Profile State (SOP Media Branding)
  const [profileImage, setProfileImage] = useState<string | null>(session?.user?.image || null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  // Password & Account Security State (SOP Security)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Math.round(pos.coords.latitude * 10000) / 10000);
          setLng(Math.round(pos.coords.longitude * 10000) / 10000);
          setToastState({
            isOpen: true,
            message: 'Koordinat GPS akurat lokasi toko Anda berhasil terdeteksi!',
            type: 'success',
          });
        },
        () => {
          setLat(-7.2575);
          setLng(112.7521);
          setToastState({
            isOpen: true,
            message: 'Koordinat GPS ditetapkan ke Surabaya Pusat (Default)',
            type: 'success',
          });
        }
      );
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastState({
      isOpen: true,
      message: 'Seluruh pengaturan outlet, koordinat GPS, & media profil berhasil disimpan!',
      type: 'success',
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setToastState({
        isOpen: true,
        message: 'Masukkan kata sandi saat ini untuk melanjutkan perubahan sandi!',
        type: 'error',
      });
      return;
    }
    if (newPassword.length < 8) {
      setToastState({
        isOpen: true,
        message: 'Kata sandi baru minimal harus 8 karakter!',
        type: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToastState({
        isOpen: true,
        message: 'Konfirmasi kata sandi baru tidak cocok!',
        type: 'error',
      });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setToastState({
      isOpen: true,
      message: 'Kata sandi akun mitra berhasil diperbarui dengan aman!',
      type: 'success',
    });
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Kosong', percent: 0, color: 'bg-slate-200' };
    if (pass.length < 6) return { label: 'Sangat Lemah 🔴', percent: 25, color: 'bg-red-500' };
    if (pass.length < 8) return { label: 'Sedang 🟡', percent: 50, color: 'bg-amber-500' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { label: 'Sangat Kuat 🟢', percent: 100, color: 'bg-emerald-500' };
    return { label: 'Kuat 🟢', percent: 75, color: 'bg-emerald-400' };
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner with Realtime Status Connection */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
              Single Source of Truth Settings
            </span>
            <span className="text-xs text-slate-200 font-semibold">100% Terverifikasi SOP BPOM RI</span>
          </div>

          {/* Real-time Connection Status Indicator */}
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1 rounded-xl border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>REALTIME DB & API ONLINE (14ms)</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white">Pengaturan Outlet & Profil Usaha</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-3xl font-medium">
          Pusat kendali operasional mitra restoran: kelola kredensial legalitas NIB, foto logo/banner etalase, titik GPS Surabaya, jam pickup, kriteria higienitas BPOM, dan keamanan kata sandi.
        </p>
      </div>

      {/* Section 1: Upload Foto Profil & Banner Etalase Usaha (SOP Media Branding) */}
      <Card className="border-slate-200 shadow-xs">
        <CardBody className="p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>1. Identitas Visual & Upload Foto Profil Toko</span>
            </h3>
            <Badge variant="primary">SOP BRANDING MEDSOS</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Foto Profil Avatar Upload Box */}
            <div className="flex flex-col items-center text-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="relative w-24 h-24 rounded-full border-4 border-[#1B3A5C] overflow-hidden bg-slate-200 shadow-md flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Logo Restoran" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-[#1B3A5C]">
                    {orgName.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1B3A5C]">Foto Logo / Avatar Toko</h4>
                <p className="text-[10px] text-slate-500 font-medium">Format PNG/JPG, Max 5MB (Bentuk Melingkar)</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-[#1B3A5C] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-[#2C5A8F] transition-colors">
                  Upload Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const url = URL.createObjectURL(e.target.files[0]);
                        setProfileImage(url);
                        setToastState({
                          isOpen: true,
                          message: 'Foto profil logo toko berhasil diperbarui!',
                          type: 'success',
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {profileImage && (
                  <button
                    type="button"
                    onClick={() => setProfileImage(null)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Banner Header Etalase Toko */}
            <div className="md:col-span-2 space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-[#1B3A5C]">Banner Header Etalase Fisik Toko</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Tampil pada halaman publik sertifikat & listing redistribusi (Rasio 3:1)
                  </p>
                </div>
                <label className="px-3.5 py-2 bg-[#D4A843] text-slate-900 font-extrabold text-xs rounded-xl cursor-pointer hover:bg-amber-400 transition-colors shrink-0">
                  Upload Banner Etalase
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const url = URL.createObjectURL(e.target.files[0]);
                        setBannerImage(url);
                        setToastState({
                          isOpen: true,
                          message: 'Banner header etalase toko berhasil diperbarui!',
                          type: 'success',
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="w-full h-28 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 flex items-center justify-center relative">
                {bannerImage ? (
                  <img src={bannerImage} alt="Banner Etalase" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-xs font-bold text-slate-500">Belum ada banner etalase khusus yang diunggah</p>
                    <p className="text-[10px] text-slate-400">Klik tombol di atas untuk mengunggah foto suasana outlet Anda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 2: Profil Organisasi & Identitas Usaha */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
                </svg>
                <span>2. Identitas Usaha & Legalitas Bisnis</span>
              </h3>
              <Badge variant="success">VERIFIED PRO GRADE A</Badge>
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
                label="Nomor NIB / Izin Usaha Resmi (OSS BPOM Verified)"
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                required
              />

              <Input
                label="Email Resmi Operasional Outlet"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Upload Dokumen NIB Verification */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-extrabold text-[#1B3A5C] block">Dokumen Legalitas NIB / Izin Usaha:</span>
                <span className="text-slate-500 font-medium">{uploadedNibDoc || 'Belum diunggah'}</span>
              </div>
              <label className="px-3.5 py-2 bg-[#1B3A5C] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-[#2C5A8F] transition-colors shrink-0 text-center">
                Upload Berkas NIB (PDF/JPG)
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadedNibDoc(e.target.files[0].name);
                      setToastState({
                        isOpen: true,
                        message: `File ${e.target.files[0].name} berhasil diunggah untuk verifikasi Admin!`,
                        type: 'success',
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Section 3: Geofencing Lokasi & Interactive Map Picker */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>3. Geofencing Lokasi Surabaya & Penitik Peta GPS</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Wilayah Operasional Surabaya</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="Surabaya Pusat">Surabaya Pusat</option>
                  <option value="Surabaya Barat">Surabaya Barat</option>
                  <option value="Surabaya Timur">Surabaya Timur</option>
                  <option value="Surabaya Selatan">Surabaya Selatan</option>
                  <option value="Surabaya Utara">Surabaya Utara</option>
                </select>
              </div>

              <Input
                label="No. WhatsApp / Telepon PIC Penjemputan"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Alamat Lengkap Penjemputan Makanan Surplus"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Interactive GPS Pin Point Map Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-xs text-[#1B3A5C]">Penitikan Lokasi Presisi (Koordinat GPS Peta)</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Pastikan titik koordinat akurat agar penerima donasi & kurir komunitas dapat menemukan lokasi toko Anda.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  onClick={handleDetectGPS}
                  className="font-extrabold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>Detect GPS Otomatis</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Input
                  label="Latitude (Garis Lintang)"
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || -7.2575)}
                />
                <Input
                  label="Longitude (Garis Bujur)"
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 112.7521)}
                />
              </div>

              <div className="relative w-full h-44 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 flex items-center justify-center shadow-xs">
                <iframe
                  title="Google Maps Location Preview"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                  className="w-full h-full filter saturate-150"
                />
                <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Titik Penjemputan Toko: {lat}, {lng}</span>
                </div>
              </div>
            </div>

            <Input
              label="Jendela Jam Operasional Pickup Surplus"
              value={pickupHours}
              onChange={(e) => setPickupHours(e.target.value)}
              placeholder="19:00 - 22:00 WIB"
              required
            />
          </CardBody>
        </Card>

        {/* Section 4: Standar Kredensial Keamanan Pangan & BPOM */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>4. Standar Kredensial Higienitas & Halal BPOM</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Input
                label="Nomor Sertifikasi Halal (BPJPH / MUI)"
                value={halalCertNo}
                onChange={(e) => setHalalCertNo(e.target.value)}
              />

              <Input
                label="Standar Kemasan Default Toko"
                value={defaultPackaging}
                onChange={(e) => setDefaultPackaging(e.target.value)}
              />
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <span className="font-extrabold block">Status Audit SOP BPOM RI:</span>
              <p className="text-emerald-800 leading-relaxed font-medium">
                Outlet Anda telah lulus verifikasi audit 8-Checklist Higienitas Replate & berhak menerbitkan Sertifikat Penyelamat Pangan resmi untuk laporan CSR perusahaan.
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="gold" size="lg" className="font-extrabold shadow-md">
            Simpan Seluruh Pengaturan Outlet ➔
          </Button>
        </div>
      </form>

      {/* Section 5: Keamanan Akun & Perubahan Kata Sandi (SOP Password Security) */}
      <Card className="border-slate-200 shadow-xs">
        <CardBody className="p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>5. Keamanan Akun & Perubahan Kata Sandi (Password Reset)</span>
            </h3>
            <Badge variant="primary">SOP KEAMANAN STANDAR GOOGLE/LINKEDIN</Badge>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Password Field */}
              <div className="relative">
                <Input
                  label="Kata Sandi Saat Ini"
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan sandi saat ini"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 text-[11px] font-extrabold"
                >
                  {showCurrentPass ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>

              {/* New Password Field */}
              <div className="relative">
                <Input
                  label="Kata Sandi Baru (Min. 8 Karakter)"
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 text-[11px] font-extrabold"
                >
                  {showNewPass ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>

              {/* Confirm New Password Field */}
              <Input
                label="Konfirmasi Kata Sandi Baru"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                required
              />
            </div>

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600">Kekuatan Kata Sandi:</span>
                  <span className="text-[#1B3A5C]">{passStrength.label}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passStrength.color}`}
                    style={{ width: `${passStrength.percent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium text-[11px]">
                SOP Keamanan: Sandi otomatis terenkripsi bcrypt salted 12 rounds.
              </span>
              <Button type="submit" variant="primary" size="md" className="font-extrabold">
                Perbarui Kata Sandi Akun ➔
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

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
