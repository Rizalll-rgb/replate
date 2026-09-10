'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import {
  PackageIcon,
  ShieldCheckIcon,
  CheckIcon,
  CreditCardIcon,
  BanknoteIcon,
  ClockIcon,
  SparklesIcon,
  CameraIcon,
  PlusIcon,
  QrCodeIcon,
  TruckIcon,
  BikeIcon,
  AlertTriangleIcon,
  MapPinIcon,
  MapIcon,
  ChatIcon,
  SearchIcon,
  BoltIcon,
  TicketIcon,
} from '@/components/ui/Icon';
import { resolveIndonesianAddress } from '@/lib/geoResolver';

interface ClaimItem {
  id: string;
  code?: string;
  foodName?: string;
  providerName: string;
  providerAddress?: string;
  providerPhone?: string;
  providerLat?: number;
  providerLng?: number;
  totalAmount: number;
  paymentMethod?: string;
  address?: string;
  deliveryAddress?: string;
  deliveryMethod?: 'PICKUP' | 'DELIVERY' | 'SELF_PICKUP' | 'COURIER_DELIVERY' | string;
  pickupMethod?: string;
  methodLabel?: string;
  recipientName?: string;
  recipientPhone?: string;
  status:
    | 'AWAITING_PAYMENT'
    | 'AWAITING_VERIFICATION'
    | 'WAITING_PAYMENT_APPROVAL'
    | 'READY_FOR_PICKUP'
    | 'WAITING_STORE_DISPATCH'
    | 'WAITING_STORE_COURIER'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'WAITING_RESCUE_POOL'
    | 'COMPLETED'
    | string;
  createdAt: string;
  pickupTime: string;
  hygieneStatus?: string;
  paymentProof?: string | null;
  items?: Array<{
    title?: string;
    foodName?: string;
    name?: string;
    quantity: number;
    price?: number;
  }>;
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber?: string;
  };
  proofImage?: string;
}

