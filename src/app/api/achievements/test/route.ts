import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Test basic achievement functionality
    console.log("🔄 Testing achievement system...");

    // 1. Check if achievement tables exist and have data
    const badgeCount = await prisma.achievementBadge.count();
    const achievementCount = await prisma.santriAchievement.count();

    console.log(`📊 Badges: ${badgeCount}, Achievements: ${achievementCount}`);

    // 2. Get sample data
    const badges = await prisma.achievementBadge.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        criteriaType: true,
        criteriaValue: true,
        isActive: true,
      },
    });

    const achievements = await prisma.santriAchievement.findMany({
      take: 3,
      include: {
        badge: {
          select: { name: true },
        },
        santri: {
          select: { name: true },
        },
      },
    });

    // 3. Test simple achievement logic
    const santriList = await prisma.santri.findMany({
      take: 2,
      select: { id: true, name: true },
    });

    const testResults = [];
    for (const santri of santriList) {
      // Count hafalan for this santri
      const hafalanCount = await prisma.hafalan.count({
        where: { santriId: santri.id },
      });

      // Count attendance for this santri
      const attendanceCount = await prisma.attendance.count({
        where: {
          santriId: santri.id,
          status: "PRESENT",
        },
      });

      testResults.push({
        santriId: santri.id,
        santriName: santri.name,
        hafalanCount,
        attendanceCount,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Achievement system test completed",
      data: {
        badgeCount,
        achievementCount,
        sampleBadges: badges,
        sampleAchievements: achievements,
        santriTestResults: testResults,
      },
    });
  } catch (error) {
    console.error("Error testing achievement system:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Achievement system test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
