export interface SharedPantiNeed {
  id: string;
  pantiName: string;
  shelterType: string;
  needTitle: string;
  requestedItem: string;
  foodCategoryNeeded: string;
  targetQuantity: number;
  fulfilledQuantity: string;
  beneficiariesCount: number;
  urgency: 'HIGH' | 'MEDIUM';
  urgencyLabel: string;
  location: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  cutoffTime: string;
  deadline: string;
  distance: string;
  matchScore: number;
  imageUrl: string;
  legalStatus: string;
  legalPermit: string;
  notes: string;
  preferredDelivery: 'RESCUE_COURIER' | 'PROVIDER_DIRECT' | 'SHELTER_PICKUP';
  deliveryLabel: string;
  deliveryDesc: string;
  lat: number;
  lng: number;
  reasons: string[];
  breakdown: { label: string; score: number; max: number; desc: string }[];
}

export const SHARED_PANTI_NEEDS: SharedPantiNeed[] = [
  {
    id: 'PNT-SBY-001',
    pantiName: 'Panti Asuhan Kasih Ibu',
    shelterType: 'Panti Asuhan Anak Yatim',
    needTitle: '50 Porsi Nasi Kotak & Lauk Bergizi',
    requestedItem: 'Nasi Kotak / Paket Lauk Pauk Bergizi',
    foodCategoryNeeded: 'Makanan Olahan (Meals)',
    targetQuantity: 50,
    fulfilledQuantity: '30 Porsi',
    beneficiariesCount: 45,
    urgency: 'HIGH',
    urgencyLabel: 'URGENT MAKAN MALAM HARI INI',
    location: 'Surabaya (Gubeng)',
    address: 'Jl. Dharmawangsa No. 24, Airlangga, Gubeng, Surabaya',
    contactPerson: 'Ibu Hajjah Maryam',
    contactPhone: '081298765432',
    cutoffTime: '19:30 WIB',
    deadline: 'Hari ini sebelum 19:30 WIB',
    distance: '1.2 km (Gubeng, Surabaya)',
    matchScore: 96,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos Jatim',
    legalPermit: 'DINSOS-SBY/2023/8912',
    notes: 'Membutuhkan 40-50 porsi nasi lauk pauk bergizi untuk makan malam anak-anak panti.',
    preferredDelivery: 'RESCUE_COURIER',
    deliveryLabel: ' Diantar Food Rescue Courier (Komunitas Relawan Food Bank)',
    deliveryDesc: 'Panti tidak memiliki armada penjemputan, sehingga sistem menugaskan kurir relawan motor box steril.',
    lat: -7.2710,
    lng: 112.7580,
    reasons: [
      'Radius GPS 1.2 km dari outlet terdekat (Proksimitas sangat tinggi)',
      'Kebutuhan gizi lauk pauk protein cocok dengan menu surplus',
      'Batas penjemputan sebelum 19:30 WIB (Kurir relawan siaga)',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 35, max: 35, desc: 'Radius 1.2 km dari mitra' },
      { label: 'Kesesuaian Kategori Pangan', score: 28, max: 30, desc: 'Menu protein siap santap memenuhi kebutuhan panti' },
      { label: 'Urgensi Waktu Konsumsi', score: 19, max: 20, desc: 'Batas penjemputan < 2.5 jam (Makan Malam)' },
      { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Tervalidasi Halal BPJPH & Dapur Higienis' },
    ],
  },
  {
    id: 'PNT-JKT-002',
    pantiName: 'Shelter Dhuafa & Rumah Singgah Berkah',
    shelterType: 'Shelter & Rumah Singgah',
    needTitle: '60 Porsi Makanan Siap Santap / Prasmanan',
    requestedItem: 'Surplus Makanan Katering / Prasmanan Bersih',
    foodCategoryNeeded: 'Makanan Olahan (Meals)',
    targetQuantity: 60,
    fulfilledQuantity: '25 Porsi',
    beneficiariesCount: 50,
    urgency: 'HIGH',
    urgencyLabel: 'URGENT DISTRIBUSI MALAM',
    location: 'Jakarta (Tebet)',
    address: 'Jl. Tebet Barat Dalam No. 45, Tebet, Jakarta Selatan',
    contactPerson: 'Mas Dedi Relawan',
    contactPhone: '081567890123',
    cutoffTime: '21:00 WIB',
    deadline: 'Hari ini sebelum 21:00 WIB',
    distance: '2.4 km (Tebet, Jakarta)',
    matchScore: 92,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos DKI',
    legalPermit: 'DINSOS-DKI/2024/1109',
    notes: 'Membutuhkan porsi makanan surplus siap santap untuk pembagian malam relawan dan warga rentan binaan.',
    preferredDelivery: 'PROVIDER_DIRECT',
    deliveryLabel: ' Diantar Armada Toko Provider / Ambil Mandiri Oleh Pengurus',
    deliveryDesc: 'Pengurus shelter memiliki kendaraan roda 3 dan siap mengambil mandiri ke outlet.',
    lat: -6.2361,
    lng: 106.8527,
    reasons: [
      'Jarak tempuh 2.4 km dari koridor Tebet',
      'Kebutuhan shelter 60 porsi (Bisa dipenuhi sebagian atau penuh)',
      'Pengurus siap mengambil mandiri ke outlet sebelum 21:00 WIB',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 32, max: 35, desc: 'Radius 2.4 km dari gerai' },
      { label: 'Kesesuaian Kategori Pangan', score: 27, max: 30, desc: 'Menu siap santap higienis' },
      { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan < 3 jam' },
      { label: 'Standar Higienitas BPOM & Halal', score: 15, max: 15, desc: 'Terkemas steril food grade' },
    ],
  },
  {
    id: 'PNT-BDG-003',
    pantiName: 'Yayasan Yatim Dhuafa Insan Cemerlang',
    shelterType: 'Panti Asuhan & Pusat Belajar',
    needTitle: '35 Porsi Roti & Susu Nutrisi Sehat',
    requestedItem: 'Roti Gandum, Susu Steril & Buah Potong',
    foodCategoryNeeded: 'Roti, Buah & Susu (Bakery & Dairy)',
    targetQuantity: 35,
    fulfilledQuantity: '15 Porsi',
    beneficiariesCount: 35,
    urgency: 'MEDIUM',
    urgencyLabel: 'DISTRIBUSI NUTRISI SORE',
    location: 'Bandung (Dago)',
    address: 'Jl. Ir. H. Juanda No. 12, Dago, Coblong, Bandung',
    contactPerson: 'Ustadz Ahmad',
    contactPhone: '081277889900',
    cutoffTime: '20:00 WIB',
    deadline: 'Hari ini sebelum 20:00 WIB',
    distance: '2.6 km (Dago, Bandung)',
    matchScore: 90,
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos Jabar',
    legalPermit: 'DINSOS-JBR/2024/0912',
    notes: 'Membutuhkan 30-35 paket snack roti & susu sehat untuk santri panti asuhan.',
    preferredDelivery: 'RESCUE_COURIER',
    deliveryLabel: ' Diantar Food Rescue Courier (Komunitas Relawan Food Bank)',
    deliveryDesc: 'Kurir relawan motor box pendingin siap mengantar langsung ke panti.',
    lat: -6.8856,
    lng: 107.6139,
    reasons: [
      'Radius 2.6 km dari kawasan Dago',
      'Kebutuhan nutrisi roti / menu sehat sangat cocok',
      'Kurir relawan siaga di koridor Dago - Dipatiukur',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 34, max: 35, desc: 'Radius 2.6 km' },
      { label: 'Kesesuaian Kategori Pangan', score: 26, max: 30, desc: 'Kategori makanan sehat cocok' },
      { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan jam 20:00 WIB' },
      { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Higienis & Halal' },
    ],
  },
  {
    id: 'PNT-YGY-004',
    pantiName: 'Panti Asuhan Balita Kasih Bunda',
    shelterType: 'Panti Asuhan Bayi & Balita',
    needTitle: '40 Kotak Susu Formula Balita & Biskuit Nutrisi Bayi',
    requestedItem: 'Susu Formula Balita & Nutrisi Bayi',
    foodCategoryNeeded: 'Roti, Buah & Susu (Bakery & Dairy)',
    targetQuantity: 40,
    fulfilledQuantity: '10 Porsi',
    beneficiariesCount: 20,
    urgency: 'HIGH',
    urgencyLabel: 'URGENT NUTRISI BALITA',
    location: 'Yogyakarta (Sleman)',
    address: 'Jl. Kaliurang Km 5.5, Depok, Sleman, DI Yogyakarta',
    contactPerson: 'Suster Yohana',
    contactPhone: '081399887766',
    cutoffTime: '19:00 WIB',
    deadline: 'Hari ini sebelum 19:00 WIB',
    distance: '1.8 km (Sleman, Yogyakarta)',
    matchScore: 88,
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos DIY',
    legalPermit: 'DINSOS-DIY/2024/0411',
    notes: 'Khusus membutuhkan susu formula balita 1-3 tahun dan biskuit bubur bayi bergizi tinggi.',
    preferredDelivery: 'RESCUE_COURIER',
    deliveryLabel: ' Diantar Food Rescue Courier (Motor Box Cooler Steril Khusus)',
    deliveryDesc: 'Wajib kurir dengan thermal box dingin untuk produk susu steril & biskuit bayi.',
    lat: -7.7554,
    lng: 110.3846,
    reasons: [
      'Radius 1.8 km dari mitra terdekat',
      'Kebutuhan spesifik nutrisi balita',
      'Pemberian prioritas tinggi distribusi',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 35, max: 35, desc: 'Radius 1.8 km' },
      { label: 'Kesesuaian Kategori Pangan', score: 25, max: 30, desc: 'Kategori nutrisi bayi & balita' },
      { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan 19:00 WIB' },
      { label: 'Standar Higienitas BPOM & Halal', score: 15, max: 15, desc: 'Steril & Segel Pabrik' },
    ],
  },
  {
    id: 'PNT-MDN-005',
    pantiName: 'Panti Asuhan Al-Ikhlas Peduli',
    shelterType: 'Panti Asuhan Anak Yatim',
    needTitle: '45 Porsi Nasi Kotak & Lauk Bergizi',
    requestedItem: 'Nasi Kotak / Paket Lauk Siap Santap',
    foodCategoryNeeded: 'Makanan Olahan (Meals)',
    targetQuantity: 45,
    fulfilledQuantity: '20 Porsi',
    beneficiariesCount: 40,
    urgency: 'HIGH',
    urgencyLabel: 'URGENT MAKAN SIANG',
    location: 'Medan (Medan Baru)',
    address: 'Jl. Padang Bulan No. 88, Medan Baru, Kota Medan',
    contactPerson: 'Bpk. Rizal Lubis',
    contactPhone: '081266778899',
    cutoffTime: '18:00 WIB',
    deadline: 'Hari ini sebelum 18:00 WIB',
    distance: '3.0 km (Medan Baru)',
    matchScore: 91,
    imageUrl: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos Sumut',
    legalPermit: 'DINSOS-SMT/2024/3301',
    notes: 'Membutuhkan bantuan paket nasi lauk higienis untuk santri yatim piatu dan dhuafa.',
    preferredDelivery: 'RESCUE_COURIER',
    deliveryLabel: ' Diantar Food Rescue Courier Relawan',
    deliveryDesc: 'Kurir relawan motor box steril siap mengantar langsung ke panti.',
    lat: 3.5852,
    lng: 98.6756,
    reasons: [
      'Radius 3.0 km dari mitra terdekat',
      'Kategori makanan olahan bergizi',
      'Verifikasi Dinsos Sumut',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 32, max: 35, desc: 'Radius 3.0 km' },
      { label: 'Kesesuaian Kategori Pangan', score: 28, max: 30, desc: 'Menu protein siap santap' },
      { label: 'Urgensi Waktu Konsumsi', score: 19, max: 20, desc: 'Batas penjemputan sore' },
      { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Tervalidasi Halal BPJPH' },
    ],
  },
  {
    id: 'PNT-SMG-006',
    pantiName: 'Panti Werdha Lansia Harapan Hidup',
    shelterType: 'Panti Werdha (Lansia)',
    needTitle: '30 Porsi Bubur Ayam & Buah Segar Lembut',
    requestedItem: 'Bubur Ayam Lembut, Buah Pisang & Susu Lansia',
    foodCategoryNeeded: 'Makanan Olahan (Meals)',
    targetQuantity: 30,
    fulfilledQuantity: '10 Porsi',
    beneficiariesCount: 28,
    urgency: 'MEDIUM',
    urgencyLabel: 'SARAPAN & NUTRISI LANSIA',
    location: 'Semarang (Candisari)',
    address: 'Jl. Teuku Umar No. 33, Candisari, Kota Semarang',
    contactPerson: 'Ibu Ratna Dewi',
    contactPhone: '081322334455',
    cutoffTime: '19:00 WIB',
    deadline: 'Besok Pagi sebelum 09:00 WIB',
    distance: '2.1 km (Candisari, Semarang)',
    matchScore: 88,
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos Jateng',
    legalPermit: 'DINSOS-JTG/2023/1820',
    notes: 'Dibutuhkan makanan lembut bergizi rendah gula dan garam untuk warga binaan lansia.',
    preferredDelivery: 'RESCUE_COURIER',
    deliveryLabel: ' Diantar Food Rescue Courier Relawan',
    deliveryDesc: 'Kurir relawan siap jemput dan antar steril.',
    lat: -7.0125,
    lng: 110.4289,
    reasons: [
      'Radius 2.1 km dari mitra terdekat',
      'Menu tekstur lembut lansia',
      'Standar kebersihan tinggi',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 33, max: 35, desc: 'Radius 2.1 km' },
      { label: 'Kesesuaian Kategori Pangan', score: 25, max: 30, desc: 'Menu nutrisi lansia' },
      { label: 'Urgensi Waktu Konsumsi', score: 17, max: 20, desc: 'Jadwal terencana' },
      { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Steril & Higienis' },
    ],
  },
];

export function deduplicatePantiNeeds<T extends { id?: string; pantiName?: string; needTitle?: string; imageUrl?: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  return items.filter((item) => {
    if (!item) return false;
    const idKey = item.id ? String(item.id).trim().toLowerCase() : null;
    
    // Normalize name by removing generic prefixes and non-alphanumeric chars
    const rawName = (item.pantiName || '').trim().toLowerCase();
    const cleanName = rawName.replace(/panti\s*asuhan|yayasan|rumah\s*singgah|shelter/gi, '').replace(/[^a-z0-9]/g, '');
    const nameKey = cleanName.length > 2 ? cleanName : rawName.replace(/[^a-z0-9]/g, '');

    if (idKey && seenIds.has(idKey)) return false;
    if (nameKey && seenNames.has(nameKey)) return false;

    if (idKey) seenIds.add(idKey);
    if (nameKey) seenNames.add(nameKey);
    return true;
  });
}

