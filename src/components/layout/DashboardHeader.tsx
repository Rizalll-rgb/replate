'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '../ui/Avatar';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Modal } from '../ui/Modal';
import { signOut } from 'next-auth/react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Toast } from '../ui/Toast';

export interface DashboardHeaderProps {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    status?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    profileImage?: string | null;
  } | null;
  title?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, title = 'Dashboard Overview' }) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Editable Account Form State (Poin 9)
  const [orgName, setOrgName] = useState(user?.name || 'Warung Bakso Pak Kumis');
  const [phone, setPhone] = useState((user as any)?.phone || '081234567891');
  const [email, setEmail] = useState(user?.email || 'mitra@replate.id');
  const [address, setAddress] = useState((user as any)?.address || 'Jl. Genteng Kali No. 45, Genteng, Surabaya');
  const [nib, setNib] = useState('NIB-9120481023912');
  const [district, setDistrict] = useState('Surabaya Pusat');

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const handleLogout = async () => {
    try {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (_) {}
    await signOut({ callbackUrl: '/login?switch=1' });
  };

  const handleSaveProfile = () => {
    setIsEditMode(false);
    setToastState({
      isOpen: true,
      message: 'Profil & pengaturan akun mitra berhasil diperbarui!',
      type: 'success',
    });
  };

  const userRole = user?.role || 'PROVIDER';
  const isAdmin = userRole === 'ADMIN';

  const menuItems = [
    {
      id: 'profile',
      label: isAdmin ? 'Pengaturan Admin' : 'Pengaturan Outlet',
      icon: (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => {
        if (isAdmin) {
          router.push('/dashboard/admin/settings');
        } else {
          router.push('/dashboard/provider/settings');
        }
      },
    },
    {
      id: 'logout',
      label: 'Keluar (Logout)',
      icon: (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="min-w-0 pr-2">
          <h1 className="text-lg sm:text-xl font-extrabold text-[#1B3A5C] truncate">{title}</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
            Platform redistribusi makanan berlebih Replate
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* User Info Avatar Dropdown Menu */}
          <DropdownMenu
            trigger={
              <button
                className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left group border border-transparent hover:border-slate-200 max-w-[220px] sm:max-w-none cursor-pointer"
              >
                <Avatar src={user?.profileImage} name={orgName || 'User'} size="md" />
                <div className="hidden sm:flex flex-col text-left min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1B3A5C] transition-colors truncate">
                    {orgName}
                  </span>
                  <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider truncate">
                    {userRole}
                  </span>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors ml-0.5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            }
            items={[
              {
                id: 'settings',
                label: isAdmin ? 'Pengaturan Admin' : 'Pengaturan Outlet',
                icon: (
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                onClick: () => {
                  if (isAdmin) {
                    router.push('/dashboard/admin/settings');
                  } else {
                    router.push('/dashboard/provider/settings');
                  }
                },
              },
              {
                id: 'profile-modal',
                label: 'Lihat Kartu Profil Legalitas',
                icon: (
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                onClick: () => setIsProfileOpen(true),
              },
              {
                id: 'logout',
                label: 'Keluar (Logout)',
                icon: (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                ),
                danger: true,
                onClick: handleLogout,
              },
            ]}
          />
        </div>
      </header>

      {/* Comprehensive Role Account Management Modal (Poin 9) */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title={isEditMode ? 'Edit & Setup Manajemen Akun' : 'Profil Akun & Legalitas Mitra Organisasi'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-4">
              <Avatar src={user?.profileImage} name={orgName} size="xl" className="border-2 border-[#1B3A5C]" />
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-[#1B3A5C] truncate">{orgName}</h3>
                <p className="text-xs text-slate-500 font-medium truncate">{user?.email || 'mitra@replate.id'}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={isAdmin ? 'primary' : 'gold'} size="sm">
                    {userRole}
                  </Badge>
                  <Badge variant="success" size="sm">
                    {isAdmin ? 'FULL SYSTEM ACCESS' : 'VERIFIED BPOM SOP'}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant={isEditMode ? 'outline' : 'gold'}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="font-bold shrink-0 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{isEditMode ? 'Batal Edit' : 'Edit Profil Akun'}</span>
            </Button>
          </div>

          {!isEditMode ? (
            /* Readonly View Mode */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block">Nama Organisasi / Toko</span>
                  <span className="font-extrabold text-[#1B3A5C] text-sm">{orgName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Wilayah Operasional</span>
                  <span className="font-extrabold text-slate-800 text-sm">{district}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">NIB / Izin Usaha</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{nib}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block">No. Telepon PIC Penjemputan</span>
                  <span className="font-bold text-slate-800">{phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Alamat Utama Penjemputan</span>
                  <span className="font-bold text-slate-800">{address}</span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                <span className="font-extrabold block">Status Kredensial Keamanan Pangan:</span>
                <p className="text-amber-800 font-normal leading-relaxed">
                  Akun ini telah terverifikasi resmi oleh Admin Replate & memenuhi SOP higienitas 8-Poin Keamanan Pangan BPOM & WHO.
                </p>
              </div>
            </div>
          ) : (
            /* Editable Form Mode (Poin 9) */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Organisasi / Bisnis Toko"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Contoh: Warung Bakso Pak Kumis"
                  required
                />

                <Input
                  label="Nomor Telepon PIC Penjemputan"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567891"
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#343A40]">Wilayah Surabaya</label>
                  <select
                    className="w-full rounded-lg border border-[#DEE2E6] text-sm px-3.5 py-2 bg-white focus:border-[#1B3A5C] focus:outline-none"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    <option value="Surabaya Pusat">Surabaya Pusat (Genteng, Tegalsari, Bubutan)</option>
                    <option value="Surabaya Timur">Surabaya Timur (Gubeng, Sukolilo, Rungkut)</option>
                    <option value="Surabaya Barat">Surabaya Barat (Tandes, Sambikerep)</option>
                    <option value="Surabaya Selatan">Surabaya Selatan (Wonokromo, Gayungan)</option>
                    <option value="Surabaya Utara">Surabaya Utara (Pabean, Semampir)</option>
                  </select>
                </div>

                <Input
                  label="Nomor NIB / Legalitas Izin Usaha"
                  value={nib}
                  onChange={(e) => setNib(e.target.value)}
                  placeholder="NIB-9120481023912"
                />
              </div>

              <Input
                label="Alamat Utama Penjemputan Makanan"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Genteng Kali No. 45, Genteng, Surabaya"
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                  Batal
                </Button>
                <Button variant="gold" size="sm" className="font-extrabold" onClick={handleSaveProfile}>
                  Simpan Perubahan Profil Akun ➔
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-200 pt-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl transition-colors"
            >
              Keluar (Logout)
            </button>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="px-4 py-2 bg-[#1B3A5C] text-white font-extrabold text-xs rounded-xl hover:bg-[#2C5A8F] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Alert */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};
