// ============================================
// APP CONSTANTS
// ============================================

export const APP_NAME = 'FoodBridge';
export const APP_TAGLINE = 'Menghubungkan makanan berlebih dengan yang membutuhkan';
export const APP_DESCRIPTION = 'Platform redistribusi makanan berlebih yang menghubungkan Food Provider dengan penerima manfaat secara efisien, aman, dan transparan.';

// ============================================
// FOOD CATEGORIES
// ============================================

export const FOOD_CATEGORIES = {
    MEALS: { label: 'Makanan Siap Saji', color: '#E67E22' },
    BAKERY: { label: 'Roti & Kue', color: '#D4A843' },
    PRODUCE: { label: 'Buah & Sayur', color: '#2D8A4E' },
    DAIRY: { label: 'Susu & Olahan', color: '#3498DB' },
    BEVERAGES: { label: 'Minuman', color: '#9B59B6' },
    SNACKS: { label: 'Camilan', color: '#E74C3C' },
    OTHER: { label: 'Lainnya', color: '#95A5A6' },
} as const;

// ============================================
// STORAGE CONDITIONS
// ============================================

export const STORAGE_CONDITIONS = {
    ROOM_TEMP: { label: 'Suhu Ruangan', description: 'Tidak memerlukan pendingin' },
    REFRIGERATED: { label: 'Dingin (Kulkas)', description: 'Perlu disimpan di kulkas (2-8°C)' },
    FROZEN: { label: 'Beku (Freezer)', description: 'Perlu disimpan di freezer (<-18°C)' },
} as const;

// ============================================
// PACKAGING TYPES
// ============================================

export const PACKAGING_TYPES = {
    PACKAGED: { label: 'Terkemas' },
    UNPACKAGED: { label: 'Tanpa Kemasan' },
    PARTIAL: { label: 'Sebagian Terkemas' },
} as const;

// ============================================
// USER ROLES
// ============================================

export const USER_ROLES = {
    PROVIDER: { label: 'Food Provider', description: 'Restoran, bakery, hotel, supermarket, dll.' },
    CONSUMER: { label: 'Konsumen / Individu', description: 'Penerima manfaat individu' },
    RESCUE_PARTNER: { label: 'Rescue Partner', description: 'Organisasi redistribusi makanan' },
    ADMIN: { label: 'Administrator', description: 'Admin platform FoodBridge' },
} as const;

// ============================================
// STATUS LABELS
// ============================================

export const SURPLUS_STATUS = {
    AVAILABLE: { label: 'Tersedia', color: '#2D8A4E', bgColor: '#E8F5E9' },
    PARTIALLY_CLAIMED: { label: 'Sebagian Diklaim', color: '#E67E22', bgColor: '#FFF3E0' },
    FULLY_CLAIMED: { label: 'Terklaim Semua', color: '#3498DB', bgColor: '#E3F2FD' },
    EXPIRED: { label: 'Kedaluwarsa', color: '#C0392B', bgColor: '#FFEBEE' },
    RESCUED: { label: 'Terselamatkan', color: '#2D8A4E', bgColor: '#E8F5E9' },
} as const;

export const CLAIM_STATUS = {
    PENDING: { label: 'Menunggu', color: '#E67E22', bgColor: '#FFF3E0' },
    CONFIRMED: { label: 'Dikonfirmasi', color: '#3498DB', bgColor: '#E3F2FD' },
    PICKED_UP: { label: 'Sudah Diambil', color: '#2D8A4E', bgColor: '#E8F5E9' },
    CANCELLED: { label: 'Dibatalkan', color: '#C0392B', bgColor: '#FFEBEE' },
    EXPIRED: { label: 'Kedaluwarsa', color: '#95A5A6', bgColor: '#F5F5F5' },
} as const;

export const RESCUE_STATUS = {
    REQUESTED: { label: 'Diminta', color: '#E67E22', bgColor: '#FFF3E0' },
    ACCEPTED: { label: 'Diterima', color: '#3498DB', bgColor: '#E3F2FD' },
    PICKING_UP: { label: 'Sedang Pickup', color: '#9B59B6', bgColor: '#F3E5F5' },
    VERIFYING: { label: 'Verifikasi', color: '#D4A843', bgColor: '#FFF8E1' },
    COMPLETED: { label: 'Selesai', color: '#2D8A4E', bgColor: '#E8F5E9' },
    REJECTED: { label: 'Ditolak', color: '#C0392B', bgColor: '#FFEBEE' },
    FAILED: { label: 'Gagal', color: '#C0392B', bgColor: '#FFEBEE' },
} as const;

