'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Bell,
  ShoppingBag,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  UtensilsCrossed,
  Gift,
  Croissant,
  Apple,
  Navigation,
  Compass,
  Coins,
  Ticket,
  QrCode,
  Award,
  Trees,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Info,
  X,
  ExternalLink,
  Flame,
  Check,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { MOCK_SURPLUS_FOODS } from '@/lib/mockDatabase';
import { resolveIndonesianAddress } from '@/lib/geoResolver';

export default function ConsumerSuperAppPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Basic User & Storage States
  const [consumerName, setConsumerName] = useState('Konsumen Replate');
  const [consumerAddress, setConsumerAddress] = useState('Gubeng, Surabaya');
  const [syncRadius, setSyncRadius] = useState<number>(15);
  const [totalSavings, setTotalSavings] = useState(45000);
  const [totalSavedPortions, setTotalSavedPortions] = useState(3);
  const [activeClaimsCount, setActiveClaimsCount] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  // Foods & Filtering States
  const [foods, setFoods] = useState<any[]>(MOCK_SURPLUS_FOODS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Pagination for 2-column catalog
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Interactive Modals
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isBPOMModalOpen, setIsBPOMModalOpen] = useState(false);

  // Loader & Toast
  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
    submessage: '',
  });
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Flash Rescue Live Countdown Timer (Ticks every second)
  const [secondsLeft, setSecondsLeft] = useState(5520); // ~1h 32m
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 7200));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Rotating Hero Campaign Banner
  const [bannerIndex, setBannerIndex] = useState(0);
  const heroBanners = [
    {
      badge: 'Gerakan Pahlawan Pangan',
      title: '520+ Porsi Terselamatkan Hari Ini di Surabaya',
      desc: 'Mencegah 1.300 kg jejak emisi gas metana dari TPA Benowo. Belanja cerdas sambil jaga bumi!',
      actionText: 'Eksplor Penyelamatan',
      accentColor: 'from-[#0D382B] via-[#144E3D] to-[#0B253D]',
      borderColor: 'border-emerald-500/50',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      badge: 'Mitra Resto & Bakery Baru',
      title: 'Dapur Cokelat & Hotel Bumi Sedia Rescue Sale',
      desc: 'Nikmati hidangan artisan dan kue berkualitas hotel bintang 5 dengan diskon hingga 70%.',
      actionText: 'Lihat Menu Resto',
      accentColor: 'from-[#2B1B0D] via-[#4A3215] to-[#122238]',
      borderColor: 'border-amber-500/50',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      badge: 'Gamifikasi Hijau',
      title: 'Kumpulkan EcoPoints, Tukar Bibit Mangrove',
      desc: 'Setiap 1 porsi yang kamu selamatkan menghasilkan 40 EcoPoints untuk program restorasi pantai.',
      actionText: 'Tukar Reward',
      accentColor: 'from-[#122E4A] via-[#1A456E] to-[#0A3D2F]',
      borderColor: 'border-[#D4A843]/50',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
  ];

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(bannerTimer);
  }, [heroBanners.length]);

  // Sync Cart Badge Count
  const updateCartCount = () => {
    try {
      const tasKlaimRaw = localStorage.getItem('replate_tas_klaim');
      const cartRaw = localStorage.getItem('replate_cart');
      const parsed = JSON.parse(tasKlaimRaw || cartRaw || '[]');
      const count = parsed.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
      setCartCount(count);
    } catch (_) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('replate_cart_updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('replate_cart_updated', updateCartCount);
    };
  }, []);

  // Sync Profile, Session, and Database
  useEffect(() => {
    try {
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

      const claimsRaw = localStorage.getItem('replate_consumer_claims');
      if (claimsRaw) {
        const parsedClaims = JSON.parse(claimsRaw);
        const active = parsedClaims.filter((c: any) => c.status === 'READY_FOR_PICKUP' || c.status === 'PENDING').length;
        const completed = parsedClaims.filter((c: any) => c.status === 'COMPLETED').length;
        setActiveClaimsCount(active);
        setTotalSavedPortions(completed > 0 ? completed + 2 : 3);

        let savings = 0;
        parsedClaims.forEach((c: any) => {
          const orig = Number(c.originalPrice || 25000);
          const pay = Number(c.price || c.discountPrice || 0);
          savings += Math.max(0, orig - pay);
        });
        setTotalSavings(savings > 0 ? savings : 45000);
      }
    } catch (_) {}

    // Fetch live surplus from API & LocalStorage
    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]').filter(
        (item: any) => item.status === 'AVAILABLE' || !item.status
      );
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
          combined
            .reduce((map, item) => {
              if (!map.has(item.id)) map.set(item.id, item);
              return map;
            }, new Map<string, any>())
            .values()
        );

        if (deduped.length > 0) {
          const mapped = deduped.map(mapToFoodItem);
          const defaultUnadded = MOCK_SURPLUS_FOODS.filter((df) => !mapped.some((m) => m.id === df.id));
          setFoods([...mapped, ...defaultUnadded]);
        } else {
          setFoods(MOCK_SURPLUS_FOODS);
        }
      })
      .catch(() => {
        setFoods(MOCK_SURPLUS_FOODS);
      });
  }, [session]);

  const mapToFoodItem = (item: any) => ({
    id: item.id || `food-${Math.random()}`,
    title: item.foodName || item.title || 'Makanan Surplus Higienis',
    description: item.description || 'Surplus berkualitas prima sesuai SOP keamanan pangan BPOM RI.',
    providerName: item.provider?.organizationName || item.provider?.name || item.providerName || item.storeName || 'Mitra Replate',
    providerPhone: item.provider?.phone || item.providerPhone || '0812-3456-7890',
    providerAddress: item.address || item.pickupAddress || item.providerAddress || 'Surabaya, Jawa Timur',
    originalPrice: Number(item.originalPrice || 25000),
    discountPrice: item.discountPrice !== undefined ? Number(item.discountPrice) : (item.pricingScheme === 'RESCUE_SALE' ? Number(item.price || 8000) : (item.price !== undefined ? Number(item.price) : 0)),
    price: item.discountPrice !== undefined ? Number(item.discountPrice) : (item.pricingScheme === 'RESCUE_SALE' ? Number(item.price || 8000) : (item.price !== undefined ? Number(item.price) : 0)),
    quantity: typeof item.quantity === 'number' ? `${item.quantity} ${item.quantityUnit || 'Porsi'}` : item.quantity || '5 Porsi',
    pickupTime: item.pickupTime || 'Hari ini 18:30 - 21:00 WIB',
    distance: item.distance || '1.2 km',
    category: item.foodCategory || item.category || 'MEALS',
    isFree: item.discountPrice === 0 || item.pricingScheme !== 'RESCUE_SALE' || item.distributionType === 'FREE' || item.price === 0,
    type: (item.discountPrice === 0 || item.pricingScheme !== 'RESCUE_SALE' || item.distributionType === 'FREE' || item.price === 0) ? 'DONATION' : 'RESCUE_SALE',
    imageUrl: item.imageUrl || item.photos?.[0] || item.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    rating: item.rating || 4.9,
    storageCondition: item.storageCondition || 'ROOM_TEMP',
    packagingType: item.packagingType || 'PACKAGED',
    weightPerUnitKg: Number(item.weightPerUnitKg || 0.4),
    allergens: item.allergens || ['Higienis BPOM', 'Wadah Sanitasi'],
    lat: item.lat || -7.2575,
    lng: item.lng || 112.7521,
    status: item.status || 'AVAILABLE',
  });

  // EcoPoints calculation: 40 points per portion saved + 20 baseline
  const ecoPoints = totalSavedPortions * 40 + 20;

  // Add to Cart handler
  const handleAddToCart = (foodItem: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const tasKlaimRaw = localStorage.getItem('replate_tas_klaim');
      const cartRaw = localStorage.getItem('replate_cart');
      let items: any[] = [];
      if (tasKlaimRaw) {
        items = JSON.parse(tasKlaimRaw);
      } else if (cartRaw) {
        items = JSON.parse(cartRaw);
      }

      const existingIndex = items.findIndex((i: any) => String(i.id) === String(foodItem.id));
      if (existingIndex > -1) {
        items[existingIndex].quantity = (Number(items[existingIndex].quantity) || 1) + 1;
      } else {
        items.push({
          id: String(foodItem.id),
          foodName: foodItem.title || foodItem.foodName || 'Surplus Makanan',
          name: foodItem.title || foodItem.foodName || 'Surplus Makanan',
          providerName: foodItem.providerName || foodItem.provider || 'Mitra Replate',
          provider: foodItem.providerName || foodItem.provider || 'Mitra Replate',
          price: foodItem.discountPrice !== undefined ? foodItem.discountPrice : (foodItem.price || 0),
          originalPrice: foodItem.originalPrice || (foodItem.price ? foodItem.price * 2 : 25000),
          quantity: 1,
          maxQuantity: 10,
          imageUrl: foodItem.imageUrl || foodItem.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
          pickupTime: foodItem.pickupTime || 'Hari ini 19:00 - 21:00 WIB',
          isFree: foodItem.isFree || foodItem.discountPrice === 0 || foodItem.price === 0,
        });
      }

      localStorage.setItem('replate_tas_klaim', JSON.stringify(items));
      localStorage.setItem('replate_cart', JSON.stringify(items));
      window.dispatchEvent(new Event('replate_cart_updated'));
      updateCartCount();

      setToastState({
        isOpen: true,
        message: `"${foodItem.title || foodItem.foodName}" berhasil dimasukkan ke Tas Klaim!`,
        type: 'success',
      });
    } catch (_) {
      setToastState({
        isOpen: true,
        message: 'Gagal menambahkan makanan ke tas klaim.',
        type: 'error',
      });
    }
  };

  // Quick Claim Action (direct to checkout)
  const handleQuickClaim = (item: any) => {
    setActionLoader({
      isOpen: true,
      message: 'Mempersiapkan Checkout SuperApp...',
      submessage: `Mengamankan porsi "${item.title || item.foodName}"`,
    });
    setTimeout(() => {
      router.push(`/dashboard/checkout/${item.id}`);
    }, 600);
  };

  // Filtered Foods computation based on search & category
  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.providerName && item.providerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (activeCategoryFilter === 'ALL') return true;
      if (activeCategoryFilter === 'RESCUE_SALE') return !item.isFree && item.price > 0;
      if (activeCategoryFilter === 'FREE') return item.isFree || item.price === 0;
      if (activeCategoryFilter === 'FLASH') return item.originalPrice > item.price && (item.originalPrice - item.price) / item.originalPrice >= 0.6;
      if (activeCategoryFilter === 'BAKERY') return item.category === 'BAKERY' || (item.title && item.title.toLowerCase().includes('roti'));
      if (activeCategoryFilter === 'PRODUCE') return item.category === 'PRODUCE' || (item.title && item.title.toLowerCase().includes('buah')) || (item.title && item.title.toLowerCase().includes('sayur'));
      if (activeCategoryFilter === 'NEARBY') {
        const dist = parseFloat(item.distance) || 3.0;
        return dist <= 2.0;
      }
      return true;
    });
  }, [foods, searchQuery, activeCategoryFilter]);

  // Paginated Foods
  const totalPages = Math.max(1, Math.ceil(filteredFoods.length / itemsPerPage));
  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFoods.slice(start, start + itemsPerPage);
  }, [filteredFoods, currentPage, itemsPerPage]);

  // Flash Rescue Highlight Items (High discount items with urgent pickup)
  const flashRescueItems = useMemo(() => {
    return foods
      .filter((f) => !f.isFree && f.originalPrice > f.price)
      .slice(0, 5)
      .map((f, idx) => {
        const orig = f.originalPrice || 30000;
        const price = f.price || 10000;
        const discPct = Math.round(((orig - price) / orig) * 100);
        return {
          ...f,
          discountPct: discPct,
          urgencyText: `Sisa ${3 + idx} Porsi • Ambil s/d 21.30 WIB`,
        };
      });
  }, [foods]);

  // Smart Matching AI Recommendations
  const smartMatchedItems = useMemo(() => {
    return foods.slice(0, 4).map((f, idx) => {
      const orig = f.originalPrice || 25000;
      const price = f.price || 8000;
      const discPct = orig > price ? Math.round(((orig - price) / orig) * 100) : 60;
      return {
        ...f,
        matchScore: 98 - idx * 3,
        discountPct: `${discPct}%`,
        matchReason: `Radius sangat dekat (< ${syncRadius} km) • Diskon ${discPct}% • Higienis BPOM`,
      };
    });
  }, [foods, syncRadius]);

  return (
    <div className="-m-4 sm:-m-6 min-h-screen bg-gradient-to-b from-[#071320] via-[#0B1A2C] to-[#050E18] text-slate-100 font-sans pb-28">
      {/* 1. TOP STICKY SUPERAPP HEADER */}
      <header className="sticky top-0 z-40 bg-[#0A1828]/95 backdrop-blur-md border-b border-[#1E3B5C] px-3.5 sm:px-6 py-3 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          {/* Location Picker Pill */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#122A45] hover:bg-[#1A385C] border border-[#2B5480] px-3 py-1.5 rounded-full transition-all cursor-pointer text-left max-w-[65%] sm:max-w-md group"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4A843] shrink-0 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block leading-tight font-medium">Zona Penjemputan Anda</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-slate-100 truncate">{consumerAddress}</span>
                <span className="text-[10px] text-[#D4A843] font-bold shrink-0">(&lt;{syncRadius} km) ▾</span>
              </div>
            </div>
          </button>

          {/* Action Icons: Notification & Tas Klaim */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/notifications">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-[#122A45] hover:bg-[#1A385C] border border-[#2B5480] flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer relative"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
              </button>
            </Link>

            <Link href="/dashboard/cart">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-[#D4A843] to-[#E5B954] hover:brightness-110 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer relative"
                title="Tas Klaim"
              >
                <ShoppingBag className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">Tas Klaim</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-black leading-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>

        {/* Real-time Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#D4A843] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari roti artisan, nasi box, buah surplus terdekat..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#071322] border border-[#23456C] focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843] rounded-2xl text-xs text-white placeholder:text-slate-400 font-medium transition-all outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      <div className="px-3.5 sm:px-6 py-4 space-y-5 max-w-7xl mx-auto">
        {/* 2. THE ECO-IMPACT & SAVINGS WALLET (Widget ala GoPay Replate) */}
        <section className="bg-gradient-to-br from-[#0C243B] via-[#103452] to-[#08352A] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-[#D4A843]/60 shadow-2xl relative overflow-hidden space-y-4">
          {/* Ambient Glow & Badge */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10 border-b border-[#234F77]/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#D4A843]/20 border border-[#D4A843] flex items-center justify-center shrink-0 shadow-inner">
                <Coins className="w-5 h-5 text-[#D4A843]" />
              </div>
              <div>
                <span className="text-[10px] text-[#D4A843] font-black uppercase tracking-widest block">
                  Dompet Dampak & Penghematan
                </span>
                <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                  <span>Halo, {consumerName}</span>
                  <span className="text-[9.5px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Pahlawan Pangan
                  </span>
                </h2>
              </div>
            </div>

            {/* EcoPoints Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-[#07192A]/80 border border-[#234F77] px-3 py-1.5 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <div className="text-right">
                <span className="text-[9.5px] text-slate-400 block font-medium">EcoPoints Replate</span>
                <strong className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                  {ecoPoints} Poin
                </strong>
              </div>
            </div>
          </div>

          {/* 3 Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10">
            <div className="bg-[#081C30]/80 border border-[#234A72]/80 rounded-xl p-2.5 sm:p-3 text-center space-y-0.5">
              <span className="text-[9.5px] sm:text-[10.5px] text-slate-400 font-bold block truncate">
                Total Hemat
              </span>
              <strong className="text-xs sm:text-lg font-black text-emerald-400 font-mono block">
                Rp {totalSavings.toLocaleString('id-ID')}
              </strong>
              <span className="text-[8.5px] sm:text-[9.5px] text-emerald-300/80 font-bold block">
                Diskon ~65%
              </span>
            </div>

            <div className="bg-[#081C30]/80 border border-[#234A72]/80 rounded-xl p-2.5 sm:p-3 text-center space-y-0.5">
              <span className="text-[9.5px] sm:text-[10.5px] text-slate-400 font-bold block truncate">
                Porsi Selamat
              </span>
              <strong className="text-xs sm:text-lg font-black text-amber-300 font-mono block">
                {totalSavedPortions} Porsi
              </strong>
              <span className="text-[8.5px] sm:text-[9.5px] text-amber-300/80 font-bold block">
                Penyelamatan Nyata
              </span>
            </div>

            <div className="bg-[#081C30]/80 border border-[#234A72]/80 rounded-xl p-2.5 sm:p-3 text-center space-y-0.5">
              <span className="text-[9.5px] sm:text-[10.5px] text-slate-400 font-bold block truncate">
                Karbon Dicegah
              </span>
              <strong className="text-xs sm:text-lg font-black text-teal-300 font-mono block">
                ~{(totalSavedPortions * 0.9).toFixed(1)} kg
              </strong>
              <span className="text-[8.5px] sm:text-[9.5px] text-teal-300/80 font-bold block">
                Emisi Gas CO2e
              </span>
            </div>
          </div>

          {/* Quick Action Buttons on Wallet */}
          <div className="flex items-center gap-2 pt-1 flex-wrap relative z-10">
            <button
              type="button"
              onClick={() => setIsRewardsModalOpen(true)}
              className="flex-1 py-2 px-3 bg-[#173D63] hover:bg-[#204E7D] text-[#D4A843] border border-[#D4A843]/50 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Tukar EcoPoints</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="flex-1 py-2 px-3 bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-400/50 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-200" />
              <span>Tiket QR Klaim ({activeClaimsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBPOMModalOpen(true)}
              className="py-2 px-3 bg-[#081A2D] hover:bg-[#122A45] text-slate-300 hover:text-white border border-[#265380] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Standar BPOM</span>
            </button>
          </div>
        </section>

        {/* 3. 8 QUICK-ACTION SHORTCUT ICONS (Grid 4x2 ala Gojek Mobile) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#D4A843] uppercase tracking-wider block">
              Layanan Penyelamatan Pangan
            </span>
            {activeCategoryFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('ALL')}
                className="text-[10.5px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* 1. Rescue Sale */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('RESCUE_SALE');
                setCurrentPage(1);
              }}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer text-center group ${
                activeCategoryFilter === 'RESCUE_SALE'
                  ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/50'
                  : 'bg-[#0E2034] hover:bg-[#152B44] border-[#1E3E63]'
              }`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-700/20 border border-amber-400/50 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-md">
                <UtensilsCrossed className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 block leading-tight">
                Rescue Sale
              </span>
              <span className="text-[8.5px] text-amber-400 font-black mt-0.5">Diskon 70%</span>
            </button>

            {/* 2. Donasi Rp 0 */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('FREE');
                setCurrentPage(1);
              }}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer text-center group ${
                activeCategoryFilter === 'FREE'
                  ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/50'
                  : 'bg-[#0E2034] hover:bg-[#152B44] border-[#1E3E63]'
              }`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 border border-emerald-400/50 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-md">
                <Gift className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 block leading-tight">
                Donasi Rp 0
              </span>
              <span className="text-[8.5px] text-emerald-400 font-black mt-0.5">Porsi Gratis</span>
            </button>

            {/* 3. Flash Rescue */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('FLASH');
                setCurrentPage(1);
              }}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer text-center group ${
                activeCategoryFilter === 'FLASH'
                  ? 'bg-rose-500/25 border-rose-400 ring-2 ring-rose-400/50'
                  : 'bg-[#0E2034] hover:bg-[#152B44] border-[#1E3E63]'
              }`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-700/20 border border-rose-400/50 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-md relative">
                <Zap className="w-5 h-5 text-rose-300" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              </div>
              <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 block leading-tight">
                Flash Rescue
              </span>
              <span className="text-[8.5px] text-rose-400 font-black mt-0.5">&lt; 2 Jam</span>
            </button>

            {/* 4. Bakery Malam */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('BAKERY');
                setCurrentPage(1);
              }}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer text-center group ${
                activeCategoryFilter === 'BAKERY'
                  ? 'bg-amber-600/25 border-amber-400 ring-2 ring-amber-400/50'
                  : 'bg-[#0E2034] hover:bg-[#152B44] border-[#1E3E63]'
              }`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-600/30 to-yellow-600/20 border border-amber-400/50 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-md">
                <Croissant className="w-5 h-5 text-amber-200" />
              </div>
              <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 block leading-tight">
                Bakery Malam
              </span>
              <span className="text-[8.5px] text-amber-300 font-black mt-0.5">Roti Fresh</span>
            </button>

            {/* 5. Bahan Segar */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('PRODUCE');
                setCurrentPage(1);
              }}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer text-center group ${
                activeCategoryFilter === 'PRODUCE'
                  ? 'bg-green-600/25 border-green-400 ring-2 ring-green-400/50'
                  : 'bg-[#0E2034] hover:bg-[#152B44] border-[#1E3E63]'
              }`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-green-500/30 to-teal-700/20 border border-green-400/50 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-md">
                <Apple className="w-5 h-5 text-green-300" />
              </div>
              <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 block leading-tight">
                Bahan Segar
              </span>
              <span className="text-[8.5px] text-green-400 font-black mt-0.5">Buah & Sayur</span>
            </button>

            {/* 6. Dekat Saya */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('NEARBY');
                setCurrentPage(1);
              }}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer text-center group ${
                activeCategoryFilter === 'NEARBY'
                  ? 'bg-sky-600/25 border-sky-400 ring-2 ring-sky-400/50'
                  : 'bg-[#0E2034] hover:bg-[#152B44] border-[#1E3E63]'
              }`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-500/30 to-blue-700/20 border border-sky-400/50 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-md">
                <Navigation className="w-5 h-5 text-sky-300" />
              </div>
              <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 block leading-tight">
                Dekat Saya
              </span>
              <span className="text-[8.5px] text-sky-400 font-black mt-0.5">&lt; 2 km</span>
            </button>

            {/* 7. Peta Radar */}
            <Link href="/dashboard/explore" className="block">
              <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-[#0E2034] hover:bg-[#152B44] border border-[#1E3E63] transition-all cursor-pointer text-center group">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-700/20 border border-indigo-400/50 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-md">
                  <Compass className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 block leading-tight">
                  Peta Radar
                </span>
                <span className="text-[8.5px] text-indigo-400 font-black mt-0.5">Live GPS</span>
              </div>
            </Link>

            {/* 8. Standar BPOM */}
            <button
              type="button"
              onClick={() => setIsBPOMModalOpen(true)}
              className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-[#0E2034] hover:bg-[#152B44] border border-[#1E3E63] transition-all cursor-pointer text-center group"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-500/30 to-emerald-700/20 border border-teal-400/50 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-md">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
              </div>
              <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 block leading-tight">
                Standar BPOM
              </span>
              <span className="text-[8.5px] text-teal-400 font-black mt-0.5">Higienis SOP</span>
            </button>
          </div>
        </section>

        {/* 4. HERO SOCIAL IMPACT CAMPAIGN BANNER (Carousel) */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/50 shadow-xl transition-all">
          <div
            className={`p-4 sm:p-5 bg-gradient-to-r ${heroBanners[bannerIndex].accentColor} border-2 ${heroBanners[bannerIndex].borderColor} rounded-2xl sm:rounded-3xl transition-all duration-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5`}
          >
            <div className="space-y-1 max-w-xl">
              <span
                className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full border inline-block ${heroBanners[bannerIndex].badgeColor}`}
              >
                {heroBanners[bannerIndex].badge}
              </span>
              <h3 className="text-sm sm:text-lg font-black text-white leading-tight">
                {heroBanners[bannerIndex].title}
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {heroBanners[bannerIndex].desc}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() =>
                  setBannerIndex((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1))
                }
                className="w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-600 flex items-center justify-center text-slate-300 cursor-pointer"
                title="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setBannerIndex((prev) => (prev + 1) % heroBanners.length)}
                className="w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-600 flex items-center justify-center text-slate-300 cursor-pointer"
                title="Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 5. FLASH RESCUE CLEARANCE SECTION (Urgent Before Store Close) */}
        <section className="bg-gradient-to-r from-rose-950/70 via-[#121E2E] to-amber-950/70 border border-amber-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Flash Rescue Clearance Malam
                  </h3>
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                    Mendesak
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Ambil malam ini sebelum gerai tutup agar makanan tidak terbuang sia-sia!
                </p>
              </div>
            </div>

            {/* Live Countdown Timer */}
            <div className="flex items-center gap-2 bg-[#071320]/90 border border-amber-500/60 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
              <span className="text-[10px] text-slate-300 font-bold">Batas Waktu:</span>
              <strong className="text-xs sm:text-sm font-black text-amber-300 font-mono tracking-wider">
                {formatCountdown(secondsLeft)}
              </strong>
            </div>
          </div>

          {/* Horizontal Swipeable Cards for Flash Rescue */}
          <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar">
            {flashRescueItems.map((item) => (
              <div
                key={`flash-${item.id}`}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-[#0A1726] border border-[#24476D] rounded-2xl p-3 flex flex-col justify-between space-y-2.5 shadow-md hover:border-amber-400/70 transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-slate-900 border border-slate-700">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                      -{item.discountPct}%
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[9.5px] text-[#D4A843] font-bold block truncate">
                      {item.providerName}
                    </span>
                    <h4 className="text-xs font-black text-white line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[9.5px] text-rose-300 bg-rose-950/80 border border-rose-800/60 px-1.5 py-0.5 rounded font-bold block truncate">
                      {item.urgencyText}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 line-through font-mono block">
                      Rp {item.originalPrice.toLocaleString('id-ID')}
                    </span>
                    <strong className="text-sm font-black text-emerald-400 font-mono leading-none">
                      Rp {item.price.toLocaleString('id-ID')}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(item, e)}
                      className="p-2 rounded-xl bg-[#122A45] hover:bg-[#1C3D63] text-amber-300 border border-[#2B5480] transition-all cursor-pointer"
                      title="Tambah ke Tas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickClaim(item)}
                      className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#D4A843] to-[#E5B954] hover:brightness-110 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-xs"
                    >
                      Klaim Cepat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. SMART MATCHING 2.0 CAROUSEL (Rekomendasi Cerdas AI) */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A843] block">
                Smart Matching 2.0 Engine
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Rekomendasi Terbaik Berdasarkan Preferensi Anda
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1 self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5 text-[#D4A843]" />
              Radius &lt; {syncRadius} km
            </span>
          </div>

          <div className="flex md:grid md:grid-cols-2 gap-3.5 overflow-x-auto md:overflow-visible pb-2 snap-x snap-mandatory no-scrollbar">
            {smartMatchedItems.map((item) => (
              <div
                key={`smart-${item.id}`}
                className="w-[85vw] max-w-[340px] md:max-w-none md:w-auto shrink-0 snap-start bg-[#0C1E32] border-2 border-[#D4A843]/50 rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-lg relative overflow-hidden group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-900 border border-slate-700 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      Diskon {item.discountPct}
                    </span>
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-[#D4A843] text-slate-950 font-black text-[9.5px] rounded-md font-mono">
                        Skor {item.matchScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-[#D4A843]" />
                        {item.distance}
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-white line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[10.5px] text-slate-300 font-medium truncate flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.providerName}</span>
                    </p>
                    <p className="text-[10px] text-amber-300 font-medium bg-[#142E4A] px-2 py-0.5 rounded-md border border-[#234A70] line-clamp-1">
                      {item.matchReason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 line-through font-mono block">
                      Rp {item.originalPrice.toLocaleString('id-ID')}
                    </span>
                    <strong className="text-base font-black text-emerald-400 font-mono leading-none">
                      Rp {item.price.toLocaleString('id-ID')}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(item, e)}
                      className="p-2 rounded-xl bg-[#14304F] hover:bg-[#1E436C] text-amber-300 border border-[#2B5480] transition-all cursor-pointer"
                      title="Tambah ke Tas"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickClaim(item)}
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#D4A843] to-[#E5B954] hover:brightness-110 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md"
                    >
                      Klaim Cepat →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 2-COLUMN GOFOOD-STYLE DISCOVERY FEED */}
        <section className="space-y-4 pt-2">
          {/* Section Header & Category Chips */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-xl font-black text-white">
                  Katalog Makanan Surplus Hari Ini
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {filteredFoods.length} makanan siap diselamatkan di sekitar Anda
                </p>
              </div>

              <Link href="/dashboard/explore">
                <button
                  type="button"
                  className="text-xs font-bold text-[#D4A843] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            {/* Chips Scrollable Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'ALL', label: 'Semua Surplus' },
                { id: 'RESCUE_SALE', label: 'Rescue Sale Diskon' },
                { id: 'FREE', label: 'Donasi Rp 0' },
                { id: 'BAKERY', label: 'Roti & Kue' },
                { id: 'PRODUCE', label: 'Buah & Sayur' },
                { id: 'NEARBY', label: 'Dekat (< 2 km)' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setActiveCategoryFilter(chip.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer border ${
                    activeCategoryFilter === chip.id
                      ? 'bg-[#D4A843] text-slate-950 border-[#D4A843] shadow-md'
                      : 'bg-[#0E2034] text-slate-300 hover:text-white border-[#1E3E63]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Responsive Grid */}
          {paginatedFoods.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {paginatedFoods.map((food) => {
                const isDiscounted = food.originalPrice > food.price && food.price > 0;
                const discPct = isDiscounted
                  ? Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setIsDetailModalOpen(true);
                    }}
                    className="bg-[#0D1F33] hover:bg-[#122842] border border-[#214164] hover:border-[#D4A843]/80 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    {/* Image with Badges */}
                    <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={food.imageUrl}
                        alt={food.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {food.isFree || food.price === 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-[9.5px] rounded-md shadow-md uppercase">
                            Rp 0 Donasi
                          </span>
                        ) : isDiscounted ? (
                          <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9.5px] rounded-md shadow-md">
                            -{discPct}%
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-bold text-white bg-slate-950/70 backdrop-blur-xs px-2 py-1 rounded-lg">
                        <span className="truncate">{food.distance}</span>
                        <span className="truncate">{food.pickupTime?.split(' ')[0] || 'Hari ini'}</span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block truncate">
                          {food.providerName}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-white line-clamp-2 leading-snug">
                          {food.title}
                        </h4>
                      </div>

                      {/* Pricing & Add Button */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                        <div>
                          {isDiscounted && (
                            <span className="text-[9.5px] text-slate-500 line-through font-mono block leading-none">
                              Rp {food.originalPrice.toLocaleString('id-ID')}
                            </span>
                          )}
                          <strong className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                            {food.isFree || food.price === 0
                              ? 'GRATIS'
                              : `Rp ${food.price.toLocaleString('id-ID')}`}
                          </strong>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(food, e)}
                          className="w-8 h-8 rounded-xl bg-[#17385C] hover:bg-[#204975] text-[#D4A843] border border-[#2B5480] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                          title="Tambah ke Tas"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0C1B2C] border border-slate-800 rounded-2xl space-y-2">
              <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-black text-white">Tidak Ada Makanan yang Cocok</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau reset filter untuk melihat katalog surplus lainnya.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategoryFilter('ALL');
                }}
                className="mt-2 py-1.5 px-4 bg-[#D4A843] text-slate-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Tampilkan Semua Makanan
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                Hal <strong className="text-white">{currentPage}</strong> dari{' '}
                <strong className="text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-[#0F2338] border border-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1 text-slate-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={`w-7 h-7 rounded-xl text-xs font-black cursor-pointer ${
                        num === currentPage
                          ? 'bg-[#D4A843] text-slate-950 shadow-md'
                          : 'bg-[#0F2338] border border-slate-700 text-slate-300 hover:bg-[#153250]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-[#0F2338] border border-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1 text-slate-200"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 8. MODAL: QR CODE KLAIM AKTIF */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="Tiket QR Digital Penjemputan Makanan"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tiket Siap Diambil di Gerai Mitra</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Tunjukkan QR Code ini kepada kasir/petugas mitra saat serah terima makanan untuk verifikasi tanpa kontak.
            </p>
          </div>

          <div className="flex justify-center p-2 bg-white rounded-2xl border border-slate-200">
            <QRGenerator
              value={`REPLATE-CLAIM-SBY-${Date.now().toString(36).toUpperCase()}`}
              codeTitle="REPLATE DIGITAL PICKUP PASS"
              codeSubtitle="Surabaya Zero-Waste Food Network"
              recipientName={consumerName}
              foodName="Surplus Artisan & Meals"
              portions="1 Paket Klaim"
              expiryTime="Hari ini 19:00 - 21:00 WIB"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsQRModalOpen(false)}
            className="w-full py-2.5 bg-[#1B3A5C] text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
          >
            Tutup Tiket QR
          </button>
        </div>
      </Modal>

      {/* 9. MODAL: TUKAR ECOPOINTS REPLATE */}
      <Modal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
        title="Pusat Penukaran EcoPoints Replate"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-gradient-to-r from-[#0C243B] to-[#0A4B3C] text-white rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#D4A843] font-black uppercase">Saldo EcoPoints Anda</span>
              <h3 className="text-xl font-black text-amber-300 font-mono">{ecoPoints} Poin</h3>
              <span className="text-[10px] text-slate-300">Setara dengan ~{totalSavedPortions} porsi terselamatkan</span>
            </div>
            <Sparkles className="w-8 h-8 text-[#D4A843]" />
          </div>

          <div className="space-y-2.5">
            <h4 className="font-black text-slate-800 text-xs">Pilihan Reward & Penukaran:</h4>

            {/* Reward 1 */}
            <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-amber-400 transition-all">
              <div className="space-y-0.5">
                <strong className="text-xs text-slate-900 block font-bold">Voucher Potongan Rp 10.000</strong>
                <span className="text-[10px] text-slate-500 block">Dapat digunakan untuk pesanan Rescue Sale berikutnya</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setToastState({
                    isOpen: true,
                    message: 'Berhasil menukar 100 Poin dengan Voucher Rp 10.000!',
                    type: 'success',
                  });
                  setIsRewardsModalOpen(false);
                }}
                className="py-1.5 px-3 bg-[#D4A843] hover:bg-[#E5B954] text-slate-950 font-black rounded-lg text-[11px] shrink-0 cursor-pointer shadow-xs"
              >
                Tukar 100 Poin
              </button>
            </div>

            {/* Reward 2 */}
            <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-emerald-400 transition-all">
              <div className="space-y-0.5">
                <strong className="text-xs text-slate-900 block font-bold">Donasi 1 Bibit Pohon Mangrove</strong>
                <span className="text-[10px] text-slate-500 block">Ditanam di Ekowisata Mangrove Wonorejo Surabaya</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setToastState({
                    isOpen: true,
                    message: 'Luar biasa! 150 Poin didonasikan untuk 1 bibit mangrove di Wonorejo.',
                    type: 'success',
                  });
                  setIsRewardsModalOpen(false);
                }}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-[11px] shrink-0 cursor-pointer shadow-xs"
              >
                Tukar 150 Poin
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 10. MODAL: UBAH LOKASI & RADIUS PENJEMPUTAN */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Pengaturan Zona & Radius Penjemputan"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">Pilih Kecamatan Penjemputan (Surabaya):</label>
            <select
              value={consumerAddress}
              onChange={(e) => setConsumerAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold focus:ring-1 focus:ring-[#1B3A5C]"
            >
              <option value="Gubeng, Surabaya">Gubeng, Surabaya</option>
              <option value="Genteng, Surabaya">Genteng, Surabaya</option>
              <option value="Wonokromo, Surabaya">Wonokromo, Surabaya</option>
              <option value="Sukolilo, Surabaya">Sukolilo, Surabaya</option>
              <option value="Tegalsari, Surabaya">Tegalsari, Surabaya</option>
              <option value="Rungkut, Surabaya">Rungkut, Surabaya</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Maksimal Radius Penyelamatan:</label>
              <span className="font-black text-[#1B3A5C] text-sm">{syncRadius} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={syncRadius}
              onChange={(e) => {
                const r = parseInt(e.target.value);
                setSyncRadius(r);
                try {
                  localStorage.setItem('replate_admin_sync_radius', r.toString());
                } catch (_) {}
              }}
              className="w-full accent-[#1B3A5C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>2 km (Dekat)</span>
              <span>15 km (Kota)</span>
              <span>25 km (Metropolitan)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setToastState({
                isOpen: true,
                message: `Lokasi diperbarui ke "${consumerAddress}" dengan radius ${syncRadius} km!`,
                type: 'success',
              });
              setIsLocationModalOpen(false);
            }}
            className="w-full py-2.5 bg-[#1B3A5C] hover:bg-[#254F7C] text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
          >
            Terapkan Zona Baru
          </button>
        </div>
      </Modal>

      {/* 11. MODAL: STANDAR BPOM RI & HIGIENITAS */}
      <Modal
        isOpen={isBPOMModalOpen}
        onClose={() => setIsBPOMModalOpen(false)}
        title="Jaminan Keamanan Pangan Replate (SOP BPOM RI)"
      >
        <div className="space-y-3.5 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-black text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Standar Operasional Pangan Replate 100% Bebas Khawatir</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Seluruh makanan yang didistribusikan melalui Replate wajib lolos uji sensorik organoleptik (bau, rasa, tekstur, visual) dan mematuhi batas waktu konsumsi 3 jam BPOM RI.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">1. Uji Kelayakan Sensorik & Organoleptik</strong>
                <span className="text-[11px] text-slate-600">Dipastikan tidak ada tanda pembusukan atau perubahan aroma sebelum diserahkan.</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">2. Pengemasan Sanitasi Bersegel</strong>
                <span className="text-[11px] text-slate-600">Wadah higienis anti tumpah dengan label informasi waktu simpan yang jelas.</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">3. Perlindungan Konsumen Terpadu</strong>
                <span className="text-[11px] text-slate-600">Hak kompensasi dan jaminan penggantian jika makanan tidak sesuai deskripsi.</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBPOMModalOpen(false)}
            className="w-full py-2.5 bg-[#1B3A5C] text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
          >
            Saya Memahami Standar BPOM
          </button>
        </div>
      </Modal>

      {/* 12. FOOD DETAIL MODAL */}
      {selectedFood && (
        <FoodDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          food={selectedFood}
          onClaim={(id) => {
            setIsDetailModalOpen(false);
            handleQuickClaim(selectedFood);
          }}
          onAddToCart={(id) => {
            handleAddToCart(selectedFood);
          }}
        />
      )}

      {/* 13. GLOBAL TOAST & LOADER */}
      <Toast
        isOpen={toastState.isOpen}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
        message={toastState.message}
        type={toastState.type}
      />

      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />
    </div>
  );
}
