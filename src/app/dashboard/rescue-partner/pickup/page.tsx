'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { TruckIcon, CheckIcon } from '@/components/ui/Icon';
import Link from 'next/link';

export default function PickupModulePage() {
  const router = useRouter();
  const [providerName, setProviderName] = useState('');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [shelterName, setShelterName] = useState('');

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

  const handleCreatePickup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!providerName || !foodName || !quantity || !shelterName) {
      setToastState({
        isOpen: true,
        message: 'Mohon lengkapi semua data form penjemputan.',
        type: 'error',
      });
      return;
    }

    setActionLoader({
      isOpen: true,
      message: 'Menerbitkan Tugas Penjemputan Armada...',
      submessage: 'Meneruskan data ke kasir mitra provider & panti asuhan tujuan',
    });

    const claimCode = `RPL-RSC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClaim = {
      id: claimCode,
      code: claimCode,
      claimCode,
      foodName,
      providerName,
      shelterName,
      quantity,
      quantityUnit: 'Porsi',
      status: 'AWAITING_RESCUE_PICKUP',
      deliveryMethod: 'RESCUE_COURIER',
      courierName: 'Relawan Food Rescue',
      courierOrg: 'Food Bank Surabaya',
      address: 'Surabaya',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      try {
        const savedClaimsStr = localStorage.getItem('replate_claims');
        const existingClaims = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
        existingClaims.unshift(newClaim);
        localStorage.setItem('replate_claims', JSON.stringify(existingClaims));

        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: `Tugas penjemputan ${claimCode} berhasil dibuat! Data telah diteruskan ke modul klaim Provider.`,
          type: 'success',
        });

        setTimeout(() => {
          router.push('/dashboard/rescue-partner/active');
        }, 1200);
      } catch (err) {
        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: 'Gagal membuat tugas penjemputan.',
          type: 'error',
        });
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />

      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F]">
        <h1 className="text-2xl font-extrabold tracking-tight">Modul Inisiasi Penjemputan</h1>
        <p className="text-xs text-slate-200 mt-2 font-medium">
          Buat tugas penjemputan (pickup) baru. Data ini akan langsung masuk ke Modul Klaim di sisi Provider (Mitra Toko/Resto) untuk proses serah terima (handover).
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
          <CardTitle className="text-sm font-black text-[#1B3A5C]">
            Formulir Penjemputan Makanan
          </CardTitle>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleCreatePickup} className="space-y-4 text-sm text-slate-700">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs">Nama Provider / Resto Asal</label>
              <Input
                placeholder="Contoh: Hotel Majapahit"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs">Nama Item Makanan</label>
              <Input
                placeholder="Contoh: Nasi Goreng Buffet"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs">Jumlah Porsi</label>
              <Input
                type="number"
                placeholder="Contoh: 30"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs">Tujuan Penyaluran (Panti Asuhan / Shelter)</label>
              <Input
                placeholder="Contoh: Panti Asuhan Kasih Ibu"
                value={shelterName}
                onChange={(e) => setShelterName(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Link href="/dashboard/rescue-partner">
                <Button type="button" variant="outline" size="sm" className="font-bold text-xs cursor-pointer">
                  Batal
                </Button>
              </Link>
              <Button type="submit" variant="gold" size="sm" leftIcon={<TruckIcon size={13} className="text-slate-950" />} className="font-black text-xs shadow-md text-slate-950 cursor-pointer">
                Buat Tugas Penjemputan & Teruskan ke Provider
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
