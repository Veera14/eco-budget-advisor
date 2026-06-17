// src/components/BudgetMetrics.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetMetrics from './BudgetMetrics';
import '@testing-library/jest-dom';

describe('BudgetMetrics Component', () => {
    const defaultMetrics = {
        currentCarbonKg: '250.0',
        currentCostDollars: '95.50',
        potentialCarbonSaved: '50.0',
        potentialCashSaved: '19.10',
        currentTransportCarbon: '100.0',
        currentEnergyCarbon: '150.0',
        currentTransportCost: '40.00',
        currentEnergyCost: '55.50'
    };

    it('renders aggregate metrics accurately', () => {
        render(<BudgetMetrics metrics={defaultMetrics} />);

        // Verify key current load values
        expect(screen.getByText('250.0')).toBeInTheDocument();
        expect(screen.getByText('$95.50')).toBeInTheDocument();

        // Verify potential savings values
        expect(screen.getByText('-50.0')).toBeInTheDocument();
        expect(screen.getByText('+$19.10')).toBeInTheDocument();
    });

    it('renders the detailed carbon breakdown bar chart and numbers', () => {
        render(<BudgetMetrics metrics={defaultMetrics} />);

        // Verify breakdown metrics are visible
        expect(screen.getByText(/Transport: 100.0 kg/i)).toBeInTheDocument();
        expect(screen.getByText(/Energy: 150.0 kg/i)).toBeInTheDocument();

        // Verify bar segments
        expect(screen.getByTitle('Transport: 100 kg CO₂')).toBeInTheDocument();
        expect(screen.getByTitle('Energy: 150 kg CO₂')).toBeInTheDocument();
    });

    it('updates progress limit based on sustainable targets', () => {
        render(<BudgetMetrics metrics={defaultMetrics} />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '250');
        expect(progressBar).toHaveAttribute('aria-valuemax', '300');
    });
});
