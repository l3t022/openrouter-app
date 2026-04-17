import { NextResponse } from 'next/server';
import { OpenRouterService } from '@/lib/openrouter-service';

export async function GET() {
  try {
    const models = await OpenRouterService.fetchModels();
    
    // Categorize models for the frontend
    const categorized = {
      all: models,
      free: models.filter(OpenRouterService.isFree),
      vision: models.filter(OpenRouterService.isVision),
      coding: models.filter(OpenRouterService.isCoding),
    };

    return NextResponse.json(categorized);
  } catch (error) {
    console.error('API Models Error:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
