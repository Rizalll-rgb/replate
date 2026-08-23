'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-4">
        {/* Header Branding (Mobile Friendly) */}
        <div className="bg-[#1B3A5C] p-5 rounded-2xl border border-[#2C5A8F] shadow-lg text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4A843] text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-md">
            <span>🚚 SURAT JALAN DIGITAL DRIVER TOKO (NO-LOGIN)</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight pt-1">Replate Dispatch Express</h1>
          <p className="text-xs text-slate-200 font-medium">
            Warung Bakso Pak Kumis ➔ Delivery Partner
          </p>
        </div>

        {/* Resi Info Card */}
        <Card className="bg-slate-800 border-slate-700 text-slate-200 shadow-md">
          <CardBody className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400 font-semibold">Kode Resi Surat Jalan:</span>
              <span className="font-mono font-black text-[#D4A843] text-sm tracking-wider">{claimData.code}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block">Menu Makanan Surplus:</span>
              <span className="font-extrabold text-white text-sm block">{claimData.foodName}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block">Driver Armada Penanggung Jawab:</span>
              <span className="font-extrabold text-emerald-400 block">{claimData.driverName}</span>
            </div>
          </CardBody>
        </Card>

        {/* Destination Target Info */}
        <Card className="bg-slate-800 border-slate-700 text-slate-200 shadow-md">
          <CardBody className="p-4 space-y-3 text-xs">
            <div className="border-b border-slate-700 pb-2 flex items-center justify-between">
              <span className="font-extrabold text-white flex items-center gap-1 text-xs">
                <span>🏢 Lokasi & Penerima Tujuan</span>
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/30">
                PANTI / KONSUMEN
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-black text-white text-sm block">{claimData.userName}</span>
              <p className="text-slate-300 font-medium leading-snug">
                Kontak Penerima: <strong>{claimData.recipientPerson}</strong> ({claimData.recipientPhone})
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-semibold block">Alamat Tujuan Pengantaran:</span>
              <p className="text-slate-200 font-bold leading-relaxed">{claimData.address}</p>
            </div>

            {/* Quick Action Buttons for Driver */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`https://wa.me/${claimData.recipientPhone.replace(/[^0.9]/g, '')}?text=Halo%20${encodeURIComponent(claimData.recipientPerson)},%20saya%20${encodeURIComponent(claimData.driverName)}%20dari%20Warung%20Bakso%20Pak%20Kumis%20sedang%20mengantar%20makanan%20surplus%20Replate%20ke%20lokasi%20Anda.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-center shadow-xs flex items-center justify-center gap-1 transition-all"
              >
                <span>💬 Hubungi WA</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(claimData.address)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-center shadow-xs flex items-center justify-center gap-1 transition-all"
              >
                <span>📍 Buka Maps</span>
              </a>
            </div>
          </CardBody>
        </Card>

        {/* Proof of Delivery Upload & Confirmation Section */}
        <Card className="bg-slate-800 border-slate-700 text-slate-200 shadow-md">
          <CardBody className="p-4 space-y-4 text-xs">
            <div className="border-b border-slate-700 pb-2">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <span>📷 Upload Bukti Makanan Sampai di Tujuan</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ambil foto serah terima makanan di lokasi tujuan sebagai bukti konfirmasi sah.
              </p>
            </div>

            {/* Photo Preview Container */}
            <div className="space-y-2">
              <div className="relative h-44 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                {proofPhoto ? (
                  <img src={proofPhoto} alt="Bukti Penyerahan" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 font-medium">Belum ada foto</span>
                )}
                <span className="absolute bottom-2 left-2 bg-slate-950/80 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/30">
                  📷 FOTO SERAH TERIMA TOKO
                </span>
              </div>

              <label className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-extrabold rounded-xl text-center cursor-pointer block border border-slate-600 transition-all">
                <span>📷 Ambil Foto via Kamera HP</span>
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
              <label className="font-bold text-slate-300 block">Catatan Penyerahan Driver (Opsional):</label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 text-xs font-medium focus:outline-none"
                placeholder="Contoh: Makanan diserahkan langsung ke Pak Mahmud..."
              />
            </div>

            {/* Complete Delivery Action Button */}
            {!isCompleted ? (
              <Button
                variant="gold"
                size="lg"
                onClick={handleCompleteDeliveryByDriver}
                className="w-full font-black text-slate-950 shadow-lg py-3 text-sm flex items-center justify-center gap-2"
              >
                <span>✓ Konfirmasi Makanan Diterima Selesai ➔</span>
              </Button>
            ) : (
              <div className="p-4 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-2xl text-center space-y-1">
                <span className="font-black text-sm block text-emerald-400">🎉 Pengiriman Sukses Diverifikasi!</span>
                <p className="text-[11px] text-emerald-200 font-medium">
                  Terima kasih, Mas Driver! Status pesanan <strong className="font-mono text-amber-300">{claimData.code}</strong> telah terbarui menjadi COMPLETED di sistem Replate.
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Back Link */}
        <div className="text-center pt-2 pb-6">
          <button
            type="button"
            onClick={() => router.push(`/track/${claimData.code}`)}
            className="text-xs text-slate-400 hover:text-amber-400 font-bold transition-all underline"
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
