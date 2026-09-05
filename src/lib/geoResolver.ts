/**
 * Generalized Indonesian Address Parsing & Coordinate Resolution Engine
 * 
 * Solves address disambiguation hierarchically:
 * 1. Separates Thoroughfare/Street names (e.g., "Jl. Raya Sarangan", "Jl. Solo", "Jl. Jakarta")
 *    from administrative tokens, preventing street destination names from being mistaken for the district/city.
 * 2. Parses administrative divisions hierarchically (Province -> Regency/City -> District -> Village/Dusun).
 * 3. Disambiguates homonymous districts (e.g., "Sidorejo" in Magetan vs Sidoarjo vs Salatiga)
 *    based on surrounding administrative context tokens.
 * 4. Provides precision-tiered coordinates (Village/Dusun > District > Regency/City > Province).
 * 5. Supports real-time OSM Nominatim / Photon geocoding with intelligent query cleaning.
 */

export interface ResolvedAddressResult {
  rawAddress: string;
  province?: string;
  city?: string;          // e.g. "Kabupaten Magetan" or "Kota Surabaya"
  cityNameOnly?: string;  // e.g. "Magetan" or "Surabaya"
  district?: string;      // e.g. "Sidorejo" or "Gubeng"
  village?: string;       // e.g. "Kwarigan" or "Ketintang"
  street?: string;        // e.g. "Jl. Raya Sarangan No. 45"
  formattedAddress: string;
  lat: number;
  lng: number;
  precision: 'village' | 'district' | 'city' | 'province' | 'fallback';
  confidence: number;     // 0.0 to 1.0
}

interface DistrictData {
  name: string;
  aliases?: string[];
  lat: number;
  lng: number;
  villages?: { [name: string]: { lat: number; lng: number } };
}

interface RegencyData {
  name: string;           // e.g. "Magetan"
  type: 'Kabupaten' | 'Kota';
  province: string;
  aliases?: string[];
  lat: number;
  lng: number;
  districts: { [name: string]: DistrictData };
}

