'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export const PWASplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Detect if running as standalone PWA or testable in session
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true ||
        sessionStorage.getItem('replate_is_pwa_standalone') === 'true');

    const alreadyShown = sessionStorage.getItem('replate_splash_shown') === 'true';

    // Show splash screen only on initial app startup in PWA mode
    if (isStandalone && !alreadyShown) {
      setIsVisible(true);
      sessionStorage.setItem('replate_splash_shown', 'true');

      // Initiate fade-out after 1.8s
      const timerFade = setTimeout(() => {
        setIsFading(true);
      }, 1800);

      // Unmount splash completely after fade transition (2.4s total)
      const timerHide = setTimeout(() => {
        setIsVisible(false);
      }, 2500);

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
      className={`fixed inset-0 z-[99999] bg-[#FAF9F5] flex items-center justify-center select-none overflow-hidden transition-opacity duration-700 ease-in-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center">
        <Image
          src="/splash/splash.png"
          alt="Replate PWA Splash Screen"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover sm:object-contain"
        />
      </div>
    </div>
  );
};
