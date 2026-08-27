'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function YayasanHistoryPage() {
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      if (isFresh) {
        setHistoryData([]);
        return;
      }

      const defaultDemo = [
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
      setHistoryData(defaultDemo);
    } catch (_) {}
  }, []);

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
          {historyData.length === 0 ? (
            <div className="text-center py-12 p-6 space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-xl text-slate-500">
                📜
              </div>
              <h4 className="font-extrabold text-sm text-[#1B3A5C]">Belum Ada Riwayat Penyaluran Selesai</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                Bantuan makanan yang telah berhasil diterima dan diverifikasi sesuai SOP BPOM akan tercatat otomatis di tabel ini.
              </p>
              <Link href="/explore" className="inline-block pt-2">
                <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs">
                  Mulai Ajukan Bantuan Makanan ➔
                </Button>
              </Link>
            </div>
          ) : (
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
          )}
        </CardBody>
      </Card>
    </div>
  );
}
