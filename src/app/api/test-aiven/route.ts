import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔄 Testing Aiven MySQL connection...");

    // Test database connection
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");

    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 + 2 as three`;
    console.log("✅ Query executed successfully:", result);

    // Test version query
    const version = await prisma.$queryRaw`SELECT VERSION() as version`;
    console.log("✅ Version query successful:", version);

    // Test table existence
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log("✅ Tables found:", tables);

    // Test user table if exists
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      console.log("✅ User table accessible, count:", userCount);
    } catch (error) {
      console.log("ℹ️ User table not accessible or empty:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Aiven MySQL connection successful!",
      data: {
        connection: "✅ Connected",
        database: "Aiven MySQL",
        query_result: JSON.parse(JSON.stringify(result, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )),
        version: JSON.parse(JSON.stringify(version, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )),
        tables: JSON.parse(JSON.stringify(tables, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )),
        user_count: userCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Aiven connection error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Aiven MySQL connection failed",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });

  } finally {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected");
  }
}
