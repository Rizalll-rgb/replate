'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function YayasanClaimsPage() {
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'SELF_PICKUP' | 'RESCUE_PARTNER'>('ALL');

  const claims = [
    {
      id: 'CLM-YYS-001',
      code: 'FB-YYS-8821',
      foodName: 'Roti & Kue Pastry Surplus',
      provider: 'Rotiboy Surabaya',
      address: 'Jl. Pemuda No. 12, Surabaya',
      quantity: '30 Porsi',
      method: 'RESCUE_PARTNER',
      methodLabel: 'Diantar Rescue Partner',
      status: 'PICKED_UP',
      claimedAt: '21 Aug 2026, 16:30 WIB',
    },
    {
      id: 'CLM-YYS-002',
      code: 'FB-YYS-8822',
      foodName: 'Nasi Kotak Ayam Bakar',
      provider: 'Catering Bu Ida',
      address: 'Jl. Raya Manyar No. 88, Surabaya',
      quantity: '25 Porsi',
      method: 'SELF_PICKUP',
      methodLabel: 'Ambil Sendiri (Self-Pickup)',
      status: 'CONFIRMED',
      claimedAt: '21 Aug 2026, 17:15 WIB',
    },
  ];

  const filteredClaims = methodFilter === 'ALL'
    ? claims
    : claims.filter((c) => c.method === methodFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B3A5C]">Permintaan & Klaim Panti</h1>
          <p className="text-xs text-slate-500">Kelola daftar klaim bantuan makanan surplus untuk panti asuhan & lembaga sosial</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={methodFilter === 'ALL' ? 'primary' : 'outline'}
            onClick={() => setMethodFilter('ALL')}
            className="text-xs font-bold"
          >
            Semua
          </Button>
          <Button
            size="sm"
            variant={methodFilter === 'SELF_PICKUP' ? 'primary' : 'outline'}
            onClick={() => setMethodFilter('SELF_PICKUP')}
            className="text-xs font-bold"
          >
            🚗 Ambil Sendiri
          </Button>
          <Button
            size="sm"
            variant={methodFilter === 'RESCUE_PARTNER' ? 'primary' : 'outline'}
            onClick={() => setMethodFilter('RESCUE_PARTNER')}
            className="text-xs font-bold"
          >
            🤝 Diantar Partner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {claim.code}
                  </Badge>
                  <h3 className="font-extrabold text-base text-[#1B3A5C]">{claim.foodName}</h3>
                  <Badge variant="warning" className="text-[10px]">
                    {claim.quantity}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  🏪 Provider: <span className="font-bold text-slate-800">{claim.provider}</span> ({claim.address})
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {claim.method === 'SELF_PICKUP' ? '🚗' : '🤝'} {claim.methodLabel}
                  </span>
                  <span className="text-slate-400">Diminta pada: {claim.claimedAt}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Badge variant={claim.status === 'PICKED_UP' ? 'success' : 'warning'} className="px-3 py-1 text-xs">
                  {claim.status === 'PICKED_UP' ? 'Selesai Diterima' : 'Menunggu Penjemputan'}
                </Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
