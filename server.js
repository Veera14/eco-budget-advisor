import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Initialize API client
const apiProvider = process.env.API_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai');
const openaiApiKey = process.env.OPENAI_API_KEY;

let openai = null;
if (openaiApiKey && openaiApiKey !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
} else if (apiProvider === 'openai') {
  console.warn('WARNING: OPENAI_API_KEY is not configured or uses placeholder value.');
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

    // Build the advisor's system prompt incorporating user context
    let contextString = 'No specific user context provided.';
    if (userContext && Object.keys(userContext).length > 0) {
      contextString = JSON.stringify(userContext, null, 2);
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

    if (apiProvider === 'gemini') {
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
        parts: [{ text: newMessage }]
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
        { role: 'user', content: newMessage }
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
      });

      advice = response.choices[0].message.content;
    }

    return res.json({
      success: true,
      advice: advice,
      reply: advice
    });

  } catch (error) {
    console.error('Error during chat completions request:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Carbon Footprint Advisor server is running on http://localhost:${port}`);
});
