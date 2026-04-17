# API Documentation

## Endpoints

### GET /api/models

Returns categorized list of available OpenRouter models.

**Response:**
```json
{
  "all": [...],
  "free": [...],
  "vision": [...],
  "coding": [...]
}
```

**Caching:** `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`

---

### POST /api/chat

Send a chat message to OpenRouter.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ],
  "model": "openrouter/free",
  "apiKey": "sk-or-v1-..."
}
```

**Response:** Streamed text (SSE)

**Validation:** Zod schema validates request body

**Error Handling:**
- 400: Validation failed
- 429: Rate limited (triggers fallback)
- 500+: Server error (triggers fallback)

---

## Error Response Format

```json
{
  "error": "Error message",
  "details": ["detail1", "detail2"] // optional, for validation errors
}
```