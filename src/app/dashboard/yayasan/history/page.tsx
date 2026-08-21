'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function YayasanHistoryPage() {
  const historyData = [
    {
      id: 'HIS-YYS-101',
      date: '21 Aug 2026',
      foodName: 'Roti & Kue Pastry Surplus',
      provider: 'Rotiboy Surabaya',
      quantity: '30 Porsi',
      weightKg: '15.0 kg',
      co2Saved: '37.5 kg CO2',
      peopleFed: '30 Anak Panti',
      status: 'VERIFIED',
    },
    {
      id: 'HIS-YYS-102',
      date: '20 Aug 2026',
      foodName: 'Nasi Bungkus Buffet Hotel',
      provider: 'Hotel Majapahit Surabaya',
      quantity: '50 Porsi',
      weightKg: '25.0 kg',
      co2Saved: '62.5 kg CO2',
      peopleFed: '50 Anak Panti',
      status: 'VERIFIED',
    },
    {
      id: 'HIS-YYS-103',
      date: '19 Aug 2026',
      foodName: 'Buah & Sayur Segar Supermarket',
      provider: 'Supermarket Surabaya',
      quantity: '40 Porsi',
      weightKg: '20.0 kg',
      co2Saved: '50.0 kg CO2',
      peopleFed: '40 Anak Panti',
      status: 'VERIFIED',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-[#1B3A5C]">Riwayat Bantuan Pangan Diterima</h1>
        <p className="text-xs text-slate-500">Rekapitulasi distribusi makanan surplus yang berhasil diterima dan disalurkan kepada anak-anak panti</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-[#1B3A5C]">Daftar Riwayat Penyaluran Panti</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Nama Makanan</th>
                  <th className="p-3">Penyedia (Provider)</th>
                  <th className="p-3">Jumlah Porsi</th>
                  <th className="p-3">Estimasi Dampak</th>
                  <th className="p-3 text-right">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {historyData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{item.date}</td>
                    <td className="p-3 font-extrabold text-[#1B3A5C]">{item.foodName}</td>
                    <td className="p-3">{item.provider}</td>
                    <td className="p-3 font-bold">{item.quantity} ({item.weightKg})</td>
                    <td className="p-3">
                      <span className="text-emerald-700 font-bold">{item.co2Saved}</span> • <span className="text-blue-700 font-bold">{item.peopleFed}</span>
                    </td>
                    <td className="p-3 text-right">
                      <Badge variant="success" className="text-[10px]">
                        Terverifikasi SOP
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
