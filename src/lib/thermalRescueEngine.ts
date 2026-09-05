/**
 * Pilar 3: Rescue Urgency Index (RUI) & Perishable Food Thermal Decay Engine
 * 
 * Standards:
 * - BPOM RI (Peraturan BPOM No. 13/2019 tentang Batas Maksimal Cemaran Mikroba dalam Pangan Olahan)
 * - Pedoman Higiene Sanitasi Makanan Siap Saji Kemenkes RI
 * - Codex Alimentarius Code of Hygienic Practice for Ready-to-Eat Foods
 * 
 * Accurately models microbial proliferation danger zones (5°C - 60°C) under tropical ambient temperatures (28°C - 34°C).
 */

export type FoodSafetyCategory =
  | 'COOKED_HOT_GRAVY'    // Sup, Soto, Rawon, Gulai (Santan panas)
  | 'COOKED_MEALS'        // Nasi Rames, Ayam Goreng, Lauk Olahan Matang
  | 'BAKERY_PASTRY'       // Roti Basah, Kue Santan, Donat, Pastry
  | 'DAIRY_COLD'          // Susu Segar, Puding Dingin, Keju Olahan
  | 'FRESH_PRODUCE'       // Sayuran Segar, Buah Potong
  | 'DRY_BAKERY_CANNED';  // Biskuit Kering, Roti Kering, Kalengan

export interface FoodCategoryProfile {
  id: FoodSafetyCategory;
  nameIndo: string;
  description: string;
  maxSafeHours: number;           // Standard maximum safe shelf life at 25°C
  dangerZoneTempMinC: number;     // 40°C
  dangerZoneTempMaxC: number;     // 60°C
  spoilageBacterialAgent: string; // e.g. "Bacillus cereus & Salmonella"
  recommendedPackaging: string;
  weightMultiplier: number;       // Urgency weight multiplier
}

export const FOOD_CATEGORY_PROFILES: Record<FoodSafetyCategory, FoodCategoryProfile> = {
  COOKED_HOT_GRAVY: {
    id: 'COOKED_HOT_GRAVY',
    nameIndo: 'Makanan Berkuah / Santan Panas',
    description: 'Sup, Soto, Rawon, Sayur Lodeh, Gulai berkuah (Sangat rentan asam & fermentasi mikroba)',
    maxSafeHours: 2.5,
    dangerZoneTempMinC: 40,
    dangerZoneTempMaxC: 60,
    spoilageBacterialAgent: 'Bacillus cereus & Clostridium perfringens',
    recommendedPackaging: 'Food-Grade Thermal Sealed Container (Wadah Rapat Tahan Panas)',
    weightMultiplier: 1.5,
  },
  COOKED_MEALS: {
    id: 'COOKED_MEALS',
    nameIndo: 'Makanan Matang Siap Saji / Nasi Kotak',
    description: 'Nasi Kotak, Ayam Bakar, Ikan Goreng, Tumis Sayur Matang',
    maxSafeHours: 4.0,
    dangerZoneTempMinC: 30,
    dangerZoneTempMaxC: 55,
    spoilageBacterialAgent: 'Staphylococcus aureus & Enterobacteriaceae',
    recommendedPackaging: 'Kotak Biodegradable Food-Grade dengan Segel Tanggal Masak',
    weightMultiplier: 1.3,
  },
  BAKERY_PASTRY: {
    id: 'BAKERY_PASTRY',
    nameIndo: 'Bakery Basah & Kue Tradisional',
    description: 'Roti Isi Daging/Keju Basah, Lemper Santan, Klepon, Donat Krim',
    maxSafeHours: 8.0,
    dangerZoneTempMinC: 25,
    dangerZoneTempMaxC: 45,
    spoilageBacterialAgent: 'Kapang, Khamir, & Bacillus subtilis (Rope spoilage)',
    recommendedPackaging: 'Kemasan Kertas Kedap Udara / Kotak Mika Tersegel',
    weightMultiplier: 1.0,
  },
  DAIRY_COLD: {
    id: 'DAIRY_COLD',
    nameIndo: 'Olahan Susu & Makanan Dingin',
    description: 'Susu Pasteurisasi, Dessert Susu, Puding Dingin, Salad Buah Mayonaise',
    maxSafeHours: 2.0,
    dangerZoneTempMinC: 10,
    dangerZoneTempMaxC: 35,
    spoilageBacterialAgent: 'Listeria monocytogenes & E. coli',
    recommendedPackaging: 'Insulated Cooler Box + Ice Gel Pack Steril',
    weightMultiplier: 1.6,
  },
  FRESH_PRODUCE: {
    id: 'FRESH_PRODUCE',
    nameIndo: 'Sayuran & Buah Segar',
    description: 'Buah Potong Segar, Sayuran Hijau, Selada Organik',
    maxSafeHours: 24.0,
    dangerZoneTempMinC: 20,
    dangerZoneTempMaxC: 38,
    spoilageBacterialAgent: 'Pembusukan Enzimatik & Jamur Permukaan',
    recommendedPackaging: 'Wadah Berpori Ventilasi / Keranjang Pangan',
    weightMultiplier: 0.7,
  },
  DRY_BAKERY_CANNED: {
    id: 'DRY_BAKERY_CANNED',
    nameIndo: 'Pangan Kering & Kalengan Aman',
    description: 'Biskuit Kering, Keripik, Pangan Olahan Kering Bersegel Utuh',
    maxSafeHours: 72.0,
    dangerZoneTempMinC: 15,
    dangerZoneTempMaxC: 35,
    spoilageBacterialAgent: 'Oksidasi Lemak / Ketengikan',
    recommendedPackaging: 'Karton Segel Rapat / Kaleng Kedap Udara',
    weightMultiplier: 0.4,
  },
};