export const TRACKING_STATUS = {
    LISTED: { label: 'Terdaftar', color: '#95A5A6' },
    MATCHED: { label: 'Tercocokkan', color: '#3498DB' },
    CLAIMED: { label: 'Diklaim', color: '#2D8A4E' },
    PICKUP_READY: { label: 'Siap Diambil', color: '#E67E22' },
    IN_TRANSIT: { label: 'Dalam Perjalanan', color: '#9B59B6' },
    DELIVERED: { label: 'Diterima', color: '#3498DB' },
    VERIFIED: { label: 'Terverifikasi', color: '#2D8A4E' },
    CANCELLED: { label: 'Dibatalkan', color: '#C0392B' },
    DISQUALIFIED: { label: 'Didiskualifikasi', color: '#C0392B' },
} as const;

// ============================================
// IMPACT CALCULATION
// ============================================

export const IMPACT_FACTORS = {
    CO2_PER_KG_FOOD_WASTE: 2.5, // kg CO2 per kg food waste (IPCC average)
    WATER_PER_KG_FOOD: 1000,     // liters of water per kg food
    MEALS_PER_KG: 2,              // average meals per kg of food
} as const;

// ============================================
// MATCHING ALGORITHM
// ============================================

export const MATCHING_WEIGHTS = {
    distance: 0.25,
    urgency: 0.20,
    foodTypeMatch: 0.15,
    quantityFit: 0.15,
    reliabilityScore: 0.10,
    partnerCapacity: 0.10,
    routeEfficiency: 0.05,
} as const;

export const MATCHING_CONFIG = {
    maxDistanceKm: 15,        // Max distance for matching in Surabaya area
    minScore: 0.3,             // Minimum match score to show
    topMatchCount: 10,         // Top N matches to return for consumers
    topPartnerCount: 3,        // Top N partners to notify
    autoRescueDelayMinutes: 60, // Time before auto-routing to Food Rescue
} as const;

// ============================================
// SDG INFO
// ============================================

export const SDG_INFO = [
    {
        number: 11,
        title: 'Kota & Permukiman Berkelanjutan',
        description: 'Mengurangi food waste di kota untuk ekosistem pangan berkelanjutan',
        color: '#F99D26',
    },
    {
        number: 13,
        title: 'Penanganan Perubahan Iklim',
        description: 'Setiap kg makanan diselamatkan = pengurangan emisi CO2',
        color: '#48773C',
    },
    {
        number: 9,
        title: 'Industri, Inovasi & Infrastruktur',
        description: 'Smart matching sebagai inovasi infrastruktur distribusi pangan digital',
        color: '#FD6925',
    },
    {
        number: 4,
        title: 'Pendidikan Berkualitas',
        description: 'Edukasi food waste awareness dan budaya berbagi',
        color: '#C5192D',
    },
] as const;

// ============================================
// PROVIDER TYPES (for registration)
// ============================================

export const PROVIDER_TYPES = [
    { value: 'restaurant', label: 'Restoran' },
    { value: 'bakery', label: 'Bakery / Toko Roti' },
    { value: 'retail', label: 'Retail (Indomaret, FamilyMart, dll)' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'catering', label: 'Catering / Event' },
    { value: 'supermarket', label: 'Supermarket' },
    { value: 'farm', label: 'Farm / Household' },
    { value: 'other', label: 'Lainnya' },
] as const;

export const PARTNER_TYPES = [
    { value: 'panti', label: 'Panti Asuhan' },
    { value: 'shelter', label: 'Shelter' },
    { value: 'food_bank', label: 'Food Bank' },
    { value: 'ngo', label: 'NGO / Yayasan' },
    { value: 'community_kitchen', label: 'Dapur Umum / Komunitas' },
    { value: 'other', label: 'Lainnya' },
] as const;
