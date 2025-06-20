import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'tpq_baitus_shuffah_new'
};

// GET /api/santri/[id] - Get santri by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;

  try {
    const id = params.id;
    console.log(GET /api/santri/);

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Get santri with related data
    const [santriRows] = await connection.execute(
      SELECT s.*, u.name as waliName, u.email as waliEmail, u.phone as waliPhone,
             h.name as halaqahName, h.level as halaqahLevel
      FROM santri s
      LEFT JOIN users u ON s.waliId = u.id
      LEFT JOIN halaqah h ON s.halaqahId = h.id
      WHERE s.id = ?
    , [id]);

    if ((santriRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    const santriData = (santriRows as any[])[0];

    // Get hafalan records
    const [hafalanRows] = await connection.execute(
      SELECT id, surahId, surahName, ayahStart, ayahEnd, type, status, grade, recordedAt
      FROM hafalan
      WHERE santriId = ?
      ORDER BY recordedAt DESC
      LIMIT 10
    , [id]);

    // Get attendance records
    const [attendanceRows] = await connection.execute(
      SELECT id, date, status, checkInTime, checkOutTime, notes
      FROM attendance
      WHERE santriId = ?
      ORDER BY date DESC
      LIMIT 10
    , [id]);

    // Get payment records
    const [paymentRows] = await connection.execute(
      SELECT id, type, amount, dueDate, paidDate, status, method
      FROM payments
      WHERE santriId = ?
      ORDER BY dueDate DESC
      LIMIT 10
    , [id]);

    // Format response
    const santri = {
      id: santriData.id,
      nis: santriData.nis,
      name: santriData.name,
      birthDate: santriData.birthDate,
      birthPlace: santriData.birthPlace,
      gender: santriData.gender,
      address: santriData.address,
      phone: santriData.phone,
      email: santriData.email,
      photo: santriData.photo,
      status: santriData.status,
      enrollmentDate: santriData.enrollmentDate,
      graduationDate: santriData.graduationDate,
      wali: santriData.waliId ? {
        id: santriData.waliId,
        name: santriData.waliName,
        email: santriData.waliEmail,
        phone: santriData.waliPhone
      } : null,
      halaqah: santriData.halaqahId ? {
        id: santriData.halaqahId,
        name: santriData.halaqahName,
        level: santriData.halaqahLevel
      } : null,
      hafalan: hafalanRows as any[],
      attendance: attendanceRows as any[],
      payments: paymentRows as any[]
    };

    return NextResponse.json({
      success: true,
      santri
    });

  } catch (error) {
    console.error(Error fetching santri :, error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data santri',
        error: String(error)
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT /api/santri/[id] - Update santri
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;

  try {
    const id = params.id;
    const body = await request.json();
    const {
      nis,
      name,
      birthDate,
      birthPlace,
      gender,
      address,
      phone,
      email,
      photo,
      status,
      waliId,
      halaqahId,
      enrollmentDate,
      graduationDate
    } = body;

    console.log(PUT /api/santri/, body);

    // Validation
    if (!nis || !name || !birthDate || !birthPlace || !gender || !address || !waliId || !enrollmentDate) {
      return NextResponse.json(
        { success: false, message: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Check if santri exists
    const [existingSantriRows] = await connection.execute(
      'SELECT * FROM santri WHERE id = ?',
      [id]
    );

    if ((existingSantriRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if NIS already exists (for another santri)
    const [nisRows] = await connection.execute(
      'SELECT * FROM santri WHERE nis = ? AND id != ?',
      [nis, id]
    );

    if ((nisRows as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'NIS sudah digunakan oleh santri lain' },
        { status: 400 }
      );
    }

    // Check if wali exists
    const [waliRows] = await connection.execute(
      'SELECT * FROM users WHERE id = ? AND role = "WALI"',
      [waliId]
    );

    if ((waliRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Wali tidak ditemukan' },
        { status: 400 }
      );
    }

    // Check if halaqah exists (if provided)
    if (halaqahId) {
      const [halaqahRows] = await connection.execute(
        'SELECT * FROM halaqah WHERE id = ?',
        [halaqahId]
      );

      if ((halaqahRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: 'Halaqah tidak ditemukan' },
          { status: 400 }
        );
      }
    }

    // Update santri
    const birthDateObj = new Date(birthDate);
    const enrollmentDateObj = new Date(enrollmentDate);
    const graduationDateObj = graduationDate ? new Date(graduationDate) : null;

    await connection.execute(
      UPDATE santri SET
        nis = ?,
        name = ?,
        birthDate = ?,
        birthPlace = ?,
        gender = ?,
        address = ?,
        phone = ?,
        email = ?,
        photo = ?,
        status = ?,
        waliId = ?,
        halaqahId = ?,
        enrollmentDate = ?,
        graduationDate = ?,
        updatedAt = NOW()
      WHERE id = ?
    , [
      nis,
      name,
      birthDateObj,
      birthPlace,
      gender,
      address,
      phone || null,
      email || null,
      photo || null,
      status,
      waliId,
      halaqahId || null,
      enrollmentDateObj,
      graduationDateObj,
      id
    ]);

    // Get the updated santri with related data
    const [santriRows] = await connection.execute(
      SELECT s.*, u.name as waliName, u.email as waliEmail, u.phone as waliPhone,
             h.name as halaqahName, h.level as halaqahLevel
      FROM santri s
      LEFT JOIN users u ON s.waliId = u.id
      LEFT JOIN halaqah h ON s.halaqahId = h.id
      WHERE s.id = ?
    , [id]);

    const santri = (santriRows as any[])[0];

    return NextResponse.json({
      success: true,
      message: 'Santri berhasil diperbarui',
      santri
    });

  } catch (error) {
    console.error(Error updating santri :, error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui santri' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE /api/santri/[id] - Delete santri
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;

  try {
    const id = params.id;
    console.log(DELETE /api/santri/);

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Check if santri exists
    const [existingSantriRows] = await connection.execute(
      'SELECT * FROM santri WHERE id = ?',
      [id]
    );

    if ((existingSantriRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete santri
    await connection.execute('DELETE FROM santri WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Santri berhasil dihapus'
    });

  } catch (error) {
    console.error(Error deleting santri :, error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus santri' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
