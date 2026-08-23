'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { Logo } from '@/components/ui/Logo';
import { TOSModal } from '@/components/auth/TOSModal';

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

  const roleConfigs: Record<RoleType, { label: string; icon: string; targetUrl: string; demoEmail: string; hint: string }> = {
    FOOD_PROVIDER: {
      label: 'Food Provider',
      icon: '🏪',
      targetUrl: '/dashboard/provider',
      demoEmail: 'bakso.pak.kumis@replate.id',
      hint: 'Untuk Restoran, Bakery, Supermarket, & Hotel penyedia makanan surplus.',
    },
    FOOD_BENEFICIARY: {
      label: 'Food Beneficiary',
      icon: '🏠',
      targetUrl: '/dashboard/yayasan',
      demoEmail: 'panti.kasih.ibu@replate.id',
      hint: 'Untuk Panti Asuhan, Yayasan Sosial, & Shelter penerima donasi makanan gratis.',
    },
    FOOD_CONSUMER: {
      label: 'Food Consumer',
      icon: '🛒',
      targetUrl: '/dashboard/consumer',
      demoEmail: 'budi.santoso@gmail.com',
      hint: 'Untuk Konsumen Umum / Anak Kos pembeli makanan diskon murah Rescue Sale.',
    },
    RESCUE_VOLUNTEER: {
      label: 'Rescue Volunteer',
      icon: '🛵',
      targetUrl: '/dashboard/rescue-partner',
      demoEmail: 'foodbank.surabaya@replate.id',
      hint: 'Untuk Armada Kurir Relawan Komunitas pengantar bantuan makanan.',
    },
    SUPER_ADMIN: {
      label: 'SuperAdmin',
      icon: '👑',
      targetUrl: '/dashboard/admin',
      demoEmail: 'admin@replate.id',
      hint: 'Untuk Tim Pengawas Platform, Verifikasi Berkas, & Kebijakan BPOM.',
    },
  };

  const handleRoleTabChange = (role: RoleType) => {
    setActiveRoleTab(role);
    setFormData({
      email: roleConfigs[role].demoEmail,
      password: 'password123',
    });
  };

  const handleLoginWithCredentials = async (emailVal: string, passwordVal: string) => {
    setError('');
    setLoading(true);
    try {
      let targetUrl = roleConfigs[activeRoleTab].targetUrl;

      if (emailVal.includes('panti')) {
        targetUrl = '/dashboard/yayasan';
      } else if (emailVal.includes('admin')) {
        targetUrl = '/dashboard/admin';
      } else if (emailVal.includes('foodbank') || emailVal.includes('volunteer')) {
        targetUrl = '/dashboard/rescue-partner';
      } else if (emailVal.includes('budi') || emailVal.includes('gmail')) {
        targetUrl = '/dashboard/consumer';
      } else if (emailVal.includes('pak.kumis') || emailVal.includes('provider')) {
        targetUrl = '/dashboard/provider';
      }

      await signIn('credentials', {
        email: emailVal,
        password: passwordVal,
        callbackUrl: targetUrl,
      });
    } catch (err) {
      console.error('Login error:', err);
      setError('Email atau password tidak sesuai.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLoginWithCredentials(formData.email, formData.password);
  };

  const handleQuickDemoClick = (role: RoleType) => {
    handleRoleTabChange(role);
    handleLoginWithCredentials(roleConfigs[role].demoEmail, 'password123');
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

        {error && <div className={`${styles.formAlert} ${styles.alertError}`}>{error}</div>}

        {/* Unified 1-Click Quick Demo Login Presets & Role Selector */}
        <div className="mb-5 bg-[#0F1923] p-4 rounded-2xl border border-[#2C5A8F] space-y-3 text-left shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#D4A843] uppercase tracking-wider block">
              ⚡ Pilih Peran & Demo Login 1-Klik (Juri Penilai)
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
                  <span className="text-base shrink-0">{cfg.icon}</span>
                  <span className="truncate">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-amber-300/90 font-medium italic pt-1 border-t border-slate-800">
            💡 {roleConfigs[activeRoleTab].hint}
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
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Kata Sandi</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${styles.formInput} pr-10`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                {showPassword ? '🙈 Sembunyikan' : '👁️ Lihat'}
              </button>
            </div>
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
              Baca TOS Platform ➔
            </button>
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? 'Memproses Authentikasi...' : `Masuk Sebagai ${roleConfigs[activeRoleTab].label} ➔`}
          </button>
        </form>

        <div className={`${styles.authFooter} space-y-1 pt-4`}>
          <div>
            Belum mendaftarkan usaha / instansi?{' '}
            <Link href={`/register?role=${activeRoleTab}`} className="font-extrabold text-[#D4A843] hover:underline">
              Daftar Akun Baru ➔
            </Link>
          </div>
        </div>
      </div>

      <TOSModal isOpen={isTOSOpen} onClose={() => setIsTOSOpen(false)} />
    </div>
  );
}
