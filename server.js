const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Schema definitions
const userSchema = new mongoose.Schema({
  username: String,
  password: String // In production, hash passwords!
});

const chatSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userMessage: String,
  botResponse: String,
  sentiment: String,
  emergency: Boolean,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);

// Emergency trigger helper
const isEmergency = (text) => {
  const triggers = ['suicide', 'end my life', 'kill myself', 'can’t go on', 'give up', 'hurt myself'];
  return triggers.some(trigger => text.toLowerCase().includes(trigger));
};

// Auth: Basic login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }); // No password hashing for demo
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ userId: user._id });
});

// Chat route
app.post('/chat', async (req, res) => {
  const { message, userId } = req.body;
  if (!message || !userId) return res.status(400).json({ error: 'Message and userId required' });

  try {
    const geminiPayload = {
      contents: [{
        role: 'user',
        parts: [{
          text: `
You are a highly professional therapist named Serene. The user is sharing a thought.

Task:
1. Label sentiment: "positive", "neutral", or "negative".
2. Respond compassionately.

Message: "${message}"

Format:
Sentiment: <sentiment>
Response: <response>
          `.trim()
        }]
      }]
    };

    const geminiRes = await axios.post(GEMINI_ENDPOINT, geminiPayload, {
      headers: { "Content-Type": "application/json" }
    });

    const fullText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const sentimentMatch = fullText.match(/Sentiment:\s*(positive|neutral|negative)/i);
    const sentiment = sentimentMatch ? sentimentMatch[1].toLowerCase() : 'neutral';

    let sereneResponse = "I'm here for you. Please tell me more.";
    try {
      const pythonRes = await axios.post("http://localhost:8000/chat", { prompt: message });
      sereneResponse = pythonRes.data?.response || sereneResponse;
    } catch (fastapiErr) {
      console.warn('[FastAPI error]:', fastapiErr.message);
    }

    const emergency = isEmergency(message);
    if (emergency) {
      console.log('[EMERGENCY] Possible self-harm or suicide ideation detected.');
    }

    // Save chat to DB
    await Chat.create({
      userId,
      userMessage: message,
      botResponse: sereneResponse,
      sentiment,
      emergency
    });

    res.json({
      sentiment,
      response: sereneResponse,
      emergency
    });

  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: "Processing error", fallback: "Please try again later." });
  }
});

// Get chat history
app.get('/history/:userId', async (req, res) => {
  const chats = await Chat.find({ userId: req.params.userId }).sort({ timestamp: 1 });
  res.json(chats);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', gemini: !!GEMINI_API_KEY });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
