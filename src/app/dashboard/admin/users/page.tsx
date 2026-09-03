'use client';

import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

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

  const [usersList, setUsersList] = useState([
    {
      id: '1',
      name: 'Warung Bakso Pak Kumis',
      email: 'bakso.pak.kumis@replate.id',
      role: 'PROVIDER',
      status: 'APPROVED',
      org: 'Warung Bakso Pak Kumis',
      phone: '081234567891',
      address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
      nib: 'NIB-9120481023912',
      joinedAt: '2026-08-10',
      lat: -7.2575,
      lng: 112.7521,
      photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: '2',
      name: 'Roti Boy Surabaya',
      email: 'rotiboy.sby@replate.id',
      role: 'PROVIDER',
      status: 'APPROVED',
      org: 'PT Roti Boy Utama',
      phone: '081398765432',
      address: 'Stasiun Gubeng Baru, Surabaya',
      nib: 'NIB-8812903102',
      joinedAt: '2026-08-11',
      lat: -7.2654,
      lng: 112.7512,
      photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: '3',
      name: 'Food Bank Surabaya',
      email: 'foodbank.surabaya@replate.id',
      role: 'RESCUE_PARTNER',
      status: 'APPROVED',
      org: 'Yayasan Food Bank Surabaya',
      phone: '081122334455',
      address: 'Jl. Pemuda No. 12, Surabaya',
      nib: 'YYS-00192841',
      joinedAt: '2026-08-05',
      lat: -7.2621,
      lng: 112.7489,
      photo: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: '4',
      name: 'Panti Asuhan Kasih Ibu',
      email: 'panti.kasih.ibu@replate.id',
      role: 'RESCUE_PARTNER',
      status: 'APPROVED',
      org: 'Panti Asuhan Kasih Ibu',
      phone: '085678901234',
      address: 'Jl. Raya Darmo No. 88, Surabaya',
      nib: 'YYS-00284910',
      joinedAt: '2026-08-08',
      lat: -7.2891,
      lng: 112.7392,
      photo: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: '5',
      name: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      role: 'CONSUMER',
      status: 'APPROVED',
      org: 'Konsumen Perorangan',
      phone: '081299887766',
      address: 'Gubeng Kertajaya, Surabaya',
      nib: '-',
      joinedAt: '2026-08-15',
      lat: -7.2711,
      lng: 112.7599,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resetModal, setResetModal] = useState<{ isOpen: boolean; user: any | null }>({
    isOpen: false,
    user: null,
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Form New User
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'PROVIDER',
    org: '',
    phone: '',
    address: '',
  });

  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.org.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED' } : u
      )
    );
    setToastState({
      isOpen: true,
      message: 'Status akun pengguna berhasil diperbarui!',
      type: 'success',
    });
  };

  const executeResetPassword = () => {
    if (!resetModal.user) return;
    const targetEmail = resetModal.user.email;
    setResetModal({ isOpen: false, user: null });
    setToastState({
      isOpen: true,
      message: `Password untuk ${targetEmail} berhasil di-reset ke default 'password123'. Email instruksi telah dikirim!`,
      type: 'success',
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const created = {
      id: String(Date.now()),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'APPROVED',
      org: newUser.org || newUser.name,
      phone: newUser.phone || '081200000000',
      address: newUser.address || 'Surabaya',
      nib: 'NIB-GEN-' + Math.floor(Math.random() * 900000),
      joinedAt: new Date().toISOString().split('T')[0],
      lat: -7.2575,
      lng: 112.7521,
      photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    };

    setUsersList((prev) => [created, ...prev]);
    setIsCreateOpen(false);
    setNewUser({ name: '', email: '', role: 'PROVIDER', org: '', phone: '', address: '' });
    setToastState({
      isOpen: true,
      message: `Akun baru ${created.name} berhasil didaftarkan oleh Admin!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1B3A5C]">Manajemen & Direktori Pengguna</h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola hak akses, status verifikasi, titik GPS lokasi, dan kredensial mitra Food Provider, Rescue Partner, serta Konsumen.
          </p>
        </div>
        <Button variant="gold" size="md" className="font-extrabold flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Akun Baru</span>
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cari nama, email, atau organisasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
          >
            <option value="ALL">Semua Peran (All Roles)</option>
            <option value="PROVIDER">Food Provider</option>
            <option value="RESCUE_PARTNER">Rescue Partner</option>
            <option value="CONSUMER">Konsumen</option>
          </select>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[750px]">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-extrabold text-[#1B3A5C]">Nama & Organisasi</TableHead>
                <TableHead className="font-extrabold text-[#1B3A5C]">Kontak Email</TableHead>
                <TableHead className="font-extrabold text-[#1B3A5C]">Peran (Role)</TableHead>
                <TableHead className="font-extrabold text-[#1B3A5C]">Status Akun</TableHead>
                <TableHead className="font-extrabold text-[#1B3A5C] text-right">Aksi Manajemen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-bold text-slate-800">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[#1B3A5C] block">{u.name}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{u.org}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'PROVIDER' ? 'gold' : u.role === 'RESCUE_PARTNER' ? 'primary' : 'secondary'} size="sm">
                      {formatRoleLabel(u.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'APPROVED' ? 'success' : 'warning'} size="sm">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsDetailOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#1B3A5C] text-xs font-bold rounded-lg transition-colors"
                      >
                        Detail & Maps
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                          u.status === 'APPROVED'
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'APPROVED' ? 'Suspend' : 'Aktifkan'}
                      </button>
                      <button
                        onClick={() => setResetModal({ isOpen: true, user: u })}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors"
                      >
                        Reset PW
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Detail User Complete with Photo & Interactive GPS Maps Link */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Detail Akun & Geografis: ${selectedUser?.name || ''}`}
        size="lg"
      >
        <div className="space-y-5 text-xs text-slate-700">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Foto Profil / Fasilitas Mitra */}
            <div className="relative h-28 w-28 rounded-xl overflow-hidden border border-slate-300 shrink-0">
              <img
                src={selectedUser?.photo}
                alt={selectedUser?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5 min-w-0 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-[#1B3A5C] text-base">{selectedUser?.name}</span>
                <Badge variant={selectedUser?.role === 'PROVIDER' ? 'gold' : 'primary'} size="sm">
                  {formatRoleLabel(selectedUser?.role)}
                </Badge>
              </div>
              <p className="text-slate-500 font-medium">{selectedUser?.org}</p>
              <p className="text-slate-600">Email: <strong className="text-slate-900">{selectedUser?.email}</strong></p>
              <p className="text-slate-600">Telepon: <strong className="text-slate-900">{selectedUser?.phone}</strong></p>
            </div>
          </div>

          {/* Visual Maps Coordinates & Address */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
            <span className="font-extrabold text-[#1B3A5C] text-sm block"> Titik Geografis & Alamat Penjemputan:</span>
            <p className="font-bold text-slate-800 leading-snug">{selectedUser?.address}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-slate-600 font-bold">
                GPS Pins: {selectedUser?.lat}, {selectedUser?.lng}
              </span>
              <a
                href={`https://maps.google.com/?q=${selectedUser?.lat},${selectedUser?.lng}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-[#1B3A5C] text-white rounded-lg text-[11px] font-bold hover:bg-[#2C5A8F] transition-colors"
              >
                Buka di Google Maps ️
              </a>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button variant="primary" size="sm" onClick={() => setIsDetailOpen(false)}>
              Tutup Modal Detail
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmation for Reset Password */}
      <Modal
        isOpen={resetModal.isOpen}
        onClose={() => setResetModal({ isOpen: false, user: null })}
        title="Konfirmasi Reset Password Pengguna"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <p className="text-slate-600 leading-relaxed font-medium">
            Apakah Anda yakin ingin meng-reset password untuk akun <strong>{resetModal.user?.email}</strong>?
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium">
            Password akan di-reset otomatis menjadi <strong>password123</strong> dan instruksi login baru akan dikirimkan ke email akun tersebut.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setResetModal({ isOpen: false, user: null })}>
              Batal
            </Button>
            <Button variant="gold" size="sm" className="font-extrabold" onClick={executeResetPassword}>
              Konfirmasi Reset Password 
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Form Tambah Akun Baru */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Pendaftaran Akun Pengguna Baru"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Nama Usaha / Pengguna:</label>
            <Input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Contoh: Restoran Ayam Geprek Suroboyo"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Email Login:</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="mitra@replate.id"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Peran (Role):</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="PROVIDER">Food Provider</option>
                <option value="RESCUE_PARTNER">Rescue Partner</option>
                <option value="CONSUMER">Konsumen</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">No. HP Kontak:</label>
              <Input
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="081234567890"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Alamat Operasional:</label>
            <Input
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              placeholder="Alamat di Surabaya"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="gold" size="sm" className="font-extrabold">
              Daftarkan Akun 
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
