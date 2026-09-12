'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Radio,
  MapPin,
  Flame,
  Gift,
  X,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Info,
} from 'lucide-react';

export interface RadarFoodItem {
  id: string;
  title: string;
  providerName: string;
  category: string;
  quantity: string;
  discountPrice: number;
  originalPrice: number;
  isFree: boolean;
  type?: 'RESCUE_SALE' | 'DONATION' | string;
  pickupTime: string;
  distance: string;
  imageUrl: string;
  rating?: number;
  providerAddress?: string;
  [key: string]: any;
}

interface RadarViewProps {
  items: any[];
  userAddress: string;
  onClose: () => void;
  onSelectFood: (item: any) => void;
  onClaimFood: (item: any) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  items,
  userAddress,
  onClose,
  onSelectFood,
  onClaimFood,
}) => {
  const [selectedRadius, setSelectedRadius] = useState<2 | 5 | 10>(5);
  const [schemeFilter, setSchemeFilter] = useState<'ALL' | 'DONATION' | 'RESCUE'>('ALL');
  const [activeItem, setActiveItem] = useState<RadarFoodItem | null>(null);

  // Filter items based on radius and scheme
  const filteredRadarItems = useMemo(() => {
    return items.filter((item) => {
      const d = parseFloat(item.distance?.replace(/[^0-9.]/g, '') || '1.5');
      if (d > selectedRadius) return false;
      if (schemeFilter === 'DONATION' && !item.isFree) return false;
      if (schemeFilter === 'RESCUE' && item.isFree) return false;
      return true;
    });
  }, [items, selectedRadius, schemeFilter]);

  // Compute positions for blips on the circular radar
  const blipPositions = useMemo(() => {
    return filteredRadarItems.map((item, idx) => {
      const d = parseFloat(item.distance?.replace(/[^0-9.]/g, '') || '1.5');
      // Normalize distance between 12% and 44% from center
      const distanceRatio = Math.min(Math.max((d / selectedRadius) * 38, 12), 44);
      // Generate deterministic angle spread
      const angle = (idx * (360 / Math.max(filteredRadarItems.length, 1)) + 28) % 360;
      const rad = (angle * Math.PI) / 180;
      const x = 50 + distanceRatio * Math.cos(rad);
      const y = 50 + distanceRatio * Math.sin(rad);

      return {
        item,
        x,
        y,
        angle,
      };
    });
  }, [filteredRadarItems, selectedRadius]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A843]">
                GEOLOKASI LIVE
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Peta Radar Surplus Replate
            </h3>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate max-w-xs sm:max-w-md">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span>Titik Pusat: <strong>{userAddress}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Tutup Radar</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Radius & Scheme */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/60">
        {/* Radius Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 mr-1 hidden sm:inline">Jangkauan:</span>
          {([2, 5, 10] as const).map((r) => (
            <button
              key={`radius-${r}`}
              type="button"
              onClick={() => setSelectedRadius(r)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRadius === r
                  ? 'bg-[#D4A843] text-slate-950 shadow-md shadow-amber-950/20'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>

        {/* Scheme Selector */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSchemeFilter('ALL')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
              schemeFilter === 'ALL'
                ? 'bg-slate-200 text-slate-950 shadow-xs'
                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setSchemeFilter('RESCUE')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
              schemeFilter === 'RESCUE'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-300" />
            <span>Rescue Sale</span>
          </button>
          <button
            type="button"
            onClick={() => setSchemeFilter('DONATION')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
              schemeFilter === 'DONATION'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Gift className="w-3 h-3 text-emerald-300" />
            <span>Donasi Rp 0</span>
          </button>
        </div>
      </div>

      {/* Main Radar Screen */}
      <div className="relative w-full aspect-square max-w-[420px] mx-auto rounded-full overflow-hidden border-2 border-emerald-500/40 bg-radial from-[#132842] via-[#0A1728] to-[#040A12] shadow-[0_0_50px_rgba(16,185,129,0.15)] flex items-center justify-center select-none">
        {/* Concentric Distance Rings */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/20 pointer-events-none" />
        <div className="absolute w-[66%] h-[66%] rounded-full border border-emerald-500/20 pointer-events-none" />
        <div className="absolute w-[33%] h-[33%] rounded-full border border-emerald-500/25 pointer-events-none" />

        {/* Crosshair Axes */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/15 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/15 pointer-events-none" />

        {/* Distance Labels */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-emerald-400/80 bg-slate-900/80 px-1.5 py-0.5 rounded pointer-events-none">
          {selectedRadius} km
        </span>
        <span className="absolute top-[17%] left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-emerald-400/60 pointer-events-none">
          {Math.round(selectedRadius * 0.66)} km
        </span>
        <span className="absolute top-[34%] left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-emerald-400/50 pointer-events-none">
          {Math.round(selectedRadius * 0.33)} km
        </span>

        {/* Rotating Sonar Radar Beam */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.3) 0deg, rgba(16, 185, 129, 0.05) 50deg, transparent 70deg)',
            animation: 'radar-sweep 4s linear infinite',
          }}
        />

        {/* User Central Location Dot */}
        <div className="absolute z-20 flex flex-col items-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_12px_#3b82f6]" />
            <div className="absolute w-8 h-8 rounded-full bg-blue-400/30 animate-ping pointer-events-none" />
          </div>
          <span className="text-[8.5px] font-black text-blue-300 mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-blue-500/40 whitespace-nowrap shadow-xs">
            Anda
          </span>
        </div>

        {/* Interactive Blips */}
        {blipPositions.map(({ item, x, y }) => {
          const isSelected = activeItem?.id === item.id;
          return (
            <div
              key={`radar-blip-${item.id}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setActiveItem(item)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-transform hover:scale-125"
            >
              <div className="relative flex items-center justify-center">
                {/* Ping Ring */}
                <div
                  className={`absolute w-7 h-7 rounded-full animate-ping pointer-events-none ${
                    item.isFree ? 'bg-emerald-400/30' : 'bg-amber-400/30'
                  }`}
                />
                
                {/* Target Dot */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-black shadow-lg transition-all ${
                    item.isFree
                      ? 'bg-emerald-500 border-emerald-200 text-slate-950'
                      : 'bg-amber-500 border-amber-200 text-slate-950'
                  } ${isSelected ? 'ring-4 ring-white scale-125' : ''}`}
                >
                  {item.isFree ? <Gift className="w-2.5 h-2.5" /> : <Flame className="w-2.5 h-2.5" />}
                </div>

                {/* Blip Label Hover */}
                <div className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[9px] font-black shadow-lg pointer-events-none transition-all ${
                  isSelected ? 'opacity-100 bg-white text-slate-950 scale-100' : 'opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white scale-95'
                }`}>
                  {item.providerName.split(' ')[0]} • {item.distance}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Target Preview Card */}
      {activeItem && (
        <div className="p-3.5 sm:p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl space-y-3 animate-fade-in-up">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-700 shrink-0 border border-slate-600 relative">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-0 left-0 text-[8px] font-black px-1.5 py-0.5 text-white ${
                  activeItem.isFree ? 'bg-emerald-600' : 'bg-red-600'
                }`}>
                  {activeItem.isFree ? 'Rp 0' : 'Rescue'}
                </span>
              </div>

              <div className="min-w-0 space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold block truncate">
                  {activeItem.providerName} • {activeItem.distance}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight truncate">
                  {activeItem.title}
                </h4>
                <p className="text-[10.5px] text-slate-400 truncate">
                  Tersisa {activeItem.quantity} • Ambil {activeItem.pickupTime}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/80">
            <div>
              {!activeItem.isFree && (
                <span className="text-[9.5px] text-slate-400 line-through font-mono block">
                  Rp {activeItem.originalPrice.toLocaleString('id-ID')}
                </span>
              )}
              <strong className={`text-sm font-black font-mono ${
                activeItem.isFree ? 'text-emerald-400' : 'text-[#D4A843]'
              }`}>
                {activeItem.isFree ? 'Gratis Rp 0' : `Rp ${activeItem.discountPrice.toLocaleString('id-ID')}`}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectFood(activeItem)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Detail
              </button>
              <button
                type="button"
                onClick={() => onClaimFood(activeItem)}
                className="px-4 py-1.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.97]"
              >
                Klaim Cepat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detected Surplus List */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#D4A843]" />
            <span>Gerai Terdeteksi Radar ({filteredRadarItems.length})</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            Radius &lt; {selectedRadius} km
          </span>
        </div>

        {filteredRadarItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800">
            Tidak ada makanan surplus terdeteksi pada radius {selectedRadius} km. Coba perlebar radius jangkauan ke 10 km.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
            {filteredRadarItems.map((item) => (
              <div
                key={`radar-list-${item.id}`}
                onClick={() => setActiveItem(item)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  activeItem?.id === item.id
                    ? 'bg-slate-800 border-[#D4A843]'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-700">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.providerName} • {item.distance}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-xs font-black font-mono ${item.isFree ? 'text-emerald-400' : 'text-[#D4A843]'}`}>
                    {item.isFree ? 'Rp 0' : `Rp ${item.discountPrice.toLocaleString('id-ID')}`}
                  </p>
                  <span className="text-[9px] text-slate-400">Pilih Blip →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes radar-sweep {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
