'use client';

import React, { useEffect, useState } from 'react';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { useRouter } from 'next/navigation';

export default function ConsumerBrowsePage() {
  const router = useRouter();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/surplus')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.items)) {
          setFoods(data.data.items);
        } else if (data.success && Array.isArray(data.data)) {
          setFoods(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleClaim = async (id: string) => {
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: id, quantity: 1 }),
      });
      const result = await res.json();
      if (result.success) {
        alert('🎉 Berhasil mengklaim makanan! QR Code telah diterbitkan.');
        router.push('/dashboard/consumer/my-claims');
      } else {
        alert(result.error || 'Gagal mengklaim makanan.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Jelajah Makanan Surplus (Rescue Sale)</h2>
        <p className="text-xs text-[#6C757D]">Dapatkan makanan lezat dengan harga sangat terjangkau di sekitar Surabaya.</p>
      </div>

      <FoodGrid
        foods={foods}
        onClaim={handleClaim}
        onDetail={(id) => {
          const item = foods.find((f) => f.id === id);
          if (item) {
            setSelectedFood(item);
            setIsModalOpen(true);
          }
        }}
      />

      <FoodDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        food={selectedFood}
        onClaim={handleClaim}
      />
    </div>
  );
}
