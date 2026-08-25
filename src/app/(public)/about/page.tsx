'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar } from '@/components/ui/Avatar';

export default function AboutPage() {
  const [stats, setStats] = useState({
    portions: 154832,
    foodWasteKg: 324560,
    co2eKg: 811400,
    ch4Kg: 22719,
  });

  useEffect(() => {
    try {
      const localSurplus = localStorage.getItem('replate_local_surplus');
      const activeClaims = localStorage.getItem('replate_active_claims');
      const surplusItems = localSurplus ? JSON.parse(localSurplus) : [];
      const claimItems = activeClaims ? JSON.parse(activeClaims) : [];

      const additionalPortions = claimItems.length * 15 + surplusItems.length * 10;
      const totalPortions = 154832 + additionalPortions;
      const totalFoodWaste = Math.round(totalPortions * 0.4); // 0.4 kg per portion IPCC
      const totalCo2e = Math.round(totalFoodWaste * 2.5); // 2.5 kg CO2e / kg waste
      const totalCh4 = Math.round(totalFoodWaste * 0.07);

      setStats({
        portions: totalPortions,
        foodWasteKg: totalFoodWaste,
        co2eKg: totalCo2e,
        ch4Kg: totalCh4,
      });
    } catch (_) {}
  }, []);

  const teamMembers = [
    {
      name: 'Rizal Akbar Kurniawan',
      nim: 'NIM: 23081494188 (UNESA)',
      role: 'Lead Full Stack Developer & Proposal Admin',
      bio: 'Mengembangkan arsitektur Next.js 14 App Router, integrasi database, algoritma Smart Matching 2.0, serta pengerjaan proposal teknis.',
    },
    {
      name: 'Fabio Daffa Airlangga',
      nim: 'NIM: 23081494100 (PENS)',
      role: 'UI/UX Designer & Full Stack Developer',
      bio: 'Merancang sistem antarmuka kontras tinggi, alur transaksi intuitif, serta mendukung pengerjaan pengembangan frontend & backend.',
    },
    {
      name: 'Tina Nur Fadillah',
      nim: 'NIM: 23081494122 (UNESA)',
      role: 'Penulis Proposal & Konseptor Platform',
      bio: 'Merumuskan konsep kebaruan inovasi SDGs, riset urgensi dampak emisi food waste, serta penyusunan dokumen proposal kompetisi.',
    },
  ];

  const ecosystemPartners = [
    {
      name: 'Rotiboy Bakery Surabaya',
      category: 'Food Provider',
      location: 'Tunjungan Plaza, Surabaya',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Rotiboy_logo.png/320px-Rotiboy_logo.png',
      type: 'Mitra Bakery',
    },
    {
      name: 'Hotel Majapahit Surabaya',
      category: 'Food Provider',
      location: 'Embong Malang, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=60',
      type: 'Mitra Perhotelan',
    },
    {
      name: 'Dapur Katering Bu Rudy',
      category: 'Food Provider',
      location: 'Dharmahusada, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=60',
      type: 'Mitra Katering',
    },
    {
      name: 'Warung Bakso Pak Kumis',
      category: 'Food Provider',
      location: 'Gubeng, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=60',
      type: 'Mitra Restoran',
    },
    {
      name: 'Panti Asuhan Kasih Ibu',
      category: 'Food Beneficiary',
      location: 'Wonokromo, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&auto=format&fit=crop&q=60',
      type: 'Lembaga Sosial',
    },
    {
      name: 'Panti Werdha Lansia Sejahtera',
      category: 'Food Beneficiary',
      location: 'Rungkut, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&auto=format&fit=crop&q=60',
      type: 'Panti Lansia',
    },
    {
      name: 'Shelter Dhuafa & Mandiri',
      category: 'Food Beneficiary',
      location: 'Genteng, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200&auto=format&fit=crop&q=60',
      type: 'Shelter Komunitas',
    },
    {
      name: 'Garda Pangan Surabaya',
      category: 'Rescue Partner',
      location: 'Surabaya Raya',
      logoUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=60',
      type: 'Relawan Penyelamat',
    },
    {
      name: 'Sinergi Food Rescue Jatim',
      category: 'Rescue Partner',
      location: 'Jawa Timur',
      logoUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&auto=format&fit=crop&q=60',
      type: 'Armada Komunitas',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />

      <main className="flex-1 py-16 space-y-20">
        {/* Header Hero */}
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] text-xs font-black uppercase tracking-wider">
            Tentang Replate
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#1B3A5C] tracking-tight">
            Misi Zero Waste & Ketahanan Pangan Surabaya
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Replate lahir sebagai platform Super App redistribusi pangan perkotaan untuk menghubungkan Food Provider, Panti Asuhan, dan Relawan Logistik secara aman, transparan, dan terukur.
          </p>
        </div>

        {/* Visi & Inovasi */}
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 p-8 space-y-4 shadow-xs rounded-3xl">
            <h3 className="text-xl font-black text-[#1B3A5C]">Visi Utama</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Membangun jembatan digital yang menghubungkan penyedia makanan berlebih (Food Provider) secara efisien, terukur, dan transparan dengan penerima manfaat yang membutuhkan, sehingga tidak ada makanan layak konsumsi yang terbuang ke TPA Benowo Surabaya.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 space-y-4 shadow-xs rounded-3xl">
            <h3 className="text-xl font-black text-[#1B3A5C]">Inovasi Unggulan Platform</h3>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-2 font-medium leading-relaxed">
              <li><strong>Smart Matching Engine 2.0:</strong> Algoritma pencocokan multi-kriteria berbasis jarak GPS & kapasitas panti.</li>
              <li><strong>SOP 8-Poin Kelayakan BPOM:</strong> Protokol higienitas mutu pangan & suhu simpan standar BPOM RI.</li>
              <li><strong>Surat Jalan Digital WA:</strong> Rute kurir armada tanpa login via WhatsApp.</li>
              <li><strong>Verifikasi QR Barcode Anti-Fraud:</strong> Sistem pindaian payload terenkripsi serah terima pangan.</li>
              <li><strong>Kalkulator Jejak Karbon IPCC:</strong> Perhitungan otomatis reduksi gas metana (CH4) & emisi CO2e.</li>
            </ul>
          </div>
        </div>

        {/* Section Dampak Lingkungan & Jejak Karbon (Dynamic IPCC Real Calculation) */}
        <section className="bg-[#1B3A5C] text-white py-16">
          <div className="max-w-5xl mx-auto px-4 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
                METODOLOGI IPCC & SUSTAINABLE DEVELOPMENT GOALS
              </span>
              <h2 className="text-3xl font-black text-white">Dampak Lingkungan & Pengurangan Emisi Karbon</h2>
              <p className="text-xs text-slate-300 max-w-xl mx-auto font-medium">
                Kalkulasi otomatis secara real-time dari total surplus pangan yang terdistribusi steril di sistem Replate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-[#142C47] rounded-3xl border border-[#2C5A8F] space-y-2">
                <span className="text-3xl font-black text-[#D4A843] block font-mono">
                  {stats.portions.toLocaleString('id-ID')} Porsi
                </span>
                <strong className="text-sm text-white block">Porsi Makanan Diselamatkan</strong>
                <p className="text-[11px] text-slate-300">Teredistribusi steril kepada ribuan penerima manfaat.</p>
              </div>

              <div className="p-6 bg-[#142C47] rounded-3xl border border-[#2C5A8F] space-y-2">
                <span className="text-3xl font-black text-emerald-400 block font-mono">
                  {stats.foodWasteKg.toLocaleString('id-ID')} kg
                </span>
                <strong className="text-sm text-white block">Food Waste Dicegah ke TPA</strong>
                <p className="text-[11px] text-slate-300">Mencegah beban timbulan sampah TPA Benowo.</p>
              </div>

              <div className="p-6 bg-[#142C47] rounded-3xl border border-[#2C5A8F] space-y-2">
                <span className="text-3xl font-black text-cyan-400 block font-mono">
                  {stats.co2eKg.toLocaleString('id-ID')} kg CO2e
                </span>
                <strong className="text-sm text-white block">Emisi Gas Rumah Kaca Dicegah</strong>
                <p className="text-[11px] text-slate-300">
                  Termasuk pencegahan ~{stats.ch4Kg.toLocaleString('id-ID')} kg gas metana (CH4).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 25+ Jaringan Ekosistem Mitra Surabaya (Infinite Auto-Scrolling Logo Slider Marquee) */}
        <section className="space-y-6 overflow-hidden py-4">
          <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
            <span className="text-xs font-black text-[#D4A843] bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full uppercase tracking-widest inline-block">
              JARINGAN EKOSISTEM SURABAYA
            </span>
            <h2 className="text-3xl font-black text-[#1B3A5C]">25+ Mitra Provider, Yayasan & Relawan Aktif</h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
              Didukung oleh jejaring restoran, hotel berbintang, lembaga panti asuhan, dan armada komunitas peduli pangan Surabaya.
            </p>
          </div>

          {/* Marquee Slider Track */}
          <div className="relative w-full overflow-hidden py-4">
            <div className="flex gap-4 animate-marquee whitespace-nowrap hover:pause">
              {[...ecosystemPartners, ...ecosystemPartners].map((partner, idx) => (
                <div
                  key={idx}
                  className="inline-flex flex-col items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 text-center shadow-xs min-w-[210px] shrink-0 space-y-2.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1 shadow-inner">
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-[#1B3A5C] truncate max-w-[180px]">{partner.name}</h4>
                    <span className="text-[10px] font-bold text-amber-700 block">{partner.type}</span>
                    <span className="text-[9px] text-slate-400 block truncate">{partner.location}</span>
                  </div>
                </div>
              ))}

              {/* And Many More Card */}
              <div className="inline-flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1B3A5C] to-[#2C5A8F] text-white rounded-2xl border border-[#1B3A5C] text-center shadow-md min-w-[210px] shrink-0 space-y-1">
                <span className="text-xs font-black px-2 py-1 bg-amber-400 text-slate-950 rounded-md">PLUS 20+</span>
                <h4 className="text-xs font-black text-amber-300">
                  Mitra Lainnya
                </h4>
                <p className="text-[10px] text-slate-200 font-medium leading-tight">
                  (and many more partners...)
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer Note */}
          <p className="text-[11px] text-slate-500 text-center italic max-w-xl mx-auto font-medium">
            *Catatan: Logo mitra dan lembaga sosial di atas ditampilkan sebagai visualisasi contoh simulasi ekosistem platform Replate.
          </p>
        </section>

        {/* Section Tim Dibalik Replate */}
        <section className="bg-white py-16 border-t border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-[#D4A843] bg-amber-50 border border-amber-200 px-3 py-1 rounded-md uppercase tracking-widest">
                TIM THREEPLATE — INFINITERA 2.0
              </span>
              <h2 className="text-3xl font-extrabold text-[#1B3A5C]">Tim Dibalik Replate</h2>
              <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
                Kolaborasi talenta muda UNESA & PENS dalam pengembangan arsitektur web, UI/UX kontras tinggi, serta konseptor dampak lingkungan platform Replate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="border border-slate-200 p-6 text-center space-y-4 hover:shadow-md transition-all bg-white rounded-3xl">
                  <Avatar name={member.name} size="xl" className="mx-auto border-2 border-[#1B3A5C]" />
                  <div>
                    <h4 className="text-base font-extrabold text-[#1B3A5C]">{member.name}</h4>
                    <p className="text-[11px] font-bold text-[#D4A843] uppercase tracking-wider mt-0.5">
                      {member.role}
                    </p>
                    <span className="inline-block text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded mt-1.5 border border-slate-200">
                      {member.nim}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
