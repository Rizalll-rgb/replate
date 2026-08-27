'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function YayasanClaimsPage() {
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'SELF_PICKUP' | 'RESCUE_PARTNER'>('ALL');
  const [claimsList, setClaimsList] = useState<any[]>([]);

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      const savedClaims = localStorage.getItem('replate_claims');

      if (isFresh) {
        if (savedClaims) {
          const parsed = JSON.parse(savedClaims);
          setClaimsList(Array.isArray(parsed) ? parsed : []);
        } else {
          setClaimsList([]);
        }
        return;
      }

      const defaultDemo = [
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
      setClaimsList(defaultDemo);
    } catch (_) {}
  }, []);

  const filteredClaims = methodFilter === 'ALL'
    ? claimsList
    : claimsList.filter((c) => c.method === methodFilter);

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

      {filteredClaims.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            🏠
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#1B3A5C]">Belum Ada Klaim Makanan Aktif</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              Panti Anda belum memiliki riwayat permintaan makanan donasi. Jelajahi donatur surplus Rp 0 di Surabaya untuk mengajukan bantuan pangan bergizi bagi anak-anak panti.
            </p>
          </div>
          <Link href="/explore">
            <Button variant="gold" size="md" className="font-black text-xs text-slate-950 px-6 py-2.5 shadow-md">
              Eksplor Donasi Makanan Rp 0 ➔
            </Button>
          </Link>
        </div>
      ) : (
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
                      {claim.method === 'SELF_PICKUP' ? '🚗' : '🤝'} {claim.methodLabel || 'Donasi Makanan'}
                    </span>
                    <span className="text-slate-400">Diminta pada: {claim.claimedAt}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Badge variant={claim.status === 'PICKED_UP' || claim.status === 'COMPLETED' ? 'success' : 'warning'} className="px-3 py-1 text-xs">
                    {claim.status === 'PICKED_UP' || claim.status === 'COMPLETED' ? 'Selesai Diterima' : 'Menunggu Penjemputan'}
                  </Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
