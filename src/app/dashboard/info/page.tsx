'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  calculateThermalDecayRUI,
  FOOD_CATEGORY_PROFILES,
  FoodSafetyCategory,
} from '@/lib/thermalRescueEngine';
import { calculateIppcEsgImpact } from '@/lib/esgCarbonEngine';
import { Thermometer, ShieldAlert, CheckCircle2, AlertTriangle, Flame, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  category: 'LATAR_BELAKANG' | 'KALKULATOR' | 'CARA_KERJA' | 'BPOM' | 'FAQ';
  categoryLabel: string;
  categoryBadgeColor: string;
  title: string;
  subtitle?: string;
  content: string;
  tags: string[];
  roleTarget?: 'PROVIDER' | 'BENEFICIARY' | 'CONSUMER' | 'VOLUNTEER';
}

export default function DashboardInfoHubPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'CONSUMER';

  const [activeTab, setActiveTab] = useState<'LATAR_BELAKANG' | 'KALKULATOR' | 'CARA_KERJA' | 'BPOM' | 'FAQ'>('LATAR_BELAKANG');
  const [selectedRoleFlow, setSelectedRoleFlow] = useState<'PROVIDER' | 'BENEFICIARY' | 'CONSUMER' | 'VOLUNTEER'>('PROVIDER');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedKnowledgeItem, setSelectedKnowledgeItem] = useState<KnowledgeItem | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchCategory, setSelectedSearchCategory] = useState<string>('ALL');

  // Interactive Live Carbon Simulation State (Bappenas & KLH Standard)
  const [simulatedPortions, setSimulatedPortions] = useState<number>(50);

  // 1 Porsi = 0.4 kg makanan siap santap
  const calcWasteKgNum = Number((simulatedPortions * 0.4).toFixed(1));
  const ippcReport = useMemo(() => calculateIppcEsgImpact(calcWasteKgNum), [calcWasteKgNum]);
  const calcWasteKg = calcWasteKgNum.toFixed(1);
  // Bappenas & IPCC Tier 2
  const calcCo2eKg = ippcReport.totalNetCo2eSavedKg.toFixed(1);
  const calcEconomicRp = Math.round(calcWasteKgNum * 12500);
  const calcEnergyKcal = Math.round(simulatedPortions * 336);
  const calcCh4Kg = ippcReport.methaneAvoidedKg.toFixed(2);
  const calcCarKm = Math.round(Number(calcCo2eKg) / 0.192);

  // Pilar 3: Interactive BPOM Thermal Decay & Sensory Inspection State
  const [bpomCategory, setBpomCategory] = useState<FoodSafetyCategory>('COOKED_HOT_GRAVY');
  const [bpomTemp, setBpomTemp] = useState<number>(32);
  const [bpomElapsedHours, setBpomElapsedHours] = useState<number>(2.0);
  const [bpomHasCoolBox, setBpomHasCoolBox] = useState<boolean>(false);
  const [bpomChecklist, setBpomChecklist] = useState({
    odorNormal: true,
    textureNormal: true,
    colorNormal: true,
    noSlimeOrFroth: true,
  });

  const bpomRuiResult = useMemo(() => {
    return calculateThermalDecayRUI({
      category: bpomCategory,
      ambientTemperatureC: bpomTemp,
      cookedOrPackedTime: new Date(Date.now() - bpomElapsedHours * 3600 * 1000),
      isUsingCoolbox: bpomHasCoolBox,
      portions: 50,
    });
  }, [bpomCategory, bpomTemp, bpomElapsedHours, bpomHasCoolBox]);

  const isOrganolepticPass = bpomChecklist.odorNormal && bpomChecklist.textureNormal && bpomChecklist.colorNormal && bpomChecklist.noSlimeOrFroth;

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

  const bpomProtocols = [
    { title: '1. Batas Waktu Masak', desc: 'Makanan olahan matang maksimal berumur 4 jam sejak selesai dimasak.' },
    { title: '2. Suhu Simpan Higienis', desc: 'Makanan panas disimpan > 60°C, makanan dingin disimpan < 4°C.' },
    { title: '3. Kemasan Utuh & Tersegel', desc: 'Wadah makanan tertutup rapat, higienis, dan bebas kontaminasi luar.' },
    { title: '4. Inspeksi Sensorik Visual', desc: 'Warna, tekstur, dan bentuk makanan normal tanpa tanda basi.' },
    { title: '5. Bebas Bau Asam / Tengik', desc: 'Aroma makanan segar dan tidak terindikasi fermentasi liar.' },
    { title: '6. Label Alergen & Bahan', desc: 'Informasi bahan dasar (kacang, seafood, susu) dicantumkan jelas.' },
    { title: '7. Lokasi Bersih Terverifikasi', desc: 'Dapur resto mitra telah diaudit NIB & sertifikasi sanitasi.' },
    { title: '8. Batas Waktu Konsumsi', desc: 'Makanan harus dikonsumsi dalam batas waktu yang tertera pada resi.' },
  ];

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
      q: 'Apa perbedaan antara Rescue Sale dan Donasi Food Rescue Rp 0?',
      a: 'Rescue Sale adalah makanan berlebih berbayar murah dengan diskon hingga 70% untuk konsumen umum/anak kos. Sedangkan Donasi Food Rescue Rp 0 dialokasikan khusus untuk panti asuhan, yayasan sosial, dan masyarakat berpenghasilan rendah terverifikasi SKTM/KIS.',
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
    {
      q: 'Bagaimana jejaring penyelamatan pangan Replate menjangkau 8 kota utama Indonesia?',
      a: 'Replate mengintegrasikan mitra restoran, bakery, perhotelan, panti asuhan, dan armada relawan di berbagai kota besar (Surabaya, Jakarta, Bandung, Yogyakarta, Medan, Semarang, Bali, Makassar) untuk membentuk sabuk pengaman pangan (food safety belt) perkotaan yang tangguh.',
    },
    {
      q: 'Apakah mitra pendonor mendapatkan fasilitas pemotongan pajak (PP No. 93/2010)?',
      a: 'Ya, berdasarkan regulasi PP No. 93/2010 dan perpajakan RI, donasi makanan untuk yayasan sosial dan penanggulangan kemiskinan diakui secara sah sebagai biaya pengurang penghasilan bruto (tax deduction) bagi wajib pajak badan.',
    },
    {
      q: 'Bagaimana SOP rantai dingin (cold-chain) & kotak boks termal menjaga mutu makanan?',
      a: 'Pengantaran kurir toko dan armada relawan menggunakan boks isolasi berinsulasi food-grade bersuhu dingin (<4°C) atau panas (>60°C) guna menjaga kestabilan higienitas makanan dan mencegah perkembangbiakan mikroba patogen.',
    },
  ];

  // Comprehensive Knowledge Index for Search
  const knowledgeBase: KnowledgeItem[] = useMemo(() => [
    // 1. Latar Belakang & Urgensi
    {
      id: 'kb-bg-1',
      category: 'LATAR_BELAKANG',
      categoryLabel: 'Latar Belakang & Data',
      categoryBadgeColor: 'bg-red-100 text-red-800 border-red-200',
      title: '40,79% Limbah Makanan Nasional (KLH 2025)',
      subtitle: 'Komponen Sampah #1 Terbesar di Indonesia',
      content: 'Berdasarkan data KLH 2025 dengan total 20,25 juta ton timbulan, sampah makanan mendominasi 40,79%, jauh melampaui sampah plastik sebesar 19,95%.',
      tags: ['klh 2025', 'sampah makanan', 'limbah', 'plastik', 'urgensi', 'flw', 'statistik'],
    },
    {
      id: 'kb-bg-2',
      category: 'LATAR_BELAKANG',
      categoryLabel: 'Latar Belakang & Data',
      categoryBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Timbulan FLW 23–48 Juta Ton / Tahun (Bappenas RI)',
      subtitle: 'Setara 115–184 kg/kapita/tahun',
      content: 'Kajian Bappenas membuktikan kerugian masif sumber daya pangan sepanjang rantai pasok Indonesia yang terbuang sia-sia setiap tahunnya.',
      tags: ['bappenas', 'timbulan', 'per kapita', 'kajian flw', 'data'],
    },
    {
      id: 'kb-bg-3',
      category: 'LATAR_BELAKANG',
      categoryLabel: 'Latar Belakang & Data',
      categoryBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'Faktor Emisi 4.051,5 kg CO2e / 1 Ton Food Waste Hilir',
      subtitle: '4,3x Lebih Tinggi dari Food Loss Hulu',
      content: 'Emisi food waste hilir (restoran, ritel, konsumen) sangat tinggi (4.051,5 kg CO2e/ton) karena mencakup akumulasi energi proses memasak, pendinginan, dan distribusi.',
      tags: ['emisi', 'co2e', 'gas rumah kaca', 'grk', 'hilir', 'food loss vs waste', 'bappenas'],
    },
    {
      id: 'kb-bg-4',
      category: 'LATAR_BELAKANG',
      categoryLabel: 'Latar Belakang & Data',
      categoryBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      title: 'Potensi Penyelamatan Pangan 61–125 Juta Jiwa',
      subtitle: 'Pemberantasan Kelaparan & Pemenuhan AKG Nutrisi',
      content: 'Sebanyak 29%–47% populasi Indonesia dapat dipenuhi kebutuhan energinya (2.100 kkal) jika timbulan FLW berhasil diredistribusi.',
      tags: ['akg', 'nutrisi', 'zero hunger', 'panti asuhan', 'kelaparan', 'sdg 2'],
    },
    {
      id: 'kb-bg-5',
      category: 'LATAR_BELAKANG',
      categoryLabel: 'Latar Belakang & Data',
      categoryBadgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      title: 'Kehilangan Ekonomi Rp 213–551 Triliun / Tahun',
      subtitle: 'Setara 4%–5% PDB Indonesia',
      content: 'Kehilangan ekonomi terbesar terjadi pada tahapan Food Waste hilir sebesar Rp 107–346 Triliun / tahun dengan estimasi nilai pangan ~Rp 12.500/kg.',
      tags: ['ekonomi', 'pdb', 'kerugian nasional', 'keuangan', 'bappenas'],
    },
    {
      id: 'kb-bg-6',
      category: 'LATAR_BELAKANG',
      categoryLabel: 'Latar Belakang & Data',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: 'Mandat Kebijakan Strategi D2 Bappenas RI',
      subtitle: 'Infrastruktur Digital Platform Redistribusi Pangan',
      content: 'Strategi D2 mengamanatkan pembuatan platform digital untuk memfasilitasi distribusi pangan berlebih, ugly food, dan sisa makanan secara terstruktur.',
      tags: ['strategi d2', 'bappenas', 'kebijakan', 'regulasi nasional', 'platform digital'],
    },
    {
      id: 'kb-bg-7',
      category: 'LATAR_BELAKANG',
      categoryLabel: 'Latar Belakang & Data',
      categoryBadgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      title: 'Penyelarasan 5 Pilar SDGs (Tujuan Pembangunan Berkelanjutan)',
      subtitle: 'SDG 2, SDG 9, SDG 11, SDG 12 (Target 12.3), SDG 13',
      content: 'Replate berkontribusi langsung pada SDG 2 (Zero Hunger), SDG 9 (Inovasi Smart Matching), SDG 11 (Kota Berkelanjutan), SDG 12.3 (Kurangi Food Waste 50%), dan SDG 13 (Aksi Iklim).',
      tags: ['sdgs', 'target 12.3', 'zero hunger', 'perubahan iklim', 'pbb'],
    },

    // 2. Kalkulator Dampak
    {
      id: 'kb-calc-1',
      category: 'KALKULATOR',
      categoryLabel: 'Kalkulator & Formula',
      categoryBadgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      title: 'Konstanta Metodologi: 1 Porsi = 0.4 kg Makanan Siap Santap',
      subtitle: 'Standar IPCC & Bappenas Wilayah Perkotaan',
      content: 'Setiap 1 porsi makanan siap santap dihitung setara 0.4 kg pangan. Sehingga 1 kg makanan mewakili ~2.5 porsi nutrisi siap konsumsi.',
      tags: ['kalkulator', 'formula', 'porsi', '0.4 kg', 'konversi'],
    },
    {
      id: 'kb-calc-2',
      category: 'KALKULATOR',
      categoryLabel: 'Kalkulator & Formula',
      categoryBadgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      title: 'Formula Reduksi Emisi GRK (4.0515 kg CO2e / kg Food Waste)',
      subtitle: 'Perhitungan Terpadu Emisi Metana & Karbon',
      content: 'Menghitung reduksi gas rumah kaca dari porsi makanan yang diselamatkan agar tidak membusuk di Tempat Pemrosesan Akhir (TPA) menjadi gas metana (CH4).',
      tags: ['kalkulator', 'co2e', 'metana', 'tpa', 'grk', 'emisi'],
    },
    {
      id: 'kb-calc-3',
      category: 'KALKULATOR',
      categoryLabel: 'Kalkulator & Formula',
      categoryBadgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      title: 'Simulasi Energi Nutrisi AKG (336 kkal / porsi)',
      subtitle: 'Kompensasi Defisit Kalori Harian Masyarakat Rentan',
      content: 'Menghitung akumulasi kilokalori nutrisi pangan higienis yang disalurkan kepada panti asuhan, balita, dhuafa, dan anak asuh.',
      tags: ['kalkulator', 'akg', 'kalori', 'gizi', 'nutrisi'],
    },

    // 3. Cara Kerja (4 Role)
    {
      id: 'kb-role-p',
      category: 'CARA_KERJA',
      categoryLabel: 'Cara Kerja Role',
      categoryBadgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      roleTarget: 'PROVIDER',
      title: 'SOP Food Provider (Restoran, Bakery, Katering, Hotel)',
      subtitle: 'Rescue Sale Diskon s/d 70% atau Donasi Bebas Biaya Rp 0',
      content: '1. Input menu & lengkapi 8-poin BPOM. 2. Pilih Rescue Sale atau Donasi Rp 0. 3. Verifikasi serah terima via scan QR kasir. 4. Unduh Laporan CSR & Cetak Sertifikat Mitra Berkelanjutan.',
      tags: ['food provider', 'restoran', 'bakery', 'katering', 'hotel', 'rescue sale', 'csr', 'sertifikat', 'qr kasir'],
    },
    {
      id: 'kb-role-b',
      category: 'CARA_KERJA',
      categoryLabel: 'Cara Kerja Role',
      categoryBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      roleTarget: 'BENEFICIARY',
      title: 'SOP Food Beneficiary (Panti Asuhan, Yayasan, Shelter)',
      subtitle: 'Smart Matching 2.0 & Penyaluran Nutrisi Gratis',
      content: '1. Ajukan kebutuhan menu & jam makan. 2. Sistem mencocokkan donatur terdekat via GPS. 3. Pilih Self-Pickup atau diantar kurir relawan. 4. Konfirmasi QR & ulas dampak nutrisi.',
      tags: ['food beneficiary', 'panti asuhan', 'yayasan', 'shelter', 'smart matching', 'donasi gratis', 'permintaan pangan'],
    },
    {
      id: 'kb-role-c',
      category: 'CARA_KERJA',
      categoryLabel: 'Cara Kerja Role',
      categoryBadgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      roleTarget: 'CONSUMER',
      title: 'SOP Food Consumer (Konsumen Umum, Mahasiswa, Anak Kos)',
      subtitle: 'Eksplor Pangan Diskon 50%-70% & Pembayaran QRIS',
      content: '1. Cari makanan terdekat di katalog. 2. Klaim & bayar instan via QRIS Bank Indonesia Rp 0 admin. 3. Tunjukkan QR resi saat ambil di outlet. 4. Beri rating & ulasan rasa.',
      tags: ['consumer', 'konsumen', 'mahasiswa', 'anak kos', 'qris', 'tas klaim', 'surplus hemat', 'diskon'],
    },
    {
      id: 'kb-role-v',
      category: 'CARA_KERJA',
      categoryLabel: 'Cara Kerja Role',
      categoryBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      roleTarget: 'VOLUNTEER',
      title: 'SOP Rescue Volunteer (Relawan Logistik & Armada Komunitas)',
      subtitle: 'Surat Jalan Manifest Digital via WhatsApp & QR Serah Terima',
      content: '1. Terima penugasan rute terdekat. 2. Akses link Surat Jalan digital via WA tanpa login. 3. Inspeksi wadah tersegel & scan QR toko. 4. Antar steril ke shelter panti asuhan.',
      tags: ['rescue volunteer', 'kurir relawan', 'garda pangan', 'food bank', 'surat jalan digital', 'manifest wa', 'logistik'],
    },

    // 4. Regulasi BPOM 8-Poin
    {
      id: 'kb-bpom-1',
      category: 'BPOM',
      categoryLabel: 'Regulasi BPOM RI',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '1. Batas Waktu Masak & Toleransi Waktu Simpan (< 4 Jam)',
      subtitle: 'Protokol Higienitas BPOM RI & WHO Poin 1',
      content: 'Makanan matang olahan siap santap hanya boleh diselamatkan jika berumur maksimal 4 jam sejak selesai dimasak untuk mencegah pertumbuhan mikroba.',
      tags: ['bpom', 'waktu masak', '4 jam', 'higienitas', 'keamanan pangan', 'sop'],
    },
    {
      id: 'kb-bpom-2',
      category: 'BPOM',
      categoryLabel: 'Regulasi BPOM RI',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '2. Suhu Penyimpanan Terkontrol (> 60°C atau < 4°C)',
      subtitle: 'Pencegahan Zona Bahaya Suhu (Danger Zone)',
      content: 'Makanan hangat/panas wajib dijaga di atas suhu 60°C, sedangkan makanan dingin, pastry, atau produk susu wajib disimpan di bawah suhu 4°C.',
      tags: ['bpom', 'suhu', 'danger zone', 'cooler box', 'steril', 'cold chain'],
    },
    {
      id: 'kb-bpom-3',
      category: 'BPOM',
      categoryLabel: 'Regulasi BPOM RI',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '3. Kemasan Utuh, Bersih, dan Tersegel Rapat',
      subtitle: 'Pencegahan Kontaminasi Silang Fisik & Kimia',
      content: 'Wadah kemasan makanan wajib menggunakan food-grade packaging yang tertutup rapat, bersegel stiker higienitas Replate, dan tidak bocor.',
      tags: ['bpom', 'kemasan', 'segel', 'food grade', 'kontaminasi silang'],
    },
    {
      id: 'kb-bpom-4',
      category: 'BPOM',
      categoryLabel: 'Regulasi BPOM RI',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '4. Inspeksi Sensorik & Uji Organoleptik (Warna, Tekstur, Bentuk)',
      subtitle: 'Evaluasi Kelayakan Fisik Sebelum Pengunggahan',
      content: 'Staff mitra wajib memeriksa kondisi visual makanan; tidak boleh ada lendir, perubahan warna tidak wajar, atau tekstur yang lembek/basi.',
      tags: ['bpom', 'organoleptik', 'sensorik', 'inspeksi visual', 'kelayakan'],
    },
    {
      id: 'kb-bpom-5',
      category: 'BPOM',
      categoryLabel: 'Regulasi BPOM RI',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '5. Bebas Bau Asam, Tengik, atau Fermentasi Liar',
      subtitle: 'Uji Bau Standar Keamanan Makanan Siap Santap',
      content: 'Aroma makanan wajib berbau khas segar masakan asli, tidak terindikasi pembusukan bakteri asam laktat liar atau oksidasi minyak tengik.',
      tags: ['bpom', 'aroma', 'bau asam', 'tengik', 'kesegaran'],
    },
    {
      id: 'kb-bpom-6',
      category: 'BPOM',
      categoryLabel: 'Regulasi BPOM RI',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '6. Pelabelan Alergen & Komposisi Bahan Pangan',
      subtitle: 'Transparansi Bahan Kacang, Seafood, Telur, dan Susu',
      content: 'Mitra wajib menyertakan peringatan alergen utama pada rincian menu untuk melindungi konsumen dan anak asuh yang memiliki sensitivitas diet.',
      tags: ['bpom', 'alergen', 'seafood', 'kacang', 'susu', 'label bahan'],
    },
    {
      id: 'kb-bpom-7',
      category: 'BPOM',
      categoryLabel: 'Regulasi BPOM RI',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '7. Lokasi Bersih & Dapur Terverifikasi NIB / Dinkes',
      subtitle: 'Audit Sanitasi Higiene Sanitasi Pangan (HSP)',
      content: 'Gerai penyedia makanan telah diverifikasi memiliki perizinan usaha resmi NIB dan sertifikat laik higiene sanitasi tempat pengolahan pangan.',
      tags: ['bpom', 'nib', 'dinkes', 'hsp', 'sanitasi dapur', 'verifikasi'],
    },
    {
      id: 'kb-bpom-8',
      category: 'BPOM',
      categoryLabel: 'Regulasi BPOM RI',
      categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: '8. Batas Waktu Konsumsi (Expiry Timeframe pada Resi)',
      subtitle: 'Disiplin Waktu Konsumsi Segera',
      content: 'Setiap paket makanan mencantumkan batas waktu konsumsi yang tegas pada tiket resi klaim agar makanan dinikmati saat kualitas prima.',
      tags: ['bpom', 'batas konsumsi', 'kedaluwarsa', 'tiket resi', 'waktu'],
    },

    // 5. FAQ & Bantuan
    {
      id: 'kb-faq-1',
      category: 'FAQ',
      categoryLabel: 'FAQ & Bantuan',
      categoryBadgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      title: 'Dasar Data Ilmiah Perhitungan Dampak Lingkungan',
      subtitle: 'Kajian Resmi Bappenas RI (2000–2019) & KLH 2025',
      content: 'Mengadopsi faktor emisi food waste hilir 4.051,5 kg CO2e/ton (4,0515 kg CO2e/kg) yang mencakup seluruh energi pengolahan dan distribusi hilir.',
      tags: ['faq', 'ilmiah', 'data bappenas', 'faktor emisi', 'referensi'],
    },
    {
      id: 'kb-faq-2',
      category: 'FAQ',
      categoryLabel: 'FAQ & Bantuan',
      categoryBadgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      title: 'Perbedaan Rescue Sale vs Donasi Food Rescue Bebas Biaya Rp 0',
      subtitle: 'Model Distribusi Ganda Pangan Surplus',
      content: 'Rescue Sale: Makanan berbayar murah diskon s/d 70% untuk konsumen umum. Donasi Rp 0: Pangan dialokasikan cuma-cuma khusus panti asuhan, yayasan, dan dhuafa.',
      tags: ['faq', 'rescue sale', 'donasi rp 0', 'perbedaan', 'gratis'],
    },
    {
      id: 'kb-faq-3',
      category: 'FAQ',
      categoryLabel: 'FAQ & Bantuan',
      categoryBadgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      title: 'Surat Jalan Digital Kurir via WhatsApp Tanpa Login',
      subtitle: 'Kemudahan Ekosistem Relawan Garda Pangan & Food Bank',
      content: 'Relawan logistik menerima tautan surat jalan manifest digital via WhatsApp, terhubung ke Google Maps dan QR scanner untuk validasi serah terima instan.',
      tags: ['faq', 'surat jalan', 'whatsapp', 'kurir', 'relawan', 'logistik'],
    },
    {
      id: 'kb-faq-4',
      category: 'FAQ',
      categoryLabel: 'FAQ & Bantuan',
      categoryBadgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      title: 'Cara Mengunduh Laporan CSR & Cetak Sertifikat Mitra',
      subtitle: 'Dokumen Rekapitulasi Audit Keberlanjutan 1 Halaman',
      content: 'Food Provider dan Yayasan dapat membuka menu Laporan di Dashboard untuk mengunduh Sertifikat Penyelamat Pangan resmi dan ringkasan audit CSR.',
      tags: ['faq', 'laporan csr', 'sertifikat', 'audit', 'mitra berkelanjutan'],
    },
    {
      id: 'kb-faq-5',
      category: 'FAQ',
      categoryLabel: 'Jangkauan Nasional',
      categoryBadgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      title: 'Jejaring Penyelamatan Pangan Nasional di 8 Kota Utama Indonesia',
      subtitle: 'Surabaya, Jakarta, Bandung, Yogyakarta, Medan, Semarang, Bali, Makassar',
      content: 'Replate mengintegrasikan mitra restoran, bakery, perhotelan, panti asuhan, dan armada relawan di berbagai kota besar untuk membentuk sabuk pengaman pangan (food safety belt) perkotaan.',
      tags: ['nasional', 'surabaya', 'jakarta', 'bandung', 'medan', 'semarang', 'bali', 'makassar', 'jogja'],
    },
    {
      id: 'kb-faq-6',
      category: 'FAQ',
      categoryLabel: 'Regulasi & Hukum',
      categoryBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'Insentif Pengurang Pajak Penghasilan Donasi Sosial (PP No. 93/2010)',
      subtitle: 'Pengurangan Bruto Pajak Usaha bagi Mitra Pendonor Pangan',
      content: 'Berdasarkan regulasi perpajakan RI, donasi makanan untuk yayasan sosial dan penanggulangan kemiskinan diakui sebagai biaya pengurang penghasilan bruto wajib pajak badan.',
      tags: ['pajak', 'pp 93 2010', 'insentif', 'csr', 'donasi panti'],
    },
    {
      id: 'kb-faq-7',
      category: 'FAQ',
      categoryLabel: 'Logistik Steril',
      categoryBadgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      title: 'SOP Rantai Dingin (Cold-Chain) & Kotak Boks Termal Relawan',
      subtitle: 'Menjaga Kestabilan Suhu Makanan Selama Pengantaran',
      content: 'Pengantaran kurir toko dan armada relawan menggunakan boks isolasi berinsulasi food-grade bersuhu dingin (<4°C) atau panas (>60°C) guna mencegah perkembangbiakan bakteri patogen.',
      tags: ['cold chain', 'rantai dingin', 'suhu', 'higienis', 'boks isolasi', 'kurir'],
    },
  ], []);

  // Role-Aware Quick Search Keywords
  const roleRecommendedKeywords = useMemo(() => {
    const upper = String(userRole || '').toUpperCase();
    if (upper.includes('PROVIDER')) {
      return ['SOP Restoran', 'Checklist 8 BPOM', 'Rescue Sale vs Donasi', 'Sertifikat CSR', 'Bappenas D2', 'Emisi CO2'];
    }
    if (upper.includes('BENEFICIARY') || upper.includes('YAYASAN')) {
      return ['Permintaan Pangan Panti', 'Smart Matching GPS', 'Donasi Rp 0', 'AKG Nutrisi', 'BPOM Suhu', 'Zero Hunger'];
    }
    if (upper.includes('VOLUNTEER') || upper.includes('RESCUE')) {
      return ['Surat Jalan WA', 'QR Serah Terima Toko', 'Inspeksi Suhu Kurir', 'Manifest Digital', 'Rute Google Maps'];
    }
    if (upper.includes('CONSUMER')) {
      return ['Rescue Sale Diskon', 'Bayar QRIS', 'Ambil Toko QR Resi', 'Ulasan Rating', 'BPOM Higienitas'];
    }
    return ['Regulasi BPOM', 'Kajian Bappenas', 'Audit CSR', 'Strategi D2', 'Emisi CO2', 'Smart Matching'];
  }, [userRole]);

  // Dynamic Search Filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return knowledgeBase.filter((item) => {
      const matchCat = selectedSearchCategory === 'ALL' || item.category === selectedSearchCategory;
      if (!matchCat) return false;
      const matchText =
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.content.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchText;
    });
  }, [searchQuery, selectedSearchCategory, knowledgeBase]);

  const highlightText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const trimmed = query.trim();
    const parts = text.split(new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-[#1B3A5C] px-1 py-0.5 rounded font-black">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleJumpToTopic = (item: KnowledgeItem) => {
    if (item.category === 'FAQ') {
      setActiveTab(item.category);
      if (item.roleTarget) {
        setSelectedRoleFlow(item.roleTarget as any);
      }
      setSearchQuery('');
      setSelectedKnowledgeItem(null);

      const matchIdx = faqs.findIndex(
        (f) =>
          f.q.toLowerCase().includes(item.title.toLowerCase().substring(0, 20)) ||
          item.title.toLowerCase().includes(f.q.toLowerCase().substring(0, 20)) ||
          f.a.toLowerCase().includes(item.content.toLowerCase().substring(0, 25))
      );
      if (matchIdx !== -1) {
        setOpenFaqIndex(matchIdx);
      }

      setTimeout(() => {
        const el = document.getElementById(`faq-item-${item.id}`) || document.getElementById('dashboard-info-content-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
    } else {
      setSelectedKnowledgeItem(item);
    }
  };

  const handleJumpFromModal = () => {
    if (!selectedKnowledgeItem) return;
    const item = selectedKnowledgeItem;
    setActiveTab(item.category as any);
    if (item.roleTarget) {
      setSelectedRoleFlow(item.roleTarget as any);
    }
    setSearchQuery('');
    setSelectedKnowledgeItem(null);
    
    setTimeout(() => {
      const el = document.getElementById('dashboard-info-content-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

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

      {/* Global Search Bar & Role-Context Quick Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari SOP peran ${formatRoleLabel(userRole)}, standar BPOM, emisi CO2, atau FAQ...`}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Hapus pencarian"
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black"></span>
            </button>
          )}
        </div>

        {/* Quick Keywords Chips (Role-Aware) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <span> Rekomendasi {formatRoleLabel(userRole)}:</span>
          </span>
          {roleRecommendedKeywords.map((kw, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSearchQuery(searchQuery === kw ? '' : kw)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer shrink-0 border ${
                searchQuery.toLowerCase() === kw.toLowerCase()
                  ? 'bg-[#1B3A5C] text-[#D4A843] border-[#1B3A5C] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Live Search Results View (If Search Active) */}
      {searchQuery.trim().length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#1B3A5C] text-white p-4 sm:p-5 rounded-2xl border border-[#2C5A8F] shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                HASIL PENCARIAN INFORMASI & SOP
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Ditemukan{' '}
                <span className="text-[#D4A843] font-mono px-2 py-0.5 bg-slate-900/80 rounded-md border border-amber-400/30">
                  {searchResults.length}
                </span>{' '}
                materi untuk{' '}
                <span className="text-amber-300 font-extrabold underline decoration-amber-400 decoration-2 underline-offset-4">
                  &quot;{searchQuery}&quot;
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter in Search */}
              {['ALL', 'LATAR_BELAKANG', 'KALKULATOR', 'CARA_KERJA', 'BPOM', 'FAQ'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedSearchCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    selectedSearchCategory === cat
                      ? 'bg-[#D4A843] text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL'
                    ? 'Semua'
                    : cat === 'LATAR_BELAKANG'
                    ? 'Kajian'
                    : cat === 'KALKULATOR'
                    ? 'Kalkulator'
                    : cat === 'CARA_KERJA'
                    ? 'SOP Role'
                    : cat === 'BPOM'
                    ? 'BPOM'
                    : 'FAQ'}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSearchCategory('ALL');
                }}
                className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-[10px] font-black cursor-pointer transition-colors"
              >
                Reset 
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {searchResults.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-xl">
                
              </div>
              <h4 className="text-sm font-black text-slate-800">Tidak ada materi yang sesuai</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tidak ditemukan hasil untuk kata kunci &quot;{searchQuery}&quot;. Coba kata kunci lain atau pilih dari rekomendasi topik di atas.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="font-bold text-xs"
              >
                Tampilkan Semua Modul 
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${item.categoryBadgeColor}`}>
                        {item.categoryLabel}
                      </span>
                      {item.roleTarget && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          Peran: {item.roleTarget}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-[#1B3A5C] leading-snug">
                      {highlightText(item.title, searchQuery)}
                    </h4>

                    {item.subtitle && (
                      <span className="text-[11px] font-bold text-amber-700 block">
                        {highlightText(item.subtitle, searchQuery)}
                      </span>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {highlightText(item.content, searchQuery)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleJumpToTopic(item)}
                      className="text-xs font-black text-[#1B3A5C] hover:text-[#D4A843] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Buka Modul</span>
                      <span></span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5 Core Information Tabs */}
      <div id="dashboard-info-content-container" className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl scroll-mt-24">
        <button
          type="button"
          onClick={() => setActiveTab('LATAR_BELAKANG')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'LATAR_BELAKANG'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
           Latar Belakang & Urgensi FLW
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
           Kalkulator Dampak Bappenas
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
          Regulasi BPOM RI
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
                <span> Pergeseran Tren Komposisi FLW Indonesia (2000 – 2019)</span>
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
              {bpomProtocols.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-[#1B3A5C] block">{item.title}</span>
                  <p className="text-[11px] text-slate-600 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive BPOM Thermal Decay & RUI Simulation Engine */}
          <div className="p-6 sm:p-8 bg-[#0F1D2E] text-white rounded-3xl border-2 border-[#D4A843]/50 shadow-xl space-y-6">
            <div className="space-y-1.5 border-b border-slate-700/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  Pilar 3 BPOM Safety Standard
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Model Arrhenius (25°C - 38°C)</span>
              </div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-amber-400" />
                <span>Simulasi Peluruhan Termal Tropis & Rescue Urgency Index (RUI)</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Uji coba langsung bagaimana suhu udara lingkungan dan kotak pendingin insulated mempengaruhi jendela keselamatan konsumsi makanan surplus olahan:
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Parameters */}
              <div className="lg:col-span-7 space-y-4">
                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-300 block">Kategori Pangan Olahan:</label>
                  <select
                    value={bpomCategory}
                    onChange={(e) => setBpomCategory(e.target.value as FoodSafetyCategory)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-[#D4A843]"
                  >
                    {Object.entries(FOOD_CATEGORY_PROFILES).map(([key, prof]) => (
                      <option key={key} value={key}>
                        {prof.nameIndo} (Batas dasar: {prof.maxSafeHours} jam)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-1.5 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-300">Suhu Udara Lingkungan Tropis:</span>
                    <span className="font-mono font-black text-amber-400 text-sm">{bpomTemp} °C</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="38"
                    step="1"
                    value={bpomTemp}
                    onChange={(e) => setBpomTemp(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>25°C (Ruang AC)</span>
                    <span>31°C (Suhu Rata-rata)</span>
                    <span>38°C (Siang Terik Panas)</span>
                  </div>
                </div>

                {/* Elapsed Hours Slider */}
                <div className="space-y-1.5 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-300">Waktu Berlalu Sejak Selesai Dimasak:</span>
                    <span className="font-mono font-black text-cyan-400 text-sm">{bpomElapsedHours.toFixed(1)} Jam</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={bpomElapsedHours}
                    onChange={(e) => setBpomElapsedHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.5 Jam (Baru Masak)</span>
                    <span>3 Jam (Batas Kuah)</span>
                    <span>8 Jam (Batas Kue)</span>
                    <span>10 Jam</span>
                  </div>
                </div>

                {/* Cooler Box Checkbox */}
                <label className="flex items-center gap-3 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={bpomHasCoolBox}
                    onChange={(e) => setBpomHasCoolBox(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                  />
                  <div className="text-xs">
                    <strong className="text-white block font-bold">Gunakan Insulated Cooler Box / Kotak Rantai Dingin</strong>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Meredam akselerasi termal sebesar 45% dan memperpanjang toleransi aman konsumsi.
                    </span>
                  </div>
                </label>

                {/* Organoleptic Sensory Checklist */}
                <div className="space-y-2 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="text-xs font-extrabold text-[#D4A843] block">
                    4-Step Uji Sensorik Lapangan (Organoleptik BPOM):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={bpomChecklist.odorNormal}
                        onChange={(e) => setBpomChecklist(prev => ({ ...prev, odorNormal: e.target.checked }))}
                        className="rounded text-emerald-500 cursor-pointer"
                      />
                      <span>Aroma Segar (Bebas Asam)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={bpomChecklist.textureNormal}
                        onChange={(e) => setBpomChecklist(prev => ({ ...prev, textureNormal: e.target.checked }))}
                        className="rounded text-emerald-500 cursor-pointer"
                      />
                      <span>Tekstur Normal (Kenyal)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={bpomChecklist.colorNormal}
                        onChange={(e) => setBpomChecklist(prev => ({ ...prev, colorNormal: e.target.checked }))}
                        className="rounded text-emerald-500 cursor-pointer"
                      />
                      <span>Warna Visual Asli</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={bpomChecklist.noSlimeOrFroth}
                        onChange={(e) => setBpomChecklist(prev => ({ ...prev, noSlimeOrFroth: e.target.checked }))}
                        className="rounded text-emerald-500 cursor-pointer"
                      />
                      <span>Bebas Lendir & Busa</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Results */}
              <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    STATUS KELAYAKAN BPOM REAL-TIME
                  </span>

                  {/* Urgency Gauge Card */}
                  <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                    bpomRuiResult.urgencyLevel === 'CRITICAL_RESCUE'
                      ? 'bg-rose-950/70 border-rose-600/70 text-rose-200'
                      : bpomRuiResult.urgencyLevel === 'HIGH_PRIORITY'
                      ? 'bg-orange-950/70 border-orange-600/70 text-orange-200'
                      : bpomRuiResult.urgencyLevel === 'MODERATE'
                      ? 'bg-amber-950/70 border-amber-600/70 text-amber-200'
                      : 'bg-emerald-950/70 border-emerald-600/70 text-emerald-200'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-widest block">
                      RESCUE URGENCY INDEX (RUI)
                    </span>
                    <span className="text-4xl font-black font-mono block">
                      {bpomRuiResult.rescueUrgencyIndex.toFixed(1)} / 100
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider block">
                      {bpomRuiResult.urgencyLabelIndo}
                    </span>
                  </div>

                  {/* Safe Window & Thermal Specs */}
                  <div className="space-y-2 text-xs font-medium text-slate-300 pt-1">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>Batas Aman Efektif:</span>
                      <strong className="text-white font-mono">{bpomRuiResult.effectiveMaxHours} Jam</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>Sisa Toleransi Waktu:</span>
                      <strong className={`font-mono ${bpomRuiResult.remainingSafeMinutes <= 0 ? 'text-rose-400 font-black' : 'text-emerald-400'}`}>
                        {bpomRuiResult.remainingSafeMinutes <= 0 ? '0 Menit (Kedaluwarsa)' : `${Math.round(bpomRuiResult.remainingSafeMinutes)} Menit (~${(bpomRuiResult.remainingSafeMinutes / 60).toFixed(1)} Jam)`}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>Uji Organoleptik:</span>
                      <strong className={isOrganolepticPass ? 'text-emerald-400' : 'text-rose-400'}>
                        {isOrganolepticPass ? ' Lolos Syarat Sensorik' : ' Ditolak (Ada Kerusakan)'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1">
                  <strong className="text-[#D4A843] block font-extrabold">Rekomendasi Tindakan:</strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {bpomRuiResult.recommendedDispatchAction}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FAQ & BANTUAN */}
      {activeTab === 'FAQ' && (
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              id={`faq-item-kb-faq-${idx + 1}`}
              className={`rounded-2xl border transition-all overflow-hidden ${
                openFaqIndex === idx
                  ? 'border-[#D4A843] bg-amber-50/20 shadow-md ring-2 ring-[#D4A843]/30'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-extrabold text-xs sm:text-sm text-[#1B3A5C] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="pr-4">{faq.q}</span>
                <span className="text-slate-400 shrink-0 flex items-center">
                  {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-[#D4A843]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
                Hubungi Helpdesk WhatsApp 
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
