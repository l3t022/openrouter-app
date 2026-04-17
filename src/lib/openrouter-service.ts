import { OpenRouterModel } from '@/types';

export class OpenRouterService {
  private static BASE_URL = 'https://openrouter.ai/api/v1';

  static async fetchModels(): Promise<OpenRouterModel[]> {
    const response = await fetch(`${this.BASE_URL}/models`, {
      headers: {
        'HTTP-Referer': 'https://antigravity-openrouter.app',
        'X-OpenRouter-Title': 'Antigravity BYOK Assistant',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  }
}
