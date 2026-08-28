'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRScanner } from '@/components/qr/QRScanner';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

export default function PartnerActivePickupsPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const defaultActivePickups = [
    {
      code: 'FB-DON-88192',
      foodName: 'Nasi Ayam Bakar Specialty Pak Kumis',
      providerName: 'Warung Bakso Pak Kumis',
      providerAddress: 'Jl. Genteng Kali No. 45, Surabaya',
      shelterName: 'Panti Asuhan Kasih Ibu',
      shelterAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      quantity: '45 Porsi',
      status: 'AWAITING_RESCUE_PICKUP', // Phase 1: Wait for pickup at store
      time: 'Hari ini 19:00 WIB',
    },
    {
      code: 'FB-DON-99201',
      foodName: 'Roti Tawar Gandum & Croissant Steril',
      providerName: 'Bakery Bonami Surabaya',
      providerAddress: 'Jl. Pemuda No. 12, Surabaya',
      shelterName: 'Rumah Singgah Anak Jalanan',
      shelterAddress: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      quantity: '30 Paket',
      status: 'IN_TRANSIT', // Phase 2: OTW delivering to shelter
      time: 'Hari ini 20:30 WIB',
    },
  ];

  const defaultCompletedPickups = [
    {
      code: 'FB-DON-77182',
      foodName: 'Paket Roti Bakery Steril & Susu UHT',
      providerName: 'Bakery Bonami Surabaya',
      shelterName: 'Panti Werdha Lansia Sejahtera',
      quantity: '30 Paket',
      status: 'COMPLETED',
      time: '21 Aug 2026, 14:00 WIB',
      photoProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const [activePickups, setActivePickups] = useState<any[]>(defaultActivePickups);
  const [completedPickups, setCompletedPickups] = useState<any[]>(defaultCompletedPickups);

  // Sync with localStorage replate_claims
  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      const savedClaimsStr = localStorage.getItem('replate_claims');

      if (isFresh) {
        if (savedClaimsStr) {
          const savedClaims = JSON.parse(savedClaimsStr);
          if (Array.isArray(savedClaims) && savedClaims.length > 0) {
            const pending = savedClaims
              .filter((c: any) => c.status !== 'COMPLETED' && c.status !== 'VERIFIED')
              .map((c: any) => ({
                code: c.claimCode || c.id,
                foodName: c.foodName,
                providerName: 'Mitra Provider Replate',
                providerAddress: 'Surabaya Pusat',
                shelterName: c.shelterName || 'Panti Asuhan Surabaya',
                shelterAddress: c.address || 'Kota Surabaya',
                quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
                status: c.status || 'AWAITING_RESCUE_PICKUP',
                time: c.readyTime || 'Hari ini',
              }));

            const completed = savedClaims
              .filter((c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED')
              .map((c: any) => ({
                code: c.claimCode || c.id,
                foodName: c.foodName,
                providerName: 'Mitra Provider Replate',
                shelterName: c.shelterName || 'Panti Asuhan Surabaya',
                quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
                status: 'COMPLETED',
                time: c.createdAt || 'Selesai',
                photoProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
              }));

            setActivePickups(pending);
            setCompletedPickups(completed);
          } else {
            setActivePickups([]);
            setCompletedPickups([]);
          }
        } else {
          setActivePickups([]);
          setCompletedPickups([]);
        }
        return;
      }

      if (savedClaimsStr) {
        const savedClaims = JSON.parse(savedClaimsStr);
        if (Array.isArray(savedClaims) && savedClaims.length > 0) {
          const pending = savedClaims
            .filter((c: any) => c.status !== 'COMPLETED' && c.status !== 'VERIFIED')
            .map((c: any) => ({
              code: c.claimCode || c.id,
              foodName: c.foodName,
              providerName: 'Mitra Provider Replate',
              providerAddress: 'Surabaya Pusat',
              shelterName: c.shelterName || 'Panti Asuhan Surabaya',
              shelterAddress: c.address || 'Kota Surabaya',
              quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
              status: c.status || 'AWAITING_RESCUE_PICKUP',
              time: c.readyTime || 'Hari ini',
            }));

          const completed = savedClaims
            .filter((c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED')
            .map((c: any) => ({
              code: c.claimCode || c.id,
              foodName: c.foodName,
              providerName: 'Mitra Provider Replate',
              shelterName: c.shelterName || 'Panti Asuhan Surabaya',
              quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
              status: 'COMPLETED',
              time: c.createdAt || 'Selesai',
              photoProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
            }));

          if (pending.length > 0) setActivePickups([...pending, ...defaultActivePickups.filter(d => !pending.some(p => p.code === d.code))]);
          if (completed.length > 0) setCompletedPickups([...completed, ...defaultCompletedPickups.filter(d => !completed.some(c => c.code === d.code))]);
        }
      }
    } catch (_) {}
  }, []);

  // Delivery Modal State for Phase 3 (Upload Photo & Confirm Complete at Shelter)
  const [completeModalItem, setCompleteModalItem] = useState<any | null>(null);
  const [receiptPhotoProof, setReceiptPhotoProof] = useState<string | null>(null);
  const [recipientNotes, setRecipientNotes] = useState('');

  // Handle Phase 2: Scan QR at Store -> Status becomes IN_TRANSIT (OTW to Shelter)
  const handlePickupAtStore = (code: string) => {
    const cleanCode = code.trim().toUpperCase();

    setActivePickups((prev) =>
      prev.map((item) =>
        item.code.toUpperCase() === cleanCode
          ? { ...item, status: 'IN_TRANSIT' }
          : item
      )
    );

    // Sync to localStorage
    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      const existingClaims = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
      const updatedClaims = existingClaims.map((c: any) =>
        (c.claimCode === cleanCode || c.id === cleanCode)
          ? { ...c, status: 'IN_TRANSIT' }
          : c
      );
      localStorage.setItem('replate_claims', JSON.stringify(updatedClaims));
    } catch (_) {}

    setToastState({
      isOpen: true,
      message: `🚚 Status Resi ${cleanCode} Diperbarui: OTW DALAM PENGANTARAN KURIR MENUJU LOKASI PANTI!`,
      type: 'success',
    });
    setShowScanner(false);
    setManualCodeInput('');
  };

  // Handle Phase 3: Final Delivery Confirmation at Shelter with Photo Upload -> Status COMPLETED
  const handleConfirmFinalDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalItem) return;
    if (!receiptPhotoProof) {
      alert('Anda wajib mengunggah foto bukti penyerahan produk di panti!');
      return;
    }

    const cleanCode = completeModalItem.code;

    // Update lists
    setActivePickups((prev) => prev.filter((item) => item.code !== cleanCode));
    setCompletedPickups((prev) => [
      {
        ...completeModalItem,
        status: 'COMPLETED',
        time: 'Baru Saja (Verified Penyerahan Panti)',
        photoProof: receiptPhotoProof,
      },
      ...prev,
    ]);

    // Sync to localStorage
    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      const existingClaims = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
      const updatedClaims = existingClaims.map((c: any) =>
        (c.claimCode === cleanCode || c.id === cleanCode)
          ? { ...c, status: 'COMPLETED' }
          : c
      );
      localStorage.setItem('replate_claims', JSON.stringify(updatedClaims));
    } catch (_) {}

    setCompleteModalItem(null);
    setReceiptPhotoProof(null);

    setToastState({
      isOpen: true,
      message: `🎉 ALHAMDULILLAH! Resi ${cleanCode} Resmi Selesai (COMPLETED). Donasi Sukses Diterima Pengurus Panti!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Banner */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-2">
        <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md inline-block shadow-xs">
          Modul Relawan Armada Rescue Komunitas
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Alur Penjemputan & Penyaluran Donasi Panti</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-2xl font-medium">
          Scan QR Resi saat mengambil makanan di Toko Provider (Status OTW), lalu konfirmasi penyerahan akhir + foto bukti penerimaan di Panti Asuhan (Status COMPLETED).
        </p>
      </div>

      {/* Control Panel Scan QR / Input Kode di Toko */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider block">
              Langkah 1: Penjemputan di Toko Provider
            </span>
            <h3 className="text-sm font-extrabold text-white">Scan QR Toko / Input Kode Resi Saat Ambil Makanan</h3>
          </div>

          <Button
            variant="gold"
            size="md"
            className="font-black shadow-md flex items-center gap-2 shrink-0 text-slate-900 px-5"
            onClick={() => setShowScanner(!showScanner)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span>{showScanner ? 'Tutup Pindai Kamera' : 'Buka Kamera Pindai QR Toko'}</span>
          </Button>
        </div>

        {/* Manual Code Input Bar */}
        <div className="flex items-center gap-3 border-t border-slate-800 pt-3">
          <Input
            placeholder="Atau Ketik Kode Resi (Contoh: FB-DON-88192 / QR-DON-891023)..."
            value={manualCodeInput}
            onChange={(e) => setManualCodeInput(e.target.value)}
            className="text-xs bg-slate-800 text-white border-slate-700 placeholder-slate-400"
          />
          <Button
            variant="gold"
            size="md"
            disabled={!manualCodeInput.trim()}
            onClick={() => handlePickupAtStore(manualCodeInput)}
            className="font-extrabold shrink-0 text-xs shadow-md"
          >
            Konfirmasi Ambil & Set Status OTW ➔
          </Button>
        </div>
      </div>

      {showScanner && (
        <Card className="p-6 border-[#D4A843] bg-white shadow-md">
          <QRScanner onScanSuccess={handlePickupAtStore} />
        </Card>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Penjemputan & Pengantaran Aktif ({activePickups.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Riwayat Penyaluran Selesai ({completedPickups.length})
        </button>
      </div>

      {/* List Penjemputan / Pengantaran Aktif */}
      <div className="space-y-4">
        {activeTab === 'ACTIVE' ? (
          activePickups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3 shadow-xs">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl border border-blue-200 text-blue-600 flex items-center justify-center mx-auto text-2xl">
                🛵
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-[#1B3A5C]">Tidak Ada Penjemputan Aktif Saat Ini</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Saat ini belum ada tugas pengantaran logistik pangan surplus yang ditugaskan ke armada relawan Anda.
                </p>
              </div>
              <Link href="/dashboard/rescue-partner/requests" className="inline-block pt-2">
                <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs">
                  Cek Permintaan Match Baru ➔
                </Button>
              </Link>
            </div>
          ) : (
            activePickups.map((item) => (
              <Card key={item.code} className="border-slate-200 shadow-xs hover:shadow-md transition-all">
                <CardBody className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm bg-[#1B3A5C] text-white px-3 py-1 rounded-md">
                        {item.code}
                      </span>
                      {item.status === 'IN_TRANSIT' ? (
                        <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-md shadow-xs animate-pulse">
                          🚚 OTW MENGANTAR KE PANTI
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-600 text-white font-extrabold text-xs rounded-md shadow-xs">
                          📦 SIAP DIAMBIL DI TOKO
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">Batas Waktu: {item.time}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Store Info */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lokasi Penjemputan Toko:</span>
                      <h4 className="font-extrabold text-[#1B3A5C]">{item.providerName}</h4>
                      <p className="text-slate-600">{item.providerAddress}</p>
                      <p className="text-emerald-700 font-bold mt-1">Item: {item.foodName} ({item.quantity})</p>
                    </div>

                    {/* Shelter Destination Info */}
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Tujuan Penyaluran Panti:</span>
                      <h4 className="font-extrabold text-emerald-900">{item.shelterName}</h4>
                      <p className="text-emerald-800">{item.shelterAddress}</p>
                    </div>
                  </div>

                  {/* Dynamic Action Button based on Phase */}
                  <div className="flex justify-end gap-3 pt-2">
                    {item.status === 'AWAITING_RESCUE_PICKUP' ? (
                      <Button
                        variant="gold"
                        size="sm"
                        className="font-extrabold text-xs shadow-xs"
                        onClick={() => handlePickupAtStore(item.code)}
                      >
                        📦 Scan QR Toko & Set Status OTW ➔
                      </Button>
                    ) : (
                      <Button
                        variant="gold"
                        size="sm"
                        className="font-black text-xs shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setCompleteModalItem(item)}
                      >
                        📸 Konfirmasi Sampai Panti & Upload Foto Penyerahan ➔
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))
          )
        ) : (
          completedPickups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-2 shadow-xs">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-xl">
                📋
              </div>
              <h4 className="font-black text-sm text-[#1B3A5C]">Belum Ada Riwayat Pengantaran Selesai</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                Penyaluran logistik yang telah berhasil diserahterimakan ke panti asuhan akan tampil di tab ini.
              </p>
            </div>
          ) : (
            completedPickups.map((item) => (
              <Card key={item.code} className="border-slate-200 shadow-xs">
                <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm bg-emerald-700 text-white px-2.5 py-0.5 rounded-md">
                        {item.code}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-md">
                        ✓ COMPLETED (TERAMBIL & DISERAHKAN)
                      </span>
                    </div>
                    <h4 className="font-extrabold text-[#1B3A5C] text-sm mt-1">
                      {item.shelterName} — <span className="text-emerald-700">{item.foodName} ({item.quantity})</span>
                    </h4>
                    <p className="text-slate-500">Waktu Penyerahan: {item.time}</p>
                  </div>

                  {item.photoProof && (
                    <img
                      src={item.photoProof}
                      alt="Bukti Serah Terima Panti"
                      className="w-24 h-16 object-cover rounded-xl border border-slate-300 shrink-0"
                    />
                  )}
                </CardBody>
              </Card>
            ))
          )
        )}
      </div>

      {/* Modal Phase 3: Final Delivery Confirmation at Shelter with Photo Upload */}
      <Modal
        isOpen={!!completeModalItem}
        onClose={() => setCompleteModalItem(null)}
        title={`Konfirmasi Sampai & Serah Terima Panti: ${completeModalItem?.shelterName}`}
        size="md"
      >
        {completeModalItem && (
          <form onSubmit={handleConfirmFinalDelivery} className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="font-extrabold text-emerald-900 text-xs block">Langkah Akhir: Verifikasi Penyerahan Makanan di Panti</span>
              <p className="text-emerald-800 font-medium">
                Resi <strong>{completeModalItem.code}</strong> — {completeModalItem.foodName} ({completeModalItem.quantity}).
              </p>
            </div>

            {/* Photo Upload Input */}
            <div className="space-y-2">
              <label className="font-bold text-[#1B3A5C] block">
                Unggah Foto Bukti Penyerahan Produk di Panti (Wajib):
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center relative">
                {receiptPhotoProof ? (
                  <div className="space-y-2">
                    <img src={receiptPhotoProof} alt="Bukti Penerimaan" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setReceiptPhotoProof(null)}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Ganti Foto
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-1 block">
                    <div className="text-xl">📷</div>
                    <span className="font-bold text-[#1B3A5C] block">Klik untuk Ambil Foto / Upload Gambar Bukti</span>
                    <span className="text-[11px] text-slate-500 block">Ambil foto pengurus panti saat menerima paket makanan</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const url = URL.createObjectURL(e.target.files[0]);
                          setReceiptPhotoProof(url);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700">Catatan Penerimaan Pengurus Panti (Opsional):</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none"
                rows={2}
                placeholder="Catatan dari pengurus panti..."
                value={recipientNotes}
                onChange={(e) => setRecipientNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCompleteModalItem(null)}>
                Batal
              </Button>
              <Button type="submit" variant="gold" size="sm" className="font-extrabold shadow-md bg-emerald-600 text-white">
                Selesaikan Donasi & Set Status COMPLETED ➔
              </Button>
            </div>
          </form>
        )}
      </Modal>

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
