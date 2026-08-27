'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardInfoHubPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'CONSUMER';

  const [activeTab, setActiveTab] = useState<'CARA_KERJA' | 'BPOM' | 'IPCC' | 'FAQ'>('CARA_KERJA');
  const [selectedRoleFlow, setSelectedRoleFlow] = useState<'PROVIDER' | 'BENEFICIARY' | 'CONSUMER' | 'VOLUNTEER'>('PROVIDER');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Live Carbon Simulation State
  const [simulatedPortions, setSimulatedPortions] = useState<number>(50);

  const calcWasteKg = (simulatedPortions * 0.4).toFixed(1);
  const calcCo2eKg = (Number(calcWasteKg) * 2.5).toFixed(1);
  const calcCh4Kg = (Number(calcWasteKg) * 0.07).toFixed(2);
  const calcCarKm = Math.round(Number(calcCo2eKg) * 5.0);
  const calcKwh = Math.round(Number(calcCo2eKg) * 1.25);

  const roleWorkflows = {
    PROVIDER: {
      roleTitle: 'Food Provider (Restoran, Bakery, Katering, Hotel)',
      badge: 'RESTORAN & PRODUSEN',
      summary: 'Mengubah surplus makanan harian menjadi pendapatan tambahan atau aksi sosial CSR terukur.',
      steps: [
        {
          num: 1,
          title: 'Input Data & SOP Higienitas BPOM',
          desc: 'Unggah menu makanan berlebih, jumlah porsi, batas waktu penjemputan, dan lengkapi 8-poin checklist kelayakan.',
        },
        {
          num: 2,
          title: 'Pilih Model Penyaluran',
          desc: 'Tentukan jenis distribusi: Rescue Sale (diskon murah hingga 70%) atau Donasi Bebas Biaya (Rp 0).',
        },
        {
          num: 3,
          title: 'Verifikasi Serah Terima QR Kasir',
          desc: 'Scan QR Barcode digital saat konsumen atau kurir relawan datang mengambil makanan di outlet.',
        },
        {
          num: 4,
          title: 'Laporan CSR & Sertifikat Otomatis',
          desc: 'Dapatkan rekapitulasi data porsi terselamatkan dan cetak Sertifikat Mitra Berkelanjutan resmi 1 halaman.',
        },
      ],
    },
    BENEFICIARY: {
      roleTitle: 'Food Beneficiary (Panti Asuhan, Yayasan Sosial, Shelter)',
      badge: 'PANTI ASUHAN & YAYASAN',
      summary: 'Menerima pasokan makanan sehat dan steril secara gratis untuk memenuhi nutrisi anak asuh/lansia.',
      steps: [
        {
          num: 1,
          title: 'Ajukan Permintaan Pangan Panti',
          desc: 'Buat daftar kebutuhan menu (misal: 50 porsi nasi kotak atau susu/roti) dan batas waktu yang diharapkan.',
        },
        {
          num: 2,
          title: 'Smart Matching & Alokasi Donatur',
          desc: 'Sistem mencocokkan permohonan Anda dengan restoran atau donatur terdekat yang siap menyanggupi porsi.',
        },
        {
          num: 3,
          title: 'Pilih Metode Penjemputan',
          desc: 'Pilih opsi Self-Pickup (ambil sendiri) atau diantar langsung oleh kurir relawan Rescue Partner ke lokasi panti.',
        },
        {
          num: 4,
          title: 'Konfirmasi Penerimaan & Ulasan Dampak',
          desc: 'Tunjukkan QR konfirmasi serah terima dan bagikan cerita dampak nutrisi anak asuh ke publik.',
        },
      ],
    },
    CONSUMER: {
      roleTitle: 'Food Consumer (Konsumen Umum, Mahasiswa, Warga)',
      badge: 'KONSUMEN & ANAK KOS',
      summary: 'Mendapatkan makanan berkualitas tinggi dari restoran favorit dengan harga sangat hemat.',
      steps: [
        {
          num: 1,
          title: 'Jelajah Makanan Terdekat',
          desc: 'Buka katalog Eksplor Pangan untuk menemukan makanan lezat diskon 50%-70% di sekitar area Anda di Surabaya.',
        },
        {
          num: 2,
          title: 'Klaim & Bayar via QRIS Resmi',
          desc: 'Masukkan makanan ke Tas Klaim, lalu lakukan pembayaran instan QRIS standar Bank Indonesia tanpa biaya admin.',
        },
        {
          num: 3,
          title: 'Ambil di Toko dengan QR Resi',
          desc: 'Kunjungi outlet sebelum batas waktu pickup berakhir dan tunjukkan QR Barcode di HP kepada staf kasir.',
        },
        {
          num: 4,
          title: 'Beri Ulasan Dampak Terverifikasi',
          desc: 'Beri rating bintang dan ulasan rasa yang akan tayang otomatis di galeri Kisah Nyata Beranda Replate.',
        },
      ],
    },
    VOLUNTEER: {
      roleTitle: 'Rescue Volunteer (Relawan Logistik & Armada Komunitas)',
      badge: 'KURIR RELAWAN LOGISTIK',
      summary: 'Menghubungkan restoran dan panti asuhan melalui pengantaran cepat, higienis, dan terenkripsi.',
      steps: [
        {
          num: 1,
          title: 'Terima Penugasan Rute Terdekat',
          desc: 'Dapatkan notifikasi alokasi bantuan makanan yang membutuhkan pengantaran segera di wilayah Anda.',
        },
        {
          num: 2,
          title: 'Buka Surat Jalan Digital via WA',
          desc: 'Akses link manifest surat jalan digital tanpa login dengan instruksi rute Google Maps dan kontak PJ.',
        },
        {
          num: 3,
          title: 'Inspeksi & Serah Terima Outlet',
          desc: 'Pastikan wadah makanan tersegel dan suhu aman, lalu scan QR Code outlet untuk memulai perjalanan.',
        },
        {
          num: 4,
          title: 'Antar Steril ke Shelter Panti',
          desc: 'Serahkan paket makanan kepada pengurus panti dan konfirmasi selesai untuk memperbarui riwayat armada.',
        },
      ],
    },
  };

  const faqs = [
    {
      q: 'Bagaimana Replate menjamin keamanan dan kelayakan makanan surplus?',
      a: 'Setiap makanan surplus yang diunggah wajib lolos 8 Poin SOP Kelayakan Higienitas BPOM RI & WHO (termasuk batas toleransi waktu simpan, suhu penyimpanan terkontrol, kemasan steril, dan inspeksi sensorik visual/aroma).',
    },
    {
      q: 'Apa perbedaan antara Rescue Sale dan Donasi Pangan Rp 0?',
      a: 'Rescue Sale adalah makanan berlebih berbayar murah dengan diskon hingga 70% untuk konsumen umum/anak kos. Sedangkan Donasi Pangan Rp 0 dialokasikan khusus untuk panti asuhan, yayasan sosial, dan masyarakat berpenghasilan rendah terverifikasi SKTM.',
    },
    {
      q: 'Bagaimana cara kerja penjemputan dengan Surat Jalan Digital Kurir?',
      a: 'Saat alokasi donasi disetujui, relawan kurir menerima tautan Surat Jalan Manifest Digital via WhatsApp tanpa perlu login aplikasi. Kurir melakukan serah terima fisik dengan memindai QR Barcode terenkripsi di lokasi outlet.',
    },
    {
      q: 'Bagaimana rumus perhitungan dampak pengurangan emisi CO2e & CH4?',
      a: 'Berdasarkan standar IPCC Landfill Methane Avoidance: Setiap 1 porsi makanan setara 0.4 kg sampah organik. Setiap 1 kg food waste yang dicegah menghemat 2.5 kg CO2e emisi gas rumah kaca dan ~0.07 kg gas metana (CH4).',
    },
    {
      q: 'Bagaimana cara mendapatkan Laporan CSR & Sertifikat Resmi Mitra?',
      a: 'Food Provider dan Yayasan dapat membuka menu Laporan Dampak di Dashboard untuk mengunduh Sertifikat Penyelamat Pangan resmi dan mencetak ringkasan CSR 1 halaman yang siap diaudit.',
    },
  ];

  const formatRoleLabel = (r: string) => {
    const upper = String(r || '').toUpperCase();
    if (upper.includes('PROVIDER')) return 'Food Provider';
    if (upper.includes('BENEFICIARY') || upper.includes('YAYASAN')) return 'Food Beneficiary';
    if (upper.includes('VOLUNTEER') || upper.includes('RESCUE')) return 'Food Rescue Volunteer';
    if (upper.includes('CONSUMER')) return 'Food Consumer';
    if (upper.includes('ADMIN')) return 'SuperAdmin';
    return String(r || '').replace(/_/g, ' ');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            PUSAT INFORMASI, EDUKASI & REGULASI TERPADU
          </span>
          <h1 className="text-2xl font-black text-[#1B3A5C]">Pusat Informasi & Regulasi Replate</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pelajari seluruh panduan operasional per peran, regulasi BPOM, kalkulator simulasi emisi IPCC, dan FAQ.
          </p>
        </div>

        <span className="text-xs font-black bg-[#1B3A5C] text-[#D4A843] border border-amber-400/30 px-3.5 py-1.5 rounded-full shadow-xs">
          Peran: {formatRoleLabel(userRole)}
        </span>
      </div>

      {/* 5 Core Information Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('CARA_KERJA')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'CARA_KERJA'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          Cara Kerja (4 Role)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BPOM')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'BPOM'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          Regulasi BPOM
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('IPCC')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'IPCC'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          Dampak IPCC & 5 SDGs
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FAQ')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'FAQ'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          FAQ & Bantuan
        </button>
      </div>

      {/* Tab 1: Cara Kerja */}
      {activeTab === 'CARA_KERJA' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedRoleFlow('PROVIDER')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRoleFlow === 'PROVIDER'
                  ? 'bg-[#1B3A5C] text-[#D4A843] shadow-md border-2 border-[#D4A843]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Food Provider (Resto)
            </button>

            <button
              type="button"
              onClick={() => setSelectedRoleFlow('BENEFICIARY')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRoleFlow === 'BENEFICIARY'
                  ? 'bg-[#1B3A5C] text-emerald-400 shadow-md border-2 border-emerald-400'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Food Beneficiary (Panti)
            </button>

            <button
              type="button"
              onClick={() => setSelectedRoleFlow('CONSUMER')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRoleFlow === 'CONSUMER'
                  ? 'bg-[#1B3A5C] text-cyan-400 shadow-md border-2 border-cyan-400'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Food Consumer (Konsumen)
            </button>

            <button
              type="button"
              onClick={() => setSelectedRoleFlow('VOLUNTEER')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRoleFlow === 'VOLUNTEER'
                  ? 'bg-[#1B3A5C] text-purple-400 shadow-md border-2 border-purple-400'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Rescue Volunteer (Kurir)
            </button>
          </div>

          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <span className="text-[11px] font-black text-[#D4A843] uppercase tracking-wider block">
                {roleWorkflows[selectedRoleFlow].badge}
              </span>
              <h3 className="text-xl font-black text-[#1B3A5C]">
                {roleWorkflows[selectedRoleFlow].roleTitle}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {roleWorkflows[selectedRoleFlow].summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roleWorkflows[selectedRoleFlow].steps.map((step) => (
                <div key={step.num} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="w-8 h-8 rounded-xl bg-[#1B3A5C] text-[#D4A843] font-black text-xs flex items-center justify-center shadow-xs">
                      {step.num}
                    </span>
                    <h4 className="font-extrabold text-xs text-[#1B3A5C]">{step.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Regulasi BPOM */}
      {activeTab === 'BPOM' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1B3A5C] text-[#D4A843] font-black flex items-center justify-center">
                SOP
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1B3A5C]">
                  Protokol 8-Poin Rescue Readiness BPOM RI & WHO
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Standar baku mutu keamanan pangan yang wajib dipenuhi sebelum makanan diunggah ke platform Replate.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { title: '1. Batas Waktu Masak', desc: 'Makanan olahan matang maksimal berumur 4 jam sejak selesai dimasak.' },
                { title: '2. Suhu Simpan Higienis', desc: 'Makanan panas disimpan > 60°C, makanan dingin disimpan < 4°C.' },
                { title: '3. Kemasan Utuh & Tersegel', desc: 'Wadah makanan tertutup rapat, higienis, dan bebas kontaminasi luar.' },
                { title: '4. Inspeksi Sensorik Visual', desc: 'Warna, tekstur, dan bentuk makanan normal tanpa tanda basi.' },
                { title: '5. Bebas Bau Asam / Tengik', desc: 'Aroma makanan segar dan tidak terindikasi fermentasi liar.' },
                { title: '6. Label Alergen & Bahan', desc: 'Informasi bahan dasar (kacang, seafood, susu) dicantumkan jelas.' },
                { title: '7. Lokasi Bersih Terverifikasi', desc: 'Dapur resto mitra telah diaudit NIB & sertifikasi sanitasi.' },
                { title: '8. Batas Waktu Konsumsi', desc: 'Makanan harus dikonsumsi dalam batas waktu yang tertera pada resi.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-[#1B3A5C] block">{item.title}</span>
                  <p className="text-[11px] text-slate-600 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Formula IPCC & Live Interactive Carbon Calculator */}
      {activeTab === 'IPCC' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-[#1B3A5C] rounded-3xl border-2 border-[#2C5A8F] shadow-xl space-y-6 text-white">
            <div className="space-y-2">
              <span className="px-3.5 py-1 bg-[#0F1923] text-[#D4A843] border border-amber-400/40 rounded-xl text-[11px] font-black uppercase tracking-wider inline-block">
                METODOLOGI PERHITUNGAN JEJAK KARBON IPCC 2006 / 2019 REFINEMENT
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Formula Baku Konversi Dampak Lingkungan Replate
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium max-w-3xl">
                Replate menggunakan standar Intergovernmental Panel on Climate Change (IPCC) untuk menghitung pencegahan gas rumah kaca dari timbulan sampah organik di TPA Benowo Surabaya:
              </p>
            </div>

            {/* 3 Core Mathematical Constants */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-5 bg-[#0F1923] rounded-2xl border border-[#2C5A8F] space-y-1 text-center shadow-md">
                <span className="text-2xl font-black text-[#D4A843] block font-mono">1 Porsi = 0.4 kg</span>
                <strong className="text-xs text-white block">Bobot Pangan Rata-Rata</strong>
                <p className="text-[11px] text-slate-300 font-medium">Standar porsi makanan siap santap Indonesia.</p>
              </div>

              <div className="p-5 bg-[#0F1923] rounded-2xl border border-[#2C5A8F] space-y-1 text-center shadow-md">
                <span className="text-2xl font-black text-emerald-400 block font-mono">1 kg = 2.5 kg CO2e</span>
                <strong className="text-xs text-white block">Faktor Emisi Gas Rumah Kaca</strong>
                <p className="text-[11px] text-slate-300 font-medium">Reduksi emisi pembusukan anaerobik.</p>
              </div>

              <div className="p-5 bg-[#0F1923] rounded-2xl border border-[#2C5A8F] space-y-1 text-center shadow-md">
                <span className="text-2xl font-black text-cyan-400 block font-mono">1 kg = 0.07 kg CH4</span>
                <strong className="text-xs text-white block">Pencegahan Gas Metana</strong>
                <p className="text-[11px] text-slate-300 font-medium">Gas metana berpotensi pemanasan 28x CO2.</p>
              </div>
            </div>

            {/* LIVE INTERACTIVE SIMULATOR CARD */}
            <div className="p-6 bg-[#0D1E32] rounded-2xl border-2 border-[#D4A843]/50 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                <div>
                  <h4 className="text-base font-black text-[#D4A843]">
                    Kalkulator Simulasi Dampak Lingkungan Riil
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">
                    Geser slider di bawah untuk melihat kalkulasi dampak pengurangan emisi secara instan:
                  </p>
                </div>
                <span className="text-lg font-black text-white bg-[#1B3A5C] px-4 py-1.5 rounded-xl border border-amber-400/40 shrink-0 font-mono">
                  {simulatedPortions} Porsi Makanan
                </span>
              </div>

              {/* Slider Input */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={simulatedPortions}
                  onChange={(e) => setSimulatedPortions(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                  <span>5 Porsi (Skala Warung)</span>
                  <span>250 Porsi (Skala Resto)</span>
                  <span>500 Porsi (Skala Hotel/Katering)</span>
                </div>
              </div>

              {/* Calculated Results Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center">
                  <span className="text-xs text-slate-400 block font-bold">Food Waste Dicegah</span>
                  <strong className="text-lg font-black text-emerald-400 font-mono">{calcWasteKg} kg</strong>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center">
                  <span className="text-xs text-slate-400 block font-bold">Reduksi Emisi CO2e</span>
                  <strong className="text-lg font-black text-cyan-400 font-mono">{calcCo2eKg} kg</strong>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center">
                  <span className="text-xs text-slate-400 block font-bold">Pencegahan Metana (CH4)</span>
                  <strong className="text-lg font-black text-amber-300 font-mono">{calcCh4Kg} kg</strong>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center">
                  <span className="text-xs text-slate-400 block font-bold">Setara Jarak Mobil</span>
                  <strong className="text-lg font-black text-purple-300 font-mono">~{calcCarKm} km</strong>
                </div>
              </div>
            </div>

            {/* 5 Pillars SDG Alignment Card */}
            <div className="p-6 bg-[#0F1923] rounded-2xl border border-[#2C5A8F] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                    TARGET PROPOSAL TERCAPAI
                  </span>
                  <h4 className="text-base font-black text-white">
                    Komitmen 5 Pilar UN Sustainable Development Goals
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                  5 SDGS READY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-amber-600 text-white font-black text-[10px] rounded">
                    SDG 2
                  </span>
                  <strong className="text-white block text-xs">Zero Hunger</strong>
                  <p className="text-[11px] text-slate-300">Donasi surplus siap santap untuk panti asuhan & dhuafa.</p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-orange-600 text-white font-black text-[10px] rounded">
                    SDG 9
                  </span>
                  <strong className="text-white block text-xs">Industri & Inovasi</strong>
                  <p className="text-[11px] text-slate-300">Smart Matching 2.0 & Geofencing GPS redistribusi pangan.</p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded">
                    SDG 11
                  </span>
                  <strong className="text-white block text-xs">Kota Berkelanjutan</strong>
                  <p className="text-[11px] text-slate-300">Kota sirkular zero-waste & reduksi beban TPA Benowo.</p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-yellow-700 text-white font-black text-[10px] rounded">
                    SDG 12
                  </span>
                  <strong className="text-white block text-xs">Konsumsi Bertanggung Jawab</strong>
                  <p className="text-[11px] text-slate-300">Target 12.3: Reduksi 50% food waste via Rescue Sale diskon.</p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-emerald-700 text-white font-black text-[10px] rounded">
                    SDG 13
                  </span>
                  <strong className="text-white block text-xs">Aksi Perubahan Iklim</strong>
                  <p className="text-[11px] text-slate-300">Pencegahan metana (CH4) & reduksi 2.5 kg CO2e/kg pangan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: FAQ & Bantuan */}
      {activeTab === 'FAQ' && (
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-extrabold text-xs sm:text-sm text-[#1B3A5C] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 font-mono text-base">
                  {openFaqIndex === idx ? '−' : '+'}
                </span>
              </button>
              {openFaqIndex === idx && (
                <CardBody className="p-4 pt-0 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </CardBody>
              )}
            </Card>
          ))}

          <div className="p-6 bg-[#1B3A5C] text-white rounded-3xl shadow-md border border-[#2C5A8F] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-black text-sm text-[#D4A843]">Butuh Bantuan Operasional Langsung?</h4>
              <p className="text-xs text-slate-200 font-medium">
                Tim Helpdesk Governance Replate Surabaya siap mendampingi Anda 24/7.
              </p>
            </div>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Replate,%20saya%20butuh%20bantuan%20operasional"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 shadow-md whitespace-nowrap">
                Hubungi Helpdesk WhatsApp ➔
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
