import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// GET /api/behavior - Get behavior records
export async function GET(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 API behavior called");
    connection = await mysql.createConnection(dbConfig);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const santriId = searchParams.get("santriId");
    const halaqahId = searchParams.get("halaqahId");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    console.log("📊 Query params:", {
      page,
      limit,
      santriId,
      halaqahId,
      category,
      type,
      dateFrom,
      dateTo,
    });

    const skip = (page - 1) * limit;

    // Build where clause
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (santriId) {
      whereClause += " AND b.santriId = ?";
      params.push(santriId);
    }

    if (halaqahId) {
      whereClause += " AND b.halaqahId = ?";
      params.push(halaqahId);
    }

    if (category) {
      whereClause += " AND b.category = ?";
      params.push(category);
    }

    if (type) {
      whereClause += " AND b.type = ?";
      params.push(type);
    }

    if (dateFrom) {
      whereClause += " AND b.date >= ?";
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += " AND b.date <= ?";
      params.push(dateTo);
    }

    console.log("🔍 Where clause:", whereClause);
    console.log("🔍 Params:", params);

    // Get behavior records with ALL related data for comprehensive reporting
    const [behaviorResult] = await connection.execute(
      `SELECT
        b.id,
        b.santri_id as santriId,
        b.halaqah_id as halaqahId,
        b.criteria_id as criteriaId,
        bc.name as criteriaName,
        b.category,
        b.type,
        b.severity,
        b.points,
        b.date,
        b.time,
        b.description,
        b.context,
        b.witnesses,
        b.location,
        b.status,
        b.recorded_by as recordedBy,
        b.recorded_at as recordedAt,
        b.follow_up_required as followUpRequired,
        b.follow_up_date as followUpDate,
        b.follow_up_notes as followUpNotes,
        b.parent_notified as parentNotified,
        b.parent_notified_at as parentNotifiedAt,
        b.resolution,
        b.attachments,
        b.metadata,
        b.created_at as createdAt,
        b.updated_at as updatedAt,
        s.name as santriName,
        s.nis as santriNis,
        h.name as halaqahName,
        h.level as halaqahLevel,
        u.name as recordedByName
       FROM behavior_records b
       LEFT JOIN santri s ON b.santri_id = s.id
       LEFT JOIN halaqah h ON b.halaqah_id = h.id
       LEFT JOIN users u ON b.recorded_by = u.id
       LEFT JOIN behavior_criteria bc ON b.criteria_id = bc.id
       ${whereClause}
       ORDER BY b.date DESC, b.recorded_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, skip],
    );

    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM behavior_records b ${whereClause}`,
      params,
    );

    const behaviorRecords = (behaviorResult as any[]).map((record) => ({
      ...record,
      santri: {
        id: record.santriId,
        nis: record.santriNis,
        name: record.santriName,
      },
      halaqah: {
        id: record.halaqahId,
        name: record.halaqahName,
        level: record.halaqahLevel,
      },
      recordedByUser: {
        id: record.recordedBy,
        name: record.recordedByName,
      },
    }));

    const total = (countResult as any[])[0].total;

    console.log("✅ Query successful:", {
      recordsFound: behaviorRecords.length,
      total,
    });

    return NextResponse.json({
      success: true,
      data: {
        behaviorRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching behavior records:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch behavior records",
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

// POST /api/behavior - Create behavior record
export async function POST(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 Creating behavior record...");
    connection = await mysql.createConnection(dbConfig);

    const body = await request.json();
    console.log("📝 Request body:", body);

    const {
      santriId,
      halaqahId,
      criteriaId,
      criteriaName,
      category,
      type,
      severity = "LOW",
      points = 0,
      date,
      time,
      description,
      context,
      location,
      recordedBy,
      followUpRequired = false,
      parentNotified = false,
      metadata,
    } = body;

    // Validate required fields
    if (!santriId || !category || !type || !description || !recordedBy) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: santriId, category, type, description, recordedBy",
        },
        { status: 400 },
      );
    }

    // Generate ID
    const behaviorId = `beh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentDate = date ? new Date(date) : new Date();
    const currentTimestamp = new Date();

    // Insert behavior record
    await connection.execute(
      `INSERT INTO behavior_records (
        id, santri_id, halaqah_id, criteria_id, category, type, severity,
        points, date, time, description, context, location, recorded_by,
        follow_up_required, parent_notified, parent_notified_at, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        behaviorId,
        santriId,
        halaqahId,
        criteriaId,
        category,
        type,
        severity,
        points,
        currentDate,
        time,
        description,
        context,
        location,
        recordedBy,
        followUpRequired,
        parentNotified,
        parentNotified ? currentTimestamp : null,
        metadata ? JSON.stringify(metadata) : null,
        currentTimestamp,
        currentTimestamp,
      ],
    );

    // Get the created record with related data
    const [result] = await connection.execute(
      `SELECT
        b.*,
        s.name as santriName,
        s.nis as santriNis,
        h.name as halaqahName,
        h.level as halaqahLevel,
        u.name as recordedByName
       FROM behavior_records b
       LEFT JOIN santri s ON b.santri_id = s.id
       LEFT JOIN halaqah h ON b.halaqah_id = h.id
       LEFT JOIN users u ON b.recorded_by = u.id
       WHERE b.id = ?`,
      [behaviorId],
    );

    const behaviorRecord = (result as any[])[0];

    console.log("✅ Behavior record created:", behaviorId);

    return NextResponse.json({
      success: true,
      data: {
        ...behaviorRecord,
        santri: {
          id: behaviorRecord.santriId,
          nis: behaviorRecord.santriNis,
          name: behaviorRecord.santriName,
        },
        halaqah: {
          id: behaviorRecord.halaqahId,
          name: behaviorRecord.halaqahName,
          level: behaviorRecord.halaqahLevel,
        },
        recordedByUser: {
          id: behaviorRecord.recordedBy,
          name: behaviorRecord.recordedByName,
        },
      },
      message: "Behavior record created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating behavior record:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create behavior record",
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

// PUT /api/behavior - Update behavior record
export async function PUT(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 Updating behavior record...");
    connection = await mysql.createConnection(dbConfig);

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Behavior record ID is required",
        },
        { status: 400 },
      );
    }

    // Build update query dynamically with proper column mapping
    const updateFields = [];
    const updateValues = [];

    // Map frontend field names to database column names
    const fieldMapping: Record<string, string> = {
      santriId: "santri_id",
      halaqahId: "halaqah_id",
      criteriaId: "criteria_id",
      criteriaName: "criteria_name",
      recordedBy: "recorded_by",
      followUpRequired: "follow_up_required",
      followUpDate: "follow_up_date",
      followUpNotes: "follow_up_notes",
      parentNotified: "parent_notified",
      parentNotifiedAt: "parent_notified_at",
      recordedAt: "recorded_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    };

    for (const [key, value] of Object.entries(updateData)) {
      if (key !== "id") {
        const dbColumn = fieldMapping[key] || key;
        updateFields.push(`${dbColumn} = ?`);
        updateValues.push(value);
      }
    }

    updateFields.push("updated_at = ?");
    updateValues.push(new Date());
    updateValues.push(id);

    const updateQuery = `UPDATE behavior_records SET ${updateFields.join(", ")} WHERE id = ?`;

    // Update behavior record
    await connection.execute(updateQuery, updateValues);

    // Get the updated record with related data
    const [result] = await connection.execute(
      `SELECT
        b.*,
        s.name as santriName,
        s.nis as santriNis,
        h.name as halaqahName,
        h.level as halaqahLevel,
        u.name as recordedByName
       FROM behavior_records b
       LEFT JOIN santri s ON b.santri_id = s.id
       LEFT JOIN halaqah h ON b.halaqah_id = h.id
       LEFT JOIN users u ON b.recorded_by = u.id
       WHERE b.id = ?`,
      [id],
    );

    const behaviorRecord = (result as any[])[0];

    console.log("✅ Behavior record updated:", id);

    return NextResponse.json({
      success: true,
      data: {
        ...behaviorRecord,
        santri: {
          id: behaviorRecord.santriId,
          nis: behaviorRecord.santriNis,
          name: behaviorRecord.santriName,
        },
        halaqah: {
          id: behaviorRecord.halaqahId,
          name: behaviorRecord.halaqahName,
          level: behaviorRecord.halaqahLevel,
        },
        recordedByUser: {
          id: behaviorRecord.recordedBy,
          name: behaviorRecord.recordedByName,
        },
      },
      message: "Behavior record updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating behavior record:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      sql: (error as any).sql || "No SQL query",
    });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update behavior record",
        error: error instanceof Error ? error.message : "Unknown error",
        details: (error as any).sql || "No additional details",
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

// DELETE /api/behavior - Delete behavior record
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    console.log("🔄 Deleting behavior record...");
    connection = await mysql.createConnection(dbConfig);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Behavior record ID is required",
        },
        { status: 400 },
      );
    }

    // Delete behavior record
    await connection.execute(`DELETE FROM behavior_records WHERE id = ?`, [id]);

    console.log("✅ Behavior record deleted:", id);

    return NextResponse.json({
      success: true,
      message: "Behavior record deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting behavior record:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete behavior record",
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
