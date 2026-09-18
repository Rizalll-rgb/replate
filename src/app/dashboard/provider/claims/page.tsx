'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRScanner } from '@/components/qr/QRScanner';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CameraIcon,
  GalleryIcon,
  SearchIcon,
  CheckIcon,
  ClockIcon,
  TruckIcon,
  BikeIcon,
  PackageIcon,
  CreditCardIcon,
  TicketIcon,
  ChatIcon,
  MapPinIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  MapIcon,
} from '@/components/ui/Icon';

export default function ProviderClaimsPage() {
  const router = useRouter();
  const [isConsumerRedirect, setIsConsumerRedirect] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'PAYMENT_VERIFY' | 'PENDING_PICKUP' | 'IN_TRANSIT' | 'COMPLETED'>('PAYMENT_VERIFY');
  const [cardPageIndex, setCardPageIndex] = useState<number>(0);

  // Strict Consumer Guard: Food Consumers must never access Kasir & Klaim Toko
  useEffect(() => {
    try {
      let role = '';
      const onb = localStorage.getItem('replate_onboarding_profile');
      if (onb) role = JSON.parse(onb).role;
      if (!role) {
        const reg = localStorage.getItem('replate_registered_user');
        if (reg) role = JSON.parse(reg).role;
      }
      if (!role) {
        const c = document.cookie.match(/replate_role=([^;]+)/) || document.cookie.match(/replate_demo_session=([^;]+)/);
        if (c) role = decodeURIComponent(c[1]);
      }
      const r = String(role || '').toUpperCase();
      if (r.includes('CONSUMER')) {
        setIsConsumerRedirect(true);
        router.replace('/dashboard/consumer');
      }
    } catch (_) {}
  }, [router]);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
    submessage: '',
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

  const [deliveryProofModal, setDeliveryProofModal] = useState<{ isOpen: boolean; claim: any | null }>({
    isOpen: false,
    claim: null,
  });

  const formatClaimQuantity = (c: any) => {
    if (!c) return '1 Porsi';
    if (typeof c.quantity === 'string' && c.quantity.trim().length > 0 && !c.quantity.includes('undefined')) {
      return c.quantity;
    }
    if (typeof c.quantity === 'number') {
      return `${c.quantity} ${c.quantityUnit || 'Porsi'}`;
    }
    if (typeof c.portions === 'number' || (typeof c.portions === 'string' && c.portions)) {
      return `${c.portions} Porsi`;
    }
    if (Array.isArray(c.items) && c.items.length > 0) {
      const total = c.items.reduce((acc: number, it: any) => acc + Number(it.quantity || it.portions || 1), 0);
      return `${total} Porsi (${c.items.length} Menu)`;
    }
    return '1 Porsi';
  };

  const defaultPending = [
    {
      code: 'RPL-RSC-2026-99102',
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
      code: 'RPL-DON-2026-88192',
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
      courierVehicle: 'Motor Box Cooler Steril (Plat L 8912 RC)',
      address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      time: 'Hari ini 19:00 WIB',
    },
    {
      code: 'RPL-RSC-2026-101',
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
      code: 'RPL-DIR-2026-88291',
      foodName: 'Paket Rice Bowl Ayam Geprek (Diantar Toko)',
      userName: 'Panti Asuhan Wonokromo (Panti A)',
      recipientPerson: 'Pak Mahmud (Pengurus Panti A)',
      recipientPhone: '0812-4455-6677',
      recipientType: 'Panti Asuhan Anak',
      quantity: '40 Porsi',
      status: 'READY_FOR_PICKUP',
      deliveryMethod: 'PROVIDER_DIRECT',
      manifestSent: false,
      courierName: 'Driver B: Mas Agus (Plat L 1234 XYZ)',
      courierOrg: 'Armada Driver Toko Pak Kumis',
      courierPhone: '0813-9876-5432',
      courierVehicle: 'Mobil Blind Van Pendingin (Plat L 1234 XYZ)',
      address: 'Jl. Wonokromo No. 45, Wonokromo, Surabaya',
      time: 'Hari ini 19:30 WIB',
    },
  ];

  const defaultInTransit = [
    {
      code: 'RPL-LOG-2026-103',
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
      courierVehicle: 'Sepeda Motor Box Cooler (Plat L 4582 ABC)',
      address: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      time: 'Hari ini 21:00 WIB',
    },
    {
      code: 'RPL-DIR-2026-99382',
      foodName: 'Menu Surplus Bakso Urat & Soto Sapi',
      userName: 'Siti Aminah (Konsumen B)',
      recipientPerson: 'Siti Aminah (Pembeli Rescue Sale)',
      recipientPhone: '0813-8877-6655',
      recipientType: 'Konsumen / Rescue Sale',
      quantity: '5 Porsi',
      status: 'IN_TRANSIT',
      deliveryMethod: 'PROVIDER_DIRECT',
      manifestSent: true,
      courierName: 'Driver A: Mas Doni (Plat L 4582 ABC)',
      courierOrg: 'Armada Driver Toko Pak Kumis',
      courierPhone: '0812-3456-7890',
      courierVehicle: 'Sepeda Motor Box Steril (Plat L 4582 ABC)',
      address: 'Jl. Rungkut Asri No. 12, Rungkut, Surabaya',
      time: 'Dalam Pengiriman Armada Toko (OTW)',
    },
  ];

  const defaultCompleted = [
    {
      code: 'RPL-DON-2026-77182',
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
      courierVehicle: 'Sepeda Motor Box Cooler (Plat L 9981 RC)',
      address: 'Jl. Wonokromo No. 12, Wonokromo, Surabaya',
      time: '21 Aug 2026, 14:00 WIB',
      handoverProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
    },
    {
      code: 'RPL-DON-2026-66102',
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
      courierVehicle: 'Mobil Blind Van Pendingin (Plat L 1234 XYZ)',
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
          .filter((c: any) => c.status === 'AWAITING_RESCUE_PICKUP' || c.status === 'READY_FOR_PICKUP' || c.status === 'PENDING PICKUP' || c.status === 'AWAITING_VERIFICATION' || c.status === 'WAITING_PAYMENT_APPROVAL' || c.status === 'WAITING_STORE_DISPATCH' || c.status === 'WAITING_RESCUE_POOL')
          .map((c: any) => ({
            code: c.claimCode || c.code || c.id,
            foodName: c.foodName || 'Paket Pangan Surplus',
            userName: c.recipientName || c.shelterName || c.userName || 'Konsumen Replate',
            recipientType: c.shelterType || 'Konsumen Replate',
            quantity: formatClaimQuantity(c),
            status: c.status,
            deliveryMethod: c.deliveryMethod || 'RESCUE_COURIER',
            manifestSent: c.manifestSent || false,
            courierName: c.courierName || 'Kurir Relawan Replate',
            courierOrg: c.courierOrg || 'Tim Logistik Rescue',
            courierPhone: c.contactPhone || '0812-9876-5432',
            courierVehicle: c.courierVehicle || 'Motor Box Cooler Steril',
            address: c.address || 'Kota Surabaya',
            time: c.readyTime || 'Hari ini',
            paymentProofUrl: c.paymentProof || c.paymentProofUrl,
            paymentMethod: c.paymentMethod || 'COD',
            totalAmount: c.totalAmount || 0,
          }));

        const inTransit = allSavedClaims
          .filter((c: any) => c.status === 'IN_TRANSIT' || c.status === 'PROVIDER_DELIVERING')
          .map((c: any) => ({
            code: c.claimCode || c.code || c.id,
            foodName: c.foodName || 'Paket Pangan Surplus',
            userName: c.shelterName || c.userName || 'Penerima Bantuan',
            recipientType: c.shelterType || 'Penerima Manfaat',
            quantity: formatClaimQuantity(c),
            status: 'IN_TRANSIT',
            deliveryMethod: c.deliveryMethod || 'RESCUE_COURIER',
            manifestSent: c.manifestSent || true,
            courierName: c.courierName || 'Kurir Relawan Replate',
            courierOrg: c.courierOrg || 'Tim Logistik Rescue',
            courierPhone: c.contactPhone || '0812-9876-5432',
            courierVehicle: c.courierVehicle || 'Motor Box Cooler Steril',
            address: c.address || 'Kota Surabaya',
            time: 'Dalam Pengiriman OTW',
          }));

        const completed = allSavedClaims
          .filter((c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED')
          .map((c: any) => ({
            code: c.claimCode || c.code || c.id,
            foodName: c.foodName || 'Paket Pangan Surplus',
            userName: c.shelterName || c.userName || 'Penerima Bantuan',
            recipientType: c.shelterType || 'Penerima Manfaat',
            quantity: formatClaimQuantity(c),
            status: 'COMPLETED',
            deliveryMethod: c.deliveryMethod || 'RESCUE_COURIER',
            courierName: c.courierName || 'Mas Relawan Surabaya',
            courierOrg: c.courierOrg || 'Komunitas Food Rescue',
            courierPhone: c.contactPhone || '0812-9876-5432',
            courierVehicle: c.courierVehicle || 'Motor Box Cooler Steril',
            address: c.address || 'Kota Surabaya',
            time: c.createdAt || 'Selesai',
            handoverProof: c.handoverProof || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
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
    courierVehicle?: string;
    recipientPerson?: string;
    address?: string;
    driverInfo?: any;
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

  // Dedicated Driver Plotting Modal State (Poin 4 - Sinkronisasi Langsung ke Role Beneficiary)
  const [plotDriverModal, setPlotDriverModal] = useState<{
    isOpen: boolean;
    claim: any | null;
  }>({
    isOpen: false,
    claim: null,
  });
  const [selectedPlotDriverId, setSelectedPlotDriverId] = useState<string>('drv-1');

  // Native & Live Camera Capture Refs for Physical Handover (Point 4)
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const handoverVideoRef = useRef<HTMLVideoElement | null>(null);
  const handoverStreamRef = useRef<MediaStream | null>(null);
  const [isLiveCameraViewOpen, setIsLiveCameraViewOpen] = useState<boolean>(false);

  const startLiveWebcam = async () => {
    setIsLiveCameraViewOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      handoverStreamRef.current = stream;
      if (handoverVideoRef.current) {
        handoverVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Fallback to native camera file input:', err);
      setIsLiveCameraViewOpen(false);
      nativeCameraInputRef.current?.click();
    }
  };

  const captureLiveSnapshot = () => {
    if (!handoverVideoRef.current) return;
    const video = handoverVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setProofPhoto(dataUrl);
      stopLiveWebcam();
    }
  };

  const stopLiveWebcam = () => {
    if (handoverStreamRef.current) {
      handoverStreamRef.current.getTracks().forEach((t) => t.stop());
      handoverStreamRef.current = null;
    }
    setIsLiveCameraViewOpen(false);
  };

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      if (handoverStreamRef.current) {
        handoverStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // List of Registered Store Fleet Drivers with Full Details (Poin 4 - Sinkronisasi Driver Toko)
  const storeDriversList = [
    {
      id: 'drv-1',
      name: 'Driver A: Mas Doni',
      role: 'Driver Internal Toko',
      vehicle: 'Motor Box Steril (Plat L 4582 ABC)',
      phone: '0812-3456-7890',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      rating: '4.8',
      trips: '89 Pengiriman',
    },
    {
      id: 'drv-2',
      name: 'Driver B: Mas Agus',
      role: 'Driver Internal Toko',
      vehicle: 'Mobil Blind Van Pendingin (Plat L 1234 XYZ)',
      phone: '0813-9876-5432',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      rating: '4.9',
      trips: '142 Pengiriman',
    },
    {
      id: 'drv-3',
      name: 'Driver C: Pak Sugiono',
      role: 'Driver Internal Toko',
      vehicle: 'Motor Box Delivery Toko (Plat L 3319 AB)',
      phone: '0811-2233-4455',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      rating: '5.0',
      trips: '210 Pengiriman',
    },
  ];

  // Direct Driver Plotting Action from Provider Workspace (Poin 4)
  const handleAssignDriver = (claimCode: string, driverId: string) => {
    const matched = storeDriversList.find((d) => d.id === driverId) || storeDriversList[0];
    const cleanCode = claimCode.trim().toUpperCase();

    const driverPayload = {
      name: matched.name,
      phone: matched.phone,
      vehicle: matched.vehicle,
      photo: matched.photo,
      rating: matched.rating,
      completedTrips: matched.trips,
      status: matched.role,
      assignedBy: 'Kasir Toko (Workspace Provider)',
      assignedAt: 'Hari ini, baru saja',
    };

    try {
      const plottingMap = JSON.parse(localStorage.getItem('replate_driver_plotting') || '{}');
      plottingMap[cleanCode] = driverPayload;
      localStorage.setItem('replate_driver_plotting', JSON.stringify(plottingMap));

      // Update local state in pending & in transit
      setPendingClaims((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === cleanCode
            ? { ...c, courierName: matched.name, courierPhone: matched.phone, courierVehicle: matched.vehicle, driverInfo: driverPayload }
            : c
        )
      );
      setInTransitClaims((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === cleanCode
            ? { ...c, courierName: matched.name, courierPhone: matched.phone, courierVehicle: matched.vehicle, driverInfo: driverPayload }
            : c
        )
      );

      // Also update replate_claims and replate_active_claims
      const savedClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
      const updatedClaims = savedClaims.map((c: any) =>
        (c.claimCode === cleanCode || c.id === cleanCode || c.code === cleanCode)
          ? { ...c, courierName: matched.name, courierPhone: matched.phone, courierVehicle: matched.vehicle, driverInfo: driverPayload }
          : c
      );
      localStorage.setItem('replate_claims', JSON.stringify(updatedClaims));

      const savedActive = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
      const updatedActive = savedActive.map((c: any) =>
        (c.id === cleanCode || c.code === cleanCode || c.claimCode === cleanCode)
          ? { ...c, courierName: matched.name, courierPhone: matched.phone, courierVehicle: matched.vehicle, driverInfo: driverPayload }
          : c
      );
      localStorage.setItem('replate_active_claims', JSON.stringify(updatedActive));
    } catch (_) {}

    setPlotDriverModal({ isOpen: false, claim: null });
    setToastState({
      isOpen: true,
      message: `Driver "${matched.name}" Berhasil Di-Plotting Untuk Resi ${cleanCode}! Pop-up Lacak Penerima Otomatis Tersinkron.`,
      type: 'success',
    });
  };

  // Scan QR Code Verification at Store -> Updates Status to IN_TRANSIT (OTW) & Auto Closes Modal
  const handleVerifyCodeAtStore = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();

    setActionLoader({
      isOpen: true,
      message: `Memvalidasi Resi ${cleanCode}...`,
      submessage: 'Sinkronisasi status kasir & aktivasi live tracking kurir',
    });

    setTimeout(() => {
      setActionLoader({ isOpen: false, message: '' });

      const matchedStoreDriver = storeDriversList.find(d => selectedStoreDriver.includes(d.name)) || storeDriversList[0];
      const isStoreDelivery = confirmModal.deliveryMethod === 'PROVIDER_DIRECT';

      const driverPayload = {
        name: isStoreDelivery ? matchedStoreDriver.name : (courierNameInput || 'Budi Santoso (Relawan ID #RC-881)'),
        phone: isStoreDelivery ? matchedStoreDriver.phone : '0812-9876-5432',
        vehicle: isStoreDelivery ? matchedStoreDriver.vehicle : 'Motor Box Cooler Steril',
        photo: isStoreDelivery ? matchedStoreDriver.photo : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        rating: isStoreDelivery ? matchedStoreDriver.rating : '4.9',
        completedTrips: isStoreDelivery ? matchedStoreDriver.trips : '312 Pengiriman',
        status: isStoreDelivery ? 'Driver Internal Toko' : 'Relawan Logistik Terverifikasi',
        assignedBy: 'Kasir Toko (Workspace Provider)',
        assignedAt: 'Hari ini, baru saja',
      };

      const target = pendingClaims.find((c) => c.code.toUpperCase() === cleanCode) || {
        code: cleanCode,
        foodName: 'Surplus Makanan Steril',
        userName: 'Penerima Bantuan / Kurir Relawan',
        quantity: 'Porsi Terverifikasi',
        status: 'IN_TRANSIT',
        deliveryMethod: confirmModal.deliveryMethod || 'RESCUE_COURIER',
        courierName: driverPayload.name,
        courierOrg: isStoreDelivery ? 'Armada Internal Toko' : 'Replate Rescue Fleet',
        courierPhone: driverPayload.phone,
        courierVehicle: driverPayload.vehicle,
        driverInfo: driverPayload,
        address: 'Kota Surabaya',
        time: 'OTW Pengiriman',
      };

      setPendingClaims((prev) => prev.filter((c) => c.code.toUpperCase() !== cleanCode));
      const newInTransitItem = {
        ...target,
        status: 'IN_TRANSIT',
        courierName: driverPayload.name,
        courierPhone: driverPayload.phone,
        courierVehicle: driverPayload.vehicle,
        driverInfo: driverPayload,
        time: 'OTW Dalam Pengiriman',
      };
      setInTransitClaims((prev) => Array.from(new Map([...prev, newInTransitItem].map(i => [i.code, i])).values()));

      try {
        // Sync plotting map
        const plottingMap = JSON.parse(localStorage.getItem('replate_driver_plotting') || '{}');
        plottingMap[cleanCode] = driverPayload;
        localStorage.setItem('replate_driver_plotting', JSON.stringify(plottingMap));

        const savedClaimsStr = localStorage.getItem('replate_claims');
        const existingClaims = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
        const updatedClaims = existingClaims.map((c: any) =>
          (c.claimCode === cleanCode || c.id === cleanCode || c.code === cleanCode)
            ? { ...c, status: 'IN_TRANSIT', courierName: driverPayload.name, courierPhone: driverPayload.phone, courierVehicle: driverPayload.vehicle, driverInfo: driverPayload }
            : c
        );
        localStorage.setItem('replate_claims', JSON.stringify(updatedClaims));

        const savedActiveStr = localStorage.getItem('replate_active_claims');
        if (savedActiveStr) {
          const activeClaims = JSON.parse(savedActiveStr);
          const updatedActive = activeClaims.map((c: any) =>
            (c.id === cleanCode || c.code === cleanCode || c.claimCode === cleanCode)
              ? { ...c, status: 'IN_TRANSIT', courierName: driverPayload.name, courierPhone: driverPayload.phone, courierVehicle: driverPayload.vehicle, driverInfo: driverPayload }
              : c
          );
          localStorage.setItem('replate_active_claims', JSON.stringify(updatedActive));
        }
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
        message: `QR Code "${cleanCode}" Valid! Paket Makanan Dihandover Ke Kurir. Status Diperbarui Menjadi IN_TRANSIT (OTW).`,
        type: 'success',
      });
      setShowScanner(false);
      setManualCodeInput('');
    }, 550);
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
      message: `Pengambilan Mandiri "${cleanCode}" Terverifikasi Selesai di Toko! Status Permanen COMPLETED.`,
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
    let plottedDriver = (tx as any).driverInfo || null;
    if (!plottedDriver) {
      try {
        const plottingMap = JSON.parse(localStorage.getItem('replate_driver_plotting') || '{}');
        if (plottingMap[tx.code?.toUpperCase()]) {
          plottedDriver = plottingMap[tx.code.toUpperCase()];
        }
      } catch (_) {}
    }

    setConfirmModal({
      isOpen: true,
      code: tx.code,
      foodName: tx.foodName,
      userName: tx.userName,
      quantity: tx.quantity,
      deliveryMethod: tx.deliveryMethod || 'RESCUE_COURIER',
      courierName: plottedDriver?.name || tx.courierName || '',
      courierOrg: tx.courierOrg || '',
      courierPhone: plottedDriver?.phone || tx.courierPhone || '',
      courierVehicle: plottedDriver?.vehicle || (tx as any).courierVehicle || '',
      recipientPerson: tx.recipientPerson || '',
      address: tx.address || '',
      driverInfo: plottedDriver,
    });
    setCourierNameInput(plottedDriver?.name || tx.courierName || tx.userName);
    if (plottedDriver?.name) {
      setSelectedStoreDriver(plottedDriver.name);
    }
    setProofPhoto('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60');
  };

  // Filter payment claims vs pickup claims
  const paymentClaims = pendingClaims.filter(
    (c) => c.status === 'PAYMENT_PROOF_UPLOADED' || c.status === 'WAITING_PAYMENT_AT_STORE' || c.status === 'AWAITING_VERIFICATION' || c.status === 'WAITING_PAYMENT_APPROVAL'
  );
  const pickupClaims = pendingClaims.filter(
    (c) => c.status !== 'PAYMENT_PROOF_UPLOADED' && c.status !== 'WAITING_PAYMENT_AT_STORE' && c.status !== 'AWAITING_VERIFICATION' && c.status !== 'WAITING_PAYMENT_APPROVAL'
  );

  if (isConsumerRedirect) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-extrabold">Mengarahkan ke Dashboard Konsumen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Sleek Modern Header Card (Compact & Ergonomic) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Pusat Integrasi Logistik QR
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Kasir Siaga</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              Klaim & Penyelamatan Makanan Toko
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Verifikasi transfer, scan QR kurir relawan, dan serah terima paket makanan.
            </p>
          </div>

          <Button
            variant="gold"
            size="sm"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            }
            className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer shrink-0 self-start sm:self-auto"
            onClick={() => setShowScanner(!showScanner)}
          >
            {showScanner ? 'Tutup Kamera QR' : 'Buka Kamera Pindai QR'}
          </Button>
        </div>

        {/* Quick Resi Code Input & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-slate-100">
          <Input
            placeholder="Ketik / tempel kode resi (Contoh: FB-DON-88192)..."
            value={manualCodeInput}
            onChange={(e) => setManualCodeInput(e.target.value)}
            className="text-xs bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400 flex-1 w-full"
          />
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<SearchIcon size={13} className="text-[#1B3A5C]" />}
              disabled={!manualCodeInput.trim()}
              onClick={() => {
                const found = [...pendingClaims, ...inTransitClaims, ...completedClaims, ...paymentClaims].find(
                  (c) => c.code.toLowerCase() === manualCodeInput.trim().toLowerCase()
                );
                if (found) {
                  setLiveTrackingModal({ isOpen: true, claim: found });
                } else {
                  setLiveTrackingModal({
                    isOpen: true,
                    claim: {
                      code: manualCodeInput.trim().toUpperCase(),
                      foodName: 'Paket Surplus Donasi Food Rescue',
                      userName: 'Penerima Terdaftar',
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
              className="flex-1 sm:flex-initial font-bold text-xs py-2 px-3 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Lacak
            </Button>
            <Button
              variant="gold"
              size="sm"
              leftIcon={<CheckIcon size={13} className="text-slate-950" />}
              disabled={!manualCodeInput.trim()}
              onClick={() => handleVerifyCodeAtStore(manualCodeInput)}
              className="flex-1 sm:flex-initial font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
            >
              Verifikasi Resi
            </Button>
          </div>
        </div>
      </div>

      {showScanner && (
        <Card className="p-4 sm:p-6 border-[#D4A843] bg-white shadow-md">
          <QRScanner onScanSuccess={handleVerifyCodeAtStore} />
        </Card>
      )}

      {/* Dynamic Tabs Navigation Bar (Modern Segmented Pill Container with Descriptive Direction) */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xs">
        <button
          onClick={() => { setActiveTab('PAYMENT_VERIFY'); setCardPageIndex(0); }}
          className={`flex-1 min-w-[125px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'PAYMENT_VERIFY'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white/50'
          }`}
        >
          <CreditCardIcon size={14} className={activeTab === 'PAYMENT_VERIFY' ? 'text-[#D4A843]' : 'text-slate-500'} />
          <span className="text-xs">Verifikasi Bayar</span>
          <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md">
            {paymentClaims.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('PENDING_PICKUP'); setCardPageIndex(0); }}
          className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'PENDING_PICKUP'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white/50'
          }`}
          title="Kurir relawan sedang menuju outlet toko Anda untuk mengambil paket makanan"
        >
          <PackageIcon size={14} className={activeTab === 'PENDING_PICKUP' ? 'text-[#D4A843]' : 'text-slate-500'} />
          <span className="text-xs font-bold">Siap Handover</span>
          <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-md">
            {pickupClaims.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('IN_TRANSIT'); setCardPageIndex(0); }}
          className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'IN_TRANSIT'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white/50'
          }`}
          title="Handover kasir selesai, kurir sedang membawa paket OTW ke panti/konsumen"
        >
          <TruckIcon size={14} className={activeTab === 'IN_TRANSIT' ? 'text-[#D4A843]' : 'text-slate-500'} />
          <span className="text-xs font-bold">Pengantaran</span>
          <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-black rounded-md">
            {inTransitClaims.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('COMPLETED'); setCardPageIndex(0); }}
          className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'COMPLETED'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white/50'
          }`}
        >
          <CheckIcon size={14} className={activeTab === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-500'} />
          <span className="text-xs">Selesai</span>
          <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-md">
            {completedClaims.length}
          </span>
        </button>
      </div>

      {/* Transaction List */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardBody className="p-3 sm:p-4 space-y-3 text-xs">
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
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <PackageIcon size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Belum Ada Transaksi di Tab Ini</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                    Klaim donasi atau pesanan Rescue Sale dari konsumen dan panti asuhan akan otomatis masuk ke tab ini.
                  </p>
                </div>
              );
            }

            const CARDS_PER_PAGE = 3;
            const totalCardPages = Math.ceil(currentList.length / CARDS_PER_PAGE) || 1;
            const safePageIndex = Math.min(cardPageIndex, totalCardPages - 1);
            const visibleCards = currentList.slice(safePageIndex * CARDS_PER_PAGE, (safePageIndex + 1) * CARDS_PER_PAGE);

            return (
              <div className="space-y-3">
                {/* 3-Card Slider / Pagination Bar (Poin 8: Tampilan rapi per 3 kartu) */}
                {currentList.length > CARDS_PER_PAGE && (
                  <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <PackageIcon size={14} className="text-[#1B3A5C]" />
                      <span>
                        {currentList.length} Transaksi • Slide {safePageIndex + 1} dari {totalCardPages} (3 Kartu / Slide)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={safePageIndex === 0}
                        onClick={() => setCardPageIndex((p) => Math.max(0, p - 1))}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                          safePageIndex === 0
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs'
                        }`}
                      >
                        ← Sebelumnya
                      </button>
                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalCardPages }).map((_, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setCardPageIndex(pIdx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              safePageIndex === pIdx ? 'bg-[#1B3A5C] w-4' : 'bg-slate-300 hover:bg-slate-400 w-2'
                            }`}
                            title={`Ke Slide ${pIdx + 1}`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={safePageIndex >= totalCardPages - 1}
                        onClick={() => setCardPageIndex((p) => Math.min(totalCardPages - 1, p + 1))}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                          safePageIndex >= totalCardPages - 1
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs'
                        }`}
                      >
                        Berikutnya →
                      </button>
                    </div>
                  </div>
                )}

                {/* Responsive 3-Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {visibleCards.map((tx, idx) => {
                    const displayQty = tx.quantity
                      ? (String(tx.quantity).includes('Porsi') || String(tx.quantity).includes('Pcs') || String(tx.quantity).includes('Box')
                          ? String(tx.quantity)
                          : `${tx.quantity} Porsi`)
                      : '1 Porsi';

                    return (
                      <div
                        key={`${tx.code}-${idx}`}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#1B3A5C]/40 transition-all flex flex-col justify-between space-y-2.5"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="font-extrabold text-[#1B3A5C] text-sm truncate">{tx.foodName}</span>
                              <Badge variant={activeTab === 'COMPLETED' ? 'success' : activeTab === 'IN_TRANSIT' ? 'warning' : 'primary'} size="sm">
                                {displayQty}
                              </Badge>
                            </div>
                            {/* Poin 5: Kurir Menuju Toko HANYA untuk RESCUE_COURIER. Driver toko stand by di outlet */}
                            {activeTab === 'PENDING_PICKUP' && (
                              tx.deliveryMethod === 'RESCUE_COURIER' ? (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md flex items-center gap-1 shrink-0">
                                  <BikeIcon size={11} /> Kurir Relawan Menuju Toko
                                </span>
                              ) : (tx.deliveryMethod === 'PROVIDER_DIRECT' || tx.deliveryMethod === 'COURIER_DELIVERY') ? (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md flex items-center gap-1 shrink-0">
                                  <TruckIcon size={11} /> Armada Toko Siaga
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1 shrink-0">
                                  <PackageIcon size={11} /> Siap Ambil Mandiri
                                </span>
                              )
                            )}
                            {tx.status === 'WAITING_STORE_DISPATCH' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-black rounded-md flex items-center gap-1 shrink-0 animate-pulse">
                                <TruckIcon size={11} /> Menunggu Plotting Toko
                              </span>
                            )}
                            {tx.paymentMethod === 'COD' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black rounded-md flex items-center gap-1 shrink-0">
                                <span>COD (Tagih Rp {tx.totalAmount ? tx.totalAmount.toLocaleString('id-ID') : '10.000'})</span>
                              </span>
                            )}
                            {activeTab === 'IN_TRANSIT' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md flex items-center gap-1 shrink-0">
                                <TruckIcon size={11} /> OTW ke Lembaga Penerima
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                            <span className="font-mono font-bold text-[#1B3A5C]">{tx.code}</span>
                            <span>•</span>
                            <span className="text-slate-700 font-semibold truncate max-w-[120px]">{tx.recipientPerson || tx.userName}</span>
                            <span>•</span>
                            <span>{tx.deliveryMethod === 'SHELTER_PICKUP' || tx.deliveryMethod === 'SELF_PICKUP' ? 'Ambil Mandiri' : tx.deliveryMethod === 'PROVIDER_DIRECT' || tx.deliveryMethod === 'COURIER_DELIVERY' ? 'Diantar Kurir Toko' : 'Kurir Relawan'}</span>
                            {/* Poin 6: Status terintegrasi rapi */}
                            {tx.deliveryMethod === 'RESCUE_COURIER' && tx.status === 'AWAITING_RESCUE_PICKUP' && (
                              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-900 rounded text-[9.5px] font-bold">
                                Menunggu Driver
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Compact Volunteer Courier Strip (Poin 6: Status badge nempel di foto kurir) */}
                        {tx.deliveryMethod === 'RESCUE_COURIER' && tx.status !== 'AWAITING_RESCUE_PICKUP' && (
                          <div className="p-2 bg-purple-50/90 rounded-xl border border-purple-200 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={tx.courierAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'}
                                  alt={tx.courierName || 'Kurir Relawan'}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-purple-500 shadow-2xs shrink-0"
                                />
                                <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-purple-700 text-white text-[8px] font-black rounded-full border border-white shadow-xs">
                                  OTW
                                </span>
                              </div>
                              <div className="min-w-0 leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-purple-950 font-bold text-xs truncate">
                                    {tx.courierName || 'Budi Santoso'}
                                  </strong>
                                  <span className="text-[9px] bg-purple-200 text-purple-900 font-bold px-1 rounded shrink-0">
                                    #{tx.courierId || 'RC-881'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-purple-800 truncate block">
                                  {tx.courierVehicle || 'Motor Box Cooler'}
                                </span>
                              </div>
                            </div>

                            <a
                              href={`https://wa.me/${(tx.courierPhone || '081298765432').replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Halo Mas ${tx.courierName || 'Driver Relawan'}, saya dari Toko mengonfirmasi donasi resi ${tx.code} siap diserahterimakan.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              <ChatIcon size={12} />
                              <span>Chat WA</span>
                            </a>
                          </div>
                        )}

                        {/* Compact Driver Toko Strip (Jika sudah di-plot) */}
                        {(tx.deliveryMethod === 'PROVIDER_DIRECT' || tx.deliveryMethod === 'COURIER_DELIVERY' || tx.status === 'WAITING_STORE_DISPATCH') && (tx.courierName || tx.driverName) && (
                          <div className="p-2 bg-blue-50/90 rounded-xl border border-blue-200 flex items-center justify-between gap-2 text-xs mt-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={tx.driverInfo?.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'}
                                  alt={tx.courierName || tx.driverName}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-500 shadow-2xs shrink-0"
                                />
                                <span className="absolute -bottom-1 -right-1 p-0.5 bg-blue-700 text-white rounded-full border border-white shadow-xs">
                                  <CheckIcon size={8} strokeWidth={4} />
                                </span>
                              </div>
                              <div className="min-w-0 leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-blue-950 font-bold text-xs truncate">
                                    {tx.courierName || tx.driverName}
                                  </strong>
                                  <span className="text-[9px] bg-blue-200 text-blue-900 font-bold px-1 rounded shrink-0">
                                    Driver Toko
                                  </span>
                                </div>
                                <span className="text-[10px] text-blue-800 truncate block">
                                  {tx.courierVehicle || 'Armada Internal'}
                                </span>
                              </div>
                            </div>

                            <a
                              href={`https://wa.me/${(tx.courierPhone || tx.driverPhone || '081298765432').replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Halo Mas ${tx.courierName || tx.driverName}, tolong segera meluncur ke toko untuk mengambil paket resi ${tx.code}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              <ChatIcon size={12} />
                              <span>Hubungi</span>
                            </a>
                          </div>
                        )}

                        {/* ACTION FOOTER BAR: Clean side-by-side layout (Secondary on Left, Primary on Right) */}
                        <div className="flex items-center justify-between gap-2 w-full pt-2.5 mt-1 border-t border-slate-200/80 shrink-0">
                          {/* Left Side: Contextual Secondary Actions (Tiket QR, Surat Jalan, Audit Log) */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-bold text-xs border-slate-300 hover:bg-slate-100 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl cursor-pointer"
                              onClick={() => setIssuedTicketModal({ isOpen: true, claim: tx })}
                            >
                              <TicketIcon size={13} className="text-[#1B3A5C]" />
                              <span>Tiket QR</span>
                            </Button>

                            {/* Poin 9: Tombol Plot Driver Toko HANYA muncul pada tab Siap Handover (PENDING_PICKUP) */}
                            {activeTab === 'PENDING_PICKUP' && (tx.deliveryMethod === 'PROVIDER_DIRECT' || tx.deliveryMethod === 'COURIER_DELIVERY' || tx.status === 'WAITING_STORE_DISPATCH') && (
                              <Button
                                variant={tx.courierName ? "secondary" : "outline"}
                                size="sm"
                                className={`font-black text-xs flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl cursor-pointer ${
                                  tx.courierName 
                                    ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200" 
                                    : "border-blue-300 text-blue-900 bg-blue-50/80 hover:bg-blue-100"
                                }`}
                                onClick={() => {
                                  setPlotDriverModal({ isOpen: true, claim: tx });
                                  const existingDriver = storeDriversList.find(d => d.name === tx.courierName);
                                  setSelectedPlotDriverId(existingDriver ? existingDriver.id : storeDriversList[0].id);
                                }}
                              >
                                <TruckIcon size={13} className={tx.courierName ? "text-slate-500" : "text-blue-700"} />
                                <span>{tx.courierName ? 'Ubah Driver Toko' : 'Plot Driver Toko'}</span>
                              </Button>
                            )}

                    {activeTab === 'IN_TRANSIT' && tx.deliveryMethod === 'PROVIDER_DIRECT' && (
                      <>
                        <a
                          href={`/driver-manifest/${tx.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] !text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <TicketIcon size={13} />
                          <span>Surat Jalan</span>
                        </a>
                        <Button
                          variant="primary"
                          size="sm"
                          className="font-bold text-xs shadow-2xs flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl cursor-pointer"
                          onClick={() => handleDirectPickupCompleteAtStore(tx)}
                        >
                          <CheckIcon size={13} />
                          <span>Selesai</span>
                        </Button>
                      </>
                    )}

                    {activeTab === 'COMPLETED' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold text-xs border-blue-200 text-blue-800 hover:bg-blue-50 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl cursor-pointer"
                          onClick={() => setLiveTrackingModal({ isOpen: true, claim: tx })}
                        >
                          <ClockIcon size={13} className="text-blue-700" />
                          <span>Lacak Alur / Timeline</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold text-xs border-emerald-200 text-emerald-800 hover:bg-emerald-50 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl cursor-pointer"
                          onClick={() => setDeliveryProofModal({ isOpen: true, claim: tx })}
                        >
                          <CheckIcon size={13} className="text-emerald-700" />
                          <span>Bukti Pengiriman</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Primary CTA (Compact, self-sized pill button with icon & text side-by-side) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeTab === 'PAYMENT_VERIFY' ? (
                      <Button
                        variant="gold"
                        size="sm"
                        className="font-black text-xs shadow-xs flex items-center justify-center gap-1.5 py-2 px-3.5 text-slate-950 rounded-xl cursor-pointer"
                        onClick={() => setPaymentInspectModal({ isOpen: true, claim: tx })}
                      >
                        <CreditCardIcon size={14} />
                        <span>Inspect Struk </span>
                      </Button>
                    ) : activeTab === 'PENDING_PICKUP' ? (
                      tx.status === 'AWAITING_RESCUE_PICKUP' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="font-black text-xs bg-amber-400 hover:bg-amber-500 !text-slate-950 hover:!text-black border border-amber-500 shadow-xs flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl cursor-pointer"
                          title="Simulasikan kurir tiba di outlet untuk mengaktifkan tombol handover"
                          onClick={() => {
                            const updated = pendingClaims.map((c) =>
                              c.code === tx.code ? { ...c, status: 'DRIVER_ARRIVED_AT_STORE' } : c
                            );
                            setPendingClaims(updated);
                            setToastState({
                              isOpen: true,
                              message: `Kurir relawan "${tx.courierName || 'Komunitas'}" telah tiba di outlet! Tombol handover siap digunakan.`,
                              type: 'success',
                            });
                          }}
                        >
                          <BikeIcon size={14} />
                          <span>Kurir Tiba di Toko </span>
                        </Button>
                      ) : (
                        <Button
                          variant="gold"
                          size="sm"
                          leftIcon={<CheckIcon size={14} />}
                          className="font-black text-xs shadow-md bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3.5 rounded-xl cursor-pointer"
                          onClick={() => openConfirmModal(tx)}
                        >
                          Konfirmasi Kasir
                        </Button>
                      )
                    ) : activeTab === 'IN_TRANSIT' ? (
                      tx.deliveryMethod === 'SHELTER_PICKUP' ? (
                        <Button
                          variant="gold"
                          size="sm"
                          leftIcon={<CheckIcon size={14} />}
                          className="font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md py-2 px-3.5 rounded-xl cursor-pointer"
                          onClick={() => handleDirectPickupCompleteAtStore(tx)}
                        >
                          Verifikasi Toko
                        </Button>
                      ) : (
                        <Button
                          variant="gold"
                          size="sm"
                          className="font-black text-xs shadow-xs flex items-center justify-center gap-1.5 py-2 px-3.5 text-slate-950 rounded-xl cursor-pointer"
                          onClick={() => setLiveTrackingModal({ isOpen: true, claim: tx })}
                        >
                          <MapPinIcon size={14} />
                          <span>Live Tracking </span>
                        </Button>
                      )
                    ) : (
                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<CheckIcon size={14} />}
                        className="font-black text-xs shadow-xs text-slate-950 py-2 px-3.5 rounded-xl cursor-pointer"
                        onClick={() => setDetailModal({ isOpen: true, claim: tx })}
                      >
                        Detail Resi
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
                  <span className="text-emerald-900 font-black text-sm flex items-center gap-1">
                    <CheckIcon size={14} />
                    STATUS: VERIFIED & SELESAI (COMPLETED)
                  </span>
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
                      ? 'KURIR RELAWAN KOMUNITAS'
                      : detailModal.claim.deliveryMethod === 'SHELTER_PICKUP'
                      ? 'PENGAMBILAN MANDIRI'
                      : 'DIANTAR ARMADA TOKO'}
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
                  <span> Audit Log Resi Transaksi </span>
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
                    ? 'KURIR RELAWAN'
                    : confirmModal.deliveryMethod === 'SHELTER_PICKUP'
                    ? 'AMBIL MANDIRI'
                    : 'ARMADA TOKO'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative h-36 bg-slate-800 rounded-xl overflow-hidden border border-slate-300">
                  {proofPhoto ? (
                    <img src={proofPhoto} alt="Foto Handover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                      <CameraIcon size={28} />
                      <span className="text-[10px] font-bold">Belum Ada Foto Terlampir</span>
                    </div>
                  )}
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
                    /* Poin 7: Jika driver toko sudah di-plotting via kartu, tampilkan info driver tanpa dropdown dobel */
                    confirmModal.driverInfo || (confirmModal.courierName && (confirmModal.courierName.toLowerCase().includes('driver') || confirmModal.courierName.toLowerCase().includes('mas') || confirmModal.courierName.toLowerCase().includes('pak'))) ? (
                      <div className="p-3 bg-blue-50/90 rounded-xl border border-blue-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">
                            DRIVER TOKO TELAH DI-PLOTTING:
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md flex items-center gap-1">
                            <CheckIcon size={11} /> Siap Handover
                          </span>
                        </div>
                        <div className="text-xs space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Driver yang Ditugaskan:</span>
                            <strong className="text-[#1B3A5C] text-sm">{confirmModal.courierName}</strong>
                          </div>
                          {confirmModal.courierVehicle && (
                            <div>
                              <span className="text-slate-400 text-[10px] block">Kendaraan Armada:</span>
                              <strong className="text-slate-700">{confirmModal.courierVehicle}</strong>
                            </div>
                          )}
                          {confirmModal.courierPhone && (
                            <div>
                              <span className="text-slate-400 text-[10px] block">Kontak Driver:</span>
                              <strong className="text-slate-700">{confirmModal.courierPhone}</strong>
                            </div>
                          )}
                        </div>

                        <a
                          href={`https://wa.me/${(confirmModal.courierPhone || '081234567890').replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Halo Mas Driver, ini link Surat Jalan Digital Replate untuk pengantaran pesanan ${confirmModal.code} (${confirmModal.foodName}): https://replate.id/driver-manifest/${confirmModal.code}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 text-center mt-1"
                        >
                          <ChatIcon size={14} />
                          <span>Kirim Surat Jalan WA ke Driver Toko</span>
                        </a>
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
                          <ChatIcon size={14} />
                          <span>Kirim Link Surat Jalan WA ke Driver Toko </span>
                        </a>
                      </>
                    )
                  )}
                </div>
              </div>

              {/* Interactive Dual Photo Capture & Upload Section (Point 4) */}
              <div className="space-y-2.5 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <CameraIcon size={15} className="text-[#1B3A5C]" />
                    <span>Bukti Foto Serah Terima Fisik Makanan (Wajib):</span>
                  </label>
                  {proofPhoto && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckIcon size={11} />
                      Foto Terpasang
                    </span>
                  )}
                </div>

                {/* Hidden File Inputs for Native Camera & Gallery */}
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setProofPhoto(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setProofPhoto(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {/* Live In-App Camera Viewfinder if active */}
                {isLiveCameraViewOpen ? (
                  <div className="space-y-2 rounded-xl overflow-hidden border border-slate-300 bg-black p-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                      <video
                        ref={handoverVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        Kamera Aktif
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="gold"
                        size="sm"
                        className="flex-1 font-black text-slate-950 text-xs shadow-md flex items-center justify-center gap-1.5"
                        onClick={captureLiveSnapshot}
                      >
                        <CameraIcon size={14} />
                        <span>Jepret Foto Sekarang</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-white border-slate-600 hover:bg-slate-800 text-xs"
                        onClick={stopLiveWebcam}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Thumbnail or Placeholder */}
                    <div className="w-full sm:w-24 h-24 bg-slate-200 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 relative">
                      {proofPhoto ? (
                        <>
                          <img src={proofPhoto} alt="Bukti Handover" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setProofPhoto(null)}
                            className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs cursor-pointer"
                            title="Hapus foto"
                          >
                            Hapus
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-2 text-slate-400 space-y-1">
                          <CameraIcon size={24} className="mx-auto text-slate-400" />
                          <span className="text-[9px] font-bold block">Belum ada foto</span>
                        </div>
                      )}
                    </div>

                    {/* Dual Action: Live Camera vs Gallery Selection */}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                              nativeCameraInputRef.current?.click();
                            } else {
                              startLiveWebcam();
                            }
                          }}
                          className="px-3 py-2 bg-[#1B3A5C] hover:bg-[#142C47] text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <CameraIcon size={14} className="text-[#D4A843]" />
                          <span>Ambil Foto Kamera</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-[11px] rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <GalleryIcon size={14} className="text-slate-600" />
                          <span>Pilih dari Galeri</span>
                        </button>
                      </div>

                      {/* Demo Quick Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-bold">Preset Cepat:</span>
                        <button
                          type="button"
                          onClick={() => setProofPhoto('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60')}
                          className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[9.5px] rounded hover:bg-blue-200 cursor-pointer"
                        >
                          Foto Dapur
                        </button>
                        <button
                          type="button"
                          onClick={() => setProofPhoto('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60')}
                          className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[9.5px] rounded hover:bg-emerald-200 cursor-pointer"
                        >
                          Foto Kurir
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conditionChecked}
                  onChange={(e) => setConditionChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#1B3A5C] rounded border-slate-300 focus:ring-[#D4A843]"
                />
                <span className="text-xs font-bold text-slate-800 leading-snug">
                  Saya mengonfirmasi bahwa makanan diserahkan ke kurir/penerima dalam keadaan segar, wadah steril, dan sesuai kuantitas porsi.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  stopLiveWebcam();
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
              >
                Batal
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="w-full sm:w-auto font-extrabold text-slate-950 shadow-md flex items-center justify-center gap-1.5"
                onClick={() => {
                  stopLiveWebcam();
                  handleVerifyCodeAtStore(confirmModal.code);
                }}
              >
                <CheckIcon size={14} />
                <span>Konfirmasi Handover Selesai </span>
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
              <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <CreditCardIcon size={14} className="text-amber-700" />
                <span>Bukti Transfer / Scan QRIS Toko Diunggah Konsumen:</span>
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
                className="font-extrabold text-slate-950 shadow-md flex items-center gap-1.5"
                onClick={() => handleApprovePaymentProof(paymentInspectModal.claim.code)}
              >
                <CheckIcon size={14} />
                <span>Verifikasi Lunas & Terbitkan Tiket </span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Tiket QR Resmi Terbit & Surat Jalan Kasir (Point 3 & 12) */}
      {issuedTicketModal.isOpen && issuedTicketModal.claim && (
        <Modal
          isOpen={issuedTicketModal.isOpen}
          onClose={() => setIssuedTicketModal({ isOpen: false, claim: null })}
          title={`Tiket QR Resmi & Manifest: ${issuedTicketModal.claim.code}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700 text-center">
            {/* Standardized Replate QR Generator Component */}
            <QRGenerator
              value={issuedTicketModal.claim.code}
              codeTitle={`REPLATE TIKET: ${issuedTicketModal.claim.code}`}
              codeSubtitle="Tunjukkan QR Code ini kepada Petugas Kasir / Driver saat serah terima"
              foodName={issuedTicketModal.claim.foodName}
              portions={issuedTicketModal.claim.quantity}
              recipientName={issuedTicketModal.claim.userName}
              expiryTime="Hari ini 22:00 WIB"
            />

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/${(issuedTicketModal.claim.recipientPhone || '081234567890').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Halo Kak ${issuedTicketModal.claim.userName}, pembayaran Rescue Sale untuk ${issuedTicketModal.claim.foodName} (${issuedTicketModal.claim.quantity}) telah LUNAS & DISETUJUI. Tunjukkan Kode Resi QR: ${issuedTicketModal.claim.code} di kasir saat mengambil makanan. Terima kasih!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <ChatIcon size={14} />
                <span>Kirim Link Tiket QR via WhatsApp ke Pembeli </span>
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
                Lihat di Tab Penyelamatan & Handover Kasir 
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
            {/* Header Status with High Contrast Typography */}
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

              <span className="px-3.5 py-1.5 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs self-start sm:self-center flex items-center gap-1.5">
                {liveTrackingModal.claim.status === 'COMPLETED' ? (
                  <>
                    <CheckIcon size={14} />
                    <span>Tiba & Diserahkan</span>
                  </>
                ) : (
                  <>
                    <BikeIcon size={14} />
                    <span>Sedang Diantar Kurir</span>
                  </>
                )}
              </span>
            </div>

            {/* Banner Bukti Pengiriman Terverifikasi (Poin 13) */}
            {liveTrackingModal.claim.status === 'COMPLETED' && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-emerald-700 shrink-0" />
                  <div>
                    <strong className="text-xs text-emerald-900 block font-black">
                      Penyaluran Makanan Selesai & Terverifikasi
                    </strong>
                    <span className="text-[11px] text-emerald-700">
                      Dokumentasi foto serah terima dan verifikasi penerima telah tersimpan sah di sistem.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeliveryProofModal({ isOpen: true, claim: liveTrackingModal.claim })}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 shrink-0"
                >
                  <span>Lihat Bukti Pengiriman</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* Courier / Driver Profile & Contact */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-xs ${liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                  {liveTrackingModal.claim.deliveryMethod === 'PROVIDER_DIRECT' ? (
                    <TruckIcon size={22} />
                  ) : (
                    <BikeIcon size={22} />
                  )}
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
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <ChatIcon size={14} />
                <span>Hubungi Driver (WhatsApp)</span>
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
              <span className="font-extrabold text-[#1B3A5C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ClockIcon size={14} className="text-[#1B3A5C]" />
                <span>Timeline Status Logistik Terverifikasi</span>
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
                leftIcon={<AlertTriangleIcon size={13} className="text-red-600" />}
                className="font-bold text-xs text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-1.5 cursor-pointer"
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
                Laporkan Kendala / Insiden Pengantaran
              </Button>

              <div className="flex items-center gap-2 flex-1 sm:justify-end">
                <Link href="/dashboard/tracking" className="flex-1 sm:flex-initial">
                  <Button variant="outline" size="sm" leftIcon={<MapIcon size={12} />} className="w-full text-xs font-bold border-[#1B3A5C] text-[#1B3A5C] hover:bg-[#1B3A5C]/5 cursor-pointer">
                    Live GPS
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold text-xs flex-1 sm:flex-initial"
                  onClick={() => setLiveTrackingModal({ isOpen: false, claim: null })}
                >
                  Tutup Live Tracking
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Incident & Food Safety Dispute Resolution Modal */}
      {incidentModal.isOpen && incidentModal.claim && (
        <Modal
          isOpen={incidentModal.isOpen}
          onClose={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'PACKAGING_DAMAGED', description: '', photoProof: null })}
          title={`Pusat Pelaporan Kendala & Mediasi: ${incidentModal.claim.code}`}
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
              <label className="font-extrabold text-slate-900 block">Kategori Kendala Operasional Toko / Dapur (Role Provider):</label>
              <select
                value={incidentModal.issueType}
                onChange={(e) => setIncidentModal({ ...incidentModal, issueType: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-[#1B3A5C] focus:ring-2 focus:ring-[#D4A843]"
              >
                <option value="PACKAGING_DAMAGED">1. Kemasan Rusak / Wadah Bocor Saat Penyiapan di Dapur</option>
                <option value="PORTION_MISMATCH">2. Porsi Surplus Tidak Cukup / Menu Tertukar di Dapur</option>
                <option value="PREPARATION_DELAY">3. Dapur Butuh Tambahan Waktu Penyiapan (Reschedule Window)</option>
                <option value="PROVIDER_DIRECT_BREAKDOWN">4. Kendala Armada Driver Toko (Khusus Pengantaran Internal)</option>
                <option value="DRIVER_NO_SHOW">5. Driver Relawan Belum Tiba Menjemput di Toko &gt;45 Menit</option>
                <option value="VEHICLE_SPEC_MISMATCH">6. Driver Relawan Tidak Membawa Box Cooler / Sesuai Ketentuan SOP</option>
                <option value="LARGE_CAPACITY_OVERLOAD">7. Porsi Donasi Terlalu Besar untuk Motor (Butuh Bantuan Mobil)</option>
                <option value="OTHER">8. Kendala Operasional Toko Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Lokasi Terakhir / Titik Temu Driver Saat Ini:</label>
              <input
                type="text"
                placeholder="Contoh: Jl. Raya Gubeng Depan RS Siloam / Titik Koordinat GPS"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#D4A843]"
              />
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

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <span className="font-extrabold text-[#1B3A5C] text-[11px] flex items-center gap-1.5">
                <ShieldCheckIcon size={14} className="text-[#1B3A5C]" />
                <span>Alur Tindak Lanjut Otomatis dari SuperAdmin Replate:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-700">
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-medium">
                  <strong>Jalur Donasi Pengganti:</strong> Sistem Smart Matching mencarikan resto terdekat untuk memback-up porsi.
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-medium">
                  <strong>Re-alokasi Driver Estafet:</strong> Dispatcher otomatis mengalihkan tugas jemput ke kurir relawan terdekat lain.
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-medium">
                  <strong>Perpanjangan Jendela Jemput:</strong> Waktu penjemputan di outlet diperpanjang 30-60 menit.
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-medium">
                  <strong>Berita Acara BAP Digital:</strong> Dokumen audit resmi diterbitkan agar reputasi toko tetap terjaga 100%.
                </div>
              </div>
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
              <Button type="submit" variant="danger" size="sm" className="font-black text-white bg-red-600 hover:bg-red-700 shadow-md">
                Kirim Laporan Eskalasi & SOS 
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {/* MODAL PLOTTING DRIVER ARMADA TOKO (Poin 4 - Sinkronisasi ke Modul Beneficiary) */}
      {plotDriverModal.isOpen && plotDriverModal.claim && (
        <Modal
          isOpen={plotDriverModal.isOpen}
          onClose={() => setPlotDriverModal({ isOpen: false, claim: null })}
          title={`Plotting Penugasan Driver Toko: ${plotDriverModal.claim.code}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">
                PENUGASAN ARMADA PENGANTARAN TOKO
              </span>
              <h4 className="text-sm font-black text-[#1B3A5C]">
                {plotDriverModal.claim.foodName} ({plotDriverModal.claim.quantity})
              </h4>
              <p className="text-[11px] text-slate-600 font-medium">
                Tujuan: <strong>{plotDriverModal.claim.userName}</strong> • {plotDriverModal.claim.address || 'Kota Surabaya'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-extrabold text-slate-900 block">Pilih Driver Internal Toko yang Ditugaskan:</label>
              <div className="space-y-2">
                {storeDriversList.map((drv) => (
                  <div
                    key={drv.id}
                    onClick={() => setSelectedPlotDriverId(drv.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      selectedPlotDriverId === drv.id
                        ? 'bg-blue-50/80 border-[#1B3A5C] ring-2 ring-[#1B3A5C]/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img src={drv.photo} alt={drv.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-black text-xs text-[#1B3A5C] flex items-center gap-1.5">
                          <span>{drv.name}</span>
                          <span className="text-[9px] font-bold text-amber-700"> {drv.rating}</span>
                        </h5>
                        <p className="text-[11px] text-slate-700 font-bold">{drv.vehicle}</p>
                        <p className="text-[10px] text-slate-500 font-mono">WA: {drv.phone} • {drv.trips}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedPlotDriverId === drv.id ? 'border-[#1B3A5C] bg-[#1B3A5C]' : 'border-slate-300'
                    }`}>
                      {selectedPlotDriverId === drv.id && <CheckIcon size={12} className="text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10.5px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              Data plotting driver ini akan <strong>otomatis tersinkronisasi secara real-time</strong> ke pop-up pelacakan pengiriman di akun panti/beneficiary.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlotDriverModal({ isOpen: false, claim: null })}
              >
                Batal
              </Button>
              <Button
                variant="gold"
                size="sm"
                leftIcon={<CheckIcon size={13} className="text-slate-950" />}
                className="font-black text-xs text-slate-950 shadow-xs cursor-pointer"
                onClick={() => handleAssignDriver(plotDriverModal.claim.code, selectedPlotDriverId)}
              >
                Tugaskan Driver & Sinkronkan 
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Bukti Pengiriman & Serah Terima (Poin 13) */}
      {deliveryProofModal.isOpen && (
        <Modal
          isOpen={deliveryProofModal.isOpen}
          onClose={() => setDeliveryProofModal({ isOpen: false, claim: null })}
          title={`Bukti Pengiriman & Serah Terima: ${deliveryProofModal.claim?.code || deliveryProofModal.claim?.id || ''}`}
          size="md"
        >
          {deliveryProofModal.claim && (() => {
            const claim = deliveryProofModal.claim;
            return (
              <div className="space-y-4 text-xs text-slate-800">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckIcon size={18} />
                  </div>
                  <div>
                    <strong className="text-emerald-950 font-black text-xs block">
                      Serah Terima Sukses & Terverifikasi
                    </strong>
                    <span className="text-[11px] text-emerald-800">
                      Diserahkan pada {claim.time || '19:40 WIB'} · Lolos verifikasi kode QR & SOP BPOM
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-900 block text-[11px]">
                    Foto Dokumentasi Serah Terima:
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center">
                    <img
                      src={claim.proofImage || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80'}
                      alt="Bukti Serah Terima"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                      <span className="text-white text-[10px] font-bold inline-flex items-center gap-1">
                        <MapPinIcon size={12} className="text-rose-400 shrink-0" />
                        <span>Lokasi Penerima: {claim.address || 'Panti Asuhan Kasih Ibu, Gubeng Surabaya'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Penerima Manfaat:</span>
                    <strong className="text-slate-900">{claim.recipientPerson || claim.userName || 'Penerima Terdaftar'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Diserahkan Oleh:</span>
                    <strong className="text-slate-900">{claim.courierName || 'Armada Driver Mitra'}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-400 block font-medium">Catatan Serah Terima:</span>
                    <p className="text-slate-700 font-medium">
                      Paket donasi makanan telah diterima utuh, higienis, dan sesuai dengan porsi yang tertera di surat jalan.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeliveryProofModal({ isOpen: false, claim: null })}
                    className="text-xs font-bold"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Authentic Super-App Action Loading Modal */}
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />
    </div>
  );
}
