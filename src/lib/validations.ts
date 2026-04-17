import { z } from 'zod';

export const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  model: z.string().optional(),
  apiKey: z.string().min(1, 'API Key is required'),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  choices: z.array(
    z.object({
      delta: z.object({
        content: z.string().optional(),
      }),
    })
  ),
});

export const ModelsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      pricing: z.object({
        prompt: z.string(),
        completion: z.string(),
        image: z.string().optional(),
      }),
      context_length: z.number(),
    })
  ),
});

export function validateChatRequest(data: unknown): ChatRequest {
  return ChatRequestSchema.parse(data);
}

export function safeValidateChatRequest(data: unknown) {
  return ChatRequestSchema.safeParse(data);
}