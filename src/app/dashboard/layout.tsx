'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { GojekProfileDrawer } from '@/components/layout/GojekProfileDrawer';
import { useSession } from 'next-auth/react';
import { User } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<any>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        setProfileData(JSON.parse(p));
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

  // Dynamic user session synchronized with registered onboarding profile & NextAuth session
  const currentUser = {
    id: session?.user?.id || 'usr-registered',
    name: profileData?.entityName || profileData?.contactPerson || session?.user?.name || 'Mitra Replate',
    email: profileData?.email || session?.user?.email || 'mitra@replate.id',
    role: profileData?.role || session?.user?.role || 'FOOD_PROVIDER',
    status: 'APPROVED',
    phone: profileData?.phone || '0812-3456-7890',
    address: profileData?.address || 'Surabaya, Jawa Timur',
    city: 'Surabaya',
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
          )}

          <main className="p-2 sm:p-4 md:p-6 flex-1 overflow-y-auto pb-24 md:pb-6">{children}</main>
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
