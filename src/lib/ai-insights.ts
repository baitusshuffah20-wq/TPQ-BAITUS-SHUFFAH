import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

interface StudentInsight {
  studentId: string;
  studentName: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  trends: {
    hafalan: "IMPROVING" | "STABLE" | "DECLINING";
    attendance: "IMPROVING" | "STABLE" | "DECLINING";
    performance: "IMPROVING" | "STABLE" | "DECLINING";
  };
}

interface ClassInsight {
  halaqahId: string;
  halaqahName: string;
  averagePerformance: number;
  attendanceRate: number;
  completionRate: number;
  topPerformers: string[];
  needsAttention: string[];
  recommendations: string[];
}

interface SystemInsight {
  totalStudents: number;
  activeStudents: number;
  averageAttendance: number;
  averagePerformance: number;
  monthlyTrends: {
    month: string;
    attendance: number;
    performance: number;
    newEnrollments: number;
  }[];
  alerts: {
    type: "ATTENDANCE" | "PERFORMANCE" | "PAYMENT" | "CAPACITY";
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    count: number;
  }[];
}

class AIInsights {
  /**
   * Generate comprehensive student insights
   */
  async generateStudentInsights(
    studentId: string,
  ): Promise<StudentInsight | null> {
    try {
      const student = await prisma.santri.findUnique({
        where: { id: studentId },
        include: {
          hafalan: {
            orderBy: { recordedAt: "desc" },
            take: 10,
          },
          attendance: {
            orderBy: { date: "desc" },
            take: 30,
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!student) return null;

      // Calculate performance metrics
      const hafalanGrades = student.hafalan
        .filter((h) => h.grade !== null)
        .map((h) => h.grade!);

      const averageGrade =
        hafalanGrades.length > 0
          ? Math.round(
              hafalanGrades.reduce((sum, grade) => sum + grade, 0) /
                hafalanGrades.length,
            )
          : 0;

      // Calculate attendance rate
      const totalAttendance = student.attendance.length;
      const presentCount = student.attendance.filter(
        (a) => a.status === "PRESENT",
      ).length;
      const attendanceRate =
        totalAttendance > 0
          ? Math.round((presentCount / totalAttendance) * 100)
          : 0;

      // Analyze trends
      const recentHafalan = student.hafalan.slice(0, 5);
      const olderHafalan = student.hafalan.slice(5, 10);

      const recentAvg =
        recentHafalan.length > 0
          ? recentHafalan.reduce((sum, h) => sum + (h.grade || 0), 0) /
            recentHafalan.length
          : 0;
      const olderAvg =
        olderHafalan.length > 0
          ? olderHafalan.reduce((sum, h) => sum + (h.grade || 0), 0) /
            olderHafalan.length
          : 0;

      const hafalanTrend =
        recentAvg > olderAvg + 5
          ? "IMPROVING"
          : recentAvg < olderAvg - 5
            ? "DECLINING"
            : "STABLE";

      // Recent vs older attendance
      const recentAttendance = student.attendance.slice(0, 10);
      const olderAttendance = student.attendance.slice(10, 20);

      const recentAttendanceRate =
        recentAttendance.length > 0
          ? (recentAttendance.filter((a) => a.status === "PRESENT").length /
              recentAttendance.length) *
            100
          : 0;
      const olderAttendanceRate =
        olderAttendance.length > 0
          ? (olderAttendance.filter((a) => a.status === "PRESENT").length /
              olderAttendance.length) *
            100
          : 0;

      const attendanceTrend =
        recentAttendanceRate > olderAttendanceRate + 10
          ? "IMPROVING"
          : recentAttendanceRate < olderAttendanceRate - 10
            ? "DECLINING"
            : "STABLE";

      // Overall performance trend
      const performanceTrend =
        hafalanTrend === "IMPROVING" && attendanceTrend === "IMPROVING"
          ? "IMPROVING"
          : hafalanTrend === "DECLINING" || attendanceTrend === "DECLINING"
            ? "DECLINING"
            : "STABLE";

      // Calculate overall score
      const overallScore = Math.round(
        averageGrade * 0.6 + attendanceRate * 0.4,
      );

      // Determine risk level
      const riskLevel =
        overallScore >= 80 ? "LOW" : overallScore >= 60 ? "MEDIUM" : "HIGH";

      // Generate strengths and weaknesses
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const recommendations: string[] = [];

      if (averageGrade >= 85) {
        strengths.push("Prestasi hafalan sangat baik");
      } else if (averageGrade < 70) {
        weaknesses.push("Perlu peningkatan kualitas hafalan");
        recommendations.push("Tingkatkan latihan muraja'ah harian");
      }

      if (attendanceRate >= 90) {
        strengths.push("Kehadiran sangat konsisten");
      } else if (attendanceRate < 80) {
        weaknesses.push("Kehadiran perlu diperbaiki");
        recommendations.push(
          "Komunikasi dengan wali untuk meningkatkan kehadiran",
        );
      }

      if (hafalanTrend === "IMPROVING") {
        strengths.push("Menunjukkan peningkatan yang konsisten");
      } else if (hafalanTrend === "DECLINING") {
        weaknesses.push("Performa menurun dalam beberapa waktu terakhir");
        recommendations.push("Evaluasi metode pembelajaran dan motivasi");
      }

      // Payment analysis
      const overduePayments = student.payments.filter(
        (p) => p.status === "PENDING" && new Date(p.dueDate) < new Date(),
      );

      if (overduePayments.length > 0) {
        weaknesses.push("Terdapat tunggakan pembayaran");
        recommendations.push("Follow up pembayaran dengan wali santri");
      }

      return {
        studentId: student.id,
        studentName: student.name,
        overallScore,
        strengths,
        weaknesses,
        recommendations,
        riskLevel,
        trends: {
          hafalan: hafalanTrend,
          attendance: attendanceTrend,
          performance: performanceTrend,
        },
      };
    } catch (error) {
      console.error("Error generating student insights:", error);
      return null;
    }
  }

  /**
   * Generate class/halaqah insights
   */
  async generateClassInsights(halaqahId: string): Promise<ClassInsight | null> {
    try {
      const halaqah = await prisma.halaqah.findUnique({
        where: { id: halaqahId },
        include: {
          santri: {
            include: {
              hafalan: {
                where: {
                  recordedAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                  },
                },
              },
              attendance: {
                where: {
                  date: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                  },
                },
              },
            },
          },
        },
      });

      if (!halaqah) return null;

      // Calculate class metrics
      const students = halaqah.santri;
      const totalStudents = students.length;

      if (totalStudents === 0) {
        return {
          halaqahId: halaqah.id,
          halaqahName: halaqah.name,
          averagePerformance: 0,
          attendanceRate: 0,
          completionRate: 0,
          topPerformers: [],
          needsAttention: [],
          recommendations: ["Belum ada santri di halaqah ini"],
        };
      }

      // Calculate average performance
      const allGrades = students.flatMap((s) =>
        s.hafalan.filter((h) => h.grade !== null).map((h) => h.grade!),
      );
      const averagePerformance =
        allGrades.length > 0
          ? Math.round(
              allGrades.reduce((sum, grade) => sum + grade, 0) /
                allGrades.length,
            )
          : 0;

      // Calculate attendance rate
      const allAttendance = students.flatMap((s) => s.attendance);
      const totalAttendanceRecords = allAttendance.length;
      const presentRecords = allAttendance.filter(
        (a) => a.status === "PRESENT",
      ).length;
      const attendanceRate =
        totalAttendanceRecords > 0
          ? Math.round((presentRecords / totalAttendanceRecords) * 100)
          : 0;

      // Calculate completion rate (students with recent hafalan)
      const studentsWithRecentHafalan = students.filter(
        (s) => s.hafalan.length > 0,
      ).length;
      const completionRate = Math.round(
        (studentsWithRecentHafalan / totalStudents) * 100,
      );

      // Identify top performers and students needing attention
      const studentPerformances = students.map((student) => {
        const grades = student.hafalan
          .filter((h) => h.grade !== null)
          .map((h) => h.grade!);
        const avgGrade =
          grades.length > 0
            ? grades.reduce((sum, g) => sum + g, 0) / grades.length
            : 0;

        const attendanceRecords = student.attendance;
        const attendanceRate =
          attendanceRecords.length > 0
            ? (attendanceRecords.filter((a) => a.status === "PRESENT").length /
                attendanceRecords.length) *
              100
            : 0;

        return {
          name: student.name,
          score: Math.round(avgGrade * 0.7 + attendanceRate * 0.3),
        };
      });

      const topPerformers = studentPerformances
        .filter((p) => p.score >= 80)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((p) => p.name);

      const needsAttention = studentPerformances
        .filter((p) => p.score < 60)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((p) => p.name);

      // Generate recommendations
      const recommendations: string[] = [];

      if (averagePerformance < 70) {
        recommendations.push("Tingkatkan metode pembelajaran dan evaluasi");
      }
      if (attendanceRate < 80) {
        recommendations.push("Fokus pada peningkatan kehadiran santri");
      }
      if (completionRate < 70) {
        recommendations.push(
          "Motivasi santri untuk lebih aktif dalam setoran hafalan",
        );
      }
      if (totalStudents < halaqah.capacity * 0.5) {
        recommendations.push("Pertimbangkan rekrutmen santri baru");
      }
      if (needsAttention.length > totalStudents * 0.3) {
        recommendations.push(
          "Berikan perhatian khusus pada santri yang tertinggal",
        );
      }

      return {
        halaqahId: halaqah.id,
        halaqahName: halaqah.name,
        averagePerformance,
        attendanceRate,
        completionRate,
        topPerformers,
        needsAttention,
        recommendations,
      };
    } catch (error) {
      console.error("Error generating class insights:", error);
      return null;
    }
  }

  /**
   * Generate system-wide insights using direct MySQL queries
   */
  async generateSystemInsights(): Promise<SystemInsight> {
    let connection;
    try {
      console.log("🔌 Connecting to database for AI Insights...");
      connection = await mysql.createConnection(dbConfig);

      // Get basic student counts
      const [totalStudentsResult] = await connection.execute(
        "SELECT COUNT(*) as count FROM santri",
      );
      const totalStudents = (totalStudentsResult as any)[0].count;

      const [activeStudentsResult] = await connection.execute(
        "SELECT COUNT(*) as count FROM santri WHERE status = 'ACTIVE'",
      );
      const activeStudents = (activeStudentsResult as any)[0].count;

      // Calculate average attendance for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [attendanceResult] = await connection.execute(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present
         FROM attendance
         WHERE date >= ?`,
        [thirtyDaysAgo.toISOString().split("T")[0]],
      );

      const attendanceData = (attendanceResult as any)[0];
      const averageAttendance =
        attendanceData.total > 0
          ? Math.round((attendanceData.present / attendanceData.total) * 100)
          : 0;

      // Calculate average performance from hafalan grades
      const [performanceResult] = await connection.execute(
        `SELECT AVG(grade) as avgGrade
         FROM hafalan
         WHERE recordedAt >= ? AND grade IS NOT NULL`,
        [thirtyDaysAgo.toISOString()],
      );

      const averagePerformance = Math.round(
        (performanceResult as any)[0].avgGrade || 0,
      );

      // Generate monthly trends for last 6 months
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        // New students this month
        const [newStudentsResult] = await connection.execute(
          "SELECT COUNT(*) as count FROM santri WHERE enrollmentDate >= ? AND enrollmentDate <= ?",
          [
            monthStart.toISOString().split("T")[0],
            monthEnd.toISOString().split("T")[0],
          ],
        );
        const newEnrollments = (newStudentsResult as any)[0].count;

        // Average grade this month
        const [gradeResult] = await connection.execute(
          `SELECT AVG(grade) as avgGrade
           FROM hafalan
           WHERE recordedAt >= ? AND recordedAt <= ? AND grade IS NOT NULL`,
          [monthStart.toISOString(), monthEnd.toISOString()],
        );
        const performance = Math.round((gradeResult as any)[0].avgGrade || 0);

        // Attendance rate this month
        const [monthAttendanceResult] = await connection.execute(
          `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present
           FROM attendance
           WHERE date >= ? AND date <= ?`,
          [
            monthStart.toISOString().split("T")[0],
            monthEnd.toISOString().split("T")[0],
          ],
        );

        const monthAttendanceData = (monthAttendanceResult as any)[0];
        const attendance =
          monthAttendanceData.total > 0
            ? Math.round(
                (monthAttendanceData.present / monthAttendanceData.total) * 100,
              )
            : 0;

        monthlyTrends.push({
          month: monthStart.toLocaleDateString("id-ID", {
            month: "short",
            year: "numeric",
          }),
          attendance,
          performance,
          newEnrollments,
        });
      }

      // Generate alerts
      const alerts = [];

      // Attendance alerts
      if (averageAttendance < 80) {
        alerts.push({
          type: "ATTENDANCE" as const,
          message: `Tingkat kehadiran di bawah target: ${averageAttendance}%`,
          severity:
            averageAttendance < 60 ? ("HIGH" as const) : ("MEDIUM" as const),
          count: Math.round((80 - averageAttendance) / 10),
        });
      }

      // Performance alerts
      if (averagePerformance < 70) {
        alerts.push({
          type: "PERFORMANCE" as const,
          message: `Rata-rata nilai hafalan rendah: ${averagePerformance}`,
          severity:
            averagePerformance < 50 ? ("HIGH" as const) : ("MEDIUM" as const),
          count: Math.round((70 - averagePerformance) / 10),
        });
      }

      // Check if payments table exists and get overdue payments
      try {
        const [overduePaymentsResult] = await connection.execute(
          "SELECT COUNT(*) as count FROM payments WHERE status = 'PENDING' AND dueDate < NOW()",
        );
        const overduePayments = (overduePaymentsResult as any)[0].count;

        if (overduePayments > 0) {
          alerts.push({
            type: "PAYMENT" as const,
            message: `${overduePayments} pembayaran tertunggak`,
            severity:
              overduePayments > 10 ? ("HIGH" as const) : ("MEDIUM" as const),
            count: overduePayments,
          });
        }
      } catch (paymentError) {
        console.log("Payments table not found, skipping payment alerts");
      }

      // Capacity alerts - check halaqah capacity
      const [halaqahCapacityResult] = await connection.execute(
        `SELECT
          h.name,
          h.capacity,
          COUNT(s.id) as currentStudents
         FROM halaqah h
         LEFT JOIN santri s ON h.id = s.halaqahId AND s.status = 'ACTIVE'
         GROUP BY h.id, h.name, h.capacity
         HAVING h.capacity > 0`,
      );

      const halaqahCapacity = halaqahCapacityResult as any[];
      const nearCapacityHalaqah = halaqahCapacity.filter(
        (h) => h.currentStudents / h.capacity > 0.9,
      );

      if (nearCapacityHalaqah.length > 0) {
        alerts.push({
          type: "CAPACITY" as const,
          message: `${nearCapacityHalaqah.length} halaqah mendekati kapasitas maksimal`,
          severity: "MEDIUM" as const,
          count: nearCapacityHalaqah.length,
        });
      }

      console.log("✅ AI Insights generated successfully");
      console.log(
        `📊 Total Students: ${totalStudents}, Active: ${activeStudents}`,
      );
      console.log(
        `📈 Attendance: ${averageAttendance}%, Performance: ${averagePerformance}`,
      );
      console.log(`⚠️ Alerts: ${alerts.length}`);

      return {
        totalStudents,
        activeStudents,
        averageAttendance,
        averagePerformance,
        monthlyTrends,
        alerts,
      };
    } catch (error) {
      console.error("❌ Error generating system insights:", error);
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageAttendance: 0,
        averagePerformance: 0,
        monthlyTrends: [],
        alerts: [],
      };
    } finally {
      if (connection) {
        await connection.end();
        console.log("🔌 Database connection closed");
      }
    }
  }

  /**
   * Generate predictive insights for student performance using MySQL
   */
  async generatePredictiveInsights(studentId: string): Promise<{
    riskOfDropout: number;
    expectedGrade: number;
    recommendedActions: string[];
  } | null> {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);

      // Check if student exists
      const [studentResult] = await connection.execute(
        "SELECT * FROM santri WHERE id = ?",
        [studentId],
      );

      if ((studentResult as any[]).length === 0) return null;

      // Get recent hafalan grades (last 20 records)
      const [hafalanResult] = await connection.execute(
        `SELECT grade FROM hafalan
         WHERE santriId = ? AND grade IS NOT NULL
         ORDER BY recordedAt DESC
         LIMIT 20`,
        [studentId],
      );

      const recentGrades = (hafalanResult as any[]).map((h) => h.grade);

      // Get recent attendance (last 30 records)
      const [attendanceResult] = await connection.execute(
        `SELECT status FROM attendance
         WHERE santriId = ?
         ORDER BY date DESC
         LIMIT 30`,
        [studentId],
      );

      const recentAttendance = attendanceResult as any[];
      const attendanceRate =
        recentAttendance.length > 0
          ? (recentAttendance.filter((a) => a.status === "PRESENT").length /
              recentAttendance.length) *
            100
          : 0;

      // Calculate trend
      const gradesTrend = this.calculateTrend(recentGrades);
      const expectedGrade =
        recentGrades.length > 0
          ? Math.max(0, Math.min(100, recentGrades[0] + gradesTrend * 3))
          : 0;

      // Risk calculation
      let riskScore = 0;

      if (attendanceRate < 70) riskScore += 30;
      else if (attendanceRate < 85) riskScore += 15;

      const avgGrade =
        recentGrades.length > 0
          ? recentGrades.reduce((sum, g) => sum + g, 0) / recentGrades.length
          : 0;

      if (avgGrade < 60) riskScore += 25;
      else if (avgGrade < 75) riskScore += 10;

      if (gradesTrend < -2) riskScore += 20;
      else if (gradesTrend < 0) riskScore += 10;

      const riskOfDropout = Math.min(100, riskScore);

      // Generate recommendations
      const recommendedActions: string[] = [];

      if (riskOfDropout > 50) {
        recommendedActions.push(
          "Segera lakukan konseling dengan santri dan wali",
        );
        recommendedActions.push("Evaluasi metode pembelajaran individual");
      }

      if (attendanceRate < 80) {
        recommendedActions.push(
          "Tingkatkan komunikasi dengan wali terkait kehadiran",
        );
      }

      if (avgGrade < 70) {
        recommendedActions.push("Berikan bimbingan tambahan untuk hafalan");
        recommendedActions.push("Fokus pada perbaikan tajwid dan kelancaran");
      }

      return {
        riskOfDropout,
        expectedGrade: Math.round(expectedGrade),
        recommendedActions,
      };
    } catch (error) {
      console.error("Error generating predictive insights:", error);
      return null;
    }
  }

  /**
   * Calculate trend from array of numbers
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + index * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope || 0;
  }
}

export const aiInsights = new AIInsights();
export default AIInsights;
