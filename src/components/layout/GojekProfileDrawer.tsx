'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  MapPin,
  Ticket,
  Clock,
  ShoppingBag,
  Award,
  Coins,
  ShieldCheck,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  X,
  Sparkles,
  Phone,
  Mail,
  Building2,
  Truck,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface GojekProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  overrideUser?: any;
}

export const GojekProfileDrawer: React.FC<GojekProfileDrawerProps> = ({
  isOpen,
  onClose,
  overrideUser,
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  const [profileData, setProfileData] = useState<any>(null);
  const [ecoPoints, setEcoPoints] = useState<number>(140);
  const [activeClaimsCount, setActiveClaimsCount] = useState<number>(1);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) setProfileData(JSON.parse(p));

      const ep = localStorage.getItem('replate_ecopoints');
      if (ep) setEcoPoints(parseInt(ep, 10));

      const claimsRaw = localStorage.getItem('replate_consumer_claims');
      if (claimsRaw) {
        const parsed = JSON.parse(claimsRaw);
        setActiveClaimsCount(
          parsed.filter((c: any) => c.status === 'READY_FOR_PICKUP' || c.status === 'PENDING').length
        );
      }

      const cartRaw = localStorage.getItem('replate_tas_klaim') || localStorage.getItem('replate_cart') || '[]';
      const parsedCart = JSON.parse(cartRaw);
      setCartCount(parsedCart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0));
    } catch (_) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const role =
    overrideUser?.role ||
    profileData?.role ||
    session?.user?.role ||
    'CONSUMER';

  const userName =
    overrideUser?.name ||
    profileData?.entityName ||
    profileData?.contactPerson ||
    profileData?.name ||
    session?.user?.name ||
    'Pengguna Replate';

  const userEmail =
    overrideUser?.email ||
    profileData?.email ||
    session?.user?.email ||
    'pengguna@replate.id';

  const userPhone =
    overrideUser?.phone ||
    profileData?.phone ||
    '0812-3456-7890';

  const userAddress =
    overrideUser?.address ||
    profileData?.address ||
    profileData?.city ||
    'Surabaya, Jawa Timur';

  const formatRoleBadge = (r: string) => {
    const upper = r.toUpperCase();
    if (upper.includes('CONSUMER')) {
      return { label: 'Food Consumer', badgeBg: 'bg-blue-100 text-blue-900 border-blue-300', icon: User };
    }
    if (upper.includes('PROVIDER')) {
      return { label: 'Food Provider', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300', icon: Building2 };
    }
    if (upper.includes('BENEFICIARY') || upper.includes('YAYASAN')) {
      return { label: 'Yayasan / Panti', badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: HeartHandshake };
    }
    if (upper.includes('RESCUE') || upper.includes('VOLUNTEER')) {
      return { label: 'Relawan Rescue', badgeBg: 'bg-purple-100 text-purple-900 border-purple-300', icon: Truck };
    }
    if (upper.includes('ADMIN')) {
      return { label: 'SuperAdmin', badgeBg: 'bg-red-100 text-red-900 border-red-300', icon: ShieldCheck };
    }
    return { label: 'Food Consumer', badgeBg: 'bg-blue-100 text-blue-900 border-blue-300', icon: User };
  };

  const roleInfo = formatRoleBadge(role);
  const RoleIcon = roleInfo.icon;

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleLogout = () => {
    onClose();
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        document.cookie = 'replate_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    } catch (_) {}
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Body (Gojek Mobile Profile Sheet) */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col z-10 overflow-hidden font-sans">
        {/* Top Handle bar (Mobile Drag Indicator) */}
        <div className="flex flex-col items-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1.2 rounded-full bg-slate-300 mb-2" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 pb-3.5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Akun &amp; Profil Pengguna
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 space-y-3.5 no-scrollbar">
          {/* User Profile Card (Ala Gojek) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1B3A5C] via-[#153450] to-[#0E2E25] text-white space-y-3 shadow-md border border-[#D4A843]/30">
            <div className="flex items-center gap-3">
              {/* Avatar Photo / Initials */}
              <div className="w-13 h-13 rounded-2xl bg-[#D4A843] text-slate-950 flex items-center justify-center font-black text-lg shadow-sm shrink-0 border-2 border-white/20">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-black text-white truncate max-w-[170px]">
                    {userName}
                  </h3>
                  <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[9px] font-black rounded-md flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Terverifikasi</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 truncate font-mono">
                  {userEmail}
                </p>

                <div className="pt-0.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black border ${roleInfo.badgeBg}`}>
                    <RoleIcon className="w-3 h-3" />
                    <span>{roleInfo.label}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Balance / EcoPoints Bar */}
            <div className="pt-2 border-t border-white/15 grid grid-cols-3 gap-2 text-center text-white">
              <div className="bg-black/20 rounded-xl p-2 border border-white/10">
                <span className="text-[9px] text-slate-300 font-medium block truncate">Saldo EcoPoints</span>
                <strong className="text-xs font-black text-amber-300 font-mono block">
                  {ecoPoints} Poin
                </strong>
              </div>
              <div className="bg-black/20 rounded-xl p-2 border border-white/10">
                <span className="text-[9px] text-slate-300 font-medium block truncate">Klaim Aktif</span>
                <strong className="text-xs font-black text-emerald-300 font-mono block">
                  {activeClaimsCount} Porsi
                </strong>
              </div>
              <div className="bg-black/20 rounded-xl p-2 border border-white/10">
                <span className="text-[9px] text-slate-300 font-medium block truncate">Di Tas Klaim</span>
                <strong className="text-xs font-black text-teal-300 font-mono block">
                  {cartCount} Item
                </strong>
              </div>
            </div>
          </div>

          {/* Group 1: Profilku & Lokasi */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            <div className="px-3.5 py-2 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Profil &amp; Lokasi
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('/dashboard/profile')}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1B3A5C] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#1B3A5C]" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Profil Saya</span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Lihat detail akun dan kontak penanggung jawab
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/dashboard/profile')}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    Zona Penjemputan
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[220px]">
                    {userAddress}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Group 2: Aktivitas & Transaksi */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            <div className="px-3.5 py-2 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Aktivitas Penyelamatan
            </div>

            <button
              type="button"
              onClick={() => handleNavigate(
                role.includes('PROVIDER')
                  ? '/dashboard/provider/claims'
                  : role.includes('RESCUE')
                  ? '/dashboard/rescue-partner/active'
                  : role.includes('YAYASAN')
                  ? '/dashboard/yayasan/claims'
                  : '/dashboard/consumer/my-claims'
              )}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">Pesanan &amp; Klaim Saya</span>
                    {activeClaimsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[9px] font-black">
                        {activeClaimsCount} Aktif
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Pantau tiket QR serah terima &amp; batas penjemputan
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/dashboard/cart')}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">Tas Klaim</span>
                    {cartCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-black">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Daftar makanan yang siap di-checkout
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate(
                role.includes('YAYASAN') ? '/dashboard/yayasan/history' : '/dashboard/consumer/history'
              )}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-slate-700" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Riwayat Transaksi</span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Arsip seluruh pesanan selesai &amp; struk digital
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Group 3: Rewards & Program Hijau */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            <div className="px-3.5 py-2 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Hadiah &amp; Dampak Hijau
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('/dashboard/consumer/rewards')}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">Tukar EcoPoints</span>
                    <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[9px] rounded">
                      Beta
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Tukarkan {ecoPoints} poin dengan voucer &amp; hadiah
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/impact')}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Dampak Karbon &amp; ESG</span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Laporan pencegahan emisi metana standar IPCC
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Group 4: Bantuan & Ketentuan */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            <div className="px-3.5 py-2 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Bantuan &amp; Informasi
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('/dashboard/info')}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Pusat Bantuan &amp; Edukasi</span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Panduan SOP BPOM, kalkulator emisi, &amp; FAQ
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/about')}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-slate-700" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Syarat &amp; Ketentuan</span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Kebijakan keamanan pangan &amp; transparansi
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
