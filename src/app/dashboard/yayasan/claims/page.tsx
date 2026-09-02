'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { 
  CheckIcon, 
  ClockIcon, 
  MapPinIcon, 
  PackageIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  SearchIcon 
} from '@/components/ui/Icon';

export default function YayasanClaimsPage() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY' | 'REQUESTS'>('ACTIVE');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'SELF_PICKUP' | 'RESCUE_PARTNER'>('ALL');
  const [claimsList, setClaimsList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [selectedClaimModal, setSelectedClaimModal] = useState<any | null>(null);

  // Modal Ajukan Kebutuhan Panti
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqFoodType, setReqFoodType] = useState('');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqNotes, setReqNotes] = useState('');

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      const savedClaims = localStorage.getItem('replate_claims');
      const activeClaims = localStorage.getItem('replate_active_claims');

      let mergedClaims: any[] = [];
      if (savedClaims) {
        try {
          const parsed = JSON.parse(savedClaims);
          if (Array.isArray(parsed)) mergedClaims = [...parsed];
        } catch (_) {}
      }
      if (activeClaims) {
        try {
          const parsed = JSON.parse(activeClaims);
          if (Array.isArray(parsed)) {
            parsed.forEach((c: any) => {
              if (!mergedClaims.some((m) => m.id === c.id || m.code === c.id)) {
                mergedClaims.push(c);
              }
            });
          }
        } catch (_) {}
      }

      if (isFresh && mergedClaims.length === 0) {
        setClaimsList([]);
        setHistoryList([]);
        return;
      }

      const defaultActiveDemo = [
        {
          id: 'CLM-YYS-001',
          code: 'FB-YYS-8821',
          foodName: 'Roti & Kue Pastry Surplus',
          provider: 'Rotiboy Surabaya',
          providerName: 'Rotiboy Surabaya',
          address: 'Jl. Pemuda No. 12, Surabaya Pusat',
          quantity: '30 Porsi',
          method: 'RESCUE_PARTNER',
          methodLabel: 'Diantar Kurir Relawan',
          status: 'IN_TRANSIT',
          pickupTime: 'Hari ini 20:30 WIB',
          claimedAt: 'Hari ini, 16:30 WIB',
          qrPayload: 'REPLATE-YYS-FB-YYS-8821-VERIFIED',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
        },
        {
          id: 'CLM-YYS-002',
          code: 'FB-YYS-8822',
          foodName: 'Nasi Kotak Ayam Bakar',
          provider: 'Catering Bu Ida',
          providerName: 'Catering Bu Ida',
          address: 'Jl. Raya Manyar No. 88, Surabaya Timur',
          quantity: '25 Porsi',
          method: 'SELF_PICKUP',
          methodLabel: 'Ambil Sendiri (Self-Pickup)',
          status: 'READY_FOR_PICKUP',
          pickupTime: 'Hari ini 21:00 WIB',
          claimedAt: 'Hari ini, 17:15 WIB',
          qrPayload: 'REPLATE-YYS-FB-YYS-8822-VERIFIED',
          hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
        },
      ];

      const defaultHistoryDemo = [
        {
          id: 'HIS-YYS-101',
          code: 'FB-YYS-7710',
          date: '21 Aug 2026',
          foodName: 'Roti & Kue Pastry Surplus',
          provider: 'Rotiboy Surabaya',
          quantity: '30 Porsi',
          weightKg: '15.0 kg',
          co2Saved: '37.5 kg CO2',
          peopleFed: '30 Anak Panti',
          status: 'COMPLETED',
          method: 'RESCUE_PARTNER',
          methodLabel: 'Diantar Kurir Relawan',
        },
        {
          id: 'HIS-YYS-102',
          code: 'FB-YYS-7709',
          date: '20 Aug 2026',
          foodName: 'Nasi Bungkus Buffet Hotel',
          provider: 'Hotel Majapahit Surabaya',
          quantity: '50 Porsi',
          weightKg: '25.0 kg',
          co2Saved: '62.5 kg CO2',
          peopleFed: '50 Anak Panti',
          status: 'COMPLETED',
          method: 'RESCUE_PARTNER',
          methodLabel: 'Diantar Kurir Relawan',
        },
        {
          id: 'HIS-YYS-103',
          code: 'FB-YYS-7708',
          date: '19 Aug 2026',
          foodName: 'Buah & Sayur Segar Supermarket',
          provider: 'Supermarket Segar',
          quantity: '40 Porsi',
          weightKg: '20.0 kg',
          co2Saved: '50.0 kg CO2',
          peopleFed: '40 Anak Panti',
          status: 'COMPLETED',
          method: 'SELF_PICKUP',
          methodLabel: 'Ambil Sendiri',
        },
      ];

      setClaimsList(mergedClaims.length > 0 ? mergedClaims : defaultActiveDemo);
      setHistoryList(defaultHistoryDemo);
    } catch (_) {}
  }, []);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFoodType || !reqQuantity) return;

    const newReq = {
      id: `REQ-YYS-${Date.now()}`,
      code: `REQ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      foodName: reqFoodType,
      provider: 'Belum Ada Donatur',
      providerName: 'Menunggu Donatur Pangan',
      address: 'Menunggu Smart Matching',
      quantity: `${reqQuantity} Porsi`,
      method: 'RESCUE_PARTNER',
      methodLabel: 'Menunggu Bantuan Relawan',
      status: 'WAITING_DONOR',
      claimedAt: 'Baru saja',
      pickupTime: 'Fleksibel',
      notes: reqNotes,
      qrPayload: `REPLATE-REQ-${Date.now()}`,
      hygieneStatus: 'VERIFIKASI SISTEM',
    };

    const updated = [newReq, ...claimsList];
    setClaimsList(updated);
    try {
      localStorage.setItem('replate_claims', JSON.stringify(updated));
    } catch (_) {}

    setRequestModalOpen(false);
    setReqFoodType('');
    setReqQuantity('');
    setReqNotes('');
    setActiveTab('REQUESTS');
  };

  const activeClaims = claimsList.filter((c) => c.status !== 'WAITING_DONOR' && c.status !== 'COMPLETED');
  const requestClaims = claimsList.filter((c) => c.status === 'WAITING_DONOR');

  const getFilteredList = () => {
    let source = activeTab === 'ACTIVE' ? activeClaims : activeTab === 'HISTORY' ? historyList : requestClaims;
    if (methodFilter === 'ALL') return source;
    return source.filter((item) => {
      const m = String(item.method || '').toUpperCase();
      return m === methodFilter;
    });
  };

  const displayList = getFilteredList();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Sleek Modern Header Card (Seragam Antar Modul & Role) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9.5px] font-black uppercase tracking-wider rounded-md">
                Pusat Klaim & Penyelamatan Pangan
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Tiket QR Handover Siap</span>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#1B3A5C] tracking-tight">
              Klaim & Penyaluran Pangan Panti
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Pantau alokasi makanan donasi, tiket barcode serah terima makanan, dan riwayat penyaluran panti asuhan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              variant="gold"
              size="sm"
              leftIcon={<PackageIcon size={14} className="text-slate-950" />}
              className="font-black text-xs text-slate-950 shadow-xs py-2 px-3.5 rounded-xl cursor-pointer"
              onClick={() => setRequestModalOpen(true)}
            >
              + Ajukan Kebutuhan Panti
            </Button>
            <Link href="/dashboard/explore">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SearchIcon size={14} className="text-[#1B3A5C]" />}
                className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Eksplor Donasi Rp0
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs & Method Filters Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 flex-wrap">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'ACTIVE'
                  ? 'bg-white text-[#1B3A5C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 font-bold'
              }`}
            >
              Klaim Aktif & Penjemputan ({activeClaims.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'bg-white text-[#1B3A5C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 font-bold'
              }`}
            >
              Riwayat Bantuan Selesai ({historyList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'REQUESTS'
                  ? 'bg-white text-[#1B3A5C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 font-bold'
              }`}
            >
              Permintaan Panti ({requestClaims.length})
            </button>
          </div>

          {/* Delivery Method Filter Pills (Clean SVG Icons) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Metode:</span>
            <button
              type="button"
              onClick={() => setMethodFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                methodFilter === 'ALL' ? 'bg-[#1B3A5C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setMethodFilter('SELF_PICKUP')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                methodFilter === 'SELF_PICKUP' ? 'bg-[#1B3A5C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PackageIcon size={12} />
              <span>Ambil Sendiri</span>
            </button>
            <button
              type="button"
              onClick={() => setMethodFilter('RESCUE_PARTNER')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                methodFilter === 'RESCUE_PARTNER' ? 'bg-[#1B3A5C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TruckIcon size={12} />
              <span>Diantar Kurir Relawan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content List */}
      {displayList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
            <PackageIcon size={24} className="text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#1B3A5C]">
              {activeTab === 'ACTIVE' 
                ? 'Belum Ada Klaim Makanan Aktif' 
                : activeTab === 'HISTORY' 
                ? 'Belum Ada Riwayat Penyaluran Selesai' 
                : 'Belum Ada Permintaan Panti Aktif'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              {activeTab === 'ACTIVE'
                ? 'Jelajahi donatur surplus Rp 0 untuk menyelamatkan makanan bergizi bagi anak-anak asuh yayasan Anda.'
                : 'Penyaluran bantuan makanan yang telah diverifikasi serah terima akan tercatat di arsip ini.'}
            </p>
          </div>
          <Link href="/dashboard/explore">
            <Button variant="gold" size="md" className="font-black text-xs text-slate-950 px-5 py-2.5 shadow-xs cursor-pointer">
              Eksplor Donasi Makanan Rp 0 ➔
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((item) => (
            <Card key={item.id} className="border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between">
              <CardBody className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {item.code || item.id}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                        {item.quantity}
                      </span>
                    </div>

                    <Badge
                      variant={
                        item.status === 'COMPLETED'
                          ? 'success'
                          : item.status === 'IN_TRANSIT'
                          ? 'primary'
                          : item.status === 'WAITING_DONOR'
                          ? 'warning'
                          : 'gold'
                      }
                      className="text-[10px]"
                    >
                      {item.status === 'COMPLETED'
                        ? 'Selesai Diterima'
                        : item.status === 'IN_TRANSIT'
                        ? 'Kurir Sedang Mengantar'
                        : item.status === 'WAITING_DONOR'
                        ? 'Menunggu Donatur'
                        : 'Siap Handover'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1B3A5C] leading-snug">
                      {item.foodName}
                    </h3>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {item.provider || item.providerName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                      <MapPinIcon size={11} className="text-slate-400 shrink-0" />
                      <span className="truncate">{item.address}</span>
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        {item.method === 'SELF_PICKUP' ? <PackageIcon size={11} /> : <TruckIcon size={11} />}
                        {item.methodLabel || (item.method === 'SELF_PICKUP' ? 'Ambil Sendiri' : 'Diantar Kurir Relawan')}
                      </span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <ClockIcon size={11} />
                        {item.pickupTime || item.date || item.claimedAt}
                      </span>
                    </div>
                    {item.co2Saved && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
                        <span>Pencegahan Emisi: <strong>{item.co2Saved}</strong></span>
                        <span>Sasaran: <strong>{item.peopleFed}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.hygieneStatus || 'Standar Kelayakan BPOM'}
                  </span>
                  
                  {activeTab !== 'HISTORY' && (
                    <Button
                      variant="gold"
                      size="sm"
                      className="font-black text-xs text-slate-950 py-1.5 px-3 rounded-xl shadow-xs cursor-pointer"
                      onClick={() => setSelectedClaimModal(item)}
                    >
                      Buka QR Tiket Handover
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Detail & QR Barcode Tiket Handover (Poin 14) */}
      <Modal
        isOpen={!!selectedClaimModal}
        onClose={() => setSelectedClaimModal(null)}
        title={selectedClaimModal ? `Tiket Serah Terima: ${selectedClaimModal.code || selectedClaimModal.id}` : 'Tiket QR'}
        size="md"
      >
        {selectedClaimModal && (
          <div className="space-y-4 text-xs">
            {/* Top QR Display Box */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 text-center space-y-3">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                SCAN QR SAAT HANDOVER MAKANAN
              </span>
              <div className="flex justify-center py-2">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
                  <QRGenerator 
                    value={selectedClaimModal.qrPayload || `REPLATE-YYS-${selectedClaimModal.code || selectedClaimModal.id}`} 
                    foodName={selectedClaimModal.foodName}
                    portions={selectedClaimModal.quantity}
                    providerName={selectedClaimModal.provider || selectedClaimModal.providerName}
                  />
                </div>
              </div>
              <span className="font-mono font-black text-sm text-[#1B3A5C] block">
                {selectedClaimModal.code || selectedClaimModal.id}
              </span>
              <p className="text-[11px] text-slate-500 font-medium leading-tight max-w-xs mx-auto">
                Tunjukkan QR ini kepada kasir toko atau kurir relawan saat makanan surplus diserahkan.
              </p>
            </div>

            {/* Detail Information */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500 font-medium">Menu Surplus:</span>
                <strong className="text-[#1B3A5C] text-right font-bold">{selectedClaimModal.foodName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500 font-medium">Jumlah Alokasi:</span>
                <strong className="text-emerald-700 font-black">{selectedClaimModal.quantity}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500 font-medium">Penyedia Donatur:</span>
                <strong className="text-slate-800 font-bold">{selectedClaimModal.provider || selectedClaimModal.providerName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500 font-medium">Lokasi Pickup:</span>
                <span className="text-slate-700 font-medium text-right max-w-[200px] truncate">{selectedClaimModal.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Waktu Pengambilan:</span>
                <span className="text-amber-800 font-bold">{selectedClaimModal.pickupTime || 'Hari ini 21:00 WIB'}</span>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-emerald-900">
              <ShieldCheckIcon size={18} className="text-emerald-600 shrink-0" />
              <div className="text-[11px] leading-snug">
                <strong className="block font-black">Audit Kualitas Higienitas Terjamin</strong>
                <span className="font-medium text-emerald-800">
                  Makanan ini telah diverifikasi memenuhi 8-Checklist Kelayakan Konsumsi BPOM RI & Dinsos.
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full font-black py-2.5 text-xs shadow-xs cursor-pointer"
              onClick={() => setSelectedClaimModal(null)}
            >
              Tutup Tiket
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal Ajukan Kebutuhan Panti */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#1B3A5C] p-4 text-white">
              <h3 className="font-black text-base sm:text-lg">Ajukan Kebutuhan Pangan Panti</h3>
              <p className="text-xs text-blue-200 font-medium">Kebutuhan Anda akan disinkronkan ke radar donatur & Smart Matching 2.0.</p>
            </div>
            <div className="p-5">
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Kebutuhan Makanan (Jenis / Tipe)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nasi Kotak Ayam / Sembako / Susu Balita"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
                    value={reqFoodType}
                    onChange={(e) => setReqFoodType(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Jumlah Kebutuhan (Porsi / Paket)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 45 (sesuai kapasitas panti)"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
                    value={reqQuantity}
                    onChange={(e) => setReqQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Catatan Spesifikasi (Opsional)</label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Diberikan untuk makan malam santri panti sebelum jam 20:30..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setRequestModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="gold" size="sm" className="font-black text-slate-950">
                    Kirim Permintaan ➔
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
