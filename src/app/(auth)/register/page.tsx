'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { Logo } from '@/components/ui/Logo';
import { TOSModal } from '@/components/auth/TOSModal';
import { OTPVerificationModal } from '@/components/auth/OTPVerificationModal';
import { getAllDemoEmails, getAllDemoPhones } from '@/lib/mockDatabase';
import {
  Eye,
  EyeOff,
  Store,
  Building2,
  ShoppingBag,
  Truck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

type Role = 'FOOD_PROVIDER' | 'FOOD_BENEFICIARY' | 'FOOD_CONSUMER' | 'RESCUE_VOLUNTEER';

export default function RegisterPage() {
  const router = useRouter();

  // Poin 1: Seluruh field registrasi bersih dan kosong secara default
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'FOOD_PROVIDER' as Role,
    address: '',
    organizationName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTOSOpen, setIsTOSOpen] = useState(false);
  const [isOTPOpen, setIsOTPOpen] = useState(false);

  // Poin 2 & 3: 4 Opsi Peran Registrasi dengan Ikon Representatif & Deskripsi Ramah
  const roleOptions: Record<
    Role,
    {
      value: Role;
      label: string;
      icon: React.ReactNode;
      badge: string;
      desc: string;
      targetHint: string;
    }
  > = {
    FOOD_PROVIDER: {
      value: 'FOOD_PROVIDER',
      label: 'Food Provider',
      icon: <Store className="w-4 h-4 text-[#D4A843]" />,
      badge: 'Mitra Usaha Kuliner',
      desc: 'Restoran, Bakery, Supermarket, & Hotel penyedia makanan surplus.',
      targetHint: 'Cocok bagi pengusaha makanan yang ingin mengubah potensi limbah pangan menjadi nilai sosial dan ekonomi.',
    },
    FOOD_BENEFICIARY: {
      value: 'FOOD_BENEFICIARY',
      label: 'Food Beneficiary',
      icon: <Building2 className="w-4 h-4 text-emerald-400" />,
      badge: 'Lembaga / Yayasan Sosial',
      desc: 'Panti Asuhan, Yayasan Sosial, & Shelter penerima donasi makanan Rp 0.',
      targetHint: 'Dikhususkan untuk lembaga sosial terdaftar yang ingin menerima pasokan makanan layak santap secara rutin.',
    },
    FOOD_CONSUMER: {
      value: 'FOOD_CONSUMER',
      label: 'Food Consumer',
      icon: <ShoppingBag className="w-4 h-4 text-sky-400" />,
      badge: 'Konsumen Umum / Mahasiswa',
      desc: 'Masyarakat umum & anak kos pembeli makanan lezat diskon 50-70%.',
      targetHint: 'Bagi Anda yang ingin menikmati hidangan berkualitas hemat sekaligus berpartisipasi dalam infaq sosial panti.',
    },
    RESCUE_VOLUNTEER: {
      value: 'RESCUE_VOLUNTEER',
      label: 'Rescue Volunteer',
      icon: <Truck className="w-4 h-4 text-orange-400" />,
      badge: 'Relawan & Logistik',
      desc: 'Komunitas / Armada Kurir Relawan Penyelamat Pangan.',
      targetHint: 'Bagi armada atau individu relawan yang siap membantu menjemput dan mengantarkan makanan secara aman.',
    },
  };

  const isConsumer = formData.role === 'FOOD_CONSUMER';
  const nameLabel = isConsumer ? 'Nama Lengkap Anda' : 'Nama Penanggung Jawab Resmi (PIC)';
  const namePlaceholder = isConsumer ? 'Contoh: Budi Santoso' : 'Nama lengkap PIC operasional';
  const emailLabel = isConsumer ? 'Alamat Email Pribadi' : 'Alamat Email Resmi Operasional';
  const emailPlaceholder = isConsumer ? 'nama@gmail.com' : 'operasional@namausaha.id';
  const phoneLabel = isConsumer ? 'Nomor WhatsApp Anda' : 'Nomor WhatsApp PIC Operasional';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi belum sama. Mohon pastikan keduanya cocok ya.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Kata sandi harus memiliki minimal 8 karakter demi keamanan akun Anda.');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.replace(/\D/g, '');

    // Validasi pembatasan nomor WhatsApp dan email unik
    const demoEmails = getAllDemoEmails();
    const demoPhones = getAllDemoPhones();

    let localUsers: any[] = [];
    try {
      const stored = localStorage.getItem('replate_users_list');
      if (stored) localUsers = JSON.parse(stored);
      const single = localStorage.getItem('replate_registered_user');
      if (single) localUsers.push(JSON.parse(single));
    } catch (_) {}

    const isEmailTaken = demoEmails.includes(cleanEmail) || localUsers.some((u: any) => (u.email || '').trim().toLowerCase() === cleanEmail);
    const isPhoneTaken = demoPhones.includes(cleanPhone) || localUsers.some((u: any) => (u.phone || '').replace(/\D/g, '') === cleanPhone);

    if (isEmailTaken) {
      setError(`Alamat email "${formData.email}" sudah terdaftar sebelumnya. Silakan gunakan email lain atau langsung masuk ke akun Anda.`);
      return;
    }

    if (isPhoneTaken) {
      setError(`Nomor WhatsApp "${formData.phone}" sudah terdaftar dalam sistem Replate. Silakan gunakan nomor lain atau langsung masuk.`);
      return;
    }

    // Trigger WhatsApp 2-Step OTP Verification for manual registration
    setIsOTPOpen(true);
  };

  const handleOTPVerified = async () => {
    setIsOTPOpen(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role:
            formData.role === 'FOOD_PROVIDER'
              ? 'PROVIDER'
              : formData.role === 'FOOD_BENEFICIARY'
              ? 'RESCUE_PARTNER'
              : formData.role === 'RESCUE_VOLUNTEER'
              ? 'RESCUE_PARTNER'
              : 'CONSUMER',
        }),
      });

      if (!res.ok && res.status !== 400) {
        // Fallthrough for demo resiliency
      }

      try {
        const newUser = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
        };

        localStorage.setItem('replate_registered_user', JSON.stringify(newUser));

        const stored = localStorage.getItem('replate_users_list');
        const list = stored ? JSON.parse(stored) : [];
        list.push(newUser);
        localStorage.setItem('replate_users_list', JSON.stringify(list));

        // Pastikan akun baru terdaftar berstatus FRESH
        localStorage.setItem('replate_is_fresh_account', 'true');
        localStorage.removeItem('replate_active_claims');
        localStorage.removeItem('replate_claims');
        localStorage.removeItem('replate_cart');
        localStorage.removeItem('replate_tas_klaim');
        localStorage.removeItem('replate_local_surplus');
        localStorage.removeItem('replate_panti_requests');
      } catch (_) {}

      setSuccess('Pendaftaran akun berhasil diverifikasi! Kami sedang mengarahkan Anda ke pengisian profil...');

      setTimeout(() => {
        router.push(`/onboarding/profile?role=${formData.role}`);
      }, 1200);
    } catch {
      setError('Mohon maaf, terjadi kendala saat memproses pendaftaran. Silakan periksa koneksi Anda dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Poin 4: Tombol Google register redirect ke future development
  const handleGoogleClick = () => {
    router.push('/future-development?feature=google-oauth&from=register');
  };

  return (
    <div className="min-h-screen bg-[#0F1923] relative flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full bg-[#D4A843]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[520px] h-[520px] rounded-full bg-[#1B3A5C]/30 blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[25%] w-[380px] h-[380px] rounded-full bg-[#2D8A4E]/10 blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, #D4A843 1px, transparent 1px), radial-gradient(circle at 75% 75%, #D4A843 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Poin 8: Revamp Desktop Split-Screen yang Mewah & Komprehensif */}
      <div className="max-w-6xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* LEFT COLUMN: BENEFIT SHOWCASE & BRAND HERO (Desktop Enhanced) */}
        <div className="lg:col-span-5 text-white space-y-6 text-center lg:text-left hidden lg:block">
          <div className="space-y-4">
            <div className="inline-block">
              <Logo variant="light" size="lg" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-[0.25em] uppercase text-[#D4A843] bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-[#D4A843]/30">
                <Sparkles className="w-3.5 h-3.5" />
                JOIN THE ZERO-WASTE MOVEMENT
              </span>
              <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                Bergabung Bersama <span className="text-[#D4A843]">Replate</span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Daftarkan akun Anda hari ini untuk menjadi bagian dari jaringan penyelamatan surplus makanan terbesar di Indonesia.
              </p>
            </div>
          </div>

          {/* Key Advantages Checklist */}
          <div className="p-4 bg-[#142C47]/80 rounded-2xl border border-[#2C5A8F]/60 backdrop-blur-md space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A843] block">
              Keuntungan Mendaftar di Replate:
            </span>
            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sertifikasi Kepatuhan BPOM:</strong> Jaminan SOP higiene 8 kriteria keamanan pangan siap saji.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Laporan Dampak ESG & CSR Otomatis:</strong> Penghitungan metrik karbon CO2e terselamatkan sesuai standar KLH.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Verifikasi Cepat 1x24 Jam:</strong> Terkoneksi langsung dengan database jaringan Dinsos RI.
                </span>
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
              <span>Sudah Pernah Mendaftar? Lacak Status Berkas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION FORM (Mobile & Desktop) */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-[#142C47]/95 backdrop-blur-xl border-1.5 border-[#2C5A8F] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-4 text-left">
            {/* Mobile Header */}
            <div className="text-center lg:hidden space-y-1.5 pb-2">
              <div className="flex justify-center">
                <Logo variant="light" size="md" />
              </div>
              <h2 className="text-xl font-black text-white">Bergabung dengan Replate</h2>
              <p className="text-xs text-slate-300">
                {isConsumer
                  ? 'Daftar Akun Pribadi Konsumen & Dapatkan Makanan Berkualitas Murah'
                  : 'Pilih Peran Lembaga & Daftarkan Akun Resmi Platform'}
              </p>
            </div>

            {/* Desktop Form Title */}
            <div className="hidden lg:block space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">Formulir Pendaftaran Akun</h2>
              <p className="text-xs text-slate-300">
                Lengkapi informasi di bawah ini untuk memulai proses pendaftaran akun Replate.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-medium">
                {success}
              </div>
            )}

            {/* Poin 2: Role Selection Grid with Icons */}
            <div className="bg-[#0F1923] p-3.5 sm:p-4 rounded-2xl border border-[#2C5A8F] space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#D4A843] uppercase tracking-wider block">
                  Pilih Peran Pendaftaran:
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {roleOptions[formData.role].badge}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {(Object.keys(roleOptions) as Role[]).map((rKey) => {
                  const r = roleOptions[rKey];
                  const isSelected = formData.role === rKey;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.value })}
                      className={`p-2.5 rounded-xl border text-left transition-all font-bold flex flex-col gap-0.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B3A5C] text-white border-[#D4A843] ring-2 ring-[#D4A843]/40 shadow-md'
                          : 'bg-[#142C47]/50 hover:bg-[#1B3A5C] text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        {r.icon}
                        <span className="truncate">{r.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-normal line-clamp-1">{r.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Poin 3: Friendly Role Guidance Hint */}
              <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-[11px] text-amber-300/90 leading-relaxed font-medium">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                <span>{roleOptions[formData.role].targetHint}</span>
              </div>
            </div>

            {/* Registration Form (Poin 1: Default Kosong) */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Nama Lengkap */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{nameLabel}</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder={namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  minLength={2}
                />
                {/* Poin 3: Helpful Input Hint */}
                <p className="text-[11px] text-slate-300 font-normal mt-1 leading-tight">
                  {isConsumer
                    ? 'Nama lengkap Anda sesuai kartu identitas untuk verifikasi klaim makanan.'
                    : 'Nama penanggung jawab resmi yang dapat dihubungi terkait operasional dan serah terima.'}
                </p>
              </div>

              {/* Email & Phone */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{emailLabel}</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder={emailPlaceholder}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  {/* Poin 3: Helpful Input Hint */}
                  <p className="text-[11px] text-slate-300 font-normal mt-1 leading-tight">
                    {isConsumer
                      ? 'Email aktif untuk konfirmasi tiket dan notifikasi promo.'
                      : 'Email resmi lembaga untuk bukti CSR dan administrasi.'}
                  </p>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{phoneLabel}</label>
                  <input
                    type="tel"
                    className={styles.formInput}
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                  {/* Poin 3: Helpful Input Hint */}
                  <p className="text-[11px] text-slate-300 font-normal mt-1 leading-tight">
                    Format: 08xxxxxxxxxx (Wajib aktif WhatsApp untuk verifikasi OTP).
                  </p>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.formInput} pr-11`}
                      placeholder="Min. 8 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
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
                  {/* Poin 3: Helpful Input Hint */}
                  <p className="text-[11px] text-slate-300 font-normal mt-1 leading-tight">
                    Minimal 8 karakter kombinasi huruf & angka.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`${styles.formInput} pr-11`}
                      placeholder="Ulangi kata sandi"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4A843] transition-colors p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                      title={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Poin 3: Helpful Input Hint */}
                  <p className="text-[11px] text-slate-300 font-normal mt-1 leading-tight">
                    Ketik ulang kata sandi yang sama persis.
                  </p>
                </div>
              </div>

              {/* Poin 5: Clickable Syarat dan Ketentuan Agreement */}
              <div className="py-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 font-medium leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    defaultChecked
                    className="mt-0.5 w-4 h-4 text-[#D4A843] rounded border-slate-600 focus:ring-0 shrink-0"
                  />
                  <span>
                    Saya menyetujui{' '}
                    <button
                      type="button"
                      onClick={() => setIsTOSOpen(true)}
                      className="text-[#D4A843] hover:underline font-extrabold cursor-pointer inline"
                    >
                      Syarat dan Ketentuan
                    </button>
                    , Kebijakan Privasi, & Standar Keamanan Pangan BPOM Replate.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? 'Memproses OTP WhatsApp...' : 'Lanjut Ke Verifikasi OTP WhatsApp'}
              </button>

              {/* Poin 4: Google OAuth Redirect ke Future Development */}
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative inline-block px-3 bg-[#142C47] text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Atau Daftar Cepat
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
                <span>Daftar Cepat Dengan Akun Google</span>
              </button>
            </form>

            {/* Footer Links */}
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-center lg:text-left text-slate-300">
              <div>
                Sudah mendaftarkan akun sebelumnya?{' '}
                <Link href="/login" className="font-extrabold text-[#D4A843] hover:underline">
                  Masuk Sekarang
                </Link>
              </div>
              <div className="pt-1 block lg:hidden text-center">
                <Link
                  href="/track-status"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-extrabold bg-[#0F1923] px-3.5 py-2 rounded-xl border border-amber-400/40 shadow-xs transition-all"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pernah Mendaftar? Cek Live Status Audit</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Syarat dan Ketentuan Modal */}
      <TOSModal isOpen={isTOSOpen} onClose={() => setIsTOSOpen(false)} />

      {/* OTP Modal */}
      <OTPVerificationModal
        isOpen={isOTPOpen}
        phoneOrEmail={formData.phone}
        onSuccess={handleOTPVerified}
        onClose={() => setIsOTPOpen(false)}
      />
    </div>
  );
}
