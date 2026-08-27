'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function TrackRegistrationStatusPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [docsStatus, setDocsStatus] = useState<string>('DOCS_SUBMITTED_PENDING_REVIEW');
  const [regId, setRegId] = useState('');
  const [submittedTime, setSubmittedTime] = useState('Hari ini, 09:00 WIB');
  const [isSearched, setIsSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const executeSearch = (targetQuery: string) => {
    setErrorMessage('');
    const cleanQuery = targetQuery.trim();
    if (!cleanQuery) {
      setErrorMessage('Silakan masukkan Kode Tracking atau Email Anda terlebih dahulu.');
      return;
    }

    setRegId(cleanQuery.toUpperCase());
    setSearchQuery(cleanQuery);

    try {
      // Check stored onboarding data in localStorage
      const storedProfile = localStorage.getItem('replate_onboarding_profile');
      const storedDocs = localStorage.getItem('replate_onboarding_docs');

      let resolvedProfile = {
        entityName: 'Warung Bakso Pak Kumis Surabaya',
        email: 'bakso.pak.kumis@replate.id',
        phone: '0812-3456-7890',
        contactPerson: 'Mas Doni',
        address: 'Jl. Raya Gubeng No. 88, Surabaya',
        category: 'RESTAURANT',
        role: 'FOOD_PROVIDER',
      };

      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed && typeof parsed === 'object') {
            resolvedProfile = { ...resolvedProfile, ...parsed };
          }
        } catch (_) {}
      }

      if (cleanQuery.includes('@')) {
        resolvedProfile.email = cleanQuery;
      }

      setProfile(resolvedProfile);

      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          if (parsedDocs.status) setDocsStatus(parsedDocs.status);
          if (parsedDocs.submittedAt) {
            const dateObj = new Date(parsedDocs.submittedAt);
            setSubmittedTime(dateObj.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }));
          }
        } catch (_) {}
      } else {
        setDocsStatus('DOCS_SUBMITTED_PENDING_REVIEW');
        setSubmittedTime('24 Agustus 2026, 09:00 WIB');
      }

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
  };

  const isApproved = docsStatus === 'APPROVED_ACTIVE';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar />

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
              <span>Cari Status ➔</span>
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
              <div className="w-14 h-14 bg-slate-100 border border-slate-200 text-[#1B3A5C] rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
                📋
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
                  ) : (
                    <span className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs inline-block">
                      AUDIT SEDANG BERLANGSUNG
                    </span>
                  )}
                </div>
              </div>

              {/* 5-Step Timeline Graphic */}
              <div className="space-y-4 text-xs">
                <span className="font-black text-amber-300 uppercase tracking-wider block">
                  Timeline Proses Verifikasi Governance:
                </span>

                <div className="relative pl-6 space-y-5 border-l-2 border-[#2C5A8F]">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                      ✓
                    </span>
                    <div className="font-bold">
                      <span className="text-emerald-300 font-extrabold">1. Registrasi Akun & Verifikasi OTP WA</span>
                      <span className="text-[10px] text-slate-400 font-mono block font-normal">Tercatat pada {submittedTime}</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                      ✓
                    </span>
                    <div className="font-bold">
                      <span className="text-emerald-300 font-extrabold">2. Pengisian Profil Usaha & Alamat GPS</span>
                      <span className="text-[10px] text-slate-300 font-mono block font-normal">Lokasi: {profile.address || 'Surabaya'}</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                      ✓
                    </span>
                    <div className="font-bold">
                      <span className="text-emerald-300 font-extrabold">3. Unggah Berkas Legalitas (NIB, KTP, Foto)</span>
                      <span className="text-[10px] text-slate-300 font-mono block font-normal">3 Berkas Fisik Wajib Terunggah Lengkap</span>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 font-black text-[11px] flex items-center justify-center ${
                      isApproved
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-amber-400 border-amber-300 text-slate-950 animate-pulse'
                    }`}>
                      {isApproved ? '✓' : '4'}
                    </span>
                    <div className="font-bold">
                      <span className={isApproved ? 'text-emerald-300 font-extrabold' : 'text-amber-300 font-extrabold'}>
                        4. Audit Keabsahan Oleh Tim Governance Admin
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium block">
                        {isApproved ? 'Audit Selesai & Valid' : 'Estimasi Waktu Audit: Maksimal 1x24 Jam Kerja'}
                      </span>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 font-black text-[11px] flex items-center justify-center ${
                      isApproved
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-slate-800 border-slate-600 text-slate-400'
                    }`}>
                      {isApproved ? '✓' : '5'}
                    </span>
                    <div className="font-bold">
                      <span className={isApproved ? 'text-emerald-300 font-extrabold' : 'text-slate-400 font-medium'}>
                        5. Aktivasi Akun & Penerbitan Sertifikat BPOM Replate
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium block">
                        {isApproved ? 'Akun telah dapat digunakan penuh' : 'Menunggu Penyelesaian Audit Step 4'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                    <span>Simulasi SuperAdmin ACC & Aktifkan Akun ➔</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="gold" size="lg" className="w-full font-black text-slate-950 py-3 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                      <span>Masuk Ke Halaman Login ➔</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
