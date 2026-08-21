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
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetch('/api/surplus')
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

        setFoods(itemsList.length > 0 ? itemsList : fallback);
      })
      .catch(() => {});
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
    }
  };

  const handleSaveManage = async () => {
    if (!manageModal.food) return;
    const updatedId = manageModal.food.id;
    try {
      await fetch('/api/surplus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: updatedId, remainingQuantity: newQuantity }),
      });
    } catch (_) {}

    setFoods((prev) =>
      prev.map((f) => (f.id === updatedId ? { ...f, quantity: newQuantity, remainingQuantity: newQuantity } : f))
    );
    setManageModal({ isOpen: false, food: null });
    setToastState({
      isOpen: true,
      message: `Stok ${manageModal.food.foodName} berhasil diperbarui menjadi ${newQuantity} ${manageModal.food.quantityUnit}!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1B3A5C]">Kelola Daftar Surplus Makanan Saya</h2>
          <p className="text-xs text-slate-500 font-medium">
            Atur kuantitas stok, edit status kelayakan SOP, dan pantau ketersediaan porsi makanan berlebih.
          </p>
        </div>
      </div>

      {/* Restored Clean FoodGrid Card Layout */}
      <FoodGrid foods={foods} onDetail={handleDetail} onManage={handleManage} />

      {/* Modal Detail Makanan */}
      <FoodDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        food={selectedFood}
      />

      {/* Modal Kelola Stok & Status */}
      {manageModal.isOpen && (
        <Modal
          isOpen={manageModal.isOpen}
          onClose={() => setManageModal({ isOpen: false, food: null })}
          title={`Kelola Surplus: ${manageModal.food?.foodName}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Item Makanan:</span>
              <span className="font-extrabold text-[#1B3A5C] text-sm block">
                {manageModal.food?.foodName}
              </span>
              <span className="text-slate-500 block">
                Lokasi Penjemputan: {manageModal.food?.address}
              </span>
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
                Simpan Perubahan Stok ➔
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
