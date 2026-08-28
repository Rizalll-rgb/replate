'use client';

import React from 'react';
import { Card, CardBody } from '../ui/Card';
import { SDG_INFO } from '@/lib/constants';

export const SDGSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-black text-[#D4A843] bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full uppercase tracking-widest inline-block">
            UN SUSTAINABLE DEVELOPMENT GOALS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1B3A5C]">
            Komitmen Nyata Replate terhadap 5 Pilar SDGs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Selaras dengan target proposal Threeplate pada Infinitera 2.0, platform Replate secara langsung mengakselerasi pencapaian 5 Tujuan Pembangunan Berkelanjutan (SDGs):
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SDG_INFO.map((sdg) => (
            <Card
              key={sdg.number}
              className="border-slate-200 bg-white hover:border-[#1B3A5C] hover:shadow-lg transition-all rounded-3xl flex flex-col justify-between"
            >
              <CardBody className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-black text-white rounded-xl shadow-xs ${sdg.badgeColor}`}
                    >
                      SDG {sdg.number}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      PBB / UN
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#1B3A5C] leading-snug">
                    {sdg.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {sdg.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Implementasi Aktif</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
