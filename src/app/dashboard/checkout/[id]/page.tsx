'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';
import { Modal } from '@/components/ui/Modal';
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
  const [deliveryMethod, setDeliveryMethod] = useState<'SELF_PICKUP' | 'COURIER_DELIVERY' | 'COMMUNITY_DELIVERY'>('SELF_PICKUP');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [quantity, setQuantity] = useState(1);
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
          // Check local storage for directly clicked items
          const tempCheckoutStr = localStorage.getItem('replate_checkout_item');
          let tempCheckoutItem = null;
          try { if (tempCheckoutStr) tempCheckoutItem = JSON.parse(tempCheckoutStr); } catch (e) {}

          if (tempCheckoutItem && tempCheckoutItem.id === itemId) {
            setItem({
              id: tempCheckoutItem.id,
              title: tempCheckoutItem.title || tempCheckoutItem.foodName || 'Makanan Surplus',
              providerName: tempCheckoutItem.providerName || 'Mitra Replate',
              originalPrice: tempCheckoutItem.originalPrice || 25000,
              price: tempCheckoutItem.discountPrice !== undefined ? tempCheckoutItem.discountPrice : (tempCheckoutItem.price || 0),
              quantity: tempCheckoutItem.quantity || '1 Porsi',
              pickupTime: tempCheckoutItem.pickupTime || 'Hari ini',
              category: tempCheckoutItem.category || 'MAKANAN_BERAT',
              isFree: tempCheckoutItem.isFree || false,
              imageUrl: tempCheckoutItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
            });
          } else {
            // Hardcoded mock fallback for explore pages
            const defaultFoods = [
              { id: 'FOD-001', title: 'Nasi Paket Ayam Bakar Madu', providerName: 'Warung Bakso Pak Kumis', originalPrice: 28000, discountPrice: 12000, quantity: '15 Porsi', pickupTime: '19:30 - 21:30 WIB', isFree: false, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60' },
              { id: 'FOD-002', title: 'Roti Croissant & Choco Pastry', providerName: 'Rotiboy Bakery Surabaya', originalPrice: 18000, discountPrice: 6000, quantity: '25 Porsi', pickupTime: '20:00 - 22:00 WIB', isFree: false, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60' },
              { id: 'FOD-003', title: 'Prasmanan Nasi Goreng & Ayam Goreng', providerName: 'Hotel Majapahit Surabaya', originalPrice: 45000, discountPrice: 0, quantity: '30 Porsi', pickupTime: '20:30 - 22:00 WIB', isFree: true, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60' },
              { id: 'FOD-004', title: 'Sop Buntut & Daging Kuah Steril', providerName: 'Dapur Katering Bu Rudy', originalPrice: 35000, discountPrice: 15000, quantity: '12 Porsi', pickupTime: '19:00 - 21:00 WIB', isFree: false, imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=500&auto=format&fit=crop&q=60' },
              { id: 'FOD-005', title: 'Paket Roti Tawar Gandum & Donat Susu', providerName: 'Bakery Plaza Surabaya', originalPrice: 22000, discountPrice: 0, quantity: '20 Porsi', pickupTime: '20:30 - 21:45 WIB', isFree: true, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60' },
              { id: 'smart-cns-1', title: 'Nasi Paket Ayam Bakar Specialty', providerName: 'Warung Bakso Pak Kumis', originalPrice: 25000, discountPrice: 10000, quantity: '1 Porsi', pickupTime: '19:00 - 21:30 WIB', isFree: false, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60' },
              { id: 'smart-cns-2', title: 'Roti Croissant & Pastry Steril', providerName: 'Rotiboy Bakery Surabaya', originalPrice: 18000, discountPrice: 6000, quantity: '1 Porsi', pickupTime: '20:00 - 22:00 WIB', isFree: false, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60' }
            ];
            const mockItem = defaultFoods.find(f => f.id === itemId);
            if (mockItem) {
              setItem({
                id: mockItem.id,
                title: mockItem.title,
                providerName: mockItem.providerName,
                originalPrice: mockItem.originalPrice,
                price: mockItem.discountPrice,
                quantity: mockItem.quantity,
                pickupTime: mockItem.pickupTime,
                category: 'MAKANAN_BERAT',
                isFree: mockItem.isFree,
                imageUrl: mockItem.imageUrl,
              });
            } else {
              // Check cart/local storage as fallback
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
    if (deliveryMethod === 'COMMUNITY_DELIVERY' && quantity < 20) {
      setToastState({ isOpen: true, message: 'Diantar komunitas memerlukan minimal 20 porsi.', type: 'error' });
      return;
    }
    setIsCheckingOut(true);

    setTimeout(() => {
      try {
        const isFree = item.isFree;
        const totalAmount = isFree ? 0 : (item.price * quantity) + (deliveryMethod === 'COURIER_DELIVERY' ? 5000 : 0);
        
        const resiCode = isFree
          ? `CLM-YYS-2026-${Math.floor(1000 + Math.random() * 9000)}`
          : `CLM-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const newClaimStatus = (totalAmount === 0 || isFree) ? 'AWAITING_VERIFICATION' : 'AWAITING_PAYMENT';

        const newClaim = {
          id: resiCode,
          foodName: `${item.title} (${quantity}x)`,
          providerName: item.providerName,
          totalAmount,
          deliveryMethod,
          paymentMethod,
          address,
          status: newClaimStatus,
          paymentProof: null,
          createdAt: new Date().toISOString(),
          pickupTime: item.pickupTime,
          items: [{ ...item, quantity }]
        };
        
        const existingClaims = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
        localStorage.setItem('replate_active_claims', JSON.stringify([newClaim, ...existingClaims]));

        // Sync to replate_claims
        const existingYys = JSON.parse(localStorage.getItem('replate_claims') || '[]');
        localStorage.setItem('replate_claims', JSON.stringify([newClaim, ...existingYys]));
        
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

  const maxStock = parseInt(String(item.quantity).replace(/\D/g, '')) || 5;
  const subtotal = item.isFree ? 0 : item.price * quantity;
  const deliveryFee = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : 0;
  const totalAmount = subtotal + deliveryFee;

  return (
    <>
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
                  {session?.user?.name || 'Muhamad Nursidik'} | (+62) 838-2396-2754
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm line-clamp-2 leading-relaxed">
                  {address}
                </p>
              </div>
              <span className="text-slate-400 mt-2 group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>

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
                  <p className="text-[11px] text-amber-600 font-bold inline-flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded-md">
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
                      onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                      disabled={quantity >= maxStock}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                      title={`Maksimal stok: ${maxStock}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                {quantity >= maxStock && (
                  <div className="text-[10px] text-red-500 font-bold text-right mt-1">
                    Stok maksimum ({maxStock}) tercapai
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm text-sm">
            <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider">Opsi Pengiriman</h4>
            
            <div 
              className="flex items-center justify-between cursor-pointer border-b border-slate-100 pb-3 group"
              onClick={() => setIsDeliveryModalOpen(true)}
            >
              <div>
                <div className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors">
                  {deliveryMethod === 'SELF_PICKUP' ? '🏬 Ambil Mandiri (Self-Pickup)' : deliveryMethod === 'COURIER_DELIVERY' ? '🛵 Diantar Driver Provider' : '🤝 Diantar Komunitas'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {deliveryMethod === 'SELF_PICKUP' 
                    ? 'Bebas ongkir (Rp 0). Ambil di gerai.' 
                    : deliveryMethod === 'COURIER_DELIVERY' ? 'Oleh driver provider. (+Rp 5.000)' : 'Diverifikasi komunitas. Min. 20 porsi.'}
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

          {totalAmount > 0 && (
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
                      {paymentMethod === 'QRIS' ? 'QRIS' : 'Bayar di Tempat (COD)'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {paymentMethod === 'QRIS' ? 'Scan dari aplikasi apa saja' : 'Bayar tunai saat pesanan tiba'}
                    </div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </div>
          )}
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
              {isCheckingOut ? 'Memproses...' : (totalAmount > 0 ? 'Selesaikan & Lanjut Bayar ➔' : 'Selesaikan Pesanan ➔')}
            </Button>
          </div>
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
                  <span className="font-extrabold text-slate-900 text-sm">🛵 Diantar Driver Provider</span>
                  <span className="font-bold text-slate-900 text-sm">Rp 5.000</span>
                </div>
                <p className="text-xs text-slate-500">
                  Pesanan akan diantarkan oleh driver dari pihak penyedia (provider).
                </p>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                deliveryMethod === 'COMMUNITY_DELIVERY'
                  ? 'bg-amber-50/50 border-[#D4A843] shadow-sm'
                  : quantity < 20
                  ? 'bg-slate-50 border-slate-200 opacity-50'
                  : 'bg-white border-slate-200 hover:border-amber-200'
              }`}
            >
              <input
                type="radio"
                name="deliveryMethodModal"
                checked={deliveryMethod === 'COMMUNITY_DELIVERY'}
                disabled={quantity < 20}
                onChange={() => {
                  if (quantity >= 20) {
                    setDeliveryMethod('COMMUNITY_DELIVERY');
                    setIsDeliveryModalOpen(false);
                  }
                }}
                className="mt-0.5 w-4 h-4 text-[#1B3A5C]"
              />
              <div className="space-y-1 w-full">
                <div className="flex justify-between w-full">
                  <span className="font-extrabold text-slate-900 text-sm">🤝 Diantar Komunitas {quantity < 20 && <span className="text-red-500 text-[10px] ml-1">(Min. 20 porsi)</span>}</span>
                  <span className="font-bold text-slate-900 text-sm">Rp 0</span>
                </div>
                <p className="text-xs text-slate-500">
                  Harus diverifikasi oleh komunitas terlebih dahulu apakah bersedia mengantar. Minimal jumlah orderan 20 porsi.
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
            {['QRIS', 'COD'].map((method) => (
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
                    {method === 'QRIS' ? 'QRIS (Semua E-Wallet & Bank)' : 'Bayar di Tempat (COD)'}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {method === 'QRIS' ? 'Otomatis dicek. Gratis biaya admin.' : 'Bayar tunai saat pesanan tiba.'}
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
    </>
  );
}
