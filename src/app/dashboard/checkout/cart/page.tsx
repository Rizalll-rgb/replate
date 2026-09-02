'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

export default function CheckoutCartPage() {
  const router = useRouter();
  
  const [items, setItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'SELF_PICKUP' | 'COURIER_DELIVERY'>('SELF_PICKUP');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [address, setAddress] = useState('RT 02 RW 03 Dusun 02 Blok Cibogo Kidul Desa Panonganlor Kecamatan Sedong Kabupaten Cirebon 45189 KAB. CIREBON - SEDONG, JAWA BARAT, ID 45189');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
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

  const handleCheckout = () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);

    setTimeout(() => {
      try {
        const totalAmount = subtotal + deliveryFee;
        const isFree = subtotal === 0;
        
        const resiCode = isFree
          ? `CLM-YYS-2026-${Math.floor(1000 + Math.random() * 9000)}`
          : `CLM-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const newClaimStatus = (totalAmount === 0 || isFree) ? 'AWAITING_VERIFICATION' : 'AWAITING_PAYMENT';

        const newClaim = {
          id: resiCode,
          code: resiCode,
          foodName: items.map(i => `${i.foodName || i.title} (${i.quantity}x)`).join(', '),
          providerName: items[0]?.providerName || 'Mitra Replate',
          provider: items[0]?.providerName || 'Mitra Replate',
          totalAmount,
          quantity: `${items.reduce((acc, i) => acc + i.quantity, 0)} Porsi`,
          deliveryMethod,
          method: deliveryMethod,
          methodLabel: deliveryMethod === 'SELF_PICKUP' ? 'Ambil Sendiri (Self-Pickup)' : 'Diantar Kurir Relawan',
          paymentMethod,
          address,
          status: newClaimStatus,
          paymentProof: null,
          createdAt: new Date().toISOString(),
          claimedAt: 'Hari ini',
          pickupTime: items[0]?.pickupTime || 'Hari ini 21:00 WIB',
          items: items
        };
        
        const existingClaims = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
        localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingClaims]));

        // Also sync to replate_claims for yayasan view
        const existingYysClaims = JSON.parse(localStorage.getItem('replate_claims') || '[]');
        localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingYysClaims]));
        
        // Clear pending checkout
        localStorage.removeItem('replate_checkout_pending');
        
        // Remove these items from cart
        const currentCart = JSON.parse(localStorage.getItem('replate_cart') || '[]');
        const pendingIds = new Set(items.map(i => i.id));
        const remainingCart = currentCart.filter((c: any) => !pendingIds.has(c.id));
        localStorage.setItem('replate_cart', JSON.stringify(remainingCart));
        localStorage.setItem('replate_tas_klaim', JSON.stringify(remainingCart));
        
        // Check user role
        let isBeneficiaryRole = false;
        try {
          const profile = localStorage.getItem('replate_onboarding_profile');
          if (profile) {
            const parsed = JSON.parse(profile);
            const r = String(parsed.role || '').toUpperCase();
            if (r.includes('BENEFICIARY') || r.includes('YAYASAN')) isBeneficiaryRole = true;
          }
        } catch (_) {}

        if (isBeneficiaryRole) {
          router.push('/dashboard/yayasan/claims');
        } else {
          router.push('/dashboard/consumer/my-claims');
        }
      } catch (err) {
        setToastState({
          isOpen: true,
          message: 'Gagal memproses pesanan.',
          type: 'error',
        });
        setIsCheckingOut(false);
      }
    }, 1200);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="animate-spin w-8 h-8 text-[#1B3A5C]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  const subtotal = items.reduce((acc, curr) => acc + (curr.isFree ? 0 : curr.price * curr.quantity), 0);
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const deliveryFee = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : 0;
  const totalAmount = subtotal + deliveryFee;

  return (
    <>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-[#1B3A5C]">Checkout</h1>
        <p className="text-sm text-slate-500 font-medium">
          Selesaikan pesanan dari tas klaim Anda.
        </p>
      </div>

      <Toast 
        isOpen={toastState.isOpen} 
        message={toastState.message} 
        type={toastState.type} 
        onClose={() => setToastState(prev => ({ ...prev, isOpen: false }))} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-t-[3px] border-t-emerald-500 rounded-b-3xl border-x border-b border-slate-200 p-5 space-y-4 shadow-sm text-sm">
            <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider flex items-center gap-2">
              📍 Alamat Pengiriman
            </h4>
            <div className="flex items-start justify-between cursor-pointer group" onClick={() => {
              setTempAddress(address);
              setIsAddressModalOpen(true);
            }}>
              <div>
                <p className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors">
                  Muhamad Nursidik | (+62) 838-2396-2754
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm line-clamp-2 leading-relaxed">
                  {address}
                </p>
              </div>
              <span className="text-slate-400 mt-2 group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>

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
                      <div className="absolute top-0 left-0 w-full py-0.5 bg-emerald-500 text-white text-[8px] text-center font-black uppercase tracking-wider">
                        Gratis
                      </div>
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
          
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm text-sm">
            <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider">Opsi Pengiriman</h4>
            
            <div 
              className="flex items-center justify-between cursor-pointer border-b border-slate-100 pb-3 group"
              onClick={() => setIsDeliveryModalOpen(true)}
            >
              <div>
                <div className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors flex items-center gap-1.5">
                  <span>{deliveryMethod === 'SELF_PICKUP' ? 'Ambil Mandiri (Self-Pickup)' : 'Diantar Kurir Relawan Replate'}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {deliveryMethod === 'SELF_PICKUP' 
                    ? 'Bebas ongkir (Rp 0). Ambil langsung di gerai penyedia makanan.' 
                    : 'Pengantaran aman oleh armada relawan logistik Replate. (+Rp 5.000)'}
                </div>
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-2 inline-block">
                  {deliveryMethod === 'SELF_PICKUP'
                    ? `Jadwal Pengambilan di Toko: ${items[0]?.pickupTime || 'Hari ini 20:30 WIB'}`
                    : `Estimasi Pengantaran Tiba di Lokasi: ${items[0]?.pickupTime || 'Hari ini 20:30 WIB'}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">
                  {deliveryMethod === 'SELF_PICKUP' ? 'Rp 0' : 'Rp 5.000'}
                </span>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </div>
            
            <div className="pt-2 flex items-center justify-between">
              <div className="text-slate-500 font-medium text-xs">Pesan:</div>
              <div className="text-slate-400 text-xs italic">Silakan tinggalkan pesan...</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm text-sm">
            <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider">Metode Pembayaran</h4>
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  $
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors">
                    {paymentMethod === 'QRIS' ? 'QRIS' : `Transfer Bank ${paymentMethod}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {paymentMethod === 'QRIS' ? 'Scan dari aplikasi apa saja' : 'Virtual Account otomatis dicek'}
                  </div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>
        </div>
        
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
                <span className="text-2xl font-black text-[#1B3A5C]">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            
            <Button 
              variant="gold" 
              className="w-full font-black py-3 text-sm shadow-md text-slate-950"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Memproses...' : 'Buat Pesanan ➔'}
            </Button>
          </div>
        </div>
      </div>
      
      <Modal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)}>
        <div className="p-2 space-y-4">
          <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-3">Pilih Opsi Pengiriman</h3>
          
          <div className="space-y-3">
            <label
              className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                deliveryMethod === 'SELF_PICKUP'
                  ? 'bg-amber-50/50 border-[#D4A843] shadow-sm'
                  : 'bg-white border-slate-200 hover:border-amber-200'
              }`}
            >
              <input
                type="radio"
                name="deliveryMethodModal"
                checked={deliveryMethod === 'SELF_PICKUP'}
                onChange={() => {
                  setDeliveryMethod('SELF_PICKUP');
                  setIsDeliveryModalOpen(false);
                }}
                className="mt-0.5 w-4 h-4 text-[#1B3A5C]"
              />
              <div className="space-y-1 w-full">
                <div className="flex justify-between w-full">
                  <span className="font-extrabold text-slate-900 text-sm">🏬 Ambil Mandiri (Self-Pickup)</span>
                  <span className="font-bold text-slate-900 text-sm">Rp 0</span>
                </div>
                <p className="text-xs text-slate-500">
                  Bebas ongkir. Anda harus mengambil pesanan secara mandiri di gerai mitra.
                </p>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                deliveryMethod === 'COURIER_DELIVERY'
                  ? 'bg-amber-50/50 border-[#D4A843] shadow-sm'
                  : 'bg-white border-slate-200 hover:border-amber-200'
              }`}
            >
              <input
                type="radio"
                name="deliveryMethodModal"
                checked={deliveryMethod === 'COURIER_DELIVERY'}
                onChange={() => {
                  setDeliveryMethod('COURIER_DELIVERY');
                  setIsDeliveryModalOpen(false);
                }}
                className="mt-0.5 w-4 h-4 text-[#1B3A5C]"
              />
              <div className="space-y-1 w-full">
                <div className="flex justify-between w-full">
                  <span className="font-extrabold text-slate-900 text-sm">🛵 Diantar Kurir</span>
                  <span className="font-bold text-slate-900 text-sm">Rp 5.000</span>
                </div>
                <p className="text-xs text-slate-500">
                  Pesanan akan diantarkan oleh kurir komunitas relawan Replate.
                </p>
              </div>
            </label>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <div className="p-2 space-y-4">
          <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-3">Pilih Metode Pembayaran</h3>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {['QRIS', 'BCA', 'MANDIRI', 'BNI', 'BRI'].map((method) => (
              <label
                key={method}
                className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
                  paymentMethod === method
                    ? 'bg-amber-50/50 border-[#D4A843] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-amber-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethodModal"
                  checked={paymentMethod === method}
                  onChange={() => {
                    setPaymentMethod(method);
                    setIsPaymentModalOpen(false);
                  }}
                  className="w-4 h-4 text-[#1B3A5C]"
                />
                <div className="flex-1">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {method === 'QRIS' ? 'QRIS (Semua E-Wallet & Bank)' : `Transfer Bank ${method}`}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {method === 'QRIS' ? 'Otomatis dicek. Gratis biaya admin.' : 'Virtual Account. Dicek otomatis.'}
                  </p>
                </div>
                {method === 'QRIS' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    $
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)}>
        <div className="p-2 space-y-4">
          <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-3">Ubah Alamat Pengiriman</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
              <textarea 
                className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-emerald-500 focus:ring-0 outline-none transition-colors resize-none"
                rows={4}
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap pengiriman..."
              ></textarea>
            </div>
            
            <Button 
              variant="primary" 
              className="w-full font-black py-3 text-sm shadow-md text-slate-950"
              onClick={() => {
                setAddress(tempAddress);
                setIsAddressModalOpen(false);
              }}
            >
              Simpan Alamat
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
}
