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
  location: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  deadline: string;
  imageUrl: string;
  legalStatus: string;
  legalPermit: string;
  notes: string;
  preferredDelivery: 'RESCUE_COURIER' | 'PROVIDER_DIRECT' | 'SHELTER_PICKUP';
  lat: number;
  lng: number;
}

export default function WorkspaceExplorePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'RESCUE_SALE' | 'DONATION' | 'PANTI_NEEDS'>('RESCUE_SALE');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPantiLocation, setFilterPantiLocation] = useState<string>('ALL');
  const [filterPantiUrgency, setFilterPantiUrgency] = useState<string>('ALL');

  const [selectedFoodForModal, setSelectedFoodForModal] = useState<any | null>(null);
  const [selectedShelterProfile, setSelectedShelterProfile] = useState<PantiNeed | null>(null);

  const [fulfillModal, setFulfillModal] = useState<{
    isOpen: boolean;
    need: PantiNeed | null;
    portions: string;
    deliveryMethod: string;
    hygieneChecked: boolean;
  }>({
    isOpen: false,
    need: null,
    portions: '25',
    deliveryMethod: 'RESCUE_COURIER',
    hygieneChecked: true,
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });
  
  const [syncRadius, setSyncRadius] = useState<number | null>(null);

  useEffect(() => {
    try {
      const radius = localStorage.getItem('replate_admin_sync_radius');
      if (radius) setSyncRadius(parseInt(radius));
    } catch (_) {}
  }, []);

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [pantiNeeds, setPantiNeeds] = useState<PantiNeed[]>([
    {
      id: 'REQ-DON-001',
      pantiName: 'Panti Asuhan Kasih Ibu Surabaya',
      shelterType: 'Panti Asuhan Anak Yatim',
      requestedItem: 'Nasi Kotak / Paket Lauk Pauk Bergizi',
      foodCategoryNeeded: 'Makanan Olahan (Meals)',
      targetQuantity: '50 Porsi',
      fulfilledQuantity: '30 Porsi',
      beneficiariesCount: 45,
      urgency: 'HIGH',
      location: 'Surabaya Timur (Gubeng)',
      address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      contactPerson: 'Ibu Hajjah Maryam',
      contactPhone: '081298765432',
      deadline: 'Hari ini sebelum 20:00 WIB',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
      legalStatus: 'Terverifikasi Dinsos Jatim',
      legalPermit: 'DINSOS-SBY/2023/8912',
      notes: 'Membutuhkan 40-50 porsi nasi lauk pauk bergizi untuk makan malam anak-anak panti.',
      preferredDelivery: 'RESCUE_COURIER',
      lat: -7.2754,
      lng: 112.7541,
    },
    {
      id: 'REQ-DON-002',
      pantiName: 'Panti Werdha Lansia Sejahtera',
      shelterType: 'Panti Werdha (Lansia)',
      requestedItem: 'Roti Gandum, Susu Steril & Buah Potong',
      foodCategoryNeeded: 'Roti, Buah & Susu (Bakery & Dairy)',
      targetQuantity: '35 Porsi',
      fulfilledQuantity: '15 Porsi',
      beneficiariesCount: 30,
      urgency: 'MEDIUM',
      location: 'Surabaya Selatan (Wonokromo)',
      address: 'Jl. Wonokromo No. 12, Wonokromo, Surabaya',
      contactPerson: 'Bapak Hartono',
      contactPhone: '081345678901',
      deadline: 'Besok pagi 08:30 WIB',
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=60',
      legalStatus: 'Terverifikasi Kemenkumham',
      legalPermit: 'DINSOS-SBY/2022/4102',
      notes: 'Membutuhkan roti tekstur lembut, buah potong segar, atau susu UHT untuk lansia.',
      preferredDelivery: 'SHELTER_PICKUP',
      lat: -7.3012,
      lng: 112.7389,
    },
    {
      id: 'REQ-DON-003',
      pantiName: 'Shelter Dhuafa & Anak Jalanan Mandiri',
      shelterType: 'Shelter & Rumah Singgah',
      requestedItem: 'Surplus Makanan Katering / Prasmanan Bersih',
      foodCategoryNeeded: 'Makanan Olahan (Meals)',
      targetQuantity: '60 Porsi',
      fulfilledQuantity: '10 Porsi',
      beneficiariesCount: 25,
      urgency: 'HIGH',
      location: 'Surabaya Pusat (Genteng)',
      address: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      contactPerson: 'Mas Dedi Relawan',
      contactPhone: '081567890123',
      deadline: 'Hari ini sebelum 21:30 WIB',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=60',
      legalStatus: 'Terverifikasi Pemkot Surabaya',
      legalPermit: 'DINSOS-SBY/2024/1109',
      notes: 'Membutuhkan porsi makanan surplus siap santap untuk pembagian malam relawan.',
      preferredDelivery: 'PROVIDER_DIRECT',
      lat: -7.2623,
      lng: 112.7391,
    },
  ]);

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

  useEffect(() => {
    fetch('/api/surplus')
      .then((res) => res.json())
      .then((data) => {
        let items: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          items = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          items = data.data;
        }

        if (items.length > 0) {
          const mapped: FoodItem[] = items.map((item: any) => ({
            id: item.id || `food-${Math.random()}`,
            title: item.foodName || item.title || 'Makanan Surplus',
            description: item.description || 'Makanan surplus terverifikasi higienis SOP BPOM RI.',
            providerName: item.provider?.organizationName || item.providerName || 'Warung Bakso Pak Kumis',
            providerPhone: item.provider?.phone || '081234567891',
            providerAddress: item.address || item.pickupAddress || 'Jl. Genteng Kali No. 45, Surabaya',
            originalPrice: item.originalPrice || 25000,
            discountPrice: item.discountPrice || item.price || 0,
            quantity: `${item.quantity || 10} Porsi`,
            pickupTime: item.pickupTime || 'Hari ini 19:00 - 21:00 WIB',
            distance: item.distance || '1.2 km',
            category: item.category || 'MAKANAN_BERAT',
            isFree: item.distributionType === 'FREE' || item.price === 0 || item.discountPrice === 0,
            type: item.distributionType === 'FREE' || item.price === 0 || item.discountPrice === 0 ? 'DONATION' : 'RESCUE_SALE',
            imageUrl: item.imageUrl || item.photos?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
            rating: item.rating || 4.8,
            storageCondition: item.storageCondition || 'ROOM_TEMP',
            packagingType: item.packagingType || 'PACKAGED',
            weightPerUnitKg: item.weightPerUnitKg || 0.4,
            allergens: item.allergens || ['Nut-Free', 'Halal BPJPH', 'Sterile Container'],
            lat: item.lat || -7.2575,
            lng: item.lng || 112.7521,
          }));
          setFoods(mapped);
        } else {
          setFoods(defaultFoods);
        }
      })
      .catch(() => {
        setFoods(defaultFoods);
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
    if (activeTab === 'RESCUE_SALE' && item.isFree) return false;
    if (activeTab === 'DONATION' && !item.isFree) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.providerName.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredPantiNeeds = useMemo(() => {
    return pantiNeeds.filter((need) => {
      const matchLoc = filterPantiLocation === 'ALL' || need.location.includes(filterPantiLocation);
      const matchUrg = filterPantiUrgency === 'ALL' || need.urgency === filterPantiUrgency;
      return matchLoc && matchUrg;
    });
  }, [pantiNeeds, filterPantiLocation, filterPantiUrgency]);

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

      setToastState({
        isOpen: true,
        message: `"${item.title}" berhasil ditambahkan ke Tas Klaim Anda!`,
        type: 'success',
      });
    } catch (_) {}
  };

  const handleBuyNow = (item: FoodItem) => {
    handleClaimFood(item);
    router.push('/dashboard/cart?checkout=true');
  };

  const handleConfirmFulfill = () => {
    if (!fulfillModal.need) return;
    const portionsNum = parseInt(fulfillModal.portions) || 0;
    if (portionsNum <= 0) return;

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

    setFulfillModal({ isOpen: false, need: null, portions: '25', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true });
    setToastState({
      isOpen: true,
      message: `Terima kasih! Anda berhasil menyanggupi donasi ${portionsNum} porsi untuk ${fulfillModal.need.pantiName}.`,
      type: 'success',
    });
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
      <div className="relative bg-gradient-to-br from-[#1B3A5C] via-[#142C47] to-slate-900 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl mb-4 border border-slate-800">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4A843]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                Rekomendasi Spesial Hari Ini
              </span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Selamatkan <span className="text-[#D4A843]">Surplus Pangan</span>,<br />Bantu Sesama.
              </h1>
              <p className="text-sm text-slate-300 font-medium max-w-md leading-relaxed">
                Akses eksklusif katalog Rescue Sale dengan harga spesial, Donasi Bebas Biaya Rp 0, dan penuhi Kebutuhan Panti Asuhan langsung dari workspace Anda.
              </p>
            </div>
            
            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('RESCUE_SALE')} 
                className="px-5 py-2.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-900/20 transition-all cursor-pointer"
              >
                Lihat Semua Promo ➔
              </button>
            </div>
          </div>

          <div className="w-full sm:w-[340px] shrink-0 rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* Featured FoodCard */}
            <div className="shadow-2xl shadow-black/40 rounded-3xl overflow-hidden ring-4 ring-white/10 bg-white">
              <FoodCard
                id="promo-hero-1"
                title="Paket Nasi Kuning Komplit"
                providerName="Dapur Bunda Rasa"
                category="MAKANAN_BERAT"
                quantity="5 Porsi"
                discountPrice={12000}
                originalPrice={25000}
                isFree={false}
                pickupTime="19:00 WIB"
                distance="0.8 km"
                imageUrl="https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
                onDetail={() => {}}
                onClaim={() => handleBuyNow({
                  id: "promo-hero-1",
                  title: "Paket Nasi Kuning Komplit",
                  providerName: "Dapur Bunda Rasa",
                  category: "MAKANAN_BERAT",
                  quantity: "5 Porsi",
                  discountPrice: 12000,
                  originalPrice: 25000,
                  isFree: false,
                  type: "RESCUE_SALE",
                  pickupTime: "19:00 WIB",
                  distance: "0.8 km",
                  imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
                })}
                onAddToCart={() => handleClaimFood({
                  id: "promo-hero-1",
                  title: "Paket Nasi Kuning Komplit",
                  providerName: "Dapur Bunda Rasa",
                  category: "MAKANAN_BERAT",
                  quantity: "5 Porsi",
                  discountPrice: 12000,
                  originalPrice: 25000,
                  isFree: false,
                  type: "RESCUE_SALE",
                  pickupTime: "19:00 WIB",
                  distance: "0.8 km",
                  imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
                })}
              />
            </div>
          </div>
        </div>
      </div>

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
      </div>

      {/* Food Grid / Panti Grid Content */}
      {activeTab !== 'PANTI_NEEDS' ? (
        <div className="space-y-6">
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
                isFree={item.isFree}
                pickupTime={item.pickupTime}
                distance={item.distance}
                imageUrl={item.imageUrl}
                onDetail={() => handleOpenFoodDetail(item)}
                onClaim={() => handleBuyNow(item)}
                onAddToCart={() => handleClaimFood(item)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Tab Permintaan Panti */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPantiNeeds.map((need) => (
              <div
                key={need.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img src={need.imageUrl} alt={need.pantiName} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-red-500 text-white">
                      {need.urgency === 'HIGH' ? 'URGENT HARI INI' : 'MEMBUTUHKAN'}
                    </span>
                    <span className="text-[10px] bg-slate-950/80 text-emerald-300 font-bold px-2 py-1 rounded-lg">
                      ✓ {need.legalStatus}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{need.id}</span>
                    <h4 className="font-black text-base text-[#1B3A5C]">{need.pantiName}</h4>
                    <p className="text-xs font-bold text-emerald-800">{need.requestedItem}</p>
                    <p className="text-[11px] text-slate-500">Penerima: {need.beneficiariesCount} Jiwa • {need.location}</p>

                    <button
                      type="button"
                      onClick={() => setSelectedShelterProfile(need)}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1B3A5C] font-black text-[11px] rounded-xl border border-blue-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Lihat Profil Detail & Titik Peta GPS ➔</span>
                    </button>
                  </div>

                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() =>
                      setFulfillModal({
                        isOpen: true,
                        need,
                        portions: '25',
                        deliveryMethod: need.preferredDelivery,
                        hygieneChecked: true,
                      })
                    }
                    className="w-full font-black text-xs text-slate-950 py-2.5 shadow-xs"
                  >
                    Sanggupi Bantuan Panti ➔
                  </Button>
                </div>
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
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedShelterProfile(null)}>
                Tutup Profil
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Sanggupi Permintaan Panti */}
      <Modal
        isOpen={fulfillModal.isOpen}
        onClose={() => setFulfillModal({ isOpen: false, need: null, portions: '25', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}
        title={`Alur Sanggupi Donasi: ${fulfillModal.need?.pantiName || 'Panti Asuhan'}`}
        size="lg"
      >
        {fulfillModal.need && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                PENERIMA BANTUAN TARGET
              </span>
              <h4 className="text-lg font-black text-white">{fulfillModal.need.pantiName}</h4>
              <p className="text-xs text-slate-200">
                Kebutuhan: <strong>{fulfillModal.need.foodCategoryNeeded}</strong> • Batas Waktu: {fulfillModal.need.deadline}
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
              <Button variant="outline" size="sm" onClick={() => setFulfillModal({ isOpen: false, need: null, portions: '25', deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}>
                Batal
              </Button>
              <Button variant="gold" size="sm" onClick={handleConfirmFulfill} className="font-black text-slate-950 shadow-md">
                Konfirmasi & Selesaikan Donasi ➔
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
