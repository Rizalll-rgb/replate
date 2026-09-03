'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export interface ImpactChartProps {
  data?: Array<{ name: string; weight: number; co2: number }>;
}

const defaultData = [
  { name: 'Minggu 1', weight: 35, co2: 87.5 },
  { name: 'Minggu 2', weight: 48, co2: 120 },
  { name: 'Minggu 3', weight: 62, co2: 155 },
  { name: 'Minggu 4', weight: 80, co2: 200 },
];

export const ImpactChart: React.FC<ImpactChartProps> = ({ data = defaultData }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm"> Tren Penyelamatan Makanan & Emisi CO2</CardTitle>
      </CardHeader>
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#6C757D" fontSize={11} />
            <YAxis stroke="#6C757D" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="weight" name="Makanan (Kg)" fill="#1B3A5C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="co2" name="CO2 Saved (Kg)" fill="#D4A843" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};
