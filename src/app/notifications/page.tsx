'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Nasi Box Ayam Anda Berhasil Di-claim",
    message: "Panti Asuhan Harapan telah mengajukan permintaan untuk 15 porsi Nasi Box Ayam Anda. Silakan bersiap untuk pengambilan.",
    time: "10 menit yang lalu",
    icon: "🍱",
    unread: true,
  },
  {
    id: 2,
    title: "Smart Matching Menemukan Partner",
    message: "Sistem Smart Matching mendeteksi 3 organisasi terdekat (jarak < 5km) yang membutuhkan donasi Roti Croissant Anda.",
    time: "1 jam yang lalu",
    icon: "🤝",
    unread: true,
  },
  {
    id: 3,
    title: "Donasi Sukses Diterima",
    message: "Yayasan Berbagi Kasih mengonfirmasi penerimaan 12 porsi Buah Potong. Terima kasih atas kontribusi Anda!",
    time: "1 hari yang lalu",
    icon: "✅",
    unread: false,
  },
  {
    id: 4,
    title: "Tips Food Rescue Baru",
    message: "Baca panduan terbaru kami mengenai cara penyimpanan sayuran agar tetap segar sebelum didonasikan.",
    time: "3 hari yang lalu",
    icon: "🌱",
    unread: false,
  }
];

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar user={session?.user} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1B3A5C]">Notifikasi</h1>
            <p className="text-slate-500 mt-2">Pantau aktivitas food rescue dan donasi Anda.</p>
          </div>
          {notifications.some(n => n.unread) && (
            <Button onClick={markAllAsRead} variant="outline" className="text-[#1B3A5C] border-[#1B3A5C] font-bold text-xs rounded-xl">
              Tandai semua dibaca
            </Button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className={`p-5 flex gap-4 transition-colors ${n.unread ? 'bg-[#F0F4F8]/50' : 'hover:bg-slate-50'}`}>
                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl shadow-xs ${n.unread ? 'bg-white border-2 border-[#1B3A5C]/20' : 'bg-slate-100'}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`text-sm sm:text-base font-extrabold truncate ${n.unread ? 'text-[#1B3A5C]' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-semibold whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${n.unread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                    {n.message}
                  </p>
                </div>
                {n.unread && (
                  <div className="flex items-center justify-center pl-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4A843] shadow-sm"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
