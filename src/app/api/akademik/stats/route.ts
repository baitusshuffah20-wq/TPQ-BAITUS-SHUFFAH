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
    console.log("🔌 Connecting to database for Academic Stats...");
    connection = await mysql.createConnection(dbConfig);

    // Get total halaqah count
    const [halaqahResult] = await connection.execute(
      "SELECT COUNT(*) as count FROM halaqah WHERE status = 'ACTIVE'",
    );
    const totalHalaqah = (halaqahResult as any)[0].count;

    // Get total santri count
    const [santriResult] = await connection.execute(
      "SELECT COUNT(*) as count FROM santri WHERE status = 'ACTIVE'",
    );
    const totalSantri = (santriResult as any)[0].count;

    // Get total musyrif count (users with role MUSYRIF)
    const [musyrifResult] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'MUSYRIF' AND status = 'ACTIVE'",
    );
    const totalMusyrif = (musyrifResult as any)[0].count;

    // Get total achievements/prestasi count
    let totalPrestasi = 0;
    try {
      const [prestasiResult] = await connection.execute(
        "SELECT COUNT(*) as count FROM achievements WHERE status = 'ACTIVE'",
      );
      totalPrestasi = (prestasiResult as any)[0].count;
    } catch (error) {
      console.log("Achievements table not found, using default value");
    }

    // Get hafalan progress statistics
    let hafalanStats = {
      totalRecords: 0,
      averageGrade: 0,
      completedSurah: 0,
      inProgress: 0,
    };

    try {
      const [hafalanResult] = await connection.execute(
        `SELECT 
          COUNT(*) as totalRecords,
          AVG(grade) as averageGrade,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedSurah,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress
         FROM hafalan`,
      );

      const hafalanData = (hafalanResult as any)[0];
      hafalanStats = {
        totalRecords: hafalanData.totalRecords || 0,
        averageGrade: Math.round((hafalanData.averageGrade || 0) * 10) / 10,
        completedSurah: hafalanData.completedSurah || 0,
        inProgress: hafalanData.inProgress || 0,
      };
    } catch (error) {
      console.log("Hafalan table not found, using default values");
    }

    // Get attendance statistics
    let attendanceStats = {
      totalRecords: 0,
      presentRate: 0,
      absentRate: 0,
    };

    try {
      const [attendanceResult] = await connection.execute(
        `SELECT 
          COUNT(*) as totalRecords,
          SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as presentCount,
          SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absentCount
         FROM attendance 
         WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      );

      const attendanceData = (attendanceResult as any)[0];
      const presentRate =
        attendanceData.totalRecords > 0
          ? Math.round(
              (attendanceData.presentCount / attendanceData.totalRecords) * 100,
            )
          : 0;
      const absentRate = 100 - presentRate;

      attendanceStats = {
        totalRecords: attendanceData.totalRecords || 0,
        presentRate,
        absentRate,
      };
    } catch (error) {
      console.log("Attendance table not found, using default values");
    }

    // Get recent activities
    const recentActivities = [];

    // Recent hafalan activities
    try {
      const [recentHafalanResult] = await connection.execute(
        `SELECT 
          h.id,
          h.surah,
          h.ayahStart,
          h.ayahEnd,
          h.grade,
          h.recordedAt,
          s.name as santriName
         FROM hafalan h
         JOIN santri s ON h.santriId = s.id
         ORDER BY h.recordedAt DESC
         LIMIT 5`,
      );

      (recentHafalanResult as any[]).forEach((activity) => {
        recentActivities.push({
          id: activity.id,
          type: "hafalan",
          title: `Hafalan ${activity.surah}`,
          description: `${activity.santriName} - Ayat ${activity.ayahStart}-${activity.ayahEnd} (Grade: ${activity.grade})`,
          timestamp: activity.recordedAt,
          icon: "book-open",
          color: "blue",
        });
      });
    } catch (error) {
      console.log("Could not fetch recent hafalan activities");
    }

    // Recent achievements
    try {
      const [recentAchievementsResult] = await connection.execute(
        `SELECT 
          a.id,
          a.title,
          a.category,
          a.achieved_at,
          s.name as santriName
         FROM achievements a
         JOIN santri s ON a.santri_id = s.id
         WHERE a.status = 'ACTIVE'
         ORDER BY a.achieved_at DESC
         LIMIT 3`,
      );

      (recentAchievementsResult as any[]).forEach((achievement) => {
        recentActivities.push({
          id: achievement.id,
          type: "achievement",
          title: achievement.title,
          description: `${achievement.santriName} - ${achievement.category}`,
          timestamp: achievement.achieved_at,
          icon: "award",
          color: "gold",
        });
      });
    } catch (error) {
      console.log("Could not fetch recent achievements");
    }

    // Sort activities by timestamp
    recentActivities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Get halaqah performance summary
    const halaqahPerformance = [];
    try {
      const [halaqahPerfResult] = await connection.execute(
        `SELECT 
          h.id,
          h.name,
          h.capacity,
          COUNT(s.id) as currentStudents,
          u.name as musyrifName,
          AVG(hf.grade) as averageGrade
         FROM halaqah h
         LEFT JOIN santri s ON h.id = s.halaqahId AND s.status = 'ACTIVE'
         LEFT JOIN users u ON h.id = u.halaqahId AND u.role = 'MUSYRIF'
         LEFT JOIN hafalan hf ON s.id = hf.santriId
         WHERE h.status = 'ACTIVE'
         GROUP BY h.id, h.name, h.capacity, u.name
         ORDER BY h.name ASC`,
      );

      (halaqahPerfResult as any[]).forEach((halaqah) => {
        halaqahPerformance.push({
          id: halaqah.id,
          name: halaqah.name,
          capacity: halaqah.capacity || 0,
          currentStudents: halaqah.currentStudents || 0,
          musyrifName: halaqah.musyrifName || "Belum ditentukan",
          averageGrade: Math.round((halaqah.averageGrade || 0) * 10) / 10,
          occupancyRate:
            halaqah.capacity > 0
              ? Math.round((halaqah.currentStudents / halaqah.capacity) * 100)
              : 0,
        });
      });
    } catch (error) {
      console.log("Could not fetch halaqah performance data");
    }

    console.log("✅ Academic stats generated successfully");
    console.log(
      `📊 Halaqah: ${totalHalaqah}, Santri: ${totalSantri}, Musyrif: ${totalMusyrif}`,
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalHalaqah,
          totalSantri,
          totalMusyrif,
          totalPrestasi,
        },
        hafalan: hafalanStats,
        attendance: attendanceStats,
        recentActivities: recentActivities.slice(0, 10),
        halaqahPerformance,
        summary: {
          activePrograms: totalHalaqah,
          totalParticipants: totalSantri,
          instructors: totalMusyrif,
          achievements: totalPrestasi,
          averagePerformance: hafalanStats.averageGrade,
          attendanceRate: attendanceStats.presentRate,
        },
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error generating academic stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate academic statistics" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}
