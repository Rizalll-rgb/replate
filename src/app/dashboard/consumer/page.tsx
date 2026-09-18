'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Info,
  X,
  ExternalLink,
  Flame,
  Plus,
  Lock,
  User,
  Tag,
  BookOpen,
  Building2,
  Handshake,
  Leaf,
  MessageCircle,
  LogOut,
} from 'lucide-react';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { QRGenerator } from '@/components/qr/QRGenerator';
import {
  PackageIcon,
  SearchIcon,
  CheckIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  TicketIcon,
} from '@/components/ui/Icon';
import { MOCK_SURPLUS_FOODS } from '@/lib/mockDatabase';
import { resolveIndonesianAddress } from '@/lib/geoResolver';

export default function ConsumerDashboardPage() {
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

  // Pagination for Desktop & Mobile
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;
  const desktopItemsPerPage = 6;
  const [desktopCurrentPage, setDesktopCurrentPage] = useState<number>(1);

  // Interactive Modals
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isBPOMModalOpen, setIsBPOMModalOpen] = useState(false);
  const [isPahlawanInfoModalOpen, setIsPahlawanInfoModalOpen] = useState(false);
  const [isStatusExplanationModalOpen, setIsStatusExplanationModalOpen] = useState(false);
  const [isPartnershipModalOpen, setIsPartnershipModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    } catch (_) {}
    await signOut({ callbackUrl: '/' });
  };

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

  // Rotating Hero Campaign Banner (Mobile) - Vibrant SuperApp Gradients
  const [bannerIndex, setBannerIndex] = useState(0);
  const heroBanners = [
    {
      badge: 'Gerakan Pahlawan Pangan',
      title: '520+ Porsi Terselamatkan Hari Ini di Seluruh Kota',
      desc: 'Mencegah 1.300 kg jejak emisi gas metana dari Tempat Pembuangan Akhir (TPA) nasional. Belanja cerdas sambil jaga bumi!',
      accentColor: 'from-emerald-600 via-teal-600 to-cyan-700',
      badgeColor: 'bg-emerald-400/25 text-emerald-100 border-emerald-300/50',
    },
    {
      badge: 'Flash Rescue Sale',
      title: 'Diskon Spesial Hingga 70% Menjelang Toko Tutup',
      desc: 'Nikmati hidangan artisan dan pastry berkualitas hotel serta resto terkemuka sebelum kedaluwarsa.',
      accentColor: 'from-amber-500 via-orange-600 to-rose-600',
      badgeColor: 'bg-amber-300/30 text-amber-100 border-amber-200/50',
    },
    {
      badge: 'Gamifikasi Hijau',
      title: 'Kumpulkan EcoPoints, Tukar Bibit Mangrove',
      desc: 'Setiap 1 porsi yang kamu selamatkan menghasilkan 40 EcoPoints untuk program restorasi mangrove nusantara.',
      accentColor: 'from-indigo-600 via-purple-600 to-pink-600',
      badgeColor: 'bg-pink-400/25 text-pink-100 border-pink-300/50',
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
    // Radius is STRICTLY determined by SuperAdmin
    try {
      const adminRadius = localStorage.getItem('replate_admin_sync_radius');
      if (adminRadius) {
        setSyncRadius(parseInt(adminRadius));
      } else {
        setSyncRadius(15);
      }
    } catch (_) {
      setSyncRadius(15);
    }

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
        // District/Kecamatan is STRICTLY taken from the user's role profile data
        if (parsed.address) {
          setConsumerAddress(parsed.address);
        } else if (parsed.city) {
          setConsumerAddress(parsed.city);
        }
      } else {
        const reg = localStorage.getItem('replate_registered_user');
        if (reg) {
          const parsedReg = JSON.parse(reg);
          if (parsedReg.name) setConsumerName(parsedReg.name);
          if (parsedReg.address) setConsumerAddress(parsedReg.address);
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
      message: 'Mempersiapkan Checkout...',
      submessage: `Mengamankan porsi "${item.title || item.foodName}"`,
    });
    setTimeout(() => {
      router.push(`/dashboard/checkout/${item.id}`);
    }, 600);
  };

  // Filtered Foods computation based on search & category
  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      // Sembunyikan item khusus Panti/Yayasan untuk konsumen reguler
      if (item.type === 'DONATION' || item.isFree || item.category === 'BAHAN_MENTAH') {
        const rawRole = (session?.user as any)?.role || (typeof window !== 'undefined' ? localStorage.getItem('replate_role') : '');
        const isBeneficiary = String(rawRole).toUpperCase().includes('BENEFICIARY') || String(rawRole).toUpperCase().includes('YAYASAN') || (typeof window !== 'undefined' && localStorage.getItem('replate_consumer_verification_status') === 'BENEFICIARY_VERIFIED');
        if (!isBeneficiary) return false;
      }

      const matchSearch =
        searchQuery.trim() === '' ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.providerName && item.providerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (activeCategoryFilter === 'ALL') return true;
      if (activeCategoryFilter === 'RESCUE_SALE') return !item.isFree && item.price > 0 && item.originalPrice > item.price;
      if (activeCategoryFilter === 'FREE') return item.isFree || item.price === 0;
      if (activeCategoryFilter === 'MINUMAN_SUSU') return item.category === 'MINUMAN_SUSU' || item.category === 'DAIRY' || item.category === 'BEVERAGES' || (item.title && item.title.toLowerCase().includes('susu')) || (item.title && item.title.toLowerCase().includes('jus')) || (item.title && item.title.toLowerCase().includes('kopi')) || (item.title && item.title.toLowerCase().includes('teh')) || (item.title && item.title.toLowerCase().includes('drink'));
      if (activeCategoryFilter === 'FLASH') return item.originalPrice > item.price && (item.originalPrice - item.price) / item.originalPrice >= 0.5;
      if (activeCategoryFilter === 'BAKERY') return item.category === 'BAKERY' || item.category === 'ROTI_KUE' || (item.title && item.title.toLowerCase().includes('roti'));
      if (activeCategoryFilter === 'PRODUCE') return item.category === 'PRODUCE' || item.category === 'BUAH_SAYUR' || (item.title && item.title.toLowerCase().includes('buah')) || (item.title && item.title.toLowerCase().includes('sayur'));
      if (activeCategoryFilter === 'NEARBY') {
        const dist = parseFloat(item.distance) || 3.0;
        return dist <= 2.0;
      }
      return true;
    });
  }, [foods, searchQuery, activeCategoryFilter]);

  // Paginated Foods for Mobile 2-column feed
  const totalPages = Math.max(1, Math.ceil(filteredFoods.length / itemsPerPage));
  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFoods.slice(start, start + itemsPerPage);
  }, [filteredFoods, currentPage, itemsPerPage]);

  // Paginated Foods for Desktop Full Explorer
  const desktopTotalPages = Math.max(1, Math.ceil(foods.length / desktopItemsPerPage));
  const desktopPaginatedFoods = useMemo(() => {
    const start = (desktopCurrentPage - 1) * desktopItemsPerPage;
    return foods.slice(start, start + desktopItemsPerPage);
  }, [foods, desktopCurrentPage, desktopItemsPerPage]);

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

  // Scroll smoothly to catalog when icon is clicked
  const scrollToCatalog = () => {
    const el = document.getElementById('mobile-catalog-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (hidden on mobile, visible md: and up)                     */}
      {/* RESTORED TO CLEAN PREVIOUS DASHBOARD AS REQUESTED BY USER                 */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Sleek Modern Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[10px] font-black uppercase tracking-wider rounded-md">
                  Dashboard Food Consumer
                </span>
                <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Konsumen Reguler • Akses Rescue Sale & Donasi Rp 0</span>
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#1B3A5C] tracking-tight">
                Selamat Datang, {consumerName}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
                Hemat pengeluaran belanja dengan Rescue Sale dan selamatkan donasi makanan surplus Rp 0 berstandar BPOM RI.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
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

        {/* Desktop KPI Stats Grid (4-kolom) */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-xs bg-white rounded-3xl p-5">
            <CardBody className="p-0 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block truncate">Total Hemat Belanja</span>
              <strong className="text-xl font-black text-emerald-600 font-mono block">
                Rp {totalSavings.toLocaleString('id-ID')}
              </strong>
              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                <span>Diskon ~65%</span>
              </span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 shadow-xs bg-white rounded-3xl p-5">
            <CardBody className="p-0 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block truncate">Makanan Diselamatkan</span>
              <strong className="text-xl font-black text-[#1B3A5C] font-mono block">
                {totalSavedPortions} Porsi
              </strong>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckIcon size={10} className="text-emerald-600" />
                <span>~{(totalSavedPortions * 0.9).toFixed(1)} kg CO2 Dicegah</span>
              </span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 shadow-xs bg-white rounded-3xl p-5">
            <CardBody className="p-0 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block truncate">Klaim Aktif</span>
              <strong className="text-xl font-black text-[#D4A843] font-mono block">
                {activeClaimsCount} Pesanan
              </strong>
              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                <ClockIcon size={10} />
                <span>{activeClaimsCount > 0 ? 'Siap Diambil di Gerai' : 'Belum Ada Klaim Aktif'}</span>
              </span>
            </CardBody>
          </Card>

          <Card
            onClick={() => setIsStatusExplanationModalOpen(true)}
            className="border-slate-200 shadow-xs bg-white rounded-3xl p-5 hover:border-[#1B3A5C]/40 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-2 right-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-bold text-[#1B3A5C] bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <Info size={10} /> Info
              </span>
            </div>
            <CardBody className="p-0 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block truncate">Status Akun Konsumen</span>
              <strong className="text-sm font-black text-slate-800 block truncate">
                Konsumen Reguler
              </strong>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheckIcon size={10} className="text-emerald-600" />
                <span className="truncate">Rescue Sale & Donasi Rp 0 Bebas Biaya</span>
              </span>
            </CardBody>
          </Card>
        </div>

        {/* Desktop Smart Matching 2.0 Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A843] block mb-0.5">
                SMART MATCHING ENGINE 2.0 (KONSUMEN)
              </span>
              <h3 className="text-xl font-black text-[#1B3A5C]">
                Rekomendasi Paling Cocok Untuk Anda
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <MapPinIcon size={12} className="text-slate-400" />
              Radius &lt; {syncRadius} km (Ditetapkan SuperAdmin)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {smartMatchedItems.map((item) => (
              <div
                key={`desktop-smart-${item.id}`}
                className="p-5 bg-gradient-to-br from-white via-white to-amber-50/40 rounded-3xl border-2 border-amber-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white font-black text-[9px] rounded-md shadow-xs">
                      Diskon {item.discountPct}
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
                      <span>{item.providerName}</span>
                    </p>
                    <p className="text-[10.5px] text-amber-900 font-bold line-clamp-1 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{item.matchReason}</span>
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

        {/* Desktop Main Food Explorer Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-black text-[#1B3A5C]">
                Semua Katalog Makanan Surplus Aktif
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Menampilkan {foods.length > 0 ? (desktopCurrentPage - 1) * desktopItemsPerPage + 1 : 0} -{' '}
                {Math.min(desktopCurrentPage * desktopItemsPerPage, foods.length)} dari total {foods.length} makanan siap diselamatkan
              </p>
            </div>

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

          <FoodGrid
            foods={desktopPaginatedFoods}
            onClaim={handleQuickClaim}
            onDetail={(id) => {
              const item = foods.find((f) => f.id === id);
              if (item) {
                setSelectedFood(item);
                setIsDetailModalOpen(true);
              }
            }}
            onAddToCart={(id) => {
              const item = foods.find((f) => f.id === id);
              if (item) handleAddToCart(item);
            }}
          />

          {/* Desktop Pagination Controls */}
          {desktopTotalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500">
                Halaman <strong className="text-slate-800 font-black">{desktopCurrentPage}</strong> dari{' '}
                <strong className="text-slate-800 font-black">{desktopTotalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={desktopCurrentPage === 1}
                  onClick={() => setDesktopCurrentPage((p) => Math.max(1, p - 1))}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: desktopTotalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setDesktopCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        pageNum === desktopCurrentPage
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
                  disabled={desktopCurrentPage === desktopTotalPages}
                  onClick={() => setDesktopCurrentPage((p) => Math.min(desktopTotalPages, p + 1))}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW (visible on mobile, hidden on md: and up)                  */}
      {/* CREATIVE LIGHT BACKGROUND WITH WARM ACCENTS & SEAMLESS TRANSITIONS        */}
      {/* ========================================================================= */}
      <div className="block md:hidden bg-slate-50 text-slate-800 font-sans pb-24 space-y-4">
        {/* Mobile Header Bar - Redmi Note 15 Safe Spacing & 3-Row Hierarchy */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-5 py-2.5 space-y-2.5 shadow-2xs">
          {/* Row 1: Brand & Greeting on Left, Tas Klaim & Avatar with Safe Edge Margin on Right */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1B3A5C] to-[#254d79] flex items-center justify-center text-white shadow-xs shrink-0">
                <Leaf className="w-4 h-4 text-[#D4A843]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block leading-none">Halo Pahlawan,</span>
                <h2 className="text-sm font-black text-[#1B3A5C] truncate tracking-tight mt-0.5">
                  {consumerName.split(' ')[0] || 'Konsumen'} 👋
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/dashboard/cart">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4A843] to-[#E5B954] hover:brightness-105 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer relative"
                  title="Tas Klaim"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
                  <span className="text-[11px]">Tas</span>
                  {cartCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-black leading-none">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Avatar Icon Button: Opens Gojek Profile Drawer with Safe Padding from Bezel */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('replate_open_profile_drawer'))}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1B3A5C] via-[#244b74] to-[#2C5282] text-white flex items-center justify-center font-black text-xs shadow-xs border-2 border-white active:scale-95 transition-all cursor-pointer relative shrink-0"
                title="Buka Profil & Pengaturan (Ala Gojek)"
              >
                <User className="w-4 h-4 text-[#D4A843]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </button>

              {/* Mobile Quick Logout Button */}
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                title="Keluar dari Akun"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
              </button>
            </div>
          </div>

          {/* Row 2: Location / Pickup Zone Pill (Full Width, Tap to Change) */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="w-full flex items-center justify-between gap-2 bg-slate-100 hover:bg-slate-200/90 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#1B3A5C] shrink-0" />
              <div className="min-w-0 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-semibold shrink-0">Lokasi:</span>
                <span className="text-xs font-black text-slate-800 truncate">{consumerAddress}</span>
                <span className="text-[10px] text-slate-500 font-bold shrink-0">(&lt;{syncRadius} km)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#1B3A5C] bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              Ubah
            </span>
          </button>

          {/* Row 3: Real-time Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari roti artisan, nasi box, buah surplus..."
              className="w-full pl-10 pr-9 py-2 bg-slate-100 border border-slate-200 focus:border-[#1B3A5C] focus:bg-white focus:ring-1 focus:ring-[#1B3A5C] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        <div className="px-3.5 space-y-4">
          {/* Mobile Eco-Impact & Savings Card (Emerald-Navy Member Card) */}
          <section className="bg-gradient-to-br from-[#1B3A5C] via-[#14334E] to-[#0D3F33] rounded-2xl p-4 text-white shadow-md border border-[#D4A843]/40 space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
              {/* Left: Member Badge & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#D4A843]/20 border border-[#D4A843]/80 flex items-center justify-center shrink-0">
                  <Coins className="w-4.5 h-4.5 text-[#D4A843]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#D4A843] font-black uppercase tracking-wider block leading-tight">
                    Pahlawan Pangan
                  </span>
                  <h3 className="text-xs font-black text-white truncate">
                    {consumerName}
                  </h3>
                </div>
              </div>

              {/* Right: Saldo EcoPoints & Apa Ini Aligned Horizontally on Same Baseline */}
              <div className="flex items-center gap-2 shrink-0 bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1.5 rounded-xl transition-all">
                <div className="text-right leading-tight">
                  <span className="text-[9.5px] text-slate-300 font-semibold block">Saldo EcoPoints</span>
                  <strong className="text-xs sm:text-sm font-black text-amber-300 font-mono block">
                    {ecoPoints} Poin
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPahlawanInfoModalOpen(true)}
                  className="h-8 px-2.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1 transition-all active:scale-95 shrink-0"
                  title="Penjelasan Pahlawan Pangan & EcoPoints"
                >
                  <Info className="w-3 h-3 text-amber-300" />
                  <span>Apa ini?</span>
                </button>
              </div>
            </div>

            {/* 3 Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/20 rounded-xl p-2 border border-white/10">
                <span className="text-[9.5px] text-slate-300 font-medium block truncate">Total Hemat</span>
                <strong className="text-xs font-black text-emerald-300 font-mono block">
                  Rp {totalSavings.toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="bg-black/20 rounded-xl p-2 border border-white/10">
                <span className="text-[9.5px] text-slate-300 font-medium block truncate">Porsi Selamat</span>
                <strong className="text-xs font-black text-amber-300 font-mono block">
                  {totalSavedPortions} Porsi
                </strong>
              </div>
              <div className="bg-black/20 rounded-xl p-2 border border-white/10">
                <span className="text-[9.5px] text-slate-300 font-medium block truncate">Karbon Tercegah</span>
                <strong className="text-xs font-black text-teal-300 font-mono block">
                  ~{(totalSavedPortions * 0.9).toFixed(1)} kg
                </strong>
              </div>
            </div>

            {/* Equal Sized Action Buttons - Direct Redirection to Dedicated Pages */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => router.push('/dashboard/consumer/rewards')}
                className="h-11 flex-1 px-3 bg-[#D4A843] hover:bg-[#E5B954] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs border border-[#D4A843] transition-all cursor-pointer active:scale-98"
              >
                <Award className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="truncate">Tukar EcoPoints</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/consumer/my-claims')}
                className="h-11 flex-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs border border-emerald-500 transition-all cursor-pointer active:scale-98"
              >
                <QrCode className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">Tiket QR Klaim ({activeClaimsCount})</span>
              </button>
            </div>
          </section>

          {/* 8 Quick-Action Service Icons Grid (Direct Redirection to Filtered Explore) */}
          <section className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-[#1B3A5C] uppercase tracking-wider block">
                Layanan Penyelamatan Pangan
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                Pilih Kategori Langsung
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* 1. Rescue Sale */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/explore?tab=RESCUE_SALE')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 border border-amber-200 flex items-center justify-center mb-1 text-amber-700 transition-colors">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight">Rescue Sale</span>
                <span className="text-[8px] text-amber-700 font-bold">Diskon 70%</span>
              </button>

              {/* 2. Donasi Rp 0 */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/explore?tab=DONATION')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 border border-emerald-200 flex items-center justify-center mb-1 text-emerald-700 transition-colors">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight">Donasi Rp 0</span>
                <span className="text-[8px] text-emerald-700 font-bold">Gratis</span>
              </button>

              {/* 3. Flash Rescue */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/explore?tab=RESCUE_SALE&filter=flash')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border border-slate-200 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 group-hover:bg-rose-200 border border-rose-200 flex items-center justify-center mb-1 text-rose-700 relative transition-colors">
                  <Zap className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight">Flash Rescue</span>
                <span className="text-[8px] text-rose-700 font-bold">&lt; 2 Jam</span>
              </button>

              {/* 4. Bakery Malam */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/explore?category=ROTI_KUE')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 border border-amber-200 flex items-center justify-center mb-1 text-amber-800 transition-colors">
                  <Croissant className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight">Bakery</span>
                <span className="text-[8px] text-amber-700 font-bold">Roti Fresh</span>
              </button>

              {/* 5. Bahan Segar */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/explore?category=BUAH_SAYUR')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-green-50 hover:border-green-300 border border-slate-200 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 group-hover:bg-green-200 border border-green-200 flex items-center justify-center mb-1 text-green-700 transition-colors">
                  <Apple className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight">Bahan Segar</span>
                <span className="text-[8px] text-green-700 font-bold">Sayur/Buah</span>
              </button>

              {/* 6. Dekat Saya */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/explore?sort=nearest')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 group-hover:bg-sky-200 border border-sky-200 flex items-center justify-center mb-1 text-sky-700 transition-colors">
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight">Dekat Saya</span>
                <span className="text-[8px] text-sky-700 font-bold">&lt; 2 km</span>
              </button>

              {/* 7. Peta Radar */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/explore?view=radar')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 border border-indigo-200 flex items-center justify-center mb-1 text-indigo-700 transition-colors">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight">Peta Radar</span>
                <span className="text-[8px] text-indigo-700 font-bold">Live GPS</span>
              </button>

              {/* 8. Standar BPOM */}
              <button
                type="button"
                onClick={() => setIsBPOMModalOpen(true)}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100 group-hover:bg-teal-200 border border-teal-200 flex items-center justify-center mb-1 text-teal-700 transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight">Standar BPOM</span>
                <span className="text-[8px] text-teal-700 font-bold">SOP Higienis</span>
              </button>
            </div>
          </section>

          {/* Highlight Promo Banner Carousel (Swipeable Horizontal Slider - Vibrant SuperApp Style) */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-[#1B3A5C] uppercase tracking-wider block">
                Promo &amp; Highlight Replate
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                Geser untuk promo lainnya
              </span>
            </div>

            <div
              className="flex gap-3 overflow-x-auto pb-1.5 no-scrollbar snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Slide 1: Flash Rescue */}
              <div
                onClick={() => router.push('/dashboard/explore?tab=RESCUE_SALE&filter=flash')}
                className="w-[280px] shrink-0 snap-start bg-gradient-to-r from-rose-600 via-orange-600 to-amber-500 text-white rounded-2xl p-4 shadow-md shadow-rose-950/15 border border-white/20 flex flex-col justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-amber-200 shadow-xs inline-flex items-center gap-1 border border-white/20">
                      <Flame className="w-2.5 h-2.5 text-amber-300" />
                      <span>DISKON S.D 70%</span>
                    </span>
                    <span className="text-[9px] font-black text-amber-100 bg-white/20 px-1.5 py-0.5 rounded">Hari Ini</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                    Flash Rescue Spesial Malam
                  </h4>
                  <p className="text-[10.5px] text-rose-50 leading-snug line-clamp-2">
                    Selamatkan surplus kuliner resto &amp; bakery favorit terdekat sebelum jam tutup dengan diskon besar.
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-200 flex items-center gap-1">
                    <span>Ambil Promo</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <span className="text-[9px] text-white/80 bg-black/25 px-1.5 py-0.5 rounded">
                    1 / 4
                  </span>
                </div>
              </div>

              {/* Slide 2: Donasi Rp 0 */}
              <div
                onClick={() => router.push('/dashboard/explore?tab=DONATION')}
                className="w-[280px] shrink-0 snap-start bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl p-4 shadow-md shadow-emerald-950/15 border border-white/20 flex flex-col justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-emerald-200 shadow-xs inline-flex items-center gap-1 border border-white/20">
                      <Gift className="w-2.5 h-2.5 text-emerald-300" />
                      <span>GRATIS RP 0</span>
                    </span>
                    <span className="text-[9px] font-black text-emerald-100 bg-white/20 px-1.5 py-0.5 rounded">Mitra Resmi</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                    Donasi Pangan Bebas Biaya
                  </h4>
                  <p className="text-[10.5px] text-emerald-50 leading-snug line-clamp-2">
                    Surplus makanan siap konsumsi bebas biaya dari donatur terverifikasi, aman berstandar higienis BPOM.
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-200 flex items-center gap-1">
                    <span>Klaim Donasi</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <span className="text-[9px] text-white/80 bg-black/25 px-1.5 py-0.5 rounded">
                    2 / 4
                  </span>
                </div>
              </div>

              {/* Slide 3: Double EcoPoints */}
              <div
                onClick={() => router.push('/dashboard/consumer/rewards')}
                className="w-[280px] shrink-0 snap-start bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-2xl p-4 shadow-md shadow-purple-950/15 border border-white/20 flex flex-col justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-pink-200 shadow-xs inline-flex items-center gap-1 border border-white/20">
                      <Coins className="w-2.5 h-2.5 text-amber-300" />
                      <span>DOUBLE REWARD</span>
                    </span>
                    <span className="text-[9px] font-black text-pink-100 bg-white/20 px-1.5 py-0.5 rounded">Gamifikasi</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                    Gandakan EcoPoints Penyelamatan
                  </h4>
                  <p className="text-[10.5px] text-purple-50 leading-snug line-clamp-2">
                    Kumpulkan poin pahlawan pangan setiap kali bertransaksi, tukarkan voucher sembako &amp; merchandise.
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-200 flex items-center gap-1">
                    <span>Katalog Hadiah</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <span className="text-[9px] text-white/80 bg-black/25 px-1.5 py-0.5 rounded">
                    3 / 4
                  </span>
                </div>
                         {/* Slide 4: Ajak Gerai Kuliner Favoritmu */}
              <div
                onClick={() => setIsPartnershipModalOpen(true)}
                className="w-[280px] shrink-0 snap-start bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-2xl p-4 shadow-md shadow-blue-950/15 border border-white/20 flex flex-col justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-sky-200 shadow-xs inline-flex items-center gap-1 border border-white/20">
                      <Building2 className="w-2.5 h-2.5 text-sky-300" />
                      <span>REFERRAL GERAI</span>
                    </span>
                    <span className="text-[9px] font-black text-sky-100 bg-white/20 px-1.5 py-0.5 rounded">Zero Waste</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                    Ajak Resto Favoritmu
                  </h4>
                  <p className="text-[10.5px] text-blue-50 leading-snug line-clamp-2">
                    Punya resto atau toko roti langganan? Ajak bergabung di Replate agar surplus makanannya bisa kamu beli hemat!
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-sky-200 flex items-center gap-1">
                    <span>Pelajari Info Mitra</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <span className="text-[9px] text-white/80 bg-black/25 px-1.5 py-0.5 rounded">
                    4 / 4
                  </span>
                </div>
              </div>       </div>
            </div>
          </section>

          {/* Flash Rescue Clearance Section */}
          <section className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                <h4 className="text-xs font-black text-slate-900">
                  Flash Rescue Sebelum Toko Tutup
                </h4>
              </div>
              <div className="flex items-center gap-1 bg-white border border-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black text-amber-900">
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{formatCountdown(secondsLeft)}</span>
              </div>
            </div>

            <div
              className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {flashRescueItems.map((item) => (
                <div
                  key={`mobile-flash-${item.id}`}
                  className="w-[240px] shrink-0 snap-start bg-white border border-slate-200 rounded-xl p-2.5 space-y-2 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex gap-2">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-0.5 left-0.5 bg-red-600 text-white text-[8px] font-black px-1 rounded">
                        -{item.discountPct}%
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[9px] text-[#1B3A5C] font-bold block truncate">
                        {item.providerName}
                      </span>
                      <h5 className="text-[11px] font-black text-slate-900 line-clamp-2 leading-tight">
                        {item.title}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-400 line-through font-mono block">
                        Rp {item.originalPrice.toLocaleString('id-ID')}
                      </span>
                      <strong className="text-xs font-black text-emerald-700 font-mono">
                        Rp {item.price.toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickClaim(item)}
                      className="py-1 px-2.5 bg-[#D4A843] text-slate-950 font-black text-[10.5px] rounded-lg cursor-pointer shadow-2xs"
                    >
                      Klaim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mobile Condensed Catalog Preview Section (Max 4 Cards, Swipeable without Slider Controls) */}
          <section id="mobile-catalog-feed" className="space-y-3 pt-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#1B3A5C]">
                    Katalog Makanan Surplus
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Preview {Math.min(4, filteredFoods.length)} dari {filteredFoods.length} makanan siap diselamatkan
                  </p>
                </div>

                <Link href="/dashboard/explore">
                  <span className="text-xs font-bold text-[#1B3A5C] hover:underline flex items-center gap-1 cursor-pointer">
                    <span>Buka Peta</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </Link>
              </div>

              {/* Chips Scrollable Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'RESCUE_SALE', label: 'Rescue Sale' },
                  { id: 'FREE', label: 'Donasi Rp 0' },
                  { id: 'MINUMAN_SUSU', label: 'Minuman & Susu' },
                  { id: 'BAKERY', label: 'Roti/Kue' },
                  { id: 'PRODUCE', label: 'Buah/Sayur' },
                  { id: 'NEARBY', label: 'Dekat (<2km)' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setActiveCategoryFilter(chip.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-black shrink-0 transition-all cursor-pointer border ${
                      activeCategoryFilter === chip.id
                        ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smooth Swipeable Horizontal Rail of 4 Condensed Cards - No Clunky Slider Controls */}
            {filteredFoods.length > 0 ? (
              <div className="space-y-3">
                <div
                  className="flex gap-3 overflow-x-auto pb-2 pt-0.5 no-scrollbar snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {filteredFoods.slice(0, 4).map((food) => {
                    const isDiscounted = food.originalPrice > food.price && food.price > 0;
                    const discPct = isDiscounted
                      ? Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)
                      : 0;

                    return (
                      <div
                        key={`catalog-condensed-${food.id}`}
                        className="w-[185px] shrink-0 snap-start bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        {/* Image Container */}
                        <div className="relative h-32 w-full bg-slate-100 overflow-hidden shrink-0">
                          <img
                            src={food.imageUrl}
                            alt={food.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
                            {food.isFree || food.price === 0 ? (
                              <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-black text-[9px] rounded shadow-xs uppercase">
                                Rp 0
                              </span>
                            ) : isDiscounted ? (
                              <span className="px-1.5 py-0.5 bg-red-600 text-white font-black text-[9px] rounded shadow-xs">
                                -{discPct}%
                              </span>
                            ) : null}
                          </div>

                          {/* Tombol Info Detail Khusus (Bukan klik seluruh card - Point 5) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFood(food);
                              setIsDetailModalOpen(true);
                            }}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-[#1B3A5C] shadow-xs flex items-center justify-center transition-transform active:scale-90 cursor-pointer border border-slate-200"
                            title="Lihat Detail Makanan &amp; Standar BPOM"
                          >
                            <Info className="w-3.5 h-3.5 text-[#1B3A5C]" />
                          </button>

                          <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[8.5px] font-bold text-white bg-slate-950/70 backdrop-blur-xs px-1.5 py-0.5 rounded">
                            <span className="truncate">{food.distance}</span>
                            <span className="truncate">{food.pickupTime?.split(' ')[0] || 'Hari ini'}</span>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9.5px] text-slate-400 font-bold block truncate">
                              {food.providerName}
                            </span>
                            <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight">
                              {food.title}
                            </h4>
                          </div>

                          {/* Pricing & Dual Action Buttons (Klaim Langsung & Tambah ke Tas - Point 5) */}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                            <div className="min-w-0">
                              {isDiscounted && (
                                <span className="text-[9px] text-slate-400 line-through font-mono block leading-none">
                                  Rp {food.originalPrice.toLocaleString('id-ID')}
                                </span>
                              )}
                              <strong className="text-xs font-black text-emerald-700 font-mono block truncate">
                                {food.isFree || food.price === 0
                                  ? 'GRATIS'
                                  : `Rp ${food.price.toLocaleString('id-ID')}`}
                              </strong>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Tombol Checkout Langsung */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickClaim(food);
                                }}
                                className="px-2 py-1 bg-[#D4A843] hover:bg-[#E5B954] text-slate-950 font-black text-[9.5px] rounded-lg flex items-center gap-0.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                                title="Checkout Langsung"
                              >
                                <Zap className="w-3 h-3 text-slate-950" />
                                <span>Klaim</span>
                              </button>

                              {/* Tombol Tambah ke Tas */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(food, e);
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1B3A5C] border border-slate-300 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                                title="Tambah ke Tas"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* 5th Card: Direct Link to Explore More */}
                  <Link
                    href="/dashboard/explore"
                    className="w-[140px] shrink-0 snap-start bg-slate-100 hover:bg-slate-200/80 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-[#1B3A5C] group-hover:scale-110 transition-transform">
                      <Search className="w-4 h-4 text-[#1B3A5C]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">
                        Lihat Semua
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                        {foods.length} Makanan
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Primary Action Button to Open Full Explore */}
                <Link href="/dashboard/explore" className="block">
                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-white hover:bg-slate-100 border border-slate-300 rounded-2xl text-xs font-black text-[#1B3A5C] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Buka Seluruh Katalog Makanan Surplus ({foods.length})</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#D4A843]" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="p-6 text-center bg-white border border-slate-200 rounded-2xl space-y-1.5">
                <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
                <h4 className="text-xs font-black text-slate-800">Tidak Ada Makanan yang Cocok</h4>
                <p className="text-[11px] text-slate-500">
                  Coba ubah kata kunci atau reset filter kategori.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategoryFilter('ALL');
                  }}
                  className="mt-1 py-1 px-3 bg-[#1B3A5C] text-white font-black text-[11px] rounded-lg cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </section>

          {/* Section Paling Bawah: Pusat Ekosistem Penyelamatan Pangan (Promo, Tiket Donasi, Edukasi, Kemitraan - Point 6) */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1B3A5C] block">
                Ekosistem Penyelamatan Pangan
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                Pusat Promo, Bantuan &amp; Kemitraan
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Pilih topik informasi sesuai kebutuhan Anda untuk diarahkan ke modul terkait.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Card 1: Promo & Diskon Surplus */}
              <div
                onClick={() => router.push('/dashboard/explore?tab=RESCUE_SALE')}
                className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 hover:border-amber-300 rounded-xl p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all hover:shadow-xs active:scale-98 group"
              >
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-amber-700" />
                  </div>
                  <h5 className="text-xs font-black text-slate-900 group-hover:text-amber-800 transition-colors leading-tight">
                    Promo Rescue
                  </h5>
                  <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                    Diskon belanja hemat hingga 70% kuliner surplus layak konsumsi.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-amber-800 pt-1 border-t border-amber-200/60">
                  <span>Buka Promo</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Card 2: Voucher & Hadiah (Tukar EcoPoints) - Pengganti Tiket Donasi */}
              <div
                onClick={() => router.push('/dashboard/consumer/rewards')}
                className="bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/80 hover:border-emerald-300 rounded-xl p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all hover:shadow-xs active:scale-98 group"
              >
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-800 flex items-center justify-center">
                    <Award className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h5 className="text-xs font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-tight">
                    Voucher &amp; Hadiah
                  </h5>
                  <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                    Tukar EcoPoints penyelamatan pangan jadi voucher diskon &amp; bibit pohon.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-emerald-800 pt-1 border-t border-emerald-200/60">
                  <span>Tukar Poin</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Card 3: Edukasi & Standar BPOM */}
              <div
                onClick={() => router.push('/dashboard/info')}
                className="bg-gradient-to-br from-blue-50 to-sky-50/70 border border-blue-200/80 hover:border-blue-300 rounded-xl p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all hover:shadow-xs active:scale-98 group"
              >
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-800 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-700" />
                  </div>
                  <h5 className="text-xs font-black text-slate-900 group-hover:text-blue-800 transition-colors leading-tight">
                    Edukasi Pangan
                  </h5>
                  <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                    Standar sanitasi BPOM RI, batas suhu aman, &amp; pencegahan food waste.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-blue-800 pt-1 border-t border-blue-200/60">
                  <span>Baca Edukasi</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Card 4: Rekomendasikan Gerai Langganan */}
              <div
                onClick={() => setIsPartnershipModalOpen(true)}
                className="bg-gradient-to-br from-indigo-50 to-purple-50/70 border border-indigo-200/80 hover:border-indigo-300 rounded-xl p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all hover:shadow-xs active:scale-98 group"
              >
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-800 flex items-center justify-center">
                    <Handshake className="w-4 h-4 text-indigo-700" />
                  </div>
                  <h5 className="text-xs font-black text-slate-900 group-hover:text-indigo-800 transition-colors leading-tight">
                    Rekomendasi Resto
                  </h5>
                  <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                    Ajak gerai kuliner langgananmu bergabung dalam ekosistem penyelamatan pangan.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-indigo-800 pt-1 border-t border-indigo-200/60">
                  <span>Lihat Info</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS (SHARED)                                                        */}
      {/* ========================================================================= */}

      {/* MODAL 1: PENJELASAN PAHLAWAN PANGAN & ECOPOINTS REPLATE */}
      <Modal
        isOpen={isPahlawanInfoModalOpen}
        onClose={() => setIsPahlawanInfoModalOpen(false)}
        title="Penjelasan Pahlawan Pangan & EcoPoints Replate"
      >
        <div className="space-y-3.5 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-black text-emerald-900 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Siapa itu Pahlawan Pangan Replate?</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              <strong>Pahlawan Pangan</strong> adalah gelar apresiasi bagi setiap konsumen Replate yang aktif menyelamatkan makanan surplus layak konsumsi (Rescue Sale) atau mengklaim donasi pangan. Anda adalah garda terdepan pencegahan emisi gas metana di Tempat Pembuangan Akhir (TPA) nasional.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-black text-slate-900">
                <Coins className="w-3.5 h-3.5 text-[#D4A843]" />
                <span>Apa itu EcoPoints Replate?</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                EcoPoints adalah sistem poin penghargaan dampak lingkungan nyata. Setiap <strong>1 porsi makanan yang Anda selamatkan</strong>, sistem secara otomatis menghadiahkan <strong>40 EcoPoints</strong> (setara mencegah ~0.9 kg emisi gas rumah kaca CO2e).
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-black text-slate-900">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Manfaat &amp; Cara Penukaran Poin:</span>
              </div>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                <li><strong>100 Poin:</strong> Voucher potongan belanja Rescue Sale Rp 10.000.</li>
                <li><strong>150 Poin:</strong> Donasi 1 bibit pohon mangrove di program konservasi pesisir nusantara.</li>
                <li><strong>Lencana Digital:</strong> Meningkatkan level status kontribusi hijau akun Anda.</li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPahlawanInfoModalOpen(false)}
            className="w-full py-2.5 bg-[#1B3A5C] text-white font-black rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Saya Mengerti
          </button>
        </div>
      </Modal>

      {/* MODAL 2: INFORMASI ZONA & RADIUS PENJEMPUTAN (SUPERADMIN CONTROLLED) */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Informasi Zona & Radius Penjemputan"
      >
        <div className="space-y-3.5 text-xs text-slate-700">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-black text-[#1B3A5C]">
              <MapPin className="w-4 h-4 text-[#1B3A5C]" />
              <span>Zona Domisili Akun Terdaftar:</span>
            </div>
            <strong className="text-sm font-black text-slate-900 block">{consumerAddress}</strong>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Kecamatan penjemputan disinkronkan secara otomatis dari data profil akun Anda.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-black text-amber-900">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Radius Penyelamatan: &lt; {syncRadius} km</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Radius penjemputan ditetapkan secara terpusat oleh <strong>SuperAdmin</strong> untuk memastikan seluruh surplus makanan yang Anda ambil tetap berada dalam batas toleransi kesegaran dan higienitas 3 jam BPOM RI.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <Link href="/dashboard/profile" className="w-full sm:flex-1">
              <button
                type="button"
                className="w-full py-2.5 bg-[#1B3A5C] text-white font-black rounded-xl text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Perbarui Alamat di Profil</span>
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: TIKET QR KLAIM AKTIF */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="Tiket QR Digital Penjemputan Makanan"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
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
            className="w-full py-2.5 bg-[#1B3A5C] text-white font-black rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Tutup Tiket QR
          </button>
        </div>
      </Modal>

      {/* MODAL 4: TUKAR ECOPOINTS */}
      <Modal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
        title="Pusat Penukaran EcoPoints Replate"
      >
        <div className="space-y-3.5 text-xs text-slate-700">
          <div className="p-3.5 bg-gradient-to-r from-[#1B3A5C] to-[#0E4A3B] text-white rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#D4A843] font-black uppercase">Saldo EcoPoints Anda</span>
              <h3 className="text-xl font-black text-amber-300 font-mono">{ecoPoints} Poin</h3>
              <span className="text-[10px] text-slate-300">Setara dengan ~{totalSavedPortions} porsi terselamatkan</span>
            </div>
            <Sparkles className="w-8 h-8 text-[#D4A843]" />
          </div>

          <div className="space-y-2.5">
            <h4 className="font-black text-slate-800 text-xs">Pilihan Reward & Penukaran:</h4>

            <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-amber-400 transition-all">
              <div className="space-y-0.5">
                <strong className="text-xs text-slate-900 block font-bold">Voucher Potongan Rp 10.000</strong>
                <span className="text-[10px] text-slate-500 block">Digunakan untuk pesanan Rescue Sale berikutnya</span>
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
                    message: 'Luar biasa! 150 Poin didonasikan untuk bibit mangrove di Wonorejo.',
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

      {/* MODAL 5: STANDAR BPOM RI */}
      <Modal
        isOpen={isBPOMModalOpen}
        onClose={() => setIsBPOMModalOpen(false)}
        title="Jaminan Keamanan Pangan Replate (SOP BPOM RI)"
      >
        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Standar Operasional Higienis 100% Bebas Khawatir</span>
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
          </div>

          <button
            type="button"
            onClick={() => setIsBPOMModalOpen(false)}
            className="w-full py-2.5 bg-[#1B3A5C] text-white font-black rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Saya Memahami Standar BPOM
          </button>
        </div>
      </Modal>

      {/* MODAL 6: PENJELASAN STATUS KONSUMEN REGULER (DESKTOP) */}
      <Modal
        isOpen={isStatusExplanationModalOpen}
        onClose={() => setIsStatusExplanationModalOpen(false)}
        title="Informasi Status Akun Konsumen"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#1B3A5C] font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Status Akun: Konsumen Reguler</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Di Replate, seluruh akun konsumen berhak menikmati <strong>Rescue Sale diskon hingga 70%</strong> dan mengklaim <strong>Donasi Makanan Rp 0</strong> berstandar higienis BPOM RI tanpa perlu mengunggah surat keterangan SKTM.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsStatusExplanationModalOpen(false)}
            className="w-full py-2.5 bg-[#1B3A5C] text-white font-black rounded-xl text-xs cursor-pointer"
          >
            Tutup Informasi
          </button>
        </div>
      </Modal>

      {/* MODAL: INFO KEMITRAAN TOKO & RESTO REPLATE */}
      <Modal
        isOpen={isPartnershipModalOpen}
        onClose={() => setIsPartnershipModalOpen(false)}
        title="Informasi Kemitraan Resto & Toko"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
              <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Ajak Resto / Toko Roti Bergabung</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ketahui bagaimana restoran, bakery, hotel, atau katering dapat menjual makanan berlebih prima dengan potongan harga terukur atau menyalurkannya sebagai donasi.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">Monetisasi Surplus Prima</strong>
                <span className="text-[11px] text-slate-600">Menjual stok makanan prima menjelang tutup gerai via Rescue Sale agar tidak menjadi limbah.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">Laporan Audit ESG &amp; SDGs</strong>
                <span className="text-[11px] text-slate-600">Perhitungan resmi reduksi emisi gas metana dan porsi pangan terselamatkan untuk gerai mitra.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsPartnershipModalOpen(false);
                router.push('/register?role=FOOD_PROVIDER');
              }}
              className="w-full py-3 bg-gradient-to-r from-[#1B3A5C] to-[#254d79] hover:brightness-110 active:scale-98 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
            >
              <Handshake className="w-4 h-4 text-[#D4A843]" />
              <span>Buka Formulir Pendaftaran Mitra Toko</span>
            </button>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20Kemitraan%20Replate,%20saya%20ingin%20berkonsultasi%20mengenai%20kemitraan%20gerai%20F%26B."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Konsultasi Hotline WhatsApp Kemitraan</span>
            </a>

            <button
              type="button"
              onClick={() => setIsPartnershipModalOpen(false)}
              className="w-full py-2 text-slate-500 hover:text-slate-700 font-bold text-xs cursor-pointer text-center"
            >
              Tutup &amp; Kembali
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 7: FOOD DETAIL MODAL */}
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

      {/* GLOBAL TOAST & LOADER */}
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

      {/* Mobile Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Keluar dari Akun?</h3>
                <p className="text-xs text-slate-500 font-medium">Akhiri sesi login konsumen di perangkat ini.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Data EcoPoints, riwayat klaim, dan domisili tersimpan Anda tetap aman di cloud Replate. Anda dapat masuk kembali kapan saja.
            </p>
            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </div>
  );
}
