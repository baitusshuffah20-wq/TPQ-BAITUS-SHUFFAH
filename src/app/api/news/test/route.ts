import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple test endpoint to check if the News model is accessible
export async function GET(request: NextRequest) {
  try {
    // Count news items
    const count = await prisma.news.count();
    
    // Get first 5 news items
    const news = await prisma.news.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      count,
      news
    });
  } catch (error) {
    console.error('Error in news test endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to access news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}