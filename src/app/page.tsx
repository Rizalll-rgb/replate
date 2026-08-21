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
    fetch('/api/surplus')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setFoods(data.data);
        }
      })
      .catch(() => {});
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
