import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit-log';

// Schema for santri achievement validation
const santriAchievementSchema = z.object({
  santriId: z.string().min(1, "ID santri wajib diisi"),
  badgeId: z.string().min(1, "ID badge wajib diisi"),
  achievedAt: z.string().transform(str => new Date(str)),
  progress: z.number().min(0).max(100).default(100),
  isUnlocked: z.boolean().default(true),
  notificationSent: z.boolean().default(false),
  certificateGenerated: z.boolean().default(false),
  certificateUrl: z.string().optional(),
  sharedAt: z.string().transform(str => new Date(str)).optional(),
  metadata: z.string().optional(),
});

// GET handler - Get all santri achievements
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const santriId = url.searchParams.get('santriId');
    const badgeId = url.searchParams.get('badgeId');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Build filter object
    let filter: any = {};

    if (santriId && santriId !== 'all') {
      filter.santriId = santriId;
    }

    if (badgeId && badgeId !== 'all') {
      filter.badgeId = badgeId;
    }

    if (status) {
      if (status === 'unlocked') {
        filter.isUnlocked = true;
      } else if (status === 'locked') {
        filter.isUnlocked = false;
      } else if (status === 'certificate') {
        filter.certificateGenerated = true;
      } else if (status === 'notification') {
        filter.notificationSent = false;
        filter.isUnlocked = true;
      }
    }

    // Get achievements from database
    const achievements = await prisma.santriAchievement.findMany({
      where: filter,
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            nis: true,
            halaqah: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        badge: true,
      },
      orderBy: { achievedAt: 'desc' },
    });

    // Filter by search if provided
    let filteredAchievements = achievements;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAchievements = achievements.filter(
        achievement =>
          achievement.santri.name.toLowerCase().includes(searchLower) ||
          achievement.santri.nis.toLowerCase().includes(searchLower) ||
          achievement.badge.name.toLowerCase().includes(searchLower) ||
          achievement.badge.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(filteredAchievements);
  } catch (error) {
    console.error('Error fetching santri achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch santri achievements' }, { status: 500 });
  }
}

// POST handler - Create a new santri achievement
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'MUSYRIF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Validate achievement data
    const validationResult = santriAchievementSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Check if santri exists
    const santri = await prisma.santri.findUnique({
      where: { id: data.santriId },
    });

    if (!santri) {
      return NextResponse.json({ error: 'Santri not found' }, { status: 404 });
    }

    // Check if badge exists
    const badge = await prisma.achievementBadge.findUnique({
      where: { id: data.badgeId },
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Check if santri already has this badge
    const existingAchievement = await prisma.santriAchievement.findFirst({
      where: {
        santriId: data.santriId,
        badgeId: data.badgeId,
      },
    });

    if (existingAchievement) {
      return NextResponse.json(
        { error: 'Santri already has this badge' },
        { status: 400 }
      );
    }

    // Create achievement in database
    const achievement = await prisma.santriAchievement.create({
      data: {
        santriId: data.santriId,
        badgeId: data.badgeId,
        achievedAt: data.achievedAt,
        progress: data.progress,
        isUnlocked: data.isUnlocked,
        notificationSent: data.notificationSent,
        certificateGenerated: data.certificateGenerated,
        certificateUrl: data.certificateUrl,
        sharedAt: data.sharedAt,
        metadata: data.metadata,
      },
      include: {
        santri: {
          select: {
            name: true,
          },
        },
        badge: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      entity: 'SANTRI_ACHIEVEMENT',
      entityId: achievement.id,
      userId: session.user.id,
      newData: JSON.stringify(achievement),
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error('Error creating santri achievement:', error);
    return NextResponse.json({ error: 'Failed to create santri achievement' }, { status: 500 });
  }
}

// GET handler - Get santri achievement summary
export async function HEAD(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all santri with their achievements
    const santriWithAchievements = await prisma.santri.findMany({
      include: {
        halaqah: {
          select: {
            id: true,
            name: true,
          },
        },
        achievements: {
          where: {
            isUnlocked: true,
          },
          include: {
            badge: true,
          },
          orderBy: {
            achievedAt: 'desc',
          },
        },
      },
    });

    // Calculate summary for each santri
    const summary = santriWithAchievements.map(santri => {
      const achievements = santri.achievements || [];
      const totalAchievements = achievements.length;
      const totalPoints = achievements.reduce(
        (sum: number, achievement: any) => sum + (achievement.badge?.points || 0),
        0
      );
      const lastAchievement = achievements[0];

      return {
        santriId: santri.id,
        santriName: santri.name,
        santriNis: santri.nis,
        halaqahName: santri.halaqah?.name || 'Belum ditentukan',
        totalAchievements,
        totalPoints,
        lastAchievement: lastAchievement?.badge?.name,
        lastAchievementDate: lastAchievement?.achievedAt,
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching santri achievement summary:', error);
    return NextResponse.json({ error: 'Failed to fetch santri achievement summary' }, { status: 500 });
  }
}