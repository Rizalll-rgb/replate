'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';

export default function PartnerDistributionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Log Penyaluran Makanan</h2>
        <p className="text-xs text-[#6C757D]">Catatan penyaluran ke penerima akhir (Panti Asuhan, Dapur Umum, Warga).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Riwayat Distribusi Komunitas</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-xs">
          <div className="p-3 bg-[#F8F9FA] rounded-xl border flex items-center justify-between">
            <div>
              <p className="font-bold text-[#1B3A5C]">Nasi Goreng Buffet (30 Porsi)</p>
              <p className="text-[11px] text-[#6C757D]">Penerima: Dapur Umum Gotong Royong | 19 Agustus 2026</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
              DELIVERED & VERIFIED
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
