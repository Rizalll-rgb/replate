'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Utensils, Croissant, CupSoda, Vegan, Apple, Package, Leaf, MapPin, Star } from 'lucide-react';

export const LoggedInHome: React.FC = () => {
  const nearbyFoods = [
    {
      id: 1,
      title: 'Nasi Box Ayam',
      provider: 'Catering ABC',
      rating: 4.8,
      price: 10000,
      originalPrice: 25000,
      distance: '1.2 km',
      time: '17:00-19:00',
      badge: 'Pickup hari ini',
    },
    {
      id: 2,
      title: 'Roti Croissant',
      provider: 'Bakery House',
      rating: 4.7,
      price: 8000,
      originalPrice: 16000,
      distance: '1.5 km',
      time: '17:00-20:00',
      badge: 'Pickup hari ini',
    },
    {
      id: 3,
      title: 'Sayur Mix',
      provider: 'Tani Segar',
      rating: 4.6,
      price: 5000,
      originalPrice: 12000,
      distance: '2.1 km',
      time: '16:00-19:00',
      badge: 'Pickup hari ini',
    },
    {
      id: 4,
      title: 'Buah Potong',
      provider: 'Fresh Fruits',
      rating: 4.9,
      price: 0,
      originalPrice: 15000,
      distance: '2.6 km',
      time: '16:00-18:00',
      badge: 'Gratis',
    },
  ];

  const categories = [
    { name: 'Makanan', icon: <Utensils /> },
    { name: 'Bakery', icon: <Croissant /> },
    { name: 'Minuman', icon: <CupSoda /> },
    { name: 'Sayur', icon: <Vegan /> },
    { name: 'Buah', icon: <Apple /> },
    { name: 'Lainnya', icon: <Package /> },
  ];

  return (
    <div className="flex flex-col bg-[#F9FAFB] min-h-screen">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-br from-[#F0F8F6] to-[#FDFDFD] py-16 lg:py-24 overflow-hidden relative border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 text-[#1B3A5C] font-extrabold text-[10px] tracking-widest uppercase mb-2">
                <Leaf className="w-5 h-5 text-emerald-600" /> FOOD RESCUE PLATFORM
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-[#1B3A5C] leading-tight tracking-tight">
                Selamatkan Makanan.<br />
                Bantu Sesama.
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-lg leading-relaxed">
                Makanan surplus yang masih layak konsumsi kini bisa kamu beli dengan harga terjangkau atau disalurkan kepada yang membutuhkan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/dashboard/consumer">
                  <Button className="w-full sm:w-auto bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md">
                    Explore Makanan
                  </Button>
                </Link>
                <Link href="/dashboard/provider">
                  <Button variant="outline" className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-[#1B3A5C] border-2 border-[#1B3A5C] hover:bg-[#1B3A5C]/5">
                    Donasikan Makanan
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content (Dashed Placeholder) */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-lg aspect-[4/3] bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-center">
                <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                  <span className="text-slate-400 font-extrabold tracking-widest uppercase text-sm">
                    REPLATE • FOOD RESCUE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Makanan Terdekat Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1B3A5C] tracking-tight">Makanan Terdekat</h2>
            <p className="text-slate-500 text-sm mt-2">Temukan surplus food di sekitar kamu.</p>
          </div>
          <Link href="/dashboard/consumer">
            <Button variant="outline" className="bg-white border-slate-200 text-slate-800 font-bold hover:bg-slate-50 rounded-xl px-5">
              Lihat semua 
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nearbyFoods.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
              {/* Image Placeholder */}
              <div className="w-full aspect-[4/3] bg-[#F1F5F9] rounded-2xl flex flex-col items-center justify-center relative mb-4">
                <span className="absolute top-3 left-3 bg-[#FFF9E6] text-[#D4A843] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#D4A843]/20">
                  {item.badge}
                </span>
                <span className="text-slate-400 font-black tracking-widest uppercase text-sm">
                  FOOD
                </span>
              </div>
              
              {/* Details */}
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-lg">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  {item.provider} • <Star className="w-3 h-3 text-[#D4A843] fill-[#D4A843]" /> {item.rating}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`font-black text-xl ${item.price === 0 ? 'text-[#1B3A5C]' : 'text-[#1B3A5C]'}`}>
                    {item.price === 0 ? 'Gratis' : `Rp${item.price.toLocaleString('id-ID')}`}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-medium">
                    Rp{item.originalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-red-400"><MapPin className="w-3 h-3" /></span> {item.distance} • Waktu: {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Kategori Section */}
      <section className="pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-3xl font-extrabold text-[#1B3A5C] tracking-tight mb-2">Kategori</h2>
        <p className="text-slate-500 text-sm mb-8">Pilih makanan sesuai kebutuhan.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-2xl py-6 px-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md cursor-pointer transition-all hover:-translate-y-1">
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-bold text-slate-800 text-sm">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Impact Banner Section */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#1B3A5C] rounded-3xl p-8 lg:p-12 text-white shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-10 max-w-2xl leading-tight">
              Setiap makanan yang diselamatkan berarti lebih sedikit yang terbuang.
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold block text-[#D4A843]">154.832</span>
                <span className="text-slate-300 font-medium text-sm mt-1 block">Meals saved</span>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold block text-[#D4A843]">89.210</span>
                <span className="text-slate-300 font-medium text-sm mt-1 block">People helped</span>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold block text-[#D4A843]">324.560 kg</span>
                <span className="text-slate-300 font-medium text-sm mt-1 block">Food waste prevented</span>
              </div>
            </div>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#D4A843]/10 rounded-full blur-3xl translate-y-1/2" />
        </div>
      </section>
    </div>
  );
};
