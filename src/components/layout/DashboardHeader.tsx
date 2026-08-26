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
  const [phone, setPhone] = useState((user as any)?.phone || '0812-3456-7890');
  const [email, setEmail] = useState(user?.email || 'mitra@replate.id');
  const [address, setAddress] = useState((user as any)?.address || 'Jl. Raya Gubeng No. 88, Surabaya');
  const [contactPerson, setContactPerson] = useState('Mas Doni');
  const [nib, setNib] = useState('NIB-9120481023912');
  const [district, setDistrict] = useState('Surabaya Pusat');

  React.useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        // Only use parsed profile if role or email matches active session user
        const isRoleMatch = !user?.role || !parsed.role || user.role.includes(parsed.role) || parsed.role.includes(user.role);
        const isEmailMatch = !user?.email || !parsed.email || parsed.email.toLowerCase() === user.email.toLowerCase();
        if (isRoleMatch || isEmailMatch) {
          if (parsed.entityName) setOrgName(parsed.entityName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.contactPerson) setContactPerson(parsed.contactPerson);
          return;
        }
      }
      if (user) {
        if (user.name) setOrgName(user.name);
        if ((user as any).phone) setPhone((user as any).phone);
        if (user.email) setEmail(user.email);
        if ((user as any).address) setAddress((user as any).address);
      }
    } catch (_) {}
  }, [user]);

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

  const formatRoleLabel = (rawRole?: string | null) => {
    if (!rawRole) return 'Food Provider';
    const r = rawRole.toUpperCase();
    if (r === 'PROVIDER' || r === 'FOOD_PROVIDER') return 'Food Provider';
    if (r === 'BENEFICIARY' || r === 'FOOD_BENEFICIARY' || r === 'YAYASAN') return 'Food Beneficiary';
    if (r === 'CONSUMER' || r === 'FOOD_CONSUMER') return 'Food Consumer';
    if (r === 'VOLUNTEER' || r === 'RESCUE_VOLUNTEER' || r === 'RESCUE_PARTNER') return 'Rescue Volunteer';
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 'SuperAdmin';
    return rawRole.replace(/_/g, ' ');
  };

  const userRole = formatRoleLabel(user?.role || 'FOOD_PROVIDER');
  const isAdmin = userRole === 'SuperAdmin';

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
          {/* User Info Avatar Button - Clicking directly opens Profile Modal */}
          <DropdownMenu
            trigger={
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left group border border-transparent hover:border-slate-200 max-w-[220px] sm:max-w-none cursor-pointer"
                title="Klik untuk membuka Kartu Profil Legalitas"
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
              </button>
            }
            items={[
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

      {/* Role Conditional Profile Details Modal (Purely Readonly View) */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title={isAdmin ? 'Profil Otoritas Superadmin Platform' : 'Kartu Profil & Legalitas Mitra Organisasi'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
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

          <div className="space-y-4 text-xs">
            {isAdmin ? (
              /* SUPERADMIN Specific Profile Details */
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
              /* PROVIDER / PARTNER / CONSUMER Readonly Details */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block">Nama Entitas / Toko</span>
                    <span className="font-extrabold text-[#1B3A5C] text-sm">{orgName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Penanggung Jawab (PJ)</span>
                    <span className="font-extrabold text-slate-800 text-sm">{contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">NIB / SK Legalitas</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{nib}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block">No. Telepon / WA PIC</span>
                    <span className="font-bold text-slate-800">{phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Alamat Lengkap Operasional</span>
                    <span className="font-bold text-slate-800">{address}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <span className="font-extrabold block">Status Kredensial Keamanan Pangan:</span>
                  <p className="text-amber-800 font-normal leading-relaxed">
                    Akun ini telah terverifikasi resmi oleh Admin Replate & memenuhi SOP higienitas 8-Poin Keamanan Pangan BPOM & WHO.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 pt-4">
            <button
              onClick={() => {
                setIsProfileOpen(false);
                router.push('/dashboard/provider/settings');
              }}
              className="px-4 py-2 bg-[#1B3A5C]/10 hover:bg-[#1B3A5C]/20 text-[#1B3A5C] font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>Buka Pengaturan Outlet Lengkap ➔</span>
            </button>
            <div className="flex items-center gap-2">
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
