'use client';

import React, { useState } from 'react';
import { FoodForm, FoodFormData } from '@/components/food/FoodForm';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function AddSurplusPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FoodFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/surplus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        alert('🎉 Surplus makanan berhasil ditambahkan dan Smart Matching ter-trigger!');
        router.push('/dashboard/provider/my-listings');
      } else {
        alert(result.error || 'Gagal menambahkan surplus makanan.');
      }
    } catch (e) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Tambah Surplus Makanan Berlebih</h2>
        <p className="text-xs text-[#6C757D]">
          Publikasikan makanan surplus yang layak konsumsi dengan SOP kelayakan BPOM & WHO.
        </p>
      </div>

      <Card className="bg-white p-6 border-[#DEE2E6]">
        <FoodForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
}
