'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  OutletItem,
  getStoredOutlets,
  saveStoredOutlets,
  getActiveOutletId,
  setActiveOutletId,
  isGrowthTierActive,
  simulateUpgradeToGrowth,
  DEFAULT_OUTLETS,
} from '@/lib/outletManager';
import { resolveIndonesianAddress } from '@/lib/geoResolver';
import {
  Store,
  Plus,
  MapPin,
  Phone,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Navigation,
  Crosshair,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

export default function OutletsPage() {
  const router = useRouter();
  const [isGrowth, setIsGrowth] = useState<boolean>(false);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingOutlet, setEditingOutlet] = useState<OutletItem | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
    contactName: string;
    contactPhone: string;
    adminEmail: string;
    isMain: boolean;
  }>({
    name: '',
    city: 'Surabaya',
    address: '',
    latitude: -7.2575,
    longitude: 112.7521,
    contactName: '',
    contactPhone: '',
    adminEmail: '',
    isMain: false,
  });

  const loadData = () => {
    const growth = isGrowthTierActive();
    setIsGrowth(growth);
    const list = getStoredOutlets();
    setOutlets(list);
    setActiveId(getActiveOutletId());
  };

  useEffect(() => {
    loadData();

    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('replate_outlets_updated', handleStorageChange);
    window.addEventListener('replate_subscription_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('replate_outlets_updated', handleStorageChange);
      window.removeEventListener('replate_subscription_updated', handleStorageChange);
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingOutlet(null);
    setFormData({
      name: '',
      city: 'Surabaya',
      address: '',
      latitude: -7.2575,
      longitude: 112.7521,
      contactName: '',
      contactPhone: '',
      adminEmail: '',
      isMain: outlets.length === 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (outlet: OutletItem) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      city: outlet.city || 'Surabaya',
      address: outlet.address,
      latitude: outlet.latitude,
      longitude: outlet.longitude,
      contactName: outlet.contactName,
      contactPhone: outlet.contactPhone,
      adminEmail: outlet.adminEmail || '',
      isMain: !!outlet.isMain,
    });
    setIsFormOpen(true);
  };

  const handleAutoResolveAddress = () => {
    if (!formData.address.trim()) {
      setToast({
        isOpen: true,
        message: 'Ketik alamat lengkap cabang terlebih dahulu untuk deteksi koordinat otomatis.',
        type: 'warning',
      });
      return;
    }
    const resolved = resolveIndonesianAddress(formData.address);
    setFormData((prev) => ({
      ...prev,
      latitude: resolved.lat,
      longitude: resolved.lng,
      city: resolved.city || prev.city,
    }));
    setToast({
      isOpen: true,
      message: `Koordinat diperbarui ke ${resolved.district || resolved.city || 'Surabaya'} (${resolved.lat.toFixed(4)}, ${resolved.lng.toFixed(4)})`,
      type: 'success',
    });
  };

  const handleSaveOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      setToast({
        isOpen: true,
        message: 'Nama cabang dan alamat lengkap wajib diisi.',
        type: 'error',
      });
      return;
    }

    let updatedList: OutletItem[];

    if (editingOutlet) {
      // Update existing
      updatedList = outlets.map((item) => {
        if (item.id === editingOutlet.id) {
          return {
            ...item,
            ...formData,
          };
        }
        if (formData.isMain && item.id !== editingOutlet.id) {
          return { ...item, isMain: false };
        }
        return item;
      });
      setToast({
        isOpen: true,
        message: `Cabang "${formData.name}" berhasil diperbarui.`,
        type: 'success',
      });
    } else {
      // Create new
      const newOutlet: OutletItem = {
        id: `out-${Date.now()}`,
        ...formData,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      if (formData.isMain) {
        updatedList = outlets.map((o) => ({ ...o, isMain: false }));
        updatedList.push(newOutlet);
      } else {
        updatedList = [...outlets, newOutlet];
      }
      setToast({
        isOpen: true,
        message: `Cabang "${formData.name}" berhasil ditambahkan.`,
        type: 'success',
      });
    }

    setOutlets(updatedList);
    saveStoredOutlets(updatedList);
    setIsFormOpen(false);
  };

  const handleDeleteOutlet = (id: string, name: string) => {
    if (outlets.length <= 1) {
      setToast({
        isOpen: true,
        message: 'Minimal harus ada 1 outlet aktif pada toko Anda.',
        type: 'warning',
      });
      return;
    }
    if (confirm(`Yakin ingin menghapus cabang "${name}"?`)) {
      const filtered = outlets.filter((o) => o.id !== id);
      setOutlets(filtered);
      saveStoredOutlets(filtered);
      if (activeId === id) {
        setActiveOutletId(filtered[0].id);
        setActiveId(filtered[0].id);
      }
      setToast({
        isOpen: true,
        message: `Cabang "${name}" telah dihapus.`,
        type: 'success',
      });
    }
  };

  const handleSetActive = (id: string, name: string) => {
    setActiveOutletId(id);
    setActiveId(id);
    setToast({
      isOpen: true,
      message: `Cabang aktif diganti ke "${name}".`,
      type: 'success',
    });
  };

  const handleDemoUpgrade = () => {
    simulateUpgradeToGrowth();
    setIsGrowth(true);
    setOutlets(DEFAULT_OUTLETS);
    setActiveId(DEFAULT_OUTLETS[0].id);
    setToast({
      isOpen: true,
      message: 'Simulasi Berhasil! Akun Anda kini aktif sebagai Replate Growth Tier.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1B3A5C] flex items-center gap-2">
            <Store className="w-6 h-6 text-[#1B3A5C]" />
            <span>Manajemen Multi-Outlet & Cabang</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola seluruh cabang toko, titik koordinat penjemputan surplus, dan kontak PIC outlet.
          </p>
        </div>

        {isGrowth && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            className="bg-[#1B3A5C] hover:bg-[#2C5A8F] text-[#D4A843] font-black text-xs py-2 px-4 shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang Baru</span>
          </Button>
        )}
      </div>

      {/* ACCESS VALIDATION: If NOT Replate Growth Tier */}
      {!isGrowth ? (
        <div className="max-w-3xl mx-auto my-6 space-y-6">
          <div className="p-8 bg-gradient-to-br from-slate-900 via-[#1B3A5C] to-slate-900 text-white rounded-3xl border-2 border-[#D4A843]/50 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D4A843]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#D4A843] text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Eksklusif Replate Growth
                </span>
                <span className="text-xs text-slate-300 font-bold">Tier Terkunci</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300">
                Rp 259.000 / bulan
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Kelola Banyak Cabang dari Satu Dashboard Pusat
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Fitur <strong>Multi-Outlet Management</strong> dirancang khusus untuk jaringan ritel, bakery chain, supermarket, dan restoran yang memiliki beberapa cabang di area operasional berbeda.
              </p>
            </div>

            {/* Benefit Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="font-extrabold text-[#D4A843] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A843]" />
                  <span>Cabang &amp; Outlet Tanpa Batas</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Daftarkan semua cabang Anda dengan koordinat GPS mandiri untuk akurasi jemput driver.
                </p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="font-extrabold text-[#D4A843] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A843]" />
                  <span>UI Switcher Cabang Cepat</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Ganti outlet aktif seketika langsung dari bar navigasi atas dashboard provider.
                </p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="font-extrabold text-[#D4A843] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A843]" />
                  <span>Hitung Jarak &amp; Ongkir Akurat</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Ongkos kirim kurir dihitung tepat dari cabang penerbit makanan ke alamat pemesan.
                </p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="font-extrabold text-[#D4A843] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A843]" />
                  <span>PIC &amp; WhatsApp per Outlet</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Driver dan penerima langsung berkoordinasi dengan admin cabang terkait.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-white/10">
              <Button
                variant="gold"
                size="md"
                onClick={() => router.push('/dashboard/provider/subscription?plan=GROWTH')}
                className="w-full sm:w-auto font-black text-xs py-3 px-6 shadow-md text-slate-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Upgrade ke Replate Growth (Rp 259.000/bln)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={handleDemoUpgrade}
                className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/20"
              >
                Coba Fitur Multi-Outlet (Simulasi 1-Klik)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE GROWTH TIER: Full Management View */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block">Total Cabang Terdaftar</span>
                <strong className="text-2xl font-black text-[#1B3A5C]">{outlets.length} Cabang</strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B3A5C] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block">Cabang Aktif di Dashboard</span>
                <strong className="text-base font-black text-emerald-800 truncate block max-w-[180px]">
                  {outlets.find((o) => o.id === activeId)?.name || 'Belum Dipilih'}
                </strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block">Paket Berlangganan</span>
                <strong className="text-base font-black text-[#D4A843] block">Replate Growth Active</strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4A843] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Outlets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outlets.map((outlet) => {
              const isActive = outlet.id === activeId;
              const gmapsUrl = `https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`;

              return (
                <div
                  key={outlet.id}
                  className={`bg-white rounded-2xl border-2 p-5 space-y-4 shadow-xs transition-all relative flex flex-col justify-between ${
                    isActive ? 'border-[#1B3A5C] ring-2 ring-[#1B3A5C]/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-black text-[#1B3A5C] text-sm sm:text-base leading-snug">
                            {outlet.name}
                          </h3>
                          {outlet.isMain && (
                            <span className="px-2 py-0.5 bg-blue-100 text-[#1B3A5C] font-extrabold text-[9px] rounded-md">
                              KANTOR PUSAT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold block mt-0.5">
                          {outlet.city || 'Surabaya'} • Terdaftar: {new Date(outlet.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetActive(outlet.id, outlet.name)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#1B3A5C] hover:text-[#D4A843] text-slate-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          Pilih Cabang
                        </button>
                      )}
                    </div>

                    {/* Address & GPS */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug font-medium">{outlet.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-200/60">
                        <span>Koordinat: {outlet.latitude.toFixed(4)}, {outlet.longitude.toFixed(4)}</span>
                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1B3A5C] font-bold hover:underline flex items-center gap-0.5"
                        >
                          <span>Buka Peta</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span className="text-[11px] font-semibold">{outlet.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span className="text-[11px] font-mono font-bold text-slate-800">{outlet.contactPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(outlet)}
                      className="p-1.5 text-slate-500 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {!outlet.isMain && (
                      <button
                        type="button"
                        onClick={() => handleDeleteOutlet(outlet.id, outlet.name)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT CABANG */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingOutlet ? `Edit Cabang: ${editingOutlet.name}` : 'Tambah Cabang Outlet Baru'}
        size="lg"
      >
        <form onSubmit={handleSaveOutlet} className="space-y-4 p-2 text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1B3A5C] block mb-1">Nama Cabang / Outlet *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Alfamart - Cabang Merr Kalijudan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#1B3A5C] block mb-1">Kota Operasional *</label>
              <input
                type="text"
                required
                placeholder="Surabaya / Sidoarjo / Gresik"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#1B3A5C]">Alamat Lengkap Titik Penjemputan *</label>
              <button
                type="button"
                onClick={handleAutoResolveAddress}
                className="text-[10.5px] font-bold text-[#1B3A5C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Crosshair className="w-3 h-3 text-[#D4A843]" />
                <span>Deteksi Koordinat Otomatis</span>
              </button>
            </div>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Jl. Dr. Ir. H. Soekarno No. 120, Mulyorejo, Surabaya, Jawa Timur 60115"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C]"
            />
          </div>

          {/* Coordinate Fields */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-black text-[#1B3A5C] block">
              Titik Koordinat Peta GPS (Untuk Hitung Ongkir Rp 2.000 / km)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Latitude (Lintang)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="-7.2575"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Longitude (Bujur)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="112.7521"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1B3A5C] block mb-1">Nama PIC / Admin Outlet *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Agus Santoso (Store Manager)"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#1B3A5C] block mb-1">Nomor Kontak WhatsApp / Telp *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 0812-9876-5432"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1B3A5C] block mb-1">Email Notifikasi Cabang (Opsional)</label>
            <input
              type="email"
              placeholder="cabang.surabaya@replate.id"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1B3A5C]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={formData.isMain}
              onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
              className="rounded border-slate-300 text-[#1B3A5C] focus:ring-0 cursor-pointer"
            />
            <span>Tandai sebagai Kantor / Outlet Utama</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              className="font-bold text-xs py-2 px-4 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-[#1B3A5C] text-[#D4A843] font-black text-xs py-2 px-5 shadow-xs cursor-pointer"
            >
              {editingOutlet ? 'Simpan Perubahan' : 'Tambahkan Cabang'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Alert */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
