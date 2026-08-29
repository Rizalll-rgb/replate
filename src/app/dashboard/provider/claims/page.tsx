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
  const [activeTab, setActiveTab] = useState<'PAYMENT_VERIFY' | 'PENDING_PICKUP' | 'IN_TRANSIT' | 'COMPLETED'>('PAYMENT_VERIFY');

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [paymentInspectModal, setPaymentInspectModal] = useState<{ isOpen: boolean; claim: any | null }>({
    isOpen: false,
    claim: null,
  });

  const [issuedTicketModal, setIssuedTicketModal] = useState<{ isOpen: boolean; claim: any | null }>({
    isOpen: false,
    claim: null,
  });

  // In-Workspace Live Courier Tracking & Audit Log Modal (Point 1 & 7)
  const [liveTrackingModal, setLiveTrackingModal] = useState<{ isOpen: boolean; claim: any | null }>({
    isOpen: false,
    claim: null,
  });

  const defaultPending = [
    {
      code: 'FB-SALE-99102',
      foodName: 'Nasi Goreng Buffet Specialty',
      userName: 'Ahmad Fauzi (Konsumen Umum)',
      recipientPerson: 'Ahmad Fauzi',
      recipientPhone: '0812-7766-5544',
      recipientType: 'Konsumen Umum (Rescue Sale)',
      quantity: '3 Porsi',
      amountPaid: 15000,
      paymentMethod: 'MANUAL_TRANSFER_QRIS',
      status: 'PAYMENT_PROOF_UPLOADED',
      deliveryMethod: 'SHELTER_PICKUP',
      paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
      address: 'Outlet Pak Kumis (Ambil Mandiri)',
      time: 'Hari ini 20:00 WIB',
    },
    {
      code: 'FB-DON-88192',
      foodName: 'Nasi Ayam Bakar Specialty Pak Kumis',
      userName: 'Panti Asuhan Kasih Ibu (Yayasan)',
      recipientPerson: 'Ibu Ratna (Ketua Pengurus Panti)',
      recipientPhone: '0812-3344-5566',
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
      recipientPerson: 'Pak Budi Santoso (Penerima Mandiri)',
      recipientPhone: '0813-4567-8901',
      recipientType: 'Konsumen / Individu',
      quantity: '2 Porsi',
      status: 'READY_FOR_PICKUP',
      deliveryMethod: 'SHELTER_PICKUP',
      pickerName: 'Budi Santoso (Pembeli Mandiri)',
      pickerPhone: '0813-4567-8901',
      address: 'Outlet Pak Kumis (Ambil Mandiri)',
      time: 'Hari ini 19:30 WIB',
    },
    {
      code: 'FB-DIR-88291',
      foodName: 'Paket Rice Bowl Ayam Geprek (Diantar Toko)',
      userName: 'Panti Asuhan Wonokromo (Panti A)',
      recipientPerson: 'Pak Mahmud (Pengurus Panti A)',
      recipientPhone: '0812-4455-6677',
      recipientType: 'Panti Asuhan Anak',
      quantity: '40 Porsi',
      status: 'READY_FOR_PICKUP',
      deliveryMethod: 'PROVIDER_DIRECT',
      courierName: 'Driver B: Mas Agus (Plat L 1234 XYZ)',
      courierOrg: 'Armada Driver Toko Pak Kumis',
      courierPhone: '0813-9876-5432',
      address: 'Jl. Wonokromo No. 45, Wonokromo, Surabaya',
      time: 'Hari ini 19:30 WIB',
    },
  ];

  const defaultInTransit = [
    {
      code: 'FB-CLAIM-103',
      foodName: 'Nasi Goreng Buffet + Ayam Bakar',
      userName: 'Rumah Singgah Anak Jalanan (Shelter)',
      recipientPerson: 'Pak Heru (Koordinator Dapur Rumah Singgah)',
      recipientPhone: '0815-9988-7766',
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
    {
      code: 'FB-DIR-99382',
      foodName: 'Menu Surplus Bakso Urat & Soto Sapi',
      userName: 'Siti Aminah (Konsumen B)',
      recipientPerson: 'Siti Aminah (Pembeli Rescue Sale)',
      recipientPhone: '0813-8877-6655',
      recipientType: 'Konsumen / Rescue Sale',
      quantity: '5 Porsi',
      status: 'IN_TRANSIT',
      deliveryMethod: 'PROVIDER_DIRECT',
      courierName: 'Driver A: Mas Doni (Plat L 4582 ABC)',
      courierOrg: 'Armada Driver Toko Pak Kumis',
      courierPhone: '0812-3456-7890',
      address: 'Jl. Rungkut Asri No. 12, Rungkut, Surabaya',
      time: 'Dalam Pengiriman Armada Toko (OTW)',
    },
  ];

  const defaultCompleted = [
    {
      code: 'FB-DON-77182',
      foodName: 'Paket Roti Bakery Steril & Susu UHT',
      userName: 'Panti Werdha Lansia Sejahtera',
      recipientPerson: 'Suster Maria (PJ Konsumsi Panti Werdha)',
      recipientPhone: '0811-2233-4455',
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
      recipientPerson: 'Ibu Ratna (Kepala Keluarga Rentan)',
      recipientPhone: '0812-7788-9900',
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
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      const savedClaimsStr = localStorage.getItem('replate_claims');
      const savedActiveClaimsStr = localStorage.getItem('replate_active_claims');
      
      let allSavedClaims: any[] = [];
      if (savedClaimsStr) allSavedClaims = [...allSavedClaims, ...JSON.parse(savedClaimsStr)];
      if (savedActiveClaimsStr) allSavedClaims = [...allSavedClaims, ...JSON.parse(savedActiveClaimsStr)];

      if (isFresh && allSavedClaims.length === 0) {
        setPendingClaims([]);
        setInTransitClaims([]);
        setCompletedClaims([]);
        return;
      }

      if (allSavedClaims.length > 0) {
        const pending = allSavedClaims
          .filter((c: any) => c.status === 'AWAITING_RESCUE_PICKUP' || c.status === 'READY_FOR_PICKUP' || c.status === 'PENDING PICKUP' || c.status === 'AWAITING_VERIFICATION' || c.status === 'WAITING_PAYMENT_APPROVAL')
            .map((c: any) => ({
              code: c.claimCode || c.code || c.id,
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
              paymentProofUrl: c.paymentProof || c.paymentProofUrl,
            }));

          const inTransit = allSavedClaims
            .filter((c: any) => c.status === 'IN_TRANSIT' || c.status === 'PROVIDER_DELIVERING')
            .map((c: any) => ({
              code: c.claimCode || c.code || c.id,
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

          const completed = allSavedClaims
            .filter((c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED')
            .map((c: any) => ({
              code: c.claimCode || c.code || c.id,
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
    } catch (_) {}
  }, []);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    code: string;
    foodName: string;
    userName: string;
    quantity: string;
    deliveryMethod?: string;
    courierName?: string;
    courierOrg?: string;
    courierPhone?: string;
    recipientPerson?: string;
    address?: string;
  }>({
    isOpen: false,
    code: '',
    foodName: '',
    userName: '',
    quantity: '',
    deliveryMethod: 'RESCUE_COURIER',
  });

  // Detailed Modal for Completed Claim (Fix Poin 1: Rich Identity Breakdown)
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; claim: any | null }>({
    isOpen: false,
    claim: null,
  });

  // Incident & Dispute Resolution State (Pencegahan & Perlindungan Produk / Driver)
  const [incidentModal, setIncidentModal] = useState<{
    isOpen: boolean;
    claim: any | null;
    issueType: string;
    description: string;
    photoProof: string | null;
  }>({
    isOpen: false,
    claim: null,
    issueType: 'PACKAGING_DAMAGED',
    description: '',
    photoProof: null,
  });

  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [courierNameInput, setCourierNameInput] = useState<string>('');
  const [selectedStoreDriver, setSelectedStoreDriver] = useState<string>('Driver A: Mas Doni (Plat L 4582 ABC)');
  const [conditionChecked, setConditionChecked] = useState<boolean>(true);

  // List of Registered Store Fleet Drivers
  const storeDriversList = [
    { id: 'drv-1', name: 'Driver A: Mas Doni', vehicle: 'Motor Box Steril (Plat L 4582 ABC)', phone: '0812-3456-7890' },
    { id: 'drv-2', name: 'Driver B: Mas Agus', vehicle: 'Mobil Blind Van Pendingin (Plat L 1234 XYZ)', phone: '0813-9876-5432' },
  ];

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

  const handleApprovePaymentProof = (cleanCode: string) => {
    const target = pendingClaims.find((c) => c.code === cleanCode);
    setPendingClaims((prev) =>
      prev.map((c) =>
        c.code === cleanCode ? { ...c, status: 'READY_FOR_PICKUP' } : c
      )
    );
    
    try {
      const savedActiveStr = localStorage.getItem('replate_active_claims');
      if (savedActiveStr) {
        let activeClaims = JSON.parse(savedActiveStr);
        activeClaims = activeClaims.map((c: any) => 
          c.id === cleanCode || c.code === cleanCode ? { ...c, status: 'READY_FOR_PICKUP' } : c
        );
        localStorage.setItem('replate_active_claims', JSON.stringify(activeClaims));
      }
    } catch (_) {}

    setPaymentInspectModal({ isOpen: false, claim: null });
    if (target) {
      setIssuedTicketModal({
        isOpen: true,
        claim: { ...target, status: 'READY_FOR_PICKUP' },
      });
    }
    setToastState({
      isOpen: true,
      message: `Bukti Bayar Transfer/QRIS Resi "${cleanCode}" Berhasil Diverifikasi Lunas! Tiket QR Klaim Aktif.`,
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
      deliveryMethod: tx.deliveryMethod || 'RESCUE_COURIER',
      courierName: tx.courierName || '',
      courierOrg: tx.courierOrg || '',
      courierPhone: tx.courierPhone || '',
      recipientPerson: tx.recipientPerson || '',
      address: tx.address || '',
    });
    setCourierNameInput(tx.courierName || tx.userName);
    setProofPhoto('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60');
  };

  // Filter payment claims vs pickup claims
  const paymentClaims = pendingClaims.filter(
    (c) => c.status === 'PAYMENT_PROOF_UPLOADED' || c.status === 'WAITING_PAYMENT_AT_STORE' || c.status === 'AWAITING_VERIFICATION' || c.status === 'WAITING_PAYMENT_APPROVAL'
  );
  const pickupClaims = pendingClaims.filter(
    (c) => c.status !== 'PAYMENT_PROOF_UPLOADED' && c.status !== 'WAITING_PAYMENT_AT_STORE' && c.status !== 'AWAITING_VERIFICATION' && c.status !== 'WAITING_PAYMENT_APPROVAL'
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* High Contrast Banner */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-2">
        <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md inline-block shadow-xs">
          Pusat Penyelamatan & Integrasi Logistik QR
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Klaim & Penyelamatan Makanan Toko Saya</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-2xl font-medium">
          Verifikasi pembayaran booking transfer/QRIS, pindai QR tiket serah terima makanan, dan pantau penyaluran real-time ke panti asuhan & penerima manfaat.
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
            variant={showScanner ? 'outline' : 'gold'}
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

        {/* Manual Code Input & Quick Resi Tracker Bar (Point 10) */}
        <div className="flex flex-col sm:flex-row items-center gap-2 border-t border-slate-800 pt-3">
          <Input
            placeholder="Ketik / Tempel Kode Resi (Contoh: FB-DON-88192 / FB-SALE-99102)..."
            value={manualCodeInput}
            onChange={(e) => setManualCodeInput(e.target.value)}
            className="text-xs bg-slate-800 text-white border-slate-700 placeholder-slate-400 flex-1"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              disabled={!manualCodeInput.trim()}
              onClick={() => {
                const found = [...pendingClaims, ...inTransitClaims, ...completedClaims, ...paymentClaims].find(
                  (c) => c.code.toLowerCase() === manualCodeInput.trim().toLowerCase()
                );
                if (found) {
                  setLiveTrackingModal({ isOpen: true, claim: found });
                } else {
                  // Fallback generate preview tracking for any valid format
                  setLiveTrackingModal({
                    isOpen: true,
                    claim: {
                      code: manualCodeInput.trim().toUpperCase(),
                      foodName: 'Paket Surplus Donasi Pangan',
                      userName: 'Penerima Terdaftar Surabaya',
                      quantity: '1 Porsi',
                      status: 'IN_TRANSIT',
                      deliveryMethod: manualCodeInput.includes('DIR') ? 'PROVIDER_DIRECT' : 'RESCUE_COURIER',
                      courierName: 'Budi Santoso (Relawan ID #RC-881)',
                      courierOrg: 'Food Bank Surabaya Logistik',
                      courierPhone: '0812-9876-5432',
                      address: 'Surabaya Raya',
                    },
                  });
                }
              }}
              className="font-extrabold text-xs text-white border-slate-600 hover:bg-slate-800 flex-1 sm:flex-initial"
            >
              🔍 Lacak Status Resi ➔
            </Button>
            <Button
              variant="gold"
              size="md"
              disabled={!manualCodeInput.trim()}
              onClick={() => handleVerifyCodeAtStore(manualCodeInput)}
              className="font-black text-xs shadow-md text-slate-950 flex-1 sm:flex-initial"
            >
              Konfirmasi Handover ➔
            </Button>
          </div>
        </div>
      </div>

      {showScanner && (
        <Card className="p-6 border-[#D4A843] bg-white shadow-md">
          <QRScanner onScanSuccess={handleVerifyCodeAtStore} />
        </Card>
      )}

      {/* Tabs Filter (Poin 3: Separate Payment Verification vs Handover Claims) */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold flex-wrap">
        <button
          onClick={() => setActiveTab('PAYMENT_VERIFY')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'PAYMENT_VERIFY'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>💳 Verifikasi Pembayaran Rescue Sale</span>
          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md">
            {paymentClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PENDING_PICKUP')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'PENDING_PICKUP'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📦 Penyelamatan & Handover Makanan</span>
          <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-md">
            {pickupClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('IN_TRANSIT')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'IN_TRANSIT'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🚚 Dalam Pengantaran OTW</span>
          <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-black rounded-md">
            {inTransitClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'COMPLETED'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>✓ Riwayat Klaim Selesai</span>
          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-md">
            {completedClaims.length}
          </span>
        </button>
      </div>

      {/* Transaction List */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardBody className="p-4 space-y-3 text-xs">
          {(() => {
            const currentList =
              activeTab === 'PAYMENT_VERIFY'
                ? paymentClaims
                : activeTab === 'PENDING_PICKUP'
                ? pickupClaims
                : activeTab === 'IN_TRANSIT'
                ? inTransitClaims
                : completedClaims;

            if (currentList.length === 0) {
              return (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-xl">
                    📭
                  </div>
                  <p className="text-sm font-bold text-slate-700">Belum Ada Transaksi di Tab Ini</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                    Klaim donasi atau pesanan Rescue Sale dari konsumen dan panti asuhan akan otomatis masuk ke tab ini.
                  </p>
                </div>
              );
            }

            return currentList.map((tx, idx) => {
              const displayQty = tx.quantity
                ? (String(tx.quantity).includes('Porsi') || String(tx.quantity).includes('Pcs') || String(tx.quantity).includes('Box')
                    ? String(tx.quantity)
                    : `${tx.quantity} Porsi`)
                : '1 Porsi';

              return (
                <div
                  key={`${tx.code}-${idx}`}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#1B3A5C] text-sm">{tx.foodName}</span>
                      <Badge variant={activeTab === 'COMPLETED' ? 'success' : activeTab === 'IN_TRANSIT' ? 'warning' : 'primary'} size="sm">
                        {displayQty}
                      </Badge>
                    </div>
                    <p className="text-slate-600 font-medium">Penerima / Pembeli: <strong>{tx.userName}</strong> ({tx.recipientType || 'Penerima'})</p>
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

                {activeTab === 'PAYMENT_VERIFY' ? (
                  <Button
                    variant="gold"
                    size="sm"
                    className="font-extrabold text-xs shadow-xs flex items-center gap-1.5"
                    onClick={() => setPaymentInspectModal({ isOpen: true, claim: tx })}
                  >
                    <span>💳 Inspect Struk Bayar & Verifikasi Lunas ➔</span>
                  </Button>
                ) : activeTab === 'PENDING_PICKUP' ? (
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
                  ) : tx.deliveryMethod === 'PROVIDER_DIRECT' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        variant="gold"
                        size="sm"
                        className="font-black text-xs shadow-xs flex items-center gap-1"
                        onClick={() => setLiveTrackingModal({ isOpen: true, claim: tx })}
                      >
                        <span>📍 Live Tracking Driver Toko ➔</span>
                      </Button>
                      <a
                        href={`/driver-manifest/${tx.code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] !text-white hover:!text-white focus:!text-white active:!text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span className="!text-white font-extrabold">📲 Surat Jalan Driver ➔</span>
                      </a>
                      <Button
                        variant="primary"
                        size="sm"
                        className="font-black text-xs shadow-xs"
                        onClick={() => handleDirectPickupCompleteAtStore(tx)}
                      >
                        ✓ Selesai ➔
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        variant="gold"
                        size="sm"
                        className="font-black text-xs shadow-xs flex items-center gap-1"
                        onClick={() => setLiveTrackingModal({ isOpen: true, claim: tx })}
                      >
                        <span>🛵 Status Live Tracking Kurir Komunitas ➔</span>
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                      onClick={() => setLiveTrackingModal({ isOpen: true, claim: tx })}
                    >
                      <span>📋 Audit Log & Timeline ➔</span>
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      className="font-extrabold text-xs shadow-xs"
                      onClick={() => setDetailModal({ isOpen: true, claim: tx })}
                    >
                      Detail Serah Terima ➔
                    </Button>
                  </div>
                )}
              </div>
            );
          });
        })()}
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
                        <span className="text-slate-400 text-[10px] block">No. Kontak WA Kurir:</span>
                        <span className="font-mono font-bold text-white block">{detailModal.claim.courierPhone || '0812-9876-5432'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Nama Penerima Manfaat / Pengurus:</span>
                        <span className="font-extrabold text-emerald-400 block">{detailModal.claim.recipientPerson || 'Ibu Ratna (Pengurus)'} ({detailModal.claim.recipientPhone || '0812-3344-5566'})</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 text-[10px] block">Tujuan Alokasi & Alamat Penerima:</span>
                        <span className="font-bold text-white block">{detailModal.claim.userName} • {detailModal.claim.address}</span>
                      </div>
                    </>
                  ) : detailModal.claim.deliveryMethod === 'SHELTER_PICKUP' ? (
                    <>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Nama Pengambil / Perwakilan:</span>
                        <span className="font-extrabold text-white text-sm block">{detailModal.claim.recipientPerson || detailModal.claim.pickerName || detailModal.claim.userName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Tipe Penerima Manfaat:</span>
                        <span className="font-bold text-amber-400 block">{detailModal.claim.recipientType || 'Konsumen Mandiri / Pengurus'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">No. Kontak WA Penerima:</span>
                        <span className="font-mono font-bold text-white block">{detailModal.claim.recipientPhone || detailModal.claim.pickerPhone || '0813-4567-8901'}</span>
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
                        <span className="text-slate-400 text-[10px] block">Target Nama Penerima:</span>
                        <span className="font-extrabold text-emerald-400 block">{detailModal.claim.recipientPerson || detailModal.claim.userName} ({detailModal.claim.recipientPhone || '0812-7788-9900'})</span>
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
                  <span>📋 Audit Log Resi Transaksi ➔</span>
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
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-[#1B3A5C] text-sm">
                  {confirmModal.deliveryMethod === 'RESCUE_COURIER'
                    ? 'Serah Terima Paket ke Kurir Relawan Komunitas'
                    : confirmModal.deliveryMethod === 'SHELTER_PICKUP'
                    ? 'Serah Terima Ambil Mandiri di Kasir Toko'
                    : 'Penugasan Pengantaran Driver Toko Sendiri'}
                </h4>
                <span className="px-2.5 py-0.5 bg-[#1B3A5C] text-white text-[10px] font-black rounded-md uppercase tracking-wider">
                  {confirmModal.deliveryMethod === 'RESCUE_COURIER'
                    ? '🛵 KURIR RELAWAN'
                    : confirmModal.deliveryMethod === 'SHELTER_PICKUP'
                    ? '🏬 AMBIL MANDIRI'
                    : '🚚 ARMADA TOKO'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative h-36 bg-slate-800 rounded-xl overflow-hidden border border-slate-300">
                  {proofPhoto && <img src={proofPhoto} alt="Foto Handover" className="w-full h-full object-cover" />}
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    BUKTI HANDOVER TOKO
                  </span>
                </div>

                <div className="space-y-2.5">
                  {confirmModal.deliveryMethod === 'RESCUE_COURIER' ? (
                    <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1.5">
                      <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">
                        DATA KURIR RELAWAN PENJEMPUT:
                      </span>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Nama Relawan:</span>
                          <strong className="text-[#1B3A5C] text-sm">{confirmModal.courierName || 'Budi Santoso (Relawan ID #RC-881)'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Mitra Food Rescue:</span>
                          <strong className="text-slate-800">{confirmModal.courierOrg || 'Food Bank Surabaya Logistik'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Tujuan Alokasi:</span>
                          <strong className="text-emerald-700">{confirmModal.userName}</strong>
                        </div>
                      </div>
                    </div>
                  ) : confirmModal.deliveryMethod === 'SHELTER_PICKUP' ? (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1.5">
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                        PENERIMA AMBIL MANDIRI DI OUTLET:
                      </span>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Nama Pengambil:</span>
                          <strong className="text-[#1B3A5C] text-sm">{confirmModal.userName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Lokasi Serah Terima:</span>
                          <strong className="text-slate-800">Kasir / Outlet Toko Anda</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">Pilih Driver Armada Toko yang Ditugaskan:</label>
                        <select
                          className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 bg-white font-bold text-[#1B3A5C] focus:outline-none"
                          value={selectedStoreDriver}
                          onChange={(e) => {
                            setSelectedStoreDriver(e.target.value);
                            setCourierNameInput(e.target.value);
                          }}
                        >
                          {storeDriversList.map((drv) => (
                            <option key={drv.id} value={`${drv.name} (${drv.vehicle})`}>
                              {drv.name} - {drv.vehicle}
                            </option>
                          ))}
                        </select>
                      </div>

                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                          `Halo Mas Driver, ini link Surat Jalan Digital Replate untuk pengantaran pesanan ${confirmModal.code} (${confirmModal.foodName}): https://replate.id/driver-manifest/${confirmModal.code}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 text-center mt-2"
                      >
                        <span>💬 Kirim Link Surat Jalan WA ke Driver Toko ➔</span>
                      </a>
                    </>
                  )}
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

      {/* Modal Inspect Payment Proof (Transfer Manual / QRIS Toko) */}
      {paymentInspectModal.isOpen && paymentInspectModal.claim && (
        <Modal
          isOpen={paymentInspectModal.isOpen}
          onClose={() => setPaymentInspectModal({ isOpen: false, claim: null })}
          title={`Verifikasi Pembayaran Rescue Sale: ${paymentInspectModal.claim.code}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <span className="font-extrabold text-amber-900 block">
                💳 Bukti Transfer / Scan QRIS Toko Diunggah Konsumen:
              </span>
              <p className="text-[11px] text-amber-800 font-medium">
                Pembeli: <strong>{paymentInspectModal.claim.userName}</strong> • Tagihan: <strong className="font-mono text-slate-900">Rp {(paymentInspectModal.claim.amountPaid || 15000).toLocaleString('id-ID')}</strong> ({paymentInspectModal.claim.quantity})
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 block">Foto Struk / Screenshot Bukti Transfer:</span>
              <div className="h-56 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 relative">
                <img
                  src={paymentInspectModal.claim.paymentProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60'}
                  alt="Bukti Transfer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  STRUK TRANSFER QRIS TOKO
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setPaymentInspectModal({ isOpen: false, claim: null })}>
                Tutup
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-extrabold text-slate-950 shadow-md"
                onClick={() => handleApprovePaymentProof(paymentInspectModal.claim.code)}
              >
                ✓ Verifikasi Lunas & Aktifkan Tiket QR ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Tiket QR Resmi Terbit & Surat Jalan Kasir (Point 3) */}
      {issuedTicketModal.isOpen && issuedTicketModal.claim && (
        <Modal
          isOpen={issuedTicketModal.isOpen}
          onClose={() => setIssuedTicketModal({ isOpen: false, claim: null })}
          title={`Tiket QR Resmi Terbit: ${issuedTicketModal.claim.code}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700 text-center">
            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-1">
              <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block">
                PEMBAYARAN TERVERIFIKASI LUNAS
              </span>
              <h4 className="text-lg font-black text-emerald-950">
                Tiket QR Siap Diambil di Meja Kasir
              </h4>
              <p className="text-xs text-emerald-800 font-medium">
                Resi #{issuedTicketModal.claim.code} telah aktif dan dipindahkan ke antrean Penyelamatan & Handover Makanan.
              </p>
            </div>

            {/* Big QR Barcode Display */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xs mx-auto space-y-2">
              <div className="w-48 h-48 mx-auto bg-slate-900 p-2 rounded-xl border border-slate-300 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `REPLATE-TICKET-${issuedTicketModal.claim.code}`
                  )}`}
                  alt="QR Barcode Resi"
                  className="w-full h-full object-contain bg-white p-1 rounded-lg"
                />
              </div>
              <span className="font-mono font-black text-sm text-[#1B3A5C] block">
                {issuedTicketModal.claim.code}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Nama Pembeli:</span>
                <strong className="text-slate-900">{issuedTicketModal.claim.userName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Menu Makanan:</span>
                <strong className="text-slate-900">{issuedTicketModal.claim.foodName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Kuantitas:</span>
                <strong className="text-emerald-700 font-black">{issuedTicketModal.claim.quantity}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-semibold">Status Pembayaran:</span>
                <strong className="text-emerald-700 font-black">LUNAS (QRIS / Transfer)</strong>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/${(issuedTicketModal.claim.recipientPhone || '081234567890').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Halo Kak ${issuedTicketModal.claim.userName}, pembayaran Rescue Sale untuk ${issuedTicketModal.claim.foodName} (${issuedTicketModal.claim.quantity}) telah LUNAS & DISETUJUI. Tunjukkan Kode Resi QR: ${issuedTicketModal.claim.code} di kasir saat mengambil makanan. Terima kasih!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Kirim Link Tiket QR via WhatsApp ke Pembeli ➔</span>
              </a>

              <Button
                variant="primary"
                size="md"
                className="w-full font-black text-xs py-2.5 shadow-xs"
                onClick={() => {
                  setIssuedTicketModal({ isOpen: false, claim: null });
                  setActiveTab('PENDING_PICKUP');
                }}
              >
                Lihat di Tab Penyelamatan & Handover Kasir ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* In-Workspace Live Courier Tracking & Audit Log Modal (Point 1 & 7) */}
      {liveTrackingModal.isOpen && liveTrackingModal.claim && (
        <Modal
          isOpen={liveTrackingModal.isOpen}
          onClose={() => setLiveTrackingModal({ isOpen: false, claim: null })}
          title={`Live Tracking & Audit Log Resi: ${liveTrackingModal.claim.code}`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-slate-800">
            {/* Header Status with High Contrast Typography (Point 7) */}
            <div className="p-5 bg-gradient-to-r from-[#1B3A5C] via-[#142C47] to-[#1B3A5C] text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#2C5A8F]">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                  REAL-TIME COURIER LOGISTICS TRACKING
                </span>
                <h3 className="text-xl font-black text-white leading-tight drop-shadow-xs">
                  {liveTrackingModal.claim.foodName} ({liveTrackingModal.claim.quantity || '1 Porsi'})
                </h3>
                <p className="text-xs text-slate-200 font-mono">
                  Kode Resi: <strong className="text-[#D4A843] bg-slate-950/80 px-2 py-0.5 rounded">{liveTrackingModal.claim.code}</strong>
                </p>
              </div>

              <span className="px-3.5 py-1.5 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs self-start sm:self-center">
                {liveTrackingModal.claim.status === 'COMPLETED'
                  ? '✓ Tiba & Diserahkan'
                  : '🛵 Sedang Diantar Kurir'}
              </span>
            </div>

            {/* Courier / Driver Profile & Contact (Point 8: Adaptable for Store Fleet vs Volunteer) */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-xs ${liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                  {liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT' ? '🚚' : '🛵'}
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest block ${liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT' ? 'text-blue-700' : 'text-purple-700'}`}>
                    {liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT' ? 'ARMADA DRIVER INTERNAL TOKO' : 'KURIR RELAWAN RESMI KOMUNITAS'}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT'
                      ? 'Mas Doni (Sepeda Motor Box Cooler L 4582 ABC)'
                      : (liveTrackingModal.claim.courierName || 'Budi Santoso (Relawan ID #RC-881)')}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT'
                      ? 'Armada Toko Warung Bakso Pak Kumis'
                      : (liveTrackingModal.claim.courierOrg || 'Food Bank Surabaya Logistik & Komunitas Garda Pangan')}
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/${(liveTrackingModal.claim.courierPhone || '081298765432').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Halo, saya dari pihak Toko ingin menanyakan status pengantaran donasi resi ${liveTrackingModal.claim.code}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
              >
                <span>💬 Hubungi Driver (WhatsApp)</span>
              </a>
            </div>

            {/* Route & Beneficiary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Titik Penjemputan (Toko Anda):</span>
                <strong className="text-[#1B3A5C] block">Warung Bakso Pak Kumis</strong>
                <p className="text-[11px] text-slate-600">Jl. Raya Gubeng No. 88, Surabaya</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Titik Tujuan Pengantaran:</span>
                <strong className="text-emerald-800 block">{liveTrackingModal.claim.userName}</strong>
                <p className="text-[11px] text-slate-600">
                  {liveTrackingModal.claim.address || 'Panti Asuhan Kasih Ibu, Surabaya'}
                </p>
              </div>
            </div>

            {/* Checkpoint Timeline */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-extrabold text-[#1B3A5C] text-xs uppercase tracking-wider block">
                📋 Timeline Status Logistik Terverifikasi
              </span>

              <div className="space-y-3 pl-2 border-l-2 border-slate-300 text-xs">
                <div className="relative pl-4">
                  <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                  <strong className="text-slate-900 block">Surat Jalan Donasi Diterbitkan & Sanggupi Permintaan</strong>
                  <span className="text-slate-500 text-[11px]">Hari ini, 18:30 WIB • Tiket manifest otomatis masuk sistem.</span>
                </div>

                <div className="relative pl-4">
                  <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                  <strong className="text-slate-900 block">Kurir Relawan Tiba di Toko & Handover Selesai</strong>
                  <span className="text-slate-500 text-[11px]">Hari ini, 19:00 WIB • Makanan diserahkan dalam kemasan steril.</span>
                </div>

                <div className="relative pl-4">
                  <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100 animate-pulse"></span>
                  <strong className="text-blue-950 block">Dalam Perjalanan Menuju Shelter Panti</strong>
                  <span className="text-slate-500 text-[11px]">Hari ini, 19:15 WIB • Kurir sedang OTW (Estimasi Tiba: 20-25 Menit).</span>
                </div>

                <div className="relative pl-4">
                  <span className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${liveTrackingModal.claim.status === 'COMPLETED' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'}`}></span>
                  <strong className={liveTrackingModal.claim.status === 'COMPLETED' ? 'text-emerald-950' : 'text-slate-400'}>
                    Serah Terima di Panti Asuhan & Berita Acara Foto
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    {liveTrackingModal.claim.status === 'COMPLETED'
                      ? 'Hari ini, 19:40 WIB • Makanan diterima anak-anak panti dalam kondisi aman.'
                      : 'Menunggu konfirmasi kedatangan di lokasi tujuan.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                className="font-extrabold text-xs text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                onClick={() => {
                  const target = liveTrackingModal.claim;
                  setLiveTrackingModal({ isOpen: false, claim: null });
                  setIncidentModal({
                    isOpen: true,
                    claim: target,
                    issueType: 'PACKAGING_DAMAGED',
                    description: '',
                    photoProof: null,
                  });
                }}
              >
                <span>⚠️ Laporkan Kendala / Insiden Pengantaran ➔</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="font-bold text-xs"
                onClick={() => setLiveTrackingModal({ isOpen: false, claim: null })}
              >
                Tutup Live Tracking
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Incident & Food Safety Dispute Resolution Modal */}
      {incidentModal.isOpen && incidentModal.claim && (
        <Modal
          isOpen={incidentModal.isOpen}
          onClose={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'PACKAGING_DAMAGED', description: '', photoProof: null })}
          title={`🚨 Pusat Pelaporan Kendala & Mediasi: ${incidentModal.claim.code}`}
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ticketCode = `INC-${Date.now().toString().slice(-6)}`;
              setToastState({
                isOpen: true,
                message: `Laporan Darurat #${ticketCode} tercatat! Tim Pengawas Replate & Koordinator Lapangan telah menerima tiket eskalasi dan siap mendampingi.`,
                type: 'success',
              });
              setIncidentModal({ isOpen: false, claim: null, issueType: 'PACKAGING_DAMAGED', description: '', photoProof: null });
            }}
            className="space-y-4 text-xs text-slate-700"
          >
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block">
                SOP PENANGANAN DARURAT PRODUK & DRIVER (FOOD SAFETY ESCALATION)
              </span>
              <h4 className="text-sm font-black text-red-950">
                Penyelesaian Insiden Resi {incidentModal.claim.code} ({incidentModal.claim.foodName})
              </h4>
              <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                Setiap laporan diverifikasi menggunakan perbandingan Foto Checkpoint Meja Toko vs Foto Penyerahan Akhir untuk menjamin akuntabilitas 100%.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Kategori Kendala / Insiden:</label>
              <select
                value={incidentModal.issueType}
                onChange={(e) => setIncidentModal({ ...incidentModal, issueType: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-[#1B3A5C] focus:ring-2 focus:ring-[#D4A843]"
              >
                <option value="PACKAGING_DAMAGED">📦 Kemasan Rusak / Segel Terbuka / Makanan Tumpah di Jalan</option>
                <option value="DRIVER_BREAKDOWN">🛵 Kendala Armada Driver (Mogok / Ban Bocor / Kecelakaan Ringan)</option>
                <option value="SAFETY_TIMEOUT">⏱️ Waktu Antar Melebihi 2.5 Jam (Beresiko Melewati Ambang Suhu BPOM)</option>
                <option value="RECIPIENT_UNREACHABLE">📍 Penerima Tidak Berada di Tempat / Alamat Panti Tidak Ditemukan</option>
                <option value="PORTION_MISMATCH">🔢 Ketidakcocokan Jumlah Porsi / Menu Tertukar</option>
                <option value="OTHER">⚠️ Kendala Teknis / Operasional Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Penjelasan Rinci Kronologi Kejadian:</label>
              <textarea
                rows={3}
                required
                value={incidentModal.description}
                onChange={(e) => setIncidentModal({ ...incidentModal, description: e.target.value })}
                placeholder="Jelaskan kondisi fisik makanan, estimasi lokasi driver, atau alasan pelaporan..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D4A843]"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium space-y-1">
              <span className="font-extrabold block">🛡️ Kebijakan Proteksi & Jaminan Replate:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>Jika kurir mengalami kendala di jalan, sistem mengalokasikan <strong>Kurir Backup Terdekat</strong>.</li>
                <li>Dana Rescue Sale dilindungi <strong>100% Refund Guarantee</strong> jika makanan tidak layak konsumsi.</li>
                <li>Untuk donasi panti, sistem mengaktifkan suplai makanan darurat dari mitra provider terdekat.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'PACKAGING_DAMAGED', description: '', photoProof: null })}
              >
                Batal
              </Button>
              <Button type="submit" variant="gold" size="sm" className="font-black text-slate-950 bg-red-600 hover:bg-red-700 text-white shadow-md">
                Kirim Laporan Eskalasi & SOS ➔
              </Button>
            </div>
          </form>
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
