'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-widest">
            Control Tower Superadmin
          </span>
          <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Admin Platform Overview</h2>
          <p className="text-xs text-slate-500 font-medium">Pengawasan pusat redistribusi makanan berlebih Replate Indonesia.</p>
        </div>
        <Link href="/dashboard/admin/approvals">
          <Button variant="gold" size="md" className="font-extrabold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Persetujuan Akun Pending (3)</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Total Provider Terverifikasi</span>
          <span className="text-2xl font-extrabold text-[#1B3A5C] mt-1 block">5 Mitra</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Total Rescue Partner</span>
          <span className="text-2xl font-extrabold text-[#D4A843] mt-1 block">3 Organisasi</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Konsumen Terdaftar</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">3 Pengguna</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Waste Diverted Surabaya</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">88.5%</span>
        </div>
      </div>

      {/* Admin Action Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 hover:border-[#1B3A5C] transition-all">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]"> Kelola Pengguna & Akun</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs">
            <p className="text-slate-500">Kelola direktori mitra provider, panti asuhan, dan akun konsumen di Surabaya.</p>
            <Link href="/dashboard/admin/users" className="block">
              <Button variant="primary" size="sm" className="w-full font-bold">
                Buka Direktori Pengguna 
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="bg-white border-slate-200 hover:border-[#1B3A5C] transition-all">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]"> Monitoring Surplus Real-time</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs">
            <p className="text-slate-[#495057] text-slate-500">Pantau pergerakan stok makanan berlebih dan status klaim secara langsung.</p>
            <Link href="/dashboard/admin/food-monitor" className="block">
              <Button variant="gold" size="sm" className="w-full font-bold">
                Pantau Stream Surplus 
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="bg-white border-slate-200 hover:border-[#1B3A5C] transition-all">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">Pengaturan Bobot Algoritma</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs">
            <p className="text-slate-500">Atur bobot kriteria Smart Matching (jarak, urgensi deadline, kapasitas partner).</p>
            <Link href="/dashboard/admin/settings" className="block">
              <Button variant="outline" size="sm" className="w-full font-bold border-slate-300">
                Konfigurasi Parameter 
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
