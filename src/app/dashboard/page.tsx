'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const router = useRouter();
  const sessionRes = useSession();
  const session = sessionRes?.data;
  const status = sessionRes?.status || 'unauthenticated';

  useEffect(() => {
    if (status === 'loading') return;

    let effectiveRole: any = session?.user?.role;
    if (!effectiveRole) {
      try {
        const p = localStorage.getItem('replate_onboarding_profile');
        if (p) {
          const parsed = JSON.parse(p);
          if (parsed.role) effectiveRole = parsed.role;
        }
        if (!effectiveRole) {
          const match = document.cookie.match(/replate_demo_session=([^;]+)/);
          if (match) effectiveRole = match[1];
        }
      } catch (_) {}
    }

    if (!effectiveRole && !session?.user) {
      router.push('/login');
      return;
    }

    const role = String(effectiveRole || '').toUpperCase();
    if (role.includes('ADMIN')) {
      router.push('/dashboard/admin');
    } else if (role.includes('YAYASAN') || role.includes('BENEFICIARY')) {
      router.push('/dashboard/yayasan');
    } else if (role.includes('RESCUE') || role.includes('VOLUNTEER')) {
      router.push('/dashboard/rescue-partner');
    } else if (role.includes('CONSUMER')) {
      router.push('/dashboard/consumer');
    } else {
      router.push('/dashboard/provider');
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <svg className="w-8 h-8 mx-auto animate-spin text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p className="text-xs text-slate-500 font-extrabold">Mengarahkan ke Dashboard {session?.user?.role || 'User'}...</p>
      </div>
    </div>
  );
}
