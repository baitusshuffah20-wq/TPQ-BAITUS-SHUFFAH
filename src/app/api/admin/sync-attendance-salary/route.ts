import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { autoCreateEarningFromAttendance } from "@/lib/salary-calculator";

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
        { success: false, message: "Access denied. Only admin can sync attendance data." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { startDate, endDate, forceSync = false } = body;

    console.log(`🔌 Starting attendance-salary sync - Start: ${startDate}, End: ${endDate}, Force: ${forceSync}`);

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get approved attendance records that don't have earnings yet
    const attendanceRecords = await prisma.musyrifAttendance.findMany({
      where: {
        status: "APPROVED",
        date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        ...(forceSync ? {} : {
          earnings: {
            none: {}, // Only get attendance without earnings
          },
        }),
      },
      include: {
        musyrif: {
          include: {
            user: true,
            salaryRates: {
              where: {
                isActive: true,
              },
              orderBy: {
                effectiveDate: "desc",
              },
              take: 1,
            },
          },
        },
        halaqah: true,
        earnings: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log(`📊 Found ${attendanceRecords.length} attendance records to sync`);

    let syncResults = {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[],
    };

    // Process each attendance record
    for (const attendance of attendanceRecords) {
      try {
        syncResults.processed++;

        // Skip if already has earnings and not force sync
        if (attendance.earnings.length > 0 && !forceSync) {
          syncResults.skipped++;
          syncResults.details.push({
            attendanceId: attendance.id,
            date: attendance.date,
            musyrifName: attendance.musyrif.name,
            status: "skipped",
            reason: "Already has earnings",
          });
          continue;
        }

        // Check if musyrif has active salary rate
        if (!attendance.musyrif.salaryRates[0]) {
          syncResults.skipped++;
          syncResults.details.push({
            attendanceId: attendance.id,
            date: attendance.date,
            musyrifName: attendance.musyrif.name,
            status: "skipped",
            reason: "No active salary rate",
          });
          continue;
        }

        // Auto-create earning
        const earningId = await autoCreateEarningFromAttendance(
          attendance.id,
          session.user.id
        );

        if (earningId) {
          syncResults.created++;
          syncResults.details.push({
            attendanceId: attendance.id,
            earningId: earningId,
            date: attendance.date,
            musyrifName: attendance.musyrif.name,
            status: "created",
            reason: "Successfully created earning",
          });
        } else {
          syncResults.errors++;
          syncResults.details.push({
            attendanceId: attendance.id,
            date: attendance.date,
            musyrifName: attendance.musyrif.name,
            status: "error",
            reason: "Failed to create earning",
          });
        }

      } catch (error) {
        syncResults.errors++;
        syncResults.details.push({
          attendanceId: attendance.id,
          date: attendance.date,
          musyrifName: attendance.musyrif?.name || "Unknown",
          status: "error",
          reason: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`❌ Error processing attendance ${attendance.id}:`, error);
      }
    }

    console.log(`✅ Sync completed:`, syncResults);

    return NextResponse.json({
      success: true,
      message: `Sync completed. Created ${syncResults.created} earnings from ${syncResults.processed} attendance records.`,
      data: syncResults,
    });

  } catch (error) {
    console.error("❌ Error syncing attendance-salary:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat sync attendance-salary",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

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
        { success: false, message: "Access denied. Only admin can view sync status." },
        { status: 403 }
      );
    }

    console.log(`🔌 Getting attendance-salary sync status`);

    // Get statistics
    const [
      totalApprovedAttendance,
      totalEarnings,
      attendanceWithoutEarnings,
      earningsWithoutAttendance,
    ] = await Promise.all([
      prisma.musyrifAttendance.count({
        where: { status: "APPROVED" },
      }),
      prisma.musyrifEarning.count(),
      prisma.musyrifAttendance.count({
        where: {
          status: "APPROVED",
          earnings: {
            none: {},
          },
        },
      }),
      // Skip checking for earnings without attendance (complex query)
      0,
    ]);

    // Get recent sync-able attendance records
    const recentAttendance = await prisma.musyrifAttendance.findMany({
      where: {
        status: "APPROVED",
        earnings: {
          none: {},
        },
      },
      include: {
        musyrif: {
          select: {
            name: true,
          },
        },
        halaqah: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    });

    const syncStatus = {
      statistics: {
        totalApprovedAttendance,
        totalEarnings,
        attendanceWithoutEarnings,
        earningsWithoutAttendance,
        syncPercentage: totalApprovedAttendance > 0 
          ? Math.round(((totalApprovedAttendance - attendanceWithoutEarnings) / totalApprovedAttendance) * 100)
          : 0,
      },
      recentUnsyncedAttendance: recentAttendance.map(attendance => ({
        id: attendance.id,
        date: attendance.date,
        musyrifName: attendance.musyrif.name,
        halaqahName: attendance.halaqah.name,
        sessionType: attendance.sessionType,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
      })),
      recommendations: [],
    };

    // Add recommendations
    if (attendanceWithoutEarnings > 0) {
      syncStatus.recommendations.push({
        type: "sync_needed",
        message: `${attendanceWithoutEarnings} attendance records need to be synced with salary system`,
        action: "Run sync process",
      });
    }

    if (earningsWithoutAttendance > 0) {
      syncStatus.recommendations.push({
        type: "orphaned_earnings",
        message: `${earningsWithoutAttendance} earnings exist without attendance records`,
        action: "Review and clean up orphaned earnings",
      });
    }

    if (syncStatus.statistics.syncPercentage < 95) {
      syncStatus.recommendations.push({
        type: "low_sync_rate",
        message: `Sync rate is ${syncStatus.statistics.syncPercentage}%, consider running full sync`,
        action: "Run full sync with date range",
      });
    }

    console.log(`✅ Sync status retrieved:`, syncStatus.statistics);

    return NextResponse.json({
      success: true,
      data: syncStatus,
    });

  } catch (error) {
    console.error("❌ Error getting sync status:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil status sync",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
