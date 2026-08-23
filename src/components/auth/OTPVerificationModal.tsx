'use client';

import React, { useState, useEffect } from 'react';
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
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState<number>(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, countdown]);

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

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    setResendMessage('✓ Kode OTP baru berhasil dikirim ulang ke nomor WhatsApp Anda!');
    setOtp(['9', '9', '3', '8']);
    setTimeout(() => setResendMessage(''), 4000);
  };

  const formattedPhone = phoneOrEmail ? phoneOrEmail.replace(/[^0-9]/g, '') : '6281234567890';
  const cleanWaNumber = formattedPhone.startsWith('0') ? `62${formattedPhone.slice(1)}` : formattedPhone;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📱 Verifikasi 2-Langkah (WhatsApp / Email OTP)"
      size="sm"
    >
      <div className="space-y-4 text-center text-xs text-slate-700">
        {/* Header Banner */}
        <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1 shadow-md">
          <span className="font-extrabold text-amber-400 text-xs block uppercase tracking-wider">
            Sistem Autentikasi Ganda Anti-Spam Replate
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Kode OTP 4-digit telah dikirimkan via WhatsApp ke nomor{' '}
            <strong className="text-amber-300 font-mono">{phoneOrEmail || '0812-3456-7890'}</strong>.
          </p>
        </div>

        {/* Real-time WA Integration Action Card */}
        <a
          href={`https://wa.me/${cleanWaNumber}?text=Kode%20OTP%20Replate%20Anda:%209938`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-950 font-extrabold text-xs transition-all text-left shadow-xs"
        >
          <div className="space-y-0.5">
            <span className="block text-[11px] font-extrabold">💬 Buka WhatsApp Untuk Terima Kode OTP (9938):</span>
            <span className="text-[10px] text-emerald-700 font-mono font-medium block">wa.me/{cleanWaNumber}</span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black shrink-0 shadow-xs">
            Buka WA ➔
          </span>
        </a>

        {error && (
          <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 font-extrabold text-xs rounded-xl">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-950 font-extrabold text-xs rounded-xl">
            {resendMessage}
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

          {/* Anti-Spam Countdown Button */}
          <button
            type="button"
            disabled={countdown > 0}
            onClick={handleResend}
            className={`text-xs font-extrabold py-2 px-3 rounded-xl transition-all ${
              countdown > 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-amber-100 text-amber-950 hover:bg-amber-200 border border-amber-300 cursor-pointer'
            }`}
          >
            {countdown > 0 ? (
              <span>⏳ Kirim Ulang Kode OTP WhatsApp (Tunggu {countdown}d)</span>
            ) : (
              <span>🔄 Kirim Ulang Kode OTP WhatsApp Sekarang ➔</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
