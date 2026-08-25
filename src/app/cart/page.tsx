'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

interface CartItem {
  id: string | number;
  name: string;
  provider: string;
  distance: string | number;
  price: number;
  originalPrice?: number;
  quantity: number;
  category?: string;
  isFree?: boolean;
  type?: string;
  imageUrl?: string;
  pickupTime?: string;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'SELF_PICKUP' | 'COURIER_DELIVERY'>('SELF_PICKUP');
  const [loading, setLoading] = useState(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    resiCode: string;
    foodName: string;
    provider: string;
    totalAmount: number;
    method: string;
    time: string;
  } | null>(null);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('replate_tas_klaim');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        if (Array.isArray(items) && items.length > 0) {
          setCart(items);
        } else {
          // Default demo mock item if empty
          setCart([
            {
              id: 'food-exp-1',
              name: 'Nasi Paket Ayam Bakar Specialty',
              provider: 'Warung Bakso Pak Kumis Surabaya',
              distance: '1.2 km',
              price: 10000,
              originalPrice: 25000,
              quantity: 2,
              category: 'MAKANAN',
              pickupTime: '19:00 - 21:30 WIB',
              imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
            },
          ]);
        }
      } else {
        setCart([
          {
            id: 'food-exp-1',
            name: 'Nasi Paket Ayam Bakar Specialty',
            provider: 'Warung Bakso Pak Kumis Surabaya',
            distance: '1.2 km',
            price: 10000,
            originalPrice: 25000,
            quantity: 2,
            category: 'MAKANAN',
            pickupTime: '19:00 - 21:30 WIB',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
          },
        ]);
      }
    } catch (_) {}
  }, []);

  const updateQuantity = (id: string | number, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setCart(updated);
    try {
      localStorage.setItem('replate_tas_klaim', JSON.stringify(updated));
    } catch (_) {}
  };

  const removeFromCart = (id: string | number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    try {
      localStorage.setItem('replate_tas_klaim', JSON.stringify(updated));
    } catch (_) {}
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleStartClaim = () => {
    if (cart.length === 0) return;

    if (totalAmount > 0) {
      // Paid Rescue Sale: open QRIS Payment modal
      setIsQrisModalOpen(true);
    } else {
      // Free Donation: direct confirmation
      executeCompleteClaim();
    }
  };

  const executeCompleteClaim = () => {
    setLoading(true);
    setIsQrisModalOpen(false);

    setTimeout(() => {
      const isFree = subtotal === 0;
      const resiCode = isFree
        ? `CLM-YYS-2026-${Math.floor(1000 + Math.random() * 9000)}`
        : `CLM-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newClaimEntry = {
        id: resiCode,
        items: cart,
        totalAmount,
        deliveryMethod,
        status: deliveryMethod === 'SELF_PICKUP' ? 'READY_FOR_PICKUP' : 'COURIER_ON_THE_WAY',
        createdAt: new Date().toISOString(),
        pickupTime: cart[0]?.pickupTime || 'Hari ini 21:00 WIB',
        providerName: cart[0]?.provider || 'Warung Bakso Pak Kumis',
      };

      // Save to active claims storage
      try {
        const savedClaims = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
        localStorage.setItem('replate_active_claims', JSON.stringify([newClaimEntry, ...savedClaims]));
        localStorage.removeItem('replate_tas_klaim');
      } catch (_) {}

      setSuccessReceipt({
        resiCode,
        foodName: cart.map((c) => `${c.name} (${c.quantity}x)`).join(', '),
        provider: cart[0]?.provider || 'Warung Bakso Pak Kumis Surabaya',
        totalAmount,
        method: deliveryMethod === 'SELF_PICKUP' ? 'Ambil Mandiri (Self-Pickup)' : 'Diantar Kurir Komunitas Replate',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      });

      setCart([]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans pb-24 md:pb-0">
      <Navbar user={session?.user} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successReceipt ? (
          /* Receipt Success Card Screen */
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-center py-6">
            <div className="bg-[#1B3A5C] text-white p-8 sm:p-10 rounded-3xl border-2 border-[#2C5A8F] shadow-2xl space-y-6 text-left">
              <div className="text-center space-y-2 border-b border-[#2C5A8F] pb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
                  KLAIM MAKANAN SURPLUS BERHASIL
                </span>
                <h2 className="text-2xl font-black text-white">Resi Transaksi Resmi Replate</h2>
                <p className="text-xs text-slate-300 font-medium">
                  Pesanan telah diverifikasi oleh sistem. Tunjukkan QR Barcode ini saat penjemputan.
                </p>
              </div>

              {/* QR Barcode Box */}
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
                <Link href={`/chat?resi=${successReceipt.resiCode}`}>
                  <button
                    type="button"
                    className="w-full py-3.5 bg-[#D4A843] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>💬 Hubungi Toko / Driver via Chat ➔</span>
                  </button>
                </Link>

                <Link href="/dashboard/consumer/my-claims">
                  <Button variant="outline" size="md" className="w-full font-bold text-xs border-slate-600 text-slate-200">
                    Lihat Daftar Riwayat Klaim Saya
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Main Cart Content */
          <div className="space-y-8">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
                Penyelamatan Pangan Replate
              </span>
              <h1 className="text-3xl font-black text-[#1B3A5C] tracking-tight">Tas Klaim</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Tinjau daftar makanan surplus pilihan Anda sebelum melakukan konfirmasi klaim.
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4 shadow-xs">
                <span className="text-6xl block">🛍️</span>
                <h3 className="text-xl font-black text-[#1B3A5C]">Tas Klaim Anda Masih Kosong</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Belum ada makanan surplus yang ditambahkan. Temukan makanan diskon murah atau donasi steril sekarang.
                </p>
                <Link href="/explore">
                  <Button variant="gold" size="md" className="font-black text-xs text-slate-950 px-8 py-3 shadow-md">
                    Cari Makanan di Explore ➔
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left: Cart Item List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                    {cart.map((item) => (
                      <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60'}
                            alt={item.name}
                            className="w-18 h-18 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              🏪 {item.provider}
                            </span>
                            <h4 className="font-extrabold text-base text-[#1B3A5C]">{item.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              📍 Jarak: <strong>{item.distance}</strong> • ⏰ Jam Ambil: <strong>{item.pickupTime || '20:00 WIB'}</strong>
                            </p>
                            <span className="font-black text-sm text-[#1B3A5C] block">
                              {item.price === 0 ? 'Donasi Rp 0' : `Rp ${item.price.toLocaleString('id-ID')}`}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls & Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-900 font-black text-xs rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono font-black text-xs text-[#1B3A5C]">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-900 font-black text-xs rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Hapus item"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Method Selection */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
                    <h4 className="font-black text-sm text-[#1B3A5C] uppercase tracking-wider">
                      Pilihan Metode Pengambilan Pangan:
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
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
                          <p className="text-[11px] text-slate-500">
                            Ambil langsung di gerai toko sesuai jam penjemputan. Bebas ongkos kirim (Rp 0).
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
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
                          <span className="font-extrabold text-slate-900 block">🛵 Diantar Kurir Komunitas</span>
                          <p className="text-[11px] text-slate-500">
                            Diantar kurir armada relawan Replate steril Surabaya (+Rp 5.000).
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: Order Summary */}
                <div className="bg-[#1B3A5C] text-white rounded-3xl border-2 border-[#2C5A8F] p-6 space-y-6 shadow-xl sticky top-24 text-xs">
                  <div className="border-b border-[#2C5A8F] pb-4">
                    <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-wider block">
                      RINGKASAN KLAIM PANGAN
                    </span>
                    <h3 className="text-xl font-black text-white">Rincian Klaim</h3>
                  </div>

                  <div className="space-y-3 font-medium">
                    <div className="flex justify-between text-slate-300">
                      <span>Total Porsi:</span>
                      <strong className="text-white font-mono">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} Porsi
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal Makanan:</span>
                      <strong className="text-white">
                        {subtotal === 0 ? 'Donasi Rp 0' : `Rp ${subtotal.toLocaleString('id-ID')}`}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Biaya Pengantaran:</span>
                      <strong className="text-white">
                        {deliveryFee === 0 ? 'Rp 0 (Mandiri)' : `Rp ${deliveryFee.toLocaleString('id-ID')}`}
                      </strong>
                    </div>
                    <div className="border-t border-[#2C5A8F] pt-3 flex justify-between items-center">
                      <span className="text-sm font-extrabold text-white">Total Tagihan:</span>
                      <span className="text-xl font-black text-[#D4A843]">
                        {totalAmount === 0 ? 'GRATIS (Rp 0)' : `Rp ${totalAmount.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    isLoading={loading}
                    onClick={handleStartClaim}
                    className="w-full font-black text-xs text-slate-950 py-3.5 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>✓ Konfirmasi Klaim ➔</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav user={session?.user} />

      {/* QRIS Payment Modal for Rescue Sale */}
      <Modal
        isOpen={isQrisModalOpen}
        onClose={() => setIsQrisModalOpen(false)}
        title="Pembayaran QRIS Standar Replate"
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

          {/* QRIS Image & Code */}
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
            <Button variant="gold" size="sm" onClick={executeCompleteClaim} className="font-black text-slate-950">
              ✓ Saya Sudah Bayar QRIS ➔
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Alert */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
