'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface TOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TOSModal: React.FC<TOSModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=" Syarat, Ketentuan & Kebijakan Privasi Replate"
      size="lg"
    >
      <div className="space-y-4 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-2">
        {/* Header Branding */}
        <div className="p-4 bg-[#1B3A5C] text-white rounded-2xl space-y-1 shadow-xs">
          <span className="font-black text-amber-400 text-xs block uppercase tracking-wider">
            Standard Operasional & Kebijakan Platform Zero-Waste
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Dokumen resmi aturan penggunaan platform Replate untuk Mitra Food Provider, Food Beneficiary (Panti/Yayasan), Konsumen, dan Kurir Relawan.
          </p>
        </div>

        {/* Section 1: Standard BPOM */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-extrabold text-[#1B3A5C] text-sm flex items-center gap-1.5">
            <span>1. Standar Keamanan & Higiene Pangan (BPOM RI)</span>
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Seluruh makanan surplus yang dipublikasikan oleh <strong>Food Provider</strong> wajib memenuhi 100% dari 8 Checklist SOP Rescue Readiness (termasuk batas jam pickup realistis, kemasan steril utuh, dan suhu penyimpanan aman). Makanan yang basi atau tidak layak konsumsi dilarang keras diunggah.
          </p>
        </div>

        {/* Section 2: Skema Skala Distribusi */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-extrabold text-[#1B3A5C] text-sm flex items-center gap-1.5">
            <span>2. Skema Dual-Jalur (Rescue Sale vs Food Rescue Donasi)</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium">
            <li>
              <strong>Rescue Sale (Konsumen):</strong> Makanan surplus dijual diskon murah (50-70%) dengan potongan otomatis 5% infaq untuk operasional panti.
            </li>
            <li>
              <strong>Food Rescue Donasi (Food Beneficiary):</strong> Makanan dihibahkan 100% Gratis (Rp 0) untuk panti asuhan, yayasan sosial, dan warga rentan terverifikasi.
            </li>
          </ul>
        </div>

        {/* Section 3: Privasi & Keamanan Data */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-extrabold text-[#1B3A5C] text-sm flex items-center gap-1.5">
            <span>3. Kerahasiaan Dokumen & Verifikasi Akun</span>
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Dokumen administrasi seperti KTP, NIB, Izin Usaha, dan Akta Yayasan hanya digunakan oleh Tim Admin Replate Surabaya untuk verifikasi keabsahan mitra (1x24 Jam) dan tidak akan disebarluaskan ke publik anonim.
          </p>
        </div>

        {/* Section 4: Logistik & Verifikasi QR */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-extrabold text-[#1B3A5C] text-sm flex items-center gap-1.5">
            <span>4. Prosedur Logistik & Scan QR Code</span>
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Serah terima porsi makanan wajib diverifikasi melalui pindaian Kode QR unik atau konfirmasi Surat Jalan Digital. Pemalsuan klaim akan dikenakan sanksi penangguhan akun permanen.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200 mt-4">
        <Button variant="gold" size="sm" className="font-black text-xs" onClick={onClose}>
          Saya Memahami & Menyetujui TOS 
        </Button>
      </div>
    </Modal>
  );
};
