'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';

export default function PartnerOverviewPage() {
  const [isFreshAccount, setIsFreshAccount] = useState(false);
  const [orgName, setOrgName] = useState('Komunitas Foodbank Surabaya Center');
  const [leaderName, setLeaderName] = useState('Mas Rizky Multazam');

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
    } catch (_) {}
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-widest block">
            Dashboard Food Rescue Volunteer
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B3A5C]">{orgName}</h2>
          <p className="text-xs text-[#6C757D] font-medium">
            Koordinator: <strong>{leaderName}</strong> • Posko Logistik Surabaya Raya
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/rescue-partner/settings">
            <Button variant="outline" size="md" className="font-extrabold text-xs">
              Kelola Driver Relawan
            </Button>
          </Link>
          <Link href="/dashboard/rescue-partner/requests">
            <Button variant="gold" size="md" className="font-black text-xs text-slate-950">
              Permintaan Match Baru ({isFreshAccount ? '0' : '2'})
            </Button>
          </Link>
        </div>
      </div>

      <ImpactDashboard
        foodWeightKg={isFreshAccount ? 0 : 103.3}
        co2SavedKg={isFreshAccount ? 0 : 258.25}
        peopleFed={isFreshAccount ? 0 : 205}
      />

      {/* SMART MATCHING 2.0: TUGAS PENJEMPUTAN RUTE LOGISTIK PALING EFISIEN */}
      <Card className="border-slate-200 shadow-xs rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
          <CardTitle className="text-sm font-black text-[#1B3A5C] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                SMART MATCHING ENGINE 2.0 (LOGISTIK ARMADA)
              </span>
              <span>Tugas Penjemputan Logistik & Optimasi Rute Hari Ini</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              2 Kurir Relawan Siap Jalan
            </span>
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 p-5 text-xs">
          <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#1B3A5C] text-[#D4A843] font-black px-2.5 py-0.5 rounded font-mono">
                  Skor Efisiensi Rute 96%
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-extrabold px-2 py-0.5 rounded uppercase">
                  HOTEL SURPLUS • RUTE TUNJUNGAN
                </span>
              </div>
              <p className="font-black text-[#1B3A5C] text-sm">Nasi Goreng Buffet + Ayam Bakar (30 Porsi)</p>
              <p className="text-xs text-slate-600 font-medium">
                Hotel Majapahit Surabaya ➔ Panti Asuhan Kasih Ibu Wonokromo (Jarak Rute: 2.1 km • Estimasi: 12 Menit)
              </p>
            </div>
            <Link href="/dashboard/rescue-partner/active" className="shrink-0">
              <Button variant="primary" size="sm" className="font-black text-xs py-2.5 px-4 shadow-xs">
                Buka Surat Jalan Digital WA ➔
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
