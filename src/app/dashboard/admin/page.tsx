'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { ShieldCheckIcon, TruckIcon, AlertTriangleIcon, CheckIcon, ClockIcon, MapPinIcon } from '@/components/ui/Icon';

interface IncidentTicket {
  id: string;
  code: string;
  claimCode: string;
  reporter: string;
  reporterRole: string;
  issueType: string;
  description: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  reportedAt: string;
}

const DEFAULT_INCIDENTS: IncidentTicket[] = [
  {
    id: 'inc-1',
    code: 'INC-2026-001',
    claimCode: 'FB-DON-88192',
    reporter: 'Budi Santoso (Driver Relawan)',
    reporterRole: 'RESCUE_VOLUNTEER',
    issueType: 'Keterlambatan Penjemputan Toko',
    description: 'Akses loading dock resto tertutup truk kargo, driver menunggu 15 menit tambahan.',
    location: 'Warung Bakso Pak Kumis (Genteng Kali)',
    severity: 'MEDIUM',
    status: 'INVESTIGATING',
    reportedAt: 'Hari ini 19:15 WIB',
  },
  {
    id: 'inc-2',
    code: 'INC-2026-002',
    claimCode: 'FB-REC-99120',
    reporter: 'Panti Asuhan Kasih Ibu (Penerima)',
    reporterRole: 'FOOD_BENEFICIARY',
    issueType: 'Kemasan Luar Basah',
    description: 'Boks roti kardus terpercik air saat gerimis, isi dalam kemasan plastik tetap steril.',
    location: 'Jl. Raya Gubeng No. 88, Surabaya',
    severity: 'LOW',
    status: 'OPEN',
    reportedAt: 'Hari ini 18:30 WIB',
  },
];

