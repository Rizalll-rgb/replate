'use client';

import { useState, useEffect } from 'react';
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

interface FoodItem {
  id: string;
  title: string;
  providerName: string;
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
}

interface PantiNeed {
  id: string;
  pantiName: string;
  requestedItem: string;
  targetQuantity: string;
  fulfilledQuantity: string;
  urgency: 'HIGH' | 'MEDIUM';
  location: string;
  contactPerson: string;
  deadline: string;
  imageUrl: string;
  legalStatus: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'RESCUE_SALE' | 'DONATION' | 'PANTI_NEEDS'>('RESCUE_SALE');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('FOOD_CONSUMER');
  const [isConsumerVerified, setIsConsumerVerified] = useState<boolean>(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [pantiNeeds, setPantiNeeds] = useState<PantiNeed[]>([
    {
      id: 'PNT-REQ-001',
      pantiName: 'Panti Asuhan Kasih Ibu Surabaya',
      requestedItem: 'Nasi Kotak / Paket Lauk Pauk Siap Santap',
      targetQuantity: '50 Porsi',
      fulfilledQuantity: '30 Porsi',
      urgency: 'HIGH',
      location: 'Wonokromo, Surabaya Selatan (1.2 km)',
      contactPerson: 'Ibu Hajjah Maryam (0812-3456-7890)',
      deadline: 'Hari ini sebelum 20:00 WIB',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
      legalStatus: 'Terverifikasi Dinsos Jatim',
    },
    {
      id: 'PNT-REQ-002',
      pantiName: 'Panti Werdha Lansia Sejahtera',
      requestedItem: 'Roti Gandum, Susu Steril & Buah Potong',
      targetQuantity: '35 Porsi',
      fulfilledQuantity: '15 Porsi',
      urgency: 'MEDIUM',
      location: 'Rungkut, Surabaya Timur (2.4 km)',
      contactPerson: 'Bapak Hartono (0813-8899-7711)',
      deadline: 'Besok pagi 08:30 WIB',
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=60',
      legalStatus: 'Terverifikasi Kemenkumham',
    },
    {
      id: 'PNT-REQ-003',
      pantiName: 'Shelter Dhuafa & Anak Jalanan Mandiri',
      requestedItem: 'Surplus Makanan Catering / Prasmanan Bersih',
      targetQuantity: '60 Porsi',
      fulfilledQuantity: '10 Porsi',
      urgency: 'HIGH',
      location: 'Genteng, Surabaya Pusat (0.8 km)',
      contactPerson: 'Mas Dedi (0819-2233-4455)',
      deadline: 'Hari ini sebelum 21:30 WIB',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=60',
      legalStatus: 'Terverifikasi Pemkot Surabaya',
    },
  ]);

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

  const [fulfillModal, setFulfillModal] = useState<{ isOpen: boolean; need: PantiNeed | null; portions: string }>({
    isOpen: false,
    need: null,
    portions: '20',
  });

  // Check login state and load surplus catalog
  useEffect(() => {
    try {
      const profile = localStorage.getItem('replate_onboarding_profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        if (parsed.role) setUserRole(parsed.role);
        setIsUserLoggedIn(true);
      } else if (session?.user) {
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }

      const cStatus = localStorage.getItem('replate_consumer_verification_status');
      setIsConsumerVerified(cStatus === 'BENEFICIARY_VERIFIED' || !cStatus);

      const localStr = localStorage.getItem('replate_local_surplus');
      const localItems = localStr ? JSON.parse(localStr) : [];
      const mappedLocal = localItems.map((item: any, idx: number) => ({
        id: item.id || `local-surplus-${idx}`,
        title: item.name || item.title || 'Surplus Makanan Steril',
        providerName: item.providerName || item.storeName || 'Warung Bakso Pak Kumis',
        originalPrice: item.originalPrice ? Number(item.originalPrice) : 25000,
        discountPrice: item.discountPrice !== undefined ? Number(item.discountPrice) : (item.type === 'DONATION' ? 0 : 8000),
        quantity: item.quantity ? `${item.quantity} Porsi` : '10 Porsi',
        pickupTime: item.pickupTime || 'Hari ini 21:00 WIB',
        distance: item.distance || '1.0 km',
        category: item.category || 'MAKANAN',
        isFree: item.discountPrice === 0 || item.type === 'DONATION' || item.isFree,
        type: (item.discountPrice === 0 || item.type === 'DONATION' || item.isFree ? 'DONATION' : 'RESCUE_SALE') as any,
        imageUrl: item.photo || item.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
        rating: item.rating || 4.8,
      }));

      const defaultFoods: FoodItem[] = [
        {
          id: 'food-exp-1',
          title: 'Nasi Paket Ayam Bakar Specialty',
          providerName: 'Warung Bakso Pak Kumis Surabaya',
          originalPrice: 25000,
          discountPrice: 10000,
          quantity: '45 Porsi',
          pickupTime: '19:00 - 21:30 WIB',
          distance: '1.2 km',
          category: 'MAKANAN',
          isFree: false,
          type: 'RESCUE_SALE',
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
          rating: 4.9,
        },
        {
          id: 'food-exp-2',
          title: 'Roti Croissant & Pastry Steril',
          providerName: 'Rotiboy Bakery Surabaya',
          originalPrice: 18000,
          discountPrice: 6000,
          quantity: '20 Porsi',
          pickupTime: '20:00 - 22:00 WIB',
          distance: '1.8 km',
          category: 'BAKERY',
          isFree: false,
          type: 'RESCUE_SALE',
          imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
          rating: 4.7,
        },
        {
          id: 'food-exp-3',
          title: 'Paket Sayuran Segar Organik',
          providerName: 'Supermarket Tani Sejahtera',
          originalPrice: 15000,
          discountPrice: 5000,
          quantity: '18 Porsi',
          pickupTime: '17:00 - 19:30 WIB',
          distance: '2.3 km',
          category: 'SAYUR',
          isFree: false,
          type: 'RESCUE_SALE',
          imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
          rating: 4.8,
        },
        {
          id: 'food-exp-4',
          title: 'Paket Rice Bowl Ayam Geprek Steril (Donasi)',
          providerName: 'Warung Bakso Pak Kumis Surabaya',
          originalPrice: 20000,
          discountPrice: 0,
          quantity: '40 Porsi',
          pickupTime: '20:30 WIB',
          distance: '1.2 km',
          category: 'MAKANAN',
          isFree: true,
          type: 'DONATION',
          imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60',
          rating: 4.9,
        },
        {
          id: 'food-exp-5',
          title: 'Buah Potong Segar & Jus Alami (Donasi)',
          providerName: 'Fresh Fruits Juicery',
          originalPrice: 16000,
          discountPrice: 0,
          quantity: '25 Porsi',
          pickupTime: '18:00 - 20:00 WIB',
          distance: '2.5 km',
          category: 'BUAH',
          isFree: true,
          type: 'DONATION',
          imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=60',
          rating: 4.8,
        },
      ];

      setFoods([...mappedLocal, ...defaultFoods]);
    } catch (_) {}
  }, [session]);

  // Quick Action Category Icons
  const categoryList = [
    { key: 'ALL', name: 'Semua', icon: '🍲' },
    { key: 'MAKANAN', name: 'Makanan Berat', icon: '🍱' },
    { key: 'BAKERY', name: 'Roti & Bakery', icon: '🥐' },
    { key: 'SAYUR', name: 'Sayur Segar', icon: '🥬' },
    { key: 'BUAH', name: 'Buah Potong', icon: '🍎' },
    { key: 'MINUMAN', name: 'Minuman', icon: '🥤' },
  ];

  const handleAddToCart = (food: FoodItem) => {
    // 1. Auth Required Guard (If not logged in, trigger Auth Modal)
    const loggedIn = !!session?.user || !!localStorage.getItem('replate_onboarding_profile');
    if (!loggedIn) {
      setAuthModal({
        isOpen: true,
        actionTitle: 'Klaim Makanan Surplus',
        itemTitle: food.title,
      });
      return;
    }

    // 2. Role-based Access Guard: Regular consumer attempting to claim Free Donation
    if (food.type === 'DONATION' && userRole === 'FOOD_CONSUMER' && !isConsumerVerified) {
      setMismatchModal({
        isOpen: true,
        itemTitle: food.title,
      });
      return;
    }

    try {
      const savedCart = localStorage.getItem('replate_tas_klaim');
      const cartItems = savedCart ? JSON.parse(savedCart) : [];

      const existingIndex = cartItems.findIndex((item: any) => item.id === food.id);
      if (existingIndex >= 0) {
        cartItems[existingIndex].quantity = (cartItems[existingIndex].quantity || 1) + 1;
      } else {
        cartItems.push({
          id: food.id,
          name: food.title,
          provider: food.providerName,
          price: food.discountPrice,
          originalPrice: food.originalPrice,
          quantity: 1,
          distance: food.distance,
          category: food.category,
          isFree: food.isFree,
          type: food.type,
          imageUrl: food.imageUrl,
          pickupTime: food.pickupTime,
        });
      }

      localStorage.setItem('replate_tas_klaim', JSON.stringify(cartItems));

      setToastState({
        isOpen: true,
        message: `✓ "${food.title}" berhasil dimasukkan ke Tas Klaim!`,
        type: 'success',
      });
    } catch (_) {
      setToastState({
        isOpen: true,
        message: 'Gagal menambahkan ke Tas Klaim.',
        type: 'error',
      });
    }
  };

  const handleSanggupiPanti = (need: PantiNeed) => {
    // Auth Required Guard for Sanggupi Panti
    const loggedIn = !!session?.user || !!localStorage.getItem('replate_onboarding_profile');
    if (!loggedIn) {
      setAuthModal({
        isOpen: true,
        actionTitle: 'Sanggupi Bantuan Panti',
        itemTitle: need.pantiName,
      });
      return;
    }

    setFulfillModal({
      isOpen: true,
      need,
      portions: '20',
    });
  };

  const handleConfirmFulfill = () => {
    if (!fulfillModal.need) return;

    setToastState({
      isOpen: true,
      message: `🎉 Berhasil! Anda telah menyanggupi donasi ${fulfillModal.portions} porsi untuk ${fulfillModal.need.pantiName}. Resi Alokasi telah diterbitkan di Dashboard.`,
      type: 'success',
    });
    setFulfillModal({ isOpen: false, need: null, portions: '20' });
  };

  // Filter food items
  const filteredFoods = foods.filter((item) => {
    if (activeTab === 'RESCUE_SALE' && item.type !== 'RESCUE_SALE') return false;
    if (activeTab === 'DONATION' && item.type !== 'DONATION') return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.providerName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans pb-20 md:pb-0">
      <Navbar user={session?.user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
              Pusat Katalog Surplus & Redistribusi Pangan Surabaya
            </span>
            <h1 className="text-3xl font-black text-[#1B3A5C] tracking-tight">
              Eksplor Pangan Surabaya
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-2xl">
              Cari makanan diskon murah (Rescue Sale), donasi steril Rp 0 untuk panti, atau bantu penuhi permintaan pangan yayasan Surabaya.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="gold" size="md" className="font-black text-xs text-slate-950 shadow-md flex items-center gap-2">
                <span>🛍️ Buka Tas Klaim ➔</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Core Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('RESCUE_SALE')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'RESCUE_SALE'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <span>🏷️ Rescue Sale (Diskon)</span>
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
            <span>🎁 Donasi Pangan (Rp 0)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PANTI_NEEDS')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'PANTI_NEEDS'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <span>📥 Permintaan Panti ({pantiNeeds.length})</span>
          </button>
        </div>

        {/* Search & Category Quick Filter Section */}
        {activeTab !== 'PANTI_NEEDS' && (
          <div className="space-y-4">
            {/* Search Bar Input */}
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Cari menu makanan, nama restoran / bakery Surabaya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#1B3A5C] shadow-xs"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            </div>

            {/* Quick Action Category Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {categoryList.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[11px] font-bold truncate max-w-full">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Content Grid */}
        {activeTab !== 'PANTI_NEEDS' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1B3A5C]">
                {activeTab === 'RESCUE_SALE' ? 'Katalog Surplus Rescue Sale' : 'Katalog Donasi Steril Rp 0'} ({filteredFoods.length} Item)
              </h3>
              <span className="text-xs text-slate-500 font-medium">⚡ Terverifikasi Higienis SOP BPOM</span>
            </div>

            {filteredFoods.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <span className="text-4xl block">🔍</span>
                <h4 className="font-extrabold text-slate-800 text-base">Tidak ada makanan surplus ditemukan</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Coba ubah kata kunci pencarian atau pilih kategori makanan lainnya.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFoods.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm ${
                          item.isFree
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-[#D4A843] text-slate-950'
                        }`}>
                          {item.isFree ? '🎁 DONASI Rp 0' : '🏷️ RESCUE SALE'}
                        </span>
                        <span className="text-[10px] bg-slate-950/80 text-white font-bold px-2 py-1 rounded-lg backdrop-blur-xs">
                          {item.quantity}
                        </span>
                      </div>
                      <span className="absolute bottom-2 right-2 text-[10px] bg-slate-900/80 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                        📍 {item.distance}
                      </span>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 block truncate">
                          🏪 {item.providerName}
                        </span>
                        <h4 className="font-extrabold text-base text-[#1B3A5C] line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-slate-600 font-medium">
                          ⏰ Waktu Ambil: <strong>{item.pickupTime}</strong>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-lg font-black text-[#1B3A5C] block">
                            {item.isFree ? 'Rp 0' : `Rp ${item.discountPrice.toLocaleString('id-ID')}`}
                          </span>
                          {!item.isFree && (
                            <span className="text-[11px] text-slate-400 line-through font-bold">
                              Rp {item.originalPrice.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="px-4 py-2.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>+ Tas Klaim</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tab Permintaan Bantuan Panti Asuhan dengan Foto & Badge */
          <div className="space-y-6">
            <div className="p-6 bg-[#1B3A5C] text-white rounded-3xl shadow-lg border border-[#2C5A8F] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[#D4A843] font-black text-xs uppercase tracking-wider block">
                  🤝 PROGRAM REDISTRIBUSI PANGAN YAYASAN & PANTI
                </span>
                <h3 className="text-xl font-black text-white">Daftar Kebutuhan Pangan Panti Asuhan Surabaya</h3>
                <p className="text-xs text-slate-200 font-medium max-w-xl">
                  Restoran, Bakery, atau Donatur dapat langsung memilih panti asuhan yang membutuhkan dan menyanggupi alokasi makanan secara langsung.
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pantiNeeds.map((need) => (
                <div
                  key={need.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  {/* Panti Cover Image & Badges */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img src={need.imageUrl} alt={need.pantiName} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm ${
                        need.urgency === 'HIGH' ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-slate-950'
                      }`}>
                        {need.urgency === 'HIGH' ? '🚨 URGENT HARI INI' : '⏳ BUTUH BESOK'}
                      </span>
                      <span className="text-[10px] bg-slate-950/80 text-emerald-300 font-black px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        ✓ {need.legalStatus}
                      </span>
                    </div>
                    <span className="absolute bottom-2 right-2 text-[10px] bg-slate-900/80 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                      📍 {need.location.split('(')[0]}
                    </span>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block">{need.id}</span>
                        <h4 className="font-extrabold text-base text-[#1B3A5C] mt-0.5">{need.pantiName}</h4>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                        <span className="font-black text-slate-800 block">Kebutuhan: {need.requestedItem}</span>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-600">
                            <span>Target: {need.targetQuantity}</span>
                            <span className="text-emerald-700">Terpenuhi: {need.fulfilledQuantity}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200">
                          👤 PJ: <strong className="text-slate-700">{need.contactPerson}</strong>
                        </div>
                        <div className="text-[10px] text-amber-800 font-bold">
                          ⏰ Batas Penjemputan: {need.deadline}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="gold"
                      size="md"
                      onClick={() => handleSanggupiPanti(need)}
                      className="w-full font-black text-xs text-slate-950 py-3 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <span>🤝 Sanggupi Bantuan Panti ➔</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav user={session?.user} />

      {/* Modal Wajib Masuk / Daftar Akun (Auth Required on Action Guard) */}
      <Modal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, actionTitle: 'Klaim Makanan', itemTitle: '' })}
        title="🔒 Silakan Masuk atau Daftar Akun untuk Melanjutkan Klaim"
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
                🚀 Masuk ke Akun Saya ➔
              </Button>
            </Link>

            <Link href="/register?redirect=/explore" className="block w-full">
              <Button
                variant="gold"
                size="md"
                className="w-full font-black text-xs text-slate-950 py-3 shadow-md"
              >
                ✨ Daftar Akun Baru Gratis ➔
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
              ⚠️ Makanan Bebas Biaya Khusus Panti Asuhan & Warga Rentan SKTM
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
              Pilih Makanan Rescue Sale (Diskon Murah) ➔
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Sanggupi Permintaan Panti */}
      <Modal
        isOpen={fulfillModal.isOpen}
        onClose={() => setFulfillModal({ isOpen: false, need: null, portions: '20' })}
        title={`Sanggupi Permintaan: ${fulfillModal.need?.pantiName || 'Panti Asuhan'}`}
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
            <span className="font-black text-blue-900 block">Kebutuhan Panti:</span>
            <p className="text-blue-800 font-medium">
              {fulfillModal.need?.requestedItem} (Target: {fulfillModal.need?.targetQuantity})
            </p>
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

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setFulfillModal({ isOpen: false, need: null, portions: '20' })}>
              Batal
            </Button>
            <Button variant="gold" size="sm" onClick={handleConfirmFulfill} className="font-black text-slate-950">
              Konfirmasi Sanggupi Donasi ➔
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
