import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

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
        const existingSantri = await prisma.santri.findUnique({
          where: { nis: santri.nis },
          select: { id: true, nis: true }
        });

        if (existingSantri) {
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
          waliId = await createOrGetWali({
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

        // Insert santri using Prisma
        await prisma.santri.create({
          data: {
            id: insertData.id,
            nis: insertData.nis,
            name: insertData.name,
            birthDate: insertData.birthDate,
            birthPlace: insertData.birthPlace,
            gender: insertData.gender,
            address: insertData.address,
            phone: insertData.phone,
            email: insertData.email,
            waliId: insertData.waliId,
            halaqahId: insertData.halaqahId,
            enrollmentDate: insertData.enrollmentDate,
            status: insertData.status,
          }
        });

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
  }
}

// Helper function to create or get wali
async function createOrGetWali(
  waliData: { name: string; phone: string; email?: string },
): Promise<string> {
  try {
    // Check if wali already exists by phone
    const existingWali = await prisma.user.findFirst({
      where: {
        phone: waliData.phone,
        role: 'WALI'
      },
      select: { id: true }
    });

    if (existingWali) {
      return existingWali.id;
    }

    // Create new wali
    const waliId = uuidv4();
    await prisma.user.create({
      data: {
        id: waliId,
        name: waliData.name,
        email: waliData.email || null,
        phone: waliData.phone,
        role: 'WALI',
        status: 'ACTIVE',
      }
    });

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
