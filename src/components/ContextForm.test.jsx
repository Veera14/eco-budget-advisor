// src/components/ContextForm.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextForm from './ContextForm';
import '@testing-library/jest-dom';

describe('ContextForm Component', () => {
    const defaultContext = {
        location: 'California',
        monthlyKwh: '400',
        commuteDistance: '30',
        vehicleType: 'petrol'
    };

    it('renders all form inputs and select elements with proper labels', () => {
        const setUserContext = vi.fn();
        render(<ContextForm userContext={defaultContext} setUserContext={setUserContext} />);

        // Check labels/inputs presence
        expect(screen.getByLabelText(/Location \/ Region/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Monthly Energy Bill/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Daily Commute/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Primary Mode of Transport/i)).toBeInTheDocument();

        // Check values match
        expect(screen.getByLabelText(/Location \/ Region/i).value).toBe('California');
        expect(screen.getByLabelText(/Monthly Energy Bill/i).value).toBe('400');
        expect(screen.getByLabelText(/Daily Commute/i).value).toBe('30');
        expect(screen.getByLabelText(/Primary Mode of Transport/i).value).toBe('petrol');
    });

    it('triggers setUserContext update when an input changes', () => {
        const setUserContext = vi.fn();
        render(<ContextForm userContext={defaultContext} setUserContext={setUserContext} />);

        const locationInput = screen.getByLabelText(/Location \/ Region/i);
        fireEvent.change(locationInput, { target: { value: 'New York' } });

        // Verify setUserContext is called to update state
        expect(setUserContext).toHaveBeenCalled();
    });
});
