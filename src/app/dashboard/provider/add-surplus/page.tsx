'use client';

import React, { useState } from 'react';
import { FoodForm, FoodFormData } from '@/components/food/FoodForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PackageIcon } from '@/components/ui/Icon';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { Toast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddSurplusPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    isOpen: false,
    message: '',
    type: 'error',
  });
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
        // Sync real DB ID to local storage cache
        try {
          const local = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
          if (Array.isArray(local) && local.length > 0 && result.data?.id) {
            local[0].id = result.data.id;
            local[0].status = 'AVAILABLE';
            localStorage.setItem('replate_local_surplus', JSON.stringify(local.slice(0, 25)));
          }
        } catch (_) {}

        setSuccessModal({
          isOpen: true,
          foodName: data.foodName,
          quantity: `${data.quantity} ${data.quantityUnit}`,
        });
      } else {
        setToastState({
          isOpen: true,
          message: result.error || 'Gagal menambahkan surplus makanan.',
          type: 'error',
        });
      }
    } catch {
      setToastState({
        isOpen: true,
        message: 'Terjadi kesalahan koneksi saat memproses surplus.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SuperAppLoader
        isOpen={isLoading}
        message="Memvalidasi & Mempublikasikan Surplus Pangan..."
        submessage="Menyinkronkan standar audit BPOM dan notifikasi real-time"
      />
      {/* Sleek Modern Header Card (Compact & Ergonomic - Seragam Antar Modul) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Publikasi Surplus Baru
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Standar Higienitas BPOM & WHO</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              Tambah Surplus Makanan Berlebih
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Publikasikan makanan surplus layak konsumsi untuk donasi panti atau Rescue Sale.
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/provider/my-listings">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PackageIcon size={14} className="text-[#1B3A5C]" />}
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Lihat Katalog
              </Button>
            </Link>
          </div>
        </div>
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

      {/* Toast Alert */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
