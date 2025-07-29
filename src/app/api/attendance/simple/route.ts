import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔄 Testing simple attendance query...");

    // Test basic database connection
    const count = await prisma.attendance.count();
    console.log("📊 Total attendance records:", count);

    // Get attendance data with minimal includes for export
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            nis: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: 1000, // Increase limit for export
    });

    console.log(
      "✅ Simple query successful:",
      attendanceRecords.length,
      "records",
    );

    return NextResponse.json({
      success: true,
      message: "Simple attendance query successful",
      data: {
        totalRecords: count,
        records: attendanceRecords,
      },
    });
  } catch (error) {
    console.error("❌ Simple attendance query failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Simple attendance query failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
