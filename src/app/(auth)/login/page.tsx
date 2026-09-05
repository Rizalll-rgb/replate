'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { Logo } from '@/components/ui/Logo';
import { TOSModal } from '@/components/auth/TOSModal';
import { isDemoAccount } from '@/lib/mockDatabase';
import { Eye, EyeOff } from 'lucide-react';

type RoleType = 'FOOD_PROVIDER' | 'FOOD_BENEFICIARY' | 'FOOD_CONSUMER' | 'RESCUE_VOLUNTEER' | 'SUPER_ADMIN';

export default function LoginPage() {
  const router = useRouter();

  const [activeRoleTab, setActiveRoleTab] = useState<RoleType>('FOOD_PROVIDER');
  const [formData, setFormData] = useState({ email: 'bakso.pak.kumis@replate.id', password: 'password123' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTOSOpen, setIsTOSOpen] = useState(false);

  const roleConfigs: Record<RoleType, { label: string; icon: string; targetUrl: string; demoEmail: string; hint: string; mockProfile: any }> = {
    FOOD_PROVIDER: {
      label: 'Food Provider',
      icon: '',
      targetUrl: '/dashboard/provider',
      demoEmail: 'bakso.pak.kumis@replate.id',
      hint: 'Untuk Restoran, Bakery, Supermarket, & Hotel penyedia makanan surplus.',
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
      icon: '',
      targetUrl: '/dashboard/yayasan',
      demoEmail: 'panti.kasih.ibu@replate.id',
      hint: 'Untuk Panti Asuhan, Yayasan Sosial, & Shelter penerima donasi makanan gratis.',
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
      icon: '',
      targetUrl: '/dashboard/consumer',
      demoEmail: 'budi.santoso@gmail.com',
      hint: 'Untuk Konsumen Umum / Anak Kos pembeli makanan diskon murah Rescue Sale.',
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
      label: 'Food Rescue Volunteer',
      icon: '',
      targetUrl: '/dashboard/rescue-partner',
      demoEmail: 'foodbank.surabaya@replate.id',
      hint: 'Untuk Armada Kurir Relawan Komunitas pengantar bantuan makanan.',
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
      icon: '',
      targetUrl: '/dashboard/admin',
      demoEmail: 'admin@replate.id',
      hint: 'Untuk Tim Pengawas Platform, Verifikasi Berkas, & Kebijakan BPOM.',
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
    try {
      localStorage.removeItem('replate_is_fresh_account');
      localStorage.setItem('replate_is_fresh_account', 'false');
      localStorage.setItem('replate_onboarding_profile', JSON.stringify(roleConfigs[role].mockProfile));
      if (role === 'FOOD_CONSUMER') {
        localStorage.setItem('replate_consumer_verification_status', 'BENEFICIARY_VERIFIED');
      }
    } catch (_) {}
  };

  const handleLoginWithCredentials = async (emailVal: string, passwordVal: string, chosenRole?: RoleType) => {
    setError('');
    setLoading(true);
    try {
      const selectedRole = chosenRole || activeRoleTab;
      let targetUrl = roleConfigs[selectedRole].targetUrl;

      // Poin 5: Bedakan Akun Demo vs Akun Fresh Terdaftar
      const isDemo = isDemoAccount(emailVal);
      let registeredUserRole: string | null = null;
      try {
        const rawReg = localStorage.getItem('replate_registered_user');
        if (rawReg) {
          const parsedReg = JSON.parse(rawReg);
          if (parsedReg.email && parsedReg.email.toLowerCase() === emailVal.toLowerCase()) {
            registeredUserRole = parsedReg.role;
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
          // Akun buatan baru/fresh: jaga flag fresh tetap 'true'
          localStorage.setItem('replate_is_fresh_account', 'true');
        }
      } catch (_) {}

      // Tentukan target URL berdasarkan role terdaftar atau pilihan tab aktif
      const effectiveRole = registeredUserRole || selectedRole;
      if (effectiveRole === 'FOOD_BENEFICIARY' || effectiveRole === 'YAYASAN' || emailVal.includes('panti') || emailVal.includes('yayasan')) {
        targetUrl = '/dashboard/yayasan';
      } else if (effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ADMIN' || emailVal.includes('admin')) {
        targetUrl = '/dashboard/admin';
      } else if (effectiveRole === 'RESCUE_VOLUNTEER' || effectiveRole === 'RESCUE_PARTNER' || emailVal.includes('foodbank') || emailVal.includes('volunteer')) {
        targetUrl = '/dashboard/rescue-partner';
      } else if (effectiveRole === 'FOOD_PROVIDER' || effectiveRole === 'PROVIDER' || emailVal.includes('pak.kumis') || emailVal.includes('provider') || emailVal.includes('rotiboy') || emailVal.includes('majapahit')) {
        targetUrl = '/dashboard/provider';
      } else if (effectiveRole === 'FOOD_CONSUMER' || effectiveRole === 'CONSUMER' || emailVal.includes('budi') || emailVal.includes('consumer')) {
        targetUrl = '/dashboard/consumer';
      }

      const result = await signIn('credentials', {
        email: emailVal,
        password: passwordVal,
        redirect: false,
      });

      if (result?.error) {
        // Jika demo fallback atau pengguna offline, arahkan ke dashboard yang sesuai
        window.location.href = targetUrl;
      } else {
        window.location.href = targetUrl;
      }
    } catch (err) {
      console.error('Login error:', err);
      const selectedRole = chosenRole || activeRoleTab;
      window.location.href = roleConfigs[selectedRole].targetUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLoginWithCredentials(formData.email, formData.password, activeRoleTab);
  };

  const handleQuickDemoClick = (role: RoleType) => {
    try {
      localStorage.removeItem('replate_is_fresh_account');
      localStorage.setItem('replate_is_fresh_account', 'false');
      localStorage.setItem('replate_onboarding_profile', JSON.stringify(roleConfigs[role].mockProfile));
      if (role === 'FOOD_CONSUMER') {
        localStorage.setItem('replate_consumer_verification_status', 'BENEFICIARY_VERIFIED');
      }
    } catch (_) {}

    handleRoleTabChange(role);
    handleLoginWithCredentials(roleConfigs[role].demoEmail, 'password123', role);
  };

  const handleGoogleOAuthClick = async () => {
    setLoading(true);
    try {
      const targetUrl = roleConfigs[activeRoleTab].targetUrl;
      await signIn('google', { callbackUrl: targetUrl });
    } catch (err) {
      console.error('Google OAuth sign in error:', err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg} />
      <div className={`${styles.authGlow} ${styles.glow1}`} />
      <div className={`${styles.authGlow} ${styles.glow2}`} />

      <div className={`${styles.authCard} max-w-lg w-full`}>
        <div className={styles.authLogo}>
          <Logo variant="light" size="lg" />
        </div>

        <h1 className={styles.authTitle}>Selamat Datang Kembali</h1>
        <p className={styles.authSubtitle}>Masuk ke Sistem Redistribusi Makanan Replate</p>

        {error && (
          <div className="p-3.5 mb-4 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-medium flex items-start gap-2 shadow-sm text-left">
            <span className="text-sm">ℹ️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Unified 1-Click Quick Demo Login Presets & Role Selector */}
        <div className="mb-5 bg-[#0F1923] p-4 rounded-2xl border border-[#2C5A8F] space-y-3 text-left shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#D4A843] uppercase tracking-wider block">
              Pilih Peran & Demo Login 1-Klik (Juri Penilai)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              5 ROLES READY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {(Object.keys(roleConfigs) as RoleType[]).map((rKey) => {
              const cfg = roleConfigs[rKey];
              const isSelected = activeRoleTab === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => handleQuickDemoClick(rKey)}
                  className={`p-2.5 rounded-xl text-left transition-all border font-bold text-xs flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B3A5C] text-white border-[#D4A843] shadow-md ring-2 ring-[#D4A843]/40'
                      : 'bg-[#142C47]/60 hover:bg-[#1B3A5C] text-slate-300 border-slate-700'
                  }`}
                >
                  <span className="truncate">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-amber-300/90 font-medium italic pt-1 border-t border-slate-800">
            {roleConfigs[activeRoleTab].hint}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Alamat Email Akun</label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="nama@domain.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <p className="text-[11px] text-slate-300 font-normal mt-1 leading-tight">
              Gunakan email yang Anda daftarkan di platform Replate.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Kata Sandi</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${styles.formInput} pr-11`}
                placeholder="Masukkan kata sandi Anda"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
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
              Kata sandi akun Anda (minimal 6 karakter).
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-[#D4A843] focus:ring-[#D4A843]"
              />
              <span>Ingat saya di perangkat ini</span>
            </label>
            <button
              type="button"
              onClick={() => setIsTOSOpen(true)}
              className="text-[#D4A843] hover:underline font-bold"
            >
              Baca TOS Platform 
            </button>
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? 'Memproses Authentikasi...' : `Masuk Sebagai ${roleConfigs[activeRoleTab].label} `}
          </button>

          {/* Google Sign In Section */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative inline-block px-3 bg-[#0F1923] text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              Atau Masuk Cepat OAuth
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleOAuthClick}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Masuk Dengan Akun Google </span>
          </button>
        </form>

        <div className={`${styles.authFooter} space-y-2 pt-4 border-t border-slate-800`}>
          <div>
            {activeRoleTab === 'FOOD_CONSUMER' ? 'Belum memiliki akun konsumen? ' : 'Belum mendaftarkan usaha / instansi? '}
            <Link href={`/register?role=${activeRoleTab}`} className="font-extrabold text-[#D4A843] hover:underline">
              Daftar Akun Baru 
            </Link>
          </div>
          <div className="pt-1">
            <Link
              href="/track-status"
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-extrabold bg-[#142C47] px-3.5 py-1.5 rounded-xl border border-amber-400/40 shadow-xs transition-all"
            >
              <span>Pernah Mendaftar? Cek Live Status Audit </span>
            </Link>
          </div>
        </div>
      </div>

      <TOSModal isOpen={isTOSOpen} onClose={() => setIsTOSOpen(false)} />
    </div>
  );
}
