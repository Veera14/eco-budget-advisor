// src/App.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('App Component Integration', () => {
    beforeEach(() => {
        // Mock scrollIntoView for jsdom
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('initializes and renders the configuration sidebar and main console', () => {
        render(<App />);

        // Verify Sidebar title
        expect(screen.getByRole('heading', { name: /🌱 Eco-Budget/i })).toBeInTheDocument();

        // Verify Dashboard main title
        expect(screen.getByRole('heading', { name: /Dashboard & Live Advice/i })).toBeInTheDocument();

        // Verify presence of child components
        expect(screen.getByLabelText(/Location \/ Region/i)).toBeInTheDocument();
        expect(screen.getByText(/Current Carbon Load/i)).toBeInTheDocument();
        expect(screen.getByText(/Welcome to your Eco-Budget Advisor!/i)).toBeInTheDocument();
    });
});
