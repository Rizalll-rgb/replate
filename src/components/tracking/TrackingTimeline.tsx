import React, { useState } from 'react';

export interface TrackingStep {
  status:
    | 'LISTED'
    | 'MATCHED'
    | 'CLAIMED'
    | 'PICKUP_READY'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'VERIFIED'
    | 'CANCELLED'
    | 'DISQUALIFIED';
  title: string;
  description: string;
  timestamp?: string;
  actor?: string;
  completed: boolean;
  current: boolean;
  proofImageUrl?: string;
  proofNotes?: string;
}

export interface TrackingTimelineProps {
  referenceId: string;
  foodName?: string;
  steps: TrackingStep[];
  onViewProof?: () => void;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  referenceId,
  foodName,
  steps,
  onViewProof,
}) => {
  const [showProofPreview, setShowProofPreview] = useState(false);

  const isDeliveredOrVerified = steps.some(
    (s) => (s.status === 'DELIVERED' || s.status === 'VERIFIED') && s.completed
  );

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#D4A843] uppercase tracking-widest">
            Food Rescue ID Tracking
          </span>
          <span className="text-xs font-mono bg-[#1B3A5C] text-white font-bold px-3 py-1 rounded-md">
            {referenceId}
          </span>
        </div>
        {foodName && <h3 className="text-base sm:text-lg font-extrabold text-[#1B3A5C] mt-2">{foodName}</h3>}
      </div>

      {/* Banner Bukti Pengiriman & Serah Terima Jika Selesai */}
      {isDeliveredOrVerified && (
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 block">
              STATUS AKHIR TERVERIFIKASI
            </span>
            <p className="text-xs font-bold text-emerald-950">
              Makanan telah diserahterimakan dengan dokumentasi foto dan tanda tangan sah.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onViewProof) onViewProof();
              else setShowProofPreview((v) => !v);
            }}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 self-start sm:self-auto"
          >
            <span>{showProofPreview ? 'Tutup Bukti' : 'Lihat Bukti Pengiriman'}</span>
            <span>→</span>
          </button>
        </div>
      )}

      {showProofPreview && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <strong className="text-[#1B3A5C] block font-extrabold">
            Foto Dokumentasi & Catatan Serah Terima:
          </strong>
          <div className="rounded-xl overflow-hidden aspect-video border border-slate-200 max-w-sm mx-auto bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80"
              alt="Bukti Serah Terima"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>Catatan Petugas:</strong> Paket bantuan pangan diterima dalam kondisi hangat, wadah tersegel rapi, dan sesuai porsi manifes.
          </p>
        </div>
      )}

      <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
        {steps.map((step, idx) => {
          let badgeBg = 'bg-slate-300 text-slate-700';
          let textColor = 'text-slate-500';

          if (step.completed) {
            badgeBg = 'bg-emerald-600 text-white';
            textColor = 'text-slate-800 font-extrabold';
          } else if (step.current) {
            badgeBg = 'bg-[#1B3A5C] text-white ring-4 ring-[#1B3A5C]/20';
            textColor = 'text-[#1B3A5C] font-extrabold';
          }

          return (
            <div key={idx} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${badgeBg}`}
              >
                {step.completed ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm ${textColor}`}>{step.title}</h4>
                  {step.timestamp && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(step.timestamp).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{step.description}</p>
                {step.actor && (
                  <p className="text-[11px] text-[#1B3A5C] font-extrabold">Aktor: {step.actor}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

