'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div key={pathname} className="relative min-h-screen">
      {/* Top Authentic Progress Bar Indicator */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200 overflow-hidden">
          <div className="h-full bg-[#D4A843] animate-pulse w-full transform -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      )}

      {/* Lazy-fade Enter Animation */}
      <div className="animate-[fadeInUp_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        {children}
      </div>
    </div>
  );
};
