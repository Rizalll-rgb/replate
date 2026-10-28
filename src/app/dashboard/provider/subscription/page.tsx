'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ShieldCheck,
  Sparkles,
  FileText,
  Megaphone,
  Check,
  Building,
  Store,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  Clock,
  ExternalLink,
  QrCode,
  DollarSign,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { QRCodeSVG } from 'qrcode.react';

interface ActiveSubscription {
  planId: 'FREE' | 'BUSINESS' | 'GROWTH';
  planName: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE';
  bannersRemaining: number;
  discountUsed: boolean;
}

export default function ProviderSubscriptionPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [activeSub, setActiveSub] = useState<ActiveSubscription>({
    planId: 'FREE',
    planName: 'Core Platform (Gratis)',
    price: 0,
    startDate: new Date().toISOString(),
    endDate: 'Selamanya',
    status: 'ACTIVE',
    bannersRemaining: 0,
    discountUsed: false,
  });

  const [selectedPlanModal, setSelectedPlanModal] = useState<{
    isOpen: boolean;
    planId: 'BUSINESS' | 'GROWTH' | null;
    name: string;
    price: number;
  }>({
    isOpen: false,
    planId: null,
    name: '',
    price: 0,
  });

  const [payPerUseModal, setPayPerUseModal] = useState<{
    isOpen: boolean;
    serviceType: 'REPORT' | 'BANNER' | null;
    title: string;
    price: number;
  }>({
    isOpen: false,
    serviceType: null,
    title: '',
    price: 0,
  });

  const [bannerForm, setBannerForm] = useState({
    title: '',
    linkUrl: '',
    category: 'BAKERY_PROMO',
    startDate: '',
    imageUrl: '',
  });

  const [reportPeriod, setReportPeriod] = useState({
    startMonth: 'Agustus 2026',
    endMonth: 'Oktober 2026',
  });

  const [actionLoader, setActionLoader] = useState<{
    isOpen: boolean;
    message: string;
    submessage?: string;
  }>({
    isOpen: false,
    message: '',
  });

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Load existing subscription from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('replate_provider_subscription');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status === 'ACTIVE') {
          setActiveSub(parsed);
        }
      }
    } catch (_) {}
  }, []);

  const handleSubscribe = (planId: 'BUSINESS' | 'GROWTH', name: string, price: number) => {
    setSelectedPlanModal({
      isOpen: true,
      planId,
      name,
      price,
    });
  };

  const confirmSubscription = () => {
    if (!selectedPlanModal.planId) return;

    setActionLoader({
      isOpen: true,
      message: `Mengaktifkan Paket ${selectedPlanModal.name}...`,
      submessage: 'Memverifikasi status akun dan sinkronisasi Verified Business Badge',
    });

    setTimeout(() => {
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

      const newSub: ActiveSubscription = {
        planId: selectedPlanModal.planId as 'BUSINESS' | 'GROWTH',
        planName: selectedPlanModal.name,
        price: selectedPlanModal.price,
        startDate: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        endDate: nextMonth.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'ACTIVE',
        bannersRemaining: selectedPlanModal.planId === 'GROWTH' ? 3 : 2,
        discountUsed: false,
      };

      localStorage.setItem('replate_provider_subscription', JSON.stringify(newSub));
      localStorage.setItem('replate_verified_business', 'true');
      try {
        const p = localStorage.getItem('replate_onboarding_profile');
        if (p) {
          const parsed = JSON.parse(p);
          parsed.verified = true;
          parsed.verifiedBadge = true;
          parsed.subscriptionTier = selectedPlanModal.planId;
          localStorage.setItem('replate_onboarding_profile', JSON.stringify(parsed));
        }
      } catch (_) {}
      setActiveSub(newSub);

      setActionLoader({ isOpen: false, message: '' });
      setSelectedPlanModal({ isOpen: false, planId: null, name: '', price: 0 });

      setToastState({
        isOpen: true,
        message: `Selamat! Paket ${newSub.planName} aktif. Verified Business Badge kini tampil di profil dan seluruh listing Anda!`,
        type: 'success',
      });
    }, 1200);
  };

  const handleBuyPayPerUse = (type: 'REPORT' | 'BANNER') => {
    const isDiscountEligible = activeSub.planId !== 'FREE' && !activeSub.discountUsed;
    const discountPct = activeSub.planId === 'GROWTH' ? 0.3 : activeSub.planId === 'BUSINESS' ? 0.2 : 0;

    let basePrice = type === 'REPORT' ? 25000 : 70000;
    let finalPrice = isDiscountEligible ? Math.round(basePrice * (1 - discountPct)) : basePrice;

    setPayPerUseModal({
      isOpen: true,
      serviceType: type,
      title: type === 'REPORT' ? 'Unduh Impact Report Resmi (CSR & ESG)' : 'Slot Banner Promosi (7 Hari)',
      price: finalPrice,
    });
  };

  const confirmPayPerUse = () => {
    setActionLoader({
      isOpen: true,
      message: 'Memproses Layanan...',
      submessage: 'Penerbitan faktur dan aktivasi hak layanan pay-per-use',
    });

    setTimeout(() => {
      setActionLoader({ isOpen: false, message: '' });

      if (payPerUseModal.serviceType === 'REPORT') {
        setPayPerUseModal({ isOpen: false, serviceType: null, title: '', price: 0 });
        setToastState({
          isOpen: true,
          message: 'Layanan Impact Report aktif! Mengarahkan Anda ke modul cetak laporan...',
          type: 'success',
        });
        setTimeout(() => {
          router.push('/dashboard/provider/impact?tab=csr');
        }, 1200);
      } else {
        setPayPerUseModal({ isOpen: false, serviceType: null, title: '', price: 0 });
        setToastState({
          isOpen: true,
          message: 'Banner promosi berhasil diajukan! Tayang selama 7 hari di beranda & katalog.',
          type: 'success',
        });
      }
    }, 1000);
  };

  return (
    <>
      <SuperAppLoader isOpen={actionLoader.isOpen} message={actionLoader.message} submessage={actionLoader.submessage} />

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="space-y-8 max-w-6xl mx-auto pb-24">
        {/* Header Section */}
        <div className="border-b border-slate-200 pb-5 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#1B3A5C] text-[#D4A843] text-[10px] font-black rounded-lg uppercase tracking-wider">
              Monetisasi & Model Bisnis REPLATE
            </span>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase">
              Core Platform Gratis
            </span>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-lg uppercase">
              Pay-per-use & Subscription
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B3A5C]">
            Paket Layanan & Langganan Provider
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
            Tingkatkan reputasi sustainability bisnis kuliner Anda dengan Verified Business Badge, ekspor laporan dampak tak terbatas untuk kebutuhan CSR/ESG, dan slot promosi banner ke ribuan konsumen.
          </p>
        </div>

        {/* Current Active Plan Status Banner */}
        <div className={`p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
          activeSub.planId !== 'FREE'
            ? 'bg-gradient-to-r from-blue-900 via-[#1B3A5C] to-slate-900 text-white border-blue-400/40'
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Status Paket Saat Ini
              </span>
              {activeSub.planId !== 'FREE' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED BUSINESS
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  GRATIS SELAMANYA
                </span>
              )}
            </div>
            <h3 className={`text-xl font-black ${activeSub.planId !== 'FREE' ? 'text-[#D4A843]' : 'text-[#1B3A5C]'}`}>
              {activeSub.planName}
            </h3>
            <p className={`text-xs ${activeSub.planId !== 'FREE' ? 'text-slate-200' : 'text-slate-500'}`}>
              {activeSub.planId === 'FREE'
                ? 'Anda menikmati seluruh fitur dasar platform gratis: upload surplus, smart matching, dan kelola pesanan.'
                : `Aktif sampai ${activeSub.endDate} • Tersedia ${activeSub.bannersRemaining}x slot banner promosi gratis.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeSub.planId === 'FREE' ? (
              <button
                type="button"
                onClick={() => handleSubscribe('BUSINESS', 'Replate Business', 179000)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#D4A843] to-[#B8902E] text-slate-950 font-black text-xs rounded-xl shadow-md hover:brightness-105 transition-all cursor-pointer"
              >
                Upgrade ke Business
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-black">
                Langganan Aktif
              </span>
            )}
          </div>
        </div>

        {/* 3 Tier Subscription Comparison Cards */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-[#1B3A5C]">Pilihan Paket Berlangganan Rutin</h2>
            <p className="text-xs text-slate-500 font-medium">
              Bayar rutin bulanan untuk benefit bisnis yang berkelanjutan dan branding CSR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Core Platform (Free) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                    Membangun Ekosistem
                  </span>
                  <h3 className="text-lg font-black text-[#1B3A5C]">Core Platform</h3>
                  <p className="text-xs text-slate-500">
                    Akses penuh fitur operasional rescue tanpa biaya bulanan.
                  </p>
                </div>

                <div className="border-y border-slate-100 py-3">
                  <span className="text-3xl font-black text-slate-900">Gratis</span>
                  <span className="text-xs text-slate-400 font-bold block">Selamanya (Rp 0/bulan)</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Daftar akun & profil toko</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Upload surplus pangan tanpa batas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Smart Matching otomatis ke radius sekitar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Melihat dan mengelola transaksi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Live Tracking status surplus / transaksi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Menerima pesanan mandiri & kurir</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled
                className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl cursor-default border border-slate-200"
              >
                {activeSub.planId === 'FREE' ? 'Paket Aktif Saat Ini' : 'Tersedia Default'}
              </button>
            </div>

            {/* 2. Replate Business (Rp 179.000) */}
            <div className="bg-white rounded-3xl border-2 border-[#1B3A5C] p-6 flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#1B3A5C] text-[#D4A843] text-[9.5px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                POPULER
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                    Brand & Sustainability
                  </span>
                  <h3 className="text-lg font-black text-[#1B3A5C]">Replate Business</h3>
                  <p className="text-xs text-slate-500">
                    Sangat cocok untuk resto & bakery yang butuh validasi CSR resmi.
                  </p>
                </div>

                <div className="border-y border-slate-100 py-3">
                  <span className="text-3xl font-black text-[#1B3A5C]">Rp 179.000</span>
                  <span className="text-xs text-slate-500 font-bold block">per bulan (Langganan)</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2 font-bold text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Verified Business Badge (Lencana Terpercaya)</span>
                  </li>
                  <li className="flex items-start gap-2 font-bold text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Request Impact Report Bebas Periode (Custom Bulan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Megaphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Banner Promosi 2 Banner / 2 kali sebulan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Percent className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Diskon 20% pembelian layanan pay-per-use (1x)</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-500">
                    <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Termasuk semua fitur Core Platform</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSubscribe('BUSINESS', 'Replate Business', 179000)}
                disabled={activeSub.planId === 'BUSINESS'}
                className={`w-full py-2.5 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer ${
                  activeSub.planId === 'BUSINESS'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-[#1B3A5C] hover:bg-[#244b75] text-[#D4A843]'
                }`}
              >
                {activeSub.planId === 'BUSINESS' ? 'Paket Sedang Aktif' : 'Pilih Replate Business'}
              </button>
            </div>

            {/* 3. Replate Growth (Rp 259.000) */}
            <div className="bg-gradient-to-b from-amber-50/60 to-white rounded-3xl border-2 border-amber-400 p-6 flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#D4A843] text-slate-950 text-[9.5px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                MULTI-OUTLET
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                    Skala Besar & Franchise
                  </span>
                  <h3 className="text-lg font-black text-amber-950">Replate Growth</h3>
                  <p className="text-xs text-slate-600">
                    Kelola surplus dari banyak cabang sekaligus dalam 1 akun terpusat.
                  </p>
                </div>

                <div className="border-y border-amber-200/60 py-3">
                  <span className="text-3xl font-black text-slate-950">Rp 259.000</span>
                  <span className="text-xs text-slate-500 font-bold block">per bulan (Langganan)</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
                  <li className="flex items-start gap-2 font-black text-[#1B3A5C]">
                    <Building className="w-4 h-4 text-[#1B3A5C] shrink-0 mt-0.5" />
                    <span>Multi-Outlet Management (Kelola Banyak Cabang)</span>
                  </li>
                  <li className="flex items-start gap-2 font-bold text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Verified Business Badge Prioritas</span>
                  </li>
                  <li className="flex items-start gap-2 font-bold text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Request Impact Report Bebas Periode (Multi-cabang)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Megaphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Banner Promosi 3 Banner / 3 kali sebulan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Percent className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Diskon 30% pembelian layanan pay-per-use (1x)</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSubscribe('GROWTH', 'Replate Growth', 259000)}
                disabled={activeSub.planId === 'GROWTH'}
                className={`w-full py-2.5 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer ${
                  activeSub.planId === 'GROWTH'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-gradient-to-r from-[#D4A843] to-[#B8902E] text-slate-950 hover:brightness-105'
                }`}
              >
                {activeSub.planId === 'GROWTH' ? 'Paket Sedang Aktif' : 'Pilih Replate Growth'}
              </button>
            </div>
          </div>
        </div>

        {/* Pay-Per-Use Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1B3A5C]">Layanan Tambahan (Pay-Per-Use)</h2>
              <p className="text-xs text-slate-500 font-medium">
                Ditujukan untuk provider yang tidak membutuhkan layanan tambahan secara rutin. Bayar hanya saat membutuhkan layanan.
              </p>
            </div>
            <Link
              href="/dashboard/provider/services"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B3A5C] text-[#D4A843] text-xs font-black rounded-xl hover:bg-[#142C47] transition-colors shrink-0 shadow-xs"
            >
              Buka Form Pay-Per-Use Lengkap
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pay per use 1: Impact Report */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:border-[#1B3A5C]/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#1B3A5C]">Rp 25.000</span>
                  <span className="text-[10px] text-slate-400 block font-bold">per report unduhan</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Impact Report Resmi (CSR &amp; Sustainability)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Laporan komprehensif satu bulan aktivitas yang siap cetak/unduh. Bukti konkret kontribusi CSR, sustainability, evaluasi internal, atau komunikasi perusahaan.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-700">
                <span className="font-bold text-[11px] text-slate-900 block">Isi Dokumen Laporan:</span>
                <p>• Total makanan berhasil disalurkan &amp; jumlah rescue</p>
                <p>• Breakdown surplus berdasarkan jenis &amp; periode aktivitas</p>
                <p>• Jumlah penerima manfaat/konsumen &amp; estimasi CO2 terselamatkan</p>
              </div>

              <button
                type="button"
                onClick={() => handleBuyPayPerUse('REPORT')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Unduh Impact Report Bulan Ini (Rp 25.000)
              </button>
            </div>

            {/* Pay per use 2: Banner Promotion */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:border-[#1B3A5C]/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#1B3A5C]">Rp 70.000</span>
                  <span className="text-[10px] text-slate-400 block font-bold">periode tayang 7 hari</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Banner Promosi Toko (Brand Exposure)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pasang banner promosi di area teratas (homepage &amp; explore) di REPLATE untuk memperkenalkan produk, campaign bakery, atau promo weekend.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-700">
                <span className="font-bold text-[11px] text-slate-900 block">Benefit Bisnis:</span>
                <p>• Brand exposure ke ribuan pengguna aktif REPLATE</p>
                <p>• Mengarahkan pengguna langsung ke profil &amp; produk outlet</p>
                <p>• Campaign khusus: promo bakery, launching produk, sustainability</p>
              </div>

              <button
                type="button"
                onClick={() => handleBuyPayPerUse('BANNER')}
                className="w-full py-2.5 bg-[#1B3A5C] hover:bg-[#142C47] text-[#D4A843] font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Pasang Banner Promosi (Rp 70.000 / 7 Hari)
              </button>
            </div>
          </div>
        </div>

        {/* Platform Revenue Breakdown & Transparency Note */}
        <div className="p-6 bg-slate-100/80 rounded-3xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#1B3A5C]" />
            <h3 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider">
              Struktur Bagi Hasil &amp; Ekosistem Transaksi REPLATE
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
              <strong className="block text-slate-900 font-extrabold">1. Biaya Admin Platform (10%)</strong>
              <p className="text-slate-600 text-[11px]">
                Dibayar oleh provider hanya atas transaksi surplus berbayar (komersial). Donasi panti &amp; rescue 0% komisi.
              </p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
              <strong className="block text-slate-900 font-extrabold">2. Biaya Layanan Konsumen (Rp 2.000)</strong>
              <p className="text-slate-600 text-[11px]">
                Dikenakan per transaksi untuk pemeliharaan server &amp; verifikasi higienitas BPOM. Gratis untuk penyaluran via relawan Food Rescue.
              </p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
              <strong className="block text-slate-900 font-extrabold">3. Ongkir Rp 2.000/km (100% Driver)</strong>
              <p className="text-slate-600 text-[11px]">
                REPLATE 0% margin ongkir; 100% biaya pengantaran dialokasikan kepada driver toko atau kurir relawan yang bertugas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI LANGGANAN */}
      <Modal
        isOpen={selectedPlanModal.isOpen}
        onClose={() => setSelectedPlanModal({ isOpen: false, planId: null, name: '', price: 0 })}
        title={`Konfirmasi Checkout Langganan ${selectedPlanModal.name}`}
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-200 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-extrabold text-[#1B3A5C]">{selectedPlanModal.name}</span>
              <span className="font-black text-slate-900">Rp {selectedPlanModal.price.toLocaleString('id-ID')} / bulan</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Paket langganan aktif selama 30 hari kalender. Verified Business Badge, kuota banner, dan hak akses fitur akan langsung aktif di profil toko Anda.
            </p>
          </div>

          {/* Real QRIS Dynamic Barcode */}
          <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="font-black text-sm tracking-widest text-[#1B3A5C]">QRIS</span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase">National Standard</span>
            </div>

            <div className="w-40 h-40 mx-auto rounded-xl overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center">
              <QRCodeSVG
                value={`00020101021226580016ID.CO.REPLATE.WWW0118RPL-SUB-2026-889152045812530336054${selectedPlanModal.price}5802ID59REPLATE INDONESIA6008SURABAYA62070703A016304`}
                size={150}
                level="M"
                includeMargin={true}
              />
            </div>

            <p className="text-[10px] text-slate-500 font-medium">
              Scan barcode di atas menggunakan GoPay, OVO, DANA, ShopeePay, BCA, atau m-Banking manapun.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={confirmSubscription}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simulasi Bayar Otomatis (Demo Kilat)</span>
            </button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-bold"
                onClick={() => setSelectedPlanModal({ isOpen: false, planId: null, name: '', price: 0 })}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 font-black bg-[#1B3A5C] text-[#D4A843]"
                onClick={confirmSubscription}
              >
                Konfirmasi &amp; Bayar (Rp {selectedPlanModal.price.toLocaleString('id-ID')})
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL PAY-PER-USE */}
      <Modal
        isOpen={payPerUseModal.isOpen}
        onClose={() => setPayPerUseModal({ isOpen: false, serviceType: null, title: '', price: 0 })}
        title={payPerUseModal.title}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-emerald-950">{payPerUseModal.title}</span>
              <span className="font-black text-emerald-900 text-sm">Rp {payPerUseModal.price.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Layanan pay-per-use bayar satu kali tanpa komitmen rutin bulanan.
            </p>
          </div>

          {payPerUseModal.serviceType === 'BANNER' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Judul Campaign Promosi:</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="Misal: Promo Weekend Roti Diskon 70%"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Kategori Banner:</label>
                <select
                  value={bannerForm.category}
                  onChange={(e) => setBannerForm({ ...bannerForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                >
                  <option value="BAKERY_PROMO">Promo Bakery &amp; Pastry</option>
                  <option value="LAUNCHING">Launching Produk Baru</option>
                  <option value="WEEKEND_SPECIAL">Promo Weekend Spesial</option>
                  <option value="SUSTAINABILITY">Campaign Sustainability / CSR</option>
                </select>
              </div>
            </div>
          )}

          {payPerUseModal.serviceType === 'REPORT' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
              <p>• Format: PDF &amp; Analitik Digital Siap Cetak (A4 Standard)</p>
              <p>• Mencakup metriks emisi karbon, porsi terselamatkan, dan profil penerima manfaat.</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-bold"
              onClick={() => setPayPerUseModal({ isOpen: false, serviceType: null, title: '', price: 0 })}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1 font-black bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={confirmPayPerUse}
            >
              Lanjut Bayar (Rp {payPerUseModal.price.toLocaleString('id-ID')})
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
