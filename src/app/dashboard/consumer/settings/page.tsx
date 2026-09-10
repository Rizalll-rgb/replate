'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsumerSettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`/dashboard/profile${search || ''}`);
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-slate-500">
      Mengarahkan ke Pengaturan Akun Konsumen...
    </div>
  );
}
