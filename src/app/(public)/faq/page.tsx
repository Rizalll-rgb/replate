'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana Replate menjamin keamanan makanan surplus?',
      a: 'Setiap makanan surplus yang dipublikasikan oleh Food Provider wajib memenuhi 8 Poin Checklist SOP Rescue Readiness BPOM & WHO (Termasuk batas waktu pickup realistis, suhu penyimpanan higienis, dan kemasan utuh). Makanan yang sudah berbau atau melewati expiry date otomatis terblokir.',
    },
    {
      q: 'Apa perbedaan antara Rescue Sale dan Food Rescue (Gratis)?',
      a: 'Rescue Sale adalah makanan surplus berbayar murah yang dijual dengan harga diskon (hingga 70%) untuk konsumen umum / anak kos dengan skema infaq 5%. Sedangkan Food Rescue Gratis (Rp 0) adalah makanan donasi sukarela yang diprioritaskan oleh Smart Matching Engine untuk disalurkan ke panti asuhan, yayasan sosial, atau warga kurang mampu.',
    },
    {
      q: 'Bagaimana alur pengiriman makanan untuk Yayasan / Panti Asuhan?',
      a: 'Yayasan dapat memilih 3 metode logistik penjemputan: (1) Ambil Sendiri (Self-Pickup) di toko, (2) Diantar oleh kurir relawan Rescue Partner, atau (3) Diantar langsung oleh Armada Toko Provider via Web Surat Jalan Digital No-Login WhatsApp (/driver-manifest/[id]).',
    },
    {
      q: 'Bagaimana cara mengunduh Laporan CSR dan Sertifikat Penghargaan?',
      a: 'Food Provider & Rescue Partner dapat mengakses menu Laporan Dampak (/dashboard/provider/impact) untuk memantau grafik pengurangan emisi CO2 real-time dan langsung mencetak Sertifikat Penyelamat Pangan resmi serta Laporan Keberlanjutan CSR 1 halaman clean.',
    },
    {
      q: 'Apakah pendaftaran platform Replate dipungut biaya?',
      a: 'Pendaftaran Replate 100% GRATIS untuk seluruh role (Food Provider, Konsumen, Rescue Partner, Yayasan). Platform ini berkomitmen penuh mendukung pencapaian 5 Pilar SDGs (SDG 2, SDG 9, SDG 11, SDG 12, dan SDG 13).',
    },
    {
      q: 'Bagaimana alur verifikasi akun Mitra Food Provider baru?',
      a: 'Setelah melakukan pendaftaran online, tim Admin Replate Kota Surabaya akan melakukan verifikasi dokumen legalitas usaha (NIB / Izin Usaha) & audit SOP higienitas dalam 1x24 jam sebelum akun aktif sepenuhnya.',
    },
    {
      q: 'Bagaimana rumus perhitungan pengurangan emisi CO2 di platform?',
      a: 'Setiap 1 Kg makanan surplus yang berhasil diselamatkan dari potensi sampah (food waste) menghemat rata-rata 2.5 Kg emisi CO2 equivalent (berdasarkan metodologi standar FAO & UNEP).',
    },
    {
      q: 'Bagaimana cara kerja verifikasi Scan Kode QR saat penjemputan?',
      a: 'Saat penjemputan fisik porsi makanan di toko provider, penerima donasi atau kurir komunitas cukup menunjukkan Kode QR digital di aplikasi. Provider men-scan Kode QR tersebut untuk mengonfirmasi serah terima fisik secara sah.',
    },
    {
      q: 'Apakah satu akun Provider bisa mengelola banyak cabang di Surabaya?',
      a: 'Ya, Mitra Food Provider dapat mengatur lokasi penjemputan alternatif atau mengelola multi-lokasi outlet di seluruh wilayah Surabaya melalui menu Pengaturan Outlet.',
    },
    {
      q: 'Berapa lama waktu respon tim Helpdesk Replate?',
      a: 'Tim Helpdesk Replate Surabaya siap memberikan dukungan 24/7 dengan waktu respon rata-rata di bawah 15 menit melalui Live Helpdesk aplikasi dan WhatsApp resmi.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 w-full space-y-6">
        {/* Header Banner */}
        <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
              Pusat Bantuan & FAQ
            </span>
            <span className="text-xs text-slate-200 font-semibold">Dokumentasi Bantuan Resmi</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Pertanyaan yang Sering Diajukan</h1>
          <p className="text-xs text-slate-100 font-medium leading-relaxed">
            Temukan jawaban cepat seputar standar BPOM, alur logistik, pencetakan laporan CSR, verifikasi QR code, dan panduan penggunaan platform Replate.
          </p>
          <div className="pt-2">
            <Input
              placeholder="Cari topik bantuan atau pertanyaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white text-slate-900 border-none text-xs font-bold"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => (
            <Card key={idx} className="border-slate-200 shadow-xs overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-extrabold text-sm text-[#1B3A5C] hover:bg-slate-50 transition-colors"
              >
                <span className="pr-4"> {faq.q}</span>
                <span className="text-lg text-slate-400 font-mono shrink-0">{openIndex === idx ? '−' : '+'}</span>
              </button>
              {openIndex === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50 font-medium">
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Support Contact Box */}
        <Card className="bg-amber-50 p-5 border-amber-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-extrabold text-sm text-amber-900">Butuh Bantuan Langsung Tim Replate?</h4>
              <p className="text-xs text-amber-800">Tim Helpdesk Surabaya kami siap membantu Anda 24/7 melalui Live Helpdesk atau WhatsApp.</p>
            </div>
            <a
              href="https://wa.me/628123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Hubungi Live Helpdesk</span>
              <span></span>
            </a>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
