import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin123",
  database: process.env.DB_NAME || "db_tpq",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

// GET /api/behavior-criteria/[id] - Get single behavior criteria
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let connection;
  try {
    console.log("🔄 API behavior-criteria/[id] GET called");
    connection = await mysql.createConnection(dbConfig);

    const id = params.id;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kriteria perilaku diperlukan",
        },
        { status: 400 },
      );
    }

    // Get criteria by ID
    const [rows] = await connection.execute(
      `SELECT 
        id, name, name_arabic, description, category, type, severity, points,
        is_active, age_group, examples, consequences, rewards, islamic_reference,
        created_at, updated_at
       FROM behavior_criteria 
       WHERE id = ?`,
      [id],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "Kriteria perilaku tidak ditemukan" },
        { status: 404 },
      );
    }

    const criteria = (rows as any[])[0];

    // Parse JSON fields
    const parsedCriteria = {
      ...criteria,
      examples: criteria.examples ? JSON.parse(criteria.examples) : [],
      consequences: criteria.consequences
        ? JSON.parse(criteria.consequences)
        : [],
      rewards: criteria.rewards ? JSON.parse(criteria.rewards) : [],
      islamicReference: criteria.islamic_reference
        ? JSON.parse(criteria.islamic_reference)
        : null,
      isActive: Boolean(criteria.is_active),
    };

    // Get usage statistics
    const [usageRows] = await connection.execute(
      `SELECT 
        COUNT(*) as totalUsage,
        COUNT(CASE WHEN date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as recentUsage
       FROM behavior_records 
       WHERE criteria_id = ?`,
      [id],
    );

    const usage = (usageRows as any[])[0];

    console.log(`✅ Found behavior criteria: ${criteria.name}`);

    return NextResponse.json({
      success: true,
      data: {
        ...parsedCriteria,
        usage: {
          total: usage.totalUsage,
          recent: usage.recentUsage,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching behavior criteria:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kriteria perilaku",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
