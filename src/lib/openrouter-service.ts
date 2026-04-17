export interface ModelPricing {
  prompt: string;
  completion: string;
  image?: string;
  request?: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: ModelPricing;
  context_length: number;
  top_provider?: {
    context_length: number;
    max_completion_tokens: number;
  };
}

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

  static isFree(model: OpenRouterModel): boolean {
    return (
      (model.pricing.prompt === '0' || model.pricing.prompt === '0.0') &&
      (model.pricing.completion === '0' || model.pricing.completion === '0.0')
    );
  }

  static isVision(model: OpenRouterModel): boolean {
    const visionKeywords = ['vision', 'multimodal', 'vl', 'phi-3-vision'];
    return (
      !!model.pricing.image ||
      visionKeywords.some((kw) => model.id.toLowerCase().includes(kw) || model.name.toLowerCase().includes(kw))
    );
  }

  static isCoding(model: OpenRouterModel): boolean {
    const codingKeywords = ['code', 'coder', 'script', 'programming', 'dev'];
    return codingKeywords.some(
      (kw) => model.id.toLowerCase().includes(kw) || model.name.toLowerCase().includes(kw)
    );
  }

  static formatPrice(priceStr: string): string {
    const price = parseFloat(priceStr) * 1_000_000;
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  }
}
