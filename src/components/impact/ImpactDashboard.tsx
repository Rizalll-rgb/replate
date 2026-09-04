'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';

export interface ImpactDashboardProps {
  foodWeightKg: number;
  co2SavedKg: number;
  peopleFed: number;
  ch4SavedKg?: number;
  wasteDivertedPercent?: number;
  providersCount?: number;
  partnersCount?: number;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  foodWeightKg = 145.8,
  co2SavedKg = 364.5,
  peopleFed = 290,
  wasteDivertedPercent = 88.5,
}) => {
  const ch4SavedKg = Math.round(foodWeightKg * 0.25 * 10) / 10;

  const cards = [
    {
      title: 'Makanan Diselamatkan',
      val: `${foodWeightKg} Kg`,
      color: 'text-[#1B3A5C]',
      icon: (
        <svg className="w-6 h-6 text-[#1B3A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'CO2 Emisi Dicegah',
      val: `${co2SavedKg} Kg`,
      color: 'text-emerald-700',
      icon: (
        <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V7a2 2 0 00-2-2h-1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      ),
    },
    {
      title: 'Gas Metana (CH4) Tercegah',
      val: `${ch4SavedKg} Kg CH4`,
      color: 'text-purple-700',
      icon: (
        <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Penerima Terbantu',
      val: `${peopleFed} Orang`,
      color: 'text-[#D4A843]',
      icon: (
        <svg className="w-6 h-6 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <Card key={idx} className="bg-white border-slate-200 shadow-xs">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">{card.title}</p>
                <h3 className={`text-xl font-extrabold mt-0.5 ${card.color}`}>{card.val}</h3>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">
              Setara Penyerapan Pohon
            </CardTitle>
          </CardHeader>
          <CardBody className="text-xs text-slate-600 space-y-1">
            <p className="text-2xl font-extrabold text-emerald-700">
              ~{(co2SavedKg / 21).toFixed(1)} Pohon / Tahun
            </p>
            <p className="text-slate-500">
              Emisi CO2 yang diselamatkan setara dengan penyerapan CO2 oleh pohon dewasa selama satu tahun penuh.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">
              Pengurangan Gas Metana (CH4) TPA
            </CardTitle>
          </CardHeader>
          <CardBody className="text-xs text-slate-600 space-y-1">
            <p className="text-2xl font-extrabold text-purple-700">
              {ch4SavedKg} Kg CH4
            </p>
            <p className="text-slate-500">
              Mencegah potensi pembentukan gas metana beracun penyebab efek rumah kaca dari sampah makanan di Tempat Pembuangan Akhir (TPA).
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1B3A5C]">
              Setara Pengurangan Jarak Kendaraan
            </CardTitle>
          </CardHeader>
          <CardBody className="text-xs text-slate-600 space-y-1">
            <p className="text-2xl font-extrabold text-[#1B3A5C]">
              ~{Math.round(co2SavedKg / 0.192)} Km Perjalanan Mobil
            </p>
            <p className="text-slate-500">
              Pengurangan emisi gas rumah kaca dari dekomposisi makanan setara dengan tidak mengendarai mobil sejauh ini.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
