'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsumerHistoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/consumer/my-claims');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-slate-500">
      Mengarahkan ke Riwayat Klaim...
    </div>
  );
}
