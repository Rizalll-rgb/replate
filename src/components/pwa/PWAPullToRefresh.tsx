'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export const PWAPullToRefresh: React.FC = () => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const THRESHOLD = 65;

  useEffect(() => {
    // Only enable on touch devices (mobile)
    if (typeof window === 'undefined' || !('ontouchstart' in window)) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only initiate pull-to-refresh if already at the top of the page
      if (window.scrollY <= 0) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diffY = currentY - startYRef.current;

      // Only pull down when at the top of the window
      if (diffY > 0 && window.scrollY <= 0) {
        // Elastic damping effect
        const damped = Math.min(95, Math.pow(diffY, 0.85) * 1.5);
        setPullDistance(damped);
      } else {
        setPullDistance(0);
        isPullingRef.current = false;
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      if (pullDistance >= THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(THRESHOLD);

        // Haptic feedback if available
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(25);
          } catch (_) {}
        }

        // Trigger in-app state refresh events
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('replate_pull_refresh'));
          window.dispatchEvent(new Event('replate_cart_updated'));
        }

        // Finish refreshing after authentic smooth delay (850ms)
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 850);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(1, pullDistance / THRESHOLD);
  const rotation = isRefreshing ? undefined : progress * 360;

  return (
    <div
      className="md:hidden fixed top-3 inset-x-0 mx-auto z-[9999] pointer-events-none flex justify-center transition-transform duration-150"
      style={{
        transform: `translateY(${Math.min(30, pullDistance * 0.4)}px)`,
      }}
    >
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200/80 flex items-center gap-2 animate-in fade-in zoom-in-90 duration-150">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{ transform: rotation !== undefined ? `rotate(${rotation}deg)` : undefined }}
        >
          <Image
            src="/images/logo.png"
            alt="Replate"
            width={20}
            height={20}
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        <span className="text-[10px] font-bold text-[#1B3A5C] tracking-wide">
          {isRefreshing
            ? 'Memperbarui data...'
            : pullDistance >= THRESHOLD
            ? 'Lepaskan untuk memuat'
            : 'Tarik untuk segarkan'}
        </span>
      </div>
    </div>
  );
};
