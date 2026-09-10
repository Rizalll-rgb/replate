'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import {
  Check,
  ClipboardList,
  Search,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Building2,
  Store,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  AlertCircle,
  FileText,
  UserCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function TrackRegistrationStatusPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [docsStatus, setDocsStatus] = useState<string>('DOCS_SUBMITTED_PENDING_REVIEW');
  const [regId, setRegId] = useState('');
  const [submittedTime, setSubmittedTime] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dynamic step completion flags
  const [stepFlags, setStepFlags] = useState({
    step1_registered: false,
    step2_profileFilled: false,
    step3_docsUploaded: false,
    step4_audited: false,
    step5_activated: false,
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const queryId = new URLSearchParams(window.location.search).get('id');
        if (queryId && queryId.trim().length > 0) {
          executeSearch(queryId.trim());
        }
      }
    } catch (_) {}
  }, []);

  const executeSearch = async (targetQuery: string) => {
    setErrorMessage('');
    const cleanQuery = targetQuery.trim();
    if (!cleanQuery) {
      setErrorMessage('Silakan masukkan Kode Tracking atau Email akun Anda.');
      return;
    }

    setRegId(cleanQuery.toUpperCase());
    setSearchQuery(cleanQuery);

    try {
      const res = await fetch(`/api/tracker?q=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();

      if (data.success && data.data) {
        const user = data.data;
        setProfile({
          entityName: user.organizationName || user.name || 'Nama Pengguna',
          email: user.email,
          phone: user.phone || '-',
          contactPerson: user.name,
          address: user.address || '-',
          category: user.organizationType || 'Umum',
          role: user.role,
        });

        let resolvedDocsStatus = 'DOCS_SUBMITTED_PENDING_REVIEW';
        if (user.status === 'APPROVED') resolvedDocsStatus = 'APPROVED_ACTIVE';
        if (user.status === 'REJECTED') resolvedDocsStatus = 'REJECTED';
        if (user.status === 'SUSPENDED') resolvedDocsStatus = 'SUSPENDED';

        setDocsStatus(resolvedDocsStatus);

        const dateObj = new Date(user.createdAt);
        setSubmittedTime(dateObj.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }));

        const isApprovedStatus = user.status === 'APPROVED';

        setStepFlags({
          step1_registered: true,
          step2_profileFilled: !!user.address,
          step3_docsUploaded: user.status === 'PENDING' || user.status === 'APPROVED' || user.status === 'REJECTED',
          step4_audited: isApprovedStatus || user.status === 'REJECTED',
          step5_activated: isApprovedStatus,
        });

        setIsSearched(true);
        return;
      }
    } catch (err) {
      console.error('API Tracker error:', err);
    }

    // Fallback to localStorage if API fails or user not in DB
    try {
      const storedProfile = localStorage.getItem('replate_onboarding_profile');
      const storedDocs = localStorage.getItem('replate_onboarding_docs');

      let resolvedProfile: any = {
        entityName: 'Data Belum Lengkap',
        email: cleanQuery.includes('@') ? cleanQuery : 'Belum ada email',
        phone: '-',
        contactPerson: '-',
        address: '-',
        category: '-',
        role: '-',
      };

      let profileFromStorage = false;
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed && typeof parsed === 'object') {
            resolvedProfile = { ...resolvedProfile, ...parsed };
            profileFromStorage = true;
          }
        } catch (_) {}
      }

      setProfile(resolvedProfile);

      let resolvedDocsStatus = 'DOCS_SUBMITTED_PENDING_REVIEW';
      let resolvedSubmittedTime = '';
      let hasDocFiles = false;

      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          if (parsedDocs.status) resolvedDocsStatus = parsedDocs.status;
          if (parsedDocs.submittedAt) {
            const dateObj = new Date(parsedDocs.submittedAt);
            resolvedSubmittedTime = dateObj.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
          }
          hasDocFiles = !!(parsedDocs.nib || parsedDocs.ktp || parsedDocs.photo || parsedDocs.docs);
        } catch (_) {}
      }

      setDocsStatus(resolvedDocsStatus);
      setSubmittedTime(resolvedSubmittedTime || 'Hari ini');

      const isApprovedStatus = resolvedDocsStatus === 'APPROVED_ACTIVE';
      const step1 = profileFromStorage || !!storedProfile || cleanQuery.length > 5;
      const hasAddress = !!(resolvedProfile.address && resolvedProfile.address !== '-' || profileFromStorage);
      const step2 = step1 && (profileFromStorage || hasAddress);
      const step3 = !!storedDocs && (hasDocFiles || !!storedDocs);
      const step4 = isApprovedStatus;
      const step5 = isApprovedStatus;

      setStepFlags({
        step1_registered: step1,
        step2_profileFilled: step2,
        step3_docsUploaded: step3,
        step4_audited: step4,
        step5_activated: step5,
      });

      setIsSearched(true);
    } catch (_) {
      setIsSearched(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSimulateApprove = () => {
    try {
      const d = localStorage.getItem('replate_onboarding_docs') || '{}';
      const parsed = JSON.parse(d);
      localStorage.setItem('replate_onboarding_docs', JSON.stringify({ ...parsed, status: 'APPROVED_ACTIVE' }));
    } catch (_) {}
    setDocsStatus('APPROVED_ACTIVE');
    setStepFlags({
      step1_registered: true,
      step2_profileFilled: true,
      step3_docsUploaded: true,
      step4_audited: true,
      step5_activated: true,
    });
  };

  const isApproved = docsStatus === 'APPROVED_ACTIVE';

  const completedStepsCount = [
    stepFlags.step1_registered,
    stepFlags.step2_profileFilled,
    stepFlags.step3_docsUploaded,
    stepFlags.step4_audited,
    stepFlags.step5_activated,
  ].filter(Boolean).length;

  const progressPercentage = Math.round((completedStepsCount / 5) * 100);

  // Stepper Node Item for Mobile-First Vertical Stepper
  const renderMobileStep = (
    stepNum: number,
    completed: boolean,
    isCurrent: boolean,
    title: string,
    desc: string,
    isLast: boolean = false
  ) => {
    return (
      <div className="relative flex items-start gap-3.5">
        {/* Step Circle & Connector */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
              completed
                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400/40'
                : isCurrent
                ? 'bg-[#D4A843] text-slate-950 animate-pulse ring-2 ring-[#D4A843]/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {completed ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
          </div>
          {!isLast && (
            <div
              className={`w-0.5 h-10 transition-colors ${
                completed ? 'bg-emerald-500/80' : 'bg-slate-700/60'
              }`}
            />
          )}
        </div>

        {/* Step Text Info */}
        <div className="pt-0.5 space-y-0.5 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-black tracking-tight ${
                completed
                  ? 'text-emerald-400'
                  : isCurrent
                  ? 'text-[#D4A843]'
                  : 'text-slate-400'
              }`}
            >
              {title}
            </span>
            {completed && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.2 rounded-md border border-emerald-500/30">
                SELESAI
              </span>
            )}
            {isCurrent && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.2 rounded-md border border-amber-500/30">
                PROSES
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug font-medium">{desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#D4A843]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-80 sm:w-[450px] h-80 sm:h-[450px] rounded-full bg-[#1B3A5C]/35 blur-[120px] pointer-events-none" />

      {/* Poin 7: Mobile-First Sticky App Header Bar */}
      <header className="sticky top-0 z-40 bg-[#142C47]/90 backdrop-blur-md border-b border-[#2C5A8F]/60 px-4 py-3 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4A843]" />
            <span>Kembali ke Login</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
              Live Governance 24/7
            </span>
          </div>
        </div>
      </header>

      {/* Main Container - Mobile First Padded Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-5 relative z-10">
        {/* Title Header Card */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo variant="light" size="sm" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-[#D4A843]/30 rounded-full text-[10px] font-black uppercase tracking-wider text-[#D4A843]">
            <Sparkles className="w-3 h-3" />
            <span>Audit & Verification Tracker</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Status Pendaftaran Akun
          </h1>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            Pantau proses verifikasi berkas legalitas, sertifikasi BPOM, dan aktivasi akun Replate Anda secara real-time.
          </p>
        </div>

        {/* Poin 7: Mobile-Friendly Search Box */}
        <form
          onSubmit={handleSearch}
          className="bg-[#142C47]/95 border border-[#2C5A8F] rounded-2xl p-3 sm:p-4 shadow-xl space-y-2.5"
        >
          <label className="text-[11px] font-extrabold text-[#D4A843] uppercase tracking-wider block">
            Lacak dengan Kode Registrasi atau Email:
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Contoh: REPLATE-REG-2026-9812 atau email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0F1923] border border-slate-700 text-white placeholder:text-slate-500 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D4A843] font-mono transition-all"
            />
          </div>

          <Button
            variant="gold"
            size="md"
            type="submit"
            className="w-full py-2.5 text-xs font-black text-slate-950 shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span>Cek Status Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          {errorMessage && (
            <p className="text-[11px] text-rose-300 font-bold bg-rose-950/80 p-2 rounded-lg border border-rose-800 text-center">
              {errorMessage}
            </p>
          )}

          {/* Quick Preset Buttons for Evaluator / Jury */}
          <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 block text-center">
              Atau coba simulasi akun terdaftar:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => executeSearch('REPLATE-REG-2026-9812')}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-[#1B3A5C] text-slate-200 border border-slate-700 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Store className="w-3 h-3 text-[#D4A843]" />
                <span>Bakso Pak Kumis</span>
              </button>
              <button
                type="button"
                onClick={() => executeSearch('panti.kasih.ibu@replate.id')}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-[#1B3A5C] text-slate-200 border border-slate-700 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span>Panti Kasih Ibu</span>
              </button>
            </div>
          </div>
        </form>

        {/* Initial Empty State */}
        {!isSearched && (
          <div className="bg-[#142C47]/60 border border-[#2C5A8F]/40 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F1923] border border-slate-700 text-[#D4A843] flex items-center justify-center mx-auto shadow-inner">
              <ClipboardList className="w-6 h-6 text-[#D4A843]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white">Belum Ada Pelacakan Aktif</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Ketikkan kode registrasi (dari email pendaftaran Anda) atau klik tombol simulasi di atas untuk melihat status audit berkas.
              </p>
            </div>
          </div>
        )}

        {/* Real-Time Live Status Card (When Searched) */}
        {isSearched && profile && (
          <div className="space-y-4">
            {/* Status Summary Banner */}
            <div className="bg-[#142C47] border-2 border-[#2C5A8F] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 flex-wrap border-b border-slate-800 pb-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-wider bg-[#0F1923] px-2.5 py-1 rounded-md border border-amber-400/30 inline-block">
                    KODE: {regId}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {profile.entityName || 'Entitas Terdaftar'}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="truncate">{profile.contactPerson || 'Pengurus'}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{profile.phone || '-'}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isApproved ? (
                    <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>RESMI AKTIF</span>
                    </span>
                  ) : stepFlags.step3_docsUploaded ? (
                    <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>AUDIT BERJALAN</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-700 text-slate-300 font-black text-xs rounded-xl inline-flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>BELUM LENGKAP</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-300">Kemajuan Verifikasi</span>
                  <span className="text-[#D4A843] font-mono">
                    {completedStepsCount} / 5 Langkah ({progressPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0F1923] rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Mobile Native Stepper Timeline */}
              <div className="pt-2 space-y-1">
                <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block mb-3">
                  Timeline Tahapan Verifikasi Governance:
                </span>

                <div className="space-y-0.5 pl-1">
                  {renderMobileStep(
                    1,
                    stepFlags.step1_registered,
                    !stepFlags.step1_registered,
                    '1. Registrasi Akun & OTP WhatsApp',
                    stepFlags.step1_registered
                      ? `Tercatat pada ${submittedTime || 'sesi onboarding ini'}`
                      : 'Data akun belum ditemukan'
                  )}

                  {renderMobileStep(
                    2,
                    stepFlags.step2_profileFilled,
                    stepFlags.step1_registered && !stepFlags.step2_profileFilled,
                    '2. Profil Lembaga & Koordinat GPS',
                    stepFlags.step2_profileFilled
                      ? `Lokasi: ${profile.address || 'Surabaya'}`
                      : 'Menunggu pengisian profil alamat dan titik GPS'
                  )}

                  {renderMobileStep(
                    3,
                    stepFlags.step3_docsUploaded,
                    stepFlags.step2_profileFilled && !stepFlags.step3_docsUploaded,
                    '3. Unggah Berkas Legalitas (NIB / KTP)',
                    stepFlags.step3_docsUploaded
                      ? 'Dokumen legalitas wajib telah terunggah'
                      : 'Menunggu pengunggahan berkas legalitas usaha'
                  )}

                  {renderMobileStep(
                    4,
                    stepFlags.step4_audited,
                    stepFlags.step3_docsUploaded && !stepFlags.step4_audited,
                    '4. Audit Keabsahan Tim Governance BPOM',
                    stepFlags.step4_audited
                      ? 'Audit keabsahan selesai & disetujui'
                      : stepFlags.step3_docsUploaded
                      ? 'Proses audit sedang berlangsung (Maksimal 1x24 Jam Kerja)'
                      : 'Menunggu kelengkapan dokumen'
                  )}

                  {renderMobileStep(
                    5,
                    stepFlags.step5_activated,
                    false,
                    '5. Penerbitan Lisensi & Akun Aktif Penuh',
                    stepFlags.step5_activated
                      ? 'Akun telah aktif dan dapat langsung bertransaksi'
                      : 'Menunggu penyelesaian tahap audit 4',
                    true
                  )}
                </div>
              </div>

              {/* Registered Entity Quick Details */}
              <div className="p-3.5 bg-[#0F1923] rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Informasi Entitas Terdaftar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                    <span className="truncate">{profile.category || 'Usaha / Lembaga'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{profile.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{profile.address || 'Surabaya'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {!isApproved ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleSimulateApprove}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Simulasi SuperAdmin ACC & Aktifkan Akun</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center font-medium">
                      Gunakan tombol simulasi di atas untuk menguji alur persetujuan audit secara instan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" className="block w-full">
                      <Button
                        variant="gold"
                        size="md"
                        className="w-full py-3 text-xs font-black text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99]"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Akun Telah Aktif! Masuk ke Halaman Login →</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-4 pb-8 space-y-1 text-slate-500">
          <p className="text-[11px] font-bold font-mono">
            REPLATE GOVERNANCE SYSTEM &copy; {new Date().getFullYear()}
          </p>
          <p className="text-[10px]">
            Terkoneksi dengan Database Pengawasan Dinsos RI & Standarisasi Higiene BPOM
          </p>
        </div>
      </main>
    </div>
  );
}
