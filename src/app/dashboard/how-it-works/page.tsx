'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';

export default function DashboardHowItWorksPage() {
  const steps = [
    {
      num: '01',
      role: 'Food Provider (Restoran / Hotel / Supermarket)',
      title: 'Publikasi Surplus & SOP BPOM',
      desc: 'Provider mengunggah makanan surplus layak konsumsi, memilih batas waktu pickup, dan melengkapi 8 checklist higienitas BPOM.',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
    },
    {
      num: '02',
      role: 'Smart Matching Engine',
      title: 'Algoritma Pencocokan Otomatis',
      desc: 'Sistem Replate menghitung jarak geolokasi Surabaya & tingkat urgensi makanan untuk mencocokkan target penerima (Konsumen / Rescue Partner / Yayasan).',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
    },
    {
      num: '03',
      role: 'Konsumen / Rescue Partner / Yayasan',
      title: 'Klaim & Alur Penyelamatan',
      desc: 'Konsumen / Panti mengajukan klaim gratis atau Rescue Sale murah. Yayasan dapat memilih Ambil Sendiri (Self-Pickup) atau Diantar Kurir Komunitas.',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
    },
    {
      num: '04',
      role: 'Sistem Transparansi Replate',
      title: 'Verifikasi Scan QR & Sertifikat CSR',
      desc: 'Setiap transaksi diverifikasi dengan kode QR. Dampak pengurangan emisi CO2 & porsi diselamatkan secara otomatis tercatat di Laporan CSR & Sertifikat Resmi.',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* High-Contrast Top Banner (Poin 11) */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-2">
        <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md inline-block shadow-xs">
          Panduan Ekosistem Platform
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Cara Kerja Replate</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-2xl font-medium">
          Sistem redistribusi makanan digital Replate menghubungkan Food Provider, Rescue Partner, Yayasan/Panti Asuhan, dan Konsumen secara aman, transparan, dan terverifikasi BPOM.
        </p>
      </div>

      {/* 4-Step Ecosystem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <Card key={step.num} className="border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  Langkah #{step.num}
                </span>
                <span className={`text-xl font-black ${step.text} font-mono`}>
                  STEP {step.num}
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
        <h3 className="text-base font-extrabold text-[#D4A843] mb-3">Kebijakan Donasi & Distribusi Per Role</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">Food Provider & Partner</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">Memilih donasi sukarela untuk mendukung operasional armada kurir penyalur makanan.</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">Yayasan / Panti Asuhan</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">Bebas biaya 100%, widget donasi nonaktif, fokus menerima pasokan gizi porsi besar.</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">Konsumen / Anak Kos</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">Mendapatkan makanan surplus berkualitas dengan diskon hingga 70% atau gratis.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
