'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useSession } from 'next-auth/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        setProfileData(JSON.parse(p));
      }
    } catch (_) {}
  }, [session]);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="hidden md:flex">
          <Sidebar role={currentUser.role} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader user={currentUser} title={`Dashboard (${currentUser.role.replace(/_/g, ' ')})`} />
          <main className="p-4 sm:p-6 flex-1 overflow-y-auto pb-24 md:pb-6">{children}</main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Ala Gojek / Grab Super App) */}
      <BottomNav user={currentUser} />
    </div>
  );
}
