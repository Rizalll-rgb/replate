'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PublicInfoHubPage() {
  const [activeTab, setActiveTab] = useState<'CARA_KERJA' | 'BPOM' | 'IPCC' | 'TENTANG_KAMI' | 'FAQ'>('CARA_KERJA');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />

      <main className="flex-1 py-12 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] text-xs font-black uppercase tracking-wider">
            PUSAT INFORMASI, EDUKASI & REGULASI REPLATE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B3A5C] tracking-tight">
            Panduan Lengkap, Standar BPOM & Regulasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Temukan seluruh penjelasan operasional sistem, protokol higienitas pangan BPOM RI, metodologi jejak karbon IPCC, dan jawaban pertanyaan umum dalam satu tempat.
          </p>
        </div>

        {/* 5 Core Information Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CARA_KERJA')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === 'CARA_KERJA'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            📖 Cara Kerja
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
            🛡️ Regulasi BPOM
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
            🌿 Dampak IPCC
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TENTANG_KAMI')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === 'TENTANG_KAMI'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            🏢 Ekosistem Mitra
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

        {/* Tab 1: Cara Kerja */}
        {activeTab === 'CARA_KERJA' && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xl font-black text-[#1B3A5C]">
                Alur Kerja Ekosistem Redistribusi Pangan Replate
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Replate menghubungkan 4 aktor utama dalam satu siklus tertutup (*closed-loop distribution*) yang higienis, terukur, dan transparan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-extrabold text-xs text-[#1B3A5C]">Upload Surplus Makanan</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Restoran / Bakery mengisi checklist SOP BPOM dan menentukan harga diskon atau donasi Rp 0.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-extrabold text-xs text-[#1B3A5C]">Smart Matching 2.0</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Algoritma mencocokkan makanan secara otomatis dengan panti asuhan atau pembeli terdekat (&lt; 3 km).
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-extrabold text-xs text-[#1B3A5C]">Logistik & Surat Jalan</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Relawan kurir mengambil makanan menggunakan Surat Jalan Digital via WhatsApp tanpa perlu login.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-extrabold text-xs text-[#1B3A5C]">Scan QR Serah Terima</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Serah terima fisik diverifikasi dengan pemindaian QR Code terenkripsi dan ulasan dampak terbit.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Regulasi BPOM */}
        {activeTab === 'BPOM' && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h3 className="text-xl font-black text-[#1B3A5C]">
                    Protokol 8-Poin Rescue Readiness BPOM RI & WHO
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Standar baku mutu keamanan pangan yang wajib dipenuhi sebelum makanan diunggah ke platform.
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
            </Card>
          </div>
        )}

        {/* Tab 3: Formula IPCC */}
        {activeTab === 'IPCC' && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 bg-[#1B3A5C] text-white rounded-3xl border border-[#2C5A8F] shadow-md space-y-4">
              <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
                METODOLOGI PERHITUNGAN JEJAK KARBON IPCC 2006 / 2019 REFINEMENT
              </span>
              <h3 className="text-2xl font-black text-white">
                Formula Konversi Dampak Lingkungan Replate
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Replate menggunakan standar Intergovernmental Panel on Climate Change (IPCC) untuk menghitung pencegahan gas rumah kaca dari timbulan sampah organik di TPA Benowo Surabaya:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-5 bg-[#142C47] rounded-2xl border border-[#2C5A8F] space-y-1 text-center">
                  <span className="text-2xl font-black text-[#D4A843] block">1 Porsi = 0.4 kg</span>
                  <strong className="text-xs text-white block">Bobot Pangan Rata-Rata</strong>
                  <p className="text-[10px] text-slate-300">Standar porsi makanan siap santap Indonesia.</p>
                </div>

                <div className="p-5 bg-[#142C47] rounded-2xl border border-[#2C5A8F] space-y-1 text-center">
                  <span className="text-2xl font-black text-emerald-400 block">1 kg Waste = 2.5 kg CO2e</span>
                  <strong className="text-xs text-white block">Faktor Emisi Gas Rumah Kaca</strong>
                  <p className="text-[10px] text-slate-300">Reduksi emisi pembusukan anaerobik.</p>
                </div>

                <div className="p-5 bg-[#142C47] rounded-2xl border border-[#2C5A8F] space-y-1 text-center">
                  <span className="text-2xl font-black text-cyan-400 block">1 kg Waste = 0.07 kg CH4</span>
                  <strong className="text-xs text-white block">Pencegahan Gas Metana</strong>
                  <p className="text-[10px] text-slate-300">Gas metana berpotensi pemanasan 28x CO2.</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 4: Tentang Kami & Ekosistem 25+ Mitra */}
        {activeTab === 'TENTANG_KAMI' && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xl font-black text-[#1B3A5C]">
                Jejaring 25+ Mitra Ekosistem Pangan Surabaya
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Didukung oleh kolaborasi restoran, hotel, bakery, panti asuhan, dan armada relawan peduli lingkungan di Kota Surabaya:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {[
                  { name: 'Warung Bakso Pak Kumis', type: 'Mitra Restoran', area: 'Gubeng' },
                  { name: 'Rotiboy Bakery Surabaya', type: 'Mitra Bakery', area: 'Tunjungan' },
                  { name: 'Dapur Catering Bu Rudy', type: 'Mitra Katering', area: 'Dharmahusada' },
                  { name: 'Hotel Majapahit Surabaya', type: 'Mitra Hotel', area: 'Embong Malang' },
                  { name: 'Panti Asuhan Kasih Ibu', type: 'Yayasan Sosial', area: 'Wonokromo' },
                  { name: 'Panti Werdha Lansia', type: 'Panti Lansia', area: 'Rungkut' },
                  { name: 'Shelter Dhuafa Mandiri', type: 'Shelter Komunitas', area: 'Genteng' },
                  { name: 'Garda Pangan Surabaya', type: 'Relawan Penyelamat', area: 'Surabaya Raya' },
                  { name: 'Sinergi Food Rescue', type: 'Armada Komunitas', area: 'Jawa Timur' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-[#1B3A5C]">{item.name}</h4>
                      <span className="text-[10px] text-amber-700 font-bold">{item.type}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">📍 {item.area}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center font-bold text-xs text-amber-900">
                ✨ Dan lebih dari 20+ mitra resto & lembaga panti lainnya di seluruh wilayah Surabaya.
              </div>
            </Card>
          </div>
        )}

        {/* Tab 5: FAQ & Bantuan */}
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
                  💬 Hubungi Helpdesk WhatsApp ➔
                </Button>
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
