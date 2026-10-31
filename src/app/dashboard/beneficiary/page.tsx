'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartHandshake,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Users,
  Utensils,
  Award,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  DollarSign,
  Upload,
  Phone,
  User,
  ArrowRight,
  Tag,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

interface BeneficiaryFoodItem {
  id: string;
  name: string;
  donorName: string;
  donorType: 'HOTEL' | 'CATERING' | 'RESTAURANT' | 'BAKERY' | 'PRODUCER';
  donorAddress: string;
  distanceKm: number;
  scheme: 'DONASI_GRATIS' | 'SUBSIDI_PANTI';
  originalPrice: number;
  subsidizedPrice: number;
  portions: number;
  weightKg: number;
  category: 'Meals' | 'Bakery' | 'Produce' | 'Dairy';
  pickupDeadline: string;
  halalCertified: boolean;
  sterilizedBox: boolean;
}

interface YayasanLegalitasData {
  isVerified: boolean;
  skKemenkumham: string;
  izinDinsos: string;
  ketuaName: string;
  phone: string;
  address: string;
  city: string;
  beneficiaryCount: number;
  documentFileName: string;
  verifiedAt: string;
  validUntil: string;
}

export default function BeneficiaryDashboardPage() {
  const router = useRouter();

  // Active Tab: 1. Klaim Pangan Subsidi & Gratis, 2. Permintaan Donasi Panti, 3. Verifikasi Legalitas Yayasan, 4. Riwayat Penerimaan
  const [activeTab, setActiveTab] = useState<'KLAIM_PANGAN' | 'PERMINTAAN_DONASI' | 'VERIFIKASI_LEGALITAS' | 'RIWAYAT'>('KLAIM_PANGAN');

  // Donation Request Modal & List State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [myDonationRequests, setMyDonationRequests] = useState<any[]>([]);
  const [reqPortions, setReqPortions] = useState(45);
  const [reqCategory, setReqCategory] = useState('Makanan Olahan (Meals)');
  const [reqDeliveryMethod, setReqDeliveryMethod] = useState('PROVIDER_DIRECT'); // Armada Toko (Gratis Rp 0)
  const [reqPaymentMethod, setReqPaymentMethod] = useState('Bebas Biaya (Rp 0)');
  const [reqAssignedDriver, setReqAssignedDriver] = useState('Tugaskan Otomatis (Driver Terdekat)');
  const [reqNotes, setReqNotes] = useState('Membutuhkan 45 porsi nasi lauk pauk bergizi untuk makan malam santri/anak asuh.');
  const [foodFilter, setFoodFilter] = useState<'ALL' | 'FREE' | 'SUBSIDIZED'>('ALL');

  // Yayasan Profile State
  const [yayasanName, setYayasanName] = useState('Panti Asuhan Kasih Ibu');
  const [totalPortionsReceived, setTotalPortionsReceived] = useState<number>(185);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState<number>(45);

  // Legalitas State
  const [legalitas, setLegalitas] = useState<YayasanLegalitasData>({
    isVerified: true,
    skKemenkumham: 'AHU-0012489.AH.01.04.Tahun 2021',
    izinDinsos: '460/182/436.7.11/2023 (TDLKS Surabaya)',
    ketuaName: 'Ibu Hajjah Maryam, S.Pd',
    phone: '0812-3456-7890',
    address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
    city: 'Surabaya',
    beneficiaryCount: 45,
    documentFileName: 'sk_kemenkumham_izin_dinsos_panti_kasih_ibu.pdf',
    verifiedAt: '15 Januari 2024',
    validUntil: '31 Desember 2028',
  });

  const [isEditingLegalitas, setIsEditingLegalitas] = useState<boolean>(false);
  const [legalitasForm, setLegalitasForm] = useState({ ...legalitas });

  // Food Catalog for Panti
  const [foodList, setFoodList] = useState<BeneficiaryFoodItem[]>([
    {
      id: 'BNF-001',
      name: '40 Porsi Nasi Kotak Komplit & Ayam Panggang Madu',
      donorName: 'Hotel Majapahit Surabaya',
      donorType: 'HOTEL',
      donorAddress: 'Jl. Tunjungan No. 65, Surabaya',
      distanceKm: 1.8,
      scheme: 'DONASI_GRATIS',
      originalPrice: 45000,
      subsidizedPrice: 0,
      portions: 40,
      weightKg: 16.0,
      category: 'Meals',
      pickupDeadline: 'Malam ini 21:00 WIB',
      halalCertified: true,
      sterilizedBox: true,
    },
    {
      id: 'BNF-002',
      name: '30 Porsi Rawon Daging Sapi & Sambal Goreng Ati',
      donorName: 'Katering Bu Mimin',
      donorType: 'CATERING',
      donorAddress: 'Jl. Tenggilis Mejoyo No. 14, Surabaya',
      distanceKm: 2.3,
      scheme: 'DONASI_GRATIS',
      originalPrice: 38000,
      subsidizedPrice: 0,
      portions: 30,
      weightKg: 13.5,
      category: 'Meals',
      pickupDeadline: 'Malam ini 21:30 WIB',
      halalCertified: true,
      sterilizedBox: true,
    },
    {
      id: 'BNF-003',
      name: '50 Porsi Paket Nasi Rames Telur Balado & Tahu Tempe',
      donorName: 'Warung Bakso & Resto Pak Kumis',
      donorType: 'RESTAURANT',
      donorAddress: 'Jl. Kusuma Bangsa No. 42, Surabaya',
      distanceKm: 1.2,
      scheme: 'SUBSIDI_PANTI',
      originalPrice: 16000,
      subsidizedPrice: 3500,
      portions: 50,
      weightKg: 20.0,
      category: 'Meals',
      pickupDeadline: 'Malam ini 21:45 WIB',
      halalCertified: true,
      sterilizedBox: true,
    },
    {
      id: 'BNF-004',
      name: '25 Porsi Roti Tawar Gandum & Roti Manis Aneka Rasa',
      donorName: 'Rotiboy Bakery & Bread House',
      donorType: 'BAKERY',
      donorAddress: 'Grand City Mall Lt. LG, Surabaya',
      distanceKm: 2.1,
      scheme: 'DONASI_GRATIS',
      originalPrice: 15000,
      subsidizedPrice: 0,
      portions: 25,
      weightKg: 8.5,
      category: 'Bakery',
      pickupDeadline: 'Malam ini 22:00 WIB',
      halalCertified: true,
      sterilizedBox: true,
    },
    {
      id: 'BNF-005',
      name: '35 Unit Susu Pasteurisasi Segar & Yogurt Drink',
      donorName: 'Mitra Dairy Fresh Farm',
      donorType: 'PRODUCER',
      donorAddress: 'Jl. Ahmad Yani No. 110, Surabaya',
      distanceKm: 3.4,
      scheme: 'SUBSIDI_PANTI',
      originalPrice: 18000,
      subsidizedPrice: 3000,
      portions: 35,
      weightKg: 10.5,
      category: 'Dairy',
      pickupDeadline: 'Besok Pagi 08:30 WIB',
      halalCertified: true,
      sterilizedBox: true,
    },
  ]);

  // Claim Modal State
  const [selectedClaimFood, setSelectedClaimFood] = useState<BeneficiaryFoodItem | null>(null);
  const [claimPortions, setClaimPortions] = useState<number>(30);
  const [deliveryMethod, setDeliveryMethod] = useState<'RESCUE_PARTNER' | 'SELF_PICKUP'>('RESCUE_PARTNER');
  const [claimNotes, setClaimNotes] = useState<string>('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Load from local storage
  useEffect(() => {
    try {
      const leg = localStorage.getItem('replate_yayasan_legalitas');
      if (leg) {
        const parsed = JSON.parse(leg);
        setLegalitas(parsed);
        setLegalitasForm(parsed);
      }

      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName || parsed.organizationName) {
          setYayasanName(parsed.entityName || parsed.organizationName);
        }
        if (parsed.capacity) {
          const num = parseInt(parsed.capacity.replace(/\D/g, ''));
          if (!isNaN(num) && num > 0) {
            setTotalBeneficiaries(num);
            setClaimPortions(num);
          }
        }
      }

      // Load synced donation requests
      const rawReqs = localStorage.getItem('replate_donation_requests');
      if (rawReqs) {
        try {
          const parsed = JSON.parse(rawReqs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMyDonationRequests(parsed);
          }
        } catch (_) {}
      } else {
        const initialReqs = [
          {
            id: 'REQ-DON-001',
            shelterName: 'Panti Asuhan Kasih Ibu',
            shelterType: 'Panti Asuhan Anak',
            recipientCategory: 'PANTI',
            beneficiariesCount: 45,
            foodCategoryNeeded: 'Makanan Olahan (Meals)',
            urgency: 'HIGH',
            deadline: 'Hari ini 19:00 WIB',
            location: 'Surabaya (Gubeng)',
            address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
            notes: 'Membutuhkan 40-50 porsi nasi lauk pauk bergizi untuk makan malam anak-anak panti.',
            preferredDelivery: 'PROVIDER_DIRECT',
            paymentMethod: 'Bebas Biaya (Rp 0)',
            assignedDriver: 'Budi Santoso - Honda Vario L 4521 AB (Armada Toko)',
            status: 'OPEN',
            contactPhone: '081298765432',
            createdAt: 'Hari ini, 10:30 WIB',
          }
        ];
        setMyDonationRequests(initialReqs);
        localStorage.setItem('replate_donation_requests', JSON.stringify(initialReqs));
      }

      // Check claims to calculate total portions received
      const rawClaims = localStorage.getItem('replate_claims');
      if (rawClaims) {
        const parsedClaims = JSON.parse(rawClaims);
        if (Array.isArray(parsedClaims)) {
          let extraPortions = 0;
          parsedClaims.forEach((c: any) => {
            if (c.status === 'COMPLETED' || c.status === 'CONFIRMED') {
              extraPortions += Number(c.portions || c.quantity || 30);
            }
          });
          if (extraPortions > 0) {
            setTotalPortionsReceived(185 + extraPortions);
          }
        }
      }
    } catch (_) {}
  }, []);

  const handleCreateDonationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqNotes.trim()) {
      alert('Mohon isi catatan kebutuhan porsi makanan!');
      return;
    }

    const newReq = {
      id: `REQ-DON-${Date.now()}`,
      shelterName: yayasanName,
      shelterType: 'Panti Asuhan Anak / Lansia',
      recipientCategory: 'PANTI',
      beneficiariesCount: reqPortions,
      foodCategoryNeeded: reqCategory,
      urgency: 'HIGH',
      deadline: 'Hari ini 20:00 WIB',
      location: legalitas.city || 'Surabaya',
      address: legalitas.address || 'Jl. Raya Gubeng No. 88, Surabaya',
      lat: -7.2754,
      lng: 112.7541,
      photoUrl: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=600&q=80',
      notes: reqNotes,
      preferredDelivery: reqDeliveryMethod,
      paymentMethod: reqPaymentMethod,
      assignedDriver: reqAssignedDriver,
      status: 'OPEN',
      contactPhone: legalitas.phone || '081234567890',
      leaderName: legalitas.ketuaName || 'Pengurus Panti',
      legalPermit: legalitas.izinDinsos || 'DINSOS/2023/8912',
      createdAt: 'Baru saja',
    };

    const updated = [newReq, ...myDonationRequests];
    setMyDonationRequests(updated);
    try {
      localStorage.setItem('replate_donation_requests', JSON.stringify(updated));
    } catch (_) {}

    setIsRequestModalOpen(false);
    setActiveTab('PERMINTAAN_DONASI');
    setToast({
      isOpen: true,
      message: 'Permintaan donasi pangan berhasil diajukan dan dipublikasikan ke mitra provider!',
      type: 'success',
    });
  };

  const handleOpenClaimModal = (item: BeneficiaryFoodItem) => {
    setSelectedClaimFood(item);
    setClaimPortions(Math.min(item.portions, totalBeneficiaries));
    setClaimNotes(`Untuk makan malam santri & anak asuh ${yayasanName}`);
  };

  const handleConfirmClaim = () => {
    if (!selectedClaimFood) return;
    setIsSubmittingClaim(true);

    setTimeout(() => {
      // Create new claim record and task for rescue partner
      const newClaim = {
        id: `CLM-PANTI-${Date.now()}`,
        foodId: selectedClaimFood.id,
        foodName: selectedClaimFood.name,
        donorName: selectedClaimFood.donorName,
        portions: claimPortions,
        weightKg: Math.round((claimPortions / selectedClaimFood.portions) * selectedClaimFood.weightKg * 10) / 10,
        scheme: selectedClaimFood.scheme,
        pricePerPortion: selectedClaimFood.subsidizedPrice,
        totalPrice: selectedClaimFood.subsidizedPrice * claimPortions,
        deliveryMethod,
        recipientName: yayasanName,
        recipientAddress: legalitas.address,
        claimedAt: new Date().toISOString(),
        status: deliveryMethod === 'RESCUE_PARTNER' ? 'AWAITING_RESCUE_PICKUP' : 'READY_FOR_SELF_PICKUP',
      };

      try {
        const existingClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
        localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingClaims]));

        // Dispatch rescue task if delivery method is RESCUE_PARTNER
        if (deliveryMethod === 'RESCUE_PARTNER') {
          const newTask = {
            id: `TASK-RSC-${Date.now().toString().slice(-4)}`,
            claimId: newClaim.id,
            foodTitle: selectedClaimFood.name,
            donorName: selectedClaimFood.donorName,
            donorAddress: selectedClaimFood.donorAddress,
            donorPhone: '0812-9876-5432',
            recipientName: yayasanName,
            recipientAddress: legalitas.address,
            recipientPhone: legalitas.phone,
            portions: claimPortions,
            weightKg: newClaim.weightKg,
            distanceKm: selectedClaimFood.distanceKm,
            deliveryFee: Math.ceil(selectedClaimFood.distanceKm) * 2000,
            deadline: selectedClaimFood.pickupDeadline,
            status: 'PENDING_PICKUP', // Menuju Lokasi Jemput
            createdAt: new Date().toISOString(),
          };
          const existingTasks = JSON.parse(localStorage.getItem('replate_rescue_tasks') || '[]');
          localStorage.setItem('replate_rescue_tasks', JSON.stringify([newTask, ...existingTasks]));
          window.dispatchEvent(new CustomEvent('replate_rescue_task_created', { detail: newTask }));
        }

        // Update total portions
        setTotalPortionsReceived((prev) => prev + claimPortions);
      } catch (_) {}

      setIsSubmittingClaim(false);
      setSelectedClaimFood(null);
      setToast({
        isOpen: true,
        message:
          deliveryMethod === 'RESCUE_PARTNER'
            ? 'Klaim Berhasil! Relawan Food Rescue sedang ditugaskan menjemput makanan ke lokasi panti.'
            : 'Klaim Berhasil! Silakan ambil makanan langsung ke donor sesuai batas waktu.',
        type: 'success',
      });
    }, 600);
  };

  const handleSaveLegalitas = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: YayasanLegalitasData = {
      ...legalitasForm,
      isVerified: true,
      verifiedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    setLegalitas(updated);
    try {
      localStorage.setItem('replate_yayasan_legalitas', JSON.stringify(updated));
    } catch (_) {}
    setIsEditingLegalitas(false);
    setToast({
      isOpen: true,
      message: 'Data Legalitas Yayasan berhasil diverifikasi dan disimpan.',
      type: 'success',
    });
  };

  const filteredFoods = foodList.filter((item) => {
    if (foodFilter === 'FREE') return item.scheme === 'DONASI_GRATIS';
    if (foodFilter === 'SUBSIDIZED') return item.scheme === 'SUBSIDI_PANTI';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B3A5C] text-[#D4A843] flex items-center justify-center font-black text-xl shadow-xs">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#1B3A5C] tracking-tight">
                  {yayasanName}
                </h1>
                {legalitas.isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Akun Yayasan Terverifikasi
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black flex items-center gap-1 border border-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    Menunggu Verifikasi Legalitas
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dashboard Penerima Manfaat • Alokasi Pangan Donasi &amp; Porsi Besar Panti Asuhan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2 bg-[#D4A843] hover:bg-[#E5B954] text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-slate-950" />
              <span>Ajukan Permintaan Donasi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('VERIFIKASI_LEGALITAS')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Status Legalitas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('KLAIM_PANGAN')}
              className="px-4 py-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-[#D4A843] rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Katalog Pangan</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Widgets (Termasuk Widget Statistik: Total Porsi Diterima Yayasan) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Widget 1: Total Porsi Makanan yang Diterima Yayasan */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-1">
            <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider block">
              Total Porsi Diterima
            </span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-2xl sm:text-3xl font-black text-[#1B3A5C] font-mono">
                {totalPortionsReceived}
              </strong>
              <span className="text-xs font-bold text-slate-600">Porsi</span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium block">
              Akumulasi makanan terselamatkan
            </span>
          </div>

          {/* Widget 2: Jiwa Anak Asuh / Lansia */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-1">
            <span className="text-[10.5px] font-bold text-blue-800 uppercase tracking-wider block">
              Kapasitas Penerima
            </span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-2xl sm:text-3xl font-black text-blue-900 font-mono">
                {totalBeneficiaries}
              </strong>
              <span className="text-xs font-bold text-slate-600">Anak &amp; Lansia</span>
            </div>
            <span className="text-[10px] text-blue-700 font-medium block">
              Binaan aktif panti asuhan
            </span>
          </div>

          {/* Widget 3: Efisiensi Anggaran Pangan */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-1">
            <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider block">
              Efisiensi Belanja Pangan
            </span>
            <div className="flex items-baseline gap-1">
              <strong className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
                Rp {(totalPortionsReceived * 15000).toLocaleString('id-ID')}
              </strong>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">
              Hemat biaya belanja dapur
            </span>
          </div>

          {/* Widget 4: Status Kemitraan */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 space-y-1">
            <span className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block">
              Izin Dinsos &amp; Kemenkumham
            </span>
            <strong className="text-sm font-black text-[#1B3A5C] block truncate">
              {legalitas.isVerified ? 'Terverifikasi BPOM / Dinsos' : 'Menunggu Dokumen'}
            </strong>
            <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Prioritas Alokasi Porsi Besar
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('KLAIM_PANGAN')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'KLAIM_PANGAN'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Klaim Pangan Subsidi &amp; Gratis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PERMINTAAN_DONASI')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'PERMINTAAN_DONASI'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-[#D4A843]" />
          <span>Permintaan Donasi Panti</span>
          {myDonationRequests.length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#D4A843] text-slate-950 text-[10px] rounded-full font-black">
              {myDonationRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('VERIFIKASI_LEGALITAS')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'VERIFIKASI_LEGALITAS'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#D4A843]" />
          <span>Verifikasi Legalitas Yayasan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RIWAYAT')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'RIWAYAT'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Riwayat Penyaluran Panti</span>
        </button>
      </div>

      {/* TAB PERMINTAAN DONASI PANTI */}
      {activeTab === 'PERMINTAAN_DONASI' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#1B3A5C] flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#D4A843]" />
                <span>Permintaan Donasi Pangan Panti Asuhan</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Ajukan kuota kebutuhan porsi harian santri & anak asuh panti. Permintaan Anda akan langsung tampil di dashboard seluruh restoran & donor mitra Replate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 bg-[#D4A843] hover:bg-[#E5B954] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Buat Pengajuan Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {myDonationRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-extrabold text-slate-800 text-sm">Belum Ada Pengajuan Donasi</h4>
                <p className="text-xs text-slate-500 mt-1">Klik tombol di atas untuk membuat permintaan kebutuhan pangan baru bagi panti asuhan Anda.</p>
              </div>
            ) : (
              myDonationRequests.map((req: any) => {
                const isFulfilled = req.status === 'DISANGGUPI' || req.status === 'MATCHED & PROCESSED';
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5 hover:border-amber-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-[#1B3A5C]">{req.shelterName}</span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs text-slate-500 font-bold">{req.foodCategoryNeeded}</span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs text-slate-500 font-mono">{req.createdAt || 'Hari ini'}</span>
                      </div>
                      <div>
                        {isFulfilled ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Donasi Telah Disanggupi Provider!
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center gap-1.5 border border-amber-300 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Menunggu Kesanggupan Donatur / Resto
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Kebutuhan Porsi</span>
                        <strong className="text-base font-black text-[#1B3A5C]">{req.beneficiariesCount} Porsi</strong>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Opsi Pengiriman</span>
                        <strong className="text-xs font-black text-slate-800 block truncate">
                          {req.preferredDelivery === 'PROVIDER_DIRECT' ? 'Armada Toko (Gratis)' : req.preferredDelivery === 'RESCUE_COURIER' ? 'Relawan Rescue (QC 2x)' : 'Ambil Mandiri (Gratis)'}
                        </strong>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Metode Pembayaran</span>
                        <strong className="text-xs font-black text-emerald-700 block truncate">
                          {req.paymentMethod || 'Bebas Biaya (Rp 0)'}
                        </strong>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Penugasan Driver</span>
                        <strong className="text-xs font-black text-slate-800 block truncate">
                          {req.driverName ? req.driverName : (req.assignedDriver || 'Driver Terdekat')}
                        </strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                      <strong>Catatan Permintaan:</strong> {req.notes}
                    </div>

                    {/* FULFILLED INFO BOX */}
                    {isFulfilled && (
                      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-300 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Rincian Penyaluran dari Donatur:
                          </span>
                          {req.ticketCode && (
                            <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                              Kode Tiket: {req.ticketCode}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Penyedia Makanan:</span>
                            <strong className="text-slate-900 font-bold">{req.fulfilledBy || 'Restoran Mitra Replate'}</strong>
                            <p className="text-[11px] text-slate-600 font-medium">{req.fulfilledProduct || 'Paket Pangan Bergizi'} ({req.fulfilledPortions || req.beneficiariesCount} porsi)</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Informasi Driver Pengantar:</span>
                            <strong className="text-slate-900 font-bold">{req.driverName || 'Budi Santoso'} ({req.driverVehicle || 'Honda Vario L 4521 AB'})</strong>
                            <p className="text-[11px] text-slate-600 font-mono">Telp/WA: {req.driverPhone || '0812-9876-5432'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Estimasi Pengantaran:</span>
                            <strong className="text-emerald-800 font-bold">{req.estimatedDeliveryTime || '30 - 45 Menit (OTW)'}</strong>
                            <p className="text-[11px] text-slate-600 font-semibold">Ongkir: {req.preferredDelivery === 'PROVIDER_DIRECT' ? 'Rp 0 (Gratis Armada Toko)' : 'Rp 5.000'}</p>
                          </div>
                        </div>

                        {req.ticketCode && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => router.push(`/track/${req.ticketCode}`)}
                              className="px-3.5 py-1.5 bg-[#1B3A5C] text-white rounded-xl text-xs font-bold hover:bg-[#2C5A8F] cursor-pointer flex items-center gap-1.5 transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#D4A843]" />
                              <span>Lacak Pengantaran Live</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 1: KLAIM PANGAN SUBSIDI & GRATIS */}
      {activeTab === 'KLAIM_PANGAN' && (
        <div className="space-y-4">
          {/* Filter Sub-bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Filter Skema:
              </span>
              <button
                type="button"
                onClick={() => setFoodFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  foodFilter === 'ALL'
                    ? 'bg-[#1B3A5C] text-[#D4A843] font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Pilihan ({foodList.length})
              </button>
              <button
                type="button"
                onClick={() => setFoodFilter('FREE')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  foodFilter === 'FREE'
                    ? 'bg-emerald-700 text-white font-black'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Donasi 100% Gratis (Rp 0)
              </button>
              <button
                type="button"
                onClick={() => setFoodFilter('SUBSIDIZED')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  foodFilter === 'SUBSIDIZED'
                    ? 'bg-amber-600 text-white font-black'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                Pangan Subsidi (Super-Diskon 75-80%)
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Menampilkan {filteredFoods.length} makanan siap salur ke panti asuhan
            </span>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFoods.map((food) => {
              const isFree = food.scheme === 'DONASI_GRATIS';

              return (
                <div
                  key={food.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#1B3A5C] p-5 shadow-xs transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              isFree
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {isFree ? 'DONASI GRATIS (RP 0)' : 'PANGAN SUBSIDI PANTI'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1B3A5C] text-[10px] font-bold">
                            {food.category}
                          </span>
                          {food.halalCertified && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              Halal
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-[#1B3A5C] text-base sm:text-lg leading-snug">
                          {food.name}
                        </h3>
                      </div>
                    </div>

                    {/* Donor Details */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Penyedia / Donor:</span>
                        <strong className="text-[#1B3A5C]">{food.donorName}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{food.donorAddress}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-700">{food.distanceKm} km</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Batas Penjemputan:</span>
                        </span>
                        <strong className="text-amber-800">{food.pickupDeadline}</strong>
                      </div>
                    </div>

                    {/* Portions & Price Breakdown */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Tersedia untuk Panti:</span>
                        <strong className="text-base font-black text-[#1B3A5C]">
                          {food.portions} Porsi <span className="text-xs font-normal text-slate-600">({food.weightKg} kg)</span>
                        </strong>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold block">Biaya per Porsi:</span>
                        {isFree ? (
                          <strong className="text-base font-black text-emerald-700">GRATIS (Rp 0)</strong>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="line-through text-slate-400 text-[11px]">
                              Rp {food.originalPrice.toLocaleString('id-ID')}
                            </span>
                            <strong className="text-base font-black text-amber-700">
                              Rp {food.subsidizedPrice.toLocaleString('id-ID')}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Bisa disalurkan via relawan Food Rescue
                    </span>

                    <Button
                      variant={isFree ? 'primary' : 'gold'}
                      size="sm"
                      onClick={() => handleOpenClaimModal(food)}
                      className="font-black text-xs py-2 px-4 shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{isFree ? 'Klaim Donasi (Rp 0)' : 'Klaim Porsi Subsidi'}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FORM VERIFIKASI LEGALITAS YAYASAN */}
      {activeTab === 'VERIFIKASI_LEGALITAS' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1B3A5C] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#D4A843]" />
                  <span>Verifikasi Legalitas Lembaga / Yayasan</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Izin resmi Kementerian Hukum &amp; HAM RI dan Tanda Daftar Lembaga Kesejahteraan Sosial (TDLKS) Dinas Sosial.
                </p>
              </div>

              {legalitas.isVerified && !isEditingLegalitas && (
                <button
                  type="button"
                  onClick={() => setIsEditingLegalitas(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Perbarui Dokumen
                </button>
              )}
            </div>

            {/* Verified Certificate Card if already verified */}
            {legalitas.isVerified && !isEditingLegalitas ? (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border-2 border-emerald-400/80 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                      AKUN YAYASAN TERVERIFIKASI PENUH
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-0.5">{yayasanName}</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Terdaftar resmi sebagai Lembaga Kesejahteraan Sosial (LKS) Mitra Penyelamat Pangan Nasional Replate.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-500 block">Nomor SK Kemenkumham RI:</span>
                    <strong className="text-xs font-mono font-black text-[#1B3A5C] block">
                      {legalitas.skKemenkumham}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-medium block">Sah Berbadan Hukum</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-500 block">Nomor Izin Dinsos (TDLKS):</span>
                    <strong className="text-xs font-mono font-black text-[#1B3A5C] block">
                      {legalitas.izinDinsos}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-medium block">Berlaku s/d {legalitas.validUntil}</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-500 block">Ketua / Penanggung Jawab Panti:</span>
                    <strong className="text-xs font-black text-slate-800 block">
                      {legalitas.ketuaName} ({legalitas.phone})
                    </strong>
                    <span className="text-[10px] text-slate-500 block">{legalitas.address}</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-500 block">File Arsip Legalitas:</span>
                    <div className="flex items-center gap-1.5 text-blue-700 font-mono text-[11px] font-bold truncate">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{legalitas.documentFileName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Diverifikasi pada {legalitas.verifiedAt}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-950 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Status verified memberikan prioritas klaim donasi surplus porsi besar dari hotel bintang lima &amp; katering nasional.
                  </span>
                </div>
              </div>
            ) : (
              /* Legalitas Edit / Submission Form */
              <form onSubmit={handleSaveLegalitas} className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                  <strong className="block font-bold">Instruksi Verifikasi Legalitas Panti:</strong>
                  <p className="leading-relaxed">
                    Sesuai regulasi redistribusi pangan Badan Pangan Nasional (Bapanas) dan Dinsos, yayasan penerima donasi porsi besar wajib melampirkan nomor SK Kemenkumham serta nomor Tanda Daftar Lembaga Kesejahteraan Sosial (TDLKS).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-[#1B3A5C] block mb-1">Nomor SK Pengesahan Kemenkumham RI *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: AHU-0012489.AH.01.04.Tahun 2021"
                      value={legalitasForm.skKemenkumham}
                      onChange={(e) => setLegalitasForm({ ...legalitasForm, skKemenkumham: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#1B3A5C]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1B3A5C] block mb-1">Nomor Izin Operasional Dinsos (TDLKS) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 460/182/436.7.11/2023"
                      value={legalitasForm.izinDinsos}
                      onChange={(e) => setLegalitasForm({ ...legalitasForm, izinDinsos: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#1B3A5C]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1B3A5C] block mb-1">Nama Ketua / Pimpinan Yayasan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Hajjah Maryam, S.Pd"
                      value={legalitasForm.ketuaName}
                      onChange={(e) => setLegalitasForm({ ...legalitasForm, ketuaName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1B3A5C]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1B3A5C] block mb-1">Nomor Telepon / WhatsApp Resmi Yayasan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0812-3456-7890"
                      value={legalitasForm.phone}
                      onChange={(e) => setLegalitasForm({ ...legalitasForm, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#1B3A5C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1B3A5C] text-xs block mb-1">
                    Unggah Dokumen Legalitas (SK Kemenkumham / Izin Dinsos PDF/JPG)
                  </label>
                  <div className="p-4 border-2 border-dashed border-slate-300 hover:border-[#1B3A5C] rounded-2xl bg-slate-50 text-center space-y-1.5 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">Klik untuk memilih file dokumen legalitas</p>
                    <p className="text-[10px] text-slate-500 font-mono">Format didukung: PDF, JPG, PNG (Maksimal 5MB)</p>
                    <div className="inline-block mt-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600">
                      File terpilih: {legalitasForm.documentFileName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  {legalitas.isVerified && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingLegalitas(false)}
                      className="font-bold text-xs py-2 px-4 cursor-pointer"
                    >
                      Batal
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-[#1B3A5C] hover:bg-[#2C5A8F] text-[#D4A843] font-black text-xs py-2 px-5 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simpan &amp; Verifikasi Legalitas Yayasan</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RIWAYAT PENYALURAN PANTI */}
      {activeTab === 'RIWAYAT' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-[#1B3A5C] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4A843]" />
              <span>Riwayat Penerimaan Bantuan Pangan Panti</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Total: {totalPortionsReceived} Porsi Diterima
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                    SELESAI DITERIMA
                  </span>
                  <strong className="text-sm font-black text-slate-800">50 Porsi Nasi Kotak &amp; Ayam Suwir</strong>
                </div>
                <p className="text-[11px] text-slate-600">
                  Donor: Hotel Majapahit Surabaya • Diantar oleh Relawan Food Rescue (Armada Mas Doni L 4582 ABC)
                </p>
                <span className="text-[10px] text-slate-400 font-mono block">Waktu serah terima: 27 Oktober 2026, 20:45 WIB</span>
              </div>
              <span className="font-mono font-black text-[#1B3A5C] bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center shrink-0">
                50 Porsi (20.0 Kg)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                    SELESAI DITERIMA
                  </span>
                  <strong className="text-sm font-black text-slate-800">45 Porsi Rawon Daging &amp; Tempe Bacem</strong>
                </div>
                <p className="text-[11px] text-slate-600">
                  Donor: Katering Bu Mimin Surabaya • Diantar oleh Komunitas Foodbank Surabaya
                </p>
                <span className="text-[10px] text-slate-400 font-mono block">Waktu serah terima: 25 Oktober 2026, 21:10 WIB</span>
              </div>
              <span className="font-mono font-black text-[#1B3A5C] bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center shrink-0">
                45 Porsi (18.5 Kg)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                    SELESAI DITERIMA
                  </span>
                  <strong className="text-sm font-black text-slate-800">60 Porsi Roti Tawar &amp; Pastry Steril</strong>
                </div>
                <p className="text-[11px] text-slate-600">
                  Donor: Rotiboy Bakery • Ambil Mandiri oleh Pengurus Panti Kasih Ibu
                </p>
                <span className="text-[10px] text-slate-400 font-mono block">Waktu serah terima: 23 Oktober 2026, 21:30 WIB</span>
              </div>
              <span className="font-mono font-black text-[#1B3A5C] bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center shrink-0">
                60 Porsi (15.0 Kg)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALOKASI KLAIM MAKANAN UNTUK PANTI */}
      {selectedClaimFood && (
        <Modal
          isOpen={!!selectedClaimFood}
          onClose={() => setSelectedClaimFood(null)}
          title={`Klaim Pangan untuk ${yayasanName}`}
          size="md"
        >
          <div className="space-y-4 p-2 text-slate-800 text-xs">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Makanan Terpilih:</span>
              <h4 className="font-black text-[#1B3A5C] text-sm">{selectedClaimFood.name}</h4>
              <p className="text-[11px] text-slate-600">
                Donor: {selectedClaimFood.donorName} • Jarak: {selectedClaimFood.distanceKm} km
              </p>
            </div>

            <div>
              <label className="font-bold text-[#1B3A5C] block mb-1">
                Jumlah Porsi Dibutuhkan Panti (Maksimal {selectedClaimFood.portions} Porsi):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={selectedClaimFood.portions}
                  value={claimPortions}
                  onChange={(e) => setClaimPortions(Math.min(selectedClaimFood.portions, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-32 p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-center text-sm"
                />
                <span className="text-slate-500 font-bold">Porsi (Untuk {totalBeneficiaries} anak panti)</span>
              </div>
            </div>

            {/* Pilihan Metode Penyaluran (Sesuai Aturan Replate Modul 3) */}
            <div className="space-y-2">
              <label className="font-bold text-[#1B3A5C] block">Pilihan Metode Pengambilan &amp; Pengantaran:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  onClick={() => setDeliveryMethod('RESCUE_PARTNER')}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'RESCUE_PARTNER'
                      ? 'border-[#1B3A5C] bg-white shadow-xs ring-2 ring-[#1B3A5C]/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                    <Truck className="w-4 h-4 text-[#1B3A5C]" />
                    <span>Mitra Food Rescue (Gratis Rp 0)</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    Diantar langsung relawan dengan boks steril Replate ke alamat panti asuhan.
                  </p>
                </div>

                <div
                  onClick={() => setDeliveryMethod('SELF_PICKUP')}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'SELF_PICKUP'
                      ? 'border-[#1B3A5C] bg-white shadow-xs ring-2 ring-[#1B3A5C]/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                    <Building className="w-4 h-4 text-[#1B3A5C]" />
                    <span>Ambil Sendiri (Self-Pickup)</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    Pengurus panti menjemput langsung ke lokasi donor sebelum batas waktu.
                  </p>
                </div>
              </div>
            </div>

            {/* Rincian Biaya */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal Makanan ({claimPortions} Porsi):</span>
                <span>
                  {selectedClaimFood.scheme === 'DONASI_GRATIS'
                    ? 'Rp 0 (Donasi)'
                    : `Rp ${(selectedClaimFood.subsidizedPrice * claimPortions).toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Biaya Layanan &amp; Logistik Panti:</span>
                <span className="font-bold text-emerald-700">Rp 0 (Gratis Panti Binaan)</span>
              </div>
              <div className="flex justify-between items-center font-black text-[#1B3A5C] pt-1 border-t border-slate-200 text-sm">
                <span>Total Tagihan:</span>
                <span className="text-emerald-700">
                  {selectedClaimFood.scheme === 'DONASI_GRATIS'
                    ? 'GRATIS (Rp 0)'
                    : `Rp ${(selectedClaimFood.subsidizedPrice * claimPortions).toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#1B3A5C] block mb-1">Catatan Khusus untuk Driver / Donor (Opsional):</label>
              <textarea
                rows={2}
                value={claimNotes}
                onChange={(e) => setClaimNotes(e.target.value)}
                placeholder="Contoh: Titip di pos satpam depan panti asuhan jika tiba malam hari"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1B3A5C]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedClaimFood(null)}
                className="font-bold text-xs py-2 px-4 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isSubmittingClaim}
                onClick={handleConfirmClaim}
                className="bg-[#1B3A5C] hover:bg-[#2C5A8F] text-[#D4A843] font-black text-xs py-2 px-5 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Klaim Pangan</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL FORM PENGAJUAN PERMINTAAN DONASI PANTI */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Formulir Pengajuan Permintaan Donasi Pangan">
        <form onSubmit={handleCreateDonationRequest} className="space-y-3.5 text-xs">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs">
            <strong>Informasi Panti Asuhan:</strong> Permintaan donasi makanan akan langsung dipublikasikan ke seluruh mitra resto dan donor pangan untuk segera disanggupi.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Nama Lembaga / Panti Asuhan</label>
            <input
              type="text"
              readOnly
              value={yayasanName}
              className="w-full rounded-xl border border-slate-200 text-xs px-3.5 py-2.5 bg-slate-100 font-bold text-[#1B3A5C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#343A40]">Kebutuhan Porsi *</label>
              <input
                type="number"
                min="5"
                max="500"
                value={reqPortions}
                onChange={(e) => setReqPortions(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#343A40]">Kategori Pangan *</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C]"
                value={reqCategory}
                onChange={(e) => setReqCategory(e.target.value)}
              >
                <option value="Makanan Olahan (Meals)">Makanan Olahan (Meals)</option>
                <option value="Roti, Buah & Susu (Bakery & Dairy)">Roti, Buah & Susu</option>
                <option value="Bahan Pokok (Produce)">Bahan Sembako & Sayur</option>
              </select>
            </div>
          </div>

          {/* Opsi Pengiriman: Driver Toko, Ambil Sendiri, atau Driver Volunteer */}
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#343A40]">Opsi Pengiriman *</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C]"
                value={reqDeliveryMethod}
                onChange={(e) => {
                  const val = e.target.value;
                  setReqDeliveryMethod(val);
                  if (val === 'PROVIDER_DIRECT' || val === 'SHELTER_PICKUP') {
                    setReqPaymentMethod('Bebas Biaya (Rp 0)');
                    if (val === 'PROVIDER_DIRECT') {
                      setReqAssignedDriver('Budi Santoso - Honda Vario L 4521 AB (Armada Toko)');
                    } else {
                      setReqAssignedDriver('Penjemputan Mandiri oleh Pengurus Panti');
                    }
                  } else if (val === 'RESCUE_COURIER') {
                    setReqPaymentMethod('Saldo Dompet Replate');
                    setReqAssignedDriver('Ahmad Fauzi - Replate Van L 8821 BB (Relawan Food Rescue)');
                  }
                }}
                required
              >
                <option value="PROVIDER_DIRECT">Diantar Driver / Armada Toko (Gratis Rp 0)</option>
                <option value="SHELTER_PICKUP">Ambil Sendiri ke Lokasi Toko / Donor (Gratis Rp 0)</option>
                <option value="RESCUE_COURIER">Driver Relawan Food Rescue (+Ongkir Operasional) • Benefit QC 2 Kali</option>
              </select>
            </div>

            {/* Benefit Box khusus Relawan Food Rescue (QC 2 Kali) */}
            {reqDeliveryMethod === 'RESCUE_COURIER' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs space-y-1.5 text-amber-950 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-black text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Benefit Spesial Driver Relawan: Jaminan Quality Control (QC) 2 Kali</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Makanan Anda melewati <strong>pemeriksaan ganda (2x QC)</strong>: 1 kali inspeksi kelayakan oleh staf restoran/donor, dan 1 kali uji kelayakan suhu &amp; kemasan higienis oleh Relawan Food Rescue sebelum serah terima ke panti.
                </p>
                <span className="inline-block text-[10.5px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                  Biaya: Ongkir operasional bahan bakar relawan (~Rp 2.000/km)
                </span>
              </div>
            )}

            {/* Metode Pembayaran: HANYA jika memakai Driver Relawan (Volunteer) */}
            {reqDeliveryMethod === 'RESCUE_COURIER' ? (
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in">
                <label className="text-xs font-semibold text-[#343A40]">
                  Metode Pembayaran Ongkir Relawan *
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C]"
                  value={reqPaymentMethod}
                  onChange={(e) => setReqPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Saldo Dompet Replate">Saldo Dompet Replate Yayasan</option>
                  <option value="QRIS / E-Wallet">QRIS / E-Wallet Panti</option>
                  <option value="Transfer Bank">Transfer Bank Mandiri / BCA</option>
                  <option value="COD (Bayar Tunai di Tempat ke Relawan)">COD (Bayar Tunai ke Relawan saat Tiba)</option>
                </select>
                <span className="text-[10px] text-slate-500">
                  Ongkir digunakan 100% untuk subsidi bahan bakar operasional relawan penyelamat pangan.
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Biaya Pengantaran &amp; Makanan: <strong>100% Bebas Biaya (Rp 0)</strong></span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">GRATIS</span>
              </div>
            )}

            {/* Opsi Driver Pengantaran */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#343A40]">Opsi Driver Pengantaran</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C]"
                value={reqAssignedDriver}
                onChange={(e) => setReqAssignedDriver(e.target.value)}
              >
                {reqDeliveryMethod === 'PROVIDER_DIRECT' && (
                  <>
                    <option value="Budi Santoso - Honda Vario L 4521 AB (Armada Toko)">Budi Santoso - Honda Vario L 4521 AB (Armada Toko)</option>
                    <option value="Driver Siaga Toko / Resto Mitra">Driver Siaga Toko / Resto Mitra</option>
                  </>
                )}
                {reqDeliveryMethod === 'SHELTER_PICKUP' && (
                  <>
                    <option value="Penjemputan Mandiri oleh Pengurus Panti">Penjemputan Mandiri oleh Pengurus Panti</option>
                    <option value="Armada Operasional Yayasan">Armada Operasional Yayasan</option>
                  </>
                )}
                {reqDeliveryMethod === 'RESCUE_COURIER' && (
                  <>
                    <option value="Tugaskan Otomatis (Relawan Terdekat)">Tugaskan Otomatis (Relawan Terdekat)</option>
                    <option value="Ahmad Fauzi - Replate Van L 8821 BB (Relawan Food Rescue)">Ahmad Fauzi - Replate Van L 8821 BB (Relawan Food Rescue)</option>
                    <option value="Rian Hidayat - Yamaha NMAX L 3319 CD (Driver Volunteer Siaga)">Rian Hidayat - Yamaha NMAX L 3319 CD (Driver Volunteer Siaga)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Alamat Pengantaran</label>
            <input
              type="text"
              readOnly
              value={legalitas.address}
              className="w-full rounded-xl border border-slate-200 text-xs px-3.5 py-2 bg-slate-50 text-slate-700"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Catatan Kebutuhan Makanan *</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-300 text-xs p-3 focus:outline-none focus:border-[#1B3A5C]"
              value={reqNotes}
              onChange={(e) => setReqNotes(e.target.value)}
              placeholder="Contoh: Kebutuhan makan malam santri panti asuhan..."
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsRequestModalOpen(false)}>
              Batal
            </Button>
            <Button variant="gold" size="sm" type="submit" className="font-extrabold text-slate-950">
              Kirim Pengajuan Donasi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Alert */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

