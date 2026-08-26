'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SurplusRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/provider/my-listings');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-[#1B3A5C]">
      Mengarahkan ke Daftar Makanan Surplus...
    </div>
  );
}
