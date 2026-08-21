'use client';

import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginWithCredentials = async (emailVal: string, passwordVal: string) => {
        setError('');
        setLoading(true);
        try {
            // Force signout to clear any stale JWT cookie from previous sessions
            try { await signOut({ redirect: false }); } catch (_) {}
            
            const result = await signIn('credentials', {
                email: emailVal,
                password: passwordVal,
                redirect: false,
            });

            if (result?.error) {
                setError('Email atau password tidak sesuai.');
                setLoading(false);
            } else {
                window.location.href = '/dashboard';
            }
        } catch {
            window.location.href = '/dashboard';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLoginWithCredentials(formData.email, formData.password);
    };

    const handleQuickDemo = (emailVal: string, passwordVal: string) => {
        setFormData({ email: emailVal, password: passwordVal });
        handleLoginWithCredentials(emailVal, passwordVal);
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authBg} />
            <div className={`${styles.authGlow} ${styles.glow1}`} />
            <div className={`${styles.authGlow} ${styles.glow2}`} />

            <div className={styles.authCard}>
                <div className={styles.authLogo}>
                    <Logo variant="light" size="lg" />
                </div>

                <h1 className={styles.authTitle}>Selamat Datang Kembali</h1>
                <p className={styles.authSubtitle}>Masuk ke akun Replate Anda</p>

                {error && (
                    <div className={`${styles.formAlert} ${styles.alertError}`}>
                        {error}
                    </div>
                )}

                {/* 1-Click Quick Demo Login Preset for Judges */}
                <div className="mb-6 bg-[#0F1923] p-3.5 rounded-xl border border-[#2C5A8F] space-y-2">
                    <span className="text-[11px] font-extrabold text-[#D4A843] uppercase tracking-wider block text-center">
                        Akses Cepat Demo Akun 5 Role (1-Click Login)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => handleQuickDemo('admin@replate.id', 'password123')}
                            className="p-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold rounded-lg border border-[#2C5A8F] transition-colors text-center shadow-xs"
                        >
                            👑 Superadmin
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickDemo('bakso.pak.kumis@replate.id', 'password123')}
                            className="p-2 bg-[#1A2636] hover:bg-[#2C5A8F] text-white font-bold rounded-lg border border-[#2C5A8F] transition-colors text-center shadow-xs"
                        >
                            🏪 Food Provider
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickDemo('foodbank.surabaya@replate.id', 'password123')}
                            className="p-2 bg-[#1A2636] hover:bg-[#2C5A8F] text-white font-bold rounded-lg border border-[#2C5A8F] transition-colors text-center shadow-xs"
                        >
                            🤝 Rescue Partner
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickDemo('panti.kasih.ibu@replate.id', 'password123')}
                            className="p-2 bg-[#1A2636] hover:bg-[#2C5A8F] text-white font-bold rounded-lg border border-[#2C5A8F] transition-colors text-center shadow-xs"
                        >
                            🏠 Yayasan / Panti
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickDemo('budi.santoso@gmail.com', 'password123')}
                            className="p-2 col-span-2 sm:col-span-2 bg-[#1A2636] hover:bg-[#2C5A8F] text-white font-bold rounded-lg border border-[#2C5A8F] transition-colors text-center shadow-xs"
                        >
                            🛒 Konsumen / Anak Kos
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email</label>
                        <input
                            type="email"
                            className={styles.formInput}
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Password</label>
                        <input
                            type="password"
                            className={styles.formInput}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={8}
                        />
                    </div>

                    <button type="submit" className={styles.btnSubmit} disabled={loading}>
                        {loading ? 'Memproses...' : 'Masuk ➔'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    Belum punya akun? <Link href="/register">Daftar Gratis</Link>
                </div>
            </div>
        </div>
    );
}
