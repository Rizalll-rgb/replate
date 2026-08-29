'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface FoodItem {
  id: string;
  title: string;
  foodName?: string;
  providerName: string;
  price: number;
  discountPrice?: number;
  originalPrice: number;
  quantity: string;
  pickupTime: string;
  category: string;
  isFree: boolean;
  imageUrl: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const itemId = params?.id as string;
  const [item, setItem] = useState<FoodItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'SELF_PICKUP' | 'COURIER_DELIVERY'>('SELF_PICKUP');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    // Fetch item details
    fetch('/api/surplus')
      .then((res) => res.json())
      .then((data) => {
        let items: any[] = [];
        if (data.success && Array.isArray(data.data?.items)) {
          items = data.data.items;
        } else if (data.success && Array.isArray(data.data)) {
          items = data.data;
        }

        const found = items.find((i: any) => i.id === itemId);
        
        if (found) {
          setItem({
            id: found.id,
            title: found.foodName || found.title || 'Makanan Surplus',
            foodName: found.foodName || found.title,
            providerName: found.provider?.organizationName || found.providerName || 'Mitra Replate',
            originalPrice: found.originalPrice || 25000,
            price: found.discountPrice || found.price || 0,
            quantity: `${found.quantity || 10} Porsi`,
            pickupTime: found.pickupTime || 'Hari ini 19:00 - 21:00 WIB',
            category: found.category || 'MAKANAN_BERAT',
            isFree: found.distributionType === 'FREE' || found.price === 0 || found.discountPrice === 0,
            imageUrl: found.imageUrl || found.photos?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
          });
        } else {
          // Check cart/local storage as fallback just in case it was a mock
          const cart = JSON.parse(localStorage.getItem('replate_cart') || '[]');
          const cartItem = cart.find((c: any) => c.id === itemId);
          if (cartItem) {
            setItem({
              id: cartItem.id,
              title: cartItem.foodName || 'Makanan Surplus',
              providerName: cartItem.providerName || 'Mitra Replate',
              originalPrice: cartItem.originalPrice || 25000,
              price: cartItem.price || 0,
              quantity: `Porsi`,
              pickupTime: cartItem.pickupTime || 'Hari ini 19:00 WIB',
              category: 'MAKANAN_BERAT',
              isFree: cartItem.isFree || false,
              imageUrl: cartItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
            });
          }
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, [itemId]);

  const handleCheckout = () => {
    if (!item) return;
    setIsCheckingOut(true);

    setTimeout(() => {
      try {
        const isFree = item.isFree;
        const totalAmount = isFree ? 0 : (item.price * quantity) + (deliveryMethod === 'COURIER_DELIVERY' ? 5000 : 0);
        
        const resiCode = isFree
          ? `CLM-YYS-2026-${Math.floor(1000 + Math.random() * 9000)}`
          : `CLM-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const newClaimStatus = 'AWAITING_PAYMENT';

        const newClaim = {
          id: resiCode,
          foodName: `${item.title} (${quantity}x)`,
          providerName: item.providerName,
          totalAmount,
          deliveryMethod,
          status: newClaimStatus,
          paymentProof: null,
          createdAt: new Date().toISOString(),
          pickupTime: item.pickupTime,
          items: [{ ...item, quantity }]
        };
        
        const existingClaims = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
        localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingClaims]));
        
        // Navigate directly to my-claims where they upload proof
        router.push('/dashboard/consumer/my-claims');
      } catch (err) {
        setToastState({
          isOpen: true,
          message: 'Gagal memproses pesanan.',
          type: 'error',
        });
        setIsCheckingOut(false);
      }
    }, 1000);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="animate-spin w-8 h-8 text-[#1B3A5C]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-800">Item tidak ditemukan</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const subtotal = item.isFree ? 0 : item.price * quantity;
  const deliveryFee = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : 0;
  const totalAmount = subtotal + deliveryFee;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-[#1B3A5C]">Checkout Beli Langsung</h1>
        <p className="text-sm text-slate-500 font-medium">
          Selesaikan pesanan Anda secara langsung.
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <span className="font-black text-slate-800">🏪 {item.providerName}</span>
            </div>
            
            <div className="p-4 flex gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 relative rounded-xl overflow-hidden shrink-0 border border-slate-200">
                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} alt={item.title || 'Makanan'} className="w-full h-full object-cover" />
                {item.isFree && (
                  <div className="absolute top-0 left-0 w-full py-0.5 bg-emerald-500 text-white text-[9px] text-center font-black uppercase tracking-wider">
                    Gratis
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{item.title}</h3>
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
                  
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs w-6 text-center text-[#1B3A5C]">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm text-xs">
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
        </div>
        
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
            <h3 className="text-lg font-black text-slate-800 mb-6">Ringkasan Pesanan</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Total Item</span>
                <span className="font-bold text-slate-800">{quantity} Porsi</span>
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
              {isCheckingOut ? 'Memproses...' : 'Selesaikan & Lanjut Bayar ➔'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
