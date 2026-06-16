// server.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Set up environment variables before importing app
process.env.NODE_ENV = 'test';
process.env.API_PROVIDER = 'openai';
process.env.OPENAI_API_KEY = 'mock_key';
process.env.GEMINI_API_KEY = 'mock_gemini_key';

vi.mock('openai', () => {
  class MockOpenAI {
    constructor() {
      this.chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'OpenAI Test Response: Avoid waste!'
                }
              }
            ]
          })
        }
      };
    }
  }
  return {
    default: MockOpenAI,
    OpenAI: MockOpenAI
  };
});

// Mock fetch for Gemini API
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import app after setting up envs and mocks
import app from './server.js';

describe('Carbon Footprint Advisor API Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/advisor returns 400 for empty prompt', async () => {
    const response = await request(app)
      .post('/api/advisor')
      .send({
        userContext: {},
        newMessage: ''
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('newMessage is required');
  });

  it('POST /api/advisor uses OpenAI and returns advice successfully', async () => {
    const response = await request(app)
      .post('/api/advisor')
      .send({
        userContext: { location: 'California' },
        newMessage: 'How do I save water?'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.reply).toContain('OpenAI Test Response');
  });

  it('POST /api/advisor uses Gemini and returns advice successfully', async () => {
    // Temporarily modify the provider variable inside server or test
    // Note: process.env.API_PROVIDER determines provider selection in server.js
    process.env.API_PROVIDER = 'gemini';

    // Mock Gemini API fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'Gemini Test Response: Use public transport!' }]
            }
          }
        ]
      })
    });

    const response = await request(app)
      .post('/api/advisor')
      .send({
        userContext: { location: 'California' },
        newMessage: 'How do I save transport emissions?'
      });

    // Reset back
    process.env.API_PROVIDER = 'openai';

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.reply).toContain('Gemini Test Response');
  });
});