export default function AdminOverviewPage() {
  const [incidents, setIncidents] = useState<IncidentTicket[]>(DEFAULT_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<IncidentTicket | null>(null);
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [kpis, setKpis] = useState({
    providersCount: 5,
    rescuePartnersCount: 3,
    consumersCount: 4,
    wasteDivertedPercent: 88.5,
    totalClaimsCount: 12,
    openIncidentsCount: 2,
  });

  useEffect(() => {
    try {
      // Sync Incident Tickets
      const savedIncidentsStr = localStorage.getItem('replate_incident_tickets');
      if (savedIncidentsStr) {
        const parsed = JSON.parse(savedIncidentsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIncidents(parsed);
        } else {
          localStorage.setItem('replate_incident_tickets', JSON.stringify(DEFAULT_INCIDENTS));
        }
      } else {
        localStorage.setItem('replate_incident_tickets', JSON.stringify(DEFAULT_INCIDENTS));
      }

      // Sync KPIs from localStorage
      let providerAdd = 0;
      let consumerAdd = 0;
      let beneficiaryAdd = 0;

      const regUserStr = localStorage.getItem('replate_registered_user');
      if (regUserStr) {
        const reg = JSON.parse(regUserStr);
        if (reg.role === 'FOOD_PROVIDER') providerAdd = 1;
        else if (reg.role === 'FOOD_CONSUMER') consumerAdd = 1;
        else if (reg.role === 'FOOD_BENEFICIARY') beneficiaryAdd = 1;
      }

      const claimsStr = localStorage.getItem('replate_claims');
      let claimsLen = 12;
      if (claimsStr) {
        const claims = JSON.parse(claimsStr);
        if (Array.isArray(claims)) {
          claimsLen = Math.max(12, claims.length);
        }
      }

      setKpis({
        providersCount: 5 + providerAdd,
        rescuePartnersCount: 3 + beneficiaryAdd,
        consumersCount: 4 + consumerAdd,
        wasteDivertedPercent: Math.min(94.2, 88.5 + (claimsLen * 0.3)),
        totalClaimsCount: claimsLen,
        openIncidentsCount: incidents.filter((i) => i.status !== 'RESOLVED').length,
      });
    } catch (_) {}
  }, []);

  const handleResolveIncident = (incId: string) => {
    const updated = incidents.map((inc) =>
      inc.id === incId ? { ...inc, status: 'RESOLVED' as const } : inc
    );
    setIncidents(updated);
    try {
      localStorage.setItem('replate_incident_tickets', JSON.stringify(updated));
    } catch (_) {}

    setToastState({
      isOpen: true,
      message: `Tiket insiden ${incId} berhasil diselesaikan & diarsipkan!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            CONTROL TOWER SUPERADMIN
          </span>
          <h2 className="text-2xl font-black text-[#1B3A5C]">Admin Platform Overview</h2>
          <p className="text-xs text-slate-500 font-medium">
            Pengawasan pusat redistribusi pangan berlebih, tata kelola lisensi, dan pemantauan eskalasi kota.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/approvals">
            <Button variant="gold" size="md" className="font-black text-xs text-slate-950 flex items-center gap-2 shadow-md">
              <ClockIcon size={14} />
              <span>Persetujuan Lisensi Mitra (3)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Admin */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-bold block">Total Provider Terverifikasi</span>
          <span className="text-xl sm:text-2xl font-black text-[#1B3A5C] block">{kpis.providersCount} Mitra</span>
          <span className="text-[10px] text-emerald-600 font-bold">100% Lolos SOP BPOM</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-bold block">Panti &amp; Rescue Partner</span>
          <span className="text-xl sm:text-2xl font-black text-[#D4A843] block">{kpis.rescuePartnersCount} Lembaga</span>
          <span className="text-[10px] text-slate-400 font-medium">Kapasitas 350+ Jiwa</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-bold block">Konsumen Terdaftar</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 block">{kpis.consumersCount} Pengguna</span>
          <span className="text-[10px] text-blue-600 font-bold">Terverifikasi NIK / SKTM</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-bold block">Waste Diverted Surabaya</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 block">{kpis.wasteDivertedPercent.toFixed(1)}%</span>
          <span className="text-[10px] text-emerald-600 font-bold">1.4 Ton Pangan Selamat</span>
        </div>
      </div>

      {/* FIELD INCIDENT ESCALATION MONITORING (New Requirement) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">
                <AlertTriangleIcon size={16} />
              </span>
              <h3 className="text-base font-black text-[#1B3A5C]">
                Eskalasi Insiden Lapangan (Field Incident Tickets)
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Laporan kendala operasional dari driver relawan, panti asuhan, dan kasir toko selama proses redistribusi pangan.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 self-start sm:self-auto">
            {incidents.filter((i) => i.status !== 'RESOLVED').length} Tiket Membutuhkan Penanganan
          </span>
        </div>

        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                inc.status === 'RESOLVED'
                  ? 'bg-slate-50/70 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-xs text-[#1B3A5C] bg-slate-100 px-2 py-0.5 rounded">
                    {inc.code}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    inc.severity === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : inc.severity === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {inc.severity} SEVERITY
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    inc.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inc.status === 'INVESTIGATING'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    STATUS: {inc.status}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-[11px] text-slate-500 font-mono">{inc.reportedAt}</span>
                </div>

                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  {inc.issueType} — Resi Ref: <strong className="font-mono text-[#1B3A5C]">{inc.claimCode}</strong>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {inc.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-0.5">
                  <span>Pelapor: <strong className="text-slate-800">{inc.reporter}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon size={12} className="text-red-500" />
                    <span>{inc.location}</span>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                {inc.status !== 'RESOLVED' ? (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleResolveIncident(inc.id)}
                    className="font-black text-xs text-slate-950 py-1.5 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckIcon size={13} />
                    <span>Selesaikan Tiket</span>
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckIcon size={13} /> Selesai Diinvestigasi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Action Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border-slate-200 hover:border-[#1B3A5C] transition-all">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">Kelola Pengguna &amp; Akun</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs">
            <p className="text-slate-500">Kelola direktori mitra provider, panti asuhan, dan akun konsumen di Surabaya.</p>
            <Link href="/dashboard/admin/users" className="block">
              <Button variant="primary" size="sm" className="w-full font-bold">
                Buka Direktori Pengguna →
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="bg-white border-slate-200 hover:border-[#1B3A5C] transition-all">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">Monitoring Surplus Real-time</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs">
            <p className="text-slate-500">Pantau pergerakan stok makanan berlebih dan status klaim secara langsung.</p>
            <Link href="/dashboard/admin/food-monitor" className="block">
              <Button variant="gold" size="sm" className="w-full font-bold">
                Pantau Stream Surplus →
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="bg-white border-slate-200 hover:border-[#1B3A5C] transition-all">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">Pengaturan Bobot Algoritma</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-xs">
            <p className="text-slate-500">Atur bobot kriteria Smart Matching (jarak, urgensi deadline, kapasitas partner).</p>
            <Link href="/dashboard/admin/settings" className="block">
              <Button variant="outline" size="sm" className="w-full font-bold border-slate-300">
                Konfigurasi Parameter →
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
