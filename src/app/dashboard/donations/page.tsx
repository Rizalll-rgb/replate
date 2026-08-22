'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Poin 1: Human-Readable Indonesian Status Label Helper
const getHumanReadableStatusLabel = (statusCode: string) => {
  switch (statusCode) {
    case 'AWAITING_RESCUE_PICKUP':
      return '🛵 Menunggu Penjemputan Kurir Relawan';
    case 'READY_FOR_PICKUP':
      return '🏢 Siap Diambil Mandiri oleh Pengurus Panti';
    case 'PROVIDER_DELIVERING':
      return '🚚 Dalam Pengiriman Armada Toko';
    case 'COMPLETED':
      return '✓ Donasi Berhasil Diserahkan & Selesai';
    case 'MATCHED & PROCESSED':
      return '✓ Donasi Ter-Match & Diproses';
    default:
      return statusCode || 'Proses Penyelamatan';
  }
};

export default function DonationsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'PROVIDER';

  // Provider Direct Delivery Fleet Capability
  const [providerCanDeliverDirect, setProviderCanDeliverDirect] = useState<boolean>(false);

  // Search & Multi-Filter Control Bar State (Poin 5 & Poin 6)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterUrgency, setFilterUrgency] = useState('ALL');

  // Active Provider Surplus Inventory
  const [providerInventory, setProviderInventory] = useState<any[]>([
    { id: 'FOOD-001', foodName: 'Nasi Ayam Bakar Pak Kumis', quantity: 35, quantityUnit: 'Porsi', category: 'Makanan Olahan (Meals)', storageTemp: 'ROOM_TEMP', allergens: ['Nut-Free'] },
    { id: 'FOOD-002', foodName: 'Bakso Sapi Urat Super', quantity: 20, quantityUnit: 'Porsi', category: 'Makanan Olahan (Meals)', storageTemp: 'ROOM_TEMP', allergens: ['Nut-Free', 'Halal'] },
    { id: 'FOOD-003', foodName: 'Paket Roti Bakery Steril', quantity: 40, quantityUnit: 'Paket', category: 'Roti, Buah & Susu (Bakery & Dairy)', storageTemp: 'ROOM_TEMP', allergens: ['Low-Salt'] },
    { id: 'FOOD-004', foodName: 'Susu UHT & Buah Potong Segar', quantity: 30, quantityUnit: 'Porsi', category: 'Roti, Buah & Susu (Bakery & Dairy)', storageTemp: 'REFRIGERATED', allergens: ['Dairy'] },
  ]);

  // Load local surplus inventory if available
  useEffect(() => {
    try {
      const savedSurplus = localStorage.getItem('replate_local_surplus');
      if (savedSurplus) {
        const parsed = JSON.parse(savedSurplus);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((item: any) => ({
            ...item,
            category: item.category || 'Makanan Olahan (Meals)',
          }));
          setProviderInventory(normalized);
        }
      }
    } catch (_) {}
  }, []);

  const [requests, setRequests] = useState([
    {
      id: 'REQ-DON-001',
      shelterName: 'Panti Asuhan Kasih Ibu',
      shelterType: 'Panti Asuhan Anak',
      beneficiariesCount: 45,
      foodCategoryNeeded: 'Makanan Olahan (Meals)',
      urgency: 'HIGH',
      deadline: 'Hari ini 19:00 WIB',
      location: 'Surabaya Timur',
      address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      lat: -7.2754,
      lng: 112.7541,
      photoUrl: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=600&q=80',
      notes: 'Membutuhkan 40-50 porsi nasi lauk pauk bergizi untuk makan malam anak-anak panti.',
      preferredDelivery: 'RESCUE_COURIER',
      status: 'OPEN',
      contactPhone: '081298765432',
      leaderName: 'Ibu Hj. Aminah',
      legalPermit: 'DINSOS-SBY/2023/8912',
    },
    {
      id: 'REQ-DON-002',
      shelterName: 'Panti Werdha Lansia Sejahtera',
      shelterType: 'Panti Werdha (Lansia)',
      beneficiariesCount: 30,
      foodCategoryNeeded: 'Roti, Buah & Susu (Bakery & Dairy)',
      urgency: 'MEDIUM',
      deadline: 'Besok Pagi 08:00 WIB',
      location: 'Surabaya Selatan',
      address: 'Jl. Wonokromo No. 12, Wonokromo, Surabaya',
      lat: -7.3012,
      lng: 112.7389,
      photoUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
      notes: 'Membutuhkan roti tekstur lembut, buah potong segar, atau susu UHT untuk lansia.',
      preferredDelivery: 'SHELTER_PICKUP',
      status: 'OPEN',
      contactPhone: '081345678901',
      leaderName: 'Bpk. Dr. Handoko',
      legalPermit: 'DINSOS-SBY/2022/4102',
    },
    {
      id: 'REQ-DON-003',
      shelterName: 'Rumah Singgah Anak Jalanan',
      shelterType: 'Yayasan Sosmas',
      beneficiariesCount: 25,
      foodCategoryNeeded: 'Makanan Olahan (Meals)',
      urgency: 'HIGH',
      deadline: 'Hari ini 20:30 WIB',
      location: 'Surabaya Pusat',
      address: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
      lat: -7.2623,
      lng: 112.7391,
      photoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
      notes: 'Membutuhkan porsi makanan surplus siap santap untuk pembagian malam relawan.',
      preferredDelivery: 'PROVIDER_DIRECT',
      status: 'OPEN',
      contactPhone: '081567890123',
      leaderName: 'Mas Rizky Relawan',
      legalPermit: 'DINSOS-SBY/2024/1109',
    },
  ]);

  // Provider Funded Donation History (Poin 2)
  const [providerDonationHistory, setProviderDonationHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      if (savedClaimsStr) {
        const claims = JSON.parse(savedClaimsStr);
        setProviderDonationHistory(claims);
      }
    } catch (_) {}
  }, []);

  // Add Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newShelterName, setNewShelterName] = useState('');
  const [newCount, setNewCount] = useState<number>(30);
  const [newCategory, setNewCategory] = useState('Makanan Olahan (Meals)');
  const [newNotes, setNewNotes] = useState('');
  const [newLocation, setNewLocation] = useState('Surabaya Pusat');
  const [newDeliveryPref, setNewDeliveryPref] = useState('RESCUE_COURIER');

  // Shelter Profile Detail Modal State
  const [selectedShelterProfile, setSelectedShelterProfile] = useState<any | null>(null);

  // Interactive Fulfill Donation Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [portionedQuantity, setPortionedQuantity] = useState<number>(30);
  const [effectiveDeliveryMethod, setEffectiveDeliveryMethod] = useState<string>('RESCUE_COURIER');
  const [readyTime, setReadyTime] = useState('18:30 WIB');
  const [hygieneChecked, setHygieneChecked] = useState(true);

  // Live Tracking Modal State (Poin 2)
  const [activeTrackingModalItem, setActiveTrackingModalItem] = useState<any | null>(null);

  // Success QR Ticket Receipt State
  const [completedTicket, setCompletedTicket] = useState<any | null>(null);
  const [providerDeliveryPhoto, setProviderDeliveryPhoto] = useState<string | null>(null);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Filtered Requests Logic (Poin 5 & Poin 6)
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.shelterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = filterLocation === 'ALL' || req.location === filterLocation;
    const matchesCategory = filterCategory === 'ALL' || req.foodCategoryNeeded === filterCategory;
    const matchesUrgency = filterUrgency === 'ALL' || req.urgency === filterUrgency;

    return matchesSearch && matchesLocation && matchesCategory && matchesUrgency;
  });

  const handleOpenFulfillModal = (req: any) => {
    setSelectedRequest(req);
    const matchingItems = providerInventory.filter(
      (item) => item.category === req.foodCategoryNeeded
    );
    const initialFood = matchingItems[0] || providerInventory[0];
    if (initialFood) {
      setSelectedFoodId(initialFood.id);
      setPortionedQuantity(Math.min(req.beneficiariesCount || 30, initialFood.quantity));
    }

    if (req.preferredDelivery === 'PROVIDER_DIRECT' && !providerCanDeliverDirect) {
      setEffectiveDeliveryMethod('RESCUE_COURIER');
    } else {
      setEffectiveDeliveryMethod(req.preferredDelivery || 'RESCUE_COURIER');
    }
  };

  const selectedFoodObj = providerInventory.find((f) => f.id === selectedFoodId) || providerInventory[0];

  // Smart Matching 2.0 AI Compatibility Breakdown Calculator
  const calculateSmartMatchScore = (food: any, request: any) => {
    if (!food || !request) return { score: 0, isMatch: false, breakdown: [] };

    let categoryScore = food.category === request.foodCategoryNeeded ? 30 : 0;
    let distScore = 25;
    let timeScore = request.urgency === 'HIGH' ? 20 : 15;
    let portionScore = Math.min(15, Math.round(((food.quantity || 1) / (request.beneficiariesCount || 1)) * 15));
    let hygieneScore = 10;

    const totalScore = categoryScore + distScore + timeScore + portionScore + hygieneScore;

    return {
      score: totalScore,
      isMatch: totalScore >= 70 && categoryScore > 0,
      breakdown: [
        { label: 'Kategori & Gizi Makro Panti', score: categoryScore, max: 30 },
        { label: 'Proksimitas Geofencing GPS', score: distScore, max: 25 },
        { label: 'Ketahanan & Urgensi Waktu', score: timeScore, max: 20 },
        { label: 'Rasio Kecukupan Porsi', score: portionScore, max: 15 },
        { label: 'Higienitas & Kredensial BPOM', score: hygieneScore, max: 10 },
      ],
    };
  };

  const matchAnalysis = calculateSmartMatchScore(selectedFoodObj, selectedRequest);

  const handleConfirmFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedFoodObj) return;

    if (!matchAnalysis.isMatch) {
      setToastState({
        isOpen: true,
        message: `Kategori makanan yang Anda pilih (${selectedFoodObj.category}) tidak sesuai dengan kebutuhan gizi shelter (${selectedRequest.foodCategoryNeeded})!`,
        type: 'error',
      });
      return;
    }

    if (portionedQuantity > selectedFoodObj.quantity) {
      setToastState({
        isOpen: true,
        message: `Jumlah porsi (${portionedQuantity}) melebihi stok makanan surplus yang tersedia (${selectedFoodObj.quantity} Porsi)!`,
        type: 'error',
      });
      return;
    }

    if (!hygieneChecked) {
      alert('Anda wajib menyetujui verifikasi SOP Higienitas Pangan BPOM!');
      return;
    }

    const ticketCode = `QR-DON-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedInventory = providerInventory.map((item) =>
      item.id === selectedFoodObj.id
        ? { ...item, quantity: Math.max(0, item.quantity - portionedQuantity) }
        : item
    );
    setProviderInventory(updatedInventory);

    try {
      localStorage.setItem('replate_local_surplus', JSON.stringify(updatedInventory));
    } catch (_) {}

    let initialClaimStatus = 'AWAITING_RESCUE_PICKUP';
    if (effectiveDeliveryMethod === 'SHELTER_PICKUP') initialClaimStatus = 'READY_FOR_PICKUP';
    if (effectiveDeliveryMethod === 'PROVIDER_DIRECT') initialClaimStatus = 'PROVIDER_DELIVERING';

    const newClaimRecord = {
      id: ticketCode,
      claimCode: ticketCode,
      foodName: selectedFoodObj.foodName,
      quantity: portionedQuantity,
      quantityUnit: selectedFoodObj.quantityUnit || 'Porsi',
      status: initialClaimStatus,
      deliveryMethod: effectiveDeliveryMethod,
      shelterName: selectedRequest.shelterName,
      contactPhone: selectedRequest.contactPhone,
      readyTime,
      address: selectedRequest.address,
      createdAt: new Date().toISOString(),
    };

    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      const existingClaims = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
      const updatedClaims = [newClaimRecord, ...existingClaims];
      localStorage.setItem('replate_claims', JSON.stringify(updatedClaims));
      setProviderDonationHistory(updatedClaims);
    } catch (_) {}

    setRequests((prev) =>
      prev.map((item) =>
        item.id === selectedRequest.id
          ? { ...item, status: 'MATCHED & PROCESSED' }
          : item
      )
    );

    setCompletedTicket({
      ticketCode,
      shelterName: selectedRequest.shelterName,
      foodName: selectedFoodObj.foodName,
      quantity: portionedQuantity,
      deliveryMethod: effectiveDeliveryMethod,
      readyTime,
      contactPhone: selectedRequest.contactPhone,
      address: selectedRequest.address,
      initialStatus: initialClaimStatus,
      matchScore: matchAnalysis.score,
    });

    setSelectedRequest(null);

    setToastState({
      isOpen: true,
      message: `Berhasil! Donasi ${portionedQuantity} porsi (Match Score: ${matchAnalysis.score}%) ter-match & terdaftar di Tracking Penyelamatan!`,
      type: 'success',
    });
  };

  const handleAddRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShelterName || !newNotes) {
      alert('Mohon isi nama yayasan/panti dan deskripsi kebutuhan donasi!');
      return;
    }

    const newReq = {
      id: `REQ-DON-${Date.now()}`,
      shelterName: newShelterName,
      shelterType: 'Yayasan Terverifikasi Dinsos',
      beneficiariesCount: newCount,
      foodCategoryNeeded: newCategory,
      urgency: 'HIGH',
      deadline: 'Hari ini 20:00 WIB',
      location: newLocation,
      address: `Wilayah ${newLocation}, Kota Surabaya`,
      lat: -7.2575,
      lng: 112.7521,
      photoUrl: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=600&q=80',
      notes: newNotes,
      preferredDelivery: newDeliveryPref,
      status: 'OPEN',
      contactPhone: '081234567890',
      leaderName: 'Pengurus Yayasan',
      legalPermit: 'DINSOS-SBY/2024/9912',
    };

    setRequests([newReq, ...requests]);
    setIsRequestModalOpen(false);
    setToastState({
      isOpen: true,
      message: 'Permintaan bantuan donasi baru berhasil dipublikasikan!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
              Smart Matching 2.0 AI Engine
            </span>
            <span className="text-xs text-slate-200 font-semibold">Evaluasi 5-Pilar Multi-Kriteria</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Hub Donasi & Kebutuhan Shelter Panti</h1>
          <p className="text-xs text-slate-100 leading-relaxed font-medium">
            Mesin pencocokan pintar mengevaluasi kategori gizi, proksimitas GPS, ketahanan waktu, rasio porsi, dan kredensial BPOM untuk menjamin akurasi bantuan pangan 100%.
          </p>
        </div>

        {(userRole === 'YAYASAN' || userRole === 'ADMIN') && (
          <Button
            variant="gold"
            size="md"
            className="font-extrabold shrink-0 flex items-center gap-2 shadow-md"
            onClick={() => setIsRequestModalOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Ajukan Permintaan Donasi Panti</span>
          </Button>
        )}
      </div>

      {/* Metric Counters Widget (Poin 7 - Developer Recommendation) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D4A843] flex items-center justify-center font-black text-lg">
              🍱
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Total Donasi Dihibahkan</span>
              <h4 className="text-lg font-black text-[#1B3A5C]">125 Porsi Steril</h4>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
              🏛️
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Yayasan / Panti Terbantu</span>
              <h4 className="text-lg font-black text-[#1B3A5C]">3 Panti Surabaya</h4>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
              🛵
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Resi Tracking Penyelamatan</span>
              <h4 className="text-lg font-black text-[#1B3A5C]">{providerDonationHistory.length} Resi Aktif</h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Multi-Filter Control Bar (Poin 5 & Poin 6) */}
      <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#1B3A5C] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Pencarian & Filter Kebutuhan Panti Surabaya</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500">Menampilkan {filteredRequests.length} dari {requests.length} Shelter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Search Field */}
          <div className="sm:col-span-1">
            <Input
              placeholder="🔍 Cari nama panti / catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Filter Wilayah */}
          <div>
            <select
              className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="ALL">🏙️ Semua Wilayah Surabaya</option>
              <option value="Surabaya Pusat">Surabaya Pusat</option>
              <option value="Surabaya Timur">Surabaya Timur</option>
              <option value="Surabaya Selatan">Surabaya Selatan</option>
              <option value="Surabaya Barat">Surabaya Barat</option>
              <option value="Surabaya Utara">Surabaya Utara</option>
            </select>
          </div>

          {/* Filter Kategori Pangan */}
          <div>
            <select
              className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="ALL">🥗 Semua Kategori Pangan</option>
              <option value="Makanan Olahan (Meals)">Makanan Olahan (Meals)</option>
              <option value="Roti, Buah & Susu (Bakery & Dairy)">Roti, Buah & Susu (Bakery & Dairy)</option>
              <option value="Bahan Pokok (Produce)">Bahan Sembako (Produce)</option>
            </select>
          </div>

          {/* Filter Urgensi */}
          <div>
            <select
              className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
            >
              <option value="ALL">🚨 Semua Tingkat Urgensi</option>
              <option value="HIGH">URGENT (Segera)</option>
              <option value="MEDIUM">MEMBUTUHKAN</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid List Permintaan Donasi Shelter */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <Card key={req.id} className="border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
              {/* Photo Banner Header with HIGH CONTRAST BADGES (Poin 3) */}
              <div className="relative w-full h-40 bg-slate-900 overflow-hidden">
                <img src={req.photoUrl} alt={req.shelterName} className="w-full h-full object-cover opacity-90" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {/* High Contrast Pill Badges (Poin 3) */}
                  {req.status === 'MATCHED & PROCESSED' ? (
                    <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-md shadow-md border border-white/40">
                      ✓ MATCHED
                    </span>
                  ) : req.urgency === 'HIGH' ? (
                    <span className="px-3 py-1 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider rounded-md shadow-md border border-white/40">
                      🔥 URGENT
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-md shadow-md border border-white/40">
                      MEMBUTUHKAN
                    </span>
                  )}
                </div>
                {/* High Contrast Location Badge (Poin 3) */}
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-white px-3 py-1 rounded-md text-[10px] font-mono font-bold shadow-md border border-slate-700/80 backdrop-blur-xs">
                  📍 {req.location}
                </div>
              </div>

              <CardBody className="p-5 space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{req.shelterType}</span>
                    <h4 className="text-base font-extrabold text-[#1B3A5C] mt-0.5">{req.shelterName}</h4>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold">Penerima Manfaat:</span>
                      <span className="font-extrabold text-[#1B3A5C]">{req.beneficiariesCount} Jiwa</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold">Kebutuhan Pangan:</span>
                      <span className="font-bold text-emerald-700">{req.foodCategoryNeeded}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                      <span className="font-semibold">Metode Pengiriman:</span>
                      <span className="font-bold text-[#1B3A5C]">
                        {req.preferredDelivery === 'RESCUE_COURIER'
                          ? '🛵 Kurir Relawan'
                          : req.preferredDelivery === 'PROVIDER_DIRECT'
                          ? '🚚 Diantar Toko'
                          : '🏢 Ambil Mandiri'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    &quot;{req.notes}&quot;
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedShelterProfile(req)}
                    className="text-[11px] font-bold text-[#1B3A5C] hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Lihat Profil Detail & Titik Lokasi Peta ➔</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Batas Waktu:</span>
                    <span className="font-bold text-amber-700">{req.deadline}</span>
                  </div>

                  {req.status === 'MATCHED & PROCESSED' ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-center font-extrabold text-xs rounded-xl border border-emerald-200">
                      ✓ Donasi Ter-Match & Diproses
                    </div>
                  ) : (
                    <Button
                      variant="gold"
                      size="sm"
                      className="w-full font-extrabold text-xs shadow-xs"
                      onClick={() => handleOpenFulfillModal(req)}
                    >
                      Penuhi Permintaan Donasi Ini ➔
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Profile Detail Shelter / Panti Asuhan */}
      <Modal
        isOpen={!!selectedShelterProfile}
        onClose={() => setSelectedShelterProfile(null)}
        title={`Profil Detail & Titik Lokasi Peta: ${selectedShelterProfile?.shelterName}`}
        size="lg"
      >
        {selectedShelterProfile && (
          <div className="space-y-4 text-xs">
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 shadow-xs">
              <img
                src={selectedShelterProfile.photoUrl}
                alt={selectedShelterProfile.shelterName}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-4 text-white">
                <div>
                  <Badge variant="gold" size="sm" className="mb-1">
                    {selectedShelterProfile.shelterType}
                  </Badge>
                  <h3 className="text-xl font-black text-white">{selectedShelterProfile.shelterName}</h3>
                  <p className="text-xs text-slate-200">{selectedShelterProfile.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Ketua / Pengurus Panti:</span>
                <span className="font-extrabold text-[#1B3A5C]">{selectedShelterProfile.leaderName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Kontak WhatsApp:</span>
                <span className="font-bold text-slate-800">{selectedShelterProfile.contactPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Kapasitas Penerima Manfaat:</span>
                <span className="font-bold text-slate-800">{selectedShelterProfile.beneficiariesCount} Jiwa</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Izin Resmi Dinsos:</span>
                <span className="font-mono font-bold text-slate-800">{selectedShelterProfile.legalPermit}</span>
              </div>
            </div>

            {/* Direct WhatsApp Coordination Button (Poin 7) */}
            <a
              href={`https://wa.me/${selectedShelterProfile.contactPhone.replace(/^0/, '62')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>💬 Hubungi WhatsApp Pengurus Panti (Koordinasi Direct)</span>
            </a>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#1B3A5C]">Titik Koordinat Lokasi Peta GPS Surabaya</h4>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  GPS: {selectedShelterProfile.lat}, {selectedShelterProfile.lng}
                </span>
              </div>

              <div className="relative w-full h-44 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 shadow-xs">
                <iframe
                  title="Shelter Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${selectedShelterProfile.lat},${selectedShelterProfile.lng}&z=15&output=embed`}
                  className="w-full h-full filter saturate-150"
                />
                <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider">
                  📍 Titik Lokasi Panti: {selectedShelterProfile.shelterName}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedShelterProfile(null)}>
                Tutup Profil Shelter
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Interactive Fulfill Donation Flow (Poin 4 - HIGH CONTRAST WHITE TEXT HEADER) */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={`Alur Pemenuhan Donasi: ${selectedRequest?.shelterName}`}
        size="lg"
      >
        {selectedRequest && (
          <form onSubmit={handleConfirmFulfillSubmit} className="space-y-4 text-xs">
            {/* Target Summary Card with CRISP WHITE TEXT CONTRAST (Poin 4) */}
            <div className="p-5 bg-[#1B3A5C] text-white rounded-2xl space-y-1.5 shadow-md border border-[#2C5A8F]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-[#D4A843] tracking-widest block">
                  TARGET PENERIMA BANTUAN PANGAN
                </span>
                <span className="px-3 py-1 bg-[#D4A843] text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                  Kebutuhan: {selectedRequest.foodCategoryNeeded}
                </span>
              </div>

              {/* Crisp White Title (Poin 4) */}
              <h4 className="text-xl font-black text-white leading-snug drop-shadow-xs">
                {selectedRequest.shelterName} ({selectedRequest.beneficiariesCount} Anak/Lansia)
              </h4>

              <p className="text-xs text-slate-100 font-semibold flex items-center gap-2 pt-0.5">
                <span>📍 Lokasi: {selectedRequest.location}</span>
                <span>•</span>
                <span>
                  Delivery Pref: {selectedRequest.preferredDelivery === 'RESCUE_COURIER' ? '🛵 Kurir Relawan' : selectedRequest.preferredDelivery === 'PROVIDER_DIRECT' ? '🚚 Diantar Toko' : '🏢 Ambil Mandiri'}
                </span>
              </p>
            </div>

            {/* Smart Matching 2.0 Scorecard Indicator */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">SMART MATCHING 2.0 COMPATIBILITY SCORE:</span>
                  <span className={`text-xl font-black ${matchAnalysis.score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {matchAnalysis.score}% MATCH SCORE
                  </span>
                </div>
                <Badge variant={matchAnalysis.score >= 70 ? 'success' : 'danger'}>
                  {matchAnalysis.score >= 70 ? '✓ HIGHLY RECOMMENDED' : '⚠️ MISMATCHED'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] pt-1 border-t border-slate-800">
                {matchAnalysis.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-center">
                    <span className="text-slate-400 block font-semibold truncate">{item.label}</span>
                    <span className="font-extrabold text-amber-400">{item.score}/{item.max} Pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Category Matching Inventory Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1B3A5C]">1. Pilih Stok Makanan Surplus Toko Anda (Real Inventory)</label>
              <select
                className={`w-full rounded-xl border text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:outline-none ${
                  matchAnalysis.isMatch ? 'border-emerald-500' : 'border-red-400'
                }`}
                value={selectedFoodId}
                onChange={(e) => {
                  setSelectedFoodId(e.target.value);
                  const targetFood = providerInventory.find((f) => f.id === e.target.value);
                  if (targetFood) {
                    setPortionedQuantity(Math.min(selectedRequest.beneficiariesCount, targetFood.quantity));
                  }
                }}
              >
                {providerInventory.map((item) => {
                  const isMatch = item.category === selectedRequest.foodCategoryNeeded;
                  return (
                    <option key={item.id} value={item.id}>
                      {isMatch ? '✓ [MATCHED] ' : '❌ [MISMATCHED] '}
                      {item.foodName} — ({item.category}) | Stok: {item.quantity} {item.quantityUnit || 'Porsi'}
                    </option>
                  );
                })}
              </select>

              {!matchAnalysis.isMatch && (
                <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  ⚠️ Peringatan Smart Matching 2.0: Kategori makanan yang Anda pilih ({selectedFoodObj?.category}) tidak sesuai dengan jenis gizi yang dibutuhkan shelter ({selectedRequest.foodCategoryNeeded}). Silakan pilih produk surplus dengan kategori yang cocok!
                </p>
              )}
            </div>

            {/* Stock Limit Validation Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input
                  label={`2. Jumlah Porsi Yang Dialokasikan (Maks: ${selectedFoodObj?.quantity || 0} Porsi)`}
                  type="number"
                  max={selectedFoodObj?.quantity || 50}
                  min={1}
                  value={portionedQuantity}
                  onChange={(e) => setPortionedQuantity(Number(e.target.value))}
                  required
                />
                {portionedQuantity > (selectedFoodObj?.quantity || 0) && (
                  <p className="text-[11px] font-bold text-red-600">
                    ⚠️ Melebihi stok ketersediaan makanan ({selectedFoodObj?.quantity} Porsi)!
                  </p>
                )}
              </div>

              <Input
                label="3. Jam Siap Penjemputan / Serah Terima"
                value={readyTime}
                onChange={(e) => setReadyTime(e.target.value)}
                placeholder="19:00 WIB"
                required
              />
            </div>

            {/* Recipient-Driven Logistics & Provider Capability Warning */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B3A5C]">4. Metode Pengiriman Yang Diminta Shelter:</span>
                <Badge variant="primary">
                  {selectedRequest.preferredDelivery === 'RESCUE_COURIER'
                    ? '🛵 Kurir Relawan Komunitas'
                    : selectedRequest.preferredDelivery === 'PROVIDER_DIRECT'
                    ? '🚚 Diantar Langsung Toko'
                    : '🏢 Diambil Mandiri Panti'}
                </Badge>
              </div>

              {selectedRequest.preferredDelivery === 'PROVIDER_DIRECT' && !providerCanDeliverDirect && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                    <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Penyesuaian Kemampuan Armada Toko:</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    Shelter meminta pengiriman mandiri oleh toko. Karena outlet Anda belum mengaktifkan armada kurir mandiri, metode pengiriman <strong>dialihkan secara otomatis ke Kurir Relawan Komunitas Replate (🛵)</strong> agar donasi tetap berjalan lancar!
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500 font-semibold">Metode Pengiriman Efektif Ditentukan:</span>
                <span className="font-extrabold text-emerald-700">
                  {effectiveDeliveryMethod === 'RESCUE_COURIER'
                    ? '🛵 Kurir Relawan Replate (Auto Assigned)'
                    : effectiveDeliveryMethod === 'PROVIDER_DIRECT'
                    ? '🚚 Diantar Langsung Toko'
                    : '🏢 Ambil Mandiri Panti'}
                </span>
              </div>
            </div>

            {/* Hygiene & Food Safety Checkbox Confirmation */}
            <label className="flex items-start gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer text-emerald-900">
              <input
                type="checkbox"
                checked={hygieneChecked}
                onChange={(e) => setHygieneChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-emerald-300 focus:ring-0 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold block text-xs">Konfirmasi SOP Keamanan Pangan BPOM RI</span>
                <span className="text-[11px] block text-emerald-800 leading-relaxed font-medium">
                  Saya mengonfirmasi bahwa porsi makanan surplus yang dihibahkan dalam kondisi segar, siap santap &lt; 4 jam, dikemas steril, dan lulus 8-Checklist Higienitas Replate.
                </span>
              </div>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Batal
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                className="font-extrabold shadow-md"
                disabled={!matchAnalysis.isMatch || portionedQuantity > selectedFoodObj?.quantity}
              >
                Proses & Terbitkan QR Tracking Donasi ➔
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Tiket Receipt Kode QR & Direct Link Live Tracking (Poin 1 & Poin 2) */}
      <Modal
        isOpen={!!completedTicket}
        onClose={() => setCompletedTicket(null)}
        title="Resi Kode QR & Tracking Donasi Terintegrasi"
        size="md"
      >
        {completedTicket && (
          <div className="space-y-5 text-xs text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
              <span className="font-black text-sm uppercase tracking-wider block">✓ Donasi Berhasil Dialokasikan & Terintegrasi</span>
              <p className="text-xs text-emerald-800 font-medium">
                Smart Match Score: <strong>{completedTicket.matchScore}%</strong> • Data klaim otomatis terdaftar di rute <strong>Klaim & Penyelamatan</strong> serta Pelacak Transparansi Publik Replate!
              </p>
            </div>

            {/* QR Code Graphic Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-700">
              <div className="w-40 h-40 bg-white p-3 rounded-xl shadow-inner flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${completedTicket.ticketCode}`}
                  alt="Kode QR Donasi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">ID RESI TRACKING DONASI:</span>
                <span className="font-mono text-lg font-black tracking-widest text-[#D4A843]">{completedTicket.ticketCode}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium block">Penerima Bantuan:</span>
                <span className="font-bold text-[#1B3A5C]">{completedTicket.shelterName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Jumlah Dialokasikan:</span>
                <span className="font-bold text-emerald-700">{completedTicket.quantity} Porsi</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Jenis Makanan:</span>
                <span className="font-bold text-slate-800">{completedTicket.foodName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Status Tracking (Bahasa):</span>
                {/* Human-Readable Status Label (Poin 1) */}
                <span className="font-extrabold text-[#D4A843] block mt-0.5">
                  {getHumanReadableStatusLabel(completedTicket.initialStatus)}
                </span>
              </div>
            </div>

            {/* Direct Link to Claims & Live Tracking (Poin 2) */}
            <div className="space-y-2">
              <Link
                href="/dashboard/provider/claims"
                onClick={() => setCompletedTicket(null)}
                className="w-full py-3 bg-[#D4A843] hover:bg-[#b88f32] text-slate-900 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Lacak Penyelamatan Real-Time di Menu Klaim ➔</span>
              </Link>
            </div>

            {completedTicket.deliveryMethod === 'PROVIDER_DIRECT' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left space-y-2">
                <span className="font-bold text-xs text-amber-900 block">🚚 Alur Diantar Langsung oleh Provider:</span>
                <p className="text-[11px] text-amber-800">
                  Setelah armada Anda sampai di panti asuhan, unggah foto penyerahan sebagai bukti verifikasi penyelesaian donasi.
                </p>
                <label className="inline-block px-3 py-1.5 bg-[#1B3A5C] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-[#2C5A8F]">
                  Upload Foto Bukti Sampai di Panti
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const url = URL.createObjectURL(e.target.files[0]);
                        setProviderDeliveryPhoto(url);
                        setToastState({
                          isOpen: true,
                          message: 'Foto bukti serah terima di panti berhasil diunggah! Status donasi kini SELESAI (COMPLETED).',
                          type: 'success',
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {providerDeliveryPhoto && (
                  <p className="text-[11px] text-emerald-700 font-extrabold">✓ Foto Penyerahan Terunggah</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Provider Funded Donation History Section (Poin 2) */}
      {providerDonationHistory.length > 0 && (
        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-[#1B3A5C] flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Riwayat Donasi Disalurkan Toko Saya ({providerDonationHistory.length} Resi)</span>
            </h3>
            <Link href="/dashboard/provider/claims" className="text-xs font-bold text-[#1B3A5C] hover:underline">
              Kelola di Penyelamatan ➔
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {providerDonationHistory.map((history) => (
              <div key={history.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[#D4A843]">{history.claimCode || history.id}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-md">
                      {getHumanReadableStatusLabel(history.status)}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#1B3A5C] mt-0.5">{history.shelterName} — {history.foodName} ({history.quantity} Porsi)</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTrackingModalItem(history)}
                    className="px-3 py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-extrabold text-[11px] rounded-lg transition-colors"
                  >
                    Lacak Status Penyelamatan ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Live Tracking Status Modal (Poin 2) */}
      <Modal
        isOpen={!!activeTrackingModalItem}
        onClose={() => setActiveTrackingModalItem(null)}
        title={`Pelacak Status Penyelamatan: ${activeTrackingModalItem?.claimCode}`}
        size="md"
      >
        {activeTrackingModalItem && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <span className="text-[10px] text-slate-400 font-mono block">RESI STATUS REAL-TIME:</span>
              <h3 className="text-lg font-black text-[#D4A843]">{activeTrackingModalItem.claimCode}</h3>
              <p className="text-xs text-slate-200">
                Penerima: <strong>{activeTrackingModalItem.shelterName}</strong> • {activeTrackingModalItem.foodName} ({activeTrackingModalItem.quantity} Porsi)
              </p>
            </div>

            {/* Stepper Timeline */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-extrabold text-[#1B3A5C] block">Timeline Status Penyelamatan:</span>
              <div className="space-y-2.5 pl-3 border-l-2 border-[#1B3A5C]">
                <div className="relative pl-3">
                  <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span className="font-bold text-slate-900 block">1. Donasi Dialokasikan & Resi Diterbitkan</span>
                  <span className="text-[10px] text-slate-500">{activeTrackingModalItem.createdAt || 'Baru Saja'}</span>
                </div>
                <div className="relative pl-3">
                  <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  <span className="font-bold text-slate-900 block">2. Status Saat Ini: {getHumanReadableStatusLabel(activeTrackingModalItem.status)}</span>
                  <span className="text-[10px] text-slate-500">Penjemputan disiapkan di lokasi toko</span>
                </div>
                <div className="relative pl-3 opacity-60">
                  <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 bg-slate-300 rounded-full" />
                  <span className="font-bold text-slate-700 block">3. Verifikasi QR Scan & Serah Terima Selesai</span>
                  <span className="text-[10px] text-slate-400">Menunggu scan fisik di lokasi panti</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTrackingModalItem(null)}>
                Tutup Pelacak
              </Button>
              <Link href="/dashboard/provider/claims">
                <Button variant="gold" size="sm" className="font-extrabold">
                  Buka Kelola Penyelamatan ➔
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Ajukan Request Baru oleh Shelter */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Ajukan Permintaan Bantuan Donasi Makanan Panti"
        size="md"
      >
        <form onSubmit={handleAddRequestSubmit} className="space-y-4 text-xs">
          <Input
            label="Nama Yayasan / Panti Asuhan / Shelter"
            placeholder="Contoh: Panti Asuhan Kasih Ibu"
            value={newShelterName}
            onChange={(e) => setNewShelterName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jumlah Penerima Manfaat (Jiwa)"
              type="number"
              value={newCount}
              onChange={(e) => setNewCount(Number(e.target.value))}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#343A40]">Wilayah Surabaya</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 bg-white font-bold text-[#1B3A5C]"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              >
                <option value="Surabaya Pusat">Surabaya Pusat</option>
                <option value="Surabaya Timur">Surabaya Timur</option>
                <option value="Surabaya Selatan">Surabaya Selatan</option>
                <option value="Surabaya Barat">Surabaya Barat</option>
                <option value="Surabaya Utara">Surabaya Utara</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Kategori Pangan Utama Yang Dibutuhkan</label>
            <select
              className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 bg-white font-bold text-[#1B3A5C]"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              <option value="Makanan Olahan (Meals)">Makanan Olahan Siap Santap (Meals)</option>
              <option value="Roti, Buah & Susu (Bakery & Dairy)">Roti, Buah & Susu (Bakery & Dairy)</option>
              <option value="Bahan Pokok (Produce)">Bahan Sembako & Sayur (Produce)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Metode Pengiriman Yang Diinginkan Panti</label>
            <select
              className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 bg-white font-bold text-[#1B3A5C]"
              value={newDeliveryPref}
              onChange={(e) => setNewDeliveryPref(e.target.value)}
            >
              <option value="RESCUE_COURIER">🛵 Disalurkan via Kurir Relawan Komunitas Replate (Rekomendasi)</option>
              <option value="PROVIDER_DIRECT">🚚 Diantar Langsung oleh Armada Toko / Restoran</option>
              <option value="SHELTER_PICKUP">🏢 Diambil Mandiri oleh Pengurus Panti Asuhan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Deskripsi Rincian Kebutuhan Panti</label>
            <textarea
              className="w-full rounded-xl border border-slate-300 text-xs p-3 focus:outline-none focus:border-[#1B3A5C]"
              rows={3}
              placeholder="Jelaskan porsi, batas waktu, dan kebutuhan gizi anak-anak panti..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRequestModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="gold" size="sm" className="font-extrabold">
              Publikasikan Permintaan Donasi ➔
            </Button>
          </div>
        </form>
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
