import React from 'react';

export interface TrackingStep {
  status: 'LISTED' | 'MATCHED' | 'CLAIMED' | 'PICKUP_READY' | 'IN_TRANSIT' | 'DELIVERED' | 'VERIFIED' | 'CANCELLED' | 'DISQUALIFIED';
  title: string;
  description: string;
  timestamp?: string;
  actor?: string;
  completed: boolean;
  current: boolean;
}

export interface TrackingTimelineProps {
  referenceId: string;
  foodName?: string;
  steps: TrackingStep[];
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ referenceId, foodName, steps }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#D4A843] uppercase tracking-widest">
            Food Rescue ID Tracking
          </span>
          <span className="text-xs font-mono bg-[#1B3A5C] text-white font-bold px-3 py-1 rounded-md">
            {referenceId}
          </span>
        </div>
        {foodName && <h3 className="text-lg font-extrabold text-[#1B3A5C] mt-2">{foodName}</h3>}
      </div>

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
