import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit-log';

// Schema for badge validation
const badgeSchema = z.object({
  name: z.string().min(1, "Nama badge wajib diisi"),
  nameArabic: z.string().min(1, "Nama Arab wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  icon: z.string().min(1, "Icon wajib diisi"),
  color: z.string().min(1, "Warna wajib diisi"),
  category: z.enum(["HAFALAN", "ATTENDANCE", "BEHAVIOR", "ACADEMIC", "SPECIAL"]),
  criteriaType: z.enum(["SURAH_COUNT", "AYAH_COUNT", "PERFECT_SCORE", "STREAK", "TIME_BASED", "CUSTOM"]),
  criteriaValue: z.number().min(1, "Nilai kriteria minimal 1"),
  criteriaCondition: z.enum(["GREATER_THAN", "EQUAL", "LESS_THAN", "BETWEEN"]),
  timeframe: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "ALL_TIME"]).optional(),
  rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
  points: z.number().min(1, "Poin minimal 1"),
  isActive: z.boolean().default(true),
  unlockMessage: z.string().min(1, "Pesan pembuka wajib diisi"),
  shareMessage: z.string().min(1, "Pesan berbagi wajib diisi"),
});

// GET handler - Get a specific badge
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

    const badge = await prisma.achievementBadge.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            achievements: true,
          },
        },
      },
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Error fetching badge:', error);
    return NextResponse.json({ error: 'Failed to fetch badge' }, { status: 500 });
  }
}

// PUT handler - Update a badge
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const data = await req.json();

    // Validate badge data
    const validationResult = badgeSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Get the existing badge for audit log
    const existingBadge = await prisma.achievementBadge.findUnique({
      where: { id },
    });

    if (!existingBadge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Update badge in database
    const updatedBadge = await prisma.achievementBadge.update({
      where: { id: String(id) },
      data: {
        name: data.name,
        nameArabic: data.nameArabic,
        description: data.description,
        icon: data.icon,
        color: data.color,
        category: data.category,
        criteriaType: data.criteriaType,
        criteriaValue: data.criteriaValue,
        criteriaCondition: data.criteriaCondition,
        timeframe: data.timeframe,
        rarity: data.rarity,
        points: data.points,
        isActive: data.isActive,
        unlockMessage: data.unlockMessage,
        shareMessage: data.shareMessage,
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      entity: 'ACHIEVEMENT_BADGE',
      entityId: id,
      userId: session.user.id,
      oldData: JSON.stringify(existingBadge),
      newData: JSON.stringify(updatedBadge),
    });

    return NextResponse.json(updatedBadge);
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
  }
}

// DELETE handler - Delete a badge
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    // Check if badge exists
    const badge = await prisma.achievementBadge.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            achievements: true,
          },
        },
      },
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Check if badge is used by any santri
    if (badge._count.achievements > 0) {
      return NextResponse.json(
        { error: 'Cannot delete badge that is used by santri' },
        { status: 400 }
      );
    }

    // Delete badge from database
    await prisma.achievementBadge.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      action: 'DELETE',
      entity: 'ACHIEVEMENT_BADGE',
      entityId: id,
      userId: session.user.id,
      oldData: JSON.stringify(badge),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 });
  }
}