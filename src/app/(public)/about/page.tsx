'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardBody } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Rizal Akbar Kurniawan',
      nim: 'NIM: 23081494188 (UNESA)',
      role: 'Lead Full Stack Developer & Proposal Admin',
      bio: 'Mengembangkan arsitektur Next.js 14 App Router, integrasi database, algoritma Smart Matching 2.0, serta pengerjaan proposal teknis.',
    },
    {
      name: 'Fabio Daffa Airlangga',
      nim: 'NIM Menyusul (PENS)',
      role: 'UI/UX Designer & Full Stack Developer',
      bio: 'Merancang sistem antarmuka kontras tinggi, alur transaksi intuitif, serta mendukung pengerjaan pengembangan frontend & backend.',
    },
    {
      name: 'Tina Nur Fadillah',
      nim: 'NIM Menyusul (UNESA)',
      role: 'Penulis Proposal & Konseptor Platform',
      bio: 'Merumuskan konsep kebaruan inovasi SDGs, riset urgensi dampak emisi food waste, serta penyusunan dokumen proposal kompetisi.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />

      <main className="flex-1 py-16 space-y-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] text-xs font-extrabold uppercase tracking-wider">
            Tentang Replate
          </span>
          <h1 className="text-4xl font-extrabold text-[#1B3A5C]">Misi Zero Waste & Ketahanan Pangan</h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Replate lahir sebagai solusi digital inovatif untuk menangani timbulan food waste di perkotaan Indonesia, khususnya di kota metropolitan Surabaya, melalui redistribusi cerdas dan transparan.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white border-slate-200 p-8 space-y-4 shadow-sm">
            <h3 className="text-xl font-extrabold text-[#1B3A5C]">Visi Utama</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Membangun jembatan digital yang menghubungkan penyedia makanan berlebih (Food Provider) secara efisien, terukur, dan transparan dengan penerima manfaat yang membutuhkan, sehingga tidak ada makanan layak konsumsi yang terbuang ke tempat pembuangan akhir.
            </p>
          </Card>

          <Card className="bg-white border-slate-200 p-8 space-y-4 shadow-sm">
            <h3 className="text-xl font-extrabold text-[#1B3A5C]">Inovasi Unggulan Platform</h3>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-2.5 font-medium leading-relaxed">
              <li><strong>Smart Matching Engine 2.0:</strong> Kecocokan multi-kriteria berbasis jarak GPS, kategori gizi, urgensi kadaluarsa, & kapasitas panti.</li>
              <li><strong>SOP Kelayakan Pangan BPOM RI:</strong> Checklist kelayakan 8-poin suhu simpan, integritas kemasan, & Self-Declare BPOM/Halal.</li>
              <li><strong>Surat Jalan Digital No-Login WA:</strong> Rute pengantaran armada toko via WhatsApp tanpa perlu buat akun (`/driver-manifest/[id]`).</li>
              <li><strong>Verifikasi QR Code & OTP Anti-Fraud:</strong> Sistem pindaian payload terenkripsi & konfirmasi serah terima dua arah.</li>
              <li><strong>Kalkulator Dampak Emisi CO2e & CH4:</strong> Perhitungan otomatis pencegahan emisi metana TPA sesuai metodologi IPCC.</li>
            </ul>
          </Card>
        </div>

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
                <Card key={idx} className="border-slate-200 p-6 text-center space-y-4 hover:shadow-md transition-all bg-white">
                  <CardBody className="space-y-3">
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
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
