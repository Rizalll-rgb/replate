'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { FoodCard } from '@/components/food/FoodCard';

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
  const [activeTab, setActiveTab] = useState<'RESCUE_SALE' | 'DONATION' | 'PANTI_NEEDS'>('RESCUE_SALE');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedFoodForModal, setSelectedFoodForModal] = useState<any | null>(null);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });
  
  const [syncRadius, setSyncRadius] = useState<number | null>(null);

  // Multi-Slide Interactive Promo Hero Carousel State (Point 9)
  const promoSlides = [
    {
      id: 'promo-1',
      badge: '🏷️ RESCUE SALE 50%-70% HARI INI',
      title: 'Selamatkan Surplus Lezat, Hemat Hingga 70%',
      highlight: 'Surplus Pangan Lezat',
      description: 'Dapatkan hidangan restoran & bakery berkualitas mulai Rp 5.000, bantu kurangi emisi gas metana dan susut pangan Bappenas.',
      btnText: 'Lihat Rescue Sale ➔',
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
      badge: '🎁 GERAKAN 1.000 PORSI DONASI BEBAS BIAYA',
      title: 'Bantu Panti Asuhan & Dhuafa Surabaya (Rp 0)',
      highlight: 'Nutrisi Anak Panti',
      description: 'Salurkan kelebihan makanan bergizi langsung ke 12 panti asuhan terverifikasi dengan armada kurir relawan Food Bank.',
      btnText: 'Lihat Donasi Pangan ➔',
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
      badge: '🛡️ 100% SOP HIGIENE BPOM RI & HALAL BPJPH',
      title: 'Jaminan Standar Keamanan Pangan Steril',
      highlight: 'Higienis & Steril BPOM',
      description: 'Seluruh mitra dapur diaudit standar suhu simpan, inspeksi visual, serta surat jalan manifest digital terenkripsi.',
      btnText: 'Eksplor Pangan Halal ➔',
      targetTab: 'RESCUE_SALE' as const,
      foodPreview: {
        id: 'hero-food-3',
        title: 'Nasi Kotak Ayam Bakar Madu',
        providerName: 'Katering Berkah Surabaya',
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
      badge: '🥐 HAPPY HOUR BAKERY & RESTO (19:00 - 22:00 WIB)',
      title: 'Nikmati Aneka Pastry & Roti Fresh Malam Hari',
      highlight: 'Artisan Bakery Surabaya',
      description: 'Jelajahi sajian roti artisan dan pastry lezat yang siap dijemput di kasir toko favorit Anda sebelum jam tutup operasional.',
      btnText: 'Jelajah Roti & Pastry ➔',
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

  useEffect(() => {
    try {
      const radius = localStorage.getItem('replate_admin_sync_radius');
      if (radius) setSyncRadius(parseInt(radius));
    } catch (_) {}
  }, []);

  const [foods, setFoods] = useState<FoodItem[]>([]);

  const defaultFoods: FoodItem[] = [
    {
      id: 'FOD-001',
      title: 'Nasi Paket Ayam Bakar Madu',
      description: 'Nasi hangat dengan ayam bakar madu bumbu rempah, lalapan segar, dan sambal terasi terpisah dalam kemasan higienis.',
      providerName: 'Warung Bakso Pak Kumis',
      providerPhone: '081234567891',
      providerAddress: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
      originalPrice: 28000,
      discountPrice: 12000,
      quantity: '15 Porsi',
      pickupTime: '19:30 - 21:30 WIB',
      distance: '0.8 km',
      category: 'MAKANAN_BERAT',
      isFree: false,
      type: 'RESCUE_SALE',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      storageCondition: 'ROOM_TEMP',
      packagingType: 'PACKAGED',
      weightPerUnitKg: 0.4,
      allergens: ['Nut-Free', 'Halal BPJPH', 'Wadah Steril'],
      lat: -7.2575,
      lng: 112.7521,
    },
    {
      id: 'FOD-002',
      title: 'Roti Croissant & Choco Pastry',
      description: 'Aneka roti croissant butter dan pastry cokelat lembut yang baru dipanggang hari ini di outlet bakery.',
      providerName: 'Rotiboy Bakery Surabaya',
      providerPhone: '081234567892',
      providerAddress: 'Tunjungan Plaza Lt. G, Jl. Basuki Rahmat, Surabaya',
      originalPrice: 18000,
      discountPrice: 6000,
      quantity: '25 Porsi',
      pickupTime: '20:00 - 22:00 WIB',
      distance: '1.2 km',
      category: 'ROTI_KUE',
      isFree: false,
      type: 'RESCUE_SALE',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
      rating: 4.8,
      storageCondition: 'ROOM_TEMP',
      packagingType: 'PACKAGED',
      weightPerUnitKg: 0.25,
      allergens: ['Dairy (Susu)', 'Halal BPJPH', 'Bebas Pengawet'],
      lat: -7.2614,
      lng: 112.7385,
    },
    {
      id: 'FOD-003',
      title: 'Prasmanan Nasi Goreng & Ayam Goreng',
      description: 'Menu buffet hotel bintang 5 yang tidak tersentuh tamu, disimpan di warm chafing dish dengan suhu >60°C.',
      providerName: 'Hotel Majapahit Surabaya',
      providerPhone: '081234567893',
      providerAddress: 'Jl. Tunjungan No. 65, Surabaya',
      originalPrice: 45000,
      discountPrice: 0,
      quantity: '30 Porsi',
      pickupTime: '20:30 - 22:00 WIB',
      distance: '2.1 km',
      category: 'MAKANAN_BERAT',
      isFree: true,
      type: 'DONATION',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
      rating: 5.0,
      storageCondition: 'ROOM_TEMP',
      packagingType: 'STERILE_CONTAINER',
      weightPerUnitKg: 0.45,
      allergens: ['Nut-Free', 'Halal BPJPH', 'Steril Food Grade'],
      lat: -7.2637,
      lng: 112.7407,
    },
  ];

  // Panti Needs data for the tab
  const pantiNeeds = [
    {
      id: 'PANTI-001',
      pantiName: 'Panti Asuhan Kasih Ibu Surabaya',
      contactPerson: 'Ibu Sari Dewi',
      contactPhone: '0812-3456-7890',
      address: 'Jl. Raya Gubeng No. 88, Wonokromo, Surabaya',
      needCategory: 'Nasi & Lauk Pauk',
      neededPortions: 50,
      urgency: 'TINGGI',
      childCount: 45,
      description: 'Kebutuhan makan malam 45 anak asuh. Kami mengutamakan makanan hangat bergizi seimbang (nasi, sayur, lauk protein).',
      preferredDelivery: 'RESCUE_COURIER' as const,
      cutoffTime: '20:00 WIB',
      lat: -7.2906,
      lng: 112.7429,
    },
    {
      id: 'PANTI-002',
      pantiName: 'Yayasan Anak Bangsa Mandiri',
      contactPerson: 'Bapak Hendra Wijaya',
      contactPhone: '0813-9876-5432',
      address: 'Jl. Darmo Permai Selatan No. 12, Surabaya',
      needCategory: 'Roti & Susu',
      neededPortions: 30,
      urgency: 'SEDANG',
      childCount: 28,
      description: 'Kebutuhan sarapan pagi besok untuk 28 anak. Roti, susu kotak, atau sereal sangat diharapkan.',
      preferredDelivery: 'RESCUE_COURIER' as const,
      cutoffTime: '07:00 WIB',
      lat: -7.2901,
      lng: 112.7210,
    },
    {
      id: 'PANTI-003',
      pantiName: 'Panti Werdha Bhakti Luhur',
      contactPerson: 'Suster Maria Theresia',
      contactPhone: '0821-5678-1234',
      address: 'Jl. Raya Tenggilis Mejoyo No. 33, Surabaya',
      needCategory: 'Bubur & Makanan Lunak',
      neededPortions: 25,
      urgency: 'TINGGI',
      childCount: 22,
      description: 'Kebutuhan makan siang lansia 22 penghuni. Diperlukan makanan lunak/bubur hangat yang mudah dicerna.',
      preferredDelivery: 'RESCUE_COURIER' as const,
      cutoffTime: '11:30 WIB',
      lat: -7.3201,
      lng: 112.7601,
    },
  ];

  // Helper: map raw item to FoodItem
  const mapToFoodItem = (item: any): FoodItem => ({
    id: item.id || `food-${Math.random()}`,
    title: item.foodName || item.title || 'Makanan Surplus',
    description: item.description || 'Makanan surplus terverifikasi higienis SOP BPOM RI.',
    providerName: item.provider?.organizationName || item.providerName || 'Warung Bakso Pak Kumis',
    providerPhone: item.provider?.phone || '081234567891',
    providerAddress: item.address || item.pickupAddress || 'Jl. Genteng Kali No. 45, Surabaya',
    originalPrice: item.originalPrice || 25000,
    discountPrice: item.discountPrice || item.price || 0,
    quantity: `${item.quantity || item.remainingQuantity || 10} Porsi`,
    pickupTime: item.pickupTime || 'Hari ini 19:00 - 21:00 WIB',
    distance: item.distance || '1.2 km',
    category: item.category || item.foodCategory || 'MAKANAN_BERAT',
    isFree: item.distributionType === 'FREE' || item.price === 0 || item.discountPrice === 0,
    type: item.distributionType === 'FREE' || item.price === 0 || item.discountPrice === 0 ? 'DONATION' : 'RESCUE_SALE',
    imageUrl: item.imageUrl || item.photos?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    rating: item.rating || 4.8,
    storageCondition: item.storageCondition || 'ROOM_TEMP',
    packagingType: item.packagingType || 'PACKAGED',
    weightPerUnitKg: item.weightPerUnitKg || 0.4,
    allergens: item.allergens || ['Nut-Free', 'Halal BPJPH', 'Sterile Container'],
    lat: item.lat || item.latitude || -7.2575,
    lng: item.lng || item.longitude || 112.7521,
    status: item.status,
  });

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
          setFoods(deduped.map(mapToFoodItem));
        } else {
          // Include local items mapped + default foods
          setFoods(defaultFoods);
        }
      })
      .catch(() => {
        // Offline: use local items + defaults
        if (localItems.length > 0) {
          setFoods(localItems.map(mapToFoodItem));
        } else {
          setFoods(defaultFoods);
        }
      });
  }, []);

  const categoryList = [
    { key: 'ALL', name: 'Semua Kategori' },
    { key: 'MAKANAN_BERAT', name: 'Makanan Berat' },
    { key: 'ROTI_KUE', name: 'Roti & Bakery' },
    { key: 'MINUMAN_SUSU', name: 'Minuman & Susu' },
    { key: 'BUAH_SAYUR', name: 'Buah & Sayur' },
  ];

  const filteredFoods = foods.filter((item) => {
    if (activeTab === 'PANTI_NEEDS') return false; // Panti needs tab shows its own grid
    if (activeTab === 'RESCUE_SALE' && item.isFree) return false;
    if (activeTab === 'DONATION' && !item.isFree) return false;
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
    localStorage.setItem('replate_checkout_item', JSON.stringify(item));
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
        phone: item.providerPhone || '081234567890',
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Info & Featured Promo Hero */}
      {/* Multi-Slide Interactive Promo Hero Carousel (Point 9) */}
      {(() => {
        const slide = promoSlides[currentSlideIndex];
        return (
          <div className="relative bg-gradient-to-br from-[#1B3A5C] via-[#142C47] to-slate-900 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl mb-4 border border-slate-800 transition-all duration-500">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4A843]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-[#D4A843] animate-ping"></span>
                    <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest">
                      {slide.badge}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    Slide {currentSlideIndex + 1}/{promoSlides.length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md leading-relaxed">
                    {slide.description}
                  </p>
                </div>
                
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => setActiveTab(slide.targetTab)} 
                    className="px-5 py-2.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-900/20 transition-all cursor-pointer"
                  >
                    {slide.btnText}
                  </button>

                  {/* Previous / Next Arrow Controls */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Slide Sebelumnya"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % promoSlides.length)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Slide Selanjutnya"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center gap-1.5 pt-2">
                  {promoSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlideIndex === dotIdx ? 'w-6 bg-[#D4A843]' : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="w-full sm:w-[320px] shrink-0 rotate-1 hover:rotate-0 transition-transform duration-500">
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

      {/* 3 Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('RESCUE_SALE')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'RESCUE_SALE'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-bold'
          }`}
        >
          <span>Rescue Sale (Diskon Murah)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DONATION')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'DONATION'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-bold'
          }`}
        >
          <span>Donasi Pangan (Rp 0)</span>
        </button>

        {/* Panti Needs Tab — visible for providers */}
        {(session?.user?.role?.toUpperCase().includes('PROVIDER') || !session) && (
          <button
            type="button"
            onClick={() => setActiveTab('PANTI_NEEDS')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'PANTI_NEEDS'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <span>Permintaan Panti ({pantiNeeds.length})</span>
          </button>
        )}

      </div>

      {/* Food Grid Content */}
      <div className="space-y-6">
        {/* Provider Seller Centre Banner Notice */}
        {(session?.user?.role?.toUpperCase().includes('PROVIDER') || false) && (
          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#1B3A5C] text-[#D4A843] text-[10px] font-black uppercase tracking-wider">
                  Mode Katalog Toko (Seller Centre)
                </span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                  ✓ Status Manajemen Aktif
                </span>
              </div>
              <p className="text-slate-700 font-medium">
                Sebagai <strong>Food Provider</strong>, Anda memantau ketersediaan produk surplus toko Anda sendiri di tab ini (tanpa tombol klaim mandiri). Buka tab <strong>Permintaan Panti</strong> untuk menyanggupi permohonan donasi dari panti asuhan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/provider/my-listings')}
              className="px-4 py-2.5 bg-[#1B3A5C] hover:bg-[#142C47] text-[#D4A843] font-black text-xs rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
            >
              + Kelola di Daftar Makanan ➔
            </button>
          </div>
        )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari menu makanan atau nama resto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-xs px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
              {syncRadius && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Radius &lt; {syncRadius} km
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoryList.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-[#1B3A5C] text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((item) => {
              const isProvider = session?.user?.role?.toUpperCase().includes('PROVIDER');
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
                  onManage={isProvider ? () => router.push('/dashboard/provider/my-listings') : undefined}
                  onClaim={!isProvider ? () => handleBuyNow(item) : undefined}
                  onAddToCart={!isProvider ? () => handleClaimFood(item) : undefined}
                />
              );
            })}
          </div>
        </div>

      {/* Panti Needs Grid — shown when activeTab is PANTI_NEEDS */}
      {activeTab === 'PANTI_NEEDS' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs space-y-1">
            <span className="font-black text-[#1B3A5C] text-sm">📋 Daftar Permintaan Donasi Panti Asuhan & Yayasan</span>
            <p className="text-slate-600 font-medium">Berikut adalah permohonan bantuan makanan dari panti asuhan & yayasan sosial di sekitar Anda. Klik &quot;Sanggupi Donasi&quot; untuk mengalokasikan surplus makanan Anda.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pantiNeeds.map((panti) => (
              <div key={panti.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-sm text-[#1B3A5C]">{panti.pantiName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{panti.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    panti.urgency === 'TINGGI' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {panti.urgency === 'TINGGI' ? '🔴 Mendesak' : '🟡 Sedang'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-[11px] space-y-1.5 font-medium text-slate-700">
                  <div className="flex justify-between">
                    <span>Kebutuhan:</span>
                    <strong className="text-[#1B3A5C]">{panti.needCategory}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Porsi Dibutuhkan:</span>
                    <strong className="text-[#1B3A5C]">{panti.neededPortions} Porsi</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah Penghuni:</span>
                    <strong>{panti.childCount} Orang</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PIC:</span>
                    <strong>{panti.contactPerson}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Batas Waktu:</span>
                    <strong className="text-red-700">{panti.cutoffTime}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{panti.description}</p>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/provider')}
                  className="w-full py-2.5 bg-[#1B3A5C] hover:bg-[#142C47] text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Sanggupi Donasi ➔
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
