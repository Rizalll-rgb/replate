'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'MITRA' | 'CONSUMER_BENEFICIARY' | 'PROVIDER_FLEET'>('MITRA');

  const defaultFleetQueue = [
    {
      id: 'flt-1',
      providerName: 'Warung Bakso Pak Kumis',
      driverName: 'Mas Doni (Driver Toko Pak Kumis)',
      driverPhone: '0812-3456-7891',
      vehicleType: 'Sepeda Motor Box Cooler (Steril)',
      plateNumber: 'L 4582 ABC',
      ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
      stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      status: 'PENDING_VERIFICATION',
      submittedAt: 'Hari ini 13:00 WIB',
    },
  ];

  const [fleetQueue, setFleetQueue] = useState<any[]>(defaultFleetQueue);
  const [inspectFleetModal, setInspectFleetModal] = useState<{ isOpen: boolean; fleet: any | null }>({
    isOpen: false,
    fleet: null,
  });

  const [pendingUsers, setPendingUsers] = useState([
    {
      id: 'p1',
      name: 'Catering Bu Ida Surabaya',
      email: 'catering.bu.ida@replate.id',
      role: 'PROVIDER',
      org: 'Catering Bu Ida (Surabaya)',
      phone: '081298761234',
      address: 'Jl. Rungkut Industri No. 18, Surabaya',
      nib: 'NIB-91208849102',
      facilityPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      sanitationChecked: true,
      status: 'PENDING',
    },
    {
      id: 'p2',
      name: 'Dapur Umum Gotong Royong',
      email: 'dapur.gotong@replate.id',
      role: 'RESCUE_PARTNER',
      org: 'Dapur Umum Gotong Royong',
      phone: '085611223344',
      address: 'Jl. Wonokromo No. 5, Surabaya',
      nib: 'SK-YYS-8891024',
      facilityPhoto: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60',
      sanitationChecked: true,
      status: 'HOLD_SURVEY',
    },
    {
      id: 'p3',
      name: 'Hotel Majapahit Banquet',
      email: 'banquet.majapahit@replate.id',
      role: 'PROVIDER',
      org: 'PT Hotel Majapahit Tbk',
      phone: '081133445566',
      address: 'Jl. Tunjungan No. 65, Surabaya',
      nib: 'NIB-1100998877',
      facilityPhoto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      sanitationChecked: true,
      status: 'PENDING',
    },
  ]);

  const defaultConsumerQueue = [
    {
      id: 'c1',
      name: 'Budi Santoso (Konsumen)',
      email: 'budi.santoso@gmail.com',
      phone: '0813-4567-8901',
      proofType: 'SKTM (Kelurahan Gubeng)',
      proofNumber: 'SKTM/SBY-GBG/2024/8812',
      proofPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      submittedAt: 'Hari ini 11:20 WIB',
      status: 'PENDING',
    },
    {
      id: 'c2',
      name: 'Ibu Ratna (Warga Rentan)',
      email: 'ratna.krembangan@gmail.com',
      phone: '0819-0123-4567',
      proofType: 'Kartu Indonesia Sehat (KIS PBI)',
      proofNumber: 'KIS-3578019920192',
      proofPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
      submittedAt: 'Kemarin 16:45 WIB',
      status: 'PENDING',
    },
  ];

  const [consumerQueue, setConsumerQueue] = useState<any[]>(defaultConsumerQueue);

  // Sync consumer verification queue from localStorage
  useEffect(() => {
    try {
      const savedQueueStr = localStorage.getItem('replate_admin_consumer_queue');
      if (savedQueueStr) {
        const savedQueue = JSON.parse(savedQueueStr);
        if (Array.isArray(savedQueue) && savedQueue.length > 0) {
          const map = new Map();
          [...savedQueue, ...defaultConsumerQueue].forEach((item) => map.set(item.id, item));
          setConsumerQueue(Array.from(map.values()));
        }
      }
    } catch (_) {}
  }, []);

  const [inspectModal, setInspectModal] = useState<{ isOpen: boolean; user: (typeof pendingUsers)[0] | null }>({
    isOpen: false,
    user: null,
  });

  const [inspectConsumerModal, setInspectConsumerModal] = useState<{ isOpen: boolean; consumer: any | null }>({
    isOpen: false,
    consumer: null,
  });

  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; userId: string; reason: string }>({
    isOpen: false,
    userId: '',
    reason: '',
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'HOLD_SURVEY') => {
    if (action === 'HOLD_SURVEY') {
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'HOLD_SURVEY' } : u))
      );
      setToastState({
        isOpen: true,
        message: 'Status akun ditunda (HOLD) & tim survei lapangan Replate dijadwalkan ke lokasi!',
        type: 'success',
      });
      setInspectModal({ isOpen: false, user: null });
      return;
    }

    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action }),
      });
      const result = await res.json();
      if (result.success) {
        setPendingUsers(pendingUsers.filter((u) => u.id !== id));
        setToastState({
          isOpen: true,
          message: result.message || `Akun pendaftar berhasil ${action === 'APPROVE' ? 'disetujui' : 'ditolak'}!`,
          type: action === 'APPROVE' ? 'success' : 'error',
        });
        setInspectModal({ isOpen: false, user: null });
        setRejectModal({ isOpen: false, userId: '', reason: '' });
      } else {
        setToastState({
          isOpen: true,
          message: result.error || 'Gagal memproses persetujuan.',
          type: 'error',
        });
      }
    } catch {
      setToastState({
        isOpen: true,
        message: 'Terjadi kesalahan koneksi.',
        type: 'error',
      });
    }
  };

  const handleConsumerApprove = (id: string) => {
    setConsumerQueue((prev) => prev.filter((c) => c.id !== id));
    try {
      localStorage.setItem('replate_consumer_verification_status', 'BENEFICIARY_VERIFIED');
    } catch (_) {}
    setInspectConsumerModal({ isOpen: false, consumer: null });
    setToastState({
      isOpen: true,
      message: '✅ Berhasil! Akun Konsumen disetujui sebagai Penerima Bantuan Terverifikasi Dinsos (Donasi Rp 0 Aktif).',
      type: 'success',
    });
  };

  const handleConsumerReject = (id: string) => {
    setConsumerQueue((prev) => prev.filter((c) => c.id !== id));
    try {
      localStorage.setItem('replate_consumer_verification_status', 'REGULAR_SAVER');
    } catch (_) {}
    setInspectConsumerModal({ isOpen: false, consumer: null });
    setToastState({
      isOpen: true,
      message: '❌ Permohonan verifikasi rentan ditolak. Akun dikembalikan ke Konsumen Biasa (Rescue Sale).',
      type: 'error',
    });
  };

  const formatRoleLabel = (r?: string) => {
    if (!r) return '-';
    const upper = r.toUpperCase();
    if (upper === 'PROVIDER' || upper === 'FOOD_PROVIDER') return 'Food Provider';
    if (upper === 'BENEFICIARY' || upper === 'FOOD_BENEFICIARY' || upper === 'YAYASAN') return 'Food Beneficiary';
    if (upper === 'RESCUE_PARTNER' || upper === 'VOLUNTEER' || upper === 'RESCUE_VOLUNTEER') return 'Rescue Volunteer';
    if (upper === 'CONSUMER' || upper === 'FOOD_CONSUMER') return 'Food Consumer';
    if (upper === 'ADMIN' || upper === 'SUPER_ADMIN') return 'SuperAdmin';
    return r.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Persetujuan Verifikasi & Kredensial (Approvals Hub)</h2>
        <p className="text-xs text-slate-500 font-medium">
          Kelola persetujuan legalitas mitra <strong>Food Provider</strong>, <strong>Rescue Partner</strong>, serta verifikasi <strong>Konsumen Rentan (Donasi Rp 0)</strong>.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold flex-wrap">
        <button
          onClick={() => setActiveTab('MITRA')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'MITRA'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏢 Persetujuan Akun Mitra Provider & Rescue ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('CONSUMER_BENEFICIARY')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'CONSUMER_BENEFICIARY'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🤝 Verifikasi Konsumen Rentan SKTM ({consumerQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('PROVIDER_FLEET')}
          className={`px-4 py-2.5 rounded-t-xl transition-all ${
            activeTab === 'PROVIDER_FLEET'
              ? 'bg-[#1B3A5C] text-white font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🚚 Verifikasi Armada Toko (No. Pol, KTP, SIM & STNK) ({fleetQueue.length})
        </button>
      </div>

      {activeTab === 'MITRA' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
            <div className="text-lg">ℹ️</div>
            <div className="space-y-1">
              <span className="font-extrabold block">Aturan Verifikasi Administrasi Mitra Replate:</span>
              <p className="text-blue-800 leading-relaxed font-medium">
                Mitra bertipe <strong>Food Provider</strong> (Restoran/Hotel) dan <strong>Rescue Partner</strong> (Panti Asuhan/Food Bank) memerlukan verifikasi NIB & SOP BPOM.
              </p>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
              <h3 className="text-base font-extrabold text-[#1B3A5C]">Semua Permohonan Mitra Telah Diproses</h3>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <Table className="min-w-[850px]">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-extrabold text-[#1B3A5C]">Pendaftar & Organisasi</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C]">Kontak Email & HP</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C]">Peran (Role)</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C]">Status Verifikasi</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C] text-right">Inspeksi & Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-800">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[#1B3A5C] block">{u.name}</span>
                          <span className="text-[11px] text-slate-500 font-normal">{u.org}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">
                        <div>
                          <span>{u.email}</span>
                          <span className="text-[11px] text-slate-400 block">{u.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'PROVIDER' ? 'gold' : 'primary'} size="sm">
                          {formatRoleLabel(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.status === 'HOLD_SURVEY' ? (
                          <Badge variant="warning" size="sm">
                            ⏳ HOLD (SURVEI LAPANGAN)
                          </Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">
                            MENUNGGU INSPEKSI
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold border-slate-300"
                            onClick={() => setInspectModal({ isOpen: true, user: u })}
                          >
                            👁️ Inspeksi
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200"
                            onClick={() => handleAction(u.id, 'HOLD_SURVEY')}
                          >
                            🔍 Hold & Survei
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-xs font-bold"
                            onClick={() => setRejectModal({ isOpen: true, userId: u.id, reason: '' })}
                          >
                            Tolak
                          </Button>
                          <Button
                            variant="gold"
                            size="sm"
                            className="text-xs font-extrabold"
                            onClick={() => handleAction(u.id, 'APPROVE')}
                          >
                            Setujui ✔️
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'CONSUMER_BENEFICIARY' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
            <div className="text-lg">🤝</div>
            <div className="space-y-1">
              <span className="font-extrabold block">Aturan Verifikasi Konsumen Rentan (Bantuan Donasi Rp 0):</span>
              <p className="text-emerald-800 leading-relaxed font-medium">
                Tinjau kelayakan berkas SKTM Kelurahan / Kartu KIS PBI / KKS Bansos pemohon. Setelah disetujui, akun konsumen mendapatkan hak akses klaim makanan donasi <strong>GRATIS 100% (Rp 0)</strong> dengan batasan kuota harian NIK.
              </p>
            </div>
          </div>

          {consumerQueue.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
              <h3 className="text-base font-extrabold text-[#1B3A5C]">Semua Permohonan Verifikasi Rentan Telah Diproses</h3>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <Table className="min-w-[850px]">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-extrabold text-[#1B3A5C]">Nama Konsumen Pemohon</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C]">Jenis & Nomor Dokumen Proof</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C]">Waktu Pengajuan</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C] text-right">Verifikasi Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumerQueue.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-800">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[#1B3A5C] block">{c.name}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{c.phone} • {c.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        <div className="space-y-0.5">
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                            {c.proofType}
                          </span>
                          <span className="font-mono font-bold text-slate-900 block mt-1">{c.proofNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">{c.submittedAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold border-slate-300"
                            onClick={() => setInspectConsumerModal({ isOpen: true, consumer: c })}
                          >
                            👁️ Periksa Berkas
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-xs font-bold"
                            onClick={() => handleConsumerReject(c.id)}
                          >
                            Tolak
                          </Button>
                          <Button
                            variant="gold"
                            size="sm"
                            className="text-xs font-black text-slate-950"
                            onClick={() => handleConsumerApprove(c.id)}
                          >
                            Setujui Rentan (Rp 0) ✔️
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'PROVIDER_FLEET' && (
        /* Tab Provider Fleet Verification (No. Polisi, KTP, SIM & STNK) */
        <div className="space-y-4">
          <div className="bg-[#1B3A5C] text-white p-4 rounded-2xl flex items-start gap-3 text-xs border border-slate-700 shadow-md">
            <div className="text-lg">🚚</div>
            <div className="space-y-1">
              <span className="font-extrabold text-[#D4A843] block">Aturan Verifikasi Armada Toko Mandiri (Direct Fleet):</span>
              <p className="text-slate-200 leading-relaxed font-medium">
                Inspeksi kesesuaian <strong>Nomor Polisi (No. Plat) Kendaraan</strong>, <strong>Foto KTP Driver</strong>, <strong>Foto SIM Driver (SIM A/C)</strong>, dan <strong>Foto STNK Resm</strong>i. Setelah disetujui, outlet berhak mengantarkan surplus secara mandiri ke panti/shelter.
              </p>
            </div>
          </div>

          {fleetQueue.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
              <h3 className="text-base font-extrabold text-[#1B3A5C]">Semua Permohonan Armada Toko Telah Diproses</h3>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <Table className="min-w-[850px]">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-extrabold text-[#1B3A5C]">Outlet Toko & Driver</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C]">Jenis Kendaraan & No. Polisi (Plat)</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C]">Status Kredensial</TableHead>
                    <TableHead className="font-extrabold text-[#1B3A5C] text-right">Verifikasi & Inspeksi Berkas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetQueue.map((flt) => (
                    <TableRow key={flt.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-800">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[#1B3A5C] block">{flt.providerName}</span>
                          <span className="text-[11px] text-slate-600 block font-semibold">{flt.driverName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{flt.driverPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">{flt.vehicleType}</span>
                          <span className="font-mono font-black text-[#1B3A5C] text-xs bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md inline-block">
                            🚘 {flt.plateNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="warning" size="sm">
                          KTP, SIM & STNK READY
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold border-slate-300"
                            onClick={() => setInspectFleetModal({ isOpen: true, fleet: flt })}
                          >
                            👁️ Inspeksi KTP, SIM & STNK
                          </Button>
                          <Button
                            variant="gold"
                            size="sm"
                            className="text-xs font-black text-slate-950 shadow-xs"
                            onClick={() => {
                              setFleetQueue(fleetQueue.filter((item) => item.id !== flt.id));
                              setToastState({
                                isOpen: true,
                                message: `✅ Armada Toko (${flt.plateNumber}) Berhasil Disetujui & Diberi Lisensi Direct Delivery!`,
                                type: 'success',
                              });
                            }}
                          >
                            Setujui Armada Toko ✔️
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Modal Inspect Provider Fleet Credentials (KTP, SIM, STNK & No. Pol) */}
      {inspectFleetModal.isOpen && inspectFleetModal.fleet && (
        <Modal
          isOpen={inspectFleetModal.isOpen}
          onClose={() => setInspectFleetModal({ isOpen: false, fleet: null })}
          title={`Inspeksi Berkas Armada Toko: ${inspectFleetModal.fleet.providerName}`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Outlet Provider:</span>
                <span className="font-extrabold text-[#1B3A5C] text-sm">{inspectFleetModal.fleet.providerName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nama & Kontak Driver:</span>
                <span className="font-bold text-slate-900">{inspectFleetModal.fleet.driverName} ({inspectFleetModal.fleet.driverPhone})</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Jenis Armada Kendaraan:</span>
                <span className="font-bold text-slate-800">{inspectFleetModal.fleet.vehicleType}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nomor Polisi (No. Plat STNK):</span>
                <span className="font-mono font-black text-amber-900 text-sm bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                  {inspectFleetModal.fleet.plateNumber}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-[#1B3A5C] block">
                Dokumentasi 5 Berkas Legalitas & Foto Fisik Armada Toko:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="font-extrabold text-slate-800 block text-[10px]">👤 Pasfoto Driver</span>
                  <img
                    src={inspectFleetModal.fleet.driverPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'}
                    alt="Driver"
                    className="w-full h-28 object-cover rounded-lg border"
                  />
                </div>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="font-extrabold text-slate-800 block text-[10px]">🚚 Foto Fisik Armada</span>
                  <img
                    src={inspectFleetModal.fleet.vehiclePhoto || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60'}
                    alt="Armada Kendaraan"
                    className="w-full h-28 object-cover rounded-lg border"
                  />
                </div>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="font-extrabold text-slate-800 block text-[10px]">🪪 Foto KTP Driver</span>
                  <img src={inspectFleetModal.fleet.ktpPhoto} alt="KTP" className="w-full h-28 object-cover rounded-lg border" />
                </div>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="font-extrabold text-slate-800 block text-[10px]">💳 Foto SIM C/A Driver</span>
                  <img src={inspectFleetModal.fleet.simPhoto} alt="SIM" className="w-full h-28 object-cover rounded-lg border" />
                </div>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="font-extrabold text-slate-800 block text-[10px]">📄 STNK ({inspectFleetModal.fleet.plateNumber})</span>
                  <img src={inspectFleetModal.fleet.stnkPhoto} alt="STNK" className="w-full h-28 object-cover rounded-lg border" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setInspectFleetModal({ isOpen: false, fleet: null })}>
                Tutup Inspeksi
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-black text-slate-950"
                onClick={() => {
                  setFleetQueue(fleetQueue.filter((item) => item.id !== inspectFleetModal.fleet.id));
                  setInspectFleetModal({ isOpen: false, fleet: null });
                  setToastState({
                    isOpen: true,
                    message: `✅ Armada Toko (${inspectFleetModal.fleet.plateNumber}) Berhasil Disetujui & Diberi Lisensi Direct Delivery!`,
                    type: 'success',
                  });
                }}
              >
                Setujui Armada Toko & Terbitkan Lisensi ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Inspect Consumer Proof Document */}
      {inspectConsumerModal.isOpen && inspectConsumerModal.consumer && (
        <Modal
          isOpen={inspectConsumerModal.isOpen}
          onClose={() => setInspectConsumerModal({ isOpen: false, consumer: null })}
          title={`Inspeksi Dokumen Verifikasi Rentan: ${inspectConsumerModal.consumer.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">Pemohon:</span>
                <span className="font-extrabold text-[#1B3A5C] text-sm">{inspectConsumerModal.consumer.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Jenis Dokumen:</span>
                <span className="font-bold text-emerald-800">{inspectConsumerModal.consumer.proofType}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nomor KIS / SKTM:</span>
                <span className="font-mono font-bold text-slate-900">{inspectConsumerModal.consumer.proofNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">No. HP / WA:</span>
                <span className="font-bold text-slate-800">{inspectConsumerModal.consumer.phone}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-extrabold text-[#1B3A5C] block">Lampiran Foto SKTM / Kartu Bansos Pemohon:</span>
              <img
                src={inspectConsumerModal.consumer.proofPhoto}
                alt="Foto SKTM"
                className="w-full h-48 object-cover rounded-xl border border-slate-300 shadow-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setInspectConsumerModal({ isOpen: false, consumer: null })}>
                Tutup Modal
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleConsumerReject(inspectConsumerModal.consumer.id)}>
                Tolak Verifikasi
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-black text-slate-950"
                onClick={() => handleConsumerApprove(inspectConsumerModal.consumer.id)}
              >
                Setujui & Aktifkan Donasi Rp 0 ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Inspeksi Berkas Mitra */}
      <Modal
        isOpen={inspectModal.isOpen}
        onClose={() => setInspectModal({ isOpen: false, user: null })}
        title={`Inspeksi Dokumen Legalitas: ${inspectModal.user?.name || ''}`}
        size="lg"
      >
        <div className="space-y-5 text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 font-semibold block">Nama Pemohon:</span>
                <span className="font-extrabold text-[#1B3A5C] text-sm">{inspectModal.user?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Organisasi / Badan Usaha:</span>
                <span className="font-bold text-slate-900">{inspectModal.user?.org}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nomor NIB / Izin Operasional:</span>
                <span className="font-mono font-bold text-slate-800">{inspectModal.user?.nib}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-500 font-semibold block">Email Login:</span>
                <span className="font-bold text-slate-800">{inspectModal.user?.email}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">No. HP Penanggung Jawab:</span>
                <span className="font-bold text-slate-800">{inspectModal.user?.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Alamat Fasilitas Produksi:</span>
                <span className="font-bold text-slate-800 leading-tight block">{inspectModal.user?.address}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-extrabold text-[#1B3A5C] block">Dokumentasi Foto Dapur Produksi / Fasilitas Usaha:</span>
            <div className="relative h-44 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-300">
              <img
                src={inspectModal.user?.facilityPhoto || ''}
                alt="Fasilitas Produksi"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center pt-3 border-t border-slate-200 gap-2">
            <Button variant="outline" size="sm" onClick={() => setInspectModal({ isOpen: false, user: null })}>
              Tutup Modal
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-amber-100 text-amber-900 font-bold"
                onClick={() => inspectModal.user && handleAction(inspectModal.user.id, 'HOLD_SURVEY')}
              >
                🔍 Hold & Jadwalkan Survei Lapangan
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const uid = inspectModal.user?.id || '';
                  setInspectModal({ isOpen: false, user: null });
                  setRejectModal({ isOpen: true, userId: uid, reason: '' });
                }}
              >
                Tolak Permohonan
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-extrabold"
                onClick={() => inspectModal.user && handleAction(inspectModal.user.id, 'APPROVE')}
              >
                Setujui & Aktifkan Akun ➔
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Input Alasan Penolakan */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, userId: '', reason: '' })}
        title="Alasan Penolakan Permohonan Akun"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <Input
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            placeholder="Contoh: Dokumen NIB kurang jelas / Foto fasilitas belum melampirkan izin sanitasi BPOM"
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModal({ isOpen: false, userId: '', reason: '' })}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="font-bold"
              onClick={() => handleAction(rejectModal.userId, 'REJECT')}
            >
              Kirim Penolakan ➔
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
