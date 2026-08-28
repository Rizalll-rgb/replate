'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';

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
}

interface PantiNeed {
  id: string;
  pantiName: string;
  shelterType: string;
  requestedItem: string;
  foodCategoryNeeded: string;
  targetQuantity: string;
  fulfilledQuantity: string;
  beneficiariesCount: number;
  urgency: 'HIGH' | 'MEDIUM';
  address: string;
  district: string;
  distance: string;
  cutoffTime: string;
  cutoffDateStr: string;
  contactPerson: string;
  contactPhone: string;
  preferredDelivery: 'RESCUE_COURIER' | 'SHELTER_PICKUP' | 'PROVIDER_DIRECT';
  imageUrl: string;
}

export default function DashboardExplorePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'RESCUE_SALE' | 'DONATION' | 'PANTI_NEEDS'>('RESCUE_SALE');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  const [selectedFoodForModal, setSelectedFoodForModal] = useState<any | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  const [fulfillModal, setFulfillModal] = useState<{
    isOpen: boolean;
    need: PantiNeed | null;
    portions: string;
    deliveryMethod: 'RESCUE_COURIER' | 'SHELTER_PICKUP' | 'PROVIDER_DIRECT';
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

  // Calculate Today & Tomorrow formatted Indonesian dates
  const todayFormatted = useMemo(() => {
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const [foods, setFoods] = useState<FoodItem[]>([
    {
      id: 'SRP-101',
      title: 'Bakso Sapi Urat Komplit',
      description: 'Bakso daging sapi asli komplit tahu dan mie. Baru dimasak sore ini dan disimpan higienis.',
      providerName: 'Warung Bakso Pak Kumis',
      providerPhone: '0812-3456-7890',
      providerAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      originalPrice: 18000,
      discountPrice: 6000,
      quantity: '15 Porsi',
      pickupTime: 'Hari Ini, 20:00 WIB',
      distance: '1.2 km',
      category: 'MAKANAN_BERAT',
      isFree: false,
      type: 'RESCUE_SALE',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      storageCondition: 'WARMER',
      packagingType: 'PACKAGED',
      weightPerUnitKg: 0.4,
      allergens: ['Nut-Free', 'Halal BPJPH', 'Wadah Food-Grade'],
    },
    {
      id: 'SRP-102',
      title: 'Nasi Kotak Ayam Bakar Madu',
      description: 'Surplus katering rapat kantor, masih hangat dan tersegel rapi dalam kotak bento.',
      providerName: 'Katering Berkah Surabaya',
      providerPhone: '0813-9876-5432',
      providerAddress: 'Jl. Manyar Kertoarjo No. 12, Mulyorejo, Surabaya',
      originalPrice: 25000,
      discountPrice: 8500,
      quantity: '24 Porsi',
      pickupTime: 'Hari Ini, 21:00 WIB',
      distance: '2.4 km',
      category: 'MAKANAN_BERAT',
      isFree: false,
      type: 'RESCUE_SALE',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60',
      rating: 4.8,
      storageCondition: 'WARMER',
      packagingType: 'PACKAGED',
      weightPerUnitKg: 0.45,
      allergens: ['Halal BPJPH', 'Non-Pork'],
    },
    {
      id: 'SRP-103',
      title: 'Aneka Roti Pastry & Croissant',
      description: 'Display bakery premium sore hari, kondisi fresh, renyah, dan lezat.',
      providerName: 'Surabaya Artisan Bakery',
      providerPhone: '0812-1122-3344',
      providerAddress: 'Jl. Tunjungan No. 56, Genteng, Surabaya',
      originalPrice: 15000,
      discountPrice: 5000,
      quantity: '18 Pcs',
      pickupTime: 'Hari Ini, 21:30 WIB',
      distance: '0.8 km',
      category: 'ROTI_KUE',
      isFree: false,
      type: 'RESCUE_SALE',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      storageCondition: 'ROOM_TEMP',
      packagingType: 'SEALED_BOX',
      weightPerUnitKg: 0.25,
      allergens: ['Contains Gluten', 'Dairy'],
    },
    {
      id: 'SRP-104',
      title: 'Buah Potong Segar Kemasan Kotak',
      description: 'Melon, semangka, dan pepaya potong steril siap konsumsi. Kaya vitamin dan segar.',
      providerName: 'Fresh Mart Darmo',
      providerPhone: '0813-2233-4455',
      providerAddress: 'Jl. Raya Darmo No. 45, Wonokromo, Surabaya',
      originalPrice: 0,
      discountPrice: 0,
      quantity: '12 Box',
      pickupTime: 'Hari Ini, 19:30 WIB',
      distance: '3.1 km',
      category: 'SAYUR_BUAH',
      isFree: true,
      type: 'DONATION',
      imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=60',
      rating: 5.0,
      storageCondition: 'CHILLED',
      packagingType: 'FOOD_CONTAINER',
      weightPerUnitKg: 0.35,
      allergens: ['100% Organic', 'Vegetarian'],
    },
  ]);

  const [pantiNeeds, setPantiNeeds] = useState<PantiNeed[]>([
    {
      id: 'PNT-01',
      pantiName: 'Panti Asuhan Kasih Ibu',
      shelterType: 'Panti Asuhan Yatim Piatu',
      requestedItem: '45 Porsi Nasi Kotak & Lauk Sehat',
      foodCategoryNeeded: 'Makanan Matang / Siap Santap',
      targetQuantity: '45 Porsi',
      fulfilledQuantity: '20 Porsi',
      beneficiariesCount: 45,
      urgency: 'HIGH',
      address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      district: 'Gubeng',
      distance: '1.4 km',
      cutoffTime: '19:30 WIB',
      cutoffDateStr: `Hari Ini, ${todayFormatted} • 19:30 WIB`,
      contactPerson: 'Ibu Ratna (Pengurus)',
      contactPhone: '0812-3344-5566',
      preferredDelivery: 'RESCUE_COURIER',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'PNT-02',
      pantiName: 'Panti Werdha Usia Emas',
      shelterType: 'Panti Jompo & Lansia Dhuafa',
      requestedItem: '30 Porsi Bubur Ayam / Roti Lembut',
      foodCategoryNeeded: 'Roti & Makanan Lembut',
      targetQuantity: '30 Porsi',
      fulfilledQuantity: '0 Porsi',
      beneficiariesCount: 30,
      urgency: 'HIGH',
      address: 'Jl. Rungkut Madya No. 45, Rungkut, Surabaya',
      district: 'Rungkut',
      distance: '3.2 km',
      cutoffTime: '20:00 WIB',
      cutoffDateStr: `Hari Ini, ${todayFormatted} • 20:00 WIB`,
      contactPerson: 'Bapak Hendra (Ketua Yayasan)',
      contactPhone: '0813-4455-6677',
      preferredDelivery: 'RESCUE_COURIER',
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'PNT-03',
      pantiName: 'Yayasan Insan Cemerlang',
      shelterType: 'Pusat Belajar & Shelter Anak Dhuafa',
      requestedItem: '25 Paket Susu UHT & Buah Segar',
      foodCategoryNeeded: 'Buah Segar / Produk Susu',
      targetQuantity: '25 Porsi',
      fulfilledQuantity: '15 Porsi',
      beneficiariesCount: 25,
      urgency: 'MEDIUM',
      address: 'Jl. Kertajaya Indah No. 12, Sukolilo, Surabaya',
      district: 'Sukolilo',
      distance: '2.8 km',
      cutoffTime: '21:00 WIB',
      cutoffDateStr: `Hari Ini, ${todayFormatted} • 21:00 WIB`,
      contactPerson: 'Ustadz Ahmad',
      contactPhone: '0812-7788-9900',
      preferredDelivery: 'SHELTER_PICKUP',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop&q=60',
    },
  ]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('replate_tas_klaim');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        setCartCount(Array.isArray(items) ? items.length : 0);
      }

      const localSurplus = localStorage.getItem('replate_local_surplus');
      if (localSurplus) {
        const parsed = JSON.parse(localSurplus);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped = parsed.map((item: any) => ({
            id: item.id || `SRP-${Date.now()}`,
            title: item.title || item.foodName || 'Makanan Surplus',
            description: item.description || 'Makanan surplus terverifikasi higienis SOP BPOM RI.',
            providerName: item.providerName || (session?.user?.name) || 'Warung Bakso Pak Kumis',
            providerPhone: item.providerPhone || '0812-3456-7890',
            providerAddress: item.address || 'Jl. Raya Gubeng No. 88, Surabaya',
            originalPrice: item.originalPrice || (item.price ? item.price * 2 : 15000),
            discountPrice: item.discountPrice !== undefined ? item.discountPrice : (item.price || 0),
            quantity: `${item.quantity || 10} Porsi`,
            pickupTime: `Hari Ini, ${new Date(item.pickupDeadline || Date.now() + 4 * 3600000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
            distance: '1.0 km',
            category: item.category || item.foodCategory || 'MAKANAN_BERAT',
            isFree: item.isFree || item.price === 0 || item.distributionType === 'FREE',
            type: (item.isFree || item.price === 0 || item.distributionType === 'FREE' ? 'DONATION' : 'RESCUE_SALE') as any,
            imageUrl: item.imageUrl || (item.photos && item.photos[0]) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
            rating: 5.0,
            storageCondition: item.storageCondition || 'WARMER',
            packagingType: item.packagingType || 'PACKAGED',
            weightPerUnitKg: item.weightPerUnitKg || 0.4,
            allergens: item.allergens || ['Nut-Free', 'Halal BPJPH', 'Wadah Food-Grade'],
          }));

          setFoods((prev) => {
            const combined = [...mapped, ...prev];
            return Array.from(new Map(combined.map((i) => [i.id, i])).values());
          });
        }
      }
    } catch (_) {}
  }, [session]);

  const handleAddToCart = (food: FoodItem) => {
    try {
      const savedCart = localStorage.getItem('replate_tas_klaim');
      const existing = savedCart ? JSON.parse(savedCart) : [];
      const newItem = {
        id: food.id,
        foodName: food.title,
        providerName: food.providerName,
        discountPrice: food.discountPrice,
        originalPrice: food.originalPrice,
        quantity: 1,
        imageUrl: food.imageUrl,
        pickupDeadline: food.pickupTime,
        type: food.type,
      };
      const updated = [...existing, newItem];
      localStorage.setItem('replate_tas_klaim', JSON.stringify(updated));
      setCartCount(updated.length);
      setToastState({
        isOpen: true,
        message: `"${food.title}" berhasil ditambahkan ke Tas Klaim!`,
        type: 'success',
      });
    } catch (_) {}
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

  const handleSanggupiPanti = (need: PantiNeed) => {
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

    // Save claim manifest
    try {
      const existingClaimsStr = localStorage.getItem('replate_claims');
      const existingClaims = existingClaimsStr ? JSON.parse(existingClaimsStr) : [];
      const code = `FB-DON-${Date.now().toString().slice(-5)}`;
      const newClaim = {
        code,
        foodName: `Paket Donasi Pangan Sehat (${portionsNum} Porsi)`,
        userName: fulfillModal.need.pantiName,
        recipientPerson: fulfillModal.need.contactPerson,
        recipientPhone: fulfillModal.need.contactPhone,
        recipientType: 'Panti Asuhan Terverifikasi',
        quantity: `${portionsNum} Porsi`,
        status: 'AWAITING_RESCUE_PICKUP',
        deliveryMethod: fulfillModal.deliveryMethod,
        courierName: 'Budi Santoso (Relawan ID #RC-881)',
        courierOrg: 'Food Bank Surabaya Logistik',
        courierPhone: '0812-9876-5432',
        address: fulfillModal.need.address,
        time: `Hari ini, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      };
      localStorage.setItem('replate_claims', JSON.stringify([...existingClaims, newClaim]));
    } catch (_) {}

    setFulfillModal({ isOpen: false, need: null, portions: '20', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true });
    setToastState({
      isOpen: true,
      message: `Terima kasih! Anda berhasil menyanggupi donasi ${portionsNum} porsi untuk ${fulfillModal.need.pantiName}. Tiket otomatis masuk ke Modul Klaim & Kasir!`,
      type: 'success',
    });
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      if (activeTab === 'RESCUE_SALE' && item.type !== 'RESCUE_SALE') return false;
      if (activeTab === 'DONATION' && item.type !== 'DONATION') return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (searchQuery.trim() && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [foods, activeTab, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            WORKSPACE EKSPLORASI PANGAN SURABAYA
          </span>
          <h1 className="text-2xl font-black text-[#1B3A5C]">Katalog Eksplorasi Pangan Surplus & Donasi</h1>
          <p className="text-xs text-slate-500 font-medium">
            Temukan makanan berkualitas diskon 50-70%, donasi pangan Rp 0, atau sanggupi permohonan nutrisi panti asuhan Surabaya.
          </p>
        </div>

        <Link href="/dashboard/cart">
          <Button variant="gold" size="sm" className="font-extrabold text-xs text-slate-950 shadow-xs flex items-center gap-1.5">
            <span>🛒 Tas Klaim</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-black">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>
      </div>

      {/* 3 Core Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('RESCUE_SALE')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'RESCUE_SALE'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          🏷️ Rescue Sale (Diskon Murah 50-70%)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DONATION')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'DONATION'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          🎁 Donasi Pangan Bebas Biaya (Rp 0)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PANTI_NEEDS')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'PANTI_NEEDS'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          🏛️ Permintaan Panti Asuhan ({pantiNeeds.length})
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      {activeTab !== 'PANTI_NEEDS' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Cari makanan lezat, nasi kotak, bakery, buah segar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1B3A5C] shadow-xs"
              />
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {[
                { key: 'ALL', label: 'Semua Kategori' },
                { key: 'MAKANAN_BERAT', label: '🍱 Makanan Berat' },
                { key: 'ROTI_KUE', label: '🥐 Roti & Bakery' },
                { key: 'SAYUR_BUAH', label: '🥗 Sayur & Buah' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-[#1B3A5C] text-[#D4A843] shadow-xs border border-[#D4A843]'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {activeTab !== 'PANTI_NEEDS' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFoods.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="px-2.5 py-1 bg-[#1B3A5C] text-[#D4A843] text-[10px] font-black rounded-lg shadow-xs uppercase">
                      {item.isFree ? 'DONASI BEBAS BIAYA' : 'RESCUE SALE 50%-70%'}
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2.5 py-0.5 bg-slate-950/80 text-white text-[10px] font-bold rounded-md font-mono">
                    📍 {item.distance}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {item.providerName}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ SOP BPOM 100%
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#1B3A5C] leading-snug group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      {item.isFree ? (
                        <strong className="text-base font-black text-emerald-600">Rp 0 (GRATIS)</strong>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <strong className="text-base font-black text-amber-800">
                            Rp {item.discountPrice.toLocaleString('id-ID')}
                          </strong>
                          <span className="text-[10px] text-slate-400 line-through">
                            Rp {item.originalPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                      Stok: {item.quantity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenFoodDetail(item)}
                  className="font-bold text-xs"
                >
                  Detail Info
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  className="font-black text-xs text-slate-950 shadow-xs"
                >
                  + Klaim Makanan
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Panti Needs Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pantiNeeds.map((need) => (
            <div
              key={need.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img src={need.imageUrl} alt={need.pantiName} className="w-full h-full object-cover opacity-90" />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-xs uppercase">
                      URGENT NUTRISI ANAK
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2.5 py-0.5 bg-slate-950/80 text-white text-[10px] font-bold rounded-md font-mono">
                    📍 {need.distance} ({need.district})
                  </span>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                      {need.shelterType}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {need.preferredDelivery === 'RESCUE_COURIER' ? '🛵 Kurir Relawan' : '🏬 Ambil Mandiri'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#1B3A5C]">{need.pantiName}</h3>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[10px] block">Kebutuhan Menu:</span>
                    <strong className="text-slate-800 text-xs block">{need.requestedItem}</strong>
                  </div>

                  {/* Comprehensive Date & Time Deadline (Point 3) */}
                  <div className="p-2 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-950 font-bold space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-amber-800 block">BATAS WAKTU MAKAN MALAM:</span>
                    <span className="block font-mono text-xs text-amber-900">{need.cutoffDateStr}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Progres Pemenuhan:</span>
                      <span className="text-[#1B3A5C] font-mono">{need.fulfilledQuantity} / {need.targetQuantity}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D4A843] h-full"
                        style={{
                          width: `${(parseInt(need.fulfilledQuantity) / parseInt(need.targetQuantity)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleSanggupiPanti(need)}
                  className="w-full font-black text-xs text-slate-950 shadow-xs"
                >
                  Sanggupi Bantuan Donasi Panti ➔
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Makanan */}
      <FoodDetailModal
        isOpen={!!selectedFoodForModal}
        onClose={() => setSelectedFoodForModal(null)}
        food={selectedFoodForModal}
      />

      {/* Modal Sanggupi Permintaan Panti */}
      {fulfillModal.isOpen && fulfillModal.need && (
        <Modal
          isOpen={fulfillModal.isOpen}
          onClose={() => setFulfillModal({ isOpen: false, need: null, portions: '20', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}
          title={`Sanggupi Donasi Pangan: ${fulfillModal.need.pantiName}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Target Lembaga Penerima:</span>
              <strong className="text-sm text-[#1B3A5C] block">{fulfillModal.need.pantiName} ({fulfillModal.need.shelterType})</strong>
              <p className="text-[11px] text-slate-600">{fulfillModal.need.address}</p>
            </div>

            <div className="space-y-2">
              <label className="font-extrabold text-slate-800 block">Jumlah Porsi yang Ingin Anda Salurkan:</label>
              <input
                type="number"
                min="1"
                value={fulfillModal.portions}
                onChange={(e) => setFulfillModal({ ...fulfillModal, portions: e.target.value })}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-black text-base text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs space-y-1">
              <span className="text-[10px] font-black text-[#1B3A5C] uppercase tracking-wider block">METODE PENGIRIMAN LOGISTIK:</span>
              <strong className="text-slate-800 block">
                {fulfillModal.need.preferredDelivery === 'RESCUE_COURIER'
                  ? '🛵 Diantar Kurir Relawan Komunitas (Food Bank Surabaya)'
                  : '🏬 Diambil Mandiri oleh Pengurus Panti'}
              </strong>
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={fulfillModal.hygieneChecked}
                onChange={(e) => setFulfillModal({ ...fulfillModal, hygieneChecked: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-[#1B3A5C] rounded border-slate-300"
              />
              <span className="text-[11px] font-bold text-slate-800">
                Saya menjamin makanan yang didonasikan 100% higienis, steril, dan memenuhi SOP BPOM RI.
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFulfillModal({ isOpen: false, need: null, portions: '20', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}
              >
                Batal
              </Button>
              <Button variant="gold" size="sm" className="font-black text-slate-950" onClick={handleConfirmFulfill}>
                Terbitkan Tiket Donasi ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
