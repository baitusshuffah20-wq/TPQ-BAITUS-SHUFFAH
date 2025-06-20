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

// GET handler - Get all badges
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const rarity = url.searchParams.get('rarity');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Build filter object
    let filter: any = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (rarity && rarity !== 'all') {
      filter.rarity = rarity;
    }

    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameArabic: { contains: search } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get badges from database
    const badges = await prisma.achievementBadge.findMany({
      where: filter,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}

// POST handler - Create a new badge
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Validate badge data
    const validationResult = badgeSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Create badge in database
    const badge = await prisma.achievementBadge.create({
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
      action: 'CREATE',
      entity: 'ACHIEVEMENT_BADGE',
      entityId: badge.id,
      userId: session.user.id,
      newData: JSON.stringify(badge),
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 });
  }
}