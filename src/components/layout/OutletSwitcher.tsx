'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  OutletItem,
  getStoredOutlets,
  getActiveOutlet,
  setActiveOutletId,
  isGrowthTierActive,
} from '@/lib/outletManager';
import { Store, ChevronDown, Check, Plus, Sparkles, Lock, MapPin } from 'lucide-react';

export const OutletSwitcher: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [activeOutlet, setActiveOutlet] = useState<OutletItem | null>(null);
  const [isGrowth, setIsGrowth] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshState = () => {
    const growth = isGrowthTierActive();
    setIsGrowth(growth);
    const list = getStoredOutlets();
    setOutlets(list);
    const current = getActiveOutlet();
    setActiveOutlet(current);
  };

  useEffect(() => {
    refreshState();

    const handleStorageChange = () => refreshState();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('replate_outlets_updated', handleStorageChange);
    window.addEventListener('replate_outlet_changed', handleStorageChange);
    window.addEventListener('replate_subscription_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('replate_outlets_updated', handleStorageChange);
      window.removeEventListener('replate_outlet_changed', handleStorageChange);
      window.removeEventListener('replate_subscription_updated', handleStorageChange);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOutlet = (outlet: OutletItem) => {
    setActiveOutletId(outlet.id);
    setActiveOutlet(outlet);
    setIsOpen(false);
  };

  // If NOT Growth tier: Show Lock / Upgrade prompt pill
  if (!isGrowth) {
    return (
      <button
        type="button"
        onClick={() => router.push('/dashboard/outlets')}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 transition-all cursor-pointer shadow-2xs group"
        title="Fitur Multi-Outlet Eksklusif untuk Tier Replate Growth"
      >
        <div className="w-5 h-5 rounded-lg bg-amber-200/80 flex items-center justify-center shrink-0">
          <Store className="w-3.5 h-3.5 text-amber-800" />
        </div>
        <div className="text-left">
          <div className="text-[11px] font-black text-amber-950 flex items-center gap-1">
            <span>Cabang Utama</span>
            <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black tracking-wide">
              GROWTH
            </span>
          </div>
          <span className="text-[9.5px] text-amber-700 font-medium block">
            Upgrade Multi-Outlet
          </span>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-[#D4A843] group-hover:scale-110 transition-transform ml-0.5" />
      </button>
    );
  }

  // If Growth Tier: Full Active Branch Switcher
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#1B3A5C] bg-slate-50 hover:bg-white text-slate-800 transition-all cursor-pointer shadow-2xs group max-w-[210px] sm:max-w-[260px]"
        title="Ganti Cabang Outlet Aktif"
      >
        <div className="w-7 h-7 rounded-lg bg-[#1B3A5C] text-[#D4A843] flex items-center justify-center shrink-0">
          <Store className="w-4 h-4" />
        </div>
        <div className="text-left min-w-0 flex-1">
          <span className="text-[9px] uppercase font-black tracking-wider text-slate-600 block leading-tight">
            Outlet Aktif:
          </span>
          <span className="text-xs font-black text-[#1B3A5C] truncate block leading-tight">
            {activeOutlet?.name || 'Pilih Cabang'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
              Daftar Cabang Toko ({outlets.length})
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Replate Growth
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50">
            {outlets.map((outlet) => {
              const isSelected = outlet.id === activeOutlet?.id;
              return (
                <button
                  key={outlet.id}
                  type="button"
                  onClick={() => handleSelectOutlet(outlet)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-50/70 text-[#1B3A5C]' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isSelected
                        ? 'bg-[#1B3A5C] text-[#D4A843]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black truncate block">
                        {outlet.name}
                      </span>
                      {outlet.isMain && (
                        <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#1B3A5C] shrink-0">
                          Pusat
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 truncate flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                      <span>{outlet.address}</span>
                    </p>
                    <p className="text-[9.5px] text-slate-600 font-mono mt-0.5">
                      PIC: {outlet.contactName} ({outlet.contactPhone})
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#D4A843] shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/dashboard/outlets');
              }}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-[#1B3A5C] hover:text-[#D4A843] text-slate-700 font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kelola & Tambah Cabang (/dashboard/outlets)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

