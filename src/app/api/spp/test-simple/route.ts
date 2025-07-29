import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple test endpoint
export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Simple SPP test starting...");

    // Test 1: Database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection OK");

    // Test 2: Count records
    const sppRecordCount = await prisma.sPPRecord.count();
    const sppSettingCount = await prisma.sPPSetting.count();
    const santriCount = await prisma.santri.count();

    console.log(
      `📊 Records: SPP=${sppRecordCount}, Settings=${sppSettingCount}, Santri=${santriCount}`,
    );

    return NextResponse.json({
      success: true,
      message: "Simple test completed",
      data: {
        sppRecordCount,
        sppSettingCount,
        santriCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Simple test failed:", error);
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

// Simple POST test
export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Simple POST test starting...");

    const body = await request.json();
    console.log("📝 Received:", JSON.stringify(body, null, 2));

    return NextResponse.json({
      success: true,
      message: "POST test successful",
      received: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ POST test failed:", error);
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
