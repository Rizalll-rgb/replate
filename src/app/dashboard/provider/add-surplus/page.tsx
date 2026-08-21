'use client';

import React, { useState } from 'react';
import { FoodForm, FoodFormData } from '@/components/food/FoodForm';
import { Card } from '@/components/ui/Card';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { useRouter } from 'next/navigation';

export default function AddSurplusPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    foodName: string;
    quantity: string;
  }>({
    isOpen: false,
    foodName: '',
    quantity: '',
  });

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
        setSuccessModal({
          isOpen: true,
          foodName: data.foodName,
          quantity: `${data.quantity} ${data.quantityUnit}`,
        });
      } else {
        alert(result.error || 'Gagal menambahkan surplus makanan.');
      }
    } catch {
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

      {/* Custom Replate Authentic Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, foodName: '', quantity: '' })}
        foodName={successModal.foodName}
        quantity={successModal.quantity}
        onViewListings={() => router.push('/dashboard/provider/my-listings')}
      />
    </div>
  );
}
