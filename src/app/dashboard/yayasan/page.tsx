'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckIcon, PackageIcon, SearchIcon, MapPinIcon, ClockIcon, ShieldCheckIcon } from '@/components/ui/Icon';

export default function YayasanDashboardPage() {
  const [pantiName, setPantiName] = useState('Panti Asuhan Kasih Ibu');
  const [contactPerson, setContactPerson] = useState('Ibu Hajjah Maryam');
  const [address, setAddress] = useState('Jl. Raya Gubeng No. 88, Gubeng');

  const matchedSuppliers = [
    {
      storeName: 'Warung Bakso Pak Kumis',
      offer: '40 Porsi Nasi Kotak & Lauk Bergizi (Donasi Rp 0)',
      distance: '1.2 km',
      matchScore: 96,
      readyTime: 'Siap Ambil Pukul 20:30 WIB',
    },
    {
      storeName: 'Rotiboy Bakery',
      offer: '25 Porsi Roti Tawar & Pastry Steril (Donasi Rp 0)',
      distance: '1.8 km',
      matchScore: 92,
      readyTime: 'Siap Ambil Pukul 21:00 WIB',
    },
  ];

  const [isFreshAccount, setIsFreshAccount] = useState(false);
  const [recipientCapacity, setRecipientCapacity] = useState('45 Jiwa');

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
        if (parsed.capacity) setRecipientCapacity(parsed.capacity);
      }
    } catch (_) {}
  }, []);

  const stats = [
    { label: 'Total Bantuan Diterima', value: isFreshAccount ? '0 Porsi' : '185 Porsi', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Anak Yatim / Penerima', value: isFreshAccount ? recipientCapacity : '45 Jiwa', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Emisi CO2 Dicegah', value: isFreshAccount ? '0.0 kg' : '92.5 kg', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Permintaan Bantuan Aktif', value: isFreshAccount ? '0 Permintaan' : '2 Permintaan', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-5 sm:space-y-8 max-w-6xl mx-auto pb-12">
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
                Ajukan Kebutuhan Panti
              </Button>
            </Link>
            <Link href="/dashboard/explore">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SearchIcon size={14} className="text-[#1B3A5C]" />}
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Eksplor Donasi
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
              <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
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
                    Jarak: <strong>{supplier.distance}</strong>
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
                  <Link href="/dashboard/explore">
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<CheckIcon size={13} />}
                      className="font-black text-xs text-slate-950 px-3 py-1.5 shadow-xs cursor-pointer"
                    >
                      Klaim Alokasi
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
