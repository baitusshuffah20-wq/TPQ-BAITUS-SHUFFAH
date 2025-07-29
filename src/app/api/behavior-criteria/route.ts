import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { z } from "zod";

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

// Validation schema for behavior criteria
const behaviorCriteriaSchema = z.object({
  name: z
    .string()
    .min(1, "Nama kriteria wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  nameArabic: z
    .string()
    .min(1, "Nama Arab wajib diisi")
    .max(100, "Nama Arab maksimal 100 karakter"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  category: z.enum(
    ["AKHLAQ", "IBADAH", "ACADEMIC", "SOCIAL", "DISCIPLINE", "LEADERSHIP"],
    {
      errorMap: () => ({
        message:
          "Kategori harus salah satu dari: AKHLAQ, IBADAH, ACADEMIC, SOCIAL, DISCIPLINE, LEADERSHIP",
      }),
    },
  ),
  type: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"], {
    errorMap: () => ({
      message: "Tipe harus salah satu dari: POSITIVE, NEGATIVE, NEUTRAL",
    }),
  }),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
  points: z.number().int("Poin harus berupa bilangan bulat"),
  isActive: z.boolean().default(true),
  ageGroup: z.string().default("5+"),
  examples: z.array(z.string()).default([]),
  consequences: z.array(z.string()).optional(),
  rewards: z.array(z.string()).optional(),
  islamicReference: z
    .object({
      quranVerse: z.string().optional(),
      hadith: z.string().optional(),
      explanation: z.string().optional(),
    })
    .optional(),
});

// GET /api/behavior-criteria - Get all behavior criteria
export async function GET(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 API behavior-criteria GET called");
    console.log("📊 Database config:", {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
    });

    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connection established");

    // Check if behavior_criteria table exists
    try {
      const [tableCheck] = await connection.execute(
        "SHOW TABLES LIKE 'behavior_criteria'",
      );
      if ((tableCheck as any[]).length === 0) {
        console.log("❌ Table behavior_criteria does not exist");
        return NextResponse.json(
          {
            success: false,
            message:
              "Tabel behavior_criteria belum dibuat. Silakan jalankan migration database terlebih dahulu.",
            error: "TABLE_NOT_EXISTS",
          },
          { status: 500 },
        );
      }
      console.log("✅ Table behavior_criteria exists");
    } catch (tableError) {
      console.error("❌ Error checking table:", tableError);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal memeriksa struktur database",
          error:
            tableError instanceof Error ? tableError.message : "Unknown error",
        },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    console.log("📊 Query params:", {
      page,
      limit,
      category,
      type,
      isActive,
      search,
    });

    // Build WHERE clause
    const whereConditions = ["1=1"];
    const queryParams: any[] = [];

    if (category && category !== "all") {
      whereConditions.push("category = ?");
      queryParams.push(category);
    }

    if (type && type !== "all") {
      whereConditions.push("type = ?");
      queryParams.push(type);
    }

    if (isActive !== null && isActive !== undefined && isActive !== "all") {
      whereConditions.push("is_active = ?");
      queryParams.push(isActive === "true");
    }

    if (search) {
      whereConditions.push(
        "(name LIKE ? OR name_arabic LIKE ? OR description LIKE ?)",
      );
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause =
      whereConditions.length > 1
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";
    const skip = (page - 1) * limit;

    // Get criteria with pagination
    console.log("📊 Executing query with params:", [
      ...queryParams,
      limit,
      skip,
    ]);
    const [rows] = await connection.execute(
      `SELECT
        id, name, name_arabic, description, category, type, severity, points,
        is_active, age_group, examples, consequences, rewards, islamic_reference,
        created_at, updated_at
       FROM behavior_criteria
       ${whereClause}
       ORDER BY
         CASE category
           WHEN 'AKHLAQ' THEN 1
           WHEN 'IBADAH' THEN 2
           WHEN 'ACADEMIC' THEN 3
           WHEN 'SOCIAL' THEN 4
           WHEN 'DISCIPLINE' THEN 5
           WHEN 'LEADERSHIP' THEN 6
           ELSE 7
         END,
         CASE type
           WHEN 'POSITIVE' THEN 1
           WHEN 'NEUTRAL' THEN 2
           WHEN 'NEGATIVE' THEN 3
           ELSE 4
         END,
         name
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, skip],
    );

    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM behavior_criteria ${whereClause}`,
      queryParams,
    );

    const total = (countResult as any[])[0].total;
    const totalPages = Math.ceil(total / limit);

    // Parse JSON fields with error handling
    const criteria = (rows as any[]).map((row) => {
      try {
        return {
          ...row,
          examples: row.examples ? JSON.parse(row.examples) : [],
          consequences: row.consequences ? JSON.parse(row.consequences) : [],
          rewards: row.rewards ? JSON.parse(row.rewards) : [],
          islamicReference: row.islamic_reference
            ? JSON.parse(row.islamic_reference)
            : null,
          isActive: Boolean(row.is_active),
        };
      } catch (parseError) {
        console.error("❌ Error parsing JSON for row:", row.id, parseError);
        return {
          ...row,
          examples: [],
          consequences: [],
          rewards: [],
          islamicReference: null,
          isActive: Boolean(row.is_active),
        };
      }
    });

    console.log(`✅ Found ${criteria.length} behavior criteria`);

    const response = NextResponse.json({
      success: true,
      data: criteria,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
        query: {
          search: search || null,
          category: category !== "all" ? category : null,
          type: type !== "all" ? type : null,
          isActive: isActive !== "all" ? isActive : null,
        },
      },
    });

    // Add cache headers for better performance
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );

    return response;
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

