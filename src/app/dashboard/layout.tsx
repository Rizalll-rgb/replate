'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { GojekProfileDrawer } from '@/components/layout/GojekProfileDrawer';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<any>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [isRedirectingRoleMismatch, setIsRedirectingRoleMismatch] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (_) {}
    await signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        setProfileData(JSON.parse(p));
      } else {
        const reg = localStorage.getItem('replate_registered_user');
        if (reg) {
          setProfileData(JSON.parse(reg));
        }
      }
    } catch (_) {}
  }, [session]);

  useEffect(() => {
    const handleOpen = () => setIsProfileDrawerOpen(true);
    window.addEventListener('replate_open_profile_drawer', handleOpen);
    return () => {
      window.removeEventListener('replate_open_profile_drawer', handleOpen);
    };
  }, []);

  // Determine user's real role from local onboarding data, session, or cookie
  let detectedUserRole = 'FOOD_CONSUMER';
  try {
    if (profileData?.role) {
      detectedUserRole = profileData.role;
    } else if (typeof window !== 'undefined') {
      const rawOnb = localStorage.getItem('replate_onboarding_profile');
      if (rawOnb) {
        detectedUserRole = JSON.parse(rawOnb).role || 'FOOD_CONSUMER';
      } else {
        const rawReg = localStorage.getItem('replate_registered_user');
        if (rawReg) {
          detectedUserRole = JSON.parse(rawReg).role || 'FOOD_CONSUMER';
        } else {
          const cookieMatch = document.cookie.match(/replate_role=([^;]+)/) || document.cookie.match(/replate_demo_session=([^;]+)/);
          if (cookieMatch) detectedUserRole = decodeURIComponent(cookieMatch[1]);
        }
      }
    }
  } catch (_) {}

  if (!detectedUserRole && session?.user?.role) {
    detectedUserRole = session.user.role;
  }

  // Cross-role workspace protection: strictly prevent Consumers from entering Provider workspaces
  useEffect(() => {
    const upper = String(detectedUserRole || '').toUpperCase();
    const isConsumer = upper.includes('CONSUMER');
    const isProvider = upper.includes('PROVIDER');
    const isBeneficiary = upper.includes('BENEFICIARY') || upper.includes('YAYASAN');
    const isVolunteer = upper.includes('VOLUNTEER') || upper.includes('RESCUE');

    if (isConsumer && pathname.startsWith('/dashboard/provider')) {
      setIsRedirectingRoleMismatch(true);
      router.replace('/dashboard/consumer');
      return;
    }

    if (isProvider && pathname.startsWith('/dashboard/consumer')) {
      setIsRedirectingRoleMismatch(true);
      router.replace('/dashboard/provider');
      return;
    }

    if (isBeneficiary && (pathname.startsWith('/dashboard/provider') || pathname.startsWith('/dashboard/consumer'))) {
      setIsRedirectingRoleMismatch(true);
      router.replace('/dashboard/yayasan');
      return;
    }

    if (isVolunteer && (pathname.startsWith('/dashboard/provider') || pathname.startsWith('/dashboard/consumer'))) {
      setIsRedirectingRoleMismatch(true);
      router.replace('/dashboard/rescue-partner');
      return;
    }

    setIsRedirectingRoleMismatch(false);
  }, [pathname, detectedUserRole, router]);

  // Path-based role awareness strictly isolates role experiences and prevents role bleeding
  let inferredRoleFromPath: string = detectedUserRole;
  if (pathname.startsWith('/dashboard/consumer')) inferredRoleFromPath = 'FOOD_CONSUMER';
  else if (pathname.startsWith('/dashboard/yayasan')) inferredRoleFromPath = 'FOOD_BENEFICIARY';
  else if (pathname.startsWith('/dashboard/rescue-partner')) inferredRoleFromPath = 'RESCUE_VOLUNTEER';
  else if (pathname.startsWith('/dashboard/admin')) inferredRoleFromPath = 'SUPER_ADMIN';
  else if (pathname.startsWith('/dashboard/provider')) inferredRoleFromPath = 'FOOD_PROVIDER';

  // Role resolution priority:
  // 1. If currently inside a role-specific workspace, enforce that workspace role
  // 2. Otherwise use onboarding profile role, session user role, or detected role
  const resolvedRole = pathname.startsWith('/dashboard/consumer')
    ? 'FOOD_CONSUMER'
    : pathname.startsWith('/dashboard/yayasan')
    ? 'FOOD_BENEFICIARY'
    : pathname.startsWith('/dashboard/rescue-partner')
    ? 'RESCUE_VOLUNTEER'
    : pathname.startsWith('/dashboard/admin')
    ? 'SUPER_ADMIN'
    : pathname.startsWith('/dashboard/provider')
    ? 'FOOD_PROVIDER'
    : detectedUserRole || profileData?.role || session?.user?.role || inferredRoleFromPath;

  const isConsumerContext = String(resolvedRole).toUpperCase().includes('CONSUMER');

  const currentUser = {
    id: session?.user?.id || 'usr-registered',
    name:
      profileData?.entityName ||
      profileData?.contactPerson ||
      profileData?.name ||
      session?.user?.name ||
      (isConsumerContext ? 'Konsumen Replate' : 'Mitra Replate'),
    email: profileData?.email || session?.user?.email || (isConsumerContext ? 'konsumen@replate.id' : 'mitra@replate.id'),
    role: resolvedRole,
    status: 'APPROVED',
    phone: profileData?.phone || '0812-3456-7890',
    address: profileData?.address || (isConsumerContext ? 'Gubeng, Surabaya' : 'Surabaya, Jawa Timur'),
    city: profileData?.city || 'Surabaya',
    profileImage: session?.user?.image || null,
  };

  const formatRoleTitle = (rawRole?: string) => {
    if (!rawRole) return 'Food Provider';
    const r = rawRole.toUpperCase();
    if (r === 'PROVIDER' || r === 'FOOD_PROVIDER') return 'Food Provider';
    if (r === 'BENEFICIARY' || r === 'FOOD_BENEFICIARY' || r === 'YAYASAN') return 'Food Beneficiary';
    if (r === 'CONSUMER' || r === 'FOOD_CONSUMER') return 'Food Consumer';
    if (r === 'VOLUNTEER' || r === 'RESCUE_VOLUNTEER' || r === 'RESCUE_PARTNER') return 'Food Rescue Volunteer';
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 'SuperAdmin';
    return rawRole.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="hidden md:flex">
          <Sidebar role={currentUser.role} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="hidden md:block">
            <DashboardHeader user={currentUser} title={`Dashboard (${formatRoleTitle(currentUser.role)})`} />
          </div>

          {/* Universal Mobile Top Bar for all roles (Provider, Rescue, Yayasan, Admin, and Subpages) */}
          {pathname !== '/dashboard/consumer' && (
            <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsProfileDrawerOpen(true)}
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1B3A5C] to-[#2C5282] flex items-center justify-center font-black text-xs text-[#D4A843] shrink-0 shadow-2xs cursor-pointer active:scale-95 transition-transform"
                  title="Profil Saya"
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-800 truncate block">
                      {currentUser.name}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#1B3A5C]/10 text-[#1B3A5C] text-[9px] font-black uppercase rounded shrink-0">
                      {formatRoleTitle(currentUser.role)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block truncate">
                    {currentUser.address || currentUser.city || 'Surabaya, Jawa Timur'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile Logout Action Button */}
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 active:scale-95 transition-all cursor-pointer relative shrink-0 shadow-2xs"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                </button>

                {/* Avatar Profile Drawer Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsProfileDrawerOpen(true)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer relative shrink-0"
                  title="Buka Profil & Pengaturan (Ala Gojek)"
                >
                  <User className="w-4 h-4 text-[#1B3A5C]" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Logout Confirmation Modal */}
          {isLogoutConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Keluar dari Akun?</h3>
                    <p className="text-xs text-slate-500 font-medium">Akhiri sesi login di perangkat ini.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Data profil dan riwayat Anda tetap tersimpan. Anda dapat masuk kembali kapan saja.
                </p>
                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsLogoutConfirmOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer"
                  >
                    Ya, Keluar
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="p-2 sm:p-4 md:p-6 flex-1 overflow-y-auto pb-24 md:pb-6">
            {isRedirectingRoleMismatch || (String(detectedUserRole).toUpperCase().includes('CONSUMER') && pathname.startsWith('/dashboard/provider')) ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 mx-auto border-3 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 font-extrabold">Mengarahkan ke Ruang Kerja Konsumen...</p>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      {/* Universal Gojek-Style Profile Drawer */}
      <GojekProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        overrideUser={currentUser}
      />

      {/* Mobile Bottom Navigation Bar (Ala Gojek / Grab Super App) */}
      <BottomNav user={currentUser} />
    </div>
  );
}