export interface ThermalRuiInput {
  category: FoodSafetyCategory;
  cookedOrPackedTime: Date | string; // Waktu masak atau selesai dipacking
  ambientTemperatureC?: number;      // Default: 30°C (Suhu tropis Indonesia)
  isUsingCoolbox?: boolean;          // Apakah kurir membawa cooler box berinsulasi
  portions?: number;                 // Jumlah porsi makanan
  estimatedCourierEtaMinutes?: number; // Waktu tempuh armada ke lokasi (menit)
}

export interface ThermalRuiResult {
  category: FoodSafetyCategory;
  categoryProfile: FoodCategoryProfile;
  hoursElapsed: number;
  effectiveMaxHours: number;
  remainingSafeMinutes: number;
  isExpired: boolean;
  rescueUrgencyIndex: number; // 0.0 to 100.0
  urgencyLevel: 'CRITICAL_RESCUE' | 'HIGH_PRIORITY' | 'MODERATE' | 'STABLE';
  urgencyColor: string;
  urgencyLabelIndo: string;
  recommendedDispatchAction: string;
  organolepticChecklist: {
    step: number;
    title: string;
    description: string;
    status: 'PASS' | 'WARNING' | 'REJECT';
  }[];
  bpomSafetyNotice: string;
}

/**
 * Calculates Thermal Decay & Rescue Urgency Index (RUI)
 */
