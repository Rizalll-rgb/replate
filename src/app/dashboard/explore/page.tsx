'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SparklesIcon, AlertTriangleIcon, CheckIcon, TruckIcon, ShieldCheckIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { FoodCard } from '@/components/food/FoodCard';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
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

export default function WorkspaceExplorePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'RESCUE_SALE' | 'DONATION' | 'PANTI_NEEDS' | 'OUT_OF_STOCK'>('RESCUE_SALE');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [filterPantiLocation, setFilterPantiLocation] = useState<string>('ALL');
  const [filterPantiUrgency, setFilterPantiUrgency] = useState<string>('ALL');
  const [selectedShelterProfile, setSelectedShelterProfile] = useState<SharedPantiNeed | null>(null);

  // Allocate Modal State for Sanggupi Permintaan Panti (Identical to Smart Matching)
  const [allocateModal, setAllocateModal] = useState<{
    isOpen: boolean;
    panti: SharedPantiNeed | null;
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

  const [issuedTicketModal, setIssuedTicketModal] = useState<{
    isOpen: boolean;
    ticketData: any | null;
  }>({
    isOpen: false,
    ticketData: null,
  });

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  const [selectedFoodForModal, setSelectedFoodForModal] = useState<any | null>(null);

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
  
  const [syncRadius, setSyncRadius] = useState<number | null>(null);
  const [showAIAnalyticsDetails, setShowAIAnalyticsDetails] = useState(false);

  // Multi-Slide Interactive Promo Hero Carousel State (Point 9)
  const promoSlides = [
    {
      id: 'promo-1',
      badge: 'RESCUE SALE 50%-70% HARI INI',
      title: 'Selamatkan Surplus Lezat, Hemat Hingga 70%',
      highlight: 'Surplus Pangan Lezat',
      description: 'Dapatkan hidangan restoran & bakery berkualitas mulai Rp 5.000, bantu kurangi emisi gas metana dan susut pangan Bappenas.',
      btnText: 'Lihat Rescue Sale',
      targetTab: 'RESCUE_SALE' as const,
      foodPreview: {
        id: 'hero-food-1',
        title: 'Bakso Sapi Urat Komplit',
        providerName: 'Warung Bakso Pak Kumis',
        category: 'MAKANAN_BERAT',
        quantity: '15 Porsi',
        discountPrice: 6000,
        originalPrice: 18000,
        isFree: false,
        pickupTime: '19:30 WIB',
        distance: '1.2 km',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      },
    },
    {
      id: 'promo-2',
      badge: 'GERAKAN 1.000 PORSI DONASI BEBAS BIAYA',
      title: 'Bantu Panti Asuhan & Dhuafa Indonesia (Rp 0)',
      highlight: 'Nutrisi Anak Panti',
      description: 'Salurkan kelebihan makanan bergizi langsung ke 12 panti asuhan terverifikasi dengan armada kurir relawan Food Bank.',
      btnText: 'Lihat Donasi Food Rescue',
      targetTab: 'DONATION' as const,
      foodPreview: {
        id: 'hero-food-2',
        title: 'Buah Potong Segar Kemasan Kotak',
        providerName: 'Fresh Mart Darmo',
        category: 'BUAH_SAYUR',
        quantity: '12 Box',
        discountPrice: 0,
        originalPrice: 15000,
        isFree: true,
        pickupTime: '19:00 WIB',
        distance: '1.8 km',
        imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=60',
      },
    },
    {
      id: 'promo-3',
      badge: '100% SOP HIGIENE BPOM RI & HALAL BPJPH',
      title: 'Jaminan Standar Keamanan Pangan Steril',
      highlight: 'Higienis & Steril BPOM',
      description: 'Seluruh mitra dapur diaudit standar suhu simpan, inspeksi visual, serta surat jalan manifest digital terenkripsi.',
      btnText: 'Eksplor Pangan Halal',
      targetTab: 'RESCUE_SALE' as const,
      foodPreview: {
        id: 'hero-food-3',
        title: 'Nasi Kotak Ayam Bakar Madu',
        providerName: 'Katering Berkah',
        category: 'MAKANAN_BERAT',
        quantity: '24 Porsi',
        discountPrice: 8500,
        originalPrice: 25000,
        isFree: false,
        pickupTime: '20:00 WIB',
        distance: '2.4 km',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60',
      },
    },
    {
      id: 'promo-4',
      badge: ' HAPPY HOUR BAKERY & RESTO (19:00 - 22:00 WIB)',
      title: 'Nikmati Aneka Pastry & Roti Fresh Malam Hari',
      highlight: 'Artisan Bakery Surabaya',
      description: 'Jelajahi sajian roti artisan dan pastry lezat yang siap dijemput di kasir toko favorit Anda sebelum jam tutup operasional.',
      btnText: 'Jelajah Roti & Pastry ',
      targetTab: 'RESCUE_SALE' as const,
      foodPreview: {
        id: 'hero-food-4',
        title: 'Aneka Croissant & Roti Pastry',
        providerName: 'Surabaya Artisan Bakery',
        category: 'ROTI_KUE',
        quantity: '18 Pcs',
        discountPrice: 5000,
        originalPrice: 15000,
        isFree: false,
        pickupTime: '21:00 WIB',
        distance: '0.8 km',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      },
    },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  // Panti Needs data synchronized with explore page & smart matching (Single Source of Truth)
  const [pantiNeeds, setPantiNeeds] = useState<SharedPantiNeed[]>(SHARED_PANTI_NEEDS);
  const [filterPantiMethod, setFilterPantiMethod] = useState<'ALL' | 'SELF_PICKUP' | 'PARTNER_DELIVERY'>('ALL');

  useEffect(() => {
    try {
      const radius = localStorage.getItem('replate_admin_sync_radius');
      if (radius) setSyncRadius(parseInt(radius));
    } catch (_) {}

    try {
      const customPantiReqs = localStorage.getItem('replate_panti_requests');
      if (customPantiReqs) {
        const parsed = JSON.parse(customPantiReqs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly deduplicate with default SHARED_PANTI_NEEDS
          setPantiNeeds(deduplicatePantiNeeds([...parsed, ...SHARED_PANTI_NEEDS]));
        }
      }
    } catch (_) {}
  }, []);

  const [foods, setFoods] = useState<FoodItem[]>(MOCK_SURPLUS_FOODS as unknown as FoodItem[]);

  // Synchronized single source of truth for surplus foods across all explore pages
  const defaultFoods: FoodItem[] = MOCK_SURPLUS_FOODS as unknown as FoodItem[];

  const filteredPantiNeeds = useMemo(() => {
    const rawFiltered = pantiNeeds.filter((need) => {
      if (filterPantiLocation !== 'ALL' && !need.location.includes(filterPantiLocation)) {
        return false;
      }
      if (filterPantiUrgency !== 'ALL' && need.urgency !== filterPantiUrgency) {
        return false;
      }
      if (filterPantiMethod === 'SELF_PICKUP' && need.preferredDelivery && !need.preferredDelivery.toLowerCase().includes('pickup') && !need.preferredDelivery.toLowerCase().includes('sendiri')) {
        return false;
      }
      if (filterPantiMethod === 'PARTNER_DELIVERY' && need.preferredDelivery && !need.preferredDelivery.toLowerCase().includes('antar') && !need.preferredDelivery.toLowerCase().includes('partner') && !need.preferredDelivery.toLowerCase().includes('relawan')) {
        return false;
      }
      return true;
    });
    return deduplicatePantiNeeds(rawFiltered);
  }, [pantiNeeds, filterPantiLocation, filterPantiUrgency, filterPantiMethod]);

  // Helper: extract photo URL from diverse formats
  const extractExplorePhoto = (item: any): string => {
    if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.length > 2) return item.imageUrl;
    if (item.photoUrl && typeof item.photoUrl === 'string' && item.photoUrl.length > 2) return item.photoUrl;
    if (item.photo && typeof item.photo === 'string' && item.photo.length > 2) return item.photo;
    if (item.photos) {
      if (Array.isArray(item.photos) && item.photos.length > 0 && typeof item.photos[0] === 'string') {
        return item.photos[0];
      }
      if (typeof item.photos === 'string') {
        try {
          const parsed = JSON.parse(item.photos);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            return parsed[0];
          }
          if (typeof parsed === 'string' && parsed.length > 2) {
            return parsed;
          }
        } catch (_) {
          if (item.photos.startsWith('http') || item.photos.startsWith('data:') || item.photos.startsWith('/')) {
            return item.photos;
          }
        }
      }
    }
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
  };

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

  // Helper: map raw item to FoodItem
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
      providerName: item.provider?.organizationName || item.providerName || 'Warung Bakso Pak Kumis',
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
      imageUrl: extractExplorePhoto(item),
      rating: item.rating || 4.8,
      storageCondition: item.storageCondition || 'ROOM_TEMP',
      packagingType: item.packagingType || 'PACKAGED',
      weightPerUnitKg: Number(item.weightPerUnitKg || 0.4),
      allergens: item.allergens || ['Nut-Free', 'Halal BPJPH', 'Sterile Container'],
      lat: item.lat || item.latitude || resolveIndonesianAddress(item.address || item.pickupAddress || '').lat,
      lng: item.lng || item.longitude || resolveIndonesianAddress(item.address || item.pickupAddress || '').lng,
      status: item.status || 'AVAILABLE',
    };
  };

  useEffect(() => {
    // 1. Load local surplus items from localStorage (syncs newly added items)
    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]')
        .filter((item: any) => item.status === 'AVAILABLE' || !item.status);
    } catch (_) {}

    // 2. Fetch API surplus
    fetch('/api/surplus')
      .then((res) => res.json())
      .then((data) => {
        let apiItems: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          apiItems = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          apiItems = data.data;
        }

        // 3. Merge & deduplicate by ID (local takes priority)
        const combined = [...localItems, ...apiItems];
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
        // Offline: use local items + defaults
        if (localItems.length > 0) {
          const mappedLocal = localItems.map(mapToFoodItem);
          const defaultUnadded = defaultFoods.filter((df) => !mappedLocal.some((m) => m.id === df.id));
          setFoods([...mappedLocal, ...defaultUnadded]);
        } else {
          setFoods(defaultFoods);
        }
      });
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      let localItems: any[] = [];
      try {
        localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      } catch (_) {}

      const providerQuery = `&providerId=${session.user.id}`;
      fetch(`/api/surplus?status=${providerQuery}`)
        .then((res) => res.json())
        .then((data) => {
          let itemsList: any[] = [];
          if (data.success && Array.isArray(data.data?.items)) {
            itemsList = data.data.items;
          } else if (data.success && Array.isArray(data.data)) {
            itemsList = data.data;
          }

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

          const combined = deduplicateProducts([...localItems, ...itemsList]);
          setAvailableProducts(combined);
        })
        .catch(() => {});
    }
  }, [session]);

  const categoryList = [
    { key: 'ALL', name: 'Semua Kategori' },
    { key: 'MAKANAN_BERAT', name: 'Makanan Berat' },
    { key: 'ROTI_KUE', name: 'Roti & Bakery' },
    { key: 'MINUMAN_SUSU', name: 'Minuman & Susu' },
    { key: 'BUAH_SAYUR', name: 'Buah & Sayur' },
    { key: 'BAHAN_MENTAH', name: 'Bahan Pokok' },
  ];

  const userRole = (session?.user as any)?.role || (typeof window !== 'undefined' ? localStorage.getItem('replate_role') : '') || '';
  const isConsumer = String(userRole).toUpperCase().includes('CONSUMER');
  const isBeneficiary = String(userRole).toUpperCase().includes('BENEFICIARY') || String(userRole).toUpperCase().includes('YAYASAN');
  const maxRadiusKm = syncRadius || (typeof window !== 'undefined' ? Number(localStorage.getItem('replate_admin_sync_radius') || 15) : 15);

  const outOfStockCount = useMemo(() => {
    return foods.filter((item) => {
      const qNum = parseInt(String(item.quantity || '').replace(/\D/g, '')) || 0;
      return qNum === 0 || item.status === 'OUT_OF_STOCK';
    }).length;
  }, [foods]);

  const filteredFoods = foods.filter((item) => {
    if (activeTab === 'PANTI_NEEDS') return false; // Panti needs tab shows its own grid

    const qtyNumber = parseInt(String(item.quantity || '').replace(/\D/g, '')) || 0;
    const isItemOutOfStock = qtyNumber === 0 || item.status === 'OUT_OF_STOCK';

    if (activeTab === 'OUT_OF_STOCK') {
      if (!isItemOutOfStock) return false;
    } else {
      if (isItemOutOfStock) return false;
      if (activeTab === 'RESCUE_SALE' && item.isFree) return false;
      if (activeTab === 'DONATION' && !item.isFree) return false;
    }

    // Radius Geofencing for Beneficiary:
    // Filter out stores in other cities (e.g. Dago Bakery Heritage in Bandung) unless superadmin config allows larger radius
    if (isBeneficiary) {
      const dist = parseFloat(item.distance) || 0;
      const isFarLocation = item.providerName.toLowerCase().includes('dago bakery') || (dist > maxRadiusKm && dist > 0);
      if (isFarLocation) return false;
    }

    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.providerName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleClaimFood = (item: FoodItem) => {
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
        message: `"${item.title}" berhasil ditambahkan ke Tas Klaim Anda!`,
        type: 'success',
      });
    } catch (_) {}
  };

  const handleBuyNow = (item: FoodItem) => {
    setActionLoader({
      isOpen: true,
      message: 'Mempersiapkan Checkout...',
      submessage: `Mengalokasikan "${item.title}"`,
    });
    setTimeout(() => {
      localStorage.setItem('replate_checkout_item', JSON.stringify(item));
      router.push(`/dashboard/checkout/${item.id}`);
    }, 600);
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
        phone: item.providerPhone || '081234567890',
      },
    });
  };

  const handleOpenAllocationModal = (panti: SharedPantiNeed) => {
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

    const targetNeedQty = Number(panti.targetQuantity || 50);
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
    const targetNeedQty = allocateModal.panti ? Number(allocateModal.panti.targetQuantity || 50) : 50;
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

    const targetNeedQty = Number(allocateModal.panti.targetQuantity || 50);
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
    const ticketCode = `RPL-DON-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

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
      // 1. Save new claim into replate_claims for instant display in Claims Module & Governance Tracker
      const existingClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
      localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingClaims]));

      // 2. Deduct portions from local surplus dynamically
      const localSurplus = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      let foundInLocal = false;
      const updatedSurplus = localSurplus.map((item: any) => {
        if (item.id === selectedProduct.id) {
          foundInLocal = true;
          const currentQty = Number(item.remainingQuantity !== undefined ? item.remainingQuantity : (item.quantity || 0));
          const newQty = Math.max(0, currentQty - allocateModal.portions);
          return { ...item, remainingQuantity: newQty, quantity: newQty };
        }
        return item;
      });

      if (!foundInLocal) {
        const currentQty = Number(selectedProduct.remainingQuantity !== undefined ? selectedProduct.remainingQuantity : (selectedProduct.quantity || 0));
        const newQty = Math.max(0, currentQty - allocateModal.portions);
        updatedSurplus.unshift({
          ...selectedProduct,
          remainingQuantity: newQty,
          quantity: newQty,
        });
      }
      localStorage.setItem('replate_local_surplus', JSON.stringify(updatedSurplus));

      // 3. Update in-memory availableProducts and foods states immediately
      setAvailableProducts((prev) =>
        prev.map((p) => {
          if (p.id === selectedProduct.id) {
            const currentQty = Number(p.remainingQuantity !== undefined ? p.remainingQuantity : (p.quantity || 0));
            const newQty = Math.max(0, currentQty - allocateModal.portions);
            return { ...p, remainingQuantity: newQty, quantity: newQty };
          }
          return p;
        })
      );

      setFoods((prev) =>
        prev.map((f) => {
          if (f.id === selectedProduct.id) {
            const currentQty = parseInt(f.quantity) || 0;
            const newQty = Math.max(0, currentQty - allocateModal.portions);
            return { ...f, quantity: `${newQty} Porsi` };
          }
          return f;
        })
      );
    } catch (_) {}

    // Update panti state and persist
    setPantiNeeds((prev) => {
      const nextPanti = prev.map((n) => {
        if (n.id === allocateModal.panti?.id) {
          const currentFulfilled = parseInt(n.fulfilledQuantity.replace(/\D/g, '')) || 0;
          return {
            ...n,
            fulfilledQuantity: `${currentFulfilled + allocateModal.portions} Porsi`,
          };
        }
        return n;
      });
      try {
        localStorage.setItem('replate_panti_requests', JSON.stringify(nextPanti));
      } catch (_) {}
      return nextPanti;
    });

    const savedPanti = allocateModal.panti;

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

    setToastState({
      isOpen: true,
      message: `Berhasil menyanggupi donasi ${newClaim.quantity} untuk ${savedPanti.pantiName}! Resi #${ticketCode} telah diterbitkan.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />
      {/* Header Info & Featured Promo Hero */}
      {/* Multi-Slide Interactive Promo Hero Carousel (Point 9) */}
      {(() => {
        const slide = promoSlides[currentSlideIndex];
        return (
          <div className="relative bg-gradient-to-br from-[#1B3A5C] via-[#142C47] to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 overflow-hidden shadow-xl mb-4 border border-slate-800 transition-all duration-500">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4A843]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-4 sm:gap-8 items-center justify-between">
              <div className="flex-1 space-y-2.5 sm:space-y-4 w-full">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D4A843] animate-ping"></span>
                    <span className="text-[9px] sm:text-[10px] font-black text-[#D4A843] uppercase tracking-widest">
                      {slide.badge}
                    </span>
                  </div>

                  <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-mono font-bold">
                    Slide {currentSlideIndex + 1}/{promoSlides.length}
                  </span>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-lg sm:text-4xl font-black text-white leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-[11px] sm:text-sm text-slate-300 font-medium max-w-md leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {slide.description}
                  </p>
                </div>
                
                <div className="pt-1 sm:pt-2 flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                  <button 
                    onClick={() => setActiveTab(slide.targetTab)} 
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs rounded-xl shadow-lg shadow-amber-900/20 transition-all cursor-pointer"
                  >
                    {slide.btnText}
                  </button>

                  {/* Previous / Next Arrow Controls */}
                  <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Slide Sebelumnya"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % promoSlides.length)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Slide Selanjutnya"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center gap-1.5 pt-1 sm:pt-2">
                  {promoSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(dotIdx)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                        currentSlideIndex === dotIdx ? 'w-5 sm:w-6 bg-[#D4A843]' : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Featured FoodCard Preview (Desktop only to prevent vertical fatigue on mobile) */}
              <div className="hidden sm:block sm:w-[320px] shrink-0 rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Featured FoodCard Preview */}
                <div className="shadow-2xl shadow-black/40 rounded-3xl overflow-hidden ring-4 ring-white/10 bg-white">
                  <FoodCard
                    id={slide.foodPreview.id}
                    title={slide.foodPreview.title}
                    providerName={slide.foodPreview.providerName}
                    category={slide.foodPreview.category}
                    quantity={slide.foodPreview.quantity}
                    discountPrice={slide.foodPreview.discountPrice}
                    originalPrice={slide.foodPreview.originalPrice}
                    isFree={slide.foodPreview.isFree}
                    pickupTime={slide.foodPreview.pickupTime}
                    distance={slide.foodPreview.distance}
                    imageUrl={slide.foodPreview.imageUrl}
                    onDetail={() => handleOpenFoodDetail({
                      id: slide.foodPreview.id,
                      title: slide.foodPreview.title,
                      description: 'Menu surplus pilihan hari ini, terverifikasi standar sanitasi BPOM RI.',
                      providerName: slide.foodPreview.providerName,
                      originalPrice: slide.foodPreview.originalPrice,
                      discountPrice: slide.foodPreview.discountPrice,
                      quantity: slide.foodPreview.quantity,
                      pickupTime: slide.foodPreview.pickupTime,
                      distance: slide.foodPreview.distance,
                      category: slide.foodPreview.category,
                      isFree: slide.foodPreview.isFree,
                      type: slide.foodPreview.isFree ? 'DONATION' : 'RESCUE_SALE',
                      imageUrl: slide.foodPreview.imageUrl,
                    })}
                    onClaim={() => handleBuyNow({
                      id: slide.foodPreview.id,
                      title: slide.foodPreview.title,
                      providerName: slide.foodPreview.providerName,
                      originalPrice: slide.foodPreview.originalPrice,
                      discountPrice: slide.foodPreview.discountPrice,
                      quantity: slide.foodPreview.quantity,
                      pickupTime: slide.foodPreview.pickupTime,
                      distance: slide.foodPreview.distance,
                      category: slide.foodPreview.category,
                      isFree: slide.foodPreview.isFree,
                      type: slide.foodPreview.isFree ? 'DONATION' : 'RESCUE_SALE',
                      imageUrl: slide.foodPreview.imageUrl,
                    })}
                    onAddToCart={() => handleClaimFood({
                      id: slide.foodPreview.id,
                      title: slide.foodPreview.title,
                      providerName: slide.foodPreview.providerName,
                      originalPrice: slide.foodPreview.originalPrice,
                      discountPrice: slide.foodPreview.discountPrice,
                      quantity: slide.foodPreview.quantity,
                      pickupTime: slide.foodPreview.pickupTime,
                      distance: slide.foodPreview.distance,
                      category: slide.foodPreview.category,
                      isFree: slide.foodPreview.isFree,
                      type: slide.foodPreview.isFree ? 'DONATION' : 'RESCUE_SALE',
                      imageUrl: slide.foodPreview.imageUrl,
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Navigation Tabs (Horizontal scrollable on mobile) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl max-w-3xl overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('RESCUE_SALE')}
          className={`shrink-0 sm:flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-black text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'RESCUE_SALE'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-bold'
          }`}
        >
          <span>Rescue Sale (Murah)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DONATION')}
          className={`shrink-0 sm:flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-black text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'DONATION'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-bold'
          }`}
        >
          <span>Donasi (Rp 0)</span>
        </button>

        {/* Tab Stok Habis */}
        <button
          type="button"
          onClick={() => setActiveTab('OUT_OF_STOCK')}
          className={`shrink-0 sm:flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-black text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'OUT_OF_STOCK'
              ? 'bg-rose-900 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-bold'
          }`}
        >
          <span>Stok Habis ({outOfStockCount})</span>
        </button>

        {/* Rescue Partner Action */}
        {(session?.user?.role?.toUpperCase().includes('RESCUE') || session?.user?.role?.toUpperCase().includes('VOLUNTEER')) && (
          <button
            type="button"
            onClick={() => router.push('/dashboard/rescue-partner/requests')}
            className="shrink-0 sm:flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-black text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-950 hover:bg-slate-300/50"
          >
            <span>Penjemputan </span>
          </button>
        )}

        {/* Panti Needs Tab — hidden for consumers */}
        {!isConsumer && (
          <button
            type="button"
            onClick={() => setActiveTab('PANTI_NEEDS')}
            className={`shrink-0 sm:flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-black text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'PANTI_NEEDS'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <span>Permintaan Donasi Panti ({pantiNeeds.length})</span>
          </button>
        )}
      </div>

      {/* Food Grid Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* Provider Seller Centre Banner Notice */}
        {(session?.user?.role?.toUpperCase().includes('PROVIDER') || false) && (
          <div className="p-3 sm:p-4 bg-amber-50/90 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs shadow-xs">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#1B3A5C] text-[#D4A843] text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider">
                  Mode Katalog Toko
                </span>
                <span className="text-[9.5px] sm:text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                   Seller Centre
                </span>
              </div>
              <p className="text-slate-700 font-medium text-[11px] sm:text-xs">
                Sebagai <strong>Food Provider</strong>, Anda memantau ketersediaan produk surplus toko Anda sendiri di tab ini. Buka tab <strong>Permintaan Panti</strong> untuk menyanggupi permohonan donasi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/provider/my-listings')}
              className="w-full sm:w-auto px-3.5 py-2 sm:py-2.5 bg-[#1B3A5C] hover:bg-[#142C47] text-[#D4A843] font-black text-xs rounded-xl shadow-xs shrink-0 transition-all cursor-pointer text-center"
            >
              + Kelola di Daftar Makanan 
            </button>
          </div>
        )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari menu makanan atau resto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-xs px-3.5 py-2 sm:py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
              {syncRadius && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Radius &lt; {syncRadius} km
                </div>
              )}
            </div>
            {/* Horizontal Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-nowrap sm:flex-wrap w-full sm:w-auto">
              {categoryList.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-[#1B3A5C] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Tokopedia Grid on Mobile, 3-Column on Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {filteredFoods.map((item) => {
              const isProvider = session?.user?.role?.toUpperCase().includes('PROVIDER');
              const currentProviderName = session?.user?.name || (session?.user as any)?.orgName || 'Warung Bakso Pak Kumis';
              const isMyOwnProduct = isProvider && (
                item.providerName.toLowerCase().includes(currentProviderName.toLowerCase().split(' ')[0]) ||
                currentProviderName.toLowerCase().includes(item.providerName.toLowerCase().split(' ')[0])
              );

              return (
                <FoodCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  providerName={item.providerName}
                  category={item.category}
                  quantity={item.quantity}
                  discountPrice={item.discountPrice}
                  originalPrice={item.originalPrice}
                  isFree={item.isFree}
                  pickupTime={item.pickupTime}
                  distance={item.distance}
                  imageUrl={item.imageUrl}
                  onDetail={() => handleOpenFoodDetail(item)}
                  onManage={isMyOwnProduct ? () => router.push('/dashboard/provider/my-listings') : undefined}
                  onClaim={!isProvider ? () => handleBuyNow(item) : undefined}
                  onAddToCart={!isProvider ? () => handleClaimFood(item) : undefined}
                />
              );
            })}
          </div>
        </div>

      {/* Panti Needs Grid — Synchronized with explore page rich card UI */}
      {activeTab === 'PANTI_NEEDS' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 bg-gradient-to-r from-[#1B3A5C] via-[#1E436D] to-[#142C47] text-white rounded-3xl shadow-md border border-[#2C5A8F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-widest block">
                PORTAL BANTUAN LEMBAGA & YAYASAN NASIONAL
              </span>
              <h3 className="text-xl font-black text-white">
                Permohonan Donasi Food Rescue Panti Asuhan & Dhuafa
              </h3>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                Salurkan surplus makanan layak konsumsi Anda langsung ke lembaga terverifikasi Dinsos RI. Dilengkapi verifikasi standar higienitas BPOM RI dan pengantaran kurir relawan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/provider')}
              className="px-4 py-2.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              Smart Matching Provider 
            </button>
          </div>

          {/* Filter Controls Panti */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-black text-[#1B3A5C]">Metode:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterPantiMethod('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    filterPantiMethod === 'ALL'
                      ? 'bg-[#1B3A5C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPantiMethod('SELF_PICKUP')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterPantiMethod === 'SELF_PICKUP'
                      ? 'bg-[#1B3A5C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Ambil Sendiri</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPantiMethod('PARTNER_DELIVERY')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterPantiMethod === 'PARTNER_DELIVERY'
                      ? 'bg-[#1B3A5C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Diantar Partner / Toko</span>
                </button>
              </div>

              <span className="font-black text-[#1B3A5C] ml-2">Urgensi:</span>
              <select
                value={filterPantiUrgency}
                onChange={(e) => setFilterPantiUrgency(e.target.value)}
                className="rounded-xl border border-slate-300 text-xs px-3 py-1.5 bg-white font-bold text-[#1B3A5C] focus:outline-none"
              >
                <option value="ALL">Semua Urgensi</option>
                <option value="HIGH">Urgent (Hari Ini)</option>
                <option value="MEDIUM">Membutuhkan</option>
              </select>
            </div>

            <div className="flex items-center gap-2 justify-between md:justify-end">
              <span className="text-[11px] font-bold text-slate-500">
                Menampilkan {filteredPantiNeeds.length} dari {pantiNeeds.length} Lembaga
              </span>
              <button
                type="button"
                onClick={() => router.push('/dashboard/yayasan/claims?openRequest=true')}
                className="px-3.5 py-1.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                + Ajukan Permintaan Pangan
              </button>
            </div>
          </div>

          {/* Grid Permintaan Panti (Rich Cards identical to http://localhost:3000/explore) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {filteredPantiNeeds.map((need) => (
              <div
                key={need.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-2xs sm:shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                {/* Panti Cover Image & Badges */}
                <div className="relative aspect-square sm:aspect-video bg-slate-100 overflow-hidden">
                  <img src={need.imageUrl} alt={need.pantiName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1">
                    <span className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-xs ${
                      need.urgency === 'HIGH' ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-slate-950'
                    }`}>
                      {need.urgency === 'HIGH' ? 'URGENT' : 'BESOK'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-slate-950/80 text-emerald-300 font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-xs">
                       {need.legalStatus}
                    </span>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-[9px] sm:text-[10px] bg-slate-900/80 text-amber-300 font-bold px-1.5 sm:px-2 py-0.5 rounded-md">
                    {need.location.split('(')[0]}
                  </span>
                </div>

                <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 sm:space-y-3">
                    <div>
                      <span className="text-[9px] sm:text-[11px] font-semibold text-slate-400 block truncate">{need.id} • {need.shelterType}</span>
                      <h4 className="font-extrabold text-xs sm:text-base text-[#1B3A5C] line-clamp-1 sm:line-clamp-2 leading-snug">{need.pantiName}</h4>
                    </div>

                    {/* Detail Info Card Box */}
                    <div className="p-2 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 space-y-1.5 sm:space-y-2 text-[9.5px] sm:text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span className="font-semibold">Penerima:</span>
                        <span className="font-extrabold text-[#1B3A5C]">{need.beneficiariesCount} Jiwa</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="font-semibold">Menu:</span>
                        <span className="font-bold text-emerald-700 max-w-[50%] truncate text-right">{need.foodCategoryNeeded}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                        <span className="font-semibold">Kirim:</span>
                        <span className="font-bold text-[#1B3A5C] max-w-[50%] truncate text-right">
                          {need.preferredDelivery === 'RESCUE_COURIER'
                            ? 'Kurir Relawan'
                            : need.preferredDelivery === 'PROVIDER_DIRECT'
                            ? 'Diantar Toko'
                            : 'Ambil Mandiri'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {(() => {
                        const targetNum = typeof need.targetQuantity === 'number' ? need.targetQuantity : parseInt(String(need.targetQuantity).replace(/\D/g, '')) || 1;
                        const fulfilledNum = parseInt(need.fulfilledQuantity.replace(/\D/g, '')) || 0;
                        const percent = Math.min(100, Math.round((fulfilledNum / targetNum) * 100));
                        return (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9px] sm:text-[11px] font-bold text-slate-600">
                              <span>Target: {need.targetQuantity}</span>
                              <span className="text-emerald-700 font-black">{percent}% ({need.fulfilledQuantity})</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 sm:h-2 rounded-full overflow-hidden border border-slate-300">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })()}

                      <p className="hidden sm:block text-[11px] text-slate-600 italic leading-relaxed pt-1 line-clamp-2">
                        &quot;{need.notes}&quot;
                      </p>

                      {/* Button Lihat Profil Detail & Peta GPS */}
                      <button
                        type="button"
                        onClick={() => setSelectedShelterProfile(need)}
                        className="hidden sm:flex w-full py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-[#1B3A5C] font-black text-[9px] sm:text-[11px] rounded-lg sm:rounded-xl border border-blue-200 items-center justify-center gap-1 transition-colors cursor-pointer mt-1"
                      >
                        <span>Lihat Detail & Peta GPS </span>
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const isBeneficiaryUser = session?.user?.role?.toUpperCase().includes('BENEFICIARY') || 
                      session?.user?.role?.toUpperCase().includes('YAYASAN') ||
                      (typeof window !== 'undefined' && (localStorage.getItem('replate_onboarding_profile')?.includes('BENEFICIARY') || localStorage.getItem('replate_onboarding_profile')?.includes('YAYASAN')));
                    
                    if (isBeneficiaryUser) {
                      return (
                        <Button
                          variant="outline"
                          size="md"
                          disabled
                          className="w-full font-bold text-[9px] sm:text-xs text-slate-400 border-slate-200 bg-slate-100 py-2 sm:py-3 px-1 flex items-center justify-center gap-1 cursor-not-allowed mt-1.5 sm:mt-2"
                        >
                          <span className="truncate">Khusus Donatur</span>
                        </Button>
                      );
                    }

                    return (
                      <Button
                        variant="gold"
                        size="md"
                        onClick={() => handleOpenAllocationModal(need)}
                        className="w-full font-black text-[10px] sm:text-xs text-slate-950 py-2 sm:py-3 shadow-xs flex items-center justify-center gap-1 cursor-pointer mt-1.5 sm:mt-2"
                      >
                        <span className="truncate">Sanggupi Bantuan </span>
                      </Button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <span>Hubungi Pengurus via WhatsApp Resmi </span>
            </a>

            {/* Embedded Live GPS Map */}
            {(() => {
              const shelterGeo = resolveIndonesianAddress(selectedShelterProfile.address || selectedShelterProfile.location || '');
              const sLat = selectedShelterProfile.lat || shelterGeo.lat;
              const sLng = selectedShelterProfile.lng || shelterGeo.lng;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 block text-xs">
                      Titik Jemput & Posisi Real-Time Yayasan:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      GPS: {sLat.toFixed(5)}, {sLng.toFixed(5)}
                    </span>
                  </div>
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
                    <iframe
                      title="Peta Lokasi Shelter Panti"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://maps.google.com/maps?q=${sLat},${sLng}&z=15&output=embed`}
                      className="w-full h-full filter saturate-150"
                    />
                    <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider">
                      Titik Lokasi: {selectedShelterProfile.pantiName} ({shelterGeo.cityNameOnly || selectedShelterProfile.location})
                    </div>
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
                  handleOpenAllocationModal(target);
                }}
              >
                Sanggupi Bantuan Panti Ini 
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Alokasi Bantuan Panti (IDENTIK DENGAN SMART MATCHING) */}
      <Modal
        isOpen={allocateModal.isOpen}
        onClose={() => setAllocateModal({ isOpen: false, panti: null, selectedFoodId: '', portions: 30, deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}
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
              const targetNeedQty = parseInt(String(allocateModal.panti.targetQuantity || '45'), 10) || 45;
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

      {/* Success QR Claim Ticket Modal (IDENTIK DENGAN SMART MATCHING) */}
      <Modal
        isOpen={issuedTicketModal.isOpen}
        onClose={() => setIssuedTicketModal({ isOpen: false, ticketData: null })}
        title=" QR Surat Jalan Donasi Berhasil Diterbitkan!"
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
              providerName={session?.user?.name || 'Mitra Toko Replate'}
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
                <span> Buka & Kelola di Modul Klaim & Kasir </span>
              </Button>

              <button
                type="button"
                onClick={() => setIssuedTicketModal({ isOpen: false, ticketData: null })}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
              >
                Tutup & Tetap di Eksplor Pangan
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Food Detail Modal */}
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
            if (item) handleClaimFood(item);
          }}
        />
      )}



      {/* Toast */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
