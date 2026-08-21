'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';

export default function ConsumerHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Riwayat Penyelamatan Makanan</h2>
        <p className="text-xs text-[#6C757D]">Daftar klaim makanan yang telah diselesaikan.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Riwayat Klaim Selesai</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-xs">
          <div className="p-3 bg-[#F8F9FA] rounded-xl border flex items-center justify-between">
            <div>
              <p className="font-bold text-[#1B3A5C]">Roti Tawar Gandum (2 Pcs)</p>
              <p className="text-[11px] text-[#6C757D]">Roti Boy - Tunjungan Plaza | 18 Agustus 2026</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
              PICKED_UP
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