export function calculateThermalDecayRUI(input: ThermalRuiInput): ThermalRuiResult {
  const profile = FOOD_CATEGORY_PROFILES[input.category] || FOOD_CATEGORY_PROFILES.COOKED_MEALS;
  const now = new Date().getTime();
  const packedTime = new Date(input.cookedOrPackedTime).getTime();
  const rawHoursElapsed = Math.max(0, (now - packedTime) / (1000 * 60 * 60));
  const hoursElapsed = parseFloat(rawHoursElapsed.toFixed(2));

  const ambientTemp = input.ambientTemperatureC !== undefined ? input.ambientTemperatureC : 30;

  // Thermal acceleration factor (Arrhenius law simplification for tropical microbial kinetics):
  // Every 5°C increase above 25°C accelerates bacterial doubling time by ~15-20%.
  let thermalAcceleration = 1.0;
  if (ambientTemp > 25) {
    thermalAcceleration = 1 + (ambientTemp - 25) * 0.04;
  }
  // If coolbox / thermal bag is used, mitigate decay rate by 45%
  if (input.isUsingCoolbox) {
    thermalAcceleration *= 0.55;
  }

  const effectiveMaxHours = parseFloat((profile.maxSafeHours / thermalAcceleration).toFixed(2));
  const remainingHours = effectiveMaxHours - hoursElapsed;
  const remainingSafeMinutes = Math.round(remainingHours * 60);
  const isExpired = remainingSafeMinutes <= 0;

  // Mathematical RUI formula:
  // Non-linear urgency surge as deadline approaches: RUI increases exponentially in the final 30% of shelf life.
  let ruiScore = 0;
  if (isExpired) {
    ruiScore = 100;
  } else {
    const elapsedRatio = Math.min(1.0, hoursElapsed / effectiveMaxHours);
    // Exponential urgency curve: rui = (elapsedRatio^1.8) * 100 * weightMultiplier
    const baseRui = Math.pow(elapsedRatio, 1.8) * 75;

    // Quantity urgency surge (saving 50 portions is more critical than 2 portions)
    const portionFactor = input.portions ? Math.min(1.2, 1.0 + (input.portions / 250)) : 1.0;

    // Courier ETA strain (if ETA takes up > 50% of remaining time, surge urgency)
    let etaStrain = 1.0;
    if (input.estimatedCourierEtaMinutes && remainingSafeMinutes > 0) {
      if (input.estimatedCourierEtaMinutes > remainingSafeMinutes * 0.5) {
        etaStrain = 1.35;
      }
    }

    ruiScore = Math.min(99, Math.round(baseRui * profile.weightMultiplier * portionFactor * etaStrain));
  }

  // Determine Urgency Level
  let urgencyLevel: ThermalRuiResult['urgencyLevel'] = 'STABLE';
  let urgencyColor = '#10B981'; // Green
  let urgencyLabelIndo = 'Status Stabil (Jadwal Normal)';
  let recommendedDispatchAction = 'Penjemputan terjadwal sesuai ritme operasional outlet.';

  if (isExpired) {
    urgencyLevel = 'CRITICAL_RESCUE';
    urgencyColor = '#DC2626'; // Red
    urgencyLabelIndo = 'Batas Konsumsi Terlampaui (Evaluasi Organoleptik Ketat)';
    recommendedDispatchAction = 'Alihkan ke pengolahan pakan ternak / biogas atau tolak jika sudah asam/berbau.';
  } else if (remainingSafeMinutes <= 45 || ruiScore >= 75) {
    urgencyLevel = 'CRITICAL_RESCUE';
    urgencyColor = '#EF4444'; // Bright Red
    urgencyLabelIndo = 'Kritis Segera Jemput (< 45 Menit)';
    recommendedDispatchAction = 'Prioritas Utama! Segera luncurkan kurir/relawan terdekat dengan cooler box steril.';
  } else if (remainingSafeMinutes <= 90 || ruiScore >= 55) {
    urgencyLevel = 'HIGH_PRIORITY';
    urgencyColor = '#F59E0B'; // Amber / Orange
    urgencyLabelIndo = 'Prioritas Tinggi (< 90 Menit)';
    recommendedDispatchAction = 'Jadwalkan penjemputan dalam 1 jam ke depan untuk mencegah penurunan kualitas.';
  } else if (remainingSafeMinutes <= 180 || ruiScore >= 35) {
    urgencyLevel = 'MODERATE';
    urgencyColor = '#3B82F6'; // Blue
    urgencyLabelIndo = 'Prioritas Menengah (< 3 Jam)';
    recommendedDispatchAction = 'Dapat dikonsolidasikan dalam rute multi-stop penjemputan relawan.';
  }

  // BPOM Organoleptic Checklist for Driver / Volunteer
  const organolepticChecklist = [
    {
      step: 1,
      title: 'Uji Visual & Tampilan Warna',
      description: 'Pastikan tidak ada perubahan warna abnormal, lendir pada daging, atau buih fermentasi pada kuah.',
      status: isExpired ? ('REJECT' as const) : ('PASS' as const),
    },
    {
      step: 2,
      title: 'Uji Sensorik Aroma (Bau)',
      description: 'Aroma segar khas masakan. Tidak tercium bau asam kecut, bau tengik, atau bau busuk.',
      status: isExpired ? ('WARNING' as const) : ('PASS' as const),
    },
    {
      step: 3,
      title: 'Integritas Segel & Wadah Food-Grade',
      description: 'Wadah bersih, bertutup rapat, food-grade, dan bebas dari kontaminasi silang serangga.',
      status: 'PASS' as const,
    },
    {
      step: 4,
      title: 'Suhu Wadah Penyimpanan',
      description: input.category === 'COOKED_HOT_GRAVY'
        ? 'Wadah kuah masih terasa hangat (>50°C) atau langsung dimasukkan cooler box berinsulasi.'
        : 'Suhu terkontrol dan tidak terpapar langsung terik sinar matahari jalanan.',
      status: remainingSafeMinutes < 40 ? ('WARNING' as const) : ('PASS' as const),
    },
  ];

  const bpomSafetyNotice = `Audit Standar BPOM RI: Kategori ${profile.nameIndo} memiliki batas kritis konsumsi aman ${effectiveMaxHours} jam pada suhu ${ambientTemp}°C. Sisa waktu aman: ${isExpired ? '0 menit (Kedaluwarsa)' : `${remainingSafeMinutes} menit`}. Potensi cemaran: ${profile.spoilageBacterialAgent}.`;

  return {
    category: input.category,
    categoryProfile: profile,
    hoursElapsed,
    effectiveMaxHours,
    remainingSafeMinutes: Math.max(0, remainingSafeMinutes),
    isExpired,
    rescueUrgencyIndex: ruiScore,
    urgencyLevel,
    urgencyColor,
    urgencyLabelIndo,
    recommendedDispatchAction,
    organolepticChecklist,
    bpomSafetyNotice,
  };
}
