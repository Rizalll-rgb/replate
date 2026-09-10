'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Bell,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Clock,
  Check,
  ChevronRight,
  ExternalLink,
  MapPin,
  FileText,
  Award,
  X,
  HeartHandshake,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';

interface NotificationMetadata {
  label: string;
  value: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  detailedDescription: string;
  time: string;
  fullDate: string;
  category: 'CLAIM' | 'SYSTEM' | 'TIPS';
  unread: boolean;
  actionText: string;
  actionUrl: string;
  metadata: NotificationMetadata[];
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Pesanan Siap Diambil di Gerai Mitra',
    message: 'Klaim Surplus Roti & Pastry Anda di Dapur Cokelat telah disiapkan. Silakan tunjukkan Tiket QR kepada kasir sebelum pukul 21:00 WIB.',
    detailedDescription: 'Paket makanan surplus yang Anda klaim telah selesai dipacking rapi oleh staf mitra Dapur Cokelat sesuai standar kebersihan SOP BPOM. Silakan datang ke kasir gerai dengan menunjukkan Tiket QR digital pada aplikasi Replate untuk proses verifikasi kilat tanpa antre.',
    time: '10 menit yang lalu',
    fullDate: '10 September 2026, 20:40 WIB',
    category: 'CLAIM',
    unread: true,
    actionText: 'Buka Tiket QR Klaim',
    actionUrl: '/dashboard/consumer/my-claims',
    metadata: [
      { label: 'Gerai Mitra', value: 'Dapur Cokelat Darmo' },
      { label: 'Kode Tiket', value: 'TKT-REPLATE-8821' },
      { label: 'Batas Penjemputan', value: 'Hari ini s/d 21:00 WIB' },
      { label: 'Status Penyiapan', value: 'Siap di Meja Kasir' },
    ],
  },
  {
    id: 2,
    title: 'Smart Matching Menemukan Surplus Terdekat',
    message: 'Sistem mendeteksi 3 gerai mitra terdekat (radius < 2 km) yang baru saja merilis Rescue Sale Nasi Kotak & Bakery diskon 70%.',
    detailedDescription: 'Algoritma Smart Matching 2.0 menemukan ketersediaan makanan surplus siap konsumsi dari gerai mitra favorit di dekat radius lokasi penjemputan Anda. Ketersediaan sangat terbatas dan biasanya habis diselamatkan dalam waktu kurang dari 45 menit.',
    time: '1 jam yang lalu',
    fullDate: '10 September 2026, 19:50 WIB',
    category: 'SYSTEM',
    unread: true,
    actionText: 'Jelajahi Rescue Sale Terdekat',
    actionUrl: '/dashboard/explore?tab=RESCUE_SALE',
    metadata: [
      { label: 'Radius Deteksi', value: '< 2.0 km dari Lokasi Anda' },
      { label: 'Tingkat Diskon', value: '50% - 70% dari Harga Asli' },
      { label: 'Estimasi Penghematan', value: 'Mulai Rp 15.000 / Porsi' },
      { label: 'Status Stok', value: 'Tersedia Terbatas' },
    ],
  },
  {
    id: 3,
    title: 'Poin Pahlawan Pangan Ditambahkan (+40 EcoPoints)',
    message: 'Selamat! Penyelamatan makanan Anda berhasil mencegah 0.9 kg emisi gas rumah kaca. Total EcoPoints Anda kini bertambah.',
    detailedDescription: 'Terima kasih atas kontribusi nyata Anda dalam menekan limbah pangan (food waste) perkotaan. Setiap porsi yang berhasil diselamatkan terkonversi otomatis menjadi EcoPoints yang dapat ditukarkan dengan voucer diskon belanja, suvenir ramah lingkungan, atau tiket donasi.',
    time: 'Kemarin, 19:40 WIB',
    fullDate: '09 September 2026, 19:40 WIB',
    category: 'SYSTEM',
    unread: false,
    actionText: 'Cek Dompet EcoPoints',
    actionUrl: '/dashboard/consumer',
    metadata: [
      { label: 'Poin Diterima', value: '+40 EcoPoints' },
      { label: 'Dampak Karbon', value: '~0.9 kg CO2e Tercegah' },
      { label: 'Status Saldo', value: 'Terkreditasi Otomatis' },
      { label: 'Masa Berlaku Poin', value: 'Aktif Selamanya' },
    ],
  },
  {
    id: 4,
    title: 'Permintaan Donasi Pangan dari Panti Asuhan',
    message: 'Panti Asuhan Kasih Ibu membutuhkan 30 porsi makanan siap santap untuk makan malam adik-adik panti.',
    detailedDescription: 'Yayasan dan Panti Asuhan terverifikasi di wilayah Anda telah memperbarui kebutuhan logistik pangan hari ini. Mitra Food Provider atau donatur dapat langsung menyanggupi distribusi donasi Rp 0 ini melalui portal integrasi Replate.',
    time: 'Kemarin, 14:15 WIB',
    fullDate: '09 September 2026, 14:15 WIB',
    category: 'SYSTEM',
    unread: false,
    actionText: 'Lihat Kebutuhan Panti',
    actionUrl: '/dashboard/explore?tab=PANTI_NEEDS',
    metadata: [
      { label: 'Lembaga Penerima', value: 'Panti Asuhan Kasih Ibu' },
      { label: 'Porsi Dibutuhkan', value: '30 Porsi Siap Santap' },
      { label: 'Tingkat Urgensi', value: 'Mendesak (Hari Ini)' },
      { label: 'Metode Pengantaran', value: 'Relawan Food Bank / Ambil' },
    ],
  },
  {
    id: 5,
    title: 'Standar Keamanan Pangan BPOM Diperbarui',
    message: 'Seluruh mitra Food Provider telah menyelesaikan audit organoleptik berkala. Makanan surplus dipastikan 100% higienis dan berlabel aman.',
    detailedDescription: 'Replate menerapkan protokol keamanan pangan berstandar BPOM RI, mencakup verifikasi rantai dingin (cold chain), uji organoleptik sensori aroma dan tekstur, batas konsumsi maksimal 4 jam setelah masak, serta segel wadah tertutup higienis.',
    time: '3 hari yang lalu',
    fullDate: '07 September 2026, 10:00 WIB',
    category: 'TIPS',
    unread: false,
    actionText: 'Pelajari SOP Keamanan BPOM',
    actionUrl: '/dashboard/info',
    metadata: [
      { label: 'Dasar Standar', value: 'SOP Keamanan Pangan BPOM RI' },
      { label: 'Inspeksi Wadah', value: 'Food-Grade & Segel Tertutup' },
      { label: 'Batas Konsumsi', value: 'Maks. 4 Jam Pasca Pengolahan' },
      { label: 'Jaminan Rasa', value: '100% Lulus Uji Sensori Organoleptik' },
    ],
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CLAIM' | 'SYSTEM'>('ALL');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const openDetail = (item: NotificationItem) => {
    // Mark clicked item as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setSelectedNotification(item);
  };

  const handleActionRedirect = (url: string) => {
    setSelectedNotification(null);
    router.push(url);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.category === activeTab;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Mobile-first Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3.5 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-[#1B3A5C]">Notifikasi</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black leading-none">
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

        {/* Notifications List (Clickable with Full Action Affordance) */}
        <div className="space-y-2.5">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => openDetail(item)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 shadow-2xs cursor-pointer group hover:border-[#1B3A5C]/40 hover:shadow-sm ${
                item.unread
                  ? 'bg-white border-blue-300 ring-1 ring-blue-100'
                  : 'bg-white/85 border-slate-200'
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
              <div className="flex-1 min-w-0 space-y-1.5">
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

                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                  {item.message}
                </p>

                {/* Scenario Hint & Action Tag */}
                <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                  <span className="text-[#1B3A5C] flex items-center gap-1 group-hover:underline">
                    <span>Baca Detail & Tindakan</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#1B3A5C] group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#D4A843] shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Full Detail Modal with Scenario Redirection */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    selectedNotification.category === 'CLAIM'
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : selectedNotification.category === 'SYSTEM'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                      : 'bg-blue-50 border-blue-300 text-blue-600'
                  }`}
                >
                  {selectedNotification.category === 'CLAIM' ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : selectedNotification.category === 'SYSTEM' ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {selectedNotification.category === 'CLAIM'
                      ? 'Pemberitahuan Pesanan & Klaim'
                      : selectedNotification.category === 'SYSTEM'
                      ? 'Informasi Sistem & EcoPoints'
                      : 'Edukasi & SOP Keamanan Pangan'}
                  </span>
                  <h3 className="text-base font-black text-[#1B3A5C] leading-snug">
                    {selectedNotification.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timestamp Badge */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Diterima pada: <strong>{selectedNotification.fullDate}</strong></span>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Uraian Lengkap Informasi:
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 font-medium">
                {selectedNotification.detailedDescription}
              </p>
            </div>

            {/* Scenario Metadata Breakdown */}
            {selectedNotification.metadata && selectedNotification.metadata.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Rincian Parameter Skenario:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedNotification.metadata.map((meta, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-0.5 shadow-2xs"
                    >
                      <span className="text-[10px] text-slate-400 font-bold block">
                        {meta.label}
                      </span>
                      <strong className="text-xs font-black text-slate-800 block">
                        {meta.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleActionRedirect(selectedNotification.actionUrl)}
                className="flex-1 py-3 px-4 bg-[#1B3A5C] hover:bg-[#152e4a] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>{selectedNotification.actionText}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#D4A843]" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav user={session?.user} />
    </div>
  );
}
