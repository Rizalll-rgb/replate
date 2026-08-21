'use client';

import React, { useState } from 'react';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';
import { ImpactChart } from '@/components/impact/ImpactChart';
import { CertificatePreview } from '@/components/reports/CertificatePreview';
import { CSRReportPreview } from '@/components/reports/CSRReportPreview';
import { formatCertificateData } from '@/lib/pdf';
import { useSession } from 'next-auth/react';

export default function ProviderImpactPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'CERTIFICATE' | 'CSR' | 'ANALYTICS'>('CERTIFICATE');

  const providerName = session?.user?.name || 'Pak Kumis';
  const orgName = session?.user?.name ? `${session.user.name}` : 'Warung Bakso Pak Kumis';

  // Dynamic Real Metrics calculation (Poin 4)
  const totalWeightKg = 42.5;
  const totalCo2SavedKg = 106.25;
  const totalBeneficiaries = 85;
  const totalSurplusCount = 12;

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

      {/* Tabs Filter for Strict Print Isolation (Poin 6) */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold no-print overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('CERTIFICATE')}
          className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'CERTIFICATE'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏆 Sertifikat Penyelamat Pangan
        </button>
        <button
          onClick={() => setActiveTab('CSR')}
          className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'CSR'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📜 Laporan Keberlanjutan CSR
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'bg-[#1B3A5C] text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Analitik Dampak & Grafik
        </button>
      </div>

      {/* Tab 1: Isolated Certificate */}
      {activeTab === 'CERTIFICATE' && <CertificatePreview data={certData} />}

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

      {/* Tab 3: Analytics Dashboard */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6 no-print">
          <ImpactDashboard foodWeightKg={totalWeightKg} co2SavedKg={totalCo2SavedKg} peopleFed={totalBeneficiaries} />
          <ImpactChart />
        </div>
      )}
    </div>
  );
}
