import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

interface SantriImportData {
  nis: string;
  name: string;
  birthDate: string;
  birthPlace: string;
  gender: "MALE" | "FEMALE";
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  waliId?: string;
  halaqahId?: string;
  enrollmentDate: string;
  status: "ACTIVE" | "INACTIVE";
  notes?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  duplicates: string[];
}

// POST /api/santri/import - Import santri from Excel
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    console.log("📥 Starting santri import process...");

    const formData = await request.formData();
    const dataString = formData.get("data") as string;

    if (!dataString) {
      return NextResponse.json(
        { success: false, message: "No data provided" },
        { status: 400 },
      );
    }

    const santriData: SantriImportData[] = JSON.parse(dataString);
    console.log(`📊 Processing ${santriData.length} santri records`);

    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      duplicates: [],
    };

    // Process each santri record
    for (let i = 0; i < santriData.length; i++) {
      const santri = santriData[i];
      const rowNumber = i + 1;

      try {
        // Check if NIS already exists
        const [existingRows] = await connection.execute(
          "SELECT id, nis FROM santri WHERE nis = ?",
          [santri.nis],
        );

        if ((existingRows as any[]).length > 0) {
          result.duplicates.push(
            `Baris ${rowNumber}: NIS ${santri.nis} sudah ada`,
          );
          result.skipped++;
          continue;
        }

        // Validate required fields
        if (
          !santri.nis ||
          !santri.name ||
          !santri.birthDate ||
          !santri.gender
        ) {
          result.errors.push(`Baris ${rowNumber}: Data tidak lengkap`);
          result.skipped++;
          continue;
        }

        // Generate ID
        const santriId = uuidv4();

        // Handle wali (parent) - create if not exists
        let waliId = santri.waliId;
        if (!waliId && santri.parentName) {
          waliId = await createOrGetWali(connection, {
            name: santri.parentName,
            phone: santri.parentPhone,
            email: santri.parentEmail,
          });
        }

        // Prepare santri data for insertion
        const insertData = {
          id: santriId,
          nis: santri.nis,
          name: santri.name,
          birthDate: new Date(santri.birthDate),
          birthPlace: santri.birthPlace || "",
          gender: santri.gender,
          address: santri.address || "",
          phone: santri.parentPhone, // Store parent phone in santri.phone
          email: santri.parentEmail || null, // Store parent email in santri.email
          waliId: waliId || null,
          halaqahId: santri.halaqahId || null,
          enrollmentDate: santri.enrollmentDate
            ? new Date(santri.enrollmentDate)
            : new Date(),
          status: santri.status || "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Insert santri
        await connection.execute(
          `INSERT INTO santri (
            id, nis, name, birthDate, birthPlace, gender, address,
            phone, email, waliId, halaqahId,
            enrollmentDate, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            insertData.id,
            insertData.nis,
            insertData.name,
            insertData.birthDate,
            insertData.birthPlace,
            insertData.gender,
            insertData.address,
            insertData.phone,
            insertData.email,
            insertData.waliId,
            insertData.halaqahId,
            insertData.enrollmentDate,
            insertData.status,
            insertData.createdAt,
            insertData.updatedAt,
          ],
        );

        result.imported++;
        console.log(`✅ Imported santri ${santri.nis} - ${santri.name}`);
      } catch (error) {
        console.error(`❌ Error importing santri ${santri.nis}:`, error);
        result.errors.push(
          `Baris ${rowNumber}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        result.skipped++;
      }
    }

    console.log(
      `📊 Import completed: ${result.imported} imported, ${result.skipped} skipped`,
    );

    return NextResponse.json({
      success: true,
      message: `Import selesai: ${result.imported} data berhasil diimport, ${result.skipped} data dilewati`,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
      duplicates: result.duplicates,
    });
  } catch (error) {
    console.error("❌ Error in santri import:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengimport data santri",
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

// Helper function to create or get wali
async function createOrGetWali(
  connection: mysql.Connection,
  waliData: { name: string; phone: string; email?: string },
): Promise<string> {
  try {
    // Check if wali already exists by phone
    const [existingWali] = await connection.execute(
      "SELECT id FROM users WHERE phone = ? AND role = 'WALI'",
      [waliData.phone],
    );

    if ((existingWali as any[]).length > 0) {
      return (existingWali as any[])[0].id;
    }

    // Create new wali
    const waliId = uuidv4();
    await connection.execute(
      `INSERT INTO users (
        id, name, email, phone, role, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, 'WALI', 'ACTIVE', ?, ?)`,
      [
        waliId,
        waliData.name,
        waliData.email || null,
        waliData.phone,
        new Date(),
        new Date(),
      ],
    );

    console.log(`✅ Created new wali: ${waliData.name}`);
    return waliId;
  } catch (error) {
    console.error("❌ Error creating wali:", error);
    throw error;
  }
}

// GET /api/santri/import - Get import template or status
export async function GET() {
  try {
    // Return template structure for reference
    const templateStructure = {
      columns: [
        {
          key: "NIS",
          required: true,
          type: "string",
          description: "Nomor Induk Santri (unik)",
        },
        {
          key: "Nama Lengkap",
          required: true,
          type: "string",
          description: "Nama lengkap santri",
        },
        {
          key: "Tanggal Lahir",
          required: true,
          type: "date",
          description: "Format: YYYY-MM-DD",
        },
        {
          key: "Tempat Lahir",
          required: false,
          type: "string",
          description: "Tempat lahir santri",
        },
        {
          key: "Jenis Kelamin",
          required: true,
          type: "enum",
          values: ["MALE", "FEMALE"],
          description: "MALE atau FEMALE",
        },
        {
          key: "Alamat",
          required: false,
          type: "string",
          description: "Alamat lengkap santri",
        },
        {
          key: "Nama Orang Tua",
          required: true,
          type: "string",
          description: "Nama orang tua/wali",
        },
        {
          key: "No. HP Orang Tua",
          required: true,
          type: "string",
          description: "Nomor HP orang tua",
        },
        {
          key: "Email Orang Tua",
          required: false,
          type: "email",
          description: "Email orang tua (opsional)",
        },
        {
          key: "Tanggal Masuk",
          required: false,
          type: "date",
          description: "Format: YYYY-MM-DD (default: hari ini)",
        },
        {
          key: "Status",
          required: false,
          type: "enum",
          values: ["ACTIVE", "INACTIVE"],
          description: "Default: ACTIVE",
        },
        {
          key: "Catatan",
          required: false,
          type: "string",
          description: "Catatan tambahan (opsional)",
        },
      ],
      example: {
        NIS: "STR001",
        "Nama Lengkap": "Ahmad Fauzi",
        "Tanggal Lahir": "2010-01-15",
        "Tempat Lahir": "Jakarta",
        "Jenis Kelamin": "MALE",
        Alamat: "Jl. Masjid No. 123, Jakarta",
        "Nama Orang Tua": "Budi Santoso",
        "No. HP Orang Tua": "081234567890",
        "Email Orang Tua": "budi@email.com",
        "Tanggal Masuk": "2024-01-15",
        Status: "ACTIVE",
        Catatan: "Santri baru",
      },
    };

    return NextResponse.json({
      success: true,
      message: "Template structure for santri import",
      template: templateStructure,
    });
  } catch (error) {
    console.error("❌ Error getting import template:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil template import",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
