'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
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
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedThreadId, setSelectedThreadId] = useState(1);
  const [typedReply, setTypedReply] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatThreads, setChatThreads] = useState<ChatThread[]>([
    {
      id: 1,
      name: "Panti Asuhan Harapan",
      avatar: "🏠",
      lastMessage: "Halo, saya ingin mengambil donasinya besok pagi...",
      time: "10 menit lalu",
      unread: true,
      messages: [
        { sender: 'other', text: 'Halo Catering ABC, terima kasih atas donasi Nasi Box-nya.', time: '16:00' },
        { sender: 'me', text: 'Sama-sama, senang bisa berbagi. Kapan rencananya mau diambil?', time: '16:05' },
        { sender: 'other', text: 'Halo, saya ingin mengambil donasinya besok pagi sekitar jam 09:00 ya kak.', time: '16:10' }
      ]
    },
    {
      id: 2,
      name: "Bakery House",
      avatar: "🍞",
      lastMessage: "Roti croissant-nya masih segar kak...",
      time: "1 jam lalu",
      unread: false,
      messages: [
        { sender: 'other', text: 'Halo, apakah tertarik menyelamatkan roti croissant sisa hari ini?', time: '15:00' },
        { sender: 'me', text: 'Halo! Wah boleh, sisa berapa porsi ya?', time: '15:10' },
        { sender: 'other', text: 'Roti croissant-nya masih segar kak, sisa sekitar 15 porsi.', time: '15:12' }
      ]
    },
    {
      id: 3,
      name: "Tani Segar",
      avatar: "🥬",
      lastMessage: "Sama-sama kak, senang bisa membantu.",
      time: "Kemarin",
      unread: false,
      messages: [
        { sender: 'me', text: 'Terima kasih atas kiriman sayurnya kemarin ya.', time: 'Kemarin' },
        { sender: 'other', text: 'Sama-sama kak, senang bisa membantu.', time: 'Kemarin' }
      ]
    }
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThreadId, chatThreads]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <p className="text-slate-500 font-bold animate-pulse">Memuat Chat...</p>
      </div>
    );
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedReply.trim()) return;

    const updatedThreads = chatThreads.map(thread => {
      if (thread.id === selectedThreadId) {
        const newMsg: Message = {
          sender: 'me',
          text: typedReply,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        };
        return {
          ...thread,
          lastMessage: typedReply,
          time: "Baru saja",
          unread: false,
          messages: [...thread.messages, newMsg]
        };
      }
      return thread;
    });

    setChatThreads(updatedThreads);
    setTypedReply('');

    setTimeout(() => {
      setChatThreads(prevThreads => prevThreads.map(thread => {
        if (thread.id === selectedThreadId) {
          const autoReply: Message = {
            sender: 'other',
            text: 'Baik kak, terima kasih informasinya. Nanti akan kami kabari lagi perkembangannya ya. 👍',
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          };
          return {
            ...thread,
            lastMessage: autoReply.text,
            time: "Baru saja",
            messages: [...thread.messages, autoReply]
          };
        }
        return thread;
      }));
    }, 1500);
  };

  const selectedThread = chatThreads.find(t => t.id === selectedThreadId) || chatThreads[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar user={session?.user} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col">
        <div className="mb-6">
          <p className="text-slate-500 text-sm">Hubungi penjual dan lembaga penerima manfaat di sekitar Anda.</p>
        </div>

        <div className="flex-1 flex bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[520px] max-h-[70vh] mb-8">
          {/* Chat Sidebar Threads */}
          <div className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto flex-shrink-0">
            {chatThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => {
                  setSelectedThreadId(thread.id);
                  setChatThreads(chatThreads.map(t => t.id === thread.id ? { ...t, unread: false } : t));
                }}
                className={`p-4 border-b border-slate-100 cursor-pointer flex items-center gap-3 transition-colors ${
                  selectedThreadId === thread.id ? 'bg-[#F0F4F8] border-l-4 border-l-[#1B3A5C]' : 'hover:bg-white border-l-4 border-l-transparent'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs shrink-0">
                  {thread.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <b className="text-sm font-extrabold text-[#1B3A5C] truncate">{thread.name}</b>
                    <small className="text-[10px] font-semibold text-slate-400 shrink-0">{thread.time}</small>
                  </div>
                  <p className={`text-xs truncate ${thread.unread ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                    {thread.lastMessage}
                  </p>
                </div>
                {thread.unread && (
                  <span className="w-2 h-2 rounded-full bg-[#D4A843] shrink-0"></span>
                )}
              </div>
            ))}
          </div>

          {/* Chat Conversation pane */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 shadow-xs relative z-10">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                {selectedThread.avatar}
              </div>
              <div>
                <b className="text-[#1B3A5C] font-extrabold block">{selectedThread.name}</b>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#FAFAFA]">
              {selectedThread.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[75%] ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}
                >
                  <div
                    className={`px-4 py-2.5 text-sm shadow-sm ${
                      msg.sender === 'me'
                        ? 'bg-[#1B3A5C] text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <small className={`text-[10px] text-slate-400 mt-1 font-medium ${msg.sender === 'me' ? 'text-right pr-1' : 'pl-1'}`}>
                    {msg.time}
                  </small>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-white flex gap-3">
              <input
                type="text"
                placeholder="Ketik pesan Anda..."
                value={typedReply}
                onChange={(e) => setTypedReply(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1B3A5C] focus:ring-1 focus:ring-[#1B3A5C] transition-all"
              />
              <Button type="submit" className="bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white px-6 rounded-xl font-bold shadow-md">
                Kirim
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
