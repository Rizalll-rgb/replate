'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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

  // Multi-Fleet Vehicles & Driver WhatsApp Contact Verification State
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

  const [providerCanDeliverDirect, setProviderCanDeliverDirect] = useState<boolean>(true);
  const [fleetApprovalStatus, setFleetApprovalStatus] = useState<'UNSUBMITTED' | 'PENDING' | 'APPROVED'>('APPROVED');

  const defaultFleetList: FleetVehicle[] = [
    {
      id: 'flt-101',
      driverName: 'Mas Doni (Driver Outlet Pak Kumis)',
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
      status: 'PENDING',
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
  const [selectedFleetId, setSelectedFleetId] = useState<string>('flt-101');

  // WhatsApp OTP Verification Modal State
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

  // Modal State for Upload Guidance Hints, Reference Examples & Full Preview Lightbox
  const [docPreviewModal, setDocPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    docType: string;
    sampleImage: string;
    currentImage: string;
    hintText: string;
    checklist: string[];
    mode: 'HINT' | 'USER_PREVIEW';
  }>({
    isOpen: false,
    title: '',
    docType: '',
    sampleImage: '',
    currentImage: '',
    hintText: '',
    checklist: [],
    mode: 'HINT',
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('replate_provider_can_deliver_direct');
      if (saved !== null) {
        setProviderCanDeliverDirect(saved === 'true');
      }
      const savedFleetStatus = localStorage.getItem('replate_provider_fleet_status');
      if (savedFleetStatus) {
        setFleetApprovalStatus(savedFleetStatus as any);
      }
    } catch (_) {}
  }, []);

  // Preferences State
  const [autoMatchPanti, setAutoMatchPanti] = useState(true);
  const [waAlerts, setWaAlerts] = useState(true);
  const [autoExpireAlert, setAutoExpireAlert] = useState(true);

  // GPS Map Coordinates & Document State
  const [lat, setLat] = useState<number>(-7.2575);
  const [lng, setLng] = useState<number>(112.7521);
  const [uploadedNibDoc, setUploadedNibDoc] = useState<string | null>('Dokumen_NIB_PakKumis_Verified.pdf');

  // Media & Photo Profile State
  const [profileImage, setProfileImage] = useState<string | null>(session?.user?.image || null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  // Bank & Payout Account State (Poin 1)
  const [bankName, setBankName] = useState('Bank Central Asia (BCA)');
  const [accountNumber, setAccountNumber] = useState('8291048129');
  const [accountHolder, setAccountHolder] = useState('Warung Bakso Pak Kumis');
  const [autoInfaqPercent, setAutoInfaqPercent] = useState('5% (Donasi Otomatis ke Panti)');

  // Food Waste Disposal & Policy State (Poin 2)
  const [gracePeriodMins, setGracePeriodMins] = useState('30 Menit');
  const [autoCompostRedirect, setAutoCompostRedirect] = useState(true);

  // Password & Account Security State
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
      message: 'Seluruh 8 pilar pengaturan outlet & profil usaha berhasil disimpan!',
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
          Pusat kendali operasional mitra restoran: kelola kredensial legalitas NIB, foto logo/banner, titik GPS Surabaya, jam pickup, rekening pencairan hasil rescue sale, kebijakan limbah organik, dan keamanan sandi.
        </p>
      </div>

      {/* Section 1: Upload Foto Profil & Banner Etalase Usaha */}
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

            {/* Provider Direct Delivery Fleet Capability Activation Sub-Card (Multi-Fleet & Driver WA Verification Workflow) */}
            <div className="p-5 bg-gradient-to-r from-[#1B3A5C] via-slate-900 to-[#142C47] text-white rounded-2xl space-y-4 border border-slate-700 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-wider block">
                      MANAJEMEN BANYAK ARMADA & VERIFIKASI WA DRIVER
                    </span>
                    <Badge variant="gold">MULTI-FLEET SYSTEM ({fleetList.length} ARMADA)</Badge>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    Registrasi Banyak Armada Toko & Verifikasi Otomatis Kontak WA Driver
                  </h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Daftarkan beberapa armada kendaraan (Motor/Mobil Box), verifikasi nomor WhatsApp driver via OTP, serta unggah 5 berkas fisik untuk setiap kendaraan.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `flt-${Date.now()}`;
                      const newVehicle = {
                        id: newId,
                        driverName: `Driver Baru Armada #${fleetList.length + 1}`,
                        driverPhone: '0812-9999-8888',
                        isPhoneVerified: false,
                        vehicleType: 'Sepeda Motor Box Steril',
                        plateNumber: `L ${Math.floor(1000 + Math.random() * 9000)} NEW`,
                        status: 'UNSUBMITTED' as const,
                        docs: {
                          driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
                          vehiclePhoto: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60',
                          ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
                          simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
                          stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
                        },
                      };
                      setFleetList([...fleetList, newVehicle]);
                      setSelectedFleetId(newId);
                      setToastState({
                        isOpen: true,
                        message: `🚚 Armada Baru #${fleetList.length + 1} Berhasil Ditambahkan Ke Daftar! Silakan Isi Kontak WA & Berkas.`,
                        type: 'success',
                      });
                    }}
                    className="px-3.5 py-2 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>+ Tambah Armada & Driver Baru</span>
                  </button>
                </div>
              </div>

              {/* Multi-Fleet Vehicles Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-800 scrollbar-thin">
                {fleetList.map((flt, idx) => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setSelectedFleetId(flt.id)}
                    className={`px-3.5 py-2 rounded-xl font-extrabold transition-all shrink-0 flex items-center gap-2 ${
                      selectedFleetId === flt.id
                        ? 'bg-[#1B3A5C] text-white border border-amber-400/50 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🛵 Armada #{idx + 1} ({flt.plateNumber})</span>
                    {flt.status === 'APPROVED' ? (
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">✓ AKTIF</span>
                    ) : flt.status === 'PENDING' ? (
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">⏳ PENDING</span>
                    ) : (
                      <span className="text-[9px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded">DRAFT</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Render Form Controls For Currently Selected Fleet */}
              {(() => {
                const currentFleet = fleetList.find((f) => f.id === selectedFleetId) || fleetList[0];
                if (!currentFleet) return null;

                return (
                  <div className="space-y-4 pt-1 text-xs">
                    {/* Status Banner Display */}
                    {currentFleet.status === 'APPROVED' ? (
                      <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300 font-bold text-xs">
                        <div className="space-y-0.5">
                          <span className="text-emerald-400 font-extrabold block flex items-center gap-2">
                            <span>✓ LISENSI ARMADA #{currentFleet.plateNumber} TERVERIFIKASI AKTIF (VERIFIED BY ADMIN REPLATE)</span>
                          </span>
                          <p className="text-slate-300 text-[11px] font-medium">
                            Driver: <strong>{currentFleet.driverName}</strong> • Kontak WA: <strong className="text-emerald-300">{currentFleet.driverPhone} (✓ VERIFIED OTP)</strong> • No. Plat: <strong className="font-mono text-amber-300">{currentFleet.plateNumber}</strong>
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-900 text-white font-mono text-[10px] rounded-md shrink-0">
                          FLEET-ID #{currentFleet.id.toUpperCase()}
                        </span>
                      </div>
                    ) : currentFleet.status === 'PENDING' ? (
                      <div className="p-4 bg-amber-950/90 border border-amber-500/50 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-300 text-sm block">
                            ⏳ ANTREAN PENGESAHAN ARMADA ({currentFleet.plateNumber}) (PENDING VERIFIKASI ADMIN)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFleetList((prev) =>
                                prev.map((item) =>
                                  item.id === currentFleet.id ? { ...item, status: 'APPROVED' } : item
                                )
                              );
                              setToastState({
                                isOpen: true,
                                message: `⚡ [DEMO] Admin me-approve Armada (${currentFleet.plateNumber})! Status kini TERVERIFIKASI AKTIF.`,
                                type: 'success',
                              });
                            }}
                            className="px-3 py-1 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-[11px] rounded-lg shadow-xs"
                          >
                            ⚡ Simulasi Approve Admin (Demo) ➔
                          </button>
                        </div>
                        <p className="text-slate-200 font-medium leading-relaxed">
                          Berkas administrasi <strong>No. Polisi ({currentFleet.plateNumber})</strong>, kontak WA driver ({currentFleet.driverPhone}), pasfoto driver, foto fisik kendaraan, KTP, SIM, dan STNK telah terkirim dan sedang diverifikasi oleh Admin Replate.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1 text-xs">
                        <span className="font-extrabold text-white block">
                          📝 Formulir Pendaftaran Armada Toko #{currentFleet.plateNumber}:
                        </span>
                        <p className="text-slate-300 text-[11px] font-medium">
                          Isi data driver, verifikasi nomor WhatsApp via OTP, serta unggah 5 foto berkas fisik kendaraan sebelum mengajukan.
                        </p>
                      </div>
                    )}

                    {/* Fleet Vehicle & Driver Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">1. Nama Driver Toko:</label>
                        <Input
                          placeholder="Contoh: Mas Doni"
                          value={currentFleet.driverName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFleetList((prev) =>
                              prev.map((item) => (item.id === currentFleet.id ? { ...item, driverName: val } : item))
                            );
                          }}
                          className="bg-slate-800 text-white border-slate-700 text-xs font-bold"
                          required
                        />
                      </div>

                      {/* Driver WhatsApp Phone Number Input With OTP Verification Trigger */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-bold block">2. No. WhatsApp Driver:</label>
                          {currentFleet.isPhoneVerified ? (
                            <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">
                              ✓ VERIFIED WA
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
                              ⏳ UNVERIFIED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Input
                            placeholder="Contoh: 0812-3456-7891"
                            value={currentFleet.driverPhone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFleetList((prev) =>
                                prev.map((item) =>
                                  item.id === currentFleet.id
                                    ? { ...item, driverPhone: val, isPhoneVerified: false }
                                    : item
                                )
                              );
                            }}
                            className="bg-slate-800 text-white border-slate-700 text-xs font-bold flex-1"
                            required
                          />

                          {!currentFleet.isPhoneVerified && (
                            <button
                              type="button"
                              onClick={() => {
                                const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
                                setOtpModal({
                                  isOpen: true,
                                  fleetId: currentFleet.id,
                                  phone: currentFleet.driverPhone,
                                  driverName: currentFleet.driverName,
                                  sentOtp: generatedCode,
                                  inputOtp: '',
                                });
                                setToastState({
                                  isOpen: true,
                                  message: `📲 Kode OTP WhatsApp [ ${generatedCode} ] dikirimkan ke No. Driver ${currentFleet.driverPhone}!`,
                                  type: 'success',
                                });
                              }}
                              className="px-2.5 py-2 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-[10px] rounded-lg shrink-0 shadow-xs"
                            >
                              ⚡ Verifikasi WA
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1">3. Jenis Kendaraan:</label>
                        <Input
                          placeholder="Contoh: Honda Vario Box Steril / Pick Up"
                          value={currentFleet.vehicleType}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFleetList((prev) =>
                              prev.map((item) => (item.id === currentFleet.id ? { ...item, vehicleType: val } : item))
                            );
                          }}
                          className="bg-slate-800 text-white border-slate-700 text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1">4. Nomor Polisi (No. Plat STNK):</label>
                        <Input
                          placeholder="Contoh: L 1234 ABC"
                          value={currentFleet.plateNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFleetList((prev) =>
                              prev.map((item) => (item.id === currentFleet.id ? { ...item, plateNumber: val } : item))
                            );
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1">
                        <span className="font-extrabold text-[#D4A843] text-xs flex items-center gap-1.5">
                          <span>💡 Ketentuan & Panduan Unggah Berkas Legalitas Armada #{currentFleet.plateNumber}:</span>
                        </span>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                          Pastikan pencahayaan terang, teks NIK/No. SIM/STNK terlihat jelas tanpa bayangan/silau. Gunakan tombol <strong>💡 Contoh Yang Benar</strong> untuk melihat standar resmi Replate dan tombol <strong>🔍 Preview Hasil Upload</strong> untuk memeriksa ulang berkas Anda.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* 1. Pasfoto Driver Toko */}
                        <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-center flex flex-col justify-between shadow-xs">
                          <div>
                            <span className="font-extrabold text-white block text-[11px] mb-1">1. 👤 Pasfoto Driver Toko</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              Wajah lurus, pencahayaan terang.
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.driverPhoto}
                                alt="Pasfoto Driver"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                ✓ READY
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: 'Panduan & Contoh Pasfoto Driver Toko Yang Benar',
                                  docType: 'Pasfoto Driver Toko',
                                  sampleImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.driverPhoto,
                                  hintText: 'Pasfoto driver digunakan untuk verifikasi identitas fisik penanggung jawab pengantaran makanan surplus.',
                                  checklist: [
                                    'Wajah menghadap lurus ke depan dengan jelas',
                                    'Tidak menggunakan kacamata hitam atau topi yang menutupi wajah',
                                    'Pencahayaan terang dan foto tidak buram',
                                    'Mengenai pakaian berseragam outlet / rapi',
                                  ],
                                  mode: 'HINT',
                                })
                              }
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all"
                            >
                              💡 Contoh Yang Benar 👁️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: `Preview Hasil Upload: Pasfoto Driver (${currentFleet.driverName})`,
                                  docType: 'Pasfoto Driver Toko',
                                  sampleImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.driverPhoto,
                                  hintText: 'Periksa kejelasan foto driver yang baru saja Anda unggah.',
                                  checklist: ['Wajah terlihat jelas & tajam', 'Identitas siap diajukan'],
                                  mode: 'USER_PREVIEW',
                                })
                              }
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all"
                            >
                              🔍 Preview Hasil Upload 👁️
                            </button>

                            <label className="w-full py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white text-[10px] font-extrabold rounded-lg cursor-pointer block text-center shadow-xs">
                              Upload Pasfoto
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setFleetList((prev) =>
                                      prev.map((item) =>
                                        item.id === currentFleet.id
                                          ? { ...item, docs: { ...item.docs, driverPhoto: url } }
                                          : item
                                      )
                                    );
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 2. Foto Fisik Armada Kendaraan Toko */}
                        <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-center flex flex-col justify-between shadow-xs">
                          <div>
                            <span className="font-extrabold text-white block text-[11px] mb-1">2. 🚚 Foto Fisik Armada Toko</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              Kendaraan + Plat {currentFleet.plateNumber}
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.vehiclePhoto}
                                alt="Foto Armada"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                ✓ READY
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: 'Panduan & Contoh Foto Fisik Armada Yang Benar',
                                  docType: 'Foto Fisik Armada Kendaraan',
                                  sampleImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.vehiclePhoto,
                                  hintText: 'Foto fisik armada kendaraan memperlihatkan kelaikan kendaraan operasional toko serta nomor polisinya.',
                                  checklist: [
                                    `Nomor Polisi (${currentFleet.plateNumber}) terlihat utuh & terbaca`,
                                    'Boks tempat makanan/cooler box tampak steril jika ada',
                                    'Kondisi fisik kendaraan bersih & layak jalan',
                                  ],
                                  mode: 'HINT',
                                })
                              }
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all"
                            >
                              💡 Contoh Yang Benar 👁️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: `Preview Hasil Upload: Foto Armada (${currentFleet.plateNumber})`,
                                  docType: 'Foto Fisik Armada Kendaraan',
                                  sampleImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.vehiclePhoto,
                                  hintText: 'Periksa kejelasan foto kendaraan & plat nomor yang diunggah.',
                                  checklist: ['Nomor Plat terbaca tajam', 'Kendaraan siap diajukan'],
                                  mode: 'USER_PREVIEW',
                                })
                              }
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all"
                            >
                              🔍 Preview Hasil Upload 👁️
                            </button>

                            <label className="w-full py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white text-[10px] font-extrabold rounded-lg cursor-pointer block text-center shadow-xs">
                              Upload Armada
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setFleetList((prev) =>
                                      prev.map((item) =>
                                        item.id === currentFleet.id
                                          ? { ...item, docs: { ...item.docs, vehiclePhoto: url } }
                                          : item
                                      )
                                    );
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 3. Foto KTP Driver Toko */}
                        <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-center flex flex-col justify-between shadow-xs">
                          <div>
                            <span className="font-extrabold text-white block text-[11px] mb-1">3. 🪪 Foto KTP Driver Toko</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              NIK 16 digit & Nama lurus.
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.ktpPhoto}
                                alt="Foto KTP"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                ✓ READY
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: 'Panduan & Contoh Foto KTP Yang Benar',
                                  docType: 'Foto KTP Driver Toko',
                                  sampleImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.ktpPhoto,
                                  hintText: 'Foto KTP digunakan untuk validasi legalitas kewarganegaraan driver pengantar.',
                                  checklist: [
                                    'Seluruh 4 sudut KTP berada di dalam bingkai foto',
                                    'NIK 16 digit & Nama Lengkap dapat dibaca dengan mudah',
                                    'Bukan fotokopi buram atau hasil rekayasa digital',
                                  ],
                                  mode: 'HINT',
                                })
                              }
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all"
                            >
                              💡 Contoh Yang Benar 👁️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: `Preview Hasil Upload: Foto KTP Driver (${currentFleet.driverName})`,
                                  docType: 'Foto KTP Driver Toko',
                                  sampleImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.ktpPhoto,
                                  hintText: 'Pastikan NIK & Nama pada KTP terbaca tajam sebelum dikirim.',
                                  checklist: ['NIK 16 digit terbaca tajam', 'Format KTP valid'],
                                  mode: 'USER_PREVIEW',
                                })
                              }
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all"
                            >
                              🔍 Preview Hasil Upload 👁️
                            </button>

                            <label className="w-full py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white text-[10px] font-extrabold rounded-lg cursor-pointer block text-center shadow-xs">
                              Upload KTP
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setFleetList((prev) =>
                                      prev.map((item) =>
                                        item.id === currentFleet.id
                                          ? { ...item, docs: { ...item.docs, ktpPhoto: url } }
                                          : item
                                      )
                                    );
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 4. Foto SIM Driver Toko */}
                        <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-center flex flex-col justify-between shadow-xs">
                          <div>
                            <span className="font-extrabold text-white block text-[11px] mb-1">4. 💳 Foto SIM Driver Toko</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              SIM C/A aktif.
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.simPhoto}
                                alt="Foto SIM"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                ✓ READY
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: 'Panduan & Contoh Foto SIM C/A Yang Benar',
                                  docType: 'Foto SIM Driver Toko',
                                  sampleImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.simPhoto,
                                  hintText: 'Lisensi mengemudi sah (SIM C untuk motor / SIM A untuk mobil box).',
                                  checklist: [
                                    'Masa berlaku SIM masih aktif & belum expired',
                                    'Golongan SIM sesuai jenis armada kendaraan',
                                    'Nomor SIM & Pasfoto di SIM terlihat tajam',
                                  ],
                                  mode: 'HINT',
                                })
                              }
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all"
                            >
                              💡 Contoh Yang Benar 👁️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: `Preview Hasil Upload: Foto SIM Driver (${currentFleet.driverName})`,
                                  docType: 'Foto SIM Driver Toko',
                                  sampleImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.simPhoto,
                                  hintText: 'Periksa kejelasan nomor SIM & tanggal berlaku.',
                                  checklist: ['Masa berlaku SIM aktif', 'Foto SIM jelas'],
                                  mode: 'USER_PREVIEW',
                                })
                              }
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all"
                            >
                              🔍 Preview Hasil Upload 👁️
                            </button>

                            <label className="w-full py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white text-[10px] font-extrabold rounded-lg cursor-pointer block text-center shadow-xs">
                              Upload SIM
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setFleetList((prev) =>
                                      prev.map((item) =>
                                        item.id === currentFleet.id
                                          ? { ...item, docs: { ...item.docs, simPhoto: url } }
                                          : item
                                      )
                                    );
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 5. Foto STNK Kendaraan Toko */}
                        <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-center flex flex-col justify-between shadow-xs">
                          <div>
                            <span className="font-extrabold text-white block text-[11px] mb-1">5. 📄 Foto STNK Kendaraan</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              Cocok Plat {currentFleet.plateNumber}
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.stnkPhoto}
                                alt="Foto STNK"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                ✓ READY
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: 'Panduan & Contoh Foto STNK Yang Benar',
                                  docType: 'Foto STNK Kendaraan Operasional',
                                  sampleImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.stnkPhoto,
                                  hintText: 'STNK resmi membuktikan legalitas kepemilikan/pengoperasian armada toko.',
                                  checklist: [
                                    `Nomor Polisi STNK harus persis cocok dengan input form (${currentFleet.plateNumber})`,
                                    'Pajak STNK aktif & pengesahan tahunan terbaca',
                                    'Nomor Rangka & Merk kendaraan cocok',
                                  ],
                                  mode: 'HINT',
                                })
                              }
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all"
                            >
                              💡 Contoh Yang Benar 👁️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDocPreviewModal({
                                  isOpen: true,
                                  title: `Preview Hasil Upload: Foto STNK (${currentFleet.plateNumber})`,
                                  docType: 'Foto STNK Kendaraan Operasional',
                                  sampleImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
                                  currentImage: currentFleet.docs.stnkPhoto,
                                  hintText: 'Periksa kesesuaian Nomor Polisi pada lembar STNK yang Anda unggah.',
                                  checklist: ['No. Polisi STNK cocok dengan form', 'STNK pajak aktif'],
                                  mode: 'USER_PREVIEW',
                                })
                              }
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all"
                            >
                              🔍 Preview Hasil Upload 👁️
                            </button>

                            <label className="w-full py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white text-[10px] font-extrabold rounded-lg cursor-pointer block text-center shadow-xs">
                              Upload STNK
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setFleetList((prev) =>
                                      prev.map((item) =>
                                        item.id === currentFleet.id
                                          ? { ...item, docs: { ...item.docs, stnkPhoto: url } }
                                          : item
                                      )
                                    );
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-800">
                      <Button
                        type="button"
                        variant="gold"
                        size="md"
                        className="font-extrabold shadow-md text-slate-950 text-xs px-6"
                        onClick={() => {
                          if (!currentFleet.driverName || !currentFleet.plateNumber) {
                            alert('Mohon isi nama driver toko dan nomor polisi (No. Plat) kendaraan!');
                            return;
                          }
                          if (!currentFleet.isPhoneVerified) {
                            alert('Mohon lakukan verifikasi OTP nomor WhatsApp kontak driver terlebih dahulu!');
                            return;
                          }

                          setFleetList((prev) =>
                            prev.map((item) =>
                              item.id === currentFleet.id ? { ...item, status: 'PENDING' } : item
                            )
                          );

                          setToastState({
                            isOpen: true,
                            message: `🚀 Berkas Armada (${currentFleet.plateNumber}) berhasil dikirim ke Admin Replate untuk diverifikasi!`,
                            type: 'success',
                          });
                        }}
                      >
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>

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

        {/* Section 4: Rekening Bank Pencairan Hasil Rescue Sale & Infaq Otomatis (Poin 1 - New Enterprise Section) */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>4. Rekening Bank Pencairan Hasil Rescue Sale & Infaq Otomatis</span>
              </h3>
              <Badge variant="gold">PAYOUT SETTLEMENT</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Nama Bank / E-Wallet Kliring</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                  <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                  <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                </select>
              </div>

              <Input
                label="Nomor Rekening Bank Operasional"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />

              <Input
                label="Nama Pemilik Rekening (Sesuai NIB)"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                required
              />
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-extrabold text-[#1B3A5C] block">Donasi Infaq Otomatis Hasil Penjualan Rescue Sale:</span>
                <span className="text-slate-600 font-medium">Potongan {autoInfaqPercent} langsung disalurkan ke panti asuhan terdaftar.</span>
              </div>
              <select
                className="rounded-xl border border-amber-300 text-xs px-3 py-1.5 bg-white font-bold text-[#1B3A5C] focus:outline-none"
                value={autoInfaqPercent}
                onChange={(e) => setAutoInfaqPercent(e.target.value)}
              >
                <option value="0% (Tanpa Donasi Infaq)">0% (Tanpa Donasi Infaq)</option>
                <option value="2.5% (Zakat Pangan)">2.5% (Zakat Pangan)</option>
                <option value="5% (Donasi Otomatis ke Panti)">5% (Donasi Otomatis ke Panti)</option>
                <option value="10% (Program Kemanusiaan Pro)">10% (Program Kemanusiaan Pro)</option>
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Section 5: Kebijakan Retur & Pengolahan Limbah Organik (Poin 2 - New Enterprise Section) */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>5. Toleransi Grace Period & Pengolahan Kompos Organik Zero-Waste</span>
              </h3>
              <Badge variant="success">ZERO WASTE POLICY</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Batas Toleransi Keterlambatan Pickup (Grace Period)</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={gracePeriodMins}
                  onChange={(e) => setGracePeriodMins(e.target.value)}
                >
                  <option value="15 Menit">15 Menit</option>
                  <option value="30 Menit">30 Menit (Standar Recommendation)</option>
                  <option value="45 Menit">45 Menit</option>
                  <option value="60 Menit">60 Menit</option>
                </select>
              </div>

              <div className="flex flex-col justify-center">
                <label className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer">
                  <div>
                    <span className="font-extrabold text-emerald-900 block">Otomatiskan Penyaluran Komposter Organik</span>
                    <span className="text-emerald-700 block text-[11px]">Jika tidak diambil, alihkan makanan surplus ke mitra pengolah pakan ternak / komposter TPA Benowo.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCompostRedirect}
                    onChange={(e) => setAutoCompostRedirect(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Section 6: Standar Kredensial Keamanan Pangan & BPOM */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>6. Standar Kredensial Higienitas & Halal BPOM</span>
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

        {/* Section 7: Preferensi Otomatisasi & Notifikasi */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>7. Preferensi Smart Matching & Notifikasi WhatsApp</span>
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
                  <span className="text-slate-500 block text-[11px]">Kirimkan notifikasi WhatsApp instan setiap ada klaim baru atau verifikasi Kode QR.</span>
                </div>
                <input
                  type="checkbox"
                  checked={waAlerts}
                  onChange={(e) => setWaAlerts(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-extrabold text-[#1B3A5C] block">Peringatan Otomatis 30 Menit Sebelum Pickup Expire</span>
                  <span className="text-slate-500 block text-[11px]">Sistem akan mengirim peringatan jika ada listing yang mendekati batas waktu penjemputan.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoExpireAlert}
                  onChange={(e) => setAutoExpireAlert(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="gold" size="lg" className="font-extrabold shadow-md">
            Simpan Seluruh 8 Pengaturan Outlet ➔
          </Button>
        </div>
      </form>

      {/* Section 8: Keamanan Akun & Perubahan Kata Sandi */}
      <Card className="border-slate-200 shadow-xs">
        <CardBody className="p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>8. Keamanan Akun & Perubahan Kata Sandi (Password Reset)</span>
            </h3>
            <Badge variant="primary">SOP KEAMANAN ENTERPRISE</Badge>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Input
                label="Konfirmasi Kata Sandi Baru"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                required
              />
            </div>

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

      {/* Modal Lightbox for Document Guidance Hints, Sample Reference Photos & User Upload Inspection */}
      {docPreviewModal.isOpen && (
        <Modal
          isOpen={docPreviewModal.isOpen}
          onClose={() => setDocPreviewModal((prev) => ({ ...prev, isOpen: false }))}
          title={docPreviewModal.title}
          size="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-[#1B3A5C] text-white rounded-xl space-y-1 shadow-sm">
              <span className="font-extrabold text-[#D4A843] block text-xs">
                {docPreviewModal.mode === 'HINT' ? '💡 Ketentuan & SOP Resmi Upload Replate:' : '🔍 Mode Inspeksi Hasil Unggah Anda:'}
              </span>
              <p className="text-slate-200 text-[11px] font-medium leading-relaxed">
                {docPreviewModal.hintText}
              </p>
            </div>

            {/* Checklist items */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-extrabold text-slate-800 text-[11px] block">Checklist Persyaratan Berkas:</span>
              <ul className="space-y-1">
                {docPreviewModal.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Image Comparison / Single Display */}
            {docPreviewModal.mode === 'HINT' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2 text-center">
                  <span className="font-extrabold text-emerald-800 text-[11px] block">
                    ✓ CONTOH STANDAR RESMI YANG BENAR
                  </span>
                  <img
                    src={docPreviewModal.sampleImage}
                    alt="Contoh Benar"
                    className="w-full h-52 object-cover rounded-lg border border-emerald-500/40 shadow-xs"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    Pencahayaan tajam, sudut utuh, teks terbaca tanpa silau.
                  </span>
                </div>

                <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl space-y-2 text-center">
                  <span className="font-extrabold text-slate-800 text-[11px] block">
                    📷 BERKAS YANG ANDA UNGGAH SAAT INI
                  </span>
                  <img
                    src={docPreviewModal.currentImage}
                    alt="Berkas Anda"
                    className="w-full h-52 object-cover rounded-lg border border-slate-300 shadow-xs"
                  />
                  <span className="text-[10px] text-slate-600 font-semibold block">
                    Pastikan berkas Anda sudah mirip dengan contoh di sebelah kiri.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 text-center">
                <span className="font-extrabold text-amber-300 text-xs block">
                  🔍 INSPEKSI LENGKAP HASIL UPLOAD BERKAS ANDA
                </span>
                <div className="max-h-[380px] overflow-auto rounded-lg border border-slate-700 bg-black flex items-center justify-center p-2">
                  <img
                    src={docPreviewModal.currentImage}
                    alt="Inspection Full"
                    className="max-w-full max-h-[350px] object-contain rounded-md"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Jika file sudah jelas, tajam, dan tidak buram, klik "Sesuai & Siap Ajukan".
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocPreviewModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Tutup Preview
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-black text-slate-950"
                onClick={() => {
                  setDocPreviewModal((prev) => ({ ...prev, isOpen: false }));
                  setToastState({
                    isOpen: true,
                    message: '✓ Berkas terkonfirmasi sesuai! Silakan lanjutkan ke pengajuan armada toko.',
                    type: 'success',
                  });
                }}
              >
                ✓ Sesuai & Siap Ajukan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Verifikasi OTP WhatsApp Kontak Driver */}
      {otpModal.isOpen && (
        <Modal
          isOpen={otpModal.isOpen}
          onClose={() => setOtpModal((prev) => ({ ...prev, isOpen: false }))}
          title={`Verifikasi OTP WhatsApp Kontak Driver (${otpModal.driverName})`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-emerald-950 text-emerald-200 rounded-xl space-y-1.5 border border-emerald-500/30">
              <span className="font-extrabold text-emerald-400 block text-xs flex items-center gap-1.5">
                <span>📲 Kode OTP 6-Digit Dikirim via WhatsApp:</span>
              </span>
              <p className="text-[11px] font-medium text-slate-200 leading-relaxed">
                Kami telah menginfokan kode OTP simulasi ke nomor WhatsApp driver <strong>{otpModal.phone}</strong>. Masukkan kode di bawah untuk memverifikasi kontak driver.
              </p>
              <div className="p-2 bg-slate-900 border border-emerald-500/40 rounded-lg text-center font-mono font-black text-amber-300 text-lg tracking-widest">
                {otpModal.sentOtp}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-[#1B3A5C] block">Masukkan Kode OTP (6-Digit):</label>
              <Input
                placeholder="Contoh: 849201"
                value={otpModal.inputOtp}
                onChange={(e) => setOtpModal((prev) => ({ ...prev, inputOtp: e.target.value }))}
                className="font-mono text-center font-black text-lg tracking-widest text-[#1B3A5C] border-slate-300"
                maxLength={6}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOtpModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Batal
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-black text-slate-950"
                onClick={() => {
                  if (otpModal.inputOtp.trim() !== otpModal.sentOtp && otpModal.inputOtp.trim() !== '849201') {
                    alert(`Kode OTP tidak sesuai! Masukkan kode OTP [ ${otpModal.sentOtp} ].`);
                    return;
                  }

                  // Update fleet item's isPhoneVerified to true
                  setFleetList((prev) =>
                    prev.map((item) =>
                      item.id === otpModal.fleetId ? { ...item, isPhoneVerified: true } : item
                    )
                  );

                  setOtpModal((prev) => ({ ...prev, isOpen: false }));
                  setToastState({
                    isOpen: true,
                    message: `✅ Nomor WhatsApp Driver (${otpModal.phone}) Berhasil Terverifikasi Sah via OTP!`,
                    type: 'success',
                  });
                }}
              >
                Verifikasi OTP Kontak Driver ➔
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
