'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProviderOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-3">
        <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-widest block">
          Dashboard Food Provider
        </span>
        <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Mitra Restoran & Toko Pangan</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Warung Bakso Pak Kumis — Genteng, Surabaya</p>
      </div>

      {/* High-Contrast Hero Action Banner (Poin 1 & 9) */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#2C5A8F]">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
              Aksi Utama Provider
            </span>
            <span className="text-xs text-slate-200 font-semibold">100% Terverifikasi SOP BPOM</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight text-white">Punya Makanan Berlebih Hari Ini?</h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            Publikasikan porsi surplus makanan Anda untuk disalurkan ke panti asuhan, yayasan, atau konsumen target secara aman & transparan.
          </p>
        </div>

        <Link href="/dashboard/provider/add-surplus" className="shrink-0">
          <Button variant="gold" size="lg" className="font-black shadow-lg flex items-center gap-2 px-6 text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Surplus Makanan Baru</span>
          </Button>
        </Link>
      </div>

      {/* Ringkasan KPI Interaktif (Correct Navigation Mapping Poin 2 & 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Surplus Aktif -> my-listings */}
        <Link href="/dashboard/provider/my-listings" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#1B3A5C] hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
            <div className="p-3 bg-blue-50 text-[#1B3A5C] rounded-xl group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                Surplus Aktif <span className="text-[10px] text-[#1B3A5C] font-bold">➔</span>
              </span>
              <span className="text-2xl font-extrabold text-[#1B3A5C]">2 Listing</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Total Diselamatkan -> impact (Poin 2) */}
        <Link href="/dashboard/provider/impact" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                Total Diselamatkan <span className="text-[10px] text-emerald-700 font-bold">➔</span>
              </span>
              <span className="text-2xl font-extrabold text-emerald-700">142.5 Kg</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Klaim Selesai -> claims (Poin 3) */}
        <Link href="/dashboard/provider/claims" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#D4A843] hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
            <div className="p-3 bg-amber-50 text-[#D4A843] rounded-xl group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                Klaim Selesai <span className="text-[10px] text-[#D4A843] font-bold">➔</span>
              </span>
              <span className="text-2xl font-extrabold text-[#D4A843]">28 Transaksi</span>
            </div>
          </div>
        </Link>
      </div>

      {/* CORE BUSINESS ACTIONS */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Fitur Operasional Bisnis Utama</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4A843] flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-[#1B3A5C]">1. Post Makanan & SOP BPOM</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Input porsi makanan berlebih harian dan lengkapi 8-poin verifikasi standar kelayakan pangan BPOM RI.
              </p>
            </div>
            <Link href="/dashboard/provider/add-surplus">
              <Button variant="gold" size="sm" className="w-full font-bold">
                Buka Form Tambah Surplus ➔
              </Button>
            </Link>
          </div>

          {/* Action Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B3A5C] flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-[#1B3A5C]">2. Verifikasi Penjemputan QR</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Pindai QR Code atau masukkan kode transaksi penjemputan dari konsumen / tim armada partner.
              </p>
            </div>
            <Link href="/dashboard/provider/claims">
              <Button variant="primary" size="sm" className="w-full font-bold">
                Buka Kamera Scanner QR ➔
              </Button>
            </Link>
          </div>

          {/* Action Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-[#1B3A5C]">3. Laporan CSR & Sertifikat</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Unduh Laporan Keberlanjutan CSR resmi dan Cetak Sertifikat Penyelamat Pangan format PDF.
              </p>
            </div>
            <Link href="/dashboard/provider/impact">
              <Button variant="outline" size="sm" className="w-full font-bold border-slate-300 text-slate-700">
                Lihat & Cetak Laporan PDF ➔
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Direct Management Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">Daftar Makanan Aktif Saya</CardTitle>
            <Link href="/dashboard/provider/my-listings" className="text-xs text-[#1B3A5C] font-extrabold hover:underline">
              Kelola Semua ➔
            </Link>
          </CardHeader>
          <CardBody className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-[#1B3A5C]">Bakso Sapi Komplit</p>
                <p className="text-[11px] text-slate-500 font-medium">15 Porsi | Rp 5.000 (SOP BPOM 100%)</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-extrabold text-[10px]">
                AVAILABLE
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-[#1B3A5C]">Buah Potong Segar</p>
                <p className="text-[11px] text-slate-500 font-medium">10 Porsi | GRATIS (SOP BPOM 100%)</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-extrabold text-[10px]">
                AVAILABLE
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">Klaim & Penjemputan Terbaru</CardTitle>
            <Link href="/dashboard/provider/claims" className="text-xs text-[#1B3A5C] font-extrabold hover:underline">
              Buka Scanner ➔
            </Link>
          </CardHeader>
          <CardBody className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-[#1B3A5C]">Budi Santoso (Konsumen)</p>
                <p className="text-[11px] text-slate-500 font-medium">2 Porsi Bakso Sapi | Kode: FB-CLAIM-101</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md font-extrabold text-[10px]">
                PENDING PICKUP
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
