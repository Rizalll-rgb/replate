import { calculateDistance } from './utils';
import { resolveIndonesianAddress } from './geoResolver';

export type DeliveryProviderType = 'SELF_PICKUP' | 'PROVIDER_DRIVER' | 'RESCUE_ARMADA';

export interface FeeCalculationInput {
  foodTotal: number;
  isFreeItem: boolean;
  deliveryMethod: DeliveryProviderType | string;
  distanceKm: number;
  isProtectionSelected: boolean;
  quantity?: number;
}

export interface FeeBreakdown {
  foodTotal: number; // Subtotal Makanan: Rp [X]
  adminFeeProvider: number; // 10% dari subtotal komersial, 0 jika gratis
  providerEarnings: number; // foodTotal - adminFeeProvider (dicairkan ke saldo provider)
  serviceFeeConsumer: number; // Rp 2.000 jika SELF_PICKUP atau PROVIDER_DRIVER, Rp 0 jika RESCUE_ARMADA
  deliveryFee: number; // 0 jika SELF_PICKUP, Math.ceil(distanceKm) * 2000 jika PROVIDER_DRIVER / RESCUE_ARMADA
  protectionFee: number; // Rp 1.500 jika dipilih, 0 jika tidak
  totalAmount: number; // foodTotal + serviceFeeConsumer + deliveryFee + protectionFee
  distanceKm: number;
  methodLabel: string;
  deliveryNotes: string;
}

export const ADMIN_FEE_RATE = 0.10; // 10% Biaya Admin Platform
export const SERVICE_FEE_STANDARD = 2000; // Rp 2.000 Biaya Layanan Replate
export const RATE_PER_KM = 2000; // Rp 2.000 / km Ongkos Kirim
export const PROTECTION_FEE_AMOUNT = 1500; // Rp 1.500 Biaya Proteksi Makanan

export function normalizeDeliveryMethod(method: string): DeliveryProviderType {
  const upper = (method || '').toUpperCase();
  if (upper.includes('SELF') || upper.includes('PICKUP') || upper.includes('MANDIRI')) {
    return 'SELF_PICKUP';
  }
  if (upper.includes('RESCUE') || upper.includes('COMMUNITY') || upper.includes('RELAWAN')) {
    return 'RESCUE_ARMADA';
  }
  return 'PROVIDER_DRIVER';
}

/**
 * Menghitung jarak estimasi antara toko provider dan alamat tujuan pemesan
 * menggunakan formula Haversine dengan fallback koordinat Surabaya.
 */
export function calculateOrderDistance(
  storeLat?: number | null,
  storeLng?: number | null,
  storeAddress?: string,
  destLat?: number | null,
  destLng?: number | null,
  destAddress?: string,
  fallbackKm: number = 2.5
): number {
  let sLat = storeLat;
  let sLng = storeLng;
  let dLat = destLat;
  let dLng = destLng;

  if ((!sLat || !sLng) && storeAddress) {
    const resolved = resolveIndonesianAddress(storeAddress);
    sLat = resolved.lat;
    sLng = resolved.lng;
  }

  if ((!dLat || !dLng) && destAddress) {
    const resolved = resolveIndonesianAddress(destAddress);
    dLat = resolved.lat;
    dLng = resolved.lng;
  }

  if (sLat && sLng && dLat && dLng && !(sLat === dLat && sLng === dLng)) {
    const dist = calculateDistance(sLat, sLng, dLat, dLng);
    if (!isNaN(dist) && dist > 0) {
      return Math.round(dist * 10) / 10;
    }
  }

  return fallbackKm;
}

/**
 * Mesin kalkulasi biaya transaksi Replate sesuai Modul 3:
 * 1. Pilihan Metode Pengambilan:
 *    - Ambil Sendiri (Self-Pickup): Ongkir Rp 0.
 *    - Diantar Kurir Provider: Math.ceil(jarakKm) * 2000.
 *    - Disalurkan via Mitra Food Rescue: Math.ceil(jarakKm) * 2000 (khusus porsi besar/donasi yayasan).
 * 2. Rincian Tagihan Transparan:
 *    - Subtotal Makanan: Rp [X]
 *    - Biaya Layanan Replate: Rp 2.000 (Rp 0 jika via armada Food Rescue).
 *    - Ongkos Kirim: Rp [Y] (100% dialokasikan langsung untuk driver pengantar).
 *    - Biaya Proteksi Makanan: Rp 1.500 (opsional garansi layak konsumsi).
 * 3. Logika Backend untuk Provider:
 *    - Potong otomatis 10% Biaya Admin Platform dari subtotal makanan komersial.
 *    - Donasi/surplus gratis (Rp 0) TIDAK dikenakan biaya admin 10%.
 */
