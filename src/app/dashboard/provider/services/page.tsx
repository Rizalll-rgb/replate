'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FileText,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  QrCode,
  Download,
  AlertCircle,
  ExternalLink,
  Tag,
  DollarSign,
  Leaf,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { QRCodeSVG } from 'qrcode.react';

interface ActiveSubInfo {
  planId: 'FREE' | 'BUSINESS' | 'GROWTH';
  planName: string;
  price: number;
  bannerQuotaRemaining: number;
  discountPercent: number;
  verifiedBadge: boolean;
}

interface PurchasedReport {
  id: string;
  invoiceNo: string;
  month: string;
  year: string;
  pricePaid: number;
  purchasedAt: string;
  weightKg: number;
  co2SavedKg: number;
  waterSavedL: number;
  beneficiariesCount: number;
  status: 'PAID' | 'VERIFIED';
}

interface PromoBannerItem {
  id: string;
  title: string;
  linkUrl: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  pricePaid: number;
  status: 'MENUNGGU_MODERASI_ADMIN' | 'AKTIF_TAYANG' | 'SELESAI';
  impressions: number;
  clicks: number;
}

const PRESET_BANNER_IMAGES = [
  {
    label: 'Bakery & Pastry Special',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Resto & Prasmanan Buffet',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Specialty Healthy Meal',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Weekend Flash Sale Surplus',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80',
  },
];

