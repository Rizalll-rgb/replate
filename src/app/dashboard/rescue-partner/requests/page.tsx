'use client';

import React, { useState, useEffect } from 'react';
import { MatchResultCard } from '@/components/matching/MatchResultCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { TruckIcon, ShieldCheckIcon, SearchIcon, CheckIcon, MapPinIcon, ClockIcon } from '@/components/ui/Icon';
import { UserCheck, BikeIcon } from 'lucide-react';

interface DriverOption {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  capacity: string;
  status: 'SIAGA' | 'BERTUGAS';
}

const DEFAULT_FLEET_DRIVERS: DriverOption[] = [
  {
    id: 'drv-1',
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    vehicle: 'Motor Box Cooler (25 kg)',
    plateNumber: 'L 1234 AB',
    capacity: '25 kg (40 Porsi)',
    status: 'SIAGA',
  },
  {
    id: 'drv-2',
    name: 'Ahmad Fauzi',
    phone: '0813-9876-5432',
    vehicle: 'Mobil Steril Food-Grade (150 kg)',
    plateNumber: 'L 5678 CD',
    capacity: '150 kg (250 Porsi)',
    status: 'SIAGA',
  },
  {
    id: 'drv-3',
    name: 'Rian Ardiansyah',
    phone: '0819-1122-3344',
    vehicle: 'Van Logistik Pendingin (500 kg)',
    plateNumber: 'L 9012 EF',
    capacity: '500 kg (800 Porsi)',
    status: 'SIAGA',
  },
];

