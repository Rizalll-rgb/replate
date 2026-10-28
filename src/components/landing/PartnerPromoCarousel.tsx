'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Award,
  Megaphone,
  Store,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface PromoBanner {
  id: string;
  title: string;
  tagline: string;
  providerName: string;
  badge: 'BUSINESS_PARTNER' | 'GROWTH_PARTNER' | 'PAY_PER_USE';
  imageUrl: string;
  linkUrl: string;
  discountText: string;
}

const DEFAULT_PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'prm-1',
    title: 'Weekend Flash Sale: Aneka Nasi Kotak & Lauk Nusantara',
    tagline: 'Diskon hingga 60% sebelum jam tutup • Standar higienis BPOM & kemasan kedap udara',
    providerName: 'Warung Bakso & Resto Pak Kumis',
    badge: 'BUSINESS_PARTNER',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/explore',
    discountText: 'DISKON 60% OFF',
  },
  {
    id: 'prm-2',
    title: 'Surplus Roti Tawar Gandum, Pastry Butter & Croissant',
    tagline: 'Baru dipanggang hari ini • Selamatkan makanan lezat dengan harga mulai Rp 6.000',
    providerName: 'Rotiboy Bakery & Bread House Surabaya',
    badge: 'GROWTH_PARTNER',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/explore',
    discountText: 'MULAI RP 6.000',
  },
  {
    id: 'prm-3',
    title: 'Buffet Nusantara Hotel Bintang Lima: Porsi Donasi & Rescue Sale',
    tagline: 'Kualitas hotel berbintang • Didukung armada steril boks termal Replate',
    providerName: 'Hotel Majapahit Surabaya',
    badge: 'BUSINESS_PARTNER',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/explore',
    discountText: 'DONASI & DISKON 70%',
  },
];

export const PartnerPromoCarousel: React.FC = () => {
  const [banners, setBanners] = useState<PromoBanner[]>(DEFAULT_PROMO_BANNERS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load custom banners from provider services in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('replate_promo_banners');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customBanners: PromoBanner[] = parsed
            .filter((item: any) => item.status === 'AKTIF_TAYANG' || item.status === 'MENUNGGU_MODERASI_ADMIN')
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              tagline: 'Promo Spesial Mitra Terverifikasi Replate • Stok Terbatas',
              providerName: item.providerName || 'Mitra Food Provider',
              badge: 'PAY_PER_USE',
              imageUrl: item.imageUrl || DEFAULT_PROMO_BANNERS[0].imageUrl,
              linkUrl: item.linkUrl || '/explore',
              discountText: 'PROMO MITRA',
            }));
          if (customBanners.length > 0) {
            setBanners([...customBanners, ...DEFAULT_PROMO_BANNERS]);
          }
        }
      }
    } catch (_) {}
  }, []);

  // Auto-rotation every 5 seconds (paused on hover)
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-100 text-[#D4A843]">
            <Megaphone className="w-4 h-4 text-amber-800" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#1B3A5C] flex items-center gap-1.5">
              <span>Partner Promo Banner</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                • Mitra Bisnis &amp; Subscriber Replate
              </span>
            </h3>
          </div>
        </div>

        <Link
          href="/dashboard/provider/services"
          className="text-[11px] font-bold text-[#1B3A5C] hover:text-[#D4A843] transition-colors flex items-center gap-1"
        >
          <span>Pasang Banner Toko Anda (Rp 70.000/7 Hari)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Carousel Banner Slide */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-slate-200 group bg-slate-900"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Image with Dark Gradient Overlay */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between text-white">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#D4A843] text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md">
                {currentBanner.discountText}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-[10px] sm:text-xs flex items-center gap-1 border border-white/20">
                <Store className="w-3.5 h-3.5 text-[#D4A843]" />
                <span>{currentBanner.providerName}</span>
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 hidden sm:inline-block">
              Mitra Terverifikasi Replate
            </span>
          </div>

          {/* Bottom Title, Tagline & CTA */}
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
              {currentBanner.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm max-w-xl">
              {currentBanner.tagline}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Link href={currentBanner.linkUrl}>
                <button
                  type="button"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Lihat Promo Surplus</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <span className="text-[11px] text-slate-300 font-bold hidden sm:inline">
                *Stok penyelamatan terbatas per hari
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer border border-white/20"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer border border-white/20"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Carousel Indicators / Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 right-4 sm:right-6 flex items-center gap-1.5 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-[#D4A843]' : 'w-2 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
