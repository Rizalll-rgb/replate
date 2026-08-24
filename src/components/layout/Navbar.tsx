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

  const publicNavLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/about', label: 'Tentang Kami' },
    { href: '/how-it-works', label: 'Cara Kerja' },
    { href: '/impact', label: 'Dampak' },
    { href: '/faq', label: 'FAQ' },
  ];

  const loggedInNavLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/explore', label: 'Explore' },
    { href: '/donation', label: 'Donation' },
    { href: '/notifications', label: 'Notifikasi' },
  ];

  const navLinks = user ? loggedInNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Logo size="md" variant="dark" />

          <nav className="hidden md:flex items-center gap-6">
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
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Search Bar */}
              <div className="hidden lg:flex items-center relative">
                <div className="absolute left-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Cari makanan..." 
                  className="pl-9 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48 xl:w-64"
                />
              </div>

              {/* Chat Icon */}
              <button className="text-gray-500 hover:text-[#1B3A5C] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </button>

              {/* Cart Icon */}
              <button className="text-gray-500 hover:text-[#1B3A5C] transition-colors relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </button>

              {/* User Avatar */}
              <Link href="/dashboard" className="ml-2">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold border border-green-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </Link>
            </>
          ) : (
            <>
              <PWAInstallButton />
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
