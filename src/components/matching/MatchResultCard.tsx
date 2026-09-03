'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScoreBreakdown } from './MatchScoreBreakdown';

export interface MatchResultCardProps {
  id: string;
  foodName: string;
  matchedUserName: string;
  score: number;
  scoreBreakdown: any;
  matchType: 'CONSUMER' | 'RESCUE_PARTNER';
  createdAt: string;
  onAccept?: (id: string) => void;
}

export const MatchResultCard: React.FC<MatchResultCardProps> = ({
  id,
  foodName,
  matchedUserName,
  score,
  scoreBreakdown,
  matchType,
  onAccept,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const percentScore = Math.round(score * 100);

  return (
    <Card className="border-slate-200 hover:border-[#1B3A5C] transition-all shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Badge variant={matchType === 'RESCUE_PARTNER' ? 'gold' : 'primary'}>
            {matchType === 'RESCUE_PARTNER' ? 'Food Rescue Partner' : 'Konsumen Target'}
          </Badge>
          <CardTitle className="text-base mt-1 text-[#1B3A5C] font-extrabold">{foodName}</CardTitle>
          <p className="text-xs text-slate-500 font-medium">Target: {matchedUserName}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-emerald-700">{percentScore}%</div>
          <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Match Score</span>
        </div>
      </CardHeader>

      <CardBody className="py-2 text-xs">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-[#1B3A5C] font-extrabold hover:underline flex items-center gap-1.5 mb-2"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
          <span>{showBreakdown ? 'Sembunyikan Detail' : 'Lihat Breakdown Algoritma Smart Matching'}</span>
        </button>

        {showBreakdown && <MatchScoreBreakdown breakdown={scoreBreakdown} />}
      </CardBody>

      {onAccept && (
        <CardFooter>
          <Button variant="gold" size="sm" className="w-full text-xs font-bold" onClick={() => onAccept(id)}>
            Terima & Ambil Tugas Penyelamatan 
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
