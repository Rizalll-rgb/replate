'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { useSession } from 'next-auth/react';

export default function ProviderOverviewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeSurplusCount, setActiveSurplusCount] = useState<number>(2);
  const [completedClaimsCount, setCompletedClaimsCount] = useState<number>(3);
  const [totalRescuedKg, setTotalRescuedKg] = useState<number>(42.5);
  const [providerName, setProviderName] = useState<string>('Warung Bakso Pak Kumis');
  const [todayFormatted, setTodayFormatted] = useState<string>('');

  // Available Surplus Products from Provider Catalog
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  // Smart Matching Formula Modal State
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [selectedPantiForFormula, setSelectedPantiForFormula] = useState<any | null>(null);

  // Selected Shelter Profile Detail Modal State
  const [selectedShelterProfile, setSelectedShelterProfile] = useState<any | null>(null);

  // In-Workspace Instant Donation Allocation Modal State
  const [allocateModal, setAllocateModal] = useState<{
    isOpen: boolean;
    panti: any | null;
    selectedFoodId: string;
    portions: number;
    deliveryMethod: string;
    hygieneChecked: boolean;
  }>({
    isOpen: false,
    panti: null,
    selectedFoodId: '',
    portions: 30,
    deliveryMethod: 'RESCUE_COURIER',
    hygieneChecked: true,
  });

  // Success Issued QR Resi Modal State
  const [issuedTicketModal, setIssuedTicketModal] = useState<{
    isOpen: boolean;
    ticketData: any | null;
  }>({
    isOpen: false,
    ticketData: null,
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Smart Matching Priority Preference Filter (Poin 1 & 13)
  const [matchingPriorityFilter, setMatchingPriorityFilter] = useState<'OVERALL' | 'DISTANCE' | 'URGENCY' | 'CAPACITY'>('OVERALL');

  // Dynamic Daily Matched Panti List with Realistic Surabaya Geofencing
  const matchedPantiList = [
    {
      id: 'PNT-SBY-001',
      pantiName: 'Panti Asuhan Kasih Ibu Surabaya',
      shelterType: 'Panti Asuhan Anak Yatim',
      needTitle: '50 Porsi Nasi Kotak & Lauk Bergizi',
      distance: '1.2 km (Dharmawangsa, Gubeng)',
      matchScore: 96,
      urgency: 'URGENT MAKAN MALAM HARI INI',
      cutoffTime: '19:30 WIB',
      contactPerson: 'Ibu Hajjah Maryam',
      contactPhone: '081298765432',
      address: 'Jl. Dharmawangsa No. 24, Airlangga, Gubeng, Surabaya',
      preferredDelivery: 'RESCUE_COURIER',
      deliveryLabel: '🛵 Diantar Food Rescue Courier (Komunitas Relawan Food Bank Surabaya)',
      deliveryDesc: 'Panti tidak memiliki armada penjemputan, sehingga sistem menugaskan kurir relawan motor box steril.',
      beneficiariesCount: 45,
      legalStatus: 'Terverifikasi Dinsos Jatim',
      legalPermit: 'DINSOS-SBY/2023/8912',
      notes: 'Membutuhkan 40-50 porsi nasi lauk pauk bergizi untuk makan malam anak-anak panti.',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
      lat: -7.2710,
      lng: 112.7580,
      reasons: [
        'Radius GPS 1.2 km dari outlet Gubeng (Proksimitas sangat tinggi)',
        'Kebutuhan gizi lauk pauk protein cocok dengan menu surplus Anda',
        'Batas penjemputan sebelum 19:30 WIB (Kurir relawan siaga di area Gubeng)',
      ],
      breakdown: [
        { label: 'Proksimitas Geofencing GPS', score: 35, max: 35, desc: 'Radius 1.2 km dari outlet Gubeng' },
        { label: 'Kesesuaian Kategori Pangan', score: 28, max: 30, desc: 'Menu protein siap santap memenuhi kebutuhan panti' },
        { label: 'Urgensi Waktu Konsumsi', score: 19, max: 20, desc: 'Batas penjemputan < 2.5 jam (Makan Malam)' },
        { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Tervalidasi Halal BPJPH & Dapur Higienis' },
      ],
    },
    {
      id: 'PNT-SBY-002',
      pantiName: 'Shelter Dhuafa & Anak Jalanan Genteng',
      shelterType: 'Shelter & Rumah Singgah',
      needTitle: '60 Porsi Makanan Siap Santap / Prasmanan',
      distance: '3.4 km (Genteng Kali, Surabaya Pusat)',
      matchScore: 89,
      urgency: 'URGENT DISTRIBUSI MALAM',
      cutoffTime: '21:00 WIB',
      contactPerson: 'Mas Dedi Relawan',
      contactPhone: '081567890123',
      address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
      preferredDelivery: 'PROVIDER_DIRECT',
      deliveryLabel: '🚚 Diantar Armada Toko Provider / Ambil Mandiri Oleh Pengurus',
      deliveryDesc: 'Pengurus shelter memiliki kendaraan roda 3 dan siap mengambil mandiri ke outlet.',
      beneficiariesCount: 25,
      legalStatus: 'Terverifikasi Pemkot Surabaya',
      legalPermit: 'DINSOS-SBY/2024/1109',
      notes: 'Membutuhkan porsi makanan surplus siap santap untuk pembagian malam relawan.',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=60',
      lat: -7.2560,
      lng: 112.7420,
      reasons: [
        'Jarak tempuh 3.4 km (Gubeng menuju Genteng Pusat)',
        'Kebutuhan shelter 60 porsi (Bisa dipenuhi sebagian atau penuh)',
        'Pengurus siap mengambil mandiri ke outlet sebelum 21:00 WIB',
      ],
      breakdown: [
        { label: 'Proksimitas Geofencing GPS', score: 32, max: 35, desc: 'Radius 3.4 km dari toko Gubeng' },
        { label: 'Kesesuaian Kategori Pangan', score: 25, max: 30, desc: 'Kecukupan porsi 65% terpenuhi' },
        { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan < 3.5 jam' },
        { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Terkemas steril food grade' },
      ],
    },
    {
      id: 'PNT-SBY-003',
      pantiName: 'Yayasan Yatim Dhuafa Insan Cemerlang',
      shelterType: 'Panti Asuhan & Pusat Belajar',
      needTitle: '35 Porsi Roti & Susu Nutrisi Sehat',
      distance: '2.6 km (Manyar Kertoarjo, Surabaya Timur)',
      matchScore: 92,
      urgency: 'DISTRIBUSI NUTRISI SORE',
      cutoffTime: '20:00 WIB',
      contactPerson: 'Ustadz Ahmad',
      contactPhone: '081277889900',
      address: 'Jl. Manyar Kertoarjo No. 12, Mulyorejo, Surabaya',
      preferredDelivery: 'RESCUE_COURIER',
      deliveryLabel: '🛵 Diantar Food Rescue Courier (Komunitas Relawan Food Bank Surabaya)',
      deliveryDesc: 'Kurir relawan motor box pendingin siap mengantar langsung ke panti.',
      beneficiariesCount: 35,
      legalStatus: 'Terverifikasi Dinsos Jatim',
      legalPermit: 'DINSOS-SBY/2024/0912',
      notes: 'Membutuhkan 30-35 paket snack roti & susu sehat untuk santri panti.',
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=60',
      lat: -7.2810,
      lng: 112.7720,
      reasons: [
        'Radius 2.6 km dari outlet Gubeng ke Manyar Kertoarjo',
        'Kebutuhan nutrisi roti / menu sehat sangat cocok',
        'Kurir relawan siaga di koridor Kertajaya - Manyar',
      ],
      breakdown: [
        { label: 'Proksimitas Geofencing GPS', score: 34, max: 35, desc: 'Radius 2.6 km dari toko' },
        { label: 'Kesesuaian Kategori Pangan', score: 26, max: 30, desc: 'Kategori makanan sehat cocok' },
        { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan jam 20:00 WIB' },
        { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Higienis & Halal' },
      ],
    },
    {
      id: 'PNT-SBY-004',
      pantiName: 'Panti Asuhan Balita Kasih Bunda',
      shelterType: 'Panti Asuhan Bayi & Balita',
      needTitle: '40 Kotak Susu Formula Balita & Biskuit Nutrisi Bayi',
      distance: '1.8 km (Kertajaya Indah, Gubeng)',
      matchScore: 35,
      urgency: 'URGENT NUTRISI BALITA',
      cutoffTime: '19:00 WIB',
      contactPerson: 'Suster Yohana',
      contactPhone: '081399887766',
      address: 'Jl. Kertajaya Indah No. 56, Gubeng, Surabaya',
      preferredDelivery: 'RESCUE_COURIER',
      deliveryLabel: '🛵 Diantar Food Rescue Courier (Motor Box Cooler Steril Khusus)',
      deliveryDesc: 'Wajib kurir dengan thermal box dingin untuk produk susu steril & biskuit bayi.',
      beneficiariesCount: 20,
      legalStatus: 'Terverifikasi Dinsos Jatim',
      legalPermit: 'DINSOS-SBY/2024/0411',
      notes: 'Khusus membutuhkan susu formula balita 1-3 tahun dan biskuit bubur bayi. Bukan makanan pedas/lauk berat.',
      imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=60',
      lat: -7.2790,
      lng: 112.7610,
      reasons: [
        'Radius 1.8 km dari outlet Gubeng',
        'Kebutuhan SPESIFIK: Susu Formula Balita & Makanan Lembut Bayi',
        'Perlu validasi ketat kecocokan kategori gizi',
      ],
      breakdown: [
        { label: 'Proksimitas Geofencing GPS', score: 35, max: 35, desc: 'Radius 1.8 km dari toko' },
        { label: 'Kesesuaian Kategori Pangan', score: 5, max: 30, desc: 'Kategori susu formula khusus balita' },
        { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan 19:00 WIB' },
        { label: 'Standar Higienitas BPOM & Halal', score: 15, max: 15, desc: 'Steril & Segel Pabrik' },
      ],
    },
  ];

  useEffect(() => {
    // Dynamic Date
    const now = new Date();
    const formatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setTodayFormatted(formatted);

    // Profile & Name
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setProviderName(parsed.entityName);
      }
    } catch (_) {}

    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
    } catch (_) {}

    let localClaims: any[] = [];
    try {
      localClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
    } catch (_) {}

    const isFresh = typeof window !== 'undefined' && localStorage.getItem('replate_is_fresh_account') === 'true';

    // Build available product list for allocation modal
    const defaultCatalog = [
      {
        id: 'SRP-101',
        foodName: 'Bakso Sapi Komplit & Tahu Bakso',
        category: 'MEALS',
        quantity: 25,
        remainingQuantity: 25,
        quantityUnit: 'porsi',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=60',
        freshUntil: 'Hari ini 21:00 WIB',
      },
      {
        id: 'SRP-102',
        foodName: 'Nasi Kotak Ayam Bakar Bumbu Rujak',
        category: 'MEALS',
        quantity: 35,
        remainingQuantity: 35,
        quantityUnit: 'porsi',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60',
        freshUntil: 'Hari ini 20:30 WIB',
      },
      {
        id: 'SRP-103',
        foodName: 'Aneka Roti Bakery & Pastry Box',
        category: 'BAKERY',
        quantity: 20,
        remainingQuantity: 20,
        quantityUnit: 'box',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60',
        freshUntil: 'Hari ini 22:00 WIB',
      },
    ];

    if (isFresh) {
      const activeItems = localItems.filter((item) => item.status === 'AVAILABLE' || !item.status);
      setActiveSurplusCount(activeItems.length);
      setAvailableProducts(activeItems);

      const calculatedWeight = localItems.reduce((acc, curr) => {
        const qty = Number(curr.quantity || 15);
        const weightUnit = Number(curr.weightPerUnitKg || 0.4);
        return acc + qty * weightUnit;
      }, 0);
      setTotalRescuedKg(Math.round(calculatedWeight * 10) / 10);

      const completedFromClaims = localClaims.filter(
        (c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED'
      ).length;
      setCompletedClaimsCount(completedFromClaims);
      return;
    }

    // Default showcase data
    const combinedProducts = localItems.length > 0 ? [...localItems, ...defaultCatalog] : defaultCatalog;
    setAvailableProducts(combinedProducts);

    fetch('/api/surplus?status=')
      .then((res) => res.json())
      .then((data) => {
        let itemsList: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          itemsList = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          itemsList = data.data;
        }

        const combined = [...localItems, ...itemsList];
        const activeItems = combined.filter((item) => item.status === 'AVAILABLE' || !item.status);
        if (activeItems.length > 0) {
          setActiveSurplusCount(activeItems.length);
          setAvailableProducts(activeItems);
        }

        const calculatedWeight = combined.reduce((acc, curr) => {
          const qty = Number(curr.quantity || 15);
          const weightUnit = Number(curr.weightPerUnitKg || 0.4);
          return acc + qty * weightUnit;
        }, 0);

        if (calculatedWeight > 0) {
          setTotalRescuedKg(Math.round(calculatedWeight * 10) / 10);
        }
      })
      .catch(() => {
        if (localItems.length > 0) {
          setActiveSurplusCount(localItems.length);
        }
      });

    const completedFromClaims = localClaims.filter(
      (c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED'
    ).length;
    setCompletedClaimsCount(2 + completedFromClaims);
  }, [session]);

  const handleOpenAllocationModal = (panti: any) => {
    const firstProduct = availableProducts[0] || { id: 'SRP-101', quantity: 30, remainingQuantity: 30 };
    const maxPortions = Number(firstProduct.remainingQuantity || firstProduct.quantity || 30);
    const initialPortions = Math.min(30, maxPortions);

    setAllocateModal({
      isOpen: true,
      panti,
      selectedFoodId: firstProduct.id,
      portions: initialPortions,
      deliveryMethod: panti.preferredDelivery || 'RESCUE_COURIER',
      hygieneChecked: true,
    });
  };

  const handleProductSelectChange = (foodId: string) => {
    const selected = availableProducts.find((p) => p.id === foodId);
    const maxQty = selected ? Number(selected.remainingQuantity || selected.quantity || 30) : 30;
    setAllocateModal((prev) => ({
      ...prev,
      selectedFoodId: foodId,
      portions: Math.min(prev.portions, maxQty) || maxQty,
    }));
  };

  const handleConfirmAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateModal.panti) return;

    if (!allocateModal.hygieneChecked) {
      alert('Anda wajib menyetujui konfirmasi 8-Poin SOP Higienitas BPOM RI.');
      return;
    }

    const selectedProduct = availableProducts.find((p) => p.id === allocateModal.selectedFoodId) || {
      foodName: 'Nasi Paket Ayam Bakar & Lauk Bersih',
      id: 'SRP-102',
    };

    const currentYear = new Date().getFullYear();
    const ticketCode = `RPL-REQ-${currentYear}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newClaim = {
      id: ticketCode,
      code: ticketCode,
      claimCode: ticketCode,
      foodName: selectedProduct.foodName,
      userName: `${allocateModal.panti.pantiName} (Yayasan)`,
      customerName: allocateModal.panti.pantiName,
      recipientPerson: allocateModal.panti.contactPerson,
      recipientPhone: allocateModal.panti.contactPhone,
      recipientType: 'Panti Asuhan Anak / Yayasan Sosial',
      quantity: `${allocateModal.portions} Porsi`,
      quantityUnit: 'Porsi',
      amountPaid: 0,
      totalPrice: 0,
      status: allocateModal.panti.preferredDelivery === 'RESCUE_COURIER' ? 'AWAITING_RESCUE_PICKUP' : 'READY_FOR_PICKUP',
      deliveryMethod: allocateModal.panti.preferredDelivery,
      courierName: allocateModal.panti.preferredDelivery === 'RESCUE_COURIER' ? 'Budi Santoso (Relawan ID #RC-881)' : 'Pengurus Panti (Ambil Mandiri)',
      courierOrg: allocateModal.panti.preferredDelivery === 'RESCUE_COURIER' ? 'Food Bank Surabaya Logistik' : 'Armada Panti Asuhan',
      courierPhone: allocateModal.panti.preferredDelivery === 'RESCUE_COURIER' ? '0812-9876-5432' : allocateModal.panti.contactPhone,
      courierVehicle: allocateModal.portions > 40 ? 'Mobil Box Pendingin (Kapasitas >40 Porsi)' : 'Motor Box Cooler Steril',
      shelterName: allocateModal.panti.pantiName,
      contactPhone: allocateModal.panti.contactPhone,
      claimedAt: new Date().toISOString(),
      pickupAddress: allocateModal.panti.address,
      address: allocateModal.panti.address,
      time: `Hari ini ${allocateModal.panti.cutoffTime}`,
      bpomVerified: true,
    };

    try {
      // 1. Save new claim into replate_claims for instant display in Claims Module
      const existingClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
      localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingClaims]));

      // 2. Deduct portions from local surplus if present
      const localSurplus = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      const updatedSurplus = localSurplus.map((item: any) => {
        if (item.id === selectedProduct.id) {
          const currentQty = Number(item.remainingQuantity || item.quantity || 0);
          const newQty = Math.max(0, currentQty - allocateModal.portions);
          return { ...item, remainingQuantity: newQty, quantity: newQty };
        }
        return item;
      });
      localStorage.setItem('replate_local_surplus', JSON.stringify(updatedSurplus));
    } catch (_) {}

    setCompletedClaimsCount((prev) => prev + 1);
    setTotalRescuedKg((prev) => Math.round((prev + allocateModal.portions * 0.4) * 10) / 10);

    // Close allocate modal and open Success Issued QR Ticket Modal
    setAllocateModal({
      isOpen: false,
      panti: null,
      selectedFoodId: '',
      portions: 30,
      deliveryMethod: 'RESCUE_COURIER',
      hygieneChecked: true,
    });

    setIssuedTicketModal({
      isOpen: true,
      ticketData: newClaim,
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
              DASHBOARD FOOD PROVIDER
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              📅 {todayFormatted || 'Hari ini'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1B3A5C]">{providerName}</h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola surplus makanan harian, pantau penyelamatan pangan, dan salurkan donasi steril secara efisien.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/provider/my-listings">
            <Button variant="primary" size="md" className="font-black text-xs shadow-md">
              Buka Daftar Makanan ➔
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Real-time Dynamic Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Surplus Aktif Tersedia</span>
          <strong className="text-2xl font-black text-[#1B3A5C] font-mono">{activeSurplusCount} Menu</strong>
          <span className="text-[10px] text-emerald-600 font-bold block">Tervalidasi 8-Poin SOP BPOM</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Total Pangan Diselamatkan</span>
          <strong className="text-2xl font-black text-[#D4A843] font-mono">{totalRescuedKg} kg</strong>
          <span className="text-[10px] text-slate-500 font-bold block">Setara ~{Math.round(totalRescuedKg * 2.5)} porsi makanan</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Klaim Selesai & Terverifikasi</span>
          <strong className="text-2xl font-black text-emerald-600 font-mono">{completedClaimsCount} Transaksi</strong>
          <span className="text-[10px] text-slate-500 font-bold block">Scan QR Serah Terima Kasir Sukses</span>
        </div>
      </div>

      {/* SMART MATCHING 2.0: REKOMENDASI ALOKASI DONASI CERDAS KE PANTI TERDEKAT */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                SMART MATCHING ENGINE 2.0 (LIVE DAILY ALGORITHM)
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-700 font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE GEOLOCATION
              </span>
            </div>
            <h3 className="text-lg font-black text-[#1B3A5C]">
              Rekomendasi Penyaluran Donasi Cerdas Hari Ini
            </h3>
          </div>
          
          {/* Dynamic AI Ranking Priority Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500 font-bold mr-1">Urutkan:</span>
            {[
              { key: 'OVERALL', label: '🎯 Skor Tertinggi' },
              { key: 'DISTANCE', label: '📍 Radius Terdekat' },
              { key: 'URGENCY', label: '⚡ Paling Darurat' },
              { key: 'CAPACITY', label: '📦 Porsi Terbesar' },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setMatchingPriorityFilter(filter.key as any)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  matchingPriorityFilter === filter.key
                    ? 'bg-[#1B3A5C] text-[#D4A843] shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...matchedPantiList].sort((a, b) => {
            if (matchingPriorityFilter === 'DISTANCE') {
              return parseFloat(a.distance) - parseFloat(b.distance);
            }
            if (matchingPriorityFilter === 'URGENCY') {
              return a.cutoffTime.localeCompare(b.cutoffTime);
            }
            if (matchingPriorityFilter === 'CAPACITY') {
              return b.beneficiariesCount - a.beneficiariesCount;
            }
            return b.matchScore - a.matchScore;
          }).map((panti) => (
            <div
              key={panti.id}
              className="p-5 bg-gradient-to-br from-white to-blue-50/40 rounded-3xl border-2 border-blue-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#1B3A5C] text-[#D4A843] font-black text-[11px] rounded-md font-mono shadow-xs">
                      Skor Kecocokan {panti.matchScore}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPantiForFormula(panti);
                        setIsFormulaModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer"
                    >
                      Rincian Bobot ➔
                    </button>
                  </div>
                  <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[9px] rounded-md shadow-xs">
                    {panti.urgency}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-base text-[#1B3A5C]">{panti.pantiName}</h4>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">{panti.needTitle}</p>
                </div>

                {/* Logistics Method Preference by Shelter */}
                <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-0.5">
                  <span className="font-extrabold block text-[10px] text-amber-800 uppercase tracking-wider">
                    Preferensi Logistik Panti:
                  </span>
                  <p className="font-bold text-xs text-[#1B3A5C]">{panti.deliveryLabel}</p>
                  <p className="text-[10px] text-slate-600 italic">{panti.deliveryDesc}</p>
                </div>

                {/* Compact 3-Bullet Reasons */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1 font-medium">
                  <span className="font-black text-[10px] text-slate-500 uppercase tracking-wider block">
                    Alasan Kecocokan Cerdas:
                  </span>
                  {panti.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>Alamat: <strong>{panti.address}</strong></p>
                  <p>Penanggung Jawab: <strong>{panti.contactPerson}</strong> ({panti.contactPhone})</p>
                </div>

                {/* Button Lihat Detail Profil & Titik Peta GPS */}
                <button
                  type="button"
                  onClick={() => setSelectedShelterProfile(panti)}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1B3A5C] font-black text-[11px] rounded-xl border border-blue-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Lihat Profil Detail & Titik Peta GPS ➔</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold font-mono">
                  📅 Batas: Hari ini ({todayFormatted.split(',')[0] || 'Hari Ini'}), {panti.cutoffTime}
                </span>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleOpenAllocationModal(panti)}
                  className="font-black text-xs text-slate-950 px-3.5 py-1.5 shadow-md cursor-pointer"
                >
                  Sanggupi Donasi ➔
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/provider/my-listings" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block group">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-[#1B3A5C] group-hover:text-blue-700">Kelola Katalog Surplus</h4>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Pantau status stok makanan, sisa porsi, dan unggah menu baru.</p>
        </Link>

        <Link href="/dashboard/provider/claims" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block group">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-[#1B3A5C] group-hover:text-blue-700">Klaim & Serah Terima Kasir</h4>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Validasi resi digital saat pembeli atau kurir relawan mengambil paket.</p>
        </Link>

        <Link href="/dashboard/provider/impact" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block group">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-[#1B3A5C] group-hover:text-blue-700">Laporan Dampak & Sertifikat</h4>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Unduh sertifikat resmi penyelamatan pangan untuk audit ESG.</p>
        </Link>
      </div>

      {/* Modal Detail Profil Lembaga & Titik Lokasi Peta GPS */}
      <Modal
        isOpen={!!selectedShelterProfile}
        onClose={() => setSelectedShelterProfile(null)}
        title={selectedShelterProfile ? `Profil Lembaga & Lokasi: ${selectedShelterProfile.pantiName}` : 'Profil Lembaga'}
        size="lg"
      >
        {selectedShelterProfile && (
          <div className="space-y-4 text-xs">
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 shadow-xs">
              <img
                src={selectedShelterProfile.imageUrl}
                alt={selectedShelterProfile.pantiName}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-4 text-white">
                <div>
                  <Badge variant="gold" size="sm" className="mb-1">
                    {selectedShelterProfile.shelterType}
                  </Badge>
                  <h3 className="text-xl font-black text-white">{selectedShelterProfile.pantiName}</h3>
                  <p className="text-xs text-slate-200">{selectedShelterProfile.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Pengurus / Perwakilan:</span>
                <span className="font-extrabold text-[#1B3A5C]">{selectedShelterProfile.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Kontak WhatsApp:</span>
                <span className="font-bold text-slate-800">{selectedShelterProfile.contactPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Kapasitas Jiwa Penerima:</span>
                <span className="font-bold text-slate-800">{selectedShelterProfile.beneficiariesCount} Jiwa</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Identitas Verifikasi Dinsos:</span>
                <span className="font-mono font-bold text-slate-800">{selectedShelterProfile.legalPermit}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${selectedShelterProfile.contactPhone.replace(/^0/, '62')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Hubungi WhatsApp Penerima / Perwakilan (Koordinasi Direct) ➔</span>
            </a>

            {/* Embed Google Maps GPS */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#1B3A5C]">Titik Koordinat Lokasi Peta GPS Surabaya</h4>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  GPS: {selectedShelterProfile.lat}, {selectedShelterProfile.lng}
                </span>
              </div>

              <div className="relative w-full h-44 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 shadow-xs">
                <iframe
                  title="Shelter Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${selectedShelterProfile.lat},${selectedShelterProfile.lng}&z=15&output=embed`}
                  className="w-full h-full filter saturate-150"
                />
                <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider">
                  Titik Lokasi: {selectedShelterProfile.pantiName}
                </div>
              </div>
            </div>

            {/* Direct Google Maps Navigation Button (Point 3) */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=-7.2754,112.7541&destination=${selectedShelterProfile.lat},${selectedShelterProfile.lng}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-[#1B3A5C] hover:bg-[#142C47] text-[#D4A843] font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>🗺️ Buka Rute Langsung di Google Maps (GPS Navigasi) ➔</span>
            </a>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedShelterProfile(null)}>
                Tutup Profil
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-black text-slate-950"
                onClick={() => {
                  const target = selectedShelterProfile;
                  setSelectedShelterProfile(null);
                  handleOpenAllocationModal(target);
                }}
              >
                Sanggupi Bantuan Panti Ini ➔
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Rincian Formula & Bobot Smart Matching 2.0 */}
      <Modal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        title={`Rincian Formula Skor: ${selectedPantiForFormula?.pantiName || 'Smart Matching'}`}
        size="md"
      >
        {selectedPantiForFormula && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                MULTI-CRITERIA SCORING ENGINE 2.0
              </span>
              <h4 className="text-lg font-black text-white">
                Total Skor Kecocokan: {selectedPantiForFormula.matchScore}%
              </h4>
              <p className="text-slate-200 text-xs font-medium">
                Dihitung dari kombinasi bobot 4 variabel utama berdasarkan data real-time platform:
              </p>
            </div>

            <div className="space-y-2.5">
              {selectedPantiForFormula.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-800 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500">{item.desc}</span>
                  </div>
                  <strong className="text-sm font-black text-[#1B3A5C] font-mono">
                    {item.score}/{item.max} Pts
                  </strong>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsFormulaModalOpen(false)}>
                Tutup Rincian
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL SANGGUPI DONASI & DISTRIBUSI PANGAN */}
      {allocateModal.isOpen && allocateModal.panti && (
        <Modal
          isOpen={allocateModal.isOpen}
          onClose={() =>
            setAllocateModal({
              isOpen: false,
              panti: null,
              selectedFoodId: '',
              portions: 30,
              deliveryMethod: 'RESCUE_COURIER',
              hygieneChecked: true,
            })
          }
          title={`Alur Sanggupi Donasi: ${allocateModal.panti?.pantiName || 'Panti Asuhan'}`}
          size="lg"
        >
          {allocateModal.panti && (
            <form onSubmit={handleConfirmAllocationSubmit} className="space-y-4 text-xs text-slate-700">
              {/* Target Panti Info Banner */}
              <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1.5 shadow-md border border-[#2C5A8F]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-widest block">
                    TARGET PENERIMA BANTUAN PANGAN
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#D4A843] text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                    Kebutuhan: {allocateModal.panti.needTitle}
                  </span>
                </div>

                <h4 className="text-lg font-black text-white leading-snug drop-shadow-xs">
                  {allocateModal.panti.pantiName} ({allocateModal.panti.beneficiariesCount} Jiwa Penerima)
                </h4>

                <p className="text-[11px] text-slate-200 font-medium">
                  Alamat: {allocateModal.panti.address} • PIC: {allocateModal.panti.contactPerson} ({allocateModal.panti.contactPhone})
                </p>
              </div>

              {/* Dynamic Smart Matching Compatibility Analyzer (Point 4 & 10) */}
              {(() => {
                const targetNeedQty = parseInt(allocateModal.panti.targetQuantity || '45', 10) || 45;
                const ratioPct = Math.min(100, Math.round((allocateModal.portions / targetNeedQty) * 100));
                const selectedProd = availableProducts.find(p => p.id === allocateModal.selectedFoodId);
                const pantiNeedText = (allocateModal.panti.needTitle + ' ' + (allocateModal.panti.notes || '') + ' ' + (allocateModal.panti.shelterType || '')).toLowerCase();
                const prodName = (selectedProd?.foodName || '').toLowerCase();
                const prodCategory = selectedProd?.category || 'MEALS';

                // Semantic flags
                const isPantiMilk = pantiNeedText.includes('susu') || pantiNeedText.includes('dairy') || pantiNeedText.includes('formula') || pantiNeedText.includes('bayi') || pantiNeedText.includes('balita');
                const isPantiBakery = pantiNeedText.includes('roti') || pantiNeedText.includes('bakery') || pantiNeedText.includes('gandum') || pantiNeedText.includes('kue');
                const isPantiMeals = pantiNeedText.includes('nasi') || pantiNeedText.includes('lauk') || pantiNeedText.includes('prasmanan') || pantiNeedText.includes('makan malam') || pantiNeedText.includes('siap santap');

                const isProdMilk = prodName.includes('susu') || prodCategory === 'DAIRY';
                const isProdBakery = prodCategory === 'BAKERY' || prodName.includes('roti') || prodName.includes('kue');
                const isProdMeals = prodCategory === 'MEALS' || prodName.includes('nasi') || prodName.includes('ayam') || prodName.includes('bakso') || prodName.includes('goreng');

                let categoryScore = 30;
                let nutritionLabel = '100% Protein & Lauk Sehat';
                let isMismatch = false;
                let mismatchReason = '';

                if (isPantiMilk) {
                  if (isProdMilk) {
                    categoryScore = 30;
                    nutritionLabel = '✓ 100% Kalsium & Susu Steril';
                  } else if (isProdBakery) {
                    categoryScore = 18;
                    nutritionLabel = '⚠️ Snack Karbohidrat (Bukan Susu)';
                  } else {
                    categoryScore = 5;
                    nutritionLabel = '❌ Tidak Sesuai (Makanan Berat ≠ Susu Bayi)';
                    isMismatch = true;
                    mismatchReason = 'Panti asuhan ini membutuhkan asupan Susu Formula Balita & Nutrisi Bayi. Menu surplus yang Anda pilih (Makanan Berat / Berbumbu) tidak dapat dikonsumsi oleh balita.';
                  }
                } else if (isPantiBakery) {
                  if (isProdBakery) {
                    categoryScore = 30;
                    nutritionLabel = '✓ 100% Karbohidrat & Serat Gandum';
                  } else {
                    categoryScore = 15;
                    nutritionLabel = '⚠️ Beda Kategori (Permintaan Roti)';
                  }
                } else if (isPantiMeals) {
                  if (isProdMeals) {
                    categoryScore = 30;
                    nutritionLabel = '✓ 100% Protein & Lauk Seimbang';
                  } else if (isProdBakery) {
                    categoryScore = 18;
                    nutritionLabel = '⚠️ Snack Roti (Bukan Lauk Pauk)';
                  } else {
                    categoryScore = 20;
                    nutritionLabel = '✓ Makanan Siap Santap';
                  }
                }

                const fulfillmentWeight = Math.round((ratioPct / 100) * 15);
                const calculatedScore = isMismatch
                  ? Math.min(40, 20 + fulfillmentWeight)
                  : Math.min(99, Math.round(50 + categoryScore + fulfillmentWeight));

                return (
                  <div className={`p-4 rounded-2xl border space-y-2.5 shadow-xs transition-all ${
                    isMismatch
                      ? 'bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border-red-200'
                      : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-emerald-200/80'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-extrabold text-xs flex items-center gap-1.5 ${isMismatch ? 'text-red-950' : 'text-emerald-950'}`}>
                        <span>✨ Analitik Smart Matching Algoritma AI (Dinamis):</span>
                      </span>
                      <span className={`px-2.5 py-0.5 font-black text-[11px] rounded-md shadow-xs ${
                        isMismatch
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-700 text-amber-200'
                      }`}>
                        {calculatedScore}% {isMismatch ? '⚠️ Kategori Tidak Cocok' : 'Sangat Cocok'}
                      </span>
                    </div>

                    {isMismatch && (
                      <div className="p-3 bg-red-100/90 text-red-900 border border-red-200 rounded-xl text-[11px] font-medium leading-relaxed">
                        <strong>⚠️ Peringatan Ketidakcocokan Kebutuhan:</strong> {mismatchReason}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-medium text-slate-700">
                      <div className="p-2.5 bg-white/95 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                        <span className="text-slate-400 text-[10px] block font-bold">Kesesuaian Kategori & Gizi:</span>
                        <strong className={`font-extrabold block text-xs ${isMismatch ? 'text-red-700' : 'text-emerald-900'}`}>
                          {nutritionLabel}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-white/95 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                        <span className="text-slate-400 text-[10px] block font-bold">Ketahanan Suhu BPOM:</span>
                        <strong className="text-emerald-900 font-extrabold block text-xs">✓ Aman &lt; 3.5 Jam (Panas &gt;60°C)</strong>
                      </div>
                      <div className="p-2.5 bg-white/95 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                        <span className="text-slate-400 text-[10px] block font-bold">Rasio Pemenuhan:</span>
                        <strong className="text-blue-900 font-extrabold block text-xs">
                          {allocateModal.portions} Porsi ({ratioPct}% Terpenuhi)
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PRODUCT SELECTOR SECTION (Point 3) */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="font-extrabold text-slate-900 block text-xs">
                  Pilih Produk Surplus Dari Toko Anda Yang Ingin Didonasikan:
                </label>

                {availableProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableProducts.map((prod) => {
                      const isSelected = allocateModal.selectedFoodId === prod.id;
                      const stock = Number(prod.remainingQuantity || prod.quantity || 0);
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleProductSelectChange(prod.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-[#1B3A5C] text-white border-[#D4A843] ring-2 ring-[#D4A843]/40 shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {prod.imageUrl && (
                            <img
                              src={prod.imageUrl}
                              alt={prod.foodName}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className={`block font-extrabold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {prod.foodName}
                            </span>
                            <span className={`text-[10px] font-bold block ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                              Tersedia: {stock} {prod.quantityUnit || 'Porsi'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs font-semibold">
                    ⚠️ Belum ada menu surplus aktif di katalog Anda. Silakan isi porsi estimasi di bawah.
                  </div>
                )}
              </div>

              {/* Portions Allocation Input with Split-Batch Stock Calculation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 block text-xs">
                    Jumlah Porsi Yang Siap Anda Donasikan:
                  </label>
                  <span className="text-[11px] text-slate-500 font-bold">
                    Kebutuhan Panti: {allocateModal.panti.needTitle}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={allocateModal.portions}
                  onChange={(e) => setAllocateModal({ ...allocateModal, portions: Number(e.target.value) })}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm text-[#1B3A5C] focus:ring-2 focus:ring-[#D4A843]"
                  required
                />
                {/* Split-batch remaining stock indicator */}
                {(() => {
                  const selProd = availableProducts.find((p) => p.id === allocateModal.selectedFoodId);
                  const totalStk = selProd ? Number(selProd.remainingQuantity || selProd.quantity || 30) : 30;
                  const remainAfter = Math.max(0, totalStk - allocateModal.portions);
                  return (
                    <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] flex justify-between items-center">
                      <span className="text-slate-600 font-medium">
                        Stok Tersedia: <strong>{totalStk} Porsi</strong> | Sisa Setelah Donasi:
                      </span>
                      <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {remainAfter} Porsi (Tersimpan di Katalog)
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* LOCKED DELIVERY METHOD & VEHICLE FLEET MATCHING (Point 4 & Poin Armada) */}
              <div className="p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#1B3A5C] uppercase tracking-wider text-[10px] block">
                    🚚 Metode Pengiriman & Ketentuan Armada:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-700 text-white font-black text-[9px] uppercase">
                    {allocateModal.portions > 40 ? '📦 Wajib Mobil Box / Van' : '🛵 Motor Box Cooler Steril'}
                  </span>
                </div>
                <p className="font-black text-slate-900 text-xs">
                  {allocateModal.panti.deliveryLabel}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {allocateModal.panti.deliveryDesc}
                </p>
              </div>

              {/* Interactive 8-Poin BPOM Checklist SOP (Point 11) */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-black text-emerald-950 text-xs block">
                      🛡️ Checklist Kepatuhan 8-Poin SOP Higienitas BPOM RI & WHO
                    </span>
                    <span className="text-[10px] text-emerald-800 font-medium block">
                      Wajib memenuhi seluruh standar baku kelayakan pangan sebelum tiket donasi diterbitkan:
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllocateModal(prev => ({ ...prev, hygieneChecked: true }))}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] rounded-lg cursor-pointer transition-colors"
                  >
                    ✓ Verifikasi Semua
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-800 pt-1">
                  {[
                    '1. Batas Masak < 4 Jam Selesai Olah',
                    '2. Suhu Panas >60°C / Dingin <4°C',
                    '3. Wadah Steril & Tersegel Rapat',
                    '4. Uji Organoleptik (Warna Normal)',
                    '5. Bebas Bau Asam / Fermentasi Liar',
                    '6. Pelabelan Alergen Transparan',
                    '7. Dapur Mitra Berizin NIB / Sanitasi',
                    '8. Batas Waktu Konsumsi Tertera di Resi',
                  ].map((rule, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-2 bg-white/90 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={allocateModal.hygieneChecked}
                        onChange={(e) => setAllocateModal({ ...allocateModal, hygieneChecked: e.target.checked })}
                        className="w-3.5 h-3.5 text-emerald-600 rounded border-emerald-300 focus:ring-0 cursor-pointer"
                      />
                      <span className="font-bold text-[10.5px] text-emerald-950">{rule}</span>
                    </label>
                  ))}
                </div>
              </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setAllocateModal({
                    isOpen: false,
                    panti: null,
                    selectedFoodId: '',
                    portions: 30,
                    deliveryMethod: 'RESCUE_COURIER',
                    hygieneChecked: true,
                  })
                }
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={!allocateModal.hygieneChecked}
                className="font-black text-slate-950 shadow-md disabled:opacity-50"
              >
                Terbitkan QR Surat Jalan & Selesaikan Donasi ➔
              </Button>
            </div>
          </form>
        )}
      </Modal>
      )}

      {/* MODAL SUCCESS ISSUED QR RESI — Unified QR Pass Design */}
      <Modal
        isOpen={issuedTicketModal.isOpen}
        onClose={() => setIssuedTicketModal({ isOpen: false, ticketData: null })}
        title="🎉 QR Surat Jalan Donasi Berhasil Diterbitkan!"
        size="md"
      >
        {issuedTicketModal.ticketData && (
          <div className="space-y-5 text-center text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">
                DONASI RESMI TERCATAT KE SISTEM REDISTRIBUSI
              </span>
              <h3 className="text-base font-black text-emerald-950">
                {issuedTicketModal.ticketData.foodName} ({issuedTicketModal.ticketData.quantity})
              </h3>
              <p className="text-xs text-emerald-800 font-semibold">
                Penerima: {issuedTicketModal.ticketData.shelterName}
              </p>
            </div>

            {/* Unified QR Pass Component */}
            <QRGenerator
              value={issuedTicketModal.ticketData.code}
              codeTitle="SURAT JALAN DONASI REPLATE"
              codeSubtitle="Tunjukkan QR ini ke kurir relawan atau petugas panti saat serah terima"
              foodName={issuedTicketModal.ticketData.foodName}
              portions={issuedTicketModal.ticketData.quantity}
              recipientName={issuedTicketModal.ticketData.shelterName}
              picPanti={issuedTicketModal.ticketData.recipientPerson}
              providerName={providerName}
              courierName={issuedTicketModal.ticketData.courierName}
              courierVehicle={issuedTicketModal.ticketData.courierVehicle}
              courierPhone={issuedTicketModal.ticketData.courierPhone}
              deliveryMethod={issuedTicketModal.ticketData.deliveryMethod}
              expiryTime={issuedTicketModal.ticketData.time}
            />

            <div className="space-y-2">
              <Button
                variant="gold"
                size="lg"
                className="w-full font-black text-slate-950 shadow-lg py-3 text-sm flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  setIssuedTicketModal({ isOpen: false, ticketData: null });
                  router.push('/dashboard/provider/claims');
                }}
              >
                <span>🚀 Buka & Kelola di Modul Klaim & Kasir ➔</span>
              </Button>

              <button
                type="button"
                onClick={() => setIssuedTicketModal({ isOpen: false, ticketData: null })}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
              >
                Tetap di Halaman Beranda
              </button>
            </div>
          </div>
        )}
      </Modal>

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
