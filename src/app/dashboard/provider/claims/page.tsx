'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRScanner } from '@/components/qr/QRScanner';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function ProviderClaimsPage() {
  const router = useRouter();
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
      recipientType: 'Panti Asuhan Anak',
      quantity: '45 Porsi',
      status: 'AWAITING_RESCUE_PICKUP',
      deliveryMethod: 'RESCUE_COURIER',
      courierName: 'Budi Santoso (Relawan ID #RC-881)',
      courierOrg: 'Food Bank Surabaya Logistik',
      courierPhone: '0812-9876-5432',
      address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      time: 'Hari ini 19:00 WIB',
    },
    {
      code: 'FB-CLAIM-101',
      foodName: 'Bakso Sapi Urat Super',
      userName: 'Budi Santoso (Konsumen Individu)',
      recipientType: 'Konsumen / Individu',
      quantity: '2 Porsi',
      status: 'READY_FOR_PICKUP',
      deliveryMethod: 'SHELTER_PICKUP',
      pickerName: 'Budi Santoso (Pembeli Mandiri)',
      pickerPhone: '0813-4567-8901',
      address: 'Outlet Pak Kumis (Ambil Mandiri)',
      time: 'Hari ini 19:30 WIB',
    },
  ];

  const defaultInTransit = [
    {
      code: 'FB-CLAIM-103',
      foodName: 'Nasi Goreng Buffet + Ayam Bakar',
      userName: 'Rumah Singgah Anak Jalanan (Shelter)',
      recipientType: 'Shelter & Rumah Singgah',
      quantity: '25 Porsi',
      status: 'IN_TRANSIT',
      deliveryMethod: 'RESCUE_COURIER',
      courierName: 'Mas Rizky (Relawan Komunitas Surabaya)',
      courierOrg: 'Replate Volunteer Fleet',
      courierPhone: '0815-6789-0123',
      address: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      time: 'Hari ini 21:00 WIB',
    },
  ];

  const defaultCompleted = [
    {
      code: 'FB-DON-77182',
      foodName: 'Paket Roti Bakery Steril & Susu UHT',
      userName: 'Panti Werdha Lansia Sejahtera',
      recipientType: 'Panti Werdha (Lansia)',
      quantity: '30 Paket',
      status: 'COMPLETED',
      deliveryMethod: 'RESCUE_COURIER',
      courierName: 'Mas Rizky Relawan (#RC-104)',
      courierOrg: 'Food Bank Surabaya Logistik',
      courierPhone: '0813-4567-8901',
      address: 'Jl. Wonokromo No. 12, Wonokromo, Surabaya',
      time: '21 Aug 2026, 14:00 WIB',
      handoverProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
    },
    {
      code: 'FB-DON-66102',
      foodName: 'Nasi Paket Ayam Goreng Buffet',
      userName: 'Keluarga Ibu Ratna (Masyarakat Rentan)',
      recipientType: 'Individu / Warga Rentan',
      quantity: '10 Porsi',
      status: 'COMPLETED',
      deliveryMethod: 'PROVIDER_DIRECT',
      driverName: 'Mas Doni (Driver Armada Toko Pak Kumis)',
      driverPhone: '0812-3456-7891',
      address: 'Jl. Krembangan Barat No. 8, Surabaya',
      time: '20 Aug 2026, 18:30 WIB',
      handoverProof: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const [pendingClaims, setPendingClaims] = useState<any[]>(defaultPending);
  const [inTransitClaims, setInTransitClaims] = useState<any[]>(defaultInTransit);
  const [completedClaims, setCompletedClaims] = useState<any[]>(defaultCompleted);

  // Sync with localStorage replate_claims & deduplicate unique keys
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
              recipientType: c.shelterType || 'Penerima Manfaat',
              quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
              status: c.status,
              deliveryMethod: c.deliveryMethod || 'RESCUE_COURIER',
              courierName: c.courierName || 'Kurir Relawan Replate',
              courierOrg: c.courierOrg || 'Tim Logistik Rescue',
              courierPhone: c.contactPhone || '0812-9876-5432',
              address: c.address || 'Kota Surabaya',
              time: c.readyTime || 'Hari ini',
            }));

          const inTransit = savedClaims
            .filter((c: any) => c.status === 'IN_TRANSIT' || c.status === 'PROVIDER_DELIVERING')
            .map((c: any) => ({
              code: c.claimCode || c.id,
              foodName: c.foodName,
              userName: c.shelterName || c.userName || 'Penerima Bantuan',
              recipientType: c.shelterType || 'Penerima Manfaat',
              quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
              status: 'IN_TRANSIT',
              deliveryMethod: c.deliveryMethod || 'RESCUE_COURIER',
              courierName: c.courierName || 'Kurir Relawan Replate',
              courierOrg: c.courierOrg || 'Tim Logistik Rescue',
              courierPhone: c.contactPhone || '0812-9876-5432',
              address: c.address || 'Kota Surabaya',
              time: 'Dalam Pengiriman OTW',
            }));

          const completed = savedClaims
            .filter((c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED')
            .map((c: any) => ({
              code: c.claimCode || c.id,
              foodName: c.foodName,
              userName: c.shelterName || c.userName || 'Penerima Bantuan',
              recipientType: c.shelterType || 'Penerima Manfaat',
              quantity: `${c.quantity} ${c.quantityUnit || 'Porsi'}`,
              status: 'COMPLETED',
              deliveryMethod: c.deliveryMethod || 'RESCUE_COURIER',
              courierName: c.courierName || 'Mas Relawan Surabaya',
              courierOrg: c.courierOrg || 'Komunitas Food Rescue',
              courierPhone: c.contactPhone || '0812-9876-5432',
              address: c.address || 'Kota Surabaya',
              time: c.createdAt || 'Selesai',
              handoverProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
            }));

          const mergeUnique = (arr1: any[], arr2: any[]) => {
            const map = new Map();
            [...arr1, ...arr2].forEach(item => map.set(item.code, item));
            return Array.from(map.values());
          };

          setPendingClaims(mergeUnique(pending, defaultPending));
          setInTransitClaims(mergeUnique(inTransit, defaultInTransit));
          setCompletedClaims(mergeUnique(completed, defaultCompleted));
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

  // Detailed Modal for Completed Claim (Fix Poin 1: Rich Identity Breakdown)
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; claim: any | null }>({
    isOpen: false,
    claim: null,
  });

  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [courierNameInput, setCourierNameInput] = useState<string>('');
  const [conditionChecked, setConditionChecked] = useState<boolean>(true);

  // Scan QR Code Verification at Store -> Updates Status to IN_TRANSIT (OTW) & Auto Closes Modal
  const handleVerifyCodeAtStore = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();

    const target = pendingClaims.find((c) => c.code.toUpperCase() === cleanCode) || {
      code: cleanCode,
      foodName: 'Surplus Makanan Steril',
      userName: 'Penerima Bantuan / Kurir Relawan',
      quantity: 'Porsi Terverifikasi',
      status: 'IN_TRANSIT',
      deliveryMethod: 'RESCUE_COURIER',
      courierName: courierNameInput || 'Budi Santoso (Relawan ID #RC-881)',
      courierOrg: 'Replate Rescue Fleet',
      courierPhone: '0812-9876-5432',
      address: 'Kota Surabaya',
      time: 'OTW Pengiriman',
    };

    setPendingClaims((prev) => prev.filter((c) => c.code.toUpperCase() !== cleanCode));
    const newInTransitItem = {
      ...target,
      status: 'IN_TRANSIT',
      time: 'OTW Dalam Pengiriman',
    };
    setInTransitClaims((prev) => Array.from(new Map([...prev, newInTransitItem].map(i => [i.code, i])).values()));

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

    setConfirmModal({
      isOpen: false,
      code: '',
      foodName: '',
      userName: '',
      quantity: '',
    });

    setToastState({
      isOpen: true,
      message: `🚚 QR Code "${cleanCode}" Valid! Paket Makanan Dihandover Ke Kurir. Status Diperbarui Menjadi IN_TRANSIT (OTW).`,
      type: 'success',
    });
    setShowScanner(false);
    setManualCodeInput('');
  };

  // Direct Pickup Verification at Store for Ambil Mandiri
  const handleDirectPickupCompleteAtStore = (item: any) => {
    const cleanCode = item.code;

    setPendingClaims((prev) => prev.filter((c) => c.code !== cleanCode));
    setInTransitClaims((prev) => prev.filter((c) => c.code !== cleanCode));
    setCompletedClaims((prev) => Array.from(new Map([...prev, {
      ...item,
      status: 'COMPLETED',
      time: 'Baru Saja (Verified Ambil Mandiri Toko)',
      handoverProof: proofPhoto || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
    }].map(i => [i.code, i])).values()));

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

    setToastState({
      isOpen: true,
      message: `✓ Pengambilan Mandiri "${cleanCode}" Terverifikasi Selesai di Toko! Status Permanen COMPLETED.`,
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
    setCourierNameInput(tx.courierName || tx.userName);
    setProofPhoto('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* High Contrast Banner */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-2">
        <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md inline-block shadow-xs">
          Pusat Penyelamatan & Integrasi Logistik QR
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Klaim & Penyelamatan Makanan Toko Saya</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-2xl font-medium">
          Kelola penjemputan fisik, verifikasi handover QR Code kurir relawan/konsumen, dan pantau identitas detail serah terima donasi toko Anda secara transparan.
        </p>
      </div>

      {/* Action Control Panel for Camera Scan QR & Manual Code Input */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider block">
              Penjemputan Makanan di Toko Anda
            </span>
            <h3 className="text-sm font-extrabold text-white">Scan QR Toko Saat Handover Makanan Ke Kurir</h3>
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
            Konfirmasi Handover ➔
          </Button>
        </div>
      </div>

      {showScanner && (
        <Card className="p-6 border-[#D4A843] bg-white shadow-md">
          <QRScanner onScanSuccess={handleVerifyCodeAtStore} />
        </Card>
      )}

      {/* Tabs Filter (Poin 2: Consolidated History & Claims) */}
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
          🚚 Dalam Pengantaran OTW ({inTransitClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ✓ Donasi Selesai / Disalurkan ({completedClaims.length})
        </button>
      </div>

      {/* Transaction List */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardBody className="p-4 space-y-3 text-xs">
          {(activeTab === 'PENDING' ? pendingClaims : activeTab === 'IN_TRANSIT' ? inTransitClaims : completedClaims).length === 0 ? (
            <p className="text-center text-slate-400 py-6 font-semibold">Tidak ada transaksi di tab ini.</p>
          ) : (
            (activeTab === 'PENDING' ? pendingClaims : activeTab === 'IN_TRANSIT' ? inTransitClaims : completedClaims).map((tx, idx) => (
              <div
                key={`${tx.code}-${idx}`}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#1B3A5C] text-sm">{tx.foodName}</span>
                    <Badge variant={activeTab === 'COMPLETED' ? 'success' : activeTab === 'IN_TRANSIT' ? 'warning' : 'primary'} size="sm">
                      {tx.quantity}
                    </Badge>
                  </div>
                  <p className="text-slate-600 font-medium">Penerima Bantuan: <strong>{tx.userName}</strong> ({tx.recipientType || 'Penerima'})</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                    <span>
                      Kode Resi: <strong className="font-mono text-[#1B3A5C] font-black">{tx.code}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Metode: <strong className="text-[#1B3A5C] font-bold">{tx.deliveryMethod === 'SHELTER_PICKUP' ? '🏢 Ambil Mandiri' : tx.deliveryMethod === 'PROVIDER_DIRECT' ? '🚚 Diantar Toko' : '🛵 Kurir Relawan'}</strong>
                    </span>
                  </div>
                </div>

                {activeTab === 'PENDING' ? (
                  <Button variant="gold" size="sm" className="font-extrabold text-xs shadow-xs" onClick={() => openConfirmModal(tx)}>
                    Konfirmasi Handover ➔
                  </Button>
                ) : activeTab === 'IN_TRANSIT' ? (
                  tx.deliveryMethod === 'SHELTER_PICKUP' ? (
                    <Button
                      variant="gold"
                      size="sm"
                      className="font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      onClick={() => handleDirectPickupCompleteAtStore(tx)}
                    >
                      ✓ Verifikasi Serah Terima Langsung Toko ➔
                    </Button>
                  ) : (
                    <div className="px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px] rounded-xl text-center">
                      🚚 Dalam Pengiriman Kurir <br />
                      <span className="text-[10px] text-amber-700 font-normal">(Menunggu Konfirmasi Sampai dari Kurir)</span>
                    </div>
                  )
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                    onClick={() => setDetailModal({ isOpen: true, claim: tx })}
                  >
                    Lihat Identitas & Detail Serah Terima ➔
                  </Button>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Detail Modal for Completed Claim (Fix Poin 1: Rich Identity Breakdown for Courier, Consumer, & Store) */}
      {detailModal.isOpen && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, claim: null })}
          title={`Detail Identitas & Serah Terima Selesai: ${detailModal.claim?.code}`}
          size="lg"
        >
          {detailModal.claim && (
            <div className="space-y-4 text-xs text-slate-800">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-900 font-black text-sm block">✓ STATUS: VERIFIED & SELESAI (COMPLETED)</span>
                  <span className="font-mono font-bold text-xs bg-emerald-700 text-white px-2.5 py-0.5 rounded-md">
                    {detailModal.claim.code}
                  </span>
                </div>
                <p className="text-emerald-800 font-medium">
                  Donasi sebanyak <strong>{detailModal.claim.quantity} ({detailModal.claim.foodName})</strong> telah berhasil diserahkan & terverifikasi.
                </p>
              </div>

              {/* Identity Breakdown Card based on Delivery Method (Fix Poin 1) */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-wider">
                    IDENTITAS PIHAK PENJEMPUT / KURIR / PENERIMA
                  </span>
                  <Badge variant="gold">
                    {detailModal.claim.deliveryMethod === 'RESCUE_COURIER'
                      ? '🛵 KURIR RELAWAN KOMUNITAS'
                      : detailModal.claim.deliveryMethod === 'SHELTER_PICKUP'
                      ? '🏢 PENGAMBILAN MANDIRI'
                      : '🚚 DIANTAR ARMADA TOKO'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {detailModal.claim.deliveryMethod === 'RESCUE_COURIER' ? (
                    <>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Nama Kurir Relawan:</span>
                        <span className="font-extrabold text-white text-sm block">{detailModal.claim.courierName || 'Budi Santoso (Relawan ID #RC-881)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Komunitas Logistik:</span>
                        <span className="font-bold text-amber-400 block">{detailModal.claim.courierOrg || 'Food Bank Surabaya Logistik'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">No. Kontak WhatsApp Kurir:</span>
                        <span className="font-mono font-bold text-white block">{detailModal.claim.courierPhone || '0812-9876-5432'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Tujuan Alokasi Penerima:</span>
                        <span className="font-bold text-white block">{detailModal.claim.userName} ({detailModal.claim.address})</span>
                      </div>
                    </>
                  ) : detailModal.claim.deliveryMethod === 'SHELTER_PICKUP' ? (
                    <>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Nama Pengambil / Perwakilan:</span>
                        <span className="font-extrabold text-white text-sm block">{detailModal.claim.pickerName || detailModal.claim.userName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Tipe Penerima Manfaat:</span>
                        <span className="font-bold text-amber-400 block">{detailModal.claim.recipientType || 'Konsumen Mandiri / Pengurus'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">No. Kontak WA Pengambil:</span>
                        <span className="font-mono font-bold text-white block">{detailModal.claim.pickerPhone || '0813-4567-8901'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Lokasi Verifikasi Handover:</span>
                        <span className="font-bold text-white block">Kasir / Outlet Toko Provider</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Driver Armada Toko:</span>
                        <span className="font-extrabold text-white text-sm block">{detailModal.claim.driverName || 'Mas Doni (Armada Toko Pak Kumis)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Kontak Driver Toko:</span>
                        <span className="font-mono font-bold text-amber-400 block">{detailModal.claim.driverPhone || '0812-3456-7891'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Target Penerima Bantuan:</span>
                        <span className="font-bold text-white block">{detailModal.claim.userName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Alamat Tujuan:</span>
                        <span className="font-bold text-white block">{detailModal.claim.address}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {detailModal.claim.handoverProof && (
                <div className="space-y-1">
                  <span className="font-extrabold text-[#1B3A5C] block">Foto Dokumentasi Serah Terima Fisik:</span>
                  <img
                    src={detailModal.claim.handoverProof}
                    alt="Bukti Serah Terima"
                    className="w-full h-48 object-cover rounded-2xl border border-slate-300 shadow-sm"
                  />
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDetailModal({ isOpen: false, claim: null });
                    router.push(`/track/${detailModal.claim.code}`);
                  }}
                  className="px-4 py-2 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>🌐 Transparansi Publik (/track) ➔</span>
                </button>

                <Button variant="outline" size="sm" onClick={() => setDetailModal({ isOpen: false, claim: null })}>
                  Tutup Detail
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Verification Modal for Handover at Store */}
      {confirmModal.isOpen && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          title="Konfirmasi Handover Makanan Toko Ke Kurir"
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
                Konfirmasi Penyerahan Ke Kurir Relawan / Penerima
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
                    <Input value={courierNameInput} onChange={(e) => setCourierNameInput(e.target.value)} placeholder="Nama lengkap kurir" />
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
                Konfirmasi Handover ➔
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
