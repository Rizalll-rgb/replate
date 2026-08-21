'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';

export default function PartnerOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1B3A5C]">Overview Food Rescue Partner</h2>
          <p className="text-xs text-[#6C757D]">Food Bank Surabaya & Panti Asuhan Kasih Ibu</p>
        </div>
        <Link href="/dashboard/rescue-partner/requests">
          <Button variant="gold" size="md">
            🔔 Permintaan Match Baru (2)
          </Button>
        </Link>
      </div>

      <ImpactDashboard foodWeightKg={103.3} co2SavedKg={258.25} peopleFed={205} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">🚚 Tugas Penjemputan Aktif Hari Ini</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-xs">
          <div className="p-4 bg-[#F8F9FA] rounded-xl border flex items-center justify-between">
            <div>
              <p className="font-bold text-[#1B3A5C]">Nasi Goreng Buffet + Ayam Bakar (30 Porsi)</p>
              <p className="text-[11px] text-[#6C757D]">Hotel Majapahit Surabaya — Tunjungan</p>
            </div>
            <Link href="/dashboard/rescue-partner/active">
              <Button variant="primary" size="sm">
                Proses & Verifikasi SOP ➔
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
