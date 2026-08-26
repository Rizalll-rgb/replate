'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItem {
  id: string;
  foodName: string;
  providerName: string;
  price: number;
  originalPrice: number;
  quantity: number;
  maxQuantity: number;
  imageUrl: string;
  pickupTime: string;
  isFree: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('replate_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
    setIsLoaded(true);
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('replate_cart', JSON.stringify(items));
    // Also dispatch event for navbar counter if needed
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= item.maxQuantity) {
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
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate network request
    setTimeout(() => {
      // Empty the cart
      localStorage.removeItem('replate_cart');
      setCartItems([]);
      window.dispatchEvent(new Event('storage'));
      
      setToastState({
        isOpen: true,
        message: 'Klaim berhasil diproses! Silakan periksa menu Klaim Aktif Anda.',
        type: 'success',
      });
      setIsCheckingOut(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/consumer/my-claims');
      }, 2000);
    }, 1500);
  };

  if (!isLoaded) return null;

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalHarga = cartItems.reduce((acc, item) => acc + (item.isFree ? 0 : item.price * item.quantity), 0);
  const totalHemat = cartItems.reduce((acc, item) => acc + (item.originalPrice - (item.isFree ? 0 : item.price)) * item.quantity, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
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
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 relative">
                {/* Image */}
                <div className="w-full sm:w-32 h-32 relative rounded-xl overflow-hidden shrink-0">
                  <Image src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.foodName} fill className="object-cover" />
                  {item.isFree && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                      Gratis Rp 0
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-800">{item.foodName}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Hapus Item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" /></svg>
                      {item.providerName}
                    </p>
                    <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Ambil: {item.pickupTime}
                    </p>
                  </div>
                  
                  <div className="flex items-end justify-between mt-4 sm:mt-0">
                    <div>
                      {!item.isFree ? (
                        <>
                          <div className="text-xs text-slate-400 line-through">Rp {item.originalPrice.toLocaleString('id-ID')}</div>
                          <div className="text-lg font-black text-emerald-600">Rp {item.price.toLocaleString('id-ID')}</div>
                        </>
                      ) : (
                        <div className="text-lg font-black text-emerald-600">Rp 0</div>
                      )}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-200">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-primary hover:border-primary disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-primary hover:border-primary disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h3 className="text-lg font-black text-slate-800 mb-6">Ringkasan Pesanan</h3>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Total Kuantitas</span>
                  <span className="font-bold text-slate-800">{totalItems} Porsi</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Harga</span>
                  <span className="font-bold text-slate-800">Rp {(totalHarga + totalHemat).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Total Hemat / Diskon</span>
                  <span>- Rp {totalHemat.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Pembayaran</span>
                  <span className="text-2xl font-black text-[#1B3A5C]">Rp {totalHarga.toLocaleString('id-ID')}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-right">
                  *Pembayaran dilakukan langsung di lokasi (COD)
                </p>
              </div>
              
              <Button 
                variant="primary" 
                className="w-full font-black py-3 text-sm shadow-xl shadow-primary/20"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses...
                  </span>
                ) : (
                  'Konfirmasi Klaim Sekarang ➔'
                )}
              </Button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span>Sistem Matching Cerdas Aktif</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
