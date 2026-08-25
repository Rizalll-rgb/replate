'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Avatar } from '../ui/Avatar';

interface TestimonialItem {
  name: string;
  role: string;
  foodSaved?: string;
  text: string;
  rating?: number;
  date?: string;
  isVerified?: boolean;
}

export const Testimonials: React.FC = () => {
  const defaultItems: TestimonialItem[] = [
    {
      name: 'Pak Kumis',
      role: 'Owner Warung Bakso Pak Kumis Surabaya',
      foodSaved: 'Surplus 45 Porsi Nasi Paket',
      text: 'Replate membantu restoran kami memanfaatkan sisa porsi harian menjadi nilai tambah dan membantu panti asuhan di sekitar Gubeng secara rutin.',
      rating: 5,
      date: '2 hari lalu',
      isVerified: true,
    },
    {
      name: 'Ibu Margareth',
      role: 'Pengurus Panti Asuhan Kasih Ibu Wonokromo',
      foodSaved: 'Donasi 50 Porsi Makanan Steril',
      text: 'Bantuan makanan steril berkualitas dari Food Rescue sangat membantu kebutuhan nutrisi 45 anak asuh di tempat kami secara teratur.',
      rating: 5,
      date: 'Kemarin',
      isVerified: true,
    },
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa UNESA Ketintang',
      foodSaved: 'Rescue Sale Nasi Ayam Specialty',
      text: 'Fitur Rescue Sale sangat hemat untuk anak kos, dapat makanan lezat berkualitas tinggi dari gerai terpercaya dengan harga sangat terjangkau.',
      rating: 5,
      date: 'Hari ini',
      isVerified: true,
    },
  ];

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(defaultItems);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('replate_verified_testimonials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestimonials([...parsed, ...defaultItems]);
        }
      }
    } catch (_) {}
  }, []);

  return (
    <section className="py-16 bg-[#F8F9FA] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
            KISAH NYATA PENGGUNA TERVERIFIKASI
          </span>
          <h2 className="text-3xl font-black text-[#1B3A5C]">Apa Kata Pengguna Replate?</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Ulasan resmi dari mitra restoran, pengurus panti asuhan, dan konsumen yang telah menyelesaikan penyelamatan makanan surplus di Surabaya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <Card key={idx} className="border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all rounded-3xl flex flex-col justify-between">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(item.rating || 5)}
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                    ✓ Transaksi Terverifikasi
                  </span>
                </div>

                {item.foodSaved && (
                  <span className="text-[11px] font-bold text-slate-600 block bg-slate-50 p-2 rounded-xl border border-slate-100">
                    🍱 {item.foodSaved}
                  </span>
                )}

                <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                  &quot;{item.text}&quot;
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <Avatar name={item.name} size="md" className="border-2 border-[#1B3A5C]/20" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-[#1B3A5C] truncate">{item.name}</h4>
                    <p className="text-[10px] font-bold text-amber-700 truncate">{item.role}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