export function calculateOrderFees(input: FeeCalculationInput): FeeBreakdown {
  const normalizedMethod = normalizeDeliveryMethod(input.deliveryMethod);
  const distanceKm = Math.max(0.5, input.distanceKm || 2.5);

  const foodTotal = input.isFreeItem ? 0 : Math.max(0, input.foodTotal);

  // 1. Ongkos Kirim
  const deliveryFee = normalizedMethod === 'SELF_PICKUP'
    ? 0
    : Math.ceil(distanceKm) * RATE_PER_KM;

  // 2. Biaya Layanan Replate:
  // Rp 2.000 untuk self-pickup dan kurir provider; Rp 0 jika disalurkan via armada Food Rescue
  const serviceFeeConsumer = normalizedMethod === 'RESCUE_ARMADA' ? 0 : SERVICE_FEE_STANDARD;

  // 3. Biaya Proteksi Makanan (+Rp 1.500 opsional)
  const protectionFee = input.isProtectionSelected ? PROTECTION_FEE_AMOUNT : 0;

  // Total Tagihan Konsumen
  const totalAmount = foodTotal + deliveryFee + serviceFeeConsumer + protectionFee;

  // 4. Logika Backend untuk Provider:
  // Potong otomatis 10% Biaya Admin Platform dari subtotal komersial
  // Surplus gratis/donasi Rp 0 bebas biaya admin platform
  const adminFeeProvider = input.isFreeItem || foodTotal === 0
    ? 0
    : Math.round(foodTotal * ADMIN_FEE_RATE);

  const providerEarnings = foodTotal - adminFeeProvider;

  let methodLabel = 'Ambil Sendiri (Self-Pickup)';
  let deliveryNotes = 'Bebas ongkir (Rp 0). Ambil langsung di gerai penyedia.';

  if (normalizedMethod === 'PROVIDER_DRIVER') {
    methodLabel = 'Diantar Kurir Provider';
    deliveryNotes = `Jarak ${distanceKm.toFixed(1)} km (dibulatkan ${Math.ceil(distanceKm)} km) × Rp 2.000/km. 100% dialokasikan langsung untuk driver pengantar.`;
  } else if (normalizedMethod === 'RESCUE_ARMADA') {
    methodLabel = 'Disalurkan via Mitra Food Rescue';
    deliveryNotes = `Khusus porsi besar/donasi yayasan. Jarak ${distanceKm.toFixed(1)} km (dibulatkan ${Math.ceil(distanceKm)} km) × Rp 2.000/km. 100% dialokasikan untuk armada Food Rescue. Bebas biaya layanan platform.`;
  }

  return {
    foodTotal,
    adminFeeProvider,
    providerEarnings,
    serviceFeeConsumer,
    deliveryFee,
    protectionFee,
    totalAmount,
    distanceKm,
    methodLabel,
    deliveryNotes,
  };
}

/**
 * Mencatat hasil potongan 10% platform dan saldo bersih ke dompet provider di localStorage
 */
export function recordProviderOrderSettlement(order: {
  id: string;
  providerName?: string;
  foodName?: string;
  foodTotal: number;
  adminFeeProvider: number;
  providerEarnings: number;
  isFreeItem: boolean;
  date?: string;
}) {
  try {
    if (typeof window === 'undefined') return;
    const rawWallet = localStorage.getItem('replate_provider_wallet');
    const wallet = rawWallet ? JSON.parse(rawWallet) : { balance: 0, totalAdminFeePaid: 0, transactions: [] };

    // Prevent duplicate recording
    const exists = Array.isArray(wallet.transactions) && wallet.transactions.some((t: any) => t.orderId === order.id);
    if (!exists) {
      wallet.balance = (wallet.balance || 0) + (order.providerEarnings || 0);
      wallet.totalAdminFeePaid = (wallet.totalAdminFeePaid || 0) + (order.adminFeeProvider || 0);
      wallet.transactions = [
        {
          orderId: order.id,
          foodName: order.foodName || 'Menu Surplus',
          foodTotal: order.foodTotal,
          adminFeeProvider: order.adminFeeProvider,
          providerEarnings: order.providerEarnings,
          isFreeItem: order.isFreeItem,
          timestamp: order.date || new Date().toISOString(),
          type: order.isFreeItem ? 'DONATION' : 'COMMERCIAL_SURPLUS',
        },
        ...(wallet.transactions || []),
      ];
      localStorage.setItem('replate_provider_wallet', JSON.stringify(wallet));
    }
  } catch (_) {}
}

