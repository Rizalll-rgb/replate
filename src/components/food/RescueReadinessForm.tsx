'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

/**
 * Signals from the parent FoodForm that drive auto-validation of each checklist item.
 * Each field maps to a real form input so checklist items turn green automatically.
 */
export interface FormValidationSignals {
  hasName?: boolean;
  hasCategory?: boolean;
  hasQuantity?: boolean;
  hasWeight?: boolean;
  pickupDeadlineMs?: number; // epoch ms of the pickup deadline
  hasStorageCondition?: boolean;
  hasPackagingType?: boolean;
  hasPhoto?: boolean;
  hasAddress?: boolean;
  hasCoordinates?: boolean;
}

export interface RescueReadinessFormProps {
  onChange: (checklist: RescueReadinessChecklist, is100Percent: boolean) => void;
  /** External form signals for auto-validation — when provided, items auto-check based on actual form field values */
  formSignals?: FormValidationSignals;
}

export const RescueReadinessForm: React.FC<RescueReadinessFormProps> = ({ onChange, formSignals }) => {
  // Only noSpoilage is manual (sensory confirmation from kitchen staff)
  const [manualSpoilageConfirm, setManualSpoilageConfirm] = useState<boolean>(false);
  const [showSensoryGuide, setShowSensoryGuide] = useState<boolean>(false);

  // Derive checklist from form signals + manual spoilage confirmation
  const deriveChecklist = useCallback((): RescueReadinessChecklist => {
    if (!formSignals) {
      // Fallback: all false until form signals are provided
      return {
        infoComplete: false,
        notExpired: false,
        storageProper: false,
        packagingIntact: false,
        noSpoilage: manualSpoilageConfirm,
        photoClear: false,
        pickupRealistic: false,
        locationAccurate: false,
      };
    }

    const now = Date.now();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    return {
      // 1. Info Lengkap: Nama, Kategori, Jumlah, Berat terisi
      infoComplete: !!(formSignals.hasName && formSignals.hasCategory && formSignals.hasQuantity && formSignals.hasWeight),
      // 2. Belum Expired: Deadline > sekarang
      notExpired: !!(formSignals.pickupDeadlineMs && formSignals.pickupDeadlineMs > now),
      // 3. Kondisi Penyimpanan: Suhu dipilih
      storageProper: !!formSignals.hasStorageCondition,
      // 4. Kemasan Utuh: Jenis kemasan dipilih
      packagingIntact: !!formSignals.hasPackagingType,
      // 5. Bebas Kerusakan: Konfirmasi manual oleh staf dapur
      noSpoilage: manualSpoilageConfirm,
      // 6. Foto Jelas: Minimal 1 foto terunggah
      photoClear: !!formSignals.hasPhoto,
      // 7. Pickup Realistis: Waktu penjemputan >= 2 jam dari sekarang
      pickupRealistic: !!(formSignals.pickupDeadlineMs && (formSignals.pickupDeadlineMs - now) >= twoHoursMs),
      // 8. Lokasi Akurat: Alamat dan koordinat terisi
      locationAccurate: !!(formSignals.hasAddress && formSignals.hasCoordinates),
    };
  }, [formSignals, manualSpoilageConfirm]);

  const [checklist, setChecklist] = useState<RescueReadinessChecklist>(deriveChecklist());

  // Re-derive checklist whenever form signals or manual confirmation changes
  useEffect(() => {
    const derived = deriveChecklist();
    setChecklist(derived);
    const count = Object.values(derived).filter(Boolean).length;
    onChange(derived, count === 8);
  }, [formSignals, manualSpoilageConfirm, deriveChecklist, onChange]);

  const totalChecked = Object.values(checklist).filter(Boolean).length;
  const is100Percent = totalChecked === 8;
  const scorePercent = Math.round((totalChecked / 8) * 100);

  const items = [
    {
      key: 'infoComplete',
      label: 'Informasi Lengkap',
      desc: 'Nama makanan, jenis, jumlah, dan berat terisi jelas',
      autoIcon: '📋',
      isAuto: true,
    },
    {
      key: 'notExpired',
      label: 'Makanan Belum Expired',
      desc: 'Tanggal produksi & kadaluarsa masih sangat valid',
      autoIcon: '📅',
      isAuto: true,
    },
    {
      key: 'storageProper',
      label: 'Kondisi Penyimpanan Sesuai',
      desc: 'Suhu ruangan/dingin/beku terjaga dengan benar',
      autoIcon: '🌡️',
      isAuto: true,
    },
    {
      key: 'packagingIntact',
      label: 'Kemasan Utuh & Bersih',
      desc: 'Kemasan tidak rusak, bocor, atau terbuka',
      autoIcon: '📦',
      isAuto: true,
    },
    {
      key: 'noSpoilage',
      label: 'Bebas Tanda Kerusakan',
      desc: 'Tidak berbau aneh, tidak berubah warna, bebas jamur',
      autoIcon: '🔬',
      isAuto: false, // Manual confirmation required
    },
    {
      key: 'photoClear',
      label: 'Foto Jelas & Terkini',
      desc: 'Minimal 1 foto kondisi riil makanan yang diunggah',
      autoIcon: '📸',
      isAuto: true,
    },
    {
      key: 'pickupRealistic',
      label: 'Batas Pickup Realistis',
      desc: 'Waktu penjemputan minimal 2 jam dari sekarang',
      autoIcon: '⏰',
      isAuto: true,
    },
    {
      key: 'locationAccurate',
      label: 'Lokasi & Alamat Akurat',
      desc: 'Alamat dan koordinat titik penjemputan sudah pas',
      autoIcon: '📍',
      isAuto: true,
    },
  ];

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
          {scorePercent}% {is100Percent ? 'Siap' : 'Belum Lengkap'}
        </Badge>
      </CardHeader>

      <CardBody className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => {
            const isChecked = checklist[item.key as keyof RescueReadinessChecklist];
            const isManualItem = !item.isAuto;
            return (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  isChecked
                    ? 'bg-white border-emerald-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200'
                } ${isManualItem ? 'cursor-pointer' : ''}`}
                onClick={isManualItem ? () => {
                  if (item.key === 'noSpoilage') {
                    setManualSpoilageConfirm(!manualSpoilageConfirm);
                  }
                } : undefined}
              >
                {/* Status indicator */}
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                  isChecked
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-200 text-slate-400 border border-slate-300'
                }`}>
                  {isChecked ? '✓' : '○'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 block">{item.autoIcon} {item.label}</span>
                    {item.isAuto && (
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        isChecked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isChecked ? 'Auto ✓' : 'Menunggu Input'}
                      </span>
                    )}
                    {!item.isAuto && (
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        isChecked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isChecked ? 'Dikonfirmasi ✓' : 'Perlu Konfirmasi'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight block">{item.desc}</span>

                  {/* Sensory Test Guide for noSpoilage item */}
                  {item.key === 'noSpoilage' && (
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSensoryGuide(!showSensoryGuide);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                      >
                        {showSensoryGuide ? '▾ Tutup Panduan Uji Sensorik' : '▸ Lihat Panduan Uji Sensorik BPOM'}
                      </button>

                      {showSensoryGuide && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-[10px] text-blue-900">
                          <span className="font-black text-[11px] text-blue-950 block">🧪 Panduan Uji Sensorik Cepat (Standar BPOM RI)</span>
                          <div className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <span>👃</span>
                              <span><strong>Uji Aroma:</strong> Bebas bau asam, tengik, basi, atau bau amis tidak wajar.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span>👁️</span>
                              <span><strong>Uji Tekstur & Visual:</strong> Tidak berlendir, tidak berubah warna gelap/kehijauan, bebas bintik jamur.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span>🌡️</span>
                              <span><strong>Uji Suhu:</strong> Makanan panas terjaga &gt;60°C, makanan dingin terjaga &lt;4°C (zona bahaya 4-60°C dihindari).</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span>🧤</span>
                              <span><strong>Uji Fisik:</strong> Kemasan tidak kembung, segel tidak rusak, tidak ada benda asing di dalam wadah.</span>
                            </div>
                          </div>
                          <div className="pt-1 border-t border-blue-200">
                            <span className="text-[9px] font-semibold text-blue-700">
                              Referensi: Peraturan BPOM No. 22/2018 tentang Pedoman Pemberian Sertifikat Produksi Pangan Industri Rumah Tangga & WHO Five Keys to Safer Food.
                            </span>
                          </div>
                        </div>
                      )}

                      {!isChecked && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={manualSpoilageConfirm}
                            onChange={(e) => {
                              e.stopPropagation();
                              setManualSpoilageConfirm(!manualSpoilageConfirm);
                            }}
                            className="h-3.5 w-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-700 font-semibold">
                            Saya bertanggung jawab penuh bahwa makanan ini telah lolos uji sensorik dapur dan bebas tanda kerusakan.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-600">Kelengkapan SOP BPOM & WHO</span>
            <span className={is100Percent ? 'text-emerald-700' : 'text-amber-700'}>{totalChecked}/8 Terpenuhi</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                is100Percent ? 'bg-emerald-500' : scorePercent >= 50 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {!is100Percent && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Lengkapi semua field form di atas agar seluruh 8 syarat SOP otomatis terpenuhi (100%). Poin yang masih abu-abu menunggu input Anda.</span>
          </div>
        )}

        {is100Percent && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>✅ Semua 8 syarat SOP BPOM & WHO terpenuhi 100%! Makanan siap dipublikasikan ke platform Replate.</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
