'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
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

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-950 font-black text-[10px] uppercase tracking-wider rounded-md">
            <span>LANGKAH 4 DARI 4 — PENINJAUAN BERKAS REPLATE GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Status Verifikasi Berkas Pendaftaran
          </h1>
        </div>

        <Card className="bg-slate-900/90 border-slate-700 text-slate-100 shadow-2xl">
          <CardBody className="p-6 space-y-6 text-center text-xs">
            {!isApproved ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                    ⏳ SEDANG DITINJAU TIM ADMIN REPLATE SURABAYA
                  </span>
                  <h3 className="text-lg font-black text-white">{profile.entityName}</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Dokumen legalitas (NIB, KTP Penanggung Jawab <strong>{profile.contactPerson}</strong>, & Foto Outlet) sedang diverifikasi keabsahannya oleh Tim Governance Admin.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-left">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <span className="text-slate-400 font-bold">Estimasi Waktu Audit:</span>
                    <span className="font-mono text-emerald-400 font-bold">Maks. 1x24 Jam Kerja</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <span className="text-slate-400 font-bold">Lokasi Operasional:</span>
                    <span className="font-bold text-white truncate max-w-[200px]">{profile.address}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Notifikasi Hasil:</span>
                    <span className="font-bold text-amber-300">WhatsApp & Email</span>
                  </div>
                </div>

                {/* Demo Action Button for Judges */}
                <div className="p-4 bg-blue-950/80 border border-blue-500/40 rounded-2xl space-y-2 text-center">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider block">
                    ⚡ KHUSUS SIMULASI JURI / TESTING ACC SUPERADMIN
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulateSuperAdminApprove}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>👑 Simulasi SuperAdmin Klik ACC & Aktifkan Akun ➔</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
                    🎉 SELAMAT! AKUN ANDA RESMI DISETUJUI & AKTIF
                  </span>
                  <h3 className="text-lg font-black text-white">{profile.entityName}</h3>
                  <p className="text-xs text-emerald-200 max-w-sm mx-auto leading-relaxed">
                    Dokumen legalitas Anda telah diverifikasi valid oleh SuperAdmin Replate. Anda sekarang dapat mengakses seluruh fitur operasional platform.
                  </p>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => router.push('/dashboard/provider')}
                  className="w-full font-black text-slate-950 shadow-lg py-3 text-sm flex items-center justify-center gap-2"
                >
                  <span>🚀 Masuk Ke Dashboard Operasional ➔</span>
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
