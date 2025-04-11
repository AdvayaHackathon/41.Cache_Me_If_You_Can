const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pipeline } = require('@xenova/transformers');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Model Initialization
let chatPipeline;
let sentimentPipeline;

(async () => {
  try {
    console.log('Starting model loading...');

    // Initialize sentiment analysis pipeline
    sentimentPipeline = await pipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
    console.log('Sentiment analysis model loaded');

    // Initialize text generation pipeline with a smaller, compatible model
    chatPipeline = await pipeline(
      'text-generation',
      'Xenova/tiny-llama-1.1b'
    );
    console.log('Text generation model loaded');

  } catch (err) {
    console.error('Model loading error:', err);

    // Fallback sentiment and chat handlers
    sentimentPipeline = {
      analyze: async (text) => [{ label: 'neutral', score: 0 }]
    };

    chatPipeline = {
      generate: async (text) => [{
        generated_text: "I'm having temporary issues. Please try again later."
      }]
    };
  }
})();

// Middleware to check if models are loaded
app.use((req, res, next) => {
  if (!chatPipeline || !sentimentPipeline) {
    return res.status(503).json({
      error: "Models are still loading",
      ready: false
    });
  }
  next();
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Analyze sentiment
    const sentimentResult = await sentimentPipeline(message);

    // Notify therapist if sentiment is strongly negative
    if (sentimentResult[0].label.toUpperCase() === 'NEGATIVE' && sentimentResult[0].score > 0.7) {
      console.log('[ALERT] User is showing signs of distress.');
    }

    // Emergency trigger for self-harm phrases
    if (message.toLowerCase().includes('suicide') || message.toLowerCase().includes('end my life')) {
      console.log('[EMERGENCY] User may be in immediate danger.');
    }

    // Generate AI response
    const prompt = `[User] ${message}\n[Assistant]`;
    const response = await chatPipeline(prompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      do_sample: true
    });

    res.json({
      response: response[0].generated_text,
      sentiment: sentimentResult[0].label.toLowerCase(),
      score: sentimentResult[0].score
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      error: "Error processing your message",
      fallback: "I'm having trouble understanding right now. Can you rephrase that?"
    });
  }
});

// Sentiment-only endpoint
app.post('/analyze-sentiment', async (req, res) => {
  const { message } = req.body;

  try {
    const result = await sentimentPipeline(message);
    res.json({
      sentiment: result[0].label.toLowerCase(),
      score: result[0].score
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    models_loaded: {
      chat: !!chatPipeline,
      sentiment: !!sentimentPipeline
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
