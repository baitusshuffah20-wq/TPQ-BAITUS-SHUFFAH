import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

export async function POST(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Create musyrif_attendance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`musyrif_attendance\` (
        \`id\` varchar(191) NOT NULL,
        \`date\` datetime(3) NOT NULL,
        \`status\` varchar(191) NOT NULL COMMENT 'PRESENT, ABSENT, LATE',
        \`checkInTime\` datetime(3) DEFAULT NULL,
        \`checkOutTime\` datetime(3) DEFAULT NULL,
        \`notes\` varchar(191) DEFAULT NULL,
        \`sessionType\` varchar(191) NOT NULL DEFAULT 'REGULAR' COMMENT 'REGULAR, EXTRA, MAKEUP',
        \`qrCodeUsed\` varchar(191) DEFAULT NULL COMMENT 'QR code that was scanned',
        \`latitude\` double DEFAULT NULL,
        \`longitude\` double DEFAULT NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT current_timestamp(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
        \`musyrifId\` varchar(191) NOT NULL,
        \`halaqahId\` varchar(191) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`musyrif_attendance_musyrifId_halaqahId_date_key\` (\`musyrifId\`,\`halaqahId\`,\`date\`),
        KEY \`musyrif_attendance_halaqahId_idx\` (\`halaqahId\`),
        KEY \`musyrif_attendance_musyrifId_idx\` (\`musyrifId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create qr_code_sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`qr_code_sessions\` (
        \`id\` varchar(191) NOT NULL,
        \`halaqahId\` varchar(191) NOT NULL,
        \`sessionDate\` datetime(3) NOT NULL,
        \`sessionType\` varchar(191) NOT NULL DEFAULT 'REGULAR',
        \`qrCode\` varchar(191) NOT NULL,
        \`isActive\` tinyint(1) NOT NULL DEFAULT 1,
        \`expiresAt\` datetime(3) NOT NULL,
        \`createdBy\` varchar(191) NOT NULL,
        \`usageCount\` int NOT NULL DEFAULT 0,
        \`maxUsage\` int NOT NULL DEFAULT 1,
        \`createdAt\` datetime(3) NOT NULL DEFAULT current_timestamp(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`qr_code_sessions_qrCode_key\` (\`qrCode\`),
        KEY \`qr_code_sessions_halaqahId_idx\` (\`halaqahId\`),
        KEY \`qr_code_sessions_qrCode_idx\` (\`qrCode\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create salary_settings table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`salary_settings\` (
        \`id\` varchar(191) NOT NULL,
        \`position\` varchar(191) NOT NULL,
        \`salary_type\` varchar(191) NOT NULL DEFAULT 'MONTHLY',
        \`base_amount\` decimal(10,2) NOT NULL DEFAULT 0.00,
        \`overtime_rate\` decimal(3,2) NOT NULL DEFAULT 1.00,
        \`allowances\` json DEFAULT NULL,
        \`deductions\` json DEFAULT NULL,
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`created_at\` datetime(3) NOT NULL DEFAULT current_timestamp(3),
        \`updated_at\` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
        PRIMARY KEY (\`id\`),
        KEY \`salary_settings_position_idx\` (\`position\`),
        KEY \`salary_settings_is_active_idx\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Insert sample salary settings for MUSYRIF if not exists
    await connection.execute(`
      INSERT IGNORE INTO \`salary_settings\` (
        \`id\`, \`position\`, \`salary_type\`, \`base_amount\`, \`overtime_rate\`,
        \`allowances\`, \`deductions\`, \`is_active\`, \`created_at\`, \`updated_at\`
      ) VALUES (
        'musyrif_salary_001',
        'MUSYRIF',
        'PER_SESSION',
        50000.00,
        1.5,
        '{"transport": 10000, "meal": 15000}',
        '{"tax": 0, "insurance": 0}',
        1,
        NOW(),
        NOW()
      )
    `);

    // Create indexes for better performance
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS \`idx_musyrif_attendance_date\` ON \`musyrif_attendance\` (\`date\`)
    `);
    
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS \`idx_musyrif_attendance_status\` ON \`musyrif_attendance\` (\`status\`)
    `);
    
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS \`idx_qr_sessions_active\` ON \`qr_code_sessions\` (\`isActive\`, \`expiresAt\`)
    `);
    
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS \`idx_qr_sessions_date\` ON \`qr_code_sessions\` (\`sessionDate\`)
    `);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Tabel attendance berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating attendance tables:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat tabel attendance",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Check if tables exist
    const [musyrifAttendanceExists] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'db_tpq' AND table_name = 'musyrif_attendance'
    `);

    const [qrSessionsExists] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'db_tpq' AND table_name = 'qr_code_sessions'
    `);

    const [salarySettingsTableExists] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'db_tpq' AND table_name = 'salary_settings'
    `);

    let salarySettingsExists = [{ count: 0 }];
    if ((salarySettingsTableExists as any[])[0].count > 0) {
      salarySettingsExists = await connection.execute(`
        SELECT COUNT(*) as count
        FROM salary_settings
        WHERE position = 'MUSYRIF' AND is_active = 1
      `) as any[];
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      tables: {
        musyrif_attendance: (musyrifAttendanceExists as any[])[0].count > 0,
        qr_code_sessions: (qrSessionsExists as any[])[0].count > 0,
        salary_settings_musyrif: (salarySettingsExists as any[])[0].count > 0,
      },
      message: "Status tabel berhasil diperiksa",
    });
  } catch (error) {
    console.error("Error checking tables:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memeriksa status tabel",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
