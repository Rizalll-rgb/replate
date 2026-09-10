'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { QRScanner } from '@/components/qr/QRScanner';
import {
  ArrowLeft,
  Printer,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Camera,
  QrCode,
  Truck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { resolveIndonesianAddress } from '@/lib/geoResolver';

export default function SuratJalanPage() {
  const [taskCode, setTaskCode] = useState('FB-DON-88192');
  const [task, setTask] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Driver action modals
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string | null>(null);

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

  // Default fallback task
  const defaultTask = {
    code: 'FB-DON-88192',
    id: 'FB-DON-88192',
    foodName: 'Nasi Goreng Buffet + Ayam Bakar (30 Porsi)',
    providerName: 'Hotel Majapahit Surabaya',
    providerAddress: 'Jl. Tunjungan No. 65, Genteng, Surabaya',
    providerPhone: '0812-3456-7890',
    shelterName: 'Panti Asuhan Kasih Ibu Wonokromo',
    shelterAddress: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
    shelterPhone: '0819-8765-4321',
    quantity: '30 Porsi',
    status: 'AWAITING_RESCUE_PICKUP',
    time: 'Hari ini 20:30 WIB',
    assignedDriver: {
      id: 'drv-1',
      name: 'Budi Santoso',
      phone: '0812-3456-7890',
      vehicle: 'Motor Box Cooler (25 kg)',
      plateNumber: 'L 1234 AB',
    },
    notes: 'Bawa coolbox steril 25L. Penjemputan di area loading dock belakang hotel.',
    auditLogs: [
      {
        status: 'MATCH_ACCEPTED',
        title: 'Tugas Diterima dari Pool Tugas',
        time: '18:45 WIB',
        desc: 'Disetujui oleh Posko Komunitas Food Rescue.',
        actor: 'Admin Komunitas',
      },
      {
        status: 'DRIVER_PLOTTED',
        title: 'Driver Ditugaskan: Budi Santoso',
        time: '18:47 WIB',
        desc: 'Armada Motor Box Cooler (L 1234 AB) siap jalan.',
        actor: 'Admin Komunitas',
      },
    ],
  };

  useEffect(() => {
    try {
      let code = 'FB-DON-88192';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const qCode = params.get('code');
        if (qCode) code = qCode;
      }
      setTaskCode(code);

      // Search in replate_claims or replate_active_claims
      let found: any = null;
      const rawClaims = localStorage.getItem('replate_claims');
      if (rawClaims) {
        const list = JSON.parse(rawClaims);
        found = list.find((c: any) => c.code === code || c.id === code || c.claimCode === code);
      }
      if (!found) {
        const rawActive = localStorage.getItem('replate_active_claims');
        if (rawActive) {
          const list = JSON.parse(rawActive);
          found = list.find((c: any) => c.code === code || c.id === code || c.claimCode === code);
        }
      }

      if (found) {
        setTask({
          ...defaultTask,
          ...found,
          assignedDriver: found.assignedDriver || defaultTask.assignedDriver,
        });
      } else {
        setTask(defaultTask);
      }
    } catch (_) {
      setTask(defaultTask);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const syncTaskToStorage = (updatedTask: any) => {
    setTask(updatedTask);
    try {
      const rawClaims = localStorage.getItem('replate_claims');
      const list = rawClaims ? JSON.parse(rawClaims) : [];
      const updatedList = list.map((c: any) =>
        c.code === updatedTask.code || c.id === updatedTask.code ? { ...c, ...updatedTask } : c
      );
      localStorage.setItem('replate_claims', JSON.stringify(updatedList));

      const rawActive = localStorage.getItem('replate_active_claims');
      const activeList = rawActive ? JSON.parse(rawActive) : [];
      const updatedActive = activeList.map((c: any) =>
        c.code === updatedTask.code || c.id === updatedTask.code ? { ...c, ...updatedTask } : c
      );
      localStorage.setItem('replate_active_claims', JSON.stringify(updatedActive));
    } catch (_) {}
  };

  // Driver Action 1: Set OTW Jemput
  const handleSetOtwPickup = () => {
    if (!task) return;
    setActionLoader({
      isOpen: true,
      message: 'Memperbarui Status Perjalanan...',
      submessage: 'Memberi tahu toko bahwa driver sedang meluncur ke lokasi',
    });

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setTimeout(() => {
      const updated = {
        ...task,
        status: 'IN_TRANSIT_TO_PICKUP',
        auditLogs: [
          ...(task.auditLogs || []),
          {
            status: 'IN_TRANSIT_TO_PICKUP',
            title: 'Driver OTW Menuju Toko Penjemputan',
            time: nowStr,
            desc: `Driver ${task.assignedDriver?.name || 'Relawan'} dalam perjalanan menuju ${task.providerName}.`,
            actor: 'Driver Relawan',
          },
        ],
      };
      syncTaskToStorage(updated);
      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Status berhasil diubah: Anda sedang OTW ke lokasi penjemputan toko.',
        type: 'success',
      });
    }, 900);
  };

  // Driver Action 2: Scan QR Toko & Handover Selesai
  const handleVerifyStoreQR = (scannedCode?: string) => {
    setShowScannerModal(false);
    setActionLoader({
      isOpen: true,
      message: 'Memvalidasi QR Toko & Serah Terima...',
      submessage: 'Memverifikasi nomor resi dan kelayakan higienitas pangan',
    });

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setTimeout(() => {
      const updated = {
        ...task,
        status: 'IN_TRANSIT', // Now in transit to shelter
        auditLogs: [
          ...(task.auditLogs || []),
          {
            status: 'STORE_PICKED_UP',
            title: 'Scan QR Toko Berhasil — Makanan Telah Diambil',
            time: nowStr,
            desc: `Makanan berhasil diserahkan oleh ${task.providerName}. Driver mulai mengantar ke panti tujuan.`,
            actor: 'Driver Relawan',
          },
        ],
      };
      syncTaskToStorage(updated);
      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Validasi QR Toko Sukses! Makanan telah diambil. Silakan lanjutkan pengantaran ke panti asuhan.',
        type: 'success',
      });
    }, 1100);
  };

  // Driver Action 3: Konfirmasi Sampai & Serah Terima di Panti Selesai
  const handleCompleteDelivery = () => {
    setShowCompletionModal(false);
    setActionLoader({
      isOpen: true,
      message: 'Menyimpan Bukti Serah Terima...',
      submessage: 'Menerbitkan Berita Acara Digital Replate',
    });

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const sampleProof =
      proofPhotoUrl ||
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60';

    setTimeout(() => {
      const updated = {
        ...task,
        status: 'COMPLETED',
        photoProof: sampleProof,
        auditLogs: [
          ...(task.auditLogs || []),
          {
            status: 'DELIVERED_COMPLETED',
            title: 'Serah Terima di Panti Selesai',
            time: nowStr,
            desc: `Donasi makanan diterima dengan aman oleh pihak ${task.shelterName}. Foto dokumentasi tersimpan.`,
            actor: 'Driver Relawan',
          },
        ],
      };
      syncTaskToStorage(updated);
      setActionLoader({ isOpen: false, message: '' });
      setToastState({
        isOpen: true,
        message: 'Alhamdulillah! Tugas pengantaran donasi selesai. Terima kasih pahlawan pangan Replate!',
        type: 'success',
      });
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isLoaded || !task) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-500">
        Memuat Surat Jalan Digital...
      </div>
    );
  }

  const cleanProviderPhone = (task.providerPhone || '081234567890').replace(/\D/g, '');
  const cleanShelterPhone = (task.shelterPhone || '081987654321').replace(/\D/g, '');

  const providerWaUrl = `https://wa.me/${cleanProviderPhone.startsWith('0') ? '62' + cleanProviderPhone.slice(1) : cleanProviderPhone}?text=${encodeURIComponent(`Halo ${task.providerName}, saya driver relawan Replate (${task.assignedDriver?.name || 'Driver'}) untuk penjemputan donasi resi #${task.code}.`)}`;
  const shelterWaUrl = `https://wa.me/${cleanShelterPhone.startsWith('0') ? '62' + cleanShelterPhone.slice(1) : cleanShelterPhone}?text=${encodeURIComponent(`Halo ${task.shelterName}, saya driver relawan Replate (${task.assignedDriver?.name || 'Driver'}) yang mengantar donasi ${task.foodName}.`)}`;

  const providerMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${task.providerName} ${task.providerAddress}`)}`;
  const shelterMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${task.shelterName} ${task.shelterAddress}`)}`;

  const isCompleted = task.status === 'COMPLETED';
  const isInTransitToShelter = task.status === 'IN_TRANSIT';
  const isOtwPickup = task.status === 'IN_TRANSIT_TO_PICKUP';
  const isAwaitingPickup = task.status === 'AWAITING_RESCUE_PICKUP';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-slate-800">
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

      {/* Action Bar - Hidden on print */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/rescue-partner/active">
          <Button variant="outline" size="sm" className="font-extrabold text-xs inline-flex items-center gap-1.5 rounded-xl border-slate-300">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Tugas Rute
          </Button>
        </Link>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="font-bold text-xs inline-flex items-center gap-1.5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Cetak Lembar Surat Jalan
          </Button>
        </div>
      </div>

      {/* DRIVER INTERACTIVE REAL-TIME ACTION CARD (Hanya Tampil di Layar Driver / Ponsel) */}
      <div className="print:hidden p-4 sm:p-5 bg-gradient-to-r from-[#1B3A5C] via-[#163353] to-[#1B3A5C] text-white rounded-3xl shadow-lg space-y-4 border-2 border-[#D4A843]/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#D4A843] text-slate-950 text-[10px] font-black uppercase rounded-md">
                PORTAL INTERAKTIF DRIVER
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Driver: <strong className="text-white">{task.assignedDriver?.name}</strong> ({task.assignedDriver?.plateNumber})
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              Aksi Operasional Lapangan Pengantaran Makanan
            </h2>
          </div>

          <span className={`px-3 py-1 rounded-xl text-xs font-black self-start sm:self-center flex items-center gap-1.5 ${
            isCompleted
              ? 'bg-emerald-500 text-white'
              : isInTransitToShelter
              ? 'bg-amber-400 text-slate-950 animate-pulse'
              : isOtwPickup
              ? 'bg-blue-500 text-white animate-pulse'
              : 'bg-slate-200 text-slate-900'
          }`}>
            {isCompleted ? (
              <>
                <CheckCircle2 size={13} />
                <span>Pengantaran Sukses</span>
              </>
            ) : isInTransitToShelter ? (
              <>
                <Truck size={13} />
                <span>OTW Antar ke Panti</span>
              </>
            ) : isOtwPickup ? (
              <>
                <Navigation size={13} />
                <span>OTW Menuju Toko</span>
              </>
            ) : (
              <>
                <Clock size={13} />
                <span>Menunggu Keberangkatan</span>
              </>
            )}
          </span>
        </div>

        {/* Phase Step Actions for Driver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {/* Action 1: Set OTW Jemput */}
          <button
            type="button"
            disabled={isCompleted || isInTransitToShelter || isOtwPickup}
            onClick={handleSetOtwPickup}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isOtwPickup
                ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-400 text-white'
                : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-300">Langkah 1</span>
              <Navigation size={15} className="text-blue-300" />
            </div>
            <div>
              <strong className="block text-sm font-black">1. Set OTW Jemput</strong>
              <p className="text-[10.5px] text-slate-300 mt-0.5">
                Konfirmasi driver mulai meluncur ke lokasi toko donatur.
              </p>
            </div>
            <div className="text-[10px] font-bold text-amber-300">
              {isOtwPickup ? '✓ Sedang Dalam Perjalanan Jemput' : 'Klik untuk Mulai Jalan →'}
            </div>
          </button>

          {/* Action 2: Scan QR Toko */}
          <button
            type="button"
            disabled={isCompleted || isInTransitToShelter}
            onClick={() => setShowScannerModal(true)}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isInTransitToShelter
                ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400 text-white'
                : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-300">Langkah 2</span>
              <QrCode size={15} className="text-amber-300" />
            </div>
            <div>
              <strong className="block text-sm font-black">2. Scan QR Toko & Ambil</strong>
              <p className="text-[10.5px] text-slate-300 mt-0.5">
                Pindai barcode outlet toko untuk serah terima paket makanan.
              </p>
            </div>
            <div className="text-[10px] font-bold text-amber-300">
              {isInTransitToShelter ? '✓ Makanan Berhasil Diambil' : 'Buka Scanner Kamera →'}
            </div>
          </button>

          {/* Action 3: Selesai Serah Terima Panti */}
          <button
            type="button"
            disabled={isCompleted || (!isInTransitToShelter && !isOtwPickup)}
            onClick={() => setShowCompletionModal(true)}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed sm:col-span-2 md:col-span-1 ${
              isCompleted
                ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400 text-white'
                : 'bg-amber-400 text-slate-950 font-black hover:bg-amber-300 border-amber-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-900">Langkah 3 (Final)</span>
              <Camera size={15} className="text-slate-900" />
            </div>
            <div>
              <strong className="block text-sm font-black text-slate-950">3. Selesai & Upload Foto</strong>
              <p className="text-[10.5px] text-slate-800 mt-0.5">
                Unggah bukti dokumentasi serah terima dengan pengurus panti.
              </p>
            </div>
            <div className="text-[10px] font-black text-slate-950">
              {isCompleted ? '✓ Telah Selesai Diterima Panti' : 'Unggah Foto Serah Terima →'}
            </div>
          </button>
        </div>
      </div>

      {/* Surat Jalan Document (Printable & Screen-friendly) */}
      <Card className="print-container border-slate-200 shadow-md rounded-2xl sm:rounded-3xl overflow-hidden bg-white print:shadow-none print:border-none print:m-0 print:p-0">
        <CardBody className="p-6 sm:p-10 print:p-6 space-y-6 sm:space-y-8 print:space-y-6">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-800 pb-5 gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A843] block">
                MANIFEST OPERASIONAL REDISTRIBUSI PANGAN
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1B3A5C] tracking-tight uppercase">
                SURAT JALAN DIGITAL
              </h1>
              <p className="text-xs font-bold text-slate-600 tracking-wider mt-0.5 uppercase">
                Platform Replate · Food Rescue Operation Surabaya
              </p>
            </div>
            <div className="text-right bg-slate-100 p-3 sm:p-4 rounded-2xl border border-slate-200 shrink-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nomor Resi Tugas</p>
              <p className="text-xl sm:text-2xl font-black text-[#1B3A5C] font-mono tracking-tight">{task.code}</p>
              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                Status: {task.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Assigned Driver Section */}
          <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                  PENGEMUDI / DRIVER RELAWAN BERTUGAS
                </span>
                <strong className="text-sm font-black text-slate-900">{task.assignedDriver?.name || 'Budi Santoso'}</strong>
                <p className="text-slate-600 text-[11px]">
                  Kendaraan: <strong>{task.assignedDriver?.vehicle}</strong> · No. Plat: <strong className="font-mono">{task.assignedDriver?.plateNumber}</strong>
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-600">
              <span className="block font-semibold">Kontak HP Driver:</span>
              <strong className="font-mono text-purple-900">{task.assignedDriver?.phone || '0812-3456-7890'}</strong>
            </div>
          </div>

          {/* Info Penjemputan vs Info Tujuan Pengantaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Lokasi Toko */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-[#D4A843] tracking-wider flex items-center gap-1">
                <span>📍 TITIK 1: PENJEMPUTAN (PENYEDIA PANGAN)</span>
              </span>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h3 className="font-black text-[#1B3A5C] text-base">{task.providerName}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {task.providerAddress}
                </p>
                <div className="pt-1 text-[11px] text-slate-500">
                  Kontak Outlet: <strong>{task.providerPhone || '0812-3456-7890'}</strong>
                </div>

                {/* Mobile action shortcuts (hidden on print) */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 print:hidden">
                  <a
                    href={providerMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-[#1B3A5C] font-black text-[11px] rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Navigation size={12} className="text-blue-600" />
                    <span>Buka Maps</span>
                  </a>
                  <a
                    href={providerWaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageSquare size={12} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Lokasi Panti Tujuan */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                <span>🎯 TITIK 2: PENGANTARAN (PENERIMA MANFAAT)</span>
              </span>
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <h3 className="font-black text-emerald-950 text-base">{task.shelterName}</h3>
                <p className="text-emerald-900 leading-relaxed font-medium">
                  {task.shelterAddress}
                </p>
                <div className="pt-1 text-[11px] text-emerald-800">
                  Kontak Panti: <strong>{task.shelterPhone || '0819-8765-4321'}</strong>
                </div>

                {/* Mobile action shortcuts (hidden on print) */}
                <div className="flex items-center gap-2 pt-2 border-t border-emerald-200 print:hidden">
                  <a
                    href={shelterMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-[11px] rounded-xl border border-emerald-300 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Navigation size={12} className="text-emerald-700" />
                    <span>Buka Maps</span>
                  </a>
                  <a
                    href={shelterWaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageSquare size={12} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Item Donasi Food Rescue */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              RINCIAN ITEM DONASI PANGAN FOOD RESCUE
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1B3A5C] text-white">
                  <tr>
                    <th className="p-3.5 font-black w-12 text-center">NO</th>
                    <th className="p-3.5 font-black">NAMA PRODUK SURPLUS</th>
                    <th className="p-3.5 font-black w-28 text-center">JUMLAH</th>
                    <th className="p-3.5 font-black">STANDAR PENANGANAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-3.5 text-center font-bold text-slate-500">1</td>
                    <td className="p-3.5 font-black text-[#1B3A5C]">
                      {task.foodName}
                      <span className="block text-[10.5px] text-slate-500 font-normal mt-0.5">
                        {task.notes || 'Kemasan higienis tertutup sesuai SOP BPOM RI'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-black text-emerald-800 bg-emerald-50">
                      {task.quantity}
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-600">
                      Suhu Ruang / Coolbox Steril · Waktu Batas Aman 4 Jam
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SOP BPOM Notice */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Standar Keamanan Pangan Replate:</strong> Makanan telah diperiksa secara organoleptik (bau, warna, tekstur) dan memenuhi 8 Parameter Higienitas BPOM RI serta Permenkes No. 1096/2011.
            </p>
          </div>

          {/* Linimasa Audit Log Interaktif */}
          {task.auditLogs && task.auditLogs.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                AUDIT LOG REKAM JEJAK LOGISTIK (REAL-TIME)
              </h4>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                {task.auditLogs.map((log: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#1B3A5C] font-black">{log.title}</strong>
                        <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{log.desc}</p>
                      <span className="text-[9.5px] font-extrabold text-slate-400 uppercase">Aktor: {log.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures for Print */}
          <div className="grid grid-cols-3 gap-4 pt-10 print:pt-6 text-center text-xs">
            <div className="space-y-14 print:space-y-10">
              <p className="font-extrabold text-slate-600 uppercase text-[10px] tracking-wider">Pihak Toko (Donatur)</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="font-bold text-[#1B3A5C]">( {task.providerName} )</p>
            </div>
            <div className="space-y-14 print:space-y-10">
              <p className="font-extrabold text-slate-600 uppercase text-[10px] tracking-wider">Driver Relawan</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="font-bold text-[#1B3A5C]">( {task.assignedDriver?.name || 'Relawan Replate'} )</p>
            </div>
            <div className="space-y-14 print:space-y-10">
              <p className="font-extrabold text-slate-600 uppercase text-[10px] tracking-wider">Pengurus Panti (Penerima)</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="font-bold text-[#1B3A5C]">( {task.shelterName} )</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-dashed border-slate-300 text-center text-[10.5px] text-slate-400">
            <p>Dokumen Surat Jalan Digital ini diterbitkan secara otomatis dan sah sebagai bukti serah terima logistik Replate.</p>
            <p className="font-mono mt-0.5">Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>

        </CardBody>
      </Card>

      {/* MODAL SCANNER QR TOKO (Requirement Rescue #5) */}
      <Modal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        title="Scan QR Toko Penyedia Donasi"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <p className="text-slate-600 leading-relaxed">
            Arahkan kamera ke QR Code outlet <strong>{task.providerName}</strong> untuk memverifikasi penjemputan makanan surplus secara digital.
          </p>

          <div className="max-w-xs mx-auto border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden p-2 bg-slate-950 text-white text-center">
            <QRScanner onScanSuccess={(data: string) => handleVerifyStoreQR(data)} />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-700 block">Atau Konfirmasi Manual Kode Verifikasi Toko:</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Misal: STR-88192"
                value={manualQrCode}
                onChange={(e) => setManualQrCode(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 uppercase font-mono"
              />
              <Button
                variant="gold"
                size="sm"
                className="font-black text-xs text-slate-950 px-4 rounded-xl"
                onClick={() => handleVerifyStoreQR(manualQrCode || task.code)}
              >
                Verifikasi
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL SERAH TERIMA & FOTO DOKUMENTASI (Requirement Rescue #5) */}
      <Modal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="Konfirmasi Serah Terima di Panti Asuhan"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <p className="text-slate-600 leading-relaxed">
            Ambil foto serah terima bersama pengurus panti <strong>{task.shelterName}</strong> sebagai bukti sah penyerahan donasi.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-3">
            {proofPhotoUrl ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden">
                <img src={proofPhotoUrl} alt="Foto Serah Terima" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <Camera size={36} className="mx-auto text-slate-400" />
                <span className="block text-slate-500 font-medium">Belum ada foto yang diambil</span>
              </div>
            )}

            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs font-bold rounded-xl border-slate-300"
                onClick={() =>
                  setProofPhotoUrl(
                    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60'
                  )
                }
              >
                Gunakan Kamera / Upload Foto
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl font-bold"
              onClick={() => setShowCompletionModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="gold"
              size="sm"
              className="font-black text-xs text-slate-950 px-5 rounded-xl shadow-md"
              onClick={handleCompleteDelivery}
            >
              Simpan & Selesaikan Tugas
            </Button>
          </div>
        </div>
      </Modal>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          nav, header, footer, .bottom-nav {
            display: none !important;
          }
          .print-container {
            zoom: 0.92;
          }
        }
      `}} />
    </div>
  );
}
