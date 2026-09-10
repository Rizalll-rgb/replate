'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import {
  PackageIcon,
  SearchIcon,
  CheckIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  TicketIcon,
} from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, HelpCircle, ChevronLeft, ChevronRight, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { MOCK_SURPLUS_FOODS } from '@/lib/mockDatabase';
import { resolveIndonesianAddress } from '@/lib/geoResolver';

export default function ConsumerBrowsePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

  const handleQuickClaim = (item: any) => {
    setActionLoader({ isOpen: true, message: 'Mempersiapkan Checkout...', submessage: `Mengalokasikan "${item.title || item.foodName}"` });
    setTimeout(() => router.push(`/dashboard/checkout/${item.id}`), 600);
  };

  const [foods, setFoods] = useState<any[]>(MOCK_SURPLUS_FOODS);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumerName, setConsumerName] = useState('Konsumen Replate');
  const [consumerAddress, setConsumerAddress] = useState('Surabaya');
  const [activeClaimsCount, setActiveClaimsCount] = useState(1);
  const [completedClaimsCount, setCompletedClaimsCount] = useState(2);
  const [totalSavings, setTotalSavings] = useState(45000);
  const [totalSavedPortions, setTotalSavedPortions] = useState(2);

  // Pagination for Surplus Catalog
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Consumer Verification Status & Explanation Modal
  const [consumerStatus, setConsumerStatus] = useState<'REGULAR_SAVER' | 'PENDING_VERIFICATION' | 'BENEFICIARY_VERIFIED'>('REGULAR_SAVER');
  const [isStatusExplanationModalOpen, setIsStatusExplanationModalOpen] = useState(false);
  const [sktmNumber, setSktmNumber] = useState('');
  const [syncRadius, setSyncRadius] = useState<number>(15);

  // Single Source of Truth: Synchronized with explore page
  const defaultFoods: any[] = MOCK_SURPLUS_FOODS;

  const totalPages = Math.max(1, Math.ceil(foods.length / itemsPerPage));
  const paginatedFoods = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return foods.slice(start, start + itemsPerPage);
  }, [foods, currentPage, itemsPerPage]);

  useEffect(() => {
    const syncAdminRadius = () => {
      try {
        const radius = localStorage.getItem('replate_admin_sync_radius');
        if (radius) {
          setSyncRadius(parseInt(radius));
        } else {
          setSyncRadius(15);
        }
      } catch (_) {
        setSyncRadius(15);
      }
    };
    syncAdminRadius();
    window.addEventListener('storage', syncAdminRadius);
    return () => window.removeEventListener('storage', syncAdminRadius);
  }, []);

  // Modal Verification Form State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [proofNumberInput, setProofNumberInput] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string | null>(null);
  const [proofType, setProofType] = useState('SKTM');

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Top Smart Matching 2.0 recommendations dynamically matched from global synced catalog
  const smartMatchedItems = React.useMemo(() => {
    if (!foods || foods.length === 0) return [];
    const candidates = foods
      .filter((f) => f.status === 'AVAILABLE' || !f.status)
      .map((f, idx) => {
        const orig = Number(f.originalPrice) || 25000;
        const discPrice = f.discountPrice !== undefined ? Number(f.discountPrice) : (Number(f.price) || 10000);
        const discountPct = orig > discPrice ? Math.round(((orig - discPrice) / orig) * 100) : 50;
        const matchScore = Math.min(99, Math.max(88, 98 - (idx * 2)));
        return {
          id: f.id,
          title: f.title || f.foodName,
          provider: f.providerName || 'Mitra Replate',
          price: discPrice,
          originalPrice: orig,
          discount: `${discountPct}%`,
          distance: f.distance || '1.2 km',
          matchScore,
          reason: `Jarak sangat dekat (< ${syncRadius} km) • Diskon ${discountPct}% • Higienis BPOM`,
          pickupTime: f.pickupTime || 'Hari ini',
          imageUrl: f.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
          rawFood: f,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return candidates.slice(0, 4);
  }, [foods, syncRadius]);

  const mapToFoodItem = (item: any) => ({
    id: item.id || `food-${Math.random()}`,
    title: item.foodName || item.title || 'Makanan Surplus',
    description: item.description || 'Makanan surplus terverifikasi higienis SOP BPOM RI.',
    providerName: item.provider?.organizationName || item.provider?.name || item.providerName || item.storeName || 'Warung Bakso Pak Kumis',
    providerPhone: item.provider?.phone || item.providerPhone || '081234567891',
    providerAddress: item.address || item.pickupAddress || item.providerAddress || 'Jl. Genteng Kali No. 45, Surabaya',
    originalPrice: Number(item.originalPrice || 25000),
    discountPrice: item.discountPrice !== undefined ? Number(item.discountPrice) : (item.pricingScheme === 'RESCUE_SALE' ? Number(item.price || 5000) : (item.price !== undefined ? Number(item.price) : 0)),
    price: item.discountPrice !== undefined ? Number(item.discountPrice) : (item.pricingScheme === 'RESCUE_SALE' ? Number(item.price || 5000) : (item.price !== undefined ? Number(item.price) : 0)),
    quantity: typeof item.quantity === 'number' ? `${item.quantity} ${item.quantityUnit || 'Porsi'}` : item.quantity || '10 Porsi',
    pickupTime: item.pickupTime || 'Hari ini 19:00 - 21:00 WIB',
    distance: item.distance || '1.2 km',
    category: item.foodCategory || item.category || 'MAKANAN_BERAT',
    isFree: item.discountPrice === 0 || item.pricingScheme !== 'RESCUE_SALE' || item.distributionType === 'FREE' || item.price === 0,
    type: (item.discountPrice === 0 || item.pricingScheme !== 'RESCUE_SALE' || item.distributionType === 'FREE' || item.price === 0) ? 'DONATION' : 'RESCUE_SALE',
    imageUrl: item.imageUrl || item.photos?.[0] || item.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    rating: item.rating || 4.8,
    storageCondition: item.storageCondition || 'ROOM_TEMP',
    packagingType: item.packagingType || 'PACKAGED',
    weightPerUnitKg: Number(item.weightPerUnitKg || 0.4),
    allergens: item.allergens || ['Nut-Free', 'Halal BPJPH', 'Wadah Steril'],
    lat: item.lat || item.latitude || (item.address || item.pickupAddress || item.providerAddress ? resolveIndonesianAddress(item.address || item.pickupAddress || item.providerAddress).lat : -7.65569),
    lng: item.lng || item.longitude || (item.address || item.pickupAddress || item.providerAddress ? resolveIndonesianAddress(item.address || item.pickupAddress || item.providerAddress).lng : 111.27984),
    status: item.status || 'AVAILABLE',
  });

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      if (isFresh) {
        setConsumerStatus('REGULAR_SAVER');
        setSktmNumber('');
      }

      if (session?.user?.name) {
        setConsumerName(session.user.name);
      }

      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName || parsed.contactPerson || parsed.name) {
          setConsumerName(parsed.entityName || parsed.contactPerson || parsed.name);
        }
        if (parsed.address) setConsumerAddress(parsed.address);
      } else {
        const reg = localStorage.getItem('replate_registered_user');
        if (reg) {
          const parsedReg = JSON.parse(reg);
          if (parsedReg.name) setConsumerName(parsedReg.name);
        }
      }

      // Count active & completed claims
      const claimsRaw = localStorage.getItem('replate_active_claims');
      if (claimsRaw) {
        const parsedClaims = JSON.parse(claimsRaw);
        if (Array.isArray(parsedClaims)) {
          const active = parsedClaims.filter((c: any) => c.status !== 'COMPLETED').length;
          const completed = parsedClaims.filter((c: any) => c.status === 'COMPLETED');
          setActiveClaimsCount(active);
          const totalCompleted = completed.length > 0 ? completed.length : (isFresh ? 0 : 2);
          setCompletedClaimsCount(totalCompleted);
          setTotalSavedPortions(totalCompleted);

          let computedSavings = 0;
          completed.forEach((c: any) => {
            const amt = Number(c.totalAmount) || 10000;
            const estOriginal = amt === 0 ? 25000 : amt * 2.5;
            computedSavings += (estOriginal - amt);
          });
          setTotalSavings(computedSavings > 0 ? computedSavings : (isFresh ? 0 : 45000));
        } else if (isFresh) {
          setActiveClaimsCount(0);
          setCompletedClaimsCount(0);
          setTotalSavedPortions(0);
          setTotalSavings(0);
        }
      } else if (isFresh) {
        setActiveClaimsCount(0);
        setCompletedClaimsCount(0);
        setTotalSavedPortions(0);
        setTotalSavings(0);
      }
    } catch (_) { }

    try {
      const savedStatus = localStorage.getItem('replate_consumer_verification_status');
      if (savedStatus) {
        setConsumerStatus(savedStatus as any);
      }
    } catch (_) { }

    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]')
        .filter((item: any) => item.status === 'AVAILABLE' || !item.status);
    } catch (_) {}

    fetch('/api/surplus')
      .then((res) => res.json())
      .then((data) => {
        let items: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          items = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          items = data.data;
        }

        const combined = [...localItems, ...items];
        const deduped = Array.from(
          combined.reduce((map, item) => {
            if (!map.has(item.id)) map.set(item.id, item);
            return map;
          }, new Map<string, any>()).values()
        );

        if (deduped.length > 0) {
          const mappedCombined = deduped.map(mapToFoodItem);
          const defaultUnadded = defaultFoods.filter((df) => !mappedCombined.some((m) => m.id === df.id));
          setFoods([...mappedCombined, ...defaultUnadded]);
        } else {
          setFoods(defaultFoods);
        }
      })
      .catch(() => {
        if (localItems.length > 0) {
          const mappedLocal = localItems.map(mapToFoodItem);
          const defaultUnadded = defaultFoods.filter((df) => !mappedLocal.some((m) => m.id === df.id));
          setFoods([...mappedLocal, ...defaultUnadded]);
        } else {
          setFoods(defaultFoods);
        }
      });
  }, [session]);

  const handleAddToCart = (foodId: string) => {
    const targetFood = foods.find((f) => f.id === foodId);
    if (!targetFood) return;

    try {
      const tasKlaimRaw = localStorage.getItem('replate_tas_klaim');
      const cartRaw = localStorage.getItem('replate_cart');
      let items: any[] = [];
      if (tasKlaimRaw) {
        items = JSON.parse(tasKlaimRaw);
      } else if (cartRaw) {
        items = JSON.parse(cartRaw);
      }

      const existingIndex = items.findIndex((i: any) => String(i.id) === String(foodId));
      if (existingIndex > -1) {
        items[existingIndex].quantity = (Number(items[existingIndex].quantity) || 1) + 1;
      } else {
        items.push({
          id: String(targetFood.id),
          foodName: targetFood.title || targetFood.foodName || 'Surplus Makanan',
          name: targetFood.title || targetFood.foodName || 'Surplus Makanan',
          providerName: targetFood.providerName || targetFood.provider || 'Mitra Replate',
          provider: targetFood.providerName || targetFood.provider || 'Mitra Replate',
          price: targetFood.discountPrice !== undefined ? targetFood.discountPrice : (targetFood.price || 0),
          originalPrice: targetFood.originalPrice || (targetFood.price ? targetFood.price * 2 : 25000),
          quantity: 1,
          maxQuantity: 10,
          imageUrl: targetFood.imageUrl || targetFood.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
          pickupTime: targetFood.pickupTime || 'Hari ini 19:00 - 21:00 WIB',
          isFree: targetFood.isFree || targetFood.discountPrice === 0 || targetFood.price === 0,
        });
      }

      localStorage.setItem('replate_tas_klaim', JSON.stringify(items));
      localStorage.setItem('replate_cart', JSON.stringify(items));
      window.dispatchEvent(new Event('replate_cart_updated'));

      setToastState({
        isOpen: true,
        message: `"${targetFood.title || targetFood.foodName}" berhasil dimasukkan ke Tas Klaim!`,
        type: 'success',
      });
    } catch (_) {
      setToastState({
        isOpen: true,
        message: 'Gagal menambahkan ke tas klaim.',
        type: 'error',
      });
    }
  };

  const handleClaim = async (id: string) => {
    const targetFood = foods.find((f) => f.id === id);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: id, quantity: 1 }),
      });
      const data = await res.json();

      if (data.success) {
        try {
          const newClaim = {
            id: data.data?.claimId || `RPL-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            code: data.data?.claimId || `RPL-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            foodId: id,
            foodName: targetFood?.foodName || targetFood?.title || 'Surplus Makanan',
            providerName: targetFood?.providerName || 'Warung Bakso Pak Kumis Surabaya',
            provider: targetFood?.providerName || 'Warung Bakso Pak Kumis Surabaya',
            quantity: '1 Porsi',
            totalAmount: targetFood?.price || targetFood?.discountPrice || 0,
            status: (targetFood?.price === 0 || targetFood?.distributionType === 'FREE') ? 'READY_FOR_PICKUP' : 'READY_FOR_PICKUP',
            deliveryMethod: 'SELF_PICKUP',
            method: 'SELF_PICKUP',
            methodLabel: 'Ambil Mandiri (Self-Pickup)',
            paymentMethod: (targetFood?.price === 0 || targetFood?.distributionType === 'FREE') ? 'FREE' : 'COD',
            recipientName: consumerName || 'Budi Santoso',
            recipientPhone: '0812-3456-7890',
            deliveryAddress: consumerAddress || 'Surabaya',
            qrCode: data.data?.qrCodePayload || `REPLATE-CLAIM-${Date.now()}`,
            pickupAddress: targetFood?.pickupAddress || 'Jl. Raya Darmo No. 45, Surabaya',
            pickupTime: targetFood?.pickupTime || 'Hari ini 21:00 WIB',
            claimedAt: new Date().toISOString(),
            createdAt: 'Hari ini',
            hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          };
          const existingClaims = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
          localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingClaims]));
        } catch (_) { }

        setToastState({
          isOpen: true,
          message: `Berhasil mengklaim "${targetFood?.foodName || targetFood?.title}". Tiket Resi siap di menu Klaim Saya.`,
          type: 'success',
        });
        router.push('/dashboard/consumer/my-claims');
      } else {
        setToastState({
          isOpen: true,
          message: data.error || 'Gagal melakukan klaim makanan.',
          type: 'error',
        });
      }
    } catch {
      setToastState({
        isOpen: true,
        message: 'Terjadi kesalahan koneksi.',
        type: 'error',
      });
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofNumberInput.trim()) {
      alert('Mohon masukkan nomor dokumen SKTM atau kartu bansos resmi.');
      return;
    }

    setConsumerStatus('PENDING_VERIFICATION');
    setSktmNumber(proofNumberInput);
    try {
      localStorage.setItem('replate_consumer_verification_status', 'PENDING_VERIFICATION');
      localStorage.setItem('replate_consumer_verification_proof', proofNumberInput);
    } catch (_) { }

    setIsVerificationModalOpen(false);
    setToastState({
      isOpen: true,
      message: 'Pengajuan verifikasi status rentan berhasil dikirim ke Admin Dinsos Replate.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-5 sm:space-y-8 max-w-6xl mx-auto pb-12">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />

      {/* Sleek Modern Header Card (Seragam Antar Modul Provider, Beneficiary & Consumer) */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[10px] font-black uppercase tracking-wider rounded-md">
                Dashboard Food Consumer
              </span>
              <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Konsumen Reguler • Akses Rescue Sale & Donasi Rp 0</span>
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-[#1B3A5C] tracking-tight">
              Selamat Datang, {consumerName}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
              Hemat pengeluaran belanja dengan Rescue Sale dan selamatkan donasi makanan surplus Rp 0 berstandar BPOM RI.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <Link href="/dashboard/consumer/my-claims">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<TicketIcon size={14} className="text-[#1B3A5C]" />}
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Klaim & Riwayat Saya
              </Button>
            </Link>
            <Link href="/dashboard/explore">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<SearchIcon size={14} className="text-slate-950" />}
                className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
              >
                Eksplor Makanan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (2-kolom di mobile, 4-kolom di desktop — Seragam Antar Role) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Card className="border-slate-200 shadow-2xs sm:shadow-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
          <CardBody className="p-0 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block truncate">Total Hemat Belanja</span>
            <strong className="text-base sm:text-xl font-black text-emerald-600 font-mono block">
              Rp {totalSavings.toLocaleString('id-ID')}
            </strong>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold flex items-center gap-1">
              <span>Diskon ~65%</span>
            </span>
          </CardBody>
        </Card>

        <Card className="border-slate-200 shadow-2xs sm:shadow-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
          <CardBody className="p-0 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block truncate">Makanan Diselamatkan</span>
            <strong className="text-base sm:text-xl font-black text-[#1B3A5C] font-mono block">
              {totalSavedPortions} Porsi
            </strong>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckIcon size={10} className="text-emerald-600" />
              <span>~{(totalSavedPortions * 0.9).toFixed(1)} kg CO2 Dicegah</span>
            </span>
          </CardBody>
        </Card>

        <Card className="border-slate-200 shadow-2xs sm:shadow-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
          <CardBody className="p-0 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block truncate">Klaim Aktif</span>
            <strong className="text-base sm:text-xl font-black text-[#D4A843] font-mono block">
              {activeClaimsCount} Pesanan
            </strong>
            <span className="text-[9px] sm:text-[10px] text-amber-700 font-bold flex items-center gap-1">
              <ClockIcon size={10} />
              <span>{activeClaimsCount > 0 ? 'Siap Diambil di Gerai' : 'Belum Ada Klaim Aktif'}</span>
            </span>
          </CardBody>
        </Card>

        <Card
          onClick={() => setIsStatusExplanationModalOpen(true)}
          className="border-slate-200 shadow-2xs sm:shadow-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 hover:border-[#1B3A5C]/40 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="text-[8.5px] sm:text-[9px] font-bold text-[#1B3A5C] bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <Info size={10} /> Info
            </span>
          </div>
          <CardBody className="p-0 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block truncate">Status Akun Konsumen</span>
            <strong className="text-xs sm:text-sm font-black text-slate-800 block truncate">
              Konsumen Reguler
            </strong>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheckIcon size={10} className="text-emerald-600" />
              <span className="truncate">
                Rescue Sale & Donasi Rp 0 Bebas Biaya
              </span>
            </span>
          </CardBody>
        </Card>
      </div>

      {/* SMART MATCHING ENGINE 2.0 (KONSUMEN): Truly Responsive across Mobile, Tablet, and Desktop */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest text-[#D4A843] block mb-0.5">
              SMART MATCHING ENGINE 2.0 (KONSUMEN)
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-base sm:text-xl font-black text-[#1B3A5C]">
                Rekomendasi Paling Cocok Untuk Anda
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] sm:text-[10px] font-black rounded-md self-start sm:self-auto">
                Radius: &lt; {syncRadius} km
              </span>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1">
            <MapPinIcon size={12} className="text-slate-400" />
            Radius &lt; {syncRadius} km
          </span>
        </div>

        {/* Responsive Grid: Mobile peek carousel -> Tablet 2-col -> Desktop 2-col with rich aspect ratio */}
        <div className="flex md:grid md:grid-cols-2 gap-3.5 sm:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-2">
          {smartMatchedItems.map((item) => (
            <div
              key={item.id}
              className="w-[85vw] max-w-[340px] md:max-w-none md:w-auto shrink-0 snap-start p-4 sm:p-5 bg-gradient-to-br from-white via-white to-amber-50/40 rounded-2xl sm:rounded-3xl border-2 border-amber-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden group"
            >
              <div className="flex items-start gap-3.5">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white font-black text-[9px] rounded-md shadow-xs">
                    Diskon {item.discount}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#1B3A5C] text-[#D4A843] font-black text-[9.5px] rounded-md font-mono">
                      Skor {item.matchScore}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                      <MapPinIcon size={10} className="text-slate-400" />
                      {item.distance}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-[#1B3A5C] leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                    <ShieldCheckIcon size={11} className="text-emerald-600 shrink-0" />
                    <span>{item.provider}</span>
                  </p>
                  <p className="text-[10.5px] text-amber-900 font-bold line-clamp-1 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{item.reason}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-amber-200/80">
                <div>
                  <div className="text-[10px] text-slate-400 line-through font-medium">
                    Rp {item.originalPrice.toLocaleString('id-ID')}
                  </div>
                  <div className="text-base font-black text-[#1B3A5C] leading-none">
                    Rp {item.price.toLocaleString('id-ID')}
                  </div>
                </div>

                <Button
                  onClick={() => handleQuickClaim(item)}
                  variant="gold"
                  size="sm"
                  className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs cursor-pointer rounded-xl shrink-0"
                >
                  Klaim Cepat →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Food Explorer Grid with Pagination */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#1B3A5C]">
              Semua Katalog Makanan Surplus Aktif
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {foods.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, foods.length)} dari total {foods.length} makanan siap diselamatkan
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link href="/dashboard/explore">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-bold text-[#1B3A5C] border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Semua di Eksplor Pangan</span>
                <ExternalLink size={13} className="text-[#1B3A5C]" />
              </Button>
            </Link>
          </div>
        </div>

        <FoodGrid
          foods={paginatedFoods}
          onClaim={handleClaim}
          onDetail={(id) => {
            const item = foods.find((f) => f.id === id);
            if (item) {
              setSelectedFood(item);
              setIsModalOpen(true);
            }
          }}
          onAddToCart={handleAddToCart}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
              Halaman <strong className="text-slate-800 font-black">{currentPage}</strong> dari <strong className="text-slate-800 font-black">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                <span>Sebelumnya</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      pageNum === currentPage
                        ? 'bg-[#1B3A5C] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <span>Selanjutnya</span>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* Explore Pangan Full Banner Call-Out */}
        <div className="bg-gradient-to-r from-slate-900 to-[#1B3A5C] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-black flex items-center gap-2 justify-center sm:justify-start text-white drop-shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-white drop-shadow-xs">Ingin Filter Kategori Lengkap & Peta Interaktif?</span>
            </h4>
            <p className="text-xs text-slate-100/90 max-w-xl font-medium">
              Akses seluruh katalog makanan surplus, filter kategori, donasi Rp 0 panti asuhan, dan geofencing GPS di halaman Eksplor Pangan.
            </p>
          </div>
          <Link href="/dashboard/explore" className="shrink-0 w-full sm:w-auto">
            <Button
              variant="gold"
              size="sm"
              className="w-full sm:w-auto font-black text-xs text-slate-950 px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
            >
              Buka Eksplor Pangan Lengkap →
            </Button>
          </Link>
        </div>
      </section>

      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          food={selectedFood}
          onClaim={handleClaim}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Modal Penjelasan Status Akun Konsumen (Seragam Tanpa SKTM) */}
      <Modal
        isOpen={isStatusExplanationModalOpen}
        onClose={() => setIsStatusExplanationModalOpen(false)}
        title="Informasi Status Akun Konsumen"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#1B3A5C] font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Semua Akun Konsumen: Konsumen Reguler</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Di Replate, seluruh akun konsumen diseragamkan menjadi <strong>Konsumen Reguler</strong>. Anda tidak perlu mengunggah surat keterangan SKTM atau kartu bansos.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl border bg-amber-50/70 border-amber-300 space-y-1">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4A843]"></span>
                <span>1. Akses Rescue Sale (Diskon s/d 70%)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-4">
                Beli surplus makanan siap santap berkualitas hotel/resto ternama dengan potongan harga besar untuk menghemat belanja dan mencegah food waste.
              </p>
            </div>

            <div className="p-4 rounded-2xl border bg-emerald-50/70 border-emerald-300 space-y-1">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>2. Akses Donasi Food Rescue Rp 0 (Bebas Biaya)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-4">
                Konsumen reguler juga berhak langsung mengklaim makanan donasi gratis (Rp 0) yang dialokasikan oleh gerai mitra tanpa perlu verifikasi dokumen.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsStatusExplanationModalOpen(false)}
              className="text-xs font-black px-5 py-2 rounded-xl text-slate-950 shadow-xs cursor-pointer"
            >
              Mengerti & Siap Menjelajah
            </Button>
          </div>
        </div>
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
