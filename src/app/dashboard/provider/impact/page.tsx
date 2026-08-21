'use client';

import React from 'react';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';
import { ImpactChart } from '@/components/impact/ImpactChart';
import { CertificatePreview } from '@/components/reports/CertificatePreview';
import { CSRReportPreview } from '@/components/reports/CSRReportPreview';
import { formatCertificateData } from '@/lib/pdf';

export default function ProviderImpactPage() {
  const certData = formatCertificateData('Pak Kumis', 'Food Provider', 42.5, 'Warung Bakso Pak Kumis');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Laporan Dampak & Sertifikat CSR</h2>
        <p className="text-xs text-[#6C757D]">Pantau kontribusi lingkungan dan cetak sertifikat penghargaan Anda.</p>
      </div>

      <ImpactDashboard foodWeightKg={42.5} co2SavedKg={106.25} peopleFed={85} />

      <ImpactChart />

      <CertificatePreview data={certData} />

      <CSRReportPreview
        organizationName="Warung Bakso Pak Kumis"
        period="Agustus 2026"
        totalSurplusCount={12}
        totalWeightKg={42.5}
        totalCo2SavedKg={106.25}
        totalBeneficiaries={85}
      />
    </div>
  );
}
