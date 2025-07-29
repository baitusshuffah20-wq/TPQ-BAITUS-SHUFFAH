import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { AchievementEngine } from "@/lib/achievement-engine";

// Schema for checking achievements
const checkAchievementSchema = z.object({
  santriId: z.string().min(1, "ID santri wajib diisi"),
  trigger: z.enum(["hafalan", "attendance", "assessment", "manual"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = checkAchievementSchema.parse(body);

    // Check and award achievements
    const newAchievements = await AchievementEngine.checkAndAwardAchievements(
      validatedData.santriId,
    );

    return NextResponse.json({
      success: true,
      message: `Berhasil memeriksa achievement untuk santri`,
      newAchievements: newAchievements.map((achievement) => ({
        id: achievement.id,
        badgeName: achievement.badge.name,
        points: achievement.badge.points,
        awardedAt: achievement.awardedAt,
      })),
      count: newAchievements.length,
    });
  } catch (error) {
    console.error("Error checking achievements:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Gagal memeriksa achievement" },
      { status: 500 },
    );
  }
}

// GET endpoint to check all santri achievements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get("santriId");

    if (santriId) {
      // Check specific santri
      const newAchievements =
        await AchievementEngine.checkAndAwardAchievements(santriId);

      return NextResponse.json({
        success: true,
        santriId,
        newAchievements: newAchievements.map((achievement) => ({
          id: achievement.id,
          badgeName: achievement.badge.name,
          points: achievement.badge.points,
          awardedAt: achievement.awardedAt,
        })),
        count: newAchievements.length,
      });
    } else {
      // Check all santri (batch process)
      const { prisma } = await import("@/lib/prisma");
      const allSantri = await prisma.santri.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, name: true },
      });

      const results = [];
      for (const santri of allSantri) {
        const newAchievements =
          await AchievementEngine.checkAndAwardAchievements(santri.id);
        if (newAchievements.length > 0) {
          results.push({
            santriId: santri.id,
            santriName: santri.name,
            newAchievements: newAchievements.map((achievement) => ({
              id: achievement.id,
              badgeName: achievement.badge.name,
              points: achievement.badge.points,
              awardedAt: achievement.awardedAt,
            })),
            count: newAchievements.length,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil memeriksa achievement untuk ${allSantri.length} santri`,
        results,
        totalNewAchievements: results.reduce((sum, r) => sum + r.count, 0),
      });
    }
  } catch (error) {
    console.error("Error in batch achievement check:", error);
    return NextResponse.json(
      { error: "Gagal memeriksa achievement" },
      { status: 500 },
    );
  }
}
