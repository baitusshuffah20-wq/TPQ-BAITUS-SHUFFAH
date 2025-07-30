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

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can view salary reports." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const musyrifId = searchParams.get("musyrifId");

    console.log(`🔌 Fetching salary reports - Start: ${startDate}, End: ${endDate}, Musyrif: ${musyrifId}`);

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Build musyrif filter
    const musyrifFilter: any = {};
    if (musyrifId) {
      musyrifFilter.musyrifId = musyrifId;
    }

    // Get earnings data
    const earnings = await prisma.musyrifEarning.findMany({
      where: {
        status: "APPROVED",
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        ...musyrifFilter,
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
          },
        },
        attendance: {
          select: {
            date: true,
            sessionType: true,
            checkInTime: true,
            checkOutTime: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get withdrawals data
    const withdrawals = await prisma.musyrifWithdrawal.findMany({
      where: {
        status: "COMPLETED",
        completedAt: Object.keys(dateFilter).length > 0 ? {
          gte: dateFilter.gte,
          lte: dateFilter.lte,
        } : undefined,
        ...musyrifFilter,
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Get summary statistics
    const totalEarnings = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);

    // Group earnings by musyrif
    const earningsByMusyrif = earnings.reduce((acc, earning) => {
      const musyrifId = earning.musyrifId;
      if (!acc[musyrifId]) {
        acc[musyrifId] = {
          musyrifId,
          musyrifName: earning.musyrif.name,
          totalEarnings: 0,
          totalSessions: 0,
          totalHours: 0,
          earnings: [],
        };
      }
      
      acc[musyrifId].totalEarnings += Number(earning.amount);
      acc[musyrifId].totalSessions += 1;
      
      if (earning.sessionDuration) {
        acc[musyrifId].totalHours += earning.sessionDuration / 60;
      }
      
      acc[musyrifId].earnings.push({
        id: earning.id,
        amount: Number(earning.amount),
        calculationType: earning.calculationType,
        sessionDuration: earning.sessionDuration,
        rate: Number(earning.rate),
        date: earning.attendance.date,
        sessionType: earning.attendance.sessionType,
        createdAt: earning.createdAt,
      });
      
      return acc;
    }, {} as any);

    // Group withdrawals by musyrif
    const withdrawalsByMusyrif = withdrawals.reduce((acc, withdrawal) => {
      const musyrifId = withdrawal.musyrifId;
      if (!acc[musyrifId]) {
        acc[musyrifId] = {
          musyrifId,
          musyrifName: withdrawal.musyrif.name,
          totalWithdrawals: 0,
          withdrawalCount: 0,
          withdrawals: [],
        };
      }
      
      acc[musyrifId].totalWithdrawals += Number(withdrawal.amount);
      acc[musyrifId].withdrawalCount += 1;
      acc[musyrifId].withdrawals.push({
        id: withdrawal.id,
        amount: Number(withdrawal.amount),
        bankName: withdrawal.bankName,
        completedAt: withdrawal.completedAt,
      });
      
      return acc;
    }, {} as any);

    // Calculate monthly trends
    const monthlyTrends = earnings.reduce((acc, earning) => {
      const month = earning.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          month,
          totalEarnings: 0,
          totalSessions: 0,
          uniqueMusyrif: new Set(),
        };
      }
      
      acc[month].totalEarnings += Number(earning.amount);
      acc[month].totalSessions += 1;
      acc[month].uniqueMusyrif.add(earning.musyrifId);
      
      return acc;
    }, {} as any);

    // Convert monthly trends to array and add uniqueMusyrif count
    const monthlyTrendsArray = Object.values(monthlyTrends).map((trend: any) => ({
      month: trend.month,
      totalEarnings: trend.totalEarnings,
      totalSessions: trend.totalSessions,
      uniqueMusyrif: trend.uniqueMusyrif.size,
    }));

    console.log(`✅ Found ${earnings.length} earnings and ${withdrawals.length} withdrawals`);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEarnings,
          totalWithdrawals,
          netAmount: totalEarnings - totalWithdrawals,
          totalSessions: earnings.length,
          totalWithdrawalRequests: withdrawals.length,
          uniqueMusyrif: Object.keys(earningsByMusyrif).length,
        },
        earningsByMusyrif: Object.values(earningsByMusyrif),
        withdrawalsByMusyrif: Object.values(withdrawalsByMusyrif),
        monthlyTrends: monthlyTrendsArray.sort((a: any, b: any) => a.month.localeCompare(b.month)),
        detailedEarnings: earnings.map(earning => ({
          id: earning.id,
          musyrifId: earning.musyrifId,
          musyrifName: earning.musyrif.name,
          amount: Number(earning.amount),
          calculationType: earning.calculationType,
          sessionDuration: earning.sessionDuration,
          rate: Number(earning.rate),
          attendanceDate: earning.attendance.date,
          sessionType: earning.attendance.sessionType,
          createdAt: earning.createdAt,
        })),
        detailedWithdrawals: withdrawals.map(withdrawal => ({
          id: withdrawal.id,
          musyrifId: withdrawal.musyrifId,
          musyrifName: withdrawal.musyrif.name,
          amount: Number(withdrawal.amount),
          bankName: withdrawal.bankName,
          completedAt: withdrawal.completedAt,
        })),
      },
    });

  } catch (error) {
    console.error("❌ Error fetching salary reports:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil data reports",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
