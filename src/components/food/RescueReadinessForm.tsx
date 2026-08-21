'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface RescueReadinessChecklist {
  infoComplete: boolean;
  notExpired: boolean;
  storageProper: boolean;
  packagingIntact: boolean;
  noSpoilage: boolean;
  photoClear: boolean;
  pickupRealistic: boolean;
  locationAccurate: boolean;
}

export interface RescueReadinessFormProps {
  onChange: (checklist: RescueReadinessChecklist, is100Percent: boolean) => void;
}

export const RescueReadinessForm: React.FC<RescueReadinessFormProps> = ({ onChange }) => {
  const [checklist, setChecklist] = useState<RescueReadinessChecklist>({
    infoComplete: true,
    notExpired: true,
    storageProper: true,
    packagingIntact: true,
    noSpoilage: true,
    photoClear: true,
    pickupRealistic: true,
    locationAccurate: true,
  });

  const items = [
    { key: 'infoComplete', label: 'Informasi Lengkap', desc: 'Nama makanan, jenis, jumlah, dan berat terisi jelas' },
    { key: 'notExpired', label: 'Makanan Belum Expired', desc: 'Tanggal produksi & kadaluarsa masih sangat valid' },
    { key: 'storageProper', label: 'Kondisi Penyimpanan Sesuai', desc: 'Suhu ruangan/dingin/beku terjaga dengan benar' },
    { key: 'packagingIntact', label: 'Kemasan Utuh & Bersih', desc: 'Kemasan tidak rusak, bocor, atau terbuka' },
    { key: 'noSpoilage', label: 'Bebas Tanda Kerusakan', desc: 'Tidak berbau aneh, tidak berubah warna, bebas jamur' },
    { key: 'photoClear', label: 'Foto Jelas & Terkini', desc: 'Minimal 1 foto kondisi riil makanan yang diunggah' },
    { key: 'pickupRealistic', label: 'Batas Pickup Realistis', desc: 'Waktu penjemputan minimal 2 jam dari sekarang' },
    { key: 'locationAccurate', label: 'Lokasi & Alamat Akurat', desc: 'Alamat dan koordinat titik penjemputan sudah pas' },
  ];

  const totalChecked = Object.values(checklist).filter(Boolean).length;
  const is100Percent = totalChecked === 8;
  const scorePercent = Math.round((totalChecked / 8) * 100);

  const toggleItem = (key: keyof RescueReadinessChecklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    const count = Object.values(updated).filter(Boolean).length;
    onChange(updated, count === 8);
  };

  return (
    <Card className="border-slate-200 bg-slate-50/70">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1B3A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>SOP Rescue Readiness Checklist</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 font-medium">
            Standar Keamanan Pangan BPOM & WHO (Wajib 100% Terpenuhi)
          </CardDescription>
        </div>
        <Badge variant={is100Percent ? 'success' : 'warning'} size="md">
          {scorePercent}% Siap
        </Badge>
      </CardHeader>

      <CardBody className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => {
            const isChecked = checklist[item.key as keyof RescueReadinessChecklist];
            return (
              <label
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-white border-emerald-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-70'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(item.key as keyof RescueReadinessChecklist)}
                  className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">{item.desc}</span>
                </div>
              </label>
            );
          })}
        </div>

        {!is100Percent && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Semua 8 syarat SOP di atas wajib dicentang (100%) agar makanan dapat dipublikasikan.</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
