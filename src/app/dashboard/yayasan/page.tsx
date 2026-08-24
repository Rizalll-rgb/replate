'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function YayasanDashboardPage() {
  const [pantiName, setPantiName] = useState('Panti Asuhan Kasih Ibu');
  const [contactPerson, setContactPerson] = useState('Ibu Hajjah Maryam');
  const [address, setAddress] = useState('Jl. Raya Gubeng No. 88, Gubeng, Surabaya Pusat');

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setPantiName(parsed.entityName);
        if (parsed.contactPerson) setContactPerson(parsed.contactPerson);
        if (parsed.address) setAddress(parsed.address);
      }
    } catch (_) {}
  }, []);

  const stats = [
    { label: 'Total Bantuan Diterima', value: '185 Porsi', icon: '🍲', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Anak Yatim/Penerima', value: '45 Jiwa', icon: '🏠', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Emisi CO2 Dicegah', value: '92.5 kg', icon: '🌱', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Permintaan Bantuan Aktif', value: '2 Permintaan', icon: '📦', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentAssistance = [
    {
      id: 'CLM-YYS-001',
      foodName: 'Roti & Kue Pastry Surplus',
      provider: 'Rotiboy Surabaya',
      quantity: '30 Porsi',
      method: 'Diantar Rescue Partner',
      status: 'PICKED_UP',
      date: '21 Aug 2026',
    },
    {
      id: 'CLM-YYS-002',
      foodName: 'Nasi Kotak Ayam Bakar',
      provider: 'Catering Bu Ida',
      quantity: '25 Porsi',
      method: 'Ambil Sendiri (Self-Pickup)',
      status: 'CONFIRMED',
      date: '21 Aug 2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1B3A5C] via-[#2C5A8F] to-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-block px-3 py-1 bg-[#D4A843] text-slate-900 text-xs font-black uppercase tracking-wider rounded-full shadow-xs">
            Dashboard Food Beneficiary (Yayasan & Panti Asuhan)
          </span>
          <h1 className="text-2xl font-black tracking-tight">{pantiName}</h1>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Ketua / Pengurus: <strong>{contactPerson}</strong> • Lokasi: <strong>{address}</strong>
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link href="/dashboard/yayasan/claims">
              <Button size="sm" className="bg-[#D4A843] hover:bg-[#b88f35] text-slate-900 font-extrabold shadow-sm">
                + Ajukan Klaim Bantuan Pangan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="flex items-center gap-4 p-5">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center text-2xl shadow-xs`}>
                {item.icon}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                <p className={`text-xl font-black ${item.color} mt-0.5`}>{item.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assistance Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-base text-[#1B3A5C]">Status Bantuan Pangan Terkini</CardTitle>
                <p className="text-xs text-slate-500">Daftar alokasi surplus makanan layak konsumsi untuk panti</p>
              </div>
              <Link href="/dashboard/yayasan/claims" className="text-xs font-bold text-[#1B3A5C] hover:underline">
                Lihat Semua ➔
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {recentAssistance.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#1B3A5C]">{item.foodName}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.quantity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        🏪 Provider: <span className="font-bold text-slate-700">{item.provider}</span> • Alur: <span className="font-semibold text-amber-700">{item.method}</span>
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={item.status === 'PICKED_UP' ? 'success' : 'warning'}>
                        {item.status === 'PICKED_UP' ? 'Selesai Diterima' : 'Dikonfirmasi'}
                      </Badge>
                      <p className="text-[11px] text-slate-400 font-medium">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Action & Pickup Flow Guide */}
        <div className="space-y-4">
          <Card className="border-slate-200 bg-[#0F1923] text-white p-5 space-y-3 shadow-md">
            <span className="text-[11px] font-extrabold text-[#D4A843] uppercase tracking-widest block">
              Pilihan Alur Penerimaan Pangan
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#1B3A5C] rounded-xl border border-[#2C5A8F] space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>🚗</span> Ambil Sendiri (Self-Pickup)
                </p>
                <p className="text-[11px] text-slate-300">
                  Perwakilan yayasan mengambil makanan langsung ke lokasi provider sesuai jam operasional.
                </p>
              </div>

              <div className="p-3 bg-[#1A2636] rounded-xl border border-[#2C5A8F] space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>🤝</span> Diantar Rescue Partner
                </p>
                <p className="text-[11px] text-slate-300">
                  Kurir armada komunitas membantu menjemput dan menyalurkan makanan langsung ke panti.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
