'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function OnboardingPendingReviewPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>({
    entityName: 'Warung Bakso Pak Kumis Surabaya',
    category: 'RESTAURANT',
    address: 'Jl. Raya Gubeng No. 88, Surabaya',
    contactPerson: 'Mas Doni',
  });

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

      const docs = d ? JSON.parse(d) : {};
      const parsedProfile = p ? JSON.parse(p) : {};
      const role = docs.role || parsedProfile.role;

      if (role === 'FOOD_BENEFICIARY' || role === 'YAYASAN') {
        setTargetDashboard('/dashboard/yayasan');
        setRoleName('Food Beneficiary (Panti/Yayasan)');
      } else if (role === 'RESCUE_VOLUNTEER' || role === 'VOLUNTEER' || role === 'RESCUE_PARTNER') {
        setTargetDashboard('/dashboard/rescue-partner');
        setRoleName('Rescue Volunteer (Kurir Relawan)');
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

  const handleSimulateSuperAdminApprove = () => {
    try {
      const d = localStorage.getItem('replate_onboarding_docs') || '{}';
      const parsed = JSON.parse(d);
      localStorage.setItem('replate_onboarding_docs', JSON.stringify({ ...parsed, status: 'APPROVED_ACTIVE' }));
    } catch (_) {}
    setIsApproved(true);
  };

  const handleGoToDashboard = async () => {
    setLoading(true);
    try {
      let demoEmail = 'bakso.pak.kumis@replate.id';
      if (targetDashboard.includes('yayasan')) demoEmail = 'panti.kasih.ibu@replate.id';
      else if (targetDashboard.includes('rescue-partner')) demoEmail = 'foodbank.surabaya@replate.id';
      else if (targetDashboard.includes('consumer')) demoEmail = 'budi.santoso@gmail.com';
      else if (targetDashboard.includes('admin')) demoEmail = 'admin@replate.id';

      await signIn('credentials', {
        email: demoEmail,
        password: 'password123',
        callbackUrl: targetDashboard,
      });
    } catch (_) {
      window.location.href = targetDashboard;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="w-full max-w-xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4A843] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md">
            <span>LANGKAH 4 DARI 4 — PENINJAUAN BERKAS GOVERNANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Status Verifikasi Berkas Pendaftaran
          </h1>
        </div>

        {/* High Contrast Deep Navy Container Card */}
        <div className="bg-[#1B3A5C] border-2 border-[#2C5A8F] text-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center text-xs">
          {!isApproved ? (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest block">
                  ⏳ SEDANG DITINJAU TIM ADMIN REPLATE SURABAYA
                </span>
                <h3 className="text-xl font-black text-white">{profile.entityName}</h3>
                <p className="text-xs text-slate-200 font-bold max-w-md mx-auto leading-relaxed">
                  Dokumen legalitas (NIB, KTP Penanggung Jawab <strong>{profile.contactPerson}</strong>, & Foto Outlet) sedang diverifikasi keabsahannya oleh Tim Governance Admin.
                </p>
              </div>

              {/* High Contrast Details Box */}
              <div className="p-4 bg-[#142C47] rounded-xl border border-slate-700 space-y-2.5 text-left font-bold">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <span className="text-amber-300 font-extrabold">Estimasi Waktu Audit:</span>
                  <span className="font-mono text-emerald-300 font-black">Maks. 1x24 Jam Kerja</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <span className="text-amber-300 font-extrabold">Lokasi Operasional:</span>
                  <span className="font-bold text-white truncate max-w-[220px]">{profile.address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-300 font-extrabold">Notifikasi Hasil:</span>
                  <span className="font-bold text-emerald-300">WhatsApp & Email</span>
                </div>
              </div>

              {/* Link to Live Tracker (Poin 3) */}
              <Link href="/track-status" className="block">
                <button
                  type="button"
                  className="w-full py-2.5 bg-blue-900/80 hover:bg-blue-800 text-blue-200 font-extrabold text-xs rounded-xl border border-blue-400/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🔍 Pantau Status Pendaftaran 24/7 (Live Tracker) ➔</span>
                </button>
              </Link>

              {/* Demo Action Button for Judges */}
              <div className="p-4 bg-[#0F1923] border border-[#2C5A8F] rounded-2xl space-y-2.5 text-center shadow-lg">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                  ⚡ KHUSUS SIMULASI JURI / TESTING ACC SUPERADMIN
                </span>
                <button
                  type="button"
                  onClick={handleSimulateSuperAdminApprove}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>👑 Simulasi SuperAdmin Klik ACC & Aktifkan Akun ➔</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
                  🎉 SELAMAT! AKUN ANDA RESMI DISETUJUI & AKTIF
                </span>
                <h3 className="text-xl font-black text-white">{profile.entityName}</h3>
                <p className="text-xs text-emerald-200 font-bold max-w-md mx-auto leading-relaxed">
                  Dokumen legalitas Anda telah diverifikasi valid oleh SuperAdmin Replate. Klik tombol di bawah untuk masuk langsung ke <strong>Dashboard {roleName}</strong>.
                </p>
              </div>

              <Button
                variant="gold"
                size="lg"
                onClick={handleGoToDashboard}
                isLoading={loading}
                className="w-full font-black text-slate-950 shadow-lg py-3 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚀 Masuk Ke Dashboard {roleName} ➔</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
