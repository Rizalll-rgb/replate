'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DonationsHubComponent } from '@/components/donations/DonationsHubComponent';

export default function ProviderDonationsPage() {
  const router = useRouter();
  const [isConsumerRedirect, setIsConsumerRedirect] = useState(false);

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
        setIsConsumerRedirect(true);
        router.replace('/dashboard/consumer');
      }
    } catch (_) {}
  }, [router]);

  if (isConsumerRedirect) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-extrabold">Mengarahkan ke Dashboard Konsumen...</p>
        </div>
      </div>
    );
  }

  return <DonationsHubComponent />;
}
