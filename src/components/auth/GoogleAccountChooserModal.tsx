'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string }) => void;
}

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectingEmail, setSelectingEmail] = useState<string | null>(null);

  const presetAccounts = [
    {
      name: 'Rizal Akbar Kurniawan',
      email: 'rizal.23188@mhs.unesa.ac.id',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      tag: 'Akun Mahasiswa UNESA',
    },
    {
      name: 'Rizal Akbar Kurniawan',
      email: 'rizalakbarkurniawannn@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      tag: 'Akun Utama Google',
    },
    {
      name: 'Rizal Akbar Kurniawan',
      email: 'narutohinata746@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      tag: 'Akun Sekunder Google',
    },
    {
      name: 'Juri Penilai Infinitera 2.0',
      email: 'juri.infinitera.2026@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      tag: 'HM TIF UNISSULA Judge',
    },
  ];

  const handleChoose = (account: { name: string; email: string }) => {
    setSelectingEmail(account.email);
    setTimeout(() => {
      setSelectingEmail(null);
      onSelectAccount(account);
    }, 500);
  };

  const handleAddCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName || customEmail.split('@')[0];
    handleChoose({ name, email: customEmail });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="p-2 space-y-4 font-sans text-slate-800">
        {/* Google Branding Header */}
        <div className="text-center space-y-1.5 pb-3 border-b border-slate-200">
          <div className="flex justify-center mb-1">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900">Pilih Akun Google</h2>
          <p className="text-xs text-slate-500 font-medium">
            Lanjutkan ke <span className="font-extrabold text-[#1B3A5C]">Replate Surabaya</span>
          </p>
        </div>

        {!isAddingNew ? (
          <div className="space-y-2">
            {/* Account list */}
            {presetAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleChoose(acc)}
                disabled={!!selectingEmail}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-xs">
                    {acc.name.charAt(0)}
                  </div>
                  <div>
                    <span className="block text-xs font-black text-slate-900 group-hover:text-blue-700">
                      {acc.name}
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono">
                      {acc.email}
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                      {acc.tag}
                    </span>
                  </div>
                </div>

                {selectingEmail === acc.email ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <span className="text-slate-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    ➔
                  </span>
                )}
              </button>
            ))}

            {/* Add Custom Account Option */}
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-base shrink-0 border border-slate-200">
                👤+
              </div>
              <span>Gunakan Akun Google Lain...</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddCustomSubmit} className="space-y-3 p-1">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 block">
                Alamat Email Google:
              </label>
              <input
                type="email"
                required
                placeholder="nama@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 block">
                Nama Lengkap:
              </label>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Lanjutkan ➔
              </button>
            </div>
          </form>
        )}

        {/* Google Footnote */}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed border-t border-slate-100 pt-3">
          Untuk melanjutkan, Google akan membagikan nama, alamat email, dan foto profil Anda kepada Replate. Lihat <span className="underline cursor-pointer text-blue-600 font-bold">Kebijakan Privasi</span> dan <span className="underline cursor-pointer text-blue-600 font-bold">Persyaratan Layanan</span> Replate.
        </p>
      </div>
    </Modal>
  );
};
