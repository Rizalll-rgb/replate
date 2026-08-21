import React from 'react';

export const ImpactCounter: React.FC = () => {
  const stats = [
    {
      label: 'Makanan Diselamatkan',
      value: '1,450+ Kg',
      color: 'text-white',
      icon: (
        <svg className="w-8 h-8 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'CO2 Emisi Dicegah',
      value: '3,625+ Kg',
      color: 'text-[#D4A843]',
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V7a2 2 0 00-2-2h-1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      ),
    },
    {
      label: 'Penerima Terbantu',
      value: '2,900+ Orang',
      color: 'text-emerald-400',
      icon: (
        <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Mitra Aktif Surabaya',
      value: '25+ Provider & Partner',
      color: 'text-blue-300',
      icon: (
        <svg className="w-8 h-8 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-[#1B3A5C] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-extrabold text-[#D4A843] uppercase tracking-widest">
            Dampak Akumulatif
          </span>
          <h2 className="text-3xl font-extrabold text-white">Penyelamatan Pangan Surabaya</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#142C47] p-6 rounded-2xl border border-[#2C5A8F]/60 text-center flex flex-col items-center justify-center space-y-3 hover:border-[#D4A843] transition-colors"
            >
              <div className="p-3 rounded-xl bg-white/5">{stat.icon}</div>
              <h3 className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</h3>
              <p className="text-xs text-slate-300 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
