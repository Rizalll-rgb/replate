'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardInfoHubPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'CONSUMER';

  const [activeTab, setActiveTab] = useState<'LATAR_BELAKANG' | 'KALKULATOR' | 'CARA_KERJA' | 'BPOM' | 'FAQ'>('LATAR_BELAKANG');
  const [selectedRoleFlow, setSelectedRoleFlow] = useState<'PROVIDER' | 'BENEFICIARY' | 'CONSUMER' | 'VOLUNTEER'>('PROVIDER');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Live Carbon Simulation State (Bappenas & KLH Standard)
  const [simulatedPortions, setSimulatedPortions] = useState<number>(50);

  // 1 Porsi = 0.4 kg makanan siap santap
  const calcWasteKg = (simulatedPortions * 0.4).toFixed(1);
  // Bappenas 2000-2019: 1 ton FW = 4.051,5 kg CO2e (4.0515 kg CO2e / kg)
  const calcCo2eKg = (Number(calcWasteKg) * 4.0515).toFixed(1);
  // Bappenas Kerugian Ekonomi: Rp 107-346 Triliun / th (~Rp 12.500 / kg)
  const calcEconomicRp = Math.round(Number(calcWasteKg) * 12500);
  // Bappenas Energi Nutrisi: 618-989 kkal/kapita (~840 kkal/kg pangan, ~336 kkal/porsi)
  const calcEnergyKcal = Math.round(simulatedPortions * 336);
  // Metana TPA
  const calcCh4Kg = (Number(calcWasteKg) * 0.07).toFixed(2);
  // Ekuivalensi Jarak Mobil Bensin (0.192 kg CO2/km)
  const calcCarKm = Math.round(Number(calcCo2eKg) / 0.192);

  const roleWorkflows = {
    PROVIDER: {
      roleTitle: 'Food Provider (Restoran, Bakery, Katering, Hotel)',
      badge: 'RESTORAN & PRODUSEN',
      summary: 'Mengubah surplus makanan harian menjadi pendapatan tambahan (Rescue Sale) atau aksi sosial CSR terukur (Donasi Rp 0).',
      steps: [
        {
          num: 1,
          title: 'Input Data & SOP Higienitas BPOM',
          desc: 'Unggah menu makanan berlebih, jumlah porsi, batas waktu penjemputan, dan lengkapi 8-poin checklist kelayakan BPOM RI.',
        },
        {
          num: 2,
          title: 'Pilih Model Penyaluran',
          desc: 'Tentukan jenis distribusi: Rescue Sale (diskon murah hingga 70%) atau Donasi Bebas Biaya (Rp 0) untuk panti asuhan.',
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
      summary: 'Menerima pasokan makanan sehat dan steril secara gratis untuk memenuhi nutrisi dan AKG anak asuh/lansia.',
      steps: [
        {
          num: 1,
          title: 'Ajukan Permintaan Pangan Panti',
          desc: 'Buat daftar kebutuhan menu (misal: 50 porsi nasi kotak atau susu/roti) dan batas waktu makan malam yang diharapkan.',
        },
        {
          num: 2,
          title: 'Smart Matching & Alokasi Donatur',
          desc: 'Sistem mencocokkan permohonan Anda dengan restoran terdekat yang siap menyanggupi porsi surplus sesuai radius GPS.',
        },
        {
          num: 3,
          title: 'Pilih Metode Penjemputan',
          desc: 'Tentukan opsi Self-Pickup (ambil sendiri) atau diantar langsung oleh kurir relawan Rescue Partner ke lokasi panti.',
        },
        {
          num: 4,
          title: 'Konfirmasi Penerimaan & Ulasan Dampak',
          desc: 'Tunjukkan QR konfirmasi serah terima dan bagikan cerita dampak nutrisi anak asuh ke publik.',
        },
      ],
    },
    CONSUMER: {
      roleTitle: 'Food Consumer (Konsumen Umum, Mahasiswa, Anak Kos)',
      badge: 'KONSUMEN & MAHASISWA',
      summary: 'Mendapatkan makanan berkualitas tinggi dari restoran favorit dengan harga sangat hemat sekaligus mencegah timbulan sampah.',
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
      summary: 'Menghubungkan restoran dan panti asuhan melalui pengantaran cepat, higienis, dan terenkripsi surat jalan digital.',
      steps: [
        {
          num: 1,
          title: 'Terima Penugasan Rute Terdekat',
          desc: 'Dapatkan notifikasi alokasi bantuan makanan yang membutuhkan pengantaran segera di wilayah operasional Anda.',
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
      q: 'Apa dasar data ilmiah perhitungan dampak lingkungan di Replate?',
      a: 'Replate mengadopsi data resmi Laporan Kajian Food Loss & Waste (FLW) Indonesia dari Bappenas RI (2000–2019) dan Kementerian Lingkungan Hidup (KLH 2025). Faktor emisi Food Waste hilir adalah 4.051,5 kg CO2-ek./ton (4,0515 kg CO2e/kg), yang 4,3x lebih tinggi dari Food Loss hulu karena mencakup akumulasi energi sepanjang rantai pasok.',
    },
    {
      q: 'Bagaimana Replate menjamin keamanan dan kelayakan makanan surplus?',
      a: 'Setiap makanan surplus yang diunggah wajib lolos 8 Poin SOP Kelayakan Higienitas BPOM RI & WHO (termasuk batas toleransi waktu simpan < 4 jam, suhu penyimpanan terkontrol > 60°C atau < 4°C, kemasan steril bersegel, dan inspeksi sensorik visual/aroma).',
    },
    {
      q: 'Apa perbedaan antara Rescue Sale dan Donasi Pangan Rp 0?',
      a: 'Rescue Sale adalah makanan berlebih berbayar murah dengan diskon hingga 70% untuk konsumen umum/anak kos. Sedangkan Donasi Pangan Rp 0 dialokasikan khusus untuk panti asuhan, yayasan sosial, dan masyarakat berpenghasilan rendah terverifikasi SKTM/KIS.',
    },
    {
      q: 'Apa itu Strategi D2 Bappenas dalam pengelolaan Food Waste nasional?',
      a: 'Strategi D2 Bappenas adalah arahan kebijakan nasional pembuatan platform digital untuk memfasilitasi distribusi pangan berlebih, ugly food, dan sisa makanan secara terstruktur. Replate hadir menerjemahkan strategi D2 ini menjadi ekosistem digital terpadu di Indonesia.',
    },
    {
      q: 'Bagaimana cara kerja penjemputan dengan Surat Jalan Digital Kurir?',
      a: 'Saat alokasi donasi disetujui, relawan kurir (Garda Pangan / Food Bank Surabaya) menerima tautan Surat Jalan Manifest Digital via WhatsApp tanpa perlu login aplikasi. Kurir melakukan serah terima fisik dengan memindai QR Barcode terenkripsi di kasir outlet.',
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
            Kajian Ilmiah Bappenas RI & KLH 2025, SOP Higienitas BPOM, Kalkulator Emisi Hilir, dan FAQ Operasional.
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
          onClick={() => setActiveTab('LATAR_BELAKANG')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'LATAR_BELAKANG'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          📊 Latar Belakang & Urgensi FLW
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('KALKULATOR')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'KALKULATOR'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          🧮 Kalkulator Dampak Bappenas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CARA_KERJA')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'CARA_KERJA'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          ⚙️ Cara Kerja (4 Role)
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
          🛡️ Regulasi BPOM RI
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
          ❓ FAQ & Bantuan
        </button>
      </div>

      {/* TAB 1: LATAR BELAKANG & URGENSI NASIONAL (BAPPENAS & KLH DATASET) */}
      {activeTab === 'LATAR_BELAKANG' && (
        <div className="space-y-6 text-slate-800">
          {/* Main Context Card */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-md space-y-6">
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <span className="text-[10px] font-black text-[#D4A843] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300 uppercase tracking-wider inline-block">
                KAJIAN FOOD LOSS & WASTE DI INDONESIA — BAPPENAS RI & KLH 2025
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1B3A5C] tracking-tight">
                Pangan Sebagai Pemanfaatan Sumber Daya & Urgensi Food Waste Hilir
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Pangan melalui rantai pasok panjang yang menguras air, lahan, energi, dan tenaga kerja. Ketika makanan terbuang, yang hilang bukan hanya fisik makanan, tetapi seluruh sumber daya yang telah digunakan untuk menghasilkannya.
              </p>
            </div>

            {/* 4 Stat Cards from Research */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-red-50 to-amber-50/50 rounded-2xl border-2 border-red-200 text-center space-y-1">
                <span className="text-2xl font-black text-red-600 block font-mono">40,79%</span>
                <strong className="text-xs text-slate-900 block font-bold">Limbah Makanan Nasional</strong>
                <p className="text-[10px] text-slate-500 font-medium">
                  Komponen sampah #1 di Indonesia (KLH 2025: Total 20,25 Juta Ton). Jauh melampaui plastik 19,95%.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border-2 border-blue-200 text-center space-y-1">
                <span className="text-2xl font-black text-[#1B3A5C] block font-mono">23–48 Juta Ton</span>
                <strong className="text-xs text-slate-900 block font-bold">Timbulan FLW / Tahun</strong>
                <p className="text-[10px] text-slate-500 font-medium">
                  Setara 115–184 kg/kapita/tahun. Sumber daya pangan bernilai masif yang hilang sepanjang rantai pasok.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border-2 border-emerald-200 text-center space-y-1">
                <span className="text-2xl font-black text-emerald-600 block font-mono">4.051,5 kg CO2e</span>
                <strong className="text-xs text-slate-900 block font-bold">Emisi per 1 Ton Food Waste</strong>
                <p className="text-[10px] text-slate-500 font-medium">
                  4,3x lipat lebih tinggi dari Food Loss hulu (943,29 kg CO2e/ton) akibat akumulasi energi proses hilir.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border-2 border-amber-200 text-center space-y-1">
                <span className="text-2xl font-black text-amber-700 block font-mono">61–125 Juta Orang</span>
                <strong className="text-xs text-slate-900 block font-bold">Potensi Pangan Terselamatkan</strong>
                <p className="text-[10px] text-slate-500 font-medium">
                  29%–47% populasi Indonesia dapat dipenuhi kebutuhan energinya (2.100 kkal) jika FLW dipulihkan.
                </p>
              </div>
            </div>

            {/* Deep Dive: Food Loss vs Food Waste Shift */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-black text-sm text-[#1B3A5C] flex items-center gap-2">
                <span>🔄 Pergeseran Tren Komposisi FLW Indonesia (2000 – 2019)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Kajian Bappenas membuktikan bahwa porsi <strong>Food Loss (tahap hulu) menurun dari 61% ke 45%</strong>, sedangkan porsi <strong>Food Waste (tahap hilir: distribusi, ritel, layanan makanan, dan konsumsi) melonjak dari 39% menjadi 55%</strong>.
              </p>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>Food Loss (Tahap Hulu Produksi & Pascapanen):</span>
                  <span className="font-bold text-slate-500">45% (Rata-rata 56%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[45%]"></div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-amber-800 font-bold">Food Waste (Tahap Hilir: Resto, Ritel, Konsumen — Fokus Replate):</span>
                  <span className="font-extrabold text-amber-800">55% (Meningkat Drastis)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[55%]"></div>
                </div>
              </div>
            </div>

            {/* Economic Loss & Energy Loss Comparison Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-[#1B3A5C] text-white rounded-2xl border border-[#2C5A8F] space-y-2">
                <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                  KEHILANGAN EKONOMI NASIONAL
                </span>
                <h4 className="text-lg font-black text-white">Rp 213 – 551 Triliun / Tahun</h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Setara 4%–5% PDB Indonesia per tahun. Kehilangan ekonomi terbesar terjadi pada tahapan Food Waste hilir yaitu sebesar <strong>Rp 107 – 346 Triliun / tahun</strong>.
                </p>
              </div>

              <div className="p-5 bg-emerald-950 text-white rounded-2xl border border-emerald-700 space-y-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  KEHILANGAN ENERGI & ZAT GIZI
                </span>
                <h4 className="text-lg font-black text-emerald-300">618 – 989 kkal / kapita / hari</h4>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Pada tahun 2014, 45,7% masyarakat Indonesia mengalami defisit AKG energi. Redistribusi pangan surplus Replate mampu mengatasi <strong>62%–100% defisit AKG energi</strong> masyarakat rentan.
                </p>
              </div>
            </div>

            {/* Strategic Alignment with Bappenas Strategy D2 */}
            <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2 text-amber-950">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-600 text-white font-black text-[10px] rounded-md uppercase tracking-wider">
                  STRATEGI NASIONAL D2 BAPPENAS
                </span>
                <h4 className="font-black text-sm text-slate-900">
                  Landasan Solusi Digital Platform REPLATE
                </h4>
              </div>
              <p className="text-xs leading-relaxed font-medium text-slate-800">
                Kajian Bappenas merumuskan 45 strategi pengelolaan FLW, di mana <strong>Strategi D2</strong> secara spesifik mengamanatkan: <em>&quot;Pembuatan platform digital untuk membantu distribusi pangan berlebih, ugly food, dan sisa makanan dalam mencegah terjadinya FLW.&quot;</em>
              </p>
              <p className="text-[11px] text-slate-600 font-semibold italic">
                REPLATE hadir sebagai infrastruktur digital kolaboratif yang menghubungkan Surplus Provider, Konsumen, Panti Asuhan, dan Organisasi Food Rescue (Garda Pangan / FOI) secara cepat, transparan, dan berbasis geolokasi GPS real-time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KALKULATOR DAMPAK BAPPENAS & IPCC STANDARDIZED */}
      {activeTab === 'KALKULATOR' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-[#1B3A5C] rounded-3xl border-2 border-[#2C5A8F] shadow-xl space-y-6 text-white">
            <div className="space-y-2">
              <span className="px-3.5 py-1 bg-[#0F1923] text-[#D4A843] border border-amber-400/40 rounded-xl text-[11px] font-black uppercase tracking-wider inline-block">
                METODOLOGI KAJIAN FLW BAPPENAS RI & IPCC 2019 REFINEMENT
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Formula Baku Konversi Dampak Lingkungan, Ekonomi, & Gizi
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium max-w-3xl">
                Replate menerapkan konstanta matematis resmi dari Laporan Bappenas 2000–2019 untuk mengukur penyelamatan pangan siap santap di wilayah perkotaan:
              </p>
            </div>

            {/* 3 Core Mathematical Constants */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-5 bg-[#0F1923] rounded-2xl border border-[#2C5A8F] space-y-1 text-center shadow-md">
                <span className="text-2xl font-black text-[#D4A843] block font-mono">1 Porsi = 0.4 kg</span>
                <strong className="text-xs text-white block">Standar Porsi Makanan Siap Santap</strong>
                <p className="text-[11px] text-slate-300 font-medium">1 kg makanan setara ~2.5 porsi nutrisi.</p>
              </div>

              <div className="p-5 bg-[#0F1923] rounded-2xl border border-[#2C5A8F] space-y-1 text-center shadow-md">
                <span className="text-2xl font-black text-emerald-400 block font-mono">1 kg = 4.0515 kg CO2e</span>
                <strong className="text-xs text-white block">Faktor Emisi Food Waste Hilir</strong>
                <p className="text-[11px] text-slate-300 font-medium">Bappenas: 4.051,5 kg CO2e / 1 ton FW.</p>
              </div>

              <div className="p-5 bg-[#0F1923] rounded-2xl border border-[#2C5A8F] space-y-1 text-center shadow-md">
                <span className="text-2xl font-black text-cyan-400 block font-mono">1 kg = Rp 12.500</span>
                <strong className="text-xs text-white block">Nilai Ekonomi Pangan Rata-Rata</strong>
                <p className="text-[11px] text-slate-300 font-medium">Kajian kehilangan ekonomi Bappenas.</p>
              </div>
            </div>

            {/* LIVE INTERACTIVE SIMULATOR CARD */}
            <div className="p-6 bg-[#0D1E32] rounded-2xl border-2 border-[#D4A843]/50 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                <div>
                  <h4 className="text-base font-black text-[#D4A843]">
                    Kalkulator Simulasi Multi-Dampak Riil
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">
                    Geser slider di bawah untuk melihat kalkulasi dampak pengurangan emisi, ekonomi, dan gizi secara instan:
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
                  max="1000"
                  step="5"
                  value={simulatedPortions}
                  onChange={(e) => setSimulatedPortions(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                  <span>5 Porsi (Warung)</span>
                  <span>250 Porsi (Restoran)</span>
                  <span>500 Porsi (Hotel)</span>
                  <span>1.000 Porsi (Event/Katering)</span>
                </div>
              </div>

              {/* Calculated Results Grid (6 Metrics) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">Food Waste Dicegah</span>
                  <strong className="text-base font-black text-emerald-400 font-mono">{calcWasteKg} kg</strong>
                  <span className="text-[9px] text-slate-500 block font-mono">0.4 kg/porsi</span>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">Reduksi Emisi GRK</span>
                  <strong className="text-base font-black text-cyan-400 font-mono">{calcCo2eKg} kg</strong>
                  <span className="text-[9px] text-slate-500 block font-mono">4.0515 kg/kg</span>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">Nilai Ekonomi</span>
                  <strong className="text-base font-black text-amber-300 font-mono">Rp {calcEconomicRp.toLocaleString('id-ID')}</strong>
                  <span className="text-[9px] text-slate-500 block font-mono">Rp 12.500/kg</span>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">Energi Nutrisi (AKG)</span>
                  <strong className="text-base font-black text-yellow-400 font-mono">{calcEnergyKcal.toLocaleString('id-ID')} Kkal</strong>
                  <span className="text-[9px] text-slate-500 block font-mono">336 kkal/porsi</span>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">Cegah Metana CH4</span>
                  <strong className="text-base font-black text-purple-300 font-mono">{calcCh4Kg} kg</strong>
                  <span className="text-[9px] text-slate-500 block font-mono">0.07 kg/kg</span>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold">Setara Jarak Mobil</span>
                  <strong className="text-base font-black text-blue-300 font-mono">~{calcCarKm} km</strong>
                  <span className="text-[9px] text-slate-500 block font-mono">0.192 kg/km</span>
                </div>
              </div>
            </div>

            {/* 5 Pillars SDG Alignment Card */}
            <div className="p-6 bg-[#0F1923] rounded-2xl border border-[#2C5A8F] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                    KONTRIBUSI NYATA KEBIJAKAN GLOBAL
                  </span>
                  <h4 className="text-base font-black text-white">
                    Komitmen 5 Pilar UN Sustainable Development Goals (SDGs)
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                  5 SDGS ALIGNED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-amber-600 text-white font-black text-[10px] rounded">
                    SDG 2
                  </span>
                  <strong className="text-white block text-xs">Zero Hunger</strong>
                  <p className="text-[11px] text-slate-300">Pemberian akses pangan berenergi (2.100 kkal) untuk panti asuhan & dhuafa.</p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-orange-600 text-white font-black text-[10px] rounded">
                    SDG 9
                  </span>
                  <strong className="text-white block text-xs">Industri & Inovasi</strong>
                  <p className="text-[11px] text-slate-300">Infrastruktur Smart Matching 2.0 & Geofencing GPS redistribusi cepat.</p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded">
                    SDG 11
                  </span>
                  <strong className="text-white block text-xs">Kota Berkelanjutan</strong>
                  <p className="text-[11px] text-slate-300">Ekosistem kolaboratif pangan sirkular perkotaan & penurunan beban TPA.</p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-yellow-700 text-white font-black text-[10px] rounded">
                    SDG 12
                  </span>
                  <strong className="text-white block text-xs">Konsumsi Bertanggung Jawab</strong>
                  <p className="text-[11px] text-slate-300">Target 12.3: Mengurangi 40,79% limbah makanan nasional via Rescue Sale.</p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-emerald-700 text-white font-black text-[10px] rounded">
                    SDG 13
                  </span>
                  <strong className="text-white block text-xs">Aksi Perubahan Iklim</strong>
                  <p className="text-[11px] text-slate-300">Mereduksi 4.051,5 kg CO2e/ton FW & mencegah gas metana (CH4).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CARA KERJA (4 ROLE) */}
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

      {/* TAB 4: REGULASI BPOM */}
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

      {/* TAB 5: FAQ & BANTUAN */}
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
