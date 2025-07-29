import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface MonthData {
  month: number;
  year: number;
  dueDate: string;
}

interface BulkGenerateData {
  sppSettingId: string;
  santriIds: string[];
  months: MonthData[];
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting SPP bulk generation API...");
    console.log(
      "📡 Request headers:",
      Object.fromEntries(request.headers.entries()),
    );

    let body: BulkGenerateData;
    try {
      const requestText = await request.text();
      console.log("📄 Raw request body:", requestText);

      if (!requestText) {
        console.error("❌ Empty request body");
        return NextResponse.json(
          {
            success: false,
            message: "Request body is empty",
            error: "EMPTY_BODY",
          },
          { status: 400 },
        );
      }

      body = JSON.parse(requestText);
      console.log("📝 Parsed request body:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
          error: "PARSE_ERROR",
        },
        { status: 400 },
      );
    }

    const { sppSettingId, santriIds, months } = body;

    // Enhanced validation
    console.log("🔍 Validating request data...");
    console.log("- sppSettingId:", sppSettingId);
    console.log("- santriIds:", santriIds);
    console.log("- months:", months);

    if (!sppSettingId || !santriIds || !months) {
      console.error("❌ Missing required fields:", {
        sppSettingId: !!sppSettingId,
        santriIds: !!santriIds,
        months: !!months,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap",
          error: "MISSING_FIELDS",
          details: {
            sppSettingId: !!sppSettingId,
            santriIds: !!santriIds,
            months: !!months,
          },
        },
        { status: 400 },
      );
    }

    // Validate arrays
    if (!Array.isArray(santriIds) || santriIds.length === 0) {
      console.error("❌ Invalid santriIds:", santriIds);
      return NextResponse.json(
        {
          success: false,
          message: "Minimal pilih 1 santri",
          error: "INVALID_SANTRI_IDS",
          details: {
            santriIds,
            isArray: Array.isArray(santriIds),
            length: santriIds?.length,
          },
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(months) || months.length === 0) {
      console.error("❌ Invalid months:", months);
      return NextResponse.json(
        {
          success: false,
          message: "Minimal pilih 1 bulan",
          error: "INVALID_MONTHS",
          details: {
            months,
            isArray: Array.isArray(months),
            length: months?.length,
          },
        },
        { status: 400 },
      );
    }

    // Validate month data structure
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      if (!month.month || !month.year || !month.dueDate) {
        console.error(`❌ Invalid month data at index ${i}:`, month);
        return NextResponse.json(
          {
            success: false,
            message: `Data bulan ke-${i + 1} tidak valid`,
            error: "INVALID_MONTH_DATA",
            details: { index: i, month },
          },
          { status: 400 },
        );
      }

      if (month.month < 1 || month.month > 12) {
        console.error(`❌ Invalid month number at index ${i}:`, month.month);
        return NextResponse.json(
          {
            success: false,
            message: `Bulan ke-${i + 1} tidak valid (harus 1-12)`,
            error: "INVALID_MONTH_NUMBER",
            details: { index: i, month: month.month },
          },
          { status: 400 },
        );
      }
    }

    // Validate SPP setting exists and is active
    console.log("🔍 Validating SPP setting:", sppSettingId);
    let sppSetting;
    try {
      sppSetting = await prisma.sPPSetting.findUnique({
        where: { id: sppSettingId },
      });
    } catch (dbError) {
      console.error("❌ Database error finding SPP setting:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: "Error accessing database",
          error: "DATABASE_ERROR",
          details:
            dbError instanceof Error
              ? dbError.message
              : "Unknown database error",
        },
        { status: 500 },
      );
    }

    if (!sppSetting || !sppSetting.isActive) {
      console.error("❌ SPP setting not found or inactive:", {
        sppSettingId,
        found: !!sppSetting,
        active: sppSetting?.isActive,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Pengaturan SPP tidak valid atau tidak aktif",
          error: "SPP_SETTING_INVALID",
          details: {
            sppSettingId,
            found: !!sppSetting,
            active: sppSetting?.isActive,
          },
        },
        { status: 400 },
      );
    }

    console.log("✅ SPP setting validated:", sppSetting.name);

    // Validate all santri exist
    const santriList = await prisma.santri.findMany({
      where: {
        id: {
          in: santriIds,
        },
      },
      select: {
        id: true,
        nis: true,
        name: true,
      },
    });

    if (santriList.length !== santriIds.length) {
      const foundIds = santriList.map((s) => s.id);
      const missingIds = santriIds.filter((id) => !foundIds.includes(id));
      console.error("❌ Some santri not found:", {
        requested: santriIds.length,
        found: santriList.length,
        missing: missingIds,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Beberapa santri tidak ditemukan",
          error: "SANTRI_NOT_FOUND",
          details: {
            requested: santriIds.length,
            found: santriList.length,
            missingIds,
          },
        },
        { status: 400 },
      );
    }

    console.log("✅ All santri validated:", santriList.length, "santri found");

    // Check for existing SPP records to avoid duplicates
    const existingSPPRecords = await prisma.sPPRecord.findMany({
      where: {
        santriId: {
          in: santriIds,
        },
        sppSettingId: sppSettingId,
        OR: months.map((month) => ({
          month: month.month,
          year: month.year,
        })),
      },
      select: {
        santriId: true,
        month: true,
        year: true,
        santri: {
          select: {
            name: true,
            nis: true,
          },
        },
      },
    });

    if (existingSPPRecords.length > 0) {
      const duplicateInfo = existingSPPRecords
        .map(
          (record) =>
            `${record.santri.name} (${record.santri.nis}) - ${getMonthName(record.month)} ${record.year}`,
        )
        .join(", ");

      return NextResponse.json(
        {
          success: false,
          message: `SPP sudah ada untuk: ${duplicateInfo}`,
          duplicates: existingSPPRecords,
        },
        { status: 400 },
      );
    }

    // Generate SPP records
    console.log("📋 Generating SPP records...");
    const sppRecordsToCreate = [];

    for (const santriId of santriIds) {
      for (const monthData of months) {
        sppRecordsToCreate.push({
          santriId: santriId,
          sppSettingId: sppSettingId,
          month: monthData.month,
          year: monthData.year,
          amount: sppSetting.amount,
          paidAmount: 0,
          status: "PENDING" as const,
          dueDate: new Date(monthData.dueDate),
          discount: 0,
          fine: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    console.log(`📊 Total SPP records to create: ${sppRecordsToCreate.length}`);
    console.log(
      "📝 Sample record:",
      JSON.stringify(sppRecordsToCreate[0], null, 2),
    );

    // Create SPP records in batch
    console.log("💾 Creating SPP records in database...");
    let createdSPPRecords;
    try {
      createdSPPRecords = await prisma.sPPRecord.createMany({
        data: sppRecordsToCreate,
        skipDuplicates: true,
      });
      console.log(`✅ Created ${createdSPPRecords.count} SPP records`);

      // Check if any records were actually created
      if (createdSPPRecords.count === 0) {
        console.warn(
          "⚠️ No SPP records were created - possibly all duplicates",
        );
        return NextResponse.json(
          {
            success: false,
            message:
              "Tidak ada SPP yang dibuat. Kemungkinan semua data sudah ada.",
            error: "NO_RECORDS_CREATED",
            details: {
              requestedRecords: sppRecordsToCreate.length,
              createdRecords: 0,
              reason:
                "All records may already exist or were skipped due to duplicates",
            },
          },
          { status: 400 },
        );
      }
    } catch (createError) {
      console.error("❌ Database error creating SPP records:", createError);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal menyimpan data SPP ke database",
          error: "CREATE_ERROR",
          details:
            createError instanceof Error
              ? createError.message
              : "Unknown create error",
        },
        { status: 500 },
      );
    }

    // Get created records with relations for response
    const createdRecordsWithDetails = await prisma.sPPRecord.findMany({
      where: {
        santriId: {
          in: santriIds,
        },
        sppSettingId: sppSettingId,
        OR: months.map((month) => ({
          month: month.month,
          year: month.year,
        })),
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
          },
        },
        sppSetting: {
          select: {
            id: true,
            name: true,
            amount: true,
            level: true,
          },
        },
      },
      orderBy: [{ year: "asc" }, { month: "asc" }, { santri: { name: "asc" } }],
    });

    // Calculate summary
    const totalAmount = createdSPPRecords.count * sppSetting.amount;
    const summary = {
      totalRecords: createdSPPRecords.count,
      totalSantri: santriIds.length,
      totalMonths: months.length,
      totalAmount: totalAmount,
      sppSetting: {
        name: sppSetting.name,
        amount: sppSetting.amount,
        level: sppSetting.level,
      },
      periods: months.map((month) => ({
        month: getMonthName(month.month),
        year: month.year,
        dueDate: month.dueDate,
      })),
    };

    console.log("✅ SPP bulk generation completed successfully");
    console.log(
      `📊 Final summary: ${createdSPPRecords.count} records created for ${santriIds.length} santri across ${months.length} months`,
    );

    const response = {
      success: true,
      message: `Berhasil membuat ${createdSPPRecords.count} SPP untuk ${santriIds.length} santri`,
      count: createdSPPRecords.count,
      summary: summary,
      records: createdRecordsWithDetails,
    };

    console.log("📋 Final response:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error bulk generating SPP:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat SPP massal" },
      { status: 500 },
    );
  }
}

