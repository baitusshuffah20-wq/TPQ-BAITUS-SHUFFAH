import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

const behaviorCategories = [
  "AKHLAQ",
  "IBADAH",
  "ACADEMIC",
  "SOCIAL",
  "DISCIPLINE",
  "LEADERSHIP",
];

function calculateBehaviorScore(summary: any): number {
  const baseScore = 75; // Base score
  const positiveBonus = summary.positiveCount * 2;
  const negativePenalty = summary.negativeCount * 3;
  return Math.max(
    0,
    Math.min(100, baseScore + positiveBonus - negativePenalty),
  );
}

function getCharacterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}

function getDatesFromPeriod(period: string): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const endDate = new Date(now);
  let startDate: Date;

  switch (period) {
    case "WEEKLY":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case "MONTHLY":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "QUARTERLY":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "YEARLY":
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }

  return { startDate, endDate };
}

function calculateTrend(
  records: any[],
  days: number = 30,
): { improving: boolean; declining: boolean } {
  if (records.length < 2) return { improving: false, declining: false };

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentRecords = records.filter((r) => new Date(r.date) >= cutoffDate);
  if (recentRecords.length < 2) return { improving: false, declining: false };

  // Sort by date
  recentRecords.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const firstHalf = recentRecords.slice(
    0,
    Math.floor(recentRecords.length / 2),
  );
  const secondHalf = recentRecords.slice(Math.floor(recentRecords.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, r) => sum + (r.points || 0), 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, r) => sum + (r.points || 0), 0) / secondHalf.length;

  const improvement = secondAvg - firstAvg;

  return {
    improving: improvement > 1,
    declining: improvement < -1,
  };
}

