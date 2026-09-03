'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { useSession } from 'next-auth/react';
import { SHARED_PANTI_NEEDS } from '@/lib/pantiData';
import {
  PlusIcon,
  MinusIcon,
  PackageIcon,
  CreditCardIcon,
  TruckIcon,
  BikeIcon,
  MapPinIcon,
  MapIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  CalendarIcon,
  TargetIcon,
  ShieldCheckIcon,
  SparklesIcon,
  AlertTriangleIcon,
} from '@/components/ui/Icon';

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
  const [shelterModalTab, setShelterModalTab] = useState<'INFO' | 'MAP'>('INFO');

  // In-Workspace Instant Donation Allocation Modal State
  const [showAIAnalyticsDetails, setShowAIAnalyticsDetails] = useState<boolean>(false);
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

  // Authentic Super-App Action Loading Modal State
  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

  // Smart Matching Priority Preference Filter (Poin 1 & 13)
  const [matchingPriorityFilter, setMatchingPriorityFilter] = useState<'OVERALL' | 'DISTANCE' | 'URGENCY' | 'CAPACITY'>('OVERALL');

  // Dynamic Daily Matched Panti List synchronized with Explore Page (Single Source of Truth)
  const matchedPantiList = SHARED_PANTI_NEEDS;

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

    const normalizeProduct = (item: any) => ({
      ...item,
      id: item.id || `SRP-${Math.random()}`,
      foodName: item.foodName || item.title || 'Produk Surplus Toko',
      quantity: Number(item.quantity || item.remainingQuantity || 15),
      remainingQuantity: Number(item.remainingQuantity !== undefined ? item.remainingQuantity : (item.quantity || 15)),
      quantityUnit: item.quantityUnit || 'Porsi',
      imageUrl: item.imageUrl || item.photos?.[0] || item.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60',
      category: item.foodCategory || item.category || 'MEALS',
      freshUntil: item.freshUntil || item.pickupTime || 'Hari ini 21:00 WIB',
      status: item.status || 'AVAILABLE',
    });

    const deduplicateProducts = (list: any[]) => {
      const seen = new Map<string, any>();
      const result: any[] = [];
      for (const item of list) {
        if (item.status && item.status !== 'AVAILABLE' && item.status !== 'ACTIVE') continue;
        const norm = normalizeProduct(item);
        if (!seen.has(norm.id)) {
          seen.set(norm.id, true);
          result.push(norm);
        }
      }
      return result;
    };

    const computeCompletedClaims = () => {
      let allSavedClaims: any[] = [];
      try {
        const s1 = localStorage.getItem('replate_claims');
        if (s1) allSavedClaims = [...allSavedClaims, ...JSON.parse(s1)];
      } catch (_) {}
      try {
        const s2 = localStorage.getItem('replate_active_claims');
        if (s2) allSavedClaims = [...allSavedClaims, ...JSON.parse(s2)];
      } catch (_) {}

      const completedInStorage = allSavedClaims.filter(
        (c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED'
      );

      const defaultCompletedCodes = ['RPL-DON-2026-77182', 'RPL-DON-2026-66102'];
      const uniqueCompletedCodes = new Set([
        ...(isFresh ? [] : defaultCompletedCodes),
        ...completedInStorage.map((c: any) => c.claimCode || c.code || c.id),
      ]);
      return uniqueCompletedCodes.size;
    };

    if (isFresh) {
      const activeItems = deduplicateProducts(localItems);
      setActiveSurplusCount(activeItems.length);
      setAvailableProducts(activeItems);

      const calculatedWeight = activeItems.reduce((acc, curr) => {
        const qty = Number(curr.quantity || 15);
        const weightUnit = Number(curr.weightPerUnitKg || 0.4);
        return acc + qty * weightUnit;
      }, 0);
      setTotalRescuedKg(Math.round(calculatedWeight * 10) / 10);
      setCompletedClaimsCount(computeCompletedClaims());
      return;
    }

    // Load provider items from local storage first for 0ms render
    if (localItems.length > 0) {
      const activeItems = deduplicateProducts(localItems);
      setActiveSurplusCount(activeItems.length);
      setAvailableProducts(activeItems);
    } else {
      setAvailableProducts(defaultCatalog);
      setActiveSurplusCount(defaultCatalog.length);
    }

    const providerQuery = session?.user?.id ? `&providerId=${session.user.id}` : '';
    fetch(`/api/surplus?status=${providerQuery}`)
      .then((res) => res.json())
      .then((data) => {
        let itemsList: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          itemsList = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          itemsList = data.data;
        }

        const combined = deduplicateProducts([...localItems, ...itemsList]);
        if (combined.length > 0) {
          setActiveSurplusCount(combined.length);
          setAvailableProducts(combined);
        } else {
          setAvailableProducts(defaultCatalog);
          setActiveSurplusCount(defaultCatalog.length);
        }

        const currentActive = combined.length > 0 ? combined : defaultCatalog;
        const calculatedWeight = currentActive.reduce((acc: number, curr: any) => {
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
          const dedupedLocal = deduplicateProducts(localItems);
          setActiveSurplusCount(dedupedLocal.length);
          setAvailableProducts(dedupedLocal);
        }
      });

    setCompletedClaimsCount(computeCompletedClaims());
  }, [session]);

  const handleOpenAllocationModal = (panti: any) => {
    // Dynamic refresh from local surplus cache so newly added items are immediately ready
    let currentProducts = [...availableProducts];
    try {
      const localStr = localStorage.getItem('replate_local_surplus');
      if (localStr) {
        const parsed = JSON.parse(localStr).filter((i: any) => i.status === 'AVAILABLE' || !i.status);
        if (parsed.length > 0) {
          const normalizeProd = (item: any) => ({
            ...item,
            id: item.id || `SRP-${Math.random()}`,
            foodName: item.foodName || item.title || 'Produk Surplus Toko',
            quantity: Number(item.quantity || item.remainingQuantity || 15),
            remainingQuantity: Number(item.remainingQuantity !== undefined ? item.remainingQuantity : (item.quantity || 15)),
            quantityUnit: item.quantityUnit || 'Porsi',
            imageUrl: item.imageUrl || item.photos?.[0] || item.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60',
            category: item.foodCategory || item.category || 'MEALS',
            freshUntil: item.freshUntil || item.pickupTime || 'Hari ini 21:00 WIB',
            status: item.status || 'AVAILABLE',
          });
          const localNormalized = parsed.map(normalizeProd);
          const combined = [...localNormalized, ...currentProducts];
          const deduped = Array.from(
            combined.reduce((map, item) => {
              if (!map.has(item.id)) map.set(item.id, item);
              return map;
            }, new Map<string, any>()).values()
          );
          currentProducts = deduped;
          setAvailableProducts(currentProducts);
        }
      }
    } catch (_) {}

    const targetNeedQty = Number(panti.targetQuantity || panti.needTitle?.match(/\d+/)?.[0] || 50);
    const firstProduct = currentProducts[0] || { id: 'SRP-101', foodName: 'Surplus Toko', quantity: 30, remainingQuantity: 30 };
    const maxPortions = Number(firstProduct.remainingQuantity || firstProduct.quantity || 30);
    const initialPortions = Math.min(30, maxPortions, targetNeedQty);

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
    const targetNeedQty = allocateModal.panti
      ? Number(allocateModal.panti.targetQuantity || allocateModal.panti.needTitle?.match(/\d+/)?.[0] || 50)
      : 50;
    const maxAllowed = Math.min(maxQty, targetNeedQty);
    setAllocateModal((prev) => ({
      ...prev,
      selectedFoodId: foodId,
      portions: Math.min(prev.portions, maxAllowed) || maxAllowed,
    }));
  };

  const handleConfirmAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateModal.panti) return;

    if (!allocateModal.hygieneChecked) {
      alert('Anda wajib menyetujui konfirmasi 8-Poin SOP Higienitas BPOM RI.');
      return;
    }

    const targetNeedQty = Number(
      allocateModal.panti.targetQuantity ||
      allocateModal.panti.needTitle?.match(/\d+/)?.[0] ||
      50
    );

    const selectedProduct = availableProducts.find((p) => p.id === allocateModal.selectedFoodId) || {
      foodName: 'Nasi Paket Ayam Bakar & Lauk Bersih',
      id: 'SRP-102',
      quantity: 30,
      remainingQuantity: 30,
    };
    const availableStock = Number(selectedProduct.remainingQuantity || selectedProduct.quantity || 0);

    if (allocateModal.portions <= 0) {
      alert('Jumlah porsi donasi minimal 1 porsi.');
      return;
    }

    if (allocateModal.portions > targetNeedQty) {
      alert(
        `Peringatan: Jumlah donasi (${allocateModal.portions} porsi) melebihi batas kebutuhan yang diminta oleh ${allocateModal.panti.pantiName} (Maksimal ${targetNeedQty} porsi).\n\nAnda tidak dapat menyanggupi melebihi porsi yang dibutuhkan panti.`
      );
      return;
    }

    if (allocateModal.portions > availableStock) {
      alert(
        `Peringatan: Jumlah donasi (${allocateModal.portions} porsi) melebihi stok surplus produk yang tersedia di toko Anda (${availableStock} porsi).\n\nSilakan sesuaikan jumlah porsi donasi.`
      );
      return;
    }

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
      status: (allocateModal.deliveryMethod || allocateModal.panti.preferredDelivery) === 'RESCUE_COURIER' ? 'AWAITING_RESCUE_PICKUP' : 'READY_FOR_PICKUP',
      deliveryMethod: allocateModal.deliveryMethod || allocateModal.panti.preferredDelivery || 'RESCUE_COURIER',
      courierName: (allocateModal.deliveryMethod || allocateModal.panti.preferredDelivery) === 'RESCUE_COURIER' ? undefined : 'Pengurus Panti (Ambil Mandiri)',
      courierOrg: (allocateModal.deliveryMethod || allocateModal.panti.preferredDelivery) === 'RESCUE_COURIER' ? 'Pool Siaga Relawan Replate' : 'Armada Panti Asuhan',
      courierPhone: (allocateModal.deliveryMethod || allocateModal.panti.preferredDelivery) === 'RESCUE_COURIER' ? undefined : allocateModal.panti.contactPhone,
      courierVehicle: (allocateModal.deliveryMethod || allocateModal.panti.preferredDelivery) === 'RESCUE_COURIER' ? undefined : 'Kendaraan Panti Asuhan',
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

    // Close allocate modal and trigger authentic super-app loading before showing ticket
    setAllocateModal({
      isOpen: false,
      panti: null,
      selectedFoodId: '',
      portions: 30,
      deliveryMethod: 'RESCUE_COURIER',
      hygieneChecked: true,
    });

    setActionLoader({
      isOpen: true,
      message: 'Menerbitkan Tiket Penyaluran Donasi...',
      submessage: 'Menugaskan kurir relawan dan mengunci alokasi stok toko Anda',
    });

    setTimeout(() => {
      setActionLoader({ isOpen: false, message: '' });
      setIssuedTicketModal({
        isOpen: true,
        ticketData: newClaim,
      });
    }, 650);
  };

  return (
    <div className="space-y-5 sm:space-y-8 max-w-6xl mx-auto pb-12">
      {/* Sleek Modern Header Card (Compact & Ergonomic - Seragam Antar Modul) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                DASHBOARD FOOD PROVIDER
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Toko Buka • {todayFormatted || 'Hari ini'}</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              {providerName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Kelola surplus makanan harian, pantau penyelamatan pangan, dan salurkan donasi steril.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/provider/add-surplus">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<PlusIcon size={14} className="text-slate-950" />}
                className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
              >
                Tambah Surplus
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE SUPER-APP COMPACT KPI BAR (Takes only 65px instead of 3 full cards) */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-center sm:hidden">
        <div className="px-1.5 space-y-0.5">
          <span className="text-[9.5px] font-bold text-slate-400 block truncate">Surplus Aktif</span>
          <strong className="text-sm font-black text-[#1B3A5C] block font-mono">{activeSurplusCount} Menu</strong>
          <span className="text-[8.5px] text-emerald-600 font-extrabold flex items-center justify-center gap-0.5">
            <CheckIcon size={9} />
            <span>BPOM SOP</span>
          </span>
        </div>
        <div className="px-1.5 space-y-0.5">
          <span className="text-[9.5px] font-bold text-slate-400 block truncate">Pangan Terjaga</span>
          <strong className="text-sm font-black text-[#D4A843] block font-mono">{totalRescuedKg} kg</strong>
          <span className="text-[8.5px] text-slate-500 font-bold block">~{Math.round(totalRescuedKg * 2.5)} porsi</span>
        </div>
        <div className="px-1.5 space-y-0.5">
          <span className="text-[9.5px] font-bold text-slate-400 block truncate">Klaim Selesai</span>
          <strong className="text-sm font-black text-emerald-600 block font-mono">{completedClaimsCount} Transaksi</strong>
          <span className="text-[8.5px] text-slate-500 font-bold block">Scan QR Kasir</span>
        </div>
      </div>

      {/* MOBILE SUPER-APP QUICK ACTION 2x2 GRID (Icon on Left, Text on Right - Sampingan Kiri Kanan) */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <Link
          href="/dashboard/provider/add-surplus"
          className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2.5 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#1B3A5C] flex items-center justify-center shrink-0">
            <PlusIcon size={16} className="text-[#1B3A5C]" />
          </div>
          <div className="min-w-0 text-left">
            <strong className="text-xs font-black text-[#1B3A5C] block truncate">Tambah Menu</strong>
            <span className="text-[9.5px] font-bold text-slate-400 block truncate">Surplus Baru</span>
          </div>
        </Link>

        <Link
          href="/dashboard/provider/my-listings"
          className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2.5 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1B3A5C] flex items-center justify-center shrink-0">
            <PackageIcon size={16} className="text-[#1B3A5C]" />
          </div>
          <div className="min-w-0 text-left">
            <strong className="text-xs font-black text-[#1B3A5C] block truncate">Katalog Menu</strong>
            <span className="text-[9.5px] font-bold text-slate-400 block truncate">Kelola Stok</span>
          </div>
        </Link>

        <Link
          href="/dashboard/provider/claims"
          className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2.5 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
            <CreditCardIcon size={16} className="text-emerald-800" />
          </div>
          <div className="min-w-0 text-left">
            <strong className="text-xs font-black text-[#1B3A5C] block truncate">Kasir QR</strong>
            <span className="text-[9.5px] font-bold text-slate-400 block truncate">Serah Terima</span>
          </div>
        </Link>

        <Link
          href="/dashboard/tracking"
          className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2.5 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
            <BikeIcon size={16} className="text-purple-800" />
          </div>
          <div className="min-w-0 text-left">
            <strong className="text-xs font-black text-[#1B3A5C] block truncate">Lacak OTW</strong>
            <span className="text-[9.5px] font-bold text-slate-400 block truncate">GPS Kurir</span>
          </div>
        </Link>
      </div>

      {/* Desktop Metrics Row (Preserved for screen >= sm) */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
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
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                SMART MATCHING ENGINE 2.0 (LIVE DAILY ALGORITHM)
              </span>
              <span className="inline-flex items-center gap-1 text-[8.5px] sm:text-[9px] bg-emerald-500/10 text-emerald-700 font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#1B3A5C]">
              Rekomendasi Penyaluran Donasi Cerdas Hari Ini
            </h3>
          </div>
          
          {/* Dynamic AI Ranking Priority Filter Buttons (Horizontal swipe on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-nowrap sm:flex-wrap">
            <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-bold mr-1 shrink-0">Urutkan:</span>
            {[
              { key: 'OVERALL', label: 'Tertinggi', icon: TargetIcon },
              { key: 'DISTANCE', label: 'Terdekat', icon: MapPinIcon },
              { key: 'URGENCY', label: 'Darurat', icon: ClockIcon },
              { key: 'CAPACITY', label: 'Terbesar', icon: PackageIcon },
            ].map((filter) => {
              const IconComp = filter.icon;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setMatchingPriorityFilter(filter.key as any)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    matchingPriorityFilter === filter.key
                      ? 'bg-[#1B3A5C] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <IconComp size={12} />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panti Cards: Horizontal Peek Carousel on mobile, 2-column grid on desktop */}
        <div className="flex md:grid md:grid-cols-2 gap-3 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-2">
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
              className="w-[88vw] max-w-[340px] md:w-auto shrink-0 snap-start p-3.5 sm:p-4 bg-gradient-to-br from-white to-blue-50/40 rounded-3xl border-2 border-blue-200 shadow-xs flex flex-col justify-between space-y-2.5"
            >
              {/* Header: Skor, Jarak & Urgensi */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-[#1B3A5C] text-[#D4A843] font-black text-[10.5px] rounded-md font-mono shadow-2xs">
                    {panti.matchScore}% Match
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5">
                    <MapPinIcon size={11} className="text-slate-400" />
                    <span>{panti.distance}</span>
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[9px] rounded-md shadow-2xs shrink-0">
                  {panti.urgency}
                </span>
              </div>

              {/* Identitas Panti & Kebutuhan */}
              <div>
                <h4 className="font-black text-sm sm:text-base text-[#1B3A5C] truncate">{panti.pantiName}</h4>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mt-0.5">
                  <span className="text-emerald-800 font-bold truncate">{panti.needTitle}</span>
                  <span>•</span>
                  <span className="text-slate-500 shrink-0">{panti.beneficiariesCount} Jiwa</span>
                </div>
              </div>

              {/* Preferensi Pengiriman Pill */}
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-bold text-[9.5px] truncate max-w-[170px]">
                  {panti.deliveryLabel}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate flex-1">
                  {panti.address.split(',')[0]}
                </span>
              </div>

              {/* Top AI Match Reason (Single Line) */}
              <div className="px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[10.5px] text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate font-medium">{panti.reasons[0] || 'Kebutuhan porsi & jarak sangat cocok'}</span>
              </div>

              {/* Batas Waktu & Action Buttons */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-amber-900 font-bold font-mono flex items-center gap-1">
                    <ClockIcon size={11} />
                    <span>Batas: {panti.cutoffTime} WIB</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPantiForFormula(panti);
                      setIsFormulaModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Rincian Skor 
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedShelterProfile(panti)}
                    className="py-2 px-2.5 bg-white hover:bg-slate-50 text-[#1B3A5C] font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Lihat profil detail lembaga dan peta lokasi"
                  >
                    <MapPinIcon size={12} />
                    <span>Detail</span>
                  </button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleOpenAllocationModal(panti)}
                    className="flex-1 font-black text-xs text-slate-950 py-2 shadow-md cursor-pointer"
                  >
                    Sanggupi Donasi 
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Action Navigation Cards (Desktop only, mobile has quick icon grid at top) */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        <Link href="/dashboard/provider/my-listings" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block group">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-[#1B3A5C] group-hover:text-blue-700">Kelola Katalog Surplus</h4>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform"></span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Pantau status stok makanan, sisa porsi, dan unggah menu baru.</p>
        </Link>

        <Link href="/dashboard/provider/claims" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block group">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-[#1B3A5C] group-hover:text-blue-700">Klaim & Serah Terima Kasir</h4>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform"></span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Validasi resi digital saat pembeli atau kurir relawan mengambil paket.</p>
        </Link>

        <Link href="/dashboard/provider/impact" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block group">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-[#1B3A5C] group-hover:text-blue-700">Laporan Dampak & Sertifikat</h4>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform"></span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Unduh sertifikat resmi penyelamatan pangan untuk audit ESG.</p>
        </Link>
      </div>

      {/* Modal Detail Profil Lembaga & Titik Lokasi Peta GPS */}
      <Modal
        isOpen={!!selectedShelterProfile}
        onClose={() => setSelectedShelterProfile(null)}
        title={selectedShelterProfile ? `Profil Lembaga: ${selectedShelterProfile.pantiName}` : 'Profil Lembaga'}
        size="lg"
      >
        {selectedShelterProfile && (
          <div className="space-y-3.5 text-xs text-slate-700">
            {/* Header Hero Banner (Compact & Visual) */}
            <div className="relative w-full h-28 sm:h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 shadow-xs">
              <img
                src={selectedShelterProfile.imageUrl}
                alt={selectedShelterProfile.pantiName}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent flex items-end p-3.5 sm:p-4 text-white">
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <Badge variant="gold" size="sm">
                      {selectedShelterProfile.shelterType}
                    </Badge>
                    <span className="text-[10.5px] font-mono font-bold text-amber-300">
                      {selectedShelterProfile.beneficiariesCount} Jiwa Terdaftar
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">{selectedShelterProfile.pantiName}</h3>
                  <p className="text-[11px] text-slate-300 truncate">{selectedShelterProfile.address}</p>
                </div>
              </div>
            </div>

            {/* Segmented Tab Switcher for Mobile Ergonomics */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setShelterModalTab('INFO')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  shelterModalTab === 'INFO'
                    ? 'bg-white text-[#1B3A5C] shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PackageIcon size={13} />
                <span>Informasi & Legalitas</span>
              </button>
              <button
                type="button"
                onClick={() => setShelterModalTab('MAP')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  shelterModalTab === 'MAP'
                    ? 'bg-white text-[#1B3A5C] shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPinIcon size={13} />
                <span>Peta GPS Navigasi</span>
              </button>
            </div>

            {/* Tab 1: Informasi & Legalitas Lembaga */}
            {shelterModalTab === 'INFO' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold block">Pengurus / PIC:</span>
                    <strong className="font-extrabold text-[#1B3A5C] text-xs block truncate">
                      {selectedShelterProfile.contactPerson}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold block">WhatsApp Resmi:</span>
                    <strong className="font-bold text-slate-800 text-xs block truncate">
                      {selectedShelterProfile.contactPhone}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold block">Kapasitas Anak Panti:</span>
                    <strong className="font-bold text-slate-800 text-xs block">
                      {selectedShelterProfile.beneficiariesCount} Jiwa
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold block">Izin Dinsos Surabaya:</span>
                    <strong className="font-mono font-bold text-emerald-800 text-xs block truncate">
                      {selectedShelterProfile.legalPermit}
                    </strong>
                  </div>
                </div>

                {/* Kebutuhan Saat Ini Card */}
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-950 space-y-1">
                  <span className="font-extrabold text-[10px] uppercase tracking-wider text-blue-800 block">
                    Kebutuhan Makanan Mendesak Hari Ini:
                  </span>
                  <p className="font-bold text-xs text-[#1B3A5C]">{selectedShelterProfile.needTitle}</p>
                  <p className="text-slate-600 text-[10.5px] leading-relaxed">
                    Preferensi Pengiriman: <strong>{selectedShelterProfile.deliveryLabel}</strong>. {selectedShelterProfile.deliveryDesc}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Peta GPS & Rute Surabaya */}
            {shelterModalTab === 'MAP' && (
              <div className="space-y-2.5">
                <div className="relative w-full h-48 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 shadow-xs">
                  <iframe
                    title="Shelter Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://maps.google.com/maps?q=${selectedShelterProfile.lat},${selectedShelterProfile.lng}&z=15&output=embed`}
                    className="w-full h-full filter saturate-150"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#1B3A5C] text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-md">
                    Titik: {selectedShelterProfile.pantiName}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="font-medium">Koordinat GPS:</span>
                  <span className="font-mono font-bold text-slate-700">{selectedShelterProfile.lat}, {selectedShelterProfile.lng}</span>
                </div>
              </div>
            )}

            {/* Sticky Action Footer Bar */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${selectedShelterProfile.contactPhone.replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <ChatIcon size={14} />
                  <span>WhatsApp PIC</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=-7.2754,112.7541&destination=${selectedShelterProfile.lat},${selectedShelterProfile.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-[#1B3A5C] hover:bg-[#142C47] text-[#D4A843] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <MapPinIcon size={14} />
                  <span>Buka Rute GPS</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedShelterProfile(null)} className="w-1/3">
                  Tutup
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  className="flex-1 font-black text-slate-950"
                  onClick={() => {
                    const target = selectedShelterProfile;
                    setSelectedShelterProfile(null);
                    handleOpenAllocationModal(target);
                  }}
                >
                  Sanggupi Bantuan Panti 
                </Button>
              </div>
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
              <div className="p-3.5 sm:p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1.5 shadow-md border border-[#2C5A8F]">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-[#D4A843] tracking-widest block">
                    TARGET PENERIMA BANTUAN
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#D4A843] text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                    Kebutuhan: {allocateModal.panti.needTitle}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-black text-white leading-snug drop-shadow-xs">
                  {allocateModal.panti.pantiName} ({allocateModal.panti.beneficiariesCount} Jiwa Penerima)
                </h4>

                <p className="text-[11px] text-slate-200 font-medium">
                  Alamat: {allocateModal.panti.address} • PIC: {allocateModal.panti.contactPerson} ({allocateModal.panti.contactPhone})
                </p>
              </div>

              {/* Dynamic Smart Matching Compatibility Analyzer (Collapsible on Mobile) */}
              {(() => {
                const targetNeedQty = parseInt(allocateModal.panti.targetQuantity || '45', 10) || 45;
                const ratioPct = Math.min(100, Math.round((allocateModal.portions / targetNeedQty) * 100));
                const selectedProd = availableProducts.find(p => p.id === allocateModal.selectedFoodId);
                const pantiNeedText = (allocateModal.panti.needTitle + ' ' + (allocateModal.panti.notes || '') + ' ' + (allocateModal.panti.shelterType || '')).toLowerCase();
                const prodName = (selectedProd?.foodName || '').toLowerCase();
                const prodCategory = selectedProd?.category || 'MEALS';

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
                    nutritionLabel = '100% Kalsium & Susu Steril';
                  } else if (isProdBakery) {
                    categoryScore = 18;
                    nutritionLabel = 'Snack Karbohidrat (Bukan Susu)';
                  } else {
                    categoryScore = 5;
                    nutritionLabel = 'Tidak Sesuai (Makanan Berat ≠ Susu Bayi)';
                    isMismatch = true;
                    mismatchReason = 'Panti asuhan ini membutuhkan asupan Susu Formula Balita & Nutrisi Bayi. Menu surplus yang Anda pilih tidak dapat dikonsumsi oleh balita.';
                  }
                } else if (isPantiBakery) {
                  if (isProdBakery) {
                    categoryScore = 30;
                    nutritionLabel = '100% Karbohidrat & Serat Gandum';
                  } else {
                    categoryScore = 15;
                    nutritionLabel = 'Beda Kategori (Permintaan Roti)';
                  }
                } else if (isPantiMeals) {
                  if (isProdMeals) {
                    categoryScore = 30;
                    nutritionLabel = '100% Protein & Lauk Seimbang';
                  } else if (isProdBakery) {
                    categoryScore = 18;
                    nutritionLabel = 'Snack Roti (Bukan Lauk Pauk)';
                  } else {
                    categoryScore = 20;
                    nutritionLabel = 'Makanan Siap Santap';
                  }
                }

                const fulfillmentWeight = Math.round((ratioPct / 100) * 15);
                const calculatedScore = isMismatch
                  ? Math.min(40, 20 + fulfillmentWeight)
                  : Math.min(99, Math.round(50 + categoryScore + fulfillmentWeight));

                return (
                  <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2 shadow-xs transition-all ${
                    isMismatch
                      ? 'bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border-red-200'
                      : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-emerald-200/80'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-extrabold text-xs flex items-center gap-1.5 ${isMismatch ? 'text-red-950' : 'text-emerald-950'}`}>
                        <SparklesIcon size={14} className={isMismatch ? 'text-red-600' : 'text-emerald-600'} />
                        <span>Analitik Kecocokan AI:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 font-black text-[10px] sm:text-[11px] rounded-md shadow-xs ${
                          isMismatch
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-700 text-amber-200'
                        }`}>
                          {calculatedScore}% {isMismatch ? 'Kategori Beda' : 'Sangat Cocok'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAIAnalyticsDetails(!showAIAnalyticsDetails)}
                          className="text-[10px] text-slate-600 underline font-bold cursor-pointer"
                        >
                          {showAIAnalyticsDetails ? 'Tutup' : 'Rincian'}
                        </button>
                      </div>
                    </div>

                    {isMismatch && (
                      <div className="p-2.5 bg-red-100/90 text-red-900 border border-red-200 rounded-xl text-[11px] font-medium leading-relaxed flex items-start gap-1.5">
                        <AlertTriangleIcon size={14} className="text-red-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Peringatan Ketidakcocokan:</strong> {mismatchReason}
                        </div>
                      </div>
                    )}

                    {/* Expandable breakdown details */}
                    {showAIAnalyticsDetails && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-medium text-slate-700 pt-1">
                        <div className="p-2.5 bg-white/95 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                          <span className="text-slate-400 text-[10px] block font-bold">Kesesuaian Gizi:</span>
                          <strong className={`font-extrabold block text-xs ${isMismatch ? 'text-red-700' : 'text-emerald-900'}`}>
                            {nutritionLabel}
                          </strong>
                        </div>
                        <div className="p-2.5 bg-white/95 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                          <span className="text-slate-400 text-[10px] block font-bold">Suhu BPOM:</span>
                          <strong className="text-emerald-900 font-extrabold block text-xs">Aman &lt; 3.5 Jam (Panas &gt;60°C)</strong>
                        </div>
                        <div className="p-2.5 bg-white/95 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                          <span className="text-slate-400 text-[10px] block font-bold">Rasio Pemenuhan:</span>
                          <strong className="text-blue-900 font-extrabold block text-xs">
                            {allocateModal.portions} Porsi ({ratioPct}% Terpenuhi)
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* PRODUCT SELECTOR SECTION (Horizontal Card Slider / Carousel - No Long Vertical Scroll) */}
              <div className="space-y-2 bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 block text-xs">
                    Pilih Produk Surplus Dari Toko Anda:
                  </label>
                  {availableProducts.length > 0 && (
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                      ← Geser kartu →
                    </span>
                  )}
                </div>

                {availableProducts.length > 0 ? (
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 snap-x snap-mandatory">
                    {availableProducts.map((prod) => {
                      const isSelected = allocateModal.selectedFoodId === prod.id;
                      const stock = Number(prod.remainingQuantity || prod.quantity || 0);
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleProductSelectChange(prod.id)}
                          className={`min-w-[185px] max-w-[205px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 shrink-0 snap-start ${
                            isSelected
                              ? 'bg-[#1B3A5C] text-white border-[#D4A843] ring-2 ring-[#D4A843]/50 shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs'
                          }`}
                        >
                          {prod.imageUrl && (
                            <img
                              src={prod.imageUrl}
                              alt={prod.foodName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className={`block font-extrabold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {prod.foodName}
                            </span>
                            <span className={`text-[10px] font-bold block mt-0.5 ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                              Tersedia: {stock} {prod.quantityUnit || 'Porsi'}
                            </span>
                            {isSelected && (
                              <span className="inline-block mt-0.5 text-[8.5px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                                Dipilih
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs font-semibold">
                    Belum ada menu surplus aktif di katalog Anda. Silakan isi porsi estimasi di bawah.
                  </div>
                )}
              </div>

              {/* Portions Allocation Stepper with Thumb-Friendly Buttons */}
              {(() => {
                const targetNeedQty = Number(
                  allocateModal.panti.targetQuantity ||
                  allocateModal.panti.needTitle?.match(/\d+/)?.[0] ||
                  50
                );
                const selProd = availableProducts.find((p) => p.id === allocateModal.selectedFoodId);
                const totalStk = selProd ? Number(selProd.remainingQuantity || selProd.quantity || 30) : 30;
                const maxAllowed = Math.min(totalStk, targetNeedQty);
                const isExceedingNeed = allocateModal.portions > targetNeedQty;
                const isExceedingStock = allocateModal.portions > totalStk;
                const isExceeding = isExceedingNeed || isExceedingStock;
                const remainAfter = Math.max(0, totalStk - allocateModal.portions);

                return (
                  <div className="space-y-2 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-800 block text-xs">
                        Jumlah Porsi Yang Disanggupi:
                      </label>
                      <span className="text-[10.5px] text-slate-600 font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        Kebutuhan Panti: <strong className="text-amber-800">{targetNeedQty} Porsi</strong>
                      </span>
                    </div>

                    {/* Stepper with Large Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAllocateModal({ ...allocateModal, portions: Math.max(1, allocateModal.portions - 5) })}
                        className="w-11 h-11 rounded-xl bg-white border border-slate-300 text-[#1B3A5C] font-black text-lg flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <MinusIcon size={18} />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={maxAllowed}
                        value={allocateModal.portions}
                        onChange={(e) => setAllocateModal({ ...allocateModal, portions: Number(e.target.value) })}
                        className={`flex-1 p-2.5 bg-white border rounded-xl font-mono font-black text-base text-center transition-all ${
                          isExceeding
                            ? 'border-red-500 ring-2 ring-red-400 bg-red-50/40 text-red-700'
                            : 'border-slate-300 text-[#1B3A5C] focus:ring-2 focus:ring-[#D4A843]'
                        }`}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setAllocateModal({ ...allocateModal, portions: Math.min(maxAllowed, allocateModal.portions + 5) })}
                        className="w-11 h-11 rounded-xl bg-white border border-slate-300 text-[#1B3A5C] font-black text-lg flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <PlusIcon size={18} />
                      </button>
                    </div>

                    {/* Quick Percentage Presets */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[0.25, 0.5, 0.75, 1.0].map((pct) => {
                        const val = Math.max(1, Math.round(maxAllowed * pct));
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setAllocateModal({ ...allocateModal, portions: val })}
                            className={`py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              allocateModal.portions === val
                                ? 'bg-[#1B3A5C] text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {Math.round(pct * 100)}% ({val})
                          </button>
                        );
                      })}
                    </div>

                    {/* Split-batch remaining stock indicator */}
                    <div className="p-2 bg-blue-50/80 rounded-xl border border-blue-200 text-[10.5px] flex justify-between items-center">
                      <span className="text-slate-600 font-medium">
                        Stok: <strong>{totalStk}</strong> | Sisa:
                      </span>
                      <span
                        className={`font-black px-2 py-0.5 rounded-md ${
                          remainAfter === 0 ? 'text-slate-700 bg-slate-200' : 'text-emerald-800 bg-emerald-100'
                        }`}
                      >
                        {remainAfter} Porsi
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* LOCKED DELIVERY METHOD & VEHICLE FLEET MATCHING */}
              <div className="p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#1B3A5C] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <TruckIcon size={13} />
                    <span>Metode Pengiriman & Ketentuan Armada:</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-700 text-white font-black text-[9px] uppercase">
                    {allocateModal.portions > 40 ? 'Wajib Mobil Box / Van' : 'Motor Box Cooler'}
                  </span>
                </div>
                <p className="font-black text-slate-900 text-xs">
                  {allocateModal.panti.deliveryLabel}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {allocateModal.panti.deliveryDesc}
                </p>
              </div>

              {/* Interactive 8-Poin BPOM Checklist SOP */}
              <div className="p-3.5 sm:p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                    <ShieldCheckIcon size={15} className="text-emerald-700" />
                    <span>8-Poin SOP Higienitas BPOM RI:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setAllocateModal(prev => ({ ...prev, hygieneChecked: true }))}
                    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[9.5px] rounded cursor-pointer transition-colors"
                  >
                    Verifikasi Semua
                  </button>
                </div>

                <label className="flex items-start gap-2 p-2.5 bg-white rounded-xl border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={allocateModal.hygieneChecked}
                    onChange={(e) => setAllocateModal({ ...allocateModal, hygieneChecked: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-0 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] font-bold text-emerald-950 leading-snug">
                    Saya menyetujui seluruh 8 standar baku kelayakan pangan BPOM RI (batas olah &lt;4 jam, suhu &gt;60°C, kemasan food-grade, organoleptik normal).
                  </span>
                </label>
              </div>

              {/* STICKY FOOTER ACTION BUTTON BAR FOR MOBILE SUPER-APP */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-2.5 pb-1 border-t border-slate-100 z-10 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs py-2 px-3 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
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
                  leftIcon={<CheckIcon size={14} />}
                  disabled={
                    !allocateModal.hygieneChecked ||
                    allocateModal.portions <= 0 ||
                    allocateModal.portions >
                      Number(
                        allocateModal.panti?.targetQuantity ||
                        allocateModal.panti?.needTitle?.match(/\d+/)?.[0] ||
                        50
                      )
                  }
                  className="font-black text-xs text-slate-950 shadow-xs cursor-pointer py-2 px-3.5 rounded-xl whitespace-nowrap"
                >
                  Sanggupi Donasi
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
        title="QR Surat Jalan Donasi Berhasil Diterbitkan"
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
                <CheckIcon size={16} />
                <span>Buka & Kelola di Modul Klaim & Kasir </span>
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

      {/* Authentic Super-App Action Loading Modal */}
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />
    </div>
  );
}
