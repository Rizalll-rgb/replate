'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#0F1923] text-white py-20 lg:py-28 border-b border-slate-800">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#1B3A5C]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4A843]/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-[#D4A843]">
              <span className="w-2 h-2 rounded-full bg-[#D4A843] animate-pulse" />
              <span>Infinitera 2.0 Web Development Competition</span>
            </div>

            {/* High Contrast Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Platform Smart <span className="text-[#D4A843]">Redistribusi</span> Makanan Berlebih
            </h1>

            {/* High Contrast Subtitle */}
            <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Menghubungkan Restoran, Bakery, dan Hotel dengan Penerima Manfaat & Komunitas di Surabaya secara aman, cepat, dan transparan — demi mewujudkan ekosistem kota zero-waste.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-3">
              <Link href="/register">
                <Button variant="gold" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg font-bold">
                  Mulai Selamatkan Makanan ➔
                </Button>
              </Link>
              <Link href="/track/FB-SBY-DEMO">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base text-white border-2 border-white/40 hover:bg-white/10 font-bold">
                  Lacak Food Rescue ID
                </Button>
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800 text-center lg:text-left">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-white block">100%</span>
                <span className="text-xs text-slate-300 font-medium">BPOM Safety Checklist</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#D4A843] block">Multi-Criteria</span>
                <span className="text-xs text-slate-300 font-medium">Smart Matching Scoring</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">Real-time</span>
                <span className="text-xs text-slate-300 font-medium">CO2 Impact Tracking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Surplus Monitor Interactive Widget */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1B3A5C] border border-[#2C5A8F] flex items-center justify-center text-[#D4A843]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live Surplus Monitor</h4>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Surabaya Active Stream
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                  AVAILABLE
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pantauan stok makanan berlebih aktif di Surabaya. Klik tombol klaim untuk langsung merespons surplus.
              </p>

              <div className="space-y-3 text-xs">
                {/* Item Card 1 with CTA */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">Bakso Sapi Komplit (15 Porsi)</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Warung Bakso Pak Kumis — Genteng</p>
                    </div>
                    <span className="font-extrabold text-[#D4A843] bg-[#D4A843]/10 px-2.5 py-1 rounded-md border border-[#D4A843]/20">
                      Rp 5.000
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-700/60 pt-2 text-[11px]">
                    <span className="text-slate-400 font-medium">Batas: Hari ini 21:00</span>
                    <Link href="/dashboard/consumer">
                      <Button variant="gold" size="sm" className="px-3 py-1 text-[11px] font-bold">
                        Klaim Makanan Ini ➔
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Item Card 2 with CTA */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">Roti Tawar & Danish (25 Pcs)</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Roti Boy — Tunjungan Plaza</p>
                    </div>
                    <span className="font-extrabold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20">
                      GRATIS
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-700/60 pt-2 text-[11px]">
                    <span className="text-slate-400 font-medium">Rescue Matching: 96%</span>
                    <Link href="/dashboard/rescue-partner/requests">
                      <Button variant="outline" size="sm" className="px-3 py-1 text-[11px] font-bold text-white border-slate-600 hover:bg-slate-700">
                        Respon Rescue ➔
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#1B3A5C]/50 rounded-xl border border-[#2C5A8F]/50 text-center">
                <span className="text-[11px] font-bold text-slate-200 block">
                  Smart Matching Algorithm Status:
                </span>
                <span className="text-xs font-black text-[#D4A843] mt-0.5 block">
                  Match Score 96% ke Food Bank Surabaya
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
