'use client';

import React from 'react';

export interface SuperAppLoaderProps {
  isOpen: boolean;
  message?: string;
  submessage?: string;
}

export const SuperAppLoader: React.FC<SuperAppLoaderProps> = ({
  isOpen,
  message = 'Memproses permintaan...',
  submessage = 'Mohon tunggu sebentar',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
    >
      <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 flex flex-col items-center justify-center max-w-xs w-full text-center space-y-3.5 animate-scale-in">
        {/* Animated Brand Pulse Ring */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#D4A843]/20 animate-ping" />
          <div className="relative w-12 h-12 rounded-2xl bg-[#1B3A5C] text-[#D4A843] flex items-center justify-center shadow-md">
            <svg
              className="w-6 h-6 animate-spin text-[#D4A843]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <p className="font-black text-xs sm:text-sm text-[#1B3A5C] tracking-tight">{message}</p>
          <p className="text-[11px] text-slate-500 font-medium">{submessage}</p>
        </div>

        {/* Mini Shimmer Bar */}
        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#1B3A5C] via-[#D4A843] to-[#1B3A5C] w-full animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
};
