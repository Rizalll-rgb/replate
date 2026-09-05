'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BikeIcon,
  TruckIcon,
  MapPinIcon,
  MapIcon,
  ChatIcon,
  PhoneIcon,
  CheckIcon,
  ClockIcon,
  SearchIcon,
  ShieldCheckIcon,
  PackageIcon,
  CreditCardIcon,
  CameraIcon,
  GalleryIcon,
  SettingsIcon,
  AlertTriangleIcon,
} from '@/components/ui/Icon';

export default function ProviderSettingsPage() {
  const { data: session } = useSession();

  // Mobile Segmented Tab Category State
  type SettingCategory = 'PROFILE' | 'PAYMENT' | 'FLEET' | 'SOP' | 'SECURITY';
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('PROFILE');

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

  // QRIS Merchant & Payment Setup State (Poin 3)
  const [qrisMerchantName, setQrisMerchantName] = useState('Warung Bakso Pak Kumis Surabaya');
  const [qrisBank, setQrisBank] = useState('Bank Mandiri / BCA');
  const [qrisAccountNo, setQrisAccountNo] = useState('141-00-9812401-2');
  const [qrisNmid, setQrisNmid] = useState('ID1020304050607');
  const [qrisImageUrl, setQrisImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80'
  );

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
      let regUser: any = null;
      const rawReg = localStorage.getItem('replate_registered_user');
      if (rawReg) {
        try { regUser = JSON.parse(rawReg); } catch (_) {}
      }

      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setOrgName(parsed.entityName);
        else if (regUser?.name) setOrgName(regUser.name);
        if (parsed.phone) setPhone(parsed.phone);
        else if (regUser?.phone) setPhone(regUser.phone);
        if (parsed.email) setEmail(parsed.email);
        else if (regUser?.email) setEmail(regUser.email);
        if (parsed.address) {
          setAddress(parsed.address);
          const lower = parsed.address.toLowerCase();
          if (lower.includes('magetan') || lower.includes('sarangan') || lower.includes('plaosan')) {
            setDistrict(parsed.district ? `Kec. ${parsed.district}, Kab. Magetan` : 'Kabupaten Magetan');
            if (lower.includes('plaosan') || lower.includes('sarangan')) {
              setLat(-7.6749); setLng(111.2201);
            } else if (lower.includes('sidorejo')) {
              setLat(-7.65737); setLng(111.27939);
            } else {
              setLat(-7.6508); setLng(111.3283);
            }
          } else if (parsed.district) {
            setDistrict(parsed.district);
          }
        }
        if (parsed.lat || parsed.latitude) {
          setLat(parsed.lat || parsed.latitude);
        }
        if (parsed.lng || parsed.longitude) {
          setLng(parsed.lng || parsed.longitude);
        }
        if (parsed.contactPerson) setAccountHolder(parsed.contactPerson);
        if (parsed.category) setBusinessCategory(parsed.category);
      } else if (regUser) {
        if (regUser.name) setOrgName(regUser.name);
        if (regUser.email) setEmail(regUser.email);
        if (regUser.phone) setPhone(regUser.phone);
      }

      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      if (isFresh) {
        setFleetList([]);
        setSelectedFleetId('');
        setFleetApprovalStatus('UNSUBMITTED');
        setUploadedNibDoc(null);
        setNib('');
        setHalalCertNo('');
        if (p) {
          try {
            setQrisMerchantName(JSON.parse(p).entityName || '');
          } catch (_) {}
        }
        setQrisAccountNo('');
        setQrisNmid('');
      } else {
        const storedFleet = localStorage.getItem('replate_provider_fleet_list');
        if (storedFleet) {
          setFleetList(JSON.parse(storedFleet));
        } else {
          setFleetList(defaultFleetList);
        }
      }

      const saved = localStorage.getItem('replate_provider_can_deliver_direct');
      if (saved !== null) {
        setProviderCanDeliverDirect(saved === 'true');
      } else {
        localStorage.setItem('replate_provider_can_deliver_direct', 'true');
        setProviderCanDeliverDirect(true);
      }
      const savedFleetStatus = localStorage.getItem('replate_provider_fleet_status');
      if (savedFleetStatus) {
        setFleetApprovalStatus(savedFleetStatus as any);
      } else if (!isFresh) {
        localStorage.setItem('replate_provider_fleet_status', 'APPROVED');
        setFleetApprovalStatus('APPROVED');
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
  const [qrisPhoto, setQrisPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60'
  );

  React.useEffect(() => {
    try {
      const savedQris = localStorage.getItem('replate_provider_qris_photo');
      if (savedQris) {
        setQrisPhoto(savedQris);
      }
    } catch (_) {}
  }, []);

  // Global Outlet Delivery Methods State (Poin 2)
  const [globalSelfPickup, setGlobalSelfPickup] = useState<boolean>(true);
  const [globalRescueCourier, setGlobalRescueCourier] = useState<boolean>(true);
  const [globalDirectFleet, setGlobalDirectFleet] = useState<boolean>(true);

  // Preferred Rescue Partner Drop State (Poin 5: CRUD & Two-Way Confirmation)
  const [preferredPartnerEnabled, setPreferredPartnerEnabled] = useState(true);
  const [uploadedHalalDoc, setUploadedHalalDoc] = useState<string | null>('Surat_Pernyataan_Self_Declare_Halal_BPOM.pdf');
  const [preferredPartnersList, setPreferredPartnersList] = useState<
    { id: string; pantiName: string; frequency: string; location: string; status: 'CONFIRMED_BY_PANTI' | 'PENDING_PANTI_ACCEPTANCE' }[]
  >([
    {
      id: 'pr-1',
      pantiName: 'Panti Asuhan Kasih Ibu (Yayasan)',
      frequency: 'Jumat Barokah & Setiap Malam',
      location: 'Surabaya Timur',
      status: 'CONFIRMED_BY_PANTI',
    },
    {
      id: 'pr-2',
      pantiName: 'Panti Werdha Lansia Sejahtera',
      frequency: 'Setiap Hari Jumat Saja',
      location: 'Surabaya Selatan',
      status: 'CONFIRMED_BY_PANTI',
    },
  ]);

  const [addPartnerModal, setAddPartnerModal] = useState({
    isOpen: false,
    pantiName: 'Rumah Singgah Anak Jalanan (Shelter)',
    frequency: 'Jumat Barokah & Setiap Malam',
  });

  const handleAddPreferredPartner = () => {
    const newItem = {
      id: `pr-${Date.now()}`,
      pantiName: addPartnerModal.pantiName,
      frequency: addPartnerModal.frequency,
      location: 'Kota Surabaya',
      status: 'PENDING_PANTI_ACCEPTANCE' as const,
    };
    setPreferredPartnersList((prev) => [...prev, newItem]);
    setAddPartnerModal({ ...addPartnerModal, isOpen: false });
    setToastState({
      isOpen: true,
      message: `Permintaan Kemitraan Langganan telah Dikirimkan ke Notifikasi Panti Asuhan "${newItem.pantiName}"! Status: MENUNGGU PERSETUJUAN PANTI.`,
      type: 'success',
    });
  };

  const handleDeletePreferredPartner = (id: string, name: string) => {
    setPreferredPartnersList((prev) => prev.filter((item) => item.id !== id));
    setToastState({
      isOpen: true,
      message: `Langganan Rutin "${name}" Berhasil Dihapus dari Daftar Prioritas!`,
      type: 'success',
    });
  };

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

  const [actionLoader, setActionLoader] = useState<{
    isOpen: boolean;
    message: string;
    submessage?: string;
  }>({
    isOpen: false,
    message: '',
    submessage: '',
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
    setActionLoader({
      isOpen: true,
      message: 'Menyimpan Pengaturan Outlet...',
      submessage: 'Memperbarui profil, data rekening, dan konfigurasi armada',
    });

    setTimeout(() => {
      try {
        const existing = JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}');
        const updated = {
          ...existing,
          entityName: orgName,
          name: orgName,
          phone,
          email,
          address,
          district,
          nib,
          businessCategory,
          pickupHours,
          halalCertNo,
          defaultPackaging,
          latitude: lat,
          longitude: lng,
          role: 'FOOD_PROVIDER',
        };
        localStorage.setItem('replate_onboarding_profile', JSON.stringify(updated));

        const outletSettings = {
          orgName,
          phone,
          email,
          address,
          district,
          nib,
          businessCategory,
          pickupHours,
          halalCertNo,
          defaultPackaging,
          latitude: lat,
          longitude: lng,
          qrisMerchantName,
          qrisBank,
          qrisAccountNo,
          qrisNmid,
          qrisImageUrl,
        };
        localStorage.setItem('replate_outlet_settings', JSON.stringify(outletSettings));

        const qrisConfig = {
          merchantName: qrisMerchantName,
          bank: qrisBank,
          accountNo: qrisAccountNo,
          nmid: qrisNmid,
          imageUrl: qrisImageUrl,
        };
        localStorage.setItem('replate_provider_qris_config', JSON.stringify(qrisConfig));
      } catch (_) {}

      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Seluruh pengaturan outlet, data usaha, dan QRIS Merchant berhasil disimpan permanen secara realtime!',
        type: 'success',
      });
    }, 800);
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
    if (pass.length < 6) return { label: 'Sangat Lemah', percent: 25, color: 'bg-red-500' };
    if (pass.length < 8) return { label: 'Sedang', percent: 50, color: 'bg-amber-500' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { label: 'Sangat Kuat', percent: 100, color: 'bg-emerald-500' };
    return { label: 'Kuat', percent: 75, color: 'bg-emerald-400' };
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />
      {/* Sleek Modern Header Card (Compact & Ergonomic - Seragam Antar Modul) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Pengaturan Akun & Outlet
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SOP BPOM Terverifikasi</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              Pengaturan Outlet & Profil Usaha
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Kelola legalitas NIB, foto logo/banner, titik GPS, rekening pencairan, dan armada driver toko.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/provider">
              <Button
                variant="outline"
                size="sm"
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE & DESKTOP SEGMENTED CATEGORY TAB BAR (Point 5 - Eliminates Infinite Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { key: 'PROFILE', label: 'Profil Usaha', icon: MapPinIcon },
          { key: 'PAYMENT', label: 'Rekening & QRIS', icon: CreditCardIcon },
          { key: 'FLEET', label: 'Armada Driver', icon: TruckIcon },
          { key: 'SOP', label: 'SOP Higienitas', icon: ShieldCheckIcon },
          { key: 'SECURITY', label: 'Keamanan Akun', icon: SettingsIcon },
        ].map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key as any)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#1B3A5C] text-white shadow-md ring-2 ring-[#D4A843]/50'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <IconComp size={14} className={isActive ? 'text-[#D4A843]' : 'text-slate-500'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Upload Foto Profil & Banner Etalase Usaha */}
      {activeCategory === 'PROFILE' && (
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Identitas Visual & Upload Foto Profil Toko</span>
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
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 2: Profil Organisasi & Identitas Usaha */}
        {activeCategory === 'PROFILE' && (
          <Card className="border-slate-200 shadow-xs">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
                  </svg>
                  <span>Identitas Usaha & Legalitas Bisnis</span>
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDocPreviewModal({
                        isOpen: true,
                        title: 'Preview Dokumen Legalitas NIB / Izin Usaha Toko',
                        docType: 'NIB / Izin Usaha Perdagangan',
                        sampleImage: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop&q=80',
                        currentImage: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop&q=80',
                        hintText: 'Periksa kejelasan dokumen NIB toko terverifikasi.',
                        checklist: ['Nomor Induk Berusaha (NIB) terdaftar', 'Nama Usaha Sesuai Outlet'],
                        mode: 'USER_PREVIEW',
                      })
                    }
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shrink-0"
                  >
                    <SearchIcon size={13} />
                    <span>Preview Dokumen NIB</span>
                  </button>
                  <label className="px-3.5 py-2 bg-[#1B3A5C] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-[#2C5A8F] transition-colors shrink-0 text-center">
                    Upload Berkas NIB
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
              </div>
            </CardBody>
          </Card>
        )}

        {/* Section: Pengaturan QRIS Merchant & Rekening Penerimaan (Poin 3) */}
        {activeCategory === 'PAYMENT' && (
          <Card className="border-slate-200 shadow-xs">
            <CardBody className="p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                    METODE PEMBAYARAN RESCUE SALE
                  </span>
                  <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-1.5">
                    <CreditCardIcon size={18} className="text-[#1B3A5C]" />
                    <span>Pengaturan QRIS Merchant & Rekening Pencairan</span>
                  </h3>
                </div>
                <Badge variant="gold">QRIS BANK INDONESIA</Badge>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Unggah barcode QRIS resmi toko Anda agar konsumen Rescue Sale dapat langsung membayar ke rekening usaha Anda secara otomatis.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <Input
                  label="Nama Merchant QRIS / Pemilik Rekening"
                  placeholder="Contoh: QRIS Warung Bakso Pak Kumis"
                  value={qrisMerchantName}
                  onChange={(e) => setQrisMerchantName(e.target.value)}
                  required
                />

                <Input
                  label="Nama Bank / E-Wallet Pencairan"
                  placeholder="Contoh: Bank Mandiri / BCA / GoPay Merchant"
                  value={qrisBank}
                  onChange={(e) => setQrisBank(e.target.value)}
                  required
                />

                <Input
                  label="Nomor Rekening / ID Merchant"
                  placeholder="Contoh: 141-00-9812401-2"
                  value={qrisAccountNo}
                  onChange={(e) => setQrisAccountNo(e.target.value)}
                  required
                />

                <Input
                  label="NMID (National Merchant ID QRIS) Opsional"
                  placeholder="Contoh: ID1020304050607"
                  value={qrisNmid}
                  onChange={(e) => setQrisNmid(e.target.value)}
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-xs text-[#1B3A5C] block">Foto / Gambar Barcode QRIS Resmi Toko:</span>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center shrink-0">
                    <img src={qrisImageUrl} alt="Preview QRIS" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium leading-snug">
                      Format: JPG / PNG. Pastikan gambar QRIS jelas dan dapat dipindai oleh semua aplikasi m-Banking (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana).
                    </p>
                    <label className="inline-block px-4 py-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors">
                      <span>Unggah Gambar QRIS Baru</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setQrisImageUrl(reader.result as string);
                              setToastState({
                                isOpen: true,
                                message: 'Gambar QRIS berhasil diunggah! Jangan lupa klik Simpan Pengaturan.',
                                type: 'success',
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Section: Pengaturan Metode Pengiriman Global Outlet Toko (Poin 2: Global Setup) */}
        {activeCategory === 'FLEET' && (
          <Card className="border-slate-200 shadow-xs">
            <CardBody className="p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                  <TruckIcon size={18} />
                  <span>Pengaturan Metode Pengiriman Global Outlet Toko</span>
                </h3>
                <Badge variant="gold">GLOBAL SETUP</Badge>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <p className="text-slate-600 font-medium leading-relaxed">
                  Tentukan metode pengiriman yang diizinkan oleh outlet Anda secara terpusat. Pengaturan ini berlaku otomatis untuk <strong>semua produk makanan surplus</strong> yang Anda upload tanpa perlu mencentang ulang tiap produk.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <label className={`p-3 rounded-xl border shadow-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                    globalSelfPickup ? 'bg-white border-amber-300 hover:border-[#1B3A5C]' : 'bg-slate-100 border-slate-200 opacity-70'
                  }`}>
                    <input
                      type="checkbox"
                      checked={globalSelfPickup}
                      onChange={(e) => {
                        setGlobalSelfPickup(e.target.checked);
                        try {
                          localStorage.setItem('replate_provider_global_self_pickup', String(e.target.checked));
                        } catch (_) {}
                      }}
                      className="mt-0.5 w-4 h-4 text-[#1B3A5C] rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-extrabold text-slate-800 block">Ambil Mandiri (Self Pickup)</span>
                      <span className="text-[10px] text-slate-500 font-medium block">Penerima mengambil di outlet toko.</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border shadow-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                    globalRescueCourier ? 'bg-white border-amber-300 hover:border-[#1B3A5C]' : 'bg-slate-100 border-slate-200 opacity-70'
                  }`}>
                    <input
                      type="checkbox"
                      checked={globalRescueCourier}
                      onChange={(e) => {
                        setGlobalRescueCourier(e.target.checked);
                        try {
                          localStorage.setItem('replate_provider_global_rescue_courier', String(e.target.checked));
                        } catch (_) {}
                      }}
                      className="mt-0.5 w-4 h-4 text-[#1B3A5C] rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-extrabold text-slate-800 block">Kurir Relawan Replate</span>
                      <span className="text-[10px] text-slate-500 font-medium block">Diantar Kurir Komunitas.</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border shadow-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                    globalDirectFleet ? 'bg-white border-amber-300 hover:border-[#1B3A5C]' : 'bg-slate-100 border-slate-200 opacity-70'
                  }`}>
                    <input
                      type="checkbox"
                      checked={globalDirectFleet}
                      onChange={(e) => {
                        setGlobalDirectFleet(e.target.checked);
                        try {
                          localStorage.setItem('replate_provider_global_direct_fleet', String(e.target.checked));
                        } catch (_) {}
                      }}
                      className="mt-0.5 w-4 h-4 text-[#1B3A5C] rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5 flex-wrap">
                        <span>Armada Toko Direct</span>
                        <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 py-0.5 rounded font-black flex items-center gap-0.5">
                          <CheckIcon size={10} />
                          TERVERIFIKASI
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">Diantar driver armada toko.</span>
                    </div>
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Section 3: Geofencing Lokasi & Interactive Map Picker */}
        {activeCategory === 'PROFILE' && (
          <Card className="border-slate-200 shadow-xs">
            <CardBody className="p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                  <MapPinIcon size={18} className="text-blue-600" />
                  <span>Geofencing Lokasi Operasional & Penitik Peta GPS</span>
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
                    <MapIcon size={14} />
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
        )}

        {/* Section: Registrasi Banyak Armada Toko & Verifikasi Driver WA */}
        {activeCategory === 'FLEET' && (
          <Card className="border-slate-200 shadow-xs">
            <CardBody className="p-6 space-y-4">
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
                        message: `Armada Baru #${fleetList.length + 1} Berhasil Ditambahkan Ke Daftar! Silakan Isi Kontak WA & Berkas.`,
                        type: 'success',
                      });
                    }}
                    className="px-3.5 py-2 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>+ Tambah Armada & Driver Baru</span>
                  </button>
                </div>
              </div>

              {/* Multi-Fleet Vehicles Selector Tabs or Empty State */}
              {fleetList.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/80 border border-dashed border-slate-700 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0F1923] text-amber-300 border border-[#2C5A8F] flex items-center justify-center mx-auto text-xl shadow-xs">
                    <BikeIcon size={24} className="text-amber-300" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-white">Belum Ada Driver Internal Toko</h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      Daftarkan kendaraan dan kurir internal outlet Anda untuk pengantaran langsung ke panti asuhan/konsumen.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `flt-${Date.now().toString().slice(-4)}`;
                      const newVehicle: FleetVehicle = {
                        id: newId,
                        driverName: 'Driver Baru Outlet',
                        driverPhone: '',
                        isPhoneVerified: false,
                        vehicleType: 'Sepeda Motor Box Cooler (Steril)',
                        plateNumber: 'L ---- ---',
                        status: 'UNSUBMITTED',
                        docs: {
                          driverPhoto: '',
                          vehiclePhoto: '',
                          ktpPhoto: '',
                          simPhoto: '',
                          stnkPhoto: '',
                        },
                      };
                      setFleetList([newVehicle]);
                      setSelectedFleetId(newId);
                    }}
                    className="px-4 py-2.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all inline-block"
                  >
                    + Daftarkan Driver Toko Pertama 
                  </button>
                </div>
              ) : (
                <>
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
                        <span className="flex items-center gap-1.5"><BikeIcon size={14} /> Armada #{idx + 1} ({flt.plateNumber})</span>
                        {flt.status === 'APPROVED' ? (
                          <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"><CheckIcon size={10} /> AKTIF</span>
                        ) : flt.status === 'PENDING' ? (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"><ClockIcon size={10} /> PENDING</span>
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
                          <span className="text-emerald-400 font-extrabold flex items-center gap-2">
                            <CheckIcon size={14} />
                            <span>LISENSI ARMADA #{currentFleet.plateNumber} TERVERIFIKASI AKTIF (VERIFIED BY ADMIN REPLATE)</span>
                          </span>
                          <p className="text-slate-300 text-[11px] font-medium">
                            Driver: <strong>{currentFleet.driverName}</strong> • Kontak WA: <strong className="text-emerald-300">{currentFleet.driverPhone} (VERIFIED OTP)</strong> • No. Plat: <strong className="font-mono text-amber-300">{currentFleet.plateNumber}</strong>
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-900 text-white font-mono text-[10px] rounded-md shrink-0">
                          FLEET-ID #{currentFleet.id.toUpperCase()}
                        </span>
                      </div>
                    ) : currentFleet.status === 'PENDING' ? (
                      <div className="p-4 bg-amber-950/90 border border-amber-500/50 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-300 text-sm flex items-center gap-1.5">
                            <ClockIcon size={14} />
                            ANTREAN PENGESAHAN ARMADA ({currentFleet.plateNumber}) (PENDING VERIFIKASI ADMIN)
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
                                message: `[DEMO] Admin me-approve Armada (${currentFleet.plateNumber})! Status kini TERVERIFIKASI AKTIF.`,
                                type: 'success',
                              });
                            }}
                            className="px-3 py-1 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-[11px] rounded-lg shadow-xs"
                          >
                            Simulasi Approve Admin (Demo) 
                          </button>
                        </div>
                        <p className="text-slate-200 font-medium leading-relaxed">
                          Berkas administrasi <strong>No. Polisi ({currentFleet.plateNumber})</strong>, kontak WA driver ({currentFleet.driverPhone}), pasfoto driver, foto fisik kendaraan, KTP, SIM, dan STNK telah terkirim dan sedang diverifikasi oleh Admin Replate.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1 text-xs">
                        <span className="font-extrabold text-white block">
                           Formulir Pendaftaran Armada Toko #{currentFleet.plateNumber}:
                        </span>
                        <p className="text-slate-300 text-[11px] font-medium">
                          Isi data driver, verifikasi nomor WhatsApp via OTP, serta unggah 5 foto berkas fisik kendaraan sebelum mengajukan.
                        </p>
                      </div>
                    )}

                    {/* Fleet Vehicle & Driver Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Nama Driver Toko:</label>
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
                          <label className="text-slate-300 font-bold block">No. WhatsApp Driver:</label>
                          {currentFleet.isPhoneVerified ? (
                            <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <CheckIcon size={10} />
                              VERIFIED WA
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <ClockIcon size={10} />
                              UNVERIFIED
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
                                  message: `Kode OTP WhatsApp [ ${generatedCode} ] dikirimkan ke No. Driver ${currentFleet.driverPhone}!`,
                                  type: 'success',
                                });
                              }}
                              className="px-2.5 py-2 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-[10px] rounded-lg shrink-0 shadow-xs"
                            >
                              Verifikasi WA
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Jenis Kendaraan:</label>
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
                        <label className="text-slate-300 font-bold block mb-1">Nomor Polisi (No. Plat STNK):</label>
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
                          <span>Ketentuan & Panduan Unggah Berkas Legalitas Armada #{currentFleet.plateNumber}:</span>
                        </span>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                          Pastikan pencahayaan terang, teks NIK/No. SIM/STNK terlihat jelas tanpa bayangan/silau. Gunakan tombol <strong>Contoh Yang Benar</strong> untuk melihat standar resmi Replate dan tombol <strong>Preview Hasil Upload</strong> untuk memeriksa ulang berkas Anda.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* 1. Pasfoto Driver Toko */}
                        <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-center flex flex-col justify-between shadow-xs">
                          <div>
                            <span className="font-extrabold text-white block text-[11px] mb-1">Pasfoto Driver Toko</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              Wajah lurus, pencahayaan terang.
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.driverPhoto}
                                alt="Pasfoto Driver"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckIcon size={10} />
                                READY
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
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Contoh Yang Benar</span>
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
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Preview Hasil Upload</span>
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
                            <span className="font-extrabold text-white block text-[11px] mb-1">Foto Fisik Armada Toko</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              Kendaraan + Plat {currentFleet.plateNumber}
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.vehiclePhoto}
                                alt="Foto Armada"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckIcon size={10} />
                                READY
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
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Contoh Yang Benar</span>
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
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Preview Hasil Upload</span>
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
                            <span className="font-extrabold text-white block text-[11px] mb-1">Foto KTP Driver Toko</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              NIK 16 digit & Nama lurus.
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.ktpPhoto}
                                alt="Foto KTP"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckIcon size={10} />
                                READY
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
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Contoh Yang Benar</span>
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
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Preview Hasil Upload</span>
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
                            <span className="font-extrabold text-white block text-[11px] mb-1">Foto SIM Driver Toko</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              SIM C/A aktif.
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.simPhoto}
                                alt="Foto SIM"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckIcon size={10} />
                                READY
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
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Contoh Yang Benar</span>
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
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Preview Hasil Upload</span>
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
                            <span className="font-extrabold text-white block text-[11px] mb-1">Foto STNK Kendaraan</span>
                            <span className="text-[10px] text-amber-300 font-medium block mb-2 leading-tight">
                              Cocok Plat {currentFleet.plateNumber}
                            </span>
                            <div className="h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center">
                              <img
                                src={currentFleet.docs.stnkPhoto}
                                alt="Foto STNK"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckIcon size={10} />
                                READY
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
                              className="w-full py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Contoh Yang Benar</span>
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
                              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <SearchIcon size={11} />
                              <span>Preview Hasil Upload</span>
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
                        className="font-extrabold shadow-md text-slate-950 text-xs px-6 flex items-center gap-1.5"
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
                            message: `Berkas Armada (${currentFleet.plateNumber}) berhasil dikirim ke Admin Replate untuk diverifikasi!`,
                            type: 'success',
                          });
                        }}
                      >
                        <CheckIcon size={14} />
                        <span>Ajukan Verifikasi Berkas Armada </span>
                      </Button>
                    </div>
                  </div>
                );
              })()}
              </>
            )}
            </div>
          </CardBody>
        </Card>
      )}

        {/* Section 4: Rekening Bank Pencairan Hasil Rescue Sale & Infaq Otomatis (Poin 1 - New Enterprise Section) */}
        {activeCategory === 'PAYMENT' && (
          <Card className="border-slate-200 shadow-xs">
            <CardBody className="p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                  <CreditCardIcon size={18} className="text-amber-600" />
                  <span>Rekening Bank Pencairan Hasil Rescue Sale & Infaq Otomatis</span>
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

              {/* Setup Foto QRIS Statis Kasir Toko Provider (Untuk Pembayaran Rescue Sale) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-extrabold text-xs text-[#1B3A5C] flex items-center gap-1.5">
                      <CreditCardIcon size={14} className="text-[#1B3A5C]" />
                      <span>QRIS Statis Pembayaran Toko (Rescue Sale)</span>
                      <Badge variant="gold" size="sm">STANDAR QRIS TOKO</Badge>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Unggah foto QRIS Standee kasir toko Anda. Gambar QRIS ini akan ditampilkan kepada pembeli saat checkout *Rescue Sale*.
                    </p>
                  </div>

                  <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckIcon size={10} />
                    QRIS TOKO ACTIVE
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center shrink-0">
                    <img src={qrisPhoto} alt="QRIS Standee" className="w-full h-full object-contain" />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          setDocPreviewModal({
                            isOpen: true,
                            title: 'Panduan & Contoh Foto QRIS Toko Yang Benar',
                            docType: 'Foto QRIS Kasir Toko',
                            sampleImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
                            currentImage: qrisPhoto,
                            hintText: 'Pastikan gambar QRIS tajam, tidak terpotong, dan dapat dipindai oleh semua aplikasi e-wallet.',
                            checklist: [
                              'Seluruh barcode QRIS berada di dalam bingkai',
                              'Nama Toko pada QRIS sesuai dengan outlet Anda',
                              'Logo QRIS Bank Indonesia terlihat jelas',
                            ],
                            mode: 'HINT',
                          })
                        }
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                      >
                        <SearchIcon size={12} />
                        <span>Contoh QRIS Yang Benar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDocPreviewModal({
                            isOpen: true,
                            title: 'Preview Hasil Upload QRIS Toko',
                            docType: 'QRIS Statis Kasir Toko',
                            sampleImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
                            currentImage: qrisPhoto,
                            hintText: 'Periksa kejelasan QRIS toko yang baru Anda unggah.',
                            checklist: ['QR Code jelas & siap di-scan', 'Merchant Name sesuai'],
                            mode: 'USER_PREVIEW',
                          })
                        }
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                      >
                        <SearchIcon size={12} />
                        <span>Preview QRIS Toko</span>
                      </button>
                    </div>

                    <label className="px-4 py-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-extrabold text-xs rounded-xl cursor-pointer inline-block shadow-xs transition-all">
                      <span>Unggah / Ganti Foto QRIS Toko</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setQrisPhoto(url);
                            try {
                              localStorage.setItem('replate_provider_qris_photo', url);
                            } catch (_) {}
                            setToastState({
                              isOpen: true,
                              message: 'Foto QRIS Statis Toko Berhasil Diperbarui & Disimpan!',
                              type: 'success',
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[#1B3A5C] block">Alokasi Auto-Infaq Kemanusiaan:</span>
                    <span className="text-slate-600 font-medium">Potongan {autoInfaqPercent} dari setiap transaksi Rescue Sale otomatis dialokasikan ke Kas Dana Kemanusiaan Replate.</span>
                  </div>
                  <select
                    className="rounded-xl border border-amber-300 text-xs px-3 py-1.5 bg-white font-bold text-[#1B3A5C] focus:outline-none"
                    value={autoInfaqPercent}
                    onChange={(e) => setAutoInfaqPercent(e.target.value)}
                  >
                    <option value="0% (Tanpa Donasi Infaq)">0% (Tanpa Donasi Infaq)</option>
                    <option value="2.5% (Zakat Pangan)">2.5% (Zakat Pangan)</option>
                    <option value="5% (Donasi Otomatis ke Panti)">5% (Donasi Otomatis ke Panti)</option>
                    <option value="7.5% (Donasi Diperluas)">7.5% (Donasi Diperluas)</option>
                    <option value="10% (Program Kemanusiaan Pro)">10% (Program Kemanusiaan Pro)</option>
                  </select>
                </div>

                {/* Transparent Calculator Simulation */}
                {(() => {
                  const percentMatch = autoInfaqPercent.match(/(\d+\.?\d*)%/);
                  const pct = percentMatch ? parseFloat(percentMatch[1]) / 100 : 0.05;
                  const samplePrice = 5000;
                  const infaqAmount = Math.round(samplePrice * pct);
                  const netRevenue = samplePrice - infaqAmount;
                  return pct > 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1.5 text-[11px]">
                      <span className="font-black text-[#1B3A5C] text-xs block">Simulasi Alokasi Per Porsi (Harga Contoh: Rp {samplePrice.toLocaleString('id-ID')})</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                          <span className="text-[10px] text-slate-500 block">Auto-Infaq ({(pct * 100)}%)</span>
                          <strong className="text-amber-800 font-black">Rp {infaqAmount.toLocaleString('id-ID')}</strong>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-slate-500 block">Pendapatan Bersih Toko</span>
                          <strong className="text-emerald-800 font-black">Rp {netRevenue.toLocaleString('id-ID')}</strong>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-[10px] text-slate-500 block">Est. Akumulasi / 100 Porsi</span>
                          <strong className="text-blue-800 font-black">Rp {(infaqAmount * 100).toLocaleString('id-ID')}</strong>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug pt-1">
                        *Dana infaq otomatis digunakan untuk: <strong className="text-slate-700">boks steril food-grade</strong>, <strong className="text-slate-700">subsidi bensin kurir relawan panti asuhan</strong>, dan <strong className="text-slate-700">program nutrisi anak panti</strong>.
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Section Preferred Rescue Partner Drop (Poin 5: Full CRUD Langganan Panti) */}
        {activeCategory === 'FLEET' && (
          <Card className="border-slate-200 shadow-xs">
            <CardBody className="p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                  <PackageIcon size={18} />
                  <span>Kemitraan Langganan Rutin Prioritas Panti Asuhan (Preferred Partner Drop)</span>
                </h3>
                <Button
                  variant="gold"
                  size="sm"
                  className="font-extrabold text-xs shadow-xs"
                  onClick={() => setAddPartnerModal({ ...addPartnerModal, isOpen: true })}
                >
                  + Tambah Mitra Panti Langganan Baru 
                </Button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-xs text-[#1B3A5C] block">
                      Alokasikan Otomatis Makanan Surplus Ke Panti Asuhan Langganan Utama:
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Makanan donasi dari toko Anda akan diprioritaskan secara khusus ke daftar panti di bawah sebelum dilempar ke pool umum.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                    <input
                      type="checkbox"
                      checked={preferredPartnerEnabled}
                      onChange={(e) => setPreferredPartnerEnabled(e.target.checked)}
                      className="w-4 h-4 text-[#1B3A5C] rounded border-slate-300 focus:ring-0"
                    />
                    <span className="text-xs font-bold text-[#1B3A5C] flex items-center gap-1">
                      {preferredPartnerEnabled ? (
                        <>
                          <CheckIcon size={12} className="text-emerald-600" />
                          <span>MITRA LANGGANAN AKTIF</span>
                        </>
                      ) : (
                        'Nonaktif (Open-Pool Default)'
                      )}
                    </span>
                  </label>
                </div>

                {/* List of Active Subscriptions with 2-Way Confirmation Status (Poin 5) */}
                <div className="space-y-2 pt-1 text-xs">
                  {preferredPartnersList.map((partner) => (
                    <div
                      key={partner.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[#1B3A5C] text-xs">{partner.pantiName}</span>
                          {partner.status === 'CONFIRMED_BY_PANTI' ? (
                            <span className="text-[9px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                              <CheckIcon size={10} />
                              KONFIRMASI DUA ARAH SETUJU
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-md animate-pulse flex items-center gap-0.5">
                              <ClockIcon size={10} />
                              MENUNGGU PERSETUJUAN PANTI
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Jadwal Alokasi: <strong className="text-slate-800">{partner.frequency}</strong> • Wilayah: {partner.location}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePreferredPartner(partner.id, partner.pantiName)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg transition-all shrink-0 border border-red-200 flex items-center gap-1"
                      >
                        <span>Hapus Langganan</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Section 5: Kebijakan Toleransi Grace Period & Penanganan Limbah Organik (Poin 6: MVP Alignment) */}
        {activeCategory === 'SOP' && (
          <>
            <Card className="border-slate-200 shadow-xs">
              <CardBody className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                    <ShieldCheckIcon size={18} className="text-emerald-600" />
                    <span>Toleransi Grace Period & Penanganan Makanan Kadaluwarsa</span>
                  </h3>
                  <Badge variant="warning">PENANGANAN MANDIRI</Badge>
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
                      <option value="30 Menit">30 Menit (Standar Recommendation SuperAdmin)</option>
                      <option value="45 Menit">45 Menit</option>
                      <option value="60 Menit">60 Menit (Batas Maksimal Cap BPOM)</option>
                    </select>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ShieldCheckIcon size={12} />
                      Kebijakan Platform Hybrid: Diizinkan hingga maks 60 menit sesuai standar SuperAdmin BPOM.
                    </span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                      <span className="font-extrabold block">Catatan Pengolahan Organik:</span>
                      <p className="text-amber-800 leading-snug font-medium text-[11px]">
                        Makanan berlebih yang melewati batas Grace Period dikelola secara mandiri oleh toko (penanganan limbah internal). Kerjasama dengan mitra pengolah sampah/pakan ternak akan diaktifkan sesuai ketersediaan di wilayah operasional.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Section 6: Standar Kredensial Higienitas & Halal BPOM (Poin 7: Self-Declare UMKM & BPJPH Opsional) */}
            <Card className="border-slate-200 shadow-xs">
              <CardBody className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                    <ShieldCheckIcon size={18} className="text-emerald-600" />
                    <span>Standar Kredensial Higienitas & Halal BPOM (Self-Declare UMKM & BPJPH Opsional)</span>
                  </h3>
                  <Badge variant="success">STANDAR HYGIENE BPOM</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <Input
                    label="Nomor Sertifikasi Halal BPJPH / MUI (Opsional / Self-Declare UMKM)"
                    value={halalCertNo}
                    onChange={(e) => setHalalCertNo(e.target.value)}
                    placeholder="Contoh: ID35110001293021023 (kosongkan jika belum)"
                  />

                  <Input
                    label="Standar Kemasan Default Toko"
                    value={defaultPackaging}
                    onChange={(e) => setDefaultPackaging(e.target.value)}
                  />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-extrabold text-[#1B3A5C] block">Dokumen Surat Pernyataan Self-Declare / Sertifikat Halal:</span>
                    <span className="text-slate-500 font-medium truncate block">{uploadedHalalDoc || 'Belum diunggah'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setDocPreviewModal({
                          isOpen: true,
                          title: 'Preview Dokumen Surat Pernyataan Self-Declare / Halal Toko',
                          docType: 'Surat Pernyataan Self-Declare Halal & Higienitas BPOM',
                          sampleImage: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop&q=80',
                          currentImage: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop&q=80',
                          hintText: 'Periksa kejelasan berkas Surat Pernyataan Self-Declare Kebersihan & Halal.',
                          checklist: ['Pernyataan Mandiri Kualitas Pangan', 'Nama Outlet & Tanda Tangan Pemilik'],
                          mode: 'USER_PREVIEW',
                        })
                      }
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <SearchIcon size={12} />
                      <span>Preview Dokumen</span>
                    </button>
                    <label className="px-3.5 py-2 bg-[#1B3A5C] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-[#2C5A8F] transition-colors text-center flex items-center justify-center gap-1.5">
                      <span>Upload Berkas (PDF/JPG)</span>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setUploadedHalalDoc(e.target.files[0].name);
                            setToastState({
                              isOpen: true,
                              message: `File ${e.target.files[0].name} berhasil diunggah!`,
                              type: 'success',
                            });
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <span className="font-extrabold flex items-center gap-1">
                    <CheckIcon size={14} className="text-emerald-700" />
                    Status Verifikasi Higienitas Mandiri (Self-Verified BPOM):
                  </span>
                  <p className="text-emerald-800 leading-relaxed font-medium">
                    Sesuai kesepakatan standar higienitas, outlet Anda menyetujui 8-Checklist Kebersihan Mandiri (wadah bersih, kemasan rapat, bebas kontaminasi) untuk memastikan kelayakan konsumsi makanan surplus.
                  </p>
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {/* Section 7: Preferensi Otomatisasi & Notifikasi */}
        {activeCategory === 'SECURITY' && (
          <Card className="border-slate-200 shadow-xs">
            <CardBody className="p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                  <ChatIcon size={18} className="text-purple-600" />
                  <span>Preferensi Smart Matching & Notifikasi WhatsApp</span>
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
        )}

        {/* Sticky Mobile / Desktop Action Button */}
        {activeCategory !== 'SECURITY' && (
          <div className="sticky bottom-4 z-20 flex justify-end gap-3 pt-2 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-lg sm:static sm:bg-transparent sm:p-0 sm:border-0 sm:shadow-none">
            <Button type="submit" variant="gold" size="lg" className="w-full sm:w-auto font-black shadow-md flex items-center justify-center gap-1.5">
              <CheckIcon size={16} />
              <span>Simpan Pengaturan Outlet </span>
            </Button>
          </div>
        )}
      </form>

      {/* Section 8: Keamanan Akun & Perubahan Kata Sandi */}
      {activeCategory === 'SECURITY' && (
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <SettingsIcon size={18} className="text-red-600" />
                <span>Keamanan Akun & Perubahan Kata Sandi (Password Reset)</span>
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
                  Perbarui Kata Sandi Akun 
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

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
                {docPreviewModal.mode === 'HINT' ? 'Ketentuan & SOP Resmi Upload Replate:' : 'Mode Inspeksi Hasil Unggah Anda:'}
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
                    <CheckIcon size={12} className="text-emerald-600 font-bold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Image Comparison / Single Display */}
            {docPreviewModal.mode === 'HINT' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2 text-center">
                  <span className="font-extrabold text-emerald-800 text-[11px] flex items-center justify-center gap-1">
                    <CheckIcon size={12} />
                    CONTOH STANDAR RESMI YANG BENAR
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
                  <span className="font-extrabold text-slate-800 text-[11px] flex items-center justify-center gap-1">
                    <CameraIcon size={12} />
                    BERKAS YANG ANDA UNGGAH SAAT INI
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
                <span className="font-extrabold text-amber-300 text-xs flex items-center justify-center gap-1">
                  <SearchIcon size={12} />
                  INSPEKSI LENGKAP HASIL UPLOAD BERKAS ANDA
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
                className="font-black text-slate-950 flex items-center gap-1"
                onClick={() => {
                  setDocPreviewModal((prev) => ({ ...prev, isOpen: false }));
                  setToastState({
                    isOpen: true,
                    message: 'Berkas terkonfirmasi sesuai! Silakan lanjutkan ke pengajuan armada toko.',
                    type: 'success',
                  });
                }}
              >
                <CheckIcon size={12} />
                <span>Sesuai & Siap Ajukan</span>
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
              <span className="font-extrabold text-emerald-400 text-xs flex items-center gap-1.5">
                <ChatIcon size={14} />
                <span>Kode OTP 6-Digit Dikirim via WhatsApp:</span>
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
                className="text-center font-mono font-black tracking-widest text-lg"
                maxLength={6}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOtpModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="gold"
                size="sm"
                className="font-extrabold"
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
                    message: ` Nomor WhatsApp Driver (${otpModal.phone}) Berhasil Terverifikasi Sah via OTP!`,
                    type: 'success',
                  });
                }}
              >
                Verifikasi OTP Kontak Driver 
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Tambah Mitra Panti Langganan Baru (Poin 5) */}
      {addPartnerModal.isOpen && (
        <Modal
          isOpen={addPartnerModal.isOpen}
          onClose={() => setAddPartnerModal({ ...addPartnerModal, isOpen: false })}
          title="Tambah Mitra Panti Asuhan / Shelter Langganan Baru"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
              <span className="font-extrabold text-xs flex items-center gap-1.5">
                <PackageIcon size={14} />
                Kemitraan Langganan Rutin Prioritas:
              </span>
              <p className="text-[11px] text-amber-800 font-medium">
                Pilih panti asuhan terdaftar yang ingin Anda prioritaskan alokasi makanan surplusnya secara otomatis.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Pilih Nama Lembaga Panti Asuhan / Shelter:</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:outline-none"
                value={addPartnerModal.pantiName}
                onChange={(e) => setAddPartnerModal({ ...addPartnerModal, pantiName: e.target.value })}
              >
                <option value="Rumah Singgah Anak Jalanan (Shelter)">Rumah Singgah Anak Jalanan (Shelter) - Surabaya Pusat</option>
                <option value="Komunitas Dapur Umum Sosmas Ketintang">Komunitas Dapur Umum Sosmas Ketintang - Surabaya Selatan</option>
                <option value="Yayasan Yatim Mandiri Wonokromo">Yayasan Yatim Mandiri Wonokromo - Surabaya Selatan</option>
                <option value="Panti Asuhan Anak Yatim Wiyung">Panti Asuhan Anak Yatim Wiyung - Surabaya Barat</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Pilih Frekuensi Penyaluran Rutin:</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:outline-none"
                value={addPartnerModal.frequency}
                onChange={(e) => setAddPartnerModal({ ...addPartnerModal, frequency: e.target.value })}
              >
                <option value="Jumat Barokah & Setiap Malam">Jumat Barokah & Setiap Malam (Setiap Hari)</option>
                <option value="Setiap Hari Jumat Saja">Setiap Hari Jumat Saja</option>
                <option value="Senin - Jumat (Weekday Only)">Senin - Jumat (Weekday Only)</option>
                <option value="Sabtu & Minggu (Weekend Special)">Sabtu & Minggu (Weekend Special)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddPartnerModal({ ...addPartnerModal, isOpen: false })}
              >
                Batal
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-extrabold text-slate-950 shadow-md"
                onClick={handleAddPreferredPartner}
              >
                + Simpan Langganan Panti 
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
