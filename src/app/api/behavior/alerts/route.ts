import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// GET /api/behavior/alerts - Get behavior alerts based on patterns
export async function GET(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 API behavior alerts called");
    connection = await mysql.createConnection(dbConfig);

    // Generate alerts based on behavior patterns
    const alerts = [];

    // 1. Check for consecutive negative behaviors (3+ days)
    const [consecutiveNegative] = await connection.execute(`
      SELECT 
        b.santri_id,
        s.name as santriName,
        COUNT(*) as negativeCount,
        SUM(b.points) as totalPoints,
        GROUP_CONCAT(b.id) as recordIds
      FROM behavior_records b
      LEFT JOIN santri s ON b.santri_id = s.id
      WHERE b.type = 'NEGATIVE' 
        AND b.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAYS)
      GROUP BY b.santri_id, s.name
      HAVING negativeCount >= 3
    `);

    // Add consecutive negative alerts
    (consecutiveNegative as any[]).forEach((record, index) => {
      alerts.push({
        id: `alert_negative_${record.santri_id}_${Date.now()}_${index}`,
        santriId: record.santri_id,
        santriName: record.santriName,
        alertType: "PATTERN",
        title: "Pola Perilaku Negatif Berulang",
        message: `${record.santriName} menunjukkan ${record.negativeCount} perilaku negatif dalam 7 hari terakhir`,
        severity: record.negativeCount >= 5 ? "CRITICAL" : "HIGH",
        triggerCriteria: {
          type: "CONSECUTIVE_NEGATIVE",
          threshold: 3,
          period: "WEEKLY",
        },
        isRead: false,
        isResolved: false,
        actionRequired: true,
        assignedTo: ["admin_1"],
        createdAt: new Date().toISOString(),
        metadata: {
          behaviorCount: record.negativeCount,
          pointsTotal: record.totalPoints,
          relatedRecords: record.recordIds?.split(",") || [],
        },
      });
    });

    // 2. Check for low points (below -10)
    const [lowPoints] = await connection.execute(`
      SELECT 
        b.santri_id,
        s.name as santriName,
        SUM(b.points) as totalPoints,
        COUNT(*) as recordCount
      FROM behavior_records b
      LEFT JOIN santri s ON b.santri_id = s.id
      WHERE b.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAYS)
      GROUP BY b.santri_id, s.name
      HAVING totalPoints <= -10
    `);

    // Add low points alerts
    (lowPoints as any[]).forEach((record, index) => {
      alerts.push({
        id: `alert_points_${record.santri_id}_${Date.now()}_${index}`,
        santriId: record.santri_id,
        santriName: record.santriName,
        alertType: "SEVERITY",
        title: "Poin Perilaku Rendah",
        message: `${record.santriName} memiliki total poin ${record.totalPoints} dalam 30 hari terakhir`,
        severity: record.totalPoints <= -20 ? "CRITICAL" : "HIGH",
        triggerCriteria: {
          type: "LOW_POINTS",
          threshold: -10,
          period: "MONTHLY",
        },
        isRead: false,
        isResolved: false,
        actionRequired: true,
        assignedTo: ["admin_1"],
        createdAt: new Date().toISOString(),
        metadata: {
          behaviorCount: record.recordCount,
          pointsTotal: record.totalPoints,
        },
      });
    });

    // 3. Check for positive improvements (high positive points)
    const [positiveImprovement] = await connection.execute(`
      SELECT 
        b.santri_id,
        s.name as santriName,
        SUM(b.points) as totalPoints,
        COUNT(*) as recordCount
      FROM behavior_records b
      LEFT JOIN santri s ON b.santri_id = s.id
      WHERE b.type = 'POSITIVE' 
        AND b.date >= DATE_SUB(CURDATE(), INTERVAL 14 DAYS)
      GROUP BY b.santri_id, s.name
      HAVING totalPoints >= 20
    `);

    // Add positive improvement alerts
    (positiveImprovement as any[]).forEach((record, index) => {
      alerts.push({
        id: `alert_improvement_${record.santri_id}_${Date.now()}_${index}`,
        santriId: record.santri_id,
        santriName: record.santriName,
        alertType: "IMPROVEMENT",
        title: "Peningkatan Perilaku Signifikan",
        message: `${record.santriName} menunjukkan peningkatan dengan ${record.totalPoints} poin positif dalam 2 minggu terakhir`,
        severity: "LOW",
        triggerCriteria: {
          type: "POSITIVE_TREND",
          threshold: 20,
          period: "WEEKLY",
        },
        isRead: false,
        isResolved: false,
        actionRequired: false,
        assignedTo: ["admin_1"],
        createdAt: new Date().toISOString(),
        metadata: {
          behaviorCount: record.recordCount,
          pointsTotal: record.totalPoints,
        },
      });
    });

    console.log("✅ Generated alerts:", alerts.length);

    return NextResponse.json({
      success: true,
      data: alerts,
      message: `Generated ${alerts.length} behavior alerts`,
    });
  } catch (error) {
    console.error("❌ Error generating behavior alerts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate behavior alerts",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}
