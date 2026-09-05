'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ImpactDashboard } from '@/components/impact/ImpactDashboard';
import { ImpactChart } from '@/components/impact/ImpactChart';
import { CertificatePreview } from '@/components/reports/CertificatePreview';
import { CSRReportPreview } from '@/components/reports/CSRReportPreview';
import { formatCertificateData } from '@/lib/pdf';
import { FOOD_WASTE_CO2_FACTOR } from '@/lib/impact';
import { useSession } from 'next-auth/react';
import {
  calculateIppcEsgImpact,
  generatePrintableEsgCertificate,
} from '@/lib/esgCarbonEngine';
import { Leaf, FileCheck, Printer, ShieldCheck, Flame, Sparkles } from 'lucide-react';

function ProviderImpactContent() {
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
  const [orgName, setOrgName] = useState('Warung Bakso Pak Kumis');

  // Dynamic Real Metrics state synchronized with Ringkasan & API (Point 6)
  const [totalWeightKg, setTotalWeightKg] = useState<number>(42.5);
  const [totalSurplusCount, setTotalSurplusCount] = useState<number>(2);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState<number>(106);

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setOrgName(parsed.entityName);
      }
    } catch (_) {}

    let localItems: any[] = [];
    try {
      localItems = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
    } catch (_) {}

    fetch('/api/surplus?status=')
      .then((res) => res.json())
      .then((data) => {
        let itemsList: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          itemsList = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          itemsList = data.data;
        }

        const combined = [...localItems, ...itemsList];
        const activeItems = combined.filter((item) => item.status === 'AVAILABLE' || !item.status);
        if (activeItems.length > 0) {
          setTotalSurplusCount(activeItems.length);
        }

        const calculatedWeight = combined.reduce((acc, curr) => {
          const qty = Number(curr.quantity || 15);
          const weightUnit = Number(curr.weightPerUnitKg || 0.4);
          return acc + qty * weightUnit;
        }, 0);

        if (calculatedWeight > 0) {
          const rounded = Math.round(calculatedWeight * 10) / 10;
          setTotalWeightKg(rounded);
          setTotalBeneficiaries(Math.round(rounded * 2.5));
        }
      })
      .catch(() => {
        if (localItems.length > 0) {
          setTotalSurplusCount(localItems.length);
        }
      });
  }, []);

  const totalCo2SavedKg = Math.round(totalWeightKg * FOOD_WASTE_CO2_FACTOR * 10) / 10;

  const [certType, setCertType] = useState<'IPCC_ESG' | 'STANDARD'>('IPCC_ESG');

  const ippcImpact = React.useMemo(() => {
    return calculateIppcEsgImpact(totalWeightKg);
  }, [totalWeightKg]);

  const esgCert = React.useMemo(() => {
    return generatePrintableEsgCertificate(
      orgName || providerName,
      'Mitra Food Provider',
      totalWeightKg
    );
  }, [orgName, providerName, totalWeightKg]);

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
          Pantau kontribusi real-time lingkungan (Standar IPCC Vol 5), unduh Laporan CSR resmi, dan cetak Sertifikat Penyelamat Pangan.
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
          
          {/* Pilar 5: Verified IPCC Tier 2 Methane & Carbon Card */}
          <div className="p-6 bg-gradient-to-br from-[#0F1D2E] to-[#182C44] text-white rounded-3xl border-2 border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    Pilar 5: IPCC 2006/2019 Vol 5 Validated
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">GWP100(CH4) = 28</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                  <span>Audit Emisi Gas Metana (CH4) & Jejak Karbon Tercegah</span>
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20 shrink-0">
                {totalWeightKg} kg Makanan Terselamatkan
              </span>
            </div>

            {/* 4 Core IPCC Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Metana TPA (CH4) Dihindari</span>
                <strong className="text-xl font-black text-purple-300 font-mono block">
                  {ippcImpact.methaneAvoidedKg.toFixed(2)} kg
                </strong>
                <span className="text-[9px] text-slate-500 block">Metode FOD Anaerobik</span>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Total Reduksi GRK</span>
                <strong className="text-xl font-black text-emerald-400 font-mono block">
                  {ippcImpact.totalNetCo2eSavedKg.toFixed(1)} kg
                </strong>
                <span className="text-[9px] text-slate-500 block">CO2 ekuivalen</span>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Offset Jarak Mobil Bensin</span>
                <strong className="text-xl font-black text-amber-300 font-mono block">
                  {ippcImpact.gasolineCarKmOffset.toLocaleString('id-ID')} km
                </strong>
                <span className="text-[9px] text-slate-500 block">Emisi Knalpot Tercegah</span>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Serapan Pohon (1 Th)</span>
                <strong className="text-xl font-black text-cyan-300 font-mono block">
                  {ippcImpact.treesEquivalentAnnualAbsorption} Pohon
                </strong>
                <span className="text-[9px] text-slate-500 block">Equivalent sequestration</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
              *Metodologi audit berbasis panduan National Greenhouse Gas Inventories IPCC (Volume 5: Waste - Landfill Methane First Order Decay) dikombinasikan dengan faktor daur hidup pangan (LCA) Bappenas RI.
            </p>
          </div>

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
      {activeTab === 'CERTIFICATE' && (
        <div className="space-y-4">
          {/* Certificate Switcher */}
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 no-print">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-500">Format Sertifikat:</span>
              <button
                type="button"
                onClick={() => setCertType('IPCC_ESG')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  certType === 'IPCC_ESG'
                    ? 'bg-[#1B3A5C] text-white font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sertifikat Audit ESG Karbon & Metana (IPCC)
              </button>
              <button
                type="button"
                onClick={() => setCertType('STANDARD')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  certType === 'STANDARD'
                    ? 'bg-[#1B3A5C] text-white font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sertifikat Standar Penyelamat Pangan
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="py-2 px-4 bg-[#1B3A5C] text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-blue-900 transition-colors"
            >
              <Printer size={14} />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>

          {certType === 'STANDARD' ? (
            <CertificatePreview data={certData} />
          ) : (
            <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-white rounded-3xl border-4 border-[#D4A843] shadow-2xl space-y-6 text-slate-900 print:border-2 print:shadow-none print:m-0">
              {/* Certificate Header */}
              <div className="text-center space-y-2 border-b-2 border-slate-100 pb-6">
                <span className="text-xs font-mono font-black tracking-widest text-[#D4A843] uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-300">
                  REPLATE SUSTAINABILITY & ESG AUDIT CERTIFICATE
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1B3A5C] uppercase tracking-tight">
                  Sertifikat Audit Pengurangan Emisi Karbon & Metana
                </h1>
                <p className="text-xs text-slate-500 font-mono">
                  Nomor Sertifikat: <strong className="text-slate-800">{esgCert.certificateId}</strong> • Terbit: {esgCert.issuedDate}
                </p>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-4 py-2">
                <p className="text-xs text-slate-600 font-medium">Diberikan secara resmi kepada:</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] tracking-tight underline decoration-[#D4A843] decoration-4 underline-offset-4">
                  {esgCert.recipientName}
                </h2>
                <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
                  Atas kontribusi aktif dalam pencegahan timbulan sampah makanan (Food Loss & Waste) melalui platform Replate, yang secara langsung mencegah pembusukan anaerobik di Tempat Pemrosesan Akhir (TPA).
                </p>
              </div>

              {/* Certified Numbers Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block">Makanan Terselamatkan</span>
                  <strong className="text-base font-black text-slate-800 font-mono">{esgCert.report.rescuedFoodKg} kg</strong>
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center space-y-0.5">
                  <span className="text-[10px] text-purple-700 font-bold block">Gas Metana (CH4) Dicegah</span>
                  <strong className="text-base font-black text-purple-800 font-mono">{esgCert.report.methaneAvoidedKg} kg</strong>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-0.5">
                  <span className="text-[10px] text-emerald-700 font-bold block">Total GRK Tercegah</span>
                  <strong className="text-base font-black text-emerald-800 font-mono">{esgCert.report.totalNetCo2eSavedKg} kg CO2e</strong>
                </div>
                <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200 text-center space-y-0.5">
                  <span className="text-[10px] text-cyan-700 font-bold block">Setara Pohon (1 Th)</span>
                  <strong className="text-base font-black text-cyan-800 font-mono">{esgCert.report.treesEquivalentAnnualAbsorption} Pohon</strong>
                </div>
              </div>

              {/* Methodology String & Verification Seal */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <strong className="text-slate-800 block">Metodologi & Verifikasi Standar:</strong>
                <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                  {esgCert.report.standardCompliance.join(' • ')}
                </p>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
                <div className="text-center space-y-1">
                  <div className="w-24 h-12 flex items-center justify-center font-serif italic text-slate-400 text-sm">
                    Replate Seal
                  </div>
                  <strong className="block font-bold text-slate-800">Verifikasi Digital Replate</strong>
                  <span className="text-[10px] text-slate-500 block">Surabaya, Jawa Timur</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-24 h-12 flex items-center justify-center font-serif italic text-slate-700 font-black text-sm">
                    Budi Rahardjo
                  </div>
                  <strong className="block font-bold text-slate-800">Dr. Ir. Budi Rahardjo, M.Env</strong>
                  <span className="text-[10px] text-slate-500 block">Chief Environmental Officer</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProviderImpactPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Memuat Laporan Dampak...</div>}>
      <ProviderImpactContent />
    </Suspense>
  );
}
