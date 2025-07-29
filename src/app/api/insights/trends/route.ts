import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

export async function GET(request: NextRequest) {
  let connection;
  try {
    console.log("🔌 Connecting to database for Trend Analysis...");
    connection = await mysql.createConnection(dbConfig);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "6"; // months
    const type = searchParams.get("type") || "all"; // all, performance, attendance, enrollment

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(period));

    // Generate monthly data points
    const monthlyData = [];
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthLabel = monthStart.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
      });

      // Performance Trends (Hafalan Grades)
      const [performanceResult] = await connection.execute(
        `SELECT 
          AVG(grade) as avgGrade,
          COUNT(*) as totalRecords,
          COUNT(DISTINCT santriId) as activeStudents
         FROM hafalan 
         WHERE recordedAt >= ? AND recordedAt <= ? AND grade IS NOT NULL`,
        [monthStart.toISOString(), monthEnd.toISOString()],
      );

      const performanceData = (performanceResult as any)[0];

      // Attendance Trends
      const [attendanceResult] = await connection.execute(
        `SELECT 
          COUNT(*) as totalAttendance,
          SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as presentCount,
          COUNT(DISTINCT santriId) as attendingStudents
         FROM attendance 
         WHERE date >= ? AND date <= ?`,
        [
          monthStart.toISOString().split("T")[0],
          monthEnd.toISOString().split("T")[0],
        ],
      );

      const attendanceData = (attendanceResult as any)[0];
      const attendanceRate =
        attendanceData.totalAttendance > 0
          ? Math.round(
              (attendanceData.presentCount / attendanceData.totalAttendance) *
                100,
            )
          : 0;

      // Enrollment Trends
      const [enrollmentResult] = await connection.execute(
        `SELECT COUNT(*) as newEnrollments
         FROM santri 
         WHERE enrollmentDate >= ? AND enrollmentDate <= ?`,
        [
          monthStart.toISOString().split("T")[0],
          monthEnd.toISOString().split("T")[0],
        ],
      );

      const enrollmentData = (enrollmentResult as any)[0];

      // Behavior Trends (if behavior_records table exists)
      let behaviorScore = null;
      try {
        const [behaviorResult] = await connection.execute(
          `SELECT AVG(points) as avgPoints
           FROM behavior_records 
           WHERE recordedAt >= ? AND recordedAt <= ?`,
          [monthStart.toISOString(), monthEnd.toISOString()],
        );
        behaviorScore = Math.round((behaviorResult as any)[0].avgPoints || 0);
      } catch (error) {
        console.log(
          "Behavior records table not found, skipping behavior trends",
        );
      }

      monthlyData.push({
        month: monthLabel,
        date: monthStart.toISOString().split("T")[0],
        performance: {
          avgGrade: Math.round((performanceData.avgGrade || 0) * 10) / 10,
          totalRecords: performanceData.totalRecords || 0,
          activeStudents: performanceData.activeStudents || 0,
        },
        attendance: {
          rate: attendanceRate,
          totalRecords: attendanceData.totalAttendance || 0,
          attendingStudents: attendanceData.attendingStudents || 0,
        },
        enrollment: {
          newStudents: enrollmentData.newEnrollments || 0,
        },
        behavior: {
          avgScore: behaviorScore,
        },
      });
    }

    // Calculate trends and insights
    const trends = calculateTrends(monthlyData);
    const insights = generateTrendInsights(monthlyData, trends);
    const predictions = generatePredictions(monthlyData);

    console.log("✅ Trend Analysis generated successfully");
    console.log(
      `📊 Period: ${period} months, Data points: ${monthlyData.length}`,
    );
    console.log(`📈 Trends: ${Object.keys(trends).length} metrics analyzed`);

    return NextResponse.json({
      success: true,
      data: {
        period: parseInt(period),
        monthlyData,
        trends,
        insights,
        predictions,
        summary: {
          totalDataPoints: monthlyData.length,
          avgPerformance:
            monthlyData.reduce((sum, m) => sum + m.performance.avgGrade, 0) /
            monthlyData.length,
          avgAttendance:
            monthlyData.reduce((sum, m) => sum + m.attendance.rate, 0) /
            monthlyData.length,
          totalNewEnrollments: monthlyData.reduce(
            (sum, m) => sum + m.enrollment.newStudents,
            0,
          ),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error generating trend analysis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate trend analysis" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Helper function to calculate trends
function calculateTrends(monthlyData: any[]) {
  if (monthlyData.length < 2) return {};

  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return { direction: "stable", percentage: 0 };

    const recent =
      values.slice(-3).reduce((sum, val) => sum + val, 0) /
      Math.min(3, values.length);
    const older =
      values.slice(0, -3).reduce((sum, val) => sum + val, 0) /
      Math.max(1, values.length - 3);

    if (older === 0) return { direction: "stable", percentage: 0 };

    const percentage = Math.round(((recent - older) / older) * 100);
    const direction =
      percentage > 5 ? "increasing" : percentage < -5 ? "decreasing" : "stable";

    return { direction, percentage: Math.abs(percentage) };
  };

  return {
    performance: calculateTrend(monthlyData.map((m) => m.performance.avgGrade)),
    attendance: calculateTrend(monthlyData.map((m) => m.attendance.rate)),
    enrollment: calculateTrend(
      monthlyData.map((m) => m.enrollment.newStudents),
    ),
    behavior: calculateTrend(monthlyData.map((m) => m.behavior.avgScore || 0)),
  };
}

// Helper function to generate insights
function generateTrendInsights(monthlyData: any[], trends: any) {
  const insights = [];

  // Performance insights
  if (trends.performance?.direction === "increasing") {
    insights.push({
      type: "positive",
      category: "performance",
      title: "Peningkatan Performa Hafalan",
      description: `Rata-rata nilai hafalan meningkat ${trends.performance.percentage}% dalam periode ini`,
      recommendation: "Pertahankan metode pembelajaran yang efektif",
    });
  } else if (trends.performance?.direction === "decreasing") {
    insights.push({
      type: "warning",
      category: "performance",
      title: "Penurunan Performa Hafalan",
      description: `Rata-rata nilai hafalan menurun ${trends.performance.percentage}% dalam periode ini`,
      recommendation:
        "Evaluasi metode pembelajaran dan berikan bimbingan tambahan",
    });
  }

  // Attendance insights
  if (trends.attendance?.direction === "decreasing") {
    insights.push({
      type: "warning",
      category: "attendance",
      title: "Penurunan Tingkat Kehadiran",
      description: `Tingkat kehadiran menurun ${trends.attendance.percentage}% dalam periode ini`,
      recommendation: "Lakukan follow-up dengan santri dan orang tua",
    });
  }

  // Enrollment insights
  if (trends.enrollment?.direction === "increasing") {
    insights.push({
      type: "positive",
      category: "enrollment",
      title: "Peningkatan Pendaftaran",
      description: `Pendaftaran santri baru meningkat ${trends.enrollment.percentage}% dalam periode ini`,
      recommendation: "Siapkan kapasitas dan sumber daya tambahan",
    });
  }

  return insights;
}

// Helper function to generate predictions
function generatePredictions(monthlyData: any[]) {
  if (monthlyData.length < 3) return {};

  const linearRegression = (values: number[]) => {
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  const performanceValues = monthlyData.map((m) => m.performance.avgGrade);
  const attendanceValues = monthlyData.map((m) => m.attendance.rate);

  const performanceTrend = linearRegression(performanceValues);
  const attendanceTrend = linearRegression(attendanceValues);

  const nextMonthIndex = monthlyData.length;

  return {
    nextMonth: {
      performance: Math.max(
        0,
        Math.min(
          100,
          performanceTrend.slope * nextMonthIndex + performanceTrend.intercept,
        ),
      ),
      attendance: Math.max(
        0,
        Math.min(
          100,
          attendanceTrend.slope * nextMonthIndex + attendanceTrend.intercept,
        ),
      ),
    },
    confidence:
      monthlyData.length >= 6
        ? "high"
        : monthlyData.length >= 3
          ? "medium"
          : "low",
  };
}
