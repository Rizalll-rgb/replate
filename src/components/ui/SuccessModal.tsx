'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  foodName?: string;
  quantity?: string;
  onViewListings?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = 'Surplus Makanan Berhasil Dipublikasikan!',
  foodName = 'Bakso Sapi Komplit',
  quantity = '15 porsi',
  onViewListings,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center p-2 space-y-4">
        {/* Animated Celebration Vector Icon (Poin 12 - SVG Icon instead of emoji) */}
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-[#1B3A5C]">{title}</h3>
          <p className="text-xs text-slate-500">
            Smart Matching Engine telah aktif dan mencocokkan dengan target penerima terdekat di Surabaya.
          </p>
        </div>

        {/* Item Summary Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Nama Produk:</span>
            <span className="font-extrabold text-[#1B3A5C]">{foodName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Kuantitas Surplus:</span>
            <span className="font-bold text-amber-700">{quantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Status SOP BPOM:</span>
            <span className="font-extrabold text-emerald-700">100% TERVERIFIKASI</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <Button
            variant="gold"
            className="w-full font-black text-xs shadow-md"
            onClick={() => {
              onClose();
              if (onViewListings) onViewListings();
            }}
          >
            Lihat Daftar Makanan Saya 
          </Button>
        </div>
      </div>
    </Modal>
  );
};
