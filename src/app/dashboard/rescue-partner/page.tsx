'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckIcon,
  BikeIcon,
  SearchIcon,
  BoltIcon,
} from '@/components/ui/Icon';
import { Sparkles, ArrowRight, FileText, UserCheck, AlertTriangle } from 'lucide-react';

export default function PartnerOverviewPage() {
  const [isFreshAccount, setIsFreshAccount] = useState(false);
  const [orgName, setOrgName] = useState('Komunitas Foodbank Surabaya Center');
  const [leaderName, setLeaderName] = useState('Mas Rizky Multazam');
  const [activeDriverCount, setActiveDriverCount] = useState(3);
  const [pendingPoolCount, setPendingPoolCount] = useState(2);
  const [activeTasksCount, setActiveTasksCount] = useState(2);

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      setIsFreshAccount(isFresh);

      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setOrgName(parsed.entityName);
        if (parsed.contactPerson) setLeaderName(parsed.contactPerson);
      }

      // Check fleet drivers
      const savedFleets = localStorage.getItem('replate_fleets');
      if (savedFleets) {
        const parsedFleets = JSON.parse(savedFleets);
        if (Array.isArray(parsedFleets) && parsedFleets.length > 0) {
          setActiveDriverCount(parsedFleets.length);
        }
      }

      // Check active claims
      const savedClaims = localStorage.getItem('replate_claims');
      if (savedClaims) {
        const parsedClaims = JSON.parse(savedClaims);
        if (Array.isArray(parsedClaims)) {
          const active = parsedClaims.filter(
            (c: any) =>
              c.status === 'AWAITING_RESCUE_PICKUP' ||
              c.status === 'IN_TRANSIT' ||
              c.status === 'IN_TRANSIT_TO_PICKUP'
          );
          if (active.length > 0) setActiveTasksCount(active.length);
        }
      }
    } catch (_) {}
  }, []);

  const stats = [
    {
      label: 'Makanan Terselamatkan',
      value: isFreshAccount ? '0.0 kg' : '103.3 kg',
      sub: 'Bahan pangan layak konsumsi',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Emisi CO2 Dicegah',
      value: isFreshAccount ? '0.0 kg' : '258.3 kg',
      sub: 'Dampak dekarbonisasi pangan',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Porsi Tersalurkan',
      value: isFreshAccount ? '0 Porsi' : '205 Porsi',
      sub: 'Kepada anak yatim & dhuafa',
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Armada Driver Siaga',
      value: `${activeDriverCount} Relawan`,
      sub: 'Siap antar rute Surabaya',
      color: 'text-purple-700',
      bg: 'bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Sleek Modern Header Card (Benchmark Provider & Beneficiary) */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[10px] font-black uppercase tracking-wider rounded-md">
                Komunitas Relawan Food Rescue
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Armada Siap Jalan ({activeDriverCount} Driver Siaga)</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1B3A5C] tracking-tight">{orgName}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Koordinator: <strong className="text-slate-700">{leaderName}</strong> · Posko Logistik Wilayah Operasional Surabaya & Sekitarnya
            </p>
          </div>

          {/* Action Chips: Touch-friendly with horizontal scroll on mobile, wraps on desktop */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full lg:w-auto lg:flex-wrap lg:justify-end">
            {/* Direct to Driver Profile / Fleet Tab (Requirement Rescue #2) */}
            <Link href="/dashboard/profile?tab=FLEET" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="font-extrabold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
              >
                <TruckIcon size={14} className="text-[#1B3A5C]" />
                <span>Armada & Relawan Driver</span>
              </Button>
            </Link>

            {/* Direct to Active Route Tasks */}
            <Link href="/dashboard/rescue-partner/active" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="font-extrabold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
              >
                <BikeIcon size={14} className="text-blue-600" />
                <span>Tugas Rute ({activeTasksCount})</span>
              </Button>
            </Link>

            {/* Direct to Task Pool */}
            <Link href="/dashboard/rescue-partner/requests" className="shrink-0">
              <Button
                variant="gold"
                size="sm"
                className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <BoltIcon size={14} className="text-slate-950" />
                <span>Pool Tugas Masuk ({isFreshAccount ? '0' : pendingPoolCount})</span>
              </Button>
            </Link>

            {/* New: Bursa Penyaluran Proaktif */}
            <Link href="/dashboard/rescue-partner/exchange" className="shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-none bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
              >
                <SearchIcon size={14} className="text-white" />
                <span>Bursa Penyaluran Panti</span>
              </Button>
            </Link>

            {/* Manual Ad-Hoc Pickup Dispatch (Clarified from Mulai Jemput) */}
            <Link href="/dashboard/rescue-partner/pickup" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="font-bold text-xs py-2 px-3 rounded-xl border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Input penjemputan manual jika ada panggilan telepon langsung di luar matching sistem"
              >
                <span>+ Input Manual</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Benchmark Provider & Beneficiary) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((st, i) => (
          <div
            key={i}
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border ${st.bg} shadow-xs flex flex-col justify-between space-y-2`}
          >
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 leading-snug">{st.label}</span>
            <div>
              <div className={`text-xl sm:text-2xl font-black ${st.color} font-mono tracking-tight`}>
                {st.value}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{st.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SMART MATCHING 2.0: TUGAS PENJEMPUTAN RUTE LOGISTIK PALING EFISIEN */}
      <Card className="border-slate-200 shadow-xs rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 p-4 sm:p-5 bg-slate-50/70">
          <CardTitle className="text-xs sm:text-sm font-black text-[#1B3A5C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[9.5px] sm:text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                SMART MATCHING ENGINE 2.0 (LOGISTIK ARMADA)
              </span>
              <span>Rekomendasi Penjemputan Logistik & Optimasi Rute Hari Ini</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shrink-0">
                {activeDriverCount} Driver Siaga Jalan
              </span>
              <Link href="/dashboard/rescue-partner/requests">
                <Button variant="ghost" size="sm" className="text-xs font-black text-[#1B3A5C] hover:underline p-0">
                  Lihat Semua Pool →
                </Button>
              </Link>
            </div>
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 p-4 sm:p-5 text-xs">
          {/* Card Match Recommendation 1 */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-2xl border-2 border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-[#1B3A5C]/40 transition-all">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9.5px] sm:text-[10px] bg-[#1B3A5C] text-[#D4A843] font-black px-2.5 py-0.5 rounded-md font-mono">
                  Skor Rute 96%
                </span>
                <span className="text-[9.5px] sm:text-[10px] bg-blue-100 text-blue-900 font-black px-2.5 py-0.5 rounded-md uppercase">
                  HOTEL & RESTO SURPLUS • KAWASAN TUNJUNGAN
                </span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheckIcon size={12} className="text-emerald-600" />
                  SOP BPOM 8-Poin
                </span>
              </div>
              <div>
                <h3 className="font-black text-[#1B3A5C] text-sm sm:text-base">
                  Nasi Goreng Buffet + Ayam Bakar (30 Porsi)
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  <strong>Hotel Majapahit Surabaya</strong> (Jl. Tunjungan) → <strong>Panti Asuhan Kasih Ibu</strong> (Jl. Raya Gubeng)
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPinIcon size={11} className="text-blue-600" />
                    Jarak Rute: 2.1 km
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon size={11} className="text-amber-600" />
                    Estimasi Waktu: 12 Menit
                  </span>
                  <span>•</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-extrabold text-[10px]">
                    Batas Pickup: 21:00 WIB
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <Link href="/dashboard/rescue-partner/requests" className="w-full sm:w-auto">
                <Button
                  variant="gold"
                  size="sm"
                  className="w-full sm:w-auto font-black text-xs text-slate-950 py-2.5 px-4 shadow-xs rounded-xl cursor-pointer"
                >
                  Plot Driver & Terima
                </Button>
              </Link>
              <Link href="/dashboard/rescue-partner/surat-jalan?code=FB-DON-88192" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto font-bold text-xs py-2.5 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Preview Surat Jalan
                </Button>
              </Link>
            </div>
          </div>

          {/* Card Match Recommendation 2 */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-purple-50/40 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-[#1B3A5C]/40 transition-all">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9.5px] sm:text-[10px] bg-[#1B3A5C] text-[#D4A843] font-black px-2.5 py-0.5 rounded-md font-mono">
                  Skor Rute 92%
                </span>
                <span className="text-[9.5px] sm:text-[10px] bg-purple-100 text-purple-900 font-black px-2.5 py-0.5 rounded-md uppercase">
                  BAKERY SURPLUS • KAWASAN GENTENG
                </span>
              </div>
              <div>
                <h3 className="font-black text-[#1B3A5C] text-sm sm:text-base">
                  Roti Tawar Gandum & Croissant Steril (20 Paket)
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  <strong>Bakery Bonami Surabaya</strong> (Jl. Pemuda) → <strong>Rumah Singgah Anak Jalanan</strong> (Jl. Tegalsari)
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPinIcon size={11} className="text-purple-600" />
                    Jarak Rute: 1.8 km
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon size={11} className="text-amber-600" />
                    Estimasi Waktu: 10 Menit
                  </span>
                  <span>•</span>
                  <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-extrabold text-[10px]">
                    Bawa Tas Cooler / Box
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <Link href="/dashboard/rescue-partner/requests" className="w-full sm:w-auto">
                <Button
                  variant="gold"
                  size="sm"
                  className="w-full sm:w-auto font-black text-xs text-slate-950 py-2.5 px-4 shadow-xs rounded-xl cursor-pointer"
                >
                  Plot Driver & Terima
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* TUGAS RUTE BERJALAN SAAT INI (Shortcut Operasional Hari Ini) */}
      <Card className="border-slate-200 shadow-xs rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 p-4 sm:p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-black text-[#1B3A5C] flex items-center gap-2">
            <TruckIcon size={16} className="text-[#1B3A5C]" />
            <span>Tugas Rute Armada Sedang Berjalan</span>
          </CardTitle>
          <Link href="/dashboard/rescue-partner/active">
            <Button variant="outline" size="sm" className="font-extrabold text-xs rounded-xl border-slate-300">
              Buka Modul Tugas Rute ({activeTasksCount}) →
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-4 sm:p-5 space-y-3 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs bg-[#1B3A5C] text-white px-2 py-0.5 rounded">
                  FB-DON-88192
                </span>
                <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
                  Driver: Budi Santoso (Honda Beat - L 1234 AB)
                </span>
              </div>
              <strong className="text-sm font-black text-[#1B3A5C] block">
                Nasi Ayam Bakar Pak Kumis (45 Porsi)
              </strong>
              <p className="text-slate-600 text-[11.5px]">
                Status: <strong className="text-blue-700">Driver Menuju Lokasi Toko</strong> · Warung Bakso Pak Kumis → Panti Kasih Ibu
              </p>
            </div>
            <Link href="/dashboard/rescue-partner/surat-jalan?code=FB-DON-88192" className="shrink-0">
              <Button variant="primary" size="sm" className="font-black text-xs py-2 px-3.5 rounded-xl shadow-xs">
                Surat Jalan Driver
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
