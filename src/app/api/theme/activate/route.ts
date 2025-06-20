import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit-log';

// POST handler - Activate a theme
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Theme ID is required',
      }, { status: 400 });
    }

    // Check if theme exists
    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      return NextResponse.json({
        success: false,
        error: 'Theme not found',
      }, { status: 404 });
    }

    // Deactivate all themes
    await prisma.theme.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate the selected theme
    const activatedTheme = await prisma.theme.update({
      where: { id },
      data: { isActive: true },
    });

    // Create audit log
    await createAuditLog({
      action: 'ACTIVATE',
      entity: 'THEME',
      entityId: id,
      userId: session.user.id,
      newData: JSON.stringify(activatedTheme),
    });

    return NextResponse.json({
      success: true,
      theme: activatedTheme,
      message: 'Theme activated successfully',
    });
  } catch (error) {
    console.error('Error activating theme:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to activate theme',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}