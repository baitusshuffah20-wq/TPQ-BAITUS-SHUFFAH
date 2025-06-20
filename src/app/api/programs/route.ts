import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active programs from database
    const programs = await prisma.program.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      programs
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch programs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}