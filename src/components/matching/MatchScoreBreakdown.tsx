import React from 'react';

export interface MatchScoreBreakdownProps {
  breakdown: {
    distance?: { raw: number; normalized: number; weighted: number };
    urgency?: { raw: number; normalized: number; weighted: number };
    foodTypeMatch?: { raw: number; normalized: number; weighted: number };
    quantityFit?: { raw: number; normalized: number; weighted: number };
    reliabilityScore?: { raw: number; normalized: number; weighted: number };
    partnerCapacity?: { raw: number; normalized: number; weighted: number };
    routeEfficiency?: { raw: number; normalized: number; weighted: number };
  };
}

export const MatchScoreBreakdown: React.FC<MatchScoreBreakdownProps> = ({ breakdown }) => {
  if (!breakdown) return null;

  const items = [
    { label: 'Kedekatan Lokasi (25%)', val: breakdown.distance?.normalized ?? 0 },
    { label: 'Urgensi Deadline (20%)', val: breakdown.urgency?.normalized ?? 0 },
    { label: 'Kecocokan Jenis Pangan (15%)', val: breakdown.foodTypeMatch?.normalized ?? 0 },
    { label: 'Kecocokan Kuantitas (15%)', val: breakdown.quantityFit?.normalized ?? 0 },
    { label: 'Track Record Pickup (10%)', val: breakdown.reliabilityScore?.normalized ?? 0 },
    { label: 'Kapasitas Armada Partner (10%)', val: breakdown.partnerCapacity?.normalized ?? 0 },
    { label: 'Efisiensi Rute (5%)', val: breakdown.routeEfficiency?.normalized ?? 0 },
  ];

  return (
    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-[11px]">
      <p className="font-extrabold text-[#1B3A5C] border-b border-slate-200 pb-1.5 flex items-center justify-between">
        <span>Detail Bobot Smart Matching Algorithm</span>
        <span className="text-[10px] text-slate-500 font-semibold">Multi-Criteria Score</span>
      </p>
      {items.map((item, idx) => {
        const pct = Math.round(item.val * 100);
        return (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#1B3A5C] h-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-bold text-slate-800 w-7 text-right">{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
