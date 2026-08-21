'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRScanner } from '@/components/qr/QRScanner';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function ProviderClaimsPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [pendingClaims, setPendingClaims] = useState([
    {
      code: 'FB-CLAIM-101',
      foodName: 'Bakso Sapi Komplit',
      userName: 'Budi Santoso (Konsumen)',
      quantity: '2 Porsi',
      status: 'PENDING PICKUP',
      time: 'Hari ini 19:30',
    },
    {
      code: 'FB-CLAIM-102',
      foodName: 'Roti Tawar & Aneka Danish',
      userName: 'Food Bank Surabaya (Rescue Partner)',
      quantity: '25 Pcs',
      status: 'MATCHED 96%',
      time: 'Hari ini 20:00',
    },
    {
      code: 'FB-CLAIM-103',
      foodName: 'Nasi Goreng Buffet + Ayam Bakar',
      userName: 'Panti Asuhan Kasih Ibu (Yayasan)',
      quantity: '30 Porsi',
      status: 'IN TRANSIT',
      time: 'Hari ini 21:00',
    },
  ]);

  const [completedClaims, setCompletedClaims] = useState([
    {
      code: 'FB-CLAIM-099',
      foodName: 'Buah Potong Segar',
      userName: 'Siti Aminah (Konsumen)',
      quantity: '5 Porsi',
      status: 'VERIFIED',
      time: '21 Aug 2026, 14:00',
    },
  ]);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    code: string;
    foodName: string;
    userName: string;
    quantity: string;
  }>({
    isOpen: false,
    code: '',
    foodName: '',
    userName: '',
    quantity: '',
  });

  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [courierName, setCourierName] = useState<string>('');
  const [conditionChecked, setConditionChecked] = useState<boolean>(true);

  const handleVerifyCode = async (code: string) => {
    // Deduct claim and move from Pending to Completed
    const target = pendingClaims.find((c) => c.code === code) || {
      code,
      foodName: 'Surplus Makanan',
      userName: 'Penglaim Terverifikasi',
      quantity: '1 Porsi',
      status: 'VERIFIED',
      time: new Date().toLocaleTimeString(),
    };

    setPendingClaims((prev) => prev.filter((c) => c.code !== code));
    setCompletedClaims((prev) => [{ ...target, status: 'VERIFIED' }, ...prev]);

    setToastState({
      isOpen: true,
      message: `🎉 Transaksi ${code} Berhasil Diverifikasi! Stok tersisa telah berkurang secara otomatis.`,
      type: 'success',
    });
    setShowScanner(false);
  };

  const openConfirmModal = (tx: (typeof pendingClaims)[0]) => {
    setConfirmModal({
      isOpen: true,
      code: tx.code,
      foodName: tx.foodName,
      userName: tx.userName,
      quantity: tx.quantity,
    });
    setCourierName(tx.userName);
    setProofPhoto('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60');
  };

  const executeConfirm = async () => {
    if (!conditionChecked) {
      setToastState({
        isOpen: true,
        message: 'Harap centang verifikasi kelayakan kondisi makanan sebelum menyelesaikan transaksi.',
        type: 'error',
      });
      return;
    }
    const code = confirmModal.code;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    await handleVerifyCode(code);
  };

  return (
    <div className="space-y-6">
      {/* Clean Top Banner Info */}
      <div className="bg-gradient-to-r from-[#1B3A5C] via-[#2C5A8F] to-[#1B3A5C] rounded-2xl p-6 text-white shadow-md border border-[#2C5A8F] space-y-1">
        <Badge variant="gold" size="sm" className="font-extrabold uppercase">
          Pusat Penyelamatan & Verifikasi Penjemputan
        </Badge>
        <h1 className="text-2xl font-black tracking-tight">Klaim & Penyelamatan Makanan</h1>
        <p className="text-xs text-slate-200">
          Verifikasi kode QR atau masukkan kode transaksi penjemputan fisik. Verifikasi sukses otomatis mengurangi porsi stok makanan secara real-time.
        </p>
      </div>

      {/* Dedicated Action Control Panel for Camera & QR Scanner (Poin 3) */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider block">
            Verifikasi Penjemputan Fisik
          </span>
          <h3 className="text-sm font-extrabold text-white">Gunakan Pindai Kamera QR untuk Verifikasi Cepat</h3>
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
          <span>{showScanner ? 'Tutup Pindai Kamera' : '📷 Pindai Kamera / Scan QR Code'}</span>
        </Button>
      </div>

      {showScanner && (
        <Card className="p-6 border-[#D4A843] bg-white">
          <QRScanner onScanSuccess={handleVerifyCode} />
        </Card>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'PENDING'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⏳ Menunggu Penjemputan ({pendingClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ✅ Riwayat Selesai ({completedClaims.length})
        </button>
      </div>

      {/* Transaction List (Poin 10) */}
      <Card className="bg-white border-slate-200">
        <CardBody className="p-4 space-y-3 text-xs">
          {(activeTab === 'PENDING' ? pendingClaims : completedClaims).length === 0 ? (
            <p className="text-center text-slate-400 py-6 font-semibold">Tidak ada transaksi di tab ini.</p>
          ) : (
            (activeTab === 'PENDING' ? pendingClaims : completedClaims).map((tx) => (
              <div
                key={tx.code}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#1B3A5C] text-sm">{tx.foodName}</span>
                    <Badge variant={activeTab === 'PENDING' ? 'warning' : 'success'} size="sm">
                      {tx.quantity}
                    </Badge>
                  </div>
                  <p className="text-slate-600 font-medium">Penerima: {tx.userName}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>
                      Kode Transaksi: <strong className="font-mono text-[#1B3A5C]">{tx.code}</strong>
                    </span>
                    <span>•</span>
                    <span>Waktu: {tx.time}</span>
                  </div>
                </div>

                {activeTab === 'PENDING' ? (
                  <Button variant="gold" size="sm" className="font-extrabold text-xs" onClick={() => openConfirmModal(tx)}>
                    Verifikasi Kode & Foto 📸
                  </Button>
                ) : (
                  <Badge variant="success" className="px-3 py-1 text-xs">
                    Selesai & Stok Berkurang
                  </Badge>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Verification Modal */}
      {confirmModal.isOpen && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          title="Verifikasi Bukti Serah Terima & Foto Fisik Makanan"
          size="lg"
        >
          <div className="space-y-5 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">Kode Transaksi:</span>
                <span className="font-mono font-extrabold text-[#1B3A5C] text-sm">{confirmModal.code}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Item Makanan:</span>
                <span className="font-bold text-slate-900">{confirmModal.foodName} ({confirmModal.quantity})</span>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-blue-50/60 rounded-xl border border-blue-100">
              <h4 className="font-extrabold text-[#1B3A5C] text-sm flex items-center gap-2">
                <span>Dokumentasi Foto Bukti Serah Terima Fisik</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative h-36 bg-slate-800 rounded-xl overflow-hidden border border-slate-300">
                  {proofPhoto && <img src={proofPhoto} alt="Foto Serah Terima" className="w-full h-full object-cover" />}
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    BUKTI SERAH TERIMA FISIK
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Nama Penjemput / Kurir Armada:</label>
                    <Input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Nama lengkap kurir" />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conditionChecked}
                  onChange={(e) => setConditionChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#1B3A5C] rounded border-slate-300 focus:ring-[#D4A843]"
                />
                <span className="text-xs font-bold text-slate-800 leading-snug">
                  Saya mengonfirmasi bahwa makanan diserahkan dalam keadaan utuh, higienis, dan sesuai dengan porsi yang terdaftar.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}>
                Batal
              </Button>
              <Button variant="gold" size="sm" className="font-extrabold" onClick={executeConfirm}>
                Selesaikan Verifikasi & Potong Stok ➔
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
