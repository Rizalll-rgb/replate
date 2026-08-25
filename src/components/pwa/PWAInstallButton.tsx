'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  const handleDirectInstallTrigger = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowModal(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('Aplikasi Replate Siap Dipasang! Jika dialog tidak muncul otomatis, ikuti petunjuk mudah di bawah ini.');
    }
  };

  if (isInstalled) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold text-xs rounded-xl ${className}`}>
        <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <span>Aplikasi Terpasang</span>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`px-3.5 py-2 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-amber-400/40 ${className}`}
      >
        <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Dapatkan Aplikasi</span>
      </button>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Pemasangan Aplikasi Replate (PWA)"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            {/* Header Banner */}
            <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1 shadow-md">
              <span className="font-black text-amber-400 text-xs block">
                Progressive Web App (PWA) Replate
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Nikmati akses instan tanpa perlu unduh di Play Store atau App Store. Replate dapat dipasang langsung di HP Android, iOS, maupun Laptop Windows dan Mac Anda.
              </p>
            </div>

            {/* Direct Action Download Button Box */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
              <div className="space-y-0.5">
                <strong className="font-extrabold text-emerald-950 text-xs block">
                  Tombol Pasang Aplikasi:
                </strong>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Klik untuk memasang aplikasi Replate langsung ke layar perangkat Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDirectInstallTrigger}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Unduh & Pasang Sekarang ➔</span>
              </button>
            </div>

            {/* Installation Steps */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-black text-[#1B3A5C] text-sm">Petunjuk Manual Alternatif:</h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4A843] text-slate-950 font-black flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <div>
                    <strong className="text-slate-900 font-extrabold block">Android / Chrome Desktop:</strong>
                    <p className="text-slate-600 font-medium">Klik ikon 3 titik di kanan atas browser, lalu pilih <strong>&quot;Install Replate App&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1B3A5C] text-white font-black flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <div>
                    <strong className="text-slate-900 font-extrabold block">iPhone / iOS (Safari):</strong>
                    <p className="text-slate-600 font-medium">Klik tombol <strong>Share (Bagikan)</strong> di bagian bawah Safari, lalu gulir ke bawah dan pilih <strong>&quot;Add to Home Screen (Tambahkan ke Layar Utama)&quot;</strong>.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button variant="gold" size="sm" className="font-extrabold text-slate-950" onClick={() => setShowModal(false)}>
                Tutup ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
