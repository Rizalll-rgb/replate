'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const PWARoleRedirect = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkPWAAndRedirect = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        // List of public marketing routes that should NOT be shown inside standalone PWA app
        const publicMarketingRoutes = ['/', '/about', '/how-it-works', '/impact', '/faq'];

        if (publicMarketingRoutes.includes(pathname)) {
          // Direct PWA user straight into the Core Business Process Dashboard
          router.replace('/dashboard');
        }
      }
    };

    checkPWAAndRedirect();
  }, [pathname, router]);

  return null;
};
