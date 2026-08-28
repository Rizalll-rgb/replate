'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItem {
  id: string;
  foodName?: string;
  name?: string; // support for both formats
  providerName?: string;
  provider?: string;
  price: number;
  originalPrice: number;
  quantity: number;
  maxQuantity?: number;
  imageUrl?: string;
  pickupTime?: string;
  isFree?: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // E-commerce selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Delivery Method & Modals (Ported from public cart)
  const [deliveryMethod, setDeliveryMethod] = useState<'SELF_PICKUP' | 'COURIER_DELIVERY'>('SELF_PICKUP');
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'QRIS' | 'UPLOAD'>('QRIS');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<{
    resiCode: string;
    foodName: string;
    provider: string;
    totalAmount: number;
    method: string;
    time: string;
    status: string;
  } | null>(null);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    try {
      // Check both keys to merge carts if needed or fallback
      const tasKlaim = localStorage.getItem('replate_tas_klaim');
      const cart = localStorage.getItem('replate_cart');
      
      let items: CartItem[] = [];
      if (tasKlaim) {
        items = JSON.parse(tasKlaim);
      } else if (cart) {
        items = JSON.parse(cart);
      }
      
      // Normalize data
      const normalizedItems = items.map((item: any) => ({
        ...item,
        id: String(item.id),
        foodName: item.foodName || item.name || 'Produk Tanpa Nama',
        providerName: item.providerName || item.provider || 'Mitra Replate',
        maxQuantity: item.maxQuantity || 10,
        isFree: item.isFree !== undefined ? item.isFree : (item.price === 0),
        originalPrice: item.originalPrice || (item.price * 2)
      }));

      setCartItems(normalizedItems);
      // Select all by default
      setSelectedIds(new Set(normalizedItems.map((i: any) => i.id)));
    } catch (e) {
      console.error('Failed to load cart', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && cartItems.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('checkout') === 'true') {
        window.history.replaceState({}, '', '/dashboard/cart');
        handleStartCheckout();
      }
    }
  }, [isLoaded, cartItems]);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('replate_tas_klaim', JSON.stringify(items));
    localStorage.setItem('replate_cart', JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= (item.maxQuantity || 10)) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
    
    // Also remove from selection
    const newSelected = new Set(selectedIds);
    newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  // Selection Logic
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cartItems.length) {
      setSelectedIds(new Set()); // deselect all
    } else {
      setSelectedIds(new Set(cartItems.map(i => i.id))); // select all
    }
  };

  const toggleProviderSelection = (providerName: string) => {
    const providerItems = cartItems.filter(i => i.providerName === providerName);
    const allSelected = providerItems.every(i => selectedIds.has(i.id));
    
    const newSelected = new Set(selectedIds);
    if (allSelected) {
      providerItems.forEach(i => newSelected.delete(i.id));
    } else {
      providerItems.forEach(i => newSelected.add(i.id));
    }
    setSelectedIds(newSelected);
  };

  // Group items by provider
  const groupedItems = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};
    cartItems.forEach(item => {
      const provider = item.providerName || 'Lainnya';
      if (!groups[provider]) groups[provider] = [];
      groups[provider].push(item);
    });
    return groups;
  }, [cartItems]);

  const selectedCartItems = cartItems.filter(item => selectedIds.has(item.id));
  const subtotal = selectedCartItems.reduce((acc, item) => acc + (item.isFree ? 0 : item.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : 0;
  const totalAmount = subtotal + deliveryFee;
  const totalHemat = selectedCartItems.reduce((acc, item) => acc + (item.originalPrice - (item.isFree ? 0 : item.price)) * item.quantity, 0);
  const totalItems = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleStartCheckout = () => {
    if (selectedCartItems.length === 0) return;

    if (totalAmount > 0) {
      setPaymentStep('QRIS');
      setPaymentProof(null);
      setIsQrisModalOpen(true);
    } else {
      executeCompleteClaim();
    }
  };

  const executeCompleteClaim = () => {
    setIsCheckingOut(true);
    setIsQrisModalOpen(false);

    setTimeout(() => {
      try {
        const isFree = subtotal === 0;
        const resiCode = isFree
          ? `CLM-YYS-2026-${Math.floor(1000 + Math.random() * 9000)}`
          : `CLM-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const newClaimStatus = isFree 
          ? (deliveryMethod === 'SELF_PICKUP' ? 'READY_FOR_PICKUP' : 'COURIER_ON_THE_WAY')
          : 'WAITING_PAYMENT_APPROVAL';

        const newClaim = {
          id: resiCode,
          foodName: selectedCartItems.map((i: any) => `${i.foodName} (${i.quantity}x)`).join(', '),
          providerName: selectedCartItems[0]?.providerName || 'Mitra Replate',
          totalAmount,
          deliveryMethod,
          status: newClaimStatus,
          paymentProof: isFree ? null : (paymentProof || 'https://via.placeholder.com/300x500?text=Bukti+Transfer'),
          createdAt: new Date().toISOString(),
          pickupTime: selectedCartItems[0]?.pickupTime || 'Hari ini 21:00 WIB',
          items: selectedCartItems
        };
        const existingClaims = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
        localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingClaims]));
        
        // Remove selected items from cart
        const remainingItems = cartItems.filter(item => !selectedIds.has(item.id));
        saveCart(remainingItems);
        setSelectedIds(new Set());
        
        setSuccessReceipt({
          resiCode,
          foodName: newClaim.foodName,
          provider: newClaim.providerName,
          totalAmount,
          method: deliveryMethod === 'SELF_PICKUP' ? 'Ambil Mandiri (Self-Pickup)' : 'Diantar Kurir Komunitas Replate',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          status: newClaimStatus,
        });
        
      } catch (_) {}

      setIsCheckingOut(false);
    }, 1500);
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {successReceipt ? (
        /* Receipt Success Card Screen */
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-center py-6">
          <div className="bg-[#1B3A5C] text-white p-8 sm:p-10 rounded-3xl border-2 border-[#2C5A8F] shadow-2xl space-y-6 text-left">
            <div className="text-center space-y-2 border-b border-[#2C5A8F] pb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl border-2 ${
                successReceipt.status === 'WAITING_PAYMENT_APPROVAL' 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                  : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              }`}>
                {successReceipt.status === 'WAITING_PAYMENT_APPROVAL' ? '⏳' : '✓'}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest block ${
                successReceipt.status === 'WAITING_PAYMENT_APPROVAL' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {successReceipt.status === 'WAITING_PAYMENT_APPROVAL' 
                  ? 'MENUNGGU PERSETUJUAN TOKO' 
                  : 'KLAIM MAKANAN SURPLUS BERHASIL'}
              </span>
              <h2 className="text-2xl font-black text-white">Resi Transaksi Resmi Replate</h2>
              <p className="text-xs text-slate-300 font-medium">
                {successReceipt.status === 'WAITING_PAYMENT_APPROVAL'
                  ? 'Pembayaran sedang diverifikasi oleh penyedia makanan. Harap cek secara berkala.'
                  : 'Pesanan telah diverifikasi oleh sistem. Tunjukkan QR Barcode ini saat penjemputan.'}
              </p>
            </div>

            {/* QR Barcode Box - Conditionally Hidden if Waiting */}
            {successReceipt.status !== 'WAITING_PAYMENT_APPROVAL' && (
              <div className="p-6 bg-white text-slate-900 rounded-2xl text-center space-y-3 shadow-inner">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  KODE RESI KLAIM SURPLUS RESMI
                </span>
                <h3 className="font-mono text-2xl font-black text-[#1B3A5C] tracking-wider">
                  {successReceipt.resiCode}
                </h3>
                {/* Simulated Barcode Lines */}
                <div className="flex justify-center items-center gap-1 h-12 py-1 max-w-xs mx-auto">
                  <div className="w-1.5 h-full bg-slate-900"></div>
                  <div className="w-1 h-full bg-slate-900"></div>
                  <div className="w-3 h-full bg-slate-900"></div>
                  <div className="w-1.5 h-full bg-slate-900"></div>
                  <div className="w-2 h-full bg-slate-900"></div>
                  <div className="w-1 h-full bg-slate-900"></div>
                  <div className="w-3 h-full bg-slate-900"></div>
                  <div className="w-1.5 h-full bg-slate-900"></div>
                  <div className="w-2 h-full bg-slate-900"></div>
                  <div className="w-1 h-full bg-slate-900"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold block">
                  SOP Validasi Higienitas 8-Poin BPOM RI
                </span>
              </div>
            )}

            {/* Details Summary */}
            <div className="p-4 bg-[#142C47] rounded-xl border border-slate-700 space-y-2 text-xs font-bold">
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-300">Item Makanan:</span>
                <span className="text-white text-right max-w-xs truncate">{successReceipt.foodName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-300">Penyedia / Outlet:</span>
                <span className="text-amber-300">{successReceipt.provider}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-300">Metode Pengambilan:</span>
                <span className="text-emerald-300">{successReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Biaya:</span>
                <span className="text-[#D4A843] font-black text-sm">
                  {successReceipt.totalAmount === 0 ? 'GRATIS (Rp 0)' : `Rp ${successReceipt.totalAmount.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>

            {/* Direct Actions */}
            <div className="space-y-3 pt-2">
              <Link href={`/dashboard/tracking?resi=${successReceipt.resiCode}`}>
                <button
                  type="button"
                  className="w-full py-3.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📍 Lacak Pesanan Live Tracking ➔</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-black text-[#1B3A5C]">Tas Klaim & Keranjang</h1>
            <p className="text-sm text-slate-500 font-medium">
              Tinjau kembali pilihan donasi pangan dan pesanan surplus Anda sebelum melakukan konfirmasi.
            </p>
          </div>

          <Toast 
            isOpen={toastState.isOpen} 
            message={toastState.message} 
            type={toastState.type} 
            onClose={() => setToastState(prev => ({ ...prev, isOpen: false }))} 
          />

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Tas Klaim Anda Kosong</h3>
              <p className="text-slate-500 mb-6">Belum ada makanan surplus yang Anda pilih untuk diselamatkan.</p>
              <Link href="/dashboard/explore">
                <Button variant="primary" className="px-8 font-bold">
                  Mulai Eksplor Pangan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List - E-Commerce Style */}
              <div className="lg:col-span-2 space-y-6">
                {/* Select All Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C]"
                      checked={cartItems.length > 0 && selectedIds.size === cartItems.length}
                      onChange={toggleSelectAll}
                    />
                    <span className="font-bold text-slate-700">Pilih Semua ({cartItems.length})</span>
                  </label>
                  {selectedIds.size > 0 && (
                    <button 
                      onClick={() => {
                        const remainingItems = cartItems.filter(item => !selectedIds.has(item.id));
                        saveCart(remainingItems);
                        setSelectedIds(new Set());
                      }}
                      className="text-red-500 hover:text-red-600 font-bold text-sm transition-colors"
                    >
                      Hapus Terpilih
                    </button>
                  )}
                </div>

                {/* Grouped Items by Provider */}
                {Object.entries(groupedItems).map(([providerName, items]) => {
                  const allSelectedInGroup = items.every(i => selectedIds.has(i.id));
                  
                  return (
                    <div key={providerName} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Provider Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C]"
                            checked={allSelectedInGroup}
                            onChange={() => toggleProviderSelection(providerName)}
                          />
                          <span className="font-black text-slate-800 flex items-center gap-2">
                            🏪 {providerName}
                          </span>
                        </label>
                      </div>
                      
                      {/* Items */}
                      <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <div key={item.id} className="p-4 flex gap-4 transition-colors hover:bg-slate-50/50">
                            {/* Checkbox */}
                            <div className="pt-2">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C] cursor-pointer"
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleSelection(item.id)}
                              />
                            </div>
                            
                            {/* Image */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 relative rounded-xl overflow-hidden shrink-0 border border-slate-200">
                              <Image src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.foodName || ''} fill className="object-cover" />
                              {item.isFree && (
                                <div className="absolute top-0 left-0 w-full py-0.5 bg-emerald-500 text-white text-[9px] text-center font-black uppercase tracking-wider">
                                  Gratis
                                </div>
                              )}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">{item.foodName}</h3>
                                </div>
                                <p className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1 bg-amber-50 inline-block px-2 py-0.5 rounded-md">
                                  ⏰ Ambil: {item.pickupTime}
                                </p>
                              </div>
                              
                              <div className="flex items-end justify-between mt-3">
                                <div>
                                  {!item.isFree ? (
                                    <>
                                      <div className="text-[10px] text-slate-400 line-through">Rp {item.originalPrice.toLocaleString('id-ID')}</div>
                                      <div className="text-base font-black text-[#1B3A5C]">Rp {item.price.toLocaleString('id-ID')}</div>
                                    </>
                                  ) : (
                                    <div className="text-base font-black text-emerald-600">Rp 0</div>
                                  )}
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200">
                                  <button 
                                    onClick={() => updateQuantity(item.id, -1)}
                                    disabled={item.quantity <= 1}
                                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="font-bold text-xs w-6 text-center text-[#1B3A5C]">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    disabled={item.quantity >= (item.maxQuantity || 10)}
                                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Checkout Sidebar Summary */}
              <div className="lg:col-span-1 space-y-4">
                {/* Delivery Method Selection */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm text-xs sticky top-24">
                  <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider">
                    Metode Pengambilan
                  </h4>

                  <div className="space-y-2">
                    <label
                      className={`p-3 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                        deliveryMethod === 'SELF_PICKUP'
                          ? 'bg-amber-50/50 border-[#D4A843] shadow-sm'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === 'SELF_PICKUP'}
                        onChange={() => setDeliveryMethod('SELF_PICKUP')}
                        className="mt-0.5 w-4 h-4 text-[#1B3A5C]"
                      />
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-900 block">🏬 Ambil Mandiri (Self-Pickup)</span>
                        <p className="text-[10px] text-slate-500">
                          Bebas ongkir (Rp 0). Ambil di gerai.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                        deliveryMethod === 'COURIER_DELIVERY'
                          ? 'bg-amber-50/50 border-[#D4A843] shadow-sm'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === 'COURIER_DELIVERY'}
                        onChange={() => setDeliveryMethod('COURIER_DELIVERY')}
                        className="mt-0.5 w-4 h-4 text-[#1B3A5C]"
                      />
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-900 block">🛵 Diantar Kurir (+Rp 5.000)</span>
                        <p className="text-[10px] text-slate-500">
                          Oleh armada relawan Replate.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Ringkasan Belanja */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-72">
                  <h3 className="text-lg font-black text-slate-800 mb-6">Ringkasan Pesanan</h3>
                  
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Item Terpilih</span>
                      <span className="font-bold text-slate-800">{totalItems} Porsi</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Harga (Asli)</span>
                      <span className="font-bold text-slate-800">Rp {(subtotal + totalHemat).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Total Diskon</span>
                      <span>- Rp {totalHemat.toLocaleString('id-ID')}</span>
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
                        {totalAmount === 0 && selectedCartItems.length > 0 ? 'Rp 0' : `Rp ${totalAmount.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    className="w-full font-black py-3 text-sm shadow-xl shadow-primary/20"
                    onClick={handleStartCheckout}
                    disabled={isCheckingOut || selectedCartItems.length === 0}
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Memproses...
                      </span>
                    ) : (
                      `Beli (${totalItems}) ➔`
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isQrisModalOpen}
        onClose={() => setIsQrisModalOpen(false)}
        title={paymentStep === 'QRIS' ? "Pembayaran QRIS Standar Replate" : "Upload Bukti Pembayaran"}
        size="md"
      >
        <div className="space-y-4 text-center text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="font-bold text-slate-500 block">Total Pembayaran:</span>
            <span className="text-2xl font-black text-[#1B3A5C] block">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">
              ✓ Termasuk PPN 0% & Jaminan Higienitas Replate
            </span>
          </div>

          {paymentStep === 'QRIS' ? (
            <>
              <div className="p-4 bg-white border-2 border-slate-300 rounded-2xl shadow-inner max-w-xs mx-auto space-y-2">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60"
                  alt="QRIS Code"
                  className="w-48 h-48 mx-auto object-cover rounded-xl border border-slate-200"
                />
                <span className="font-mono text-[11px] font-black text-slate-800 block">
                  NMID: ID102026891230491
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Scan QRIS menggunakan BCA Mobile, GoPay, OVO, ShopeePay, atau Livin Mandiri Anda.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setIsQrisModalOpen(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="sm" onClick={() => setPaymentStep('UPLOAD')} className="font-black">
                  Lanjut Upload Bukti ➔
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl max-w-xs mx-auto bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setPaymentProof('https://via.placeholder.com/300x500?text=Bukti+Transfer')}>
                {paymentProof ? (
                  <div className="space-y-2">
                    <div className="w-full h-32 bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                       <img src={paymentProof} alt="Bukti Transfer" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-emerald-600 font-bold block">✓ File Berhasil Dipilih</span>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <span className="font-bold text-slate-600 block">Klik untuk pilih gambar bukti (Simulasi)</span>
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-[11px]">
                Unggah *screenshot* bukti transfer atau struk QRIS yang sah.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setPaymentStep('QRIS')}>
                  Kembali
                </Button>
                <Button variant="gold" size="sm" onClick={executeCompleteClaim} disabled={!paymentProof} className="font-black text-slate-950">
                  Kirim & Selesaikan ➔
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
