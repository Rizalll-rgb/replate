'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Package,
  ArrowRight,
  Phone,
  Building,
  Navigation,
  ExternalLink,
  Wallet,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

export type DeliveryStep =
  | 'AVAILABLE' // Tersedia di pool
  | 'HEADING_TO_PICKUP' // Menuju Lokasi Jemput
  | 'FOOD_VERIFIED' // Makanan Diverifikasi
  | 'IN_TRANSIT' // Dalam Perjalanan
  | 'DELIVERED'; // Tiba di Penerima

export interface RescueBulkTask {
  id: string;
  foodTitle: string;
  donorName: string;
  donorAddress: string;
  donorPhone: string;
  donorType: 'Hotel Bintang 5' | 'Katering Skala Besar' | 'Resto & Bakery';
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  portions: number;
  weightKg: number;
  distanceKm: number;
  deliveryFee: number; // Ongkir Rp 2.000 / km
  deadline: string;
  tempSafeMinutes: number;
  status: DeliveryStep;
  pickedAt?: string;
  deliveredAt?: string;
}

export default function FoodRescueDashboardPage() {
  const router = useRouter();

  // Tab Filter: ALL | ACTIVE | POOL | COMPLETED
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'POOL' | 'COMPLETED'>('ALL');

  // Wallet / Operational Balance State
  const [walletBalance, setWalletBalance] = useState<number>(148000);
  const [totalKmServed, setTotalKmServed] = useState<number>(74.0);
  const [completedMissionsCount, setCompletedMissionsCount] = useState<number>(14);
  const [driverName, setDriverName] = useState<string>('Mas Doni Kurniawan');
  const [vehiclePlate, setVehiclePlate] = useState<string>('Honda Vario L 4582 ABC');

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [withdrawTarget, setWithdrawTarget] = useState<string>('BCA - 8290123456 a.n Doni Kurniawan');

  // Toast State
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Bulk Rescue Tasks Board
  const [tasks, setTasks] = useState<RescueBulkTask[]>([
    {
      id: 'TASK-RSC-8821',
      foodTitle: '40 Porsi Nasi Kotak Komplit & Ayam Panggang Madu',
      donorName: 'Hotel Majapahit Surabaya (5-Star)',
      donorAddress: 'Jl. Tunjungan No. 65, Genteng, Surabaya',
      donorPhone: '0812-9876-5432 (Banquet Chef)',
      donorType: 'Hotel Bintang 5',
      recipientName: 'Panti Asuhan Kasih Ibu (45 Anak Asuh)',
      recipientAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      recipientPhone: '0812-3456-7890 (Ibu Hajjah Maryam)',
      portions: 40,
      weightKg: 16.0,
      distanceKm: 3.8,
      deliveryFee: 8000, // Math.ceil(3.8) * 2000
      deadline: 'Malam ini 21:00 WIB (Sisa 45 Menit)',
      tempSafeMinutes: 90,
      status: 'HEADING_TO_PICKUP',
    },
    {
      id: 'TASK-RSC-8824',
      foodTitle: '50 Porsi Rawon Daging & Tahu Tempe Bacem',
      donorName: 'Katering Bu Mimin Surabaya',
      donorAddress: 'Jl. Tenggilis Mejoyo No. 14, Rungkut, Surabaya',
      donorPhone: '0813-2345-6789 (Admin Dapur)',
      donorType: 'Katering Skala Besar',
      recipientName: 'Panti Asuhan Yatim Mandiri Rungkut',
      recipientAddress: 'Jl. Rungkut Madya No. 12, Surabaya',
      recipientPhone: '0821-9876-5432 (Ustadz Ahmad)',
      portions: 50,
      weightKg: 20.0,
      distanceKm: 2.2,
      deliveryFee: 6000, // Math.ceil(2.2) * 2000
      deadline: 'Malam ini 21:30 WIB (Sisa 1 Jam 15 Menit)',
      tempSafeMinutes: 120,
      status: 'AVAILABLE',
    },
    {
      id: 'TASK-RSC-8826',
      foodTitle: '35 Porsi Lauk Prasmanan Buffet Nusantara',
      donorName: 'Grand City Convention & Resto',
      donorAddress: 'Jl. Walikota Mustajab No. 1, Ketabang, Surabaya',
      donorPhone: '0811-3456-7890 (Captain Banquet)',
      donorType: 'Hotel Bintang 5',
      recipientName: 'Pondok Pesantren & Dhuafa Al-Hikmah',
      recipientAddress: 'Jl. Gayungan No. 5, Surabaya',
      recipientPhone: '0852-3456-7891 (Kiai Hasan)',
      portions: 35,
      weightKg: 14.5,
      distanceKm: 5.1,
      deliveryFee: 12000, // Math.ceil(5.1) * 2000
      deadline: 'Malam ini 22:00 WIB (Sisa 1 Jam 45 Menit)',
      tempSafeMinutes: 75,
      status: 'AVAILABLE',
    },
    {
      id: 'TASK-RSC-8819',
      foodTitle: '60 Porsi Roti Tawar Gandum & Croissant',
      donorName: 'Rotiboy Bakery & Pastry Center',
      donorAddress: 'Grand City Mall Lt. LG, Surabaya',
      donorPhone: '0817-2345-6789 (Store Leader)',
      donorType: 'Resto & Bakery',
      recipientName: 'Panti Asuhan Kasih Ibu Surabaya',
      recipientAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
      recipientPhone: '0812-3456-7890 (Ibu Maryam)',
      portions: 60,
      weightKg: 15.0,
      distanceKm: 2.5,
      deliveryFee: 6000,
      deadline: 'Selesai 27 Okt 2026',
      tempSafeMinutes: 0,
      status: 'DELIVERED',
      deliveredAt: '27 Okt 2026, 20:30 WIB',
    },
  ]);

  // Load from local storage
  useEffect(() => {
    try {
      const savedWallet = localStorage.getItem('replate_rescue_wallet');
      if (savedWallet) {
        const parsed = JSON.parse(savedWallet);
        if (parsed.balance !== undefined) setWalletBalance(parsed.balance);
        if (parsed.totalKm !== undefined) setTotalKmServed(parsed.totalKm);
        if (parsed.completedMissions !== undefined) setCompletedMissionsCount(parsed.completedMissions);
      }

      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.contactPerson || parsed.name) {
          setDriverName(parsed.contactPerson || parsed.name);
        }
      }

      // Check for dynamically created rescue tasks
      const localTasks = localStorage.getItem('replate_rescue_tasks');
      if (localTasks) {
        const parsed = JSON.parse(localTasks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newOnes = parsed.filter((t: any) => !existingIds.has(t.id));
            return [...newOnes, ...prev];
          });
        }
      }
    } catch (_) {}
  }, []);

  // Save wallet state
  const updateWallet = (earnedFee: number, distance: number) => {
    const newBal = walletBalance + earnedFee;
    const newKm = Math.round((totalKmServed + distance) * 10) / 10;
    const newCount = completedMissionsCount + 1;
    setWalletBalance(newBal);
    setTotalKmServed(newKm);
    setCompletedMissionsCount(newCount);

    try {
      localStorage.setItem(
        'replate_rescue_wallet',
        JSON.stringify({
          balance: newBal,
          totalKm: newKm,
          completedMissions: newCount,
        })
      );
    } catch (_) {}
  };

  // Step progression handler
  const handleProgressTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;

        if (task.status === 'AVAILABLE') {
          setToast({
            isOpen: true,
            message: `Tugas ${task.id} berhasil diambil! Segera meluncur ke lokasi donor (${task.donorName}).`,
            type: 'success',
          });
          return { ...task, status: 'HEADING_TO_PICKUP' };
        }

        if (task.status === 'HEADING_TO_PICKUP') {
          setToast({
            isOpen: true,
            message: `Tiba di donor (${task.donorName}). Silakan periksa kemasan & suhu makanan.`,
            type: 'success',
          });
          return { ...task, status: 'FOOD_VERIFIED' };
        }

        if (task.status === 'FOOD_VERIFIED') {
          setToast({
            isOpen: true,
            message: `Makanan telah diverifikasi & dimasukkan boks steril Replate. Mulai antar ke ${task.recipientName}!`,
            type: 'success',
          });
          return { ...task, status: 'IN_TRANSIT', pickedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
        }

        if (task.status === 'IN_TRANSIT') {
          // Mission Completed! Reward added to Operational Wallet!
          updateWallet(task.deliveryFee, task.distanceKm);
          setToast({
            isOpen: true,
            message: `Alhamdulillah! Makanan tiba di ${task.recipientName}. Ongkir Rp ${task.deliveryFee.toLocaleString('id-ID')} masuk ke Saldo Operasional!`,
            type: 'success',
          });
          return {
            ...task,
            status: 'DELIVERED',
            deliveredAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          };
        }

        return task;
      })
    );
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > walletBalance) {
      setToast({
        isOpen: true,
        message: 'Nominal pencairan tidak valid atau melebihi saldo yang tersedia.',
        type: 'error',
      });
      return;
    }

    const remaining = walletBalance - withdrawAmount;
    setWalletBalance(remaining);
    try {
      localStorage.setItem(
        'replate_rescue_wallet',
        JSON.stringify({
          balance: remaining,
          totalKm: totalKmServed,
          completedMissions: completedMissionsCount,
        })
      );
    } catch (_) {}

    setIsWithdrawModalOpen(false);
    setToast({
      isOpen: true,
      message: `Pencairan Rp ${withdrawAmount.toLocaleString('id-ID')} berhasil diajukan ke ${withdrawTarget}. Dana diproses ke rekening tujuan.`,
      type: 'success',
    });
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'ACTIVE') return t.status === 'HEADING_TO_PICKUP' || t.status === 'FOOD_VERIFIED' || t.status === 'IN_TRANSIT';
    if (activeTab === 'POOL') return t.status === 'AVAILABLE';
    if (activeTab === 'COMPLETED') return t.status === 'DELIVERED';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B3A5C] text-[#D4A843] flex items-center justify-center font-black text-xl shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#1B3A5C] tracking-tight">
                  Dashboard Food Rescue Partner
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Armada Logistik Siaga
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Driver: <strong>{driverName}</strong> • {vehiclePlate} • Rute Wilayah Surabaya &amp; Sekitarnya
              </p>
            </div>
          </div>

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={() => {
              setToast({ isOpen: true, message: 'Data penugasan dan saldo logistik diperbarui.', type: 'success' });
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Perbarui Data</span>
          </button>
        </div>

        {/* Panel Saldo Operasional Logistik Driver Rescue (Hasil Akumulasi Ongkir Rp 2.000/km) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0F1D2E] via-[#1B3A5C] to-[#122840] text-white shadow-xl border-2 border-[#D4A843]/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A843] bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-[#D4A843]/20">
                PANEL SALDO OPERASIONAL LOGISTIK RESCUE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-slate-300">Rp</span>
                <strong className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {walletBalance.toLocaleString('id-ID')}
                </strong>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-1">
                Akumulasi ongkir armada <strong>Rp 2.000 / km</strong> (100% dialokasikan langsung untuk driver bensin &amp; operasional pengantaran).
              </p>
            </div>

            <Button
              variant="gold"
              size="md"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="font-black text-xs py-3 px-6 shadow-md text-slate-950 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Wallet className="w-4 h-4" />
              <span>Tarik Saldo Operasional</span>
            </Button>
          </div>

          {/* 3 Driver Logistik Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold block">Total KM Dilayani</span>
              <strong className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {totalKmServed} km
              </strong>
              <span className="text-[9.5px] text-slate-400 block">Jarak tempuh terverifikasi</span>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold block">Misi Sukses</span>
              <strong className="text-base sm:text-lg font-black text-emerald-300 font-mono">
                {completedMissionsCount} Misi
              </strong>
              <span className="text-[9.5px] text-slate-400 block">Bulk rescue panti binaan</span>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold block">Rating Armada</span>
              <strong className="text-base sm:text-lg font-black text-cyan-300 font-mono">
                4.96 ★
              </strong>
              <span className="text-[9.5px] text-slate-400 block">Ketepatan waktu &amp; higienitas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Board Penugasan Penjemputan Makanan Skala Besar (Bulk Rescue) */}
      <div className="space-y-4">
        {/* Board Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-lg font-black text-[#1B3A5C] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#D4A843]" />
              <span>Board Penugasan Penjemputan Makanan Skala Besar (Bulk Rescue)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Penyelamatan makanan porsi besar dari hotel &amp; katering untuk disalurkan ke panti asuhan penerima.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-[#1B3A5C] text-[#D4A843] font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ACTIVE'
                  ? 'bg-blue-600 text-white font-black'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              Aktif Diantar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('POOL')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'POOL'
                  ? 'bg-amber-600 text-white font-black'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Tersedia di Pool
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'COMPLETED'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'DELIVERED';
            const isAvailable = task.status === 'AVAILABLE';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl border-2 p-5 space-y-4 shadow-xs transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isAvailable
                    ? 'border-amber-300 hover:border-[#1B3A5C]'
                    : 'border-[#1B3A5C] ring-2 ring-[#1B3A5C]/10'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Task Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {task.id}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-[#1B3A5C]">
                          BULK RESCUE
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {task.donorType}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-[#1B3A5C] mt-1 leading-snug">
                        {task.foodTitle}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 block">Ongkir Driver (100%):</span>
                      <strong className="text-base font-black text-emerald-700 font-mono">
                        +Rp {task.deliveryFee.toLocaleString('id-ID')}
                      </strong>
                    </div>
                  </div>

                  {/* Rincian Rute: Titik Jemput Donor -> Titik Antar Panti */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    {/* Titik Jemput Donor */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        A
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Titik Jemput Donor (Hotel / Katering):
                        </span>
                        <strong className="text-slate-800 block">{task.donorName}</strong>
                        <p className="text-[11px] text-slate-600 leading-snug">{task.donorAddress}</p>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          Kontak: {task.donorPhone}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 border-dashed my-1"></div>

                    {/* Titik Antar Panti Asuhan */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        B
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Titik Antar (Panti Asuhan Binaan):
                        </span>
                        <strong className="text-slate-800 block">{task.recipientName}</strong>
                        <p className="text-[11px] text-slate-600 leading-snug">{task.recipientAddress}</p>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          Kontak: {task.recipientPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Metrik Tugas: Berat (Kg), Porsi, Jarak, & Batas Waktu */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                      <span className="text-[9.5px] text-slate-500 font-bold block">Volume Pangan</span>
                      <strong className="text-xs font-black text-[#1B3A5C]">
                        {task.weightKg} kg <span className="font-normal text-slate-600">({task.portions} Porsi)</span>
                      </strong>
                    </div>

                    <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100">
                      <span className="text-[9.5px] text-slate-500 font-bold block">Jarak Rute</span>
                      <strong className="text-xs font-black text-amber-900 font-mono">
                        {task.distanceKm} km
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                      <span className="text-[9.5px] text-slate-500 font-bold block">Batas Waktu</span>
                      <strong className="text-[10.5px] font-black text-slate-800 truncate block">
                        {task.deadline}
                      </strong>
                    </div>
                  </div>

                  {/* 4-Tahap Progress Status Stepper Indicator */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Status Tahapan Pengantaran:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-bold">
                      {/* Step 1: Menuju Lokasi Jemput */}
                      <div
                        className={`p-1.5 rounded-lg border transition-all ${
                          task.status === 'HEADING_TO_PICKUP'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : task.status === 'FOOD_VERIFIED' || task.status === 'IN_TRANSIT' || task.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        1. Menuju Jemput
                      </div>

                      {/* Step 2: Makanan Diverifikasi */}
                      <div
                        className={`p-1.5 rounded-lg border transition-all ${
                          task.status === 'FOOD_VERIFIED'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : task.status === 'IN_TRANSIT' || task.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        2. Verifikasi
                      </div>

                      {/* Step 3: Dalam Perjalanan */}
                      <div
                        className={`p-1.5 rounded-lg border transition-all ${
                          task.status === 'IN_TRANSIT'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : task.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        3. Perjalanan
                      </div>

                      {/* Step 4: Tiba di Penerima */}
                      <div
                        className={`p-1.5 rounded-lg border transition-all ${
                          task.status === 'DELIVERED'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        4. Tiba di Panti
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Status Update Button */}
                <div className="pt-3 border-t border-slate-100">
                  {task.status === 'AVAILABLE' && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleProgressTask(task.id)}
                      className="w-full font-black text-xs py-2.5 shadow-xs text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Ambil Penugasan Ini (Ongkir +Rp {task.deliveryFee.toLocaleString('id-ID')})</span>
                    </Button>
                  )}

                  {task.status === 'HEADING_TO_PICKUP' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleProgressTask(task.id)}
                      className="w-full bg-[#1B3A5C] hover:bg-[#2C5A8F] text-[#D4A843] font-black text-xs py-2.5 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Menuju Lokasi Jemput (Tiba di Donor)</span>
                    </Button>
                  )}

                  {task.status === 'FOOD_VERIFIED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleProgressTask(task.id)}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs py-2.5 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Makanan Diverifikasi (Mulai Antar ke Panti)</span>
                    </Button>
                  )}

                  {task.status === 'IN_TRANSIT' && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleProgressTask(task.id)}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs py-2.5 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Dalam Perjalanan → Konfirmasi Tiba di Penerima</span>
                    </Button>
                  )}

                  {task.status === 'DELIVERED' && (
                    <div className="p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-xl text-center text-xs font-black text-emerald-900 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Misi Selesai • Tiba di Penerima ({task.deliveredAt || 'Terverifikasi'})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL PENCAIRAN SALDO OPERASIONAL LOGISTIK */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Tarik Saldo Operasional Driver Rescue"
        size="md"
      >
        <form onSubmit={handleWithdrawal} className="space-y-4 p-2 text-xs text-slate-800">
          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
            <span className="text-[10px] text-blue-700 font-bold block uppercase">Saldo Tersedia:</span>
            <strong className="text-2xl font-black text-[#1B3A5C] font-mono block">
              Rp {walletBalance.toLocaleString('id-ID')}
            </strong>
            <p className="text-[10.5px] text-slate-600">
              Hasil akumulasi ongkir Rp 2.000/km dari pengantaran porsi panti asuhan binaan.
            </p>
          </div>

          <div>
            <label className="font-bold text-[#1B3A5C] block mb-1">Nominal Penarikan (Rp) *</label>
            <input
              type="number"
              min={10000}
              max={walletBalance}
              step={5000}
              required
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:border-[#1B3A5C]"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setWithdrawAmount(50000)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold"
              >
                Rp 50.000
              </button>
              <button
                type="button"
                onClick={() => setWithdrawAmount(100000)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold"
              >
                Rp 100.000
              </button>
              <button
                type="button"
                onClick={() => setWithdrawAmount(walletBalance)}
                className="px-2.5 py-1 bg-[#1B3A5C] text-[#D4A843] rounded-lg text-[11px] font-bold"
              >
                Tarik Semua (Rp {walletBalance.toLocaleString('id-ID')})
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1B3A5C] block mb-1">Rekening / E-Wallet Pencairan *</label>
            <select
              value={withdrawTarget}
              onChange={(e) => setWithdrawTarget(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#1B3A5C] bg-white"
            >
              <option value="BCA - 8290123456 a.n Doni Kurniawan">BCA - 8290123456 a.n Doni Kurniawan</option>
              <option value="Mandiri - 142001928374 a.n Doni Kurniawan">Mandiri - 142001928374 a.n Doni Kurniawan</option>
              <option value="BRI - 00293847561029 a.n Doni Kurniawan">BRI - 00293847561029 a.n Doni Kurniawan</option>
              <option value="GoPay - 081234567890 a.n Doni Kurniawan">GoPay - 0812-3456-7890 a.n Doni Kurniawan</option>
              <option value="OVO - 081234567890 a.n Doni Kurniawan">OVO - 0812-3456-7890 a.n Doni Kurniawan</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawModalOpen(false)}
              className="font-bold text-xs py-2 px-4 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-[#1B3A5C] hover:bg-[#2C5A8F] text-[#D4A843] font-black text-xs py-2 px-5 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Wallet className="w-4 h-4" />
              <span>Konfirmasi Penarikan</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Alert */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

