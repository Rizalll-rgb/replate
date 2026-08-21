import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardBody } from '@/components/ui/Card';

export default function FAQPage() {
  const faqs = [
    {
      q: 'Apakah semua makanan di Replate terjamin keamanannya?',
      a: 'Ya. Setiap Provider wajib mengisi dan memenuhi 100% dari 8 checklist SOP Rescue Readiness sesuai standar BPOM & WHO sebelum makanan dipublikasikan.',
    },
    {
      q: 'Bagaimana cara pembayaran transaksi Rescue Sale?',
      a: 'Pembayaran dilakukan di luar platform (transfer langsung / tunai saat penjemputan). Replate mencatat status pembayaran dan menerbitkan QR code klaim.',
    },
    {
      q: 'Bagaimana cara kerja Smart Matching Engine?',
      a: 'Sistem secara otomatis menghitung skor kecocokan berdasarkan bobot lokasi, masa kadaluarsa, preferensi kategori, dan reputasi penjemputan.',
    },
    {
      q: 'Apa itu Food Rescue ID?',
      a: 'Kode unik transaksi (format: FB-SBY-YYYYMMDD-XXXX) yang dapat dilacak secara publik oleh siapa saja untuk transparansi status penjemputan.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />
      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#D4A843] uppercase tracking-widest">
            Pertanyaan Umum
          </span>
          <h1 className="text-3xl font-black text-[#1B3A5C]">FAQ Replate</h1>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="bg-white border-[#DEE2E6] p-6">
              <CardBody className="space-y-2">
                <h3 className="text-base font-bold text-[#1B3A5C]">❓ {faq.q}</h3>
                <p className="text-xs text-[#495057] leading-relaxed">{faq.a}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
