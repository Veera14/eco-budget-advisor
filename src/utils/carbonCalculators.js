// src/utils/carbonCalculators.js

// Benchmarks based on common environmental resource data
const FACTORS = {
    emissions: {
        petrolPerKm: 0.17,      // kg CO2 per km
        dieselPerKm: 0.19,
        evPerKm: 0.04,
        publicTransitPerKm: 0.06,
        electricityPerKwh: 0.45, // Average kg CO2 per kWh
    },
    costs: {
        petrolPerKm: 0.12,       // Estimated fuel cost in $ per km
        dieselPerKm: 0.14,
        evPerKm: 0.03,
        publicTransitPerKm: 0.08,
        electricityPerKwh: 0.16, // Estimated cost in $ per kWh
    }
};

/**
 * Evaluates the user's current contextual footprints and calculates 
 * achievable monthly savings targets (e.g., aiming for a practical 20% reduction).
 */
export function evaluateEcoBudget(context) {
    const kwh = parseFloat(context.monthlyKwh) || 0;
    const distance = parseFloat(context.commuteDistance) || 0;
    const vehicle = context.vehicleType || 'petrol';

    // 1. Calculate Transport Impacts (Monthly: distance * 22 working days)
    const monthlyKm = distance * 22;
    const vehicleEmissionFactor = FACTORS.emissions[`${vehicle}PerKm`] || FACTORS.emissions.petrolPerKm;
    const vehicleCostFactor = FACTORS.costs[`${vehicle}PerKm`] || FACTORS.costs.petrolPerKm;

    const currentTransportCarbon = monthlyKm * vehicleEmissionFactor;
    const currentTransportCost = monthlyKm * vehicleCostFactor;

    // 2. Calculate Energy Impacts
    const currentEnergyCarbon = kwh * FACTORS.emissions.electricityPerKwh;
    const currentEnergyCost = kwh * FACTORS.costs.electricityPerKwh;

    // 3. Aggregate Current Totals
    const totalCarbon = currentTransportCarbon + currentEnergyCarbon;
    const totalCost = currentTransportCost + currentEnergyCost;

    // 4. Target Projections (20% reduction target for a practical budget goal)
    const targetReduction = 0.20;

    return {
        currentCarbonKg: totalCarbon.toFixed(1),
        currentCostDollars: totalCost.toFixed(2),
        potentialCarbonSaved: (totalCarbon * targetReduction).toFixed(1),
        potentialCashSaved: (totalCost * targetReduction).toFixed(2),
        // Breakdowns for fine-grained alignment details
        currentTransportCarbon: currentTransportCarbon.toFixed(1),
        currentEnergyCarbon: currentEnergyCarbon.toFixed(1),
        currentTransportCost: currentTransportCost.toFixed(2),
        currentEnergyCost: currentEnergyCost.toFixed(2)
    };
}