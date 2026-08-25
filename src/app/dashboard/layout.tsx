'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Navbar } from '@/components/layout/Navbar';
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
    name: profileData?.entityName || profileData?.contactPerson || session?.user?.name || 'Pak Kumis',
    email: profileData?.email || session?.user?.email || 'bakso.pak.kumis@replate.id',
    role: profileData?.role || session?.user?.role || 'FOOD_PROVIDER',
    status: 'APPROVED',
    phone: profileData?.phone || '0812-3456-7890',
    address: profileData?.address || 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
    city: 'Surabaya',
    profileImage: session?.user?.image || null,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN' && <Navbar user={currentUser} />}
      <div className="flex flex-1 min-h-screen">
        <Sidebar role={currentUser.role} />
        <div className="flex-1 flex flex-col min-w-0">
          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'FOOD_PROVIDER' || currentUser.role === 'PROVIDER') && (
            <DashboardHeader user={currentUser} title={`Dashboard (${currentUser.role.replace('_', ' ')})`} />
          )}
          <main className="p-6 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
