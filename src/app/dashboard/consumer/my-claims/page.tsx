'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ClockIcon,
  SparklesIcon,
  CameraIcon,
  PlusIcon,
  QrCodeIcon,
  TruckIcon,
  AlertTriangleIcon,
} from '@/components/ui/Icon';

interface ClaimItem {
  id: string;
  foodName?: string;
  providerName: string;
  totalAmount: number;
  paymentMethod?: string;
  address?: string;
  status: 'AWAITING_PAYMENT' | 'AWAITING_VERIFICATION' | 'WAITING_PAYMENT_APPROVAL' | 'READY_FOR_PICKUP' | 'COMPLETED' | string;
  createdAt: string;
  pickupTime: string;
  items?: any[];
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([
    {
      id: 'RPL-CNS-2026-9812',
      foodName: 'Nasi Paket Ayam Bakar Specialty',
      providerName: 'Warung Bakso Pak Kumis Surabaya',
      totalAmount: 10000,
      status: 'READY_FOR_PICKUP',
      createdAt: 'Hari ini, 19:15 WIB',
      pickupTime: 'Hari ini 21:00 WIB',
    },
    {
      id: 'RPL-CNS-2026-4410',
      foodName: 'Bakso Sapi Urat Super & Kuah Steril (2 Porsi)',
      providerName: 'Warung Bakso Pak Kumis Surabaya',
      totalAmount: 10000,
      status: 'COMPLETED',
      createdAt: 'Kemarin, 20:30 WIB',
      pickupTime: 'Selesai Diambil',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
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

  // Incident Modal (Poin 2 - benchmark provider)
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

  // QRIS setup from provider profile (Poin 4)
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
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      const saved = localStorage.getItem('replate_active_claims');

      if (isFresh) {
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map((item: any) => ({
              id: item.code || item.id,
              foodName: item.items?.map((i: any) => `${i.title || i.foodName || i.name} (${i.quantity})`).join(', ') || item.foodName || 'Surplus Makanan Steril',
              providerName: item.providerName || 'Outlet Provider',
              totalAmount: item.totalAmount || 10000,
              status: item.status || 'READY_FOR_PICKUP',
              createdAt: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Hari ini',
              pickupTime: item.pickupTime || '21:00 WIB',
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
            foodName: item.items?.map((i: any) => `${i.title || i.foodName || i.name} (${i.quantity})`).join(', ') || item.foodName || 'Surplus Makanan Steril',
            providerName: item.providerName || 'Warung Bakso Pak Kumis',
            totalAmount: item.totalAmount || 10000,
            status: item.status || 'READY_FOR_PICKUP',
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Hari ini',
            pickupTime: item.pickupTime || '21:00 WIB',
          }));
          const combined = [...mapped, ...claims.slice(1)];
          const unique = Array.from(new Map(combined.map((c) => [c.id, c])).values());
          setClaims(unique);
        }
      }
    } catch (_) {}
  }, []);

  const handleUploadProof = () => {
    if (!uploadModal.claimId) return;

    setActionLoader({
      isOpen: true,
      message: 'Mengunggah Bukti Transfer...',
      submessage: 'Menyinkronkan ke meja kasir provider toko',
    });

    setTimeout(() => {
      const updated = claims.map((c) =>
        c.id === uploadModal.claimId ? { ...c, status: 'WAITING_PAYMENT_APPROVAL' as const } : c
      );
      setClaims(updated);
      try {
        localStorage.setItem('replate_active_claims', JSON.stringify(updated));
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

  const handleMarkCompleted = (claimId: string) => {
    setActionLoader({
      isOpen: true,
      message: 'Menyelesaikan Klaim...',
      submessage: 'Memvalidasi serah terima makanan',
    });

    setTimeout(() => {
      const updated = claims.map((c) =>
        c.id === claimId ? { ...c, status: 'COMPLETED' as const, pickupTime: 'Selesai Diambil' } : c
      );
      setClaims(updated);
      try {
        localStorage.setItem('replate_active_claims', JSON.stringify(updated));
      } catch (_) {}

      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Status pengambilan berhasil diselesaikan. Silakan bagikan ulasan Anda!',
        type: 'success',
      });
    }, 1000);
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
      submessage: 'Menyimpan cerita dampak terverifikasi',
    });

    setTimeout(() => {
      let reviewerName = 'Konsumen Replate';
      try {
        const profile = localStorage.getItem('replate_onboarding_profile');
        if (profile) {
          const parsed = JSON.parse(profile);
          reviewerName = parsed.entityName || parsed.contactPerson || reviewerName;
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
        message: 'Ulasan terverifikasi berhasil disimpan dan langsung tayang di Beranda Publik Replate!',
        type: 'success',
      });

      setReviewModal({ isOpen: false, claim: null });
    }, 1000);
  };

  const filteredClaims = claims.filter((c) =>
    activeTab === 'ACTIVE' ? c.status !== 'COMPLETED' : c.status === 'COMPLETED'
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            MANAJEMEN KLAIM PANGAN REPLATE
          </span>
          <h2 className="text-2xl font-black text-[#1B3A5C]">Klaim & Riwayat Saya</h2>
          <p className="text-xs text-slate-500 font-medium">
            Tunjukkan tiket QR kepada kasir outlet atau berikan ulasan transaksi selesai.
          </p>
        </div>

        <Link href="/dashboard/explore">
          <Button variant="gold" size="sm" leftIcon={<PlusIcon size={13} className="text-slate-950" />} className="font-extrabold text-xs text-slate-950 shadow-xs">
            Tambah Klaim Baru
          </Button>
        </Link>
      </div>

      {/* Tab Filter */}
      <div className="flex p-1 bg-slate-200/70 rounded-2xl max-w-xs">
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'ACTIVE' ? 'bg-[#1B3A5C] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <ClockIcon size={12} />
          <span>Klaim Aktif ({claims.filter((c) => c.status !== 'COMPLETED').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'HISTORY' ? 'bg-[#1B3A5C] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <CheckIcon size={12} />
          <span>Riwayat ({claims.filter((c) => c.status === 'COMPLETED').length})</span>
        </button>
      </div>

      {/* Claim Cards List */}
      {filteredClaims.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <PackageIcon size={28} />
          </div>
          <h4 className="font-extrabold text-base text-[#1B3A5C]">
            {activeTab === 'ACTIVE' ? 'Tidak ada klaim aktif saat ini' : 'Belum ada riwayat transaksi selesai'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Temukan makanan diskon murah atau donasi steril di halaman Eksplor Pangan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClaims.map((claim) => {
            const isPaymentPending = claim.status === 'AWAITING_PAYMENT';
            const isVerificationPending = claim.status === 'AWAITING_VERIFICATION' || claim.status === 'WAITING_PAYMENT_APPROVAL' || claim.status === 'PENDING_APPROVAL';
            const isInTransit = claim.status === 'IN_TRANSIT';
            const isReady = claim.status === 'READY_FOR_PICKUP';
            const isDone = claim.status === 'COMPLETED';

            return (
              <Card key={claim.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{claim.id}</span>
                    <h3 className="font-black text-base text-[#1B3A5C] mt-0.5">{claim.foodName}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <ShieldCheckIcon size={12} className="text-slate-400" />
                      <span>{claim.providerName}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 ${
                      isDone
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : isReady
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isInTransit
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : isPaymentPending
                        ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                        : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckIcon size={10} />
                        <span>SELESAI</span>
                      </>
                    ) : isReady ? (
                      <>
                        <PackageIcon size={10} />
                        <span>SIAP DIAMBIL</span>
                      </>
                    ) : isInTransit ? (
                      <>
                        <TruckIcon size={10} />
                        <span>DALAM PENGIRIMAN</span>
                      </>
                    ) : isPaymentPending ? (
                      <>
                        <CreditCardIcon size={10} />
                        <span>MENUNGGU PEMBAYARAN</span>
                      </>
                    ) : (
                      <>
                        <ClockIcon size={10} />
                        <span>MENUNGGU APPROVAL PROVIDER</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Status Awaiting Payment */}
                {isPaymentPending && (
                  <div className="space-y-4">
                    {(!claim.paymentMethod || claim.paymentMethod === 'QRIS') ? (
                      <div className="p-4 bg-white border-2 border-slate-300 rounded-2xl shadow-sm max-w-xs mx-auto space-y-2.5 text-center">
                        <div className="border-b border-slate-200 pb-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-black text-sm tracking-widest text-[#1B3A5C]">QRIS</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">National Standard</span>
                          </div>
                          <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">NMID: {providerQris.nmid}</p>
                        </div>
                        <div className="w-44 h-44 mx-auto rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                          <img
                            src={providerQris.imageUrl}
                            alt="Barcode QRIS Toko"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="border-t border-slate-200 pt-1.5 space-y-0.5">
                          <h5 className="font-black text-xs text-[#1B3A5C] truncate">{providerQris.merchantName || claim.providerName}</h5>
                          <p className="text-[10px] text-slate-500 font-medium">{providerQris.bank} • {providerQris.accountNo}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white border-2 border-slate-300 rounded-2xl shadow-inner mx-auto space-y-3 text-center">
                        <h4 className="font-bold text-slate-800 text-sm">Transfer Bank {claim.paymentMethod}</h4>
                        <div className="bg-slate-100 py-3 rounded-xl border border-slate-200">
                          <span className="font-mono text-xl font-black text-[#1B3A5C] tracking-wider block">
                            {claim.paymentMethod === 'BCA' ? '8077 1234 5678' : claim.paymentMethod === 'MANDIRI' ? '89012 3456 7890' : claim.paymentMethod === 'BNI' ? '8210 9876 5432' : '8888 1234 5678'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Virtual Account Replate Indonesia</p>
                      </div>
                    )}
                    
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center space-y-2">
                      <p className="text-xs font-bold text-red-800">
                        Silakan {(!claim.paymentMethod || claim.paymentMethod === 'QRIS') ? 'scan QRIS di atas' : 'transfer ke VA di atas'} untuk membayar sebesar:
                      </p>
                      <p className="text-2xl font-black text-red-900">Rp {claim.totalAmount.toLocaleString('id-ID')}</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full font-extrabold text-xs shadow-md"
                      onClick={() => setUploadModal({ isOpen: true, claimId: claim.id })}
                    >
                      Upload Bukti Transfer
                    </Button>
                  </div>
                )}

                {/* Status Waiting Verification */}
                {isVerificationPending && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-xs">
                      <ClockIcon size={14} className="text-amber-600" />
                      <span>Bukti pembayaran sedang diverifikasi kasir provider toko.</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Tiket QR Handover resmi akan otomatis terbit di sini setelah pembayaran disetujui.
                    </p>
                  </div>
                )}

                {/* Status Ready for Pickup */}
                {isReady && (
                  <div className="space-y-4">
                    <QRGenerator
                      value={`REPLATE-CNS-${claim.id}`}
                      codeTitle="Tiket QR Serah Terima"
                      codeSubtitle="Tunjukkan kepada kasir outlet saat pengambilan makanan"
                      foodName={claim.foodName}
                      portions={`${claim.totalAmount > 0 ? `Total: Rp ${claim.totalAmount.toLocaleString('id-ID')}` : 'Donasi Gratis'}`}
                      providerName={claim.providerName}
                      recipientName="Konsumen Terverifikasi"
                    />

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<CheckIcon size={13} className="text-slate-950" />}
                        onClick={() => handleMarkCompleted(claim.id)}
                        className="flex-1 font-extrabold text-xs text-slate-950 shadow-xs cursor-pointer"
                      >
                        Konfirmasi Selesai Diambil
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<AlertTriangleIcon size={13} className="text-red-600" />}
                        onClick={() => setIncidentModal({ isOpen: true, claim, issueType: 'OUTLET_CLOSED', description: '' })}
                        className="font-bold text-xs text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                      >
                        Laporkan Kendala
                      </Button>
                    </div>
                  </div>
                )}

                {/* Laporkan Kendala for pending payment/verification */}
                {(isPaymentPending || isVerificationPending) && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIncidentModal({ isOpen: true, claim, issueType: 'PAYMENT_ISSUE', description: '' })}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <AlertTriangleIcon size={12} />
                      <span>Laporkan Kendala / Masalah Pembayaran</span>
                    </button>
                  </div>
                )}
                
                {/* Status Completed */}
                {isDone && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-[11px] font-black text-slate-800 block">
                        Transaksi Selesai & Makanan Telah Diterima
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Bagikan ulasan Anda untuk ditampilkan di galeri Kisah Nyata Beranda Replate.
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
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Review Submission */}
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
              Batal
            </Button>
            <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950 cursor-pointer">
              Kirim Ulasan Terverifikasi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Incident / Pelaporan Kendala (Benchmark Role Provider) */}
      {incidentModal.isOpen && incidentModal.claim && (
        <Modal
          isOpen={incidentModal.isOpen}
          onClose={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'OUTLET_CLOSED', description: '' })}
          title={`Pusat Pelaporan Kendala: ${incidentModal.claim.id}`}
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
                Penyelesaian Kendala Pesanan #{incidentModal.claim.id}
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
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Kirim Laporan Kendala
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast Alert */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

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
    </div>
  );
}
