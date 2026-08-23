'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ImpactCounter } from '@/components/landing/ImpactCounter';
import { SDGSection } from '@/components/landing/SDGSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const defaultMockFoods = [
      {
        id: 'food-demo-1',
        title: 'Nasi Paket Ayam Bakar Specialty Pak Kumis',
        providerName: 'Warung Bakso Pak Kumis Surabaya',
        originalPrice: 25000,
        discountPrice: 10000,
        quantity: '45 Porsi',
        pickupTime: 'Hari ini 21:00 WIB',
        distance: '1.2 km',
        category: 'MAKANAN_BERAT',
        isFree: false,
        matchScore: 98,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'food-demo-2',
        title: 'Paket Rice Bowl Ayam Geprek Steril',
        providerName: 'Warung Bakso Pak Kumis Surabaya',
        originalPrice: 20000,
        discountPrice: 0,
        quantity: '40 Porsi',
        pickupTime: 'Hari ini 20:30 WIB',
        distance: '2.5 km',
        category: 'MAKANAN_BERAT',
        isFree: true,
        matchScore: 96,
        imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'food-demo-3',
        title: 'Bakso Sapi Urat Super & Kuah Steril',
        providerName: 'Warung Bakso Pak Kumis Surabaya',
        originalPrice: 18000,
        discountPrice: 5000,
        quantity: '15 Porsi',
        pickupTime: 'Hari ini 21:30 WIB',
        distance: '0.8 km',
        category: 'MAKANAN_BERAT',
        isFree: false,
        matchScore: 94,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60',
      },
    ];

    try {
      const localStr = localStorage.getItem('replate_local_surplus');
      const localItems = localStr ? JSON.parse(localStr) : [];
      const mappedLocal = localItems.map((item: any, idx: number) => ({
        id: item.id || `local-surplus-${idx}`,
        title: item.name || item.title || 'Surplus Makanan Steril',
        providerName: item.providerName || item.storeName || 'Warung Bakso Pak Kumis',
        originalPrice: item.originalPrice ? Number(item.originalPrice) : 25000,
        discountPrice: item.discountPrice !== undefined ? Number(item.discountPrice) : (item.type === 'DONATION' ? 0 : 8000),
        quantity: item.quantity ? `${item.quantity} Porsi` : '10 Porsi',
        pickupTime: item.pickupTime || 'Hari ini 21:00 WIB',
        distance: item.distance || '1.0 km',
        category: item.category || 'MAKANAN_BERAT',
        isFree: item.discountPrice === 0 || item.type === 'DONATION' || item.isFree,
        matchScore: item.matchScore || 96,
        imageUrl: item.photo || item.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
      }));

      fetch('/api/surplus')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setFoods([...mappedLocal, ...data.data]);
          } else {
            setFoods([...mappedLocal, ...defaultMockFoods]);
          }
        })
        .catch(() => {
          setFoods([...mappedLocal, ...defaultMockFoods]);
        });
    } catch (_) {
      setFoods(defaultMockFoods);
    }
  }, []);

  const handleClaim = (id: string) => {
    router.push(`/dashboard/consumer`);
  };

  const handleDetail = (id: string) => {
    const item = foods.find((f) => f.id === id);
    if (item) {
      setSelectedFood(item);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <HowItWorks />

        {/* Live Available Surplus Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#D4A843] uppercase tracking-widest">
                Surplus Makanan Aktif Surabaya
              </span>
              <h2 className="text-3xl font-black text-[#1B3A5C] mt-1">Jelajah Penyelamatan Makanan</h2>
            </div>
            <span className="text-xs text-[#6C757D] font-medium">
              ⚡ Terhubung langsung dengan Smart Matching System
            </span>
          </div>

          <FoodGrid foods={foods} onClaim={handleClaim} onDetail={handleDetail} />
        </section>

        <ImpactCounter />
        <SDGSection />
        <Testimonials />
      </main>

      <Footer />

      <FoodDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        food={selectedFood}
        onClaim={handleClaim}
      />
    </div>
  );
}
