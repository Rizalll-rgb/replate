import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F1923] text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <Logo variant="light" size="md" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform redistribusi makanan berlebih cerdas untuk menghubungkan Food Provider dengan penerima manfaat secara aman, cepat, dan transparan di Surabaya & sekitarnya.
            </p>
          </div>

          {/* Quick Links (Aligned 100% with Navbar) */}
          <div>
            <h4 className="text-white text-xs font-extrabold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Tautan Cepat
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-[#D4A843] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-[#D4A843] transition-colors">
                  Eksplor Pangan
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D4A843] transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/info" className="hover:text-[#D4A843] transition-colors">
                  Pusat Informasi & Regulasi
                </Link>
              </li>
              <li>
                <Link href="/track-status" className="hover:text-[#D4A843] transition-colors font-extrabold text-[#D4A843]">
                  Cek Status Audit Pendaftaran
                </Link>
              </li>
            </ul>
          </div>

          {/* SDG Alignment */}
          <div>
            <h4 className="text-white text-xs font-extrabold uppercase tracking-wider mb-4 border-slate-800 pb-2 border-b">
              Komitmen 5 Pilar SDG
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>SDG 2: Tanpa Kelaparan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>SDG 9: Industri & Inovasi</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>SDG 11: Kota Berkelanjutan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
                <span>SDG 12: Konsumsi Bertanggung Jawab</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>SDG 13: Aksi Perubahan Iklim</span>
              </li>
            </ul>
          </div>

          {/* Infinitera 2.0 info */}
          <div>
            <h4 className="text-white text-xs font-extrabold uppercase tracking-wider mb-4 border-slate-800 pb-2 border-b">
              Infinitera 2.0
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Dikembangkan khusus oleh Tim Threeplate untuk kompetisi Infinitera 2.0 Web Development 2026.
            </p>
            <div className="bg-[#142C47] p-3 rounded-xl border border-slate-700 text-[11px]">
              <span className="text-[#D4A843] font-bold">Food Rescue ID:</span>
              <p className="text-slate-300 mt-0.5">Sistem transparansi distribusi pangan zero-waste.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 Replate. Hak Cipta Dilindungi.</p>
          <p className="mt-2 md:mt-0">Surabaya, Jawa Timur, Indonesia</p>
        </div>
      </div>
    </footer>
  );
};
