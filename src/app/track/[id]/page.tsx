'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TrackingTimeline, TrackingStep } from '@/components/tracking/TrackingTimeline';
import { TrackingSearch } from '@/components/tracking/TrackingSearch';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PublicTrackPage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = (params?.id as string) || 'FB-DIR-99382';
  const cleanParam = decodeURIComponent(rawParam).trim().toUpperCase();

  const [currentId, setCurrentId] = useState<string>(cleanParam);
  const [steps, setSteps] = useState<TrackingStep[]>([]);
  const [foodName, setFoodName] = useState<string>('Menu Surplus Bakso Urat & Soto Sapi');
  const [matchedClaim, setMatchedClaim] = useState<any | null>(null);

  // Known Default Demo Claim Resi Dictionary
  const knownDemoClaims: Record<string, any> = {
    'FB-DIR-99382': {
      code: 'FB-DIR-99382',
      foodName: 'Menu Surplus Bakso Urat & Soto Sapi (5 Porsi)',
      storeName: 'Warung Bakso Pak Kumis Surabaya',
      userName: 'Siti Aminah (Konsumen B)',
      recipientType: 'Konsumen / Rescue Sale',
      driverName: 'Driver A: Mas Doni (Plat L 4582 ABC)',
      deliveryMethod: 'PROVIDER_DIRECT',
      status: 'IN_TRANSIT',
      address: 'Jl. Rungkut Asri No. 12, Rungkut, Surabaya',
      time: 'Dalam Pengiriman Armada Toko (OTW)',
    },
    'FB-DIR-88291': {
      code: 'FB-DIR-88291',
      foodName: 'Paket Rice Bowl Ayam Geprek (40 Porsi)',
      storeName: 'Warung Bakso Pak Kumis Surabaya',
      userName: 'Yayasan Panti Asuhan Wonokromo (Panti A)',
      recipientType: 'Panti Asuhan Anak',
      driverName: 'Driver B: Mas Agus (Plat L 1234 XYZ)',
      deliveryMethod: 'PROVIDER_DIRECT',
      status: 'READY_FOR_PICKUP',
      address: 'Jl. Wonokromo No. 45, Wonokromo, Surabaya Timur',
      time: 'Siap Diantar Armada Toko',
    },
    'FB-DON-88192': {
      code: 'FB-DON-88192',
      foodName: 'Nasi Ayam Bakar Specialty Pak Kumis (45 Porsi)',
      storeName: 'Warung Bakso Pak Kumis Surabaya',
      userName: 'Panti Asuhan Kasih Ibu (Yayasan)',
      recipientType: 'Panti Asuhan Anak',
      driverName: 'Budi Santoso (Relawan ID #RC-881)',
      deliveryMethod: 'RESCUE_COURIER',
      status: 'AWAITING_RESCUE_PICKUP',
      address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      time: 'Hari ini 19:00 WIB',
    },
    'FB-SALE-99102': {
      code: 'FB-SALE-99102',
      foodName: 'Nasi Goreng Buffet Specialty (3 Porsi)',
      storeName: 'Warung Bakso Pak Kumis Surabaya',
      userName: 'Ahmad Fauzi (Konsumen Umum)',
      recipientType: 'Konsumen Umum (Rescue Sale)',
      driverName: 'Pengambilan Mandiri Toko',
      deliveryMethod: 'SHELTER_PICKUP',
      status: 'PAYMENT_PROOF_UPLOADED',
      address: 'Outlet Pak Kumis (Ambil Mandiri)',
      time: 'Hari ini 20:00 WIB',
    },
    'FB-CLAIM-103': {
      code: 'FB-CLAIM-103',
      foodName: 'Nasi Goreng Buffet + Ayam Bakar (25 Porsi)',
      storeName: 'Warung Bakso Pak Kumis Surabaya',
      userName: 'Rumah Singgah Anak Jalanan (Shelter)',
      recipientType: 'Shelter & Rumah Singgah',
      driverName: 'Mas Rizky (Relawan Komunitas Surabaya)',
      deliveryMethod: 'RESCUE_COURIER',
      status: 'IN_TRANSIT',
      address: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      time: 'Dalam Pengiriman Kurir OTW',
    },
    'FB-DON-77182': {
      code: 'FB-DON-77182',
      foodName: 'Paket Roti Bakery Steril & Susu UHT (30 Paket)',
      storeName: 'Bakery & Pastry Surabaya',
      userName: 'Panti Werdha Lansia Sejahtera',
      recipientType: 'Panti Werdha (Lansia)',
      driverName: 'Mas Rizky Relawan (#RC-104)',
      deliveryMethod: 'RESCUE_COURIER',
      status: 'COMPLETED',
      address: 'Jl. Wonokromo No. 12, Wonokromo, Surabaya',
      time: '21 Aug 2026, 14:00 WIB',
    },
  };

  const handleExecuteSearch = (searchQuery: string) => {
    const clean = searchQuery.trim().toUpperCase();
    setCurrentId(clean);
    router.push(`/track/${encodeURIComponent(clean)}`);
  };

  useEffect(() => {
    const activeCode = (currentId || cleanParam).trim().toUpperCase();

    // 1. Try finding in LocalStorage claims
    let foundClaim: any = null;
    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      if (savedClaimsStr) {
        const parsed = JSON.parse(savedClaimsStr);
        foundClaim = parsed.find(
          (c: any) =>
            (c.claimCode && c.claimCode.toUpperCase() === activeCode) ||
            (c.code && c.code.toUpperCase() === activeCode) ||
            (c.id && c.id.toUpperCase() === activeCode)
        );
      }
    } catch (_) {}

    // 2. If not in localStorage, check Known Demo Claims dictionary
    if (!foundClaim && knownDemoClaims[activeCode]) {
      foundClaim = knownDemoClaims[activeCode];
    }

    // 3. Construct dynamic steps
    if (foundClaim) {
      setMatchedClaim(foundClaim);
      setFoodName(foundClaim.foodName || 'Makanan Surplus Steril');
      const isDone = foundClaim.status === 'COMPLETED' || foundClaim.status === 'VERIFIED';
      const isOTW = foundClaim.status === 'IN_TRANSIT' || foundClaim.status === 'PROVIDER_DELIVERING';

      setSteps([
        {
          status: 'LISTED',
          title: '📦 1. Surplus Dipublikasikan di Replate Engine',
          description: 'Provider mengunggah makanan surplus & lulus 8 Checklist Kelayakan Pangan BPOM RI.',
          timestamp: foundClaim.createdAt || new Date(Date.now() - 3600000 * 4).toISOString(),
          actor: foundClaim.storeName || 'Warung Bakso Pak Kumis Surabaya',
          completed: true,
          current: false,
        },
        {
          status: 'MATCHED',
          title: '🔍 2. Smart Matching Engine 2.0 Calculated',
          description: 'Algoritma memberikan skor kecocokan gizi & jarak lokasi terdekat.',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          actor: 'Replate Smart Matching Engine',
          completed: true,
          current: false,
        },
        {
          status: 'CLAIMED',
          title: '✅ 3. Penyelamatan Makanan Disetujui',
          description: 'Klaim booking diverifikasi lunas & Kode Resi QR aktif.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          actor: foundClaim.userName || 'Panti Asuhan / Konsumen',
          completed: true,
          current: false,
        },
        {
          status: 'IN_TRANSIT',
          title: '🚚 4. Pengiriman / Penjemputan Makanan OTW',
          description: `Makanan sedang diantar oleh ${foundClaim.driverName || foundClaim.courierName || 'Armada Driver Toko'}.`,
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
          actor: foundClaim.driverName || foundClaim.courierName || 'Armada Toko Direct (Mas Doni/Mas Agus)',
          completed: isDone || isOTW,
          current: isOTW && !isDone,
        },
        {
          status: 'VERIFIED',
          title: '✔️ 5. Verifikasi Makanan Sampai di Tujuan (Selesai)',
          description: isDone
            ? `Makanan telah diterima dengan baik di ${foundClaim.address || 'lokasi tujuan'}. Bukti foto serah terima terverifikasi.`
            : 'Menunggu konfirmasi foto serah terima & QR scan dari penerima.',
          timestamp: isDone ? new Date().toISOString() : undefined,
          actor: foundClaim.userName || 'Pengurus Penerima',
          completed: isDone,
          current: isDone,
        },
      ]);
    } else {
      // Generic dynamically generated timeline for custom code entered by user
      setMatchedClaim({
        code: activeCode,
        foodName: `Surplus Makanan Resi #${activeCode}`,
        userName: 'Penerima Terdaftar Surabaya',
        driverName: 'Tim Kurir Logistik',
      });
      setFoodName(`Surplus Makanan Steril (Resi ${activeCode})`);
      setSteps([
        {
          status: 'LISTED',
          title: '📦 1. Makanan Dipublikasikan (Listed)',
          description: 'Provider mengunggah makanan surplus dan lulus 8 SOP Readiness Checklist.',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          actor: 'Warung Bakso Pak Kumis Surabaya',
          completed: true,
          current: false,
        },
        {
          status: 'MATCHED',
          title: '🔍 2. Smart Matching Engine 2.0 Calculated',
          description: 'Algoritma mencocokkan kategori gizi & radius lokasi terdekat.',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          actor: 'Replate Smart Engine',
          completed: true,
          current: false,
        },
        {
          status: 'CLAIMED',
          title: '✅ 3. Penyelamatan Diklaim & Disetujui',
          description: 'Tugas rescue diterima dan QR verification code diterbitkan.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          actor: 'Penerima Terdaftar',
          completed: true,
          current: false,
        },
        {
          status: 'IN_TRANSIT',
          title: '🚚 4. Dalam Pengantaran / Penjemputan (OTW)',
          description: 'Driver Armada Toko / Kurir Relawan dalam perjalanan menuju lokasi tujuan.',
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
          actor: 'Driver Armada Logistik',
          completed: true,
          current: true,
        },
        {
          status: 'VERIFIED',
          title: '✔️ 5. Verifikasi Keamanan Pangan & Serah Terima Selesai',
          description: 'QR Code di-scan, SOP 5-point food safety diverifikasi.',
          completed: false,
          current: false,
        },
      ]);
    }
  }, [currentId, cleanParam]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 w-full space-y-6">
        {/* Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-black uppercase tracking-wider rounded-md">
            <span>🔒 PELACAK TRANSPARANSI TRANSAKSI & RANTAI PASOK</span>
          </div>
          <h1 className="text-3xl font-black text-[#1B3A5C] tracking-tight">
            Lacak Status Food Rescue ID
          </h1>
          <p className="text-xs text-slate-600 font-medium max-w-xl mx-auto">
            Masukkan Kode Resi Transaksi (Contoh: <strong className="font-mono text-[#1B3A5C]">FB-DIR-99382</strong>, <strong className="font-mono text-[#1B3A5C]">FB-DIR-88291</strong>, atau <strong className="font-mono text-[#1B3A5C]">FB-DON-88192</strong>) untuk melihat riwayat audit log.
          </p>
        </div>

        {/* Search Bar */}
        <TrackingSearch initialValue={currentId} onSearch={handleExecuteSearch} />

        {/* Privacy Alert Box */}
        <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-700">
          <div className="space-y-0.5">
            <span className="font-extrabold text-[#1B3A5C] flex items-center gap-1.5">
              <span>🔒 Mode Transparansi Terproteksi (Privasi Data Panti & Konsumen):</span>
            </span>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Nomor WhatsApp dan dokumen audit lengkap disembunyikan dari publik anonim untuk mematuhi regulasi privasi data.
            </p>
          </div>
          <Link
            href="/login"
            className="px-3.5 py-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all shrink-0"
          >
            Login Dashboard ➔
          </Link>
        </div>

        {/* Dynamic Timeline Card */}
        <TrackingTimeline referenceId={currentId} foodName={foodName} steps={steps} />
      </main>

      <Footer />
    </div>
  );
}
