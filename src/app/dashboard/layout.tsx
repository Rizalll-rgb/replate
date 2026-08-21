'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Navbar } from '@/components/layout/Navbar';
import { useSession } from 'next-auth/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Dynamic user session from NextAuth
  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || 'Pengguna',
        email: session.user.email || 'user@foodbridge.id',
        role: session.user.role || 'PROVIDER',
        status: session.user.status || 'APPROVED',
        phone: '081234567890',
        address: 'Surabaya, Jawa Timur',
        city: 'Surabaya',
        profileImage: session.user.image,
      }
    : {
        name: 'Pak Kumis',
        email: 'bakso.pak.kumis@foodbridge.id',
        role: 'PROVIDER',
        status: 'APPROVED',
        phone: '081234567891',
        address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
        city: 'Surabaya',
      };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar user={currentUser} />
      <div className="flex flex-1">
        <Sidebar role={currentUser.role} />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader user={currentUser} title={`Dashboard (${currentUser.role.replace('_', ' ')})`} />
          <main className="p-6 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
