import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role to access database test
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only administrators can access database test." },
        { status: 403 }
      );
    }

    console.log("Testing database connection...");

    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database connection test result:", result);

    // Get database tables
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log("Database tables:", tables);

    // Check for behavior tables specifically
    const behaviorTables =
      await prisma.$queryRaw`SHOW TABLES LIKE '%behavior%'`;
    console.log("Behavior tables:", behaviorTables);

    // Check if behavior_records table exists
    let behaviorExists = false;
    let behaviorColumns = [];

    try {
      behaviorColumns = await prisma.$queryRaw`DESCRIBE behavior_records`;
      behaviorExists = true;
      console.log(
        "behavior_records table exists with columns:",
        behaviorColumns,
      );
    } catch (error) {
      console.error("Error checking behavior_records table:", error);
    }

    // Try to get behavior_records count
    let behaviorCount = 0;
    if (behaviorExists) {
      try {
        const countResult =
          await prisma.$queryRaw`SELECT COUNT(*) as total FROM behavior_records`;
        behaviorCount = (countResult as any[])[0]?.total || 0;
        console.log("behavior_records count:", behaviorCount);
      } catch (error) {
        console.error("Error counting behavior_records:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database connection test successful",
      databaseConnected: true,
      tables,
      behaviorTables,
      behavior_records: {
        exists: behaviorExists,
        columns: behaviorColumns,
        count: behaviorCount,
      },
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 },
    );
  }
}
