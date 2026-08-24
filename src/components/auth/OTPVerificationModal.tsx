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
  const [generatedOtp, setGeneratedOtp] = useState<string>('4829');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<false | boolean>(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState<number>(60);

  // Generate unique random 4-digit OTP whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const newRandomOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newRandomOtp);
      setOtp(['', '', '', '']);
      setError('');
      setCountdown(60);
    }
  }, [isOpen]);

  // Anti-spam 60s countdown timer
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

    // Auto-focus next input field
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const entered = otp.join('');
    if (entered.length < 4) {
      setError('⚠️ Mohon isi 4-digit kode OTP secara lengkap!');
      return;
    }

    if (entered !== generatedOtp) {
      setError('❌ Kode OTP yang Anda masukkan salah! Periksa kembali pesan dari Replate WhatsApp Bot.');
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
    const newRandomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newRandomOtp);
    setOtp(['', '', '', '']);
    setCountdown(60);
    setResendMessage('✓ Kode OTP baru berhasil dikirimkan ulang secara otomatis oleh Replate WA Gateway!');
    setTimeout(() => setResendMessage(''), 4000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📱 Verifikasi 2-Langkah (Replate WA Gateway)"
      size="sm"
    >
      <div className="space-y-4 text-center text-xs text-slate-700">
        {/* Header Banner */}
        <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1 shadow-md">
          <span className="font-black text-amber-400 text-xs block uppercase tracking-wider">
            Sistem Autentikasi Ganda Anti-Spam Replate
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Kode OTP 4-digit dikirim otomatis dari Server Bot ke nomor{' '}
            <strong className="text-amber-300 font-mono font-black">{phoneOrEmail || '0812-3456-7890'}</strong>.
          </p>
        </div>

        {/* Replate Automated Server Gateway Notification Card */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-emerald-950 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
              <span>💬 Replate WA Gateway Server:</span>
            </span>
            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[9px] font-mono font-black shrink-0">
              ✓ TERKIRIM OTOMATIS
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
            Sistem bot Replate telah secara otomatis mengirimkan notifikasi WhatsApp berisi kode OTP 4-digit ke HP Anda.
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 font-extrabold text-xs rounded-xl shadow-xs">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow-xs">
            {resendMessage}
          </div>
        )}

        {/* Empty 4-Digit Input Fields */}
        <div className="space-y-2">
          <label className="text-xs font-black text-[#1B3A5C] block uppercase tracking-wider">
            Masukkan 4-Digit Kode OTP WhatsApp:
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
                placeholder="•"
                className="w-12 h-14 bg-slate-50 text-slate-900 font-black text-xl text-center rounded-xl border-2 border-amber-400 focus:outline-none focus:border-[#1B3A5C] focus:bg-white shadow-sm"
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-500 font-medium pt-1">
            💡 <button type="button" onClick={() => setOtp(generatedOtp.split(''))} className="text-emerald-700 font-mono font-black underline cursor-pointer">Simulasi Terima Kode WA Bot ({generatedOtp})</button>
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
          <Button
            variant="gold"
            size="md"
            onClick={handleVerify}
            isLoading={isVerifying}
            className="w-full font-black text-slate-950 py-3 shadow-md cursor-pointer"
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
