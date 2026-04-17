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

export interface CategorizedModels {
  all: OpenRouterModel[];
  free: OpenRouterModel[];
  vision: OpenRouterModel[];
  coding: OpenRouterModel[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SelectedModels {
  text: string;
  code: string;
  vision: string;
  fallback: string;
}

export interface Toast {
  id: number;
  title: string;
  msg: string;
  type: 'error' | 'success' | 'info';
}