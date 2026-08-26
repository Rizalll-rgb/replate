'use client';

import React, { useEffect, useState } from 'react';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';

import Link from 'next/link';

export default function MyListingsPage() {
  const { data: session } = useSession();
  const [foods, setFoods] = useState<any[]>([]);
  const [activeTabFilter, setActiveTabFilter] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
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
            distributionType: 'SALE',
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

        const normalizedCombined = [...localItems, ...itemsList].map((item) => ({
          ...item,
          category: item.category || item.foodCategory || 'MEALS',
        }));
        setFoods(normalizedCombined.length > 0 ? normalizedCombined : fallback);
      })
      .catch(() => {
        const normalizedLocal = localItems.map((item) => ({
          ...item,
          category: item.category || item.foodCategory || 'MEALS',
        }));
        setFoods(normalizedLocal.length > 0 ? normalizedLocal : []);
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
      setIsAvailableStatus(item.status === 'AVAILABLE' || item.status === 'ACTIVE' || !item.status);
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

    // Update local storage cache
    try {
      const local = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      const updatedLocal = local.map((item: any) =>
        item.id === updatedId ? { ...item, quantity: newQuantity, remainingQuantity: newQuantity, status: nextStatus } : item
      );
      localStorage.setItem('replate_local_surplus', JSON.stringify(updatedLocal));
    } catch (_) {}

    setFoods((prev) =>
      prev.map((f) =>
        f.id === updatedId
          ? { ...f, quantity: newQuantity, remainingQuantity: newQuantity, status: nextStatus }
          : f
      )
    );
    setManageModal({ isOpen: false, food: null });

    const statusLabel = isAvailableStatus ? 'AKTIF TAYANG' : 'NONAKTIF (Disembunyikan dari Publik)';
    setToastState({
      isOpen: true,
      message: `Status ${manageModal.food.foodName} berhasil diubah menjadi ${statusLabel}!`,
      type: isAvailableStatus ? 'success' : 'error',
    });
  };

  const activeFoods = foods.filter((f) => f.status === 'AVAILABLE' || f.status === 'ACTIVE' || !f.status);
  const inactiveFoods = foods.filter((f) => f.status === 'UNAVAILABLE' || f.status === 'INACTIVE');
  const displayedFoods = activeTabFilter === 'ACTIVE' ? activeFoods : inactiveFoods;

  const manageModalFooter = (
    <div className="flex justify-end gap-2 w-full">
      <Button variant="outline" size="sm" onClick={() => setManageModal({ isOpen: false, food: null })}>
        Batal
      </Button>
      <Button variant="gold" size="sm" className="font-extrabold" onClick={handleSaveManage}>
        Simpan Perubahan Status & Stok ➔
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1B3A5C]">Kelola Daftar Surplus Makanan Saya</h2>
          <p className="text-xs text-slate-500 font-medium">
            Atur kuantitas stok, saklar penayangan publik, dan kelola status tayang porsi makanan berlebih.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/provider/add-surplus">
            <Button variant="gold" size="md" className="font-black text-xs text-slate-950 shadow-md">
              + Unggah Surplus Baru ➔
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Filter (Poin 5: Aktif Tayang vs Nonaktif / Diarsipkan) */}
      <div className="flex items-center gap-3 border-b border-slate-200 text-xs font-bold pb-1">
        <button
          onClick={() => setActiveTabFilter('ACTIVE')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTabFilter === 'ACTIVE'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Aktif Tayang ({activeFoods.length})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('INACTIVE')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTabFilter === 'INACTIVE'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>Nonaktif / Diarsipkan ({inactiveFoods.length})</span>
        </button>
      </div>

      {/* Clean FoodGrid Layout */}
      {displayedFoods.length > 0 ? (
        <FoodGrid foods={displayedFoods} onDetail={handleDetail} onManage={handleManage} />
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
          <h3 className="text-base font-extrabold text-[#1B3A5C]">
            {activeTabFilter === 'ACTIVE'
              ? 'Tidak Ada Surplus Aktif Tayang'
              : 'Tidak Ada Item Surplus Nonaktif'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            {activeTabFilter === 'ACTIVE'
              ? 'Saat ini belum ada listing makanan berlebih yang tayang publik.'
              : 'Semua listing makanan Anda saat ini sedang tayang aktif.'}
          </p>
        </div>
      )}

      {/* Modal Detail Makanan */}
      <FoodDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        food={selectedFood}
      />

      {/* Modal Kelola Stok & Status Penayangan (Poin 5 & 6) */}
      {manageModal.isOpen && (
        <Modal
          isOpen={manageModal.isOpen}
          onClose={() => setManageModal({ isOpen: false, food: null })}
          title={`Kelola Surplus: ${manageModal.food?.foodName}`}
          size="md"
          footer={manageModalFooter}
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

            {/* Toggle Status Penayangan Publik (Poin 5) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-extrabold text-slate-800 block">Status Penayangan Publik:</label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#1B3A5C] transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isAvailableStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="font-extrabold text-xs text-[#1B3A5C]">
                    {isAvailableStatus ? 'Aktif Tayang (Publik Bisa Mengklaim)' : 'Nonaktif (Disembunyikan dari Publik)'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAvailableStatus}
                  onChange={(e) => setIsAvailableStatus(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-slate-500">
                *Mengubah status ke Nonaktif akan memindahkan makanan ini ke tab <strong>Nonaktif / Diarsipkan</strong> dan menyembunyikannya dari pencarian publik.
              </p>
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
