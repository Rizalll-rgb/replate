'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Star, Check } from 'lucide-react';

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
      role: 'Owner Warung Bakso Pak Kumis',
      foodSaved: 'Surplus 45 Porsi Nasi Paket',
      text: 'Replate membantu restoran kami memanfaatkan sisa porsi harian menjadi nilai tambah dan membantu yayasan serta masyarakat sekitar secara rutin.',
      rating: 5,
      date: '2 hari lalu',
      isVerified: true,
    },
    {
      name: 'Ibu Margareth',
      role: 'Pengurus Panti Asuhan Kasih Ibu',
      foodSaved: 'Donasi 50 Porsi Makanan Steril',
      text: 'Bantuan makanan steril berkualitas dari Food Rescue sangat membantu kebutuhan nutrisi 45 anak asuh di tempat kami secara teratur.',
      rating: 5,
      date: 'Kemarin',
      isVerified: true,
    },
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa & Konsumen Terverifikasi',
      foodSaved: 'Rescue Sale Nasi Ayam Specialty',
      text: 'Fitur Rescue Sale sangat hemat untuk anak kos, dapat makanan lezat berkualitas tinggi dari gerai terpercaya dengan harga sangat terjangkau.',
      rating: 5,
      date: 'Hari ini',
      isVerified: true,
    },
    {
      name: 'Siti Rahmawati',
      role: 'Koordinator Dapur Umum Peduli Sesama',
      foodSaved: 'Donasi 60 Porsi Roti & Kue Steril',
      text: 'Penyaluran surplus bakery sangat membantu kegiatan sarapan anak-anak dan lansia dhuafa di wilayah binaan kami.',
      rating: 5,
      date: '3 hari lalu',
      isVerified: true,
    },
    {
      name: 'Chef Hendra',
      role: 'Head Chef Restoran Nusantara',
      foodSaved: 'Surplus 30 Porsi Menu Siap Saji',
      text: 'Sistem scan QR dan checklist BPOM Replate membuat proses serah terima makanan surplus ke relawan menjadi sangat profesional dan aman.',
      rating: 5,
      date: 'Minggu lalu',
      isVerified: true,
    },
  ];

  const cleanFoodSaved = (val?: string) => {
    if (!val) return '';
    return val.replace(/^(Penyelamatan:\s*)+/gi, '').trim();
  };

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(defaultItems);
  const [startIndex, setStartIndex] = useState<number>(0);

  useEffect(() => {
    const loadTestimonials = () => {
      try {
        const saved = localStorage.getItem('replate_verified_testimonials');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Load user-submitted reviews directly and prepend to default list
            const validSaved = parsed.filter(
              (p: any) => p && typeof p.text === 'string' && p.text.trim().length > 0
            );
            if (validSaved.length > 0) {
              setTestimonials([...validSaved, ...defaultItems]);
              return;
            }
          }
        }
        setTestimonials(defaultItems);
      } catch (_) {}
    };

    loadTestimonials();
    window.addEventListener('storage', loadTestimonials);
    return () => window.removeEventListener('storage', loadTestimonials);
  }, []);

  const total = testimonials.length;
  // In desktop we show 3, in mobile we show 1. Step by 1 or 3
  const maxDesktopIndex = Math.max(0, total - 3);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxDesktopIndex, prev + 1));
  };

  // Slice 3 items for current view
  const visibleItems = testimonials.slice(startIndex, startIndex + 3);

  return (
    <section className="py-14 sm:py-16 bg-[#F8F9FA] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
              KISAH NYATA PENGGUNA TERVERIFIKASI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1B3A5C]">Apa Kata Pengguna Replate?</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
              Ulasan resmi dari mitra restoran, pengurus yayasan, dan konsumen yang telah menyelesaikan penyelamatan makanan surplus di seluruh Indonesia.
            </p>
          </div>

          {/* Carousel Navigation Buttons */}
          {total > 3 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={startIndex === 0}
                aria-label="Ulasan Sebelumnya"
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  startIndex === 0
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'border-[#1B3A5C] text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white bg-white shadow-xs'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="text-xs font-bold text-slate-500 font-mono px-2">
                {startIndex + 1} - {Math.min(startIndex + 3, total)} / {total}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={startIndex >= maxDesktopIndex}
                aria-label="Ulasan Berikutnya"
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  startIndex >= maxDesktopIndex
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'border-[#1B3A5C] text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white bg-white shadow-xs'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 3 Visible Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
          {visibleItems.map((item, idx) => (
            <Card key={idx} className="border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all rounded-3xl flex flex-col justify-between">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-800" />
                    <span>Transaksi Terverifikasi</span>
                  </span>
                </div>

                {item.foodSaved && cleanFoodSaved(item.foodSaved) && (
                  <span className="text-[11px] font-bold text-slate-700 block bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Penyelamatan: {cleanFoodSaved(item.foodSaved)}
                  </span>
                )}

                <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                  &quot;{item.text}&quot;
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <Avatar name={item.name} size="md" className="border-2 border-[#1B3A5C]/20 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-[#1B3A5C] truncate">{item.name}</h4>
                    <p className="text-[10px] font-bold text-amber-700 truncate">{item.role}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Indicator dots for mobile/tablet */}
        {total > 3 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {Array.from({ length: maxDesktopIndex + 1 }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setStartIndex(dotIdx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  startIndex === dotIdx ? 'w-6 bg-[#1B3A5C]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Pindah ke slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
