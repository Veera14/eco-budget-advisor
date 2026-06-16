// src/utils/carbonCalculators.test.js
import { describe, it, expect } from 'vitest';
import { evaluateEcoBudget } from './carbonCalculators';

describe('evaluateEcoBudget', () => {
    it('calculates carbon footprint correctly for default context values', () => {
        const context = {
            location: 'Berlin',
            monthlyKwh: '300',
            commuteDistance: '20',
            vehicleType: 'petrol'
        };

        const result = evaluateEcoBudget(context);

        // Expected Transport Carbon: 20km * 22 days = 440km
        // Petrol factor: 0.17 kg CO2 / km -> 440 * 0.17 = 74.8 kg CO2
        // Expected Energy Carbon: 300 kWh * 0.45 = 135 kg CO2
        // Total Carbon = 74.8 + 135 = 209.8 kg CO2
        expect(result.currentCarbonKg).toBe('209.8');

        // Expected Transport Cost: 440km * $0.12/km = $52.80
        // Expected Energy Cost: 300kWh * $0.16/kWh = $48.00
        // Total Cost = $52.80 + $48.00 = $100.80
        expect(result.currentCostDollars).toBe('100.80');

        // Savings = 20%
        // Carbon saved = 209.8 * 0.2 = 41.96 kg -> "42.0" (toFixed(1))
        // Cash saved = 100.80 * 0.2 = $20.16 -> "20.16" (toFixed(2))
        expect(result.potentialCarbonSaved).toBe('42.0');
        expect(result.potentialCashSaved).toBe('20.16');
    });

    it('handles zero or missing values gracefully', () => {
        const context = {
            location: '',
            monthlyKwh: '',
            commuteDistance: '',
            vehicleType: 'ev'
        };

        const result = evaluateEcoBudget(context);

        expect(result.currentCarbonKg).toBe('0.0');
        expect(result.currentCostDollars).toBe('0.00');
        expect(result.potentialCarbonSaved).toBe('0.0');
        expect(result.potentialCashSaved).toBe('0.00');
    });

    it('correctly uses EV factors when vehicleType is ev', () => {
        const context = {
            location: 'Seattle',
            monthlyKwh: '0',
            commuteDistance: '10',
            vehicleType: 'ev'
        };

        const result = evaluateEcoBudget(context);

        // 10km * 22 days = 220km
        // EV factor: 0.04 kg CO2 / km -> 220 * 0.04 = 8.8 kg CO2
        // Total Carbon = 8.8 kg CO2
        expect(result.currentCarbonKg).toBe('8.8');

        // EV cost factor: $0.03 / km -> 220 * 0.03 = $6.60
        expect(result.currentCostDollars).toBe('6.60');
    });
});
