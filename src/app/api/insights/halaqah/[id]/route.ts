import { NextRequest, NextResponse } from 'next/server';
import { aiInsights } from '@/lib/ai-insights';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const halaqahId = params.id;

    if (!halaqahId) {
      return NextResponse.json(
        { error: 'Halaqah ID is required' },
        { status: 400 }
      );
    }

    const classInsights = await aiInsights.generateClassInsights(halaqahId);

    if (!classInsights) {
      return NextResponse.json(
        { error: 'Halaqah not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: classInsights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating halaqah insights:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
