import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is WALI
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "WALI") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const category = searchParams.get("category");

    // Get wali's children
    const children = await prisma.santri.findMany({
      where: { 
        waliId: session.user.id,
        ...(childId ? { id: childId } : {})
      },
      select: {
        id: true,
        name: true,
        nis: true,
        halaqah: {
          select: {
            name: true
          }
        }
      }
    });

    if (children.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          children: [],
          achievements: [],
          statistics: {
            total: 0,
            totalPoints: 0,
            thisMonth: 0,
            ranking: 0
          }
        }
      });
    }

    const childIds = children.map(child => child.id);

    // Get achievements from SantriAchievement table
    const santriAchievements = await prisma.santriAchievement.findMany({
      where: {
        santriId: { in: childIds }
      },
      include: {
        badge: true,
        santri: {
          select: {
            id: true,
            name: true,
            halaqah: {
              select: {
                musyrif: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { awardedAt: "desc" }
    });

    // Get hafalan achievements
    const hafalanAchievements = await prisma.hafalan.findMany({
      where: {
        santriId: { in: childIds },
        status: "COMPLETED"
      },
      include: {
        santri: {
          select: {
            id: true,
            name: true
          }
        },
        musyrif: {
          select: {
            name: true
          }
        }
      },
      orderBy: { recordedAt: "desc" }
    });

    // Get behavior achievements (positive behaviors)
    const behaviorAchievements = await prisma.behavior.findMany({
      where: {
        santriId: { in: childIds },
        type: "POSITIVE",
        points: { gt: 0 }
      },
      include: {
        santri: {
          select: {
            id: true,
            name: true
          }
        },
        recordedByUser: {
          select: {
            name: true
          }
        }
      },
      orderBy: { recordedAt: "desc" },
      take: 20
    });

    // Combine all achievements
    const allAchievements = [];

    // Add badge achievements
    santriAchievements.forEach(achievement => {
      allAchievements.push({
        id: `badge-${achievement.id}`,
        title: achievement.badge.name,
        description: achievement.badge.description,
        category: achievement.badge.category.toLowerCase(),
        type: "badge",
        date: achievement.awardedAt.toISOString(),
        points: achievement.badge.points,
        badge: achievement.badge.rarity.toLowerCase(),
        musyrif: achievement.santri.halaqah?.musyrif?.name || "System",
        icon: achievement.badge.icon || "Award",
        color: achievement.badge.color || "bg-yellow-500",
        santriId: achievement.santriId,
        santriName: achievement.santri.name
      });
    });

    // Add hafalan achievements
    hafalanAchievements.forEach(hafalan => {
      let badge = "silver";
      let points = 50;
      
      if (hafalan.grade && hafalan.grade >= 90) {
        badge = "gold";
        points = 100;
      } else if (hafalan.grade && hafalan.grade >= 95) {
        badge = "platinum";
        points = 150;
      }

      allAchievements.push({
        id: `hafalan-${hafalan.id}`,
        title: `Hafal ${hafalan.surahName}`,
        description: `Berhasil menghafal ${hafalan.surahName} ayat ${hafalan.ayahStart}-${hafalan.ayahEnd}`,
        category: "hafalan",
        type: "milestone",
        date: hafalan.recordedAt.toISOString(),
        points: points,
        badge: badge,
        musyrif: hafalan.musyrif.name,
        icon: "BookOpen",
        color: "bg-teal-500",
        santriId: hafalan.santriId,
        santriName: hafalan.santri.name,
        grade: hafalan.grade
      });
    });

    // Add behavior achievements
    behaviorAchievements.forEach(behavior => {
      let badge = "bronze";
      let points = behavior.points;
      
      if (behavior.points >= 20) {
        badge = "silver";
      } else if (behavior.points >= 30) {
        badge = "gold";
      }

      allAchievements.push({
        id: `behavior-${behavior.id}`,
        title: behavior.criteriaName,
        description: behavior.description,
        category: behavior.category.toLowerCase(),
        type: "character",
        date: behavior.recordedAt.toISOString(),
        points: points,
        badge: badge,
        musyrif: behavior.recordedByUser.name,
        icon: "Heart",
        color: "bg-green-500",
        santriId: behavior.santriId,
        santriName: behavior.santri.name
      });
    });

    // Filter by category if specified
    let filteredAchievements = allAchievements;
    if (category && category !== "all") {
      filteredAchievements = allAchievements.filter(achievement => 
        achievement.category === category
      );
    }

    // Sort by date (newest first)
    filteredAchievements.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate statistics
    const totalAchievements = allAchievements.length;
    const totalPoints = allAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
    
    // Achievements this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthAchievements = allAchievements.filter(achievement => {
      const achievementDate = new Date(achievement.date);
      return achievementDate.getMonth() === currentMonth && 
             achievementDate.getFullYear() === currentYear;
    }).length;

    // Mock ranking (would need more complex calculation in real scenario)
    const ranking = Math.max(1, Math.floor(Math.random() * 10) + 1);

    // Get latest achievement
    const latestAchievement = filteredAchievements[0] || null;

    // Get categories with counts
    const categories = [
      {
        id: "all",
        name: "Semua",
        count: allAchievements.length
      },
      {
        id: "hafalan",
        name: "Hafalan",
        count: allAchievements.filter(a => a.category === "hafalan").length
      },
      {
        id: "attendance",
        name: "Kehadiran",
        count: allAchievements.filter(a => a.category === "attendance").length
      },
      {
        id: "akhlaq",
        name: "Akhlak",
        count: allAchievements.filter(a => a.category === "akhlaq").length
      },
      {
        id: "ibadah",
        name: "Ibadah",
        count: allAchievements.filter(a => a.category === "ibadah").length
      },
      {
        id: "sosial",
        name: "Sosial",
        count: allAchievements.filter(a => a.category === "sosial").length
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        children,
        achievements: filteredAchievements,
        latestAchievement,
        categories,
        statistics: {
          total: totalAchievements,
          totalPoints,
          thisMonth: thisMonthAchievements,
          ranking
        }
      }
    });

  } catch (error) {
    console.error("Error fetching achievements data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is WALI
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "WALI") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, achievementId } = body;

    if (action === "download_certificate") {
      if (!achievementId) {
        return NextResponse.json(
          { error: "Achievement ID is required" },
          { status: 400 }
        );
      }

      // In a real implementation, you would generate a PDF certificate
      // For now, we'll just return a success message
      return NextResponse.json({
        success: true,
        data: {
          message: "Certificate download initiated",
          downloadUrl: `/api/certificates/${achievementId}`,
          achievementId
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error processing achievement request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
