'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRScanner } from '@/components/qr/QRScanner';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function ProviderClaimsPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'IN_TRANSIT' | 'COMPLETED'>('PENDING');

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const defaultPending = [
    {
      code: 'FB-DON-88192',
      foodName: 'Nasi Ayam Bakar Specialty Pak Kumis',
      userName: 'Panti Asuhan Kasih Ibu (Yayasan)',
      quantity: '45 Porsi',
      status: 'AWAITING_RESCUE_PICKUP',
      time: 'Hari ini 19:00 WIB',
    },
    {
      code: 'FB-CLAIM-101',
      foodName: 'Bakso Sapi Urat Super',
      userName: 'Budi Santoso (Konsumen)',
      quantity: '2 Porsi',
      status: 'PENDING PICKUP',
      time: 'Hari ini 19:30 WIB',
    },
  ];

  const defaultInTransit = [
    {
      code: 'FB-CLAIM-103',
      foodName: 'Nasi Goreng Buffet + Ayam Bakar',
      userName: 'Rumah Singgah Anak Jalanan (Yayasan)',
      quantity: '25 Porsi',
      status: 'IN_TRANSIT',
      time: 'Hari ini 21:00 WIB',
    },
  ];

  const defaultCompleted = [
    {
      code: 'FB-DON-77182',
      foodName: 'Paket Roti Bakery Steril & Susu UHT',
      userName: 'Panti Werdha Lansia Sejahtera',
      quantity: '30 Paket',
      status: 'COMPLETED',
      time: '21 Aug 2026, 14:00 WIB',
      handoverProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const [pendingClaims, setPendingClaims] = useState<any[]>(defaultPending);
  const [inTransitClaims, setInTransitClaims] = useState<any[]>(defaultInTransit);
  const [completedClaims, setCompletedClaims] = useState<any[]>(defaultCompleted);

  // Sync with localStorage replate_claims
  useEffect(() => {
    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      if (savedClaimsStr) {
        const savedClaims = JSON.parse(savedClaimsStr);
        if (Array.isArray(savedClaims) && savedClaims.length > 0) {
          const pending = savedClaims
            .filter((c: any) => c.status === 'AWAITING_RESCUE_PICKUP' || c.status === 'READY_FOR_PICKUP' || c.status === 'PENDING PICKUP')
            .map((c: any) => ({
              code: c.claimCode || c.id,
              foodName: c.foodName,
              userName: c.shelterName || c.userName || 'Penerima Bantuan',
              quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
              status: c.status,
              time: c.readyTime || 'Hari ini',
            }));

          const inTransit = savedClaims
            .filter((c: any) => c.status === 'IN_TRANSIT' || c.status === 'PROVIDER_DELIVERING')
            .map((c: any) => ({
              code: c.claimCode || c.id,
              foodName: c.foodName,
              userName: c.shelterName || c.userName || 'Penerima Bantuan',
              quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
              status: 'IN_TRANSIT',
              time: 'Dalam Pengiriman OTW Panti',
            }));

          const completed = savedClaims
            .filter((c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED')
            .map((c: any) => ({
              code: c.claimCode || c.id,
              foodName: c.foodName,
              userName: c.shelterName || c.userName || 'Penerima Bantuan',
              quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
              status: 'COMPLETED',
              time: c.createdAt || 'Selesai',
              handoverProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
            }));

          if (pending.length > 0) setPendingClaims([...pending, ...defaultPending.filter(d => !pending.some(p => p.code === d.code))]);
          if (inTransit.length > 0) setInTransitClaims([...inTransit, ...defaultInTransit.filter(d => !inTransit.some(i => i.code === d.code))]);
          if (completed.length > 0) setCompletedClaims([...completed, ...defaultCompleted.filter(d => !completed.some(c => c.code === d.code))]);
        }
      }
    } catch (_) {}
  }, []);

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

  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; claim: any | null }>({
    isOpen: false,
    claim: null,
  });

  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [courierName, setCourierName] = useState<string>('');
  const [conditionChecked, setConditionChecked] = useState<boolean>(true);

  // Scan QR Code Verification at Store -> Updates Status to IN_TRANSIT (OTW to Panti)
  const handleVerifyCodeAtStore = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();

    const target = pendingClaims.find((c) => c.code.toUpperCase() === cleanCode) || {
      code: cleanCode,
      foodName: 'Surplus Makanan Steril',
      userName: 'Panti / Kurir Relawan Replate',
      quantity: 'Porsi Terverifikasi',
      status: 'IN_TRANSIT',
      time: 'OTW Pengiriman',
    };

    // Update state lists: Move from pending to inTransit
    setPendingClaims((prev) => prev.filter((c) => c.code.toUpperCase() !== cleanCode));
    const newInTransitItem = {
      ...target,
      status: 'IN_TRANSIT',
      time: 'OTW Dalam Pengiriman Ke Panti',
    };
    setInTransitClaims((prev) => [newInTransitItem, ...prev]);

    // Update localStorage replate_claims globally to IN_TRANSIT
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
      message: `🚚 QR Code "${cleanCode}" Valid! Paket Makanan Dihandover Ke Kurir. Status Diperbarui Menjadi IN_TRANSIT (OTW Ke Panti).`,
      type: 'success',
    });
    setShowScanner(false);
    setManualCodeInput('');
  };

  // Final Delivery Confirmation at Panti -> Updates Status to COMPLETED
  const handleConfirmFinalDelivery = (item: any) => {
    const cleanCode = item.code;

    setInTransitClaims((prev) => prev.filter((c) => c.code !== cleanCode));
    setCompletedClaims((prev) => [
      {
        ...item,
        status: 'COMPLETED',
        time: 'Baru Saja (Verified Penyerahan Panti)',
        handoverProof: proofPhoto || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
      ...prev,
    ]);

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

    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setToastState({
      isOpen: true,
      message: `🎉 Donasi "${cleanCode}" Berhasil Diserahkan & Diverifikasi di Panti! Status Permanen SELESAI (COMPLETED).`,
      type: 'success',
    });
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* High Contrast Banner */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-2">
        <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md inline-block shadow-xs">
          Pusat Penyelamatan & Integrasi QR Code
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Klaim & Penyelamatan Makanan</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-2xl font-medium">
          Scan Kode QR toko saat paket diserahkan ke Kurir (Status OTW Pengiriman). Status berubah permanen menjadi COMPLETED setelah makanan diverifikasi di Panti Asuhan.
        </p>
      </div>

      {/* Action Control Panel for Camera Scan QR & Manual Code Input */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider block">
              Penjemputan Makanan di Toko Anda
            </span>
            <h3 className="text-sm font-extrabold text-white">Scan QR Toko Saat Handover Makanan Ke Kurir (Set Status OTW)</h3>
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
            onClick={() => handleVerifyCodeAtStore(manualCodeInput)}
            className="font-extrabold shrink-0 text-xs shadow-md"
          >
            Verifikasi Handover Toko & Set OTW ➔
          </Button>
        </div>
      </div>

      {showScanner && (
        <Card className="p-6 border-[#D4A843] bg-white shadow-md">
          <QRScanner onScanSuccess={handleVerifyCodeAtStore} />
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
          Menunggu Penjemputan Toko ({pendingClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('IN_TRANSIT')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'IN_TRANSIT'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🚚 Dalam Pengantaran OTW Panti ({inTransitClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ✓ Donasi Selesai di Panti ({completedClaims.length})
        </button>
      </div>

      {/* Transaction List */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardBody className="p-4 space-y-3 text-xs">
          {(activeTab === 'PENDING' ? pendingClaims : activeTab === 'IN_TRANSIT' ? inTransitClaims : completedClaims).length === 0 ? (
            <p className="text-center text-slate-400 py-6 font-semibold">Tidak ada transaksi di tab ini.</p>
          ) : (
            (activeTab === 'PENDING' ? pendingClaims : activeTab === 'IN_TRANSIT' ? inTransitClaims : completedClaims).map((tx) => (
              <div
                key={tx.code}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#1B3A5C] text-sm">{tx.foodName}</span>
                    <Badge variant={activeTab === 'COMPLETED' ? 'success' : activeTab === 'IN_TRANSIT' ? 'warning' : 'primary'} size="sm">
                      {tx.quantity}
                    </Badge>
                  </div>
                  <p className="text-slate-600 font-medium">Penerima Bantuan: {tx.userName}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      Kode Resi QR: <strong className="font-mono text-[#1B3A5C] font-black">{tx.code}</strong>
                    </span>
                    <span>•</span>
                    <span>Status: <strong className="text-[#D4A843] font-bold">{tx.time}</strong></span>
                  </div>
                </div>

                {activeTab === 'PENDING' ? (
                  <Button variant="gold" size="sm" className="font-extrabold text-xs shadow-xs" onClick={() => openConfirmModal(tx)}>
                    Handover Ke Kurir & Set OTW ➔
                  </Button>
                ) : activeTab === 'IN_TRANSIT' ? (
                  <Button
                    variant="gold"
                    size="sm"
                    className="font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    onClick={() => handleConfirmFinalDelivery(tx)}
                  >
                    ✓ Verifikasi Sampai Panti & Set COMPLETED ➔
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                    onClick={() => setDetailModal({ isOpen: true, claim: tx })}
                  >
                    Lihat Detail & Foto Serah Terima ➔
                  </Button>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Detail Modal for Completed Claim */}
      {detailModal.isOpen && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, claim: null })}
          title={`Detail Transaksi Selesai: ${detailModal.claim?.code}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-emerald-900 font-black text-sm block">✓ Status: VERIFIED & SELESAI (COMPLETED)</span>
              <p className="text-emerald-800">
                Porsi makanan surplus sebanyak <strong>{detailModal.claim?.quantity}</strong> telah berhasil diserahkan di panti & diverifikasi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Item Makanan:</span>
                <span className="font-bold text-slate-900">{detailModal.claim?.foodName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nama Penerima:</span>
                <span className="font-bold text-slate-900">{detailModal.claim?.userName}</span>
              </div>
            </div>

            {detailModal.claim?.handoverProof && (
              <div className="space-y-1">
                <span className="font-extrabold text-[#1B3A5C] block">Foto Dokumentasi Serah Terima:</span>
                <img
                  src={detailModal.claim.handoverProof}
                  alt="Bukti Serah Terima"
                  className="w-full h-44 object-cover rounded-xl border border-slate-300"
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Verification Modal for Handover at Store */}
      {confirmModal.isOpen && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          title="Konfirmasi Handover Makanan Toko Ke Kurir (Set Status OTW)"
          size="lg"
        >
          <div className="space-y-5 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">Kode Resi QR Transaksi:</span>
                <span className="font-mono font-extrabold text-[#1B3A5C] text-sm">{confirmModal.code}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Item Makanan:</span>
                <span className="font-bold text-slate-900">{confirmModal.foodName} ({confirmModal.quantity})</span>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-blue-50/60 rounded-xl border border-blue-100">
              <h4 className="font-extrabold text-[#1B3A5C] text-sm">
                Konfirmasi Penyerahan Ke Kurir Relawan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative h-36 bg-slate-800 rounded-xl overflow-hidden border border-slate-300">
                  {proofPhoto && <img src={proofPhoto} alt="Foto Handover" className="w-full h-full object-cover" />}
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    BUKTI HANDOVER TOKO
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Nama Kurir Armada / Relawan:</label>
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
                  Saya mengonfirmasi bahwa makanan diserahkan ke kurir dalam keadaan segar, higienis, dan sesuai kuantitas porsi.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}>
                Batal
              </Button>
              <Button variant="gold" size="sm" className="font-extrabold" onClick={() => handleVerifyCodeAtStore(confirmModal.code)}>
                Konfirmasi Handover & Set Status OTW ➔
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
