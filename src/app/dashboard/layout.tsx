'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Navbar } from '@/components/layout/Navbar';
import { useSession } from 'next-auth/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  let inferredRole = 'PROVIDER';
  if (pathname.includes('/dashboard/yayasan')) inferredRole = 'YAYASAN';
  else if (pathname.includes('/dashboard/consumer')) inferredRole = 'CONSUMER';
  else if (pathname.includes('/dashboard/rescue-partner')) inferredRole = 'RESCUE_PARTNER';
  else if (pathname.includes('/dashboard/admin')) inferredRole = 'ADMIN';

  // Dynamic user session from NextAuth
  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || 'Pengguna',
        email: session.user.email || 'user@replate.id',
        role: session.user.role || 'PROVIDER',
        status: session.user.status || 'APPROVED',
        phone: '081234567890',
        address: 'Surabaya, Jawa Timur',
        city: 'Surabaya',
        profileImage: session.user.image,
      }
    : {
        name: 'Pak Kumis',
        email: 'bakso.pak.kumis@replate.id',
        role: inferredRole,
        status: 'APPROVED',
        phone: '081234567891',
        address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
        city: 'Surabaya',
      };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {currentUser.role !== 'ADMIN' && <Navbar user={currentUser} />}
      <div className="flex flex-1">
        <Sidebar role={currentUser.role} />
        <div className="flex-1 flex flex-col min-w-0">
          {currentUser.role === 'ADMIN' && (
            <DashboardHeader user={currentUser} title={`Dashboard (${currentUser.role.replace('_', ' ')})`} />
          )}
          <main className="p-6 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
