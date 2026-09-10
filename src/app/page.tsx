'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ImpactCounter } from '@/components/landing/ImpactCounter';
import { SDGSection } from '@/components/landing/SDGSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Check, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [landingSearchQuery, setLandingSearchQuery] = useState('');

  // In-Section Governance Tracker State
  const [trackerResult, setTrackerResult] = useState<{
    regId: string;
    profile: {
      entityName: string;
      email: string;
      phone: string;
      contactPerson: string;
      address: string;
      category: string;
      role: string;
    };
    docsStatus: string;
    submittedTime: string;
  } | null>(null);
  const [isTrackerSearched, setIsTrackerSearched] = useState(false);
  const [trackerError, setTrackerError] = useState('');

  const executeTrackerSearch = (targetQuery: string) => {
    setTrackerError('');
    const cleanQuery = targetQuery.trim();
    if (!cleanQuery) {
      setTrackerError('Silakan masukkan Kode Tracking, Email, atau No. WA Anda.');
      return;
    }

    const upperQuery = cleanQuery.toUpperCase();
    const queryLower = cleanQuery.toLowerCase();

    try {
      // 1. Check in replate_claims for tracking codes or recipient/provider searches
      const savedClaimsStr = localStorage.getItem('replate_claims');
      if (savedClaimsStr) {
        try {
          const claims = JSON.parse(savedClaimsStr);
          if (Array.isArray(claims)) {
            const foundClaim = claims.find((c: any) =>
              (c.code && c.code.toUpperCase().includes(upperQuery)) ||
              (c.id && c.id.toUpperCase().includes(upperQuery)) ||
              (c.claimCode && c.claimCode.toUpperCase().includes(upperQuery)) ||
              (c.foodName && c.foodName.toLowerCase().includes(queryLower)) ||
              (c.shelterName && c.shelterName.toLowerCase().includes(queryLower))
            );
            if (foundClaim) {
              const isClaimDone = foundClaim.status === 'COMPLETED' || foundClaim.status === 'VERIFIED';
              setTrackerResult({
                regId: foundClaim.code || foundClaim.id || upperQuery,
                profile: {
                  entityName: `${foundClaim.shelterName || 'Lembaga Penerima'} (Klaim: ${foundClaim.foodName})`,
                  email: foundClaim.email || `${cleanQuery}@replate.id`,
                  phone: foundClaim.shelterPhone || foundClaim.providerPhone || '0812-3456-7890',
                  contactPerson: foundClaim.providerName || 'Mitra Replate',
                  address: foundClaim.shelterAddress || foundClaim.providerAddress || 'Surabaya',
                  category: 'FOOD_CLAIM_AUDIT',
                  role: 'FOOD_BENEFICIARY',
                },
                docsStatus: isClaimDone ? 'APPROVED_ACTIVE' : 'DOCS_SUBMITTED_PENDING_REVIEW',
                submittedTime: foundClaim.time || 'Hari ini',
              });
              setIsTrackerSearched(true);
              return;
            }
          }
        } catch (_) {}
      }

      // 2. Check in replate_registered_user
      const regUserStr = localStorage.getItem('replate_registered_user');
      if (regUserStr) {
        try {
          const regUser = JSON.parse(regUserStr);
          if (
            (regUser.email && regUser.email.toLowerCase() === queryLower) ||
            (regUser.phone && regUser.phone.includes(cleanQuery)) ||
            (regUser.id && regUser.id.toUpperCase() === upperQuery) ||
            (regUser.name && regUser.name.toLowerCase().includes(queryLower)) ||
            (regUser.organizationName && regUser.organizationName.toLowerCase().includes(queryLower))
          ) {
            const isApproved = regUser.isVerified || regUser.approvalStatus === 'APPROVED';
            setTrackerResult({
              regId: regUser.id ? `REG-${regUser.id.slice(-6).toUpperCase()}` : upperQuery,
              profile: {
                entityName: regUser.organizationName || regUser.name || 'Pengguna Terdaftar',
                email: regUser.email || cleanQuery,
                phone: regUser.phone || '0812-3456-7890',
                contactPerson: regUser.name || 'PIC Lembaga',
                address: regUser.address || 'Kota Surabaya',
                category: regUser.role === 'FOOD_BENEFICIARY' ? 'SHELTER_ORPHANAGE' : 'RESTAURANT',
                role: regUser.role || 'FOOD_PROVIDER',
              },
              docsStatus: isApproved ? 'APPROVED_ACTIVE' : 'DOCS_SUBMITTED_PENDING_REVIEW',
              submittedTime: regUser.createdAt ? new Date(regUser.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Hari ini',
            });
            setIsTrackerSearched(true);
            return;
          }
        } catch (_) {}
      }

      // 3. Fallback to onboarding profile & demo seeds
      const storedProfile = localStorage.getItem('replate_onboarding_profile');
      const storedDocs = localStorage.getItem('replate_onboarding_docs');

      const isPanti = queryLower.includes('panti') || queryLower.includes('yayasan') || queryLower.includes('kasih');

      let resolvedProfile = isPanti
        ? {
            entityName: 'Panti Asuhan Kasih Ibu Surabaya',
            email: cleanQuery.includes('@') ? cleanQuery : 'panti.kasih.ibu@replate.id',
            phone: '0812-9876-5432',
            contactPerson: 'Ibu Hajjah Maryam',
            address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
            category: 'SHELTER_ORPHANAGE',
            role: 'FOOD_BENEFICIARY',
          }
        : {
            entityName: 'Warung Bakso Pak Kumis Surabaya',
            email: cleanQuery.includes('@') ? cleanQuery : 'bakso.pak.kumis@replate.id',
            phone: '0812-3456-7890',
            contactPerson: 'Mas Doni',
            address: 'Jl. Raya Gubeng No. 88, Surabaya',
            category: 'RESTAURANT',
            role: 'FOOD_PROVIDER',
          };

      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed && typeof parsed === 'object') {
            const isStoredProfilePanti =
              parsed.role === 'FOOD_BENEFICIARY' ||
              parsed.role === 'YAYASAN' ||
              parsed.entityName?.toLowerCase().includes('panti') ||
              parsed.entityName?.toLowerCase().includes('yayasan');

            if (isPanti) {
              if (isStoredProfilePanti) {
                resolvedProfile = { ...resolvedProfile, ...parsed };
              }
            } else {
              if (!isStoredProfilePanti) {
                resolvedProfile = { ...resolvedProfile, ...parsed };
              }
            }
          }
        } catch (_) {}
      }

      if (cleanQuery.includes('@')) {
        resolvedProfile.email = cleanQuery;
      }

      let resolvedStatus = 'DOCS_SUBMITTED_PENDING_REVIEW';
      let resolvedTime = 'Hari ini, 09:00 WIB';

      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          if (parsedDocs.status) resolvedStatus = parsedDocs.status;
          if (parsedDocs.submittedAt) {
            const dateObj = new Date(parsedDocs.submittedAt);
            resolvedTime = dateObj.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
          }
        } catch (_) {}
      }

      setTrackerResult({
        regId: upperQuery,
        profile: resolvedProfile,
        docsStatus: resolvedStatus,
        submittedTime: resolvedTime,
      });
      setIsTrackerSearched(true);
    } catch (_) {
      setIsTrackerSearched(true);
    }
  };

  const handleSimulateApprove = () => {
    try {
      const d = localStorage.getItem('replate_onboarding_docs') || '{}';
      const parsed = JSON.parse(d);
      localStorage.setItem('replate_onboarding_docs', JSON.stringify({ ...parsed, status: 'APPROVED_ACTIVE' }));
    } catch (_) {}
    if (trackerResult) {
      setTrackerResult({ ...trackerResult, docsStatus: 'APPROVED_ACTIVE' });
    }
  };

  // Auth Required Guard Modal
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    itemTitle: string;
  }>({
    isOpen: false,
    itemTitle: '',
  });

  // Auto-Redirect to Role Dashboard if User is already Authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = String(session.user.role);
      const targetDashboard =
        role === 'PROVIDER' || role === 'FOOD_PROVIDER'
          ? '/dashboard/provider'
          : role === 'YAYASAN' || role === 'FOOD_BENEFICIARY'
          ? '/dashboard/yayasan'
          : role === 'RESCUE_PARTNER' || role === 'RESCUE_VOLUNTEER'
          ? '/dashboard/rescue-partner'
          : role === 'ADMIN' || role === 'SUPER_ADMIN'
          ? '/dashboard/admin'
          : '/dashboard/consumer';
      router.replace(targetDashboard);
    }
  }, [status, session, router]);

  // Synchronized explore foods (Exact mirror of explore module default items)
  useEffect(() => {
    const exploreDefaultFoods = [
      {
        id: 'FOD-001',
        title: 'Nasi Paket Ayam Bakar Madu',
        description: 'Nasi hangat dengan ayam bakar madu bumbu rempah, lalapan segar, dan sambal terasi terpisah dalam kemasan higienis.',
        providerName: 'Warung Bakso Pak Kumis',
        originalPrice: 28000,
        discountPrice: 12000,
        quantity: '15 Porsi',
        pickupTime: '19:30 - 21:30 WIB',
        distance: '0.8 km',
        category: 'MAKANAN_BERAT',
        isFree: false,
        matchScore: 98,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'FOD-002',
        title: 'Roti Croissant & Choco Pastry',
        description: 'Aneka roti croissant butter dan pastry cokelat lembut yang baru dipanggang hari ini di outlet bakery.',
        providerName: 'Rotiboy Bakery Surabaya',
        originalPrice: 18000,
        discountPrice: 6000,
        quantity: '25 Porsi',
        pickupTime: '20:00 - 22:00 WIB',
        distance: '1.2 km',
        category: 'ROTI_KUE',
        isFree: false,
        matchScore: 96,
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'FOD-003',
        title: 'Prasmanan Nasi Goreng & Ayam Goreng',
        description: 'Menu buffet hotel bintang 5 yang tidak tersentuh tamu, disimpan di warm chafing dish dengan suhu >60°C.',
        providerName: 'Hotel Majapahit Surabaya',
        originalPrice: 45000,
        discountPrice: 0,
        quantity: '30 Porsi',
        pickupTime: '20:30 - 22:00 WIB',
        distance: '2.1 km',
        category: 'MAKANAN_BERAT',
        isFree: true,
        matchScore: 99,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'FOD-004',
        title: 'Sop Buntut & Daging Kuah Steril',
        description: 'Sop daging kuah kaldu rempah kaya gizi, dikemas dalam wadah mangkok microwaveable kedap udara.',
        providerName: 'Dapur Katering Bu Rudy',
        originalPrice: 35000,
        discountPrice: 15000,
        quantity: '12 Porsi',
        pickupTime: '19:00 - 21:00 WIB',
        distance: '1.5 km',
        category: 'MAKANAN_BERAT',
        isFree: false,
        matchScore: 94,
        imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'FOD-005',
        title: 'Paket Roti Tawar Gandum & Donat Susu',
        description: 'Paket roti gandum tinggi serat dan donat tabur gula halus, higienis untuk sarapan atau camilan panti.',
        providerName: 'Bakery Plaza Surabaya',
        originalPrice: 22000,
        discountPrice: 0,
        quantity: '20 Porsi',
        pickupTime: '20:30 - 21:45 WIB',
        distance: '1.8 km',
        category: 'ROTI_KUE',
        isFree: true,
        matchScore: 95,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      },
    ];

    try {
      const localStr = localStorage.getItem('replate_local_surplus');
      const localItems = localStr ? JSON.parse(localStr) : [];
      const mappedLocal = localItems.map((item: any, idx: number) => ({
        id: item.id || `local-surplus-${idx}`,
        title: item.foodName || item.name || item.title || 'Surplus Makanan Steril',
        providerName: item.provider?.organizationName || item.provider?.name || item.providerName || item.storeName || 'Warung Bakso Pak Kumis',
        originalPrice: item.originalPrice ? Number(item.originalPrice) : 25000,
        discountPrice: item.discountPrice !== undefined ? Number(item.discountPrice) : (item.pricingScheme === 'RESCUE_SALE' ? Number(item.price || 5000) : 0),
        quantity: typeof item.quantity === 'number' ? `${item.quantity} ${item.quantityUnit || 'Porsi'}` : (item.quantity ? `${item.quantity} Porsi` : '10 Porsi'),
        pickupTime: item.pickupTime || 'Hari ini 21:00 WIB',
        distance: item.distance || '1.0 km',
        category: item.foodCategory || item.category || 'MAKANAN_BERAT',
        isFree: item.discountPrice === 0 || item.pricingScheme !== 'RESCUE_SALE' || item.distributionType === 'FREE' || item.isFree,
        matchScore: item.matchScore || 98,
        imageUrl: item.photos?.[0] || item.photo || item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      }));

      const deduplicateFoods = (list: any[]) => {
        const seen = new Set<string>();
        return list.filter((item) => {
          const id = String(item.id || '');
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      };

      fetch('/api/surplus')
        .then((res) => res.json())
        .then((data) => {
          let apiItems: any[] = [];
          if (data.success && Array.isArray(data.data?.items)) {
            apiItems = data.data.items;
          } else if (data.success && Array.isArray(data.data)) {
            apiItems = data.data;
          }

          if (apiItems.length > 0) {
            const mappedApi = apiItems.map((item: any) => ({
              id: item.id || `food-${Math.random()}`,
              title: item.foodName || item.title || 'Makanan Surplus',
              providerName: item.provider?.organizationName || item.provider?.name || item.providerName || 'Warung Bakso Pak Kumis',
              originalPrice: Number(item.originalPrice || item.price || 25000),
              discountPrice: Number(item.discountPrice !== undefined ? item.discountPrice : (item.distributionType === 'FREE' ? 0 : 8000)),
              quantity: typeof item.quantity === 'number' ? `${item.quantity} ${item.quantityUnit || 'Porsi'}` : item.quantity || '10 Porsi',
              pickupTime: item.pickupTime || 'Hari ini 21:00 WIB',
              distance: item.distance || '1.2 km',
              category: item.foodCategory || item.category || 'MAKANAN_BERAT',
              isFree: item.distributionType === 'FREE' || item.price === 0 || item.discountPrice === 0,
              matchScore: item.matchScore || 96,
              imageUrl: item.imageUrl || item.photos?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
            }));
            setFoods(deduplicateFoods([...mappedLocal, ...mappedApi]));
          } else {
            setFoods(deduplicateFoods([...mappedLocal, ...exploreDefaultFoods]));
          }
        })
        .catch(() => {
          setFoods(deduplicateFoods([...mappedLocal, ...exploreDefaultFoods]));
        });
    } catch (_) {
      setFoods(exploreDefaultFoods);
    }
  }, []);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(foods.length / itemsPerPage) || 1;
  const paginatedFoods = foods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClaim = (id: string) => {
    const isLoggedIn = status === 'authenticated' && !!session?.user;
    if (!isLoggedIn) {
      const item = foods.find((f) => f.id === id);
      setAuthModal({
        isOpen: true,
        itemTitle: item?.title || 'Makanan Surplus',
      });
      return;
    }
    router.push(`/explore?claim=${id}`);
  };

  const handleDetail = (id: string) => {
    const item = foods.find((f) => f.id === id);
    if (item) {
      const formattedItem: any = {
        ...item,
        foodName: item.foodName || item.title || 'Makanan Surplus',
        foodCategory: item.foodCategory || item.category || 'MAKANAN_BERAT',
        price: item.discountPrice !== undefined ? item.discountPrice : (item.isFree ? 0 : item.originalPrice),
        pickupDeadline: item.pickupDeadline || item.pickupTime || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        address: item.address || 'Surabaya',
        storageCondition: item.storageCondition || 'Suhu Ruang / Chiller Higienis',
        packagingType: item.packagingType || 'Food-Grade Biodegradable Container',
        provider: item.provider || {
          name: item.providerName || 'Mitra Replate',
          organizationName: item.providerName || 'Mitra Replate',
          phone: item.providerPhone || '0812-3456-7890',
        },
      };
      setSelectedFood(formattedItem);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar user={session?.user} />

      <main className="flex-1">
        <Hero />
        <HowItWorks />

        {/* Dedicated Governance Audit Status Tracker Section */}
        <section className="py-14 bg-[#1B3A5C] border-y border-[#2C5A8F] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="bg-[#0F1923] rounded-3xl p-6 sm:p-10 border-2 border-[#D4A843]/40 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 max-w-xl text-center md:text-left">
                  <span className="px-3.5 py-1.5 bg-[#D4A843] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md inline-block">
                     REPLATE GOVERNANCE TRACKER 24/7
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Cek Status Pendaftaran & Audit Berkas Partner
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Pernah mendaftar sebagai Provider, Yayasan Panti, atau Food Rescue Volunteer? Masukkan Kode Tracking, Email, atau No. WA Anda untuk memantau status audit tim Governance secara real-time langsung di sini.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeTrackerSearch(landingSearchQuery);
                  }}
                  className="w-full md:w-auto shrink-0 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-700 shadow-lg">
                    <input
                      type="text"
                      placeholder="Kode Tracking / Email / No. WA..."
                      value={landingSearchQuery}
                      onChange={(e) => {
                        setLandingSearchQuery(e.target.value);
                        if (trackerError) setTrackerError('');
                      }}
                      className="px-4 py-3 bg-slate-800 text-white font-mono font-bold text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-[#D4A843] min-w-[260px]"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <span>Cari Status Audit </span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start pt-1">
                    <span className="text-[10px] text-amber-300 font-medium"> Coba klik:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLandingSearchQuery('REPLATE-REG-2026-9812');
                        executeTrackerSearch('REPLATE-REG-2026-9812');
                      }}
                      className="text-[10px] font-mono font-bold text-slate-300 hover:text-amber-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 cursor-pointer transition-colors"
                    >
                      REPLATE-REG-2026-9812
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLandingSearchQuery('panti.kasih.ibu@replate.id');
                        executeTrackerSearch('panti.kasih.ibu@replate.id');
                      }}
                      className="text-[10px] font-mono font-bold text-slate-300 hover:text-amber-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 cursor-pointer transition-colors"
                    >
                      panti.kasih.ibu@replate.id
                    </button>
                  </div>
                  {trackerError && (
                    <p className="text-[11px] text-red-400 font-bold bg-red-950/40 border border-red-800 p-2 rounded-lg text-center md:text-left">
                      {trackerError}
                    </p>
                  )}
                </form>
              </div>

              {/* In-Section Live Audit Status & 5-Step Timeline Card */}
              {isTrackerSearched && trackerResult && (
                <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-6">
                  {/* Entity Header Banner */}
                  <div className="bg-[#1B3A5C]/80 border border-[#2C5A8F] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-black text-amber-300 bg-slate-950/80 px-3 py-1 rounded-lg border border-amber-400/30 uppercase tracking-wider inline-block">
                          KODE TRACKING: {trackerResult.regId}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-md font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {trackerResult.profile.role === 'FOOD_BENEFICIARY' ? 'Yayasan Panti Asuhan' : 'Mitra Food Provider'}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-white mt-1">
                        {trackerResult.profile.entityName}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium">
                        PIC: <strong className="text-white">{trackerResult.profile.contactPerson}</strong> ({trackerResult.profile.phone}) • {trackerResult.profile.address}
                      </p>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-end gap-2">
                      {trackerResult.docsStatus === 'APPROVED_ACTIVE' ? (
                        <span className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg inline-flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" /> AKUN RESMI AKTIF
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg inline-flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> AUDIT SEDANG BERLANGSUNG
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsTrackerSearched(false);
                          setTrackerResult(null);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white font-bold underline cursor-pointer"
                      >
                        Tutup Timeline 
                      </button>
                    </div>
                  </div>

                  {/* 5-Step Timeline Graphic */}
                  <div className="bg-[#142334] rounded-2xl p-6 border border-[#2C5A8F]/70 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-300 text-xs uppercase tracking-wider block">
                         Timeline Proses Verifikasi Governance (Real-Time):
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Update Terakhir: {trackerResult.submittedTime}
                      </span>
                    </div>

                    <div className="relative pl-6 space-y-5 border-l-2 border-[#2C5A8F]">
                      {/* Step 1 */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                          
                        </span>
                        <div className="font-bold text-xs">
                          <span className="text-emerald-300 font-extrabold block">1. Registrasi Akun & Verifikasi OTP WA</span>
                          <span className="text-[11px] text-slate-400 font-mono block font-normal mt-0.5">Tercatat pada {trackerResult.submittedTime}</span>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                          
                        </span>
                        <div className="font-bold text-xs">
                          <span className="text-emerald-300 font-extrabold block">2. Pengisian Profil Usaha & Alamat GPS</span>
                          <span className="text-[11px] text-slate-300 font-mono block font-normal mt-0.5">Alamat: {trackerResult.profile.address}</span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                          
                        </span>
                        <div className="font-bold text-xs">
                          <span className="text-emerald-300 font-extrabold block">3. Unggah Berkas Legalitas (NIB / Izin Dinsos, KTP PIC, Foto Lokasi)</span>
                          <span className="text-[11px] text-slate-300 font-mono block font-normal mt-0.5">Berkas Fisik Terunggah & Terenkripsi SHA-256</span>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="relative">
                        <span
                          className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 font-black text-[11px] flex items-center justify-center ${
                            trackerResult.docsStatus === 'APPROVED_ACTIVE'
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'bg-amber-400 border-amber-300 text-slate-950 animate-pulse'
                          }`}
                        >
                          {trackerResult.docsStatus === 'APPROVED_ACTIVE' ? '' : '4'}
                        </span>
                        <div className="font-bold text-xs">
                          <span className={trackerResult.docsStatus === 'APPROVED_ACTIVE' ? 'text-emerald-300 font-extrabold block' : 'text-amber-300 font-extrabold block'}>
                            4. Audit Keabsahan Dokumen Oleh Tim Governance Admin
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium block mt-0.5">
                            {trackerResult.docsStatus === 'APPROVED_ACTIVE'
                              ? 'Audit Selesai & Valid 100%'
                              : 'Sedang diverifikasi (Estimasi maksimal 1x24 Jam Kerja)'}
                          </span>
                        </div>
                      </div>

                      {/* Step 5 */}
                      <div className="relative">
                        <span
                          className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 font-black text-[11px] flex items-center justify-center ${
                            trackerResult.docsStatus === 'APPROVED_ACTIVE'
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'bg-slate-800 border-slate-600 text-slate-400'
                          }`}
                        >
                          {trackerResult.docsStatus === 'APPROVED_ACTIVE' ? '' : '5'}
                        </span>
                        <div className="font-bold text-xs">
                          <span className={trackerResult.docsStatus === 'APPROVED_ACTIVE' ? 'text-emerald-300 font-extrabold block' : 'text-slate-400 font-medium block'}>
                            5. Aktivasi Akun & Penerbitan Sertifikat BPOM Replate
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium block mt-0.5">
                            {trackerResult.docsStatus === 'APPROVED_ACTIVE'
                              ? 'Akun telah berlisensi penuh dan dapat login ke workspace platform'
                              : 'Menunggu penyelesaian audit Step 4 oleh Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Box */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    {trackerResult.docsStatus !== 'APPROVED_ACTIVE' ? (
                      <div className="w-full bg-[#1B3A5C] p-4 rounded-2xl border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                        <div className="text-center sm:text-left space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                            MODE PENGUJIAN / EVALUASI SISTEM
                          </span>
                          <p className="text-xs text-slate-200 font-medium">
                            Klik tombol di samping untuk mensimulasikan SuperAdmin menyetujui berkas audit:
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSimulateApprove}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Simulasi SuperAdmin ACC & Aktifkan Akun 
                        </button>
                      </div>
                    ) : (
                      <div className="w-full bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                        <div className="text-center sm:text-left space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                            STATUS: AKUN TERVALIDASI
                          </span>
                          <p className="text-xs text-slate-200 font-medium">
                            Akun Anda telah berstatus aktif. Anda dapat langsung masuk ke dashboard.
                          </p>
                        </div>
                        <Link href="/login" className="shrink-0">
                          <Button variant="gold" size="md" className="font-black text-xs text-slate-950 px-6 py-2.5 shadow-md">
                            Masuk Ke Akun Saya 
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Live Available Surplus Section with 3-Card Pagination Limit */}
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#D4A843] uppercase tracking-widest block">
                Katalog Surplus Pangan Nasional
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1B3A5C] mt-1">Eksplor Pangan Terkini</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/explore">
                <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 shadow-md">
                  Lihat Semua di Eksplor Pangan →
                </Button>
              </Link>
            </div>
          </div>

          {/* Paginated Food Grid */}
          <FoodGrid foods={paginatedFoods} onClaim={handleClaim} onDetail={handleDetail} />

          {/* Pagination Controls */}
          {foods.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-b border-slate-200 py-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="font-extrabold text-xs"
              >
                Sebelumnya
              </Button>

              <span className="text-xs font-bold text-[#1B3A5C]">
                Halaman {currentPage} dari {totalPages} (Total {foods.length} Makanan)
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="font-extrabold text-xs"
              >
                Selanjutnya
              </Button>
            </div>
          )}

          {/* Direct CTA Banner to Explore */}
          <div className="p-6 sm:p-8 bg-[#1B3A5C] text-white rounded-3xl shadow-xl border border-[#2C5A8F] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-[#D4A843] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                <span>PUSAT RESCUE SALE, DONASI Rp 0 & KEBUTUHAN YAYASAN</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">Eksplorasi Lengkap dengan Filter Jarak & Kategori</h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-xl">
                Temukan puluhan makanan surplus layak konsumsi di seluruh Indonesia dengan diskon hingga 70% atau donasi steril Rp 0 untuk yayasan dan sesama yang membutuhkan.
              </p>
            </div>
            <Link href="/explore" className="shrink-0 w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all cursor-pointer whitespace-nowrap text-center"
              >
                <span>Buka Eksplor Pangan →</span>
              </button>
            </Link>
          </div>
        </section>

        <ImpactCounter />
        <SDGSection />
        <Testimonials />
      </main>

      <Footer />

      {/* Modal Wajib Masuk / Daftar Akun (Auth Required Guard) */}
      <Modal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, itemTitle: '' })}
        title=" Silakan Masuk atau Daftar Akun untuk Melanjutkan Klaim"
        size="md"
      >
        <div className="space-y-5 text-xs text-slate-700">
          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2">
            <span className="font-black text-amber-950 text-sm block">
              Aksi Memerlukan Akun Terverifikasi Replate
            </span>
            <p className="text-amber-900 leading-relaxed font-medium">
              Untuk melakukan klaim penyelamatan pada <strong>&quot;{authModal.itemTitle}&quot;</strong> serta menjamin keamanan dan higienitas pangan standar BPOM RI, silakan masuk ke akun Anda atau daftar sebagai Mitra/Konsumen.
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
              onClick={() => setAuthModal({ isOpen: false, itemTitle: '' })}
              className="text-slate-400 hover:text-slate-700 font-bold text-[11px] underline cursor-pointer"
            >
              Lihat Katalog Lainnya Dulu (Tutup)
            </button>
          </div>
        </div>
      </Modal>

      <FoodDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        food={selectedFood}
        onClaim={handleClaim}
      />
    </div>
  );
}
