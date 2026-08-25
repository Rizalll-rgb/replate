'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

interface Message {
  sender: 'me' | 'other';
  text: string;
  time: string;
}

interface ChatThread {
  id: number;
  name: string;
  roleType: string;
  avatar: string;
  resiCode?: string;
  foodTitle?: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryResi = searchParams.get('resi');

  const [selectedThreadId, setSelectedThreadId] = useState(1);
  const [typedReply, setTypedReply] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatThreads, setChatThreads] = useState<ChatThread[]>([
    {
      id: 1,
      name: 'Warung Bakso Pak Kumis (Outlet)',
      roleType: 'FOOD_PROVIDER',
      avatar: '🏪',
      resiCode: 'CLM-CNS-2026-9812',
      foodTitle: 'Nasi Paket Ayam Bakar Specialty (2 Porsi)',
      lastMessage: 'Halo kak, makanan sudah disiapkan steril & siap diambil.',
      time: '10 menit lalu',
      unread: true,
      messages: [
        {
          sender: 'other',
          text: 'Halo kak! Pesanan resi CLM-CNS-2026-9812 sudah kami konfirmasi ya.',
          time: '19:10',
        },
        {
          sender: 'me',
          text: 'Halo Pak, terima kasih! Saya perkiraan sampai di outlet sekitar jam 19:30 WIB ya.',
          time: '19:12',
        },
        {
          sender: 'other',
          text: 'Halo kak, makanan sudah disiapkan steril & siap diambil di meja kasir ya. 👍',
          time: '19:15',
        },
      ],
    },
    {
      id: 2,
      name: 'Panti Asuhan Kasih Ibu Surabaya',
      roleType: 'YAYASAN',
      avatar: '🏠',
      resiCode: 'CLM-YYS-2026-4410',
      foodTitle: 'Roti Gandum & Donasi Makanan Siap Santap',
      lastMessage: 'Terima kasih banyak atas alokasi donasinya...',
      time: '1 jam lalu',
      unread: false,
      messages: [
        {
          sender: 'other',
          text: 'Assalamualaikum Warahmatullah, terima kasih atas bantuan pangan untuk anak asuh kami.',
          time: '17:00',
        },
        {
          sender: 'me',
          text: 'Waalaikumsalam Ibu, sama-sama. Semoga berkah dan bermanfaat ya Bu.',
          time: '17:05',
        },
      ],
    },
    {
      id: 3,
      name: 'Mas Doni (Driver Relawan Komunitas)',
      roleType: 'RESCUE_VOLUNTEER',
      avatar: '🛵',
      resiCode: 'TRK-VOL-2026-1192',
      foodTitle: 'Rute Pengantaran Posko Gubeng ➔ Panti Wonokromo',
      lastMessage: 'Posisi saya sudah di jalan membawa box cooler steril.',
      time: 'Kemarin',
      unread: false,
      messages: [
        {
          sender: 'other',
          text: 'Siang kak, saya kurir relawan Replate yang ditugaskan mengambil makanan.',
          time: '14:00',
        },
        {
          sender: 'me',
          text: 'Siap Mas Doni, barang sudah dipacking rapi di outlet.',
          time: '14:02',
        },
        {
          sender: 'other',
          text: 'Posisi saya sudah di jalan membawa box cooler steril. Estimasi sampai 10 menit.',
          time: '14:10',
        },
      ],
    },
  ]);

  useEffect(() => {
    if (queryResi) {
      const existing = chatThreads.find((t) => t.resiCode === queryResi);
      if (existing) {
        setSelectedThreadId(existing.id);
      }
    }
  }, [queryResi]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThreadId, chatThreads]);

  const handleSendReply = (textToSend?: string) => {
    const text = textToSend || typedReply;
    if (!text.trim()) return;

    const updatedThreads = chatThreads.map((thread) => {
      if (thread.id === selectedThreadId) {
        const newMsg: Message = {
          sender: 'me',
          text,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        return {
          ...thread,
          lastMessage: text,
          time: 'Baru saja',
          unread: false,
          messages: [...thread.messages, newMsg],
        };
      }
      return thread;
    });

    setChatThreads(updatedThreads);
    setTypedReply('');

    // Simulated Real-Time Automated Response
    setTimeout(() => {
      setChatThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === selectedThreadId) {
            const autoMsg: Message = {
              sender: 'other',
              text: 'Baik kak, pesan Anda telah kami terima. Kami pastikan proses penjemputan berjalan lancar sesuai SOP BPOM! 👍',
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            };
            return {
              ...thread,
              lastMessage: autoMsg.text,
              time: 'Baru saja',
              messages: [...thread.messages, autoMsg],
            };
          }
          return thread;
        })
      );
    }, 1200);
  };

  const selectedThread = chatThreads.find((t) => t.id === selectedThreadId) || chatThreads[0];

  const quickReplies = [
    '🛵 "Driver sedang dalam perjalanan menuju outlet"',
    '📦 "Makanan sudah siap diambil di meja kasir"',
    '📍 "Posisi saya sudah sampai di lokasi"',
    '🙏 "Terima kasih banyak atas kerjasamanya!"',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans pb-24 md:pb-0">
      <Navbar user={session?.user} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="mb-6">
          <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
            Komunikasi & Koordinasi Terpadu Replate
          </span>
          <h1 className="text-3xl font-black text-[#1B3A5C] tracking-tight">Pusat Pesan & Chat Transaksi</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Koordinasi penjemputan dan pengantaran makanan surplus dengan Provider, Panti, & Relawan.
          </p>
        </div>

        <div className="flex-1 flex flex-col md:flex-row bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden min-h-[560px] max-h-[75vh]">
          {/* Left Chat Threads Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto shrink-0 divide-y divide-slate-100">
            {chatThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => {
                  setSelectedThreadId(thread.id);
                  setChatThreads(chatThreads.map((t) => (t.id === thread.id ? { ...t, unread: false } : t)));
                }}
                className={`p-4 cursor-pointer flex items-center gap-3 transition-colors ${
                  selectedThreadId === thread.id
                    ? 'bg-[#1B3A5C] text-white'
                    : 'hover:bg-white text-slate-800'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                  selectedThreadId === thread.id ? 'bg-white/20 text-white' : 'bg-white border border-slate-200'
                }`}>
                  {thread.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`text-xs font-extrabold truncate ${selectedThreadId === thread.id ? 'text-white' : 'text-[#1B3A5C]'}`}>
                      {thread.name}
                    </h4>
                    <span className={`text-[10px] shrink-0 font-medium ${selectedThreadId === thread.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      {thread.time}
                    </span>
                  </div>

                  {thread.resiCode && (
                    <span className={`text-[9px] font-mono font-bold block ${selectedThreadId === thread.id ? 'text-amber-300' : 'text-[#D4A843]'}`}>
                      📌 {thread.resiCode}
                    </span>
                  )}

                  <p className={`text-[11px] truncate mt-0.5 ${
                    selectedThreadId === thread.id
                      ? 'text-slate-200'
                      : thread.unread
                      ? 'font-black text-slate-900'
                      : 'text-slate-500'
                  }`}>
                    {thread.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Chat Conversation View */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {/* Header with Transaction Resi Context */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                  {selectedThread.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1B3A5C]">{selectedThread.name}</h3>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online & Terverifikasi
                  </span>
                </div>
              </div>

              {selectedThread.resiCode && (
                <div className="bg-[#1B3A5C] text-white px-3.5 py-2 rounded-xl border border-[#2C5A8F] text-right space-y-0.5 shrink-0">
                  <span className="text-[9px] font-black text-[#D4A843] uppercase tracking-wider block">
                    TRANSAKSI TERKAIT:
                  </span>
                  <span className="font-mono text-xs font-black text-white block">
                    {selectedThread.resiCode}
                  </span>
                  <span className="text-[9px] text-slate-300 block truncate max-w-xs">
                    {selectedThread.foodTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3.5 bg-[#F9FAFB]">
              {selectedThread.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}
                >
                  <div
                    className={`px-4 py-3 text-xs shadow-xs leading-relaxed ${
                      msg.sender === 'me'
                        ? 'bg-[#1B3A5C] text-white rounded-2xl rounded-tr-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs font-medium'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className={`text-[10px] text-slate-400 mt-1 font-mono ${msg.sender === 'me' ? 'text-right pr-1' : 'pl-1'}`}>
                    {msg.time}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Template Chips */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Balas Cepat:
              </span>
              {quickReplies.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendReply(q.replace(/"/g, ''))}
                  className="px-3 py-1 bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all shadow-xs cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendReply();
              }}
              className="p-4 border-t border-slate-200 bg-white flex gap-3"
            >
              <input
                type="text"
                placeholder="Ketik pesan atau update status penjemputan..."
                value={typedReply}
                onChange={(e) => setTypedReply(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-[#1B3A5C] focus:bg-white transition-all shadow-xs"
              />
              <Button type="submit" variant="gold" size="md" className="font-black text-xs text-slate-950 px-6 shadow-md cursor-pointer">
                <span>Kirim ➔</span>
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav user={session?.user} />
    </div>
  );
}
