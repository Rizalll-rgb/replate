'use client';

import React, { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Modal } from '../ui/Modal';
import { signOut } from 'next-auth/react';
import { Badge } from '../ui/Badge';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const userRole = user?.role || 'PROVIDER';
  const isAdmin = userRole === 'ADMIN';

  const menuItems = [
    {
      id: 'profile',
      label: isAdmin ? 'Profil Superadmin' : 'Profil Akun Bisnis',
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
          {/* User Info Button Clickable to Profile */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left group border border-transparent hover:border-slate-200 max-w-[200px] sm:max-w-none"
          >
            <Avatar src={user?.profileImage} name={user?.name || 'User'} size="md" />
            <div className="hidden sm:flex flex-col text-left min-w-0">
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1B3A5C] transition-colors truncate">
                {user?.name || (isAdmin ? 'Platform Admin' : 'Pak Kumis')}
              </span>
              <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-wider truncate">
                {userRole}
              </span>
            </div>
          </button>

          <DropdownMenu
            trigger={
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            }
            items={menuItems}
          />
        </div>
      </header>

      {/* Role Conditional Profile Details Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title={isAdmin ? 'Profil Otoritas Superadmin Platform' : 'Profil Akun & Legalitas Mitra Bisnis'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
            <Avatar src={user?.profileImage} name={user?.name || (isAdmin ? 'Admin' : 'User')} size="xl" className="border-2 border-[#1B3A5C]" />
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-[#1B3A5C] truncate">
                {user?.name || (isAdmin ? 'Superadmin Platform' : 'Pak Kumis')}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">{user?.email || 'admin@replate.id'}</p>
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

          <div className="space-y-4 text-xs">
            {isAdmin ? (
              // SUPERADMIN Specific Profile Details
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block">Tipe Akun</span>
                    <span className="font-extrabold text-[#1B3A5C] text-sm">Superadministrator</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Wilayah Otoritas</span>
                    <span className="font-extrabold text-slate-800 text-sm">Kota Surabaya (Pusat)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">ID Otentikasi Admin</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">ADM-SBY-001</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block">Kontak Otoritas Sistem</span>
                    <span className="font-bold text-slate-800">admin@replate.id (+62 812-3456-7890)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Hak Pengawasan Sistem</span>
                    <span className="font-bold text-emerald-700">Persetujuan Akun, Algoritma, Monitoring</span>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs space-y-1">
                  <span className="font-extrabold block">Wewenang Control Tower:</span>
                  <p className="text-blue-800 font-normal leading-relaxed">
                    Akun ini memegang otoritas penuh untuk menyetujui pendaftaran mitra provider, mengonfigurasi parameter bobot Smart Matching Engine, dan memantau lalu lintas emisi CO2 redistribusi pangan Surabaya.
                  </p>
                </div>
              </>
            ) : (
              // PROVIDER / PARTNER / CONSUMER Specific Details
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block">Tipe Organisasi</span>
                    <span className="font-extrabold text-[#1B3A5C] text-sm">Restoran / Kuliner</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Kota Operasional</span>
                    <span className="font-extrabold text-slate-800 text-sm">Surabaya, Jawa Timur</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">NIB / Izin Usaha</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">NIB-9120481023912</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block">No. Telepon / Kontak Pick-up</span>
                    <span className="font-bold text-slate-800">{user?.phone || '081234567891'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Koordinat Lokasi GPS</span>
                    <span className="font-mono font-bold text-slate-800">-7.2575, 112.7521 (Genteng Kali)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <span className="font-extrabold block">Status Kredensial Keamanan Pangan:</span>
                  <p className="text-amber-800 font-normal leading-relaxed">
                    Akun ini telah terverifikasi oleh Admin Replate & memenuhi SOP higienitas 8-Poin Keamanan Pangan BPOM & WHO.
                  </p>
                </div>
              </>
            )}
          </div>

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
              Tutup Modal Profil
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
