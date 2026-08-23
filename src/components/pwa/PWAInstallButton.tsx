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

  if (isInstalled) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold text-xs rounded-xl ${className}`}>
        <span>✓ PWA Terinstall</span>
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
        <span className="text-sm leading-none">📱</span>
        <span>Install App (PWA)</span>
      </button>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="📱 Panduan Install Aplikasi Replate (PWA)"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1 shadow-md">
              <span className="font-black text-amber-400 text-xs block">
                Progressive Web App (PWA) Replate
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Nikmati akses cepat tanpa perlu download di Play Store/App Store. Replate dapat dipasang langsung di HP Android, iOS, maupun Laptop Windows/Mac Anda.
              </p>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-black text-[#1B3A5C] text-sm">Petunjuk Pemasangan Cepat:</h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4A843] text-slate-950 font-black flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <div>
                    <strong className="text-slate-900 font-extrabold block">Android / Chrome Desktop:</strong>
                    <p className="text-slate-600 font-medium">Klik ikon 3 titik di kanan atas browser, lalu pilih <strong>"Install Replate App"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1B3A5C] text-white font-black flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <div>
                    <strong className="text-slate-900 font-extrabold block">iPhone / iOS (Safari):</strong>
                    <p className="text-slate-600 font-medium">Klik tombol <strong>Share (Bagikan)</strong> di bagian bawah Safari, lalu gulir ke bawah dan pilih <strong>"Add to Home Screen (Tambahkan ke Layar Utama)"</strong>.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button variant="gold" size="sm" className="font-extrabold" onClick={() => setShowModal(false)}>
                Saya Mengerti ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
