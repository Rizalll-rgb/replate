'use client';

import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 text-center animate-fade-in"
      onClick={onClose}
    >
      {/* Invisible flex/inline strut to ensure 100% stable vertical alignment without clipping */}
      <span className="inline-block h-screen align-middle" aria-hidden="true">
        &#8203;
      </span>

      <div
        className={`inline-block align-middle w-full text-left bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in max-h-[85vh] flex flex-col my-6 ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Always fixed & visible at top) */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <h3 className="text-base font-extrabold text-[#1B3A5C]">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Modal Content Body (Scrollable inside, never overflows outside) */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 leading-relaxed text-slate-800">
          {children}
        </div>

        {/* Modal Footer (Always fixed & visible at bottom) */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
