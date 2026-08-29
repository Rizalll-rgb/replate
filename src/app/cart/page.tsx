'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/cart');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs font-bold text-slate-500">
      Mengarahkan ke Tas Klaim...
    </div>
  );
}
