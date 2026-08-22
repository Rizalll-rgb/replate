'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { useSession } from 'next-auth/react';

export default function DonationsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'PROVIDER';

  // Provider Direct Delivery Fleet Capability (Poin 4)
  // Default is false (warung/bakery doesn't have delivery fleet, relies on Replate Rescue Couriers)
  const [providerCanDeliverDirect, setProviderCanDeliverDirect] = useState<boolean>(false);

  // Active Provider Surplus Inventory (Poin 1 & Poin 2)
  const [providerInventory, setProviderInventory] = useState<any[]>([
    { id: 'FOOD-001', foodName: 'Nasi Ayam Bakar Pak Kumis', quantity: 35, quantityUnit: 'Porsi', category: 'Makanan Olahan (Meals)' },
    { id: 'FOOD-002', foodName: 'Bakso Sapi Urat Super', quantity: 20, quantityUnit: 'Porsi', category: 'Makanan Olahan (Meals)' },
    { id: 'FOOD-003', foodName: 'Paket Roti Bakery Steril', quantity: 40, quantityUnit: 'Paket', category: 'Roti, Buah & Susu (Bakery & Dairy)' },
    { id: 'FOOD-004', foodName: 'Susu UHT & Buah Potong Segar', quantity: 30, quantityUnit: 'Porsi', category: 'Roti, Buah & Susu (Bakery & Dairy)' },
  ]);

  // Load local surplus inventory if available
  useEffect(() => {
    try {
      const savedSurplus = localStorage.getItem('replate_local_surplus');
      if (savedSurplus) {
        const parsed = JSON.parse(savedSurplus);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize categories for Smart Matching
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
      preferredDelivery: 'RESCUE_COURIER', // Poin 3: Recipient-driven delivery preference
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
      preferredDelivery: 'SHELTER_PICKUP', // Poin 3: Shelter picks up directly
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
      preferredDelivery: 'PROVIDER_DIRECT', // Poin 3: Shelter requested store direct delivery
      status: 'OPEN',
      contactPhone: '081567890123',
      leaderName: 'Mas Rizky Relawan',
      legalPermit: 'DINSOS-SBY/2024/1109',
    },
  ]);

  // Add Request Modal State (for Yayasan/Shelters)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newShelterName, setNewShelterName] = useState('');
  const [newCount, setNewCount] = useState<number>(30);
  const [newCategory, setNewCategory] = useState('Makanan Olahan (Meals)');
  const [newNotes, setNewNotes] = useState('');
  const [newLocation, setNewLocation] = useState('Surabaya Pusat');
  const [newDeliveryPref, setNewDeliveryPref] = useState('RESCUE_COURIER'); // Poin 3

  // Shelter Profile Detail Modal State (Poin 1)
  const [selectedShelterProfile, setSelectedShelterProfile] = useState<any | null>(null);

  // Interactive Fulfill Donation Modal State (Poin 2, 3, 4)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [portionedQuantity, setPortionedQuantity] = useState<number>(30);
  const [effectiveDeliveryMethod, setEffectiveDeliveryMethod] = useState<string>('RESCUE_COURIER');
  const [readyTime, setReadyTime] = useState('18:30 WIB');
  const [hygieneChecked, setHygieneChecked] = useState(true);

  // Success QR Ticket Receipt State
  const [completedTicket, setCompletedTicket] = useState<any | null>(null);
  const [providerDeliveryPhoto, setProviderDeliveryPhoto] = useState<string | null>(null);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Open Fulfill Modal & Apply Smart Category Matching + Delivery Capability Logic (Poin 2, 3, 4)
  const handleOpenFulfillModal = (req: any) => {
    setSelectedRequest(req);

    // Find matching items in inventory based on category
    const matchingItems = providerInventory.filter(
      (item) => item.category === req.foodCategoryNeeded
    );

    // Pick first matching item if exists, else first inventory item
    const initialFood = matchingItems[0] || providerInventory[0];
    if (initialFood) {
      setSelectedFoodId(initialFood.id);
      setPortionedQuantity(Math.min(req.beneficiariesCount || 30, initialFood.quantity));
    }

    // Determine Effective Delivery Method (Poin 3 & Poin 4)
    // If shelter requested PROVIDER_DIRECT but provider lacks fleet, fallback to RESCUE_COURIER!
    if (req.preferredDelivery === 'PROVIDER_DIRECT' && !providerCanDeliverDirect) {
      setEffectiveDeliveryMethod('RESCUE_COURIER');
    } else {
      setEffectiveDeliveryMethod(req.preferredDelivery || 'RESCUE_COURIER');
    }
  };

  const selectedFoodObj = providerInventory.find((f) => f.id === selectedFoodId) || providerInventory[0];

  // Smart Matching Category Check (Poin 2)
  const isCategoryMatched = selectedRequest && selectedFoodObj
    ? selectedFoodObj.category === selectedRequest.foodCategoryNeeded
    : false;

  const handleConfirmFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedFoodObj) return;

    // Smart Category Match Validation (Poin 2)
    if (!isCategoryMatched) {
      setToastState({
        isOpen: true,
        message: `Kategori makanan yang Anda pilih (${selectedFoodObj.category}) tidak sesuai dengan kebutuhan shelter (${selectedRequest.foodCategoryNeeded})!`,
        type: 'error',
      });
      return;
    }

    // Stock Limit Validation (Poin 2)
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

    // Deduct stock from Provider Inventory
    const updatedInventory = providerInventory.map((item) =>
      item.id === selectedFoodObj.id
        ? { ...item, quantity: Math.max(0, item.quantity - portionedQuantity) }
        : item
    );
    setProviderInventory(updatedInventory);

    // Save updated surplus stock to localStorage
    try {
      localStorage.setItem('replate_local_surplus', JSON.stringify(updatedInventory));
    } catch (_) {}

    // Register Claim Record for Tracking Integration
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
      localStorage.setItem('replate_claims', JSON.stringify([newClaimRecord, ...existingClaims]));
    } catch (_) {}

    // Update Request status in list
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
    });

    setSelectedRequest(null);

    setToastState({
      isOpen: true,
      message: `Berhasil! Donasi ${portionedQuantity} porsi ${selectedFoodObj.foodName} berhasil di-match & terdaftar di Tracking Penyelamatan!`,
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
      preferredDelivery: newDeliveryPref, // Poin 3
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
              Smart Matching & Recipient-Driven Logistics
            </span>
            <span className="text-xs text-slate-200 font-semibold">100% Sesuai Kebutuhan Lapangan</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Hub Donasi & Kebutuhan Shelter Panti</h1>
          <p className="text-xs text-slate-100 leading-relaxed font-medium">
            Panti Asuhan menentukan rincian kebutuhan pangan & metode pengiriman. Algoritma Smart Matching memastikan provider hanya menyalurkan porsi makanan yang sesuai kriteria gizi penerima.
          </p>
        </div>

        {/* Hide button if user is PROVIDER or CONSUMER (Poin 5) */}
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

      {/* Grid List Permintaan Donasi Shelter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
            </svg>
            <span>Daftar Permintaan Donasi Aktif ({requests.length} Shelter)</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Wilayah Kota Surabaya</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
              {/* Photo Banner Header (Poin 1) */}
              <div className="relative w-full h-36 bg-slate-200 overflow-hidden">
                <img src={req.photoUrl} alt={req.shelterName} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <Badge variant={req.status === 'MATCHED & PROCESSED' ? 'success' : req.urgency === 'HIGH' ? 'danger' : 'warning'} size="sm">
                    {req.status === 'MATCHED & PROCESSED' ? '✓ MATCHED' : req.urgency === 'HIGH' ? 'URGENT' : 'MEMBUTUHKAN'}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold">
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
                    {/* Preferred Delivery Badge (Poin 3) */}
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

                  {/* Access Shelter Detail Profile Button (Poin 1) */}
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

      {/* Modal Profile Detail Shelter / Panti Asuhan dengan Foto & Titik Lokasi Peta GPS (Poin 1) */}
      <Modal
        isOpen={!!selectedShelterProfile}
        onClose={() => setSelectedShelterProfile(null)}
        title={`Profil Detail & Titik Lokasi Peta: ${selectedShelterProfile?.shelterName}`}
        size="lg"
      >
        {selectedShelterProfile && (
          <div className="space-y-4 text-xs">
            {/* Photo Header */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 shadow-xs">
              <img
                src={selectedShelterProfile.photoUrl}
                alt={selectedShelterProfile.shelterName}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 text-white">
                <div>
                  <Badge variant="gold" size="sm" className="mb-1">
                    {selectedShelterProfile.shelterType}
                  </Badge>
                  <h3 className="text-lg font-extrabold text-white">{selectedShelterProfile.shelterName}</h3>
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

            {/* Google Maps Geolocation Embed Preview Container (Poin 1) */}
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

      {/* Modal Interactive Fulfill Donation Flow dengan Smart Matching & Provider Capability Warning (Poin 2, 3, 4) */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={`Alur Pemenuhan Donasi: ${selectedRequest?.shelterName}`}
        size="lg"
      >
        {selectedRequest && (
          <form onSubmit={handleConfirmFulfillSubmit} className="space-y-4 text-xs">
            {/* Target Summary Card */}
            <div className="p-4 bg-[#1B3A5C] text-white rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-wider">Target Penerima Bantuan Pangan</span>
                <span className="px-2.5 py-0.5 bg-[#D4A843] text-slate-900 font-extrabold text-[10px] rounded-md">
                  Kebutuhan: {selectedRequest.foodCategoryNeeded}
                </span>
              </div>
              <h4 className="text-base font-extrabold">{selectedRequest.shelterName} ({selectedRequest.beneficiariesCount} Anak/Lansia)</h4>
              <p className="text-xs text-slate-200">
                Lokasi: {selectedRequest.location} • Delivery Pref: {selectedRequest.preferredDelivery === 'RESCUE_COURIER' ? '🛵 Kurir Relawan' : selectedRequest.preferredDelivery === 'PROVIDER_DIRECT' ? '🚚 Diantar Toko' : '🏢 Ambil Mandiri'}
              </p>
            </div>

            {/* Smart Category Matching Inventory Selector (Poin 2) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1B3A5C]">1. Pilih Stok Makanan Surplus Toko Anda (Smart Matching)</label>
                {isCategoryMatched ? (
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    ✓ SMART MATCHING MATCHED
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                    ⚠️ KATEGORI TIDAK COCOK
                  </span>
                )}
              </div>

              <select
                className={`w-full rounded-xl border text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:outline-none ${
                  isCategoryMatched ? 'border-emerald-500' : 'border-red-400'
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

              {!isCategoryMatched && (
                <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  ⚠️ Peringatan Smart Matching: Kategori makanan yang Anda pilih ({selectedFoodObj?.category}) tidak sesuai dengan jenis gizi yang dibutuhkan shelter ({selectedRequest.foodCategoryNeeded}). Silakan pilih produk surplus dengan kategori yang cocok!
                </p>
              )}
            </div>

            {/* Stock Limit Validation Input (Poin 2) */}
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

            {/* Recipient-Driven Logistics & Provider Capability Warning (Poin 3 & Poin 4) */}
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

              {/* Check if requested PROVIDER_DIRECT but provider lacks fleet (Poin 4) */}
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
                disabled={!isCategoryMatched || portionedQuantity > selectedFoodObj?.quantity}
              >
                Proses & Terbitkan QR Tracking Donasi ➔
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Tiket Receipt Kode QR & Tracking Integration */}
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
                Data klaim otomatis terdaftar di rute <strong>Klaim & Penyelamatan</strong> serta Pelacak Transparansi Publik Replate!
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
                <span className="text-slate-500 font-medium block">Status Tracking:</span>
                <span className="font-extrabold text-[#D4A843]">{completedTicket.initialStatus}</span>
              </div>
            </div>

            {/* Provider Direct Delivery Photo Upload Option */}
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

            <Button
              variant="gold"
              size="md"
              className="w-full font-extrabold"
              onClick={() => setCompletedTicket(null)}
            >
              Selesai & Cek Tracking Penyelamatan ➔
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal Ajukan Request Baru oleh Shelter (Strictly ONLY for YAYASAN/ADMIN) */}
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

          {/* Preferred Delivery Preference Option (Poin 3) */}
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
