// src/components/ChatAssistant.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatAssistant from './ChatAssistant';
import '@testing-library/jest-dom';

describe('ChatAssistant Component', () => {
    const defaultContext = {
        location: 'California',
        monthlyKwh: '300',
        commuteDistance: '20',
        vehicleType: 'petrol'
    };

    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock scrollIntoView since jsdom doesn't implement layout logic
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('renders the initial welcome state if history is empty', () => {
        render(
            <ChatAssistant 
                userContext={defaultContext} 
                chatHistory={[]} 
                setChatHistory={vi.fn()} 
            />
        );

        expect(screen.getByText(/Welcome to your Eco-Budget Advisor!/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Ask for custom saving roadmaps.../i)).toBeInTheDocument();
    });

    it('renders message logs and triggers api call on form submit', async () => {
        const setChatHistory = vi.fn();
        const chatHistory = [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' }
        ];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ reply: 'Here are some tips.' })
        });

        render(
            <ChatAssistant 
                userContext={defaultContext} 
                chatHistory={chatHistory} 
                setChatHistory={setChatHistory} 
            />
        );

        // Verify history messages are rendered
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there!')).toBeInTheDocument();

        // Submit new message
        const input = screen.getByPlaceholderText(/Ask for custom saving roadmaps.../i);
        fireEvent.change(input, { target: { value: 'How to save energy?' } });

        const submitButton = screen.getByRole('button', { name: /Send/i });
        fireEvent.click(submitButton);

        // Verify state update is triggered
        expect(setChatHistory).toHaveBeenCalled();
    });
});