export default function ProviderServicesPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [activeSub, setActiveSub] = useState<ActiveSubInfo>({
    planId: 'FREE',
    planName: 'Core Platform (Gratis)',
    price: 0,
    bannerQuotaRemaining: 0,
    discountPercent: 0,
    verifiedBadge: false,
  });

  const [providerName, setProviderName] = useState<string>('Warung Bakso Pak Kumis');

  // Load active subscription and provider name
  useEffect(() => {
    try {
      const savedSub = localStorage.getItem('replate_provider_subscription');
      if (savedSub) {
        const parsed = JSON.parse(savedSub);
        if (parsed.status === 'ACTIVE') {
          setActiveSub({
            planId: parsed.planId || 'FREE',
            planName: parsed.planName || 'Core Platform',
            price: parsed.price || 0,
            bannerQuotaRemaining: parsed.bannerQuotaRemaining ?? (parsed.planId === 'GROWTH' ? 3 : parsed.planId === 'BUSINESS' ? 2 : 0),
            discountPercent: parsed.planId === 'GROWTH' ? 30 : parsed.planId === 'BUSINESS' ? 20 : 0,
            verifiedBadge: parsed.planId !== 'FREE',
          });
        }
      }

      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.organizationName || parsed.name) {
          setProviderName(parsed.organizationName || parsed.name);
        }
      }
    } catch (_) {}
  }, []);

  // Pay-Per-Use State: Impact Report
  const [reportMonth, setReportMonth] = useState('Oktober');
  const [reportYear, setReportYear] = useState('2026');
  const [reportInvoiceModal, setReportInvoiceModal] = useState<boolean>(false);
  const [generatedReportPreview, setGeneratedReportPreview] = useState<PurchasedReport | null>(null);

  // Pay-Per-Use State: Banner Promotion
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('/dashboard/explore');
  const [bannerImageUrl, setBannerImageUrl] = useState(PRESET_BANNER_IMAGES[0].url);
  const [bannerStartDate, setBannerStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [bannerInvoiceModal, setBannerInvoiceModal] = useState<boolean>(false);

  // Stored historical items
  const [purchasedReports, setPurchasedReports] = useState<PurchasedReport[]>([]);
  const [myBanners, setMyBanners] = useState<PromoBannerItem[]>([]);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
  });

  // Load existing reports & banners from localStorage
  useEffect(() => {
    try {
      const savedReports = localStorage.getItem('replate_purchased_reports');
      if (savedReports) {
        setPurchasedReports(JSON.parse(savedReports));
      } else {
        const defaultReports: PurchasedReport[] = [
          {
            id: 'RPT-2026-09',
            invoiceNo: 'INV-RPL-RPT-2026-8812',
            month: 'September',
            year: '2026',
            pricePaid: 25000,
            purchasedAt: '30 Sep 2026',
            weightKg: 52.4,
            co2SavedKg: 131.0,
            waterSavedL: 26200,
            beneficiariesCount: 48,
            status: 'VERIFIED',
          },
        ];
        setPurchasedReports(defaultReports);
        localStorage.setItem('replate_purchased_reports', JSON.stringify(defaultReports));
      }

      const savedBanners = localStorage.getItem('replate_provider_banners');
      if (savedBanners) {
        setMyBanners(JSON.parse(savedBanners));
      } else {
        const defaultBanners: PromoBannerItem[] = [
          {
            id: 'BNR-2026-001',
            title: 'Promo Spesial Weekend Roti Bakar & Pastry 70%',
            linkUrl: '/dashboard/explore',
            imageUrl: PRESET_BANNER_IMAGES[0].url,
            startDate: '2026-10-20',
            endDate: '2026-10-27',
            pricePaid: 70000,
            status: 'AKTIF_TAYANG',
            impressions: 1420,
            clicks: 186,
          },
        ];
        setMyBanners(defaultBanners);
        localStorage.setItem('replate_provider_banners', JSON.stringify(defaultBanners));
      }
    } catch (_) {}
  }, []);

  // Perhitungan Biaya Impact Report
  const isSubscriberFreeReport = activeSub.planId !== 'FREE'; // Business & Growth get unlimited free impact reports
  const baseReportPrice = 25000;
  const reportDiscountAmt = isSubscriberFreeReport ? baseReportPrice : 0;
  const finalReportPrice = isSubscriberFreeReport ? 0 : baseReportPrice;

  // Perhitungan Biaya Banner
  const hasBannerQuota = activeSub.bannerQuotaRemaining > 0;
  const baseBannerPrice = 70000;
  const bannerDiscountPct = activeSub.discountPercent;
  const bannerDiscountAmt = hasBannerQuota
    ? baseBannerPrice
    : Math.round(baseBannerPrice * (bannerDiscountPct / 100));
  const finalBannerPrice = hasBannerQuota ? 0 : baseBannerPrice - bannerDiscountAmt;

  // Handlers for Impact Report
  const handleOpenReportInvoice = () => {
    setReportInvoiceModal(true);
  };

  const handlePayAndGenerateReport = () => {
    setReportInvoiceModal(false);
    setActionLoader({
      isOpen: true,
      message: 'Menerbitkan Dokumen Laporan CSR...',
      submessage: 'Kompilasi analitik emisi CO2 & penandatanganan sertifikat dampak',
    });

    setTimeout(() => {
      const invNo = `INV-RPL-RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const weight = Math.round((35 + Math.random() * 25) * 10) / 10;
      const co2 = Math.round(weight * 2.5 * 10) / 10;
      const water = Math.round(weight * 500);
      const beneficiaries = Math.floor(weight * 2.5);

      const newReport: PurchasedReport = {
        id: `RPT-2026-${Date.now().toString().slice(-4)}`,
        invoiceNo: invNo,
        month: reportMonth,
        year: reportYear,
        pricePaid: finalReportPrice,
        purchasedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        weightKg: weight,
        co2SavedKg: co2,
        waterSavedL: water,
        beneficiariesCount: beneficiaries,
        status: 'VERIFIED',
      };

      const updated = [newReport, ...purchasedReports];
      setPurchasedReports(updated);
      setGeneratedReportPreview(newReport);
      localStorage.setItem('replate_purchased_reports', JSON.stringify(updated));

      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: `Impact Report Resmi periode ${reportMonth} ${reportYear} berhasil diterbitkan dan siap diunduh!`,
        type: 'success',
      });
    }, 1200);
  };

  // Handlers for Promotional Banner
  const handleOpenBannerInvoice = () => {
    if (!bannerTitle.trim()) {
      setToastState({
        isOpen: true,
        message: 'Mohon masukkan judul campaign promosi banner Anda terlebih dahulu.',
        type: 'error',
      });
      return;
    }
    setBannerInvoiceModal(true);
  };

  const handlePayAndSubmitBanner = () => {
    setBannerInvoiceModal(false);
    setActionLoader({
      isOpen: true,
      message: 'Mengunggah & Mendaftarkan Banner...',
      submessage: 'Memasukkan ke antrean moderasi kurasi konten admin',
    });

    setTimeout(() => {
      const start = new Date(bannerStartDate);
      const end = new Date(start.getTime() + 7 * 24 * 3600 * 1000);

      const newBanner: PromoBannerItem = {
        id: `BNR-${Date.now().toString().slice(-5)}`,
        title: bannerTitle,
        linkUrl: bannerLinkUrl || '/dashboard/explore',
        imageUrl: bannerImageUrl,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        pricePaid: finalBannerPrice,
        status: 'MENUNGGU_MODERASI_ADMIN',
        impressions: 0,
        clicks: 0,
      };

      const updated = [newBanner, ...myBanners];
      setMyBanners(updated);
      localStorage.setItem('replate_provider_banners', JSON.stringify(updated));

      // Deduct quota if used
      if (hasBannerQuota) {
        const newQuota = Math.max(0, activeSub.bannerQuotaRemaining - 1);
        const updatedSub = { ...activeSub, bannerQuotaRemaining: newQuota };
        setActiveSub(updatedSub);
        try {
          const rawSub = localStorage.getItem('replate_provider_subscription');
          if (rawSub) {
            const pSub = JSON.parse(rawSub);
            pSub.bannerQuotaRemaining = newQuota;
            localStorage.setItem('replate_provider_subscription', JSON.stringify(pSub));
          }
        } catch (_) {}
      }

      setBannerTitle('');
      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Banner promosi berhasil diajukan! Menunggu review moderasi admin (estimasi < 2 jam).',
        type: 'success',
      });
    }, 1200);
  };

  // Demo helper: Approve Banner Moderation instantly
  const handleSimulateApproveBanner = (id: string) => {
    const updated = myBanners.map((b) =>
      b.id === id ? { ...b, status: 'AKTIF_TAYANG' as const } : b
    );
    setMyBanners(updated);
    localStorage.setItem('replate_provider_banners', JSON.stringify(updated));

    // Also sync to active public promo banners
    try {
      const activeOnly = updated.filter((b) => b.status === 'AKTIF_TAYANG');
      localStorage.setItem('replate_active_promo_banners', JSON.stringify(activeOnly));
    } catch (_) {}

    setToastState({
      isOpen: true,
      message: `Moderasi Admin Disetujui! Banner "${id}" sekarang aktif tayang di slot teratas beranda & katalog.`,
      type: 'success',
    });
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

      <div className="space-y-8 max-w-6xl mx-auto pb-28">
        {/* Navigation & Header */}
        <div className="border-b border-slate-200 pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#1B3A5C] text-[#D4A843] text-[10px] font-black rounded-lg uppercase tracking-wider">
                Model Bisnis &amp; Monetisasi REPLATE
              </span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase">
                Pay-Per-Use On Demand
              </span>
            </div>

            {/* Switcher to Subscription Hub */}
            <Link
              href="/dashboard/provider/subscription"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-[#1B3A5C] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
              Lihat Paket Langganan Rutin (Subscription)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1B3A5C]">
            Layanan Bisnis Pay-Per-Use Provider
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
            Akses fleksibel tanpa komitmen bulanan. Beli laporan dampak lingkungan resmi (CSR/ESG) atau pasang slot banner promosi untuk mendongkrak penjualan surplus outlet Anda.
          </p>
        </div>

        {/* Status Paket & Benefit Diskon Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#1B3A5C] to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider">
                Status Paket Langganan
              </span>
              {activeSub.verifiedBadge ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED BUSINESS
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[9px] font-black">
                  CORE PLATFORM (FREE)
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-white">{activeSub.planName}</h3>
            <p className="text-xs text-slate-300 font-medium">
              {activeSub.planId === 'FREE'
                ? 'Upgrade ke Replate Business/Growth untuk menikmati diskon 20-30% serta kuota banner gratis!'
                : `Benefit aktif: Diskon ${activeSub.discountPercent}% Pay-per-Use • Sisa ${activeSub.bannerQuotaRemaining}x Kuota Banner Gratis • Impact Report Bebas Biaya`}
            </p>
          </div>

          {activeSub.planId === 'FREE' && (
            <Link
              href="/dashboard/provider/subscription"
              className="shrink-0 px-4 py-2 bg-gradient-to-r from-[#D4A843] to-[#B8902E] text-slate-950 font-black text-xs rounded-xl shadow-sm hover:brightness-105 transition-all"
            >
              Upgrade Paket Mulai Rp 179rb
            </Link>
          )}
        </div>

        {/* 2 Layanan Pay-Per-Use Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ========================================================= */}
          {/* 1. BELI IMPACT REPORT (Rp 25.000 / REPORT) */}
          {/* ========================================================= */}
          <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-right">
                  {isSubscriberFreeReport ? (
                    <>
                      <span className="text-xl font-black text-emerald-700">GRATIS</span>
                      <span className="text-[10px] text-slate-400 block font-bold line-through">Rp 25.000</span>
                      <span className="text-[9.5px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-black">
                        Benefit Subscriber
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-[#1B3A5C]">Rp 25.000</span>
                      <span className="text-[10px] text-slate-500 block font-bold">per report unduhan</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase">
                  Layanan 1: On-Demand Report
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Beli Impact Report Resmi (CSR &amp; ESG)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                  Dapatkan laporan resmi berlogo Replate untuk periode pilihan Anda. Digunakan untuk pelaporan CSR, evaluasi audit sustainability ISO 14001/ESG, dan rilis media pers.
                </p>
              </div>

              {/* Form Pemilihan Bulan & Tahun */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-black text-slate-800 block">Pilih Periode Pelaporan:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Bulan:</label>
                    <select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tahun:</label>
                    <select
                      value={reportYear}
                      onChange={(e) => setReportYear(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="2026">2026 (Tahun Berjalan)</option>
                      <option value="2025">2025 (Arsip Tahunan)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200">
                  <p className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Format Laporan Resmi Berlogo Replate &amp; Kode Verifikasi QR
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Sesuai Standar SDG 2 (Zero Hunger) &amp; SDG 13 (Climate Action)
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={handleOpenReportInvoice}
                className="w-full font-black text-xs py-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                {isSubscriberFreeReport
                  ? `Terbitkan Report ${reportMonth} ${reportYear} (Gratis Rp 0)`
                  : `Beli Impact Report (${reportMonth} ${reportYear} • Rp 25.000)`}
              </Button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. PASANG BANNER PROMOSI (Rp 70.000 / 7 HARI) */}
          {/* ========================================================= */}
          <div className="bg-white rounded-3xl border-2 border-amber-500/30 p-6 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="text-right">
                  {hasBannerQuota ? (
                    <>
                      <span className="text-xl font-black text-amber-700">GRATIS</span>
                      <span className="text-[10px] text-slate-400 block font-bold line-through">Rp 70.000</span>
                      <span className="text-[9.5px] text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-black">
                        Pakai Jatah Kuota ({activeSub.bannerQuotaRemaining}x Sisa)
                      </span>
                    </>
                  ) : bannerDiscountPct > 0 ? (
                    <>
                      <span className="text-2xl font-black text-[#1B3A5C]">Rp {finalBannerPrice.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-slate-400 block font-bold line-through">Rp 70.000</span>
                      <span className="text-[9.5px] text-purple-900 bg-purple-100 px-1.5 py-0.2 rounded font-black">
                        Diskon {bannerDiscountPct}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-[#1B3A5C]">Rp 70.000</span>
                      <span className="text-[10px] text-slate-500 block font-bold">periode tayang 7 hari</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded uppercase">
                  Layanan 2: Spot Promosi Unggulan
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Pasang Banner Promosi (Brand Exposure)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                  Tampilkan banner promosi di bagian paling atas (carousel hero) pada halaman Explore dan Homepage untuk ribuan konsumen aktif Replate di area Anda.
                </p>
              </div>

              {/* Form Input Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Judul Campaign Promosi:
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="Contoh: Diskon 70% Aneka Pastry & Roti Sore Ini"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Link URL (Toko / Menu Makanan):
                  </label>
                  <input
                    type="text"
                    value={bannerLinkUrl}
                    onChange={(e) => setBannerLinkUrl(e.target.value)}
                    placeholder="Contoh: /dashboard/explore atau link produk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pilih Desain Banner (Preset / Foto Katering):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_BANNER_IMAGES.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setBannerImageUrl(preset.url)}
                        className={`cursor-pointer rounded-xl overflow-hidden border-2 p-1 text-[10px] font-bold transition-all ${
                          bannerImageUrl === preset.url
                            ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-12 w-full rounded-lg overflow-hidden bg-slate-100 mb-1">
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        </div>
                        <span className="truncate block">{preset.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tanggal Mulai Tayang (Aktif 7 Hari):
                  </label>
                  <input
                    type="date"
                    value={bannerStartDate}
                    onChange={(e) => setBannerStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="gold"
                onClick={handleOpenBannerInvoice}
                className="w-full font-black text-xs py-3 text-slate-950 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                {hasBannerQuota
                  ? 'Pasang Banner (Gunakan 1x Kuota Langganan)'
                  : `Lanjut Pembayaran Banner (Rp ${finalBannerPrice.toLocaleString('id-ID')})`}
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PREVIEW HASIL GENERATE LAPORAN CSR RESMI */}
        {/* ========================================================= */}
        {generatedReportPreview && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-500 space-y-4 shadow-md animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded uppercase">
                  Preview Ringkasan CSR Resmi Terverifikasi
                </span>
                <h3 className="text-xl font-black text-emerald-950">
                  Laporan Dampak Lingkungan ({generatedReportPreview.month} {generatedReportPreview.year})
                </h3>
                <p className="text-xs text-emerald-800">
                  {providerName} • Invoice: {generatedReportPreview.invoiceNo} • Status: Terverifikasi Digital
                </p>
              </div>

              <Link
                href="/dashboard/provider/impact?tab=csr"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Buka &amp; Cetak PDF Lengkap
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[10.5px] font-bold text-slate-500 block">Pangan Terselamatkan</span>
                <strong className="text-xl font-black text-emerald-700 font-mono">{generatedReportPreview.weightKg} Kg</strong>
                <span className="text-[10px] text-slate-400 font-medium block">~{Math.round(generatedReportPreview.weightKg * 2.5)} porsi</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[10.5px] font-bold text-slate-500 block">Reduksi Emisi GRK</span>
                <strong className="text-xl font-black text-teal-700 font-mono">{generatedReportPreview.co2SavedKg} Kg CO2e</strong>
                <span className="text-[10px] text-slate-400 font-medium block">SDG 13 Climate Action</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[10.5px] font-bold text-slate-500 block">Air Bersih Dihemat</span>
                <strong className="text-xl font-black text-blue-700 font-mono">{generatedReportPreview.waterSavedL.toLocaleString('id-ID')} Liter</strong>
                <span className="text-[10px] text-slate-400 font-medium block">Virtual Water Footprint</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[10.5px] font-bold text-slate-500 block">Penerima Manfaat</span>
                <strong className="text-xl font-black text-amber-700 font-mono">{generatedReportPreview.beneficiariesCount} Jiwa</strong>
                <span className="text-[10px] text-slate-400 font-medium block">Panti Asuhan &amp; Komunitas</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* RIWAYAT PENGELOLAAN BANNER PROMOSI & STATUS MODERASI */}
        {/* ========================================================= */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#1B3A5C]">Riwayat &amp; Status Banner Promosi</h2>
              <p className="text-xs text-slate-500 font-medium">
                Pantau proses review moderasi admin dan performa tayang banner Anda.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              {myBanners.length} Banner Terdaftar
            </span>
          </div>

          <div className="space-y-3">
            {myBanners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{banner.id}</span>
                      {banner.status === 'MENUNGGU_MODERASI_ADMIN' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9.5px] font-black inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700" />
                          MENUNGGU MODERASI ADMIN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-black inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          AKTIF TAYANG
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 truncate max-w-md">{banner.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Periode: {banner.startDate} s/d {banner.endDate} • Target: {banner.linkUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 text-[10px] block">Statistik Tayang:</span>
                    <strong className="text-slate-800 font-bold">{banner.impressions} Views • {banner.clicks} Clicks</strong>
                  </div>

                  {banner.status === 'MENUNGGU_MODERASI_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => handleSimulateApproveBanner(banner.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] rounded-xl hover:brightness-105 shadow-xs transition-all cursor-pointer"
                      title="Klik untuk mensimulasikan persetujuan instan dari panel admin"
                    >
                      ⚡ Setujui Moderasi (Demo)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Riwayat Pembelian Impact Report */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#1B3A5C]">Arsip Impact Report yang Telah Diterbitkan</h2>
              <p className="text-xs text-slate-500 font-medium">
                Dokumen laporan resmi tersimpan aman dan dapat dicetak kembali kapan saja.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No. Invoice</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Pangan Terselamatkan</th>
                  <th className="px-4 py-3">Reduksi CO2e</th>
                  <th className="px-4 py-3">Tanggal Terbit</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {purchasedReports.map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#1B3A5C]">{rpt.invoiceNo}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{rpt.month} {rpt.year}</td>
                    <td className="px-4 py-3">{rpt.weightKg} Kg (~{Math.round(rpt.weightKg * 2.5)} porsi)</td>
                    <td className="px-4 py-3 text-teal-700 font-semibold">{rpt.co2SavedKg} Kg CO2e</td>
                    <td className="px-4 py-3 text-slate-500">{rpt.purchasedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/dashboard/provider/impact?tab=csr"
                        className="inline-flex items-center gap-1 text-emerald-700 font-extrabold hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Cetak PDF
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL MOCKUP INVOICE: IMPACT REPORT */}
      {/* ========================================================= */}
      <Modal
        isOpen={reportInvoiceModal}
        onClose={() => setReportInvoiceModal(false)}
        title="Faktur Tagihan Layanan (Invoice)"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-3 font-sans">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="font-black text-sm tracking-widest text-[#1B3A5C] block">REPLATE INDONESIA</span>
                <span className="text-[9.5px] text-slate-400">Official Impact &amp; CSR Assurance</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] font-bold text-slate-500">INV-RPL-RPT-2026</span>
                <span className="text-[9px] text-emerald-700 font-black block">VERIFIKASI SIAP</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-[10px]">Tagihan Kepada:</span>
              <strong className="block text-slate-900 text-xs font-black">{providerName}</strong>
              <p className="text-[11px] text-slate-600">
                Penerbitan Dokumen Resmi Impact Report Periode: <strong>{reportMonth} {reportYear}</strong>
              </p>
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Harga Layanan Impact Report</span>
                <span className="font-bold text-slate-900">Rp {baseReportPrice.toLocaleString('id-ID')}</span>
              </div>
              {isSubscriberFreeReport && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Diskon Subscriber Langganan (100%)</span>
                  <span>-Rp {baseReportPrice.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm">
                <span className="font-black text-slate-900">Total Tagihan</span>
                <span className="font-black text-base text-[#1B3A5C]">
                  {finalReportPrice === 0 ? 'Rp 0 (Termasuk Langganan)' : `Rp ${finalReportPrice.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => setReportInvoiceModal(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1 font-black bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handlePayAndGenerateReport}
            >
              {finalReportPrice === 0 ? 'Konfirmasi & Terbitkan (Gratis)' : `Bayar & Terbitkan (Rp ${finalReportPrice.toLocaleString('id-ID')})`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL MOCKUP INVOICE: BANNER PROMOTION */}
      {/* ========================================================= */}
      <Modal
        isOpen={bannerInvoiceModal}
        onClose={() => setBannerInvoiceModal(false)}
        title="Faktur Pemasangan Banner Promosi"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-3 font-sans">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="font-black text-sm tracking-widest text-[#1B3A5C] block">REPLATE ADS PLATFORM</span>
                <span className="text-[9.5px] text-slate-400">Carousel Hero Banner (7 Hari Tayang)</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] font-bold text-slate-500">INV-RPL-BNR-2026</span>
                <span className="text-[9px] text-amber-700 font-black block">MODERASI RESMI</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-[10px]">Campaign Promosi:</span>
              <strong className="block text-slate-900 text-xs font-black">{bannerTitle}</strong>
              <p className="text-[11px] text-slate-600">
                Tayang: <strong>7 Hari</strong> terhitung sejak {bannerStartDate}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Slot Banner Promosi (7 Hari)</span>
                <span className="font-bold text-slate-900">Rp {baseBannerPrice.toLocaleString('id-ID')}</span>
              </div>
              {hasBannerQuota ? (
                <div className="flex justify-between text-amber-800 font-bold">
                  <span>Jatah Kuota Langganan ({activeSub.planName})</span>
                  <span>-Rp {baseBannerPrice.toLocaleString('id-ID')}</span>
                </div>
              ) : bannerDiscountAmt > 0 ? (
                <div className="flex justify-between text-purple-700 font-bold">
                  <span>Potongan Diskon Subscriber ({bannerDiscountPct}%)</span>
                  <span>-Rp {bannerDiscountAmt.toLocaleString('id-ID')}</span>
                </div>
              ) : null}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm">
                <span className="font-black text-slate-900">Total Tagihan</span>
                <span className="font-black text-base text-[#1B3A5C]">
                  {finalBannerPrice === 0 ? 'Rp 0 (Potong Kuota)' : `Rp ${finalBannerPrice.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => setBannerInvoiceModal(false)}>
              Batal
            </Button>
            <Button
              variant="gold"
              size="sm"
              className="flex-1 font-black text-slate-950"
              onClick={handlePayAndSubmitBanner}
            >
              {finalBannerPrice === 0 ? 'Ajukan Banner (Potong Kuota)' : `Bayar & Ajukan (Rp ${finalBannerPrice.toLocaleString('id-ID')})`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

