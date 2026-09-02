'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/70 backdrop-blur-xs transition-all overflow-y-auto"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
    >
      <div
        className={`relative w-full flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all max-h-[85vh] my-auto ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        {/* Modal Header (Fixed at top, shrink-0) */}
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <h3 className="text-xs sm:text-sm font-black text-[#1B3A5C] truncate pr-2">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Modal Content Body (Scrollable inside with responsive padding and height) */}
        <div
          className="p-3.5 sm:p-5 overflow-y-auto flex-1 min-h-0 leading-relaxed text-slate-800 text-xs"
          style={{ maxHeight: 'calc(85vh - 105px)', overflowY: 'auto' }}
        >
          {children}
        </div>

        {/* Modal Footer (Fixed at bottom, shrink-0) */}
        {footer && (
          <div className="flex items-center justify-end gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
