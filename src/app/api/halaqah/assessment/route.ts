import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { requireAuth, ApiResponse } from "@/lib/auth-middleware";
import { hasPermission } from "@/lib/permissions";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// GET /api/halaqah/assessment - Get assessments for a halaqah or santri (Admin and Musyrif can view)
export async function GET(request: NextRequest) {
  let connection;
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check permission
    if (!hasPermission(authResult.role, 'hafalan:view')) {
      return ApiResponse.forbidden("Access denied to assessment data");
    }
    console.log("🔌 Connecting to database for Assessment data...");
    connection = await mysql.createConnection(dbConfig);

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get("halaqahId");
    const santriId = searchParams.get("santriId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Check if assessments table exists, if not create it
    const [tables] = await connection.query("SHOW TABLES LIKE 'assessments'");

    if ((tables as any[]).length === 0) {
      console.log("Creating assessments table...");
      await connection.query(`
        CREATE TABLE assessments (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          santriId VARCHAR(36) NOT NULL,
          halaqahId VARCHAR(36) NOT NULL,
          assessorId VARCHAR(36) NOT NULL,
          type ENUM('QURAN', 'TAHSIN', 'AKHLAQ') NOT NULL,
          category VARCHAR(100) NOT NULL,
          surah VARCHAR(100),
          ayahStart INT,
          ayahEnd INT,
          score DECIMAL(5,2) NOT NULL,
          grade ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
          notes TEXT,
          strengths TEXT,
          improvements TEXT,
          assessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_santri_id (santriId),
          INDEX idx_halaqah_id (halaqahId),
          INDEX idx_type (type),
          INDEX idx_assessed_at (assessedAt)
        )
      `);
    }

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    // Role-based filtering
    if (authResult.role === 'MUSYRIF') {
      // Musyrif can only see assessments for santri in their halaqah
      whereClause += " AND h.musyrifId = ?";
      params.push(authResult.id);
      console.log("Musyrif access: filtering assessments for their halaqah");
    }

    if (halaqahId) {
      whereClause += " AND a.halaqahId = ?";
      params.push(halaqahId);
    }

    if (santriId) {
      whereClause += " AND a.santriId = ?";
      params.push(santriId);
    }

    // Get assessments with santri and assessor info
    const [assessmentResult] = await connection.execute(
      `SELECT 
        a.id,
        a.santriId,
        a.halaqahId,
        a.assessorId,
        a.type,
        a.category,
        a.surah,
        a.ayahStart,
        a.ayahEnd,
        a.score,
        a.grade,
        a.notes,
        a.strengths,
        a.improvements,
        a.assessedAt,
        s.name as santriName,
        s.nis as santriNis,
        h.name as halaqahName,
        u.name as assessorName
       FROM assessments a
       JOIN santri s ON a.santriId = s.id
       JOIN halaqah h ON a.halaqahId = h.id
       JOIN users u ON a.assessorId = u.id
       ${whereClause}
       ORDER BY a.assessedAt DESC
       LIMIT ?`,
      [...params, limit],
    );

    // Get assessment statistics
    const [statsResult] = await connection.execute(
      `SELECT
        a.type,
        COUNT(*) as totalAssessments,
        AVG(a.score) as averageScore,
        MIN(a.score) as minScore,
        MAX(a.score) as maxScore,
        COUNT(CASE WHEN a.grade = 'A' THEN 1 END) as gradeA,
        COUNT(CASE WHEN a.grade = 'B' THEN 1 END) as gradeB,
        COUNT(CASE WHEN a.grade = 'C' THEN 1 END) as gradeC,
        COUNT(CASE WHEN a.grade = 'D' THEN 1 END) as gradeD,
        COUNT(CASE WHEN a.grade = 'E' THEN 1 END) as gradeE
       FROM assessments a
       LEFT JOIN santri s ON a.santriId = s.id
       LEFT JOIN halaqah h ON a.halaqahId = h.id
       ${whereClause}
       GROUP BY a.type`,
      params,
    );

    const assessments = (assessmentResult as any[]).map((assessment) => ({
      ...assessment,
      score: parseFloat(assessment.score),
    }));

    const statistics = (statsResult as any[]).reduce((acc, stat) => {
      acc[stat.type.toLowerCase()] = {
        totalAssessments: stat.totalAssessments,
        averageScore:
          Math.round(parseFloat(stat.averageScore || 0) * 100) / 100,
        minScore: parseFloat(stat.minScore || 0),
        maxScore: parseFloat(stat.maxScore || 0),
        gradeDistribution: {
          A: stat.gradeA,
          B: stat.gradeB,
          C: stat.gradeC,
          D: stat.gradeD,
          E: stat.gradeE,
        },
      };
      return acc;
    }, {});

    console.log(`✅ Found ${assessments.length} assessments`);

    return NextResponse.json({
      success: true,
      data: {
        assessments,
        statistics,
        total: assessments.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching assessment data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessment data" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// POST /api/halaqah/assessment - Create new assessment (Admin and Musyrif can create)
export async function POST(request: NextRequest) {
  let connection;
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check permission
    if (!hasPermission(authResult.role, 'hafalan:create')) {
      return ApiResponse.forbidden("Access denied to create assessment");
    }

    console.log("🔌 Creating new assessment...");
    connection = await mysql.createConnection(dbConfig);

    const body = await request.json();
    const {
      santriId,
      halaqahId,
      assessorId,
      assessments, // Array of assessments for different types
    } = body;

    // Validate required fields
    if (
      !santriId ||
      !halaqahId ||
      !assessments ||
      !Array.isArray(assessments)
    ) {
      return ApiResponse.error("Missing required fields");
    }

    // For musyrif, validate they can only create assessment for santri in their halaqah
    let finalAssessorId = assessorId;
    if (authResult.role === 'MUSYRIF') {
      // Verify the halaqah belongs to the musyrif
      const [halaqahResult] = await connection.execute(
        "SELECT id, musyrifId FROM halaqah WHERE id = ?",
        [halaqahId]
      );

      if ((halaqahResult as any[]).length === 0 || (halaqahResult as any[])[0].musyrifId !== authResult.id) {
        return ApiResponse.forbidden("You can only create assessments for santri in your halaqah");
      }

      // Verify the santri is in the musyrif's halaqah
      const [santriResult] = await connection.execute(
        "SELECT id, halaqahId FROM santri WHERE id = ?",
        [santriId]
      );

      if ((santriResult as any[]).length === 0 || (santriResult as any[])[0].halaqahId !== halaqahId) {
        return ApiResponse.forbidden("Santri is not in your halaqah");
      }

      // Use the authenticated musyrif's ID
      finalAssessorId = authResult.id;
    } else if (!assessorId) {
      return ApiResponse.error("Assessor ID is required");
    }

    await connection.beginTransaction();

    try {
      const createdAssessments = [];

      for (const assessment of assessments) {
        const {
          type, // QURAN, TAHSIN, AKHLAQ
          category,
          surah,
          ayahStart,
          ayahEnd,
          score,
          notes,
          strengths,
          improvements,
        } = assessment;

        // Calculate grade based on score
        let grade = "E";
        if (score >= 90) grade = "A";
        else if (score >= 80) grade = "B";
        else if (score >= 70) grade = "C";
        else if (score >= 60) grade = "D";

        // Insert assessment
        const [result] = await connection.execute(
          `INSERT INTO assessments (
            santriId, halaqahId, assessorId, type, category, surah, ayahStart, ayahEnd,
            score, grade, notes, strengths, improvements, assessedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            santriId,
            halaqahId,
            finalAssessorId,
            type,
            category,
            surah || null,
            ayahStart || null,
            ayahEnd || null,
            score,
            grade,
            notes || null,
            strengths || null,
            improvements || null,
          ],
        );

        createdAssessments.push({
          id: (result as any).insertId,
          type,
          category,
          score,
          grade,
        });
      }

      await connection.commit();

      console.log(`✅ Created ${createdAssessments.length} assessments`);

      return NextResponse.json({
        success: true,
        data: {
          assessments: createdAssessments,
          santriId,
          halaqahId,
        },
        message: `${createdAssessments.length} penilaian berhasil disimpan`,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Error creating assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create assessment" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// PUT /api/halaqah/assessment - Update assessment
export async function PUT(request: NextRequest) {
  let connection;
  try {
    console.log("🔌 Updating assessment...");
    connection = await mysql.createConnection(dbConfig);

    const body = await request.json();
    const { id, score, notes, strengths, improvements } = body;

    if (!id || score === undefined) {
      return NextResponse.json(
        { success: false, error: "Assessment ID and score are required" },
        { status: 400 },
      );
    }

    // Calculate new grade
    let grade = "E";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";

    // Update assessment
    await connection.execute(
      `UPDATE assessments 
       SET score = ?, grade = ?, notes = ?, strengths = ?, improvements = ?, updatedAt = NOW()
       WHERE id = ?`,
      [
        score,
        grade,
        notes || null,
        strengths || null,
        improvements || null,
        id,
      ],
    );

    console.log(`✅ Assessment ${id} updated successfully`);

    return NextResponse.json({
      success: true,
      data: { id, score, grade },
      message: "Penilaian berhasil diperbarui",
    });
  } catch (error) {
    console.error("❌ Error updating assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update assessment" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}
