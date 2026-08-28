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

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'FOOD_PROVIDER' | 'RESCUE_VOLUNTEER' | 'FOOD_BENEFICIARY'>('ALL');
  const [carouselPage, setCarouselPage] = useState<number>(0);
  const itemsPerPage = 3;

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
    } catch (_) { }
  }, []);

  const teamMembers = [
    {
      name: 'Rizal Akbar Kurniawan',
      nim: 'NIM: 23081494188 (UNESA)',
      role: 'Lead Full Stack Developer & Proposal Admin',
      bio: 'Mengembangkan arsitektur Next.js 14 App Router, integrasi database, algoritma Smart Matching 2.0, serta pengerjaan proposal teknis.',
    },
    {
      name: 'Fabio Daffa Airlangga Daniswara',
      nim: 'NIM: 3125500036 (PENS)',
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
    // 1. Food Provider (Penyedia Pangan)
    {
      name: 'Rotiboy Bakery Surabaya',
      category: 'FOOD_PROVIDER' as const,
      roleLabel: 'Food Provider',
      location: 'Tunjungan Plaza, Surabaya',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Rotiboy_logo.png/320px-Rotiboy_logo.png',
      type: 'Mitra Bakery & Roti',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      desc: 'Redistribusi surplus pastry fresh-baked harian & rotiboy butter steril.',
    },
    {
      name: 'Hotel Majapahit Surabaya',
      category: 'FOOD_PROVIDER' as const,
      roleLabel: 'Food Provider',
      location: 'Embong Malang, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=60',
      type: 'Mitra Perhotelan (Buffet)',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      desc: 'Penyaluran surplus buffet & jamuan katering hotel bintang 5.',
    },
    {
      name: 'Dapur Katering Bu Rudy',
      category: 'FOOD_PROVIDER' as const,
      roleLabel: 'Food Provider',
      location: 'Dharmahusada, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=60',
      type: 'Mitra Katering & Kuliner',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      desc: 'Donasi porsi makanan siap santap & paket nasi kotak nusantara.',
    },
    {
      name: 'Warung Bakso Pak Kumis',
      category: 'FOOD_PROVIDER' as const,
      roleLabel: 'Food Provider',
      location: 'Gubeng Kali, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=60',
      type: 'Mitra Restoran Lokal',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      desc: 'Pelopor Rescue Sale kuah bakso & menu siap santap higienis.',
    },

    // 2. Rescue Volunteer & Food Banks (Armada Relawan & Food Bank)
    {
      name: 'Foodbank of Indonesia (FOI)',
      category: 'RESCUE_VOLUNTEER' as const,
      roleLabel: 'Rescue Volunteer / Food Bank',
      location: 'Jejaring Nasional & Jawa Timur',
      logoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200&auto=format&fit=crop&q=60',
      type: 'Organisasi Food Bank Nasional',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      desc: 'Membuka akses pangan merata dan pencegahan kelaparan balita & lansia.',
    },
    {
      name: 'Garda Pangan Surabaya',
      category: 'RESCUE_VOLUNTEER' as const,
      roleLabel: 'Rescue Volunteer / Food Bank',
      location: 'Surabaya Raya',
      logoUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=60',
      type: 'Food Rescue Community',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      desc: 'Penyelamatan makanan berlebih dari industri hospitality di Surabaya.',
    },
    {
      name: 'Food Bank Bandung (FBB)',
      category: 'RESCUE_VOLUNTEER' as const,
      roleLabel: 'Rescue Volunteer / Food Bank',
      location: 'Jejaring Antar-Kota',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
      type: 'Jejaring Food Bank Regional',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      desc: 'Benchmarking & integrasi standar logistik pangan darurat perkotaan.',
    },
    {
      name: 'FoodCycle Indonesia',
      category: 'RESCUE_VOLUNTEER' as const,
      roleLabel: 'Rescue Volunteer / Food Bank',
      location: 'Jejaring Nasional',
      logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=60',
      type: 'Food Rescue Non-Profit',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      desc: 'Mendistribusikan makanan berlebih dari pernikahan, event, & bakery.',
    },
    {
      name: 'Sinergi Food Rescue Jatim',
      category: 'RESCUE_VOLUNTEER' as const,
      roleLabel: 'Rescue Volunteer / Food Bank',
      location: 'Jawa Timur Hub',
      logoUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&auto=format&fit=crop&q=60',
      type: 'Armada Relawan Logistik',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      desc: 'Pengantaran cepat menggunakan motor box pendingin & cooler bag steril.',
    },

    // 3. Food Beneficiary (Panti Asuhan, Yayasan & Shelter)
    {
      name: 'Yayasan Surplus Peduli Pangan',
      category: 'FOOD_BENEFICIARY' as const,
      roleLabel: 'Food Beneficiary',
      location: 'Jawa Timur',
      logoUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&auto=format&fit=crop&q=60',
      type: 'Yayasan Penyaluran Sosial',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: 'Penyaluran terstruktur untuk keluarga prasejahtera & kelompok rentan.',
    },
    {
      name: 'Panti Asuhan Kasih Ibu',
      category: 'FOOD_BENEFICIARY' as const,
      roleLabel: 'Food Beneficiary',
      location: 'Wonokromo, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&auto=format&fit=crop&q=60',
      type: 'Panti Asuhan Yatim Piatu',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: 'Penerima manfaat 45 anak asuh terverifikasi Dinsos Kota Surabaya.',
    },
    {
      name: 'Panti Werdha Lansia Sejahtera',
      category: 'FOOD_BENEFICIARY' as const,
      roleLabel: 'Food Beneficiary',
      location: 'Rungkut, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&auto=format&fit=crop&q=60',
      type: 'Panti Werdha & Lansia',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: 'Penyaluran makanan lunak bernutrisi untuk 30 lansia dhuafa.',
    },
    {
      name: 'Shelter Dhuafa & Anak Jalanan Mandiri',
      category: 'FOOD_BENEFICIARY' as const,
      roleLabel: 'Food Beneficiary',
      location: 'Genteng, Surabaya',
      logoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200&auto=format&fit=crop&q=60',
      type: 'Shelter Rumah Singgah',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: 'Posko pembagian makan malam sehat untuk 25 anak jalanan & dhuafa.',
    },
  ];

  const handleRoleFilterChange = (filter: 'ALL' | 'FOOD_PROVIDER' | 'RESCUE_VOLUNTEER' | 'FOOD_BENEFICIARY') => {
    setSelectedRoleFilter(filter);
    setCarouselPage(0);
  };

  const filteredPartners = ecosystemPartners.filter((item) => {
    if (selectedRoleFilter === 'ALL') return true;
    return item.category === selectedRoleFilter;
  });

  const totalCarouselPages = Math.max(1, Math.ceil(filteredPartners.length / itemsPerPage));
  const currentVisiblePartners = filteredPartners.slice(
    carouselPage * itemsPerPage,
    carouselPage * itemsPerPage + itemsPerPage
  );

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
            <h3 className="text-xl font-black text-[#1B3A5C]">Inovasi Teknologi 2026</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Mengintegrasikan algoritma <strong>Smart Matching Engine 2.0</strong>, validasi kepatuhan <strong>8-Poin SOP Higienitas BPOM RI</strong>, sistem <strong>Meja Kasir POS & Scan QR</strong>, serta pelacakan surat jalan real-time demi mewujudkan ekosistem kota zero-waste.
            </p>
          </div>
        </div>

        {/* Live Aggregated Metrics */}
        <section className="bg-[#1B3A5C] text-white py-16">
          <div className="max-w-6xl mx-auto px-4 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
                STATISTIK AKUMULATIF SURABAYA
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Capaian <span className="text-[#D4A843]">Penyelamatan Makanan</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto font-medium">
                Data dampak lingkungan dihitung berbasis standar Intergovernmental Panel on Climate Change (IPCC).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#0F1923] p-6 rounded-3xl border border-[#2C5A8F] text-center space-y-2 shadow-md">
                <span className="text-3xl sm:text-4xl font-black text-[#D4A843] font-mono block">
                  {stats.portions.toLocaleString('id-ID')}
                </span>
                <h4 className="text-sm font-extrabold text-white">Total Porsi Makanan</h4>
                <p className="text-xs text-slate-300 font-medium">
                  Berhasil diselamatkan dan dinikmati penerima manfaat.
                </p>
              </div>

              <div className="bg-[#0F1923] p-6 rounded-3xl border border-[#2C5A8F] text-center space-y-2 shadow-md">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono block">
                  {stats.foodWasteKg.toLocaleString('id-ID')} kg
                </span>
                <h4 className="text-sm font-extrabold text-white">Food Waste Tercegah</h4>
                <p className="text-xs text-slate-300 font-medium">
                  Timbulan sampah organik yang dialihkan dari TPA Benowo.
                </p>
              </div>

              <div className="bg-[#0F1923] p-6 rounded-3xl border border-[#2C5A8F] text-center space-y-2 shadow-md">
                <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono block">
                  {stats.co2eKg.toLocaleString('id-ID')} kg
                </span>
                <h4 className="text-sm font-extrabold text-white">Reduksi Emisi CO2e</h4>
                <p className="text-xs text-slate-300 font-medium">
                  Termasuk pencegahan ~{stats.ch4Kg.toLocaleString('id-ID')} kg gas metana (CH4).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: JEJARING EKOSISTEM MITRA BERDASARKAN ROLE (MAX 3 CARD CAROUSEL) */}
        <section className="space-y-8 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center space-y-3">
            <span className="text-xs font-black text-[#D4A843] bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full uppercase tracking-widest inline-block">
              JARINGAN EKOSISTEM MULTI-PIHAK
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1B3A5C]">
              Jejaring Mitra Kolaborasi Replate
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Kolaborasi terintegrasi antara <strong>Food Provider</strong> (Resto, Bakery & Hotel), <strong>Food Rescue Volunteer</strong> (Foodbank of Indonesia, Garda Pangan, FBB, FoodCycle), dan <strong>Food Beneficiary</strong> (Yayasan Surplus Peduli Pangan, Panti Asuhan & Shelter).
            </p>

            {/* Role Filter Tabs Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => handleRoleFilterChange('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedRoleFilter === 'ALL'
                    ? 'bg-[#1B3A5C] text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Semua Mitra ({ecosystemPartners.length})
              </button>

              <button
                type="button"
                onClick={() => handleRoleFilterChange('FOOD_PROVIDER')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedRoleFilter === 'FOOD_PROVIDER'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                Food Provider (4)
              </button>

              <button
                type="button"
                onClick={() => handleRoleFilterChange('RESCUE_VOLUNTEER')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedRoleFilter === 'RESCUE_VOLUNTEER'
                    ? 'bg-purple-700 text-white shadow-md'
                    : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                Rescue Volunteer & Food Bank (5)
              </button>

              <button
                type="button"
                onClick={() => handleRoleFilterChange('FOOD_BENEFICIARY')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedRoleFilter === 'FOOD_BENEFICIARY'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Food Beneficiary / Yayasan (4)
              </button>
            </div>
          </div>

          {/* Interactive 3-Card Carousel Container */}
          <div className="max-w-6xl mx-auto px-4 space-y-6">
            {/* Header Navigation Controls */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500">
                Menampilkan {currentVisiblePartners.length} dari total {filteredPartners.length} mitra (Halaman {carouselPage + 1} dari {totalCarouselPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCarouselPage((prev) => Math.max(0, prev - 1))}
                  disabled={carouselPage === 0}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-sm transition-all ${
                    carouselPage === 0
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-[#1B3A5C] text-[#1B3A5C] bg-white hover:bg-[#1B3A5C] hover:text-white shadow-xs cursor-pointer'
                  }`}
                  aria-label="Previous Slide"
                >
                  ❮
                </button>

                <button
                  type="button"
                  onClick={() => setCarouselPage((prev) => Math.min(totalCarouselPages - 1, prev + 1))}
                  disabled={carouselPage >= totalCarouselPages - 1}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-sm transition-all ${
                    carouselPage >= totalCarouselPages - 1
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-[#1B3A5C] text-[#1B3A5C] bg-white hover:bg-[#1B3A5C] hover:text-white shadow-xs cursor-pointer'
                  }`}
                  aria-label="Next Slide"
                >
                  ❯
                </button>
              </div>
            </div>

            {/* Exactly 3 Cards Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
              {currentVisiblePartners.map((partner, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1.5 shadow-inner shrink-0">
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-2xs ${partner.badgeColor}`}>
                        {partner.roleLabel}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-[#1B3A5C] leading-snug">{partner.name}</h4>
                      <span className="text-[11px] font-bold text-amber-700 block">{partner.type}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{partner.location}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium min-h-[48px]">
                      {partner.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Status Kemitraan:</span>
                    <span className="text-emerald-700 font-black">✓ Terverifikasi Replate</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Dot Pagination Indicators */}
            {totalCarouselPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {Array.from({ length: totalCarouselPages }).map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCarouselPage(dotIdx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      carouselPage === dotIdx
                        ? 'w-8 bg-[#1B3A5C]'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
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
