'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';
import { Modal } from '@/components/ui/Modal';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { QRGenerator } from '@/components/qr/QRGenerator';
import Image from 'next/image';
import { resolveIndonesianAddress } from '@/lib/geoResolver';
import {
  MapPinIcon,
  TruckIcon,
  CreditCardIcon,
  CheckIcon,
  PackageIcon,
  TicketIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  ClockIcon,
} from '@/components/ui/Icon';

// Inline ChevronRight (Poin 8: no emoji)
const ChevronRight = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Poin 6: Standardized resi generator
const genResiCode = (role: 'YYS' | 'CNS') =>
  `RPL-${role}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

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
  providerAddress?: string;
  lat?: number;
  lng?: number;
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
  const [isBeneficiaryRole, setIsBeneficiaryRole] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Poin 7: QRIS flow states
  const [qrisModal, setQrisModal] = useState(false);
  const [uploadProofModal, setUploadProofModal] = useState<{ isOpen: boolean; resiCode: string; totalAmt: number }>({ isOpen: false, resiCode: '', totalAmt: 0 });
  const [proofImageName, setProofImageName] = useState('');
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; claim: any | null }>({ isOpen: false, claim: null });

  // Poin 4: SuperAppLoader
  const [actionLoader, setActionLoader] = useState<{ isOpen: boolean; message: string; submessage?: string }>({ isOpen: false, message: '' });

  const [recipientName, setRecipientName] = useState('Konsumen Replate');
  const [recipientPhone, setRecipientPhone] = useState('0812-3456-7890');
  const [address, setAddress] = useState('Jl. Ketintang No. 12, Gayungan, Surabaya, Jawa Timur');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);
  const [orderNotes, setOrderNotes] = useState('');

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

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
      const reg = localStorage.getItem('replate_registered_user');
      const regParsed = reg ? JSON.parse(reg) : null;

      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.address) {
          setAddress(parsed.address);
          setTempAddress(parsed.address);
        }
        if (parsed.contactPerson || parsed.name || parsed.entityName) {
          setRecipientName(parsed.contactPerson || parsed.name || parsed.entityName);
        } else if (regParsed?.name) {
          setRecipientName(regParsed.name);
        } else if (session?.user?.name) {
          setRecipientName(session.user.name);
        }
        if (parsed.phone) {
          setRecipientPhone(parsed.phone);
        } else if (regParsed?.phone) {
          setRecipientPhone(regParsed.phone);
        }
        const r = String(parsed.role || '').toUpperCase();
        if (r.includes('YAYASAN') || r.includes('BENEFICIARY')) setIsBeneficiaryRole(true);
      } else if (regParsed) {
        if (regParsed.name) setRecipientName(regParsed.name);
        if (regParsed.phone) setRecipientPhone(regParsed.phone);
      } else if (session?.user) {
        if (session.user.name) setRecipientName(session.user.name);
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
            providerName: found.provider?.organizationName || found.providerName || 'Provider Replate',
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
              providerName: tempCheckoutItem.providerName || 'Provider Replate',
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
                  providerName: cartItem.providerName || 'Provider Replate',
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

  // Poin 6 & 7: Standardized resi + QRIS flow
  const isFreeItem = item?.isFree ?? false;

  // Out of Stock detection
  let rawItemQty = 1;
  if (typeof item?.quantity === 'number') {
    rawItemQty = item.quantity;
  } else if (typeof item?.quantity === 'string') {
    const match = item.quantity.match(/\d+/);
    rawItemQty = match ? parseInt(match[0], 10) : 1;
    if (item.quantity.toLowerCase().includes('0 porsi') || item.quantity.trim() === '0') {
      rawItemQty = 0;
    }
  }
  const isItemOutOfStock = rawItemQty <= 0 || (item as any)?.status === 'OUT_OF_STOCK' || (item as any)?.status === 'SOLD_OUT';

  const buildClaim = (resiCode: string, status: string, proofUrl?: string) => {
    const resolvedDest = resolveIndonesianAddress(address);
    const resolvedProv = resolveIndonesianAddress(item?.providerAddress || (item as any)?.address || '');

    const deliveryFeeAmt = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : deliveryMethod === 'COMMUNITY_DELIVERY' ? 8000 : 0;
    const computedMethodLabel = deliveryMethod === 'SELF_PICKUP'
      ? 'Ambil Mandiri (Self-Pickup)'
      : deliveryMethod === 'COMMUNITY_DELIVERY'
      ? 'Diantar Kurir Relawan Komunitas'
      : 'Diantar Armada Toko';

    return {
      id: resiCode,
      code: resiCode,
      foodName: `${item?.title} (${quantity}x)`,
      providerName: item?.providerName,
      provider: item?.providerName,
      providerAddress: item?.providerAddress || (item as any)?.address,
      providerLat: item?.lat || (item as any)?.latitude || resolvedProv.lat,
      providerLng: item?.lng || (item as any)?.longitude || resolvedProv.lng,
      totalAmount: isFreeItem ? 0 : (item?.price ?? 0) * quantity + deliveryFeeAmt,
      deliveryMethod,
      method: deliveryMethod,
      methodLabel: computedMethodLabel,
      recipientName: recipientName || 'Budi Santoso',
      recipientPhone: recipientPhone || '0812-3456-7890',
      deliveryAddress: address,
      destinationAddress: address,
      lat: resolvedDest.lat,
      lng: resolvedDest.lng,
      destinationLat: resolvedDest.lat,
      destinationLng: resolvedDest.lng,
      paymentMethod,
      address,
      status,
      paymentProof: proofUrl || null,
      createdAt: new Date().toISOString(),
      pickupTime: item?.pickupTime,
      notes: orderNotes || 'Wadah steril food-grade',
      customerNotes: orderNotes,
      items: [{ ...item, quantity }],
      hygieneStatus: 'LOLOS AUDIT BPOM 8-POIN',
      courierName: deliveryMethod === 'SELF_PICKUP'
        ? 'Pengambil Mandiri'
        : deliveryMethod === 'COMMUNITY_DELIVERY'
        ? 'Pool Siaga Relawan Replate'
        : 'Menunggu Penugasan Driver Toko',
      driverInfo: null,
    };
  };

  const persistClaim = (claim: any) => {
    const ex = JSON.parse(localStorage.getItem('replate_active_claims') || '[]');
    const filteredActive = ex.filter((c: any) => c.id !== claim.id && c.code !== claim.code && c.claimCode !== claim.claimCode);
    localStorage.setItem('replate_active_claims', JSON.stringify([claim, ...filteredActive]));
    const exYys = JSON.parse(localStorage.getItem('replate_claims') || '[]');
    const filteredYys = exYys.filter((c: any) => c.id !== claim.id && c.code !== claim.code && c.claimCode !== claim.claimCode);
    localStorage.setItem('replate_claims', JSON.stringify([claim, ...filteredYys]));

    // Poin 6: Pengurangan stok dinamis pada replate_local_surplus
    try {
      const localSurplus = JSON.parse(localStorage.getItem('replate_local_surplus') || '[]');
      let found = false;
      const updated = localSurplus.map((sItem: any) => {
        if (sItem.id === item?.id || sItem.foodName === item?.title || sItem.title === item?.title) {
          found = true;
          const cur = Number(sItem.remainingQuantity !== undefined ? sItem.remainingQuantity : (sItem.quantity || 0));
          const rem = Math.max(0, cur - quantity);
          return { ...sItem, remainingQuantity: rem, status: rem <= 0 ? 'SOLD_OUT' : sItem.status };
        }
        return sItem;
      });
      if (found) {
        localStorage.setItem('replate_local_surplus', JSON.stringify(updated));
      }
    } catch (_) {}
  };

  const handleCheckout = () => {
    if (!item) return;

    if (isItemOutOfStock) {
      setToastState({
        isOpen: true,
        message: 'Mohon maaf, porsi makanan ini saat ini sedang habis. Silakan pilih menu surplus lezat lainnya ya!',
        type: 'error',
      });
      return;
    }

    // Donasi Rp 0 dikhususkan untuk Beneficiary & Warga Rentan
    if (item.isFree) {
      const rawRole = (session?.user as any)?.role || (typeof window !== 'undefined' ? localStorage.getItem('replate_role') : '');
      const isConsumer = String(rawRole).toUpperCase().includes('CONSUMER');
      const isVerifiedBeneficiary = isBeneficiaryRole || (typeof window !== 'undefined' && localStorage.getItem('replate_consumer_verification_status') === 'BENEFICIARY_VERIFIED');

      if (isConsumer && !isVerifiedBeneficiary) {
        setToastState({
          isOpen: true,
          message: 'Donasi Bebas Biaya (Rp 0) dikhususkan untuk Panti Asuhan & Keluarga Rentan Terdaftar. Sebagai Konsumen Hemat, silakan pesan hidangan lezat di kategori Rescue Sale (Diskon 50-70%)!',
          type: 'error',
        });
        return;
      }
    }

    // Poin 3: Alert pencegahan jika memesan melebihi kapasitas porsi ready
    if (quantity > maxStock) {
      setToastState({
        isOpen: true,
        message: `Peringatan: Jumlah pesanan (${quantity} porsi) melebihi stok yang tersedia (${maxStock} porsi). Anda tidak dapat memesan lebih dari stok yang ready.`,
        type: 'error',
      });
      return;
    }

    const resiCode = isFreeItem ? genResiCode('YYS') : genResiCode('CNS');
    const deliveryFeeAmt = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : deliveryMethod === 'COMMUNITY_DELIVERY' ? 8000 : 0;
    const totalAmt = isFreeItem ? 0 : (item?.price ?? 0) * quantity + deliveryFeeAmt;

    // Poin 7 & 8: Status awal logistik yang tepat
    const defaultStatus = deliveryMethod === 'SELF_PICKUP' 
      ? 'READY_FOR_PICKUP' 
      : deliveryMethod === 'COMMUNITY_DELIVERY' 
      ? 'WAITING_RESCUE_POOL' 
      : 'AWAITING_DRIVER_PLOTTING';

    // If Free Item: instant confirmation & ready for pickup / waiting for store courier dispatch
    if (isFreeItem) {
      processDirectCheckout(resiCode, defaultStatus);
      return;
    }

    // If COD: langsung terkonfirmasi tanpa verifikasi bukti transfer
    if (paymentMethod === 'COD') {
      processDirectCheckout(resiCode, defaultStatus);
      return;
    }

    // If QRIS: persist order with code, then open QRIS popup
    if (paymentMethod === 'QRIS') {
      const initialClaim = buildClaim(resiCode, 'AWAITING_PAYMENT');
      persistClaim(initialClaim);
      setUploadProofModal({ isOpen: false, resiCode, totalAmt });
      setQrisModal(true);
      return;
    }

    processDirectCheckout(resiCode, defaultStatus);
  };

  const processDirectCheckout = (forcedResi?: string, forcedStatus?: string) => {
    setIsCheckingOut(true);
    setActionLoader({ isOpen: true, message: 'Memproses Pesanan...', submessage: 'Menerbitkan tiket klaim' });
    setTimeout(() => {
      try {
        const resiCode = forcedResi || (isFreeItem ? genResiCode('YYS') : genResiCode('CNS'));
        const defaultStatus = deliveryMethod === 'SELF_PICKUP' 
          ? 'READY_FOR_PICKUP' 
          : deliveryMethod === 'COMMUNITY_DELIVERY' 
          ? 'WAITING_RESCUE_POOL' 
          : 'AWAITING_DRIVER_PLOTTING';
        const status = forcedStatus || defaultStatus;
        const newClaim = buildClaim(resiCode, status);
        persistClaim(newClaim);
        setIsCheckingOut(false);
        setActionLoader({ isOpen: false, message: '' });
        setSuccessModal({ isOpen: true, claim: newClaim });
      } catch (err) {
        setToastState({ isOpen: true, message: 'Mohon maaf, pesanan belum berhasil diproses. Silakan coba beberapa saat lagi ya.', type: 'error' });
        setIsCheckingOut(false);
        setActionLoader({ isOpen: false, message: '' });
      }
    }, 1000);
  };

  const handleQrisConfirmed = () => {
    setQrisModal(false);
    setUploadProofModal((prev) => ({
      isOpen: true,
      resiCode: prev.resiCode,
      totalAmt: prev.totalAmt,
    }));
  };

  const handleUploadProof = () => {
    if (!proofImageName) {
      setToastState({ isOpen: true, message: 'Silakan pilih foto atau file bukti transfer pembayaran Anda terlebih dahulu ya.', type: 'error' });
      return;
    }
    setActionLoader({ isOpen: true, message: 'Mengirim Bukti Pembayaran...', submessage: 'Menunggu verifikasi provider' });
    setTimeout(() => {
      try {
        const newClaim = buildClaim(uploadProofModal.resiCode, 'WAITING_PAYMENT_APPROVAL', proofImageName);
        persistClaim(newClaim);
        setUploadProofModal({ isOpen: false, resiCode: '', totalAmt: 0 });
        setActionLoader({ isOpen: false, message: '' });
        setSuccessModal({ isOpen: true, claim: newClaim });
      } catch (err) {
        setActionLoader({ isOpen: false, message: '' });
        setToastState({ isOpen: true, message: 'Mohon maaf, bukti pembayaran belum berhasil dikirim. Silakan periksa koneksi dan coba unggah kembali.', type: 'error' });
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

  const stockDigits = parseInt(String(item.quantity).replace(/\D/g, ''));
  const maxStock = (!isNaN(stockDigits) && stockDigits > 0) ? stockDigits : 99;
  const subtotal = item.isFree ? 0 : item.price * quantity;
  const deliveryFee = deliveryMethod === 'COURIER_DELIVERY' ? 5000 : deliveryMethod === 'COMMUNITY_DELIVERY' ? 8000 : 0;
  const totalAmount = subtotal + deliveryFee;

  return (
    <>
      <SuperAppLoader isOpen={actionLoader.isOpen} message={actionLoader.message} submessage={actionLoader.submessage} />
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
              <MapPinIcon size={14} className="text-emerald-600" />
              Alamat Pengiriman
            </h4>
            <div className="flex items-start justify-between cursor-pointer group" onClick={() => {
              setTempAddress(address);
              setIsAddressModalOpen(true);
            }}>
              <div>
                <p className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors">
                  {recipientName} | {recipientPhone}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm line-clamp-2 leading-relaxed">
                  {address}
                </p>
              </div>
              <span className="text-slate-400 mt-2 group-hover:translate-x-1 transition-transform"><ChevronRight /></span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <ShieldCheckIcon size={14} className="text-slate-500" />
              <span className="font-black text-slate-800">{item.providerName}</span>
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
                  <p className="text-[11px] text-amber-600 font-bold inline-flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <ClockIcon size={11} className="text-amber-600" />
                    {deliveryMethod === 'SELF_PICKUP' ? 'Jadwal Ambil di Toko:' : 'Estimasi Tiba:'} {item.pickupTime}
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
                  {deliveryMethod === 'SELF_PICKUP' 
                    ? 'Ambil Mandiri (Self-Pickup)' 
                    : deliveryMethod === 'COURIER_DELIVERY' 
                      ? 'Diantar Armada Toko (Driver Provider)' 
                      : 'Diantar Kurir Relawan Komunitas'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {deliveryMethod === 'SELF_PICKUP' 
                    ? 'Bebas ongkir (Rp 0). Ambil langsung di gerai penyedia.' 
                    : deliveryMethod === 'COURIER_DELIVERY' 
                      ? 'Diantar oleh armada/driver internal penyedia toko (+Rp 5.000).' 
                      : 'Diantar oleh relawan logistik Food Rescue Komunitas (+Rp 8.000).'}
                </div>
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-2 inline-block">
                  {deliveryMethod === 'SELF_PICKUP'
                    ? `Jadwal Pengambilan di Toko: ${item?.pickupTime || 'Hari ini 20:30 WIB'}`
                    : deliveryMethod === 'COURIER_DELIVERY'
                      ? `Estimasi Pengantaran Armada Toko: ${item?.pickupTime || 'Hari ini 20:30 WIB'}`
                      : `Estimasi Pengantaran Kurir Relawan Tiba: ${item?.pickupTime || 'Hari ini 20:30 WIB'}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">
                  {deliveryMethod === 'SELF_PICKUP' ? 'Rp 0' : deliveryMethod === 'COMMUNITY_DELIVERY' ? 'Rp 8.000' : 'Rp 5.000'}
                </span>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform"><ChevronRight /></span>
              </div>
            </div>
            
            <div className="pt-2 space-y-1.5 border-t border-slate-100">
              <label className="text-slate-700 font-bold text-xs flex items-center justify-between">
                <span>Catatan untuk Penjual / Petugas:</span>
                <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Tulis instruksi khusus (misal: saus dipisah, kemasan jangan ditumpuk, titip di resepsionis)..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] bg-slate-50 placeholder:text-slate-400 font-medium"
              />
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
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <QrCodeIcon size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 group-hover:text-[#1B3A5C] transition-colors">
                      {paymentMethod === 'QRIS' ? 'QRIS (Semua E-Wallet & Bank)' : 'Bayar di Tempat (COD)'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {paymentMethod === 'QRIS' ? 'Scan QR dari aplikasi apapun. Gratis admin.' : 'Bayar tunai saat pesanan tiba'}
                    </div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform"><ChevronRight /></span>
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
            
            {isItemOutOfStock && (
              <div className="p-3.5 mb-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
                <strong className="block font-black text-rose-950">Porsi Makanan Ini Telah Habis</strong>
                <p className="text-[11px] text-rose-800">
                  Seluruh kuota porsi makanan ini sudah tersalurkan atau habis diklaim. Silakan pilih menu surplus lainnya di katalog.
                </p>
              </div>
            )}

            <Button
              variant="gold"
              className={`w-full font-black py-3 text-sm shadow-md ${
                isItemOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'text-slate-950'
              }`}
              onClick={handleCheckout}
              disabled={isCheckingOut || isItemOutOfStock}
            >
              {isItemOutOfStock
                ? 'Porsi Makanan Habis (0 Porsi)'
                : isCheckingOut
                ? 'Memproses...'
                : (paymentMethod === 'QRIS' && !isFreeItem ? 'Lanjut Bayar QRIS' : 'Selesaikan Pesanan')}
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
                  <span className="font-extrabold text-slate-900 text-sm">Ambil Mandiri (Self-Pickup)</span>
                  <span className="font-bold text-slate-900 text-sm">Rp 0</span>
                </div>
                <p className="text-xs text-slate-500">
                  Bebas ongkir. Anda harus mengambil pesanan secara mandiri di gerai provider.
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
                  <span className="font-extrabold text-slate-900 text-sm">Diantar Armada Toko (Driver Provider)</span>
                  <span className="font-bold text-slate-900 text-sm">Rp 5.000</span>
                </div>
                <p className="text-xs text-slate-500">
                  Pesanan akan diantarkan oleh driver dari pihak penyedia (provider).
                </p>
              </div>
            </label>

            {isBeneficiaryRole && (
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
                    <span className="font-extrabold text-slate-900 text-sm">
                      Diantar Kurir Relawan Komunitas (Khusus Skala Besar) {quantity < 20 && <span className="text-red-500 text-[10px] ml-1">(Min. 20 porsi)</span>}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">Rp 8.000</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Khusus penyaluran donasi skala besar ke panti asuhan/yayasan. Disalurkan oleh relawan siaga Food Rescue Replate.
                  </p>
                </div>
              </label>
            )}
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
                  <QrCodeIcon size={18} className="text-emerald-600 shrink-0" />
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

      {/* POIN 7: MODAL QRIS */}
      <Modal isOpen={qrisModal} onClose={() => setQrisModal(false)} title="Scan & Bayar QRIS">
        <div className="space-y-4 text-xs text-center">
          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-center gap-2 text-[#1B3A5C]">
              <QrCodeIcon size={16} />
              <span className="font-black text-sm">QRIS Pembayaran — {item?.providerName}</span>
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
                  <h5 className="font-black text-xs text-[#1B3A5C] truncate">{providerQris.merchantName || item?.providerName}</h5>
                  <p className="text-[10px] text-slate-500 font-medium">{providerQris.bank} • {providerQris.accountNo}</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-left space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Nama Merchant:</span><strong className="text-slate-800">{providerQris.merchantName || item?.providerName}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Jumlah Bayar:</span><strong className="text-[#1B3A5C] font-black text-sm">Rp {totalAmount.toLocaleString('id-ID')}</strong></div>
            </div>
            <p className="text-[11px] text-slate-500">Scan barcode QRIS toko di atas menggunakan GoPay, OVO, DANA, ShopeePay, atau m-Banking manapun. Setelah berhasil bayar, klik <strong>Sudah Bayar, Upload Bukti</strong>.</p>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm" className="flex-1 font-bold text-xs cursor-pointer" onClick={() => setQrisModal(false)}>Batal</Button>
            <Button variant="gold" size="sm" leftIcon={<CheckIcon size={12} className="text-slate-950" />} className="flex-1 font-black text-xs text-slate-950 cursor-pointer" onClick={handleQrisConfirmed}>Sudah Bayar, Upload Bukti</Button>
          </div>
        </div>
      </Modal>

      {/* POIN 7: UPLOAD BUKTI */}
      <Modal isOpen={uploadProofModal.isOpen} onClose={() => setUploadProofModal(p => ({ ...p, isOpen: false }))} title="Upload Bukti Pembayaran QRIS">
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 font-medium text-[11px] flex items-start gap-2">
            <ShieldCheckIcon size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <span>Upload screenshot atau foto struk QRIS. Pesanan diproses setelah provider memverifikasi.</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 block">Nomor Resi: <span className="font-mono text-[#1B3A5C]">{uploadProofModal.resiCode}</span></span>
            <span className="text-xs font-bold text-slate-700 block">Total Dibayar: <span className="font-black text-[#1B3A5C]">Rp {uploadProofModal.totalAmt.toLocaleString('id-ID')}</span></span>
          </div>
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0">
              <PackageIcon size={18} className="text-slate-500 group-hover:text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              {proofImageName ? <p className="font-bold text-emerald-700 truncate">{proofImageName}</p> : <p className="font-medium text-slate-500">Klik untuk pilih file bukti bayar</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, atau PDF · Maks. 5MB</p>
            </div>
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setProofImageName(e.target.files[0].name); }} />
          </label>
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm" className="flex-1 font-bold text-xs cursor-pointer" onClick={() => setUploadProofModal(p => ({ ...p, isOpen: false }))}>Kembali</Button>
            <Button variant="gold" size="sm" leftIcon={<CheckIcon size={12} className="text-slate-950" />} className="flex-1 font-black text-xs text-slate-950 cursor-pointer" onClick={handleUploadProof}>Kirim Bukti Pembayaran</Button>
          </div>
        </div>
      </Modal>

      {/* SUCCESS MODAL (Poin 3/7) */}
      <Modal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false, claim: null })} title="Pesanan Berhasil!" size="md">
        {successModal.claim && (
          <div className="space-y-4 text-xs">
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto shadow-md"><CheckIcon size={28} className="text-white" /></div>
              <h3 className="font-black text-base text-emerald-900">{successModal.claim.status === 'WAITING_PAYMENT_APPROVAL' ? 'Bukti Dikirim! Menunggu Verifikasi' : 'Pesanan Dikonfirmasi!'}</h3>
              <p className="text-[11px] text-emerald-800 font-medium">{successModal.claim.status === 'WAITING_PAYMENT_APPROVAL' ? 'Pembayaran QRIS Anda sedang diverifikasi provider. Tiket QR aktif setelah disetujui.' : 'Pesanan Anda berhasil dikonfirmasi.'}</p>
            </div>
            <div className="p-3.5 bg-[#1B3A5C] rounded-2xl text-center">
              <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block mb-1">Nomor Resi Klaim</span>
              <span className="font-mono font-black text-lg text-white block">{successModal.claim.code}</span>
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" size="sm" className="flex-1 font-bold text-xs cursor-pointer" onClick={() => setSuccessModal({ isOpen: false, claim: null })}>Tutup</Button>
              <Button variant="gold" size="sm" leftIcon={<TicketIcon size={12} className="text-slate-950" />} className="flex-1 font-black text-xs text-slate-950 cursor-pointer" onClick={() => { setSuccessModal({ isOpen: false, claim: null }); router.push(isBeneficiaryRole ? '/dashboard/yayasan/claims' : '/dashboard/consumer/my-claims'); }}>Lihat Klaim Saya</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
