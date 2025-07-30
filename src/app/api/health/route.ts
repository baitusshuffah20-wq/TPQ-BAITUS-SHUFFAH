import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Basic health check
    const startTime = Date.now();

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    // Test other services
    const checks = [];
    let totalServices = 0;
    let healthyServices = 0;
    let degradedServices = 0;
    let unhealthyServices = 0;

    // Database check
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.push({
        service: "database",
        status: "healthy",
        responseTime: dbResponseTime,
        details: {
          connected: true,
          type: "SQLite/MySQL",
        },
      });
      healthyServices++;
    } catch (error) {
      checks.push({
        service: "database",
        status: "unhealthy",
        responseTime: dbResponseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      unhealthyServices++;
    }
    totalServices++;

    // Environment check
    const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET"];
    const missingEnvVars = requiredEnvVars.filter((env) => !process.env[env]);

    if (missingEnvVars.length === 0) {
      checks.push({
        service: "environment",
        status: "healthy",
        responseTime: 0,
        details: {
          nodeEnv: process.env.NODE_ENV,
          requiredVars: "all present",
        },
      });
      healthyServices++;
    } else {
      checks.push({
        service: "environment",
        status: "degraded",
        responseTime: 0,
        details: {
          nodeEnv: process.env.NODE_ENV,
          missingVars: missingEnvVars,
        },
      });
      degradedServices++;
    }
    totalServices++;

    // Memory check
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent < 80) {
      checks.push({
        service: "memory",
        status: "healthy",
        responseTime: 0,
        details: {
          usage: `${Math.round(memoryUsagePercent)}%`,
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      });
      healthyServices++;
    } else {
      checks.push({
        service: "memory",
        status: "degraded",
        responseTime: 0,
        details: {
          usage: `${Math.round(memoryUsagePercent)}%`,
          warning: "High memory usage",
        },
      });
      degradedServices++;
    }
    totalServices++;

    // Overall status
    let overallStatus = "healthy";
    if (unhealthyServices > 0) {
      overallStatus = "unhealthy";
    } else if (degradedServices > 0) {
      overallStatus = "degraded";
    }

    // Get system info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        external: memoryUsage.external,
      },
    };

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: dbResponseTime,
      version: process.version,
      environment: process.env.NODE_ENV || "development",
      system: systemInfo,
      services: {
        total: totalServices,
        healthy: healthyServices,
        degraded: degradedServices,
        unhealthy: unhealthyServices,
      },
      checks: checks,
      success: true,
      message: "System health check completed",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: 0,
        version: process.version,
        environment: process.env.NODE_ENV || "development",
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          uptime: process.uptime(),
          memory: {
            used: 0,
            total: 0,
            external: 0,
          },
        },
        services: {
          total: 1,
          healthy: 0,
          degraded: 0,
          unhealthy: 1,
        },
        checks: [
          {
            service: "system",
            status: "unhealthy",
            responseTime: 0,
            error: error instanceof Error ? error.message : String(error),
          },
        ],
        success: false,
        message: "System health check failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}
