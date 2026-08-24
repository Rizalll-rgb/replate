'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="p-8 bg-[#1B3A5C] text-white rounded-3xl shadow-2xl border-2 border-[#2C5A8F] space-y-6">
            {/* 404 Badge */}
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <span className="text-2xl font-black font-mono">404</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                STATUS KESALAHAN RUTE PLATFORM
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Halaman Tidak Ditemukan
              </h1>
              <p className="text-xs text-slate-200 font-medium max-w-md mx-auto leading-relaxed">
                Halaman atau alamat URL yang Anda tuju tidak ditemukan, telah dipindahkan, atau belum tersedia pada ekosistem platform Replate.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#2C5A8F] flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full font-black text-xs bg-white text-slate-900 border-amber-400 hover:bg-slate-100">
                  <span>🏠 Kembali Ke Beranda</span>
                </Button>
              </Link>

              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="gold" size="md" className="w-full font-black text-xs text-slate-950 shadow-md">
                  <span>🚀 Masuk Ke Dashboard ➔</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
