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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs rounded-xl ${className}`}>
        <span>✓ PWA App Terinstall</span>
      </span>
    );
  }

  return (
    <>
      <Button
        variant="gold"
        size="sm"
        onClick={handleInstallClick}
        className={`font-black text-xs shadow-md flex items-center gap-1.5 ${className}`}
      >
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-4H8l4-4 4 4h-3v4z" />
        </svg>
        <span>📱 Install App PWA</span>
      </Button>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="📱 Panduan Install Aplikasi Replate (PWA)"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1">
              <span className="font-extrabold text-amber-400 text-xs block">
                Progressive Web App (PWA) Replate
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Nikmati akses cepat tanpa perlu download di Play Store/App Store. Replate dapat dipasang langsung di HP Android, iOS, maupun Laptop Windows/Mac Anda.
              </p>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-[#1B3A5C] text-sm">Petunjuk Pemasangan Cepat:</h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D4A843] text-slate-950 font-black flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 font-bold block">Android / Chrome Desktop:</strong>
                    <p className="text-slate-600">Klik ikon 3 titik di kanan atas browser, lalu pilih <strong>"Install Replate App"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1B3A5C] text-white font-black flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 font-bold block">iPhone / iOS (Safari):</strong>
                    <p className="text-slate-600">Klik tombol <strong>Share (Bagikan)</strong> di bagian bawah Safari, lalu gulir ke bawah dan pilih <strong>"Add to Home Screen (Tambahkan ke Layar Utama)"</strong>.</p>
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
