import React from 'react';
import Link from 'next/link';

export interface LogoProps {
  customImageSrc?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  customImageSrc = '/images/logo.png',
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  href = '/',
}) => {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <>
      {customImageSrc ? (
        <img
          src={customImageSrc}
          alt="Replate Logo"
          className={`${iconSizes[size]} object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-200`}
        />
      ) : (
        <div
          className={`${iconSizes[size]} rounded-xl bg-[#1B3A5C] border border-[#2C5A8F] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200`}
        >
          {/* Clean Vector SVG Icon representing a Bridge & Rescue Leaf */}
          <svg
            className="w-5 h-5 text-[#D4A843]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M3 17c3.5-4 7.5-6 12-6s7.5 2 9 6M5 17v2m14-2v2M8 11V7a4 4 0 018 0v4"
            />
          </svg>
        </div>
      )}

      <div className="flex flex-col text-left">
        <span
          className={`font-black ${textSizes[size]} tracking-tight leading-none ${
            isLight ? 'text-white' : 'text-[#1B3A5C]'
          }`}
        >
          Re<span className="text-[#D4A843]">plate</span>
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase mt-1 ${
              isLight ? 'text-gray-300' : 'text-[#6C757D]'
            }`}
          >
            Redistribusi Pangan
          </span>
        )}
      </div>
    </>
  );

  if (!href) {
    return <div className="inline-flex items-center gap-2.5 group">{content}</div>;
  }

  return (
    <Link href={href} className="inline-flex items-center gap-2.5 group">
      {content}
    </Link>
  );
};
