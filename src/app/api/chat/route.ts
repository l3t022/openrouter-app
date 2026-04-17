import { NextRequest } from 'next/server';
import { safeValidateChatRequest } from '@/lib/validations';

export const runtime = 'edge';

const DEFAULT_MODEL = 'openrouter/free';
const BASE_URL = process.env.OPENROUTER_API_BASE_URL || 'https://openrouter.ai/api/v1';
const HTTP_REFERER = process.env.OPENROUTER_HTTP_REFERER || 'https://antigravity-openrouter.app';
const APP_TITLE = process.env.OPENROUTER_APP_TITLE || 'Antigravity BYOK Assistant';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = safeValidateChatRequest(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return new Response(JSON.stringify({ error: 'Validation failed', details: errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, model, apiKey } = validation.data;

    const orResponse = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': HTTP_REFERER,
        'X-Title': APP_TITLE,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        stream: true,
      }),
    });

    if (!orResponse.ok) {
      const errText = await orResponse.text();
      let errMsg = `OpenRouter error ${orResponse.status}`;
      try {
        errMsg = JSON.parse(errText)?.error?.message || errMsg;
      } catch {}
      return new Response(JSON.stringify({ error: errMsg }), {
        status: orResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = orResponse.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            for (const line of chunk.split('\n')) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content ?? '';
                if (content) controller.enqueue(encoder.encode(content));
              } catch {}
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}