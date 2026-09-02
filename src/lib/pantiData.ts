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
    pantiName: 'Panti Asuhan Kasih Ibu Surabaya',
    shelterType: 'Panti Asuhan Anak Yatim',
    needTitle: '50 Porsi Nasi Kotak & Lauk Bergizi',
    requestedItem: 'Nasi Kotak / Paket Lauk Pauk Bergizi',
    foodCategoryNeeded: 'Makanan Olahan (Meals)',
    targetQuantity: 50,
    fulfilledQuantity: '30 Porsi',
    beneficiariesCount: 45,
    urgency: 'HIGH',
    urgencyLabel: 'URGENT MAKAN MALAM HARI INI',
    location: 'Surabaya Timur (Gubeng)',
    address: 'Jl. Dharmawangsa No. 24, Airlangga, Gubeng, Surabaya',
    contactPerson: 'Ibu Hajjah Maryam',
    contactPhone: '081298765432',
    cutoffTime: '19:30 WIB',
    deadline: 'Hari ini sebelum 19:30 WIB',
    distance: '1.2 km (Dharmawangsa, Gubeng)',
    matchScore: 96,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos Jatim',
    legalPermit: 'DINSOS-SBY/2023/8912',
    notes: 'Membutuhkan 40-50 porsi nasi lauk pauk bergizi untuk makan malam anak-anak panti.',
    preferredDelivery: 'RESCUE_COURIER',
    deliveryLabel: '🛵 Diantar Food Rescue Courier (Komunitas Relawan Food Bank Surabaya)',
    deliveryDesc: 'Panti tidak memiliki armada penjemputan, sehingga sistem menugaskan kurir relawan motor box steril.',
    lat: -7.2710,
    lng: 112.7580,
    reasons: [
      'Radius GPS 1.2 km dari outlet Gubeng (Proksimitas sangat tinggi)',
      'Kebutuhan gizi lauk pauk protein cocok dengan menu surplus Anda',
      'Batas penjemputan sebelum 19:30 WIB (Kurir relawan siaga di area Gubeng)',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 35, max: 35, desc: 'Radius 1.2 km dari outlet Gubeng' },
      { label: 'Kesesuaian Kategori Pangan', score: 28, max: 30, desc: 'Menu protein siap santap memenuhi kebutuhan panti' },
      { label: 'Urgensi Waktu Konsumsi', score: 19, max: 20, desc: 'Batas penjemputan < 2.5 jam (Makan Malam)' },
      { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Tervalidasi Halal BPJPH & Dapur Higienis' },
    ],
  },
  {
    id: 'PNT-SBY-002',
    pantiName: 'Shelter Dhuafa & Anak Jalanan Genteng',
    shelterType: 'Shelter & Rumah Singgah',
    needTitle: '60 Porsi Makanan Siap Santap / Prasmanan',
    requestedItem: 'Surplus Makanan Katering / Prasmanan Bersih',
    foodCategoryNeeded: 'Makanan Olahan (Meals)',
    targetQuantity: 60,
    fulfilledQuantity: '10 Porsi',
    beneficiariesCount: 25,
    urgency: 'HIGH',
    urgencyLabel: 'URGENT DISTRIBUSI MALAM',
    location: 'Surabaya Pusat (Genteng)',
    address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
    contactPerson: 'Mas Dedi Relawan',
    contactPhone: '081567890123',
    cutoffTime: '21:00 WIB',
    deadline: 'Hari ini sebelum 21:00 WIB',
    distance: '3.4 km (Genteng Kali, Surabaya Pusat)',
    matchScore: 89,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Pemkot Surabaya',
    legalPermit: 'DINSOS-SBY/2024/1109',
    notes: 'Membutuhkan porsi makanan surplus siap santap untuk pembagian malam relawan.',
    preferredDelivery: 'PROVIDER_DIRECT',
    deliveryLabel: '🚚 Diantar Armada Toko Provider / Ambil Mandiri Oleh Pengurus',
    deliveryDesc: 'Pengurus shelter memiliki kendaraan roda 3 dan siap mengambil mandiri ke outlet.',
    lat: -7.2560,
    lng: 112.7420,
    reasons: [
      'Jarak tempuh 3.4 km (Gubeng menuju Genteng Pusat)',
      'Kebutuhan shelter 60 porsi (Bisa dipenuhi sebagian atau penuh)',
      'Pengurus siap mengambil mandiri ke outlet sebelum 21:00 WIB',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 32, max: 35, desc: 'Radius 3.4 km dari toko Gubeng' },
      { label: 'Kesesuaian Kategori Pangan', score: 25, max: 30, desc: 'Kecukupan porsi 65% terpenuhi' },
      { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan < 3.5 jam' },
      { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Terkemas steril food grade' },
    ],
  },
  {
    id: 'PNT-SBY-003',
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
    location: 'Surabaya Timur (Manyar)',
    address: 'Jl. Manyar Kertoarjo No. 12, Mulyorejo, Surabaya',
    contactPerson: 'Ustadz Ahmad',
    contactPhone: '081277889900',
    cutoffTime: '20:00 WIB',
    deadline: 'Hari ini sebelum 20:00 WIB',
    distance: '2.6 km (Manyar Kertoarjo, Surabaya Timur)',
    matchScore: 92,
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos Jatim',
    legalPermit: 'DINSOS-SBY/2024/0912',
    notes: 'Membutuhkan 30-35 paket snack roti & susu sehat untuk santri panti.',
    preferredDelivery: 'RESCUE_COURIER',
    deliveryLabel: '🛵 Diantar Food Rescue Courier (Komunitas Relawan Food Bank Surabaya)',
    deliveryDesc: 'Kurir relawan motor box pendingin siap mengantar langsung ke panti.',
    lat: -7.2810,
    lng: 112.7720,
    reasons: [
      'Radius 2.6 km dari outlet Gubeng ke Manyar Kertoarjo',
      'Kebutuhan nutrisi roti / menu sehat sangat cocok',
      'Kurir relawan siaga di koridor Kertajaya - Manyar',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 34, max: 35, desc: 'Radius 2.6 km dari toko' },
      { label: 'Kesesuaian Kategori Pangan', score: 26, max: 30, desc: 'Kategori makanan sehat cocok' },
      { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan jam 20:00 WIB' },
      { label: 'Standar Higienitas BPOM & Halal', score: 14, max: 15, desc: 'Higienis & Halal' },
    ],
  },
  {
    id: 'PNT-SBY-004',
    pantiName: 'Panti Asuhan Balita Kasih Bunda',
    shelterType: 'Panti Asuhan Bayi & Balita',
    needTitle: '40 Kotak Susu Formula Balita & Biskuit Nutrisi Bayi',
    requestedItem: 'Susu Formula Balita & Nutrisi Bayi',
    foodCategoryNeeded: 'Roti, Buah & Susu (Bakery & Dairy)',
    targetQuantity: 40,
    fulfilledQuantity: '5 Porsi',
    beneficiariesCount: 20,
    urgency: 'HIGH',
    urgencyLabel: 'URGENT NUTRISI BALITA',
    location: 'Surabaya Timur (Kertajaya)',
    address: 'Jl. Kertajaya Indah No. 56, Gubeng, Surabaya',
    contactPerson: 'Suster Yohana',
    contactPhone: '081399887766',
    cutoffTime: '19:00 WIB',
    deadline: 'Hari ini sebelum 19:00 WIB',
    distance: '1.8 km (Kertajaya Indah, Gubeng)',
    matchScore: 35,
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=60',
    legalStatus: 'Terverifikasi Dinsos Jatim',
    legalPermit: 'DINSOS-SBY/2024/0411',
    notes: 'Khusus membutuhkan susu formula balita 1-3 tahun dan biskuit bubur bayi. Bukan makanan pedas/lauk berat.',
    preferredDelivery: 'RESCUE_COURIER',
    deliveryLabel: '🛵 Diantar Food Rescue Courier (Motor Box Cooler Steril Khusus)',
    deliveryDesc: 'Wajib kurir dengan thermal box dingin untuk produk susu steril & biskuit bayi.',
    lat: -7.2790,
    lng: 112.7610,
    reasons: [
      'Radius 1.8 km dari outlet Gubeng',
      'Kebutuhan SPESIFIK: Susu Formula Balita & Makanan Lembut Bayi',
      'Perlu validasi ketat kecocokan kategori gizi',
    ],
    breakdown: [
      { label: 'Proksimitas Geofencing GPS', score: 35, max: 35, desc: 'Radius 1.8 km dari toko' },
      { label: 'Kesesuaian Kategori Pangan', score: 5, max: 30, desc: 'Kategori susu formula khusus balita' },
      { label: 'Urgensi Waktu Konsumsi', score: 18, max: 20, desc: 'Batas penjemputan 19:00 WIB' },
      { label: 'Standar Higienitas BPOM & Halal', score: 15, max: 15, desc: 'Steril & Segel Pabrik' },
    ],
  },
];
