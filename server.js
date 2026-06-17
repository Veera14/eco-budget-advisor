import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable Helmet for security headers
app.use(helmet());

// Enable gzip compression for better network efficiency
app.use(compression());

// Restrict CORS to authorized origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'test') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Parse incoming requests with JSON payloads (with size limit for DOS mitigation)
app.use(express.json({ limit: '10kb' }));

// Rate Limiter: Limit requests from the same IP to 60 requests per 10 minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 10 minutes.'
  }
});

// Apply rate limiting specifically to the advisor endpoint
app.use('/api/advisor', limiter);


// Initialize API client
const openaiApiKey = process.env.OPENAI_API_KEY;

let openai = null;
if (openaiApiKey && openaiApiKey !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
}


// Simple in-memory cache for advisor queries
const cache = new Map();

// Sanitizes input strings to prevent XSS / HTML injection
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Generate a cache key based on query context and user prompt
function getCacheKey(userContext, messageHistory, newMessage) {
  const contextPart = userContext ? JSON.stringify(userContext) : '';
  const historyPart = messageHistory ? JSON.stringify(messageHistory) : '';
  return `${contextPart}:${historyPart}:${newMessage}`;
}

/**
 * POST /api/advisor
 * Endpoint to interact with the Carbon Footprint Advisor.
 * Expects JSON payload:
 * {
 *   "userContext": { ... }, // Optional object describing user's footprint / goals
 *   "messageHistory": [ ... ], // Optional array of previous messages: { role: 'user'|'assistant', content: '...' }
 *   "newMessage": "..." // Required string representing the new user prompt
 * }
 */
app.post('/api/advisor', async (req, res) => {
  try {
    const { userContext, messageHistory, newMessage } = req.body;

    // Validate the incoming request body
    if (!newMessage || typeof newMessage !== 'string' || newMessage.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'newMessage is required and must be a non-empty string.'
      });
    }

    if (newMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'newMessage exceeds maximum length of 1000 characters.'
      });
    }

    if (userContext && (typeof userContext !== 'object' || Array.isArray(userContext))) {
      return res.status(400).json({
        success: false,
        error: 'userContext must be a non-array object.'
      });
    }

    if (messageHistory && !Array.isArray(messageHistory)) {
      return res.status(400).json({
        success: false,
        error: 'messageHistory must be an array.'
      });
    }

    // Sanitize and validate inputs
    const cleanMessage = sanitizeInput(newMessage);
    const cleanContext = {};
    if (userContext) {
      if (userContext.location !== undefined) {
        cleanContext.location = sanitizeInput(String(userContext.location));
      }
      if (userContext.vehicleType !== undefined) {
        cleanContext.vehicleType = sanitizeInput(String(userContext.vehicleType));
      }
      if (userContext.monthlyKwh !== undefined && userContext.monthlyKwh !== '') {
        const kwh = parseFloat(userContext.monthlyKwh);
        if (isNaN(kwh) || kwh < 0) {
          return res.status(400).json({
            success: false,
            error: 'monthlyKwh must be a non-negative number.'
          });
        }
        cleanContext.monthlyKwh = String(kwh);
      } else {
        cleanContext.monthlyKwh = '';
      }
      if (userContext.commuteDistance !== undefined && userContext.commuteDistance !== '') {
        const dist = parseFloat(userContext.commuteDistance);
        if (isNaN(dist) || dist < 0) {
          return res.status(400).json({
            success: false,
            error: 'commuteDistance must be a non-negative number.'
          });
        }
        cleanContext.commuteDistance = String(dist);
      } else {
        cleanContext.commuteDistance = '';
      }
    }

    // Check Cache first to improve efficiency
    const cacheKey = getCacheKey(cleanContext, messageHistory, cleanMessage);
    if (cache.has(cacheKey)) {
      const cachedResponse = cache.get(cacheKey);
      return res.json({
        success: true,
        advice: cachedResponse,
        reply: cachedResponse
      });
    }

    // Build the advisor's system prompt incorporating user context
    let contextString = 'No specific user context provided.';
    if (cleanContext && Object.keys(cleanContext).length > 0) {
      contextString = JSON.stringify(cleanContext, null, 2);
    }

    const systemPrompt = `You are a helpful and knowledgeable Carbon Footprint & Sustainability advisor.
Your goal is to guide the user on how to reduce their carbon emissions, adopt green and eco-friendly habits, save energy, and live more sustainably.
Give clear, actionable, and personalized advice based on the user's specific context.

User Context:
${contextString}

Please reply to the user's new message, maintaining a friendly and encouraging tone. Use markdown formatting for readability.`;

    // Map history to OpenAI message format
    const formattedHistory = [];
    if (messageHistory) {
      for (const msg of messageHistory) {
        if (!msg.role || !msg.content) {
          return res.status(400).json({
            success: false,
            error: 'Each item in messageHistory must contain both "role" and "content" fields.'
          });
        }
        if (msg.role !== 'user' && msg.role !== 'assistant' && msg.role !== 'system') {
          return res.status(400).json({
            success: false,
            error: 'Role in messageHistory must be "user", "assistant", or "system".'
          });
        }
        formattedHistory.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    let advice = '';
    const activeProvider = process.env.API_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai');

    if (activeProvider === 'gemini') {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY is not configured in environment or .env file.');
      }

      const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

      const contents = [];
      if (messageHistory) {
        for (const msg of messageHistory) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: cleanMessage }]
      });

      const body = {
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      };

      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API error (Status ${apiResponse.status})`);
      }

      const data = await apiResponse.json();
      advice = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!advice) {
        throw new Error('Empty response received from Gemini API.');
      }
    } else {
      if (!openai) {
        throw new Error('OpenAI client is not initialized. Check your OPENAI_API_KEY.');
      }

      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

      const messages = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: cleanMessage }
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
      });

      advice = response.choices[0].message.content;
    }

    // Save success response to Cache (evict oldest entry if size exceeds 200)
    if (cache.size >= 200) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    cache.set(cacheKey, advice);

    return res.json({
      success: true,
      advice: advice,
      reply: advice
    });

  } catch (error) {
    console.error('Error during chat completions request:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing your request. Please try again later.'
    });
  }
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Carbon Footprint Advisor server is running on http://localhost:${port}`);
  });
}

export default app;
