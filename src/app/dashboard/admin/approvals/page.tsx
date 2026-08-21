'use client';

import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function AdminApprovalsPage() {
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

  const [inspectModal, setInspectModal] = useState<{ isOpen: boolean; user: (typeof pendingUsers)[0] | null }>({
    isOpen: false,
    user: null,
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Antrean Persetujuan Akun Mitra (Approvals Queue)</h2>
        <p className="text-xs text-slate-500 font-medium">
          Verifikasi administrasi khusus untuk mitra <strong>Food Provider</strong> & <strong>Rescue Partner</strong>. (Akun Konsumen di-approve otomatis).
        </p>
      </div>

      {/* Info Banner Khusus Kebijakan Approvals */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <div className="text-lg">ℹ️</div>
        <div className="space-y-1">
          <span className="font-extrabold block">Aturan Verifikasi Administrasi Mitra Replate:</span>
          <p className="text-blue-800 leading-relaxed font-medium">
            Hanya pendaftar bertipe <strong>Food Provider</strong> (Restoran/Hotel/Toko) dan <strong>Rescue Partner</strong> (Panti Asuhan/Food Bank) yang memerlukan verifikasi NIB & SOP BPOM. Jika dokumen masih diragukan, klik <strong>"Hold & Jadwalkan Survei"</strong> untuk mengirim tim inspeksi ke lokasi.
          </p>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[#1B3A5C]">Semua Permohonan Telah Diproses</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Tidak ada permohonan pendaftaran akun mitra yang pending saat ini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
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
                        {u.role}
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
        </div>
      )}

      {/* Modal Inspeksi Berkas Administrasi Detail */}
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

          {/* Foto Fasilitas Dapur / Bangunan */}
          <div className="space-y-2">
            <span className="font-extrabold text-[#1B3A5C] block">Dokumentasi Foto Dapur Produksi / Fasilitas Usaha:</span>
            <div className="relative h-44 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-300">
              <img
                src={inspectModal.user?.facilityPhoto || ''}
                alt="Fasilitas Produksi"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2.5 py-1 rounded-md font-mono">
                LAMPIRAN DOKUMEN FISIK SANITASI
              </span>
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
          <p className="text-slate-600 leading-relaxed font-medium">
            Masukkan alasan penolakan administrasi yang akan dikirimkan secara otomatis via email kepada pendaftar:
          </p>

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
