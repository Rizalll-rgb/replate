'use client';

import React, { useEffect, useState } from 'react';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export default function ConsumerBrowsePage() {
  const router = useRouter();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumerName, setConsumerName] = useState('Budi Santoso');
  const [consumerAddress, setConsumerAddress] = useState('Surabaya');

  // Consumer Verification Status ('REGULAR_SAVER' | 'PENDING_VERIFICATION' | 'BENEFICIARY_VERIFIED')
  const [consumerStatus, setConsumerStatus] = useState<'REGULAR_SAVER' | 'PENDING_VERIFICATION' | 'BENEFICIARY_VERIFIED'>('BENEFICIARY_VERIFIED');
  const [sktmNumber, setSktmNumber] = useState('KIS-357890123891');
  const [dailyQuotaLeft, setDailyQuotaLeft] = useState(2);

  // Modal Verification Form State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [proofNumberInput, setProofNumberInput] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string | null>(null);
  const [proofType, setProofType] = useState('SKTM');

  // Mismatch Alert Modal (When Regular Consumer Tries to Claim Free Donasi)
  const [mismatchModal, setMismatchModal] = useState<{ isOpen: boolean; foodName: string }>({
    isOpen: false,
    foodName: '',
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName || parsed.contactPerson) setConsumerName(parsed.entityName || parsed.contactPerson);
        if (parsed.address) setConsumerAddress(parsed.address);
      }
    } catch (_) {}

    // Sync verification status from localStorage if present
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

    // Safeguard: Mismatch check if Free Donation is claimed by unverified regular consumer
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
        message: '⚠️ Kuota klaim gratis Anda hari ini telah habis (Maksimal 2 Porsi/Hari NIK). Kuota akan tereset besok pagi!',
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
      const result = await res.json();
      if (result.success) {
        if (targetFood?.price === 0 || targetFood?.distributionType === 'FREE') {
          setDailyQuotaLeft((prev) => Math.max(0, prev - 1));
        }
        setToastState({
          isOpen: true,
          message: '🎉 Berhasil mengklaim makanan! Kode Resi QR telah diterbitkan.',
          type: 'success',
        });
        setTimeout(() => router.push('/dashboard/consumer/my-claims'), 1500);
      } else {
        setToastState({
          isOpen: true,
          message: result.error || 'Gagal mengklaim makanan.',
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
      alert('Mohon masukkan nomor dokumen SKTM atau kartu bansos resmi!');
      return;
    }

    setConsumerStatus('PENDING_VERIFICATION');
    setSktmNumber(proofNumberInput);
    try {
      localStorage.setItem('replate_consumer_verification_status', 'PENDING_VERIFICATION');
      localStorage.setItem('replate_consumer_verification_proof', proofNumberInput);
    } catch (_) {}

    // Add to admin verification queue cache
    try {
      const existingQueue = JSON.parse(localStorage.getItem('replate_admin_consumer_queue') || '[]');
      const newEntry = {
        id: `CNS-VER-${Date.now()}`,
        name: 'Budi Santoso (Konsumen)',
        email: 'budi.santoso@gmail.com',
        phone: '0813-4567-8901',
        proofType,
        proofNumber: proofNumberInput,
        proofPhoto: proofPhotoUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        submittedAt: 'Baru Saja',
        status: 'PENDING',
      };
      localStorage.setItem('replate_admin_consumer_queue', JSON.stringify([newEntry, ...existingQueue]));
    } catch (_) {}

    setIsVerificationModalOpen(false);
    setToastState({
      isOpen: true,
      message: '✅ Pengajuan verifikasi status rentan berhasil dikirim ke Admin Dinsos Replate! Status dalam antrean verifikasi.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Consumer Verification Banner (Beneficiary vs Regular Saver) */}
      <div className="bg-[#1B3A5C] text-white p-6 rounded-2xl shadow-lg border border-[#2C5A8F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C5A8F]/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-widest block">
                STATUS HAK AKSES PANGAN KONSUMEN REPLATE
              </span>
              {consumerStatus === 'BENEFICIARY_VERIFIED' ? (
                <span className="px-3 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  ✓ TERVERIFIKASI PENERIMA BANTUAN (DONASI Rp 0)
                </span>
              ) : consumerStatus === 'PENDING_VERIFICATION' ? (
                <span className="px-3 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  ⏳ ANTREAN VERIFIKASI SKTM (PENDING ADMIN)
                </span>
              ) : (
                <span className="px-3 py-0.5 bg-blue-400 text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  🛒 KONSUMEN HEMAT (RESCUE SALE DISKON)
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-white">Selamat Datang, {consumerName}! Jelajah Makanan Surplus & Donasi Surabaya</h1>
          </div>

          {/* Quick Toggle Demo Button */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const nextStatus =
                  consumerStatus === 'BENEFICIARY_VERIFIED' ? 'REGULAR_SAVER' : 'BENEFICIARY_VERIFIED';
                setConsumerStatus(nextStatus);
                try {
                  localStorage.setItem('replate_consumer_verification_status', nextStatus);
                } catch (_) {}
              }}
              className="text-[11px] font-bold px-3 py-1.5 bg-[#142C47] hover:bg-[#2C5A8F] border border-[#2C5A8F] text-amber-300 rounded-xl transition-all"
            >
              🔄 Simulasi Role: {consumerStatus === 'BENEFICIARY_VERIFIED' ? 'Penerima Rentan (Rp 0)' : 'Konsumen Biasa'}
            </button>
          </div>
        </div>

        {/* Dynamic Status Guidance Card */}
        {consumerStatus === 'BENEFICIARY_VERIFIED' ? (
          <div className="p-4 bg-[#142C47] rounded-xl border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-extrabold text-emerald-400 block">
                ✓ Akun Anda Terdaftar Sebagai Penerima Bantuan Pangan Terverifikasi Dinsos / SKTM
              </span>
              <p className="text-slate-300 font-medium">
                No. SKTM/KIS: <strong className="font-mono text-amber-300">{sktmNumber}</strong> • Bebas klaim donasi makanan <strong>GRATIS Rp 0</strong> & makanan Rescue Sale.
              </p>
            </div>
            <div className="px-4 py-2 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded-xl font-extrabold text-center shrink-0">
              Sisa Kuota Gratis Hari Ini: <br />
              <span className="text-base text-white">{dailyQuotaLeft} / 2 Porsi</span>
            </div>
          </div>
        ) : consumerStatus === 'PENDING_VERIFICATION' ? (
          <div className="p-4 bg-[#142C47] rounded-xl border border-amber-500/50 space-y-1 text-xs">
            <span className="font-extrabold text-amber-300 block">
              ⏳ Berkas SKTM / Bansos Anda Sedang Ditinjau Tim Verifikasi Replate & Dinsos
            </span>
            <p className="text-slate-300 font-medium">
              Sementara verifikasi diproses (1x24 jam), Anda tetap dapat menikmati makanan surplus diskon murah (Rescue Sale).
            </p>
          </div>
        ) : (
          <div className="p-4 bg-[#142C47] rounded-xl border border-[#2C5A8F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-extrabold text-white block">
                🛒 Anda Terdaftar Sebagai Konsumen Biasa / Pembeli Rescue Sale
              </span>
              <p className="text-slate-300 font-medium">
                Nikmati hemat hingga 70% belanja makanan surplus. Jika Anda masyarakat kurang mampu/rentan, ajukan verifikasi SKTM untuk donasi gratis Rp 0.
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              className="font-extrabold text-xs shrink-0 shadow-md text-slate-950"
              onClick={() => setIsVerificationModalOpen(true)}
            >
              Ajukan Verifikasi SKTM / Donasi Rp 0 ➔
            </Button>
          </div>
        )}
      </div>

      {/* Main Food Explorer Grid */}
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

      <FoodDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        food={selectedFood}
        onClaim={handleClaim}
      />

      {/* Modal Form Ajukan Verifikasi Rentan (SKTM / KIS / KKS) */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="Pengajuan Verifikasi Akun Penerima Bantuan Pangan Rp 0"
        size="md"
      >
        <form onSubmit={handleVerificationSubmit} className="space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <span className="font-extrabold text-blue-900 block">ℹ️ Ketentuan Penerima Donasi Gratis 100%:</span>
            <p className="text-blue-800 leading-relaxed font-medium">
              Donasi Rp 0 dikhususkan untuk warga rentan, lansia, atau masyarakat kurang mampu. Verifikasi ini membutuhkan nomor dokumen resmi (SKTM Kelurahan / Kartu KIS / KKS / PKH).
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">Pilih Jenis Dokumen Pendukung:</label>
            <select
              className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C]"
              value={proofType}
              onChange={(e) => setProofType(e.target.value)}
            >
              <option value="SKTM">Surat Keterangan Tidak Mampu (SKTM Kelurahan)</option>
              <option value="KIS">Kartu Indonesia Sehat (KIS / BPJS PBI)</option>
              <option value="KKS">Kartu Keluarga Sejahtera (KKS Bansos)</option>
              <option value="PKH">Program Keluarga Harapan (PKH)</option>
            </select>
          </div>

          <Input
            label="Nomor Dokumen / Nomor Kartu Resmi"
            placeholder="Contoh: SKTM/2024/0912 atau No. KIS 000189281..."
            value={proofNumberInput}
            onChange={(e) => setProofNumberInput(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">Upload Foto Dokumen SKTM / Kartu Bansos (Opsional):</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 relative">
              {proofPhotoUrl ? (
                <div className="relative">
                  <img src={proofPhotoUrl} alt="Bukti" className="h-32 mx-auto object-cover rounded-lg" />
                  <span className="text-[10px] text-emerald-700 font-extrabold block mt-1">✓ Foto Berkas Terunggah</span>
                </div>
              ) : (
                <label className="cursor-pointer space-y-1 block">
                  <p className="font-bold text-[#1B3A5C]">Klik untuk unggah foto SKTM / KIS</p>
                  <p className="text-[10px] text-slate-400">Format JPG/PNG maks 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setProofPhotoUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsVerificationModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="gold" size="sm" className="font-extrabold text-slate-950">
              Kirim Pengajuan Verifikasi ➔
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Mismatch Alert (Regular Consumer Trying Free Food) */}
      <Modal
        isOpen={mismatchModal.isOpen}
        onClose={() => setMismatchModal({ isOpen: false, foodName: '' })}
        title="Verifikasi Penerima Donasi Makanan Gratis"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Item Khusus Penerima Bantuan Terverifikasi</span>
            </div>
            <p className="text-amber-800 leading-relaxed font-medium">
              Makanan <strong>&quot;{mismatchModal.foodName}&quot;</strong> dialokasikan khusus untuk masyarakat rentan terverifikasi (Donasi Rp 0). Akun Anda saat ini berstatus <strong>Konsumen Biasa (Rescue Sale)</strong>.
            </p>
          </div>

          <p className="text-slate-600 leading-relaxed font-medium">
            Untuk menjaga transparansi dan memastikan makanan jatuh tepat sasaran, Anda dapat:
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setMismatchModal({ isOpen: false, foodName: '' });
                setIsVerificationModalOpen(true);
              }}
              className="w-full p-3 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-extrabold rounded-xl text-left flex items-center justify-between shadow-xs transition-colors"
            >
              <div>
                <span className="block font-extrabold">1. Ajukan Verifikasi SKTM / Kartu Bansos ➔</span>
                <span className="text-[10px] text-slate-300 font-normal">Aktifkan hak klaim makanan Donasi Gratis Rp 0</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMismatchModal({ isOpen: false, foodName: '' })}
              className="w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-xl text-left flex items-center justify-between transition-colors"
            >
              <div>
                <span className="block font-bold">2. Beli Makanan Surplus Rescue Sale (Diskon Murah)</span>
                <span className="text-[10px] text-amber-800 font-normal">Belanja hemat Rp 5.000 – Rp 15.000 untuk masyarakat umum</span>
              </div>
            </button>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setMismatchModal({ isOpen: false, foodName: '' })}>
              Tutup Modal
            </Button>
          </div>
        </div>
      </Modal>

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
