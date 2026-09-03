'use client';

import React, { useEffect, useState } from 'react';
import { FoodGrid } from '@/components/food/FoodGrid';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { CheckIcon, PlusIcon } from '@/components/ui/Icon';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MyListingsPage() {
  const { data: session } = useSession();
  const [foods, setFoods] = useState<any[]>([]);
  const [activeTabFilter, setActiveTabFilter] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Quick Stock & Live Status Modal
  const [manageModal, setManageModal] = useState<{ isOpen: boolean; food: any | null }>({
    isOpen: false,
    food: null,
  });
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [isAvailableStatus, setIsAvailableStatus] = useState<boolean>(true);

  // Full Edit Modal (Point 4: Comprehensive CRUD)
  const [editModal, setEditModal] = useState<{ isOpen: boolean; food: any | null }>({
    isOpen: false,
    food: null,
  });
  const [editFormData, setEditFormData] = useState({
    foodName: '',
    description: '',
    foodCategory: 'MEALS',
    quantity: 10,
    price: 5000,
    originalPrice: 15000,
    isFree: false,
    storageCondition: 'ROOM_TEMP',
    packagingType: 'PACKAGED',
    pickupDeadline: '',
    allergens: 'Halal BPJPH, Wadah Food-Grade',
  });

  // Authentic Custom Delete Confirmation Modal (Point 5)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; food: any | null }>({
    isOpen: false,
    food: null,
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const extractPhoto = (item: any): string => {
    if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.length > 2) return item.imageUrl;
    if (item.photoUrl && typeof item.photoUrl === 'string' && item.photoUrl.length > 2) return item.photoUrl;
    if (item.photo && typeof item.photo === 'string' && item.photo.length > 2) return item.photo;
    if (item.photos) {
      if (Array.isArray(item.photos) && item.photos.length > 0 && typeof item.photos[0] === 'string') {
        return item.photos[0];
      }
      if (typeof item.photos === 'string') {
        try {
          const parsed = JSON.parse(item.photos);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            return parsed[0];
          }
          if (typeof parsed === 'string' && parsed.length > 2) {
            return parsed;
          }
        } catch (_) {
          if (item.photos.startsWith('http') || item.photos.startsWith('data:') || item.photos.startsWith('/')) {
            return item.photos;
          }
        }
      }
    }
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  };

  const loadListings = () => {
    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
    } catch (_) {}

    const isFresh = typeof window !== 'undefined' && localStorage.getItem('replate_is_fresh_account') === 'true';

    if (isFresh) {
      const normalizedLocal = localItems.map((item) => ({
        ...item,
        category: item.category || item.foodCategory || 'MEALS',
        providerName: item.providerName || (session?.user?.name) || 'Warung Bakso Pak Kumis',
        imageUrl: extractPhoto(item),
        photos: [extractPhoto(item)],
      }));
      setFoods(normalizedLocal);
      return;
    }

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
            originalPrice: 18000,
            status: 'AVAILABLE',
            distributionType: 'SALE',
            address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
            pickupDeadline: new Date(Date.now() + 5 * 3600000).toISOString(),
            photos: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'],
            provider: { name: 'Warung Bakso Pak Kumis', organizationName: 'Warung Bakso Pak Kumis' },
            providerName: 'Warung Bakso Pak Kumis',
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
            originalPrice: 12000,
            status: 'AVAILABLE',
            distributionType: 'FREE',
            address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
            pickupDeadline: new Date(Date.now() + 3 * 3600000).toISOString(),
            photos: ['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80'],
            provider: { name: 'Warung Bakso Pak Kumis', organizationName: 'Warung Bakso Pak Kumis' },
            providerName: 'Warung Bakso Pak Kumis',
          },
        ];

        // Deduplicate by ID: local items take priority over API items
        const combined = [...localItems, ...itemsList];
        const deduped = Array.from(
          combined.reduce((map, item) => {
            if (!map.has(item.id)) map.set(item.id, item);
            return map;
          }, new Map<string, any>()).values()
        );

        // Only use fallback if we have zero items (both local and API empty)
        const hasLocalOrApi = deduped.length > 0;
        // Remove fallback items that already exist locally
        const localIds = new Set(localItems.map((i: any) => i.id));
        const safeFallback = hasLocalOrApi ? [] : fallback.filter((f) => !localIds.has(f.id));

        const normalizedCombined = [...deduped, ...safeFallback].map((item: any) => ({
          ...item,
          category: item.category || item.foodCategory || 'MEALS',
          providerName: item.providerName || (session?.user?.name) || 'Warung Bakso Pak Kumis',
          imageUrl: extractPhoto(item),
          photos: [extractPhoto(item)],
        }));
        setFoods(normalizedCombined.length > 0 ? normalizedCombined : fallback);
      })
      .catch(() => {
        if (localItems.length > 0) {
          const normalizedLocal = localItems.map((item) => ({
            ...item,
            category: item.category || item.foodCategory || 'MEALS',
            providerName: item.providerName || (session?.user?.name) || 'Warung Bakso Pak Kumis',
            imageUrl: extractPhoto(item),
            photos: [extractPhoto(item)],
          }));
          setFoods(normalizedLocal);
        }
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
        foodName: item.foodName || item.title,
        description: item.description,
        foodCategory: item.foodCategory || item.category,
        quantity: item.remainingQuantity ?? item.quantity,
        quantityUnit: item.quantityUnit || 'Porsi',
        price: item.price,
        pickupDeadline: item.pickupDeadline,
        address: item.address,
        storageCondition: item.storageCondition || 'ROOM_TEMP',
        packagingType: item.packagingType || 'PACKAGED',
        weightPerUnitKg: item.weightPerUnitKg || 0.4,
        allergens: item.allergens || ['Nut-Free', 'Halal BPJPH', 'Wadah Food-Grade'],
        lat: item.lat || -7.2575,
        lng: item.lng || 112.7521,
        provider: item.provider || { name: 'Warung Bakso Pak Kumis', organizationName: 'Warung Bakso Pak Kumis' },
        providerName: item.providerName || 'Warung Bakso Pak Kumis',
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

  const handleOpenEdit = (foodItem: any) => {
    setEditFormData({
      foodName: foodItem.foodName || foodItem.title || '',
      description: foodItem.description || '',
      foodCategory: foodItem.foodCategory || foodItem.category || 'MEALS',
      quantity: foodItem.quantity || 10,
      price: foodItem.price || 0,
      originalPrice: foodItem.originalPrice || (foodItem.price ? foodItem.price * 2 : 15000),
      isFree: foodItem.price === 0 || foodItem.distributionType === 'FREE',
      storageCondition: foodItem.storageCondition || 'ROOM_TEMP',
      packagingType: foodItem.packagingType || 'PACKAGED',
      pickupDeadline: foodItem.pickupDeadline ? new Date(foodItem.pickupDeadline).toISOString().slice(0, 16) : '',
      allergens: Array.isArray(foodItem.allergens) ? foodItem.allergens.join(', ') : 'Halal BPJPH, Wadah Food-Grade',
    });
    setEditModal({ isOpen: true, food: foodItem });
    setManageModal({ isOpen: false, food: null });
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.food) return;
    const foodId = editModal.food.id;

    const updatedItem = {
      ...editModal.food,
      foodName: editFormData.foodName,
      title: editFormData.foodName,
      description: editFormData.description,
      foodCategory: editFormData.foodCategory,
      category: editFormData.foodCategory,
      quantity: Number(editFormData.quantity),
      remainingQuantity: Number(editFormData.quantity),
      price: editFormData.isFree ? 0 : Number(editFormData.price),
      originalPrice: Number(editFormData.originalPrice),
      distributionType: editFormData.isFree ? 'FREE' : 'SALE',
      storageCondition: editFormData.storageCondition,
      packagingType: editFormData.packagingType,
      allergens: editFormData.allergens.split(',').map((s) => s.trim()).filter(Boolean),
    };

    // Update local storage
    try {
      const local = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      const updatedLocal = local.map((item: any) => (item.id === foodId ? updatedItem : item));
      localStorage.setItem('replate_local_surplus', JSON.stringify(updatedLocal));
    } catch (_) {}

    setFoods((prev) => prev.map((f) => (f.id === foodId ? updatedItem : f)));
    setEditModal({ isOpen: false, food: null });

    setToastState({
      isOpen: true,
      message: `Menu "${editFormData.foodName}" berhasil diperbarui secara lengkap!`,
      type: 'success',
    });
  };

  const handleDuplicate = (foodItem: any) => {
    const newId = `SRP-${Date.now()}`;
    const duplicated = {
      ...foodItem,
      id: newId,
      foodName: `${foodItem.foodName || foodItem.title} (Salinan)`,
      title: `${foodItem.foodName || foodItem.title} (Salinan)`,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };

    try {
      const local = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      localStorage.setItem('replate_local_surplus', JSON.stringify([duplicated, ...local]));
    } catch (_) {}

    setFoods((prev) => [duplicated, ...prev]);
    setManageModal({ isOpen: false, food: null });

    setToastState({
      isOpen: true,
      message: `Menu "${foodItem.foodName || foodItem.title}" berhasil diduplikasi ke listing baru!`,
      type: 'success',
    });
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

  const handleConfirmDelete = async () => {
    if (!deleteModal.food) return;
    const foodId = deleteModal.food.id;
    const foodName = deleteModal.food.foodName || deleteModal.food.title;

    try {
      await fetch(`/api/surplus?id=${foodId}`, {
        method: 'DELETE',
      });
    } catch (_) {}

    // Update local storage cache
    try {
      const local = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      const filteredLocal = local.filter((item: any) => item.id !== foodId);
      localStorage.setItem('replate_local_surplus', JSON.stringify(filteredLocal));
    } catch (_) {}

    setFoods((prev) => prev.filter((f) => f.id !== foodId));
    setDeleteModal({ isOpen: false, food: null });

    setToastState({
      isOpen: true,
      message: `Menu "${foodName}" berhasil dihapus permanen dari katalog!`,
      type: 'success',
    });
  };

  const activeFoods = foods.filter((f) => f.status === 'AVAILABLE' || f.status === 'ACTIVE' || !f.status);
  const inactiveFoods = foods.filter((f) => f.status === 'UNAVAILABLE' || f.status === 'INACTIVE');
  const displayedFoods = activeTabFilter === 'ACTIVE' ? activeFoods : inactiveFoods;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Sleek Modern Header Card (Compact & Ergonomic - Seragam Antar Modul) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Katalog & Stok Surplus
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{activeFoods.length} Menu Aktif Tayang</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              Kelola Daftar Surplus Makanan Toko
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Edit rincian menu, kelola sisa porsi, atur status penayangan, dan duplikasi listing.
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/provider/add-surplus">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<PlusIcon size={14} className="text-slate-950" />}
                className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
              >
                Unggah Surplus Baru
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Filter (Responsive horizontal pills) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 text-xs font-bold pb-1">
        <button
          onClick={() => setActiveTabFilter('ACTIVE')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
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
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTabFilter === 'INACTIVE'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>Nonaktif / Arsip ({inactiveFoods.length})</span>
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

      {/* Modal Kelola Stok & Aksi Lengkap (Point 4 & 5) */}
      {manageModal.isOpen && manageModal.food && (
        <Modal
          isOpen={manageModal.isOpen}
          onClose={() => setManageModal({ isOpen: false, food: null })}
          title={`Kelola Menu: ${manageModal.food?.foodName || manageModal.food?.title}`}
          size="md"
        >
          <div className="space-y-5 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Item Makanan:</span>
              <span className="font-extrabold text-[#1B3A5C] text-sm block">
                {manageModal.food?.foodName || manageModal.food?.title}
              </span>
              <span className="text-slate-500 block">
                Kategori: <strong>{manageModal.food?.category || manageModal.food?.foodCategory}</strong> • Lokasi: {manageModal.food?.address || 'Outlet Surabaya'}
              </span>
            </div>

            {/* Actions Grid: Edit Detail, Duplikasi, Hapus */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(manageModal.food)}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 text-[#1B3A5C] font-extrabold rounded-xl border border-blue-200 text-center transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#1B3A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Rincian Menu</span>
              </button>

              <button
                type="button"
                onClick={() => handleDuplicate(manageModal.food)}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold rounded-xl border border-amber-200 text-center transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Duplikasi Menu</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteModal({ isOpen: true, food: manageModal.food });
                  setManageModal({ isOpen: false, food: null });
                }}
                className="p-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold rounded-xl border border-red-200 text-center transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Hapus Menu</span>
              </button>
            </div>

            {/* Toggle Status Penayangan */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-extrabold text-slate-800 block">Saklar Penayangan Publik:</label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#1B3A5C] transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isAvailableStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="font-extrabold text-xs text-[#1B3A5C]">
                    {isAvailableStatus ? 'Aktif Tayang (Bisa Diklaim / Dipesan)' : 'Nonaktif (Disembunyikan)'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAvailableStatus}
                  onChange={(e) => setIsAvailableStatus(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Update Kuantitas Porsi Tersedia:</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                  className="w-32 font-black text-sm"
                />
                <span className="font-bold text-slate-700">{manageModal.food?.quantityUnit || 'Porsi'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setManageModal({ isOpen: false, food: null })}>
                Batal
              </Button>
              <Button variant="gold" size="sm" className="font-black text-slate-950" onClick={handleSaveManage}>
                Simpan Perubahan ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Full Edit Rincian Menu (Point 4) */}
      {editModal.isOpen && editModal.food && (
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, food: null })}
          title={`Edit Rincian Menu: ${editFormData.foodName}`}
          size="lg"
        >
          <form onSubmit={handleSaveFullEdit} className="space-y-4 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 block">Nama Menu Makanan:</label>
                <Input
                  value={editFormData.foodName}
                  onChange={(e) => setEditFormData({ ...editFormData, foodName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 block">Kategori Pangan:</label>
                <select
                  value={editFormData.foodCategory}
                  onChange={(e) => setEditFormData({ ...editFormData, foodCategory: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                >
                  <option value="MEALS">🍱 Makanan Olahan Matang (Meals)</option>
                  <option value="BAKERY">🥐 Roti, Kue & Pastry</option>
                  <option value="PRODUCE">🥗 Sayuran & Buah Segar</option>
                  <option value="DAIRY">🥛 Produk Olahan Susu / Minuman</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 block">Deskripsi & Kondisi Makanan:</label>
              <textarea
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 block">Jumlah Porsi:</label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 block">Harga Normal (Rp):</label>
                <Input
                  type="number"
                  min="0"
                  value={editFormData.originalPrice}
                  onChange={(e) => setEditFormData({ ...editFormData, originalPrice: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 block">Harga Diskon Rescue Sale (Rp):</label>
                <Input
                  type="number"
                  min="0"
                  disabled={editFormData.isFree}
                  value={editFormData.isFree ? 0 : editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer">
              <input
                type="checkbox"
                checked={editFormData.isFree}
                onChange={(e) => setEditFormData({ ...editFormData, isFree: e.target.checked, price: 0 })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-black text-emerald-900 text-xs">
                Donasi Bebas Biaya (Rp 0 / Gratis Khusus Panti Asuhan & Dhuafa)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 block">Suhu Penyimpanan (SOP BPOM):</label>
                <select
                  value={editFormData.storageCondition}
                  onChange={(e) => setEditFormData({ ...editFormData, storageCondition: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                >
                  <option value="ROOM_TEMP">Suhu Ruang Higienis (25°C)</option>
                  <option value="WARMER">Pemanas / Warmer (&gt; 60°C)</option>
                  <option value="CHILLED">Pendingin / Chiller (&lt; 4°C)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 block">Label Alergen & Wadah:</label>
                <Input
                  value={editFormData.allergens}
                  onChange={(e) => setEditFormData({ ...editFormData, allergens: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditModal({ isOpen: false, food: null })}>
                Batal
              </Button>
              <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950">
                Simpan Rincian Menu ➔
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Authentic Branded Custom Delete Confirmation Modal (Point 5) */}
      {deleteModal.isOpen && deleteModal.food && (
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, food: null })}
          title="Konfirmasi Hapus Menu Surplus"
          size="sm"
        >
          <div className="space-y-4 text-center text-xs">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-200">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Hapus &quot;{deleteModal.food.foodName || deleteModal.food.title}&quot;?
              </h3>
              <p className="text-slate-500 font-medium">
                Menu ini akan dihapus secara permanen dari katalog surplus toko Anda dan tidak dapat dipesan lagi oleh konsumen/panti.
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 text-[11px] font-semibold text-left space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckIcon size={12} className="text-red-700 shrink-0" />
                <span>Porsi tersisa: <strong>{deleteModal.food.remainingQuantity ?? deleteModal.food.quantity} Porsi</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckIcon size={12} className="text-red-700 shrink-0" />
                <span>Status: <strong>{deleteModal.food.status || 'AVAILABLE'}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModal({ isOpen: false, food: null })}
                className="font-bold"
              >
                Batalkan
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Ya, Hapus Permanen ➔
              </button>
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
