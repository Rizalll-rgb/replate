export interface OutletItem {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  adminEmail?: string;
  isMain?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export const DEFAULT_OUTLETS: OutletItem[] = [
  {
    id: 'out-rungkut',
    name: 'Alfamart - Cabang Rungkut',
    city: 'Surabaya',
    address: 'Jl. Rungkut Madya No. 45, Rungkut, Surabaya, Jawa Timur 60293',
    latitude: -7.3245,
    longitude: 112.7789,
    contactName: 'Bambang Sugiharto (Store Leader)',
    contactPhone: '0812-3456-7890',
    adminEmail: 'rungkut@replate.id',
    isMain: true,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'out-gubeng',
    name: 'Alfamart - Cabang Gubeng',
    city: 'Surabaya',
    address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya, Jawa Timur 60281',
    latitude: -7.2754,
    longitude: 112.7538,
    contactName: 'Siti Rahma (Admin Logistik)',
    contactPhone: '0819-8765-4321',
    adminEmail: 'gubeng@replate.id',
    isMain: false,
    status: 'ACTIVE',
    createdAt: '2026-02-15T09:30:00.000Z',
  },
  {
    id: 'out-wonokromo',
    name: 'Alfamart - Cabang Wonokromo / Darmo',
    city: 'Surabaya',
    address: 'Jl. Raya Darmo No. 120, Wonokromo, Surabaya, Jawa Timur 60241',
    latitude: -7.2912,
    longitude: 112.738,
    contactName: 'Doni Kurniawan (Admin Operasional)',
    contactPhone: '0821-3456-7891',
    adminEmail: 'darmo@replate.id',
    isMain: false,
    status: 'ACTIVE',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
];

const STORAGE_KEY = 'replate_provider_outlets';
const ACTIVE_OUTLET_KEY = 'replate_active_outlet_id';

export function getStoredOutlets(): OutletItem[] {
  if (typeof window === 'undefined') return DEFAULT_OUTLETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}
  return DEFAULT_OUTLETS;
}

export function saveStoredOutlets(outlets: OutletItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(outlets));
    window.dispatchEvent(new CustomEvent('replate_outlets_updated', { detail: outlets }));
  } catch (_) {}
}

export function getActiveOutletId(): string {
  if (typeof window === 'undefined') return DEFAULT_OUTLETS[0].id;
  try {
    const id = localStorage.getItem(ACTIVE_OUTLET_KEY);
    if (id) return id;
  } catch (_) {}
  return DEFAULT_OUTLETS[0].id;
}

export function setActiveOutletId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_OUTLET_KEY, id);
    window.dispatchEvent(new CustomEvent('replate_outlet_changed', { detail: { id } }));
  } catch (_) {}
}

export function getActiveOutlet(): OutletItem {
  const outlets = getStoredOutlets();
  const activeId = getActiveOutletId();
  return outlets.find((o) => o.id === activeId) || outlets[0] || DEFAULT_OUTLETS[0];
}

export function isGrowthTierActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sub = localStorage.getItem('replate_provider_subscription');
    if (sub) {
      const parsed = JSON.parse(sub);
      if (parsed.status === 'ACTIVE' && parsed.planId === 'GROWTH') {
        return true;
      }
    }
  } catch (_) {}
  return false;
}

export function simulateUpgradeToGrowth(): void {
  if (typeof window === 'undefined') return;
  try {
    const growthSub = {
      planId: 'GROWTH',
      planName: 'Replate Growth Tier',
      price: 259000,
      startDate: new Date().toISOString(),
      endDate: '28 November 2026',
      status: 'ACTIVE',
      bannersRemaining: 3,
      discountUsed: false,
    };
    localStorage.setItem('replate_provider_subscription', JSON.stringify(growthSub));
    // Ensure default outlets exist
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_OUTLETS));
    }
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('replate_subscription_updated', { detail: growthSub }));
  } catch (_) {}
}

