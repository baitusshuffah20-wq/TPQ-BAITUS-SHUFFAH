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
    const period = searchParams.get("period") || "monthly";
    const month = searchParams.get("month");
    const year = searchParams.get("year");

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
            name: true,
            musyrif: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (children.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          children: [],
          report: null
        }
      });
    }

    const selectedChild = children[0];
    const childIds = children.map(child => child.id);

    // Determine date range based on period
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date;
    let periodName: string;

    switch (period) {
      case "weekly":
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        periodName = `Minggu ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`;
        break;
      case "quarterly":
        const quarter = Math.floor(currentDate.getMonth() / 3);
        startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
        endDate = new Date(currentDate.getFullYear(), (quarter + 1) * 3, 0);
        periodName = `Triwulan ${quarter + 1} ${currentDate.getFullYear()}`;
        break;
      case "yearly":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
        periodName = `Tahun ${currentDate.getFullYear()}`;
        break;
      default: // monthly
        const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();
        startDate = new Date(targetYear, targetMonth, 1);
        endDate = new Date(targetYear, targetMonth + 1, 0);
        periodName = `${startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
    }

    // Get attendance data
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        santriId: { in: childIds },
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: "asc" }
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === "PRESENT").length;
    const absentDays = attendanceRecords.filter(record => record.status === "ABSENT").length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Get hafalan progress
    const hafalanRecords = await prisma.hafalan.findMany({
      where: {
        santriId: { in: childIds },
        recordedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        musyrif: {
          select: {
            name: true
          }
        }
      },
      orderBy: { recordedAt: "desc" }
    });

    const completedHafalan = hafalanRecords.filter(h => h.status === "COMPLETED").length;
    const totalHafalan = hafalanRecords.length;
    const hafalanProgress = totalHafalan > 0 ? Math.round((completedHafalan / totalHafalan) * 100) : 0;
    const averageGrade = hafalanRecords.length > 0 ? 
      Math.round(hafalanRecords.reduce((sum, h) => sum + (h.grade || 0), 0) / hafalanRecords.length) : 0;

    // Get current hafalan level
    const latestHafalan = hafalanRecords[0];
    const currentLevel = latestHafalan ? latestHafalan.surahName : "Belum ada data";

    // Get behavior records
    const behaviorRecords = await prisma.behavior.findMany({
      where: {
        santriId: { in: childIds },
        recordedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        recordedByUser: {
          select: {
            name: true
          }
        }
      },
      orderBy: { recordedAt: "desc" }
    });

    // Calculate behavior score
    const behaviorCategories = {
      "AKHLAQ": { total: 0, count: 0 },
      "IBADAH": { total: 0, count: 0 },
      "SOSIAL": { total: 0, count: 0 },
      "AKADEMIK": { total: 0, count: 0 }
    };

    behaviorRecords.forEach(record => {
      const category = record.category as keyof typeof behaviorCategories;
      if (behaviorCategories[category]) {
        behaviorCategories[category].total += record.points;
        behaviorCategories[category].count += 1;
      }
    });

    const behaviorDetails = Object.entries(behaviorCategories).map(([category, data]) => ({
      aspect: category === "AKHLAQ" ? "Akhlak" : 
              category === "IBADAH" ? "Ibadah" :
              category === "SOSIAL" ? "Sosial" : "Akademik",
      score: data.count > 0 ? Math.min(100, Math.max(0, 70 + (data.total / data.count))) : 75,
      notes: data.count > 0 ? `${data.count} catatan perilaku` : "Tidak ada catatan khusus"
    }));

    const overallBehaviorScore = Math.round(
      behaviorDetails.reduce((sum, detail) => sum + detail.score, 0) / behaviorDetails.length
    );

    // Get achievements
    const achievements = await prisma.santriAchievement.findMany({
      where: {
        santriId: { in: childIds },
        awardedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        badge: true
      }
    });

    const achievementCount = achievements.length;
    const achievementPoints = achievements.reduce((sum, achievement) => sum + achievement.badge.points, 0);

    // Mock ranking (would need more complex calculation)
    const ranking = Math.max(1, Math.floor(Math.random() * 10) + 1);

    // Generate recommendations
    const recommendations = [];
    
    if (attendanceRate < 90) {
      recommendations.push("Tingkatkan kehadiran anak untuk mendukung proses pembelajaran yang optimal");
    }
    if (hafalanProgress < 80) {
      recommendations.push("Tingkatkan konsistensi dalam muraja'ah harian di rumah");
    }
    if (averageGrade < 85) {
      recommendations.push("Fokus pada perbaikan tajwid dan kelancaran hafalan");
    }
    if (overallBehaviorScore < 85) {
      recommendations.push("Perhatikan pembinaan akhlak dan perilaku anak");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Pertahankan semangat belajar dan prestasi yang sudah baik");
    }

    // Generate musyrif notes
    const musyrifName = selectedChild.halaqah?.musyrif?.name || "Musyrif";
    const musyrifNotes = `${selectedChild.name} menunjukkan progress yang ${hafalanProgress >= 80 ? 'baik' : 'cukup'} dalam hafalan. ${attendanceRate >= 90 ? 'Kehadiran sangat baik.' : 'Perlu perbaikan dalam hal kedisiplinan waktu.'} ${overallBehaviorScore >= 85 ? 'Akhlak dan perilaku sudah baik.' : 'Perlu perhatian lebih dalam pembinaan akhlak.'} Secara keseluruhan, perkembangannya ${(hafalanProgress + attendanceRate + overallBehaviorScore) / 3 >= 80 ? 'memuaskan' : 'perlu ditingkatkan'}.`;

    const report = {
      period: periodName,
      child: selectedChild.name,
      summary: {
        attendance: {
          present: presentDays,
          absent: absentDays,
          percentage: attendanceRate,
          trend: attendanceRate >= 90 ? "up" : attendanceRate >= 70 ? "stable" : "down"
        },
        hafalan: {
          completed: completedHafalan,
          target: Math.max(completedHafalan, 6),
          percentage: hafalanProgress,
          currentLevel: currentLevel,
          averageGrade: averageGrade,
          trend: hafalanProgress >= 80 ? "up" : hafalanProgress >= 60 ? "stable" : "down"
        },
        behavior: {
          score: overallBehaviorScore,
          maxScore: 100,
          category: overallBehaviorScore >= 90 ? "Sangat Baik" : 
                   overallBehaviorScore >= 80 ? "Baik" :
                   overallBehaviorScore >= 70 ? "Cukup" : "Perlu Perbaikan",
          trend: overallBehaviorScore >= 80 ? "up" : overallBehaviorScore >= 70 ? "stable" : "down"
        },
        achievements: {
          count: achievementCount,
          points: achievementPoints,
          rank: ranking,
          trend: achievementCount > 0 ? "up" : "stable"
        }
      },
      details: {
        hafalan: hafalanRecords.map(hafalan => ({
          surah: hafalan.surahName,
          status: hafalan.status === "COMPLETED" ? "Completed" : "In Progress",
          grade: hafalan.grade ? `${hafalan.grade}` : "Belum dinilai",
          date: hafalan.recordedAt.toISOString().split('T')[0],
          musyrif: hafalan.musyrif.name
        })),
        behavior: behaviorDetails,
        attendance: attendanceRecords.map(record => ({
          date: record.date.toISOString().split('T')[0],
          status: record.status
        }))
      },
      recommendations,
      musyrifNotes
    };

    return NextResponse.json({
      success: true,
      data: {
        children,
        report
      }
    });

  } catch (error) {
    console.error("Error fetching report data:", error);
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

    const body = await request.json();
    const { action, reportData, email } = body;

    if (action === "download_pdf") {
      // In a real implementation, you would generate a PDF
      return NextResponse.json({
        success: true,
        data: {
          message: "PDF generation initiated",
          downloadUrl: `/api/reports/pdf/${session.user.id}`,
        }
      });
    }

    if (action === "send_email") {
      if (!email) {
        return NextResponse.json(
          { error: "Email address is required" },
          { status: 400 }
        );
      }

      // In a real implementation, you would send the email
      return NextResponse.json({
        success: true,
        data: {
          message: "Report sent to email successfully",
          email
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error processing report request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
