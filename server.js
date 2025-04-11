const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pipeline } = require('@xenova/transformers');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

let sentimentPipeline;

(async () => {
  try {
    console.log('Starting model loading...');
    sentimentPipeline = await pipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
    console.log('Sentiment analysis model loaded');
  } catch (err) {
    console.error('Model loading error:', err);
    sentimentPipeline = {
      analyze: async (text) => [{ label: 'neutral', score: 0 }]
    };
  }
})();

app.use((req, res, next) => {
  if (!sentimentPipeline) {
    return res.status(503).json({
      error: "Sentiment model loading",
      ready: false
    });
  }
  next();
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const sentimentResult = await sentimentPipeline(message);

    if (sentimentResult[0].label.toUpperCase() === 'NEGATIVE' && sentimentResult[0].score > 0.7) {
      console.log('[ALERT] User is showing signs of distress.');
    }

    if (message.toLowerCase().includes('suicide') || message.toLowerCase().includes('end my life')) {
      console.log('[EMERGENCY] User may be in immediate danger.');
    }

    const prompt = `[User] ${message}\n[Assistant]`;
    const deepSeekResponse = await axios.post('http://127.0.0.1:8000/generate', {
      prompt,
      max_tokens: 150,
      temperature: 0.7
    });

    res.json({
      response: deepSeekResponse.data.response,
      sentiment: sentimentResult[0].label.toLowerCase(),
      score: sentimentResult[0].score
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({
      error: "Error processing message",
      fallback: "I'm having trouble right now. Please try again later."
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sentiment_model_loaded: !!sentimentPipeline
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
