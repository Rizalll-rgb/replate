'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { 
  CheckIcon, 
  ClockIcon, 
  MapPinIcon, 
  PackageIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  SearchIcon 
} from '@/components/ui/Icon';

const ITEMS_PER_PAGE = 5;

export default function YayasanClaimsPage() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY' | 'REQUESTS'>('ACTIVE');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'SELF_PICKUP' | 'RESCUE_PARTNER'>('ALL');
  const [claimsList, setClaimsList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [myRequestsList, setMyRequestsList] = useState<any[]>([]);
  const [selectedClaimModal, setSelectedClaimModal] = useState<any | null>(null);

  // Pagination states (Poin 9)
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);

  // Profile data for auto-fill & prefill (Poin 1)
  const [pantiName, setPantiName] = useState('Panti Asuhan Kasih Ibu');
  const [contactPerson, setContactPerson] = useState('Ibu Hajjah Maryam');
  const [pantiPhone, setPantiPhone] = useState('081234567890');
  const [pantiAddress, setPantiAddress] = useState('Jl. Raya Gubeng No. 88, Gubeng, Surabaya');
  const [dinsosReg, setDinsosReg] = useState('DINSOS-SBY-2024-881');
  const [pantiCapacity, setPantiCapacity] = useState('45 Jiwa');

  // Modal Ajukan Kebutuhan Pangan Komprehensif (Poin 1)
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqInstitutionType, setReqInstitutionType] = useState('Panti Asuhan Yatim Piatu');
  const [reqFoodType, setReqFoodType] = useState('Makanan Berat Siap Santap Bergizi');
  const [reqQuantity, setReqQuantity] = useState('45');
  const [reqUrgency, setReqUrgency] = useState('Mendesak (Darurat Segera)');
  const [reqDeliveryMethod, setReqDeliveryMethod] = useState('Membutuhkan Pengantaran Kurir Relawan');
  const [reqReadyTime, setReqReadyTime] = useState('Hari Ini, Pukul 19:30 - 20:30 WIB');
  const [reqNotes, setReqNotes] = useState('');

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('openRequest') === 'true') {
          setRequestModalOpen(true);
          setActiveTab('REQUESTS');
        }
      }

      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        try {
          const parsed = JSON.parse(p);
          if (parsed.entityName) setPantiName(parsed.entityName);
          if (parsed.contactPerson) setContactPerson(parsed.contactPerson);
          if (parsed.phone) setPantiPhone(parsed.phone);
          if (parsed.address) setPantiAddress(parsed.address);
          if (parsed.capacity) {
            setPantiCapacity(parsed.capacity);
            const num = parseInt(parsed.capacity.replace(/\D/g, ''));
            if (!isNaN(num) && num > 0) setReqQuantity(num.toString());
          }
        } catch (_) {}
      }

      const savedClaims = localStorage.getItem('replate_claims');
      const activeClaims = localStorage.getItem('replate_active_claims');

      let mergedClaims: any[] = [];
      if (savedClaims) {
        try {
          const parsed = JSON.parse(savedClaims);
          if (Array.isArray(parsed)) mergedClaims = [...parsed];
        } catch (_) {}
      }
      if (activeClaims) {
        try {
          const parsed = JSON.parse(activeClaims);
          if (Array.isArray(parsed)) {
            parsed.forEach((c: any) => {
              if (!mergedClaims.some((m) => m.id === c.id || m.code === c.id)) {
                mergedClaims.push(c);
              }
            });
          }
        } catch (_) {}
      }

      if (isFresh && mergedClaims.length === 0) {
        setClaimsList([]);
        setHistoryList([]);
        setMyRequestsList([]);
        return;
      }

      const defaultActiveDemo = [
        {
          id: 'CLM-YYS-001',
          code: 'FB-YYS-8821',
          foodName: 'Roti & Kue Pastry Surplus Steril',
          provider: 'Rotiboy Bakery Surabaya',
          providerName: 'Rotiboy Bakery Surabaya',
          address: 'Grand City Mall Lt. LG, Surabaya',
          quantity: '30 Porsi',
          method: 'RESCUE_PARTNER',
          methodLabel: 'Dikirim Kurir Komunitas (Pool Siaga)',
          status: 'IN_TRANSIT',
          pickupTime: 'Hari ini 20:30 WIB',
          claimedAt: 'Hari ini, 16:30 WIB',
          createdAtTimestamp: Date.now() - 45 * 60 * 1000,
          qrPayload: 'REPLATE-YYS-FB-YYS-8821-VERIFIED',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          driverInfo: {
            name: 'Mas Fajar Santoso',
            phone: '081234567890',
            vehicle: 'Honda Vario 160 (L 4582 ABC)',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            status: 'Relawan Logistik Terverifikasi',
          },
        },
        {
          id: 'CLM-YYS-002',
          code: 'FB-YYS-8822',
          foodName: '40 Porsi Nasi Kotak & Lauk Bergizi',
          provider: 'Warung Bakso Pak Kumis',
          providerName: 'Warung Bakso Pak Kumis',
          address: 'Jl. Kusuma Bangsa No. 42, Surabaya',
          quantity: '40 Porsi',
          method: 'SELF_PICKUP',
          methodLabel: 'Ambil Sendiri (Self-Pickup)',
          status: 'READY_FOR_PICKUP',
          pickupTime: 'Hari ini 21:00 WIB',
          claimedAt: 'Hari ini, 17:15 WIB',
          createdAtTimestamp: Date.now() - 30 * 60 * 1000,
          qrPayload: 'REPLATE-YYS-FB-YYS-8822-VERIFIED',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          driverInfo: null,
        },
        {
          id: 'CLM-YYS-003',
          code: 'FB-YYS-8823',
          foodName: 'Paket Sembako Kering & Beras 10kg',
          provider: 'Superindo Kertajaya',
          providerName: 'Superindo Kertajaya',
          address: 'Jl. Raya Kertajaya Indah No. 15, Surabaya',
          quantity: '10 Paket',
          method: 'RESCUE_PARTNER',
          methodLabel: 'Dikirim Kurir Komunitas (Pool Siaga)',
          status: 'WAITING_RESCUE_POOL',
          pickupTime: 'Hari ini 21:30 WIB',
          claimedAt: 'Hari ini, baru saja',
          createdAtTimestamp: Date.now() - 10 * 60 * 1000,
          qrPayload: 'REPLATE-YYS-FB-YYS-8823-VERIFIED',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          driverInfo: null, // Poin 6: Masih di pool siaga, belum ada driver
        },
      ];

      const defaultHistoryDemo = [
        {
          id: 'HIST-001',
          code: 'FB-YYS-7711',
          foodName: '50 Porsi Nasi Bento Ayam Crispy',
          provider: 'Resto Bento Delight',
          quantity: '50 Porsi',
          deliveredAt: 'Kemarin, 21:15 WIB',
          co2Saved: '25.0 kg',
          dinsosAudit: 'TERVERIFIKASI AUDIT RESMI',
          methodLabel: 'Diantar Kurir Relawan',
          pic: 'Ibu Hajjah Maryam',
        },
        {
          id: 'HIST-002',
          code: 'FB-YYS-7712',
          foodName: '30 Porsi Sayur Sup Segar & Telur Balado',
          provider: 'Katering Sehat Bu Siti',
          quantity: '30 Porsi',
          deliveredAt: '2 hari lalu, 20:30 WIB',
          co2Saved: '15.0 kg',
          dinsosAudit: 'TERVERIFIKASI AUDIT RESMI',
          methodLabel: 'Ambil Sendiri',
          pic: 'Ustadz Abdullah',
        },
        {
          id: 'HIST-003',
          code: 'FB-YYS-7713',
          foodName: '40 Paket Roti Gandum & Donat Manis',
          provider: 'Holland Bakery Surabaya',
          quantity: '40 Paket',
          deliveredAt: '3 hari lalu, 19:45 WIB',
          co2Saved: '20.0 kg',
          dinsosAudit: 'TERVERIFIKASI AUDIT RESMI',
          methodLabel: 'Diantar Kurir Relawan',
          pic: 'Ibu Hajjah Maryam',
        },
      ];

      const defaultRequestsDemo = [
        {
          id: 'REQ-001',
          foodType: 'Makanan Berat Siap Santap Bergizi',
          quantity: '45 Porsi',
          institutionType: 'Panti Asuhan Yatim Piatu',
          urgency: 'Mendesak (Darurat Segera)',
          methodPreference: 'Diantar Kurir Relawan',
          readyTime: 'Sebelum Pukul 20:30 WIB',
          status: 'DALAM RADAR DONATUR (SMART MATCHING)',
          createdAt: 'Hari ini, 14:00 WIB',
          notes: 'Dibutuhkan untuk makan malam 45 santri panti asuhan.',
        },
        {
          id: 'REQ-002',
          foodType: 'Bahan Pokok & Sembako Kering (Beras & Telur)',
          quantity: '10 Paket',
          institutionType: 'Panti Asuhan Yatim Piatu',
          urgency: 'Kebutuhan Rutin Mingguan',
          methodPreference: 'Bisa Ambil Sendiri',
          readyTime: 'Kapan saja selama jam kerja',
          status: 'TELAH DISANGGUPI DONATUR (Menunggu Handover)',
          createdAt: 'Kemarin, 09:30 WIB',
          notes: 'Stok beras mingguan untuk asrama anak asuh.',
        },
      ];

      setClaimsList(mergedClaims.length > 0 ? mergedClaims : defaultActiveDemo);
      setHistoryList(defaultHistoryDemo);
      setMyRequestsList(defaultRequestsDemo);
    } catch (_) {}
  }, []);

  // Filter Normalizer (Poin 6)
  const filteredClaims = claimsList.filter((item) => {
    if (methodFilter === 'ALL') return true;
    const m = (item.method || item.deliveryMethod || item.methodLabel || '').toUpperCase();
    if (methodFilter === 'SELF_PICKUP') {
      return m.includes('SELF') || m.includes('PICKUP') || m.includes('AMBIL');
    }
    if (methodFilter === 'RESCUE_PARTNER') {
      return m.includes('RESCUE') || m.includes('PARTNER') || m.includes('COURIER') || m.includes('ANTAR') || m.includes('RELAVAN') || m.includes('KOMUNITAS');
    }
    return true;
  });

  // Pagination calculations (Poin 9)
  const activeTotalPages = Math.ceil(filteredClaims.length / ITEMS_PER_PAGE) || 1;
  const paginatedActiveClaims = filteredClaims.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const historyTotalPages = Math.ceil(historyList.length / ITEMS_PER_PAGE) || 1;
  const paginatedHistory = historyList.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

  const requestsTotalPages = Math.ceil(myRequestsList.length / ITEMS_PER_PAGE) || 1;
  const paginatedRequests = myRequestsList.slice((requestsPage - 1) * ITEMS_PER_PAGE, requestsPage * ITEMS_PER_PAGE);

  // Form Submit Ajukan Kebutuhan Panti Komprehensif (Poin 1)
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `REQ-${Date.now()}`,
      foodType: reqFoodType,
      quantity: `${reqQuantity} Porsi`,
      institutionType: reqInstitutionType,
      urgency: reqUrgency,
      methodPreference: reqDeliveryMethod,
      readyTime: reqReadyTime,
      status: 'DALAM RADAR DONATUR (SMART MATCHING)',
      createdAt: 'Baru saja',
      notes: reqNotes || 'Kebutuhan pangan panti asuhan terverifikasi.',
    };

    setMyRequestsList([newReq, ...myRequestsList]);
    setRequestModalOpen(false);
    setActiveTab('REQUESTS');
    setToastState({
      isOpen: true,
      message: 'Permintaan bantuan pangan berhasil dipublikasikan ke radar donatur & Smart Matching 2.0!',
      type: 'success',
    });
  };

  // Helper function to build dynamic timeline for a claim (Poin 8)
  const getDynamicTimeline = (claim: any) => {
    const claimTime = claim.claimedAt?.replace('Hari ini, ', '') || '16:30 WIB';
    const isPickup = (claim.method || '').includes('SELF') || (claim.methodLabel || '').includes('Ambil');
    const isWaitingPool = claim.status === 'WAITING_RESCUE_POOL';
    const isInTransit = claim.status === 'IN_TRANSIT';

    return [
      {
        title: 'Klaim Alokasi Dikonfirmasi Donatur',
        desc: `Pesanan donasi diterima oleh gerai ${claim.provider || claim.providerName}`,
        time: claimTime,
        done: true,
      },
      {
        title: 'Makanan Selesai Dikemas & Lolos BPOM',
        desc: 'Uji visual & suhu simpan 8-checklist higienitas terverifikasi',
        time: '+15 mnt',
        done: true,
      },
      {
        title: isPickup 
          ? 'Kesiapan Handover di Kasir Gerai' 
          : isWaitingPool 
            ? 'Siaga di Pool Relawan Replate' 
            : 'Kurir Relawan Mengambil dari Gerai',
        desc: isPickup
          ? 'Makanan siap diambil mandiri oleh PIC panti'
          : isWaitingPool
            ? 'Menunggu konfirmasi armada relawan dari pool siaga'
            : `Diambil oleh ${claim.driverInfo?.name || 'Kurir Relawan'}`,
        time: isPickup ? 'Siap' : isWaitingPool ? 'Siaga' : '+30 mnt',
        done: !isWaitingPool,
        current: isWaitingPool || (isPickup && claim.status === 'READY_FOR_PICKUP'),
      },
      {
        title: isPickup ? 'Serah Terima Selesai di Toko' : 'Dalam Perjalanan Menuju Lokasi Panti',
        desc: isPickup 
          ? 'Tunjukkan QR Pass ini ke kasir gerai donatur' 
          : `Menuju lokasi ${pantiName}`,
        time: isPickup ? 'Menunggu' : isInTransit ? 'Estimasi Tiba' : 'Menunggu',
        done: false,
        current: isInTransit,
      },
    ];
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-16">
      <Toast 
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Sleek Modern Header Card Seragam */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Food Beneficiary Management
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Audit Dinsos RI: {dinsosReg}</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              Klaim & Penyaluran Pangan
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Lembaga: <strong>{pantiName}</strong> · Kapasitas: <strong>{pantiCapacity}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              variant="gold"
              size="sm"
              leftIcon={<PackageIcon size={14} className="text-slate-950" />}
              className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
              onClick={() => setRequestModalOpen(true)}
            >
              + Ajukan Kebutuhan Pangan
            </Button>
            <Link href="/dashboard/explore">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SearchIcon size={14} className="text-[#1B3A5C]" />}
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Eksplor Pangan
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab('ACTIVE'); setActivePage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-[#1B3A5C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ClockIcon size={13} />
            <span>Klaim Aktif ({claimsList.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('HISTORY'); setHistoryPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-[#1B3A5C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckIcon size={13} />
            <span>Riwayat Bantuan Selesai ({historyList.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('REQUESTS'); setRequestsPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'REQUESTS'
                ? 'bg-[#1B3A5C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <PackageIcon size={13} />
            <span>Permintaan Saya ({myRequestsList.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KLAIM AKTIF DENGAN DRIVER PROFILE & TIMELINE DI DALAM CARD (Poin 2, 3, 6, 8) */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {/* Method Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">Filter Penyaluran:</span>
            {[
              { id: 'ALL', label: 'Semua Metode' },
              { id: 'SELF_PICKUP', label: 'Ambil Sendiri' },
              { id: 'RESCUE_PARTNER', label: 'Diantar Kurir Komunitas' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setMethodFilter(f.id as any);
                  setActivePage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  methodFilter === f.id
                    ? 'bg-[#D4A843] text-slate-950 font-black shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredClaims.length === 0 ? (
            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <PackageIcon size={24} />
              </div>
              <h4 className="font-black text-sm text-[#1B3A5C]">Tidak Ada Klaim Aktif Sesuai Filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan ubah filter atau jelajahi donasi makanan gratis dari toko donatur di modul Eksplor Pangan.
              </p>
              <Link href="/dashboard/explore" className="inline-block pt-1">
                <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs cursor-pointer">
                  Eksplor Pangan Donasi Rp 0 ➔
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {paginatedActiveClaims.map((claim) => {
                const isWaitingPool = claim.status === 'WAITING_RESCUE_POOL';
                const isPickup = (claim.method || '').includes('SELF') || (claim.methodLabel || '').includes('Ambil');
                const isProviderDirect = (claim.method || '').includes('PROVIDER');
                const timelineSteps = getDynamicTimeline(claim);

                return (
                  <div
                    key={claim.id}
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
                  >
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-[#1B3A5C] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {claim.code || claim.id}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                          claim.status === 'READY_FOR_PICKUP'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isWaitingPool
                              ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          {claim.status === 'READY_FOR_PICKUP' 
                            ? 'SIAP DIAMBIL DI GERAI' 
                            : isWaitingPool 
                              ? 'MENUNGGU DI POOL RELAWAN' 
                              : 'SEDANG DIANTAR KURIR'}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <ClockIcon size={12} className="text-slate-400" />
                        {claim.claimedAt || 'Hari ini'}
                      </span>
                    </div>

                    {/* Food & Provider Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <h4 className="font-black text-sm sm:text-base text-[#1B3A5C]">{claim.foodName}</h4>
                        <p className="text-xs text-slate-600 font-bold">
                          Penyedia: <span className="text-slate-900">{claim.provider || claim.providerName}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPinIcon size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{claim.address}</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-between text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Kuantitas:</span>
                          <strong className="text-emerald-700 font-black">{claim.quantity}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Metode:</span>
                          <strong className="text-slate-800 font-bold">{claim.methodLabel || 'Diantar Kurir Relawan'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Biaya Bantuan:</span>
                          <strong className="text-emerald-600 font-black">Rp 0 (Donasi)</strong>
                        </div>
                      </div>
                    </div>

                    {/* DEDICATED DRIVER PROFILE CARD / POOL STATUS LANGSUNG DI CARD (Poin 2 & Poin 6) */}
                    {isWaitingPool ? (
                      <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                            <TruckIcon size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-purple-900 tracking-wider block">
                              Pool Siaga Relawan Komunitas Replate
                            </span>
                            <p className="text-[11px] text-purple-950 font-medium">
                              Pesanan makanan sedang disiagakan di Pool Tugas Relawan Food Rescue. Driver relawan akan segera menjemput di toko.
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-purple-200 text-purple-950 font-black text-[10px] rounded-lg shrink-0 self-start sm:self-auto">
                          Status: Menunggu Armada
                        </span>
                      </div>
                    ) : claim.driverInfo ? (
                      <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#1B3A5C] shrink-0">
                            <img
                              src={claim.driverInfo.photo}
                              alt={claim.driverInfo.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-black text-sm text-[#1B3A5C] truncate">{claim.driverInfo.name}</h5>
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                ✓ Verified
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-700 font-bold">{claim.driverInfo.vehicle}</p>
                            <p className="text-[10px] text-slate-500 font-mono">No. WA: {claim.driverInfo.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <a
                            href={`https://wa.me/62${claim.driverInfo.phone.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(claim.driverInfo.name)},%20saya%20dari%20${encodeURIComponent(pantiName)}%20mengenai%20pengantaran%20makanan%20${encodeURIComponent(claim.code)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs text-center shadow-xs cursor-pointer transition-colors"
                          >
                            Chat WhatsApp
                          </a>
                          <Link href="/dashboard/tracking" className="flex-1 sm:flex-initial">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs font-bold border-[#1B3A5C] text-[#1B3A5C] hover:bg-[#1B3A5C]/5 cursor-pointer"
                            >
                              Live GPS ➔
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : isPickup ? (
                      <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-950">
                        <div className="flex items-center gap-2">
                          <PackageIcon size={15} className="text-amber-700 shrink-0" />
                          <span className="font-semibold text-[11px]">
                            Pengurus panti mengambil langsung ke gerai {claim.provider}. Waktu ambil: {claim.pickupTime}.
                          </span>
                        </div>
                        <span className="font-bold text-amber-800 text-[10px] shrink-0">Scan QR di Kasir</span>
                      </div>
                    ) : null}

                    {/* REAL-TIME & DYNAMIC 4-STEP TIMELINE LANGSUNG DI CARD (Poin 3 & Poin 8) */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Timeline Penyaluran & Keamanan Pangan (Real-Time)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <ShieldCheckIcon size={11} />
                          Standar Mutu BPOM RI
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                        {timelineSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                              step.current
                                ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300 shadow-2xs'
                                : step.done
                                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                                  : 'bg-white border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                                step.done 
                                  ? 'bg-emerald-600 text-white' 
                                  : step.current 
                                    ? 'bg-[#D4A843] text-slate-950 animate-pulse' 
                                    : 'bg-slate-200 text-slate-600'
                              }`}>
                                {step.done ? '✓' : idx + 1}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-500">{step.time}</span>
                            </div>
                            <span className={`font-black text-[11px] leading-tight block ${
                              step.current ? 'text-[#1B3A5C]' : step.done ? 'text-slate-900' : 'text-slate-500'
                            }`}>
                              {step.title}
                            </span>
                            <span className="text-[9px] text-slate-500 leading-tight mt-1 block">
                              {step.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer Actions & QR Manifest Modal Button (Poin 7) */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheckIcon size={12} className="text-emerald-600" />
                        {claim.hygieneStatus || 'Lolos Cek Fisik & Higienitas BPOM RI'}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="gold"
                          size="sm"
                          className="font-black text-xs text-slate-950 py-1.5 px-3.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                          onClick={() => setSelectedClaimModal(claim)}
                        >
                          <PackageIcon size={13} />
                          <span>Buka Tiket Handover QR</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls (Poin 9) */}
              {activeTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">
                    Menampilkan <strong>{(activePage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(activePage * ITEMS_PER_PAGE, filteredClaims.length)}</strong> dari <strong>{filteredClaims.length}</strong> klaim
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activePage === 1}
                      onClick={() => setActivePage((p) => Math.max(p - 1, 1))}
                      className="px-2.5 py-1 text-xs font-bold"
                    >
                      Sebelumnya
                    </Button>
                    {Array.from({ length: activeTotalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePage(idx + 1)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-colors ${
                          activePage === idx + 1
                            ? 'bg-[#1B3A5C] text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activePage === activeTotalPages}
                      onClick={() => setActivePage((p) => Math.min(p + 1, activeTotalPages))}
                      className="px-2.5 py-1 text-xs font-bold"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RIWAYAT BANTUAN SELESAI */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-950">
            <div>
              <h4 className="font-black text-sm">Rekapitulasi Penyaluran Selesai</h4>
              <p className="text-xs text-emerald-800">
                Seluruh bantuan makanan yang telah di-handover telah diverifikasi sesuai regulasi Dinsos & BPOM RI.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">Total Makanan Diterima</span>
              <strong className="text-xl font-black text-emerald-900 font-mono">185 Porsi</strong>
            </div>
          </div>

          <div className="space-y-3">
            {paginatedHistory.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono font-bold text-[10px] text-slate-500 block">{item.code}</span>
                    <h4 className="font-black text-sm text-[#1B3A5C]">{item.foodName}</h4>
                    <p className="text-slate-600 font-medium">Donatur: <strong>{item.provider}</strong></p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-md">
                    ✓ SELESAI SERAH TERIMA
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block">Jumlah Porsi:</span>
                    <strong className="text-slate-800">{item.quantity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Waktu Diterima:</span>
                    <strong className="text-slate-800">{item.deliveredAt}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pencegahan CO2:</span>
                    <strong className="text-emerald-600 font-black">{item.co2Saved}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Penerima PIC:</span>
                    <strong className="text-slate-800">{item.pic}</strong>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls (Poin 9) */}
            {historyTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">
                  Menampilkan <strong>{(historyPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(historyPage * ITEMS_PER_PAGE, historyList.length)}</strong> dari <strong>{historyList.length}</strong> riwayat
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage === 1}
                    onClick={() => setHistoryPage((p) => Math.max(p - 1, 1))}
                    className="px-2.5 py-1 text-xs font-bold"
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage === historyTotalPages}
                    onClick={() => setHistoryPage((p) => Math.min(p + 1, historyTotalPages))}
                    className="px-2.5 py-1 text-xs font-bold"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PERMINTAAN SAYA */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#1B3A5C]">Daftar Kebutuhan Pangan Aktif Lembaga</h3>
            <Button
              variant="gold"
              size="sm"
              className="font-black text-xs text-slate-950 py-1.5 px-3 rounded-xl shadow-xs"
              onClick={() => setRequestModalOpen(true)}
            >
              + Ajukan Kebutuhan Baru
            </Button>
          </div>

          <div className="space-y-3">
            {paginatedRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-0.5">
                      {req.institutionType}
                    </span>
                    <h4 className="font-black text-sm text-[#1B3A5C]">{req.foodType}</h4>
                    <p className="text-slate-500 font-medium mt-0.5">Dipublikasikan: {req.createdAt}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-[#1B3A5C] font-black text-[10px] rounded-lg">
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Target Porsi / Paket:</span>
                    <strong className="text-emerald-700 font-black">{req.quantity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Tingkat Urgensi:</span>
                    <strong className="text-amber-800 font-bold">{req.urgency}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Preferensi Penyaluran:</span>
                    <strong className="text-slate-800">{req.methodPreference}</strong>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                    <strong>Catatan Panti:</strong> {req.notes}
                  </p>
                )}
              </div>
            ))}

            {/* Pagination Controls (Poin 9) */}
            {requestsTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">
                  Menampilkan <strong>{(requestsPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(requestsPage * ITEMS_PER_PAGE, myRequestsList.length)}</strong> dari <strong>{myRequestsList.length}</strong> permintaan
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={requestsPage === 1}
                    onClick={() => setRequestsPage((p) => Math.max(p - 1, 1))}
                    className="px-2.5 py-1 text-xs font-bold"
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={requestsPage === requestsTotalPages}
                    onClick={() => setRequestsPage((p) => Math.min(p + 1, requestsTotalPages))}
                    className="px-2.5 py-1 text-xs font-bold"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tiket Serah Terima Handover Ber-Barcode QR Manifest Terstandarisasi (Poin 7) */}
      <Modal
        isOpen={!!selectedClaimModal}
        onClose={() => setSelectedClaimModal(null)}
        title="Tiket Digital Serah Terima Makanan (QR Manifest)"
        size="md"
      >
        {selectedClaimModal && (
          <div className="space-y-4 text-xs">
            {/* Top QR Display Box */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 text-center space-y-3">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                SCAN QR SAAT HANDOVER MAKANAN
              </span>
              <div className="flex justify-center py-1">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
                  <QRGenerator 
                    value={`REPLATE-YYS-${selectedClaimModal.code || selectedClaimModal.id}`} 
                    foodName={selectedClaimModal.foodName}
                    portions={selectedClaimModal.quantity}
                    providerName={selectedClaimModal.provider || selectedClaimModal.providerName}
                    deliveryMethod={selectedClaimModal.method}
                    recipientName={pantiName}
                  />
                </div>
              </div>
              <span className="font-mono font-black text-sm text-[#1B3A5C] block">
                {`REPLATE-YYS-${selectedClaimModal.code || selectedClaimModal.id}`}
              </span>
              <p className="text-[11px] text-slate-500 font-medium leading-tight max-w-xs mx-auto">
                Tunjukkan barcode QR resmi ini kepada kasir toko donatur atau driver saat makanan surplus diserahkan.
              </p>
            </div>

            {/* Detail Information */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500 font-medium">Menu Surplus:</span>
                <strong className="text-[#1B3A5C] text-right font-bold">{selectedClaimModal.foodName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500 font-medium">Jumlah Alokasi:</span>
                <strong className="text-emerald-700 font-black">{selectedClaimModal.quantity}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500 font-medium">Penyedia Donatur:</span>
                <strong className="text-slate-800 font-bold">{selectedClaimModal.provider || selectedClaimModal.providerName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500 font-medium">Metode Penyaluran:</span>
                <strong className="text-slate-800 font-bold">{selectedClaimModal.methodLabel || 'Diantar Kurir Komunitas'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Lokasi Pickup:</span>
                <span className="text-slate-700 font-medium text-right max-w-[200px] truncate">{selectedClaimModal.address}</span>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-emerald-900">
              <ShieldCheckIcon size={18} className="text-emerald-600 shrink-0" />
              <div className="text-[11px] leading-snug">
                <strong className="block font-black">Audit Kualitas Higienitas Terjamin</strong>
                <span className="font-medium text-emerald-800">
                  Makanan ini telah diverifikasi memenuhi 8-Checklist Kelayakan Konsumsi BPOM RI & Dinsos.
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full font-black py-2.5 text-xs shadow-xs cursor-pointer"
              onClick={() => setSelectedClaimModal(null)}
            >
              Tutup Tiket
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal Ajukan Kebutuhan Pangan Komprehensif (Poin 1) */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Formulir Kebutuhan Bantuan Pangan Lembaga"
        size="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          {/* Header Card Info Kontras Tinggi (Poin 1) */}
          <div className="p-4 bg-[#1B3A5C] rounded-2xl text-white space-y-1">
            <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
              PUBLIKASI RADAR DONATUR & SMART MATCHING 2.0
            </span>
            <h3 className="font-black text-sm sm:text-base text-white">
              Pengajuan Kebutuhan Pangan {pantiName}
            </h3>
            <p className="text-[11px] text-slate-200 leading-snug">
              Data otomatis disinkronkan ke toko donatur & katering terdekat untuk dicocokkan dengan makanan surplus bernutrisi tinggi.
            </p>
          </div>

          {/* Readonly Identity Card dari Profil (Poin 1: Data Identitas Terverifikasi) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div>
              <span className="text-slate-400 block font-medium">Lembaga Pemohon:</span>
              <strong className="text-[#1B3A5C] font-black">{pantiName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Legalitas Dinsos RI:</span>
              <strong className="text-emerald-700 font-black">{dinsosReg}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Kategori Lembaga:</span>
              <strong className="text-slate-800 font-bold">{reqInstitutionType}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Kebutuhan Makanan</label>
              <select
                value={reqFoodType}
                onChange={(e) => setReqFoodType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold bg-white cursor-pointer"
              >
                <option value="Makanan Berat Siap Santap Bergizi">Makanan Berat Siap Santap Bergizi</option>
                <option value="Bahan Pokok & Sembako Kering (Beras/Minyak/Telur)">Bahan Pokok & Sembako Kering</option>
                <option value="Roti, Pastry & Kudapan Sehat">Roti, Pastry & Kudapan Sehat</option>
                <option value="Susu, Buah Segar & Suplemen">Susu, Buah Segar & Suplemen Balita</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Jumlah Porsi (Kapasitas: {pantiCapacity})</label>
              <input
                type="number"
                min={1}
                max={500}
                value={reqQuantity}
                onChange={(e) => setReqQuantity(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat Urgensi Kebutuhan (Tanpa Jam)</label>
              <select
                value={reqUrgency}
                onChange={(e) => setReqUrgency(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold bg-white cursor-pointer"
              >
                <option value="Mendesak (Darurat Segera)">Mendesak (Darurat Segera)</option>
                <option value="Tinggi (Prioritas Hari Ini)">Tinggi (Prioritas Hari Ini)</option>
                <option value="Sedang (Kebutuhan Besok)">Sedang (Kebutuhan Besok)</option>
                <option value="Rendah (Kebutuhan Rutin Mingguan)">Rendah (Kebutuhan Rutin Mingguan)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferensi Penyaluran Makanan</label>
              <select
                value={reqDeliveryMethod}
                onChange={(e) => setReqDeliveryMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold bg-white cursor-pointer"
              >
                <option value="Membutuhkan Pengantaran Kurir Relawan">Membutuhkan Pengantaran Kurir Relawan</option>
                <option value="Bisa Ambil Sendiri (Self-Pickup di Toko)">Bisa Ambil Sendiri (Self-Pickup di Toko)</option>
                <option value="Fleksibel (Diantar / Ambil Sendiri)">Fleksibel (Diantar / Ambil Sendiri)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Waktu Kesiapan Menerima Makanan</label>
              <input
                type="text"
                value={reqReadyTime}
                onChange={(e) => setReqReadyTime(e.target.value)}
                placeholder="Contoh: Hari Ini, Pukul 19:30 - 20:30 WIB"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nomor WhatsApp Aktif PIC Penanggung Jawab</label>
              <input
                type="text"
                value={pantiPhone}
                onChange={(e) => setPantiPhone(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Lengkap Pengantaran Lembaga</label>
            <input
              type="text"
              value={pantiAddress}
              onChange={(e) => setPantiAddress(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Spesifikasi Kebutuhan / Alergi Anak Asuh (Opsional)</label>
            <textarea
              rows={2}
              value={reqNotes}
              onChange={(e) => setReqNotes(e.target.value)}
              placeholder="Contoh: Menghindari makanan pedas atau kacang untuk anak balita, makanan siap saji harap higienis..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setRequestModalOpen(false)} className="font-bold text-xs">
              Batal
            </Button>
            <Button type="submit" variant="gold" size="sm" className="font-black text-xs text-slate-950 py-2 px-4 shadow-xs cursor-pointer">
              Kirim & Publikasikan Permintaan ➔
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
