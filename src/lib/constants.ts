// ============================================
// APP CONSTANTS
// ============================================

export const APP_NAME = 'Replate';
export const APP_TAGLINE = 'Digital Food Redistribution Ecosystem';
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
    CONSUMER: { label: 'Konsumen / Individu', description: 'Penerima manfaat individu (Anak Kos, Dll)' },
    YAYASAN: { label: 'Yayasan / Panti Asuhan', description: 'Panti Asuhan, Yayasan Sosial, & Lembaga Non-Profit' },
    RESCUE_PARTNER: { label: 'Rescue Partner / Komunitas', description: 'Organisasi redistribusi & kurir komunitas' },
    ADMIN: { label: 'Administrator', description: 'Admin platform Replate' },
} as const;

export const SURABAYA_REGIONS = [
    { value: 'all', label: 'Semua Wilayah' },
    { value: 'surabaya_pusat', label: 'Surabaya Pusat' },
    { value: 'surabaya_timur', label: 'Surabaya Timur' },
    { value: 'surabaya_barat', label: 'Surabaya Barat' },
    { value: 'surabaya_selatan', label: 'Surabaya Selatan' },
    { value: 'surabaya_utara', label: 'Surabaya Utara' },
] as const;

export const INDONESIA_CITIES_REGIONS = [
    { value: 'Surabaya Pusat', label: 'Surabaya Pusat (Genteng, Tegalsari, Gubeng)', city: 'Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
    { value: 'Surabaya Timur', label: 'Surabaya Timur (Rungkut, Sukolilo, Mulyorejo)', city: 'Surabaya', province: 'Jawa Timur', lat: -7.2890, lng: 112.7830 },
    { value: 'Surabaya Barat', label: 'Surabaya Barat (Wiyung, Tandes, Sambikerep)', city: 'Surabaya', province: 'Jawa Timur', lat: -7.2750, lng: 112.6750 },
    { value: 'Surabaya Selatan', label: 'Surabaya Selatan (Wonokromo, Gayungan, Jambangan)', city: 'Surabaya', province: 'Jawa Timur', lat: -7.3100, lng: 112.7300 },
    { value: 'Surabaya Utara', label: 'Surabaya Utara (Kenjeran, Pabean, Semampir)', city: 'Surabaya', province: 'Jawa Timur', lat: -7.2150, lng: 112.7450 },
    { value: 'Sidoarjo', label: 'Sidoarjo (Waru, Gedangan, Kota Sidoarjo)', city: 'Sidoarjo', province: 'Jawa Timur', lat: -7.4478, lng: 112.7183 },
    { value: 'Gresik', label: 'Gresik (Kebomas, Manyar, Driyorejo)', city: 'Gresik', province: 'Jawa Timur', lat: -7.1566, lng: 112.6555 },
    { value: 'Malang Raya', label: 'Malang Raya (Klojen, Lowokwaru, Kota Batu)', city: 'Malang', province: 'Jawa Timur', lat: -7.9797, lng: 112.6304 },
    { value: 'Jakarta Pusat', label: 'DKI Jakarta - Jakarta Pusat (Menteng, Tanah Abang)', city: 'Jakarta Pusat', province: 'DKI Jakarta', lat: -6.1805, lng: 106.8284 },
    { value: 'Jakarta Selatan', label: 'DKI Jakarta - Jakarta Selatan (Tebet, Kebayoran, Cilandak)', city: 'Jakarta Selatan', province: 'DKI Jakarta', lat: -6.2615, lng: 106.8106 },
    { value: 'Jakarta Barat', label: 'DKI Jakarta - Jakarta Barat (Grogol, Kembangan, Kebon Jeruk)', city: 'Jakarta Barat', province: 'DKI Jakarta', lat: -6.1683, lng: 106.7588 },
    { value: 'Jakarta Timur', label: 'DKI Jakarta - Jakarta Timur (Jatinegara, Cakung, Duren Sawit)', city: 'Jakarta Timur', province: 'DKI Jakarta', lat: -6.2250, lng: 106.9004 },
    { value: 'Jakarta Utara', label: 'DKI Jakarta - Jakarta Utara (Kelapa Gading, Pluit, Tanjung Priok)', city: 'Jakarta Utara', province: 'DKI Jakarta', lat: -6.1384, lng: 106.8640 },
    { value: 'Jabodetabek', label: 'Jabodetabek (Bekasi, Depok, Tangerang, Bogor)', city: 'Tangerang', province: 'Banten', lat: -6.1783, lng: 106.6319 },
    { value: 'Bandung Raya', label: 'Bandung Raya (Coblong, Dago, Sukasari, Cimahi)', city: 'Bandung', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
    { value: 'Semarang', label: 'Semarang (Candisari, Banyumanik, Gajahmungkur)', city: 'Semarang', province: 'Jawa Tengah', lat: -6.9932, lng: 110.4203 },
    { value: 'Solo / Surakarta', label: 'Solo / Surakarta (Banjarsari, Laweyan, Jebres)', city: 'Surakarta', province: 'Jawa Tengah', lat: -7.5755, lng: 110.8243 },
    { value: 'DI Yogyakarta', label: 'DI Yogyakarta & Sleman (Depok, Gondomanan, Danurejan)', city: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { value: 'Medan', label: 'Medan (Medan Baru, Medan Kota, Petisah)', city: 'Medan', province: 'Sumatera Utara', lat: 3.5952, lng: 98.6722 },
    { value: 'Palembang', label: 'Palembang (Ilir Barat, Seberang Ulu, Sukarami)', city: 'Palembang', province: 'Sumatera Selatan', lat: -2.9909, lng: 104.7565 },
    { value: 'Denpasar & Badung', label: 'Denpasar & Badung (Kuta, Sanur, Denpasar Selatan)', city: 'Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126 },
    { value: 'Makassar', label: 'Makassar (Panakkukang, Tamalanrea, Ujung Pandang)', city: 'Makassar', province: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327 },
] as const;

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
        number: 2,
        title: 'Tanpa Kelaparan (Zero Hunger)',
        description: 'Redistribusi surplus pangan layak konsumsi untuk panti asuhan, yayasan sosial, dan kaum dhuafa.',
        color: '#DDA63A',
        badgeColor: 'bg-amber-600',
    },
    {
        number: 9,
        title: 'Industri, Inovasi & Infrastruktur',
        description: 'Smart Matching Engine 2.0 & Geofencing GPS sebagai infrastruktur digital redistribusi pangan.',
        color: '#FD6925',
        badgeColor: 'bg-orange-600',
    },
    {
        number: 11,
        title: 'Kota & Komunitas Berkelanjutan',
        description: 'Mewujudkan ekosistem kota sirkular zero-waste di seluruh Indonesia dan menekan timbulan sampah di Tempat Pembuangan Akhir (TPA).',
        color: '#F99D26',
        badgeColor: 'bg-amber-500',
    },
    {
        number: 12,
        title: 'Konsumsi & Produksi Bertanggung Jawab',
        description: 'Target 12.3: Mengurangi 50% food waste per kapita via Rescue Sale diskon murah & SOP Higienitas BPOM.',
        color: '#BF8B2E',
        badgeColor: 'bg-yellow-700',
    },
    {
        number: 13,
        title: 'Penanganan Perubahan Iklim',
        description: 'Pencegahan gas metana (CH4) dan reduksi 2.5 kg CO2e per 1 kg makanan terselamatkan (Standar IPCC).',
        color: '#3F7E44',
        badgeColor: 'bg-emerald-700',
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
