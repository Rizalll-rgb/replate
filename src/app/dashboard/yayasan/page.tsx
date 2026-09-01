'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function YayasanDashboardPage() {
  const [pantiName, setPantiName] = useState('Panti Asuhan Kasih Ibu Surabaya');
  const [contactPerson, setContactPerson] = useState('Ibu Hajjah Maryam');
  const [address, setAddress] = useState('Jl. Raya Gubeng No. 88, Gubeng, Surabaya Pusat');

  const matchedSuppliers = [
    {
      storeName: 'Warung Bakso Pak Kumis Surabaya',
      offer: '40 Porsi Nasi Kotak & Lauk Bergizi (Donasi Rp 0)',
      distance: '1.2 km (Wonokromo)',
      matchScore: 96,
      readyTime: 'Siap Ambil Pukul 20:30 WIB',
    },
    {
      storeName: 'Rotiboy Bakery Surabaya',
      offer: '25 Porsi Roti Tawar & Pastry Steril (Donasi Rp 0)',
      distance: '1.8 km (Tunjungan)',
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1B3A5C] via-[#2C5A8F] to-[#1B3A5C] rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-[#D4A843] text-slate-900 text-xs font-black uppercase tracking-wider rounded-full shadow-xs">
            Dashboard Food Beneficiary (Yayasan & Panti Asuhan)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{pantiName}</h1>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Ketua / Pengurus: <strong>{contactPerson}</strong> • Lokasi: <strong>{address}</strong>
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link href="/dashboard/yayasan/claims">
            <Button size="md" className="bg-[#D4A843] hover:bg-[#b88f35] text-slate-950 font-black text-xs shadow-md">
              + Ajukan Kebutuhan Makanan Panti Baru
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="md" className="text-white border-2 border-white/40 hover:bg-white/10 font-bold text-xs">
              Eksplor Donasi Pangan Rp 0 ➔
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="border-slate-200 shadow-xs bg-white rounded-3xl p-5">
            <CardBody className="p-0 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 block">{item.label}</span>
              <strong className="text-xl font-black text-[#1B3A5C] font-mono block">{item.value}</strong>
              <span className="text-[10px] text-emerald-600 font-bold block">Terverifikasi Dinsos</span>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* SMART MATCHING 2.0: DONATUR SURPLUS PALING COCOK DENGAN KEBUTUHAN PANTI */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
              SMART MATCHING ENGINE 2.0 (UNTUK YAYASAN & PANTI)
            </span>
            <h3 className="text-lg font-black text-[#1B3A5C]">
              Donatur Pangan Terdekat Yang Siap Menyuplai Nutrisi
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">Radius &lt; 2.0 km</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedSuppliers.map((supplier, idx) => (
            <div
              key={idx}
              className="p-5 bg-gradient-to-br from-white to-emerald-50/40 rounded-3xl border-2 border-emerald-300 shadow-xs flex flex-col justify-between space-y-4"
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
                  <p>Jarak: <strong>{supplier.distance}</strong></p>
                  <p className="text-emerald-700 font-bold">{supplier.readyTime}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-medium">Bisa Diantar / Self-Pickup</span>
                <div className="flex gap-2">
                  <Link href="/dashboard/yayasan/bantuan-pangan">
                    <Button variant="outline" size="sm" className="font-bold text-[10px] text-emerald-800 border-emerald-300 px-3 py-1.5 shadow-xs bg-emerald-50 hover:bg-emerald-100">
                      Cetak Bukti Penerimaan 🖨️
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-3 py-1.5 shadow-xs">
                      Klaim Alokasi ➔
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
