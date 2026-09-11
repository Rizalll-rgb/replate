'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { ClockIcon, MapPinIcon, CheckIcon, AlertTriangleIcon } from '@/components/ui/Icon';

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
  deliveryMethod?: string;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // E-commerce selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [isBeneficiary, setIsBeneficiary] = useState<boolean>(false);
  const [shelterName, setShelterName] = useState<string>('');

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        const r = String(parsed.role || '').toUpperCase();
        if (r.includes('BENEFICIARY') || r.includes('YAYASAN')) {
          setIsBeneficiary(true);
          if (parsed.entityName) setShelterName(parsed.entityName);
          if (parsed.capacity) {
            const digits = parseInt(parsed.capacity.replace(/\D/g, ''));
            if (!isNaN(digits) && digits > 0) {
              setMinCapacity(digits);
            }
          }
        }
      }
    } catch (_) {}
  }, []);

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
  const totalAmount = subtotal;
  const totalHemat = selectedCartItems.reduce((acc, item) => acc + (item.originalPrice - (item.isFree ? 0 : item.price)) * item.quantity, 0);
  const totalItems = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleStartCheckout = () => {
    if (selectedCartItems.length === 0) return;

    if (isBeneficiary && minCapacity > 0 && totalItems < minCapacity) {
      setToastState({
        isOpen: true,
        message: `Kapasitas panti Anda adalah ${minCapacity} jiwa. Jumlah porsi yang dipilih (${totalItems} porsi) belum memenuhi kuota minimum ${minCapacity} porsi. Mohon sesuaikan jumlah porsi agar mencukupi kebutuhan seluruh anak panti.`,
        type: 'error',
      });
      return;
    }

    setIsCheckingOut(true);
    setActionLoader({
      isOpen: true,
      message: 'Mempersiapkan Checkout...',
      submessage: 'Menyinkronkan item terpilih ke alur transaksi',
    });
    
    // Save selected items for the unified checkout page
    localStorage.setItem('replate_checkout_pending', JSON.stringify(selectedCartItems));
    
    setTimeout(() => {
      // Navigate to the checkout page
      router.push('/dashboard/checkout/cart');
    }, 800);
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 lg:pb-12">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl lg:text-2xl font-black text-[#1B3A5C]">Tas Klaim & Keranjang</h1>
        <p className="text-xs lg:text-sm text-slate-500 font-medium">
          Tinjau kembali pilihan donasi food rescue dan pesanan surplus Anda sebelum melakukan konfirmasi.
        </p>
      </div>

          <Toast 
            isOpen={toastState.isOpen} 
            message={toastState.message} 
            type={toastState.type} 
            onClose={() => setToastState(prev => ({ ...prev, isOpen: false }))} 
          />

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 lg:p-12 text-center shadow-sm border border-slate-200">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 text-slate-400">
                <svg className="w-10 h-10 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-2">Tas Klaim Anda Kosong</h3>
              <p className="text-slate-500 text-sm mb-6">Belum ada makanan surplus yang Anda pilih untuk diselamatkan.</p>
              <Link href="/dashboard/explore">
                <Button variant="primary" className="px-8 font-bold">
                  Mulai Eksplor Pangan
                </Button>
              </Link>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 pb-36 lg:pb-0">
              {/* Cart Items List - E-Commerce Style */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Select All Bar - Hidden on mobile since sticky bar has it */}
                <div className="bg-white rounded-2xl p-3 lg:p-4 shadow-sm border border-slate-200 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 lg:gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-[18px] h-[18px] lg:w-5 lg:h-5 rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C] accent-[#1B3A5C]"
                      checked={cartItems.length > 0 && selectedIds.size === cartItems.length}
                      onChange={toggleSelectAll}
                    />
                    <span className="font-bold text-slate-700 text-sm lg:text-base">Pilih Semua ({cartItems.length})</span>
                  </label>
                  {selectedIds.size > 0 && (
                    <button 
                      onClick={() => {
                        const remainingItems = cartItems.filter(item => !selectedIds.has(item.id));
                        saveCart(remainingItems);
                        setSelectedIds(new Set());
                      }}
                      className="text-red-500 hover:text-red-600 font-bold text-xs lg:text-sm transition-colors"
                    >
                      Hapus Terpilih
                    </button>
                  )}
                </div>

                {/* Grouped Items by Provider */}
                {Object.entries(groupedItems).map(([providerName, items]) => {
                  const allSelectedInGroup = items.every(i => selectedIds.has(i.id));
                  
                  return (
                    <div key={providerName} className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Provider Header */}
                      <div className="p-3 lg:p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                        <label className="flex items-center gap-2.5 lg:gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-[18px] h-[18px] lg:w-5 lg:h-5 rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C] accent-[#1B3A5C]"
                            checked={allSelectedInGroup}
                            onChange={() => toggleProviderSelection(providerName)}
                          />
                          <span className="font-black text-slate-800 text-sm lg:text-base flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>{providerName}</span>
                          </span>
                        </label>
                      </div>
                      
                      {/* Items */}
                      <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <div key={item.id} className="p-3 lg:p-4 flex gap-3 lg:gap-4 transition-colors hover:bg-slate-50/50 card-interactive">
                            {/* Checkbox */}
                            <div className="pt-1 lg:pt-2">
                              <input 
                                type="checkbox" 
                                className="w-[18px] h-[18px] lg:w-5 lg:h-5 rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C] cursor-pointer accent-[#1B3A5C]"
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleSelection(item.id)}
                              />
                            </div>
                            
                            {/* Image - Mobile 80x80 */}
                            <div className="w-20 h-20 lg:w-28 lg:h-28 relative rounded-xl overflow-hidden shrink-0 border border-slate-200">
                              <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.foodName || ''} className="w-full h-full object-cover" />
                              {item.isFree && (
                                <div className="absolute top-0 left-0 w-full py-0.5 bg-emerald-500 text-white text-[8px] lg:text-[9px] text-center font-black uppercase tracking-wider">
                                  Gratis
                                </div>
                              )}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <h3 className="font-extrabold text-slate-800 text-[13px] lg:text-base leading-tight line-clamp-2">{item.foodName}</h3>
                                <p className="text-[10px] lg:text-[11px] text-amber-800 font-bold inline-flex items-center gap-1 mt-1 bg-amber-50 px-1.5 lg:px-2 py-0.5 rounded-md border border-amber-200">
                                  <ClockIcon size={10} className="text-amber-600 shrink-0" />
                                  <span className="truncate">
                                    {isBeneficiary ? (
                                      item.deliveryMethod === 'COURIER_DELIVERY' || item.deliveryMethod === 'RESCUE_PARTNER'
                                        ? `Diantar: ${item.pickupTime || 'Hari ini 20:30'}`
                                        : `Ambil: ${item.pickupTime || 'Hari ini 20:30'}`
                                    ) : (
                                      `Ambil: ${item.pickupTime || 'Hari ini 20:30 WIB'}`
                                    )}
                                  </span>
                                </p>
                              </div>
                              
                              <div className="flex items-end justify-between mt-2 lg:mt-3">
                                <div>
                                  {!item.isFree ? (
                                    <>
                                      <div className="text-[9px] lg:text-[10px] text-slate-400 line-through">Rp {item.originalPrice.toLocaleString('id-ID')}</div>
                                      <div className="text-sm lg:text-base font-black text-[#1B3A5C]">Rp {item.price.toLocaleString('id-ID')}</div>
                                    </>
                                  ) : (
                                    <div className="text-sm lg:text-base font-black text-emerald-600">Rp 0</div>
                                  )}
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-0.5 bg-white rounded-lg border border-slate-200">
                                  <button 
                                    onClick={() => updateQuantity(item.id, -1)}
                                    disabled={item.quantity <= 1}
                                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors rounded-l-lg"
                                  >
                                    -
                                  </button>
                                  <span className="font-bold text-xs w-6 text-center text-[#1B3A5C]">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    disabled={item.quantity >= (item.maxQuantity || 10)}
                                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors rounded-r-lg"
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
              
              {/* Checkout Sidebar Summary — Desktop Only */}
              <div className="hidden lg:block lg:col-span-1 space-y-4">

                {/* Ringkasan Belanja */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-72 space-y-5">
                  <h3 className="text-lg font-black text-slate-800">Ringkasan Pesanan</h3>

                  {/* Beneficiary Capacity Indicator */}
                  {isBeneficiary && minCapacity > 0 && (
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      totalItems >= minCapacity 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold uppercase text-[9.5px] tracking-wider text-slate-500">
                          Standar Kuota Panti
                        </span>
                        <span className={`px-2 py-0.5 rounded font-black text-[9.5px] flex items-center gap-1 ${
                          totalItems >= minCapacity ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {totalItems >= minCapacity ? (
                            <>
                              <CheckIcon size={10} />
                              <span>MEMENUHI KUOTA</span>
                            </>
                          ) : 'DI BAWAH MINIMAL'}
                        </span>
                      </div>
                      <p className="font-bold text-[#1B3A5C]">
                        Kapasitas Panti: {minCapacity} Jiwa
                      </p>
                      <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                        Total Porsi Terpilih: <strong>{totalItems}</strong> / Minimal <strong>{minCapacity}</strong> porsi.
                        {totalItems < minCapacity && (
                          <span className="text-amber-800 font-extrabold flex items-center gap-1 mt-1">
                            <AlertTriangleIcon size={12} className="text-amber-700 shrink-0" />
                            <span>Kurang {minCapacity - totalItems} porsi agar seluruh anak panti tercukupi.</span>
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3 text-sm">
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
                      <span className="font-bold text-slate-500 text-xs">Dihitung di checkout</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total Tagihan</span>
                      <span className="text-2xl font-black text-[#1B3A5C]">
                        {totalAmount === 0 && selectedCartItems.length > 0 ? 'Rp 0' : `Rp ${totalAmount.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    className="w-full font-black py-3 text-sm shadow-xl shadow-primary/20 cursor-pointer"
                    onClick={handleStartCheckout}
                    disabled={isCheckingOut || selectedCartItems.length === 0 || (isBeneficiary && minCapacity > 0 && totalItems < minCapacity)}
                  >
                    {isCheckingOut ? (
                      'Memproses...'
                    ) : isBeneficiary && minCapacity > 0 && totalItems < minCapacity ? (
                      `Minimal ${minCapacity} Porsi (Pilih +${minCapacity - totalItems})`
                    ) : (
                      'Lanjut ke Checkout'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* ====== MOBILE STICKY BOTTOM CHECKOUT BAR (Ala Shopee/Tokopedia) ====== */}
            <div className="lg:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb animate-fade-in-up">
              {/* Savings Badge */}
              {totalHemat > 0 && selectedCartItems.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[10px] font-black text-white tracking-wide">
                    Hemat Rp {totalHemat.toLocaleString('id-ID')} dari harga asli!
                  </span>
                </div>
              )}
              
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                {/* Left: Select All + Total */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="w-[18px] h-[18px] rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C] accent-[#1B3A5C]"
                      checked={cartItems.length > 0 && selectedIds.size === cartItems.length}
                      onChange={toggleSelectAll}
                    />
                    <span className="text-[10px] font-bold text-slate-500">Semua</span>
                  </label>
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-base font-black text-[#1B3A5C] leading-tight truncate">
                      {totalAmount === 0 && selectedCartItems.length > 0 ? 'Rp 0' : `Rp ${totalAmount.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
                
                {/* Right: Checkout Button */}
                <button
                  onClick={handleStartCheckout}
                  disabled={isCheckingOut || selectedCartItems.length === 0 || (isBeneficiary && minCapacity > 0 && totalItems < minCapacity)}
                  className="shrink-0 bg-gradient-to-r from-[#1B3A5C] to-[#2C5A8F] hover:from-[#142C47] hover:to-[#1B3A5C] text-white font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-[#1B3A5C]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      Proses...
                    </span>
                  ) : (
                    `Checkout (${selectedCartItems.length})`
                  )}
                </button>
              </div>
            </div>
            </>
          )}
    </div>
  );
}
