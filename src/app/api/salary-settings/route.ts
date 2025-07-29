import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// GET - Ambil semua pengaturan gaji
export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT 
        id,
        position,
        salary_type,
        base_amount,
        overtime_rate,
        allowances,
        deductions,
        is_active,
        created_at,
        updated_at
      FROM salary_settings 
      WHERE is_active = TRUE
      ORDER BY position ASC
    `);

    await connection.end();

    // Parse JSON fields
    const settings = (rows as any[]).map((setting) => ({
      ...setting,
      allowances: setting.allowances ? JSON.parse(setting.allowances) : {},
      deductions: setting.deductions ? JSON.parse(setting.deductions) : {},
      base_amount: parseFloat(setting.base_amount),
      overtime_rate: parseFloat(setting.overtime_rate || 0),
    }));

    return NextResponse.json({
      success: true,
      settings,
      message: "Pengaturan gaji berhasil dimuat",
    });
  } catch (error) {
    console.error("Error fetching salary settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat pengaturan gaji",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST - Tambah pengaturan gaji baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      position,
      salary_type,
      base_amount,
      overtime_rate = 0,
      allowances = {},
      deductions = {},
      created_by,
    } = body;

    // Validasi input
    if (!position || !salary_type || !base_amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Position, salary_type, dan base_amount wajib diisi",
        },
        { status: 400 },
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Check if position already exists
    const [existing] = await connection.execute(
      "SELECT id FROM salary_settings WHERE position = ? AND is_active = TRUE",
      [position],
    );

    if ((existing as any[]).length > 0) {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          message: "Pengaturan gaji untuk posisi ini sudah ada",
        },
        { status: 400 },
      );
    }

    // Insert new salary setting
    const [result] = await connection.execute(
      `
      INSERT INTO salary_settings (
        position, salary_type, base_amount, overtime_rate, 
        allowances, deductions, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        position,
        salary_type,
        base_amount,
        overtime_rate,
        JSON.stringify(allowances),
        JSON.stringify(deductions),
        created_by,
      ],
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Pengaturan gaji berhasil ditambahkan",
      id: (result as any).insertId,
    });
  } catch (error) {
    console.error("Error creating salary setting:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan pengaturan gaji",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT - Update pengaturan gaji
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      position,
      salary_type,
      base_amount,
      overtime_rate = 0,
      allowances = {},
      deductions = {},
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID pengaturan gaji wajib diisi",
        },
        { status: 400 },
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `
      UPDATE salary_settings SET
        position = ?,
        salary_type = ?,
        base_amount = ?,
        overtime_rate = ?,
        allowances = ?,
        deductions = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = TRUE
    `,
      [
        position,
        salary_type,
        base_amount,
        overtime_rate,
        JSON.stringify(allowances),
        JSON.stringify(deductions),
        id,
      ],
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengaturan gaji tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan gaji berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating salary setting:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengupdate pengaturan gaji",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE - Hapus pengaturan gaji (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID pengaturan gaji wajib diisi",
        },
        { status: 400 },
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      "UPDATE salary_settings SET is_active = FALSE WHERE id = ?",
      [id],
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengaturan gaji tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan gaji berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting salary setting:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus pengaturan gaji",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
