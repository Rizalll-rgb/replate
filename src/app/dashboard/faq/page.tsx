'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function DashboardFAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana Replate menjamin keamanan makanan surplus?',
      a: 'Setiap makanan surplus yang dipublikasikan oleh Food Provider wajib memenuhi 8 Poin Checklist SOP Rescue Readiness BPOM & WHO (Termasuk batas waktu pickup, kondisi penyimpanan suhu, dan keutuhan kemasan).',
    },
    {
      q: 'Apa perbedaan antara Rescue Sale dan Food Rescue (Gratis)?',
      a: 'Rescue Sale adalah makanan surplus yang dijual dengan harga diskon (hingga 70%) untuk masyarakat / anak kos. Sedangkan Food Rescue adalah makanan gratis yang khusus disalurkan untuk panti asuhan, yayasan sosial, atau warga kurang mampu.',
    },
    {
      q: 'Bagaimana alur pengambilan makanan untuk Yayasan/Panti Asuhan?',
      a: 'Yayasan dapat memilih 2 metode pengambilan: (1) Ambil Sendiri (Self-Pickup) langsung ke lokasi provider, atau (2) Diantar oleh armada Rescue Partner / Kurir Komunitas Replate.',
    },
    {
      q: 'Bagaimana cara mengunduh Laporan CSR dan Sertifikat Penghargaan?',
      a: 'Food Provider dan Rescue Partner dapat mengakses menu Laporan Dampak (/dashboard/provider/impact) untuk langsung mencetak Sertifikat Emas Penyelamat Pangan & Laporan CSR dalam format PDF resmi 1 halaman.',
    },
    {
      q: 'Apakah pendaftaran platform Replate dipungut biaya?',
      a: 'Pendaftaran Replate 100% GRATIS untuk seluruh role (Food Provider, Konsumen, Rescue Partner, Yayasan). Platform ini berkomitmen mendukung SDG 12.3 (Food Waste Reduction) & SDG 2 (Zero Hunger).',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* High Contrast Header Banner (Poin 11) */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-3">
        <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md inline-block shadow-xs">
          Pusat Bantuan & FAQ
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Pertanyaan yang Sering Diajukan</h1>
        <p className="text-xs text-slate-100 font-medium leading-relaxed">
          Temukan jawaban cepat seputar standar keamanan BPOM, alur pengiriman, sertifikat CSR, dan panduan penggunaan platform Replate.
        </p>
        <div className="pt-2">
          <Input
            placeholder="Cari pertanyaan atau topik bantuan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white text-slate-900 border-none text-xs"
          />
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => (
          <Card key={idx} className="border-slate-200 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-4 text-left flex items-center justify-between font-extrabold text-sm text-[#1B3A5C] hover:bg-slate-50 transition-colors"
            >
              <span>{faq.q}</span>
              <span className="text-lg text-slate-400 font-mono">{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
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
            className="px-4 py-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Hubungi Live Helpdesk ➔
          </a>
        </div>
      </Card>
    </div>
  );
}
