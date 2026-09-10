'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';

export default function PartnerRequestsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/rescue-partner/active?tab=POOL');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <SuperAppLoader
        isOpen={true}
        message="Mengarahkan ke Pool Tugas..."
        submessage="Modul penjemputan telah disatukan ke Rute &amp; Tugas Aktif"
      />
    </div>
  );
}
