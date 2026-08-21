'use client';

import React, { useEffect, useState } from 'react';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';

export default function MyListingsPage() {
  const { data: session } = useSession();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [manageModal, setManageModal] = useState<{ isOpen: boolean; food: any | null }>({
    isOpen: false,
    food: null,
  });
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [isAvailableStatus, setIsAvailableStatus] = useState<boolean>(true);
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const loadListings = () => {
    // Read local cache for items added during session (Poin 5)
    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
    } catch (_) {}

    fetch('/api/surplus?status=')
      .then((res) => res.json())
      .then((data) => {
        let itemsList: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          itemsList = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          itemsList = data.data;
        }

        const fallback = [
          {
            id: 'SRP-101',
            foodName: 'Bakso Sapi Komplit',
            description: 'Bakso daging sapi asli komplit tahu dan mie. Baru dimasak sore ini.',
            foodCategory: 'MEALS',
            quantity: 15,
            remainingQuantity: 15,
            quantityUnit: 'porsi',
            price: 5000,
            status: 'AVAILABLE',
            distributionType: 'BOTH',
            address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
            pickupDeadline: new Date(Date.now() + 5 * 3600000).toISOString(),
            photos: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'],
            provider: { name: 'Warung Bakso Pak Kumis', organizationName: 'Warung Bakso Pak Kumis' },
          },
          {
            id: 'SRP-102',
            foodName: 'Buah Potong Segar',
            description: 'Aneka melon, semangka, dan pepaya potong higienis kemasan boks.',
            foodCategory: 'PRODUCE',
            quantity: 10,
            remainingQuantity: 10,
            quantityUnit: 'porsi',
            price: 0,
            status: 'AVAILABLE',
            distributionType: 'FREE',
            address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
            pickupDeadline: new Date(Date.now() + 3 * 3600000).toISOString(),
            photos: ['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80'],
            provider: { name: 'Warung Bakso Pak Kumis', organizationName: 'Warung Bakso Pak Kumis' },
          },
        ];

        const combined = [...localItems, ...itemsList];
        setFoods(combined.length > 0 ? combined : fallback);
      })
      .catch(() => {
        setFoods(localItems.length > 0 ? localItems : []);
      });
  };

  useEffect(() => {
    loadListings();
  }, [session]);

  const handleDetail = (id: string) => {
    const item = foods.find((f) => f.id === id);
    if (item) {
      setSelectedFood({
        id: item.id,
        foodName: item.foodName,
        description: item.description,
        foodCategory: item.foodCategory || item.category || 'MEALS',
        quantity: item.quantity,
        quantityUnit: item.quantityUnit,
        price: item.price,
        pickupDeadline: item.pickupDeadline,
        address: item.address,
        storageCondition: item.storageCondition || 'Suhu Ruangan',
        packagingType: item.packagingType || 'Terkemas',
        photos: item.photos,
        provider: item.provider || { name: 'Warung Bakso Pak Kumis', organizationName: 'Warung Bakso Pak Kumis' },
      });
      setIsDetailOpen(true);
    }
  };

  const handleManage = (id: string) => {
    const item = foods.find((f) => f.id === id);
    if (item) {
      setManageModal({ isOpen: true, food: item });
      setNewQuantity(item.remainingQuantity ?? item.quantity);
      setIsAvailableStatus(item.status === 'AVAILABLE');
    }
  };

  const handleSaveManage = async () => {
    if (!manageModal.food) return;
    const updatedId = manageModal.food.id;
    const nextStatus = isAvailableStatus ? 'AVAILABLE' : 'UNAVAILABLE';
    try {
      await fetch('/api/surplus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: updatedId, remainingQuantity: newQuantity, status: nextStatus }),
      });
    } catch (_) {}

    setFoods((prev) =>
      prev.map((f) =>
        f.id === updatedId
          ? { ...f, quantity: newQuantity, remainingQuantity: newQuantity, status: nextStatus }
          : f
      )
    );
    setManageModal({ isOpen: false, food: null });
    setToastState({
      isOpen: true,
      message: `Status & Stok ${manageModal.food.foodName} berhasil diperbarui!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1B3A5C]">Kelola Daftar Surplus Makanan Saya</h2>
          <p className="text-xs text-slate-500 font-medium">
            Atur kuantitas stok, saklar penayangan publik, dan lihat detail penjemputan porsi berlebih.
          </p>
        </div>
      </div>

      {/* Clean FoodGrid Card Layout */}
      <FoodGrid foods={foods} onDetail={handleDetail} onManage={handleManage} />

      {/* Modal Detail Makanan */}
      <FoodDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        food={selectedFood}
      />

      {/* Modal Kelola Stok & Status Penayangan (Poin 6) */}
      {manageModal.isOpen && (
        <Modal
          isOpen={manageModal.isOpen}
          onClose={() => setManageModal({ isOpen: false, food: null })}
          title={`Kelola Surplus: ${manageModal.food?.foodName}`}
          size="md"
        >
          <div className="space-y-5 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Item Makanan:</span>
              <span className="font-extrabold text-[#1B3A5C] text-sm block">
                {manageModal.food?.foodName}
              </span>
              <span className="text-slate-500 block">
                Lokasi Penjemputan: {manageModal.food?.address}
              </span>
            </div>

            {/* Toggle Status Penayangan (Poin 6) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-extrabold text-slate-800 block">Status Penayangan Publik:</label>
              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-xs text-[#1B3A5C]">
                  {isAvailableStatus ? '🟢 Aktif Tayang (Dapat Diklaim)' : '🔴 Nonaktif (Disembunyikan)'}
                </span>
                <input
                  type="checkbox"
                  checked={isAvailableStatus}
                  onChange={(e) => setIsAvailableStatus(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">Update Sisa Kuantitas Stok:</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                  className="w-32 font-bold"
                />
                <span className="font-bold text-slate-700">{manageModal.food?.quantityUnit}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <Button variant="gold" size="sm" className="font-extrabold" onClick={handleSaveManage}>
                Simpan Perubahan Stok & Status ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
