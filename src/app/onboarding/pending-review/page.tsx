'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Clock, Check, Copy, ExternalLink, ShieldCheck, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

export default function OnboardingPendingReviewPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>({
    entityName: 'Entitas Pendaftar Baru',
    category: 'RESTAURANT',
    address: 'Surabaya',
    contactPerson: 'Penanggung Jawab',
  });

  const [regId, setRegId] = useState<string>('REPLATE-REG-2026-9812');
  const [copied, setCopied] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [targetDashboard, setTargetDashboard] = useState<string>('/dashboard/provider');
  const [roleName, setRoleName] = useState<string>('Food Provider');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) setProfile(JSON.parse(p));

      const d = localStorage.getItem('replate_onboarding_docs');
      if (d) {
        const parsed = JSON.parse(d);
        if (parsed.status === 'APPROVED_ACTIVE') {
          setIsApproved(true);
        }
      }

      // Generate or load existing dynamic tracking registration ID
      let storedRegId = localStorage.getItem('replate_registration_id');
      if (!storedRegId) {
        storedRegId = `REPLATE-REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem('replate_registration_id', storedRegId);
      }
      setRegId(storedRegId);

      const docs = d ? JSON.parse(d) : {};
      const parsedProfile = p ? JSON.parse(p) : {};
      const role = docs.role || parsedProfile.role;

      if (role === 'FOOD_BENEFICIARY' || role === 'YAYASAN') {
        setTargetDashboard('/dashboard/yayasan');
        setRoleName('Food Beneficiary (Panti/Yayasan)');
      } else if (role === 'RESCUE_VOLUNTEER' || role === 'VOLUNTEER' || role === 'RESCUE_PARTNER') {
        setTargetDashboard('/dashboard/rescue-partner');
        setRoleName('Food Rescue Volunteer (Kurir Relawan)');
      } else if (role === 'FOOD_CONSUMER' || role === 'CONSUMER') {
        setTargetDashboard('/dashboard/consumer');
        setRoleName('Food Consumer (Rescue Sale)');
      } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        setTargetDashboard('/dashboard/admin');
        setRoleName('SuperAdmin Governance');
      } else {
        setTargetDashboard('/dashboard/provider');
        setRoleName('Food Provider (Merchant)');
      }
    } catch (_) {}
  }, []);

  const handleCopyRegId = () => {
    navigator.clipboard.writeText(regId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateSuperAdminApprove = async () => {
    try {
      const d = localStorage.getItem('replate_onboarding_docs') || '{}';
      const parsed = JSON.parse(d);
      localStorage.setItem('replate_onboarding_docs', JSON.stringify({ ...parsed, status: 'APPROVED_ACTIVE' }));
    } catch (_) {}

    try {
      let registeredUser: any = null;
      try {
        const raw = localStorage.getItem('replate_registered_user');
        if (raw) registeredUser = JSON.parse(raw);
      } catch (_) {}
      const email = registeredUser?.email;
      if (email) {
        fetch('/api/auth/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => {});
      }
    } catch (_) {}

    setIsApproved(true);
  };

  const handleGoToDashboard = async () => {
    setLoading(true);
    try {
      localStorage.setItem('replate_is_fresh_account', 'true');
      localStorage.removeItem('replate_local_surplus');
      localStorage.removeItem('replate_claims');
      localStorage.removeItem('replate_active_claims');
      localStorage.removeItem('replate_provider_fleet_list');
    } catch (_) {}

    let registeredUser: any = null;
    try {
      const raw = localStorage.getItem('replate_registered_user');
      if (raw) registeredUser = JSON.parse(raw);
    } catch (_) {}

    let loginEmail = registeredUser?.email;
    let loginPassword = registeredUser?.password || 'password123';

    if (!loginEmail) {
      if (targetDashboard.includes('yayasan')) loginEmail = 'panti.kasih.ibu@replate.id';
      else if (targetDashboard.includes('rescue-partner')) loginEmail = 'foodbank.surabaya@replate.id';
      else if (targetDashboard.includes('consumer')) loginEmail = 'budi.santoso@gmail.com';
      else if (targetDashboard.includes('admin')) loginEmail = 'admin@replate.id';
      else loginEmail = 'bakso.pak.kumis@replate.id';
    }

    // Pastikan status akun menjadi APPROVED di database
    try {
      await fetch('/api/auth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      });
    } catch (_) {}

    try {
      await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      window.location.href = targetDashboard;
    } catch (_) {
      window.location.href = targetDashboard;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-3 sm:p-6 font-sans relative overflow-x-hidden w-full max-w-full box-border">
      <div className="w-full max-w-xl space-y-6 relative z-10 box-border px-1">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A843] text-slate-950 font-black text-[10.5px] sm:text-xs uppercase tracking-wider rounded-xl shadow-md max-w-full text-center break-words">
            <span>LANGKAH 4 DARI 4 — PENINJAUAN BERKAS GOVERNANCE</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight break-words text-center px-1">
            Status Verifikasi Berkas Pendaftaran
          </h1>
        </div>

        {/* High Contrast Deep Navy Container Card */}
        <div className="bg-[#1B3A5C] border-2 border-[#2C5A8F] text-white rounded-2xl p-3.5 sm:p-6 md:p-8 shadow-2xl space-y-6 text-center text-xs w-full max-w-full box-border">
          {!isApproved ? (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>SEDANG DITINJAU TIM ADMIN REPLATE</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white break-words">{profile.entityName}</h3>
                <p className="text-xs text-slate-200 font-bold max-w-md mx-auto leading-relaxed break-words px-1">
                  Dokumen legalitas (NIB, KTP Penanggung Jawab <strong>{profile.contactPerson}</strong>, & Foto Outlet) sedang diverifikasi keabsahannya oleh Tim Governance Admin.
                </p>
              </div>

              {/* Prominent Registration Tracking ID Box */}
              <div className="p-3.5 bg-[#0F1923] border-2 border-[#D4A843] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-left shadow-lg gap-2.5 w-full box-border">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider block">
                    Kode Registrasi Tracking Pendaftaran Anda:
                  </span>
                  <span className="font-mono text-[#D4A843] font-black text-sm sm:text-base tracking-wider block break-all">
                    {regId}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyRegId}
                  className="px-3.5 py-2 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>Kode Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-950" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              {/* High Contrast Details Box */}
              <div className="p-3.5 sm:p-4 bg-[#142C47] rounded-xl border border-slate-700 space-y-2.5 text-left font-bold w-full max-w-full box-border">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2 gap-2">
                  <span className="text-amber-300 font-extrabold shrink-0">Kode Tracking:</span>
                  <span className="font-mono text-[#D4A843] font-black text-right break-all">{regId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700 pb-2 gap-2">
                  <span className="text-amber-300 font-extrabold shrink-0">Estimasi Waktu Audit:</span>
                  <span className="font-mono text-emerald-300 font-black text-right">Maks. 1x24 Jam Kerja</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700 pb-2 gap-2">
                  <span className="text-amber-300 font-extrabold shrink-0">Lokasi Operasional:</span>
                  <span className="font-bold text-white text-right truncate max-w-[170px] sm:max-w-[260px]">{profile.address}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-amber-300 font-extrabold shrink-0">Notifikasi Hasil:</span>
                  <span className="font-bold text-emerald-300 text-right">WhatsApp & Email</span>
                </div>
              </div>

              {/* Link to Live Tracker with query param */}
              <Link href={`/track-status?id=${regId}`} className="block w-full">
                <button
                  type="button"
                  className="w-full py-3 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span>Pantau Status Pendaftaran 24/7 (Live Tracker)</span>
                </button>
              </Link>

              {/* Demo Action Button for Judges */}
              <div className="p-3.5 sm:p-4 bg-[#0F1923] border border-[#2C5A8F] rounded-2xl space-y-2.5 text-center shadow-lg w-full box-border">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider inline-flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>KHUSUS SIMULASI JURI / TESTING ACC SUPERADMIN</span>
                </span>
                <button
                  type="button"
                  onClick={handleSimulateSuperAdminApprove}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                  <span>Simulasi SuperAdmin Klik ACC & Aktifkan Akun</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
                  SELAMAT! AKUN ANDA RESMI DISETUJUI & AKTIF
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white break-words">{profile.entityName}</h3>
                <p className="text-xs text-emerald-200 font-bold max-w-md mx-auto leading-relaxed break-words px-1">
                  Dokumen legalitas Anda telah diverifikasi valid oleh SuperAdmin Replate. Klik tombol di bawah untuk masuk langsung ke <strong>Dashboard {roleName}</strong>.
                </p>
              </div>

              <Button
                variant="gold"
                size="lg"
                onClick={handleGoToDashboard}
                isLoading={loading}
                className="w-full font-black text-slate-950 shadow-lg py-3 text-sm flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Masuk Ke Dashboard {roleName}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
