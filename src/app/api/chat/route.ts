import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Edge Runtime — no Node.js SDK needed

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://antigravity-openrouter.app',
        'X-Title': 'Antigravity BYOK Assistant',
      },
      body: JSON.stringify({
        model: model || 'openrouter/free',
        messages,
        stream: true,
      }),
    });

    if (!orResponse.ok) {
      const errText = await orResponse.text();
      let errMsg = `OpenRouter error ${orResponse.status}`;
      try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch {}
      return new Response(JSON.stringify({ error: errMsg }), {
        status: orResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream SSE from OpenRouter → plain text to the client
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

            // OpenRouter sends SSE lines: "data: {...}\n\n"
            for (const line of chunk.split('\n')) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content ?? '';
                if (content) controller.enqueue(encoder.encode(content));
              } catch {
                // skip malformed SSE chunks
              }
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
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to process chat' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
