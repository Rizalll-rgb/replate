'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  orderCode?: string;
}

export default function ChatPage() {
  const { data: session } = useSession();

  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      id: 'c1',
      name: 'Warung Bakso Pak Kumis',
      role: 'Food Provider',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
      lastMessage: 'Halo Kak, pesanan Bakso Sapi Komplit siap diambil di kasir ya!',
      lastTime: '19:15',
      unread: 1,
      orderCode: 'FB-SALE-99102',
    },
    {
      id: 'c2',
      name: 'Budi Santoso (Kurir Relawan #RC-881)',
      role: 'Rescue Volunteer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
      lastMessage: 'Saya sudah di depan outlet membawa box pendingin.',
      lastTime: '18:45',
      unread: 0,
      orderCode: 'FB-DON-88192',
    },
    {
      id: 'c3',
      name: 'Panti Asuhan Kasih Ibu (Ibu Ratna)',
      role: 'Food Beneficiary',
      avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&auto=format&fit=crop&q=60',
      lastMessage: 'Terima kasih banyak atas donasi makanan malamnya ',
      lastTime: 'Kemarin',
      unread: 0,
      orderCode: 'FB-DON-77182',
    },
  ]);

  const [selectedContactId, setSelectedContactId] = useState<string>('c1');
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    c1: [
      { id: 'm1', sender: 'other', text: 'Halo Kak, terima kasih sudah memesan Rescue Sale!', time: '19:10' },
      { id: 'm2', sender: 'me', text: 'Malam Pak, apakah pesanan saya sudah bisa diambil sekarang?', time: '19:12' },
      { id: 'm3', sender: 'other', text: 'Halo Kak, pesanan Bakso Sapi Komplit siap diambil di kasir ya!', time: '19:15' },
    ],
    c2: [
      { id: 'm1', sender: 'other', text: 'Halo, saya kurir relawan yang ditugaskan mengambil donasi.', time: '18:30' },
      { id: 'm2', sender: 'other', text: 'Saya sudah di depan outlet membawa box pendingin.', time: '18:45' },
    ],
    c3: [
      { id: 'm1', sender: 'other', text: 'Terima kasih banyak atas donasi makanan malamnya ', time: 'Kemarin' },
    ],
  });

  const [inputText, setInputText] = useState('');

  const activeContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const activeMessages = messages[selectedContactId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMsg],
    }));

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, lastMessage: inputText.trim(), lastTime: 'Baru saja' }
          : c
      )
    );

    setInputText('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col md:flex-row min-h-[580px]">
          {/* Left Sidebar: Contact List */}
          <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
                PESAN & CHAT OPERASIONAL
              </span>
              <h2 className="text-base font-black text-[#1B3A5C]">Percakapan Transaksi</h2>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                    selectedContactId === contact.id ? 'bg-white border-l-4 border-[#1B3A5C]' : 'hover:bg-slate-100'
                  }`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-extrabold text-xs text-[#1B3A5C] truncate">{contact.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{contact.lastTime}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block">{contact.role}</span>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{contact.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Main: Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B3A5C]">{activeContact.name}</h3>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ● Online • {activeContact.role}
                  </span>
                </div>
              </div>

              {activeContact.orderCode && (
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">
                  Resi: {activeContact.orderCode}
                </span>
              )}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
              {activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-2xl text-xs font-medium ${
                      msg.sender === 'me'
                        ? 'bg-[#1B3A5C] text-white rounded-br-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik pesan konfirmasi atau koordinasi penjemputan..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1B3A5C]"
              />
              <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950 text-xs px-4">
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