export default function MyClaimsPage() {
  const { data: session } = useSession();
  const [consumerName, setConsumerName] = useState('Budi Santoso');
  const [claims, setClaims] = useState<ClaimItem[]>([
    {
      id: 'RPL-CNS-2026-9812',
      code: 'RPL-CNS-2026-9812',
      foodName: 'Nasi Paket Ayam Bakar Specialty',
      providerName: 'Warung Bakso Pak Kumis Surabaya',
      providerAddress: 'Jl. Raya Gubeng No. 42, Gubeng, Surabaya',
      providerPhone: '0812-3456-7890',
      totalAmount: 10000,
      paymentMethod: 'COD',
      deliveryMethod: 'PICKUP',
      pickupMethod: 'PICKUP',
      methodLabel: 'Ambil Mandiri di Gerai',
      recipientName: 'Budi Santoso (Konsumen Replate)',
      recipientPhone: '0812-3456-7890',
      deliveryAddress: 'Jl. Ketintang No. 12, Gayungan, Surabaya',
      status: 'READY_FOR_PICKUP',
      createdAt: 'Hari ini, 19:15 WIB',
      pickupTime: 'Hari ini, 20:00 - 21:30 WIB',
      hygieneStatus: 'Lolos Audit BPOM RI 8-Poin',
      items: [{ title: 'Nasi Paket Ayam Bakar Specialty', quantity: 1, price: 10000 }],
    },
    {
      id: 'RPL-CNS-2026-4410',
      code: 'RPL-CNS-2026-4410',
      foodName: 'Bakso Sapi Urat Super & Kuah Steril (2 Porsi)',
      providerName: 'Warung Bakso Pak Kumis Surabaya',
      providerAddress: 'Jl. Raya Darmo No. 88, Wonokromo, Surabaya',
      providerPhone: '0812-3456-7890',
      totalAmount: 10000,
      paymentMethod: 'QRIS',
      deliveryMethod: 'PICKUP',
      pickupMethod: 'PICKUP',
      methodLabel: 'Ambil Sendiri di Gerai',
      status: 'COMPLETED',
      createdAt: 'Kemarin, 20:30 WIB',
      pickupTime: 'Selesai Diambil',
      hygieneStatus: 'Lolos Audit BPOM RI 8-Poin',
      items: [{ title: 'Bakso Sapi Urat Super', quantity: 2, price: 5000 }],
    },
  ]);

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'PICKUP' | 'DELIVERY'>('ALL');

  // Tracking Modal State
  const [trackingModal, setTrackingModal] = useState<ClaimItem | null>(null);

  const [deliveryProofModal, setDeliveryProofModal] = useState<{
    isOpen: boolean;
    claim: ClaimItem | null;
  }>({
    isOpen: false,
    claim: null,
  });

  // Safety Confirmation Modal before completing
  const [confirmPickupModal, setConfirmPickupModal] = useState<{
    isOpen: boolean;
    claim: ClaimItem | null;
  }>({
    isOpen: false,
    claim: null,
  });

  // Tiket QR Modal State (User Request 2)
  const [qrModal, setQrModal] = useState<{
    isOpen: boolean;
    claim: ClaimItem | null;
  }>({
    isOpen: false,
    claim: null,
  });

  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; claim: ClaimItem | null }>({
    isOpen: false,
    claim: null,
  });

  const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; claimId: string | null }>({
    isOpen: false,
    claimId: null,
  });

  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    text: '',
  });

  // Incident Modal
  const [incidentModal, setIncidentModal] = useState<{
    isOpen: boolean;
    claim: any | null;
    issueType: string;
    description: string;
  }>({
    isOpen: false,
    claim: null,
    issueType: 'OUTLET_CLOSED',
    description: '',
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

  // QRIS setup from provider profile
  const [providerQris, setProviderQris] = useState<{
    merchantName: string;
    bank: string;
    accountNo: string;
    nmid: string;
    imageUrl: string;
  }>({
    merchantName: 'Warung Bakso Pak Kumis Surabaya',
    bank: 'Bank Mandiri / BCA',
    accountNo: '141-00-9812401-2',
    nmid: 'ID1020304050607',
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80',
  });

  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem('replate_provider_qris_photo');
      const savedConfig = localStorage.getItem('replate_provider_qris_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setProviderQris((prev) => ({
          merchantName: parsed.merchantName || prev.merchantName,
          bank: parsed.bank || prev.bank,
          accountNo: parsed.accountNo || prev.accountNo,
          nmid: parsed.nmid || prev.nmid,
          imageUrl: savedPhoto || parsed.imageUrl || prev.imageUrl,
        }));
      } else if (savedPhoto) {
        setProviderQris((prev) => ({ ...prev, imageUrl: savedPhoto }));
      }
    } catch (_) {}

    let activeConsumerName = 'Budi Santoso';
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName || parsed.contactPerson || parsed.name) {
          activeConsumerName = parsed.entityName || parsed.contactPerson || parsed.name;
        }
      } else {
        const reg = localStorage.getItem('replate_registered_user');
        if (reg) {
          const parsed = JSON.parse(reg);
          if (parsed.name) activeConsumerName = parsed.name;
        }
      }
      if (session?.user?.name) {
        activeConsumerName = session.user.name;
      }
      setConsumerName(activeConsumerName);
    } catch (_) {}

    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      const saved = localStorage.getItem('replate_active_claims');

      if (isFresh) {
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map((item: any) => ({
              id: item.code || item.id,
              code: item.code || item.id,
              foodName:
                item.items?.map((i: any) => `${i.title || i.foodName || i.name} (${i.quantity})`).join(', ') ||
                item.foodName ||
                'Surplus Makanan Steril',
              providerName: item.providerName || 'Outlet Mitra Replate',
              providerAddress: item.providerAddress || item.address || 'Surabaya',
              providerPhone: item.providerPhone || '0812-3456-7890',
              totalAmount: item.totalAmount ?? 10000,
              paymentMethod: item.paymentMethod || 'COD',
              deliveryMethod: item.deliveryMethod || item.pickupMethod || 'PICKUP',
              pickupMethod: item.pickupMethod || item.deliveryMethod || 'PICKUP',
              methodLabel: item.methodLabel || ((item.deliveryMethod === 'DELIVERY' || item.pickupMethod === 'DELIVERY' || item.deliveryMethod === 'COURIER_DELIVERY') ? 'Diantar Armada Toko' : 'Ambil Mandiri di Gerai'),
              recipientName: (item.recipientName && !item.recipientName.includes('Terverifikasi') && !item.recipientName.includes('Penerima')) ? item.recipientName : activeConsumerName,
              recipientPhone: item.recipientPhone || '',
              deliveryAddress: item.deliveryAddress || item.address || '',
              status: item.status || 'READY_FOR_PICKUP',
              createdAt: item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                : 'Hari ini',
              pickupTime: item.pickupTime || 'Hari ini, 20:00 - 21:30 WIB',
              hygieneStatus: item.hygieneStatus || 'Lolos Audit BPOM RI 8-Poin',
              items: item.items || [],
              driver: item.driver || {
                name: 'Rudi Hartono (Driver Replate #RC-881)',
                phone: '0812-9876-5432',
                vehicle: 'Motor Box Cooler Steril',
                plateNumber: 'L 8912 RC',
              },
            }));
            const unique = Array.from(new Map(mapped.map((c: any) => [c.id, c])).values()) as ClaimItem[];
            setClaims(unique);
          } else {
            setClaims([]);
          }
        } else {
          setClaims([]);
        }
        return;
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped = parsed.map((item: any) => ({
            id: item.code || item.id,
            code: item.code || item.id,
            foodName:
              item.items?.map((i: any) => `${i.title || i.foodName || i.name} (${i.quantity})`).join(', ') ||
              item.foodName ||
              'Surplus Makanan Steril',
            providerName: item.providerName || 'Warung Bakso Pak Kumis Surabaya',
            providerAddress: item.providerAddress || item.address || 'Jl. Raya Gubeng No. 42, Gubeng, Surabaya',
            providerPhone: item.providerPhone || '0812-3456-7890',
            totalAmount: item.totalAmount ?? 10000,
            paymentMethod: item.paymentMethod || 'COD',
            deliveryMethod: item.deliveryMethod || item.pickupMethod || 'PICKUP',
            pickupMethod: item.pickupMethod || item.deliveryMethod || 'PICKUP',
            methodLabel: item.methodLabel || ((item.deliveryMethod === 'DELIVERY' || item.pickupMethod === 'DELIVERY' || item.deliveryMethod === 'COURIER_DELIVERY') ? 'Diantar Armada Toko' : 'Ambil Mandiri di Gerai'),
            recipientName: (item.recipientName && !item.recipientName.includes('Terverifikasi') && !item.recipientName.includes('Penerima')) ? item.recipientName : activeConsumerName,
            recipientPhone: item.recipientPhone || '',
            deliveryAddress: item.deliveryAddress || item.address || '',
            status: item.status || 'READY_FOR_PICKUP',
            createdAt: item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
              : 'Hari ini',
            pickupTime: item.pickupTime || 'Hari ini, 20:00 - 21:30 WIB',
            hygieneStatus: item.hygieneStatus || 'Lolos Audit BPOM RI 8-Poin',
            items: item.items || [],
            driver: item.driver || {
              name: 'Rudi Hartono (Driver Replate #RC-881)',
              phone: '0812-9876-5432',
              vehicle: 'Motor Box Cooler Steril',
              plateNumber: 'L 8912 RC',
            },
          }));
          const combined = [...mapped, ...claims.slice(1)];
          const unique = Array.from(new Map(combined.map((c) => [c.id, c])).values()) as ClaimItem[];
          setClaims(unique);
        }
      }
    } catch (_) {}
  }, [session]);

  const handleUploadProof = () => {
    if (!uploadModal.claimId) return;

    setActionLoader({
      isOpen: true,
      message: 'Mengunggah Bukti Transfer...',
      submessage: 'Menyinkronkan ke meja kasir provider toko',
    });

    setTimeout(() => {
      const updated = claims.map((c) =>
        c.id === uploadModal.claimId ? { ...c, status: 'WAITING_PAYMENT_APPROVAL' as const, paymentProof: 'uploaded_receipt.jpg' } : c
      );
      setClaims(updated);
      try {
        localStorage.setItem('replate_active_claims', JSON.stringify(updated));
        localStorage.setItem('replate_claims', JSON.stringify(updated));
      } catch (_) {}

      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Bukti transfer berhasil dikirim. Menunggu konfirmasi verifikasi dari kasir provider toko.',
        type: 'success',
      });
      setUploadModal({ isOpen: false, claimId: null });
    }, 1200);
  };

  const handleExecuteCompleted = (claimId: string) => {
    setConfirmPickupModal({ isOpen: false, claim: null });

    setActionLoader({
      isOpen: true,
      message: 'Menyelesaikan Klaim...',
      submessage: 'Memvalidasi serah terima makanan higienis',
    });

    setTimeout(() => {
      let targetClaim: ClaimItem | null = null;
      const updated = claims.map((c) => {
        if (c.id === claimId) {
          targetClaim = { ...c, status: 'COMPLETED' as const, pickupTime: 'Selesai Diambil' };
          return targetClaim;
        }
        return c;
      });
      setClaims(updated);
      try {
        localStorage.setItem('replate_active_claims', JSON.stringify(updated));
      } catch (_) {}

      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Serah terima makanan berhasil diselesaikan! Terima kasih telah menyelamatkan surplus pangan.',
        type: 'success',
      });

      if (targetClaim) {
        handleOpenReview(targetClaim);
      }
    }, 1000);
  };

  // Handover Logic: Consumer menunjukkan barcode -> Kasir scan -> Status berubah ke 'PICKED_UP' (Telah Diambil Consumer)
  const handleHandoverClaim = (claimId: string) => {
    setActionLoader({
      isOpen: true,
      message: 'Memvalidasi Barcode di Kasir Outlet...',
      submessage: 'Memproses konfirmasi serah terima fisik paket makanan',
    });

    setTimeout(() => {
      let targetClaim: ClaimItem | null = null;
      const updated = claims.map((c) => {
        if (c.id === claimId || c.code === claimId) {
          targetClaim = { ...c, status: 'PICKED_UP' as const, pickupTime: 'Telah Diambil di Gerai' };
          return targetClaim;
        }
        return c;
      });
      setClaims(updated);

      try {
        const saved = localStorage.getItem('replate_active_claims');
        if (saved) {
          const parsed = JSON.parse(saved);
          const updatedStorage = parsed.map((c: any) =>
            c.id === claimId || c.code === claimId
              ? { ...c, status: 'PICKED_UP', pickupTime: 'Telah Diambil di Gerai' }
              : c
          );
          localStorage.setItem('replate_active_claims', JSON.stringify(updatedStorage));
        }
      } catch (_) {}

      setActionLoader({ isOpen: false, message: '' });
      setQrModal({ isOpen: false, claim: null });
      setToastState({
        isOpen: true,
        message: 'Barcode berhasil diverifikasi kasir! Paket makanan telah diserahkan. Silakan periksa porsi Anda.',
        type: 'success',
      });
    }, 800);
  };

  const handleOpenReview = (claim: ClaimItem) => {
    setReviewModal({
      isOpen: true,
      claim,
    });
    setReviewForm({
      rating: 5,
      text: '',
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.text.trim()) {
      setToastState({
        isOpen: true,
        message: 'Mohon tulis ulasan pengalaman Anda.',
        type: 'error',
      });
      return;
    }

    setActionLoader({
      isOpen: true,
      message: 'Mempublikasikan Ulasan...',
      submessage: 'Menyimpan cerita dampak terverifikasi ke galeri publik',
    });

    setTimeout(() => {
      let reviewerName = 'Konsumen Replate';
      try {
        const profile = localStorage.getItem('replate_onboarding_profile');
        if (profile) {
          const parsed = JSON.parse(profile);
          reviewerName = parsed.name || parsed.entityName || parsed.contactPerson || reviewerName;
        }
      } catch (_) {}

      const newVerifiedReview = {
        name: reviewerName,
        role: 'Food Consumer (Pembeli Terverifikasi)',
        foodSaved: `Penyelamatan: ${reviewModal.claim?.foodName || 'Surplus Makanan'}`,
        text: reviewForm.text.trim(),
        rating: reviewForm.rating,
        date: 'Baru saja',
        isVerified: true,
      };

      try {
        const saved = JSON.parse(localStorage.getItem('replate_verified_testimonials') || '[]');
        localStorage.setItem('replate_verified_testimonials', JSON.stringify([newVerifiedReview, ...saved]));
      } catch (_) {}

      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Ulasan berhasil dipublikasikan dan langsung tampil di Galeri Kisah Nyata Beranda Replate!',
        type: 'success',
      });
      setReviewModal({ isOpen: false, claim: null });
    }, 1000);
  };

  const filteredClaims = claims
    .filter((c) => (activeTab === 'ACTIVE' ? c.status !== 'COMPLETED' : c.status === 'COMPLETED'))
    .filter((c) => {
      if (methodFilter === 'ALL') return true;
      const isCourier =
        c.deliveryMethod === 'DELIVERY' ||
        c.pickupMethod === 'DELIVERY' ||
        c.deliveryMethod === 'COURIER_DELIVERY' ||
        (c.methodLabel || '').toLowerCase().includes('kurir');
      return methodFilter === 'DELIVERY' ? isCourier : !isCourier;
    });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#D4A843]/15 text-[#B8860B] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Food Consumer Suite
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Standar BPOM RI Terjamin</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1B3A5C] tracking-tight">Klaim & Riwayat Saya</h1>
            <p className="text-xs text-slate-500 font-medium">
              Pantau status pemesanan makanan surplus, barcode QR serah terima di outlet, kontak kasir toko, atau pelacakan kurir.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/explore">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<SearchIcon size={13} className="text-slate-950" />}
                className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
              >
                Eksplor Pangan Lagi
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {[
            {
              id: 'ACTIVE',
              label: `Klaim Aktif (${claims.filter((c) => c.status !== 'COMPLETED').length})`,
              icon: <ClockIcon size={12} />,
            },
            {
              id: 'HISTORY',
              label: `Riwayat Selesai (${claims.filter((c) => c.status === 'COMPLETED').length})`,
              icon: <CheckIcon size={12} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#1B3A5C] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">Metode:</span>
        {[
          { id: 'ALL', label: 'Semua Metode' },
          { id: 'PICKUP', label: 'Ambil Sendiri di Gerai' },
          { id: 'DELIVERY', label: 'Pengantaran Kurir' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setMethodFilter(f.id as any)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              methodFilter === f.id
                ? 'bg-[#D4A843] text-slate-950 font-black shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Claim Cards List */}
      {filteredClaims.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <PackageIcon size={28} />
          </div>
          <h4 className="font-extrabold text-base text-[#1B3A5C]">
            {activeTab === 'ACTIVE'
              ? 'Tidak ada klaim aktif sesuai filter'
              : 'Belum ada riwayat transaksi selesai'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Temukan makanan diskon surplus murah atau klaim donasi food rescue bergizi dari resto mitra di katalog Replate.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/explore">
              <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs cursor-pointer">
                Eksplor Pangan Donasi & Diskon
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => {
            const isCod = claim.paymentMethod === 'COD';
            const isCourier =
              claim.deliveryMethod === 'DELIVERY' ||
              claim.pickupMethod === 'DELIVERY' ||
              claim.deliveryMethod === 'COURIER_DELIVERY' ||
              (claim.methodLabel || '').toLowerCase().includes('kurir') ||
              (claim.methodLabel || '').toLowerCase().includes('toko') ||
              (claim.methodLabel || '').toLowerCase().includes('antar');

            const isDone = claim.status === 'COMPLETED';
            const isPickedUp = claim.status === 'PICKED_UP' || claim.status === 'TELAH_DIAMBIL';
            const isInTransit = claim.status === 'IN_TRANSIT';
            const isWaitingStoreDispatch =
              claim.status === 'WAITING_STORE_DISPATCH' ||
              claim.status === 'WAITING_STORE_COURIER';
            const isWaitingPool = claim.status === 'WAITING_RESCUE_POOL';
            const hasUploadedProof = Boolean(claim.paymentProof);
            const isPaymentPending = (claim.status === 'AWAITING_PAYMENT' && !isCod && !hasUploadedProof);
            const isVerificationPending =
              !isCod &&
              (claim.status === 'AWAITING_VERIFICATION' ||
                claim.status === 'WAITING_PAYMENT_APPROVAL' ||
                claim.status === 'PENDING_APPROVAL' ||
                (claim.status === 'AWAITING_PAYMENT' && hasUploadedProof));
            const isReady =
              claim.status === 'READY_FOR_PICKUP' ||
              (isCod && !isCourier && !isPickedUp && !isDone) ||
              (!isCourier && !isPaymentPending && !isVerificationPending && !isPickedUp && !isDone && !isWaitingStoreDispatch);

            const outletAddress = claim.providerAddress || claim.address || 'Surabaya, Jawa Timur';
            const outletPhone = claim.providerPhone || '081234567890';
            const cleanPhone = outletPhone.replace(/\D/g, '');
            const outletGeo = resolveIndonesianAddress(outletAddress);
            const gmapsUrl = (claim.providerLat && claim.providerLng)
              ? `https://www.google.com/maps/search/?api=1&query=${claim.providerLat},${claim.providerLng}`
              : outletGeo.lat && outletGeo.lng
                ? `https://www.google.com/maps/search/?api=1&query=${outletGeo.lat},${outletGeo.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${claim.providerName} ${outletGeo.formattedAddress || outletAddress}`)}`;
            const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
              `Halo ${claim.providerName}, saya konsumen Replate pemegang Kode Klaim #${claim.code || claim.id}. Ingin konfirmasi mengenai pesanan ${claim.foodName}.`
            )}`;

            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Card Header: Resi Code, Status Badge, Timestamp */}
                <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-black text-xs text-[#1B3A5C] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                      {claim.code || claim.id}
                    </span>
                    <span
                      className={`text-[9.5px] font-black px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 ${
                        isDone
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : isPickedUp
                          ? 'bg-blue-100 text-blue-950 border border-blue-300 font-extrabold'
                          : isInTransit
                          ? 'bg-blue-100 text-blue-900 border border-blue-300 animate-pulse'
                          : isWaitingStoreDispatch
                          ? 'bg-amber-100 text-amber-950 border border-amber-300 animate-pulse'
                          : isWaitingPool
                          ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                          : isReady
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isPaymentPending
                          ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                          : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckIcon size={11} />
                          <span>SELESAI</span>
                        </>
                      ) : isPickedUp ? (
                        <>
                          <PackageIcon size={11} />
                          <span>TELAH DIAMBIL CONSUMER</span>
                        </>
                      ) : isInTransit ? (
                        <>
                          <TruckIcon size={11} />
                          <span>DALAM PENGIRIMAN KURIR TOKO</span>
                        </>
                      ) : isWaitingStoreDispatch ? (
                        <>
                          <TruckIcon size={11} />
                          <span>MENUNGGU PLOTTING ARMADA TOKO{isCod ? ' (COD)' : ''}</span>
                        </>
                      ) : isWaitingPool ? (
                        <>
                          <BoltIcon size={11} />
                          <span>MENUNGGU DI POOL SIAGA RELAWAN</span>
                        </>
                      ) : isReady ? (
                        <>
                          <PackageIcon size={11} />
                          <span>SIAP DIAMBIL DI GERAI{isCod ? ' (COD)' : ''}</span>
                        </>
                      ) : isPaymentPending ? (
                        <>
                          <CreditCardIcon size={11} />
                          <span>MENUNGGU PEMBAYARAN QRIS</span>
                        </>
                      ) : (
                        <>
                          <ClockIcon size={11} />
                          <span>VERIFIKASI BUKTI TRANSFER</span>
                        </>
                      )}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                    <ClockIcon size={11} className="text-slate-300" />
                    <span>{claim.createdAt || 'Hari ini'}</span>
                  </span>
                </div>

                {/* Card Body: Food, Outlet Info, Gmaps, WA, Schedule */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-md">
                          {isCourier ? 'Diantar Armada Toko' : 'Ambil Mandiri di Gerai'}
                        </span>
                        {isCod && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black rounded-md flex items-center gap-1">
                            <BanknoteIcon size={11} />
                            <span>COD (Bayar di Tempat)</span>
                          </span>
                        )}
                        <span className="text-[10.5px] text-slate-500 font-semibold">
                          {claim.totalAmount === 0 ? (
                            <span className="text-emerald-700 font-bold">Donasi Makanan Gratis (Rp 0)</span>
                          ) : (
                            <span className="text-slate-900 font-black">
                              Total: Rp {claim.totalAmount.toLocaleString('id-ID')}
                            </span>
                          )}
                        </span>
                      </div>
                      <h3 className="font-black text-base sm:text-lg text-[#1B3A5C] leading-snug">
                        {claim.foodName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-0.5">
                        <ShieldCheckIcon size={13} className="text-emerald-600 shrink-0" />
                        <span>{claim.hygieneStatus || 'Lolos Audit Higienitas BPOM RI 8-Poin'}</span>
                      </div>
                    </div>

                    {/* Operational / Pickup Window Badge */}
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 shrink-0 text-left md:text-right space-y-0.5">
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                        JADWAL PENGAMBILAN / TIBA
                      </span>
                      <strong className="text-xs font-black text-[#1B3A5C] block">
                        {claim.pickupTime || 'Hari ini, 20:00 - 21:30 WIB'}
                      </strong>
                      <span className="text-[10.5px] text-slate-500 block">
                        {isCourier ? 'Estimasi pengantaran armada toko' : 'Harap ambil sebelum toko tutup'}
                      </span>
                    </div>
                  </div>

                  {/* Provider / Outlet Detail Box */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#1B3A5C]">{claim.providerName}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium flex items-start gap-1">
                        <MapPinIcon size={13} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{outletAddress}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        PIC Outlet: {outletPhone}
                      </p>
                    </div>

                    {/* Direct Outlet Contact & Gmaps Action Buttons */}
                    <div className="flex items-center gap-2 self-start md:self-center md:justify-end flex-wrap">
                      <a
                        href={gmapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#1B3A5C] border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <MapIcon size={13} className="text-[#1B3A5C]" />
                        <span>Buka Google Maps</span>
                      </a>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <ChatIcon size={13} className="text-white" />
                        <span>WhatsApp Outlet</span>
                      </a>
                    </div>
                  </div>

                  {/* Status Banner Khusus COD (Point 3) */}
                  {isCod && !isPickedUp && !isDone && (
                    <div className="p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                          <BanknoteIcon size={16} className="text-amber-700 shrink-0" />
                          <span>Metode Pembayaran: Bayar di Tempat (COD)</span>
                        </div>
                        <span className="text-[11px] font-black text-[#1B3A5C] bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                          Total Tagihan Tunai: Rp {claim.totalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed font-medium">
                        {isCourier
                          ? `Pesanan Anda telah dikonfirmasi dan menunggu plotting kurir toko. Siapkan uang tunai pas sebesar Rp ${claim.totalAmount.toLocaleString('id-ID')} untuk diserahkan ke kurir toko saat makanan tiba di alamat Anda.`
                          : `Pesanan Anda telah dikonfirmasi gerai. Tunjukkan Tiket QR di meja kasir ${claim.providerName} dan bayarkan uang tunai sebesar Rp ${claim.totalAmount.toLocaleString('id-ID')} saat serah terima makanan.`}
                      </p>
                    </div>
                  )}

                  {/* Status Waiting Store Dispatch (Point 1) */}
                  {isWaitingStoreDispatch && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5">
                      <TruckIcon size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-900 space-y-0.5">
                        <strong className="block font-black">Menunggu Plotting Armada Toko</strong>
                        <p className="text-[11.5px] text-blue-800 leading-relaxed">
                          Pihak gerai <strong>{claim.providerName}</strong> sedang menyiapkan pesanan dan mem-plotting driver/armada internal toko untuk mengantar ke alamat Anda.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Waiting Rescue Pool (Point 1) */}
                  {isWaitingPool && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5">
                      <BoltIcon size={16} className="text-purple-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-purple-900 space-y-0.5">
                        <strong className="block font-black">Menunggu di Pool Siaga Relawan Komunitas</strong>
                        <p className="text-[11.5px] text-purple-800 leading-relaxed">
                          Permintaan donasi pangan telah masuk ke pool siaga relawan logistik food rescue Replate (menunggu relawan mengambil penugasan pengantaran).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Awaiting Payment (QRIS / VA) */}
                  {isPaymentPending && (
                    <div className="p-4 bg-red-50/70 border-2 border-red-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                        <CreditCardIcon size={14} className="text-red-600 shrink-0" />
                        <span>Menunggu Pembayaran untuk Konfirmasi Pesanan</span>
                      </div>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl max-w-xs mx-auto text-center space-y-2">
                        <span className="font-black text-xs text-[#1B3A5C] block">QRIS Nasional</span>
                        <div className="w-40 h-40 mx-auto bg-slate-50 rounded-lg border border-slate-200 p-1 flex items-center justify-center">
                          <img
                            src={providerQris.imageUrl}
                            alt="QRIS Merchant"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs font-black text-red-800">
                          Total: Rp {claim.totalAmount.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full font-black text-xs shadow-xs py-2 cursor-pointer"
                        onClick={() => setUploadModal({ isOpen: true, claimId: claim.id })}
                      >
                        Upload Bukti Transfer Sekarang
                      </Button>
                    </div>
                  )}

                  {/* Status Waiting Verification (Only for non-COD QRIS/Transfer) */}
                  {isVerificationPending && (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                      <ClockIcon size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 space-y-0.5">
                        <strong className="block font-black">Bukti Pembayaran Sedang Diverifikasi Kasir Outlet</strong>
                        <p className="text-[11px] text-amber-800">
                          Kasir toko ({claim.providerName}) sedang memvalidasi struk/mutasi pembayaran Anda. Tiket barcode QR serah terima akan otomatis aktif begitu disetujui.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Self-Pickup SOP & Tombol Aksi Tiket QR */}
                  {!isCourier && !isPickedUp && !isDone && (isReady || isCod) && (
                    <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#1B3A5C]">
                          <ShieldCheckIcon size={15} className="text-blue-600" />
                          <span>SOP Pengambilan Mandiri di Gerai:</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          Tunjukkan <strong>Tiket QR</strong> kepada petugas kasir di outlet <strong>{claim.providerName}</strong> untuk verifikasi serah terima paket makanan.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<TicketIcon size={14} />}
                        onClick={() => setQrModal({ isOpen: true, claim })}
                        className="font-black text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        Buka Tiket QR
                      </Button>
                    </div>
                  )}

                  {/* Status Telah Diambil Consumer (User Request 1) */}
                  {isPickedUp && (
                    <div className="p-4 bg-blue-50/90 border border-blue-300 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-[#1B3A5C] font-black text-xs">
                        <PackageIcon size={16} className="text-blue-600 shrink-0" />
                        <span>Makanan Telah Diambil di Gerai ({claim.providerName})</span>
                      </div>
                      <p className="text-[11.5px] text-slate-700 font-medium leading-relaxed">
                        Kasir telah menyerahkan paket makanan surplus kepada Anda. Silakan periksa kelayakan dan porsi makanan. Jika sudah sesuai, klik tombol <strong>"Konfirmasi Selesai"</strong> di bawah. Jika terdapat ketidaksesuaian/kerusakan, klik tombol <strong>"Laporkan Kendala"</strong>.
                      </p>
                    </div>
                  )}

                  {/* Courier In-Transit Card Banner */}
                  {isInTransit && (
                    <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                          <BikeIcon size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-purple-700 block">
                            KURIR SEDANG MENGANTAR
                          </span>
                          <strong className="text-xs text-slate-900 block">
                            {claim.driver?.name || 'Rudi Hartono (Driver Replate #RC-881)'}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {claim.driver?.vehicle || 'Motor Box Cooler Steril (L 8912 RC)'}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<MapIcon size={13} className="text-slate-950" />}
                        className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
                        onClick={() => setTrackingModal(claim)}
                      >
                        Lacak Pengantaran Live
                      </Button>
                    </div>
                  )}

                  {/* Completed Banner */}
                  {isDone && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-900 font-black text-xs">
                          <CheckIcon size={14} className="text-emerald-600" />
                          <span>Makanan Telah Diterima & Transaksi Selesai</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-medium">
                          Terima kasih telah berkontribusi mengurangi food waste bersama Replate!
                        </p>
                      </div>

                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<SparklesIcon size={13} className="text-slate-950" />}
                        onClick={() => handleOpenReview(claim)}
                        className="font-black text-xs text-slate-950 shrink-0 shadow-xs whitespace-nowrap cursor-pointer"
                      >
                        Beri Ulasan Dampak
                      </Button>
                    </div>
                  )}
                </div>

                {/* Card Footer: Action Buttons (User Request 1 & 2) */}
                <div className="px-4 sm:px-6 pb-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    {/* Tombol Lacak Kurir / Timeline Selesai (Poin 12) */}
                    {(isCourier || isDone) && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={isDone ? <ClockIcon size={13} className="text-blue-600" /> : <TruckIcon size={13} className="text-[#1B3A5C]" />}
                        className={`text-xs font-bold py-2 px-3 rounded-xl cursor-pointer ${
                          isDone ? 'border-blue-200 text-blue-800 hover:bg-blue-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                        onClick={() => setTrackingModal(claim)}
                      >
                        {isDone ? 'Lacak Alur / Timeline' : 'Lacak Kurir'}
                      </Button>
                    )}

                    {/* Tombol Bukti Pengiriman Langsung Jika Selesai (Poin 13) */}
                    {isDone && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<CheckIcon size={13} className="text-emerald-600" />}
                        className="text-xs font-bold py-2 px-3 rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                        onClick={() => setDeliveryProofModal({ isOpen: true, claim })}
                      >
                        Bukti Pengiriman
                      </Button>
                    )}

                    {/* Tombol Tiket QR */}
                    {(isReady || isPickedUp || isCod) && !isCourier && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<TicketIcon size={13} className="text-[#1B3A5C]" />}
                        onClick={() => setQrModal({ isOpen: true, claim })}
                        className="text-xs font-black py-2 px-3.5 rounded-xl border-slate-300 text-[#1B3A5C] hover:bg-slate-50 cursor-pointer"
                      >
                        Tiket QR
                      </Button>
                    )}

                    {/* Tombol Konfirmasi Selesai (User Request 1) */}
                    {(isReady || isPickedUp) && (
                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<CheckIcon size={13} className="text-slate-950" />}
                        onClick={() => setConfirmPickupModal({ isOpen: true, claim })}
                        className="font-black text-xs text-slate-950 shadow-xs py-2 px-4 rounded-xl cursor-pointer"
                      >
                        Konfirmasi Selesai
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {/* Tombol Laporkan Jika Tidak Sesuai (User Request 1) */}
                    <button
                      type="button"
                      onClick={() =>
                        setIncidentModal({
                          isOpen: true,
                          claim,
                          issueType: isPaymentPending ? 'PAYMENT_NOT_CONFIRMED' : 'OUTLET_CLOSED',
                          description: '',
                        })
                      }
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangleIcon size={13} />
                      <span>Laporkan Kendala</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Confirmation Modal Before Completing */}
      {confirmPickupModal.isOpen && confirmPickupModal.claim && (
        <Modal
          isOpen={confirmPickupModal.isOpen}
          onClose={() => setConfirmPickupModal({ isOpen: false, claim: null })}
          title="Konfirmasi Penerimaan Paket Makanan"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                VALIDASI SERAH TERIMA OUTLET
              </span>
              <h4 className="text-sm font-black text-emerald-950">
                {confirmPickupModal.claim.foodName}
              </h4>
              <p className="text-[11px] text-emerald-800 font-medium">
                Outlet: <strong>{confirmPickupModal.claim.providerName}</strong> ({confirmPickupModal.claim.code || confirmPickupModal.claim.id})
              </p>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-extrabold text-slate-900 block">Daftar Pemeriksaan Mandiri Konsumen:</span>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-600">
                <li>Paket makanan telah Anda terima secara fisik dari staf kasir outlet.</li>
                <li>Segel higienitas kemasan dalam kondisi baik dan steril.</li>
                <li>Porsi dan varian menu sesuai dengan rincian pesanan.</li>
              </ul>
            </div>

            <p className="text-slate-500 font-medium text-[11px]">
              Setelah konfirmasi ini dikirim, status pesanan akan dinyatakan selesai dan tercatat dalam sistem rekap Replate.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmPickupModal({ isOpen: false, claim: null })}
                className="cursor-pointer"
              >
                Periksa Lagi
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleExecuteCompleted(confirmPickupModal.claim!.id)}
                className="font-black text-slate-950 cursor-pointer shadow-xs"
              >
                Ya, Makanan Diterima Lengkap
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Tiket QR Modal (User Request 2) */}
      {qrModal.isOpen && qrModal.claim && (
        <Modal
          isOpen={qrModal.isOpen}
          onClose={() => setQrModal({ isOpen: false, claim: null })}
          title="Tiket QR Serah Terima Resmi"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-gradient-to-r from-[#1B3A5C] to-[#2C5A8F] text-white rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#D4A843] font-black uppercase tracking-wider block">
                  NOMOR TIKET KLAIM RESMI
                </span>
                <p className="text-xl font-black font-mono tracking-tight text-white">
                  {qrModal.claim.code || qrModal.claim.id}
                </p>
                <p className="text-[11px] text-slate-200">
                  Outlet: <strong>{qrModal.claim.providerName}</strong>
                </p>
              </div>
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 text-center shrink-0">
                <span className="text-[10px] text-slate-200 block">Jadwal Ambil</span>
                <span className="text-xs font-bold text-amber-300 block">{qrModal.claim.pickupTime || 'Hari ini'}</span>
              </div>
            </div>

            {/* QR Code Handover Generator */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <QRGenerator
                value={`REPLATE-CNS-${qrModal.claim.code || qrModal.claim.id}`}
                codeTitle="Barcode Serah Terima Kasir"
                codeSubtitle="Tunjukkan barcode ini kepada petugas kasir di outlet"
                foodName={qrModal.claim.foodName}
                portions={
                  qrModal.claim.totalAmount > 0
                    ? `Total: Rp ${qrModal.claim.totalAmount.toLocaleString('id-ID')}`
                    : 'Donasi Makanan Gratis'
                }
                providerName={qrModal.claim.providerName}
                recipientName={
                  qrModal.claim.recipientName && !qrModal.claim.recipientName.includes('Terverifikasi') && !qrModal.claim.recipientName.includes('Penerima')
                    ? qrModal.claim.recipientName
                    : consumerName || 'Budi Santoso'
                }
              />
            </div>

            {/* Simulation Button for Testing Handover */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-amber-900 uppercase block">Simulasi Kasir Scan:</span>
                  <p className="text-[11px] text-amber-800">
                    Klik tombol ini untuk mensimulasikan kasir telah scan barcode dan menyerahkan makanan.
                  </p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleHandoverClaim(qrModal.claim!.id)}
                  className="font-black text-xs text-slate-950 shrink-0 shadow-xs cursor-pointer"
                >
                  Tandai Telah Diambil →
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrModal({ isOpen: false, claim: null })}
                className="cursor-pointer font-bold text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Live Tracking Modal for Couriers */}
      {trackingModal && (
        <Modal
          isOpen={Boolean(trackingModal)}
          onClose={() => setTrackingModal(null)}
          title={`Pelacakan Pengantaran: ${trackingModal.code || trackingModal.id}`}
          size="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            {/* Header Status */}
            <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#D4A843] font-black uppercase tracking-widest block">
                  LIVE LOGISTICS TRACKER REPLATE
                </span>
                <h4 className="text-base font-black text-white">{trackingModal.foodName}</h4>
                <p className="text-xs text-slate-300 font-mono">Kode Resi: {trackingModal.code || trackingModal.id}</p>
              </div>

              <span className="px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-xl self-start sm:self-center">
                {trackingModal.status === 'COMPLETED'
                  ? 'Tiba & Diterima'
                  : trackingModal.status === 'IN_TRANSIT'
                  ? 'Sedang Diantar Kurir Toko'
                  : trackingModal.status === 'WAITING_STORE_DISPATCH'
                  ? 'Menunggu Plotting Kurir Toko'
                  : 'Menyiapkan Penjemputan'}
              </span>
            </div>

            {/* Banner Bukti Pengiriman Terverifikasi (Poin 13) */}
            {trackingModal.status === 'COMPLETED' && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-emerald-700 shrink-0" />
                  <div>
                    <strong className="text-xs text-emerald-900 block font-black">
                      Pesanan Telah Tiba & Diserahterimakan
                    </strong>
                    <span className="text-[11px] text-emerald-700">
                      Foto dokumentasi serah terima dan catatan penerimaan telah diverifikasi di sistem.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeliveryProofModal({ isOpen: true, claim: trackingModal })}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 shrink-0"
                >
                  <span>Lihat Bukti Pengiriman</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* Courier Profile */}
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">
                  <BikeIcon size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-700 block">
                    ARMADA KURIR TOKO ({trackingModal.providerName})
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {trackingModal.driver?.name || 'Rudi Hartono (Driver Toko Mitra)'}
                  </strong>
                  <span className="text-xs text-slate-600">
                    {trackingModal.driver?.vehicle || 'Motor Box Cooler'} · {trackingModal.driver?.plateNumber || 'L 8912 RC'}
                  </span>
                </div>
              </div>

              <a
                href={`https://wa.me/${(trackingModal.driver?.phone || '081298765432').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Halo driver Replate, saya menanyakan status pengantaran pesanan resi ${trackingModal.code || trackingModal.id}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <ChatIcon size={13} />
                <span>Hubungi Driver (WhatsApp)</span>
              </a>
            </div>

            {/* Delivery Route Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Titik Jemput (Outlet Mitra):</span>
                <strong className="text-xs text-[#1B3A5C] block">{trackingModal.providerName}</strong>
                <p className="text-[11px] text-slate-600 truncate">{trackingModal.providerAddress || 'Surabaya'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Titik Antar (Alamat Anda):</span>
                <strong className="text-xs text-emerald-800 block">
                  {trackingModal.recipientName && !trackingModal.recipientName.includes('Terverifikasi') && !trackingModal.recipientName.includes('Penerima')
                    ? trackingModal.recipientName
                    : consumerName || 'Budi Santoso'}
                </strong>
                <p className="text-[11px] text-slate-600 truncate">
                  {trackingModal.deliveryAddress || trackingModal.address || 'Alamat Domisili Pengiriman Terdaftar'}
                </p>
              </div>
            </div>

            {/* Logistics Timeline */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-extrabold text-[#1B3A5C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ClockIcon size={14} className="text-[#1B3A5C]" />
                <span>Timeline Logistik Real-Time</span>
              </span>
              <div className="space-y-3 pl-2 border-l-2 border-slate-300 text-xs">
                <div className="relative pl-4">
                  <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                  <strong className="block text-slate-900">Pesanan Dikonfirmasi & Terdaftar</strong>
                  <span className="text-slate-500 text-[11px]">{trackingModal.createdAt || 'Hari ini'}</span>
                </div>
                <div className="relative pl-4">
                  <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                  <strong className="block text-slate-900">Paket Disiapkan Sesuai Standar BPOM</strong>
                  <span className="text-slate-500 text-[11px]">Segel steril food-grade diaplikasikan</span>
                </div>
                <div className="relative pl-4">
                  <span
                    className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${
                      trackingModal.status === 'COMPLETED'
                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                        : 'bg-blue-500 ring-4 ring-blue-100 animate-pulse'
                    }`}
                  ></span>
                  <strong className={trackingModal.status === 'COMPLETED' ? 'text-slate-900' : 'text-blue-900'}>
                    Kurir Menuju Alamat Konsumen
                  </strong>
                  <span className="text-slate-500 text-[11px]">Estimasi waktu: 15–25 menit</span>
                </div>
                <div className="relative pl-4">
                  <span
                    className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${
                      trackingModal.status === 'COMPLETED' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'
                    }`}
                  ></span>
                  <strong className={trackingModal.status === 'COMPLETED' ? 'text-slate-900' : 'text-slate-400'}>
                    Paket Diserahterimakan
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    {trackingModal.status === 'COMPLETED' ? 'Selesai diterima konsumen' : 'Menunggu serah terima'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hygiene Note */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
              <ShieldCheckIcon size={16} className="text-emerald-600 shrink-0" />
              <span className="text-[11px] font-bold text-emerald-900">
                Pengantaran menggunakan boks isolasi higienis berstandar rantai dingin (Cold-Chain SOP BPOM).
              </span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setTrackingModal(null)} className="cursor-pointer">
                Tutup Pelacakan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Submission Modal */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, claim: null })}
        title="Beri Ulasan & Cerita Dampak Terverifikasi"
        size="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <span className="font-black text-amber-900 block">
              Makanan: {reviewModal.claim?.foodName}
            </span>
            <p className="text-amber-800 font-medium">
              Outlet: {reviewModal.claim?.providerName} ({reviewModal.claim?.id})
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 block">Beri Rating Kepuasan:</label>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                    reviewForm.rating === star
                      ? 'bg-[#D4A843] text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Rating {star}/5
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 block">Cerita Pengalaman Penyelamatan Pangan:</label>
            <textarea
              rows={4}
              placeholder="Ceritakan kepuasan Anda terhadap rasa makanan, kesegaran, kebersihan kemasan, dan pelayanan outlet..."
              value={reviewForm.text}
              onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setReviewModal({ isOpen: false, claim: null })}>
              Nanti Saja
            </Button>
            <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950 cursor-pointer shadow-xs">
              Kirim Ulasan Terverifikasi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Incident Modal */}
      {incidentModal.isOpen && incidentModal.claim && (
        <Modal
          isOpen={incidentModal.isOpen}
          onClose={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'OUTLET_CLOSED', description: '' })}
          title={`Pusat Pelaporan Kendala: ${incidentModal.claim.code || incidentModal.claim.id}`}
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ticketCode = `INC-CNS-${Date.now().toString().slice(-6)}`;
              setIncidentModal({ isOpen: false, claim: null, issueType: 'OUTLET_CLOSED', description: '' });
              setToastState({
                isOpen: true,
                message: `Laporan Darurat #${ticketCode} berhasil diajukan! Tim Layanan Pengaduan Replate telah menerima eskalasi masalah ini dan akan segera menghubungi Anda.`,
                type: 'success',
              });
            }}
            className="space-y-4 text-xs text-slate-700"
          >
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block">
                PUSAT BANTUAN DARURAT & MEDIASI KONSUMEN REPLATE
              </span>
              <h4 className="text-sm font-black text-red-950">
                Penyelesaian Kendala Pesanan #{incidentModal.claim.code || incidentModal.claim.id}
              </h4>
              <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                Outlet Penyedia: <strong>{incidentModal.claim.providerName}</strong> — Tim kami siap mendampingi proses verifikasi atau pengembalian dana jika terjadi kendala.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Kategori Kendala yang Dialami:</label>
              <select
                value={incidentModal.issueType}
                onChange={(e) => setIncidentModal({ ...incidentModal, issueType: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-[#1B3A5C] focus:ring-2 focus:ring-[#D4A843]"
              >
                <option value="OUTLET_CLOSED">1. Gerai / Outlet Tutup Saat Jadwal Pengambilan</option>
                <option value="FOOD_NOT_AVAILABLE">2. Stok Makanan Habis / Dibatalkan Sepihak oleh Outlet</option>
                <option value="PACKAGING_DAMAGED">3. Kemasan Rusak / Kondisi Makanan Tidak Sesuai Standar SOP</option>
                <option value="PAYMENT_NOT_CONFIRMED">4. Kasir Tidak Menemukan / Belum Menyetujui Pembayaran QRIS</option>
                <option value="QR_SCAN_FAILED">5. Barcode QR Tiket Gagal Di-scan di Mesin Outlet</option>
                <option value="PORTION_MISMATCH">6. Porsi / Menu Tidak Sesuai dengan Rincian Pemesanan</option>
                <option value="OTHER">7. Kendala Pelayanan Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Rincian Kronologi Masalah:</label>
              <textarea
                rows={3}
                required
                placeholder="Jelaskan secara singkat kendala yang terjadi di gerai penyedia..."
                value={incidentModal.description}
                onChange={(e) => setIncidentModal({ ...incidentModal, description: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#D4A843]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'OUTLET_CLOSED', description: '' })}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Kirim Laporan Kendala
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Upload Proof Modal */}
      <Modal isOpen={uploadModal.isOpen} onClose={() => setUploadModal({ isOpen: false, claimId: null })} title="Upload Bukti Transfer">
        <div className="space-y-4 text-slate-700 text-xs">
          <p className="font-medium">Unggah foto bukti transfer dari bank atau e-wallet Anda.</p>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2 text-slate-500">
              <CameraIcon size={24} />
            </div>
            <span className="text-xs font-bold text-slate-600 block">Klik untuk unggah gambar</span>
            <span className="text-[10px] text-slate-400">JPG, PNG, atau PDF · Maks. 5MB</span>
          </div>
          <Button variant="primary" className="w-full font-extrabold shadow-md mt-4 cursor-pointer" onClick={handleUploadProof}>
            Simpan & Kirim Bukti
          </Button>
        </div>
      </Modal>

      {/* Modal Bukti Pengiriman & Serah Terima Konsumen (Poin 13) */}
      {deliveryProofModal.isOpen && (
        <Modal
          isOpen={deliveryProofModal.isOpen}
          onClose={() => setDeliveryProofModal({ isOpen: false, claim: null })}
          title={`Bukti Serah Terima: ${deliveryProofModal.claim?.code || deliveryProofModal.claim?.id || ''}`}
          size="md"
        >
          {deliveryProofModal.claim && (() => {
            const claim = deliveryProofModal.claim;
            return (
              <div className="space-y-4 text-xs text-slate-800">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckIcon size={18} />
                  </div>
                  <div>
                    <strong className="text-emerald-950 font-black text-xs block">
                      Serah Terima Sukses & Terverifikasi
                    </strong>
                    <span className="text-[11px] text-emerald-800">
                      Diserahkan pada {claim.pickupTime || '20:30 WIB'} · Standar Higienitas BPOM RI
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-900 block text-[11px]">
                    Foto Dokumentasi Serah Terima:
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center">
                    <img
                      src={claim.proofImage || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80'}
                      alt="Bukti Serah Terima"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                      <span className="text-white text-[10px] font-bold">
                        📍 Lokasi Penerima: {claim.deliveryAddress || claim.address || 'Alamat Domisili Pengiriman Terdaftar'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Penerima Manfaat:</span>
                    <strong className="text-slate-900">{claim.recipientName || consumerName || 'Budi Santoso'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Diserahkan Oleh:</span>
                    <strong className="text-slate-900">{claim.driver?.name || 'Driver Mitra / Kasir Gerai'}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-400 block font-medium">Catatan Kondisi Makanan:</span>
                    <p className="text-slate-700 font-medium">
                      Makanan surplus diserahkan dalam kemasan higienis yang tersegel rapi, layak konsumsi, dan sesuai pesanan.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeliveryProofModal({ isOpen: false, claim: null })}
                    className="text-xs font-bold"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