// Helper function to get month name
function getMonthName(month: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1];
}

// GET /api/spp/bulk-generate - Get bulk generate preview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sppSettingId = searchParams.get("sppSettingId");
    const santriIds = searchParams.get("santriIds")?.split(",") || [];
    const months = searchParams.get("months")?.split(",") || [];

    if (!sppSettingId || santriIds.length === 0 || months.length === 0) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap" },
        { status: 400 },
      );
    }

    // Get SPP setting
    const sppSetting = await prisma.sPPSetting.findUnique({
      where: { id: sppSettingId },
    });

    if (!sppSetting) {
      return NextResponse.json(
        { success: false, message: "Pengaturan SPP tidak ditemukan" },
        { status: 404 },
      );
    }

    // Get santri details
    const santriList = await prisma.santri.findMany({
      where: {
        id: {
          in: santriIds,
        },
      },
      select: {
        id: true,
        nis: true,
        name: true,
      },
    });

    // Parse months (format: "month:year")
    const monthsData = months.map((monthStr) => {
      const [month, year] = monthStr.split(":");
      return {
        month: parseInt(month),
        year: parseInt(year),
        monthName: getMonthName(parseInt(month)),
      };
    });

    // Calculate preview
    const totalRecords = santriList.length * monthsData.length;
    const totalAmount = totalRecords * sppSetting.amount;

    const preview = {
      sppSetting: {
        name: sppSetting.name,
        amount: sppSetting.amount,
        level: sppSetting.level,
      },
      santri: santriList,
      periods: monthsData,
      summary: {
        totalSantri: santriList.length,
        totalMonths: monthsData.length,
        totalRecords: totalRecords,
        totalAmount: totalAmount,
      },
    };

    return NextResponse.json({
      success: true,
      preview: preview,
    });
  } catch (error) {
    console.error("Error getting bulk generate preview:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat preview" },
      { status: 500 },
    );
  }
}
