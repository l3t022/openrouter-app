import { OpenRouterModel } from '@/types';

const BASE_URL = process.env.OPENROUTER_API_BASE_URL || 'https://openrouter.ai/api/v1';
const HTTP_REFERER = process.env.OPENROUTER_HTTP_REFERER || 'https://antigravity-openrouter.app';
const APP_TITLE = process.env.OPENROUTER_APP_TITLE || 'Antigravity BYOK Assistant';

export class OpenRouterService {
  static async fetchModels(): Promise<OpenRouterModel[]> {
    const response = await fetch(`${BASE_URL}/models`, {
      headers: {
        'HTTP-Referer': HTTP_REFERER,
        'X-OpenRouter-Title': APP_TITLE,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  }
}
