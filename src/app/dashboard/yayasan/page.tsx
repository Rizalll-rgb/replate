'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { 
  CheckIcon, 
  PackageIcon, 
  SearchIcon, 
  MapPinIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  TruckIcon 
} from '@/components/ui/Icon';

export default function YayasanDashboardPage() {
  const router = useRouter();
  const [pantiName, setPantiName] = useState('Panti Asuhan Kasih Ibu');
  const [contactPerson, setContactPerson] = useState('Ibu Hajjah Maryam');
  const [address, setAddress] = useState('Jl. Raya Gubeng No. 88, Gubeng');
  const [recipientCapacity, setRecipientCapacity] = useState('45 Jiwa');
  const [isFreshAccount, setIsFreshAccount] = useState(false);

  // Claim Allocation Modal State (Poin 4)
  const [allocationModal, setAllocationModal] = useState<{
    isOpen: boolean;
    supplier: any | null;
    portions: number;
    deliveryMethod: 'SELF_PICKUP' | 'RESCUE_PARTNER';
    notes: string;
  }>({
    isOpen: false,
    supplier: null,
    portions: 40,
    deliveryMethod: 'RESCUE_PARTNER',
    notes: '',
  });

  const [isProcessingClaim, setIsProcessingClaim] = useState(false);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const matchedSuppliers = [
    {
      id: 'SM-PAK-KUMIS',
      storeName: 'Warung Bakso Pak Kumis',
      offer: '40 Porsi Nasi Kotak & Lauk Bergizi (Donasi Rp 0)',
      portions: 40,
      distance: '1.2 km',
      matchScore: 96,
      readyTime: 'Siap Ambil Pukul 20:30 WIB',
      address: 'Jl. Kusuma Bangsa No. 42, Surabaya',
      foodType: 'Makanan Berat Bergizi',
    },
    {
      id: 'SM-ROTIBOY',
      storeName: 'Rotiboy Bakery',
      offer: '25 Porsi Roti Tawar & Pastry Steril (Donasi Rp 0)',
      portions: 25,
      distance: '1.8 km',
      matchScore: 92,
      readyTime: 'Siap Ambil Pukul 21:00 WIB',
      address: 'Grand City Mall Lt. LG, Surabaya',
      foodType: 'Roti & Kue Pastry',
    },
  ];

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      setIsFreshAccount(isFresh);

      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setPantiName(parsed.entityName);
        if (parsed.contactPerson) setContactPerson(parsed.contactPerson);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.capacity) {
          setRecipientCapacity(parsed.capacity);
          const num = parseInt(parsed.capacity.replace(/\D/g, ''));
          if (!isNaN(num) && num > 0) {
            setAllocationModal((prev) => ({ ...prev, portions: num }));
          }
        }
      }
    } catch (_) {}
  }, []);

  const stats = [
    { label: 'Total Bantuan Diterima', value: isFreshAccount ? '0 Porsi' : '185 Porsi', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Anak Yatim / Penerima', value: isFreshAccount ? recipientCapacity : '45 Jiwa', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Emisi CO2 Dicegah', value: isFreshAccount ? '0.0 kg' : '92.5 kg', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Permintaan Bantuan Aktif', value: isFreshAccount ? '0 Permintaan' : '2 Permintaan', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleOpenClaimModal = (supplier: any) => {
    setAllocationModal({
      isOpen: true,
      supplier,
      portions: supplier.portions || 40,
      deliveryMethod: 'RESCUE_PARTNER',
      notes: '',
    });
  };

  const handleConfirmClaim = () => {
    if (!allocationModal.supplier) return;
    setIsProcessingClaim(true);

    setTimeout(() => {
      try {
        const resiCode = `FB-YYS-${Math.floor(1000 + Math.random() * 9000)}`;
        const newClaim = {
          id: `CLM-YYS-${Date.now()}`,
          code: resiCode,
          foodName: allocationModal.supplier.offer,
          provider: allocationModal.supplier.storeName,
          providerName: allocationModal.supplier.storeName,
          address: allocationModal.supplier.address,
          quantity: `${allocationModal.portions} Porsi`,
          method: allocationModal.deliveryMethod,
          methodLabel: allocationModal.deliveryMethod === 'SELF_PICKUP' ? 'Ambil Sendiri (Self-Pickup)' : 'Diantar Kurir Relawan',
          status: allocationModal.deliveryMethod === 'SELF_PICKUP' ? 'READY_FOR_PICKUP' : 'IN_TRANSIT',
          pickupTime: allocationModal.supplier.readyTime,
          claimedAt: 'Hari ini, baru saja',
          destinationAddress: `${pantiName} — ${address}`,
          picContact: contactPerson,
          totalAmount: 0,
          qrPayload: `REPLATE-YYS-${resiCode}-VERIFIED`,
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          driverInfo: allocationModal.deliveryMethod === 'RESCUE_PARTNER' ? {
            name: 'Mas Fajar Santoso',
            phone: '081234567890',
            vehicle: 'Honda Vario 160 (L 4582 ABC)',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            status: 'VERIFIED_DRIVER',
          } : null,
        };

        const existingClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
        localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingClaims]));

        const existingActive = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
        localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingActive]));

        setIsProcessingClaim(false);
        setAllocationModal((prev) => ({ ...prev, isOpen: false }));

        setToastState({
          isOpen: true,
          message: `Berhasil mengklaim alokasi donasi pangan dari ${allocationModal.supplier.storeName}! Tiket QR serah terima telah diterbitkan.`,
          type: 'success',
        });

        // Redirect directly to claims page
        router.push('/dashboard/yayasan/claims');
      } catch (err) {
        setIsProcessingClaim(false);
        setToastState({
          isOpen: true,
          message: 'Terjadi kendala saat memproses klaim alokasi.',
          type: 'error',
        });
      }
    }, 1000);
  };

  return (
    <div className="space-y-5 sm:space-y-8 max-w-6xl mx-auto pb-12">
      <Toast 
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Sleek Modern Header Card (Seragam Antar Modul & Role) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Dashboard Food Beneficiary
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Terverifikasi Dinsos</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              {pantiName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Ketua: <strong>{contactPerson}</strong> · Lokasi: <strong>{address}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/yayasan/claims">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<PackageIcon size={14} className="text-slate-950" />}
                className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
              >
                Klaim & Kebutuhan Pangan
              </Button>
            </Link>
            <Link href="/dashboard/explore">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SearchIcon size={14} className="text-[#1B3A5C]" />}
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Eksplor Pangan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid (2-columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="border-slate-200 shadow-2xs sm:shadow-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
            <CardBody className="p-0 space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block truncate">{item.label}</span>
              <strong className="text-base sm:text-xl font-black text-[#1B3A5C] font-mono block">{item.value}</strong>
              <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckIcon size={10} className="text-emerald-600" />
                Dinsos
              </span>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* SMART MATCHING 2.0: DONATUR SURPLUS PALING COCOK DENGAN KEBUTUHAN PANTI */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
              SMART MATCHING ENGINE 2.0 (PANTI ASUHAN)
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#1B3A5C]">
              Donatur Pangan Terdekat
            </h3>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1">
            <MapPinIcon size={12} className="text-slate-400" />
            Radius &lt; 2.0 km
          </span>
        </div>

        {/* Horizontal Peek Carousel on mobile, 2-column grid on desktop */}
        <div className="flex md:grid md:grid-cols-2 gap-3 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-2">
          {matchedSuppliers.map((supplier, idx) => (
            <div
              key={idx}
              className="w-[85vw] max-w-[340px] md:w-auto shrink-0 snap-start p-4 sm:p-5 bg-gradient-to-br from-white to-emerald-50/40 rounded-2xl sm:rounded-3xl border-2 border-emerald-300 shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-[#1B3A5C] text-[#D4A843] font-black text-[10px] rounded-md font-mono">
                    Skor Kecocokan {supplier.matchScore}%
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-md">
                    DONASI Rp 0
                  </span>
                </div>
                <h4 className="font-black text-sm text-[#1B3A5C]">{supplier.storeName}</h4>
                <p className="text-xs font-bold text-slate-800">{supplier.offer}</p>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p className="flex items-center gap-1">
                    <MapPinIcon size={11} className="text-slate-400" />
                    Jarak: <strong>{supplier.distance}</strong> ({supplier.address})
                  </p>
                  <p className="text-emerald-700 font-bold flex items-center gap-1">
                    <ClockIcon size={11} className="text-emerald-600" />
                    {supplier.readyTime}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheckIcon size={11} className="text-slate-400" />
                  Bisa Diantar / Self-Pickup
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="gold"
                    size="sm"
                    leftIcon={<CheckIcon size={13} />}
                    className="font-black text-xs text-slate-950 px-3.5 py-1.5 shadow-xs cursor-pointer"
                    onClick={() => handleOpenClaimModal(supplier)}
                  >
                    Klaim Alokasi
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Alur Bisnis Klaim Alokasi Smart Matching (Poin 4) */}
      <Modal
        isOpen={allocationModal.isOpen}
        onClose={() => setAllocationModal((prev) => ({ ...prev, isOpen: false }))}
        title={allocationModal.supplier ? `Klaim Alokasi Donasi: ${allocationModal.supplier.storeName}` : 'Klaim Alokasi'}
        size="md"
      >
        {allocationModal.supplier && (
          <div className="space-y-4 text-xs">
            {/* Store & Food Overview */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5 text-emerald-950">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-800">
                  SMART MATCHING DONASI Rp 0
                </span>
                <span className="font-mono font-black text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded">
                  Skor {allocationModal.supplier.matchScore}%
                </span>
              </div>
              <h4 className="font-black text-sm text-[#1B3A5C]">{allocationModal.supplier.offer}</h4>
              <p className="text-[11px] text-emerald-800">
                Penyedia: <strong>{allocationModal.supplier.storeName}</strong> • {allocationModal.supplier.distance} ({allocationModal.supplier.address})
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Jumlah Porsi Alokasi (Kapasitas Panti: {recipientCapacity})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={allocationModal.portions}
                    onChange={(e) => setAllocationModal((prev) => ({ ...prev, portions: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">Porsi Makanan</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilihan Metode Penyaluran Makanan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAllocationModal((prev) => ({ ...prev, deliveryMethod: 'RESCUE_PARTNER' }))}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      allocationModal.deliveryMethod === 'RESCUE_PARTNER'
                        ? 'border-[#1B3A5C] bg-[#1B3A5C]/5 text-[#1B3A5C] font-bold ring-1 ring-[#1B3A5C]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <TruckIcon size={14} className="text-[#1B3A5C]" />
                      <span className="font-extrabold text-xs">Diantar Kurir</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">Relawan logistik mengantar ke panti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllocationModal((prev) => ({ ...prev, deliveryMethod: 'SELF_PICKUP' }))}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      allocationModal.deliveryMethod === 'SELF_PICKUP'
                        ? 'border-[#1B3A5C] bg-[#1B3A5C]/5 text-[#1B3A5C] font-bold ring-1 ring-[#1B3A5C]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <PackageIcon size={14} className="text-[#1B3A5C]" />
                      <span className="font-extrabold text-xs">Ambil Sendiri</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">Pengurus panti mengambil ke toko</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Penerima Manfaat:</span>
                  <strong className="text-[#1B3A5C]">{pantiName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alamat Panti:</span>
                  <span className="text-slate-700 max-w-[220px] truncate text-right">{address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PIC Penanggung Jawab:</span>
                  <span className="text-slate-700">{contactPerson}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Total Biaya:</span>
                  <strong className="text-emerald-600 font-black">Rp 0 (Donasi Penuh)</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllocationModal((prev) => ({ ...prev, isOpen: false }))}
                className="font-bold text-xs"
              >
                Batal
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleConfirmClaim}
                disabled={isProcessingClaim}
                className="font-black text-xs text-slate-950 py-2 px-4 shadow-xs"
              >
                {isProcessingClaim ? 'Menerbitkan Tiket QR...' : 'Konfirmasi & Ambil Alokasi ➔'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
