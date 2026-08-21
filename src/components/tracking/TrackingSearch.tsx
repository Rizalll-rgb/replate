'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface TrackingSearchProps {
  onSearch: (id: string) => void;
  initialValue?: string;
}

export const TrackingSearch: React.FC<TrackingSearchProps> = ({ onSearch, initialValue = '' }) => {
  const [trackingId, setTrackingId] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      onSearch(trackingId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
      <Input
        placeholder="Masukkan Food Rescue ID (cth: FB-SBY-20260819-XXXX)"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
        className="text-base py-3"
      />
      <Button type="submit" variant="gold" size="lg" className="whitespace-nowrap font-bold">
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Lacak Status</span>
      </Button>
    </form>
  );
};
