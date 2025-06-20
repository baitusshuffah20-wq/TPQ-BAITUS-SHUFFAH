import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'tpq_baitus_shuffah_new'
};

// GET /api/santri - Get all santri
export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const halaqahId = searchParams.get('halaqahId');
    const waliId = searchParams.get('waliId');
    const search = searchParams.get('search');
    const simple = searchParams.get('simple') === 'true';

    console.log('GET /api/santri - Query params:', { status, halaqahId, waliId, search, simple });

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Check if database exists
    try {
      await connection.query(`USE ${dbConfig.database}`);
    } catch (dbError) {
      console.log(`Database ${dbConfig.database} does not exist, creating it...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
      await connection.query(`USE ${dbConfig.database}`);
    }

    // Check if santri table exists
    let santriTableExists = true;
    try {
      await connection.execute('SELECT 1 FROM santri LIMIT 1');
      console.log('Table santri exists');
    } catch (error) {
      console.log('Table santri does not exist, creating it...');
      santriTableExists = false;

      // Create santri table
      await connection.execute(`
        CREATE TABLE santri (
          id VARCHAR(50) PRIMARY KEY,
          nis VARCHAR(20) UNIQUE,
          name VARCHAR(100) NOT NULL,
          gender ENUM('MALE', 'FEMALE') NOT NULL,
          birthDate DATE,
          birthPlace VARCHAR(100),
          address TEXT,
          phone VARCHAR(20),
          email VARCHAR(100),
          photo VARCHAR(255),
          halaqahId VARCHAR(50),
          waliId VARCHAR(50),
          status ENUM('ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
          enrollmentDate DATE,
          graduationDate DATE,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX (halaqahId),
          INDEX (waliId),
          INDEX (status)
        )
      `);

      // Insert sample data
      await connection.execute(`
        INSERT INTO santri (id, nis, name, gender, status, enrollmentDate) VALUES
        ('santri_001', 'S001', 'Ahmad Fauzi', 'MALE', 'ACTIVE', '2023-01-01'),
        ('santri_002', 'S002', 'Fatimah Azzahra', 'FEMALE', 'ACTIVE', '2023-01-02'),
        ('santri_003', 'S003', 'Muhammad Rizki', 'MALE', 'ACTIVE', '2023-01-03'),
        ('santri_004', 'S004', 'Aisyah Putri', 'FEMALE', 'ACTIVE', '2023-01-04'),
        ('santri_005', 'S005', 'Abdullah Zaki', 'MALE', 'ACTIVE', '2023-01-05')
      `);

      console.log('Table santri created with sample data');
    }

    // Check if halaqah table exists
    let halaqahTableExists = true;
    try {
      await connection.execute('SELECT 1 FROM halaqah LIMIT 1');
      console.log('Table halaqah exists');
    } catch (error) {
      console.log('Table halaqah does not exist, creating it...');
      halaqahTableExists = false;

      // Create halaqah table
      await connection.execute(`
        CREATE TABLE halaqah (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          level VARCHAR(50),
          description TEXT,
          musyrifId VARCHAR(50),
          schedule TEXT,
          location VARCHAR(100),
          capacity INT,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX (musyrifId)
        )
      `);

      // Insert sample data
      await connection.execute(`
        INSERT INTO halaqah (id, name, level) VALUES
        ('halaqah_001', 'Halaqah Al-Fatihah', 'Pemula'),
        ('halaqah_002', 'Halaqah Al-Baqarah', 'Menengah'),
        ('halaqah_003', 'Halaqah Ali Imran', 'Lanjutan')
      `);

      console.log('Table halaqah created with sample data');

      // Update santri with halaqahId if both tables were just created
      if (!santriTableExists) {
        await connection.execute(`UPDATE santri SET halaqahId = 'halaqah_001' WHERE id IN ('santri_001', 'santri_002')`);
        await connection.execute(`UPDATE santri SET halaqahId = 'halaqah_002' WHERE id IN ('santri_003', 'santri_004')`);
        await connection.execute(`UPDATE santri SET halaqahId = 'halaqah_003' WHERE id = 'santri_005'`);
        console.log('Updated santri with halaqahId');
      }
    }

    // Check if users table exists
    let usersTableExists = true;
    try {
      await connection.execute('SELECT 1 FROM users LIMIT 1');
      console.log('Table users exists');
    } catch (error) {
      console.log('Table users does not exist');
      usersTableExists = false;
    }

    // Build query based on available tables
    let query = '';

    if (simple) {
      query = `
        SELECT
          id,
          nis,
          name,
          photo,
          halaqahId
        FROM
          santri s
        WHERE 1=1
      `;
    } else if (halaqahTableExists && usersTableExists) {
      query = `
        SELECT
          s.id,
          s.nis,
          s.name,
          s.birthDate,
          s.birthPlace,
          s.gender,
          s.address,
          s.phone,
          s.email,
          s.photo,
          s.status,
          s.enrollmentDate,
          s.graduationDate,
          s.waliId,
          s.halaqahId,
          h.name as halaqahName,
          h.level as halaqahLevel,
          u.name as waliName,
          u.email as waliEmail,
          u.phone as waliPhone
        FROM
          santri s
        LEFT JOIN
          halaqah h ON s.halaqahId = h.id
        LEFT JOIN
          users u ON s.waliId = u.id
        WHERE 1=1
      `;
    } else if (halaqahTableExists) {
      query = `
        SELECT
          s.id,
          s.nis,
          s.name,
          s.birthDate,
          s.birthPlace,
          s.gender,
          s.address,
          s.phone,
          s.email,
          s.photo,
          s.status,
          s.enrollmentDate,
          s.graduationDate,
          s.waliId,
          s.halaqahId,
          h.name as halaqahName,
          h.level as halaqahLevel
        FROM
          santri s
        LEFT JOIN
          halaqah h ON s.halaqahId = h.id
        WHERE 1=1
      `;
    } else {
      query = `
        SELECT
          s.id,
          s.nis,
          s.name,
          s.birthDate,
          s.birthPlace,
          s.gender,
          s.address,
          s.phone,
          s.email,
          s.photo,
          s.status,
          s.enrollmentDate,
          s.graduationDate,
          s.waliId,
          s.halaqahId
        FROM
          santri s
        WHERE 1=1
      `;
    }

    const params = [];

    if (status && status !== 'ALL') {
      query += ` AND s.status = ?`;
      params.push(status);
    } else {
      // Default to ACTIVE status if not specified
      query += ` AND s.status = 'ACTIVE'`;
    }

    if (halaqahId && halaqahId !== 'ALL') {
      query += ` AND s.halaqahId = ?`;
      params.push(halaqahId);
    }

    if (waliId && waliId !== 'ALL') {
      query += ` AND s.waliId = ?`;
      params.push(waliId);
    }

    if (search) {
      query += ` AND (s.name LIKE ? OR s.nis LIKE ? OR s.email LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY s.name ASC`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    // Execute query
    const [rows] = await connection.execute(query, params);
    console.log(`Found ${(rows as any[]).length} santri records`);

    // Format data
    const santri = await Promise.all((rows as any[]).map(async (row) => {
      const result = {
        id: row.id,
        nis: row.nis,
        name: row.name,
        birthDate: row.birthDate,
        birthPlace: row.birthPlace,
        gender: row.gender,
        address: row.address,
        phone: row.phone,
        email: row.email,
        photo: row.photo,
        status: row.status,
        enrollmentDate: row.enrollmentDate,
        graduationDate: row.graduationDate,
        wali: row.waliId ? {
          id: row.waliId,
          name: row.waliName,
          email: row.waliEmail,
          phone: row.waliPhone
        } : null,
        halaqah: row.halaqahId ? {
          id: row.halaqahId,
          name: row.halaqahName,
          level: row.halaqahLevel
        } : null
      };

      // If simple mode, return without additional data
      if (simple) {
        return result;
      }

      try {
        // Ensure connection is not null before executing queries
        if (!connection) {
          throw new Error('Database connection is null');
        }

        // Check if hafalan table exists
        let hafalanRows = [];
        try {
          const [rows] = await connection.execute(`
            SELECT 
              id, surahId, surahName, ayahStart, ayahEnd, type, status, grade, recordedAt
            FROM
              hafalan
            WHERE
              santriId = ?
            ORDER BY
              recordedAt DESC
            LIMIT 5
          `, [row.id]);
          hafalanRows = rows as any[];
        } catch (error) {
          console.log(`Table hafalan does not exist or error fetching hafalan for santri ${row.id}`);
        }

        // Check if attendance table exists
        let attendanceRows = [];
        try {
          const [rows] = await connection.execute(`
            SELECT
              id, date, status
            FROM
              attendance
            WHERE
              santriId = ?
            ORDER BY
              date DESC
            LIMIT 10
          `, [row.id]);
          attendanceRows = rows as any[];
        } catch (error) {
          console.log(`Table attendance does not exist or error fetching attendance for santri ${row.id}`);       
        }

        // Check if payments table exists
        let paymentRows = [];
        try {
          const [rows] = await connection.execute(`
            SELECT
              id, type, amount, status, dueDate
            FROM
              payments
            WHERE
              santriId = ?
            ORDER BY
              dueDate DESC
            LIMIT 5
          `, [row.id]);
          paymentRows = rows as any[];
        } catch (error) {
          console.log(`Table payments does not exist or error fetching payments for santri ${row.id}`);
        }

        return {
          ...result,
          hafalan: hafalanRows || [],
          attendance: attendanceRows || [],
          payments: paymentRows || []
        };
      } catch (error) {
        console.error(`Error fetching related data for santri ${row.id}:`, error);
        return {
          ...result,
          hafalan: [],
          attendance: [],
          payments: []
        };
      }
    }));

    console.log(`Returning ${santri.length} formatted santri records`);

    return NextResponse.json({
      success: true,
      santri,
      total: santri.length
    });

  } catch (error) {
    console.error('Error fetching santri:', error);
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

// POST /api/santri - Create new santri
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
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
      status = 'ACTIVE',
      waliId,
      halaqahId,
      enrollmentDate,
      graduationDate
    } = body;

    // Validation
    if (!nis || !name || !birthDate || !birthPlace || !gender || !address || !waliId || !enrollmentDate) {        
      return NextResponse.json(
        { success: false, message: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Check if NIS already exists
    const [existingSantriRows] = await connection.execute(
      'SELECT * FROM santri WHERE nis = ?',
      [nis]
    );

    if ((existingSantriRows as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'NIS sudah digunakan' },
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

    // Create santri
    const santriId = `santri_${Date.now()}`;
    const birthDateObj = new Date(birthDate);
    const enrollmentDateObj = new Date(enrollmentDate);
    const graduationDateObj = graduationDate ? new Date(graduationDate) : null;

    await connection.execute(`
      INSERT INTO santri (
        id, nis, name, birthDate, birthPlace, gender, address,
        phone, email, photo, status, waliId, halaqahId,
        enrollmentDate, graduationDate, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      santriId,
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
      graduationDateObj
    ]);

    // Get the created santri with related data
    const [santriRows] = await connection.execute(`
      SELECT s.*, u.name as waliName, u.email as waliEmail, u.phone as waliPhone,
             h.name as halaqahName, h.level as halaqahLevel
      FROM santri s
      LEFT JOIN users u ON s.waliId = u.id
      LEFT JOIN halaqah h ON s.halaqahId = h.id
      WHERE s.id = ?
    `, [santriId]);

    const santri = (santriRows as any[])[0];

    return NextResponse.json({
      success: true,
      message: 'Santri berhasil dibuat',
      santri
    });

  } catch (error) {
    console.error('Error creating santri:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat santri' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
