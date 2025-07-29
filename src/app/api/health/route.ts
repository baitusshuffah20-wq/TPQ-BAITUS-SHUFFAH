import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Basic health check
    const startTime = Date.now();

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const dbResponseTime = Date.now() - startTime;

    // Get system info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    // Test environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      success: true,
      status: "healthy",
      message: "System is operational",
      data: {
        database: {
          connected: true,
          responseTime: `${dbResponseTime}ms`,
        },
        system: systemInfo,
        environment: envCheck,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        message: "System health check failed",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
