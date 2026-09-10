'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export const PWASplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const dismissNow = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  useEffect(() => {
    // Detect if running as standalone PWA or testable in session
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true ||
        sessionStorage.getItem('replate_is_pwa_standalone') === 'true');

    const alreadyShown = sessionStorage.getItem('replate_splash_shown') === 'true';

    // Show splash screen only on initial app startup in PWA mode (maksimal 2.0 - 2.4 detik)
    if (isStandalone && !alreadyShown) {
      setIsVisible(true);
      sessionStorage.setItem('replate_splash_shown', 'true');

      // Mulai fade out cepat pada detik ke-1.6 (total durasi < 2.2 detik)
      const timerFade = setTimeout(() => {
        setIsFading(true);
      }, 1600);

      // Hapus splash dari DOM sepenuhnya pada detik ke-2.0
      const timerHide = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => {
        clearTimeout(timerFade);
        clearTimeout(timerHide);
      };
    }
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
      {/* 1. MOBILE / ANDROID PWA: Image Splash Screen             */}
      {/* ======================================================== */}
      <div className="md:hidden relative w-full h-full flex items-center justify-center bg-[#FAF9F5]">
        <Image
          src="/splash/splash.png"
          alt="Replate — Where Surplus Finds Purpose"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Subtle tap-to-skip hint */}
        <div className="absolute bottom-4 inset-x-0 text-center">
          <span className="text-[10px] tracking-wider text-slate-400 font-semibold bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            Ketuk layar untuk melewati
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. LAPTOP / DESKTOP PWA: High-End Coded Splash Screen    */}
      {/* ======================================================== */}
      <div className="hidden md:flex flex-col justify-between w-full h-full relative p-8 lg:p-12 overflow-hidden bg-radial from-[#FFFFFF] via-[#FAF9F5] to-[#F1F3EE]">
        {/* Soft Ambient Background Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-[420px] h-[420px] rounded-full bg-[#1B3A5C]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full bg-[#D4A843]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#2D8A4E]/8 blur-3xl pointer-events-none" />

        {/* Top Header Taglines (Uniform: Where Surplus Finds Purpose) */}
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

        {/* Center Hero: Logo, Brandmark, Uniform Tagline & Loading Bar */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto space-y-6">
          {/* Logo Container with gentle pulse animation */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#1B3A5C]/20 via-[#D4A843]/30 to-[#2D8A4E]/20 rounded-3xl blur-md group-hover:blur-lg transition-all duration-300 animate-pulse" />
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

          {/* Desktop Animated Loading Bar (1.5s snappy animation) */}
          <div className="pt-2 w-72 lg:w-80 space-y-2">
            <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1B3A5C] via-[#D4A843] to-[#2D8A4E]"
                style={{
                  animation: 'replateProgress 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                }}
              />
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

        {/* CSS Keyframe for loading progress */}
        <style jsx>{`
          @keyframes replateProgress {
            0% {
              width: 5%;
            }
            40% {
              width: 55%;
            }
            80% {
              width: 88%;
            }
            100% {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
