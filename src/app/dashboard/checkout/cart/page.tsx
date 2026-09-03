'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { QRGenerator } from '@/components/qr/QRGenerator';
import {
  MapPinIcon,
  TruckIcon,
  CreditCardIcon,
  CheckIcon,
  PackageIcon,
  TicketIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  BikeIcon,
} from '@/components/ui/Icon';

// Poin 8: Inline ChevronRight since it may not be in Icon.tsx
const ChevronRight = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Poin 6: Standardized resi generator
const genResiCode = (role: 'YYS' | 'CNS') =>
  `RPL-${role}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

export default function CheckoutCartPage() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'SELF_PICKUP' | 'COURIER_DELIVERY'>('SELF_PICKUP');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBeneficiaryRole, setIsBeneficiaryRole] = useState(false);

  // Poin 7: QRIS Flow States
  const [qrisModal, setQrisModal] = useState(false);
  const [uploadProofModal, setUploadProofModal] = useState<{ isOpen: boolean; resiCode: string; totalAmount: number }>({ isOpen: false, resiCode: '', totalAmount: 0 });
  const [proofImageName, setProofImageName] = useState('');
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; claim: any | null }>({ isOpen: false, claim: null });

  const [address, setAddress] = useState('RT 02 RW 03 Dusun 02 Blok Cibogo Kidul Desa Panonganlor Kecamatan Sedong Kabupaten Cirebon 45189 KAB. CIREBON - SEDONG, JAWA BARAT, ID 45189');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({ isOpen: false, message: '' });

  // QRIS setup from provider profile (Poin 4)
  const [providerQris, setProviderQris] = useState<{
    merchantName: string;
    bank: string;
    accountNo: string;
    nmid: string;
    imageUrl: string;
  }>({
    merchantName: 'Warung Bakso Pak Kumis Surabaya',
    bank: 'Bank Mandiri / BCA',
    accountNo: '141-00-9812401-2',
    nmid: 'ID1020304050607',
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80',
  });

  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem('replate_provider_qris_photo');
      const savedConfig = localStorage.getItem('replate_provider_qris_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setProviderQris((prev) => ({
          merchantName: parsed.merchantName || prev.merchantName,
          bank: parsed.bank || prev.bank,
          accountNo: parsed.accountNo || prev.accountNo,
          nmid: parsed.nmid || prev.nmid,
          imageUrl: savedPhoto || parsed.imageUrl || prev.imageUrl,
        }));
      } else if (savedPhoto) {
        setProviderQris((prev) => ({ ...prev, imageUrl: savedPhoto }));
      }
    } catch (_) {}
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.address) {
          const formatted = parsed.entityName
            ? `${parsed.entityName} — ${parsed.address}`
            : parsed.address;
          setAddress(formatted);
          setTempAddress(formatted);
        }
        const r = String(parsed.role || '').toUpperCase();
        if (r.includes('BENEFICIARY') || r.includes('YAYASAN')) setIsBeneficiaryRole(true);
      }
    } catch (_) {}

    const pending = localStorage.getItem('replate_checkout_pending');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        } else {
          router.push('/dashboard/cart');
        }
      } catch (e) {
        router.push('/dashboard/cart');
      }
    } else {
      router.push('/dashboard/cart');
    }
    setIsLoaded(true);
  }, [router]);

  const subtotal = items.reduce((acc, curr) => acc + (curr.isFree ? 0 : curr.price * curr.quantity), 0);
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const deliveryFee = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : 0;
  const totalAmount = subtotal + deliveryFee;
  const isFree = subtotal === 0;

  const buildNewClaim = (resiCode: string, status: string, proofUrl?: string) => ({
    id: resiCode,
    code: resiCode,
    foodName: items.map(i => `${i.foodName || i.title} (${i.quantity}x)`).join(', '),
    providerName: items[0]?.providerName || 'Provider Replate',
    provider: items[0]?.providerName || 'Provider Replate',
    totalAmount,
    quantity: `${totalItemsCount} Porsi`,
    deliveryMethod,
    method: deliveryMethod,
    methodLabel: deliveryMethod === 'SELF_PICKUP' ? 'Ambil Sendiri (Self-Pickup)' : 'Diantar Kurir Relawan',
    paymentMethod,
    address,
    status,
    paymentProof: proofUrl || null,
    createdAt: new Date().toISOString(),
    claimedAt: 'Hari ini',
    pickupTime: items[0]?.pickupTime || 'Hari ini 21:00 WIB',
    items,
    hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
  });

  const saveClaimAndRedirect = (resiCode: string, status: string, proofUrl?: string) => {
    const newClaim = buildNewClaim(resiCode, status, proofUrl);

    const existingClaims = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
    localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingClaims]));
    const existingYysClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
    localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingYysClaims]));
    localStorage.removeItem('replate_checkout_pending');
    const currentCart = JSON.parse(localStorage.getItem('replate_cart') || '[]');
    const pendingIds = new Set(items.map(i => i.id));
    const remainingCart = currentCart.filter((c: any) => !pendingIds.has(c.id));
    localStorage.setItem('replate_cart', JSON.stringify(remainingCart));
    localStorage.setItem('replate_tas_klaim', JSON.stringify(remainingCart));
    return newClaim;
  };

  // Poin 7: QRIS checkout initiates QRIS modal first
  const handleCheckout = () => {
    if (items.length === 0) return;

    // If QRIS and paid order — show QRIS QR first
    if (paymentMethod === 'QRIS' && !isFree) {
      setQrisModal(true);
      return;
    }

    // Free (beneficiary) or non-QRIS — direct confirm
    processDirectCheckout();
  };

  const processDirectCheckout = () => {
    setIsCheckingOut(true);
    setActionLoader({ isOpen: true, message: 'Memproses Pesanan...', submessage: 'Menyimpan klaim & menerbitkan tiket' });
    setTimeout(() => {
      try {
        // Poin 6: standardized resi
        const resiCode = isFree ? genResiCode('YYS') : genResiCode('CNS');
        const status = isFree ? 'AWAITING_VERIFICATION' : 'WAITING_PAYMENT_APPROVAL';
        const newClaim = saveClaimAndRedirect(resiCode, status);
        setActionLoader({ isOpen: false, message: '' });
        setIsCheckingOut(false);
        setSuccessModal({ isOpen: true, claim: newClaim });
      } catch (err) {
        setToastState({ isOpen: true, message: 'Gagal memproses pesanan.', type: 'error' });
        setIsCheckingOut(false);
        setActionLoader({ isOpen: false, message: '' });
      }
    }, 1200);
  };

  // Poin 7: After user scans QRIS → open upload proof modal
  const handleQrisConfirmed = () => {
    const resiCode = genResiCode('CNS');
    setQrisModal(false);
    setUploadProofModal({ isOpen: true, resiCode, totalAmount });
  };

  // Poin 7: After proof uploaded → save claim as WAITING_PAYMENT_APPROVAL
  const handleUploadProof = () => {
    if (!proofImageName) {
      setToastState({ isOpen: true, message: 'Harap pilih file bukti pembayaran terlebih dahulu.', type: 'error' });
      return;
    }
    setActionLoader({ isOpen: true, message: 'Mengirim Bukti Pembayaran...', submessage: 'Menunggu verifikasi dari provider toko' });
    setTimeout(() => {
      try {
        const newClaim = saveClaimAndRedirect(uploadProofModal.resiCode, 'WAITING_PAYMENT_APPROVAL', proofImageName);
        setUploadProofModal({ isOpen: false, resiCode: '', totalAmount: 0 });
        setActionLoader({ isOpen: false, message: '' });
        setSuccessModal({ isOpen: true, claim: newClaim });
      } catch (err) {
        setActionLoader({ isOpen: false, message: '' });
        setToastState({ isOpen: true, message: 'Gagal mengunggah bukti.', type: 'error' });
      }
    }, 1000);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="animate-spin w-8 h-8 text-[#1B3A5C]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <>
      <SuperAppLoader isOpen={actionLoader.isOpen} message={actionLoader.message} submessage={actionLoader.submessage} />
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-black text-[#1B3A5C]">Checkout</h1>
          <p className="text-sm text-slate-500 font-medium">Selesaikan pesanan dari tas klaim Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Alamat — Poin 8: replace  emoji with MapPinIcon */}
            <div className="bg-white border-t-[3px] border-t-emerald-500 rounded-b-3xl border-x border-b border-slate-200 p-5 space-y-4 shadow-sm text-sm">
              <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider flex items-center gap-2">
                <MapPinIcon size={14} className="text-emerald-600" />
                Alamat Pengiriman
              </h4>
              <div className="flex items-start justify-between cursor-pointer group" onClick={() => {
                setTempAddress(address);
                setIsAddressModalOpen(true);
              }}>
                <div>
                  <p className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors">
                    Muhamad Nursidik | (+62) 838-2396-2754
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm line-clamp-2 leading-relaxed">{address}</p>
                </div>
                <span className="text-slate-400 mt-2 group-hover:translate-x-1 transition-transform"><ChevronRight /></span>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
              <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider border-b border-slate-100 pb-2">
                Daftar Pesanan ({items.length} Produk)
              </h4>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.id + idx} className="flex gap-4 items-start">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} alt={item.title || item.foodName} className="w-full h-full object-cover" />
                      {item.isFree && (
                        <div className="absolute top-0 left-0 w-full py-0.5 bg-emerald-500 text-white text-[8px] text-center font-black uppercase tracking-wider">Gratis</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-slate-800 text-sm">{item.foodName || item.title}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.providerName}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-[#1B3A5C] text-sm">
                          {item.isFree ? 'Rp 0' : `Rp ${item.price.toLocaleString('id-ID')}`}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pengiriman — Poin 8: no emoji */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm text-sm">
              <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider flex items-center gap-2">
                <TruckIcon size={14} className="text-slate-500" />
                Opsi Pengiriman
              </h4>
              <div className="flex items-center justify-between cursor-pointer border-b border-slate-100 pb-3 group" onClick={() => setIsDeliveryModalOpen(true)}>
                <div>
                  <div className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors">
                    {deliveryMethod === 'SELF_PICKUP' ? 'Ambil Mandiri (Self-Pickup)' : 'Diantar Kurir Relawan Replate'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {deliveryMethod === 'SELF_PICKUP' ? 'Bebas ongkir (Rp 0). Ambil langsung di gerai penyedia makanan.' : 'Pengantaran aman oleh armada relawan logistik Replate. (+Rp 5.000)'}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-2 inline-block">
                    {deliveryMethod === 'SELF_PICKUP'
                      ? `Jadwal Pengambilan di Toko: ${items[0]?.pickupTime || 'Hari ini 20:30 WIB'}`
                      : `Estimasi Pengantaran Tiba di Lokasi: ${items[0]?.pickupTime || 'Hari ini 20:30 WIB'}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{deliveryMethod === 'SELF_PICKUP' ? 'Rp 0' : 'Rp 5.000'}</span>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform"><ChevronRight /></span>
                </div>
              </div>
            </div>

            {/* Metode Pembayaran — Poin 8: replace $ emoji placeholder */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm text-sm">
              <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider flex items-center gap-2">
                <CreditCardIcon size={14} className="text-slate-500" />
                Metode Pembayaran
              </h4>
              <div className="flex items-center justify-between cursor-pointer group" onClick={() => setIsPaymentModalOpen(true)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <QrCodeIcon size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors">
                      {paymentMethod === 'QRIS' ? 'QRIS (Semua E-Wallet & Bank)' : `Transfer Bank ${paymentMethod}`}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {paymentMethod === 'QRIS' ? 'Scan QR dari aplikasi apapun. Gratis biaya admin.' : 'Virtual Account otomatis dicek.'}
                    </div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform"><ChevronRight /></span>
              </div>
              {/* Poin 7: QRIS badge warning for paid items */}
              {paymentMethod === 'QRIS' && !isFree && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 font-medium flex items-start gap-2">
                  <QrCodeIcon size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>QRIS akan tampil saat konfirmasi. Scan, lalu upload screenshot bukti bayar untuk aktivasi tiket QR Handover.</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h3 className="text-lg font-black text-slate-800 mb-6">Ringkasan Pesanan</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Total Item</span>
                  <span className="font-bold text-slate-800">{totalItemsCount} Porsi</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Harga</span>
                  <span className="font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Pengantaran</span>
                  <span className="font-bold text-slate-800">Rp {deliveryFee.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Tagihan</span>
                  <span className="text-2xl font-black text-[#1B3A5C]">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <Button
                variant="gold"
                className="w-full font-black py-3 text-sm shadow-md text-slate-950"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Memproses...' : paymentMethod === 'QRIS' && !isFree ? 'Lanjut Bayar QRIS' : 'Buat Pesanan'}
              </Button>
            </div>
          </div>
        </div>

        {/* MODAL DELIVERY */}
        <Modal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)}>
          <div className="p-2 space-y-4">
            <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-3">Pilih Opsi Pengiriman</h3>
            <div className="space-y-3">
              {[
                { id: 'SELF_PICKUP', label: 'Ambil Mandiri (Self-Pickup)', desc: 'Bebas ongkir. Ambil pesanan langsung di gerai provider.', price: 'Rp 0' },
                { id: 'COURIER_DELIVERY', label: 'Diantar Kurir Relawan Replate', desc: 'Pengantaran oleh armada relawan logistik Replate.', price: 'Rp 5.000' },
              ].map((opt) => (
                <label key={opt.id} className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${deliveryMethod === opt.id ? 'bg-amber-50/50 border-[#D4A843] shadow-sm' : 'bg-white border-slate-200 hover:border-amber-200'}`}>
                  <input type="radio" name="deliveryMethodModal" checked={deliveryMethod === opt.id as any} onChange={() => { setDeliveryMethod(opt.id as any); setIsDeliveryModalOpen(false); }} className="mt-0.5 w-4 h-4 text-[#1B3A5C]" />
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between w-full">
                      <span className="font-extrabold text-slate-900 text-sm">{opt.label}</span>
                      <span className="font-bold text-slate-900 text-sm">{opt.price}</span>
                    </div>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </Modal>

        {/* MODAL PAYMENT METHOD */}
        <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
          <div className="p-2 space-y-4">
            <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-3">Pilih Metode Pembayaran</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {['QRIS', 'BCA', 'MANDIRI', 'BNI', 'BRI'].map((method) => (
                <label key={method} className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === method ? 'bg-amber-50/50 border-[#D4A843] shadow-sm' : 'bg-white border-slate-200 hover:border-amber-200'}`}>
                  <input type="radio" name="paymentMethodModal" checked={paymentMethod === method} onChange={() => { setPaymentMethod(method); setIsPaymentModalOpen(false); }} className="w-4 h-4 text-[#1B3A5C]" />
                  <div className="flex-1">
                    <span className="font-extrabold text-slate-900 text-sm">{method === 'QRIS' ? 'QRIS (Semua E-Wallet & Bank)' : `Transfer Bank ${method}`}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{method === 'QRIS' ? 'Scan QR. Gratis biaya admin.' : 'Virtual Account. Dicek otomatis.'}</p>
                  </div>
                  {method === 'QRIS' && <QrCodeIcon size={18} className="text-emerald-600 shrink-0" />}
                </label>
              ))}
            </div>
          </div>
        </Modal>

        {/* MODAL ALAMAT */}
        <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)}>
          <div className="p-2 space-y-4">
            <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-3">Ubah Alamat Pengiriman</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-emerald-500 focus:ring-0 outline-none transition-colors resize-none" rows={4} value={tempAddress} onChange={(e) => setTempAddress(e.target.value)} placeholder="Masukkan alamat lengkap pengiriman..."></textarea>
              </div>
              <Button variant="primary" className="w-full font-black py-3 text-sm shadow-md" onClick={() => { setAddress(tempAddress); setIsAddressModalOpen(false); }}>
                Simpan Alamat
              </Button>
            </div>
          </div>
        </Modal>

        {/* POIN 7: MODAL QRIS PAYMENT CODE */}
        <Modal isOpen={qrisModal} onClose={() => setQrisModal(false)} title="Scan & Bayar QRIS">
          <div className="space-y-4 text-xs text-center">
            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex items-center justify-center gap-2 text-[#1B3A5C]">
                <QrCodeIcon size={16} />
                <span className="font-black text-sm">QRIS Pembayaran Replate</span>
              </div>
              {/* Real Uploaded Barcode QRIS dari Setup Profil Provider (Poin 4) */}
              <div className="flex justify-center py-2">
                <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-slate-300 max-w-[280px] w-full text-center space-y-2.5">
                  {/* QRIS Official Header */}
                  <div className="border-b border-slate-200 pb-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-black text-sm tracking-widest text-[#1B3A5C]">QRIS</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">National Standard</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">NMID: {providerQris.nmid}</p>
                  </div>

                  {/* Uploaded QRIS Image from Provider Profile */}
                  <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                    <img
                      src={providerQris.imageUrl}
                      alt="Barcode QRIS Toko"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-1.5 space-y-0.5">
                    <h5 className="font-black text-xs text-[#1B3A5C] truncate">{providerQris.merchantName || items[0]?.providerName || 'Provider Replate'}</h5>
                    <p className="text-[10px] text-slate-500 font-medium">{providerQris.bank} • {providerQris.accountNo}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-left space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-500">Nama Merchant:</span><strong className="text-slate-800">{providerQris.merchantName || items[0]?.providerName || 'Replate Provider'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Jumlah Bayar:</span><strong className="text-[#1B3A5C] font-black text-sm">Rp {totalAmount.toLocaleString('id-ID')}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Metode:</span><strong className="text-slate-800">QRIS (Semua E-Wallet & Bank)</strong></div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Scan barcode QRIS toko di atas menggunakan aplikasi GoPay, OVO, DANA, ShopeePay, atau m-Banking manapun.
                Setelah pembayaran berhasil, klik <strong>"Sudah Bayar, Upload Bukti"</strong>.
              </p>
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" size="sm" className="flex-1 font-bold text-xs cursor-pointer" onClick={() => setQrisModal(false)}>Batal</Button>
              <Button variant="gold" size="sm" leftIcon={<CheckIcon size={12} className="text-slate-950" />} className="flex-1 font-black text-xs text-slate-950 shadow-xs cursor-pointer" onClick={handleQrisConfirmed}>
                Sudah Bayar, Upload Bukti
              </Button>
            </div>
          </div>
        </Modal>

        {/* POIN 7: MODAL UPLOAD BUKTI PEMBAYARAN */}
        <Modal isOpen={uploadProofModal.isOpen} onClose={() => setUploadProofModal(p => ({ ...p, isOpen: false }))} title="Upload Bukti Pembayaran QRIS">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 font-medium text-[11px] flex items-start gap-2">
              <ShieldCheckIcon size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span>Upload screenshot atau foto struk QRIS. Pesanan Anda akan diproses setelah provider memverifikasi pembayaran.</span>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Nomor Resi: <span className="font-mono text-[#1B3A5C]">{uploadProofModal.resiCode}</span></span>
              <span className="text-xs font-bold text-slate-700 block">Total Dibayar: <span className="font-black text-[#1B3A5C]">Rp {uploadProofModal.totalAmount.toLocaleString('id-ID')}</span></span>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">File Bukti Pembayaran</label>
              <label className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0">
                  <PackageIcon size={18} className="text-slate-500 group-hover:text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  {proofImageName ? (
                    <p className="font-bold text-emerald-700 truncate">{proofImageName}</p>
                  ) : (
                    <p className="font-medium text-slate-500">Klik untuk pilih file bukti bayar</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, atau PDF · Maks. 5MB</p>
                </div>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setProofImageName(e.target.files[0].name); }} />
              </label>
            </div>
            <div className="flex gap-2.5 pt-1">
              <Button variant="outline" size="sm" className="flex-1 font-bold text-xs cursor-pointer" onClick={() => setUploadProofModal(p => ({ ...p, isOpen: false }))}>Kembali</Button>
              <Button variant="gold" size="sm" leftIcon={<CheckIcon size={12} className="text-slate-950" />} className="flex-1 font-black text-xs text-slate-950 shadow-xs cursor-pointer" onClick={handleUploadProof}>
                Kirim Bukti Pembayaran
              </Button>
            </div>
          </div>
        </Modal>

        {/* POIN 3/7: SUCCESS MODAL */}
        <Modal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false, claim: null })} title="Pesanan Berhasil Dibuat!" size="md">
          {successModal.claim && (
            <div className="space-y-4 text-xs">
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-2xl border border-emerald-200 text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckIcon size={28} className="text-white" />
                </div>
                <h3 className="font-black text-base text-emerald-900">
                  {successModal.claim.status === 'WAITING_PAYMENT_APPROVAL' ? 'Bukti Dikirim! Menunggu Verifikasi' : 'Pesanan Dikonfirmasi!'}
                </h3>
                <p className="text-[11px] text-emerald-800 font-medium">
                  {successModal.claim.status === 'WAITING_PAYMENT_APPROVAL'
                    ? 'Pembayaran Anda sedang diverifikasi oleh provider toko. Tiket QR Handover akan aktif setelah disetujui.'
                    : 'Pesanan donasi pangan Anda telah berhasil diklaim.'}
                </p>
              </div>
              <div className="p-3.5 bg-[#1B3A5C] rounded-2xl text-center">
                <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block mb-1">Nomor Resi Klaim</span>
                <span className="font-mono font-black text-lg text-white block">{successModal.claim.code}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                {[
                  { label: 'Menu', value: successModal.claim.foodName },
                  { label: 'Penyedia', value: successModal.claim.providerName },
                  { label: 'Status', value: successModal.claim.status === 'WAITING_PAYMENT_APPROVAL' ? 'Menunggu Verifikasi Bayar' : 'Menunggu Verifikasi Donasi' },
                  { label: 'Metode', value: successModal.claim.methodLabel },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-500">{row.label}:</span>
                    <strong className="text-slate-800 text-right max-w-[200px] truncate">{row.value}</strong>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5">
                <Button variant="outline" size="sm" className="flex-1 font-bold text-xs cursor-pointer" onClick={() => setSuccessModal({ isOpen: false, claim: null })}>Tutup</Button>
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<TicketIcon size={12} className="text-slate-950" />}
                  className="flex-1 font-black text-xs text-slate-950 cursor-pointer"
                  onClick={() => {
                    setSuccessModal({ isOpen: false, claim: null });
                    router.push(isBeneficiaryRole ? '/dashboard/yayasan/claims' : '/dashboard/consumer/my-claims');
                  }}
                >
                  Lihat Klaim Saya
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}
