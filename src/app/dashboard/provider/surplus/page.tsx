'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SurplusRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      let role = '';
      const onb = localStorage.getItem('replate_onboarding_profile');
      if (onb) role = JSON.parse(onb).role;
      if (!role) {
        const reg = localStorage.getItem('replate_registered_user');
        if (reg) role = JSON.parse(reg).role;
      }
      if (!role) {
        const c = document.cookie.match(/replate_role=([^;]+)/) || document.cookie.match(/replate_demo_session=([^;]+)/);
        if (c) role = decodeURIComponent(c[1]);
      }
      const r = String(role || '').toUpperCase();
      if (r.includes('CONSUMER')) {
        router.replace('/dashboard/consumer');
        return;
      }
    } catch (_) {}
    router.replace('/dashboard/provider/my-listings');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-[#1B3A5C]">
      Mengarahkan...
    </div>
  );
}
