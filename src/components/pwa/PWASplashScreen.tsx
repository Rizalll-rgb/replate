'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export const PWASplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const dismissNow = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  }, []);

  useEffect(() => {
    // 1. Check if forced preview via URL parameter (e.g. ?splash=preview or ?splash=true)
    const urlParams =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isSplashPreview =
      urlParams?.get('splash') === 'preview' ||
      urlParams?.get('splash') === 'true' ||
      urlParams?.get('splash') === '1' ||
      urlParams?.get('preview') === 'splash';

    // 2. Detect if running as standalone PWA or testable in session
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true ||
        sessionStorage.getItem('replate_is_pwa_standalone') === 'true');

    const alreadyShown = sessionStorage.getItem('replate_splash_shown') === 'true';

    // 3. Show splash screen on initial startup or preview
    if ((isStandalone && !alreadyShown) || isSplashPreview) {
      setIsVisible(true);
      if (!isSplashPreview) {
        sessionStorage.setItem('replate_splash_shown', 'true');
      }

      // Snappy timing: start fading at 1.8s, remove at 2.2s (or slightly longer in preview)
      const fadeDelay = isSplashPreview ? 3200 : 1800;
      const hideDelay = isSplashPreview ? 3600 : 2200;

      const timerFade = setTimeout(() => {
        setIsFading(true);
      }, fadeDelay);

      const timerHide = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);

      return () => {
        clearTimeout(timerFade);
        clearTimeout(timerHide);
      };
    }

    // 4. Listen for custom trigger event (window.dispatchEvent(new CustomEvent('replate:show-splash')))
    const handleTrigger = () => {
      setIsVisible(true);
      setIsFading(false);
      setTimeout(() => setIsFading(true), 2400);
      setTimeout(() => setIsVisible(false), 2800);
    };

    window.addEventListener('replate:show-splash', handleTrigger);
    return () => {
      window.removeEventListener('replate:show-splash', handleTrigger);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="pwa-splash-overlay"
      onClick={dismissNow}
      title="Ketuk untuk langsung masuk ke aplikasi"
      className={`fixed inset-0 z-[99999] bg-[#FAF9F5] select-none overflow-hidden cursor-pointer transition-opacity duration-400 ease-in-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* ======================================================== */}
      {/* 1. MOBILE / ANDROID PWA: High-End Coded Splash Screen    */}
      {/* ======================================================== */}
      <div className="md:hidden flex flex-col justify-between w-full h-[100dvh] relative px-5 py-6 overflow-hidden select-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFFFFF] via-[#FAF9F5] to-[#EEF2E8] pt-[max(env(safe-area-inset-top),20px)] pb-[max(env(safe-area-inset-bottom),18px)]">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-[-5%] left-[-15%] w-60 h-60 rounded-full bg-[#1B3A5C]/8 blur-3xl pointer-events-none" />
        <div className="absolute top-[35%] right-[-20%] w-72 h-72 rounded-full bg-[#D4A843]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-10%] w-64 h-64 rounded-full bg-[#2D8A4E]/10 blur-3xl pointer-events-none" />

        {/* Top Header: Live Status Indicator & Skip Hint */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2D8A4E] animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1B3A5C]">
              Where Surplus Finds Purpose
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs active:scale-95 transition-transform">
              Ketuk untuk lewati
            </span>
          </div>
        </div>

        {/* Center Hero: Logo with Glow Halo, Brandmark, Tagline, Slogan, SDG Pills, & Loading Bar */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto space-y-4 px-2">
          {/* Logo Container with glowing animated halo */}
          <div className="relative group">
            <div className="absolute -inset-3 bg-gradient-to-tr from-[#1B3A5C]/25 via-[#D4A843]/35 to-[#2D8A4E]/25 rounded-3xl blur-md animate-replate-glow" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-xl p-2.5 sm:p-3 flex items-center justify-center border border-slate-100">
              <Image
                src="/images/logo.png"
                alt="Replate Official Logo"
                width={88}
                height={88}
                priority
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1B3A5C] leading-none">
              Re<span className="text-[#D4A843]">plate</span>
            </h1>
            <p className="text-[10px] sm:text-xs font-black tracking-[0.25em] uppercase text-[#D4A843]">
              Where Surplus Finds Purpose
            </p>
          </div>

          {/* Slogan / Mission */}
          <div className="space-y-2 pt-0.5 max-w-[280px] sm:max-w-xs mx-auto">
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-snug">
              Platform redistribusi makanan berlebih cerdas & berkelanjutan
            </p>
            <div className="w-12 h-1 bg-[#D4A843] rounded-full mx-auto" />
          </div>

          {/* SDGs Pillars Strip (Mobile-Optimized Compact Ribbon) */}
          <div className="pt-0.5 flex items-center justify-center gap-1.5 flex-wrap max-w-xs">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/90 shadow-2xs flex items-center gap-2 text-[9px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5243B]" />
                <span>SDG 2</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FD6925]" />
                <span>9</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F99D26]" />
                <span>11</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BF8B2E]" />
                <span>12</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F7E44]" />
                <span>13</span>
              </span>
            </div>
          </div>

          {/* Mobile Animated Loading Bar */}
          <div className="pt-2 w-64 max-w-[80vw] space-y-2 mx-auto">
            <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-[#1B3A5C] via-[#D4A843] to-[#2D8A4E] animate-replate-progress" />
            </div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wide">
              Memuat Replate • Where Surplus Finds Purpose...
            </p>
          </div>
        </div>

        {/* Bottom Footer Details */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-1 pt-3 border-t border-slate-200/60">
          <p className="text-[11px] font-extrabold text-[#1B3A5C]">
            Replate — Where Surplus Finds Purpose
          </p>
          <p className="text-[9px] text-slate-400 font-medium">
            Mendukung 5 Pilar SDGs • Terkoneksi Dinsos RI & BPOM
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#1B3A5C]">
              GOOD FOOD • BRIGHTER TOMORROW
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[9px] text-slate-400 font-medium">Versi Mobile 2.0 PWA</span>
          </div>
        </div>

        {/* Bottom Decorative Wave SVG */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-12 pointer-events-none opacity-20 text-[#1B3A5C]"
          viewBox="0 0 720 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 40C120 10 240 70 360 40C480 10 600 70 720 40V80H0V40Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* ======================================================== */}
      {/* 2. LAPTOP / DESKTOP PWA: High-End Coded Splash Screen    */}
      {/* ======================================================== */}
      <div className="hidden md:flex flex-col justify-between w-full h-full relative p-8 lg:p-12 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFFFFF] via-[#FAF9F5] to-[#EEF2E8]">
        {/* Soft Ambient Background Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-[420px] h-[420px] rounded-full bg-[#1B3A5C]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full bg-[#D4A843]/12 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#2D8A4E]/8 blur-3xl pointer-events-none" />

        {/* Top Header Taglines */}
        <div className="relative z-10 flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2D8A4E] animate-pulse" />
            <span className="font-extrabold text-[#1B3A5C]">Where Surplus Finds Purpose</span>
          </div>
          <div className="text-right text-slate-400 normal-case tracking-normal font-medium">
            <span className="text-[11px] bg-slate-100 hover:bg-slate-200 transition-colors px-3 py-1 rounded-full border border-slate-200">
              Klik di mana saja untuk melewati
            </span>
          </div>
        </div>

        {/* Center Hero: Logo, Brandmark, Tagline, Slogan & Loading Bar */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto space-y-6">
          {/* Logo Container with gentle pulse animation */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#1B3A5C]/20 via-[#D4A843]/30 to-[#2D8A4E]/20 rounded-3xl blur-md group-hover:blur-lg transition-all duration-300 animate-replate-glow" />
            <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-white shadow-xl p-3 flex items-center justify-center border border-slate-100">
              <Image
                src="/images/logo.png"
                alt="Replate Official Logo"
                width={112}
                height={112}
                priority
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-1.5">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#1B3A5C] leading-none">
              Re<span className="text-[#D4A843]">plate</span>
            </h1>
            <p className="text-xs lg:text-sm font-black tracking-[0.25em] uppercase text-[#D4A843]">
              Where Surplus Finds Purpose
            </p>
          </div>

          {/* Slogan / Mission */}
          <div className="space-y-2 pt-1 max-w-md mx-auto">
            <p className="text-sm lg:text-base text-slate-600 font-medium">
              Platform redistribusi makanan berlebih cerdas & berkelanjutan
            </p>
            <div className="w-16 h-1 bg-[#D4A843] rounded-full mx-auto" />
          </div>

          {/* SDGs Pillars Ribbon for Desktop */}
          <div className="pt-0.5 flex items-center justify-center gap-2">
            <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-2xs flex items-center gap-2.5 text-[10px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E5243B]" />
                <span>SDG 2 Tanpa Kelaparan</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FD6925]" />
                <span>SDG 9 Inovasi</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F99D26]" />
                <span>SDG 11 Kota Berkelanjutan</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#BF8B2E]" />
                <span>SDG 12 Konsumsi</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3F7E44]" />
                <span>SDG 13 Aksi Iklim</span>
              </span>
            </div>
          </div>

          {/* Desktop Animated Loading Bar */}
          <div className="pt-2 w-72 lg:w-80 space-y-2">
            <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-[#1B3A5C] via-[#D4A843] to-[#2D8A4E] animate-replate-progress" />
            </div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide">
              Memuat Replate • Where Surplus Finds Purpose...
            </p>
          </div>
        </div>

        {/* Bottom Footer Details & Decorative Curves */}
        <div className="relative z-10 flex items-end justify-between text-xs text-slate-500 pt-6 border-t border-slate-200/50">
          <div className="space-y-1">
            <p className="font-extrabold text-[#1B3A5C]">
              Replate — Where Surplus Finds Purpose
            </p>
            <p className="text-[11px] text-slate-400">
              Mendukung 5 Pilar SDGs (2, 9, 11, 12, 13) • Terkoneksi Dinsos RI & BPOM
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1B3A5C] block">
              GOOD FOOD • BRIGHTER TOMORROW
            </span>
            <span className="text-[10px] text-slate-400">Versi Desktop 2.0 PWA</span>
          </div>
        </div>

        {/* Subtle Decorative Wave at Bottom */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-16 pointer-events-none opacity-20 text-[#1B3A5C]"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 60C240 10 480 110 720 60C960 10 1200 110 1440 60V120H0V60Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};
