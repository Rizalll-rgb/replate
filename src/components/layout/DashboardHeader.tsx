'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '../ui/Avatar';
import { signOut } from 'next-auth/react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Account name state
  const [orgName, setOrgName] = useState(user?.name || 'Warung Bakso Pak Kumis');

  React.useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        const isRoleMatch = !user?.role || !parsed.role || user.role.includes(parsed.role) || parsed.role.includes(user.role);
        const isEmailMatch = !user?.email || !parsed.email || parsed.email.toLowerCase() === user.email.toLowerCase();
        if (isRoleMatch || isEmailMatch) {
          if (parsed.entityName) setOrgName(parsed.entityName);
          return;
        }
      }
      if (user) {
        if (user.name) setOrgName(user.name);
      }
    } catch (_) {}
  }, [user]);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (_) {}
    // Website: redirect ke halaman publik utama
    await signOut({ callbackUrl: '/' });
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
          {/* Cart Icon for Consumer & Beneficiary */}
          {(userRole === 'Food Consumer' || userRole === 'Food Beneficiary') && (
            <button
              onClick={() => router.push('/dashboard/cart')}
              className="relative p-2 text-slate-500 hover:text-[#1B3A5C] transition-colors rounded-xl hover:bg-slate-100"
              title="Tas Klaim (Keranjang)"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          )}

          {/* Avatar with Clean Dropdown (Settings + Logout only) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left group border border-transparent hover:border-slate-200 max-w-[220px] sm:max-w-none cursor-pointer"
              title="Menu Akun"
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
              {/* Chevron Indicator */}
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Mini Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-[#1B3A5C] truncate">{orgName}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email || 'mitra@replate.id'}</p>
                </div>

                {/* Settings Link → Redirect ke modul Profil & Pengaturan */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/dashboard/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1B3A5C] transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Profil & Pengaturan</span>
                </button>

                {/* Divider */}
                <div className="mx-3 my-1 border-t border-slate-100"></div>

                {/* Logout → Redirect ke halaman publik */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

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
