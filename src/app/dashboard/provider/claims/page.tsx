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
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

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

  // Proof of handover photo state (Selfie / Proof photo)
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [courierName, setCourierName] = useState<string>('');
  const [conditionChecked, setConditionChecked] = useState<boolean>(true);

  const sampleTransactions = [
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
      userName: 'Panti Asuhan Kasih Ibu (Rescue Partner)',
      quantity: '30 Porsi',
      status: 'IN TRANSIT',
      time: 'Hari ini 21:00',
    },
  ];

  const handleVerifyCode = async (code: string) => {
    try {
      const res = await fetch('/api/qr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: code }),
      });
      const result = await res.json();
      if (result.success) {
        setToastState({
          isOpen: true,
          message: result.message || `Kode ${code} Berhasil Diverifikasi dengan Bukti Foto Serah Terima!`,
          type: 'success',
        });
        setShowScanner(false);
      } else {
        setToastState({
          isOpen: true,
          message: result.error || 'Verifikasi gagal, periksa kode transaksi.',
          type: 'error',
        });
      }
    } catch {
      setToastState({
        isOpen: true,
        message: 'Terjadi kesalahan koneksi.',
        type: 'error',
      });
    }
  };

  const openConfirmModal = (tx: (typeof sampleTransactions)[0]) => {
    setConfirmModal({
      isOpen: true,
      code: tx.code,
      foodName: tx.foodName,
      userName: tx.userName,
      quantity: tx.quantity,
    });
    setCourierName(tx.userName);
    // Simulated proof photo fallback
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Klaim & Verifikasi QR / Bukti Penjemputan</h2>
          <p className="text-xs text-slate-500 font-medium">
            Verifikasi kode QR & unggah foto selfie serah terima fisik makanan saat penjemputan.
          </p>
        </div>
        <Button variant="gold" size="md" className="font-bold flex items-center gap-2" onClick={() => setShowScanner(!showScanner)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          <span>{showScanner ? 'Tutup Scanner' : 'Pindai Kamera Scanner QR'}</span>
        </Button>
      </div>

      {/* Helper Box: Data Dummy Kode Transaksi */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
        <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider block">
          Kode Transaksi & Simulasi Verifikasi Foto Bukti Serah Terima
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleTransactions.map((tx) => (
            <button
              key={tx.code}
              onClick={() => openConfirmModal(tx)}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:border-amber-500 rounded-lg text-xs font-bold text-[#1B3A5C] shadow-2xs transition-all flex items-center gap-1.5"
            >
              <span className="font-mono text-[#D4A843]">{tx.code}</span>
              <span className="text-[11px] text-slate-500">({tx.foodName})</span>
            </button>
          ))}
        </div>
      </div>

      {showScanner && (
        <Card className="p-6 border-[#D4A843]">
          <QRScanner onScanSuccess={handleVerifyCode} />
        </Card>
      )}

      {/* Table / List Transactions */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-extrabold text-[#1B3A5C]">
            Daftar Transaksi Klaim Masuk (Siap Diambil)
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-xs">
          {sampleTransactions.map((tx) => (
            <div
              key={tx.code}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#1B3A5C] text-sm">{tx.foodName}</span>
                  <Badge variant="primary" size="sm">
                    {tx.quantity}
                  </Badge>
                </div>
                <p className="text-slate-600 font-medium">Penerima: {tx.userName}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Kode Transaksi: <strong className="font-mono text-[#1B3A5C]">{tx.code}</strong></span>
                  <span>•</span>
                  <span>Batas: {tx.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button variant="gold" size="sm" className="font-bold text-xs" onClick={() => openConfirmModal(tx)}>
                  Verifikasi Manual & Foto 📸
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Detailed Custom Verification Modal with Selfie & Handover Proof */}
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

          {/* Form Verifikasi Foto Bukti Serah Terima */}
          <div className="space-y-3 p-4 bg-blue-50/60 rounded-xl border border-blue-100">
            <h4 className="font-extrabold text-[#1B3A5C] text-sm flex items-center gap-2">
              <svg className="w-5 h-5 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 011.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span>Dokumentasi Foto Bukti Serah Terima Fisik</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Photo Preview */}
              <div className="relative h-36 bg-slate-800 rounded-xl overflow-hidden border border-slate-300">
                {proofPhoto ? (
                  <img src={proofPhoto} alt="Foto Serah Terima" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <span className="text-2xl">📸</span>
                    <span className="text-[11px] mt-1">Belum Ada Foto Terunggah</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                  BUKTI SERAH TERIMA FISIK
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Nama Penjemput / Kurir Armada:</label>
                  <Input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Nama lengkap kurir"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Simulasi Ambil Foto:</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold border-slate-300"
                    onClick={() =>
                      setProofPhoto('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60')
                    }
                  >
                    📸 Ambil Foto Selfie / Serah Terima Makanan
                  </Button>
                </div>
              </div>
            </div>

            {/* Checkbox Kelayakan */}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Batal
            </Button>
            <Button variant="gold" size="sm" className="font-extrabold" onClick={executeConfirm}>
              Selesaikan Verifikasi & Catat Dampak ➔
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Toast Notification */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
