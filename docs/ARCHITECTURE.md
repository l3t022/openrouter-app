# Architecture - OpenRouter BYOK Assistant

## Overview

This is a Next.js 16 application that provides a chat interface for OpenRouter.ai models with model selection, fallback retry, and streaming responses.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, CSS Modules
- **State:** SWR for data fetching, React hooks for UI state
- **Validation:** Zod
- **Testing:** Vitest + React Testing Library

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoint with streaming
│   │   └── models/       # Models listing endpoint
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard page
├── components/           # React components
│   ├── ChatInput.tsx
│   ├── ChatMessages.tsx
│   ├── MarkdownRenderer.tsx
│   ├── ModelPicker.tsx
│   ├── SettingsPanel.tsx
│   ├── SkeletonLoaders.tsx
│   └── ToastContainer.tsx
├── hooks/                # Custom React hooks
│   ├── useChat.ts       # Chat logic hook
│   └── useModels.ts     # Models fetching with SWR
├── lib/                  # Utilities and services
│   ├── openrouter-service.ts
│   ├── utils.ts         # Helper functions
│   └── validations.ts   # Zod schemas
└── types/               # TypeScript types
    └── index.ts
```

## Data Flow

1. **Models Loading:** `useModels` hook fetches from `/api/models` with SWR caching
2. **Chat Flow:** `useChat` hook handles message sending, streaming, and fallback logic
3. **API Routes:** Edge runtime APIs handle OpenRouter communication

## Environment Variables

See `.env.example` for configuration options:

- `OPENROUTER_API_BASE_URL` - OpenRouter API endpoint
- `OPENROUTER_HTTP_REFERER` - HTTP Referer header
- `OPENROUTER_APP_TITLE` - App title for OpenRouter

## Security

- Zod validation on API requests
- Security headers configured in `next.config.ts`
- Environment-based configuration