const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'serene-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS should be true in production
}));

// Gemini API Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String // For demo; hash in production
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

// Emergency keyword checker
const isEmergency = (text) => {
  const triggers = ['suicide', 'end my life', 'kill myself', 'can’t go on', 'give up', 'hurt myself'];
  return triggers.some(trigger => text.toLowerCase().includes(trigger));
};

// Serve login page by default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }); // No hashing (demo only)
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  req.session.userId = user._id;
  res.json({ success: true, userId: user._id });
});

// Serve chat page (protected route)
app.get('/chat', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public/chat.html'));
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Chat API
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const userId = req.session.userId;

  if (!userId || !message) return res.status(400).json({ error: 'Message and login required' });

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
    if (emergency) console.log('[EMERGENCY] Self-harm/suicide ideation detected.');

    await Chat.create({
      userId,
      userMessage: message,
      botResponse: sereneResponse,
      sentiment,
      emergency
    });

    res.json({ sentiment, response: sereneResponse, emergency });

  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: "Processing error", fallback: "Please try again later." });
  }
});

// Get chat history
app.get('/history', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const chats = await Chat.find({ userId }).sort({ timestamp: 1 });
  res.json(chats);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', gemini: !!GEMINI_API_KEY });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
