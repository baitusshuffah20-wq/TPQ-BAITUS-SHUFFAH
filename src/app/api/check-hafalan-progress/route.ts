import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/check-hafalan-progress - Check hafalan progress data
export async function GET(request: NextRequest) {
  try {
    console.log("Checking hafalan progress data...");

    // Check if the HafalanProgress model exists in Prisma client
    if (!prisma.hafalanProgress) {
      console.error("HafalanProgress model not found in Prisma client");
      return NextResponse.json({
        success: false,
        message: "HafalanProgress model not found in Prisma client",
        modelExists: false,
      });
    }

    // Count total records
    console.log("Counting records...");
    const count = await prisma.hafalanProgress.count();
    console.log(`Found ${count} records`);

    // Get a sample of records (up to 10)
    console.log("Fetching records...");
    const records = await prisma.hafalanProgress.findMany({
      take: 10,
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
          },
        },
      },
    });
    console.log(`Fetched ${records.length} records`);

    return NextResponse.json({
      success: true,
      count,
      records,
      modelExists: true,
    });
  } catch (error) {
    console.error("Error checking hafalan progress:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check hafalan progress data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
