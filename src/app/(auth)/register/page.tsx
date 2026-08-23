'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { PROVIDER_TYPES, PARTNER_TYPES } from '@/lib/constants';
import { Logo } from '@/components/ui/Logo';

type Role = 'CONSUMER' | 'PROVIDER' | 'RESCUE_PARTNER';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CONSUMER' as Role,
        phone: '',
        address: '',
        city: 'Surabaya',
        organizationType: '',
        organizationName: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Pendaftaran gagal');
            } else {
                setSuccess(data.message);
                setTimeout(() => router.push('/login'), 2000);
            }
        } catch {
            setError('Terjadi kesalahan, coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const showOrgFields = formData.role === 'PROVIDER' || formData.role === 'RESCUE_PARTNER';
    const orgTypes = formData.role === 'PROVIDER' ? PROVIDER_TYPES : PARTNER_TYPES;

    return (
        <div className={styles.authPage}>
            <div className={styles.authBg} />
            <div className={`${styles.authGlow} ${styles.glow1}`} />
            <div className={`${styles.authGlow} ${styles.glow2}`} />

            <div className={styles.authCard} style={{ maxWidth: 540 }}>
                <div className={styles.authLogo}>
                    <Logo variant="light" size="lg" />
                </div>

                <h1 className={styles.authTitle}>Bergabung dengan Replate</h1>
                <p className={styles.authSubtitle}>Pilih peran dan mulai selamatkan makanan</p>

                {error && <div className={`${styles.formAlert} ${styles.alertError}`}>{error}</div>}
                {success && <div className={`${styles.formAlert} ${styles.alertSuccess}`}>{success}</div>}

                {/* Role Selector */}
                <div className={styles.roleSelector}>
                    {[
                        {
                            value: 'CONSUMER',
                            label: 'Konsumen',
                            icon: (
                                <svg className="w-5 h-5 mx-auto text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            ),
                        },
                        {
                            value: 'PROVIDER',
                            label: 'Provider',
                            icon: (
                                <svg className="w-5 h-5 mx-auto text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
                                </svg>
                            ),
                        },
                        {
                            value: 'RESCUE_PARTNER',
                            label: 'Rescue Partner',
                            icon: (
                                <svg className="w-5 h-5 mx-auto text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            ),
                        },
                    ].map((role) => (
                        <div
                            key={role.value}
                            className={`${styles.roleOption} ${formData.role === role.value ? styles.active : ''}`}
                            onClick={() => setFormData({ ...formData, role: role.value as Role, organizationType: '', organizationName: '' })}
                        >
                            <div className="mb-1">{role.icon}</div>
                            <span className={styles.roleName}>{role.label}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nama Lengkap</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="Nama lengkap kamu"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            minLength={2}
                        />
                    </div>

                    <div className={styles.formRow}>
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
                            <label className={styles.formLabel}>No. Telepon</label>
                            <input
                                type="tel"
                                className={styles.formInput}
                                placeholder="081xxxxxxxxx"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Password</label>
                            <input
                                type="password"
                                className={styles.formInput}
                                placeholder="Min. 8 karakter"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Konfirmasi Password</label>
                            <input
                                type="password"
                                className={styles.formInput}
                                placeholder="Ulangi password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {formData.role === 'CONSUMER' && (
                        <div className={styles.conditionalFields}>
                            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700 text-white space-y-3 mb-4">
                                <label className="text-xs font-bold text-[#D4A843] uppercase tracking-wider block">
                                    Pilih Kategori Akun Konsumen Replate
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div
                                        onClick={() => setFormData({ ...formData, organizationType: 'REGULAR_CONSUMER' })}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                            formData.organizationType !== 'BENEFICIARY_CONSUMER'
                                                ? 'bg-[#1B3A5C] border-[#D4A843] text-white shadow-xs'
                                                : 'bg-slate-800 border-slate-700 text-slate-300'
                                        }`}
                                    >
                                        <span className="font-extrabold block text-xs">🛒 Konsumen Biasa (Rescue Sale)</span>
                                        <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                                            Masyarakat umum & anak kos yang membeli makanan surplus berdiskon murah.
                                        </p>
                                    </div>

                                    <div
                                        onClick={() => setFormData({ ...formData, organizationType: 'BENEFICIARY_CONSUMER' })}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                            formData.organizationType === 'BENEFICIARY_CONSUMER'
                                                ? 'bg-emerald-900 border-emerald-400 text-white shadow-xs'
                                                : 'bg-slate-800 border-slate-700 text-slate-300'
                                        }`}
                                    >
                                        <span className="font-extrabold block text-xs">🤝 Penerima Bantuan (Donasi Rp 0)</span>
                                        <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                                            Warga rentan/kurang mampu yang membutuhkan akses donasi gratis 100%.
                                        </p>
                                    </div>
                                </div>

                                {formData.organizationType === 'BENEFICIARY_CONSUMER' && (
                                    <div className="pt-2 border-t border-slate-800 space-y-1">
                                        <label className={styles.formLabel}>No. Kartu Bansos / SKTM Kelurahan (Verifikasi)</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="Contoh: No. KIS / KKS / PKH / SKTM Kelurahan..."
                                            value={formData.organizationName}
                                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                            required
                                        />
                                        <span className="text-[10px] text-emerald-400 block font-medium">
                                            *Data ini diverifikasi oleh tim Replate agar bantuan donasi makanan 100% tepat sasaran.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {showOrgFields && (
                        <div className={styles.conditionalFields}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Tipe Organisasi</label>
                                    <select
                                        className={styles.formSelect}
                                        value={formData.organizationType}
                                        onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                                        required
                                    >
                                        <option value="">Pilih tipe...</option>
                                        {orgTypes.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Nama Organisasi</label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="Nama toko/organisasi"
                                        value={formData.organizationName}
                                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Alamat</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="Alamat lengkap di Surabaya"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <button type="submit" className={styles.btnSubmit} disabled={loading}>
                        {loading ? 'Mendaftar...' : 'Daftar Sekarang ➔'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    Sudah punya akun? <Link href="/login">Masuk</Link>
                </div>
            </div>
        </div>
    );
}
