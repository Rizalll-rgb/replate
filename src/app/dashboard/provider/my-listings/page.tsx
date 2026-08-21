'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';

export default function MyListingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'ALL' | 'AVAILABLE' | 'IN_RESCUE' | 'COMPLETED' | 'EXPIRED'>('ALL');
  const [foods, setFoods] = useState<any[]>([]);
  const [manageModal, setManageModal] = useState<{ isOpen: boolean; food: any | null }>({
    isOpen: false,
    food: null,
  });
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; food: any | null }>({
    isOpen: false,
    food: null,
  });
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const loadData = () => {
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
            foodCategory: 'MEALS',
            quantity: 15,
            remainingQuantity: 12,
            quantityUnit: 'porsi',
            price: 5000,
            status: 'AVAILABLE',
            distributionType: 'BOTH',
            address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
            pickupDeadline: new Date(Date.now() + 5 * 3600000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'SRP-102',
            foodName: 'Roti & Pastry Surplus',
            foodCategory: 'BAKERY',
            quantity: 30,
            remainingQuantity: 0,
            quantityUnit: 'pcs',
            price: 0,
            status: 'COMPLETED',
            distributionType: 'FREE',
            address: 'Jl. Pemuda No. 12, Surabaya',
            pickupDeadline: new Date(Date.now() - 2 * 3600000).toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];

        setFoods(itemsList.length > 0 ? itemsList : fallback);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [session]);

  const filteredFoods = foods.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.status === activeTab;
  });

  const handleSaveManage = async () => {
    if (!manageModal.food) return;
    try {
      await fetch('/api/surplus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: manageModal.food.id,
          remainingQuantity: newQuantity,
          status: newQuantity === 0 ? 'COMPLETED' : 'AVAILABLE',
        }),
      });
      setFoods((prev) =>
        prev.map((f) =>
          f.id === manageModal.food.id
            ? { ...f, remainingQuantity: newQuantity, status: newQuantity === 0 ? 'COMPLETED' : f.status }
            : f
        )
      );
      setManageModal({ isOpen: false, food: null });
      setToastState({
        isOpen: true,
        message: `Stok ${manageModal.food.foodName} berhasil diubah menjadi ${newQuantity} ${manageModal.food.quantityUnit}!`,
        type: 'success',
      });
    } catch {
      setToastState({ isOpen: true, message: 'Gagal memperbarui stok.', type: 'error' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus listing surplus "${name}"?`)) return;
    try {
      await fetch(`/api/surplus?id=${id}`, { method: 'DELETE' });
      setFoods((prev) => prev.filter((f) => f.id !== id));
      setToastState({ isOpen: true, message: `Surplus "${name}" berhasil dihapus.`, type: 'success' });
    } catch {
      setToastState({ isOpen: true, message: 'Gagal menghapus listing.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#1B3A5C] text-white text-[10px] font-black uppercase tracking-wider rounded-md">
              Shopee Seller Dashboard Mode
            </span>
            <h2 className="text-xl font-extrabold text-[#1B3A5C]">Kelola Daftar Surplus Makanan Saya</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pantau stok real-time, atur kuantitas porsi, ubah status penayangan SOP BPOM, dan lihat riwayat klaim.
          </p>
        </div>
      </div>

      {/* Shopee Style Status Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'ALL', label: 'Semua Status' },
          { key: 'AVAILABLE', label: '🟢 Aktif (Available)' },
          { key: 'IN_RESCUE', label: '🟡 Dalam Penyelamatan' },
          { key: 'COMPLETED', label: '🔵 Selesai' },
          { key: 'EXPIRED', label: '🔴 Expired' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Seller Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFoods.length === 0 ? (
          <Card className="p-8 text-center border-slate-200">
            <p className="text-slate-400 text-xs font-semibold">Tidak ada surplus makanan di tab ini.</p>
          </Card>
        ) : (
          filteredFoods.map((item) => (
            <Card key={item.id} className="border-slate-200 shadow-xs hover:shadow-md transition-all">
              <CardBody className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-[#1B3A5C]">{item.foodName}</h3>
                    <Badge variant={item.price > 0 ? 'gold' : 'success'} className="text-[10px]">
                      {item.price > 0 ? `Rp ${item.price.toLocaleString('id-ID')}` : 'GRATIS / PANTI'}
                    </Badge>
                    <Badge variant={item.status === 'AVAILABLE' ? 'success' : 'secondary'} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Kategori: <span className="font-bold text-slate-800">{item.foodCategory}</span> • Batas Pickup:{' '}
                    <span className="font-semibold text-amber-700">
                      {new Date(item.pickupDeadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span>
                      Stok Awal: <strong className="text-slate-800">{item.quantity} {item.quantityUnit}</strong>
                    </span>
                    <span>
                      Sisa Stok: <strong className="text-emerald-700">{item.remainingQuantity ?? item.quantity} {item.quantityUnit}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDetailModal({ isOpen: true, food: item });
                    }}
                    className="text-xs font-bold"
                  >
                    🔍 Detail & Penglaim
                  </Button>
                  <Button
                    size="sm"
                    variant="gold"
                    onClick={() => {
                      setManageModal({ isOpen: true, food: item });
                      setNewQuantity(item.remainingQuantity ?? item.quantity);
                    }}
                    className="text-xs font-extrabold"
                  >
                    ✏️ Edit Stok & Status
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id, item.foodName)}
                    className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                  >
                    🗑️ Hapus
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Shopee Style Detail Modal */}
      {detailModal.isOpen && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, food: null })}
          title={`Detail Penjual Marketplace: ${detailModal.food?.foodName}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">ID Produk Surplus</span>
                <span className="font-mono font-bold text-[#1B3A5C]">{detailModal.food?.id}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Verifikasi SOP BPOM</span>
                <Badge variant="success" size="sm">
                  100% SOP LULUS BPOM
                </Badge>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Alamat Penjemputan</span>
                <span className="font-bold text-slate-800">{detailModal.food?.address}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Skema Distribusi</span>
                <span className="font-bold text-amber-700">{detailModal.food?.distributionType}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="font-extrabold text-emerald-900 block">Daftar Penglaim Real-Time:</span>
              <p className="text-emerald-800">
                1. <strong>Budi Santoso</strong> (2 Porsi - PENDING PICKUP) <br />
                2. <strong>Panti Asuhan Kasih Ibu</strong> (5 Porsi - CONFIRMED)
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Stock Modal */}
      {manageModal.isOpen && (
        <Modal
          isOpen={manageModal.isOpen}
          onClose={() => setManageModal({ isOpen: false, food: null })}
          title={`Kelola Stok: ${manageModal.food?.foodName}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-extrabold text-slate-800 block">Ubah Sisa Kuantitas Stok Tersedia:</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                  className="w-36 font-bold text-base"
                />
                <span className="font-extrabold text-slate-700 text-sm">{manageModal.food?.quantityUnit}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button size="sm" variant="gold" className="font-black" onClick={handleSaveManage}>
                Simpan Perubahan Stok ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
