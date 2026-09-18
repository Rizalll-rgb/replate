'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  KeyRound,
  UserPlus,
  Store,
  Building2,
  ShoppingBag,
  Truck,
  Shield,
  ArrowRight,
} from 'lucide-react';

function FutureDevelopmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const feature = searchParams.get('feature') || 'register';
  const from = searchParams.get('from') || 'login';

  const isRegister = feature === 'register';

  // 1-Click Demo Login Handler for Competition Judges
  const handleQuickDemo = async (role: string, targetUrl: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        document.cookie = `replate_demo_session=${role}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `replate_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      }
      await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (_) {}
    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen bg-[#0F1923] relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#D4A843]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#1B3A5C]/25 blur-[140px] pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, #D4A843 1px, transparent 1px), radial-gradient(circle at 75% 75%, #D4A843 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-2xl w-full relative z-10 space-y-6 text-center my-auto">
        {/* Brand Header */}
        <div className="flex justify-center">
          <Logo variant="light" size="lg" />
        </div>

        {/* Main Card */}
        <div className="bg-[#142C47]/90 backdrop-blur-xl border-1.5 border-[#2C5A8F] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-left text-white">
          {/* Top Pill */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-[#D4A843] border border-[#D4A843]/30 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Future Development • Roadmap v2.1</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
              Tahap Fase 2 (Q3 2026)
            </span>
          </div>

          {/* Hero Content based on feature */}
          {isRegister ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#D4A843] border border-[#D4A843]/40 flex items-center justify-center shadow-md shrink-0">
                  <UserPlus className="w-6 h-6 text-[#D4A843]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Pendaftaran Mandiri &amp; Verifikasi e-KYC
                  </h1>
                  <p className="text-xs text-[#D4A843] font-bold">
                    Standarisasi Legalitas NIB OSS &amp; Sertifikasi SOP BPOM RI
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                Untuk menjamin kepatuhan regulasi pangan nasional dan legalitas kelembagaan sosial (Dinsos RI), fitur pendaftaran publik mandiri sedang disiapkan untuk integrasi terpusat pada roadmap rilis berikutnya.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0 border border-slate-200">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Integrasi Masuk dengan Akun Google
                  </h1>
                  <p className="text-xs text-[#D4A843] font-bold">
                    Single Sign-On (SSO) OAuth 2.0 PKCE Terpadu
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                Fitur <strong>Masuk Cepat Menggunakan Akun Google</strong> saat ini sedang dipersiapkan dalam roadmap pengembangan tahap selanjutnya (Replate Enterprise Release v2.1).
              </p>
            </div>
          )}

          {/* Why it's in future development */}
          <div className="p-4 bg-[#0F1923] rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              Mengapa Fitur Ini Dijadwalkan Pada Tahap Selanjutnya?
            </span>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Integrasi API e-KYC Dukcapil &amp; NIB OSS:</strong> Verifikasi identitas penanggung jawab dan legalitas badan usaha kuliner secara otomatis.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Kepatuhan Standar SOP BPOM &amp; Kemenkes:</strong> Pengawasan sertifikasi kelayakan konsumsi dan transparansi batch donasi surplus.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#D4A843] shrink-0 mt-0.5" />
                <span>
                  <strong>Estimasi Rilis Nasional:</strong> Siap diluncurkan pada kuartal ketiga (Q3 2026) bersama mitra dinas terkait.
                </span>
              </div>
            </div>
          </div>

          {/* Special Section for Competition Evaluator / Judges */}
          <div className="p-4 bg-[#1B3A5C]/40 rounded-2xl border border-[#2C5A8F]/60 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
                Akses Evaluasi Juri &amp; Pengujian Lomba (Siap Pakai):
              </span>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                5 Akun Tersinkronisasi
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Seluruh peran ekosistem telah dilengkapi dataset realistis (katalog surplus, riwayat klaim, analitik dampak, dan surat jalan) untuk kemudahan penilaian:
            </p>

            {/* 5 Quick Login Buttons for Evaluators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemo('FOOD_CONSUMER', '/dashboard/consumer')}
                className="p-2.5 rounded-xl bg-[#142C47] hover:bg-[#1B3A5C] border border-[#2C5A8F] text-left transition-all cursor-pointer flex items-center gap-2.5 active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white block truncate">Food Consumer</span>
                  <span className="text-[10px] text-slate-400 block truncate">Budi Santoso (Pahlawan)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('FOOD_PROVIDER', '/dashboard/provider')}
                className="p-2.5 rounded-xl bg-[#142C47] hover:bg-[#1B3A5C] border border-[#2C5A8F] text-left transition-all cursor-pointer flex items-center gap-2.5 active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-[#D4A843] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white block truncate">Food Provider</span>
                  <span className="text-[10px] text-slate-400 block truncate">Warung Bakso Pak Kumis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('FOOD_BENEFICIARY', '/dashboard/yayasan')}
                className="p-2.5 rounded-xl bg-[#142C47] hover:bg-[#1B3A5C] border border-[#2C5A8F] text-left transition-all cursor-pointer flex items-center gap-2.5 active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white block truncate">Food Beneficiary</span>
                  <span className="text-[10px] text-slate-400 block truncate">Panti Asuhan Kasih Ibu</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('RESCUE_VOLUNTEER', '/dashboard/rescue-partner')}
                className="p-2.5 rounded-xl bg-[#142C47] hover:bg-[#1B3A5C] border border-[#2C5A8F] text-left transition-all cursor-pointer flex items-center gap-2.5 active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white block truncate">Rescue Volunteer</span>
                  <span className="text-[10px] text-slate-400 block truncate">Foodbank Surabaya Center</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('SUPER_ADMIN', '/dashboard/admin')}
                className="p-2.5 rounded-xl bg-[#142C47] hover:bg-[#1B3A5C] border border-[#2C5A8F] text-left transition-all cursor-pointer flex items-center gap-2.5 active:scale-98 sm:col-span-2"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white block truncate">Super Administrator</span>
                  <span className="text-[10px] text-slate-400 block truncate">Audit Approval, Fraud Guard &amp; Metana Monitor</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/login" className="w-full sm:flex-1">
              <button
                type="button"
                className="w-full py-3 px-5 bg-[#D4A843] hover:bg-[#E5B954] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <KeyRound className="w-4 h-4 text-slate-950" />
                <span>Buka Halaman Login Demo</span>
              </button>
            </Link>

            <Link href="/" className="w-full sm:flex-1">
              <button
                type="button"
                className="w-full py-3 px-5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white border border-[#D4A843]/50 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Beranda Utama</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] font-bold text-slate-500 font-mono">
          REPLATE GOVERNANCE &amp; ROADMAP &copy; {new Date().getFullYear()} • WHERE SURPLUS FINDS PURPOSE
        </p>
      </div>
    </div>
  );
}

export default function FutureDevelopmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F1923] flex items-center justify-center text-amber-400 text-xs font-bold">
          Memuat informasi roadmap...
        </div>
      }
    >
      <FutureDevelopmentContent />
    </Suspense>
  );
}
