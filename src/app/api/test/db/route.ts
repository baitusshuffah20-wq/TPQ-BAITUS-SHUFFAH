import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleDatabaseError } from "@/lib/errorHandler";

export async function GET() {
  let mysqlConnection;
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

    console.log("🔄 Starting comprehensive database test...");

    // Test database connection
    await prisma.$connect();

    // Test basic queries
    const tests = {
      connection: true,
      timestamp: new Date().toISOString(),
      prisma: {} as Record<string, unknown>,
      mysql: {} as Record<string, unknown>,
      tables: {} as Record<string, unknown>,
      summary: {} as Record<string, unknown>,
    };

    // Test MySQL direct connection
    try {
      mysqlConnection = await mysql.createConnection(dbConfig);
      const [result] = await mysqlConnection.execute(
        "SELECT VERSION() as version",
      );
      tests.mysql = {
        status: "connected",
        type: "MySQL Direct",
        version: (result as any[])[0]?.version || "unknown",
      };
    } catch (error) {
      tests.mysql = { status: "failed", error: String(error) };
    }

    // Test each table
    try {
      const userCount = await prisma.user.count();
      tests.tables.users = { count: userCount, status: "ok" };
    } catch (error) {
      tests.tables.users = { error: String(error), status: "error" };
    }

    try {
      const santriCount = await prisma.santri.count();
      tests.tables.santri = { count: santriCount, status: "ok" };
    } catch (error) {
      tests.tables.santri = { error: String(error), status: "error" };
    }

    try {
      const halaqahCount = await prisma.halaqah.count();
      tests.tables.halaqah = { count: halaqahCount, status: "ok" };
    } catch (error) {
      tests.tables.halaqah = { error: String(error), status: "error" };
    }

    try {
      const hafalanCount = await prisma.hafalan.count();
      tests.tables.hafalan = { count: hafalanCount, status: "ok" };
    } catch (error) {
      tests.tables.hafalan = { error: String(error), status: "error" };
    }

    try {
      const attendanceCount = await prisma.attendance.count();
      tests.tables.attendance = { count: attendanceCount, status: "ok" };
    } catch (error) {
      tests.tables.attendance = { error: String(error), status: "error" };
    }

    try {
      const paymentCount = await prisma.payment.count();
      tests.tables.payments = { count: paymentCount, status: "ok" };
    } catch (error) {
      tests.tables.payments = { error: String(error), status: "error" };
    }

    // Test behavior_records table (MySQL only)
    if (mysqlConnection) {
      try {
        const [behaviorResult] = await mysqlConnection.execute(
          "SELECT COUNT(*) as count FROM behavior_records",
        );
        const behaviorCount = (behaviorResult as any[])[0]?.count || 0;
        tests.tables.behavior_records = {
          count: behaviorCount,
          status: "ok",
          type: "MySQL",
        };
      } catch (error) {
        tests.tables.behavior_records = {
          error: String(error),
          status: "error",
        };
      }
    }

    // Test a simple query with relations
    try {
      const sampleData = await prisma.santri.findFirst({
        include: {
          wali: {
            select: { id: true, name: true, email: true },
          },
          halaqah: {
            select: { id: true, name: true, level: true },
          },
        },
      });
      tests.tables.relations = {
        sample: sampleData ? "found" : "empty",
        status: "ok",
      };
    } catch (error) {
      tests.tables.relations = { error: String(error), status: "error" };
    }

    // Generate summary
    const tableCount = Object.keys(tests.tables).length;
    const successfulTables = Object.values(tests.tables).filter(
      (table: any) => table.status === "ok",
    ).length;
    const totalRecords = Object.values(tests.tables).reduce(
      (sum: number, table: any) => {
        return sum + (typeof table.count === "number" ? table.count : 0);
      },
      0,
    );

    tests.summary = {
      totalTables: tableCount,
      successfulTables,
      failedTables: tableCount - successfulTables,
      totalRecords,
      healthStatus:
        successfulTables === tableCount ? "HEALTHY" : "ISSUES_DETECTED",
      mysqlStatus: tests.mysql.status,
      prismaStatus: "connected",
    };

    console.log("✅ Database test completed:", tests.summary);

    return NextResponse.json({
      success: true,
      message: "Database connection test completed",
      data: tests,
    });
  } catch (error) {
    console.error("Database test error:", error);
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: dbError.message,
        details: dbError.details,
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log("🔌 MySQL connection closed");
    }
  }
}
