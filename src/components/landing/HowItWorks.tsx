'use client';

import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Submit Surplus & SOP Checklist',
      desc: 'Restoran, Bakery, atau Hotel mengunggah porsi makanan berlebih dan melengkapi 8 poin SOP keamanan pangan BPOM & WHO.',
      badge: 'Provider Role',
      icon: (
        <svg className="w-6 h-6 text-[#1B3A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Smart Matching Engine',
      desc: 'Algoritma multi-kriteria secara otomatis mengkalkulasi skor kecocokan berdasarkan lokasi, urgensi waktu, porsi, dan reputasi.',
      badge: 'AI Engine',
      icon: (
        <svg className="w-6 h-6 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Dua Jalur Distribusi',
      desc: 'Jalur A (Rescue Sale): Dijual murah ke konsumen hemat. Jalur B (Food Rescue): Disalurkan gratis ke Panti Asuhan & Komunitas Food Rescue volunteer atau Komunitas Sosial.',
      badge: 'Dual-Path Flow',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      num: '04',
      title: 'Verifikasi QR & Tracking ID',
      desc: 'Penerima melakukan penjemputan dengan verifikasi QR Code dan pemantauan publik Food Rescue ID secara transparan.',
      badge: 'Public Transparency',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] text-xs font-bold uppercase tracking-wider">
            Alur Bisnis & Arsitektur Sistem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C]">
            Bagaimana Replate Bekerja?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Ekosistem redistribusi makanan berlebih yang mengombinasikan standar keamanan pangan, kecerdasan algoritma matching, dan transparansi pelacakan rantai pasok.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-[#1B3A5C]/10 transition-colors">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-300 group-hover:text-[#D4A843] transition-colors">
                    {step.num}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider block mb-1">
                    {step.badge}
                  </span>
                  <h3 className="text-base font-extrabold text-[#1B3A5C] leading-snug">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1B3A5C] w-1/3 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
