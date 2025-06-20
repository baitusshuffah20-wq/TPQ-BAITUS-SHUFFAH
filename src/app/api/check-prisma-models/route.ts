import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/check-prisma-models - Check available Prisma models
export async function GET(request: NextRequest) {
  try {
    // Get all available models in Prisma client
    const models = Object.keys(prisma).filter(key => 
      typeof prisma[key as keyof typeof prisma] === 'object' && 
      prisma[key as keyof typeof prisma] !== null &&
      !key.startsWith('_')
    );
    
    // Check if specific models exist
    const hafalanProgressExists = models.includes('hafalanProgress');
    const santriExists = models.includes('santri');
    
    return NextResponse.json({
      success: true,
      models,
      hafalanProgressExists,
      santriExists
    });
  } catch (error) {
    console.error('Error checking Prisma models:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check Prisma models', error: String(error) },
      { status: 500 }
    );
  }
}