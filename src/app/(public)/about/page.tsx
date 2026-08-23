'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardBody } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Ketua Tim / Full-Stack Engineer',
      role: 'Lead Developer & Architect',
      bio: 'Mengembangkan arsitektur Next.js 14, integrasi Prisma ORM, dan pengoptimalan algoritma Smart Matching.',
      image: null,
    },
    {
      name: 'UI/UX & Product Designer',
      role: 'Design System & Frontend Lead',
      bio: 'Merancang sistem antarmuka berbasis Plus Jakarta Sans, aksesibilitas kontras tinggi, dan alur transaksi intuitif.',
      image: null,
    },
    {
      name: 'Backend & Data Analyst',
      role: 'Impact Analytics & Security',
      bio: 'Mengelola kalkulasi emisi CO2e, verifikasi SOP keamanan pangan BPOM, serta keamanan NextAuth & RBAC.',
      image: null,
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
              <span className="text-xs font-extrabold text-[#D4A843] uppercase tracking-widest">
                Infinitera 2.0 Team
              </span>
              <h2 className="text-3xl font-extrabold text-[#1B3A5C]">Tim Dibalik Replate</h2>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Para talenta muda di balik pengembangan arsitektur, desain UI/UX, dan algoritma platform Replate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, idx) => (
                <Card key={idx} className="border-slate-200 p-6 text-center space-y-4 hover:shadow-md transition-all">
                  <CardBody className="space-y-3">
                    <Avatar name={member.name} size="xl" className="mx-auto border-2 border-[#1B3A5C]" />
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1B3A5C]">{member.name}</h4>
                      <p className="text-[11px] font-bold text-[#D4A843] uppercase tracking-wider mt-0.5">
                        {member.role}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{member.bio}</p>
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
