import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Test endpoint untuk debug SPP bulk generate
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing SPP bulk generate dependencies...");

    // Test 1: Check if we can connect to database
    console.log("1️⃣ Testing database connection...");
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection OK");

    // Test 2: Check SPP settings
    console.log("2️⃣ Testing SPP settings...");
    const sppSettings = await prisma.sPPSetting.findMany({
      where: { isActive: true },
    });
    console.log(`✅ Found ${sppSettings.length} active SPP settings`);

    // Test 3: Check santri data
    console.log("3️⃣ Testing santri data...");
    const santriCount = await prisma.santri.count();
    console.log(`✅ Found ${santriCount} santri`);

    // Test 4: Check existing SPP records
    console.log("4️⃣ Testing existing SPP records...");
    const sppRecordCount = await prisma.sPPRecord.count();
    console.log(`✅ Found ${sppRecordCount} existing SPP records`);

    // Test 4.1: Get recent SPP records
    const recentSPPRecords = await prisma.sPPRecord.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        santri: {
          select: { name: true, nis: true },
        },
        sppSetting: {
          select: { name: true, amount: true },
        },
      },
    });
    console.log(`📋 Recent SPP records:`, recentSPPRecords);

    // Test 5: Sample data for bulk generate
    const sampleSantri = await prisma.santri.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        nis: true,
      },
    });

    const testData = {
      sppSettingId: sppSettings[0]?.id || "no-settings",
      santriIds: sampleSantri.map((s) => s.id),
      months: [
        {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          dueDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            10,
          ).toISOString(),
        },
      ],
    };

    return NextResponse.json({
      success: true,
      message: "SPP bulk generate test completed",
      data: {
        databaseConnection: "OK",
        sppSettingsCount: sppSettings.length,
        santriCount,
        sppRecordCount,
        sampleSPPSettings: sppSettings.slice(0, 2),
        sampleSantri,
        recentSPPRecords,
        testData,
      },
    });
  } catch (error) {
    console.error("❌ SPP bulk generate test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Test POST endpoint
export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing SPP bulk generate POST...");

    const body = await request.json();
    console.log("📝 Received test data:", JSON.stringify(body, null, 2));

    // Validate the structure
    const { sppSettingId, santriIds, months } = body;

    const validation = {
      hasSppSettingId: !!sppSettingId,
      hasSantriIds: Array.isArray(santriIds) && santriIds.length > 0,
      hasMonths: Array.isArray(months) && months.length > 0,
      monthsStructure: months?.map((m: any) => ({
        hasMonth: typeof m.month === "number",
        hasYear: typeof m.year === "number",
        hasDueDate: !!m.dueDate,
      })),
    };

    // Check if SPP setting exists
    let sppSetting = null;
    if (sppSettingId) {
      sppSetting = await prisma.sPPSetting.findUnique({
        where: { id: sppSettingId },
      });
    }

    // Check if santri exist
    let existingSantri = [];
    if (santriIds && Array.isArray(santriIds)) {
      existingSantri = await prisma.santri.findMany({
        where: { id: { in: santriIds } },
        select: { id: true, name: true, nis: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: "SPP bulk generate POST test completed",
      validation,
      data: {
        sppSetting,
        existingSantri,
        santriIdsFound: existingSantri.length,
        santriIdsRequested: santriIds?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ SPP bulk generate POST test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "POST test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
