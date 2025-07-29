import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Database connection configuration
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

// GET /api/halaqah/comprehensive - Get all halaqah with complete data
export async function GET(request: NextRequest) {
  let connection;
  try {
    console.log("🔌 Connecting to database for Comprehensive Halaqah...");
    connection = await mysql.createConnection(dbConfig);

    // First, check if tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log("📋 Available tables:", tables);

    // Get all halaqah with musyrif and santri count
    const [halaqahResult] = await connection.execute(
      `SELECT
        h.id,
        h.name,
        h.description,
        h.capacity,
        h.schedule,
        h.room,
        h.status,
        h.createdAt,
        h.updatedAt,
        u.id as musyrifId,
        u.name as musyrifName,
        u.email as musyrifEmail,
        u.phone as musyrifPhone,
        COUNT(DISTINCT s.id) as totalSantri,
        COALESCE(AVG(hf.grade), 0) as averageGrade
       FROM halaqah h
       LEFT JOIN users u ON h.id = u.halaqahId AND u.role = 'MUSYRIF' AND u.isActive = 1
       LEFT JOIN santri s ON h.id = s.halaqahId AND s.status = 'ACTIVE'
       LEFT JOIN hafalan hf ON s.id = hf.santriId
       WHERE h.status = 'ACTIVE'
       GROUP BY h.id, h.name, h.description, h.capacity, h.schedule, h.room, h.status, h.createdAt, h.updatedAt, u.id, u.name, u.email, u.phone
       ORDER BY h.name ASC`,
    );

    const halaqahList = [];

    for (const halaqah of halaqahResult as any[]) {
      // Get santri list for this halaqah
      let santriResult = [];
      try {
        const [result] = await connection.execute(
          `SELECT
            s.id,
            s.nis,
            s.name,
            s.gender,
            s.birthDate,
            s.phone,
            s.status,
            s.enrollmentDate,
            COALESCE(AVG(h.grade), 0) as averageGrade,
            COUNT(h.id) as totalHafalan
           FROM santri s
           LEFT JOIN hafalan h ON s.id = h.santriId
           WHERE s.halaqahId = ? AND s.status = 'ACTIVE'
           GROUP BY s.id, s.nis, s.name, s.gender, s.birthDate, s.phone, s.status, s.enrollmentDate
           ORDER BY s.name ASC`,
          [halaqah.id],
        );
        santriResult = result;
      } catch (error) {
        console.warn(
          `⚠️ Could not fetch santri for halaqah ${halaqah.id}:`,
          error,
        );
        santriResult = [];
      }

      // Get recent assessments for this halaqah
      let assessmentResult = [];
      try {
        const [result] = await connection.execute(
          `SELECT
            a.id,
            a.santriId,
            a.type,
            a.category,
            a.score,
            a.notes,
            a.assessedAt,
            s.name as santriName
           FROM assessments a
           JOIN santri s ON a.santriId = s.id
           WHERE s.halaqahId = ?
           ORDER BY a.assessedAt DESC
           LIMIT 10`,
          [halaqah.id],
        );
        assessmentResult = result;
      } catch (error) {
        console.warn(
          `⚠️ Could not fetch assessments for halaqah ${halaqah.id}:`,
          error,
        );
        assessmentResult = [];
      }

      halaqahList.push({
        id: halaqah.id,
        name: halaqah.name,
        description: halaqah.description,
        capacity: halaqah.capacity,
        schedule: halaqah.schedule ? JSON.parse(halaqah.schedule) : null,
        room: halaqah.room,
        status: halaqah.status,
        createdAt: halaqah.createdAt,
        updatedAt: halaqah.updatedAt,
        musyrif: halaqah.musyrifId
          ? {
              id: halaqah.musyrifId,
              name: halaqah.musyrifName,
              email: halaqah.musyrifEmail,
              phone: halaqah.musyrifPhone,
            }
          : null,
        santri: santriResult as any[],
        totalSantri: halaqah.totalSantri || 0,
        averageGrade: Math.round((halaqah.averageGrade || 0) * 10) / 10,
        occupancyRate:
          halaqah.capacity > 0
            ? Math.round((halaqah.totalSantri / halaqah.capacity) * 100)
            : 0,
        recentAssessments: assessmentResult as any[],
      });
    }

    // Get overall statistics
    let statsResult = [
      {
        totalHalaqah: 0,
        totalSantri: 0,
        totalMusyrif: 0,
        overallAverageGrade: 0,
      },
    ];

    try {
      const [result] = await connection.execute(
        `SELECT
          COUNT(DISTINCT h.id) as totalHalaqah,
          COUNT(DISTINCT s.id) as totalSantri,
          COUNT(DISTINCT u.id) as totalMusyrif,
          COALESCE(AVG(hf.grade), 0) as overallAverageGrade
         FROM halaqah h
         LEFT JOIN santri s ON h.id = s.halaqahId AND s.status = 'ACTIVE'
         LEFT JOIN users u ON h.id = u.halaqahId AND u.role = 'MUSYRIF' AND u.isActive = 1
         LEFT JOIN hafalan hf ON s.id = hf.santriId
         WHERE h.status = 'ACTIVE'`,
      );
      statsResult = result;
    } catch (error) {
      console.warn("⚠️ Could not fetch statistics:", error);
    }

    const stats = (statsResult as any)[0];

    console.log(`✅ Found ${halaqahList.length} halaqah with complete data`);

    return NextResponse.json({
      success: true,
      data: {
        halaqah: halaqahList,
        statistics: {
          totalHalaqah: stats.totalHalaqah || 0,
          totalSantri: stats.totalSantri || 0,
          totalMusyrif: stats.totalMusyrif || 0,
          overallAverageGrade:
            Math.round((stats.overallAverageGrade || 0) * 10) / 10,
          averageOccupancy:
            halaqahList.length > 0
              ? Math.round(
                  halaqahList.reduce((sum, h) => sum + h.occupancyRate, 0) /
                    halaqahList.length,
                )
              : 0,
        },
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching comprehensive halaqah data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch halaqah data" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// POST /api/halaqah/comprehensive - Create new halaqah
export async function POST(request: NextRequest) {
  try {
    console.log("🔌 Creating new halaqah...");

    const body = await request.json();
    const {
      name,
      description,
      capacity,
      schedule,
      room,
      musyrifId,
      santriIds,
    } = body;

    // Validate required fields
    if (!name || !capacity) {
      return NextResponse.json(
        { success: false, error: "Name and capacity are required" },
        { status: 400 },
      );
    }

    // Use Prisma transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create halaqah using Prisma
      const halaqah = await tx.halaqah.create({
        data: {
          name,
          description: description || null,
          capacity: parseInt(capacity),
          schedule: schedule ? JSON.stringify(schedule) : null,
          room: room || null,
          status: "ACTIVE",
        },
      });

      console.log(`✅ Halaqah created with ID: ${halaqah.id}`);

      // Assign musyrif if provided
      if (musyrifId) {
        await tx.user.update({
          where: {
            id: musyrifId,
            role: "MUSYRIF",
          },
          data: {
            halaqahId: halaqah.id,
          },
        });
        console.log(
          `✅ Musyrif ${musyrifId} assigned to halaqah ${halaqah.id}`,
        );
      }

      // Assign santri if provided
      if (santriIds && Array.isArray(santriIds) && santriIds.length > 0) {
        await tx.santri.updateMany({
          where: {
            id: {
              in: santriIds,
            },
          },
          data: {
            halaqahId: halaqah.id,
          },
        });
        console.log(
          `✅ ${santriIds.length} santri assigned to halaqah ${halaqah.id}`,
        );
      }

      return {
        id: halaqah.id,
        name: halaqah.name,
        description: halaqah.description,
        capacity: halaqah.capacity,
        schedule: halaqah.schedule,
        room: halaqah.room,
        status: halaqah.status,
        musyrifId,
        santriIds,
      };
    });

    console.log(`✅ Halaqah created successfully with ID: ${result.id}`);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Halaqah berhasil dibuat",
    });
  } catch (error) {
    console.error("❌ Error creating halaqah:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create halaqah" },
      { status: 500 },
    );
  }
}
