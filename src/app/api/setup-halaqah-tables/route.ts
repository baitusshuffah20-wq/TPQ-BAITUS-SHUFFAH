import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

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

export async function POST(request: NextRequest) {
  let connection;
  try {
    console.log("🔌 Setting up halaqah tables...");
    connection = await mysql.createConnection(dbConfig);

    // Create halaqah table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS halaqah (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        capacity INT NOT NULL DEFAULT 10,
        room VARCHAR(255),
        schedule JSON,
        status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create users table if not exists (for musyrif)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        role ENUM('ADMIN', 'MUSYRIF', 'SANTRI') DEFAULT 'SANTRI',
        halaqahId INT,
        status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (halaqahId) REFERENCES halaqah(id) ON DELETE SET NULL,
        INDEX idx_role (role),
        INDEX idx_status (status),
        INDEX idx_halaqah (halaqahId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create santri table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS santri (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nis VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        gender ENUM('MALE', 'FEMALE') NOT NULL,
        birthDate DATE,
        phone VARCHAR(20),
        halaqahId INT,
        status ENUM('ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED') DEFAULT 'ACTIVE',
        enrollmentDate DATE DEFAULT (CURRENT_DATE),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (halaqahId) REFERENCES halaqah(id) ON DELETE SET NULL,
        INDEX idx_nis (nis),
        INDEX idx_status (status),
        INDEX idx_halaqah (halaqahId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create hafalan table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hafalan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        santriId INT NOT NULL,
        surah VARCHAR(255),
        ayahStart INT,
        ayahEnd INT,
        grade DECIMAL(5,2),
        notes TEXT,
        assessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (santriId) REFERENCES santri(id) ON DELETE CASCADE,
        INDEX idx_santri (santriId),
        INDEX idx_grade (grade)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create assessments table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        santriId INT NOT NULL,
        type ENUM('TAHSIN', 'HAFALAN', 'AKHLAQ') NOT NULL,
        category VARCHAR(255),
        score DECIMAL(5,2),
        notes TEXT,
        assessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (santriId) REFERENCES santri(id) ON DELETE CASCADE,
        INDEX idx_santri (santriId),
        INDEX idx_type (type),
        INDEX idx_score (score)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ All tables created successfully");

    // Insert sample data
    const sampleData = await insertSampleData(connection);

    return NextResponse.json({
      success: true,
      message: "Halaqah tables setup completed successfully",
      data: {
        tablesCreated: ["halaqah", "users", "santri", "hafalan", "assessments"],
        sampleData: sampleData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error setting up tables:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup halaqah tables",
        details: error instanceof Error ? error.message : String(error),
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

async function insertSampleData(connection: any) {
  try {
    // Insert sample halaqah
    const [halaqahResult] = await connection.execute(`
      INSERT IGNORE INTO halaqah (name, description, capacity, room, schedule, status) VALUES
      ('Halaqah Al-Fatiha', 'Halaqah untuk pemula dengan fokus pada surat-surat pendek', 15, 'Ruang A1', 
       '{"days": ["Senin", "Rabu", "Jumat"], "time": "16:00-17:30", "pattern": "3x seminggu"}', 'ACTIVE'),
      ('Halaqah An-Nas', 'Halaqah lanjutan dengan fokus pada hafalan juz 30', 12, 'Ruang B2',
       '{"days": ["Selasa", "Kamis", "Sabtu"], "time": "15:30-17:00", "pattern": "3x seminggu"}', 'ACTIVE')
    `);

    // Insert sample musyrif
    const [musyrifResult] = await connection.execute(`
      INSERT IGNORE INTO users (name, email, phone, role, halaqahId, status) VALUES
      ('Ustadz Ahmad Fauzi', 'ahmad.fauzi@tpq.com', '081234567890', 'MUSYRIF', 1, 'ACTIVE'),
      ('Ustadzah Siti Aminah', 'siti.aminah@tpq.com', '081234567891', 'MUSYRIF', 2, 'ACTIVE')
    `);

    // Insert sample santri
    const [santriResult] = await connection.execute(`
      INSERT IGNORE INTO santri (nis, name, gender, birthDate, phone, halaqahId, status) VALUES
      ('2024001', 'Muhammad Ali', 'MALE', '2010-05-15', '081234567892', 1, 'ACTIVE'),
      ('2024002', 'Fatimah Zahra', 'FEMALE', '2011-03-20', '081234567893', 1, 'ACTIVE'),
      ('2024003', 'Abdullah Rahman', 'MALE', '2010-08-10', '081234567894', 1, 'ACTIVE'),
      ('2024004', 'Umar Faruq', 'MALE', '2009-12-05', '081234567895', 2, 'ACTIVE'),
      ('2024005', 'Khadijah Binti Ahmad', 'FEMALE', '2010-07-25', '081234567896', 2, 'ACTIVE')
    `);

    // Insert sample hafalan
    const [hafalanResult] = await connection.execute(`
      INSERT IGNORE INTO hafalan (santriId, surah, ayahStart, ayahEnd, grade, notes) VALUES
      (1, 'Al-Fatiha', 1, 7, 85.0, 'Bacaan sudah lancar, perlu perbaikan tajwid'),
      (2, 'Al-Fatiha', 1, 7, 90.0, 'Sangat baik, lanjut ke surat berikutnya'),
      (3, 'Al-Fatiha', 1, 7, 78.0, 'Perlu latihan lebih untuk kelancaran'),
      (4, 'An-Nas', 1, 6, 88.0, 'Hafalan kuat, tajwid baik'),
      (5, 'An-Nas', 1, 6, 95.0, 'Excellent, siap untuk surat yang lebih panjang')
    `);

    // Insert sample assessments
    const [assessmentResult] = await connection.execute(`
      INSERT IGNORE INTO assessments (santriId, type, category, score, notes) VALUES
      (1, 'TAHSIN', 'Makhraj', 85.0, 'Makhraj huruf sudah baik'),
      (2, 'HAFALAN', 'Al-Fatiha', 92.0, 'Hafalan sangat lancar'),
      (3, 'AKHLAQ', 'Kedisiplinan', 80.0, 'Perlu peningkatan kedisiplinan'),
      (4, 'TAHSIN', 'Tajwid', 90.0, 'Penguasaan tajwid sangat baik'),
      (5, 'HAFALAN', 'An-Nas', 96.0, 'Hafalan sempurna dengan tajwid yang benar')
    `);

    return {
      halaqah: halaqahResult,
      musyrif: musyrifResult,
      santri: santriResult,
      hafalan: hafalanResult,
      assessments: assessmentResult,
    };
  } catch (error) {
    console.warn("⚠️ Could not insert sample data:", error);
    return null;
  }
}
