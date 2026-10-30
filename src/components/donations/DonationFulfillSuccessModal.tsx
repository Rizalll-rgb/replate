'use client';

import React from 'react';
import {
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  Phone,
  PackageCheck,
  Building,
  UserCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface DonationFulfillSuccessData {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  providerName: string;
  recipientName: string;
  deliveryAddress: string;
  deliveryOption: string;
  deliveryFee: number;
  driverName: string;
  driverPhone: string;
  driverVehicle: string;
  estimatedDeliveryTime: string;
  portionsCount?: number | string;
  ticketCode?: string;
  onTrack?: (ticketCode: string) => void;
}

export const DonationFulfillSuccessModal: React.FC<DonationFulfillSuccessData> = ({
  isOpen,
  onClose,
  productName,
  providerName,
  recipientName,
  deliveryAddress,
  deliveryOption,
  deliveryFee = 0,
  driverName,
  driverPhone,
  driverVehicle,
  estimatedDeliveryTime,
  portionsCount = 30,
  ticketCode,
  onTrack,
}) => {
  const code = ticketCode || `QR-DON-${Math.floor(100000 + Math.random() * 900000)}`;
  const isFreeDelivery = deliveryFee === 0 || deliveryOption.toLowerCase().includes('toko') || deliveryOption.toLowerCase().includes('mandiri');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Donasi Disanggupi" size="md">
      <div className="space-y-4 text-xs text-slate-700">
        {/* Header Sukses */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1.5">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base text-emerald-950">
            Donasi Berhasil Disanggupi!
          </h3>
          <p className="text-[11px] text-emerald-800 font-medium leading-relaxed max-w-sm mx-auto">
            Terima kasih atas kebaikan Anda. Surat jalan digital dan penugasan kurir telah diterbitkan otomatis di ekosistem Replate.
          </p>
          <div className="inline-block mt-1 px-3 py-1 bg-white border border-emerald-300 rounded-lg text-[11px] font-mono font-black text-emerald-900 shadow-2xs">
            Kode Resi: {code}
          </div>
        </div>

        {/* 6 Poin Wajib Spesifikasi */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
          {/* 1. Nama Produk & Porsi */}
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nama Produk & Jumlah
              </span>
              <p className="font-black text-sm text-[#1B3A5C] truncate">
                {productName}
              </p>
              <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-0.5">
                Alokasi: {portionsCount} Porsi
              </span>
            </div>
          </div>

          {/* 2. Nama Provider / Donatur */}
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0 mt-0.5">
              <Building className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nama Provider / Donatur
              </span>
              <p className="font-black text-xs text-slate-800">
                {providerName || 'Mitra Food Provider Replate'}
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Terverifikasi SOP BPOM RI
              </span>
            </div>
          </div>

          {/* 3. Alamat Tujuan Pengiriman */}
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Alamat Tujuan Pengiriman (Penerima)
              </span>
              <p className="font-extrabold text-xs text-slate-900 leading-snug">
                {recipientName}
              </p>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">
                {deliveryAddress}
              </p>
            </div>
          </div>

          {/* 4. Nominal Ongkos Kirim (Ongkir) */}
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nominal Ongkos Kirim (Ongkir)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-black text-emerald-700">
                  {isFreeDelivery ? 'Rp 0' : `Rp ${deliveryFee.toLocaleString('id-ID')}`}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md border border-emerald-300">
                  {isFreeDelivery ? 'GRATIS (Armada Toko / Subsidi)' : 'Ongkir Terhitung'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Metode: {deliveryOption}
              </p>
            </div>
          </div>

          {/* 5. Informasi Detail Driver (Nama, Kontak, Kendaraan) */}
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Detail Petugas / Driver Pengantar
              </span>
              <div className="mt-0.5 space-y-1">
                <p className="font-black text-xs text-[#1B3A5C]">
                  {driverName || 'Budi Santoso (Driver Resmi Armada Toko)'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-semibold">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {driverPhone || '0812-3456-7890'}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">
                    Kendaraan: {driverVehicle || 'Honda Vario 160 (L 4521 AB)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Estimasi Waktu Pengantaran */}
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estimasi Waktu Pengantaran
              </span>
              <p className="font-black text-xs text-purple-950 mt-0.5">
                {estimatedDeliveryTime || 'Hari Ini, Pukul 19:30 - 20:30 WIB (± 30 - 45 Menit)'}
              </p>
              <p className="text-[10.5px] text-slate-500 font-medium">
                Pangan diantar langsung dalam wadah berinsulasi steril standar BPOM RI.
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto font-bold text-xs"
          >
            Tutup
          </Button>
          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={() => {
              if (onTrack) onTrack(code);
              onClose();
            }}
            className="w-full sm:w-auto font-black text-xs text-slate-950 shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Pantau Surat Jalan Digital</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

