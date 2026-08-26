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
  const [completedClaimsCount, setCompletedClaimsCount] = useState<number>(3);
  const [totalRescuedKg, setTotalRescuedKg] = useState<number>(42.5);
  const [providerName, setProviderName] = useState<string>('Warung Bakso Pak Kumis');

  // Smart Matching Formula Modal State
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [selectedPantiForFormula, setSelectedPantiForFormula] = useState<any | null>(null);

  // Selected Shelter Profile Detail Modal State (Point 1: Lihat Detail Modal with GPS Map)
  const [selectedShelterProfile, setSelectedShelterProfile] = useState<any | null>(null);

  // In-Workspace Instant Donation Allocation Modal State (Point 2: Matching Explore Fulfill Flow)
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
      shelterType: 'Panti Asuhan Anak Yatim',
      needTitle: '50 Porsi Nasi Kotak & Lauk Bergizi',
      distance: '1.2 km (Wonokromo, Surabaya Selatan)',
      matchScore: 96,
      urgency: 'URGENT HARI INI',
      contactPerson: 'Ibu Hajjah Maryam',
      contactPhone: '081298765432',
      address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      preferredDelivery: 'RESCUE_COURIER',
      beneficiariesCount: 45,
      legalStatus: 'Terverifikasi Dinsos Jatim',
      legalPermit: 'DINSOS-SBY/2023/8912',
      notes: 'Membutuhkan 40-50 porsi nasi lauk pauk bergizi untuk makan malam anak-anak panti.',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
      lat: -7.2754,
      lng: 112.7541,
      reasons: [
        'Jarak 1.2 km dari outlet Anda (Wonokromo)',
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
      shelterType: 'Shelter & Rumah Singgah',
      needTitle: '60 Porsi Makanan Siap Santap / Prasmanan',
      distance: '0.8 km (Genteng, Surabaya Pusat)',
      matchScore: 89,
      urgency: 'URGENT HARI INI',
      contactPerson: 'Mas Dedi Relawan',
      contactPhone: '081567890123',
      address: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      preferredDelivery: 'PROVIDER_DIRECT',
      beneficiariesCount: 25,
      legalStatus: 'Terverifikasi Pemkot Surabaya',
      legalPermit: 'DINSOS-SBY/2024/1109',
      notes: 'Membutuhkan porsi makanan surplus siap santap untuk pembagian malam relawan.',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=60',
      lat: -7.2623,
      lng: 112.7391,
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
                  <p>Penanggung Jawab: <strong>{panti.contactPerson}</strong> ({panti.contactPhone})</p>
                </div>

                {/* Button Lihat Detail Profil & Titik Peta GPS (Point 1) */}
                <button
                  type="button"
                  onClick={() => setSelectedShelterProfile(panti)}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1B3A5C] font-black text-[11px] rounded-xl border border-blue-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Lihat Profil Detail & Titik Peta GPS ➔</span>
                </button>
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

      {/* Modal Detail Profil Lembaga & Titik Lokasi Peta GPS (Point 1) */}
      <Modal
        isOpen={!!selectedShelterProfile}
        onClose={() => setSelectedShelterProfile(null)}
        title={selectedShelterProfile ? `Profil Lembaga & Lokasi: ${selectedShelterProfile.pantiName}` : 'Profil Lembaga'}
        size="lg"
      >
        {selectedShelterProfile && (
          <div className="space-y-4 text-xs">
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 shadow-xs">
              <img
                src={selectedShelterProfile.imageUrl}
                alt={selectedShelterProfile.pantiName}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-4 text-white">
                <div>
                  <Badge variant="gold" size="sm" className="mb-1">
                    {selectedShelterProfile.shelterType}
                  </Badge>
                  <h3 className="text-xl font-black text-white">{selectedShelterProfile.pantiName}</h3>
                  <p className="text-xs text-slate-200">{selectedShelterProfile.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Pengurus / Perwakilan:</span>
                <span className="font-extrabold text-[#1B3A5C]">{selectedShelterProfile.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Kontak WhatsApp:</span>
                <span className="font-bold text-slate-800">{selectedShelterProfile.contactPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Kapasitas Jiwa Penerima:</span>
                <span className="font-bold text-slate-800">{selectedShelterProfile.beneficiariesCount} Jiwa</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Identitas Verifikasi Dinsos:</span>
                <span className="font-mono font-bold text-slate-800">{selectedShelterProfile.legalPermit}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${selectedShelterProfile.contactPhone.replace(/^0/, '62')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Hubungi WhatsApp Penerima / Perwakilan (Koordinasi Direct) ➔</span>
            </a>

            {/* Embed Google Maps GPS */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#1B3A5C]">Titik Koordinat Lokasi Peta GPS Surabaya</h4>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  GPS: {selectedShelterProfile.lat}, {selectedShelterProfile.lng}
                </span>
              </div>

              <div className="relative w-full h-44 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 shadow-xs">
                <iframe
                  title="Shelter Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${selectedShelterProfile.lat},${selectedShelterProfile.lng}&z=15&output=embed`}
                  className="w-full h-full filter saturate-150"
                />
                <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider">
                  Titik Lokasi: {selectedShelterProfile.pantiName}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedShelterProfile(null)}>
                Tutup Profil
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-black text-slate-950"
                onClick={() => {
                  const target = selectedShelterProfile;
                  setSelectedShelterProfile(null);
                  handleOpenAllocationModal(target);
                }}
              >
                Sanggupi Bantuan Panti Ini ➔
              </Button>
            </div>
          </div>
        )}
      </Modal>

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

      {/* In-Workspace Instant Donation Allocation Modal (Point 2: Identical with Explore Sanggupi Permintaan) */}
      <Modal
        isOpen={allocateModal.isOpen}
        onClose={() => setAllocateModal({ isOpen: false, panti: null, portions: 30, deliveryMethod: 'RESCUE_COURIER', hygieneChecked: true })}
        title={`Alur Sanggupi Donasi: ${allocateModal.panti?.pantiName || 'Panti Asuhan'}`}
        size="lg"
      >
        {allocateModal.panti && (
          <form onSubmit={handleConfirmAllocationSubmit} className="space-y-4 text-xs text-slate-700">
            <div className="p-5 bg-[#1B3A5C] text-white rounded-2xl space-y-1.5 shadow-md border border-[#2C5A8F]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-[#D4A843] tracking-widest block">
                  TARGET PENERIMA BANTUAN PANGAN
                </span>
                <span className="px-3 py-1 bg-[#D4A843] text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  Kebutuhan: {allocateModal.panti.needTitle}
                </span>
              </div>

              <h4 className="text-xl font-black text-white leading-snug drop-shadow-xs">
                {allocateModal.panti.pantiName} ({allocateModal.panti.beneficiariesCount} Jiwa Penerima)
              </h4>

              <p className="text-xs text-slate-100 font-semibold flex items-center gap-2 pt-0.5">
                <span>Lokasi: {allocateModal.panti.address}</span>
                <span>•</span>
                <span>Kontak: {allocateModal.panti.contactPerson} ({allocateModal.panti.contactPhone})</span>
              </p>
            </div>

            {/* Smart Matching Engine Score Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">SMART MATCHING 2.0 COMPATIBILITY SCORE:</span>
                  <span className="text-xl font-black text-emerald-400">
                    {allocateModal.panti.matchScore}% MATCH SCORE (HIGHLY RECOMMENDED)
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-md">
                  ✓ VERIFIKASI COCOK
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1 border-t border-slate-800">
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                  <span className="text-slate-400 block font-semibold">Kategori Gizi</span>
                  <span className="font-extrabold text-amber-400">30/30 Pts</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                  <span className="text-slate-400 block font-semibold">Proksimitas GPS</span>
                  <span className="font-extrabold text-amber-400">25/25 Pts</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                  <span className="text-slate-400 block font-semibold">Urgensi Waktu</span>
                  <span className="font-extrabold text-amber-400">20/20 Pts</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                  <span className="text-slate-400 block font-semibold">Standar BPOM</span>
                  <span className="font-extrabold text-amber-400">10/10 Pts</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 block">Jumlah Porsi Yang Siap Anda Donasikan:</label>
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
                <span className="font-extrabold block text-xs">Konfirmasi SOP Keamanan Pangan BPOM RI</span>
                <span className="text-[11px] block text-emerald-800 leading-relaxed font-medium">
                  Saya mengonfirmasi bahwa porsi makanan surplus yang dihibahkan dalam kondisi segar, siap santap &lt; 4 jam, dikemas steril, dan lulus 8-Checklist Higienitas Replate.
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
                Konfirmasi & Terbitkan Resi Donasi ➔
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
