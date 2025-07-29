import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit-log";

// Schema for awarding achievement
const awardAchievementSchema = z.object({
  santriId: z.string().min(1, "ID santri wajib diisi"),
  badgeId: z.string().min(1, "ID badge wajib diisi"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = awardAchievementSchema.parse(body);

    // Check if santri exists
    const santri = await prisma.santri.findUnique({
      where: { id: validatedData.santriId },
      select: { id: true, name: true, nis: true },
    });

    if (!santri) {
      return NextResponse.json(
        { error: "Santri tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if badge exists
    const badge = await prisma.achievementBadge.findUnique({
      where: { id: validatedData.badgeId },
      select: { id: true, name: true, points: true },
    });

    if (!badge) {
      return NextResponse.json(
        { error: "Badge tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if achievement already exists
    const existingAchievement = await prisma.santriAchievement.findUnique({
      where: {
        santriId_badgeId: {
          santriId: validatedData.santriId,
          badgeId: validatedData.badgeId,
        },
      },
    });

    if (existingAchievement) {
      return NextResponse.json(
        { error: "Santri sudah memiliki achievement ini" },
        { status: 400 },
      );
    }

    // Award the achievement
    const achievement = await prisma.santriAchievement.create({
      data: {
        santriId: validatedData.santriId,
        badgeId: validatedData.badgeId,
      },
      include: {
        santri: {
          select: { name: true, nis: true },
        },
        badge: {
          select: { name: true, points: true },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      action: "CREATE",
      entity: "SANTRI_ACHIEVEMENT",
      entityId: achievement.id,
      userId: session.user.id,
      newData: JSON.stringify({
        santriName: achievement.santri.name,
        badgeName: achievement.badge.name,
        notes: validatedData.notes,
      }),
    });

    return NextResponse.json({
      success: true,
      message: `Achievement "${badge.name}" berhasil diberikan kepada ${santri.name}`,
      achievement: {
        id: achievement.id,
        santriName: achievement.santri.name,
        santriNis: achievement.santri.nis,
        badgeName: achievement.badge.name,
        points: achievement.badge.points,
        awardedAt: achievement.awardedAt,
      },
    });
  } catch (error) {
    console.error("Error awarding achievement:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Gagal memberikan achievement" },
      { status: 500 },
    );
  }
}
