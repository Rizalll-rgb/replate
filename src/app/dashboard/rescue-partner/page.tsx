'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';

export default function PartnerOverviewPage() {
  const [orgName, setOrgName] = useState('Komunitas Foodbank Surabaya Center');
  const [leaderName, setLeaderName] = useState('Mas Rizky Multazam');

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setOrgName(parsed.entityName);
        if (parsed.contactPerson) setLeaderName(parsed.contactPerson);
      }
    } catch (_) {}
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-widest block">
            Dashboard Food Rescue Volunteer
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B3A5C]">{orgName}</h2>
          <p className="text-xs text-[#6C757D] font-medium">
            Koordinator: <strong>{leaderName}</strong> • Posko Utama Surabaya
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/rescue-partner/settings">
            <Button variant="outline" size="md" className="font-extrabold text-xs">
              ⚙️ Kelola Driver Relawan
            </Button>
          </Link>
          <Link href="/dashboard/rescue-partner/requests">
            <Button variant="gold" size="md" className="font-black text-xs text-slate-950">
              🔔 Permintaan Match Baru (2)
            </Button>
          </Link>
        </div>
      </div>

      <ImpactDashboard foodWeightKg={103.3} co2SavedKg={258.25} peopleFed={205} />

      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-extrabold text-[#1B3A5C] flex items-center justify-between">
            <span>🚚 Tugas Penjemputan Logistik Aktif Hari Ini</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              2 Kurir Relawan Bertugas
            </span>
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-xs p-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] bg-blue-100 text-blue-900 font-extrabold px-2 py-0.5 rounded uppercase">
                HOTEL SURPLUS • RUTE TUNJUNGAN
              </span>
              <p className="font-extrabold text-[#1B3A5C] text-sm">Nasi Goreng Buffet + Ayam Bakar (30 Porsi)</p>
              <p className="text-xs text-slate-500 font-medium">Hotel Majapahit Surabaya ➔ Panti Asuhan Kasih Ibu</p>
            </div>
            <Link href="/dashboard/rescue-partner/active" className="shrink-0">
              <Button variant="primary" size="sm" className="font-bold text-xs py-2 px-4 shadow-xs">
                Proses & Verifikasi SOP ➔
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
