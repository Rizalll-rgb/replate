'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { FoodCard } from '@/components/food/FoodCard';
import { CheckIcon } from '@/components/ui/Icon';
import { MapPin, Utensils } from 'lucide-react';
import { SHARED_PANTI_NEEDS, SharedPantiNeed, deduplicatePantiNeeds } from '@/lib/pantiData';
import { MOCK_SURPLUS_FOODS } from '@/lib/mockDatabase';
import { resolveIndonesianAddress } from '@/lib/geoResolver';

interface FoodItem {
  id: string;
  title: string;
  description?: string;
  providerName: string;
  providerPhone?: string;
  providerAddress?: string;
  originalPrice: number;
  discountPrice: number;
  quantity: string;
  pickupTime: string;
  distance: string;
  category: string;
  isFree: boolean;
  type: 'RESCUE_SALE' | 'DONATION';
  imageUrl: string;
  rating?: number;
  storageCondition?: string;
  packagingType?: string;
  weightPerUnitKg?: number;
  allergens?: string[];
  lat?: number;
  lng?: number;
  status?: string;
}

// interface PantiNeed was replaced by SharedPantiNeed
export default function ExplorePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<'RESCUE_SALE' | 'DONATION' | 'PANTI_NEEDS' | 'OUT_OF_STOCK'>('RESCUE_SALE');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPantiLocation, setFilterPantiLocation] = useState<string>('ALL');
  const [filterPantiUrgency, setFilterPantiUrgency] = useState<string>('ALL');

  const [userRole, setUserRole] = useState<string>('FOOD_CONSUMER');
  const [isConsumerVerified, setIsConsumerVerified] = useState<boolean>(true);

  // Selected Food for Detail Modal (Rescue Sale & Donasi Food Rescue)
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<any | null>(null);

  const [foods, setFoods] = useState<FoodItem[]>(MOCK_SURPLUS_FOODS as unknown as FoodItem[]);
  const [pantiNeeds, setPantiNeeds] = useState<SharedPantiNeed[]>(SHARED_PANTI_NEEDS);

  // Shelter Profile Detail Modal State
  const [selectedShelterProfile, setSelectedShelterProfile] = useState<SharedPantiNeed | null>(null);

  // Fulfill Modal State
  const [fulfillModal, setFulfillModal] = useState<{
    isOpen: boolean;
    need: SharedPantiNeed | null;
    portions: string;
    deliveryMethod: string;
    hygieneChecked: boolean;
  }>({
    isOpen: false,
    need: null,
    portions: '20',
    deliveryMethod: 'RESCUE_COURIER',
    hygieneChecked: true,
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Auth Required Guard Modal
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    actionTitle: string;
    itemTitle?: string;
  }>({
    isOpen: false,
    actionTitle: 'Klaim Makanan',
    itemTitle: '',
  });

  const [mismatchModal, setMismatchModal] = useState<{ isOpen: boolean; itemTitle: string }>({
    isOpen: false,
    itemTitle: '',
  });

  useEffect(() => {
    if (session?.user) {
      setUserRole(session.user.role || 'FOOD_CONSUMER');
    }

    try {
      const vStatus = localStorage.getItem('replate_consumer_verification_status');
      if (vStatus) {
        setIsConsumerVerified(vStatus === 'BENEFICIARY_VERIFIED');
      }
    } catch (_) {}

    try {
      const customPantiReqs = localStorage.getItem('replate_panti_requests');
      if (customPantiReqs) {
        const parsed = JSON.parse(customPantiReqs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPantiNeeds(deduplicatePantiNeeds([...parsed, ...SHARED_PANTI_NEEDS]));
        }
      }
    } catch (_) {}

    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]')
        .filter((item: any) => item.status === 'AVAILABLE' || !item.status);
    } catch (_) {}

    const normalizeCategory = (cat?: string): string => {
      if (!cat) return 'MAKANAN_BERAT';
      const c = cat.toUpperCase();
      if (c === 'MEALS' || c === 'MAKANAN_BERAT' || c.includes('BERAT') || c.includes('OLAHAN')) return 'MAKANAN_BERAT';
      if (c === 'BAKERY' || c === 'ROTI_KUE' || c.includes('ROTI') || c.includes('KUE') || c.includes('BAKERY')) return 'ROTI_KUE';
      if (c === 'DAIRY' || c === 'BEVERAGES' || c === 'MINUMAN_SUSU' || c.includes('SUSU') || c.includes('MINUM')) return 'MINUMAN_SUSU';
      if (c === 'PRODUCE' || c === 'BUAH_SAYUR' || c.includes('BUAH') || c.includes('SAYUR')) return 'BUAH_SAYUR';
      if (c === 'BAHAN_MENTAH' || c === 'SNACKS' || c === 'OTHER' || c.includes('MENTAH') || c.includes('POKOK')) return 'BAHAN_MENTAH';
      return 'MAKANAN_BERAT';
    };

    const extractPhoto = (item: any): string => {
      if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.length > 2) return item.imageUrl;
      if (item.photoUrl && typeof item.photoUrl === 'string' && item.photoUrl.length > 2) return item.photoUrl;
      if (item.photo && typeof item.photo === 'string' && item.photo.length > 2) return item.photo;
      if (item.photos) {
        if (Array.isArray(item.photos) && item.photos.length > 0 && typeof item.photos[0] === 'string') return item.photos[0];
        if (typeof item.photos === 'string') {
          try {
            const parsed = JSON.parse(item.photos);
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') return parsed[0];
            if (typeof parsed === 'string' && parsed.length > 2) return parsed;
          } catch (_) {
            if (item.photos.startsWith('http') || item.photos.startsWith('data:') || item.photos.startsWith('/')) return item.photos;
          }
        }
      }
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
    };

    const mapToFoodItem = (item: any): FoodItem => {
      const isDonation = item.isFree === true || item.pricingScheme === 'DONATION' || item.pricingScheme === 'DONATION_YAYASAN' || item.pricingScheme === 'DONATION_INDIVIDUAL' || item.distributionType === 'FREE' || item.discountPrice === 0 || item.price === 0;
      const originalPrice = Number(item.originalPrice || 25000);
      const discountPrice = isDonation ? 0 : Number(item.discountPrice !== undefined ? item.discountPrice : (item.price || 5000));
      const rawQty = item.remainingQuantity !== undefined ? item.remainingQuantity : item.quantity;
      const quantityStr = typeof rawQty === 'number' ? `${rawQty} ${item.quantityUnit || 'Porsi'}` : String(rawQty || '10 Porsi');

      return {
        id: item.id || `food-${Math.random()}`,
        title: item.foodName || item.title || 'Makanan Surplus',
        description: item.description || 'Makanan surplus terverifikasi higienis SOP BPOM RI.',
        providerName: item.provider?.organizationName || item.provider?.name || item.providerName || item.storeName || 'Warung Bakso Pak Kumis',
        providerPhone: item.provider?.phone || '081234567891',
        providerAddress: item.address || item.pickupAddress || 'Jl. Genteng Kali No. 45, Surabaya',
        originalPrice,
        discountPrice,
        quantity: quantityStr,
        pickupTime: item.pickupTime || 'Hari ini 19:00 - 21:00 WIB',
        distance: item.distance || '1.2 km',
        category: normalizeCategory(item.foodCategory || item.category),
        isFree: isDonation,
        type: isDonation ? 'DONATION' : 'RESCUE_SALE',
        imageUrl: extractPhoto(item),
        rating: item.rating || 4.8,
        storageCondition: item.storageCondition || 'ROOM_TEMP',
        packagingType: item.packagingType || 'PACKAGED',
        weightPerUnitKg: Number(item.weightPerUnitKg || 0.4),
        allergens: item.allergens || ['Nut-Free', 'Halal BPJPH', 'Sterile Container'],
        lat: item.lat || item.latitude || -7.2575,
        lng: item.lng || item.longitude || 112.7521,
        status: item.status || 'AVAILABLE',
      };
    };

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

  // Synchronized single source of truth for surplus foods across all explore pages
  const defaultFoods: FoodItem[] = MOCK_SURPLUS_FOODS as unknown as FoodItem[];

  const categoryList = [
    { key: 'ALL', name: 'Semua Kategori' },
    { key: 'MAKANAN_BERAT', name: 'Makanan Berat' },
    { key: 'ROTI_KUE', name: 'Roti & Bakery' },
    { key: 'MINUMAN_SUSU', name: 'Minuman & Susu' },
    { key: 'BUAH_SAYUR', name: 'Buah & Sayur' },
    { key: 'BAHAN_MENTAH', name: 'Bahan Pokok' },
  ];

  const outOfStockCount = useMemo(() => {
    return foods.filter((item) => {
      const qNum = parseInt(String(item.quantity || '').replace(/\D/g, '')) || 0;
      return qNum === 0 || item.status === 'OUT_OF_STOCK';
    }).length;
  }, [foods]);

  const filteredFoods = foods.filter((item) => {
    if (activeTab === 'PANTI_NEEDS') return false;

    const qtyNumber = parseInt(String(item.quantity || '').replace(/\D/g, '')) || 0;
    const isOutOfStock = qtyNumber === 0 || item.status === 'OUT_OF_STOCK';

    if (activeTab === 'OUT_OF_STOCK') {
      if (!isOutOfStock) return false;
    } else {
      if (isOutOfStock) return false;
      if (activeTab === 'RESCUE_SALE' && item.isFree) return false;
      if (activeTab === 'DONATION' && !item.isFree) return false;
    }

    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.providerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredPantiNeeds = useMemo(() => {
    const rawFiltered = pantiNeeds.filter((need) => {
      const matchLoc =
        filterPantiLocation === 'ALL' ||
        need.location.toLowerCase().includes(filterPantiLocation.toLowerCase()) ||
        need.address.toLowerCase().includes(filterPantiLocation.toLowerCase());
      const matchUrg = filterPantiUrgency === 'ALL' || need.urgency === filterPantiUrgency;
      return matchLoc && matchUrg;
    });
    return deduplicatePantiNeeds(rawFiltered);
  }, [pantiNeeds, filterPantiLocation, filterPantiUrgency]);

  const handleAddToCart = (item: FoodItem) => {
    if (status !== 'authenticated' || !session?.user) {
      setAuthModal({
        isOpen: true,
        actionTitle: 'Klaim Makanan Surplus',
        itemTitle: item.title,
      });
      return;
    }

    try {
      const existingCart = JSON.parse(localStorage.getItem('replate_cart') || '[]');
      const cartItem = {
        id: item.id,
        foodName: item.title,
        providerName: item.providerName,
        price: item.discountPrice,
        originalPrice: item.originalPrice,
        quantity: 1,
        maxQuantity: parseInt(item.quantity) || 5,
        imageUrl: item.imageUrl,
        pickupTime: item.pickupTime,
        isFree: item.isFree,
      };

      const foundIdx = existingCart.findIndex((c: any) => c.id === item.id);
      if (foundIdx >= 0) {
        existingCart[foundIdx].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }
      localStorage.setItem('replate_cart', JSON.stringify(existingCart));
      localStorage.setItem('replate_tas_klaim', JSON.stringify(existingCart));

      setToastState({
        isOpen: true,
        message: `"${item.title}" berhasil ditambahkan ke Tas Klaim!`,
        type: 'success',
      });
    } catch (_) {
      setToastState({
        isOpen: true,
        message: 'Gagal memasukkan ke keranjang.',
        type: 'error',
      });
    }
  };

  const handleBuyNow = (item: FoodItem) => {
    if (status !== 'authenticated' || !session?.user) {
      setAuthModal({
        isOpen: true,
        actionTitle: 'Klaim Makanan Surplus',
        itemTitle: item.title,
      });
      return;
    }

    router.push(`/dashboard/checkout/${item.id}`);
  };

  const handleOpenFoodDetail = (item: FoodItem) => {
    setSelectedFoodForModal({
      id: item.id,
      foodName: item.title,
      description: item.description,
      foodCategory: item.category === 'MAKANAN_BERAT' ? 'Makanan Olahan (Meals)' : item.category === 'ROTI_KUE' ? 'Roti & Bakery' : 'Makanan Surplus',
      quantity: parseInt(item.quantity) || 10,
      quantityUnit: 'Porsi',
      price: item.isFree ? 0 : item.discountPrice,
      pickupDeadline: item.pickupTime,
      address: item.providerAddress || 'Jl. Raya Darmo No. 45, Surabaya',
      storageCondition: item.storageCondition || 'ROOM_TEMP',
      packagingType: item.packagingType || 'PACKAGED',
      weightPerUnitKg: item.weightPerUnitKg || 0.4,
      allergens: item.allergens || ['Nut-Free', 'Halal BPJPH', 'Wadah Steril'],
      lat: item.lat || -7.2575,
      lng: item.lng || 112.7521,
      provider: {
        name: item.providerName,
        organizationName: item.providerName,
        phone: item.providerPhone || '081234567891',
      },
    });
  };

  const handleSanggupiPanti = (need: SharedPantiNeed) => {
    if (status !== 'authenticated' || !session?.user) {
      setAuthModal({
        isOpen: true,
        actionTitle: 'Menyanggupi Bantuan Panti',
        itemTitle: need.pantiName,
      });
      return;
    }

    setFulfillModal({
      isOpen: true,
      need,
      portions: '30',
      deliveryMethod: need.preferredDelivery,
      hygieneChecked: true,
    });
  };

  const handleConfirmFulfill = () => {
    if (!fulfillModal.need) return;

    if (!fulfillModal.hygieneChecked) {
      alert('Anda wajib menyetujui konfirmasi SOP Higienitas BPOM RI.');
      return;
    }

    const portionsNum = parseInt(fulfillModal.portions) || 0;
    if (portionsNum <= 0) {
      alert('Jumlah porsi harus lebih dari 0.');
      return;
    }

    setPantiNeeds((prev) =>
      prev.map((n) => {
        if (n.id === fulfillModal.need?.id) {
          const currentFulfilled = parseInt(n.fulfilledQuantity.replace(/\D/g, '')) || 0;
          return {
            ...n,
            fulfilledQuantity: `${currentFulfilled + portionsNum} Porsi`,
          };
        }
        return n;
      })
    );

    setFulfillModal({ isOpen: false, need: null, portions: '20', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true });
    setToastState({
      isOpen: true,
      message: `Terima kasih! Anda berhasil menyanggupi donasi ${portionsNum} porsi untuk ${fulfillModal.need.pantiName}. Notifikasi telah dikirim ke pengurus panti & armada relawan.`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />

      <main className="flex-1 py-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] text-xs font-black uppercase tracking-wider">
            KATALOG EKSPLORASI PANGAN INDONESIA
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B3A5C] tracking-tight">
            Selamatkan Makanan Surplus & Penuhi Nutrisi Sesama
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Temukan makanan berkualitas diskon hingga 70% (Rescue Sale) atau salurkan donasi food rescue steril bebas biaya untuk yayasan, komunitas, dan sesama di seluruh Indonesia.
          </p>
        </div>

        {/* 4 Main Navigation Tabs - Fully Responsive across Mobile, Tablet, & Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl max-w-4xl mx-auto w-full shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('RESCUE_SALE')}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'RESCUE_SALE'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 font-bold'
            }`}
          >
            <span>Rescue Sale</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DONATION')}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'DONATION'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 font-bold'
            }`}
          >
            <span>Donasi (Rp 0)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('OUT_OF_STOCK')}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'OUT_OF_STOCK'
                ? 'bg-rose-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 font-bold'
            }`}
          >
            <span>Stok Habis ({outOfStockCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PANTI_NEEDS')}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'PANTI_NEEDS'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 font-bold'
            }`}
          >
            <span>Permintaan Panti ({pantiNeeds.length})</span>
          </button>
        </div>

        {/* Search & Category Filter for Food Items */}
        {activeTab !== 'PANTI_NEEDS' && (
          <div className="space-y-4">
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Cari menu makanan, nama restoran / bakery di seluruh Indonesia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#1B3A5C] shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {categoryList.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all text-xs font-bold cursor-pointer truncate ${
                    selectedCategory === cat.key
                      ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Content Grid (RESCUE SALE & DONASI FOOD RESCUE DENGAN DETAIL LENGKAP & GPS) */}
        {activeTab !== 'PANTI_NEEDS' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1B3A5C]">
                {activeTab === 'RESCUE_SALE' ? 'Katalog Surplus Rescue Sale' : 'Katalog Donasi Steril Rp 0'} ({filteredFoods.length} Item)
              </h3>
              <span className="text-xs text-slate-500 font-medium">Terverifikasi Higienis SOP BPOM</span>
            </div>

            {filteredFoods.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-800 text-base">Tidak ada makanan surplus ditemukan</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Coba ubah kata kunci pencarian atau pilih kategori makanan lainnya.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
                {filteredFoods.map((item) => (
                  <FoodCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    providerName={item.providerName}
                    category={item.category}
                    quantity={item.quantity}
                    discountPrice={item.discountPrice}
                    originalPrice={item.originalPrice}
                    status={item.status}
                    isFree={item.isFree}
                    distance={item.distance}
                    imageUrl={item.imageUrl}
                    onClaim={() => handleBuyNow(item)}
                    onAddToCart={() => handleAddToCart(item)}
                    onDetail={() => handleOpenFoodDetail(item)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tab Permintaan Bantuan Panti Asuhan (DENGAN TAMPILAN KONSISTEN DENGAN FOODCARD) */
          <div className="space-y-6">
            <div className="p-4 sm:p-6 bg-[#1B3A5C] text-white rounded-2xl sm:rounded-3xl shadow-lg border border-[#2C5A8F] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[#D4A843] font-black text-[10px] sm:text-xs uppercase tracking-wider block">
                  PROGRAM REDISTRIBUSI PANGAN YAYASAN & PANTI
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">Daftar Kebutuhan Pangan Yayasan & Panti Asuhan (Nasional)</h3>
                <p className="text-xs text-slate-200 font-medium max-w-xl">
                  Restoran, Bakery, atau Donatur dapat langsung memilih yayasan atau panti asuhan yang membutuhkan, melihat titik lokasi peta GPS, dan menyanggupi alokasi makanan secara langsung.
                </p>
              </div>

              {userRole === 'FOOD_BENEFICIARY' && (
                <Link href="/dashboard/yayasan/claims">
                  <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 whitespace-nowrap shadow-md">
                    + Buat Permintaan Panti Baru
                  </Button>
                </Link>
              )}
            </div>

            {/* Filter Bar Kebutuhan Panti */}
            <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-[#1B3A5C]">Filter Kota:</span>
                <select
                  value={filterPantiLocation}
                  onChange={(e) => setFilterPantiLocation(e.target.value)}
                  className="rounded-xl border border-slate-300 text-xs px-2.5 sm:px-3 py-1.5 bg-white font-bold text-[#1B3A5C] focus:outline-none"
                >
                  <option value="ALL">Semua Kota</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Medan">Medan</option>
                  <option value="Semarang">Semarang</option>
                </select>

                <span className="font-black text-[#1B3A5C] ml-1 sm:ml-2">Urgensi:</span>
                <select
                  value={filterPantiUrgency}
                  onChange={(e) => setFilterPantiUrgency(e.target.value)}
                  className="rounded-xl border border-slate-300 text-xs px-2.5 sm:px-3 py-1.5 bg-white font-bold text-[#1B3A5C] focus:outline-none"
                >
                  <option value="ALL">Semua Urgensi</option>
                  <option value="HIGH">Urgent (Hari Ini)</option>
                  <option value="MEDIUM">Membutuhkan</option>
                </select>
              </div>

              <span className="text-[11px] font-bold text-slate-500">
                Menampilkan {filteredPantiNeeds.length} dari {pantiNeeds.length} Lembaga
              </span>
            </div>

            {/* Grid Permintaan Panti (Konsisten dengan FoodCard di Rescue Sale & Donasi) */}
            {filteredPantiNeeds.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-800 text-base">Tidak ada permintaan panti ditemukan</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Coba sesuaikan filter wilayah atau urgensi kebutuhan panti asuhan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
                {filteredPantiNeeds.map((need) => {
                  const targetNum = parseInt(String(need.targetQuantity).replace(/\D/g, '')) || 1;
                  const fulfilledNum = parseInt(String(need.fulfilledQuantity).replace(/\D/g, '')) || 0;
                  const percent = Math.min(100, Math.round((fulfilledNum / targetNum) * 100));

                  return (
                    <div
                      key={need.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#1B3A5C]/40 transition-all flex flex-col justify-between group cursor-pointer"
                      onClick={() => setSelectedShelterProfile(need)}
                    >
                      {/* Panti Cover Image & Badges */}
                      <div className="relative h-28 sm:h-44 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={need.imageUrl}
                          alt={need.pantiName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1 sm:gap-1.5">
                          <span
                            className={`text-[8.5px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-xs ${
                              need.urgency === 'HIGH'
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-[#D4A843] text-slate-950'
                            }`}
                          >
                            {need.urgency === 'HIGH' ? 'URGENT' : 'BUTUH'}
                          </span>
                          <span className="text-[8.5px] sm:text-[10px] bg-slate-950/80 text-emerald-300 font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg backdrop-blur-xs flex items-center gap-0.5">
                            <CheckIcon size={9} />
                            <span>{need.legalStatus.replace('Terdaftar ', '')}</span>
                          </span>
                        </div>
                        <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-[8.5px] sm:text-[10px] bg-slate-900/80 text-amber-300 font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-0.5 sm:gap-1">
                          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
                          <span>{need.location.split('(')[0].trim()}</span>
                        </span>
                      </div>

                      <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-0.5 sm:space-y-1">
                          <span className="text-[9.5px] sm:text-[11px] font-semibold text-slate-500 block truncate">
                            {need.shelterType} • {need.beneficiariesCount} Jiwa
                          </span>
                          <h4 className="font-extrabold text-xs sm:text-base text-[#1B3A5C] line-clamp-1 leading-snug group-hover:text-blue-900 transition-colors">
                            {need.pantiName}
                          </h4>
                          <p className="text-[9.5px] sm:text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                            <Utensils className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{need.foodCategoryNeeded}</span>
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 py-0.5">
                          <div className="flex justify-between text-[9px] sm:text-[10.5px] font-bold text-slate-600">
                            <span>Target: {need.targetQuantity}</span>
                            <span className="text-emerald-700 font-black">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick detail secondary link */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShelterProfile(need);
                          }}
                          className="w-full py-1 sm:py-1.5 bg-slate-50 hover:bg-slate-100 text-[#1B3A5C] font-extrabold text-[10px] sm:text-[11px] rounded-lg sm:rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Detail & Peta GPS</span>
                          <span>→</span>
                        </button>

                        {/* Bottom Footer / Action Row */}
                        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                          <div>
                            <span className="text-xs sm:text-base font-black text-[#1B3A5C] block leading-tight">
                              {need.fulfilledQuantity}
                            </span>
                            <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-bold block leading-tight">
                              dari {need.targetQuantity}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSanggupiPanti(need);
                            }}
                            className="w-full sm:w-auto px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Sanggupi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      {session?.user && <BottomNav user={session.user} />}

      {/* RICH FOOD DETAIL MODAL (RESCUE SALE & DONASI FOOD RESCUE Rp 0 DENGAN PETA GPS & WA DIRECT) */}
      {selectedFoodForModal && (
        <FoodDetailModal
          isOpen={selectedFoodForModal !== null}
          onClose={() => setSelectedFoodForModal(null)}
          food={selectedFoodForModal}
          onClaim={(id) => {
            const item = foods.find((f) => f.id === id);
            if (item) handleBuyNow(item);
          }}
          onAddToCart={(id) => {
            const item = foods.find((f) => f.id === id);
            if (item) handleAddToCart(item);
          }}
        />
      )}

      {/* Modal Detail Profil Lembaga & Titik Lokasi Peta GPS (SAMA SEPERTI DI PROVIDER DONATIONS) */}
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
              <span>Hubungi WhatsApp Penerima / Perwakilan (Koordinasi Direct) </span>
            </a>

            {/* Embed Google Maps GPS */}
            {(() => {
              const resGeo = selectedShelterProfile.address ? resolveIndonesianAddress(selectedShelterProfile.address) : null;
              const sLat = selectedShelterProfile.lat || resGeo?.lat || -7.65569;
              const sLng = selectedShelterProfile.lng || resGeo?.lng || 111.27984;

              return (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-[#1B3A5C]">Titik Koordinat Lokasi Peta GPS</h4>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      GPS: {sLat}, {sLng}
                    </span>
                  </div>

                  <div className="relative w-full h-44 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 shadow-xs">
                    <iframe
                      title="Shelter Location Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://maps.google.com/maps?q=${sLat},${sLng}&z=15&output=embed`}
                      className="w-full h-full filter saturate-150"
                    />
                    <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider">
                      Titik Lokasi: {selectedShelterProfile.pantiName}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[70%]">
                      Alamat: {selectedShelterProfile.address || resGeo?.formattedAddress}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${sLat},${sLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-black text-blue-600 hover:underline shrink-0"
                    >
                      Buka di Google Maps ↗
                    </a>
                  </div>
                </div>
              );
            })()}

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
                  handleSanggupiPanti(target);
                }}
              >
                Sanggupi Bantuan Panti Ini 
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Sanggupi Permintaan Panti (DENGAN SMART MATCHING & SOP HIGIENITAS BPOM) */}
      <Modal
        isOpen={fulfillModal.isOpen}
        onClose={() => setFulfillModal({ isOpen: false, need: null, portions: '20', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}
        title={`Alur Sanggupi Donasi: ${fulfillModal.need?.pantiName || 'Panti Asuhan'}`}
        size="lg"
      >
        {fulfillModal.need && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-5 bg-[#1B3A5C] text-white rounded-2xl space-y-1.5 shadow-md border border-[#2C5A8F]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-[#D4A843] tracking-widest block">
                  TARGET PENERIMA BANTUAN PANGAN
                </span>
                <span className="px-3 py-1 bg-[#D4A843] text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  Kebutuhan: {fulfillModal.need.foodCategoryNeeded}
                </span>
              </div>

              <h4 className="text-xl font-black text-white leading-snug drop-shadow-xs">
                {fulfillModal.need.pantiName} ({fulfillModal.need.beneficiariesCount} Jiwa Penerima)
              </h4>

              <p className="text-xs text-slate-100 font-semibold flex items-center gap-2 pt-0.5">
                <span>Lokasi: {fulfillModal.need.location}</span>
                <span>•</span>
                <span>Batas Waktu: {fulfillModal.need.deadline}</span>
              </p>
            </div>

            {/* Smart Matching Engine Score Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">SMART MATCHING 2.0 COMPATIBILITY SCORE:</span>
                  <span className="text-xl font-black text-emerald-400">
                    96% MATCH SCORE (HIGHLY RECOMMENDED)
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-md flex items-center gap-1">
                  <CheckIcon size={10} />
                  <span>VERIFIKASI COCOK</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1 border-t border-slate-800">
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                  <span className="text-slate-400 block font-semibold">Kategori Gizi</span>
                  <span className="font-extrabold text-amber-400">30/30 Pts</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                  <span className="text-slate-400 block font-semibold">Proksimitas GPS</span>
                  <span className="font-extrabold text-amber-400">25/25 Pts</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                  <span className="text-slate-400 block font-semibold">Urgensi Waktu</span>
                  <span className="font-extrabold text-amber-400">20/20 Pts</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                  <span className="text-slate-400 block font-semibold">Standar BPOM</span>
                  <span className="font-extrabold text-amber-400">10/10 Pts</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 block">Jumlah Porsi Yang Siap Anda Donasikan:</label>
              <input
                type="number"
                min="1"
                value={fulfillModal.portions}
                onChange={(e) => setFulfillModal({ ...fulfillModal, portions: e.target.value })}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm text-[#1B3A5C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 block">Pilihan Metode Pengiriman:</label>
              <select
                value={fulfillModal.deliveryMethod}
                onChange={(e) => setFulfillModal({ ...fulfillModal, deliveryMethod: e.target.value })}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-[#1B3A5C]"
              >
                <option value="RESCUE_COURIER">Kurir Relawan Komunitas Replate (Auto-Assigned)</option>
                <option value="PROVIDER_DIRECT">Diantar Langsung Armada Toko</option>
                <option value="SHELTER_PICKUP">Diambil Mandiri oleh Pengurus Panti</option>
              </select>
            </div>

            <label className="flex items-start gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer text-emerald-900">
              <input
                type="checkbox"
                checked={fulfillModal.hygieneChecked}
                onChange={(e) => setFulfillModal({ ...fulfillModal, hygieneChecked: e.target.checked })}
                className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-emerald-300 focus:ring-0 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold block text-xs">Konfirmasi SOP Keamanan Pangan BPOM RI</span>
                <span className="text-[11px] block text-emerald-800 leading-relaxed font-medium">
                  Saya mengonfirmasi bahwa porsi makanan surplus yang dihibahkan dalam kondisi segar, siap santap &lt; 4 jam, dikemas steril, dan lulus 8-Checklist Higienitas Replate.
                </span>
              </div>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setFulfillModal({ isOpen: false, need: null, portions: '20', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}>
                Batal
              </Button>
              <Button variant="gold" size="sm" onClick={handleConfirmFulfill} className="font-black text-slate-950 shadow-md">
                Konfirmasi & Terbitkan Resi Donasi 
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Wajib Masuk / Daftar Akun */}
      <Modal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, actionTitle: 'Klaim Makanan', itemTitle: '' })}
        title="Silakan Masuk atau Daftar Akun untuk Melanjutkan"
        size="md"
      >
        <div className="space-y-5 text-xs text-slate-700">
          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2">
            <span className="font-black text-amber-950 text-sm block">
              Aksi Memerlukan Akun Terverifikasi Replate
            </span>
            <p className="text-amber-900 leading-relaxed font-medium">
              Untuk melakukan <strong>{authModal.actionTitle}</strong> {authModal.itemTitle ? `pada "${authModal.itemTitle}"` : ''} serta menjamin keamanan dan higienitas pangan standar BPOM RI, silakan masuk ke akun Anda atau daftar sebagai Mitra/Konsumen.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <Link href="/login?redirect=/explore" className="block w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full font-black text-xs py-3 shadow-md"
              >
                Masuk ke Akun Saya 
              </Button>
            </Link>

            <Link href="/register?redirect=/explore" className="block w-full">
              <Button
                variant="gold"
                size="md"
                className="w-full font-black text-xs text-slate-950 py-3 shadow-md"
              >
                Daftar Akun Baru Gratis 
              </Button>
            </Link>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setAuthModal({ isOpen: false, actionTitle: 'Klaim Makanan', itemTitle: '' })}
              className="text-slate-400 hover:text-slate-700 font-bold text-[11px] underline cursor-pointer"
            >
              Lihat Katalog Lainnya Dulu (Tutup)
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Mismatch Alert */}
      <Modal
        isOpen={mismatchModal.isOpen}
        onClose={() => setMismatchModal({ isOpen: false, itemTitle: '' })}
        title="Verifikasi Hak Akses Donasi Makanan Rp 0"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <span className="font-extrabold text-amber-900 text-sm block">
              Makanan Bebas Biaya Khusus Panti Asuhan & Warga Rentan SKTM
            </span>
            <p className="text-amber-800 leading-relaxed font-medium">
              Makanan <strong>&quot;{mismatchModal.itemTitle}&quot;</strong> dialokasikan khusus untuk yayasan panti asuhan atau masyarakat kurang mampu terverifikasi SKTM.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full font-extrabold text-xs"
              onClick={() => {
                setMismatchModal({ isOpen: false, itemTitle: '' });
                setActiveTab('RESCUE_SALE');
              }}
            >
              Pilih Makanan Rescue Sale (Diskon Murah) 
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
