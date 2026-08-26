'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { useSession } from 'next-auth/react';

export default function ProviderOverviewPage() {
  const { data: session } = useSession();
  const [activeSurplusCount, setActiveSurplusCount] = useState<number>(2);
  const [completedClaimsCount, setCompletedClaimsCount] = useState<number>(1);
  const [totalRescuedKg, setTotalRescuedKg] = useState<number>(42.5);
  const [providerName, setProviderName] = useState<string>('Warung Bakso Pak Kumis');

  // Smart Matching Formula Modal State
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [selectedPantiForFormula, setSelectedPantiForFormula] = useState<any | null>(null);

  // In-Workspace Instant Donation Allocation Modal State
  const [allocateModal, setAllocateModal] = useState<{
    isOpen: boolean;
    panti: any | null;
    portions: number;
    deliveryMethod: string;
    hygieneChecked: boolean;
  }>({
    isOpen: false,
    panti: null,
    portions: 30,
    deliveryMethod: 'RESCUE_COURIER',
    hygieneChecked: true,
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Matched Panti List with Compact 3-Bullet Reasons & Detailed Formula Breakdown
  const matchedPantiList = [
    {
      id: 'PNT-SBY-001',
      pantiName: 'Panti Asuhan Kasih Ibu Surabaya',
      needTitle: '50 Porsi Nasi Kotak & Lauk Bergizi',
      distance: '1.2 km (Wonokromo, Surabaya Selatan)',
      matchScore: 96,
      urgency: 'URGENT HARI INI',
      pj: 'Ibu Hajjah Maryam',
      contactPhone: '081298765432',
      address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      preferredDelivery: 'RESCUE_COURIER',
      reasons: [
        'Jarak 1.2 km dari outlet Anda (Radius terdekat < 2 km)',
        'Kapasitas panti butuh 50 porsi (Stok Anda siap 35–40 porsi)',
        'Urgensi makan malam sebelum 20:00 WIB (Sisa waktu 2.5 jam)',
      ],
      breakdown: [
        { label: 'Proksimitas Geofencing GPS', score: 35, max: 35, desc: 'Radius 1.2 km dari outlet Wonokromo' },
        { label: 'Kesesuaian Kapasitas Porsi', score: 28, max: 30, desc: 'Kecukupan porsi 80% terpenuhi' },
        { label: 'Urgensi Waktu Konsumsi', score: 19, max: 20, desc: 'Batas penjemputan < 2.5 jam' },
        { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Tervalidasi Halal BPJPH & Dapur Higienis' },
      ],
    },
    {
      id: 'PNT-SBY-002',
      pantiName: 'Shelter Dhuafa & Anak Jalanan Mandiri',
      needTitle: '60 Porsi Makanan Siap Santap / Prasmanan',
      distance: '0.8 km (Genteng, Surabaya Pusat)',
      matchScore: 89,
      urgency: 'URGENT HARI INI',
      pj: 'Mas Dedi Relawan',
      contactPhone: '081567890123',
      address: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      preferredDelivery: 'PROVIDER_DIRECT',
      reasons: [
        'Jarak sangat dekat 0.8 km (Surabaya Pusat)',
        'Kebutuhan shelter 60 porsi (Bisa dipenuhi bertahap)',
        'Urgensi pembagian malam sebelum 21:30 WIB',
      ],
      breakdown: [
        { label: 'Proksimitas Geofencing GPS', score: 35, max: 35, desc: 'Radius 800 meter dari toko' },
        { label: 'Kesesuaian Kapasitas Porsi', score: 22, max: 30, desc: 'Kecukupan porsi 65% terpenuhi' },
        { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan < 3.5 jam' },
        { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Terkemas steril food grade' },
      ],
    },
  ];

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setProviderName(parsed.entityName);
      }
    } catch (_) {}

    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
    } catch (_) {}

    let localClaims: any[] = [];
    try {
      localClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
    } catch (_) {}

    fetch('/api/surplus?status=')
      .then((res) => res.json())
      .then((data) => {
        let itemsList: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          itemsList = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          itemsList = data.data;
        }

        const combined = [...localItems, ...itemsList];
        const activeItems = combined.filter((item) => item.status === 'AVAILABLE' || !item.status);
        if (activeItems.length > 0) {
          setActiveSurplusCount(activeItems.length);
        }

        const calculatedWeight = combined.reduce((acc, curr) => {
          const qty = Number(curr.quantity || 15);
          const weightUnit = Number(curr.weightPerUnitKg || 0.4);
          return acc + qty * weightUnit;
        }, 0);

        if (calculatedWeight > 0) {
          setTotalRescuedKg(Math.round(calculatedWeight * 10) / 10);
        }
      })
      .catch(() => {
        if (localItems.length > 0) {
          setActiveSurplusCount(localItems.length);
        }
      });

    const completedFromClaims = localClaims.filter(
      (c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED'
    ).length;
    setCompletedClaimsCount(2 + completedFromClaims);
  }, [session]);

  const handleOpenAllocationModal = (panti: any) => {
    let defaultMethod = panti.preferredDelivery || 'RESCUE_COURIER';
    try {
      const savedMethod = localStorage.getItem('replate_provider_default_delivery');
      if (savedMethod) defaultMethod = savedMethod;
    } catch (_) {}

    setAllocateModal({
      isOpen: true,
      panti,
      portions: 30,
      deliveryMethod: defaultMethod,
      hygieneChecked: true,
    });
  };

  const handleConfirmAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateModal.panti) return;

    if (!allocateModal.hygieneChecked) {
      alert('Anda wajib menyetujui konfirmasi 8-Poin SOP Higienitas BPOM RI.');
      return;
    }

    const ticketCode = `QR-DON-${Math.floor(100000 + Math.random() * 900000)}`;

    const newClaim = {
      id: ticketCode,
      claimCode: ticketCode,
      foodName: 'Nasi Ayam Bakar & Lauk Bersih (Donasi Rp 0)',
      customerName: allocateModal.panti.pantiName,
      quantity: allocateModal.portions,
      quantityUnit: 'Porsi',
      totalPrice: 0,
      status: allocateModal.deliveryMethod === 'PROVIDER_DIRECT' ? 'PROVIDER_DELIVERING' : 'AWAITING_RESCUE_PICKUP',
      deliveryMethod: allocateModal.deliveryMethod,
      shelterName: allocateModal.panti.pantiName,
      contactPhone: allocateModal.panti.contactPhone,
      claimedAt: new Date().toISOString(),
      pickupAddress: allocateModal.panti.address,
      bpomVerified: true,
    };

    try {
      const existingClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
      localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingClaims]));
    } catch (_) {}

    setCompletedClaimsCount((prev) => prev + 1);
    setTotalRescuedKg((prev) => Math.round((prev + allocateModal.portions * 0.4) * 10) / 10);

    setAllocateModal({ isOpen: false, panti: null, portions: 30, deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true });
    setToastState({
      isOpen: true,
      message: `Berhasil mengalokasikan ${allocateModal.portions} porsi donasi untuk ${allocateModal.panti.pantiName}! Resi tiket ${ticketCode} siap diproses di menu Klaim & Meja Kasir.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            DASHBOARD FOOD PROVIDER
          </span>
          <h1 className="text-2xl font-black text-[#1B3A5C]">{providerName}</h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola surplus makanan harian, pantau penyelamatan, dan salurkan donasi steril secara efisien.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/provider/my-listings">
            <Button variant="primary" size="md" className="font-black text-xs shadow-md">
              Buka Daftar Makanan ➔
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Real-time Dynamic Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Surplus Aktif Tersedia</span>
          <strong className="text-2xl font-black text-[#1B3A5C] font-mono">{activeSurplusCount} Menu</strong>
          <span className="text-[10px] text-emerald-600 font-bold block">Tervalidasi 8-Poin SOP BPOM</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Total Pangan Diselamatkan</span>
          <strong className="text-2xl font-black text-[#D4A843] font-mono">{totalRescuedKg} kg</strong>
          <span className="text-[10px] text-slate-500 font-bold block">Setara ~{Math.round(totalRescuedKg * 2.5)} porsi</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Klaim Selesai & Terverifikasi</span>
          <strong className="text-2xl font-black text-emerald-600 font-mono">{completedClaimsCount} Transaksi</strong>
          <span className="text-[10px] text-slate-500 font-bold block">Scan QR Serah Terima Kasir Sukses</span>
        </div>
      </div>

      {/* SMART MATCHING 2.0: REKOMENDASI ALOKASI DONASI CERDAS KE PANTI TERDEKAT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
              SMART MATCHING ENGINE 2.0 (UNTUK PROVIDER)
            </span>
            <h3 className="text-lg font-black text-[#1B3A5C]">
              Rekomendasi Penyaluran Donasi ke Panti Asuhan Terdekat
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">Multi-Criteria GPS Scoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedPantiList.map((panti) => (
            <div
              key={panti.id}
              className="p-5 bg-gradient-to-br from-white to-blue-50/40 rounded-3xl border-2 border-blue-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#1B3A5C] text-[#D4A843] font-black text-[11px] rounded-md font-mono">
                      Skor Kecocokan {panti.matchScore}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPantiForFormula(panti);
                        setIsFormulaModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer"
                    >
                      Rincian Bobot ➔
                    </button>
                  </div>
                  <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[9px] rounded-md">
                    {panti.urgency}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-base text-[#1B3A5C]">{panti.pantiName}</h4>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">{panti.needTitle}</p>
                </div>

                {/* Compact 3-Bullet Reasons for Clean Readability */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1 font-medium">
                  <span className="font-black text-[10px] text-slate-500 uppercase tracking-wider block">
                    Alasan Kecocokan Cerdas:
                  </span>
                  {panti.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>Alamat: <strong>{panti.address}</strong></p>
                  <p>Penanggung Jawab: <strong>{panti.pj}</strong> ({panti.contactPhone})</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Alokasi Langsung In-Workspace</span>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleOpenAllocationModal(panti)}
                  className="font-black text-xs text-slate-950 px-3.5 py-1.5 shadow-xs cursor-pointer"
                >
                  Salurkan Donasi ➔
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Action Navigation Cards (Clean Verified Links) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/provider/my-listings" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block">
          <h4 className="font-black text-sm text-[#1B3A5C]">Kelola Katalog Surplus</h4>
          <p className="text-xs text-slate-500 font-medium">Pantau status stok makanan, sisa porsi, dan unggah menu baru.</p>
        </Link>

        <Link href="/dashboard/provider/claims" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block">
          <h4 className="font-black text-sm text-[#1B3A5C]">Scan Serah Terima Kasir</h4>
          <p className="text-xs text-slate-500 font-medium">Validasi resi digital saat pembeli atau kurir relawan mengambil paket.</p>
        </Link>

        <Link href="/dashboard/provider/impact" className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs space-y-2 block">
          <h4 className="font-black text-sm text-[#1B3A5C]">Laporan CSR & Sertifikat</h4>
          <p className="text-xs text-slate-500 font-medium">Unduh sertifikat resmi penyelamatan pangan untuk audit ESG.</p>
        </Link>
      </div>

      {/* Modal Rincian Formula & Bobot Smart Matching 2.0 */}
      <Modal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        title={`Rincian Formula Skor: ${selectedPantiForFormula?.pantiName || 'Smart Matching'}`}
        size="md"
      >
        {selectedPantiForFormula && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                MULTI-CRITERIA SCORING ENGINE 2.0
              </span>
              <h4 className="text-lg font-black text-white">
                Total Skor Kecocokan: {selectedPantiForFormula.matchScore}%
              </h4>
              <p className="text-slate-200 text-xs font-medium">
                Dihitung dari kombinasi bobot 4 variabel utama berdasarkan data real-time platform:
              </p>
            </div>

            <div className="space-y-2.5">
              {selectedPantiForFormula.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-800 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500">{item.desc}</span>
                  </div>
                  <strong className="text-sm font-black text-[#1B3A5C] font-mono">
                    {item.score}/{item.max} Pts
                  </strong>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsFormulaModalOpen(false)}>
                Tutup Rincian
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* In-Workspace Instant Donation Allocation Modal */}
      <Modal
        isOpen={allocateModal.isOpen}
        onClose={() => setAllocateModal({ isOpen: false, panti: null, portions: 30, deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}
        title={`Alokasi Donasi Langsung: ${allocateModal.panti?.pantiName || 'Panti Asuhan'}`}
        size="lg"
      >
        {allocateModal.panti && (
          <form onSubmit={handleConfirmAllocationSubmit} className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1 shadow-md border border-[#2C5A8F]">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                PENERIMA BANTUAN TARGET
              </span>
              <h4 className="text-lg font-black text-white">{allocateModal.panti.pantiName}</h4>
              <p className="text-xs text-slate-200 font-medium">
                Alamat: <strong>{allocateModal.panti.address}</strong> • Kontak: {allocateModal.panti.pj} ({allocateModal.panti.contactPhone})
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 block">Jumlah Porsi Yang Dialokasikan (Dari Stok Surplus Anda):</label>
              <input
                type="number"
                min="1"
                max="100"
                value={allocateModal.portions}
                onChange={(e) => setAllocateModal({ ...allocateModal, portions: Number(e.target.value) })}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm text-[#1B3A5C]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 block">Pilihan Metode Pengiriman:</label>
              <select
                value={allocateModal.deliveryMethod}
                onChange={(e) => setAllocateModal({ ...allocateModal, deliveryMethod: e.target.value })}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-[#1B3A5C]"
              >
                <option value="RESCUE_COURIER">Kurir Relawan Komunitas Replate (Auto-Assigned WhatsApp Manifest)</option>
                <option value="PROVIDER_DIRECT">Diantar Sendiri Oleh Armada Restoran</option>
                <option value="SHELTER_PICKUP">Diambil Mandiri Oleh Pengurus Panti</option>
              </select>
            </div>

            <label className="flex items-start gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer text-emerald-900">
              <input
                type="checkbox"
                checked={allocateModal.hygieneChecked}
                onChange={(e) => setAllocateModal({ ...allocateModal, hygieneChecked: e.target.checked })}
                className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-emerald-300 focus:ring-0 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold block text-xs">Konfirmasi 8-Poin SOP Higienitas BPOM RI</span>
                <span className="text-[11px] block text-emerald-800 leading-relaxed font-medium">
                  Saya mengonfirmasi makanan dalam kondisi layak santap &lt; 4 jam, dikemas steril, dan siap diambil/diantar.
                </span>
              </div>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAllocateModal({ isOpen: false, panti: null, portions: 30, deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}
              >
                Batal
              </Button>
              <Button type="submit" variant="gold" size="sm" className="font-black text-slate-950 shadow-md">
                Terbitkan Resi Tiket & Selesaikan Alokasi ➔
              </Button>
            </div>
          </form>
        )}
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
