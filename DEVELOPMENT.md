# Development Setup - AI DocType Generator

## Overview

The AI DocType Generator now includes a backend proxy server to handle Claude AI API requests and avoid CORS issues.

## Architecture

- **Frontend**: Vue.js application (runs on https://localhost:3000)
- **Backend**: Express.js proxy server (runs on http://localhost:3002)
- **API Proxy**: All `/api/*` requests are automatically proxied from frontend to backend

## Development Workflow

### Option 1: Run Both Services (Recommended)

```bash
npm run dev:full
```

This will start both:
- Frontend development server (Vite) on https://localhost:3000
- Backend proxy server (Express) on http://localhost:3002

### Option 2: Run Separately

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## How It Works

1. User enters Claude AI API key in the frontend
2. Frontend sends requests to `/api/claude` (proxied to backend)
3. Backend securely calls Claude AI API with the user's API key
4. Response is returned through the proxy to avoid CORS issues

## Production Deployment

```bash
npm run start
```

This will:
1. Build the Vue.js application
2. Start the Express server serving both the built app and API proxy

## API Endpoints

- `POST /api/claude` - Proxy to Claude AI API
  - Body: `{ apiKey: string, prompt: string }`
  - Returns: Claude AI response with generated DocType and HTML

## Environment Requirements

- Node.js 18+ (for native fetch support)
- NPM/Yarn for package management

## Security Notes

- API keys are handled client-side and passed through the proxy
- No API keys are stored on the server
- HTTPS is used for the frontend development server 