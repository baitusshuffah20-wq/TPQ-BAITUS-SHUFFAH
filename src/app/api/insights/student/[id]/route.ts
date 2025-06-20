import { NextRequest, NextResponse } from 'next/server';
import { aiInsights } from '@/lib/ai-insights';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Generate comprehensive insights
    const [basicInsights, predictiveInsights] = await Promise.all([
      aiInsights.generateStudentInsights(studentId),
      aiInsights.generatePredictiveInsights(studentId)
    ]);

    if (!basicInsights) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        basic: basicInsights,
        predictive: predictiveInsights
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating student insights:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
