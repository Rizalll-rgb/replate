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
import { Sparkles } from 'lucide-react';

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

  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumerName, setConsumerName] = useState('Konsumen Replate');
  const [consumerAddress, setConsumerAddress] = useState('Surabaya');
  const [activeClaimsCount, setActiveClaimsCount] = useState(1);
  const [completedClaimsCount, setCompletedClaimsCount] = useState(2);

  // Consumer Verification Status
  const [consumerStatus, setConsumerStatus] = useState<'REGULAR_SAVER' | 'PENDING_VERIFICATION' | 'BENEFICIARY_VERIFIED'>('REGULAR_SAVER');
  const [sktmNumber, setSktmNumber] = useState('');
  const [syncRadius, setSyncRadius] = useState<number | null>(null);

  useEffect(() => {
    try {
      const radius = localStorage.getItem('replate_admin_sync_radius');
      if (radius) setSyncRadius(parseInt(radius));
    } catch (_) { }
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

  // Top Smart Matching 2.0 recommendations for Food Consumer
  const smartMatchedItems = [
    {
      id: 'smart-cns-1',
      title: 'Nasi Paket Ayam Bakar Specialty',
      provider: 'Warung Bakso Pak Kumis',
      price: 10000,
      originalPrice: 25000,
      discount: '60%',
      distance: '800 meter',
      matchScore: 98,
      reason: 'Jarak sangat dekat (<1km) • Diskon 60% • Makanan Siap Santap',
      pickupTime: '19:00 - 21:30 WIB',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'smart-cns-2',
      title: 'Roti Croissant & Pastry Steril',
      provider: 'Rotiboy Bakery Surabaya',
      price: 6000,
      originalPrice: 18000,
      discount: '67%',
      distance: '1.2 km',
      matchScore: 95,
      reason: 'Rating Mitra 4.9 • Diskon 67% • Batas Waktu 2 Jam Lagi',
      pickupTime: '20:00 - 22:00 WIB',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
    },
  ];

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
          const completed = parsedClaims.filter((c: any) => c.status === 'COMPLETED').length;
          setActiveClaimsCount(active);
          setCompletedClaimsCount(completed + 2); // Includes initial history
        }
      }
    } catch (_) { }

    try {
      const savedStatus = localStorage.getItem('replate_consumer_verification_status');
      if (savedStatus) {
        setConsumerStatus(savedStatus as any);
      }
    } catch (_) { }

    fetch('/api/surplus')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.items)) {
          setFoods(data.data.items);
        } else if (data.success && Array.isArray(data.data)) {
          setFoods(data.data);
        }
      })
      .catch(() => { });
  }, [session]);

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
            status: (targetFood?.price === 0 || targetFood?.distributionType === 'FREE') ? 'READY_FOR_PICKUP' : 'AWAITING_PAYMENT',
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
              {consumerStatus === 'BENEFICIARY_VERIFIED' ? (
                <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Penerima Bantuan (Donasi Rp 0)</span>
                </span>
              ) : consumerStatus === 'PENDING_VERIFICATION' ? (
                <span className="text-[9.5px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Menunggu Verifikasi Dinsos</span>
                </span>
              ) : (
                <span className="text-[9.5px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>Konsumen Reguler (Rescue Sale)</span>
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-[#1B3A5C] tracking-tight">
              Selamat Datang, {consumerName}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
              Hemat pengeluaran belanja dengan menyelamatkan makanan surplus berkualitas resto berstandar BPOM RI.
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
            <strong className="text-base sm:text-xl font-black text-emerald-600 font-mono block">Rp 45.000</strong>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold flex items-center gap-1">
              <span>Diskon ~65%</span>
            </span>
          </CardBody>
        </Card>

        <Card className="border-slate-200 shadow-2xs sm:shadow-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
          <CardBody className="p-0 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block truncate">Makanan Diselamatkan</span>
            <strong className="text-base sm:text-xl font-black text-[#1B3A5C] font-mono block">{completedClaimsCount} Porsi</strong>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckIcon size={10} className="text-emerald-600" />
              <span>~1.8 kg CO2 Dicegah</span>
            </span>
          </CardBody>
        </Card>

        <Card className="border-slate-200 shadow-2xs sm:shadow-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
          <CardBody className="p-0 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block truncate">Klaim Aktif</span>
            <strong className="text-base sm:text-xl font-black text-[#D4A843] font-mono block">{activeClaimsCount} Pesanan</strong>
            <span className="text-[9px] sm:text-[10px] text-amber-700 font-bold flex items-center gap-1">
              <ClockIcon size={10} />
              <span>Siap Diambil di Gerai</span>
            </span>
          </CardBody>
        </Card>

        <Card className="border-slate-200 shadow-2xs sm:shadow-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
          <CardBody className="p-0 space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block truncate">Status Akun Konsumen</span>
            <strong className="text-xs sm:text-sm font-black text-slate-800 block truncate">
              {consumerStatus === 'BENEFICIARY_VERIFIED' ? 'Penerima Bantuan' : 'Konsumen Rescue'}
            </strong>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheckIcon size={10} className="text-emerald-600" />
              <span>Standar Higienis BPOM</span>
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
              {syncRadius && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] sm:text-[10px] font-black rounded-md self-start sm:self-auto">
                  Radius: &lt; {syncRadius} km
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1">
            <MapPinIcon size={12} className="text-slate-400" />
            Radius &lt; {syncRadius || 1.5} km
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

      {/* Main Food Explorer Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-black text-[#1B3A5C]">Semua Katalog Makanan Surplus Aktif</h3>
          <span className="text-xs text-slate-500 font-medium">{foods.length} Makanan Siap Selamatkan</span>
        </div>

        <FoodGrid
          foods={foods}
          onClaim={handleClaim}
          onDetail={(id) => {
            const item = foods.find((f) => f.id === id);
            if (item) {
              setSelectedFood(item);
              setIsModalOpen(true);
            }
          }}
        />
      </section>

      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          food={selectedFood}
          onClaim={handleClaim}
        />
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
