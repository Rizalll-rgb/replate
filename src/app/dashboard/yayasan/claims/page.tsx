'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { resolveIndonesianAddress } from '@/lib/geoResolver';
import {
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  PackageIcon,
  ShieldCheckIcon,
  TruckIcon,
  SearchIcon,
  MapIcon,
  ChatIcon,
  PhoneIcon,
  BikeIcon,
  TicketIcon,
  AlertTriangleIcon,
  PlusIcon,
  QrCodeIcon,
  BoltIcon,
  SparklesIcon,
  StarIcon,
  CameraIcon,
} from '@/components/ui/Icon';

const ITEMS_PER_PAGE = 5;

// Standardized resi code helper (Poin 6)
const genResiCode = (role: 'YYS' | 'CNS' | 'PRV' | 'RSC') =>
  `RPL-${role}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

export default function YayasanClaimsPage() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY' | 'REQUESTS'>('ACTIVE');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'SELF_PICKUP' | 'RESCUE_PARTNER'>('ALL');
  const [claimsList, setClaimsList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [myRequestsList, setMyRequestsList] = useState<any[]>([]);

  // Modal states
  const [selectedClaimModal, setSelectedClaimModal] = useState<any | null>(null);
  const [trackingModal, setTrackingModal] = useState<any | null>(null);

  // Review Modal (Poin 1)
  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; item: any | null }>({ isOpen: false, item: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });

  // Incident / Kendala Modal (Poin 2)
  const [incidentModal, setIncidentModal] = useState<{ isOpen: boolean; claim: any | null; issueType: string; description: string }>({ isOpen: false, claim: null, issueType: 'DELIVERY_LATE', description: '' });
  // Delivery Proof Documentation Modal (Poin 13)
  const [deliveryProofModal, setDeliveryProofModal] = useState<{ isOpen: boolean; claim: any | null }>({ isOpen: false, claim: null });

  // Pagination states
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);

  // SuperAppLoader (Poin 4)
  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

  // Profile data
  const [pantiName, setPantiName] = useState('Panti Asuhan Kasih Ibu');
  const [contactPerson, setContactPerson] = useState('Ibu Hajjah Maryam');
  const [pantiPhone, setPantiPhone] = useState('081234567890');
  const [pantiAddress, setPantiAddress] = useState('Jl. Raya Gubeng No. 88, Gubeng, Surabaya');
  const [dinsosReg, setDinsosReg] = useState('DINSOS-SBY-2024-881');
  const [pantiCapacity, setPantiCapacity] = useState('45 Jiwa');

  // Ajukan Kebutuhan Pangan Modal
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
  }>({ isOpen: false, message: '', type: 'success' });

  const formatFriendlyTimestamp = (val?: string) => {
    if (!val) return 'Hari ini';
    if (val.includes('T') || (val.includes('-') && val.length > 15)) {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB';
        }
      } catch (_) {}
    }
    return val;
  };

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
      }

      const savedClaims = localStorage.getItem('replate_claims');
      const activeClaims = localStorage.getItem('replate_active_claims');
      let mergedClaims: any[] = [];

      if (savedClaims) {
        try { const parsed = JSON.parse(savedClaims); if (Array.isArray(parsed)) mergedClaims = [...parsed]; } catch (_) {}
      }
      if (activeClaims) {
        try {
          const parsed = JSON.parse(activeClaims);
          if (Array.isArray(parsed)) {
            parsed.forEach((c: any) => {
              if (!mergedClaims.some((m) => m.id === c.id || m.code === c.id)) mergedClaims.push(c);
            });
          }
        } catch (_) {}
      }

      if (isFresh && mergedClaims.length === 0) {
        setClaimsList([]); setHistoryList([]); setMyRequestsList([]);
        return;
      }

      const demoActiveClaims = [
        {
          id: 'RPL-YYS-2026-8821',
          code: 'RPL-YYS-2026-8821',
          foodName: 'Roti & Kue Pastry Surplus Steril (25 Porsi)',
          provider: 'Rotiboy Bakery Surabaya',
          providerName: 'Rotiboy Bakery Surabaya',
          address: 'Grand City Mall Lt. LG, Surabaya',
          destinationAddress: 'Panti Asuhan Kasih Ibu — Jl. Raya Gubeng No. 88',
          picContact: 'Ibu Hajjah Maryam (081234567890)',
          quantity: '25 Porsi',
          method: 'RESCUE_PARTNER',
          methodLabel: 'Dikirim Kurir Komunitas Replate',
          status: 'IN_TRANSIT',
          pickupTime: 'Hari ini 20:30 WIB',
          claimedAt: 'Hari ini, 16:30 WIB',
          createdAtTimestamp: Date.now() - 45 * 60 * 1000,
          qrPayload: 'REPLATE-YYS-RPL-YYS-2026-8821-VERIFIED',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          specialInstructions: 'Harap dipisahkan dari produk kacang.',
          driverInfo: {
            name: 'Mas Fajar Santoso',
            phone: '081234567890',
            vehicle: 'Honda Vario 160 (L 4582 ABC)',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
            status: 'Relawan Logistik Terverifikasi',
            rating: '4.9',
            completedTrips: '312 Pengiriman',
          },
        },
        {
          id: 'RPL-YYS-2026-8822',
          code: 'RPL-YYS-2026-8822',
          foodName: '40 Porsi Nasi Kotak & Lauk Bergizi',
          provider: 'Warung Bakso Pak Kumis',
          providerName: 'Warung Bakso Pak Kumis',
          address: 'Jl. Kusuma Bangsa No. 42, Surabaya',
          destinationAddress: 'Panti Asuhan Kasih Ibu — Jl. Raya Gubeng No. 88',
          picContact: 'Ibu Hajjah Maryam (081234567890)',
          quantity: '40 Porsi',
          method: 'SELF_PICKUP',
          methodLabel: 'Ambil Sendiri (Self-Pickup)',
          status: 'READY_FOR_PICKUP',
          pickupTime: 'Hari ini 21:00 WIB',
          claimedAt: 'Hari ini, 17:15 WIB',
          createdAtTimestamp: Date.now() - 30 * 60 * 1000,
          qrPayload: 'REPLATE-YYS-RPL-YYS-2026-8822-VERIFIED',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          driverInfo: null,
        },
        {
          id: 'RPL-YYS-2026-8823',
          code: 'RPL-YYS-2026-8823',
          foodName: 'Paket Sembako Kering & Beras 10kg',
          provider: 'Superindo Kertajaya',
          providerName: 'Superindo Kertajaya',
          address: 'Jl. Raya Kertajaya Indah No. 15, Surabaya',
          destinationAddress: 'Panti Asuhan Kasih Ibu — Jl. Raya Gubeng No. 88',
          picContact: 'Ibu Hajjah Maryam (081234567890)',
          quantity: '10 Paket',
          method: 'RESCUE_PARTNER',
          methodLabel: 'Dikirim Kurir Komunitas (Pool Siaga)',
          status: 'WAITING_RESCUE_POOL',
          pickupTime: 'Hari ini 21:30 WIB',
          claimedAt: 'Hari ini, baru saja',
          createdAtTimestamp: Date.now() - 10 * 60 * 1000,
          qrPayload: 'REPLATE-YYS-RPL-YYS-2026-8823-VERIFIED',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          driverInfo: null,
        },
        {
          id: 'RPL-YYS-REQ-002',
          code: 'RPL-YYS-REQ-002',
          foodName: 'Bahan Pokok & Sembako Kering (10 Paket)',
          provider: 'Superindo Kertajaya',
          providerName: 'Superindo Kertajaya',
          providerPhone: '081234567890',
          providerPic: 'Bpk. Kurniawan (Store Manager)',
          address: 'Jl. Raya Kertajaya Indah No. 15, Surabaya',
          destinationAddress: 'Panti Asuhan Kasih Ibu — Jl. Raya Gubeng No. 88',
          picContact: 'Ibu Hajjah Maryam (081234567890)',
          quantity: '10 Paket',
          method: 'SELF_PICKUP',
          methodLabel: 'Ambil Sendiri (Disanggupi Donatur)',
          status: 'READY_FOR_PICKUP',
          pickupTime: 'Hari ini, hingga 21:30 WIB',
          claimedAt: 'Kemarin, 09:30 WIB',
          createdAtTimestamp: Date.now() - 60 * 60 * 1000,
          qrPayload: 'REPLATE-YYS-RPL-YYS-REQ-002-HANDOVER',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          specialInstructions: 'Permintaan telah disanggupi donatur Superindo. Tunjukkan tiket barcode QR saat handover di kasir gerai.',
          isSanctioned: true,
          driverInfo: null,
        },
      ];

      const demoHistory = [
        {
          id: 'RPL-YYS-2026-7711',
          code: 'RPL-YYS-2026-7711',
          foodName: '50 Porsi Nasi Bento Ayam Crispy',
          provider: 'Resto Bento Delight',
          providerPhone: '081234567891',
          quantity: '50 Porsi',
          deliveredAt: 'Kemarin, 21:15 WIB',
          co2Saved: '25.0 kg',
          dinsosAudit: 'TERVERIFIKASI AUDIT RESMI',
          methodLabel: 'Diantar Kurir Relawan',
          pic: 'Ibu Hajjah Maryam',
        },
        {
          id: 'RPL-YYS-2026-7712',
          code: 'RPL-YYS-2026-7712',
          foodName: '30 Porsi Sayur Sup Segar & Telur Balado',
          provider: 'Katering Sehat Bu Siti',
          providerPhone: '081234567892',
          quantity: '30 Porsi',
          deliveredAt: '2 hari lalu, 20:30 WIB',
          co2Saved: '15.0 kg',
          dinsosAudit: 'TERVERIFIKASI AUDIT RESMI',
          methodLabel: 'Ambil Sendiri',
          pic: 'Ustadz Abdullah',
        },
        {
          id: 'RPL-YYS-2026-7713',
          code: 'RPL-YYS-2026-7713',
          foodName: '45 Porsi Nasi Kotak Ayam Bakar Spesial',
          provider: 'Warung Bakso Pak Kumis',
          providerPhone: '081234567893',
          quantity: '45 Porsi',
          deliveredAt: '3 hari lalu, 19:45 WIB',
          co2Saved: '22.5 kg',
          dinsosAudit: 'TERVERIFIKASI AUDIT RESMI',
          methodLabel: 'Diantar Armada Toko',
          pic: 'Ibu Hajjah Maryam',
        },
        {
          id: 'RPL-YYS-2026-7714',
          code: 'RPL-YYS-2026-7714',
          foodName: '60 Porsi Rice Bowl & Buah Segar Higienis',
          provider: 'Dapur Berkah Surabaya',
          providerPhone: '081234567894',
          quantity: '60 Porsi',
          deliveredAt: '4 hari lalu, 20:00 WIB',
          co2Saved: '30.0 kg',
          dinsosAudit: 'TERVERIFIKASI AUDIT RESMI',
          methodLabel: 'Diantar Kurir Relawan',
          pic: 'Ibu Hajjah Maryam',
        },
      ];

      const demoRequests = [
        {
          id: 'RPL-YYS-REQ-001',
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
          id: 'RPL-YYS-REQ-002',
          code: 'RPL-YYS-REQ-002',
          foodType: 'Bahan Pokok & Sembako Kering',
          foodName: 'Bahan Pokok & Sembako Kering (10 Paket)',
          quantity: '10 Paket',
          institutionType: 'Panti Asuhan Yatim Piatu',
          urgency: 'Kebutuhan Rutin Mingguan',
          methodPreference: 'Bisa Ambil Sendiri',
          method: 'SELF_PICKUP',
          methodLabel: 'Ambil Sendiri (Self-Pickup)',
          readyTime: 'Hari ini, hingga 21:30 WIB',
          pickupTime: 'Hari ini, hingga 21:30 WIB',
          status: 'TELAH DISANGGUPI DONATUR (Menunggu Handover)',
          createdAt: 'Kemarin, 09:30 WIB',
          notes: 'Stok beras mingguan untuk asrama anak asuh.',
          provider: 'Superindo Kertajaya',
          providerName: 'Superindo Kertajaya',
          providerPhone: '081234567890',
          providerPic: 'Bpk. Kurniawan (Store Manager)',
          address: 'Jl. Raya Kertajaya Indah No. 15, Surabaya',
          destinationAddress: 'Panti Asuhan Kasih Ibu — Jl. Raya Gubeng No. 88',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          qrPayload: 'REPLATE-YYS-RPL-YYS-REQ-002-HANDOVER',
          isSanctioned: true,
        },
      ];

      // Merge any saved custom requests
      let combinedRequests = [...demoRequests];
      try {
        const mySaved = localStorage.getItem('replate_my_requests');
        if (mySaved) {
          const parsed = JSON.parse(mySaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            combinedRequests = [...parsed, ...demoRequests];
          }
        }
      } catch (_) {}

      // Merge any completed claims from mergedClaims into history
      const completedFromActive = mergedClaims.filter(
        (c) => c.status === 'COMPLETED'
      );
      const activeOnlyClaims = mergedClaims.filter(
        (c) => c.status !== 'COMPLETED'
      );

      setClaimsList(activeOnlyClaims.length > 0 ? activeOnlyClaims : demoActiveClaims);
      setHistoryList([...completedFromActive, ...demoHistory]);
      setMyRequestsList(combinedRequests);
    } catch (_) {}
  }, []);

  // Filter Normalizer
  const filteredClaims = claimsList.filter((item) => {
    if (methodFilter === 'ALL') return true;
    const m = (item.method || item.deliveryMethod || item.methodLabel || '').toUpperCase();
    if (methodFilter === 'SELF_PICKUP') return m.includes('SELF') || m.includes('PICKUP') || m.includes('AMBIL');
    if (methodFilter === 'RESCUE_PARTNER') return m.includes('RESCUE') || m.includes('PARTNER') || m.includes('COURIER') || m.includes('ANTAR') || m.includes('KOMUNITAS');
    return true;
  });

  // Pagination
  const activeTotalPages = Math.ceil(filteredClaims.length / ITEMS_PER_PAGE) || 1;
  const paginatedActiveClaims = filteredClaims.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);
  const historyTotalPages = Math.ceil(historyList.length / ITEMS_PER_PAGE) || 1;
  const paginatedHistory = historyList.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);
  const requestsTotalPages = Math.ceil(myRequestsList.length / ITEMS_PER_PAGE) || 1;
  const paginatedRequests = myRequestsList.slice((requestsPage - 1) * ITEMS_PER_PAGE, requestsPage * ITEMS_PER_PAGE);

  // Total porsi riwayat selesai dinamis (Poin 2)
  const totalHistoryPortions = historyList.reduce(
    (acc, item) => acc + (parseInt(String(item.quantity || '').replace(/\D/g, '')) || 0),
    0
  );

  // Dynamic 4-step timeline (Poin 8)
  const getDynamicTimeline = (claim: any) => {
    const claimTime = claim.claimedAt?.replace('Hari ini, ', '') || '16:30 WIB';
    const isPickup = (claim.method || '').includes('SELF') || (claim.methodLabel || '').includes('Ambil');
    const isWaitingPool = claim.status === 'WAITING_RESCUE_POOL';
    const isInTransit = claim.status === 'IN_TRANSIT';

    return [
      {
        title: 'Klaim Dikonfirmasi Donatur',
        desc: `Pesanan diterima oleh ${claim.provider || claim.providerName}`,
        time: claimTime,
        done: true,
      },
      {
        title: 'Dikemas & Lolos BPOM',
        desc: 'Uji visual & suhu 8-checklist higienitas',
        time: '+15 mnt',
        done: true,
      },
      {
        title: isPickup ? 'Siap di Kasir Gerai' : isWaitingPool ? 'Siaga di Pool Relawan' : 'Kurir Mengambil di Gerai',
        desc: isPickup
          ? 'Makanan siap diambil mandiri'
          : isWaitingPool
          ? 'Menunggu armada relawan dari pool siaga'
          : `Diambil oleh ${claim.driverInfo?.name || 'Kurir Relawan'}`,
        time: isPickup ? 'Siap' : isWaitingPool ? 'Siaga' : '+30 mnt',
        done: !isWaitingPool,
        current: isWaitingPool || (isPickup && claim.status === 'READY_FOR_PICKUP'),
      },
      {
        title: isPickup ? 'Serah Terima di Toko' : 'Dalam Perjalanan ke Panti',
        desc: isPickup ? 'Tunjukkan QR Pass ke kasir toko' : `Menuju lokasi ${pantiName}`,
        time: isPickup ? 'Menunggu' : isInTransit ? 'Estimasi Tiba' : 'Menunggu',
        done: false,
        current: isInTransit,
      },
    ];
  };

  // Form Submit Ajukan Kebutuhan (Poin 8 & Sinkronisasi Eksplor)
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoader({ isOpen: true, message: 'Mempublikasikan Kebutuhan Pangan...', submessage: 'Mengirim ke radar donatur & Smart Matching' });

    setTimeout(() => {
      const newReqId = `RPL-YYS-REQ-${Date.now().toString().slice(-6)}`;
      const newReq = {
        id: newReqId,
        code: newReqId,
        foodType: reqFoodType,
        foodName: `${reqQuantity} Porsi ${reqFoodType}`,
        quantity: `${reqQuantity} Porsi`,
        institutionType: reqInstitutionType,
        urgency: reqUrgency,
        methodPreference: reqDeliveryMethod,
        readyTime: reqReadyTime,
        status: 'DALAM RADAR DONATUR (SMART MATCHING)',
        createdAt: 'Baru saja',
        notes: reqNotes || 'Kebutuhan pangan panti asuhan terverifikasi.',
      };

      // Sinkronisasi ke modul eksplor pangan (Poin 8)
      const exploreItem = {
        id: newReqId,
        pantiName: pantiName,
        shelterType: reqInstitutionType,
        needTitle: `${reqQuantity} Porsi ${reqFoodType}`,
        requestedItem: reqFoodType,
        foodCategoryNeeded: reqFoodType.includes('Sembako') ? 'Bahan Pokok (Groceries)' : 'Makanan Olahan (Meals)',
        targetQuantity: parseInt(reqQuantity) || 45,
        fulfilledQuantity: '0 Porsi',
        beneficiariesCount: parseInt(pantiCapacity.replace(/\D/g, '')) || 45,
        urgency: reqUrgency.includes('Mendesak') || reqUrgency.includes('Tinggi') ? ('HIGH' as const) : ('MEDIUM' as const),
        urgencyLabel: reqUrgency.toUpperCase(),
        location: resolveIndonesianAddress(pantiAddress).formattedAddress || pantiAddress,
        address: pantiAddress,
        contactPerson: contactPerson,
        contactPhone: pantiPhone,
        cutoffTime: reqReadyTime,
        deadline: reqReadyTime,
        distance: '1.2 km (Area Sekitar)',
        matchScore: 95,
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
        legalStatus: `Terverifikasi Dinsos (${dinsosReg})`,
        legalPermit: dinsosReg,
        notes: reqNotes || 'Kebutuhan pangan panti asuhan terverifikasi.',
        preferredDelivery: reqDeliveryMethod.includes('Ambil') ? ('SHELTER_PICKUP' as const) : ('RESCUE_COURIER' as const),
        deliveryLabel: reqDeliveryMethod,
        deliveryDesc: reqDeliveryMethod,
        lat: resolveIndonesianAddress(pantiAddress).lat,
        lng: resolveIndonesianAddress(pantiAddress).lng,
        reasons: ['Permintaan resmi diajukan oleh pengurus panti terdaftar'],
        breakdown: [],
      };

      try {
        const savedExplore = JSON.parse(localStorage.getItem('replate_panti_requests') || '[]');
        localStorage.setItem('replate_panti_requests', JSON.stringify([exploreItem, ...savedExplore]));
        const mySaved = JSON.parse(localStorage.getItem('replate_my_requests') || '[]');
        localStorage.setItem('replate_my_requests', JSON.stringify([newReq, ...mySaved]));
      } catch (_) {}

      setMyRequestsList([newReq, ...myRequestsList]);
      setRequestModalOpen(false);
      setActiveTab('REQUESTS');
      setActionLoader({ isOpen: false, message: '' });
      setToastState({ isOpen: true, message: 'Permintaan bantuan pangan berhasil dipublikasikan ke radar donatur & modul Eksplor Pangan!', type: 'success' });
    }, 1000);
  };

  // Submit Review Beneficiary (Poin 1 - Testimoni Publik)
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.item) return;

    setActionLoader({
      isOpen: true,
      message: 'Mempublikasikan Ulasan Bantuan Pangan...',
      submessage: 'Menyinkronkan ke Galeri Testimoni Beranda Publik Replate',
    });

    setTimeout(() => {
      const newReview = {
        name: pantiName,
        role: `Pengurus Panti Asuhan (${dinsosReg})`,
        foodSaved: `Bantuan Pangan: ${reviewModal.item.foodName || reviewModal.item.title || 'Makanan Donasi'}`,
        text: reviewForm.text.trim(),
        rating: reviewForm.rating,
        date: 'Baru saja',
        isVerified: true,
      };

      try {
        const saved = JSON.parse(localStorage.getItem('replate_verified_testimonials') || '[]');
        localStorage.setItem('replate_verified_testimonials', JSON.stringify([newReview, ...saved]));
      } catch (_) {}

      setHistoryList((prev) =>
        prev.map((it) => (it.id === reviewModal.item.id ? { ...it, reviewed: true, userRating: reviewForm.rating } : it))
      );

      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Ulasan berhasil dipublikasikan dan langsung tampil di Galeri Testimoni Beranda Publik Replate!',
        type: 'success',
      });
      setReviewModal({ isOpen: false, item: null });
      setReviewForm({ rating: 5, text: '' });
    }, 1000);
  };

  // Submit Laporan Kendala (Poin 2 - Benchmark Provider)
  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketCode = `INC-YYS-${Date.now().toString().slice(-6)}`;
    setIncidentModal({ isOpen: false, claim: null, issueType: 'DELIVERY_LATE', description: '' });
    setToastState({
      isOpen: true,
      message: `Laporan Kendala #${ticketCode} tercatat! Tim Pengawas Lapangan & Satgas Pangan Replate telah menerima eskalasi untuk segera mendampingi lembaga Anda.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-16">
      <SuperAppLoader isOpen={actionLoader.isOpen} message={actionLoader.message} submessage={actionLoader.submessage} />
      <Toast isOpen={toastState.isOpen} message={toastState.message} type={toastState.type} onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))} />

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">Food Beneficiary Management</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Audit Dinsos RI: {dinsosReg}</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">Klaim & Penyaluran Pangan</h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Lembaga: <strong>{pantiName}</strong> · Kapasitas: <strong>{pantiCapacity}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button variant="gold" size="sm" leftIcon={<PlusIcon size={13} className="text-slate-950" />} className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer" onClick={() => setRequestModalOpen(true)}>
              Ajukan Kebutuhan Pangan
            </Button>
            <Link href="/dashboard/explore">
              <Button variant="outline" size="sm" leftIcon={<SearchIcon size={13} className="text-[#1B3A5C]" />} className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">
                Eksplor Pangan
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'ACTIVE', label: `Klaim Aktif (${claimsList.length})`, icon: <ClockIcon size={12} /> },
            { id: 'HISTORY', label: `Riwayat Selesai (${historyList.length})`, icon: <CheckIcon size={12} /> },
            { id: 'REQUESTS', label: `Permintaan Saya (${myRequestsList.length})`, icon: <PackageIcon size={12} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setActivePage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-[#1B3A5C] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: KLAIM AKTIF - COMPACT CARD WITH TRACKING BUTTON (Poin 1, 2) */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">Filter:</span>
            {[{ id: 'ALL', label: 'Semua' }, { id: 'SELF_PICKUP', label: 'Ambil Sendiri' }, { id: 'RESCUE_PARTNER', label: 'Kurir Komunitas' }].map((f) => (
              <button key={f.id} onClick={() => { setMethodFilter(f.id as any); setActivePage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${methodFilter === f.id ? 'bg-[#D4A843] text-slate-950 font-black shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {filteredClaims.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400"><PackageIcon size={24} /></div>
              <h4 className="font-black text-sm text-[#1B3A5C]">Tidak Ada Klaim Aktif Sesuai Filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Silakan ubah filter atau jelajahi donasi makanan gratis dari toko donatur.</p>
              <Link href="/dashboard/explore" className="inline-block pt-1">
                <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs cursor-pointer">Eksplor Donasi Food Rescue</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedActiveClaims.map((claim) => {
                const isWaitingApproval = claim.status === 'WAITING_PAYMENT_APPROVAL' || claim.status === 'AWAITING_VERIFICATION' || claim.status === 'PENDING_APPROVAL';
                const isWaitingPool = claim.status === 'WAITING_RESCUE_POOL';
                const isPickup = (claim.method || '').includes('SELF') || (claim.methodLabel || '').includes('Ambil');
                const isReady = claim.status === 'READY_FOR_PICKUP';
                const isDone = claim.status === 'COMPLETED';

                return (
                  <div key={claim.id} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all overflow-hidden">
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-black text-xs text-[#1B3A5C] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">{claim.code || claim.id}</span>
                        <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                          isWaitingApproval
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : isReady
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : isWaitingPool
                            ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                            : isDone
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          {isWaitingApproval
                            ? 'MENUNGGU APPROVAL PROVIDER'
                            : isReady
                            ? 'SIAP DIAMBIL'
                            : isWaitingPool
                            ? 'POOL RELAWAN'
                            : isDone
                            ? 'SELESAI'
                            : 'DALAM PENGIRIMAN'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0 ml-2" title="Waktu Klaim Diajukan">
                        <ClockIcon size={11} className="text-slate-300" />
                        {formatFriendlyTimestamp(claim.claimedAt)}
                      </span>
                    </div>

                    {/* Card Body - Compact Info (Poin 1) */}
                    <div className="px-4 py-3 space-y-2">
                      <h4 className="font-black text-sm text-[#1B3A5C] leading-tight">{claim.foodName}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-[10.5px]">
                        <div className="flex items-center gap-1 text-slate-500 min-w-0">
                          <ShieldCheckIcon size={10} className="text-emerald-500 shrink-0" />
                          <span className="truncate font-medium">{claim.provider || claim.providerName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 min-w-0">
                          <PackageIcon size={10} className="text-slate-400 shrink-0" />
                          <span className="font-bold text-emerald-700">{claim.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 min-w-0">
                          <ClockIcon size={10} className="text-slate-400 shrink-0" />
                          <span className="truncate">{claim.pickupTime || 'Hari ini'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 min-w-0">
                          <TruckIcon size={10} className="text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{claim.methodLabel || 'Kurir Relawan'}</span>
                        </div>
                      </div>

                      {/* Notice Menunggu Approval Provider (Poin 5) */}
                      {isWaitingApproval && (
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10.5px] text-amber-900 flex items-center gap-2">
                          <ClockIcon size={13} className="text-amber-600 shrink-0" />
                          <span>Bukti bayar sedang diverifikasi kasir provider toko. Tiket QR akan aktif setelah disetujui.</span>
                        </div>
                      )}

                      {/* Poin 1 — Destination & PIC info */}
                      {claim.destinationAddress && (
                        <div className="flex items-start gap-1 text-[10px] text-slate-500">
                          <MapPinIcon size={10} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{claim.destinationAddress}</span>
                        </div>
                      )}

                      {/* Hygiene Badge */}
                      <div className="flex items-center gap-1 text-[9.5px] text-emerald-700 font-bold">
                        <ShieldCheckIcon size={10} className="text-emerald-600" />
                        {claim.hygieneStatus || 'Lolos Audit BPOM 8-Poin'}
                      </div>
                    </div>

                    {/* Card Footer - Action Buttons (Poin 2) */}
                    <div className="px-4 pb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t border-slate-100 pt-3">
                      {/* Tracking Button - Opens Modal (Poin 1, 2, 5) */}
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={isWaitingApproval ? <ClockIcon size={12} className="text-amber-700" /> : isWaitingPool ? <BoltIcon size={12} className="text-purple-700" /> : isPickup ? <MapPinIcon size={12} className="text-amber-700" /> : <MapIcon size={12} className="text-[#1B3A5C]" />}
                        className={`flex-1 text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer ${isWaitingApproval ? 'border-amber-200 text-amber-800 hover:bg-amber-50' : isWaitingPool ? 'border-purple-200 text-purple-800 hover:bg-purple-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        onClick={() => setTrackingModal(claim)}
                      >
                        {isWaitingApproval ? 'Status Approval' : isWaitingPool ? 'Status Pool Siaga' : isPickup ? 'Info Pengambilan' : 'Lacak Pengiriman'}
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<QrCodeIcon size={12} className="text-slate-950" />}
                        className="flex-1 sm:flex-initial font-black text-xs text-slate-950 py-1.5 px-3 rounded-xl shadow-xs cursor-pointer"
                        onClick={() => setSelectedClaimModal(claim)}
                      >
                        Tiket QR Handover
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<AlertTriangleIcon size={12} className="text-red-600" />}
                        className="text-xs font-bold py-1.5 px-2.5 rounded-xl border-red-200 text-red-600 hover:bg-red-50 cursor-pointer whitespace-nowrap"
                        onClick={() => setIncidentModal({ isOpen: true, claim, issueType: 'DELIVERY_LATE', description: '' })}
                      >
                        Laporkan Kendala
                      </Button>
                    </div>
                  </div>
                );
              })}

              {activeTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">
                    <strong>{(activePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(activePage * ITEMS_PER_PAGE, filteredClaims.length)}</strong> dari <strong>{filteredClaims.length}</strong> klaim
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" disabled={activePage === 1} onClick={() => setActivePage((p) => Math.max(p - 1, 1))} className="px-2.5 py-1 text-xs font-bold">Prev</Button>
                    {Array.from({ length: activeTotalPages }).map((_, idx) => (
                      <button key={idx} onClick={() => setActivePage(idx + 1)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-colors ${activePage === idx + 1 ? 'bg-[#1B3A5C] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                        {idx + 1}
                      </button>
                    ))}
                    <Button variant="outline" size="sm" disabled={activePage === activeTotalPages} onClick={() => setActivePage((p) => Math.min(p + 1, activeTotalPages))} className="px-2.5 py-1 text-xs font-bold">Next</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RIWAYAT */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-3">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-black text-sm text-emerald-900">Rekapitulasi Penyaluran Selesai</h4>
              <p className="text-xs text-emerald-800">Seluruh bantuan makanan telah diverifikasi sesuai regulasi Dinsos & BPOM RI.</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">Total Makanan Diterima</span>
              <strong className="text-xl font-black text-emerald-900 font-mono">{totalHistoryPortions} Porsi</strong>
            </div>
          </div>
          {paginatedHistory.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <div>
                  <span className="font-mono font-bold text-[10px] text-slate-500 block">{item.code}</span>
                  <h4 className="font-black text-sm text-[#1B3A5C]">{item.foodName}</h4>
                  <p className="text-slate-600 font-medium">Donatur: <strong>{item.provider}</strong></p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-md flex items-center gap-1">
                  <CheckIcon size={10} />
                  SELESAI
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div><span className="text-slate-400 block">Jumlah Porsi:</span><strong className="text-slate-800">{item.quantity}</strong></div>
                <div><span className="text-slate-400 block">Waktu Diterima:</span><strong className="text-slate-800">{item.deliveredAt}</strong></div>
                <div><span className="text-slate-400 block">Pencegahan CO2:</span><strong className="text-emerald-600 font-black">{item.co2Saved}</strong></div>
                <div><span className="text-slate-400 block">PIC Penerima:</span><strong className="text-slate-800">{item.pic}</strong></div>
              </div>

              {/* Action Bar: Cetak Bukti & Lacak Timeline & Beri Ulasan (Poin 12 & 13) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/dashboard/yayasan/bantuan-pangan?code=${encodeURIComponent(item.code || item.id)}`} className="text-[11px] font-bold text-[#1B3A5C] hover:underline flex items-center gap-1">
                    <span>Lihat / Cetak Bukti Bantuan Resmi </span>
                  </Link>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setTrackingModal(item)}
                    className="text-[11px] font-extrabold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Lacak Alur / Timeline</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {item.reviewed ? (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-black text-[11px] flex items-center gap-1">
                      <StarIcon size={12} className="text-[#D4A843]" />
                      <span>Ulasan Terverifikasi:  {item.userRating || 5}/5</span>
                    </span>
                  ) : (
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<SparklesIcon size={12} className="text-slate-950" />}
                      className="font-black text-xs text-slate-950 py-1.5 px-3 rounded-xl shadow-xs cursor-pointer"
                      onClick={() => {
                        setReviewModal({ isOpen: true, item });
                        setReviewForm({ rating: 5, text: '' });
                      }}
                    >
                      Beri Ulasan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: PERMINTAAN SAYA */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#1B3A5C]">Daftar Kebutuhan Pangan Aktif Lembaga</h3>
            <Button variant="gold" size="sm" leftIcon={<PlusIcon size={12} className="text-slate-950" />} className="font-black text-xs text-slate-950 py-1.5 px-3 rounded-xl shadow-xs cursor-pointer" onClick={() => setRequestModalOpen(true)}>
              Ajukan Kebutuhan Baru
            </Button>
          </div>
          <div className="space-y-3">
            {paginatedRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-0.5">{req.institutionType}</span>
                    <h4 className="font-black text-sm text-[#1B3A5C]">{req.foodType}</h4>
                    <p className="text-slate-500 font-medium mt-0.5">Dipublikasikan: {req.createdAt}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-[#1B3A5C] font-black text-[10px] rounded-lg shrink-0 ml-2 text-center">{req.status}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                  <div><span className="text-slate-400 block font-medium">Target Porsi:</span><strong className="text-emerald-700 font-black">{req.quantity}</strong></div>
                  <div><span className="text-slate-400 block font-medium">Tingkat Urgensi:</span><strong className="text-amber-800 font-bold">{req.urgency}</strong></div>
                  <div><span className="text-slate-400 block font-medium">Preferensi Penyaluran:</span><strong className="text-slate-800">{req.methodPreference}</strong></div>
                </div>
                {req.notes && (
                  <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                    <strong>Catatan:</strong> {req.notes}
                  </p>
                )}

                {/* Rich Sanctioned Banner & Pickup Details (Poin 7 & 8) */}
                {req.status?.includes('TELAH DISANGGUPI') && (
                  <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-300 space-y-2.5 text-emerald-950">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2">
                      <div>
                        <span className="text-[9.5px] uppercase font-black tracking-widest text-emerald-700 block">
                          DONATUR PENYEDIA TERVERIFIKASI
                        </span>
                        <strong className="text-sm font-black text-emerald-950">{req.provider || 'Superindo Kertajaya'}</strong>
                        <p className="text-[10.5px] text-emerald-800">{req.address || 'Jl. Raya Kertajaya Indah No. 15, Surabaya'}</p>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-right self-start sm:self-auto">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">No. Resi Handover</span>
                        <span className="font-mono font-black text-xs text-[#1B3A5C]">{req.code || req.id}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-emerald-900 font-semibold">
                          Makanan telah siap di outlet! Jadwal Handover: <strong>{req.readyTime || 'Hari ini, hingga 21:30 WIB'}</strong>
                        </p>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          Tunjukkan tiket barcode QR ini kepada kasir/PIC donatur saat serah terima.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                          variant="gold"
                          size="sm"
                          leftIcon={<QrCodeIcon size={12} className="text-slate-950" />}
                          className="font-black text-xs text-slate-950 py-1.5 px-3 rounded-xl shadow-xs cursor-pointer"
                          onClick={() =>
                            setSelectedClaimModal({
                              id: req.id,
                              code: req.code || req.id,
                              foodName: req.foodName || req.foodType,
                              quantity: req.quantity,
                              provider: req.provider || 'Superindo Kertajaya',
                              providerName: req.provider || 'Superindo Kertajaya',
                              address: req.address || 'Jl. Raya Kertajaya Indah No. 15, Surabaya',
                              methodLabel: 'Ambil Sendiri (Self-Pickup Handover)',
                              hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
                            })
                          }
                        >
                          Buka Barcode & Tiket Ambil Mandiri
                        </Button>
                        <a
                          href={`https://wa.me/62${(req.providerPhone || '081234567890').replace(/^0|\D/g, '')}?text=${encodeURIComponent(
                            `Halo Donatur ${req.provider || 'Superindo'}, saya dari ${pantiName} ingin mengonfirmasi jadwal pengambilan donasi food rescue ${req.foodType} dengan resi ${req.code || req.id}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#1B3A5C] hover:bg-[#142C47] text-white rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                        >
                          <ChatIcon size={12} />
                          <span>Hubungi Donatur (WA)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TRACKING DRIVER & TIMELINE (Poin 1 & 5 - benchmark lengkap role provider) */}
      <Modal
        isOpen={!!trackingModal}
        onClose={() => setTrackingModal(null)}
        title={
          trackingModal?.status === 'WAITING_PAYMENT_APPROVAL' || trackingModal?.status === 'AWAITING_VERIFICATION'
            ? `Status Verifikasi Pembayaran: ${trackingModal?.code || trackingModal?.id}`
            : trackingModal?.status === 'WAITING_RESCUE_POOL'
            ? 'Status Pool Siaga Relawan Komunitas'
            : (trackingModal?.method || '').includes('SELF') || (trackingModal?.methodLabel || '').includes('Ambil')
            ? 'Informasi Pengambilan Mandiri di Toko'
            : `Live Tracking & Audit Logistik Resi: ${trackingModal?.code || trackingModal?.id}`
        }
        size="lg"
      >
        {trackingModal && (() => {
          const claim = trackingModal;
          const isWaitingApproval = claim.status === 'WAITING_PAYMENT_APPROVAL' || claim.status === 'AWAITING_VERIFICATION' || claim.status === 'PENDING_APPROVAL';
          const isWaitingPool = claim.status === 'WAITING_RESCUE_POOL';
          const isPickup = (claim.method || '').includes('SELF') || (claim.methodLabel || '').includes('Ambil');
          const isProviderDelivery = claim.method === 'PROVIDER_DELIVERY' || claim.method === 'PROVIDER_DIRECT';
          const timelineSteps = getDynamicTimeline(claim);

          // Contact PIC Provider
          const providerName = claim.provider || claim.providerName || 'Provider Replate';
          const providerPhone = claim.providerPhone || '081398765432';
          const providerPicName = claim.providerPic || 'Bpk. Bambang (Manager Resto)';

          // Dedicated Driver Profile (Poin 1, 4 & 6: Plottingan Toko - Baca dari localStorage)
          let plottedDriver = null;
          try {
            const plottingMap = JSON.parse(localStorage.getItem('replate_driver_plotting') || '{}');
            const claimKey = (claim.code || claim.id || '').toUpperCase();
            if (plottingMap[claimKey]) {
              plottedDriver = plottingMap[claimKey];
            }
          } catch (_) {}

          let driver = plottedDriver || claim.driverInfo || null;
          if (!driver) {
            driver = isProviderDelivery ? {
              name: claim.courierName || 'Pak Sugiono (Driver Toko)',
              phone: claim.courierPhone || '081298765432',
              vehicle: claim.courierVehicle || 'Motor Box Delivery Toko (Plat L 3319 AB)',
              photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
              status: 'Driver Internal Toko',
              rating: '4.8',
              completedTrips: '89 Pengiriman',
            } : !isPickup && !isWaitingPool ? {
              name: claim.courierName || 'Budi Santoso (Driver Ditugaskan Toko)',
              phone: claim.courierPhone || '081298765432',
              vehicle: claim.courierVehicle || 'Motor Box Cooler Steril (Plat L 8912 RC)',
              photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
              status: 'Driver Internal Toko Terverifikasi',
            } : null;
          }
          return (
            <div className="space-y-5 text-xs text-slate-800">
              {/* Header Status with High Contrast Typography */}
              <div className="p-5 bg-gradient-to-r from-[#1B3A5C] via-[#142C47] to-[#1B3A5C] text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#2C5A8F]">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                    REAL-TIME COURIER LOGISTICS TRACKING
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight drop-shadow-xs">
                    {claim.foodName} ({claim.quantity || '1 Porsi'})
                  </h3>
                  <p className="text-xs text-slate-200 font-mono">
                    Kode Resi: <strong className="text-[#D4A843] bg-slate-950/80 px-2 py-0.5 rounded">{claim.code || claim.id}</strong>
                  </p>
                </div>

                <span className="px-3.5 py-1.5 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs self-start sm:self-center flex items-center gap-1.5">
                  {claim.status === 'COMPLETED' ? (
                    <>
                      <CheckIcon size={14} />
                      <span>Tiba & Diserahkan</span>
                    </>
                  ) : isWaitingApproval ? (
                    <>
                      <ClockIcon size={14} />
                      <span>Menunggu Pembayaran</span>
                    </>
                  ) : isWaitingPool ? (
                    <>
                      <BoltIcon size={14} />
                      <span>Menunggu Relawan Siaga</span>
                    </>
                  ) : (claim.status === 'AWAITING_DRIVER_PLOTTING' || claim.status === 'WAITING_STORE_DISPATCH') ? (
                    <>
                      <ClockIcon size={14} />
                      <span>Menunggu Penugasan Driver Toko</span>
                    </>
                  ) : (isPickup || claim.status === 'READY_FOR_PICKUP') ? (
                    <>
                      <PackageIcon size={14} />
                      <span>Siap Diambil di Toko</span>
                    </>
                  ) : (
                    <>
                      <BikeIcon size={14} />
                      <span>Sedang Diantar Kurir</span>
                    </>
                  )}
                </span>
              </div>

              {/* Action Banner: Lihat Bukti Pengiriman Jika Selesai (Poin 13) */}
              {claim.status === 'COMPLETED' && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <CheckIcon size={18} className="text-emerald-700 shrink-0" />
                    <div>
                      <strong className="text-xs text-emerald-900 block font-black">
                        Penyaluran Makanan Selesai & Terverifikasi
                      </strong>
                      <span className="text-[11px] text-emerald-700">
                        Dokumentasi foto serah terima dan verifikasi penerima telah tersimpan sah di sistem.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeliveryProofModal({ isOpen: true, claim })}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>Lihat Bukti Pengiriman</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {/* Courier Profile Card (Poin 10: Hanya tampil jika driver sudah sah ditugaskan) */}
              {!isPickup && (
                isWaitingPool ? (
                  <div className="p-4 rounded-2xl border bg-amber-50/80 border-amber-200 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl text-amber-900 bg-amber-100 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                      <BikeIcon size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest block text-amber-800">
                        POOL SIAGA RELAWAN REPLATE
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Menunggu Penugasan Relawan Komunitas
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Sistem Smart Matching sedang menyiagakan relawan food rescue terdekat untuk rute penjemputan donasi Anda.
                      </p>
                    </div>
                  </div>
                ) : (isProviderDelivery && !plottedDriver && (claim.status === 'AWAITING_DRIVER_PLOTTING' || claim.status === 'WAITING_STORE_DISPATCH' || isWaitingApproval)) ? (
                  <div className="p-4 rounded-2xl border bg-blue-50/80 border-blue-200 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl text-blue-900 bg-blue-100 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                      <TruckIcon size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest block text-blue-800">
                        ARMADA DRIVER INTERNAL TOKO
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Menunggu Penugasan Driver oleh Toko
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Pihak donatur sedang menetapkan driver armada internal toko untuk mengantar pesanan ke alamat panti Anda.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isProviderDelivery ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0 ${isProviderDelivery ? 'bg-blue-600' : 'bg-purple-600'}`}>
                        {isProviderDelivery ? <TruckIcon size={22} /> : <BikeIcon size={22} />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest block ${isProviderDelivery ? 'text-blue-700' : 'text-purple-700'}`}>
                          {isProviderDelivery ? 'ARMADA DRIVER INTERNAL TOKO' : 'KURIR RELAWAN RESMI KOMUNITAS'}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {driver?.name || (isProviderDelivery ? 'Driver Toko Ditugaskan' : 'Relawan Replate Siaga')}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {driver?.vehicle || (isProviderDelivery ? 'Armada Toko Terverifikasi' : 'Motor Box Cooler Steril')}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${(driver?.phone || '081298765432').replace(/\D/g, '')}?text=${encodeURIComponent(`Halo, saya dari ${pantiName} menanyakan pengantaran donasi resi ${claim.code || claim.id}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <ChatIcon size={14} />
                      <span>Hubungi Driver (WhatsApp)</span>
                    </a>
                  </div>
                )
              )}

              {/* Status Menunggu Approval Banner (Poin 5) */}
              {isWaitingApproval && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-950">
                    <ClockIcon size={14} className="text-amber-600" />
                    <span>Status: Menunggu Konfirmasi & Approval Pembayaran</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Bukti transfer atau QRIS telah terkirim ke kasir toko donatur ({providerName}). Setelah kasir menyetujui, surat jalan dan kurir logistik akan langsung diterbitkan secara otomatis.
                  </p>
                </div>
              )}

              {/* RUTE PENJEMPUTAN & PENERIMA (Benchmark Provider) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 font-semibold block text-[10px]">Titik Penjemputan (Toko Donatur):</span>
                  <strong className="text-[#1B3A5C] block text-xs">{providerName}</strong>
                  <p className="text-[10.5px] text-slate-600 truncate">{claim.address || 'Surabaya'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">PIC: {providerPicName} ({providerPhone})</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 font-semibold block text-[10px]">Titik Tujuan Penyaluran (Panti Anda):</span>
                  <strong className="text-emerald-800 block text-xs">{pantiName}</strong>
                  <p className="text-[10.5px] text-slate-600 truncate">{claim.destinationAddress || pantiAddress}</p>
                  <p className="text-[10px] text-slate-500">PIC Panti: {contactPerson} ({pantiPhone})</p>
                </div>
              </div>

              {/* Checkpoint Timeline */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#1B3A5C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ClockIcon size={14} className="text-[#1B3A5C]" />
                  <span>Timeline Status Logistik Terverifikasi</span>
                </span>
                <div className="space-y-3 pl-2 border-l-2 border-slate-300 text-xs">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative pl-4">
                      <span className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${
                        step.done ? 'bg-emerald-500 ring-4 ring-emerald-100' :
                        step.current ? 'bg-blue-500 ring-4 ring-blue-100 animate-pulse' :
                        'bg-slate-300'
                      }`}></span>
                      <strong className={`block ${step.done ? 'text-slate-900' : step.current ? 'text-blue-950' : 'text-slate-400'}`}>
                        {step.title}
                      </strong>
                      <span className="text-slate-500 text-[11px]">
                        {step.time} • {step.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BPOM Audit */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
                <ShieldCheckIcon size={16} className="text-emerald-600 shrink-0" />
                <div className="text-[11px] leading-snug text-emerald-900">
                  <strong className="block font-black">Audit Higienitas Terjamin</strong>
                  <span className="font-medium">{claim.hygieneStatus || 'LOLOS AUDIT BPOM 8-POIN'} — Standar Dinsos RI Terverifikasi</span>
                </div>
              </div>

              {/* Action Buttons: Live GPS, Tutup, & Laporkan Kendala (Poin 2 - Benchmark Provider) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<AlertTriangleIcon size={13} className="text-red-600" />}
                  className="font-bold text-xs text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={() => {
                    const target = trackingModal;
                    setTrackingModal(null);
                    setIncidentModal({
                      isOpen: true,
                      claim: target,
                      issueType: 'DELIVERY_LATE',
                      description: '',
                    });
                  }}
                >
                  Laporkan Kendala / Insiden Pengantaran 
                </Button>

                <div className="flex items-center gap-2 flex-1 sm:justify-end">
                  <Link href="/dashboard/tracking" className="flex-1 sm:flex-initial">
                    <Button variant="outline" size="sm" leftIcon={<MapIcon size={12} />} className="w-full text-xs font-bold border-[#1B3A5C] text-[#1B3A5C] hover:bg-[#1B3A5C]/5 cursor-pointer">
                      Live GPS
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold text-xs flex-1 sm:flex-initial"
                    onClick={() => setTrackingModal(null)}
                  >
                    Tutup Lacak Pengiriman
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* MODAL TIKET QR HANDOVER (Poin 7) */}
      <Modal isOpen={!!selectedClaimModal} onClose={() => setSelectedClaimModal(null)} title="Tiket Digital Serah Terima QR Manifest" size="md">
        {selectedClaimModal && (
          <div className="space-y-4 text-xs">
            <div className="p-5 bg-gradient-to-br from-slate-50 to-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 text-center space-y-3">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">SCAN QR SAAT HANDOVER MAKANAN</span>
              <div className="flex justify-center py-1">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
                  <QRGenerator
                    value={`REPLATE-YYS-${selectedClaimModal.code || selectedClaimModal.id}`}
                    foodName={selectedClaimModal.foodName}
                    portions={selectedClaimModal.quantity}
                    providerName={selectedClaimModal.provider || selectedClaimModal.providerName}
                    deliveryMethod={selectedClaimModal.method || selectedClaimModal.deliveryMethod}
                    recipientName={pantiName}
                    picPanti={contactPerson}
                    courierName={selectedClaimModal.courierName || selectedClaimModal.driverInfo?.name || (selectedClaimModal.method === 'PROVIDER_DELIVERY' ? 'Pak Sugiono (Driver Toko)' : undefined)}
                    courierVehicle={selectedClaimModal.courierVehicle || selectedClaimModal.driverInfo?.vehicle || (selectedClaimModal.method === 'PROVIDER_DELIVERY' ? 'Motor Box Delivery (L 3319 AB)' : undefined)}
                    courierPhone={selectedClaimModal.courierPhone || selectedClaimModal.driverInfo?.phone || (selectedClaimModal.method === 'PROVIDER_DELIVERY' ? '081298765432' : undefined)}
                  />
                </div>
              </div>
              <span className="font-mono font-black text-sm text-[#1B3A5C] block">{`REPLATE-YYS-${selectedClaimModal.code || selectedClaimModal.id}`}</span>
              <p className="text-[11px] text-slate-500 font-medium leading-tight max-w-xs mx-auto">Tunjukkan barcode QR ini kepada kasir toko donatur atau driver saat makanan diserahkan.</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              {[
                { label: 'Menu Surplus', value: selectedClaimModal.foodName },
                { label: 'Jumlah Alokasi', value: selectedClaimModal.quantity },
                { label: 'Penyedia Donatur', value: selectedClaimModal.provider || selectedClaimModal.providerName },
                { label: 'Metode Penyaluran', value: selectedClaimModal.methodLabel || 'Kurir Komunitas' },
                { label: 'Lokasi Pickup', value: selectedClaimModal.address },
              ].map((row) => (
                <div key={row.label} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-slate-500 font-medium">{row.label}:</span>
                  <strong className="text-slate-800 font-bold text-right max-w-[200px] truncate">{row.value}</strong>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
              <ShieldCheckIcon size={18} className="text-emerald-600 shrink-0" />
              <div className="text-[11px] leading-snug text-emerald-900">
                <strong className="block font-black">Audit Kualitas Terjamin</strong>
                <span className="font-medium text-emerald-800">{selectedClaimModal.hygieneStatus || 'LOLOS AUDIT BPOM 8-POIN'} — Dinsos RI Terverifikasi</span>
              </div>
            </div>

            <Button variant="primary" size="sm" className="w-full font-black py-2.5 text-xs shadow-xs cursor-pointer" onClick={() => setSelectedClaimModal(null)}>
              Tutup Tiket
            </Button>
          </div>
        )}
      </Modal>

      {/* MODAL AJUKAN KEBUTUHAN PANGAN KOMPREHENSIF (Poin 1, 8) */}
      <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} title="Formulir Kebutuhan Bantuan Pangan Lembaga" size="lg">
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          {/* Header Card - no emoji (Poin 8) */}
          <div className="p-4 bg-[#1B3A5C] rounded-2xl text-white space-y-1">
            <div className="flex items-center gap-2">
              <BoltIcon size={14} className="text-[#D4A843]" />
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest">PUBLIKASI RADAR DONATUR & SMART MATCHING 2.0</span>
            </div>
            <h3 className="font-black text-sm sm:text-base text-white">Pengajuan Kebutuhan Pangan {pantiName}</h3>
            <p className="text-[11px] text-slate-200 leading-snug">Data dicocokkan ke toko donatur & katering terdekat untuk makanan surplus bernutrisi tinggi.</p>
          </div>

          {/* Auto-filled Identity (Poin 1) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div><span className="text-slate-400 block font-medium">Lembaga Pemohon:</span><strong className="text-[#1B3A5C] font-black">{pantiName}</strong></div>
            <div><span className="text-slate-400 block font-medium">Legalitas Dinsos RI:</span><strong className="text-emerald-700 font-black">{dinsosReg}</strong></div>
            <div><span className="text-slate-400 block font-medium">Kategori Lembaga:</span><strong className="text-slate-800 font-bold">{reqInstitutionType}</strong></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Kebutuhan Makanan</label>
              <select value={reqFoodType} onChange={(e) => setReqFoodType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold bg-white cursor-pointer">
                <option>Makanan Berat Siap Santap Bergizi</option>
                <option>Bahan Pokok & Sembako Kering</option>
                <option>Roti, Pastry & Kudapan Sehat</option>
                <option>Susu, Buah Segar & Suplemen Balita</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Jumlah Porsi (Kapasitas: {pantiCapacity})</label>
              <input type="number" min={1} max={500} value={reqQuantity} onChange={(e) => setReqQuantity(e.target.value)} required className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat Urgensi Kebutuhan</label>
              <select value={reqUrgency} onChange={(e) => setReqUrgency(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold bg-white cursor-pointer">
                <option>Mendesak (Darurat Segera)</option>
                <option>Tinggi (Prioritas Hari Ini)</option>
                <option>Sedang (Kebutuhan Besok)</option>
                <option>Rendah (Kebutuhan Rutin Mingguan)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferensi Penyaluran Makanan</label>
              <select value={reqDeliveryMethod} onChange={(e) => setReqDeliveryMethod(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold bg-white cursor-pointer">
                <option>Membutuhkan Pengantaran Kurir Relawan</option>
                <option>Bisa Ambil Sendiri (Self-Pickup di Toko)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Waktu Kesiapan Menerima Makanan</label>
              <input type="text" value={reqReadyTime} onChange={(e) => setReqReadyTime(e.target.value)} placeholder="Contoh: Hari Ini, Pukul 19:30 - 20:30 WIB" required className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">No. WhatsApp Aktif PIC Penanggung Jawab</label>
              <input type="text" value={pantiPhone} onChange={(e) => setPantiPhone(e.target.value)} required className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Lengkap Pengantaran Lembaga</label>
            <input type="text" value={pantiAddress} onChange={(e) => setPantiAddress(e.target.value)} required className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-semibold" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Spesifikasi / Alergi Anak Asuh (Opsional)</label>
            <textarea rows={2} value={reqNotes} onChange={(e) => setReqNotes(e.target.value)} placeholder="Contoh: Menghindari makanan pedas atau kacang untuk anak balita..." className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]" />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setRequestModalOpen(false)} className="font-bold text-xs">Batal</Button>
            <Button type="submit" variant="gold" size="sm" leftIcon={<BoltIcon size={12} className="text-slate-950" />} className="font-black text-xs text-slate-950 py-2 px-4 shadow-xs cursor-pointer">
              Kirim & Publikasikan Permintaan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL ULASAN / REVIEW (Poin 1 - Sinkronisasi Testimoni Publik) */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, item: null })}
        title="Beri Ulasan Bantuan Pangan"
        size="md"
      >
        {reviewModal.item && (
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
              <span className="font-black text-amber-900 block text-xs">
                Bantuan: {reviewModal.item.foodName} ({reviewModal.item.quantity})
              </span>
              <p className="text-amber-800 font-medium text-[11px]">
                Donatur: <strong>{reviewModal.item.provider}</strong> • No. Resi: <span className="font-mono font-bold">{reviewModal.item.code}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Rating Kepuasan & Kualitas Makanan:</label>
              <div className="flex gap-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all cursor-pointer flex items-center gap-1 ${
                      reviewForm.rating === star
                        ? 'bg-[#D4A843] text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <StarIcon size={12} className={reviewForm.rating === star ? 'text-slate-950' : 'text-amber-400'} />
                    <span>{star} Bintang</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Testimoni & Pengalaman Penyaluran:</label>
              <textarea
                rows={4}
                required
                placeholder="Ceritakan bagaimana bantuan makanan ini membantu kebutuhan pangan dan nutrisi anak-anak asuh di panti Anda..."
                value={reviewForm.text}
                onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
              />
              <p className="text-[10px] text-slate-400">
                Ulasan ini akan ditayangkan secara publik di Galeri Testimoni Beranda Utama Replate sebagai bukti transparansi donasi food rescue.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setReviewModal({ isOpen: false, item: null })}>
                Batal
              </Button>
              <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950 cursor-pointer shadow-xs">
                Kirim & Publikasikan Ulasan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL LAPOR KENDALA / INSIDEN (Poin 2 - Benchmark Lengkap Role Provider) */}
      {incidentModal.isOpen && (
        <Modal
          isOpen={incidentModal.isOpen}
          onClose={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'DELIVERY_LATE', description: '' })}
          title={`Pusat Pelaporan Kendala Bantuan Pangan: ${incidentModal.claim?.code || incidentModal.claim?.id || 'Klaim'}`}
          size="lg"
        >
          <form onSubmit={handleSubmitIncident} className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block">
                SOP PENANGANAN DARURAT BANTUAN PANGAN & DRIVER (BENEFICIARY ESCALATION)
              </span>
              <h4 className="text-sm font-black text-red-950">
                Penyelesaian Kendala Resi {incidentModal.claim?.code || incidentModal.claim?.id} ({incidentModal.claim?.foodName})
              </h4>
              <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                Setiap laporan dipantau langsung oleh Koordinator Wilayah & Pengawas Higienitas BPOM Replate untuk memastikan keamanan nutrisi penerima manfaat.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Kategori Kendala Operasional (Role Beneficiary / Panti):</label>
              <select
                value={incidentModal.issueType}
                onChange={(e) => setIncidentModal({ ...incidentModal, issueType: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-[#1B3A5C] focus:ring-2 focus:ring-[#D4A843]"
              >
                <option value="DELIVERY_LATE">1. Driver / Kurir Terlambat Tiba &gt;45 Menit dari Jadwal Estimasi</option>
                <option value="PORTION_MISMATCH">2. Porsi Donasi Tidak Sesuai / Makanan Kurang dari Alokasi</option>
                <option value="PACKAGING_DAMAGED">3. Kemasan Makanan Rusak / Bocor / Wadah Makanan Pecah</option>
                <option value="COURIER_UNREACHABLE">4. Driver Relawan / Armada Toko Tidak Dapat Dihubungi via WA</option>
                <option value="OUTLET_PICKUP_REJECTED">5. Kasir Toko Menolak Serah Terima Makanan Saat Pengambilan Mandiri</option>
                <option value="FOOD_QUALITY_ISSUE">6. Kualitas / Suhu Makanan Tidak Higienis (Tidak Layak Konsumsi)</option>
                <option value="QR_PASS_REJECTED">7. Barcode Tiket QR Serah Terima Gagal Terbaca oleh Kasir</option>
                <option value="OTHER">8. Kendala Operasional Penyaluran Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Lokasi atau Posisi Terakhir Panti / Titik Pengambilan:</label>
              <input
                type="text"
                defaultValue={pantiAddress}
                placeholder="Contoh: Jl. Raya Gubeng No. 88, Surabaya"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#D4A843]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Rincian Kronologi Masalah yang Terjadi:</label>
              <textarea
                rows={3}
                required
                placeholder="Jelaskan secara ringkas kendala yang dialami pengurus panti..."
                value={incidentModal.description}
                onChange={(e) => setIncidentModal({ ...incidentModal, description: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#D4A843]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'DELIVERY_LATE', description: '' })}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Kirim Laporan Eskalasi
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL BUKTI PENGIRIMAN & SERAH TERIMA (Poin 13) */}
      {deliveryProofModal.isOpen && (
        <Modal
          isOpen={deliveryProofModal.isOpen}
          onClose={() => setDeliveryProofModal({ isOpen: false, claim: null })}
          title={`Bukti Pengiriman & Serah Terima: ${deliveryProofModal.claim?.code || deliveryProofModal.claim?.id || ''}`}
          size="md"
        >
          {deliveryProofModal.claim && (() => {
            const claim = deliveryProofModal.claim;
            return (
              <div className="space-y-4 text-xs text-slate-800">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckIcon size={18} />
                  </div>
                  <div>
                    <strong className="text-emerald-950 font-black text-xs block">
                      Serah Terima Sukses & Terverifikasi
                    </strong>
                    <span className="text-[11px] text-emerald-800">
                      Diserahkan pada {claim.deliveredAt || '17:15 WIB'} · Lolos verifikasi kode QR
                    </span>
                  </div>
                </div>

                {/* Foto Dokumentasi */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-900 block text-[11px]">
                    Foto Dokumentasi Serah Terima Pangan:
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center group">
                    <img
                      src={claim.proofImage || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80'}
                      alt="Bukti Serah Terima"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                      <span className="text-white text-[10px] font-bold inline-flex items-center gap-1">
                        <MapPinIcon size={12} className="text-rose-400 shrink-0" />
                        <span>Titik Serah Terima: {claim.destinationAddress || pantiAddress}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detail Penerima & Catatan Serah Terima */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Nama Penerima:</span>
                    <strong className="text-slate-900">{claim.pic || contactPerson || 'Pengurus Panti Asuhan'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Diserahkan Oleh:</span>
                    <strong className="text-slate-900">{claim.driverInfo?.name || claim.courierName || 'Armada Driver / Relawan'}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-400 block font-medium">Catatan / Kondisi Makanan:</span>
                    <p className="text-slate-700 font-medium">
                      {claim.deliveryNotes || 'Paket bantuan pangan diterima lengkap dalam kondisi hangat, kemasan higienis utuh, dan sesuai porsi alokasi.'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <Link
                    href={`/dashboard/yayasan/bantuan-pangan?code=${encodeURIComponent(claim.code || claim.id)}`}
                    className="text-xs font-bold text-[#1B3A5C] hover:underline flex items-center gap-1"
                  >
                    <span>Buka Dokumen Bukti Bantuan Pangan</span>
                    <span>→</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeliveryProofModal({ isOpen: false, claim: null })}
                    className="text-xs font-bold"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
