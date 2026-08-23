'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function DriverManifestNoLoginPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'FB-DIR-88291';
  const cleanCode = decodeURIComponent(rawId).toUpperCase();

  const [claimData, setClaimData] = useState<any>({
    code: cleanCode,
    foodName: 'Paket Rice Bowl Ayam Geprek (40 Porsi)',
    storeName: 'Warung Bakso Pak Kumis Surabaya',
    storePhone: '0812-3456-7890',
    userName: 'Panti Asuhan Wonokromo (Panti A)',
    recipientPerson: 'Pak Mahmud (Pengurus Panti A)',
    recipientPhone: '0812-4455-6677',
    address: 'Jl. Wonokromo No. 45, Wonokromo, Surabaya Timur',
    driverName: 'Driver B: Mas Agus (Plat L 1234 XYZ)',
    status: 'IN_TRANSIT',
    time: 'Dalam Pengiriman (OTW)',
  });

  const [proofPhoto, setProofPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80'
  );
  const [deliveryNotes, setDeliveryNotes] = useState<string>(
    'Makanan diserahkan langsung ke Pak Mahmud dalam kondisi hangat & kemasan steril.'
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      if (savedClaimsStr) {
        const parsed = JSON.parse(savedClaimsStr);
        const matched = parsed.find(
          (c: any) =>
            (c.claimCode && c.claimCode.toUpperCase() === cleanCode) ||
            (c.code && c.code.toUpperCase() === cleanCode) ||
            (c.id && c.id.toUpperCase() === cleanCode)
        );
        if (matched) {
          setClaimData({
            code: matched.claimCode || matched.code || cleanCode,
            foodName: matched.foodName || 'Surplus Makanan Steril',
            storeName: matched.storeName || 'Warung Bakso Pak Kumis Surabaya',
            storePhone: matched.storePhone || '0812-3456-7890',
            userName: matched.userName || matched.shelterName || 'Penerima Manfaat',
            recipientPerson: matched.recipientPerson || matched.userName || 'Pengurus Penerima',
            recipientPhone: matched.recipientPhone || matched.contactPhone || '0812-4455-6677',
            address: matched.address || 'Kota Surabaya',
            driverName: matched.courierName || matched.driverName || 'Driver Armada Toko',
            status: matched.status || 'IN_TRANSIT',
            time: matched.time || 'OTW Pengiriman',
          });
          if (matched.status === 'COMPLETED' || matched.status === 'VERIFIED') {
            setIsCompleted(true);
          }
        }
      }
    } catch (_) {}
  }, [cleanCode]);

  const handleCompleteDeliveryByDriver = () => {
    setIsCompleted(true);

    try {
      const savedClaimsStr = localStorage.getItem('replate_claims');
      const existing = savedClaimsStr ? JSON.parse(savedClaimsStr) : [];
      const updated = existing.map((c: any) => {
        const isMatch =
          (c.claimCode && c.claimCode.toUpperCase() === cleanCode) ||
          (c.code && c.code.toUpperCase() === cleanCode) ||
          (c.id && c.id.toUpperCase() === cleanCode);

        if (isMatch) {
          return {
            ...c,
            status: 'COMPLETED',
            time: 'Selesai Diantar Driver Toko',
            handoverProof: proofPhoto,
            deliveryNotes: deliveryNotes,
          };
        }
        return c;
      });

      localStorage.setItem('replate_claims', JSON.stringify(updated));
    } catch (_) {}

    setToastState({
      isOpen: true,
      message: `✅ Hore! Makanan Resi ${cleanCode} Berhasil Dikonfirmasi Sampai di Penerima!`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-4">
        {/* Header Branding (High Contrast Navy & Gold) */}
        <div className="bg-[#1B3A5C] p-5 rounded-2xl border border-[#2C5A8F] shadow-md text-center space-y-1 text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4A843] text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-md shadow-xs">
            <span>🚚 SURAT JALAN DIGITAL DRIVER TOKO (NO-LOGIN)</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight pt-1">Replate Dispatch Express</h1>
          <p className="text-xs text-slate-200 font-medium">
            {claimData.storeName}
          </p>
        </div>

        {/* Card 1: Informasi Resi & Makanan (High Contrast Pure White & Dark Navy Text) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-3.5 text-xs text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-slate-500 font-bold text-xs">Kode Resi Surat Jalan:</span>
            <span className="font-mono font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg text-sm tracking-wider">
              {claimData.code}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider block">Menu Makanan Surplus:</span>
            <span className="font-black text-[#1B3A5C] text-base block leading-snug">{claimData.foodName}</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="text-emerald-800 font-bold text-xs">Driver Penanggung Jawab:</span>
            <span className="font-black text-emerald-950 text-xs">{claimData.driverName}</span>
          </div>
        </div>

        {/* Card 2: Lokasi & Kontak Tujuan Penerima */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-3.5 text-xs text-slate-800">
          <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
            <span className="font-black text-[#1B3A5C] text-sm flex items-center gap-1.5">
              <span>🏢 Lokasi & Penerima Tujuan</span>
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-900 font-black px-2 py-0.5 rounded-md border border-blue-300">
              PANTI / KONSUMEN
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-extrabold text-[#1B3A5C] text-base block">{claimData.userName}</span>
            <p className="text-slate-600 font-medium text-xs leading-relaxed">
              Kontak Person: <strong className="text-slate-900 font-bold">{claimData.recipientPerson}</strong>
              <br />
              No. WA/Telp: <strong className="text-[#1B3A5C] font-black">{claimData.recipientPhone}</strong>
            </p>
          </div>

          <div className="p-3.5 bg-[#1B3A5C] text-white rounded-2xl shadow-xs space-y-1">
            <span className="text-amber-400 font-extrabold text-[10px] uppercase tracking-wider block">📍 Alamat Pengantaran Tujuan:</span>
            <p className="text-white font-bold leading-relaxed text-xs">{claimData.address}</p>
          </div>

          {/* Quick Action Large Touch Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={`https://wa.me/${claimData.recipientPhone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(claimData.recipientPerson)},%20saya%20${encodeURIComponent(claimData.driverName)}%20dari%20${encodeURIComponent(claimData.storeName)}%20sedang%20mengantar%20makanan%20surplus%20Replate%20ke%20lokasi%20Anda.`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-center shadow-md flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 2c-5.514 0-9.999 4.486-9.999 10.001 0 1.761.459 3.475 1.332 4.996l-1.364 4.986 5.105-1.338c1.468.802 3.125 1.226 4.807 1.226 5.514 0 9.999-4.486 9.999-10.001 0-5.515-4.485-10.001-9.999-10.001z"/>
              </svg>
              <span>Hubungi WA</span>
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(claimData.address)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-center shadow-md flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <svg className="w-4 h-4 stroke-current shrink-0" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Buka Maps</span>
            </a>
          </div>
        </div>

        {/* Card 3: Form Foto Bukti Serah Terima & Tombol Selesai */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-4 text-xs text-slate-800">
          <div className="border-b border-slate-200 pb-2.5">
            <h3 className="font-black text-[#1B3A5C] text-sm flex items-center gap-1.5">
              <span>📷 Upload Bukti Makanan Sampai di Tujuan</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Ambil foto serah terima makanan di lokasi tujuan sebagai bukti sah.
            </p>
          </div>

          {/* Photo Preview Container */}
          <div className="space-y-2">
            <div className="relative h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center">
              {proofPhoto ? (
                <img src={proofPhoto} alt="Bukti Penyerahan" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 font-medium">Belum ada foto</span>
              )}
              <span className="absolute bottom-2 left-2 bg-slate-950/80 text-amber-300 text-[10px] px-2.5 py-1 rounded-md font-mono font-bold border border-amber-400/40">
                📷 BUKTI FOTO SERAH TERIMA
              </span>
            </div>

            <label className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl text-center cursor-pointer block shadow-sm transition-all text-xs">
              <span>📷 Ambil Foto Kamera HP</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const url = URL.createObjectURL(e.target.files[0]);
                    setProofPhoto(url);
                  }
                }}
              />
            </label>
          </div>

          {/* Delivery Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Catatan Penyerahan Driver (Opsional):</label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#1B3A5C]"
              placeholder="Contoh: Makanan diserahkan langsung ke Pak Mahmud..."
            />
          </div>

          {/* Complete Delivery Action Button */}
          {!isCompleted ? (
            <Button
              variant="gold"
              size="lg"
              onClick={handleCompleteDeliveryByDriver}
              className="w-full font-black text-slate-950 shadow-md py-3.5 text-sm flex items-center justify-center gap-2"
            >
              <span>✓ Konfirmasi Makanan Diterima Selesai ➔</span>
            </Button>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-center space-y-1">
              <span className="font-black text-sm block text-emerald-900">🎉 Pengiriman Sukses Diverifikasi!</span>
              <p className="text-[11px] text-emerald-800 font-medium">
                Terima kasih, Mas Driver! Status pesanan <strong className="font-mono text-[#1B3A5C] font-black">{claimData.code}</strong> telah terbarui menjadi COMPLETED di sistem Replate.
              </p>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2 pb-6">
          <button
            type="button"
            onClick={() => router.push(`/track/${claimData.code}`)}
            className="text-xs text-slate-600 hover:text-[#1B3A5C] font-extrabold transition-all underline"
          >
            Lihat Halaman Transparansi Resi Public (/track/{claimData.code})
          </button>
        </div>
      </div>

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
