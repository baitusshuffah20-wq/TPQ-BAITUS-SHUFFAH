import { NextRequest, NextResponse } from 'next/server';
import { aiInsights } from '@/lib/ai-insights';

export async function GET(request: NextRequest) {
  try {
    const systemInsights = await aiInsights.generateSystemInsights();

    return NextResponse.json({
      success: true,
      data: systemInsights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating system insights:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
