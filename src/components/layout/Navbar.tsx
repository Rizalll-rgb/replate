'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/about', label: 'Tentang Kami' },
    { href: '/how-it-works', label: 'Cara Kerja' },
    { href: '/impact', label: 'Dampak' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" variant="dark" />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors py-1 ${
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

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <PWAInstallButton />
          {user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="font-semibold">
                Dashboard ({user.role})
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-semibold">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="gold" size="sm" className="font-semibold shadow-xs">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
