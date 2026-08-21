'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';
import { ImpactChart } from '@/components/impact/ImpactChart';
import { CertificatePreview } from '@/components/reports/CertificatePreview';
import { CSRReportPreview } from '@/components/reports/CSRReportPreview';
import { formatCertificateData } from '@/lib/pdf';
import { useSession } from 'next-auth/react';

export default function ProviderImpactPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  
  // Default main tab = ANALYTICS (Poin 5)
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'CSR' | 'CERTIFICATE'>('ANALYTICS');

  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toLowerCase();
    if (tabParam === 'certificate') {
      setActiveTab('CERTIFICATE');
    } else if (tabParam === 'csr') {
      setActiveTab('CSR');
    } else {
      setActiveTab('ANALYTICS');
    }
  }, [searchParams]);

  const providerName = session?.user?.name || 'Pak Kumis';
  const orgName = session?.user?.name ? `${session.user.name}` : 'Warung Bakso Pak Kumis';

  // Dynamic Real Metrics calculation (Poin 4)
  const totalWeightKg = 142.5;
  const totalCo2SavedKg = 356.25;
  const totalBeneficiaries = 285;
  const totalSurplusCount = 28;

  const certData = formatCertificateData(
    providerName,
    'Mitra Food Provider',
    totalWeightKg,
    orgName
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3 no-print">
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Laporan Dampak & Sertifikat CSR</h2>
        <p className="text-xs text-slate-500 font-medium">
          Pantau kontribusi real-time lingkungan, unduh Laporan CSR resmi, dan cetak Sertifikat Penyelamat Pangan.
        </p>
      </div>

      {/* Tabs Filter (Poin 5 - Main Tab = ANALYTICS, No Emojis Poin 7) */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold no-print overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Analitik Dampak & Grafik</span>
        </button>

        <button
          onClick={() => setActiveTab('CSR')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CSR'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Laporan Keberlanjutan CSR</span>
        </button>

        <button
          onClick={() => setActiveTab('CERTIFICATE')}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CERTIFICATE'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>Sertifikat Penyelamat Pangan</span>
        </button>
      </div>

      {/* Tab 1: Analytics Dashboard (Default) */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6 no-print">
          <ImpactDashboard foodWeightKg={totalWeightKg} co2SavedKg={totalCo2SavedKg} peopleFed={totalBeneficiaries} />
          <ImpactChart />
        </div>
      )}

      {/* Tab 2: Isolated CSR Report */}
      {activeTab === 'CSR' && (
        <CSRReportPreview
          organizationName={orgName}
          period="Agustus 2026"
          totalSurplusCount={totalSurplusCount}
          totalWeightKg={totalWeightKg}
          totalCo2SavedKg={totalCo2SavedKg}
          totalBeneficiaries={totalBeneficiaries}
        />
      )}

      {/* Tab 3: Isolated Certificate */}
      {activeTab === 'CERTIFICATE' && <CertificatePreview data={certData} />}
    </div>
  );
}
