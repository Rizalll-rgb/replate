'use client';

import React, { useEffect, useState } from 'react';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConsumerBrowsePage() {
  const router = useRouter();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumerName, setConsumerName] = useState('Budi Santoso');
  const [consumerAddress, setConsumerAddress] = useState('Surabaya');

  // Consumer Verification Status
  const [consumerStatus, setConsumerStatus] = useState<'REGULAR_SAVER' | 'PENDING_VERIFICATION' | 'BENEFICIARY_VERIFIED'>('BENEFICIARY_VERIFIED');
  const [sktmNumber, setSktmNumber] = useState('KIS-357890123891');
  const [dailyQuotaLeft, setDailyQuotaLeft] = useState(2);

  // Modal Verification Form State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [proofNumberInput, setProofNumberInput] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string | null>(null);
  const [proofType, setProofType] = useState('SKTM');

  // Mismatch Alert Modal
  const [mismatchModal, setMismatchModal] = useState<{ isOpen: boolean; foodName: string }>({
    isOpen: false,
    foodName: '',
  });

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
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName || parsed.contactPerson) setConsumerName(parsed.entityName || parsed.contactPerson);
        if (parsed.address) setConsumerAddress(parsed.address);
      }
    } catch (_) {}

    try {
      const savedStatus = localStorage.getItem('replate_consumer_verification_status');
      if (savedStatus) {
        setConsumerStatus(savedStatus as any);
      }
    } catch (_) {}

    fetch('/api/surplus')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.items)) {
          setFoods(data.data.items);
        } else if (data.success && Array.isArray(data.data)) {
          setFoods(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleClaim = async (id: string) => {
    const targetFood = foods.find((f) => f.id === id);

    if (targetFood && (targetFood.price === 0 || targetFood.distributionType === 'FREE') && consumerStatus !== 'BENEFICIARY_VERIFIED') {
      setMismatchModal({
        isOpen: true,
        foodName: targetFood.foodName || targetFood.title || 'Donasi Makanan Gratis',
      });
      return;
    }

    if (consumerStatus === 'BENEFICIARY_VERIFIED' && dailyQuotaLeft <= 0 && (targetFood?.price === 0 || targetFood?.distributionType === 'FREE')) {
      setToastState({
        isOpen: true,
        message: 'Kuota klaim donasi gratis Anda hari ini telah habis (Maksimal 2 Porsi/Hari NIK). Kuota akan tereset besok pagi.',
        type: 'error',
      });
      return;
    }

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: id, quantity: 1 }),
      });
      const data = await res.json();

      if (data.success) {
        if (targetFood?.price === 0 || targetFood?.distributionType === 'FREE') {
          setDailyQuotaLeft((prev) => Math.max(0, prev - 1));
        }

        try {
          const newClaim = {
            id: data.data?.claimId || `claim-${Date.now()}`,
            foodId: id,
            foodName: targetFood?.foodName || targetFood?.title || 'Surplus Makanan',
            providerName: targetFood?.providerName || 'Mitra Toko',
            quantity: 1,
            totalPrice: targetFood?.price || targetFood?.discountPrice || 0,
            status: 'READY_FOR_PICKUP',
            qrCode: data.data?.qrCodePayload || `REPLATE-CLAIM-${Date.now()}`,
            pickupAddress: targetFood?.pickupAddress || 'Jl. Raya Darmo No. 45, Surabaya',
            pickupDeadline: targetFood?.pickupTime || 'Hari ini 21:00 WIB',
            claimedAt: new Date().toISOString(),
          };
          const existingClaims = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
          localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingClaims]));
        } catch (_) {}

        setToastState({
          isOpen: true,
          message: `Berhasil mengklaim "${targetFood?.foodName || targetFood?.title}". QR Resi Penjemputan siap di menu Klaim Saya.`,
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
    } catch (_) {}

    setIsVerificationModalOpen(false);
    setToastState({
      isOpen: true,
      message: 'Pengajuan verifikasi status rentan berhasil dikirim ke Admin Dinsos Replate.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Consumer Verification Banner */}
      <div className="bg-[#1B3A5C] text-white p-6 rounded-3xl shadow-lg border border-[#2C5A8F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C5A8F]/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-widest block">
                STATUS HAK AKSES PANGAN KONSUMEN
              </span>
              {consumerStatus === 'BENEFICIARY_VERIFIED' ? (
                <span className="px-3 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  ✓ TERVERIFIKASI PENERIMA BANTUAN (DONASI Rp 0)
                </span>
              ) : consumerStatus === 'PENDING_VERIFICATION' ? (
                <span className="px-3 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  MENUNGGU AUDIT DINSOS
                </span>
              ) : (
                <span className="px-3 py-0.5 bg-blue-400 text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  KONSUMEN REGULER (RESCUE SALE DISKON)
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white">Selamat Datang, {consumerName}</h2>
            <p className="text-xs text-slate-200 font-medium">
              Alamat: <strong>{consumerAddress}</strong> • ID Pengguna: <span className="font-mono text-[#D4A843]">CNS-SBY-2026</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 shadow-md">
                Buka Tas Klaim ➔
              </Button>
            </Link>
          </div>
        </div>

        {consumerStatus === 'BENEFICIARY_VERIFIED' && (
          <div className="p-4 bg-[#142C47] rounded-2xl border border-[#2C5A8F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-[#D4A843]">Nomor Registrasi SKTM / KIS:</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                  {sktmNumber}
                </span>
              </div>
              <p className="text-slate-300 font-medium">
                Hak Akses: Bebas klaim donasi makanan Rp 0 (Maks. 2 Porsi/Hari) dan Rescue Sale diskon murah.
              </p>
            </div>
            <div className="text-right sm:text-right shrink-0">
              <span className="text-[11px] text-slate-400 block">Sisa Kuota Gratis Hari Ini:</span>
              <strong className="text-base font-black text-emerald-400">{dailyQuotaLeft} Porsi Tersisa</strong>
            </div>
          </div>
        )}
      </div>

      {/* SMART MATCHING 2.0: REKOMENDASI HEMAT CERDAS UNTUK KONSUMEN */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
              SMART MATCHING ENGINE 2.0 (UNTUK KONSUMEN)
            </span>
            <h3 className="text-lg font-black text-[#1B3A5C]">
              Rekomendasi Paling Cocok Berdasarkan Lokasi & Preferensi Anda
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">Radius &lt; 1.5 km</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smartMatchedItems.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-gradient-to-br from-white to-amber-50/40 rounded-3xl border-2 border-amber-300/80 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between"
            >
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#1B3A5C] text-[#D4A843] font-black text-[10px] rounded-md font-mono">
                      Skor Kecocokan {item.matchScore}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">📍 {item.distance}</span>
                  </div>
                  <h4 className="font-black text-xs text-[#1B3A5C]">{item.title}</h4>
                  <p className="text-[10px] text-amber-900 font-bold">{item.reason}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200">
                <div className="text-left sm:text-right">
                  <span className="text-xs font-black text-[#1B3A5C] block">Rp {item.price.toLocaleString('id-ID')}</span>
                  <span className="text-[10px] text-slate-400 line-through">Rp {item.originalPrice.toLocaleString('id-ID')}</span>
                </div>
                <Link href="/explore">
                  <Button variant="gold" size="sm" className="font-black text-[11px] text-slate-950 px-3 py-1.5 shadow-xs whitespace-nowrap">
                    Klaim Cepat ➔
                  </Button>
                </Link>
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

      {/* Modal Mismatch Alert */}
      <Modal
        isOpen={mismatchModal.isOpen}
        onClose={() => setMismatchModal({ isOpen: false, foodName: '' })}
        title="Verifikasi Hak Akses Donasi Makanan Rp 0"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <span className="font-extrabold text-amber-900 text-sm block">
              Makanan Bebas Biaya Khusus Panti Asuhan & Warga Rentan SKTM
            </span>
            <p className="text-amber-800 leading-relaxed font-medium">
              Makanan <strong>&quot;{mismatchModal.foodName}&quot;</strong> dialokasikan khusus untuk yayasan panti asuhan atau masyarakat kurang mampu terverifikasi SKTM.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full font-extrabold text-xs"
              onClick={() => {
                setMismatchModal({ isOpen: false, foodName: '' });
                router.push('/explore');
              }}
            >
              Pilih Makanan Rescue Sale (Diskon Murah) ➔
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
