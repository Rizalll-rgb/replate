'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { 
  CheckIcon, 
  PackageIcon, 
  SearchIcon, 
  MapPinIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  TruckIcon,
  BoltIcon,
  TicketIcon,
} from '@/components/ui/Icon';

export default function YayasanDashboardPage() {
  const router = useRouter();
  const [pantiName, setPantiName] = useState('Panti Asuhan Kasih Ibu');
  const [contactPerson, setContactPerson] = useState('Ibu Hajjah Maryam');
  const [address, setAddress] = useState('Jl. Raya Gubeng No. 88, Gubeng');
  const [recipientCapacity, setRecipientCapacity] = useState('45 Jiwa');
  const [isFreshAccount, setIsFreshAccount] = useState(false);

  // SuperAppLoader for claim processing (Poin 4)
  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({ isOpen: false, message: '' });

  // Success Modal after claim confirmed (Poin 3)
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; claim: any | null }>({ isOpen: false, claim: null });

  // Claim Allocation Modal State (Poin 4, 5, 6)
  const [allocationModal, setAllocationModal] = useState<{
    isOpen: boolean;
    supplier: any | null;
    portions: number;
    deliveryMethod: 'SELF_PICKUP' | 'RESCUE_PARTNER' | 'PROVIDER_DELIVERY';
    deliveryTime: string;
    specialInstructions: string;
  }>({
    isOpen: false,
    supplier: null,
    portions: 40,
    deliveryMethod: 'RESCUE_PARTNER',
    deliveryTime: '20:30 WIB',
    specialInstructions: '',
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
      hasStoreDriver: true,
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
      hasStoreDriver: false,
    },
    {
      id: 'SM-HOTEL-MAJAPAHIT',
      storeName: 'Hotel Majapahit Surabaya',
      offer: '35 Porsi Lauk Buffet Nusantara (Donasi Rp 0)',
      portions: 35,
      distance: '2.1 km',
      matchScore: 88,
      readyTime: 'Siap Ambil Pukul 21:15 WIB',
      address: 'Jl. Tunjungan No. 65, Surabaya',
      foodType: 'Makanan Berat Berkualitas',
      hasStoreDriver: false,
    },
  ];

  const [totalPortionsReceived, setTotalPortionsReceived] = useState(185);
  const [activeRequestsCount, setActiveRequestsCount] = useState(2);

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

      // Hitung dinamis total porsi dari riwayat selesai (Poin 2 & 3)
      if (isFresh) {
        setTotalPortionsReceived(0);
        setActiveRequestsCount(0);
      } else {
        let basePortions = 185; // default 4 riwayat demo (50 + 30 + 45 + 60)
        try {
          const rawClaims = localStorage.getItem('replate_claims');
          if (rawClaims) {
            const parsedClaims = JSON.parse(rawClaims);
            if (Array.isArray(parsedClaims)) {
              parsedClaims.forEach((c: any) => {
                if (c.status === 'COMPLETED') {
                  const qty = parseInt(String(c.quantity || '').replace(/\D/g, '')) || 0;
                  basePortions += qty;
                }
              });
            }
          }
        } catch (_) {}
        setTotalPortionsReceived(basePortions);

        // Hitung permintaan aktif
        try {
          const rawReqs = localStorage.getItem('replate_panti_requests');
          if (rawReqs) {
            const parsedReqs = JSON.parse(rawReqs);
            if (Array.isArray(parsedReqs)) {
              setActiveRequestsCount(parsedReqs.length + 2); // 2 demo + user created
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  }, []);

  const stats = [
    { label: 'Total Bantuan Diterima', value: isFreshAccount ? '0 Porsi' : `${totalPortionsReceived} Porsi`, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Anak Yatim / Penerima', value: recipientCapacity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Emisi CO2 Dicegah', value: isFreshAccount ? '0.0 kg' : `${(totalPortionsReceived * 0.5).toFixed(1)} kg`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Permintaan Bantuan Aktif', value: isFreshAccount ? '0 Permintaan' : `${activeRequestsCount} Permintaan`, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleOpenClaimModal = (supplier: any) => {
    setAllocationModal({
      isOpen: true,
      supplier,
      portions: supplier.portions || 40,
      deliveryMethod: 'RESCUE_PARTNER',
      deliveryTime: '20:30 WIB',
      specialInstructions: '',
    });
  };

  const handleConfirmClaim = () => {
    if (!allocationModal.supplier) return;
    setIsProcessingClaim(true);
    setActionLoader({ isOpen: true, message: 'Memproses Klaim Alokasi...', submessage: 'Menerbitkan tiket QR serah terima' });

    setTimeout(() => {
      try {
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
        // Poin 6: Standardized resi code
        const resiCode = `RPL-YYS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const isCommunity = allocationModal.deliveryMethod === 'RESCUE_PARTNER';
        const isProviderDirect = allocationModal.deliveryMethod === 'PROVIDER_DELIVERY';
        const isPickup = allocationModal.deliveryMethod === 'SELF_PICKUP';

        const claimStatus = isPickup 
          ? 'READY_FOR_PICKUP' 
          : isCommunity 
            ? 'WAITING_RESCUE_POOL' 
            : 'IN_TRANSIT';

        const methodLabel = isPickup 
          ? 'Ambil Sendiri (Self-Pickup)' 
          : isCommunity 
            ? 'Dikirim Kurir Komunitas (Pool Siaga)' 
            : 'Dikirim Kurir Toko (Driver Internal)';

        const driverInfo = isProviderDirect ? {
          name: 'Pak Sugiono (Driver Armada Toko)',
          phone: '081298765432',
          vehicle: 'Motor Box Delivery (L 3319 AB)',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          status: 'Driver Internal Toko',
          rating: '4.8',
          completedTrips: '89 Pengiriman',
        } : null;

        const newClaim = {
          id: `${resiCode}-${Date.now()}`,
          code: resiCode,
          foodName: allocationModal.supplier.offer,
          provider: allocationModal.supplier.storeName,
          providerName: allocationModal.supplier.storeName,
          address: allocationModal.supplier.address,
          quantity: `${allocationModal.portions} Porsi`,
          method: allocationModal.deliveryMethod,
          deliveryMethod: allocationModal.deliveryMethod,
          methodLabel,
          status: claimStatus,
          pickupTime: allocationModal.supplier.readyTime,
          claimedAt: `Hari ini, ${timeString}`,
          createdAtTimestamp: Date.now(),
          destinationAddress: `${pantiName} — ${address}`,
          picContact: contactPerson,
          specialInstructions: allocationModal.specialInstructions,
          totalAmount: 0,
          qrPayload: `REPLATE-YYS-${resiCode}`,
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
          driverInfo,
          courierName: isProviderDirect ? 'Pak Sugiono (Driver Armada Toko)' : isCommunity ? 'Budi Santoso (Relawan ID #RC-881)' : undefined,
          courierVehicle: isProviderDirect ? 'Motor Box Delivery (L 3319 AB)' : isCommunity ? 'Motor Box Cooler Steril (L 8912 RC)' : undefined,
          courierPhone: isProviderDirect ? '081298765432' : isCommunity ? '081298765432' : undefined,
          providerPhone: '081398765432',
          providerPic: 'Bpk. Bambang (Manager Toko)',
        };

        const existingClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
        localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingClaims]));
        const existingActive = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
        localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingActive]));

        setIsProcessingClaim(false);
        setActionLoader({ isOpen: false, message: '' });
        setAllocationModal((prev) => ({ ...prev, isOpen: false }));

        // Poin 3: Show success modal instead of direct redirect
        setSuccessModal({ isOpen: true, claim: newClaim });
      } catch (err) {
        setIsProcessingClaim(false);
        setActionLoader({ isOpen: false, message: '' });
        setToastState({ isOpen: true, message: 'Terjadi kendala saat memproses klaim alokasi.', type: 'error' });
      }
    }, 1200);
  };


  return (
    <div className="space-y-5 sm:space-y-8 max-w-6xl mx-auto pb-12">
      <SuperAppLoader isOpen={actionLoader.isOpen} message={actionLoader.message} submessage={actionLoader.submessage} />
      <Toast 
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* SUCCESS MODAL AFTER CLAIM ALLOCATION (Poin 3) */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, claim: null })}
        title="Klaim Alokasi Berhasil Dikonfirmasi!"
        size="md"
      >
        {successModal.claim && (
          <div className="space-y-4 text-xs">
            {/* Success Header */}
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckIcon size={28} className="text-white" />
              </div>
              <h3 className="font-black text-base text-emerald-900">Tiket QR Serah Terima Diterbitkan!</h3>
              <p className="text-[11px] text-emerald-800 font-medium">Klaim alokasi donasi food rescue telah dikonfirmasi. Simpan resi di bawah ini.</p>
            </div>

            {/* Resi Code Prominent */}
            <div className="p-3.5 bg-[#1B3A5C] rounded-2xl text-center">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block mb-1">Nomor Resi Klaim</span>
              <span className="font-mono font-black text-lg text-white block">{successModal.claim.code}</span>
            </div>

            {/* QR Preview */}
            <div className="flex justify-center py-2">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
                <QRGenerator
                  value={`REPLATE-YYS-${successModal.claim.code}`}
                  foodName={successModal.claim.foodName}
                  portions={successModal.claim.quantity}
                  providerName={successModal.claim.provider || successModal.claim.providerName}
                  deliveryMethod={successModal.claim.method}
                  recipientName={pantiName}
                />
              </div>
            </div>

            {/* Claim Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
              {[
                { label: 'Menu Donasi', value: successModal.claim.foodName },
                { label: 'Jumlah Porsi', value: successModal.claim.quantity },
                { label: 'Penyedia Donatur', value: successModal.claim.provider },
                { label: 'Metode Penyaluran', value: successModal.claim.methodLabel },
                { label: 'Status Awal', value: successModal.claim.status === 'WAITING_RESCUE_POOL' ? 'Siaga di Pool Relawan' : successModal.claim.status === 'READY_FOR_PICKUP' ? 'Siap Diambil di Gerai' : 'Driver Internal Toko' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-500 font-medium">{row.label}:</span>
                  <strong className="text-slate-800 font-bold text-right max-w-[200px] truncate">{row.value}</strong>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-bold text-xs cursor-pointer"
                onClick={() => setSuccessModal({ isOpen: false, claim: null })}
              >
                Tutup
              </Button>
              <Button
                variant="gold"
                size="sm"
                leftIcon={<TicketIcon size={13} className="text-slate-950" />}
                className="flex-1 font-black text-xs text-slate-950 shadow-xs cursor-pointer"
                onClick={() => {
                  setSuccessModal({ isOpen: false, claim: null });
                  router.push('/dashboard/yayasan/claims');
                }}
              >
                Lihat Semua Klaim
              </Button>
            </div>
          </div>
        )}
      </Modal>


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

        {/* Horizontal Peek Carousel on mobile, 3-column grid on desktop */}
        <div className="flex md:grid lg:grid-cols-3 md:grid-cols-2 lg:gap-6 gap-3 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-2 md:pb-6">
          {matchedSuppliers.map((supplier, idx) => (
            <div
              key={idx}
              className="w-[85vw] max-w-[340px] md:max-w-none md:w-auto shrink-0 snap-start p-4 sm:p-5 lg:p-5 xl:p-6 bg-gradient-to-br from-white to-emerald-50/40 md:from-white md:to-emerald-50/20 rounded-2xl sm:rounded-3xl border-2 border-emerald-300 shadow-xs md:shadow-md md:hover:shadow-2xl md:hover:-translate-y-1 md:hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between space-y-3 sm:space-y-4 md:space-y-5 relative overflow-hidden group"
            >
              {/* Decorative element for desktop only */}
              <div className="hidden md:block absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none"></div>

              <div className="space-y-1.5 md:space-y-2.5 relative z-10">
                <div className="flex items-center justify-between gap-1">
                  <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-[#1B3A5C] text-[#D4A843] font-black text-[10px] lg:text-[9px] xl:text-[10px] rounded-md font-mono shadow-sm whitespace-nowrap">
                    Skor {supplier.matchScore}%
                  </span>
                  <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-emerald-500 text-slate-950 font-black text-[10px] lg:text-[9px] xl:text-[10px] rounded-md shadow-sm whitespace-nowrap">
                    DONASI Rp 0
                  </span>
                </div>
                <h4 className="font-black text-sm md:text-lg xl:text-xl text-[#1B3A5C] md:pt-0.5 leading-tight">{supplier.storeName}</h4>
                <p className="text-xs md:text-[11px] xl:text-xs font-bold text-slate-800 bg-emerald-50/50 md:bg-emerald-50 p-2 md:p-2.5 rounded-lg border border-emerald-100 leading-snug">{supplier.offer}</p>
                <div className="text-[11px] md:text-[10px] xl:text-xs text-slate-500 space-y-0.5 md:space-y-1.5 md:pt-0.5">
                  <p className="flex items-center gap-1 md:gap-1.5">
                    <MapPinIcon size={14} className="text-slate-400 shrink-0" />
                    <span className="leading-tight">Jarak: <strong className="text-slate-700">{supplier.distance}</strong> ({supplier.address})</span>
                  </p>
                  <p className="text-emerald-700 font-bold flex items-center gap-1 md:gap-1.5">
                    <ClockIcon size={14} className="text-emerald-600 shrink-0" />
                    <span>{supplier.readyTime}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 md:pt-3 border-t border-emerald-200 md:border-emerald-100 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 xl:gap-3 relative z-10">
                <span className="text-[10px] lg:text-[9.5px] xl:text-[10px] text-slate-600 font-bold flex items-center justify-center xl:justify-start gap-1 md:gap-1.5 bg-slate-50 md:bg-white px-2 py-1.5 rounded-lg">
                  <ShieldCheckIcon size={14} className="text-emerald-500 shrink-0" />
                  Diantar / Self-Pickup
                </span>
                <div className="flex gap-2 justify-stretch">
                  <Button
                    variant="gold"
                    size="sm"
                    leftIcon={<CheckIcon size={14} className="shrink-0" />}
                    className="w-full font-black text-xs lg:text-[11px] xl:text-xs text-slate-950 px-3 md:px-4 py-1.5 md:py-2 shadow-xs md:shadow-md cursor-pointer md:hover:scale-105 transition-transform"
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
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Pilihan Metode Penyaluran Makanan (3 Opsi)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAllocationModal((prev) => ({ ...prev, deliveryMethod: 'SELF_PICKUP' }))}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      allocationModal.deliveryMethod === 'SELF_PICKUP'
                        ? 'border-[#1B3A5C] bg-[#1B3A5C]/5 text-[#1B3A5C] font-bold ring-2 ring-[#1B3A5C]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <PackageIcon size={14} className="text-[#1B3A5C]" />
                      <span className="font-extrabold text-xs">Ambil Sendiri</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">Pengurus panti mengambil langsung ke gerai</span>
                    <span className="text-[9px] text-emerald-600 font-bold mt-1">Bebas Biaya (Rp 0)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllocationModal((prev) => ({ ...prev, deliveryMethod: 'RESCUE_PARTNER' }))}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      allocationModal.deliveryMethod === 'RESCUE_PARTNER'
                        ? 'border-[#1B3A5C] bg-[#1B3A5C]/5 text-[#1B3A5C] font-bold ring-2 ring-[#1B3A5C]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <TruckIcon size={14} className="text-[#1B3A5C]" />
                      <span className="font-extrabold text-xs">Kurir Komunitas</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">Masuk Pool Siaga relawan Food Rescue Replate</span>
                    <span className="text-[9px] text-amber-700 font-bold mt-1">Pool Relawan Siaga</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllocationModal((prev) => ({ ...prev, deliveryMethod: 'PROVIDER_DELIVERY' }))}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      allocationModal.deliveryMethod === 'PROVIDER_DELIVERY'
                        ? 'border-[#1B3A5C] bg-[#1B3A5C]/5 text-[#1B3A5C] font-bold ring-2 ring-[#1B3A5C]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheckIcon size={14} className="text-[#1B3A5C]" />
                      <span className="font-extrabold text-xs">Kurir Toko</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">Diantar armada internal toko donatur (jika ready)</span>
                    <span className="text-[9px] text-blue-700 font-bold mt-1">Armada Provider</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Khusus Penanganan Makanan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Harap dipisahkan sambal, siap diterima sebelum jam makan malam..."
                  value={allocationModal.specialInstructions}
                  onChange={(e) => setAllocationModal((prev) => ({ ...prev, specialInstructions: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
                />
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
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Awal Penyaluran:</span>
                  <span className="text-amber-800 font-bold">
                    {allocationModal.deliveryMethod === 'SELF_PICKUP' 
                      ? 'Siap Diambil di Gerai' 
                      : allocationModal.deliveryMethod === 'RESCUE_PARTNER'
                        ? 'Masuk Antrean Pool Siaga Relawan'
                        : 'Disiapkan Driver Armada Toko'}
                  </span>
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
                {isProcessingClaim ? 'Menerbitkan Tiket QR...' : 'Konfirmasi & Ambil Alokasi '}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Sukses Klaim Alokasi dengan QR Tiket Handover (Poin 3 & 6) */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, claim: null })}
        title="Alokasi Berhasil Diklaim!"
        size="md"
      >
        {successModal.claim && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckIcon size={24} />
              </div>
              <h4 className="font-black text-sm text-emerald-950">Tiket Serah Terima Berhasil Terbit</h4>
              <p className="text-[11px] text-emerald-800">
                Alokasi donasi telah berhasil dikonfirmasi untuk <strong>{pantiName}</strong>.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <QRGenerator
                  value={successModal.claim.code}
                  codeTitle="TIKET QR SERAH TERIMA BANTUAN"
                  codeSubtitle="Pindai kode ini saat serah terima makanan"
                  foodName={successModal.claim.foodName}
                  portions={successModal.claim.quantity}
                  providerName={successModal.claim.providerName}
                  deliveryMethod={successModal.claim.method}
                  recipientName={pantiName}
                  picPanti={contactPerson}
                  courierName={successModal.claim.courierName}
                  courierVehicle={successModal.claim.courierVehicle}
                  courierPhone={successModal.claim.courierPhone}
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-bold text-xs cursor-pointer"
                onClick={() => setSuccessModal({ isOpen: false, claim: null })}
              >
                Tutup
              </Button>
              <Link href="/dashboard/yayasan/claims" className="flex-1">
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<TicketIcon size={13} className="text-slate-950" />}
                  className="w-full font-black text-xs text-slate-950 shadow-xs cursor-pointer"
                >
                  Buka Modul Klaim 
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
