/**
 * Replate Impact Calculation Engine
 * Metodologi Standar: Kajian Food Loss & Waste (FLW) Indonesia - Bappenas RI & KLH 2025/2026
 */

export interface ImpactSummary {
  totalFoodWeightKg: number;
  totalCo2SavedKg: number;
  totalPeopleFed: number;
  economicValueSavedRp: number;
  energySavedKcal: number;
  methanePreventedKg: number;
  wasteDivertedPercentage: number;
  treesEquivalent: number;
  carKmEquivalent: number;
}

// Bappenas RI FLW Study 2000–2019 Constants:
// 1 ton Food Waste (tahap konsumsi & distribusi hilir) = 4.051,5 kg CO2-eq (4,3x lebih tinggi dari Food Loss hulu)
export const FOOD_WASTE_CO2_FACTOR = 4.0515; // 4.0515 kg CO2-eq per kg Food Waste
export const ECONOMIC_VALUE_PER_KG = 12500; // Rp 12.500 per kg (~Rp 5.000 / porsi porsi makanan)
export const ENERGY_KCAL_PER_KG = 840; // ~840 kkal per kg pangan (~336 kkal per porsi 0.4 kg)
export const METHANE_CH4_FACTOR = 0.07; // ~0.07 kg CH4 per kg sampah organik
export const AVERAGE_TREE_CO2_ABSORPTION_KG = 21.0; // 1 pohon menyerap ~21 kg CO2/tahun
export const CAR_CO2_PER_KM_KG = 0.192; // Rata-rata mobil berbahan bakar bensin = 0.192 kg CO2/km

export function calculateImpactMetrics(foodWeightKg: number, peopleFed?: number): ImpactSummary {
  const totalFoodWeightKg = Math.max(0, foodWeightKg);
  const totalCo2SavedKg = parseFloat((totalFoodWeightKg * FOOD_WASTE_CO2_FACTOR).toFixed(2));
  const calculatedPeopleFed = peopleFed ? Math.max(1, peopleFed) : Math.max(1, Math.round(totalFoodWeightKg * 2.5));
  const economicValueSavedRp = Math.round(totalFoodWeightKg * ECONOMIC_VALUE_PER_KG);
  const energySavedKcal = Math.round(totalFoodWeightKg * ENERGY_KCAL_PER_KG);
  const methanePreventedKg = parseFloat((totalFoodWeightKg * METHANE_CH4_FACTOR).toFixed(2));
  const treesEquivalent = parseFloat((totalCo2SavedKg / AVERAGE_TREE_CO2_ABSORPTION_KG).toFixed(1));
  const carKmEquivalent = Math.round(totalCo2SavedKg / CAR_CO2_PER_KM_KG);

  return {
    totalFoodWeightKg: parseFloat(totalFoodWeightKg.toFixed(2)),
    totalCo2SavedKg,
    totalPeopleFed: calculatedPeopleFed,
    economicValueSavedRp,
    energySavedKcal,
    methanePreventedKg,
    wasteDivertedPercentage: 100,
    treesEquivalent,
    carKmEquivalent,
  };
}
