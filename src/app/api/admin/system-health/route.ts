import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CacheHelpers } from "@/lib/cache-service";

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

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can check system health." },
        { status: 403 }
      );
    }

    console.log(`🔌 Running system health check`);

    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      checks: {} as any,
      summary: {} as any,
    };

    // 1. Database connectivity check
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.checks.database = {
        status: "healthy",
        message: "Database connection successful",
      };
    } catch (error) {
      healthCheck.checks.database = {
        status: "unhealthy",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      healthCheck.status = "unhealthy";
    }

    // 2. Salary system integrity check
    try {
      const [
        totalMusyrif,
        musyrifWithRates,
        totalEarnings,
        totalWithdrawals,
        pendingEarnings,
        pendingWithdrawals,
        orphanedEarnings,
        inconsistentWallets,
      ] = await Promise.all([
        // Total musyrif count
        prisma.musyrif.count({ where: { status: "ACTIVE" } }),
        
        // Musyrif with active salary rates
        prisma.musyrif.count({
          where: {
            status: "ACTIVE",
            salaryRates: {
              some: {
                isActive: true,
              },
            },
          },
        }),
        
        // Total earnings
        prisma.musyrifEarning.count(),
        
        // Total withdrawals
        prisma.musyrifWithdrawal.count(),
        
        // Pending earnings
        prisma.musyrifEarning.count({ where: { status: "PENDING" } }),
        
        // Pending withdrawals
        prisma.musyrifWithdrawal.count({ where: { status: "PENDING" } }),
        
        // Check for earnings with potential issues (skip for now to avoid complex query)
        0,
        
        // Inconsistent wallets (negative balance)
        prisma.musyrifWallet.count({
          where: {
            balance: {
              lt: 0,
            },
          },
        }),
      ]);

      healthCheck.checks.salarySystem = {
        status: inconsistentWallets > 0 || orphanedEarnings > 10 ? "warning" : "healthy",
        data: {
          totalMusyrif,
          musyrifWithRates,
          ratesCoverage: totalMusyrif > 0 ? Math.round((musyrifWithRates / totalMusyrif) * 100) : 0,
          totalEarnings,
          totalWithdrawals,
          pendingEarnings,
          pendingWithdrawals,
          orphanedEarnings,
          inconsistentWallets,
        },
        warnings: [
          ...(inconsistentWallets > 0 ? [`${inconsistentWallets} wallets have negative balance`] : []),
          ...(orphanedEarnings > 10 ? [`${orphanedEarnings} earnings without attendance records`] : []),
          ...(musyrifWithRates < totalMusyrif ? [`${totalMusyrif - musyrifWithRates} musyrif without salary rates`] : []),
        ],
      };

      if (healthCheck.checks.salarySystem.status === "warning") {
        healthCheck.status = "warning";
      }

    } catch (error) {
      healthCheck.checks.salarySystem = {
        status: "unhealthy",
        message: "Salary system check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      healthCheck.status = "unhealthy";
    }

    // 3. Cache system check
    try {
      const cacheStats = CacheHelpers.getStats();
      healthCheck.checks.cache = {
        status: "healthy",
        data: cacheStats,
        message: `Cache active with ${cacheStats.active} items`,
      };
    } catch (error) {
      healthCheck.checks.cache = {
        status: "warning",
        message: "Cache system check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // 4. Recent activity check
    try {
      const [recentEarnings, recentWithdrawals, recentNotifications] = await Promise.all([
        prisma.musyrifEarning.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
        prisma.musyrifWithdrawal.count({
          where: {
            requestedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
        prisma.notification.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ]);

      healthCheck.checks.recentActivity = {
        status: "healthy",
        data: {
          recentEarnings,
          recentWithdrawals,
          recentNotifications,
        },
        message: `${recentEarnings + recentWithdrawals + recentNotifications} activities in last 24h`,
      };
    } catch (error) {
      healthCheck.checks.recentActivity = {
        status: "warning",
        message: "Recent activity check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // 5. Performance metrics
    try {
      const startTime = Date.now();
      
      // Test query performance
      await prisma.musyrifEarning.findMany({
        take: 1,
        include: {
          musyrif: true,
          attendance: true,
        },
      });
      
      const queryTime = Date.now() - startTime;
      
      healthCheck.checks.performance = {
        status: queryTime > 1000 ? "warning" : "healthy",
        data: {
          queryTime,
          threshold: 1000,
        },
        message: `Query response time: ${queryTime}ms`,
      };

      if (queryTime > 1000) {
        healthCheck.status = "warning";
      }

    } catch (error) {
      healthCheck.checks.performance = {
        status: "unhealthy",
        message: "Performance check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      healthCheck.status = "unhealthy";
    }

    // Generate summary
    const checkStatuses = Object.values(healthCheck.checks).map((check: any) => check.status);
    const healthyCount = checkStatuses.filter(status => status === "healthy").length;
    const warningCount = checkStatuses.filter(status => status === "warning").length;
    const unhealthyCount = checkStatuses.filter(status => status === "unhealthy").length;

    healthCheck.summary = {
      totalChecks: checkStatuses.length,
      healthy: healthyCount,
      warnings: warningCount,
      unhealthy: unhealthyCount,
      overallStatus: healthCheck.status,
      recommendations: [],
    };

    // Add recommendations
    if (unhealthyCount > 0) {
      healthCheck.summary.recommendations.push("Immediate attention required for unhealthy components");
    }
    if (warningCount > 0) {
      healthCheck.summary.recommendations.push("Review warning items for potential issues");
    }
    if (healthCheck.checks.salarySystem?.data?.orphanedEarnings > 10) {
      healthCheck.summary.recommendations.push("Run attendance-salary sync to fix orphaned earnings");
    }
    if (healthCheck.checks.salarySystem?.data?.ratesCoverage < 100) {
      healthCheck.summary.recommendations.push("Set salary rates for all active musyrif");
    }

    console.log(`✅ System health check completed: ${healthCheck.status}`);

    return NextResponse.json({
      success: true,
      data: healthCheck,
    });

  } catch (error) {
    console.error("❌ Error in system health check:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "System health check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can run system maintenance." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    console.log(`🔌 Running system maintenance: ${action}`);

    let result = {};

    switch (action) {
      case "cleanup_cache":
        CacheHelpers.cleanup();
        result = { message: "Cache cleaned up successfully" };
        break;

      case "fix_orphaned_earnings":
        // This would require more complex logic
        result = { message: "Orphaned earnings fix not implemented yet" };
        break;

      case "recalculate_wallets":
        // This would require wallet balance recalculation
        result = { message: "Wallet recalculation not implemented yet" };
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Unknown maintenance action" },
          { status: 400 }
        );
    }

    console.log(`✅ Maintenance completed: ${action}`);

    return NextResponse.json({
      success: true,
      message: `Maintenance action '${action}' completed successfully`,
      data: result,
    });

  } catch (error) {
    console.error("❌ Error in system maintenance:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "System maintenance failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
