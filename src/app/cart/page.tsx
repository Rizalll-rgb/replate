'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

interface CartItem {
  id: number;
  name: string;
  provider: string;
  distance: number;
  price: number;
  quantity: number;
  category: string;
}

const initialCart: CartItem[] = [
  { id: 1, name: 'Nasi Box Ayam Bakar', provider: 'Catering ABC', distance: 1.2, price: 10000, quantity: 2, category: 'Makanan' },
  { id: 2, name: 'Buah Potong Segar', provider: 'Fresh Fruits', distance: 2.6, price: 0, quantity: 5, category: 'Buah' }
];

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pickupCode, setPickupCode] = useState('');

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setPickupCode('FB-' + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase());
      clearCart();
    }, 1500);
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('makanan')) return '🍱';
    if (cat.includes('bakery')) return '🥐';
    if (cat.includes('minuman')) return '🥤';
    if (cat.includes('sayur')) return '🥬';
    if (cat.includes('buah')) return '🍎';
    return '🍲';
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
        <Navbar user={session?.user} />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-16 animate-fade-in flex flex-col items-center justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center w-full">
            <span className="text-6xl block mb-6">🎉</span>
            <h1 className="text-3xl font-black text-[#1B3A5C]">Pesanan Berhasil!</h1>
            <p className="text-slate-500 mt-4 leading-relaxed font-medium">
              Terima kasih telah berpartisipasi dalam menyelamatkan makanan! Pesanan Anda telah diterima oleh penyedia makanan.
            </p>
            
            <div className="bg-[#FFF9E6] border-2 border-dashed border-[#D4A843] rounded-2xl p-6 my-8">
              <span className="block text-xs font-black text-[#8C6D1F] uppercase tracking-widest">
                Kode Pengambilan (Pickup Code)
              </span>
              <strong className="block text-4xl font-black text-[#1B3A5C] mt-3">
                {pickupCode}
              </strong>
              <small className="block text-xs text-slate-500 font-semibold mt-3">
                Tunjukkan kode ini kepada penyedia saat mengambil makanan.
              </small>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white px-8 py-3 rounded-xl font-bold shadow-md">
                  Buka Dashboard
                </Button>
              </Link>
              <Link href="/explore" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-[#1B3A5C] text-[#1B3A5C] px-8 py-3 rounded-xl font-bold">
                  Explore Lagi
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar user={session?.user} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1B3A5C]">Keranjang Belanja</h1>
          <p className="text-slate-500 mt-2">Kelola makanan surplus yang ingin Anda selamatkan.</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
            <span className="text-6xl block mb-6">🛒</span>
            <h2 className="text-2xl font-black text-[#1B3A5C]">Keranjang Anda Kosong</h2>
            <p className="text-slate-500 mt-2 mb-8 font-medium">
              Anda belum menambahkan makanan surplus ke keranjang belanja Anda.
            </p>
            <Link href="/explore">
              <Button className="bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white px-8 py-3 rounded-xl font-bold shadow-md">
                Cari Makanan Surplus
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">{item.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Penyedia: <span className="font-bold text-slate-700">{item.provider}</span> • 📍 {item.distance} km
                      </p>
                      <span className="block text-sm font-black text-[#D4A843] mt-1.5">
                        {item.price === 0 ? 'Gratis' : `Rp${item.price.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <span className="text-sm font-extrabold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                      {item.quantity} porsi
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Hapus barang"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Checkout Panel */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-black text-[#1B3A5C] mb-6">Ringkasan Pesanan</h2>
                
                <div className="space-y-4 pb-6 border-b border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Total Barang</span>
                    <span className="font-extrabold text-slate-800">{cart.reduce((sum, item) => sum + item.quantity, 0)} porsi</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Metode</span>
                    <span className="font-extrabold text-slate-800">Ambil Sendiri (Pickup)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-6">
                  <span className="text-base font-extrabold text-slate-800">Total Biaya</span>
                  <span className="text-xl font-black text-[#1B3A5C]">
                    {calculateTotal() === 0 ? 'Gratis' : `Rp${calculateTotal().toLocaleString('id-ID')}`}
                  </span>
                </div>
                
                {session?.user ? (
                  <Button 
                    onClick={handleCheckout} 
                    disabled={loading}
                    className="w-full bg-[#D4A843] hover:bg-[#b88f35] text-[#1B3A5C] py-4 rounded-xl font-black text-sm shadow-md transition-all"
                  >
                    {loading ? 'Memproses...' : 'Selesaikan Checkout'}
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-3 font-medium">
                      Anda harus masuk akun terlebih dahulu untuk memesan.
                    </p>
                    <Link href="/login" className="block">
                      <Button className="w-full bg-[#1B3A5C] text-white py-3 rounded-xl font-bold">
                        Login Sekarang
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