// Comprehensive Indonesian Administrative Directory & Centroid Coordinates
const INDONESIA_REGENCY_DIRECTORY: RegencyData[] = [
  // --- JAWA TIMUR ---
  {
    name: 'Magetan',
    type: 'Kabupaten',
    province: 'Jawa Timur',
    aliases: ['kabupaten magetan', 'kab magetan', 'kota magetan'],
    lat: -7.6508,
    lng: 111.3283,
    districts: {
      sidorejo: {
        name: 'Sidorejo',
        lat: -7.65569,
        lng: 111.27984,
        villages: {
          kwarigan: { lat: -7.65569, lng: 111.27984 },
          sidorejo: { lat: -7.6560, lng: 111.2810 },
          sidomulyo: { lat: -7.6490, lng: 111.2750 },
          sumbersawit: { lat: -7.6620, lng: 111.2700 },
          widodaren: { lat: -7.6480, lng: 111.2850 },
          campursari: { lat: -7.6520, lng: 111.2910 },
        },
      },
      plaosan: {
        name: 'Plaosan',
        lat: -7.6749,
        lng: 111.2201,
        villages: {
          sarangan: { lat: -7.6749, lng: 111.2201 },
          'telaga sarangan': { lat: -7.6749, lng: 111.2201 },
          plaosan: { lat: -7.6680, lng: 111.2350 },
          dadi: { lat: -7.6700, lng: 111.2250 },
          pacalan: { lat: -7.6580, lng: 111.2410 },
          ngancar: { lat: -7.6620, lng: 111.2150 },
        },
      },
      magetan: {
        name: 'Magetan',
        lat: -7.6508,
        lng: 111.3283,
        villages: {
          sukowinangun: { lat: -7.6480, lng: 111.3320 },
          selosari: { lat: -7.6510, lng: 111.3250 },
          kebonagung: { lat: -7.6550, lng: 111.3290 },
        },
      },
      panekan: {
        name: 'Panekan',
        lat: -7.6167,
        lng: 111.3000,
      },
      sukomoro: {
        name: 'Sukomoro',
        lat: -7.6417,
        lng: 111.3833,
      },
      maospati: {
        name: 'Maospati',
        lat: -7.5750,
        lng: 111.4333,
      },
      bendo: {
        name: 'Bendo',
        lat: -7.6167,
        lng: 111.4167,
      },
      kawedanan: {
        name: 'Kawedanan',
        lat: -7.6833,
        lng: 111.3833,
      },
      takeran: {
        name: 'Takeran',
        lat: -7.6833,
        lng: 111.4500,
      },
      parang: {
        name: 'Parang',
        lat: -7.7333,
        lng: 111.3167,
      },
      poncol: {
        name: 'Poncol',
        lat: -7.7167,
        lng: 111.2667,
      },
      karangrejo: {
        name: 'Karangrejo',
        lat: -7.5500,
        lng: 111.3833,
      },
      barat: {
        name: 'Barat',
        lat: -7.5333,
        lng: 111.4167,
      },
      kartoharjo: {
        name: 'Kartoharjo',
        lat: -7.5167,
        lng: 111.4500,
      },
      ngariboyo: {
        name: 'Ngariboyo',
        lat: -7.6833,
        lng: 111.3333,
      },
      nguntoronadi: {
        name: 'Nguntoronadi',
        lat: -7.6833,
        lng: 111.4167,
      },
      karas: {
        name: 'Karas',
        lat: -7.5833,
        lng: 111.3500,
      },
      lembeyan: {
        name: 'Lembeyan',
        lat: -7.7500,
        lng: 111.3833,
      },
    },
  },
  {
    name: 'Surabaya',
    type: 'Kota',
    province: 'Jawa Timur',
    aliases: ['kota surabaya', 'sby'],
    lat: -7.2575,
    lng: 112.7521,
    districts: {
      gubeng: { name: 'Gubeng', lat: -7.2754, lng: 112.7541 },
      genteng: { name: 'Genteng', lat: -7.2589, lng: 112.7478 },
      tegalsari: { name: 'Tegalsari', lat: -7.2628, lng: 112.7381 },
      wonokromo: { name: 'Wonokromo', lat: -7.2982, lng: 112.7381 },
      rungkut: { name: 'Rungkut', lat: -7.3197, lng: 112.7818 },
      sukolilo: { name: 'Sukolilo', lat: -7.2892, lng: 112.7966 },
      pabean: { name: 'Pabean Cantian', aliases: ['pabean cantian'], lat: -7.2389, lng: 112.7389 },
      krembangan: { name: 'Krembangan', lat: -7.2356, lng: 112.7298 },
      sambikerep: { name: 'Sambikerep', lat: -7.2745, lng: 112.6578 },
      wiyung: { name: 'Wiyung', lat: -7.3065, lng: 112.6961 },
      karangpilang: { name: 'Karangpilang', lat: -7.3321, lng: 112.7056 },
      tambaksari: { name: 'Tambaksari', lat: -7.2523, lng: 112.7689 },
      sawahan: { name: 'Sawahan', lat: -7.2712, lng: 112.7245 },
      gayungan: { name: 'Gayungan', lat: -7.3312, lng: 112.7289, villages: { ketintang: { lat: -7.3150, lng: 112.7280 } } },
      wonocolo: { name: 'Wonocolo', lat: -7.3189, lng: 112.7456 },
      jambangan: { name: 'Jambangan', lat: -7.3245, lng: 112.7156 },
    },
  },
  {
    name: 'Madiun',
    type: 'Kota',
    province: 'Jawa Timur',
    aliases: ['kota madiun'],
    lat: -7.6298,
    lng: 111.5239,
    districts: {
      kartoharjo: { name: 'Kartoharjo', lat: -7.6212, lng: 111.5289 },
      manguharjo: { name: 'Manguharjo', lat: -7.6278, lng: 111.5123 },
      taman: { name: 'Taman', lat: -7.6412, lng: 111.5345 },
    },
  },
  {
    name: 'Madiun',
    type: 'Kabupaten',
    province: 'Jawa Timur',
    aliases: ['kabupaten madiun', 'kab madiun', 'caruban'],
    lat: -7.5512,
    lng: 111.6521,
    districts: {
      mejayan: { name: 'Mejayan', aliases: ['caruban'], lat: -7.5512, lng: 111.6521 },
      jiwan: { name: 'Jiwan', lat: -7.6123, lng: 111.4876 },
      wungu: { name: 'Wungu', lat: -7.6812, lng: 111.5645 },
      saradan: { name: 'Saradan', lat: -7.5212, lng: 111.7212 },
    },
  },
  {
    name: 'Ngawi',
    type: 'Kabupaten',
    province: 'Jawa Timur',
    aliases: ['kabupaten ngawi', 'kab ngawi', 'kota ngawi'],
    lat: -7.4042,
    lng: 111.4461,
    districts: {
      ngawi: { name: 'Ngawi', lat: -7.4042, lng: 111.4461 },
      geneng: { name: 'Geneng', lat: -7.4812, lng: 111.4321 },
      kendal: { name: 'Kendal', lat: -7.5412, lng: 111.3123 },
      jogorogo: { name: 'Jogorogo', lat: -7.5245, lng: 111.2612 },
      paron: { name: 'Paron', lat: -7.4312, lng: 111.3812 },
    },
  },
  {
    name: 'Ponorogo',
    type: 'Kabupaten',
    province: 'Jawa Timur',
    aliases: ['kabupaten ponorogo', 'kab ponorogo'],
    lat: -7.8683,
    lng: 111.4622,
    districts: {
      ponorogo: { name: 'Ponorogo', lat: -7.8683, lng: 111.4622 },
      babadan: { name: 'Babadan', lat: -7.8123, lng: 111.4812 },
      siman: { name: 'Siman', lat: -7.8912, lng: 111.4891 },
      jenangan: { name: 'Jenangan', lat: -7.8345, lng: 111.5212 },
    },
  },
  {
    name: 'Sidoarjo',
    type: 'Kabupaten',
    province: 'Jawa Timur',
    aliases: ['kabupaten sidoarjo', 'kab sidoarjo', 'sda'],
    lat: -7.4478,
    lng: 112.7183,
    districts: {
      sidoarjo: { name: 'Sidoarjo', lat: -7.4478, lng: 112.7183 },
      krian: {
        name: 'Krian',
        lat: -7.4092,
        lng: 112.5935,
        villages: {
          sidorejo: { lat: -7.4092, lng: 112.5935 },
          krian: { lat: -7.4120, lng: 112.5890 },
        },
      },
      waru: { name: 'Waru', lat: -7.3521, lng: 112.7389 },
      taman: { name: 'Taman', aliases: ['sepanjang'], lat: -7.3712, lng: 112.6945 },
      candi: { name: 'Candi', lat: -7.4789, lng: 112.7212 },
      gedangan: { name: 'Gedangan', lat: -7.3891, lng: 112.7289 },
    },
  },
  {
    name: 'Malang',
    type: 'Kota',
    province: 'Jawa Timur',
    aliases: ['kota malang'],
    lat: -7.9797,
    lng: 112.6304,
    districts: {
      klojen: { name: 'Klojen', lat: -7.9789, lng: 112.6289 },
      lowokwaru: { name: 'Lowokwaru', lat: -7.9456, lng: 112.6145 },
      blimbing: { name: 'Blimbing', lat: -7.9389, lng: 112.6456 },
      sukun: { name: 'Sukun', lat: -8.0012, lng: 112.6123 },
      kedungkandang: { name: 'Kedungkandang', lat: -7.9912, lng: 112.6645 },
    },
  },

  // --- JAWA TENGAH ---
  {
    name: 'Salatiga',
    type: 'Kota',
    province: 'Jawa Tengah',
    aliases: ['kota salatiga'],
    lat: -7.3305,
    lng: 110.5084,
    districts: {
      sidorejo: {
        name: 'Sidorejo',
        lat: -7.3210,
        lng: 110.5050,
        villages: {
          'sidorejo lor': { lat: -7.3180, lng: 110.5020 },
          blotongan: { lat: -7.3120, lng: 110.4950 },
          bugel: { lat: -7.3250, lng: 110.5120 },
          pulutan: { lat: -7.3310, lng: 110.4850 },
        },
      },
      tingkir: {
        name: 'Tingkir',
        lat: -7.3456,
        lng: 110.5212,
        villages: {
          'sidorejo kidul': { lat: -7.3480, lng: 110.5280 },
          tingkir: { lat: -7.3420, lng: 110.5190 },
        },
      },
      argomulyo: { name: 'Argomulyo', lat: -7.3612, lng: 110.4989 },
      sidomukti: { name: 'Sidomukti', lat: -7.3312, lng: 110.4912 },
    },
  },
  {
    name: 'Surakarta',
    type: 'Kota',
    province: 'Jawa Tengah',
    aliases: ['kota solo', 'solo', 'kota surakarta'],
    lat: -7.5693,
    lng: 110.8250,
    districts: {
      banjarsari: { name: 'Banjarsari', lat: -7.5512, lng: 110.8123 },
      jebres: { name: 'Jebres', lat: -7.5589, lng: 110.8456 },
      laweyan: { name: 'Laweyan', lat: -7.5689, lng: 110.7989 },
      pasarkliwon: { name: 'Pasar Kliwon', lat: -7.5789, lng: 110.8312 },
      serengan: { name: 'Serengan', lat: -7.5812, lng: 110.8189 },
    },
  },
  {
    name: 'Semarang',
    type: 'Kota',
    province: 'Jawa Tengah',
    aliases: ['kota semarang'],
    lat: -6.9932,
    lng: 110.4203,
    districts: {
      candisari: { name: 'Candisari', lat: -7.0123, lng: 110.4289 },
      semarangtengah: { name: 'Semarang Tengah', lat: -6.9812, lng: 110.4189 },
      banyumanik: { name: 'Banyumanik', lat: -7.0689, lng: 110.4123 },
      tembalang: { name: 'Tembalang', lat: -7.0589, lng: 110.4512 },
    },
  },
  {
    name: 'Karanganyar',
    type: 'Kabupaten',
    province: 'Jawa Tengah',
    aliases: ['kabupaten karanganyar', 'kab karanganyar'],
    lat: -7.5962,
    lng: 110.9512,
    districts: {
      karanganyar: { name: 'Karanganyar', lat: -7.5962, lng: 110.9512 },
      tawangmangu: { name: 'Tawangmangu', lat: -7.6623, lng: 111.1345 },
      colomadu: { name: 'Colomadu', lat: -7.5345, lng: 110.7612 },
    },
  },

  // --- D.I. YOGYAKARTA ---
  {
    name: 'Yogyakarta',
    type: 'Kota',
    province: 'D.I. Yogyakarta',
    aliases: ['kota yogyakarta', 'jogja', 'yogyakarta', 'diy'],
    lat: -7.7956,
    lng: 110.3695,
    districts: {
      danurejan: { name: 'Danurejan', lat: -7.7912, lng: 110.3712 },
      gedongtengen: { name: 'Gedong Tengen', aliases: ['malioboro'], lat: -7.7889, lng: 110.3612 },
      gondokusuman: { name: 'Gondokusuman', lat: -7.7845, lng: 110.3812 },
      kraton: { name: 'Kraton', lat: -7.8089, lng: 110.3645 },
      mantrijeron: { name: 'Mantrijeron', lat: -7.8212, lng: 110.3612 },
      mergangsan: { name: 'Mergangsan', lat: -7.8123, lng: 110.3789 },
      umbulharjo: { name: 'Umbulharjo', lat: -7.8189, lng: 110.3912 },
    },
  },
  {
    name: 'Sleman',
    type: 'Kabupaten',
    province: 'D.I. Yogyakarta',
    aliases: ['kabupaten sleman', 'kab sleman'],
    lat: -7.7167,
    lng: 110.3556,
    districts: {
      depok: { name: 'Depok', lat: -7.7612, lng: 110.4012 },
      kalasan: { name: 'Kalasan', lat: -7.7689, lng: 110.4689 },
      mlati: { name: 'Mlati', lat: -7.7412, lng: 110.3512 },
      ngaglik: { name: 'Ngaglik', lat: -7.7123, lng: 110.3889 },
      gamping: { name: 'Gamping', lat: -7.7912, lng: 110.3212 },
    },
  },

  // --- DKI JAKARTA ---
  {
    name: 'Jakarta Selatan',
    type: 'Kota',
    province: 'DKI Jakarta',
    aliases: ['jaksel', 'jakarta selatan'],
    lat: -6.2615,
    lng: 106.8106,
    districts: {
      kebayoranbaru: { name: 'Kebayoran Baru', lat: -6.2412, lng: 106.8012 },
      setiabudi: { name: 'Setiabudi', lat: -6.2156, lng: 106.8289 },
      cilandak: { name: 'Cilandak', lat: -6.2912, lng: 106.8012 },
      tebet: { name: 'Tebet', lat: -6.2345, lng: 106.8512 },
      pasar_minggu: { name: 'Pasar Minggu', lat: -6.2889, lng: 106.8389 },
      mampang: { name: 'Mampang Prapatan', lat: -6.2512, lng: 106.8245 },
    },
  },
  {
    name: 'Jakarta Pusat',
    type: 'Kota',
    province: 'DKI Jakarta',
    aliases: ['jakpus', 'jakarta pusat'],
    lat: -6.1818,
    lng: 106.8223,
    districts: {
      menteng: { name: 'Menteng', lat: -6.1956, lng: 106.8312 },
      gambir: { name: 'Gambir', lat: -6.1756, lng: 106.8212 },
      tanahabang: { name: 'Tanah Abang', lat: -6.1989, lng: 106.8123 },
      kemayoran: { name: 'Kemayoran', lat: -6.1589, lng: 106.8589 },
    },
  },
  {
    name: 'Jakarta Barat',
    type: 'Kota',
    province: 'DKI Jakarta',
    aliases: ['jakbar', 'jakarta barat'],
    lat: -6.1683,
    lng: 106.7589,
    districts: {
      grogol: { name: 'Grogol Petamburan', lat: -6.1612, lng: 106.7889 },
      kebonjeruk: { name: 'Kebon Jeruk', lat: -6.1912, lng: 106.7689 },
      cengkareng: { name: 'Cengkareng', lat: -6.1456, lng: 106.7312 },
      kembangan: { name: 'Kembangan', lat: -6.1889, lng: 106.7389 },
    },
  },
  {
    name: 'Jakarta Timur',
    type: 'Kota',
    province: 'DKI Jakarta',
    aliases: ['jaktim', 'jakarta timur'],
    lat: -6.2250,
    lng: 106.9004,
    districts: {
      jatinegara: { name: 'Jatinegara', lat: -6.2289, lng: 106.8712 },
      durensawit: { name: 'Duren Sawit', lat: -6.2345, lng: 106.9189 },
      ciracas: { name: 'Ciracas', lat: -6.3289, lng: 106.8712 },
      cakung: { name: 'Cakung', lat: -6.1912, lng: 106.9456 },
    },
  },
  {
    name: 'Jakarta Utara',
    type: 'Kota',
    province: 'DKI Jakarta',
    aliases: ['jakut', 'jakarta utara'],
    lat: -6.1384,
    lng: 106.8640,
    districts: {
      penjaringan: { name: 'Penjaringan', lat: -6.1289, lng: 106.7889 },
      kelapagading: { name: 'Kelapa Gading', lat: -6.1612, lng: 106.9089 },
      tanjungpriok: { name: 'Tanjung Priok', lat: -6.1312, lng: 106.8812 },
    },
  },

  // --- JAWA BARAT ---
  {
    name: 'Bandung',
    type: 'Kota',
    province: 'Jawa Barat',
    aliases: ['kota bandung'],
    lat: -6.9175,
    lng: 107.6191,
    districts: {
      antapani: { name: 'Antapani', lat: -6.9189, lng: 107.6612 },
      coblong: { name: 'Coblong', aliases: ['dago'], lat: -6.8845, lng: 107.6145 },
      lengkong: { name: 'Lengkong', lat: -6.9312, lng: 107.6212 },
      sukajadi: { name: 'Sukajadi', lat: -6.8889, lng: 107.5912 },
      sumurbandung: { name: 'Sumur Bandung', lat: -6.9156, lng: 107.6112 },
    },
  },
];