// POST /api/behavior-criteria - Create new behavior criteria
export async function POST(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 Creating behavior criteria...");
    connection = await mysql.createConnection(dbConfig);

    const body = await request.json();
    console.log("📝 Request body:", body);

    // Validate request body
    const validationResult = behaviorCriteriaSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("❌ Validation failed:", validationResult.error.format());
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid",
          errors: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;
    const criteriaId = `${data.category.toLowerCase()}_${Date.now()}`;
    const currentTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Insert behavior criteria
    await connection.execute(
      `INSERT INTO behavior_criteria (
        id, name, name_arabic, description, category, type, severity,
        points, is_active, age_group, examples, consequences, rewards, 
        islamic_reference, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        criteriaId,
        data.name,
        data.nameArabic,
        data.description,
        data.category,
        data.type,
        data.severity,
        data.points,
        data.isActive,
        data.ageGroup,
        JSON.stringify(data.examples),
        data.consequences ? JSON.stringify(data.consequences) : null,
        data.rewards ? JSON.stringify(data.rewards) : null,
        data.islamicReference ? JSON.stringify(data.islamicReference) : null,
        currentTimestamp,
        currentTimestamp,
      ],
    );

    console.log(
      "✅ Behavior criteria created successfully with ID:",
      criteriaId,
    );

    return NextResponse.json({
      success: true,
      message: "Kriteria perilaku berhasil ditambahkan",
      data: { id: criteriaId, ...data },
    });
  } catch (error) {
    console.error("❌ Error creating behavior criteria:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan kriteria perilaku",
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

// PUT /api/behavior-criteria - Update behavior criteria
export async function PUT(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 Updating behavior criteria...");
    connection = await mysql.createConnection(dbConfig);

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kriteria perilaku diperlukan",
        },
        { status: 400 },
      );
    }

    // Validate update data
    const validationResult = behaviorCriteriaSchema
      .partial()
      .safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid",
          errors: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    // Check if criteria exists
    const [existingRows] = await connection.execute(
      "SELECT id FROM behavior_criteria WHERE id = ?",
      [id],
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "Kriteria perilaku tidak ditemukan" },
        { status: 404 },
      );
    }

    const data = validationResult.data;
    const currentTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (key === "examples" || key === "consequences" || key === "rewards") {
          updateFields.push(`${key} = ?`);
          updateValues.push(JSON.stringify(value));
        } else if (key === "islamicReference") {
          updateFields.push(`islamic_reference = ?`);
          updateValues.push(value ? JSON.stringify(value) : null);
        } else if (key === "nameArabic") {
          updateFields.push(`name_arabic = ?`);
          updateValues.push(value);
        } else if (key === "isActive") {
          updateFields.push(`is_active = ?`);
          updateValues.push(value);
        } else if (key === "ageGroup") {
          updateFields.push(`age_group = ?`);
          updateValues.push(value);
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diperbarui" },
        { status: 400 },
      );
    }

    updateFields.push("updated_at = ?");
    updateValues.push(currentTimestamp);
    updateValues.push(id);

    await connection.execute(
      `UPDATE behavior_criteria SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );

    console.log("✅ Behavior criteria updated successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Kriteria perilaku berhasil diperbarui",
    });
  } catch (error) {
    console.error("❌ Error updating behavior criteria:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui kriteria perilaku",
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

// DELETE /api/behavior-criteria - Delete behavior criteria
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 Deleting behavior criteria...");
    connection = await mysql.createConnection(dbConfig);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kriteria perilaku diperlukan",
        },
        { status: 400 },
      );
    }

    // Check if criteria exists
    const [existingRows] = await connection.execute(
      "SELECT id FROM behavior_criteria WHERE id = ?",
      [id],
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "Kriteria perilaku tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if criteria is being used in behavior records
    const [usageRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM behavior_records WHERE criteria_id = ?",
      [id],
    );

    const usageCount = (usageRows as any[])[0].count;
    if (usageCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Kriteria perilaku tidak dapat dihapus karena sedang digunakan dalam ${usageCount} catatan perilaku`,
        },
        { status: 400 },
      );
    }

    // Delete criteria
    await connection.execute("DELETE FROM behavior_criteria WHERE id = ?", [
      id,
    ]);

    console.log("✅ Behavior criteria deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Kriteria perilaku berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error deleting behavior criteria:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus kriteria perilaku",
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
