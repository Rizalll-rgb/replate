'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  category: 'CLAIM' | 'SYSTEM' | 'TIPS';
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Pesanan Siap Diambil di Gerai Mitra',
    message: 'Klaim Surplus Roti & Pastry Anda di Dapur Cokelat telah disiapkan. Silakan tunjukkan Tiket QR kepada kasir sebelum pukul 21:00 WIB.',
    time: '10 menit yang lalu',
    category: 'CLAIM',
    unread: true,
  },
  {
    id: 2,
    title: 'Smart Matching Menemukan Surplus Terdekat',
    message: 'Sistem mendeteksi 3 gerai mitra terdekat (radius < 2 km) yang baru saja merilis Rescue Sale Nasi Kotak & Bakery diskon 70%.',
    time: '1 jam yang lalu',
    category: 'SYSTEM',
    unread: true,
  },
  {
    id: 3,
    title: 'Poin Pahlawan Pangan Ditambahkan (+40 EcoPoints)',
    message: 'Selamat! Penyelamatan makanan Anda berhasil mencegah 0.9 kg emisi gas rumah kaca. Total EcoPoints Anda kini bertambah.',
    time: 'Kemarin, 19:40 WIB',
    category: 'SYSTEM',
    unread: false,
  },
  {
    id: 4,
    title: 'Standar Keamanan Pangan BPOM Diperbarui',
    message: 'Seluruh mitra Food Provider telah menyelesaikan audit organoleptik berkala. Makanan surplus dipastikan 100% higienis dan berlabel aman.',
    time: '3 hari yang lalu',
    category: 'TIPS',
    unread: false,
  },
];

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CLAIM' | 'SYSTEM'>('ALL');

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.category === activeTab;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Mobile-first Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3.5 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/consumer">
              <button
                type="button"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-[#1B3A5C]">Notifikasi</h1>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black leading-none">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block">
                Aktivitas Food Rescue & EcoPoints Anda
              </span>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-bold text-[#1B3A5C] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tandai Dibaca</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-3.5">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border shrink-0 ${
              activeTab === 'ALL'
                ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua Notifikasi ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CLAIM')}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border shrink-0 ${
              activeTab === 'CLAIM'
                ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Pesanan & Klaim
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border shrink-0 ${
              activeTab === 'SYSTEM'
                ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Sistem & EcoPoints
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 shadow-2xs ${
                item.unread
                  ? 'bg-white border-blue-300 ring-1 ring-blue-100'
                  : 'bg-white/80 border-slate-200'
              }`}
            >
              {/* Category Icon */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  item.category === 'CLAIM'
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : item.category === 'SYSTEM'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                    : 'bg-blue-50 border-blue-300 text-blue-600'
                }`}
              >
                {item.category === 'CLAIM' ? (
                  <ShoppingBag className="w-5 h-5" />
                ) : item.category === 'SYSTEM' ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs sm:text-sm font-black truncate ${
                      item.unread ? 'text-[#1B3A5C]' : 'text-slate-700'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>{item.time}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.message}
                </p>
              </div>

              {item.unread && (
                <span className="w-2 h-2 rounded-full bg-[#D4A843] shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      </main>

      <BottomNav user={session?.user} />
    </div>
  );
}
