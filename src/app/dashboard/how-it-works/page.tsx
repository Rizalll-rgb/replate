'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DashboardHowItWorksPage() {
  const steps = [
    {
      num: '01',
      role: 'Food Provider (Restoran / Hotel / Supermarket)',
      title: 'Publikasi Surplus & SOP BPOM',
      desc: 'Provider mengunggah makanan surplus layak konsumsi, memilih batas waktu pickup, dan melengkapi 8 checklist higienitas BPOM.',
      icon: '🏪',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-600',
    },
    {
      num: '02',
      role: 'Smart Matching Engine',
      title: 'Algoritma Pencocokan Otomatis',
      desc: 'Sistem Replate menghitung jarak geolokasi Surabaya & tingkat urgensi makanan untuk mencocokkan target penerima (Konsumen / Rescue Partner / Yayasan).',
      icon: '⚡',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-600',
    },
    {
      num: '03',
      role: 'Konsumen / Rescue Partner / Yayasan',
      title: 'Klaim & Alur Penyelamatan',
      desc: 'Konsumen / Panti mengajukan klaim gratis atau Rescue Sale murah. Yayasan dapat memilih Ambil Sendiri (Self-Pickup) atau Diantar Kurir Komunitas.',
      icon: '🤝',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-600',
    },
    {
      num: '04',
      role: 'Sistem Transparansi Replate',
      title: 'Verifikasi Scan QR & Sertifikat CSR',
      desc: 'Setiap transaksi diverifikasi dengan kode QR. Dampak pengurangan emisi CO2 & porsi diselamatkan secara otomatis tercatat di Laporan CSR & Sertifikat Resmi.',
      icon: '📜',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1B3A5C] via-[#2C5A8F] to-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <Badge variant="gold" size="sm" className="font-extrabold uppercase">
            Panduan Ekosistem Platform
          </Badge>
          <h1 className="text-2xl font-black tracking-tight">Cara Kerja Replate</h1>
          <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
            Sistem redistribusi makanan digital Replate menghubungkan Food Provider, Rescue Partner, Yayasan/Panti Asuhan, dan Konsumen secara aman, transparan, dan terverifikasi BPOM.
          </p>
        </div>
      </div>

      {/* 4-Step Ecosystem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <Card key={step.num} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center text-xl`}>
                  {step.icon}
                </div>
                <span className={`text-2xl font-black ${step.text} font-mono opacity-80`}>
                  #{step.num}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{step.role}</span>
                <h3 className="font-extrabold text-base text-[#1B3A5C] mt-0.5">{step.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{step.desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Role Distribution Policy Summary */}
      <Card className="border-slate-200 bg-slate-900 text-white p-6 shadow-md">
        <h3 className="text-base font-extrabold text-[#D4A843] mb-2">💡 Kebijakan Donasi & Distribusi Per Role</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">🏪 Provider & Partner</span>
            <p className="text-slate-300 text-[11px]">Memilih donasi sukarela untuk mendukung operasional armada penyelamat pangan.</p>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">🏠 Yayasan / Panti</span>
            <p className="text-slate-300 text-[11px]">Bebas biaya 100%, widget donasi nonaktif, fokus menerima pasokan gizi.</p>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">🛒 Konsumen / Anak Kos</span>
            <p className="text-slate-300 text-[11px]">Mendapatkan makanan surplus berkualitas dengan diskon hingga 70% atau gratis.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
