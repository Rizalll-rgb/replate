'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Check, ClipboardList } from 'lucide-react';

import { useSession } from 'next-auth/react';
import DashboardLayout from '@/app/dashboard/layout';

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

  // Dynamic step completion flags — NOT hardcoded
  const [stepFlags, setStepFlags] = useState({
    step1_registered: false,    // Has registration data (profile exists)
    step2_profileFilled: false, // Has address/GPS data filled
    step3_docsUploaded: false,  // Has docs uploaded
    step4_audited: false,       // Audit completed (APPROVED_ACTIVE)
    step5_activated: false,     // Account activated (APPROVED_ACTIVE)
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const queryId = new URLSearchParams(window.location.search).get('id');

        // Only auto-search if an explicit ID query param was passed in the URL (e.g. from onboarding redirect)
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
      setErrorMessage('Silakan masukkan Kode Tracking atau Email Anda terlebih dahulu.');
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

    // Fallback to localStorage if API fails or user not found in DB
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
      setSubmittedTime(resolvedSubmittedTime);

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

  // Helper: render a single step node
  const renderStep = (
    stepNum: number,
    completed: boolean,
    isCurrent: boolean,
    label: React.ReactNode,
    sub: React.ReactNode
  ) => {
    const bgClass = completed
      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
      : isCurrent
      ? 'bg-amber-400 border-amber-300 text-slate-950 animate-pulse'
      : 'bg-slate-800 border-slate-600 text-slate-400';

    const labelClass = completed
      ? 'text-emerald-300 font-extrabold'
      : isCurrent
      ? 'text-amber-300 font-extrabold'
      : 'text-slate-400 font-medium';

    return (
      <div className="relative">
        <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 font-black text-[11px] flex items-center justify-center ${bgClass}`}>
          {completed ? <Check className="w-3.5 h-3.5" /> : stepNum}
        </span>
        <div className="font-bold">
          <span className={labelClass}>{label}</span>
          <span className="text-[10px] text-slate-300 font-mono block font-normal">{sub}</span>
        </div>
      </div>
    );
  };

  const content = (
    <div className="min-h-screen flex flex-col font-sans w-full bg-transparent">
      {!session && <Navbar />}

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-12">
        <div className="max-w-2xl w-full space-y-6">
          {/* Header Card */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4A843] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs">
              <span>REPLATE GOVERNANCE TRACKER 24/7</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B3A5C] tracking-tight">
              Pengecekan Status Pendaftaran Akun
            </h1>
            <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
              Pantau status peninjauan berkas legalitas dan lisensi platform Anda secara real-time kapan saja.
            </p>
          </div>

          {/* Search Bar Input */}
          <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-300 shadow-md flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ketik Kode Tracking (contoh: REPLATE-REG-2026-9812), Email, atau No. WA"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:border-[#1B3A5C] focus:bg-white font-mono"
              />
            </div>
            <Button variant="gold" size="md" type="submit" className="font-black text-xs text-slate-950 py-3 px-6 shadow-xs shrink-0 cursor-pointer">
              <span>Cari Status →</span>
            </Button>
          </form>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
              {errorMessage}
            </div>
          )}

          {/* Initial Clean Empty State (When not searched yet) */}
          {!isSearched && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-slate-100 border border-slate-200 text-[#1B3A5C] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <ClipboardList className="w-7 h-7 text-[#1B3A5C]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#1B3A5C]">
                  Belum Ada Kode Tracking yang Dicari
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  Ketik Kode Registrasi (yang didapat saat mendaftar) atau Email akun Anda pada kolom di atas untuk melacak perkembangan audit.
                </p>
              </div>

              {/* Quick Preset Buttons for Evaluation */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Atau coba klik contoh simulasi akun terdaftar:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => executeSearch('REPLATE-REG-2026-9812')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    REPLATE-REG-2026-9812 (Bakso Pak Kumis)
                  </button>
                  <button
                    type="button"
                    onClick={() => executeSearch('panti.kasih.ibu@replate.id')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    panti.kasih.ibu@replate.id
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Timeline Status Card (Only shown after search) */}
          {isSearched && profile && (
            <div className="bg-[#1B3A5C] border-2 border-[#2C5A8F] text-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Header Info */}
              <div className="border-b border-[#2C5A8F] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-black text-amber-300 block uppercase tracking-wider bg-slate-900/70 px-3 py-1 rounded-lg border border-amber-400/30 w-fit mb-1">
                    KODE TRACKING: {regId}
                  </span>
                  <h3 className="text-xl font-black text-white">{profile.entityName || 'Entitas Terdaftar'}</h3>
                  <span className="text-xs text-slate-300 font-medium block">
                    Penanggung Jawab: {profile.contactPerson || 'Pengurus'} ({profile.phone || '0812-xxxx-xxxx'})
                  </span>
                </div>

                <div className="shrink-0">
                  {isApproved ? (
                    <span className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-xs inline-block">
                      AKUN RESMI AKTIF
                    </span>
                  ) : stepFlags.step3_docsUploaded ? (
                    <span className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs inline-block">
                      AUDIT SEDANG BERLANGSUNG
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-slate-600 text-slate-200 font-black text-xs rounded-xl shadow-xs inline-block">
                      PENDAFTARAN BELUM LENGKAP
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic 5-Step Timeline */}
              <div className="space-y-4 text-xs">
                <span className="font-black text-amber-300 uppercase tracking-wider block">
                  Timeline Proses Verifikasi Governance:
                </span>

                <div className="relative pl-6 space-y-5 border-l-2 border-[#2C5A8F]">
                  {/* Step 1: Registrasi */}
                  {renderStep(
                    1,
                    stepFlags.step1_registered,
                    !stepFlags.step1_registered,
                    '1. Registrasi Akun & Verifikasi OTP WA',
                    stepFlags.step1_registered
                      ? `Tercatat pada ${submittedTime || 'sesi onboarding ini'}`
                      : 'Belum ada data registrasi ditemukan'
                  )}

                  {/* Step 2: Profil & GPS */}
                  {renderStep(
                    2,
                    stepFlags.step2_profileFilled,
                    stepFlags.step1_registered && !stepFlags.step2_profileFilled,
                    '2. Pengisian Profil Usaha & Alamat GPS',
                    stepFlags.step2_profileFilled
                      ? `Lokasi: ${profile.address || 'Surabaya'}`
                      : 'Profil & alamat GPS belum diisi'
                  )}

                  {/* Step 3: Berkas Legalitas */}
                  {renderStep(
                    3,
                    stepFlags.step3_docsUploaded,
                    stepFlags.step2_profileFilled && !stepFlags.step3_docsUploaded,
                    '3. Unggah Berkas Legalitas (NIB, KTP, Foto)',
                    stepFlags.step3_docsUploaded
                      ? '3 Berkas Fisik Wajib Terunggah Lengkap'
                      : 'Berkas legalitas belum diunggah'
                  )}

                  {/* Step 4: Audit */}
                  {renderStep(
                    4,
                    stepFlags.step4_audited,
                    stepFlags.step3_docsUploaded && !stepFlags.step4_audited,
                    '4. Audit Keabsahan Oleh Tim Governance Admin',
                    stepFlags.step4_audited
                      ? 'Audit Selesai & Valid'
                      : stepFlags.step3_docsUploaded
                      ? 'Estimasi Waktu Audit: Maksimal 1x24 Jam Kerja'
                      : 'Menunggu kelengkapan berkas legalitas'
                  )}

                  {/* Step 5: Aktivasi */}
                  {renderStep(
                    5,
                    stepFlags.step5_activated,
                    false,
                    '5. Aktivasi Akun & Penerbitan Sertifikat BPOM Replate',
                    stepFlags.step5_activated
                      ? 'Akun telah dapat digunakan penuh'
                      : 'Menunggu Penyelesaian Audit Step 4'
                  )}
                </div>
              </div>

              {/* Progress indicator */}
              {!isApproved && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Progress Pendaftaran</span>
                    <span>
                      {[
                        stepFlags.step1_registered,
                        stepFlags.step2_profileFilled,
                        stepFlags.step3_docsUploaded,
                        stepFlags.step4_audited,
                        stepFlags.step5_activated,
                      ].filter(Boolean).length} / 5 Langkah
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${([
                          stepFlags.step1_registered,
                          stepFlags.step2_profileFilled,
                          stepFlags.step3_docsUploaded,
                          stepFlags.step4_audited,
                          stepFlags.step5_activated,
                        ].filter(Boolean).length / 5) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Box */}
              {!isApproved ? (
                <div className="p-4 bg-[#0F1923] border border-[#2C5A8F] rounded-2xl space-y-2.5 text-center shadow-lg pt-3">
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                    SIMULASI TESTING ACC SUPERADMIN
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulateApprove}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Simulasi SuperAdmin ACC & Aktifkan Akun →</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="gold" size="lg" className="w-full font-black text-slate-950 py-3 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                      <span>Masuk Ke Halaman Login →</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
          {/* Footer Card */}
          <div className="text-center pt-6 pb-4">
            <p className="text-[11px] font-bold text-slate-500 font-mono">
              SISTEM TERINTEGRASI REPLATE ID &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </main>

      {!session && <Footer />}
    </div>
  );

  if (session) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return content;
}
