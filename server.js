const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Helper: Emergency keyword detection
const isEmergency = (text) => {
  const triggers = ['suicide', 'end my life', 'kill myself', 'can’t go on', 'give up', 'hurt myself'];
  const lowered = text.toLowerCase();
  return triggers.some(trigger => lowered.includes(trigger));
};

// POST /chat route – combines sentiment + Python empathy response
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Step 1: Gemini – Sentiment + basic supportive reply
    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `
You are a highly professional therapist named Serene, trained in emotional support and mental wellbeing. You are calm, empathetic, and never judgmental. The user is sharing a thought with you.

Task:
1. Analyze the sentiment of the following message and label it as "positive", "neutral", or "negative".
2. Then, write a supportive, compassionate response like a personal wellbeing companion.

Message:
"${message}"

Format your reply as:
Sentiment: <sentiment>
Response: <your empathetic and helpful response>
              `.trim()
            }
          ]
        }
      ]
    };

    const geminiRes = await axios.post(GEMINI_ENDPOINT, geminiPayload, {
      headers: { "Content-Type": "application/json" }
    });

    const fullText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const sentimentMatch = fullText.match(/Sentiment:\s*(positive|neutral|negative)/i);
    const sentiment = sentimentMatch ? sentimentMatch[1].toLowerCase() : 'neutral';

    // Step 2: Python FastAPI – deeper empathy response
    let sereneResponse = "I'm here for you. Please tell me more.";
    try {
      const pythonRes = await axios.post("http://localhost:8000/chat", { prompt: message });
      sereneResponse = pythonRes.data?.response || sereneResponse;
    } catch (fastapiErr) {
      console.warn('[FastAPI error]:', fastapiErr.message);
    }

    // Step 3: Emergency check
    const emergency = isEmergency(message);
    if (sentiment === 'negative') {
      console.log('[ALERT] User showing signs of distress.');
    }
    if (emergency) {
      console.log('[EMERGENCY] Possible self-harm or suicide ideation detected.');
      // TODO: Notify therapist or trigger emergency intervention
    }

    // Final unified response
    res.json({
      sentiment,
      response: sereneResponse,
      emergency
    });

  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({
      error: "Error processing message",
      fallback: "I'm having trouble right now. Please try again later."
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gemini: !!GEMINI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
