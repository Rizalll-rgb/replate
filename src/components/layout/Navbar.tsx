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
        if (role.includes('CONSUMER')) {
          setDashboardUrl('/dashboard/consumer');
          setActiveRoleName('Consumer');
        } else if (role.includes('PROVIDER')) {
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (activeUser) {
    return null;
  }

  const navLinks = publicNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
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

        {/* Right Side: Desktop Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Only Buttons */}
          <div className="hidden md:flex items-center gap-3">
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
          </div>

          {/* Mobile Right: Quick CTA + Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-bold text-[#1B3A5C] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Masuk
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20"
              aria-label={mobileMenuOpen ? 'Tutup Menu' : 'Buka Menu Navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Slide-Down with backdrop) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-lg shadow-xl animate-fade-in">
          <div className="px-4 pt-3 pb-6 space-y-4 max-w-md mx-auto">
            {/* Nav Links */}
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#1B3A5C] text-[#D4A843] font-black shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                <Button variant="gold" size="md" className="w-full font-black text-xs text-slate-950 py-3 shadow-sm justify-center">
                  Daftar Akun Baru
                </Button>
              </Link>
              <div className="flex items-center justify-between gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full font-bold text-xs py-2.5 justify-center">
                    Masuk ke Akun
                  </Button>
                </Link>
                <div className="shrink-0">
                  <PWAInstallButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
