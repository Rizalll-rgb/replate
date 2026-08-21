export interface ImpactSummary {
  totalFoodWeightKg: number;
  totalCo2SavedKg: number;
  totalPeopleFed: number;
  wasteDivertedPercentage: number;
  treesEquivalent: number;
  carKmEquivalent: number;
}

export const CO2_EMISSION_FACTOR = 2.5; // 1 kg food waste ~ 2.5 kg CO2e
export const AVERAGE_TREE_CO2_ABSORPTION_KG = 21.0; // 1 tree absorbs ~21 kg CO2/year
export const CAR_CO2_PER_KM_KG = 0.192; // Avg car emits ~0.192 kg CO2/km

export function calculateImpactMetrics(foodWeightKg: number, peopleFed: number = 1): ImpactSummary {
  const totalFoodWeightKg = Math.max(0, foodWeightKg);
  const totalCo2SavedKg = parseFloat((totalFoodWeightKg * CO2_EMISSION_FACTOR).toFixed(2));
  const totalPeopleFed = Math.max(1, peopleFed);
  const treesEquivalent = parseFloat((totalCo2SavedKg / AVERAGE_TREE_CO2_ABSORPTION_KG).toFixed(1));
  const carKmEquivalent = Math.round(totalCo2SavedKg / CAR_CO2_PER_KM_KG);

  return {
    totalFoodWeightKg: parseFloat(totalFoodWeightKg.toFixed(2)),
    totalCo2SavedKg,
    totalPeopleFed,
    wasteDivertedPercentage: 100,
    treesEquivalent,
    carKmEquivalent,
  };
}