export default function PartnerRequestsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>(DEFAULT_FLEET_DRIVERS);

  // Plotting Driver Modal State (Requirement Rescue #4)
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [isPlottingModalOpen, setIsPlottingModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(DEFAULT_FLEET_DRIVERS[0].id);
  const [assignmentNote, setAssignmentNote] = useState<string>('Gunakan wadah steril / coolbox. Penjemputan di area loading dock belakang resto.');

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [actionLoader, setActionLoader] = useState<{
    isOpen: boolean;
    message: string;
    submessage?: string;
  }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

  useEffect(() => {
    try {
      const isFresh = localStorage.getItem('replate_is_fresh_account') === 'true';
      if (isFresh) {
        setMatches([]);
        return;
      }

      // Load registered fleets if any
      const savedFleets = localStorage.getItem('replate_fleets');
      if (savedFleets) {
        const parsed = JSON.parse(savedFleets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customDrivers: DriverOption[] = parsed.map((fl: any, idx: number) => ({
            id: fl.id || `custom-drv-${idx}`,
            name: fl.driverName || 'Relawan Driver',
            phone: fl.driverPhone || '0812-0000-0000',
            vehicle: fl.vehicleType || 'Motor Box Cooler',
            plateNumber: fl.plateNumber || 'L 0000 XX',
            capacity: '30-50 kg',
            status: 'SIAGA' as const,
          }));
          setDrivers([...customDrivers, ...DEFAULT_FLEET_DRIVERS]);
          setSelectedDriverId(customDrivers[0].id);
        }
      }

      const sampleMatches = [
        {
          id: 'match-1',
          foodName: 'Nasi Goreng Buffet + Ayam Bakar (30 Porsi)',
          providerName: 'Hotel Majapahit Surabaya',
          providerAddress: 'Jl. Tunjungan No. 65, Genteng, Surabaya',
          matchedUserName: 'Food Bank Surabaya (Panti Kasih Ibu)',
          shelterAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
          quantity: 30,
          quantityUnit: 'Porsi',
          score: 0.96,
          scoreBreakdown: {
            distance: { normalized: 0.95 },
            urgency: { normalized: 1.0 },
            foodTypeMatch: { normalized: 0.9 },
            quantityFit: { normalized: 1.0 },
            reliabilityScore: { normalized: 0.95 },
            partnerCapacity: { normalized: 0.9 },
            routeEfficiency: { normalized: 0.8 },
          },
          matchType: 'RESCUE_PARTNER' as const,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'match-2',
          foodName: 'Roti Tawar Gandum & Croissant Steril (20 Paket)',
          providerName: 'Bakery Bonami Surabaya',
          providerAddress: 'Jl. Pemuda No. 12, Surabaya',
          matchedUserName: 'Rumah Singgah Anak Jalanan',
          shelterAddress: 'Jl. Tegalsari No. 34, Genteng, Surabaya',
          quantity: 20,
          quantityUnit: 'Paket',
          score: 0.92,
          scoreBreakdown: {
            distance: { normalized: 0.92 },
            urgency: { normalized: 0.9 },
            foodTypeMatch: { normalized: 0.95 },
            quantityFit: { normalized: 0.9 },
            reliabilityScore: { normalized: 0.9 },
            partnerCapacity: { normalized: 0.85 },
            routeEfficiency: { normalized: 0.88 },
          },
          matchType: 'RESCUE_PARTNER' as const,
          createdAt: new Date().toISOString(),
        },
      ];
      setMatches(sampleMatches);
    } catch (_) {}
  }, []);

  // Step 1: Open Driver Plotting Modal when admin clicks Accept Match
  const handleInitiateAccept = (id: string) => {
    const match = matches.find((m) => m.id === id);
    if (!match) return;
    setSelectedMatch(match);
    setIsPlottingModalOpen(true);
  };

  // Step 2: Confirm Plotting Driver and Dispatch Task
  const handleConfirmPlotting = async () => {
    if (!selectedMatch) return;

    const chosenDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

    setIsPlottingModalOpen(false);
    setActionLoader({
      isOpen: true,
      message: `Menugaskan ${chosenDriver.name}...`,
      submessage: 'Menerbitkan Surat Jalan Digital dan menyinkronkan rute logistik',
    });

    const claimCode = `FB-DON-${Math.floor(80000 + Math.random() * 19000)}`;
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newClaim = {
      id: claimCode,
      code: claimCode,
      claimCode,
      foodName: selectedMatch.foodName,
      providerName: selectedMatch.providerName || 'Hotel Majapahit Surabaya',
      providerAddress: selectedMatch.providerAddress || 'Jl. Tunjungan No. 65, Surabaya',
      providerPhone: '0812-3456-7890',
      shelterName: selectedMatch.matchedUserName || 'Food Bank Surabaya',
      shelterAddress: selectedMatch.shelterAddress || 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      shelterPhone: '0819-8765-4321',
      quantity: `${selectedMatch.quantity || 30} ${selectedMatch.quantityUnit || 'Porsi'}`,
      status: 'AWAITING_RESCUE_PICKUP', // Phase 1: Wait for pickup
      readyTime: 'Hari ini',
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
      createdAt: new Date().toISOString(),
      auditLogs: [
        {
          status: 'MATCH_ACCEPTED',
          title: 'Tugas Diterima dari Pool Tugas',
          time: nowStr,
          desc: 'Admin komunitas menyetujui rekomendasi logistik rescue.',
          actor: 'Admin Komunitas',
        },
        {
          status: 'DRIVER_PLOTTED',
          title: `Driver Ditugaskan: ${chosenDriver.name}`,
          time: nowStr,
          desc: `Armada: ${chosenDriver.vehicle} (Plat: ${chosenDriver.plateNumber}). Surat Jalan Digital diterbitkan.`,
          actor: 'Admin Komunitas',
        },
      ],
    };

    setTimeout(async () => {
      try {
        const savedClaimsStr = localStorage.getItem('replate_claims');
        const existingClaims = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
        const filtered = existingClaims.filter((c: any) => c.code !== claimCode);
        filtered.unshift(newClaim);
        localStorage.setItem('replate_claims', JSON.stringify(filtered));

        // Also update replate_active_claims
        const activeStr = localStorage.getItem('replate_active_claims');
        const existingActive = activeStr ? JSON.parse(activeStr) : [];
        const filteredActive = existingActive.filter((c: any) => c.code !== claimCode);
        filteredActive.unshift(newClaim);
        localStorage.setItem('replate_active_claims', JSON.stringify(filteredActive));

        setMatches((prev) => prev.filter((m) => m.id !== selectedMatch.id));

        try {
          await fetch('/api/rescue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodId: 'seed-food-1', quantity: 30 }),
          });
        } catch (_) {}

        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: `Sukses! Tugas ${claimCode} berhasil di-plot ke ${chosenDriver.name}. Surat Jalan Digital siap diakses.`,
          type: 'success',
        });

        setTimeout(() => {
          router.push('/dashboard/rescue-partner/active');
        }, 1200);
      } catch {
        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: 'Terjadi kendala saat mem-plot tugas rescue.',
          type: 'error',
        });
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A843] block mb-1">
            POOL TUGAS LOGISTIK & SMART MATCHING
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B3A5C]">
            Permintaan Penjemputan Makanan Ter-Match
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Setujui tugas penyelamatan makanan dan tentukan plotting driver relawan yang akan mengantar donasi.
          </p>
        </div>
        <Link href="/dashboard/rescue-partner/active">
          <Button variant="outline" size="sm" className="font-extrabold text-xs rounded-xl border-slate-300">
            Lihat Tugas Rute Berjalan →
          </Button>
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <TruckIcon size={30} />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-base text-[#1B3A5C]">Semua Tugas di Pool Telah Ter-Plot</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
              Seluruh permintaan rescue telah diambil dan ditugaskan ke driver relawan. Algoritma Smart Matching akan otomatis memasangkan outlet donatur baru begitu tersedia.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/dashboard/rescue-partner/active">
              <Button variant="gold" size="sm" className="font-black text-xs text-slate-950 px-5 py-2.5 shadow-xs cursor-pointer rounded-xl">
                Buka Tugas Rute Aktif
              </Button>
            </Link>
            <Link href="/dashboard/explore">
              <Button variant="outline" size="sm" className="font-bold text-xs px-4 py-2.5 rounded-xl border-slate-300 text-slate-700">
                Jelajahi Listing Surplus
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((m) => (
            <MatchResultCard key={m.id} {...m} onAccept={handleInitiateAccept} />
          ))}
        </div>
      )}

      {/* MODAL PLOTTING DRIVER (Requirement Rescue #4) */}
      <Modal
        isOpen={isPlottingModalOpen}
        onClose={() => setIsPlottingModalOpen(false)}
        title="Plotting Driver Relawan & Penugasan Rute"
      >
        {selectedMatch && (
          <div className="space-y-5 text-xs text-slate-800">
            {/* Match Brief Overview */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-widest block">
                RINGKASAN TUGAS RESCUE LOGISTIK
              </span>
              <h4 className="font-black text-sm text-[#1B3A5C]">{selectedMatch.foodName}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11.5px]">
                <div>
                  <span className="text-slate-500 font-semibold block">Outlet Penjemputan (Toko):</span>
                  <strong className="text-slate-800">{selectedMatch.providerName || 'Hotel Majapahit'}</strong>
                  <p className="text-slate-500 text-[10.5px] truncate">{selectedMatch.providerAddress || 'Surabaya'}</p>
                </div>
                <div>
                  <span className="text-emerald-700 font-semibold block">Tujuan Pengantaran (Panti):</span>
                  <strong className="text-emerald-900">{selectedMatch.matchedUserName}</strong>
                  <p className="text-emerald-800 text-[10.5px] truncate">{selectedMatch.shelterAddress || 'Surabaya'}</p>
                </div>
              </div>
            </div>

            {/* Select Driver Section */}
            <div className="space-y-2">
              <label className="font-extrabold text-[#1B3A5C] text-xs block">
                Pilih Driver / Relawan yang Bertugas:
              </label>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {drivers.map((drv) => {
                  const isSelected = selectedDriverId === drv.id;
                  return (
                    <label
                      key={drv.id}
                      onClick={() => setSelectedDriverId(drv.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#1B3A5C] shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected ? 'bg-[#1B3A5C] text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <TruckIcon size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="font-black text-[#1B3A5C] text-xs">{drv.name}</strong>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9.5px] font-black rounded-md">
                              {drv.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium">
                            {drv.vehicle} · Plat: <span className="font-mono font-bold text-slate-800">{drv.plateNumber}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">Kontak: {drv.phone} · Kapasitas: {drv.capacity}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <input
                          type="radio"
                          name="assignedDriver"
                          checked={isSelected}
                          onChange={() => setSelectedDriverId(drv.id)}
                          className="w-4 h-4 text-[#1B3A5C] focus:ring-0 cursor-pointer"
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Operational Note */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 text-xs block">
                Catatan Instruksi untuk Driver (Opsional):
              </label>
              <textarea
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] resize-none"
                placeholder="Misal: Siapkan tas pendingin, masuk lewat loading dock..."
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                className="font-bold text-xs rounded-xl"
                onClick={() => setIsPlottingModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-black text-xs text-slate-950 px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                onClick={handleConfirmPlotting}
              >
                <UserCheck size={14} />
                <span>Plotting Driver & Terbitkan Surat Jalan</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
