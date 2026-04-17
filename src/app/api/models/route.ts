import { NextResponse } from 'next/server';
import { OpenRouterService } from '@/lib/openrouter-service';
import { isFreeModel, isVisionModel, isCodingModel } from '@/lib/utils';

export const runtime = 'edge';

export async function GET() {
  try {
    const models = await OpenRouterService.fetchModels();
    
    const categorized = {
      all: models,
      free: models.filter(isFreeModel),
      vision: models.filter(isVisionModel),
      coding: models.filter(isCodingModel),
    };

    return NextResponse.json(categorized, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('API Models Error:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}