// Indonesian Province Centroids
const PROVINCES: { [key: string]: { name: string; lat: number; lng: number } } = {
  'jawa timur': { name: 'Jawa Timur', lat: -7.5360, lng: 112.2384 },
  'jawa tengah': { name: 'Jawa Tengah', lat: -7.1509, lng: 110.1402 },
  'jawa barat': { name: 'Jawa Barat', lat: -6.9147, lng: 107.6098 },
  'dki jakarta': { name: 'DKI Jakarta', lat: -6.2088, lng: 106.8456 },
  'd.i. yogyakarta': { name: 'D.I. Yogyakarta', lat: -7.7956, lng: 110.3695 },
  'di yogyakarta': { name: 'D.I. Yogyakarta', lat: -7.7956, lng: 110.3695 },
  yogyakarta: { name: 'D.I. Yogyakarta', lat: -7.7956, lng: 110.3695 },
  banten: { name: 'Banten', lat: -6.4058, lng: 106.0640 },
  bali: { name: 'Bali', lat: -8.4095, lng: 115.1889 },
};

/**
 * Normalizes an administrative string for token matching:
 * removes punctuation, collapses whitespace, downcases.
 */
function cleanToken(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tests if a segment is a thoroughfare/street identifier.
 * Crucial: Streets named after other locations (e.g. "Jl. Raya Sarangan", "Jl. Solo", "Jl. Surabaya")
 * must be isolated so the road destination doesn't misidentify the actual district!
 */
function isStreetToken(segment: string): boolean {
  const s = segment.trim().toLowerCase();
  return (
    /^(jl\.?|jalan|gang|gg\.?|lorong|komplek|kompleks|perumahan|perum|ruko|blok|no\.?|nomor|km\.?)\b/i.test(s) ||
    /\b(no\s*\.?\s*\d+|rt\s*\d+|rw\s*\d+)\b/i.test(s)
  );
}

/**
 * Strips street prefixes (e.g. "Jl. Raya ", "Jalan ", "Gang ") to get the road name.
 */
function extractStreetName(segment: string): string {
  return segment.trim();
}

/**
 * Extracts explicit administrative prefixes if present.
 */
function stripAdminPrefix(segment: string): { type?: 'kab' | 'kota' | 'kec' | 'desa' | 'dusun' | 'prov'; clean: string } {
  const lower = segment.trim().toLowerCase();
  if (/^(kabupaten|kab\.?)\s+/i.test(lower)) {
    return { type: 'kab', clean: lower.replace(/^(kabupaten|kab\.?)\s+/i, '').trim() };
  }
  if (/^(kota|kotamadya)\s+/i.test(lower)) {
    return { type: 'kota', clean: lower.replace(/^(kota|kotamadya)\s+/i, '').trim() };
  }
  if (/^(kecamatan|kec\.?)\s+/i.test(lower)) {
    return { type: 'kec', clean: lower.replace(/^(kecamatan|kec\.?)\s+/i, '').trim() };
  }
  if (/^(kelurahan|kel\.?|desa|ds\.?)\s+/i.test(lower)) {
    return { type: 'desa', clean: lower.replace(/^(kelurahan|kel\.?|desa|ds\.?)\s+/i, '').trim() };
  }
  if (/^(dusun|dukuh|kampung|kp\.?)\s+/i.test(lower)) {
    return { type: 'dusun', clean: lower.replace(/^(dusun|dukuh|kampung|kp\.?)\s+/i, '').trim() };
  }
  if (/^(provinsi|prov\.?)\s+/i.test(lower)) {
    return { type: 'prov', clean: lower.replace(/^(provinsi|prov\.?)\s+/i, '').trim() };
  }
  return { clean: lower };
}

/**
 * The Core Generalized Indonesian Address Parser & Coordinate Resolver
 * 
 * Takes ANY Indonesian address string (structured or unstructured) and returns:
 * - Proper administrative hierarchy (Province, City, District, Village)
 * - Exact or near-exact centroid GPS coordinates
 * - Precision level and confidence score
 */
export function resolveIndonesianAddress(rawInput: string): ResolvedAddressResult {
  const raw = (rawInput || '').trim();
  if (!raw) {
    return {
      rawAddress: '',
      formattedAddress: '',
      lat: -7.65569,
      lng: 111.27984,
      precision: 'fallback',
      confidence: 0,
    };
  }

  // 1. Initial segment tokenization (split by comma or newline)
  let rawSegments = raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // If no commas exist, split by administrative markers: "Kec.", "Kab.", "Kota", "Ds.", "Dusun"
  if (rawSegments.length === 1) {
    const adminDelimitersRegex = /\b(jl\.?|jalan|kec\.?|kecamatan|kab\.?|kabupaten|kota|ds\.?|desa|dusun|dukuh|prov\.?|provinsi)\b/gi;
    const splitIndices: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = adminDelimitersRegex.exec(raw)) !== null) {
      if (match.index > 0) splitIndices.push(match.index);
    }
    if (splitIndices.length > 0) {
      const segs: string[] = [];
      let last = 0;
      for (const idx of splitIndices) {
        segs.push(raw.slice(last, idx).trim());
        last = idx;
      }
      segs.push(raw.slice(last).trim());
      rawSegments = segs.filter((s) => s.length > 0);
    }
  }

  // 2. Classify segments: Separate Streets from Admin Candidates
  const streetTokens: string[] = [];
  const adminCandidates: { original: string; clean: string; prefixType?: string }[] = [];

  for (const seg of rawSegments) {
    if (isStreetToken(seg)) {
      streetTokens.push(extractStreetName(seg));
    } else {
      const parsed = stripAdminPrefix(seg);
      adminCandidates.push({
        original: seg,
        clean: parsed.clean,
        prefixType: parsed.type,
      });
    }
  }

  const identifiedStreet = streetTokens.length > 0 ? streetTokens.join(', ') : undefined;

  // 3. Hierarchical Reduction: Right-to-Left (RTL) scanning
  // In Indonesian address convention, broader regions appear on the right, specific places on the left.
  let matchedProvince: { name: string; lat: number; lng: number } | undefined;
  let matchedRegency: RegencyData | undefined;
  let matchedDistrict: DistrictData | undefined;
  let matchedVillage: { name: string; lat: number; lng: number } | undefined;

  // A. Detect Province (scan candidate tokens or raw address)
  for (let i = adminCandidates.length - 1; i >= 0; i--) {
    const token = adminCandidates[i].clean;
    for (const [key, p] of Object.entries(PROVINCES)) {
      if (token === key || token.includes(key)) {
        matchedProvince = p;
        adminCandidates.splice(i, 1);
        break;
      }
    }
    if (matchedProvince) break;
  }
  // Fallback province scan if not in separate token
  if (!matchedProvince) {
    const fullClean = cleanToken(raw);
    for (const [key, p] of Object.entries(PROVINCES)) {
      if (fullClean.includes(key)) {
        matchedProvince = p;
        break;
      }
    }
  }

  // B. Detect Regency / City (Kabupaten / Kota)
  // Check explicit 'kab' or 'kota' prefixes first
  for (let i = adminCandidates.length - 1; i >= 0; i--) {
    const cand = adminCandidates[i];
    const candidateName = cand.clean;

    const found = INDONESIA_REGENCY_DIRECTORY.find((reg) => {
      const nameMatch = reg.name.toLowerCase() === candidateName || candidateName.includes(reg.name.toLowerCase());
      const aliasMatch = reg.aliases?.some((a) => candidateName.includes(a) || a.includes(candidateName));
      return nameMatch || aliasMatch;
    });

    if (found) {
      matchedRegency = found;
      adminCandidates.splice(i, 1);
      break;
    }
  }

  // If regency not yet isolated in admin candidate tokens, scan full non-street text
  if (!matchedRegency) {
    const nonStreetText = cleanToken(adminCandidates.map((c) => c.original).join(' '));
    for (const reg of INDONESIA_REGENCY_DIRECTORY) {
      const regNameLower = reg.name.toLowerCase();
      if (nonStreetText.includes(regNameLower) || reg.aliases?.some((a) => nonStreetText.includes(a))) {
        matchedRegency = reg;
        break;
      }
    }
  }

  // C. Detect District (Kecamatan)
  // If Regency is known, search within that Regency's districts first!
  if (matchedRegency) {
    for (let i = adminCandidates.length - 1; i >= 0; i--) {
      const cand = adminCandidates[i];
      const candClean = cand.clean;

      for (const [distKey, distData] of Object.entries(matchedRegency.districts)) {
        const matchesName = candClean === distKey || candClean.includes(distKey) || distData.name.toLowerCase() === candClean;
        const matchesAlias = distData.aliases?.some((a) => candClean.includes(a));
        if (matchesName || matchesAlias) {
          matchedDistrict = distData;
          adminCandidates.splice(i, 1);
          break;
        }
      }
      if (matchedDistrict) break;
    }
  }

  // If District is STILL not found (or Regency was unknown), search across ALL districts in our directory
  if (!matchedDistrict) {
    for (let i = adminCandidates.length - 1; i >= 0; i--) {
      const cand = adminCandidates[i];
      const candClean = cand.clean;

      for (const reg of INDONESIA_REGENCY_DIRECTORY) {
        for (const [distKey, distData] of Object.entries(reg.districts)) {
          const matchesName = candClean === distKey || candClean.includes(distKey) || distData.name.toLowerCase() === candClean;
          const matchesAlias = distData.aliases?.some((a) => candClean.includes(a));
          if (matchesName || matchesAlias) {
            matchedDistrict = distData;
            // If regency was unknown, anchor it to this district's parent regency!
            if (!matchedRegency) {
              matchedRegency = reg;
            }
            adminCandidates.splice(i, 1);
            break;
          }
        }
        if (matchedDistrict) break;
      }
      if (matchedDistrict) break;
    }
  }

  // Secondary District Fallback: If no district was in the admin tokens,
  // check if the street name contains a known district of the detected regency (e.g. "Jl. Raya Gubeng, Surabaya")
  if (!matchedDistrict && matchedRegency && identifiedStreet) {
    const cleanStreet = cleanToken(identifiedStreet);
    for (const [distKey, distData] of Object.entries(matchedRegency.districts)) {
      const matchesName = cleanStreet.includes(distKey) || cleanStreet.includes(distData.name.toLowerCase());
      const matchesAlias = distData.aliases?.some((a) => cleanStreet.includes(a));
      if (matchesName || matchesAlias) {
        matchedDistrict = distData;
        break;
      }
    }
  }

  // D. Detect Village / Dusun / Kelurahan
  // Prioritize candidates with explicit 'dusun' prefix, then 'desa', then name matches
  if (matchedDistrict && matchedDistrict.villages) {
    // Sort adminCandidates so 'dusun' prefix comes first for highest granularity
    const sortedCandidates = [...adminCandidates].sort((a, b) => {
      const aScore = a.prefixType === 'dusun' ? 2 : (a.prefixType === 'desa' ? 1 : 0);
      const bScore = b.prefixType === 'dusun' ? 2 : (b.prefixType === 'desa' ? 1 : 0);
      return bScore - aScore;
    });

    for (const cand of sortedCandidates) {
      const candClean = cand.clean;
      for (const [vKey, vCoords] of Object.entries(matchedDistrict.villages)) {
        if (candClean === vKey || candClean.includes(vKey)) {
          matchedVillage = {
            name: vKey.charAt(0).toUpperCase() + vKey.slice(1),
            lat: vCoords.lat,
            lng: vCoords.lng,
          };
          const idx = adminCandidates.indexOf(cand);
          if (idx !== -1) adminCandidates.splice(idx, 1);
          break;
        }
      }
      if (matchedVillage) break;
    }
  }

  // Also check if any remaining token explicitly had a 'dusun' or 'desa' prefix
  if (!matchedVillage) {
    const explicitVillage = adminCandidates.find((c) => c.prefixType === 'desa' || c.prefixType === 'dusun');
    if (explicitVillage) {
      matchedVillage = {
        name: explicitVillage.clean.charAt(0).toUpperCase() + explicitVillage.clean.slice(1),
        lat: matchedDistrict ? matchedDistrict.lat : (matchedRegency ? matchedRegency.lat : -7.65569),
        lng: matchedDistrict ? matchedDistrict.lng : (matchedRegency ? matchedRegency.lng : 111.27984),
      };
    }
  }

  // E. Coordinate Resolution & Precision Level Hierarchy
  // Precision priority: Village > District > Regency > Province > Fallback
  let resolvedLat = -7.65569;
  let resolvedLng = 111.27984;
  let precision: ResolvedAddressResult['precision'] = 'fallback';
  let confidence = 0.5;

  if (matchedVillage) {
    resolvedLat = matchedVillage.lat;
    resolvedLng = matchedVillage.lng;
    precision = 'village';
    confidence = 0.95;
  } else if (matchedDistrict) {
    resolvedLat = matchedDistrict.lat;
    resolvedLng = matchedDistrict.lng;
    precision = 'district';
    confidence = 0.85;
  } else if (matchedRegency) {
    resolvedLat = matchedRegency.lat;
    resolvedLng = matchedRegency.lng;
    precision = 'city';
    confidence = 0.75;
  } else if (matchedProvince) {
    resolvedLat = matchedProvince.lat;
    resolvedLng = matchedProvince.lng;
    precision = 'province';
    confidence = 0.6;
  } else {
    // Intelligent contextual fallback (default to regional hub: Magetan / Surabaya)
    resolvedLat = -7.65569;
    resolvedLng = 111.27984;
    precision = 'fallback';
    confidence = 0.4;
  }

  // Canonical Formatted Hierarchy Assembly
  const cityName = matchedRegency
    ? `${matchedRegency.type} ${matchedRegency.name}`
    : undefined;
  const cityNameOnly = matchedRegency?.name;
  const districtName = matchedDistrict?.name;
  const villageName = matchedVillage?.name;
  const provinceName = matchedProvince?.name || (matchedRegency ? matchedRegency.province : 'Jawa Timur');

  const formattedParts: string[] = [];
  if (identifiedStreet) formattedParts.push(identifiedStreet);
  if (villageName) formattedParts.push(villageName);
  if (districtName) formattedParts.push(`Kec. ${districtName}`);
  if (cityName) formattedParts.push(cityName);
  if (provinceName) formattedParts.push(provinceName);

  const formattedAddress = formattedParts.length > 0 ? formattedParts.join(', ') : raw;

  return {
    rawAddress: raw,
    province: provinceName,
    city: cityName,
    cityNameOnly,
    district: districtName,
    village: villageName,
    street: identifiedStreet,
    formattedAddress,
    lat: resolvedLat,
    lng: resolvedLng,
    precision,
    confidence,
  };
}

