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

  const handleQuickClaim = (item: any) => {
    router.push(`/dashboard/checkout/${item.id}`);
  };

  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumerName, setConsumerName] = useState('Budi Santoso');
  const [consumerAddress, setConsumerAddress] = useState('Surabaya');

  // Consumer Verification Status
  const [consumerStatus, setConsumerStatus] = useState<'REGULAR_SAVER' | 'PENDING_VERIFICATION' | 'BENEFICIARY_VERIFIED'>('BENEFICIARY_VERIFIED');
  const [sktmNumber, setSktmNumber] = useState('KIS-357890123891');
  const [dailyQuotaLeft, setDailyQuotaLeft] = useState(2);
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

      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName || parsed.contactPerson) setConsumerName(parsed.entityName || parsed.contactPerson);
        if (parsed.address) setConsumerAddress(parsed.address);
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
  }, []);

  const handleClaim = async (id: string) => {
    const targetFood = foods.find((f) => f.id === id);



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
        } catch (_) { }

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
      {/* Sleek Modern Header Card (Seragam Antar Modul & Role) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Dashboard Food Consumer
              </span>
              {consumerStatus === 'BENEFICIARY_VERIFIED' ? (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Penerima Bantuan (Donasi Rp 0)</span>
                </span>
              ) : consumerStatus === 'PENDING_VERIFICATION' ? (
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Menunggu Verifikasi Dinsos</span>
                </span>
              ) : (
                <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>Konsumen Reguler (Rescue Sale)</span>
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              Selamat Datang, {consumerName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Alamat: <strong>{consumerAddress}</strong> · ID: <span className="font-mono text-[#D4A843]">CNS-2026</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/explore">
              <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer">
                Eksplor Makanan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-0.5">
              SMART MATCHING ENGINE 2.0 (KONSUMEN)
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-base sm:text-xl font-black text-[#1B3A5C]">
                Rekomendasi Paling Cocok
              </h3>
              {syncRadius && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] sm:text-[10px] font-black rounded-md self-start sm:self-auto">
                  Radius: &lt; {syncRadius} km
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 whitespace-nowrap">
            Radius &lt; {syncRadius || 1.5} km
          </span>
        </div>

        {/* Horizontal Peek Carousel on mobile, 2-column grid on desktop */}
        <div className="flex md:grid md:grid-cols-2 gap-3 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-2">
          {smartMatchedItems.map((item) => (
            <div
              key={item.id}
              className="w-[85vw] max-w-[340px] md:w-auto shrink-0 snap-start p-4 sm:p-5 bg-gradient-to-br from-white to-amber-50/40 rounded-2xl sm:rounded-3xl border-2 border-amber-300/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3 w-full">
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
                <Button
                  onClick={() => handleQuickClaim(item)}
                  variant="gold"
                  size="sm"
                  className="font-black text-[11px] text-slate-950 px-3 py-1.5 shadow-xs whitespace-nowrap cursor-pointer"
                >
                  Klaim Cepat ➔
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
