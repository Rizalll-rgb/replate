'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';

export default function DashboardHowItWorksPage() {
  const steps = [
    {
      num: '01',
      role: 'Food Provider (Restoran / Hotel / Catering / Supermarket)',
      title: 'Publikasi Surplus & SOP BPOM',
      desc: 'Provider mengunggah makanan surplus layak konsumsi, memilih skema donasi atau diskon rescue sale, dan melengkapi 8 checklist higienitas BPOM RI.',
      text: 'text-amber-600',
    },
    {
      num: '02',
      role: 'Smart Matching Engine',
      title: 'Algoritma Pencocokan Otomatis',
      desc: 'Sistem Replate menghitung bobot skor urgensi (35%), jarak geolokasi Surabaya (35%), dan kapasitas penerima (20%) untuk memasangkan target donasi panti asuhan secara otomatis.',
      text: 'text-blue-600',
    },
    {
      num: '03',
      role: 'Konsumen / Rescue Partner / Yayasan',
      title: 'Klaim & Opsi Logistik Pengiriman',
      desc: 'Yayasan & Konsumen melakukan klaim porsi. Yayasan dapat memilih metode penjemputan: Ambil Sendiri (Self-Pickup) atau Diantar Kurir Komunitas (Rescue Partner).',
      text: 'text-emerald-600',
    },
    {
      num: '04',
      role: 'Sistem Transparansi Replate',
      title: 'Verifikasi Scan Kode QR & CSR',
      desc: 'Serah terima makanan diverifikasi via Scan Kode QR fisik. Dampak pengurangan emisi CO2 & porsi diselamatkan tercatat otomatis di Laporan CSR & Sertifikat Resmi.',
      text: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* High-Contrast Top Banner (Poin 8 & 11) */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
            Panduan Lengkap Ekosistem Platform
          </span>
          <span className="text-xs text-slate-200 font-semibold">Modul Operasional Resmi Replate</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Cara Kerja Ekosistem Replate</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-3xl font-medium">
          Sistem redistribusi makanan digital Replate menghubungkan Food Provider, Rescue Partner, Yayasan/Panti Asuhan, dan Konsumen secara aman, transparan, dan terverifikasi BPOM RI di Surabaya.
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

      {/* Detailed Smart Matching & BPOM Standards Breakdown (Poin 8) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Smart Matching Scoring Breakdown */}
        <Card className="border-slate-200 p-5 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-[#1B3A5C] rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm text-[#1B3A5C]">Algoritma Smart Matching (Skor 0 - 100)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sistem secara otomatis mengalkulasi pencocokan penerima donasi dengan 4 indikator bobot presisi:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">1. Urgensi Batas Pickup (35%)</span>
              <span className="font-bold text-amber-700">Waktu Kedaluwarsa Cepat</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">2. Jarak Geolokasi Surabaya (35%)</span>
              <span className="font-bold text-blue-700">Paling Dekat Dengan Lokasi</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">3. Kapasitas Porsi Penerima (20%)</span>
              <span className="font-bold text-emerald-700">Panti Asuhan Porsi Besar</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">4. Histori Penyelamatan (10%)</span>
              <span className="font-bold text-slate-800">Tingkat Keberhasilan Klaim</span>
            </div>
          </div>
        </Card>

        {/* BPOM Hygiene Verification Standards */}
        <Card className="border-slate-200 p-5 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm text-[#1B3A5C]">8 Checklist SOP BPOM Rescue Readiness</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sebelum makanan dipublikasikan, Food Provider wajib mencentang 8 jaminan kualitas higienitas:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
            <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <span className="text-emerald-600 font-bold">✓</span> Informasi Produk Lengkap
            </li>
            <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <span className="text-emerald-600 font-bold">✓</span> Tidak Melewati Expiry Date
            </li>
            <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <span className="text-emerald-600 font-bold">✓</span> Suhu Penyimpanan Sesuai
            </li>
            <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <span className="text-emerald-600 font-bold">✓</span> Kemasan Utuh & Higienis
            </li>
            <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <span className="text-emerald-600 font-bold">✓</span> Bebas Tanda Kerusakan
            </li>
            <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <span className="text-emerald-600 font-bold">✓</span> Foto Produk Jelas
            </li>
            <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <span className="text-emerald-600 font-bold">✓</span> Batas Pickup Realistis
            </li>
            <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <span className="text-emerald-600 font-bold">✓</span> Alamat Akurat Surabaya
            </li>
          </ul>
        </Card>
      </div>

      {/* Role Distribution Policy Summary */}
      <Card className="border-slate-200 bg-slate-900 text-white p-6 shadow-md">
        <h3 className="text-base font-extrabold text-[#D4A843] mb-3">Kebijakan Donasi & Logistik Per Role</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">Food Provider & Partner</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">Memilih donasi gratis atau rescue sale murah. Berhak mengunduh Sertifikat & Laporan CSR PDF.</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">Yayasan / Panti Asuhan</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">Bebas biaya 100%, menerima donasi porsi besar, dan memilih Ambil Sendiri atau Diantar Kurir Komunitas.</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">Konsumen / Anak Kos</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">Mendapatkan makanan surplus berkualitas dengan diskon hingga 70% atau gratis via penjemputan fisik.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
