'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import {
  BikeIcon,
  TruckIcon,
  MapPinIcon,
  MapIcon,
  ChatIcon,
  PhoneIcon,
  CheckIcon,
  ClockIcon,
  SearchIcon,
  ShieldCheckIcon,
  PackageIcon,
  CreditCardIcon,
} from '@/components/ui/Icon';
import Link from 'next/link';

interface TrackingManifest {
  id: string;
  trackingCode: string;
  foodName: string;
  quantity: string;
  sourceName: string;
  sourceAddress: string;
  destinationName: string;
  destinationAddress: string;
  deliveryType: 'RESCUE_COURIER' | 'PROVIDER_DIRECT' | 'SELF_PICKUP';
  driverName: string;
  driverPhone: string;
  driverVehicle: string;
  driverOrg: string;
  currentStep: number; // 1 to 5
  statusText: string;
  estimatedArrival: string;
  temperatureC: number;
  lat: number;
  lng: number;
  history: { time: string; title: string; desc: string; done: boolean }[];
}

export default function WorkspaceLiveTrackingPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTracking, setActiveTracking] = useState<TrackingManifest | null>(null);
  const [showTimelineHistory, setShowTimelineHistory] = useState(false);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const defaultManifests: TrackingManifest[] = [
    {
      id: 'TRK-001',
      trackingCode: 'RPL-DON-2026-88192',
      foodName: '45 Porsi Nasi Ayam Bakar & Lauk Bersih',
      quantity: '45 Porsi',
      sourceName: 'Warung Bakso Pak Kumis (Genteng)',
      sourceAddress: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
      destinationName: 'Panti Asuhan Kasih Ibu (Wonokromo)',
      destinationAddress: 'Jl. Raya Gubeng No. 88, Wonokromo, Surabaya',
      deliveryType: 'RESCUE_COURIER',
      driverName: 'Budi Santoso (Relawan ID #RC-881)',
      driverPhone: '0812-9876-5432',
      driverVehicle: 'Motor Box Cooler Steril (Plat L 8912 RC)',
      driverOrg: 'Komunitas FoodBank Surabaya Relawan',
      currentStep: 4,
      statusText: 'Dalam Perjalanan Menuju Lokasi Panti (OTW)',
      estimatedArrival: '15 Menit Lagi (~19:45 WIB)',
      temperatureC: 62.4,
      lat: -7.2754,
      lng: 112.7541,
      history: [
        { time: '18:30 WIB', title: 'Alokasi Donasi Terkonfirmasi', desc: 'Restoran menyanggupi dan menyiapkan 45 porsi makanan.', done: true },
        { time: '18:50 WIB', title: 'Inspeksi Higienitas 8-Poin BPOM Lolos', desc: 'Suhu makanan terjaga >60°C, kemasan food grade tersegel.', done: true },
        { time: '19:10 WIB', title: 'Kurir Relawan Menjemput Paket', desc: 'Driver Budi Santoso memindai QR Serah Terima di resto.', done: true },
        { time: '19:25 WIB', title: 'Dalam Pengantaran GPS Surabaya', desc: 'Armada sedang melaju di koridor Jl. Raya Darmo menuju Panti.', done: true },
        { time: 'Estimasi 19:45 WIB', title: 'Serah Terima di Panti Asuhan', desc: 'Pengurus panti memindai QR Surat Jalan untuk konfirmasi tiba.', done: false },
      ],
    },
    {
      id: 'TRK-002',
      trackingCode: 'RPL-DIR-2026-88291',
      foodName: '40 Porsi Rice Bowl Ayam Geprek Steril',
      quantity: '40 Porsi',
      sourceName: 'Dapur Outlet Pak Kumis (Genteng)',
      sourceAddress: 'Jl. Genteng Kali No. 45, Surabaya',
      destinationName: 'Panti Asuhan Wonokromo (Panti A)',
      destinationAddress: 'Jl. Wonokromo No. 45, Wonokromo, Surabaya',
      deliveryType: 'PROVIDER_DIRECT',
      driverName: 'Driver Toko: Mas Agus (Armada Resto)',
      driverPhone: '0813-9876-5432',
      driverVehicle: 'Mobil Blind Van Pendingin (Plat L 1234 XYZ)',
      driverOrg: 'Armada Internal Warung Bakso Pak Kumis',
      currentStep: 4,
      statusText: 'Driver Toko OTW Pengantaran Mandiri',
      estimatedArrival: '20 Menit Lagi (~20:00 WIB)',
      temperatureC: 65.0,
      lat: -7.3012,
      lng: 112.7389,
      history: [
        { time: '19:00 WIB', title: 'Pesanan Dimasak & Dikemas', desc: 'Dapur resto menyelesaikan 40 porsi rice bowl higienis.', done: true },
        { time: '19:15 WIB', title: 'Surat Jalan Driver Toko Terbit', desc: 'Driver Mas Agus menerima penugasan surat jalan via WhatsApp.', done: true },
        { time: '19:30 WIB', title: 'Driver Toko Berangkat (OTW)', desc: 'Armada mobil box bergerak menuju lokasi panti penerima.', done: true },
        { time: 'Estimasi 20:00 WIB', title: 'Tiba & Serah Terima Panti', desc: 'Scan QR serah terima langsung di panti asuhan.', done: false },
      ],
    },
    {
      id: 'TRK-003',
      trackingCode: 'RPL-RSC-2026-99102',
      foodName: '3 Porsi Nasi Goreng Buffet Specialty (Rescue Sale)',
      quantity: '3 Porsi',
      sourceName: 'Warung Bakso Pak Kumis (Genteng)',
      sourceAddress: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
      destinationName: 'Ahmad Fauzi (Konsumen)',
      destinationAddress: 'Ambil Mandiri di Kasir Toko',
      deliveryType: 'SELF_PICKUP',
      driverName: 'Pembeli Mandiri: Ahmad Fauzi',
      driverPhone: '0812-7766-5544',
      driverVehicle: 'Ambil Mandiri (Self-Pickup)',
      driverOrg: 'Konsumen Replate',
      currentStep: 3,
      statusText: 'Makanan Siap Diambil di Meja Kasir',
      estimatedArrival: 'Batas Ambil: Pukul 21:00 WIB',
      temperatureC: 68.0,
      lat: -7.2575,
      lng: 112.7521,
      history: [
        { time: '17:00 WIB', title: 'Booking Rescue Sale Dikonfirmasi', desc: 'Pembayaran QRIS Mandiri Rp 15.000 LUNAS.', done: true },
        { time: '17:15 WIB', title: 'Makanan Disiapkan & Dikemas', desc: 'Paket makanan telah siap di rak pick-up steril kasir.', done: true },
        { time: '17:30 WIB', title: 'Siap Diambil di Meja Kasir', desc: 'Tunjukkan QR Tiket kepada kasir saat mengambil.', done: true },
        { time: 'Menunggu', title: 'Pengambilan Selesai', desc: 'Kasir menekan tombol konfirmasi serah terima.', done: false },
      ],
    },
  ];

  // Start with clean state - no active tracking shown initially
  // User must search for a resi code or select from list
  useEffect(() => {
    // Check for active claims that have tracking data
    try {
      const claims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
      const activeClaim = claims.find((c: any) =>
        c.status === 'IN_TRANSIT_TO_SHELTER' || c.status === 'DRIVER_ASSIGNED_OTW_STORE'
      );
      if (activeClaim) {
        // Auto-load if there's an active in-transit claim
        const matchedManifest = defaultManifests.find(
          (m) => m.trackingCode === activeClaim.claimCode || m.trackingCode === activeClaim.code
        );
        if (matchedManifest) {
          setActiveTracking(matchedManifest);
        }
      }
      // Otherwise: stay clean, no active tracking displayed
    } catch (_) {}
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = defaultManifests.find(
      (m) =>
        m.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.driverName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setActiveTracking(found);
      setToastState({
        isOpen: true,
        message: `Menampilkan status pelacakan untuk kode "${found.trackingCode}".`,
        type: 'success',
      });
    } else {
      setToastState({
        isOpen: true,
        message: `Kode resi "${searchQuery}" tidak ditemukan. Coba kode "RPL-DON-2026-88192" atau "RPL-RSC-2026-99102".`,
        type: 'error',
      });
    }
  };

  const handleDriverUpdateStep = () => {
    if (!activeTracking) return;
    if (activeTracking.currentStep < 5) {
      const nextStep = activeTracking.currentStep + 1;
      const isDelivered = nextStep === 5;
      const updated = {
        ...activeTracking,
        currentStep: nextStep,
        statusText: isDelivered ? 'Pengantaran Selesai & Makanan Tiba dengan Selamat' : 'Dalam Perjalanan Menuju Lokasi',
        history: activeTracking.history.map((h, i) => (i < nextStep ? { ...h, done: true } : h)),
      };
      setActiveTracking(updated);
      setToastState({
        isOpen: true,
        message: isDelivered
          ? 'Pengantaran telah dikonfirmasi selesai! Resi ditutup dengan sukses.'
          : 'Status pengantaran berhasil diperbarui.',
        type: 'success',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <SuperAppLoader isOpen={false} message="" />
      {/* Sleek Modern Header Card (Compact & Ergonomic - Seragam Antar Modul) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Logistik & Pelacakan Live
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>GPS & Suhu Steril Aktif</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              Pelacakan & Live Tracking Pengantaran
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Pantau posisi kurir relawan, armada driver toko, monitoring suhu makanan, dan serah terima Kota Surabaya.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/provider/claims">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CreditCardIcon size={14} className="text-[#1B3A5C]" />}
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Meja Kasir
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar & Quick Manifest Selectors */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Masukkan Kode Resi / Surat Jalan (Contoh: FB-DON-88192, FB-DIR-88291, FB-SALE-99102)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B3A5C] font-mono shadow-xs"
          />
          <Button variant="gold" size="md" type="submit" className="font-black text-xs text-slate-950 py-3 px-6 shadow-md">
            Lacak Resi 
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 text-[11px]">Pilih Resi Aktif:</span>
          {defaultManifests.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveTracking(m)}
              className={`px-3 py-1.5 rounded-xl font-bold font-mono transition-all cursor-pointer ${
                activeTracking?.id === m.id
                  ? 'bg-[#1B3A5C] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {m.trackingCode} ({m.deliveryType === 'RESCUE_COURIER' ? 'Kurir Relawan' : m.deliveryType === 'PROVIDER_DIRECT' ? 'Driver Toko' : 'Ambil Kasir'})
            </button>
          ))}
        </div>
      </div>

      {activeTracking && (
        <>
          {/* ======================================================== */}
          {/* MOBILE SUPER-APP LAYOUT (Screens < lg)                   */}
          {/* ======================================================== */}
          <div className="space-y-4 lg:hidden">
            {/* 1. Top GPS Live Map (Gojek / Grab Style) */}
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm relative">
              <div className="relative w-full h-56 bg-slate-800">
                <iframe
                  title="Live Mobile GPS Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${activeTracking.lat},${activeTracking.lng}&z=15&output=embed`}
                  className="w-full h-full filter saturate-150"
                />
                <div className="absolute top-3 left-3 bg-[#1B3A5C]/95 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-md uppercase tracking-wider flex items-center gap-1.5 border border-[#2C5A8F]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Posisi Armada Live: {activeTracking.driverVehicle.split('(')[0]}</span>
                </div>
              </div>
            </div>

            {/* 2. Floating Super-App Status & Driver Card */}
            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              {/* Status Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black text-[#1B3A5C] bg-slate-100 px-2 py-0.5 rounded">
                    {activeTracking.trackingCode}
                  </span>
                  <h3 className="text-base font-black text-[#1B3A5C] leading-snug">{activeTracking.foodName}</h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg shadow-xs shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  <span>{activeTracking.currentStep >= 5 ? 'Selesai' : 'OTW'}</span>
                </span>
              </div>

              {/* Status Banner */}
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ClockIcon size={16} className="text-blue-700 shrink-0" />
                  <div>
                    <span className="text-[10px] text-blue-800 font-bold block">{activeTracking.statusText}</span>
                    <strong className="text-xs text-[#1B3A5C]">{activeTracking.estimatedArrival}</strong>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                  {activeTracking.temperatureC}°C BPOM
                </span>
              </div>

              {/* Driver Contact & Identity Row */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1B3A5C] text-white flex items-center justify-center shrink-0">
                      {activeTracking.deliveryType === 'PROVIDER_DIRECT' ? (
                        <TruckIcon size={18} />
                      ) : (
                        <BikeIcon size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-900">{activeTracking.driverName}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{activeTracking.driverVehicle}</p>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    {activeTracking.deliveryType === 'RESCUE_COURIER' ? 'Kurir Relawan' : 'Armada Toko'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`https://wa.me/${activeTracking.driverPhone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(activeTracking.driverName)},%20koordinasi%20pengantaran%20${activeTracking.trackingCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <ChatIcon size={14} />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${activeTracking.driverPhone.replace(/\D/g, '')}`}
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-black text-[11px] rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <PhoneIcon size={14} />
                    <span>Telepon</span>
                  </a>
                </div>
              </div>

              {/* Route Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Penjemputan:</span>
                    <strong className="text-xs text-[#1B3A5C] block truncate">{activeTracking.sourceName}</strong>
                    <p className="text-[10px] text-slate-500 truncate">{activeTracking.sourceAddress}</p>
                  </div>
                </div>

                <div className="border-l-2 border-dashed border-slate-300 ml-1 h-3"></div>

                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Tujuan:</span>
                    <strong className="text-xs text-emerald-900 block truncate">{activeTracking.destinationName}</strong>
                    <p className="text-[10px] text-slate-500 truncate">{activeTracking.destinationAddress}</p>
                  </div>
                </div>
              </div>

              {/* Collapsible Timeline Stepper */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTimelineHistory(!showTimelineHistory)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ClockIcon size={13} />
                  <span>{showTimelineHistory ? 'Sembunyikan Rincian Timeline' : `Lihat ${activeTracking.history.length} Checkpoint Perjalanan`}</span>
                  <span className="text-[9px]">{showTimelineHistory ? '▲' : '▼'}</span>
                </button>

                {showTimelineHistory && (
                  <div className="mt-3 relative pl-6 space-y-4 border-l-2 border-[#1B3A5C]/20 text-xs">
                    {activeTracking.history.map((step, idx) => (
                      <div key={idx} className="relative">
                        <span
                          className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full font-black text-[10px] flex items-center justify-center border-2 ${
                            step.done
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'bg-slate-200 border-slate-300 text-slate-500'
                          }`}
                        >
                          {step.done ? <CheckIcon size={11} /> : idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black text-xs ${step.done ? 'text-[#1B3A5C]' : 'text-slate-500'}`}>
                              {step.title}
                            </span>
                            <span className="text-[9.5px] font-mono text-slate-400 font-bold">{step.time}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-600 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Simulation Control Button */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-wider block">
                  KONTROL SIMULASI PENGANTARAN
                </span>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleDriverUpdateStep}
                  disabled={activeTracking.currentStep >= 5}
                  className="w-full font-black text-slate-950 text-xs py-2.5 shadow-md flex items-center justify-center gap-1"
                >
                  <CheckIcon size={14} />
                  <span>
                    {activeTracking.currentStep >= 5
                      ? 'Pengantaran Selesai 100%'
                      : `Update Step ke-${activeTracking.currentStep + 1} `}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* DESKTOP LAYOUT (Screens >= lg)                           */}
          {/* ======================================================== */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Stepper, Status, & Google Maps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Status Hero Card */}
              <div className="p-6 bg-[#1B3A5C] text-white rounded-3xl border border-[#2C5A8F] shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C5A8F] pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-black text-[#D4A843] uppercase tracking-wider block">
                      KODE RESI MANIFEST: {activeTracking.trackingCode}
                    </span>
                    <h3 className="text-xl font-black text-white">{activeTracking.foodName}</h3>
                  </div>
                  <span className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-xs self-start flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>{activeTracking.statusText}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block font-medium">Estimasi Waktu Tiba:</span>
                    <strong className="text-amber-300 font-mono text-sm">{activeTracking.estimatedArrival}</strong>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block font-medium">Monitoring Suhu Makanan:</span>
                    <strong className="text-emerald-400 font-mono text-sm">{activeTracking.temperatureC}°C (Higienis BPOM)</strong>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block font-medium">Metode Logistik:</span>
                    <strong className="text-slate-200">
                      {activeTracking.deliveryType === 'RESCUE_COURIER'
                        ? 'Kurir Komunitas'
                        : activeTracking.deliveryType === 'PROVIDER_DIRECT'
                        ? 'Armada Toko'
                        : 'Ambil Mandiri'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Stepper Timeline Graphic */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-black text-sm text-[#1B3A5C] flex items-center gap-1.5">
                  <ClockIcon size={16} />
                  <span>Timeline Alur Pengantaran & Serah Terima:</span>
                </h4>
                <div className="relative pl-6 space-y-6 border-l-2 border-[#1B3A5C]/20 text-xs">
                  {activeTracking.history.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span
                        className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full font-black text-[11px] flex items-center justify-center border-2 ${
                          step.done
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'bg-slate-200 border-slate-300 text-slate-500'
                        }`}
                      >
                        {step.done ? <CheckIcon size={12} /> : idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-xs ${step.done ? 'text-[#1B3A5C]' : 'text-slate-500'}`}>
                            {step.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{step.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive GPS Map Preview */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-[#1B3A5C] flex items-center gap-1.5">
                    <MapIcon size={16} />
                    <span>Peta GPS Rute Pengantaran Surabaya</span>
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Koordinat: {activeTracking.lat}, {activeTracking.lng}
                  </span>
                </div>
                <div className="relative w-full h-56 rounded-2xl border border-slate-300 overflow-hidden bg-slate-200 shadow-xs">
                  <iframe
                    title="Live GPS Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://maps.google.com/maps?q=${activeTracking.lat},${activeTracking.lng}&z=15&output=embed`}
                    className="w-full h-full filter saturate-150"
                  />
                  <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-md uppercase tracking-wider">
                    Titik Armada: {activeTracking.destinationName}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Driver Contact, Surat Jalan Action & QR Pass */}
            <div className="space-y-6">
              {/* Driver Identity Card */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                  IDENTITAS DRIVER & ARMADA
                </span>
                <div>
                  <h4 className="font-black text-base text-[#1B3A5C]">{activeTracking.driverName}</h4>
                  <span className="text-slate-500 font-medium block">{activeTracking.driverOrg}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div>
                    <span className="text-slate-500 block font-medium">Kendaraan:</span>
                    <span className="font-bold text-slate-800">{activeTracking.driverVehicle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">No. Telepon / WA:</span>
                    <span className="font-mono font-bold text-slate-800">{activeTracking.driverPhone}</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${activeTracking.driverPhone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(activeTracking.driverName)},%20saya%20ingin%20koordinasi%20pengantaran%20makanan%20${activeTracking.trackingCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ChatIcon size={14} />
                  <span>Hubungi Driver via WhatsApp </span>
                </a>
              </div>

              {/* Location Route Breakdown */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                  RUTE TITIK PENJEMPUTAN & TUJUAN
                </span>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-black text-[#1B3A5C] block uppercase">DARI (OUTLET PENYEDIA):</span>
                    <strong className="text-[#1B3A5C] block text-xs mt-0.5">{activeTracking.sourceName}</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{activeTracking.sourceAddress}</p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-black text-emerald-900 block uppercase">MENUJU (PENERIMA):</span>
                    <strong className="text-emerald-900 block text-xs mt-0.5">{activeTracking.destinationName}</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{activeTracking.destinationAddress}</p>
                  </div>
                </div>
              </div>

              {/* Quick Action for Driver / Cashier Testing */}
              <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3 text-xs">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  KONTROL SIMULASI DRIVER / KASIR
                </span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Gunakan tombol berikut untuk mensimulasikan perubahan status step pengantaran secara instan:
                </p>
                <Button
                  variant="gold"
                  size="md"
                  onClick={handleDriverUpdateStep}
                  disabled={activeTracking.currentStep >= 5}
                  className="w-full font-black text-slate-950 text-xs py-3 shadow-md"
                >
                  {activeTracking.currentStep >= 5
                    ? 'Pengantaran Telah Selesai 100%'
                    : `Update Step ke-${activeTracking.currentStep + 1} `}
                </Button>
              </div>
            </div>
          </div>
        </>
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
