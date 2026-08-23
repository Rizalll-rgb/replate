'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface OTPVerificationModalProps {
  isOpen: boolean;
  phoneOrEmail: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  phoneOrEmail,
  onSuccess,
  onClose,
}) => {
  const [otp, setOtp] = useState(['9', '9', '3', '8']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const entered = otp.join('');
    if (entered.length < 4) {
      setError('Masukkan 4 digit kode OTP lengkap!');
      return;
    }
    setError('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📱 Verifikasi 2-Langkah (WhatsApp / Email OTP)"
      size="sm"
    >
      <div className="space-y-5 text-center text-xs text-slate-700">
        <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1">
          <span className="font-extrabold text-amber-400 text-xs block uppercase tracking-wider">
            Sistem Autentikasi Ganda Replate
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Kode OTP 4-digit telah dikirimkan via WhatsApp ke nomor{' '}
            <strong className="text-amber-300 font-mono">{phoneOrEmail || '0812-3456-7890'}</strong>.
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 font-extrabold text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black text-[#1B3A5C] block uppercase tracking-wider">
            Masukkan 4-Digit Kode OTP:
          </label>
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-12 h-14 bg-slate-100 text-slate-900 font-black text-xl text-center rounded-xl border-2 border-amber-400 focus:outline-none focus:border-[#1B3A5C] focus:bg-white shadow-sm"
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-500 italic">
            💡 Kode OTP Demo Instan: <strong className="text-emerald-700 font-mono font-bold">9938</strong>
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
          <Button
            variant="gold"
            size="md"
            onClick={handleVerify}
            isLoading={isVerifying}
            className="w-full font-black text-slate-950 py-3 shadow-md"
          >
            <span>Verifikasi Kode OTP WA ➔</span>
          </Button>
          <button
            type="button"
            onClick={() => setOtp(['9', '9', '3', '8'])}
            className="text-[11px] text-[#1B3A5C] hover:underline font-bold"
          >
            Kirim Ulang Kode OTP WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
};
