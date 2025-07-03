import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Claude AI Proxy Endpoint
app.post('/api/claude', async (req, res) => {
  try {
    const { apiKey, prompt } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Fallback if response isn't JSON
        const errorText = await response.text();
        console.error('Claude API Error:', response.status, errorText);
        return res.status(response.status).json({ 
          error: `Claude API Error: ${response.status} ${response.statusText}`,
          details: errorText
        });
      }

      console.error('Claude API Error:', response.status, errorData);

      // Handle specific error types
      if (errorData.error?.type === 'invalid_request_error') {
        const message = errorData.error.message;
        
        // Check for billing/credit issues
        if (message.includes('credit balance is too low') || message.includes('billing')) {
          return res.status(402).json({
            error: 'Insufficient Claude AI Credits',
            message: 'Your Claude AI account has insufficient credits. Please visit the Anthropic Console to add credits or upgrade your plan.',
            type: 'billing_error',
            consoleUrl: 'https://console.anthropic.com/settings/billing'
          });
        }
        
        // Check for API key issues
        if (message.includes('api key') || message.includes('authentication')) {
          return res.status(401).json({
            error: 'Invalid API Key',
            message: 'The provided Claude AI API key is invalid or has expired. Please check your API key in the Anthropic Console.',
            type: 'auth_error',
            consoleUrl: 'https://console.anthropic.com/settings/keys'
          });
        }
      }

      // Default error handling
      return res.status(response.status).json({ 
        error: `Claude AI API Error: ${response.status} ${response.statusText}`,
        message: errorData.error?.message || 'Unknown error occurred',
        details: errorData
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Catch-all handler: send back Vue app for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
  console.log(`Claude AI proxy available at http://localhost:${PORT}/api/claude`);
}); 