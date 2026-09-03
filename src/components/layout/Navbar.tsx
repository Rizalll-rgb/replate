'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user: propUser }) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);
  const [dashboardUrl, setDashboardUrl] = useState<string>('/dashboard/consumer');
  const [activeRoleName, setActiveRoleName] = useState<string>('');

  const activeUser = propUser || session?.user;

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('replate_tas_klaim');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        setCartCount(Array.isArray(items) ? items.length : 0);
      }

      const profile = localStorage.getItem('replate_onboarding_profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        if (parsed.role === 'FOOD_PROVIDER') {
          setDashboardUrl('/dashboard/provider');
          setActiveRoleName('Food Provider');
        } else if (parsed.role === 'FOOD_BENEFICIARY') {
          setDashboardUrl('/dashboard/yayasan');
          setActiveRoleName('Food Beneficiary');
        } else if (parsed.role === 'RESCUE_VOLUNTEER') {
          setDashboardUrl('/dashboard/rescue-partner');
          setActiveRoleName('Rescue Volunteer');
        } else {
          setDashboardUrl('/dashboard/consumer');
          setActiveRoleName('Consumer');
        }
      } else if (activeUser?.role) {
        const role = String(activeUser.role).toUpperCase();
        if (role.includes('PROVIDER')) {
          setDashboardUrl('/dashboard/provider');
          setActiveRoleName('Food Provider');
        } else if (role.includes('BENEFICIARY') || role.includes('YAYASAN')) {
          setDashboardUrl('/dashboard/yayasan');
          setActiveRoleName('Food Beneficiary');
        } else if (role.includes('VOLUNTEER') || role.includes('RESCUE')) {
          setDashboardUrl('/dashboard/rescue-partner');
          setActiveRoleName('Rescue Volunteer');
        } else {
          setDashboardUrl('/dashboard/consumer');
          setActiveRoleName('Consumer');
        }
      }
    } catch (_) {}
  }, [activeUser, pathname]);

  const publicNavLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/explore', label: 'Eksplor Pangan' },
    { href: '/about', label: 'Tentang Kami' },
    { href: '/info', label: 'Pusat Informasi' },
  ];

  const loggedInNavLinks = [
    { href: dashboardUrl, label: 'Workspace Dashboard' },
    { href: '/explore', label: 'Eksplor Pangan' },
    { href: '/track-status', label: 'Pelacakan Status' },
    { href: '/info', label: 'Pusat Informasi' },
  ];

  if (activeUser) {
    return null;
  }

  const navLinks = publicNavLinks;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Logo size="md" variant="dark" href={activeUser ? dashboardUrl : '/'} />

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold transition-colors py-1 ${
                    isActive
                      ? 'text-[#1B3A5C] font-extrabold border-b-2 border-[#1B3A5C]'
                      : 'text-gray-600 hover:text-[#1B3A5C]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {activeUser ? (
            <>
              {/* Cart Icon (Tas Klaim) */}
              <Link
                href="/dashboard/cart"
                className="text-gray-500 hover:text-[#1B3A5C] transition-colors p-2 rounded-xl hover:bg-slate-100 relative"
                title="Tas Klaim Makanan"
              >
                <svg className="w-5 h-5 text-[#1B3A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Dashboard Direct Action Button */}
              <Link href={dashboardUrl} className="ml-1">
                <Button variant="gold" size="sm" className="font-extrabold text-xs text-slate-950 py-1.5 px-3.5 shadow-xs whitespace-nowrap">
                  <span> Workspace ({activeRoleName || 'Dashboard'}) </span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <PWAInstallButton />
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="gold" size="sm" className="font-extrabold text-xs shadow-xs text-slate-950">
                  Daftar Akun
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
