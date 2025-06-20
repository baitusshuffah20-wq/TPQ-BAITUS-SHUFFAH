import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit-log';
import path from 'path';
import fs from 'fs';

// POST handler - Generate certificate for an achievement
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'MUSYRIF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    // Get the achievement
    const achievement = await prisma.santriAchievement.findUnique({
      where: { id },
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            nis: true,
          },
        },
        badge: true,
      },
    });

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    if (!achievement.isUnlocked) {
      return NextResponse.json(
        { error: 'Cannot generate certificate for locked achievement' },
        { status: 400 }
      );
    }

    if (achievement.certificateGenerated && achievement.certificateUrl) {
      return NextResponse.json(
        { error: 'Certificate already generated', certificateUrl: achievement.certificateUrl },
        { status: 400 }
      );
    }

    // In a real implementation, you would generate a PDF certificate
    // For this example, we'll just create a placeholder URL

    const certificateFileName = `${achievement.santri.nis}_${achievement.badge.id}_certificate.pdf`;
    const certificateUrl = `/certificates/${certificateFileName}`;

    // Update the achievement to mark certificate as generated
    const updatedAchievement = await prisma.santriAchievement.update({
      where: { id },
      data: {
        certificateGenerated: true,
        certificateUrl: certificateUrl,
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'GENERATE_CERTIFICATE',
      entity: 'SANTRI_ACHIEVEMENT',
      entityId: id,
      userId: session.user.id,
      newData: JSON.stringify({ certificateUrl }),
    });

    return NextResponse.json({
      success: true,
      achievement: updatedAchievement,
      certificateUrl,
    });
  } catch (error) {
    console.error('Error generating achievement certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate achievement certificate' },
      { status: 500 }
    );
  }
}

// GET handler - Download certificate for an achievement
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    // Get the achievement
    const achievement = await prisma.santriAchievement.findUnique({
      where: { id },
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            nis: true,
          },
        },
        badge: true,
      },
    });

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    if (!achievement.certificateGenerated || !achievement.certificateUrl) {
      return NextResponse.json(
        { error: 'Certificate not generated yet' },
        { status: 400 }
      );
    }

    // In a real implementation, you would return the actual certificate file
    // For this example, we'll just return the URL

    return NextResponse.json({
      success: true,
      certificateUrl: achievement.certificateUrl,
    });
  } catch (error) {
    console.error('Error downloading achievement certificate:', error);
    return NextResponse.json(
      { error: 'Failed to download achievement certificate' },
      { status: 500 }
    );
  }
}