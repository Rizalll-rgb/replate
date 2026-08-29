'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

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
      id: 'CLM-CNS-2026-9812',
      foodName: 'Nasi Paket Ayam Bakar Specialty',
      providerName: 'Warung Bakso Pak Kumis Surabaya',
      totalAmount: 10000,
      status: 'READY_FOR_PICKUP',
      createdAt: 'Hari ini, 19:15 WIB',
      pickupTime: 'Hari ini 21:00 WIB',
    },
    {
      id: 'CLM-CNS-2026-4410',
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

  const handleUploadProof = () => {
    if (!uploadModal.claimId) return;

    const updated = claims.map((c) =>
      c.id === uploadModal.claimId ? { ...c, status: 'AWAITING_VERIFICATION' as const } : c
    );
    setClaims(updated);
    try {
      localStorage.setItem('replate_active_claims', JSON.stringify(updated));
    } catch (_) {}

    setToastState({
      isOpen: true,
      message: '✓ Bukti transfer berhasil diunggah! Menunggu verifikasi dari Mitra.',
      type: 'success',
    });
    setUploadModal({ isOpen: false, claimId: null });
  };

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    text: '',
  });

  const [toastState, setToastState] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      const saved = localStorage.getItem('replate_active_claims');

      if (isFresh) {
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map((item: any) => ({
              id: item.id,
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
              id: item.id,
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

  const handleMarkCompleted = (claimId: string) => {
    const updated = claims.map((c) =>
      c.id === claimId ? { ...c, status: 'COMPLETED' as const, pickupTime: 'Selesai Diambil' } : c
    );
    setClaims(updated);
    try {
      localStorage.setItem('replate_active_claims', JSON.stringify(updated));
    } catch (_) {}

    setToastState({
      isOpen: true,
      message: '✓ Status pengambilan berhasil diselesaikan. Silakan bagikan ulasan Anda!',
      type: 'success',
    });
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

      setToastState({
        isOpen: true,
        message: '🎉 Ulasan terverifikasi berhasil disimpan dan langsung tayang di Beranda Publik Replate!',
        type: 'success',
      });

      setReviewModal({ isOpen: false, claim: null });
    } catch (_) {}
  };

  const filteredClaims = claims.filter((c) =>
    activeTab === 'ACTIVE' ? c.status !== 'COMPLETED' : c.status === 'COMPLETED'
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            MANAJEMEN KLAIM PANGAN REPLATE
          </span>
          <h2 className="text-2xl font-black text-[#1B3A5C]">Klaim & Riwayat Saya</h2>
          <p className="text-xs text-slate-500 font-medium">
            Tunjukkan QR Code kepada kasir outlet atau berikan ulasan transaksi selesai.
          </p>
        </div>

        <Link href="/explore">
          <Button variant="gold" size="sm" className="font-extrabold text-xs text-slate-950 shadow-xs">
            + Tambah Klaim Baru
          </Button>
        </Link>
      </div>

      {/* Tab Filter */}
      <div className="flex p-1 bg-slate-200/70 rounded-2xl max-w-xs">
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
            activeTab === 'ACTIVE' ? 'bg-[#1B3A5C] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Klaim Aktif ({claims.filter((c) => c.status !== 'COMPLETED').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
            activeTab === 'HISTORY' ? 'bg-[#1B3A5C] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Riwayat Selesai ({claims.filter((c) => c.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Claim Cards List */}
      {filteredClaims.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <span className="text-4xl block">📦</span>
          <h4 className="font-extrabold text-base text-[#1B3A5C]">
            {activeTab === 'ACTIVE' ? 'Tidak ada klaim aktif saat ini' : 'Belum ada riwayat transaksi selesai'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Temukan makanan diskon murah atau donasi steril di halaman Eksplor Pangan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClaims.map((claim) => (
            <Card key={claim.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">{claim.id}</span>
                  <h3 className="font-black text-base text-[#1B3A5C] mt-0.5">{claim.foodName}</h3>
                  <p className="text-xs text-slate-500 font-medium">🏪 {claim.providerName}</p>
                </div>

                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-full ${
                    claim.status === 'COMPLETED'
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : claim.status === 'READY_FOR_PICKUP'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : claim.status === 'AWAITING_PAYMENT'
                      ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {claim.status === 'COMPLETED' ? '✓ SELESAI' 
                    : claim.status === 'READY_FOR_PICKUP' ? '📦 SIAP DIAMBIL' 
                    : claim.status === 'AWAITING_PAYMENT' ? '💳 MENUNGGU PEMBAYARAN'
                    : '⏳ MENUNGGU VERIFIKASI MITRA'}
                </span>
              </div>

              {claim.status === 'AWAITING_PAYMENT' && (
                <div className="space-y-4">
                  {(!claim.paymentMethod || claim.paymentMethod === 'QRIS') ? (
                    <div className="p-4 bg-white border-2 border-slate-300 rounded-2xl shadow-inner max-w-xs mx-auto space-y-2 text-center">
                      <img
                        src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60"
                        alt="QRIS Code"
                        className="w-48 h-48 mx-auto object-cover rounded-xl border border-slate-200"
                      />
                      <span className="font-mono text-[11px] font-black text-slate-800 block">
                        NMID: ID102026891230491
                      </span>
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
                    Upload Bukti Transfer ➔
                  </Button>
                </div>
              )}

              {(claim.status === 'AWAITING_VERIFICATION' || claim.status === 'WAITING_PAYMENT_APPROVAL') && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                  <p className="text-xs font-bold text-amber-800">
                    Bukti pembayaran sedang diverifikasi oleh Mitra. Harap tunggu sesaat...
                  </p>
                </div>
              )}

              {claim.status === 'READY_FOR_PICKUP' && (
                <div className="space-y-4">
                  <QRGenerator
                    value={claim.id}
                    codeTitle="QR Barcode Pengambilan"
                    codeSubtitle="Tunjukkan kepada kasir outlet saat pengambilan makanan"
                  />

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleMarkCompleted(claim.id)}
                      className="flex-1 font-extrabold text-xs text-slate-950 shadow-xs"
                    >
                      Konfirmasi Selesai ➔
                    </Button>
                  </div>
                </div>
              )}
              
              {claim.status === 'COMPLETED' && (
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
                    onClick={() => handleOpenReview(claim)}
                    className="font-black text-xs text-slate-950 shrink-0 shadow-xs whitespace-nowrap"
                  >
                    ⭐ Beri Ulasan Dampak ➔
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal Review Submission */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, claim: null })}
        title="⭐ Beri Ulasan & Cerita Dampak Terverifikasi"
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
                  {'★'.repeat(star)} ({star})
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
            <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950">
              Kirim Ulasan Terverifikasi ➔
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Alert */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Upload Proof Modal */}
      <Modal isOpen={uploadModal.isOpen} onClose={() => setUploadModal({ isOpen: false, claimId: null })} title="Upload Bukti Transfer">
        <div className="space-y-4 text-slate-700">
          <p className="text-xs font-medium">Unggah foto bukti transfer dari bank atau e-wallet Anda.</p>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
            <span className="text-4xl block mb-2">📸</span>
            <span className="text-xs font-bold text-slate-500">Klik untuk unggah gambar</span>
          </div>
          <Button variant="primary" className="w-full font-extrabold shadow-md mt-4" onClick={handleUploadProof}>
            Simpan & Kirim Bukti ➔
          </Button>
        </div>
      </Modal>
    </div>
  );
}
