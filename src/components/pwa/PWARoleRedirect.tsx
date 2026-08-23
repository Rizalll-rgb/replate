'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const PWARoleRedirect = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkPWAAndRedirect = () => {
      // 1. Comprehensive PWA Display Mode Detection
      const isMatchMediaPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches;

      const isNavPWA = (window.navigator as any).standalone === true || document.referrer.includes('android-app://');

      const isSessionPWA = sessionStorage.getItem('replate_is_pwa_standalone') === 'true';

      const isPWA = isMatchMediaPWA || isNavPWA || isSessionPWA;

      if (isPWA) {
        // Persist PWA mode in session storage
        sessionStorage.setItem('replate_is_pwa_standalone', 'true');

        // Check if current path is a public marketing page that MUST be blocked in PWA app mode
        const isPublicMarketingRoute =
          pathname === '/' ||
          pathname.startsWith('/about') ||
          pathname.startsWith('/how-it-works') ||
          pathname.startsWith('/impact') ||
          pathname.startsWith('/faq');

        if (isPublicMarketingRoute) {
          // Strictly lock PWA app mode to Core Business Process Dashboard
          router.replace('/dashboard');
        }
      }
    };

    checkPWAAndRedirect();
  }, [pathname, router]);

  return null;
};
