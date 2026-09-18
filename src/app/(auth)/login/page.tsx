'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from '../auth.module.css';
import { Logo } from '@/components/ui/Logo';
import { TOSModal } from '@/components/auth/TOSModal';
import { isDemoAccount } from '@/lib/mockDatabase';
import {
  Eye,
  EyeOff,
  Store,
  Building2,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

type RoleType = 'FOOD_PROVIDER' | 'FOOD_BENEFICIARY' | 'FOOD_CONSUMER' | 'RESCUE_VOLUNTEER' | 'SUPER_ADMIN';

export default function LoginPage() {
  const router = useRouter();

  const [activeRoleTab, setActiveRoleTab] = useState<RoleType>('FOOD_PROVIDER');
  // Poin 1: Default field login KOSONG saat pertama kali diakses
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTOSOpen, setIsTOSOpen] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Poin 2 & 3: 5 Roles dengan Ikon Khusus dan Hint Informatif & Ramah
  const roleConfigs: Record<
    RoleType,
    {
      label: string;
      shortDesc: string;
      icon: React.ReactNode;
      targetUrl: string;
      demoEmail: string;
      hint: string;
      registerPrompt: string;
      mockProfile: any;
    }
  > = {
    FOOD_PROVIDER: {
      label: 'Food Provider',
      shortDesc: 'Penyedia Surplus',
      icon: <Store className="w-4 h-4 text-[#D4A843]" />,
      targetUrl: '/dashboard/provider',
      demoEmail: 'bakso.pak.kumis@replate.id',
      hint: 'Khusus Restoran, Bakery, Supermarket, Hotel, & Katering yang ingin menyalurkan makanan berlebih berkualitas.',
      registerPrompt: 'Belum mendaftarkan usaha kuliner Anda?',
      mockProfile: {
        entityName: 'Warung Bakso Pak Kumis',
        contactPerson: 'Pak Kumis',
        phone: '0812-3456-7891',
        email: 'bakso.pak.kumis@replate.id',
        address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
        role: 'FOOD_PROVIDER',
        district: 'Surabaya Pusat',
        nib: 'NIB-9120481023912',
      },
    },
    FOOD_BENEFICIARY: {
      label: 'Food Beneficiary',
      shortDesc: 'Penerima Donasi',
      icon: <Building2 className="w-4 h-4 text-emerald-400" />,
      targetUrl: '/dashboard/yayasan',
      demoEmail: 'panti.kasih.ibu@replate.id',
      hint: 'Khusus Panti Asuhan, Yayasan Sosial, & Lembaga Kesejahteraan penerima donasi makanan gratis (Rp 0).',
      registerPrompt: 'Belum mendaftarkan yayasan atau panti Anda?',
      mockProfile: {
        entityName: 'Panti Asuhan Kasih Ibu Surabaya',
        contactPerson: 'Ibu Hajjah Maryam',
        phone: '0812-3456-7890',
        email: 'panti.kasih.ibu@replate.id',
        address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
        role: 'FOOD_BENEFICIARY',
        district: 'Surabaya Selatan',
        nib: 'DINSOS-YYS-88219',
      },
    },
    FOOD_CONSUMER: {
      label: 'Food Consumer',
      shortDesc: 'Konsumen Hemat',
      icon: <ShoppingBag className="w-4 h-4 text-sky-400" />,
      targetUrl: '/dashboard/consumer',
      demoEmail: 'budi.santoso@gmail.com',
      hint: 'Untuk Masyarakat Umum, Pekerja, & Mahasiswa pembeli makanan lezat berkualitas diskon 50-70% (Rescue Sale).',
      registerPrompt: 'Belum memiliki akun konsumen hemat?',
      mockProfile: {
        entityName: 'Budi Santoso',
        contactPerson: 'Budi Santoso',
        phone: '0813-4567-8901',
        email: 'budi.santoso@gmail.com',
        address: 'Ketintang, Surabaya Selatan',
        role: 'FOOD_CONSUMER',
        district: 'Surabaya Selatan',
      },
    },
    RESCUE_VOLUNTEER: {
      label: 'Rescue Volunteer',
      shortDesc: 'Relawan Armada',
      icon: <Truck className="w-4 h-4 text-orange-400" />,
      targetUrl: '/dashboard/rescue-partner',
      demoEmail: 'foodbank.surabaya@replate.id',
      hint: 'Untuk Armada Kurir Komunitas & Relawan yang membantu penjemputan serta pengantaran pangan aman.',
      registerPrompt: 'Belum bergabung sebagai armada relawan rescue?',
      mockProfile: {
        entityName: 'Komunitas Foodbank Surabaya Center',
        contactPerson: 'Mas Rizky Multazam',
        phone: '0819-8765-4321',
        email: 'foodbank.surabaya@replate.id',
        address: 'Posko Logistik Surabaya Raya',
        role: 'RESCUE_VOLUNTEER',
        district: 'Surabaya Pusat',
      },
    },
    SUPER_ADMIN: {
      label: 'SuperAdmin',
      shortDesc: 'Pengawas Platform',
      icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
      targetUrl: '/dashboard/admin',
      demoEmail: 'admin@replate.id',
      hint: 'Portal Tim Pengawas Platform, Audit Berkas Legalitas Dinsos RI, & Validasi Standar Higiene BPOM.',
      registerPrompt: 'Belum memiliki kredensial pengawas platform?',
      mockProfile: {
        entityName: 'Admin Pengawas Replate',
        contactPerson: 'Tim Pengawas Replate',
        phone: '0812-3456-7890',
        email: 'admin@replate.id',
        address: 'Gedung Pemkot Surabaya',
        role: 'SUPER_ADMIN',
        district: 'Surabaya',
      },
    },
  };

  const handleRoleTabChange = (role: RoleType) => {
    setActiveRoleTab(role);
    setFormData({
      email: roleConfigs[role].demoEmail,
      password: 'password123',
    });
  };

  const handleFillDemoCredentials = (role: RoleType) => {
    setActiveRoleTab(role);
    setFormData({
      email: roleConfigs[role].demoEmail,
      password: 'password123',
    });
  };

  const handleLoginWithCredentials = async (emailVal: string, passwordVal: string, chosenRole?: RoleType) => {
    setError('');
    setLoading(true);
    try {
      const selectedRole = chosenRole || activeRoleTab;
      let targetUrl = roleConfigs[selectedRole].targetUrl;

      // Bedakan Akun Demo vs Akun Fresh Terdaftar
      const isDemo = isDemoAccount(emailVal);
      let registeredUserRole: string | null = null;
      try {
        const p = localStorage.getItem('replate_onboarding_profile');
        if (p) {
          const parsedP = JSON.parse(p);
          if (parsedP.email && parsedP.email.toLowerCase() === emailVal.toLowerCase()) {
            registeredUserRole = parsedP.role;
          }
        }
        if (!registeredUserRole) {
          const rawReg = localStorage.getItem('replate_registered_user');
          if (rawReg) {
            const parsedReg = JSON.parse(rawReg);
            if (parsedReg.email && parsedReg.email.toLowerCase() === emailVal.toLowerCase()) {
              registeredUserRole = parsedReg.role;
            }
          }
        }
      } catch (_) {}

      try {
        if (isDemo) {
          localStorage.removeItem('replate_is_fresh_account');
          localStorage.setItem('replate_is_fresh_account', 'false');
          localStorage.setItem('replate_onboarding_profile', JSON.stringify(roleConfigs[selectedRole].mockProfile));
          if (selectedRole === 'FOOD_CONSUMER') {
            localStorage.setItem('replate_consumer_verification_status', 'BENEFICIARY_VERIFIED');
          }
        } else {
          localStorage.setItem('replate_is_fresh_account', 'true');
        }
      } catch (_) {}

      let effectiveRole = registeredUserRole || selectedRole;
      if (effectiveRole === 'FOOD_BENEFICIARY' || effectiveRole === 'YAYASAN' || emailVal.includes('panti') || emailVal.includes('yayasan')) {
        targetUrl = '/dashboard/yayasan';
      } else if (effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ADMIN' || emailVal.includes('admin')) {
        targetUrl = '/dashboard/admin';
      } else if (effectiveRole === 'RESCUE_VOLUNTEER' || effectiveRole === 'RESCUE_PARTNER' || emailVal.includes('foodbank') || emailVal.includes('volunteer')) {
        targetUrl = '/dashboard/rescue-partner';
      } else if (effectiveRole === 'FOOD_CONSUMER' || effectiveRole === 'CONSUMER' || emailVal.includes('budi') || emailVal.includes('consumer') || (!emailVal.includes('pak.kumis') && !emailVal.includes('rotiboy') && !emailVal.includes('majapahit') && !emailVal.includes('provider') && selectedRole === 'FOOD_CONSUMER')) {
        targetUrl = '/dashboard/consumer';
        effectiveRole = 'FOOD_CONSUMER';
      } else if (effectiveRole === 'FOOD_PROVIDER' || effectiveRole === 'PROVIDER' || emailVal.includes('pak.kumis') || emailVal.includes('provider') || emailVal.includes('rotiboy') || emailVal.includes('majapahit')) {
        targetUrl = '/dashboard/provider';
      }

      // Sync Cookies
      try {
        document.cookie = `replate_demo_session=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `replate_role=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
      } catch (_) {}

      try {
        await fetch('/api/auth/demo-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: effectiveRole, email: emailVal }),
        });
      } catch (_) {}

      try {
        await signIn('credentials', {
          email: emailVal,
          password: passwordVal,
          role: effectiveRole,
          redirect: false,
        });
      } catch (_) {}

      window.location.href = `${targetUrl}?demo_role=${effectiveRole}`;
    } catch (err) {
      console.error('Login error:', err);
      const selectedRole = chosenRole || activeRoleTab;
      window.location.href = `${roleConfigs[selectedRole].targetUrl}?demo_role=${selectedRole}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Mohon isi alamat email dan kata sandi Anda.');
      return;
    }
    await handleLoginWithCredentials(formData.email, formData.password, activeRoleTab);
  };

  const handleQuickDemoClick = async (role: RoleType) => {
    setError('');
    setLoading(true);
    try {
      const cfg = roleConfigs[role];
      try {
        localStorage.removeItem('replate_is_fresh_account');
        localStorage.setItem('replate_is_fresh_account', 'false');
        localStorage.setItem('replate_onboarding_profile', JSON.stringify(cfg.mockProfile));
        if (role === 'FOOD_CONSUMER') {
          localStorage.setItem('replate_consumer_verification_status', 'BENEFICIARY_VERIFIED');
        }
      } catch (_) {}

      setActiveRoleTab(role);
      setFormData({
        email: cfg.demoEmail,
        password: 'password123',
      });

      try {
        document.cookie = `replate_demo_session=${role}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `replate_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      } catch (_) {}

      try {
        await fetch('/api/auth/demo-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        });
      } catch (_) {}

      window.location.href = `${cfg.targetUrl}?demo_role=${role}`;
    } catch (err) {
      console.error('Quick demo error:', err);
      window.location.href = `${roleConfigs[role].targetUrl}?demo_role=${role}`;
    }
  };

  // Poin 4: Tombol Google login redirect ke future development
  const handleGoogleClick = () => {
    router.push('/future-development?feature=google-oauth&from=login');
  };

  return (
    <div className="min-h-screen bg-[#0F1923] relative flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full bg-[#D4A843]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[520px] h-[520px] rounded-full bg-[#1B3A5C]/30 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[30%] w-[360px] h-[360px] rounded-full bg-[#2D8A4E]/10 blur-[120px] pointer-events-none" />

      {/* Grid Overlay Texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, #D4A843 1px, transparent 1px), radial-gradient(circle at 75% 75%, #D4A843 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Poin 8: Revamp Tampilan Desktop Split-Screen yang Mewah, Seimbang, & Komprehensif */}
      <div className="max-w-6xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* LEFT COLUMN: BRAND HERO & IMPACT SHOWCASE (Desktop Enhanced) */}
        <div className="lg:col-span-5 text-white space-y-6 text-center lg:text-left hidden lg:block">
          <div className="space-y-4">
            <div className="inline-block">
              <Logo variant="light" size="lg" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-[0.25em] uppercase text-[#D4A843] bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-[#D4A843]/30">
                <Sparkles className="w-3.5 h-3.5" />
                WHERE SURPLUS FINDS PURPOSE
              </span>
              <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                Selamat Datang di Ekosistem <span className="text-[#D4A843]">Replate</span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Platform redistribusi pangan cerdas dan berkelanjutan yang menghubungkan penyedia surplus dengan panti asuhan dan konsumen hemat.
              </p>
            </div>
          </div>

          {/* Real-time Impact Highlight Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-[#142C47]/80 rounded-2xl border border-[#2C5A8F]/60 backdrop-blur-md space-y-1">
              <span className="text-2xl font-black text-[#D4A843] block">50.000+</span>
              <span className="text-[11px] text-slate-300 font-semibold block leading-tight">
                Porsi Makanan Siap Santap Diselamatkan
              </span>
            </div>
            <div className="p-3.5 bg-[#142C47]/80 rounded-2xl border border-[#2C5A8F]/60 backdrop-blur-md space-y-1">
              <span className="text-2xl font-black text-emerald-400 block">20+ Ton</span>
              <span className="text-[11px] text-slate-300 font-semibold block leading-tight">
                Emisi Gas Rumah Kaca (CO2e) Tercegah
              </span>
            </div>
          </div>

          {/* Institutional Compliance Badges */}
          <div className="p-4 bg-[#0F1923]/90 rounded-2xl border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Standarisasi & Kepatuhan Tata Kelola:
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-200 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>8 Checklist BPOM RI</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Terintegrasi Dinsos RI</span>
              </div>
            </div>
          </div>

          {/* Quick Tracking Status Prompt */}
          <div className="pt-2">
            <Link
              href="/track-status"
              className="inline-flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 font-extrabold bg-[#142C47] hover:bg-[#1B3A5C] px-4 py-2.5 rounded-xl border border-amber-400/40 shadow-sm transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>Pernah Mendaftar? Lacak Status Audit Berkas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE AUTH CARD (Mobile & Desktop) */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-[#142C47]/95 backdrop-blur-xl border-1.5 border-[#2C5A8F] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-5 text-left">
            {/* Mobile Header Logo */}
            <div className="text-center lg:hidden space-y-2 pb-2">
              <div className="flex justify-center">
                <Logo variant="light" size="md" />
              </div>
              <h2 className="text-xl font-black text-white">Selamat Datang Kembali</h2>
              <p className="text-xs text-slate-300">Masuk ke Sistem Redistribusi Makanan Replate</p>
            </div>

            {/* Desktop Form Title */}
            <div className="hidden lg:block space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">Masuk ke Akun Anda</h2>
              <p className="text-xs text-slate-300">
                Pilih peran atau masukkan kredensial akun terdaftar Anda untuk melanjutkan.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-medium flex items-start gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Poin 2: Unified 5-Role Selector with Icons */}
            <div className="bg-[#0F1923] p-3.5 sm:p-4 rounded-2xl border border-[#2C5A8F] space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-[#D4A843] uppercase tracking-wider block">
                  Pilih Peran Akun:
                </span>
              </div>

              {/* 5-Role Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(roleConfigs) as RoleType[]).map((rKey) => {
                  const cfg = roleConfigs[rKey];
                  const isSelected = activeRoleTab === rKey;
                  return (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => handleRoleTabChange(rKey)}
                      className={`p-2.5 rounded-xl text-left transition-all border font-bold text-xs flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B3A5C] text-white border-[#D4A843] shadow-md ring-2 ring-[#D4A843]/40'
                          : 'bg-[#142C47]/60 hover:bg-[#1B3A5C] text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="shrink-0">{cfg.icon}</div>
                      <div className="truncate">
                        <span className="block truncate">{cfg.label}</span>
                        <span className="text-[9px] text-slate-400 font-normal block truncate">
                          {cfg.shortDesc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Poin 3: Friendly Role Hint */}
              <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-[11px] text-amber-300/90 leading-relaxed font-medium">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                <span>{roleConfigs[activeRoleTab].hint}</span>
              </div>

              {/* Juri / Evaluator Quick Login Helper */}
              <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                <span>Ingin langsung uji coba tanpa mengetik?</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoClick(activeRoleTab)}
                  className="text-[#D4A843] hover:underline font-extrabold cursor-pointer inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#D4A843]" />
                  <span>Masuk 1-Klik Demo ({roleConfigs[activeRoleTab].label})</span>
                </button>
              </div>
            </div>

            {/* Active Demo Account Highlights Card */}
            <div className="p-4 rounded-2xl bg-[#0F1923] border border-[#D4A843]/40 space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#D4A843] flex items-center justify-center shrink-0 border border-[#D4A843]/30">
                    {roleConfigs[activeRoleTab].icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Akun Demo Terpilih:
                    </span>
                    <strong className="text-sm font-black text-white block">
                      {roleConfigs[activeRoleTab].mockProfile?.entityName || roleConfigs[activeRoleTab].label}
                    </strong>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black rounded-lg">
                  ✓ 100% Data Tersinkronisasi
                </span>
              </div>

              <div className="p-2.5 bg-[#142C47]/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                <span className="text-slate-400">Email Demo:</span>
                <span className="font-mono text-amber-300 font-bold">{roleConfigs[activeRoleTab].demoEmail}</span>
              </div>

              {/* PRIMARY 1-CLICK DEMO LOGIN BUTTON */}
              <button
                type="button"
                onClick={() => handleQuickDemoClick(activeRoleTab)}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#D4A843] via-[#E5B954] to-[#C29433] hover:brightness-105 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/40"
              >
                {loading ? (
                  <span>Mempersiapkan Sesi {roleConfigs[activeRoleTab].label}...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Masuk Instan Sebagai {roleConfigs[activeRoleTab].label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>

            {/* Toggle Manual Credentials */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-xs text-slate-400 hover:text-slate-200 font-bold underline cursor-pointer"
              >
                {showManualForm ? 'Tutup Form Kredensial Manual' : 'Atau Masuk dengan Form Kredensial Email'}
              </button>
            </div>

            {/* OPTIONAL COLLAPSIBLE MANUAL LOGIN FORM */}
            {showManualForm && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in duration-150">
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Alamat Email Akun</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="nama@domain.id atau email terdaftar"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <p className="text-[11px] text-slate-300 font-normal mt-1 leading-tight">
                    Email akun demo terisi otomatis sesuai peran di atas.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.formInput} pr-11`}
                      placeholder="Masukkan kata sandi akun Anda"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4A843] transition-colors p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal mt-1 leading-tight">
                    Kata sandi akun demo default: <span className="font-mono text-amber-300">password123</span>
                  </p>
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? 'Memproses Autentikasi...' : `Masuk Sebagai ${roleConfigs[activeRoleTab].label}`}
                </button>
              </form>
            )}

            {/* Google OAuth Redirect ke Future Development */}
            <div className="space-y-2.5 pt-1">
              <div className="relative my-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative inline-block px-3 bg-[#142C47] text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Opsi Akses Lainnya
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-300 active:scale-[0.99]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Masuk Dengan Akun Google (Fase 2)</span>
              </button>
            </div>

            {/* Registration Future Development Banner */}
            <div className="p-4 bg-[#0F1923] rounded-2xl border border-amber-500/30 space-y-2 pt-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#D4A843] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
                  Pendaftaran Mandiri: Roadmap Future Development
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Fase 2 (Q3 2026)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fitur pendaftaran akun mandiri sedang dalam proses integrasi regulasi e-KYC Dukcapil RI dan sertifikasi SOP BPOM terpusat. Untuk keperluan pengujian dan penjurian lomba web development saat ini, seluruh evaluasi diwajibkan menggunakan <strong>5 Akun Demo Siap Pakai</strong> di atas.
              </p>
              <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                <Link
                  href="/future-development?feature=register"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 hover:text-amber-200 underline"
                >
                  <span>Pelajari Roadmap Registrasi Mandiri (Fase 2)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsTOSOpen(true)}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Syarat &amp; Ketentuan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Syarat dan Ketentuan Modal */}
      <TOSModal isOpen={isTOSOpen} onClose={() => setIsTOSOpen(false)} />
    </div>
  );
}
