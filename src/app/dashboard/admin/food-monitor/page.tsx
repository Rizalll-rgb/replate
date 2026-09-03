'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function AdminFoodMonitorPage() {
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [activeStreams, setActiveStreams] = useState([
    {
      id: 'FB-LIVE-001',
      foodName: 'Bakso Sapi Komplit',
      provider: 'Warung Bakso Pak Kumis (Genteng)',
      quantity: '15 Porsi',
      timeRemaining: '1 Jam 45 Menit',
      status: 'CRITICAL_URGENT',
      safetyScore: '100% BPOM SOP',
      recipient: 'Panti Asuhan Kasih Ibu (Matched 96%)',
      district: 'Kec. Genteng, Surabaya',
      phone: '081234567891',
    },
    {
      id: 'FB-LIVE-002',
      foodName: 'Roti Tawar & Danish Pastry',
      provider: 'PT Roti Boy Utama (Gubeng)',
      quantity: '25 Pcs',
      timeRemaining: '3 Jam 15 Menit',
      status: 'AVAILABLE',
      safetyScore: '100% BPOM SOP',
      recipient: 'Pencarian Partner Aktif',
      district: 'Kec. Gubeng, Surabaya',
      phone: '081398765432',
    },
    {
      id: 'FB-LIVE-003',
      foodName: 'Buffet Nasi Goreng & Ayam Bakar',
      provider: 'Hotel Majapahit Banquet (Tunjungan)',
      quantity: '30 Porsi',
      timeRemaining: '45 Menit',
      status: 'IN_TRANSIT',
      safetyScore: '100% BPOM SOP',
      recipient: 'Armada Rescue Partner #02 (Budi Santoso)',
      district: 'Kec. Tegalsari, Surabaya',
      phone: '081133445566',
    },
  ]);

  const handleTriggerEmergencyMatch = (id: string, name: string) => {
    setActiveStreams((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'IN_TRANSIT', recipient: 'Armada Darurat Replate Dispatcher' } : item
      )
    );
    setToastState({
      isOpen: true,
      message: `Emergency Match dipicu untuk ${name}! Push notification darurat dikirim ke 3 armada terdekat.`,
      type: 'success',
    });
  };

  const handleDisqualify = (id: string, name: string) => {
    setActiveStreams((prev) => prev.filter((item) => item.id !== id));
    setToastState({
      isOpen: true,
      message: `Porsi ${name} ditandai tidak layak dan dihentikan penayangannya dari sistem.`,
      type: 'error',
    });
  };

  return (
    <div className={`space-y-8 transition-all ${isProjectorMode ? 'bg-[#0F1923] text-white p-8 rounded-3xl min-h-screen' : ''}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 pb-4">
        <div>
          <span className="text-[10px] font-extrabold text-[#D4A843] uppercase tracking-widest block">
            Control Tower Live Monitoring Surabaya
          </span>
          <h2 className={`text-2xl font-extrabold ${isProjectorMode ? 'text-white' : 'text-[#1B3A5C]'}`}>
            Monitoring Makanan Surplus Real-Time
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Pengawasan lalu lintas redistribusi makanan berlebih, status masa simpan, dan intervensi darurat kota.
          </p>
        </div>

        {/* Projector Mode Switch Button */}
        <Button
          variant={isProjectorMode ? 'gold' : 'primary'}
          size="md"
          className="font-extrabold flex items-center gap-2 shadow-lg"
          onClick={() => setIsProjectorMode(!isProjectorMode)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{isProjectorMode ? ' Keluar Mode Proyektor' : ' Mode Tampilan Proyektor Fullscreen'}</span>
        </Button>
      </div>

      {/* Mode Proyektor Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border shadow-xs ${isProjectorMode ? 'bg-[#142C47] border-[#2C5A8F]' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-slate-400 font-bold block">Surplus Aktif Terdaftar</span>
          <span className="text-3xl font-extrabold text-[#D4A843] mt-1 block">70 Porsi</span>
        </div>
        <div className={`p-5 rounded-2xl border shadow-xs ${isProjectorMode ? 'bg-[#142C47] border-[#2C5A8F]' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-slate-400 font-bold block">Sisa Waktu Kritis (&lt; 2 Jam)</span>
          <span className="text-3xl font-extrabold text-red-500 mt-1 block">1 Item</span>
        </div>
        <div className={`p-5 rounded-2xl border shadow-xs ${isProjectorMode ? 'bg-[#142C47] border-[#2C5A8F]' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-slate-400 font-bold block">Armada Penjemputan Aktif</span>
          <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">4 Armada</span>
        </div>
        <div className={`p-5 rounded-2xl border shadow-xs ${isProjectorMode ? 'bg-[#142C47] border-[#2C5A8F]' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-slate-400 font-bold block">Tingkat Penyelamatan Pangan</span>
          <span className="text-3xl font-extrabold text-blue-400 mt-1 block">94.8%</span>
        </div>
      </div>

      {/* Live Stream Stream Monitoring Cards */}
      <div className={`rounded-2xl border p-6 space-y-4 shadow-xs ${isProjectorMode ? 'bg-[#142C47] border-[#2C5A8F]' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-row items-center justify-between border-b border-slate-700/40 pb-3">
          <h3 className={`text-lg font-extrabold ${isProjectorMode ? 'text-white' : 'text-[#1B3A5C]'}`}>
            Live Redistribution Stream & Operational Control
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE STREAM SURABAYA CONTROL TOWER
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {activeStreams.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border space-y-3 transition-all ${
                isProjectorMode
                  ? 'bg-[#0F1923] border-[#2C5A8F]'
                  : 'bg-slate-50 border-slate-200 hover:border-[#1B3A5C]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/30 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-slate-400 font-bold">{item.id}</span>
                  <span className={`font-extrabold text-base ${isProjectorMode ? 'text-white' : 'text-[#1B3A5C]'}`}>
                    {item.foodName}
                  </span>
                  <Badge variant="primary" size="sm">
                    {item.quantity}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.status === 'CRITICAL_URGENT' ? 'warning' : 'success'} size="sm">
                    {item.status === 'CRITICAL_URGENT' ? ' KRITIS < 2 JAM' : item.status}
                  </Badge>
                  <span className="font-extrabold text-red-500 text-sm">Sisa: {item.timeRemaining}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 font-semibold block">Penyedia (Provider):</span>
                  <span className={`font-bold ${isProjectorMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.provider}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Penerima / Matching Score:</span>
                  <span className="font-extrabold text-[#D4A843]">{item.recipient}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Wilayah Kecamatan:</span>
                  <span className={`font-bold ${isProjectorMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.district}</span>
                </div>
              </div>

              {/* Action Buttons Operational Control Superadmin */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-700/30">
                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span> Kontak Provider</span>
                </a>
                <button
                  onClick={() => handleDisqualify(item.id, item.foodName)}
                  className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                   Diskualifikasi
                </button>
                <button
                  onClick={() => handleTriggerEmergencyMatch(item.id, item.foodName)}
                  className="px-3.5 py-1.5 bg-[#D4A843] hover:bg-[#b88f32] text-slate-900 rounded-xl text-xs font-extrabold transition-colors shadow-md flex items-center gap-1"
                >
                  <span> Trigger Emergency Match</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
