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
import {
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  MapIcon,
  ChatIcon,
  BikeIcon,
  AlertTriangleIcon,
  BoltIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@/components/ui/Icon';
import { resolveIndonesianAddress } from '@/lib/geoResolver';
import {
  optimizeClusterRoute,
  FLEET_SPECS,
  FleetType,
  RouteWaypoint,
  OptimizedClusterPlan,
} from '@/lib/clusterRoutingEngine';
import { Navigation, Fuel, TrendingDown, Sparkles, FileText, ChevronLeft, ChevronRight, Info, UserCheck, Shield, Package } from 'lucide-react';

export default function PartnerActivePickupsPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'POOL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [activeViewMode, setActiveViewMode] = useState<'CARDS' | 'LIVE_TRACKING'>('CARDS');

  // Plotting Driver Modal State for Pool Tasks
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [isPlottingModalOpen, setIsPlottingModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv-1');
  const [assignmentNote, setAssignmentNote] = useState<string>('Gunakan wadah steril / coolbox. Penjemputan di area loading dock belakang resto.');

  // Modal states (Requirement Rescue #6)
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; claim: any | null }>({ isOpen: false, claim: null });
  const [auditModal, setAuditModal] = useState<{ isOpen: boolean; claim: any | null }>({ isOpen: false, claim: null });
  const [trackingModal, setTrackingModal] = useState<any | null>(null);
  const [incidentModal, setIncidentModal] = useState<{ isOpen: boolean; claim: any | null; issueType: string; description: string }>({
    isOpen: false,
    claim: null,
    issueType: 'DELIVERY_LATE',
    description: '',
  });

  // Pagination states (Requirement Rescue #7)
  const [activePage, setActivePage] = useState<number>(1);
  const [completedPage, setCompletedPage] = useState<number>(1);
  const itemsPerPage = 5;

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
      providerPhone: '0812-3456-7890',
      shelterName: 'Panti Asuhan Kasih Ibu',
      shelterAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      shelterPhone: '0819-8765-4321',
      quantity: '45 Porsi',
      status: 'AWAITING_RESCUE_PICKUP', // Phase 1: Wait for pickup at store
      time: 'Hari ini 19:00 WIB',
      assignedDriver: {
        name: 'Budi Santoso',
        phone: '0812-3456-7890',
        vehicle: 'Motor Box Cooler (25 kg)',
        plateNumber: 'L 1234 AB',
      },
      notes: 'Wadah steril food-grade, penjemputan pintu loading dock.',
      auditLogs: [
        { status: 'MATCH_ACCEPTED', title: 'Tugas Diterima dari Pool Tugas', time: '18:30 WIB', actor: 'Admin Komunitas', desc: 'Disetujui dari rekomendasi Smart Matching.' },
        { status: 'DRIVER_PLOTTED', title: 'Driver Ditugaskan: Budi Santoso', time: '18:35 WIB', actor: 'Admin Komunitas', desc: 'Armada Motor Box Cooler (L 1234 AB).' },
      ],
    },
    {
      code: 'FB-DON-99201',
      foodName: 'Roti Tawar Gandum & Croissant Steril',
      providerName: 'Bakery Bonami Surabaya',
      providerAddress: 'Jl. Pemuda No. 12, Surabaya',
      providerPhone: '0813-2233-4455',
      shelterName: 'Rumah Singgah Anak Jalanan',
      shelterAddress: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      shelterPhone: '0818-7766-5544',
      quantity: '30 Paket',
      status: 'IN_TRANSIT', // Phase 2: OTW delivering to shelter
      time: 'Hari ini 20:30 WIB',
      assignedDriver: {
        name: 'Ahmad Fauzi',
        phone: '0813-9876-5432',
        vehicle: 'Mobil Steril Food-Grade',
        plateNumber: 'L 5678 CD',
      },
      notes: 'Bawa tas pendingin, steril kemasan rapat.',
      auditLogs: [
        { status: 'MATCH_ACCEPTED', title: 'Tugas Diterima dari Pool Tugas', time: '18:00 WIB', actor: 'Admin Komunitas', desc: 'Disetujui dari rekomendasi Smart Matching.' },
        { status: 'DRIVER_PLOTTED', title: 'Driver Ditugaskan: Ahmad Fauzi', time: '18:05 WIB', actor: 'Admin Komunitas', desc: 'Armada Mobil Steril (L 5678 CD).' },
        { status: 'IN_TRANSIT', title: 'Scan QR Toko Selesai & OTW Panti', time: '18:45 WIB', actor: 'Driver Relawan', desc: 'Makanan telah diambil dari Bakery Bonami.' },
      ],
    },
  ];

  const defaultCompletedPickups = [
    {
      code: 'FB-DON-77182',
      foodName: 'Paket Roti Bakery Steril & Susu UHT',
      providerName: 'Bakery Bonami Surabaya',
      providerAddress: 'Jl. Pemuda No. 12, Surabaya',
      shelterName: 'Panti Werdha Lansia Sejahtera',
      shelterAddress: 'Jl. Manyar Kertoarjo No. 20, Surabaya',
      quantity: '30 Paket',
      status: 'COMPLETED',
      time: '21 Aug 2026, 14:00 WIB',
      assignedDriver: {
        name: 'Budi Santoso',
        phone: '0812-3456-7890',
        vehicle: 'Motor Box Cooler (25 kg)',
        plateNumber: 'L 1234 AB',
      },
      photoProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      auditLogs: [
        { status: 'COMPLETED', title: 'Serah Terima di Panti Selesai', time: '14:00 WIB', actor: 'Driver Relawan', desc: 'Diterima oleh pengurus panti lansia.' },
      ],
    },
  ];

  const defaultFleetDrivers = [
    {
      id: 'drv-1',
      name: 'Budi Santoso',
      phone: '0812-3456-7890',
      vehicle: 'Motor Box Cooler (25 kg)',
      plateNumber: 'L 1234 AB',
      capacity: '25 kg (40 Porsi)',
      maxWeightKg: 25,
      status: 'SIAGA',
      isOnDuty: true,
      approvalStatus: 'APPROVED',
    },
    {
      id: 'drv-2',
      name: 'Ahmad Fauzi',
      phone: '0813-9876-5432',
      vehicle: 'Mobil Steril Food-Grade (150 kg)',
      plateNumber: 'L 5678 CD',
      capacity: '150 kg (250 Porsi)',
      maxWeightKg: 150,
      status: 'SIAGA',
      isOnDuty: true,
      approvalStatus: 'APPROVED',
    },
    {
      id: 'drv-3',
      name: 'Rian Ardiansyah',
      phone: '0819-1122-3344',
      vehicle: 'Van Logistik Pendingin (500 kg)',
      plateNumber: 'L 9012 EF',
      capacity: '500 kg (800 Porsi)',
      maxWeightKg: 500,
      status: 'SIAGA',
      isOnDuty: false, // Off duty demo
      approvalStatus: 'APPROVED',
    },
  ];

  const defaultIncomingMatches = [
    {
      id: 'match-1',
      foodName: 'Nasi Goreng Buffet + Ayam Bakar (30 Porsi)',
      providerName: 'Hotel Majapahit Surabaya',
      providerAddress: 'Jl. Tunjungan No. 65, Genteng, Surabaya',
      providerPhone: '0812-3456-7890',
      matchedUserName: 'Food Bank Surabaya (Panti Kasih Ibu)',
      shelterAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      shelterPhone: '0819-8765-4321',
      quantity: 30,
      totalWeightKg: 35,
      requiredVehicle: 'Mobil Steril / Van Logistik (> 30 kg)',
      pickupTime: 'Hari ini 20:30 WIB',
      urgency: 'Mendesak (Darurat Segera)',
      matchScore: 98,
      packageNotes: 'Wadah food-grade steril, butuh bagasi mobil/van karena baki prasmanan lebar.',
    },
    {
      id: 'match-2',
      foodName: 'Aneka Artisan Sourdough & Baguette Perancis',
      providerName: 'Dago Bakery Surabaya Branch',
      providerAddress: 'Jl. Mayjen Sungkono No. 88, Surabaya Barat',
      providerPhone: '0813-9876-5432',
      matchedUserName: 'Rumah Singgah Anak Jalanan',
      shelterAddress: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      shelterPhone: '0818-7766-5544',
      quantity: 16,
      totalWeightKg: 8,
      requiredVehicle: 'Motor Box Cooler (Bisa Diangkut Motor)',
      pickupTime: 'Hari ini 21:00 WIB',
      urgency: 'Tinggi (Hari ini)',
      matchScore: 95,
      packageNotes: 'Boks roti tertutup rapat higienis, aman di motor box.',
    },
    {
      id: 'match-3',
      foodName: 'Nasi Ayam Bakar Specialty Pak Kumis',
      providerName: 'Warung Bakso Pak Kumis',
      providerAddress: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
      providerPhone: '0812-3456-7891',
      matchedUserName: 'Panti Asuhan Kasih Ibu',
      shelterAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      shelterPhone: '0819-8765-4321',
      quantity: 45,
      totalWeightKg: 22,
      requiredVehicle: 'Motor Box Cooler / Mobil Steril',
      pickupTime: 'Hari ini 19:30 WIB',
      urgency: 'Mendesak',
      matchScore: 96,
      packageNotes: 'Steril boks biodegradable, saus sambal sachet dipisah.',
    },
  ];

  const [drivers, setDrivers] = useState<any[]>(defaultFleetDrivers);
  const [matches, setMatches] = useState<any[]>(defaultIncomingMatches);
  const [activePickups, setActivePickups] = useState<any[]>(defaultActivePickups);
  const [completedPickups, setCompletedPickups] = useState<any[]>(defaultCompletedPickups);

  const toggleDriverDuty = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, isOnDuty: !d.isOnDuty } : d))
    );
  };

  const handleOpenPlottingModal = (match: any) => {
    setSelectedMatch(match);
    const available = drivers.filter((d) => d.isOnDuty && d.approvalStatus === 'APPROVED');
    if (match.totalWeightKg > 25) {
      const largeVehicle = available.find((d) => d.maxWeightKg >= match.totalWeightKg);
      if (largeVehicle) {
        setSelectedDriverId(largeVehicle.id);
      } else if (available.length > 0) {
        setSelectedDriverId(available[0].id);
      }
    } else {
      if (available.length > 0) {
        setSelectedDriverId(available[0].id);
      }
    }
    setAssignmentNote(`Gunakan wadah steril / coolbox. Penjemputan di ${match.providerName}, bawa makanan ke ${match.matchedUserName || match.shelterName}.`);
    setIsPlottingModalOpen(true);
  };

  const handleConfirmPlotDriver = () => {
    if (!selectedMatch) return;
    const chosenDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
    const claimCode = `FB-REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newPickup = {
      code: claimCode,
      foodName: selectedMatch.foodName,
      providerName: selectedMatch.providerName,
      providerAddress: selectedMatch.providerAddress,
      providerPhone: selectedMatch.providerPhone || '0812-3456-7890',
      shelterName: selectedMatch.matchedUserName || selectedMatch.shelterName || 'Panti Asuhan Kasih Ibu',
      shelterAddress: selectedMatch.shelterAddress || 'Kota Surabaya',
      shelterPhone: selectedMatch.shelterPhone || '0819-8765-4321',
      quantity: `${selectedMatch.quantity} Porsi (${selectedMatch.totalWeightKg || 20} kg)`,
      status: 'AWAITING_RESCUE_PICKUP',
      time: `Hari ini ${nowStr}`,
      assignedDriver: {
        id: chosenDriver.id,
        name: chosenDriver.name,
        phone: chosenDriver.phone,
        vehicle: chosenDriver.vehicle,
        plateNumber: chosenDriver.plateNumber,
      },
      courierName: chosenDriver.name,
      courierPhone: chosenDriver.phone,
      courierVehicle: `${chosenDriver.vehicle} (${chosenDriver.plateNumber})`,
      notes: assignmentNote,
      auditLogs: [
        { status: 'MATCH_ACCEPTED', title: 'Tugas Diterima dari Pool Tugas', time: nowStr, actor: 'Admin Komunitas', desc: 'Disetujui dari rekomendasi Smart Matching.' },
        { status: 'DRIVER_PLOTTED', title: `Driver Ditugaskan: ${chosenDriver.name}`, time: nowStr, actor: 'Admin Komunitas', desc: `Armada: ${chosenDriver.vehicle} (Plat: ${chosenDriver.plateNumber}). Surat Jalan Digital diterbitkan.` },
      ],
    };

    setActivePickups((prev) => [newPickup, ...prev]);
    setMatches((prev) => prev.filter((m) => m.id !== selectedMatch.id));

    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      const existingClaims = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
      localStorage.setItem('replate_claims', JSON.stringify([newPickup, ...existingClaims.filter((c: any) => c.code !== claimCode)]));

      const activeStr = localStorage.getItem('replate_active_claims');
      const existingActive = activeStr ? JSON.parse(activeStr) : [];
      localStorage.setItem('replate_active_claims', JSON.stringify([newPickup, ...existingActive.filter((c: any) => c.code !== claimCode)]));
    } catch (_) {}

    setIsPlottingModalOpen(false);
    setSelectedMatch(null);
    setToastState({
      isOpen: true,
      message: `Sukses! Tugas ${claimCode} berhasil di-plot ke driver ${chosenDriver.name}. Status beralih ke Siap Dijemput.`,
      type: 'success',
    });
    setActiveTab('ACTIVE');
  };

  // Pilar 4: 2-Opt Multi-Hop Routing State
  const [selectedFleet, setSelectedFleet] = useState<FleetType>('MOTORCYCLE_COOLBOX');
  const [showRouteOptimizer, setShowRouteOptimizer] = useState<boolean>(true);

  const { pickupsList, dropoffsList } = React.useMemo(() => {
    const picks: RouteWaypoint[] = [];
    const drops: RouteWaypoint[] = [];
    
    // Filter pickups to only those matching the selectedFleet capability and assigned vehicle
    const fleetFiltered = activePickups.filter((pickup) => {
      const v = (pickup.assignedDriver?.vehicle || '').toUpperCase();
      if (selectedFleet === 'MOTORCYCLE_COOLBOX') {
        return v.includes('MOTOR') || (!v.includes('MOBIL') && !v.includes('VAN'));
      } else if (selectedFleet === 'CAR_STERILE_BOX') {
        return v.includes('MOBIL') || v.includes('CAR');
      } else {
        return v.includes('VAN') || v.includes('TRUCK');
      }
    });

    const targetList = fleetFiltered.length > 0 ? fleetFiltered : activePickups.slice(0, selectedFleet === 'MOTORCYCLE_COOLBOX' ? 1 : 2);

    targetList.forEach((pickup, idx) => {
      picks.push({
        id: `pick-${pickup.code}`,
        name: `${pickup.providerName} (${pickup.foodName})`,
        address: pickup.providerAddress || 'Surabaya Pusat',
        type: 'PICKUP',
        lat: -7.2600 + (idx * 0.012),
        lng: 112.7450 + (idx * 0.008),
        weightKg: selectedFleet === 'MOTORCYCLE_COOLBOX' ? 12 : selectedFleet === 'CAR_STERILE_BOX' ? 45 : 95,
        portions: 30,
        rescueUrgencyIndex: pickup.status === 'IN_TRANSIT' ? 88 : 74,
      });
      drops.push({
        id: `drop-${pickup.code}`,
        name: `${pickup.shelterName} (Penerima)`,
        address: pickup.shelterAddress || 'Kota Surabaya',
        type: 'DROPOFF',
        lat: -7.2750 + (idx * 0.015),
        lng: 112.7550 + (idx * 0.012),
        weightKg: selectedFleet === 'MOTORCYCLE_COOLBOX' ? 12 : selectedFleet === 'CAR_STERILE_BOX' ? 45 : 95,
        portions: 30,
        rescueUrgencyIndex: 60,
      });
    });
    return { pickupsList: picks, dropoffsList: drops };
  }, [activePickups, selectedFleet]);

  const optimizedPlan: OptimizedClusterPlan | null = React.useMemo(() => {
    if (pickupsList.length === 0) return null;
    const depot: RouteWaypoint = {
      id: 'depot-surabaya',
      lat: -7.2575,
      lng: 112.7521,
      name: 'Hub Relawan Replate Surabaya',
      type: 'DEPOT',
      address: 'Genteng, Surabaya',
    };
    return optimizeClusterRoute(depot, pickupsList, dropoffsList, selectedFleet);
  }, [selectedFleet, pickupsList, dropoffsList]);

  // Pagination calculation (Requirement Rescue #7)
  const paginatedActivePickups = React.useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return activePickups.slice(start, start + itemsPerPage);
  }, [activePickups, activePage, itemsPerPage]);
  const totalActivePages = Math.max(1, Math.ceil(activePickups.length / itemsPerPage));

  const paginatedCompletedPickups = React.useMemo(() => {
    const start = (completedPage - 1) * itemsPerPage;
    return completedPickups.slice(start, start + itemsPerPage);
  }, [completedPickups, completedPage, itemsPerPage]);
  const totalCompletedPages = Math.max(1, Math.ceil(completedPickups.length / itemsPerPage));

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
              providerName: c.providerName || 'Hotel Majapahit Surabaya',
              providerAddress: c.providerAddress || 'Surabaya Pusat',
              providerPhone: c.providerPhone || '0812-3456-7890',
              shelterName: c.shelterName || 'Panti Asuhan Kasih Ibu',
              shelterAddress: c.shelterAddress || c.address || 'Kota Surabaya',
              shelterPhone: c.shelterPhone || '0819-8765-4321',
              quantity: typeof c.quantity === 'number' ? `${c.quantity} ${c.quantityUnit || 'Porsi'}` : c.quantity,
              status: c.status || 'AWAITING_RESCUE_PICKUP',
              time: c.time || c.readyTime || 'Hari ini',
              assignedDriver: c.assignedDriver || {
                name: c.courierName || 'Budi Santoso',
                phone: c.courierPhone || '0812-3456-7890',
                vehicle: c.courierVehicle || 'Motor Box Cooler (25 kg)',
                plateNumber: 'L 1234 AB',
              },
              notes: c.notes || 'Wadah steril food-grade',
              auditLogs: c.auditLogs || [],
            }));

          const completed = savedClaims
            .filter((c: any) => c.status === 'COMPLETED' || c.status === 'VERIFIED')
            .map((c: any) => ({
              code: c.claimCode || c.id,
              foodName: c.foodName,
              providerName: c.providerName || 'Bakery Bonami Surabaya',
              providerAddress: c.providerAddress || 'Surabaya',
              providerPhone: c.providerPhone || '0813-2233-4455',
              shelterName: c.shelterName || 'Panti Werdha Lansia Sejahtera',
              shelterAddress: c.shelterAddress || c.address || 'Kota Surabaya',
              shelterPhone: c.shelterPhone || '0818-7766-5544',
              quantity: typeof c.quantity === 'number' ? `${c.quantity} ${c.quantityUnit || 'Porsi'}` : c.quantity,
              status: 'COMPLETED',
              time: c.createdAt || 'Selesai',
              assignedDriver: c.assignedDriver || {
                name: c.courierName || 'Budi Santoso',
                phone: c.courierPhone || '0812-3456-7890',
                vehicle: c.courierVehicle || 'Motor Box Cooler (25 kg)',
                plateNumber: 'L 1234 AB',
              },
              photoProof: c.photoProof || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
              auditLogs: c.auditLogs || [],
            }));

          if (pending.length > 0) setActivePickups([...pending, ...defaultActivePickups.filter((d) => !pending.some((p) => p.code === d.code))]);
          if (completed.length > 0) setCompletedPickups([...completed, ...defaultCompletedPickups.filter((d) => !completed.some((c) => c.code === d.code))]);
        }
      }

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'POOL' || tabParam === 'ACTIVE' || tabParam === 'COMPLETED') {
          setActiveTab(tabParam as any);
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
      message: ` Status Resi ${cleanCode} Diperbarui: OTW DALAM PENGANTARAN KURIR MENUJU LOKASI PANTI!`,
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
      message: ` ALHAMDULILLAH! Resi ${cleanCode} Resmi Selesai (COMPLETED). Donasi Sukses Diterima Pengurus Panti!`,
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
            Konfirmasi Ambil & Set Status OTW 
          </Button>
        </div>
      </div>

      {showScanner && (
        <Card className="p-6 border-[#D4A843] bg-white shadow-md">
          <QRScanner onScanSuccess={handlePickupAtStore} />
        </Card>
      )}

      {/* Tabs Filter & In-Module View Switcher (Requirement Rescue #9) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
        {/* Tab Navigation: POOL, ACTIVE, COMPLETED */}
        <div className="flex border-b border-slate-200 text-xs font-bold overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('POOL')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'POOL'
                ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BoltIcon size={13} className={activeTab === 'POOL' ? 'text-[#D4A843]' : 'text-slate-400'} />
            <span>Pool Tugas Masuk ({matches.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('ACTIVE'); setActivePage(1); }}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ACTIVE'
                ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TruckIcon size={13} className={activeTab === 'ACTIVE' ? 'text-[#D4A843]' : 'text-slate-400'} />
            <span>Rute Aktif & Multi-Hop ({activePickups.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('COMPLETED'); setCompletedPage(1); }}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'COMPLETED'
                ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckIcon size={13} className={activeTab === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-400'} />
            <span>Riwayat Selesai ({completedPickups.length})</span>
          </button>
        </div>

        {activeTab === 'ACTIVE' && (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">Mode Tampilan:</span>
            <button
              onClick={() => setActiveViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'CARDS'
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Daftar Kartu Tugas ({activePickups.length})</span>
            </button>
            <button
              onClick={() => setActiveViewMode('LIVE_TRACKING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'LIVE_TRACKING'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <MapIcon size={13} />
              <span>Peta Live Tracking Rute</span>
            </button>
          </div>
        )}
      </div>

      {/* List Penjemputan / Pengantaran Aktif */}
      <div className="space-y-4">
        {activeTab === 'POOL' ? (
          <div className="space-y-6">
            {/* Driver Roster & On-Duty Toggle Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#1B3A5C] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Kesiapan Armada Relawan (Driver Roster & Status Siaga)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Hanya driver yang berstatus <strong className="text-emerald-700">ON-DUTY (Siaga)</strong> & disetujui Dinsos yang dapat ditugaskan untuk mengambil donasi makanan.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto">
                  {drivers.filter((d) => d.isOnDuty).length} dari {drivers.length} Driver Siaga
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {drivers.map((drv) => (
                  <div
                    key={drv.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                      drv.isOnDuty
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <strong className="text-xs font-extrabold text-slate-900 truncate">{drv.name}</strong>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                          {drv.approvalStatus === 'APPROVED' ? 'Dinsos RI' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                        <TruckIcon size={12} className="text-slate-400" />
                        <span className="truncate">{drv.vehicle}</span>
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Plat: {drv.plateNumber}</span>
                        <span>Maks: <strong>{drv.maxWeightKg} kg</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDriverDuty(drv.id)}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        drv.isOnDuty
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${drv.isOnDuty ? 'bg-emerald-200 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{drv.isOnDuty ? 'ON-DUTY (Siaga)' : 'OFF-DUTY (Istirahat)'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* List Incoming Matches Pool */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#1B3A5C] uppercase tracking-wider">
                  Daftar Rekomendasi Pangan Masuk ({matches.length} Tugas Tersedia)
                </span>
                <span className="text-xs text-slate-500">Urutkan: Urgensi Waktu & Skor AI</span>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-2 shadow-xs">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                    <CheckIcon size={24} className="text-emerald-600" />
                  </div>
                  <h4 className="font-black text-sm text-[#1B3A5C]">Semua Tugas Pool Telah Di-Plot</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                    Tidak ada antrean donasi makanan yang menunggu penugasan driver. Seluruh alur logistik telah berjalan.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('ACTIVE')} className="text-xs font-bold mt-2">
                    Lihat Rute Aktif Driver →
                  </Button>
                </div>
              ) : (
                matches.map((match) => {
                  const isHeavy = (match.totalWeightKg || 0) > 25;
                  return (
                    <Card key={match.id} className="border-slate-200 shadow-xs hover:border-[#1B3A5C]/40 transition-all">
                      <CardBody className="p-4 sm:p-5 space-y-4 text-xs">
                        {/* Header: Title, Score & Urgency */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-[#1B3A5C] text-[#D4A843] font-black text-[10px] rounded-md font-mono inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#D4A843]" />
                                <span>{match.matchScore || 96}% Cocok</span>
                              </span>
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black rounded-md inline-flex items-center gap-1">
                                <AlertTriangleIcon size={11} className="text-rose-700 shrink-0" />
                                <span>{match.urgency || 'Prioritas Hari Ini'}</span>
                              </span>
                              <span className="text-slate-400 text-xs">•</span>
                              <span className="text-slate-500 font-mono text-[11px] font-bold flex items-center gap-1">
                                <ClockIcon size={12} className="text-amber-600" />
                                {match.pickupTime}
                              </span>
                            </div>
                            <h3 className="font-black text-base sm:text-lg text-[#1B3A5C]">{match.foodName}</h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600">Total Muatan:</span>
                            <span className="text-sm font-black text-[#1B3A5C] bg-slate-100 px-3 py-1 rounded-xl">
                              {match.totalWeightKg} kg ({match.quantity} Porsi)
                            </span>
                          </div>
                        </div>

                        {/* Complete Specifications Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Box 1: Provider */}
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                              Titik Penjemputan (Provider / Toko):
                            </span>
                            <strong className="text-xs font-bold text-slate-900 block">{match.providerName}</strong>
                            <p className="text-slate-600 text-[11px] flex items-start gap-1">
                              <MapPinIcon size={12} className="text-red-500 shrink-0 mt-0.5" />
                              <span>{match.providerAddress}</span>
                            </p>
                            <p className="text-slate-500 text-[11px]">Telp: <strong className="text-slate-800">{match.providerPhone || '0812-3456-7890'}</strong></p>
                          </div>

                          {/* Box 2: Beneficiary Shelter */}
                          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 block">
                              Tujuan Pengantaran (Lembaga Penerima):
                            </span>
                            <strong className="text-xs font-bold text-emerald-950 block">{match.matchedUserName || match.shelterName}</strong>
                            <p className="text-emerald-900 text-[11px] flex items-start gap-1">
                              <MapPinIcon size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span>{match.shelterAddress}</span>
                            </p>
                            <p className="text-emerald-800 text-[11px]">Telp: <strong className="text-emerald-950">{match.shelterPhone || '0819-8765-4321'}</strong></p>
                          </div>
                        </div>

                        {/* Packaging & Logistics Warning Banner */}
                        <div className="space-y-2">
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                            <div className="space-y-0.5">
                              <span className="font-bold text-amber-900 inline-flex items-center gap-1">
                                <Package className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                                <span>Catatan Kemasan & Sterilisasi Khusus:</span>
                              </span>
                              <span className="text-amber-800">{match.packageNotes || 'Gunakan wadah steril / coolbox food-grade tertutup.'}</span>
                            </div>
                            <div className="shrink-0">
                              {isHeavy ? (
                                <span className="px-2.5 py-1 bg-amber-200 text-amber-950 font-black rounded-lg inline-flex items-center gap-1.5">
                                  <TruckIcon size={12} className="text-amber-950 shrink-0" />
                                  <span>Wajib Mobil / Van Logistik (&gt; 25 kg)</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg inline-flex items-center gap-1.5">
                                  <CheckIcon size={12} className="text-emerald-800 shrink-0" />
                                  <span>Sepeda Motor Box Aman (≤ 25 kg)</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Surat Jalan Digital & QR Code Manifest akan diterbitkan langsung saat driver dipilih.
                          </span>
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => handleOpenPlottingModal(match)}
                            className="font-black text-xs text-slate-950 py-2.5 px-5 shadow-sm bg-amber-400 hover:bg-amber-500 border border-amber-500 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <TruckIcon size={14} />
                            <span>Plot Driver & Ambil Tugas</span>
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'ACTIVE' ? (
          activePickups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3 shadow-xs">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl border border-blue-200 text-blue-600 flex items-center justify-center mx-auto text-2xl">
                
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-[#1B3A5C]">Tidak Ada Penjemputan Aktif Saat Ini</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Saat ini belum ada tugas pengantaran logistik pangan surplus yang ditugaskan ke armada relawan Anda.
                </p>
              </div>
              <Link href="/dashboard/rescue-partner/requests" className="inline-block pt-2">
                <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-4 py-2 shadow-xs">
                  Cek Pool Tugas Masuk 
                </Button>
              </Link>
            </div>
          ) : activeViewMode === 'LIVE_TRACKING' ? (
            /* INTEGRATED LIVE TRACKING VIEW (Requirement Rescue #9) */
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-[#1B3A5C] via-[#142C47] to-[#1B3A5C] text-white rounded-2xl border border-[#2C5A8F] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                      Live Telemetry Aktif
                    </span>
                    <span className="text-xs text-slate-200 font-medium">
                      Memantau {activePickups.length} armada logistik bergerak
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Peta Satelit & GPS Monitoring Penyelamatan Pangan
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveViewMode('CARDS')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 cursor-pointer"
                  >
                    ← Kembali ke Kartu Tugas
                  </button>
                  <Link href="/dashboard/tracking">
                    <Button variant="gold" size="sm" className="font-black text-xs text-slate-950">
                      Buka Fullscreen Tracking
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Map Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Embedded Map */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative min-h-[380px]">
                  <iframe
                    title="Peta Live Tracking Armada Rescue"
                    width="100%"
                    height="100%"
                    style={{ minHeight: '380px', border: 0 }}
                    loading="lazy"
                    src="https://maps.google.com/maps?q=-7.2575,112.7521&z=13&output=embed"
                    className="w-full h-full filter saturate-150"
                  />
                  <div className="absolute top-3 left-3 bg-[#1B3A5C]/95 text-white p-2.5 rounded-xl text-xs font-bold shadow-md border border-slate-700 backdrop-blur-xs max-w-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>GPS Sinyal Terhubung (Surabaya Raya)</span>
                    </div>
                    <p className="text-[10.5px] text-slate-200 font-normal">
                      Posisi armada driver diperbarui otomatis setiap interval 15 detik.
                    </p>
                  </div>
                </div>

                {/* Active Drivers Live List */}
                <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-black text-xs text-[#1B3A5C] uppercase tracking-wider">
                        Armada OTW Saat Ini
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {activePickups.filter(p => p.status === 'IN_TRANSIT').length} OTW / {activePickups.length} Total
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {activePickups.map((item) => (
                        <div key={item.code} className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-xs space-y-2 transition-all">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-black text-[11px] text-[#1B3A5C] bg-white px-2 py-0.5 rounded border border-slate-200">
                              {item.code}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                              item.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-blue-100 text-blue-900'
                            }`}>
                              {item.status === 'IN_TRANSIT' ? 'OTW KE PANTI' : 'MENUNGGU PICKUP'}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-bold text-slate-900 truncate">{item.foodName}</h5>
                            <p className="text-[11px] text-slate-500 truncate">
                              Ke: <strong>{item.shelterName}</strong>
                            </p>
                            <p className="text-[10.5px] text-emerald-800 font-bold mt-0.5 flex items-center gap-1">
                              <UserCheck size={11} className="text-emerald-700" />
                              <span>{item.assignedDriver?.name || 'Budi Santoso'} ({item.assignedDriver?.vehicle?.split(' ')[0] || 'Motor'})</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
                            <Link href={`/dashboard/rescue-partner/surat-jalan?code=${item.code}`} className="flex-1">
                              <button className="w-full py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[10.5px] font-bold text-slate-800 flex items-center justify-center gap-1 cursor-pointer">
                                <FileText size={11} /> Surat Jalan
                              </button>
                            </Link>
                            <button
                              onClick={() => setTrackingModal(item)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <MapIcon size={11} /> Lacak
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <span className="text-[10.5px] text-slate-400 font-medium">
                      Gunakan menu <strong>Surat Jalan Driver</strong> untuk interaksi langsung di lapangan.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* CARDS VIEW WITH 5 ACTIONS (Requirement Rescue #6) & PAGINATION (Requirement Rescue #7) */
            <>
              {/* Pilar 4: 2-Opt TSP Multi-Hop Consolidated Route Plan */}
              {optimizedPlan && (
                <div className="p-5 bg-[#14263B] text-white rounded-3xl border-2 border-[#D4A843]/60 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#D4A843] text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                        <Navigation className="w-5 h-5 text-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                            Pilar 4: Heuristic 2-Opt TSP
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            Hemat {optimizedPlan.efficiencyGainPercent.toFixed(1)}% BBM & Waktu
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          Rekomendasi Rute Multi-Hop Konsolidasi Terpendek
                        </h4>
                      </div>
                    </div>

                    {/* Fleet Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Armada:</span>
                      <select
                        value={selectedFleet}
                        onChange={(e) => setSelectedFleet(e.target.value as FleetType)}
                        className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl p-2 focus:ring-2 focus:ring-[#D4A843]"
                      >
                        <option value="MOTORCYCLE_COOLBOX">Motor Box Cooler (25 kg)</option>
                        <option value="CAR_STERILE_BOX">Mobil Steril (150 kg)</option>
                        <option value="VAN_LOGISTICS">Van Logistik (500 kg)</option>
                      </select>
                    </div>
                  </div>

                  {/* Savings Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Jarak Terpangkas</span>
                      <strong className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                        {optimizedPlan.distanceSavedKm} km
                      </strong>
                      <span className="text-[9px] text-slate-500 block">Dari {optimizedPlan.unoptimizedDistanceKm} km</span>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Waktu Terhemat</span>
                      <strong className="text-sm sm:text-base font-black text-cyan-400 font-mono">
                        {optimizedPlan.timeSavedMinutes} Menit
                      </strong>
                      <span className="text-[9px] text-slate-500 block">Estimasi {optimizedPlan.optimizedDurationMinutes} m</span>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold">BBM Terhemat</span>
                      <strong className="text-sm sm:text-base font-black text-amber-300 font-mono">
                        {optimizedPlan.fuelSavedLiters} L
                      </strong>
                      <span className="text-[9px] text-slate-500 block">Rp {optimizedPlan.fuelCostSavedRp.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Kapasitas Muat</span>
                      <strong className="text-sm sm:text-base font-black text-purple-300 font-mono">
                        {optimizedPlan.capacityUtilizationPercent}%
                      </strong>
                      <span className="text-[9px] text-slate-500 block">{optimizedPlan.totalRescuedWeightKg} kg / {optimizedPlan.fleetSpec.maxWeightKg} kg</span>
                    </div>
                  </div>

                  {/* Stops sequence strip */}
                  <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider block">
                      Urutan Rute Penjemputan & Pengantaran (Multi-Stop):
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {optimizedPlan.orderedStops.map((wp: RouteWaypoint, idx: number) => (
                        <React.Fragment key={`${wp.id}-${idx}`}>
                          <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-xs ${
                            wp.type === 'DEPOT'
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : wp.type === 'PICKUP'
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                              : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[140px] sm:max-w-[200px]">{wp.name}</span>
                          </span>
                          {idx < optimizedPlan.orderedStops.length - 1 && (
                            <span className="text-slate-500 font-bold">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Paginated Route Task Cards (5 cards per page) */}
              {paginatedActivePickups.map((item) => (
              <Card key={item.code} className="border-slate-200 shadow-xs hover:shadow-md transition-all">
                <CardBody className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm bg-[#1B3A5C] text-white px-3 py-1 rounded-md">
                        {item.code}
                      </span>
                      {item.status === 'IN_TRANSIT' ? (
                        <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-md shadow-xs animate-pulse">
                           OTW MENGANTAR KE PANTI
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-600 text-white font-extrabold text-xs rounded-md shadow-xs">
                           SIAP DIAMBIL DI TOKO
                        </span>
                      )}
                      {item.assignedDriver && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 font-extrabold text-xs rounded-md flex items-center gap-1.5">
                          <UserCheck size={12} className="text-blue-700" />
                          <span>Driver: <strong>{item.assignedDriver.name}</strong> ({item.assignedDriver.vehicle})</span>
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

                  {item.notes && (
                    <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-xs">
                      <span className="font-bold">Catatan Pengantaran: </span>
                      <span className="font-medium">{item.notes}</span>
                    </div>
                  )}

                  {/* 5 Aksi Lengkap Sesuai Permintaan (Requirement Rescue #6) */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* 5 Distinct Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Aksi 1: Surat Jalan Digital */}
                      <Link href={`/dashboard/rescue-partner/surat-jalan?code=${item.code}`}>
                        <Button
                          variant="gold"
                          size="sm"
                          className="font-black text-xs text-slate-950 shadow-xs flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                        >
                          <FileText size={13} />
                          <span>Surat Jalan Driver</span>
                        </Button>
                      </Link>

                      {/* Aksi 2: Detail Informasi */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        onClick={() => setDetailModal({ isOpen: true, claim: item })}
                      >
                        <Info size={13} className="text-[#1B3A5C]" />
                        <span>Detail Informasi</span>
                      </Button>

                      {/* Aksi 3: Live Tracking */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        onClick={() => setTrackingModal(item)}
                      >
                        <MapIcon size={13} className="text-emerald-600" />
                        <span>Live Tracking</span>
                      </Button>

                      {/* Aksi 4: Audit Log */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        onClick={() => setAuditModal({ isOpen: true, claim: item })}
                      >
                        <Shield size={13} className="text-purple-600" />
                        <span>Audit Log</span>
                      </Button>

                      {/* Aksi 5: Lapor Masalah / Kendala */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                        onClick={() => setIncidentModal({
                          isOpen: true,
                          claim: item,
                          issueType: 'DELIVERY_LATE',
                          description: '',
                        })}
                      >
                        <AlertTriangleIcon size={13} className="text-red-600" />
                        <span>Lapor Kendala</span>
                      </Button>
                    </div>

                    {/* Operational Next Step Button */}
                    <div className="shrink-0">
                      {item.status === 'AWAITING_RESCUE_PICKUP' ? (
                        <Button
                          variant="gold"
                          size="sm"
                          className="font-extrabold text-xs shadow-xs w-full sm:w-auto"
                          onClick={() => handlePickupAtStore(item.code)}
                        >
                           Scan QR Toko & Set OTW 
                        </Button>
                      ) : (
                        <Button
                          variant="gold"
                          size="sm"
                          className="font-black text-xs shadow-md bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                          onClick={() => setCompleteModalItem(item)}
                        >
                           Konfirmasi Sampai Panti 
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            {/* Pagination Controls for Active Pickups (Requirement Rescue #7) */}
            {totalActivePages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 pt-4 px-2">
                <span className="text-xs text-slate-500 font-medium">
                  Menampilkan {((activePage - 1) * itemsPerPage) + 1} - {Math.min(activePage * itemsPerPage, activePickups.length)} dari {activePickups.length} tugas rute aktif (5 kartu per halaman)
                </span>
                <div className="flex items-center gap-2 self-center sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activePage === 1}
                    onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                    className="text-xs font-bold flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Sebelumnya
                  </Button>
                  {Array.from({ length: totalActivePages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setActivePage(pg)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        activePage === pg
                          ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activePage === totalActivePages}
                    onClick={() => setActivePage((p) => Math.min(totalActivePages, p + 1))}
                    className="text-xs font-bold flex items-center gap-1"
                  >
                    Selanjutnya <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
            </>
          )
        ) : (
          completedPickups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-2 shadow-xs">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-xl">
                
              </div>
              <h4 className="font-black text-sm text-[#1B3A5C]">Belum Ada Riwayat Pengantaran Selesai</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                Penyaluran logistik yang telah berhasil diserahterimakan ke panti asuhan akan tampil di tab ini.
              </p>
            </div>
          ) : (
            <>
            {paginatedCompletedPickups.map((item) => (
              <Card key={item.code} className="border-slate-200 shadow-xs hover:shadow-md transition-all">
                <CardBody className="p-5 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm bg-emerald-700 text-white px-2.5 py-0.5 rounded-md">
                        {item.code}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-md">
                         COMPLETED (TERSERAHKAN KE PANTI)
                      </span>
                      {item.assignedDriver && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">
                          Driver: {item.assignedDriver.name}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 font-medium">Diserahkan: {item.time}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Penyedia Asal:</span>
                      <strong className="text-slate-900 block">{item.providerName}</strong>
                      <p className="text-emerald-700 font-bold mt-0.5">{item.foodName} ({item.quantity})</p>
                    </div>
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Penerima Manfaat:</span>
                      <strong className="text-emerald-950 block">{item.shelterName}</strong>
                      <p className="text-emerald-800">{item.shelterAddress}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/dashboard/rescue-partner/surat-jalan?code=${item.code}`}>
                        <Button variant="outline" size="sm" className="text-xs font-bold flex items-center gap-1 border-slate-200 text-slate-700">
                          <FileText size={12} /> Surat Jalan
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold flex items-center gap-1 border-slate-200 text-slate-700"
                        onClick={() => setDetailModal({ isOpen: true, claim: item })}
                      >
                        <Info size={12} className="text-[#1B3A5C]" /> Detail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold flex items-center gap-1 border-slate-200 text-slate-700"
                        onClick={() => setAuditModal({ isOpen: true, claim: item })}
                      >
                        <Shield size={12} className="text-purple-600" /> Audit Log
                      </Button>
                    </div>

                    {item.photoProof && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">Foto Bukti:</span>
                        <img
                          src={item.photoProof}
                          alt="Bukti Serah Terima Panti"
                          className="w-14 h-10 object-cover rounded-lg border border-slate-300 shrink-0"
                        />
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}

            {/* Pagination Controls for Completed Pickups */}
            {totalCompletedPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 pt-4 px-2">
                <span className="text-xs text-slate-500 font-medium">
                  Menampilkan {((completedPage - 1) * itemsPerPage) + 1} - {Math.min(completedPage * itemsPerPage, completedPickups.length)} dari {completedPickups.length} riwayat selesai (5 kartu per halaman)
                </span>
                <div className="flex items-center gap-2 self-center sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={completedPage === 1}
                    onClick={() => setCompletedPage((p) => Math.max(1, p - 1))}
                    className="text-xs font-bold flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Sebelumnya
                  </Button>
                  {Array.from({ length: totalCompletedPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCompletedPage(pg)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        completedPage === pg
                          ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={completedPage === totalCompletedPages}
                    onClick={() => setCompletedPage((p) => Math.min(totalCompletedPages, p + 1))}
                    className="text-xs font-bold flex items-center gap-1"
                  >
                    Selanjutnya <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
            </>
          )
        )}
      </div>

      {/* MODAL PLOT DRIVER UNTUK POOL TUGAS */}
      <Modal
        isOpen={isPlottingModalOpen}
        onClose={() => setIsPlottingModalOpen(false)}
        title={`Plotting Driver & Armada: ${selectedMatch?.foodName || 'Tugas Rescue'}`}
        size="lg"
      >
        {selectedMatch && (
          <div className="space-y-4 text-xs text-slate-800">
            {/* Header info */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-[#1B3A5C]">{selectedMatch.foodName}</strong>
                <span className="font-bold text-slate-700 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedMatch.totalWeightKg} kg • {selectedMatch.quantity} Porsi
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Jemput: <strong>{selectedMatch.providerName}</strong> ({selectedMatch.providerAddress})
              </p>
              <p className="text-emerald-700 text-[11px]">
                Tujuan: <strong>{selectedMatch.matchedUserName || selectedMatch.shelterName}</strong> ({selectedMatch.shelterAddress})
              </p>
            </div>

            {/* Capacity check warning banner */}
            {selectedMatch.totalWeightKg > 25 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-900">
                  <AlertTriangleIcon size={15} />
                  <span>PERINGATAN KAPASITAS ARMADA (&gt; 25 KG)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Total muatan donasi ini mencapai <strong>{selectedMatch.totalWeightKg} kg</strong>, melebihi batas muatan sepeda motor box cooler (maks 25 kg).
                  Sistem sangat merekomendasikan memilih <strong>Mobil Steril Food-Grade</strong> atau <strong>Van Logistik</strong> demi keselamatan pangan dan driver.
                </p>
              </div>
            )}

            {/* Driver Options Selection */}
            <div className="space-y-2">
              <label className="font-extrabold text-[#1B3A5C] block">
                Pilih Armada Driver (Hanya yang ON-DUTY &amp; Disetujui Dinsos):
              </label>
              <div className="space-y-2">
                {drivers.map((drv) => {
                  const isSelected = selectedDriverId === drv.id;
                  const isOffDuty = !drv.isOnDuty;
                  const isUnderCapacity = drv.maxWeightKg < selectedMatch.totalWeightKg;

                  return (
                    <div
                      key={drv.id}
                      onClick={() => {
                        if (!isOffDuty) {
                          setSelectedDriverId(drv.id);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'border-[#1B3A5C] bg-blue-50/60 ring-2 ring-[#1B3A5C]/20 shadow-xs'
                          : isOffDuty
                          ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#1B3A5C] bg-[#1B3A5C]' : 'border-slate-400 bg-white'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold text-slate-900">{drv.name}</strong>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              drv.isOnDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {drv.isOnDuty ? 'ON-DUTY' : 'OFF-DUTY'}
                            </span>
                            {isUnderCapacity && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                Kapasitas Kurang
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {drv.vehicle} • Plat: {drv.plateNumber} (Kapasitas: {drv.capacity})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-[11px] font-bold text-slate-500">Maks: {drv.maxWeightKg} kg</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assignment Notes */}
            <div className="space-y-1">
              <label className="font-extrabold text-[#1B3A5C] block">
                Catatan Instruksi &amp; Penanganan Makanan (Opsional):
              </label>
              <textarea
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
                placeholder="Instruksi penjemputan..."
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsPlottingModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleConfirmPlotDriver}
                disabled={!drivers.find((d) => d.id === selectedDriverId)?.isOnDuty}
                className="font-black text-xs text-slate-950 px-4 py-2 bg-amber-400 hover:bg-amber-500 shadow-md cursor-pointer"
              >
                Konfirmasi Plotting &amp; Terbitkan Surat Jalan
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
                    <div className="text-xl"></div>
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
                Selesaikan Donasi & Set Status COMPLETED 
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL TRACKING DRIVER & TIMELINE (Poin 1 & 5 - benchmark lengkap role provider) */}
      <Modal
        isOpen={!!trackingModal}
        onClose={() => setTrackingModal(null)}
        title={`Live Tracking & Audit Logistik Resi: ${trackingModal?.code || trackingModal?.id}`}
        size="lg"
      >
        {trackingModal && (() => {
          const claim = trackingModal;
          const isWaitingApproval = claim.status === 'WAITING_PAYMENT_APPROVAL' || claim.status === 'AWAITING_VERIFICATION' || claim.status === 'PENDING_APPROVAL';
          const isWaitingPool = claim.status === 'WAITING_RESCUE_POOL';
          const isPickup = (claim.method || '').includes('SELF') || (claim.methodLabel || '').includes('Ambil');
          const isProviderDelivery = claim.method === 'PROVIDER_DELIVERY' || claim.method === 'PROVIDER_DIRECT';

          const driver = {
            name: 'Anda (Relawan Komunitas)',
            phone: '081234567890',
            vehicle: 'Motor Box Cooler Steril (Plat L 8912 RC)',
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          };

          const pantiName = claim.shelterName || 'Panti Asuhan Kasih Ibu';
          const providerName = claim.providerName || 'Provider Replate';

          // Timeline logic adapted for rescue partner UI
          const timelineSteps = [
            {
              title: 'Donasi Siap di Toko (OTW Jemput)',
              time: claim.time || '18:30 WIB',
              desc: 'Toko telah menyetujui, relawan meluncur ke lokasi toko.',
              done: true,
              current: false,
            },
            {
              title: 'Kurir Relawan Tiba di Toko & Handover Selesai',
              time: '19:00 WIB',
              desc: 'Makanan diserahkan dalam kemasan steril oleh pihak toko.',
              done: claim.status === 'IN_TRANSIT' || claim.status === 'COMPLETED',
              current: claim.status === 'AWAITING_RESCUE_PICKUP',
            },
            {
              title: 'Dalam Perjalanan Menuju Shelter Panti',
              time: '19:15 WIB',
              desc: 'Kurir sedang OTW (Estimasi Tiba: 20-25 Menit).',
              done: claim.status === 'COMPLETED',
              current: claim.status === 'IN_TRANSIT',
            },
            {
              title: 'Serah Terima di Panti Asuhan & Berita Acara Foto',
              time: claim.status === 'COMPLETED' ? claim.time || '19:40 WIB' : 'Menunggu',
              desc: claim.status === 'COMPLETED' ? 'Makanan diterima anak-anak panti dalam kondisi aman.' : 'Menunggu konfirmasi kedatangan di lokasi tujuan.',
              done: claim.status === 'COMPLETED',
              current: false,
            },
          ];

          return (
            <div className="space-y-5 text-xs text-slate-800">
              {/* Header Status with High Contrast Typography */}
              <div className="p-5 bg-gradient-to-r from-[#1B3A5C] via-[#142C47] to-[#1B3A5C] text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#2C5A8F]">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                    REAL-TIME COURIER LOGISTICS TRACKING
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight drop-shadow-xs">
                    {claim.foodName} ({claim.quantity || '1 Porsi'})
                  </h3>
                  <p className="text-xs text-slate-200 font-mono">
                    Kode Resi: <strong className="text-[#D4A843] bg-slate-950/80 px-2 py-0.5 rounded">{claim.code || claim.id}</strong>
                  </p>
                </div>

                <span className="px-3.5 py-1.5 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs self-start sm:self-center flex items-center gap-1.5">
                  {claim.status === 'COMPLETED' ? (
                    <>
                      <CheckIcon size={14} />
                      <span>Tiba & Diserahkan</span>
                    </>
                  ) : isWaitingApproval ? (
                    <>
                      <ClockIcon size={14} />
                      <span>Menunggu Pembayaran</span>
                    </>
                  ) : isWaitingPool ? (
                    <>
                      <BoltIcon size={14} />
                      <span>Menunggu Relawan</span>
                    </>
                  ) : claim.status === 'IN_TRANSIT' ? (
                    <>
                      <BikeIcon size={14} />
                      <span>Sedang Diantar Kurir</span>
                    </>
                  ) : (
                    <>
                      <MapPinIcon size={14} />
                      <span>Menuju Toko</span>
                    </>
                  )}
                </span>
              </div>

              {/* Courier Profile Card */}
              {!isPickup && (
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isProviderDelivery ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-xs ${isProviderDelivery ? 'bg-blue-600' : 'bg-purple-600'}`}>
                      {isProviderDelivery ? <TruckIcon size={22} /> : <BikeIcon size={22} />}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest block ${isProviderDelivery ? 'text-blue-700' : 'text-purple-700'}`}>
                        {isProviderDelivery ? 'ARMADA DRIVER INTERNAL TOKO' : 'KURIR RELAWAN RESMI KOMUNITAS'}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {driver.name}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {driver.vehicle}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo ${providerName}, saya dari Relawan Komunitas OTW mengambil donasi resi ${claim.code || claim.id}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-[#1B3A5C] hover:bg-[#142C47] text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <ChatIcon size={13} />
                      <span>Chat Toko</span>
                    </a>
                    <a
                      href={`https://wa.me/6281298765432?text=${encodeURIComponent(`Halo ${pantiName}, saya dari Relawan Komunitas akan mengantar donasi resi ${claim.code || claim.id}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <ChatIcon size={13} />
                      <span>Chat Panti</span>
                    </a>
                  </div>
                </div>
              )}

              {/* RUTE PENJEMPUTAN & PENERIMA (Benchmark Provider) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-semibold block">Toko Penyedia Donasi:</span>
                  <strong className="text-[#1B3A5C] block">{providerName}</strong>
                  <p className="text-[11px] text-slate-600">{claim.providerAddress || 'Jl. Raya Darmo, Surabaya'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-semibold block">Tujuan Pengantaran (Lembaga):</span>
                  <strong className="text-emerald-800 block">{pantiName}</strong>
                  <p className="text-[11px] text-slate-600">{claim.shelterAddress || 'Jl. Raya Gubeng No 88, Surabaya'}</p>
                </div>
              </div>

              {/* Embedded Live GPS Map Preview */}
              {(() => {
                const destGeo = resolveIndonesianAddress(claim.shelterAddress || claim.destinationAddress || 'Surabaya');
                const destLat = claim.shelterLat || claim.destinationLat || destGeo.lat;
                const destLng = claim.shelterLng || claim.destinationLng || destGeo.lng;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#1B3A5C] flex items-center gap-1">
                        <MapPinIcon size={14} className="text-emerald-600" />
                        <span>Peta GPS Rute Pengantaran ({destGeo.cityNameOnly || 'Tujuan'})</span>
                      </span>
                      <span className="text-[10.5px] font-mono font-bold text-slate-500">
                        GPS: {destLat.toFixed(5)}, {destLng.toFixed(5)}
                      </span>
                    </div>
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
                      <iframe
                        title="Peta Live Tracking Relawan"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        src={`https://maps.google.com/maps?q=${destLat},${destLng}&z=15&output=embed`}
                        className="w-full h-full filter saturate-150"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-[#1B3A5C] text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-md">
                        Tujuan: {pantiName} ({destGeo.cityNameOnly})
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Checkpoint Timeline */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#1B3A5C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ClockIcon size={14} className="text-[#1B3A5C]" />
                  <span>Timeline Status Logistik Terverifikasi</span>
                </span>
                <div className="space-y-3 pl-2 border-l-2 border-slate-300 text-xs">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative pl-4">
                      <span className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${
                        step.done ? 'bg-emerald-500 ring-4 ring-emerald-100' :
                        step.current ? 'bg-blue-500 ring-4 ring-blue-100 animate-pulse' :
                        'bg-slate-300'
                      }`}></span>
                      <strong className={`block ${step.done ? 'text-slate-900' : step.current ? 'text-blue-950' : 'text-slate-400'}`}>
                        {step.title}
                      </strong>
                      <span className="text-slate-500 text-[11px]">
                        {step.time} • {step.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BPOM Audit */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
                <ShieldCheckIcon size={16} className="text-emerald-600 shrink-0" />
                <div className="text-[11px] leading-snug text-emerald-900">
                  <strong className="block font-black">Audit Higienitas Terjamin</strong>
                  <span className="font-medium">LOLOS AUDIT BPOM 8-POIN — Standar Dinsos RI Terverifikasi</span>
                </div>
              </div>

              {/* Action Buttons: Live GPS, Tutup, & Laporkan Kendala */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<AlertTriangleIcon size={13} className="text-red-600" />}
                  className="font-bold text-xs text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={() => {
                    const target = trackingModal;
                    setTrackingModal(null);
                    setIncidentModal({
                      isOpen: true,
                      claim: target,
                      issueType: 'DELIVERY_LATE',
                      description: '',
                    });
                  }}
                >
                  Laporkan Kendala / Masalah
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
                    onClick={() => setTrackingModal(null)}
                  >
                    Tutup Lacak Pengiriman
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* MODAL LAPORKAN KENDALA */}
      {incidentModal.isOpen && incidentModal.claim && (
        <Modal
          isOpen={incidentModal.isOpen}
          onClose={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'DELIVERY_LATE', description: '' })}
          title={`Pusat Pelaporan Kendala: ${incidentModal.claim.code || incidentModal.claim.id}`}
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ticketCode = `INC-${Date.now().toString().slice(-6)}`;
              setToastState({
                isOpen: true,
                message: `Laporan Darurat #${ticketCode} tercatat! Tim Pengawas Replate & Koordinator Lapangan telah menerima tiket eskalasi.`,
                type: 'success',
              });
              setIncidentModal({ isOpen: false, claim: null, issueType: 'DELIVERY_LATE', description: '' });
            }}
            className="space-y-4 text-xs text-slate-700"
          >
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block">
                SOP PENANGANAN DARURAT LOGISTIK & DRIVER
              </span>
              <h4 className="text-sm font-black text-red-950">
                Penyelesaian Kendala Resi {incidentModal.claim.code || incidentModal.claim.id} ({incidentModal.claim.foodName})
              </h4>
              <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                Setiap laporan dipantau langsung oleh Koordinator Wilayah untuk memastikan keamanan makanan surplus.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Kategori Kendala Operasional (Kurir / Rescue):</label>
              <select
                value={incidentModal.issueType}
                onChange={(e) => setIncidentModal({ ...incidentModal, issueType: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-[#1B3A5C] focus:ring-2 focus:ring-[#D4A843]"
              >
                <option value="DELIVERY_LATE">1. Kendala Lalu Lintas / Cuaca (Pengantaran Terlambat)</option>
                <option value="PORTION_MISMATCH">2. Porsi Donasi Tidak Sesuai dari Toko</option>
                <option value="PACKAGING_DAMAGED">3. Kemasan Makanan Rusak / Bocor / Wadah Makanan Pecah</option>
                <option value="PROVIDER_UNREACHABLE">4. PIC Toko Tidak Dapat Dihubungi / Toko Tutup</option>
                <option value="BENEFICIARY_UNREACHABLE">5. Pengurus Panti Tidak Dapat Dihubungi / Lokasi Tutup</option>
                <option value="VEHICLE_ISSUE">6. Kendala Armada Truk / Motor Mogok</option>
                <option value="OTHER">7. Kendala Operasional Pengantaran Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block">Rincian Kronologi Masalah yang Terjadi:</label>
              <textarea
                rows={3}
                required
                placeholder="Jelaskan secara ringkas kendala yang dialami saat penjemputan / pengantaran..."
                value={incidentModal.description}
                onChange={(e) => setIncidentModal({ ...incidentModal, description: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#D4A843]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIncidentModal({ isOpen: false, claim: null, issueType: 'DELIVERY_LATE', description: '' })}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Kirim Laporan Eskalasi
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL DETAIL INFORMASI LENGKAP TUGAS RUTE (Requirement Rescue #6) */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, claim: null })}
        title={`Detail Informasi Tugas Rute: ${detailModal.claim?.code || ''}`}
        size="lg"
      >
        {detailModal.claim && (() => {
          const item = detailModal.claim;
          return (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                    Manifest Tugas Penjemputan Logistik
                  </span>
                  <h3 className="text-base font-black text-white">{item.foodName}</h3>
                  <p className="text-xs text-slate-200 font-mono mt-0.5">
                    Kode Resi: <strong className="text-[#D4A843] bg-slate-950/60 px-2 py-0.5 rounded">{item.code}</strong> • Porsi: <strong>{item.quantity}</strong>
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase shadow-xs self-start sm:self-center ${
                  item.status === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                  item.status === 'IN_TRANSIT' ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-blue-500 text-white'
                }`}>
                  {item.status === 'COMPLETED' ? 'Selesai Diterima' : item.status === 'IN_TRANSIT' ? 'OTW Mengantar' : 'Siap Ambil di Toko'}
                </span>
              </div>

              {/* Assigned Driver Box */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B3A5C] text-white flex items-center justify-center font-black shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">
                      Armada & Relawan Driver Ditugaskan:
                    </span>
                    <h4 className="font-extrabold text-sm text-[#1B3A5C]">
                      {item.assignedDriver?.name || 'Budi Santoso'}
                    </h4>
                    <p className="text-slate-600 text-[11px]">
                      {item.assignedDriver?.vehicle || 'Motor Box Cooler (25 kg)'} • Plat: {item.assignedDriver?.plateNumber || 'L 1234 AB'}
                    </p>
                  </div>
                </div>
                {item.assignedDriver?.phone && (
                  <a
                    href={`https://wa.me/62${item.assignedDriver.phone.replace(/^0/, '').replace(/-/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    <ChatIcon size={12} />
                    <span>Chat Driver</span>
                  </a>
                )}
              </div>

              {/* Locations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Titik Penjemputan (Penyedia Pangan):
                  </span>
                  <strong className="text-sm font-black text-[#1B3A5C] block">{item.providerName}</strong>
                  <p className="text-slate-600">{item.providerAddress}</p>
                  <p className="text-slate-500 text-[11px]">Telp/WA: {item.providerPhone || '0812-3456-7890'}</p>
                </div>
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    Titik Penyaluran (Penerima Manfaat):
                  </span>
                  <strong className="text-sm font-black text-emerald-950 block">{item.shelterName}</strong>
                  <p className="text-slate-700">{item.shelterAddress}</p>
                  <p className="text-slate-500 text-[11px]">Telp/WA: {item.shelterPhone || '0819-8765-4321'}</p>
                </div>
              </div>

              {item.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                  <span className="font-bold block text-[11px] uppercase tracking-wider">Catatan Operasional Khusus:</span>
                  <p className="font-medium text-xs mt-0.5">{item.notes}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <Link href={`/dashboard/rescue-partner/surat-jalan?code=${item.code}`}>
                  <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 shadow-xs flex items-center gap-1.5 cursor-pointer w-full sm:w-auto">
                    <FileText size={13} />
                    <span>Buka Surat Jalan Digital Driver</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setDetailModal({ isOpen: false, claim: null })}>
                  Tutup
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* MODAL AUDIT LOG HISTORI OPERASIONAL (Requirement Rescue #6) */}
      <Modal
        isOpen={auditModal.isOpen}
        onClose={() => setAuditModal({ isOpen: false, claim: null })}
        title={`Audit Trail & Logistik Histori: ${auditModal.claim?.code || ''}`}
        size="md"
      >
        {auditModal.claim && (() => {
          const item = auditModal.claim;
          const logs = item.auditLogs && item.auditLogs.length > 0 ? item.auditLogs : [
            { status: 'MATCH_ACCEPTED', title: 'Tugas Diterima dari Pool Tugas', time: '18:00 WIB', actor: 'Admin Komunitas', desc: 'Disetujui dari rekomendasi Smart Matching.' },
            { status: 'DRIVER_PLOTTED', title: `Driver Ditugaskan: ${item.assignedDriver?.name || 'Budi Santoso'}`, time: '18:05 WIB', actor: 'Admin Komunitas', desc: `Armada: ${item.assignedDriver?.vehicle || 'Motor Box Cooler'}` },
            ...(item.status === 'IN_TRANSIT' || item.status === 'COMPLETED' ? [{ status: 'IN_TRANSIT', title: 'Penjemputan Selesai di Toko (OTW)', time: '18:40 WIB', actor: 'Driver Relawan', desc: 'Scan QR toko berhasil, logistik dibawa dengan tas steril.' }] : []),
            ...(item.status === 'COMPLETED' ? [{ status: 'COMPLETED', title: 'Serah Terima di Panti Selesai', time: item.time || '19:15 WIB', actor: 'Driver Relawan', desc: 'Makanan diterima pengurus panti dalam keadaan higienis.' }] : []),
          ];

          return (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1B3A5C]">Kode Resi: <strong className="font-mono text-sm">{item.code}</strong></span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-extrabold text-[10px]">
                    {logs.length} Milestone
                  </span>
                </div>
                <p className="text-slate-500">{item.foodName} ({item.quantity}) • {item.shelterName}</p>
              </div>

              <div className="space-y-3 relative pl-4 border-l-2 border-slate-300 ml-2">
                {logs.map((log: any, idx: number) => (
                  <div key={idx} className="relative pl-3 space-y-0.5">
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs flex items-center justify-center"></span>
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-bold">{log.title}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.desc}</p>
                    <span className="inline-block text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Aktor: {log.actor}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <Button variant="primary" size="sm" onClick={() => setAuditModal({ isOpen: false, claim: null })}>
                  Tutup Audit Log
                </Button>
              </div>
            </div>
          );
        })()}
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