export async function GET(request: NextRequest) {
  console.log("🔍 Analytics API called");
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "MONTHLY";
    const halaqahId = searchParams.get("halaqahId");
    const category = searchParams.get("category");

    console.log("📊 Parameters:", { period, halaqahId, category });

    const { startDate, endDate } = getDatesFromPeriod(period);
    console.log("📅 Date range:", { startDate, endDate });

    console.log("🔌 Connecting to database...");
    const connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connected");

    // Build WHERE conditions
    const whereConditions = [`br.date BETWEEN ? AND ?`];
    const queryParams: any[] = [
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ];

    if (halaqahId && halaqahId !== "all") {
      whereConditions.push("s.halaqahId = ?");
      queryParams.push(halaqahId);
    }

    if (category && category !== "all") {
      whereConditions.push("br.category = ?");
      queryParams.push(category);
    }

    // Get behavior records with santri and criteria info
    const [behaviorRecords] = (await connection.execute(
      `
      SELECT
        br.*,
        s.name as santri_name,
        s.halaqahId as halaqah_id,
        h.name as halaqah_name,
        bc.name as criteria_name
      FROM behavior_records br
      LEFT JOIN santri s ON br.santri_id = s.id
      LEFT JOIN halaqah h ON s.halaqahId = h.id
      LEFT JOIN behavior_criteria bc ON br.criteria_id = bc.id
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY br.date DESC
    `,
      queryParams,
    )) as any;

    console.log(
      `📊 Found ${(behaviorRecords as any[]).length} behavior records`,
    );

    // If no records found, return empty analytics with proper structure
    if ((behaviorRecords as any[]).length === 0) {
      console.log("📊 No behavior records found, returning empty analytics");

      // Get total active students count
      const [totalStudentsResult] = (await connection.execute(
        "SELECT COUNT(*) as total FROM santri WHERE status = 'ACTIVE'",
      )) as any;
      const totalStudents = totalStudentsResult[0]?.total || 0;

      await connection.end();

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalStudents,
            totalRecords: 0,
            averageScore: 0,
            improvingStudents: 0,
            needsAttention: 0,
            perfectBehavior: 0,
          },
          categoryStats: behaviorCategories.map((cat: string) => ({
            category: cat,
            count: 0,
            positiveCount: 0,
            negativeCount: 0,
            averagePoints: 0,
          })),
          topPerformers: [],
          needsAttention: [],
          halaqahComparison: [],
          behaviorTrends: [],
        },
      });
    }

    // Process behavior records for analytics
    // Get unique santri IDs from behavior records
    const santriIds = [
      ...new Set((behaviorRecords as any[]).map((r) => r.santri_id)),
    ];
    console.log(
      `👥 Found ${santriIds.length} unique santri with behavior records`,
    );

    // --- Overview Statistics ---
    const [totalStudentsResult] = (await connection.execute(
      "SELECT COUNT(*) as total FROM santri WHERE status = 'ACTIVE'",
    )) as any;
    const totalStudents = totalStudentsResult[0]?.total || 0;
    const totalRecords = (behaviorRecords as any[]).length;

    // Calculate student summaries
    const studentSummaries: any[] = [];
    for (const santriId of santriIds) {
      const records = (behaviorRecords as any[]).filter(
        (r) => r.santri_id === santriId,
      );
      if (records.length === 0) continue;

      const totalPoints = records.reduce((sum, r) => sum + (r.points || 0), 0);
      const positiveCount = records.filter((r) => r.type === "POSITIVE").length;
      const negativeCount = records.filter((r) => r.type === "NEGATIVE").length;

      const summary = {
        santriId,
        santriName: records[0]?.santri_name || "Unknown",
        totalRecords: records.length,
        positiveCount,
        negativeCount,
        totalPoints,
        averagePoints: totalPoints / records.length,
      };

      const score = calculateBehaviorScore(summary);
      summary.behaviorScore = score;
      summary.characterGrade = getCharacterGrade(score);

      studentSummaries.push(summary);
    }

    const averageScore =
      studentSummaries.length > 0
        ? studentSummaries.reduce((sum, s) => sum + s.behaviorScore, 0) /
          studentSummaries.length
        : 0;

    const improvingStudents = studentSummaries.filter((s) => {
      const records = (behaviorRecords as any[]).filter(
        (r) => r.santri_id === s.santriId,
      );
      const trend = calculateTrend(
        records.map((r) => ({ date: r.date, points: r.points || 0 })),
        30,
      );
      return trend.improving;
    }).length;

    const needsAttention = studentSummaries.filter(
      (s) => s.behaviorScore < 60,
    ).length;
    const perfectBehavior = studentSummaries.filter(
      (s) => s.behaviorScore >= 95,
    ).length;

    const overview = {
      totalStudents,
      totalRecords,
      averageScore: parseFloat(averageScore.toFixed(1)),
      improvingStudents,
      needsAttention,
      perfectBehavior,
    };

    console.log("📊 Overview calculated:", overview);

    // --- Category Statistics ---
    const categoryStats = behaviorCategories.map((cat: string) => {
      const catRecords = (behaviorRecords as any[]).filter(
        (r) => r.category === cat,
      );
      const positiveCount = catRecords.filter(
        (r) => r.type === "POSITIVE",
      ).length;
      const negativeCount = catRecords.filter(
        (r) => r.type === "NEGATIVE",
      ).length;
      const totalPoints = catRecords.reduce(
        (sum, r) => sum + (r.points || 0),
        0,
      );

      return {
        category: cat,
        count: catRecords.length,
        positiveCount,
        negativeCount,
        averagePoints:
          catRecords.length > 0
            ? parseFloat((totalPoints / catRecords.length).toFixed(1))
            : 0,
      };
    });

    console.log("📊 Category stats calculated");

    // --- Top Performers & Needs Attention ---
    studentSummaries.sort((a, b) => b.behaviorScore - a.behaviorScore);

    const topPerformers = studentSummaries.slice(0, 5).map((s) => {
      const records = (behaviorRecords as any[]).filter(
        (r) => r.santri_id === s.santriId,
      );
      const trend = calculateTrend(
        records.map((r) => ({ date: r.date, points: r.points || 0 })),
        30,
      );
      return {
        ...s,
        trend: trend.improving
          ? "improving"
          : trend.declining
            ? "declining"
            : "stable",
      };
    });

    const needsAttentionList = studentSummaries
      .filter((s) => s.behaviorScore < 60)
      .slice(0, 5)
      .map((s) => {
        const records = (behaviorRecords as any[]).filter(
          (r) => r.santri_id === s.santriId,
        );
        const issues = records
          .filter((r) => r.type === "NEGATIVE")
          .slice(0, 3)
          .map((r) => r.criteria_name || r.description || "Perilaku Negatif");
        const trend = calculateTrend(
          records.map((r) => ({ date: r.date, points: r.points || 0 })),
          30,
        );

        return {
          ...s,
          trend: trend.declining
            ? "declining"
            : trend.improving
              ? "improving"
              : "stable",
          issues: [...new Set(issues)], // Remove duplicates
        };
      });

    console.log("📊 Top performers and needs attention calculated");

    // --- Halaqah Comparison ---
    const [halaqahList] = (await connection.execute(`
      SELECT
        h.id,
        h.name,
        u.name as musyrif_name
      FROM halaqah h
      LEFT JOIN users u ON h.musyrifId = u.id
      WHERE h.status = 'ACTIVE'
    `)) as any;

    const halaqahComparison = [];
    for (const halaqah of halaqahList) {
      const hRecords = (behaviorRecords as any[]).filter(
        (r) => r.halaqah_id === halaqah.id,
      );
      const hSantriIds = [...new Set(hRecords.map((r) => r.santri_id))];

      if (hSantriIds.length === 0) {
        // Include halaqah even if no behavior records, but get student count
        const [studentCountResult] = (await connection.execute(
          "SELECT COUNT(*) as count FROM santri WHERE halaqahId = ? AND status = 'ACTIVE'",
          [halaqah.id],
        )) as any;

        halaqahComparison.push({
          halaqahId: halaqah.id,
          halaqahName: halaqah.name,
          musyrifName: halaqah.musyrif_name || "Belum ada",
          studentCount: studentCountResult[0]?.count || 0,
          averageScore: 0,
          positiveRate: 0,
        });
        continue;
      }

      const hSummaries = studentSummaries.filter((s) =>
        hSantriIds.includes(s.santriId),
      );
      const averageScore =
        hSummaries.length > 0
          ? hSummaries.reduce((sum, s) => sum + s.behaviorScore, 0) /
            hSummaries.length
          : 0;
      const positiveRate =
        hRecords.length > 0
          ? (hRecords.filter((r) => r.type === "POSITIVE").length /
              hRecords.length) *
            100
          : 0;

      halaqahComparison.push({
        halaqahId: halaqah.id,
        halaqahName: halaqah.name,
        musyrifName: halaqah.musyrif_name || "Belum ada",
        studentCount: hSantriIds.length,
        averageScore: parseFloat(averageScore.toFixed(1)),
        positiveRate: parseFloat(positiveRate.toFixed(1)),
      });
    }

    console.log("📊 Halaqah comparison calculated");

    // --- Behavior Trends (for chart) ---
    const trendData: { date: string; score: number }[] = [];
    const dateMap = new Map<string, { totalScore: number; count: number }>();

    // Group records by date and calculate average score per day
    for (const record of behaviorRecords as any[]) {
      const dateStr = new Date(record.date).toISOString().split("T")[0];
      const santriSummary = studentSummaries.find(
        (s) => s.santriId === record.santri_id,
      );

      if (santriSummary) {
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { totalScore: 0, count: 0 });
        }
        const entry = dateMap.get(dateStr)!;
        entry.totalScore += santriSummary.behaviorScore;
        entry.count++;
      }
    }

    // Convert to array and sort by date
    const sortedDates = Array.from(dateMap.keys()).sort();
    for (const dateStr of sortedDates) {
      const entry = dateMap.get(dateStr)!;
      trendData.push({
        date: dateStr,
        score: parseFloat((entry.totalScore / entry.count).toFixed(1)),
      });
    }

    console.log("📊 Behavior trends calculated");

    await connection.end();
    console.log("🔌 Database connection closed");

    const responseData = {
      overview,
      categoryStats,
      topPerformers,
      needsAttention: needsAttentionList,
      halaqahComparison,
      behaviorTrends: trendData,
    };

    console.log("✅ Returning database analytics data");
    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Error fetching behavior analytics data:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch behavior analytics data",
        error: errorMessage,
        debug:
          process.env.NODE_ENV === "development"
            ? {
                stack: error instanceof Error ? error.stack : null,
                details: error,
              }
            : undefined,
      },
      { status: 500 },
    );
  }
}
