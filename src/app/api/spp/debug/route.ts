import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Debug endpoint untuk SPP
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 SPP Debug - Starting...");

    // Test 1: Check database connection
    console.log("1️⃣ Testing database connection...");
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection OK");

    // Test 2: Count all SPP records
    console.log("2️⃣ Counting SPP records...");
    const totalSPPRecords = await prisma.sPPRecord.count();
    console.log(`📊 Total SPP records: ${totalSPPRecords}`);

    // Test 3: Get recent SPP records
    console.log("3️⃣ Getting recent SPP records...");
    const recentRecords = await prisma.sPPRecord.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            nis: true,
          },
        },
        sppSetting: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
      },
    });
    console.log(`📋 Found ${recentRecords.length} recent records`);

    // Test 4: Check SPP settings
    console.log("4️⃣ Checking SPP settings...");
    const sppSettings = await prisma.sPPSetting.findMany({
      where: { isActive: true },
    });
    console.log(`⚙️ Active SPP settings: ${sppSettings.length}`);

    // Test 5: Check santri
    console.log("5️⃣ Checking santri...");
    const santriCount = await prisma.santri.count();
    console.log(`👥 Total santri: ${santriCount}`);

    return NextResponse.json({
      success: true,
      message: "SPP Debug completed",
      data: {
        databaseConnection: "OK",
        totalSPPRecords,
        recentRecordsCount: recentRecords.length,
        recentRecords: recentRecords.map((record) => ({
          id: record.id,
          santri: record.santri?.name || "Unknown",
          nis: record.santri?.nis || "Unknown",
          month: record.month,
          year: record.year,
          amount: record.amount,
          status: record.status,
          createdAt: record.createdAt,
        })),
        sppSettingsCount: sppSettings.length,
        santriCount,
      },
    });
  } catch (error) {
    console.error("❌ SPP Debug failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST endpoint untuk test create SPP record
export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing SPP record creation...");

    const body = await request.json();
    console.log("📝 Received test data:", JSON.stringify(body, null, 2));

    // Get first santri and SPP setting for test
    const santri = await prisma.santri.findFirst();
    const sppSetting = await prisma.sPPSetting.findFirst({
      where: { isActive: true },
    });

    if (!santri || !sppSetting) {
      return NextResponse.json(
        {
          success: false,
          error: "No santri or SPP setting found for test",
        },
        { status: 400 },
      );
    }

    // Create test SPP record
    const testRecord = await prisma.sPPRecord.create({
      data: {
        santriId: santri.id,
        sppSettingId: sppSetting.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: sppSetting.amount,
        dueDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          10,
        ),
        status: "PENDING",
        paidAmount: 0,
        discount: 0,
        fine: 0,
      },
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            nis: true,
          },
        },
        sppSetting: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
      },
    });

    console.log("✅ Test SPP record created:", testRecord.id);

    return NextResponse.json({
      success: true,
      message: "Test SPP record created successfully",
      data: {
        testRecord,
        santri: santri.name,
        sppSetting: sppSetting.name,
      },
    });
  } catch (error) {
    console.error("❌ Test SPP creation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test creation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