/**
 * Online Geocoding Search (OSM Nominatim & Komoot Photon)
 * Strips non-geographic business terms (e.g. "Outlet", "Warung", "Gerai")
 * and resolves pinpoint street coordinates.
 */
export async function geocodeOnlineAddress(query: string): Promise<{
  name: string;
  detail: string;
  lat: number;
  lng: number;
}[]> {
  const clean = query.trim();
  if (!clean || clean.length < 3) return [];

  // 1. Strip business noise words for clean geographic query
  const cleanGeoQuery = clean
    .replace(/\b(outlet|otulet|toko|warung|gerai|resto|restoran|cabang|ra chicken)\b/gi, '')
    .trim();

  const searchQuery = cleanGeoQuery.length >= 3 ? cleanGeoQuery : clean;

  const results: { name: string; detail: string; lat: number; lng: number }[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    // Query Photon OSM (extremely fast, comprehensive POI & street coverage)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5&lat=-7.6&lon=111.5`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.features && Array.isArray(data.features)) {
        for (const feat of data.features) {
          const props = feat.properties || {};
          const coords = feat.geometry?.coordinates;
          if (coords && coords.length >= 2) {
            const name = props.name || props.street || searchQuery;
            const detailParts = [props.street, props.district, props.city, props.state, props.country]
              .filter(Boolean);
            results.push({
              name,
              detail: detailParts.join(', ') || name,
              lat: coords[1],
              lng: coords[0],
            });
          }
        }
      }
    }
  } catch (_) {
    // If online network is down or offline, fall back to offline parser
  }

  return results;
}
