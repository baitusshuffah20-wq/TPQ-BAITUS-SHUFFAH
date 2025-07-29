import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/spp/stats - Get SPP statistics for wali
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waliId = searchParams.get("waliId");

    if (!waliId) {
      return NextResponse.json(
        { success: false, message: "Wali ID diperlukan" },
        { status: 400 },
      );
    }

    // Get all santri for this wali
    const santriList = await prisma.santri.findMany({
      where: { waliId },
      select: { id: true },
    });

    if (santriList.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalPending: 0,
          totalOverdue: 0,
          totalPaid: 0,
          pendingCount: 0,
          overdueCount: 0,
          paidCount: 0,
        },
      });
    }

    const santriIds = santriList.map((santri) => santri.id);
    const currentDate = new Date();

    // Get pending SPP records
    const pendingRecords = await prisma.sPPRecord.findMany({
      where: {
        santriId: { in: santriIds },
        status: "PENDING",
      },
      select: {
        amount: true,
        paidAmount: true,
        fine: true,
        dueDate: true,
      },
    });

    // Get overdue SPP records
    const overdueRecords = await prisma.sPPRecord.findMany({
      where: {
        santriId: { in: santriIds },
        OR: [
          { status: "OVERDUE" },
          {
            status: "PENDING",
            dueDate: { lt: currentDate },
          },
        ],
      },
      select: {
        amount: true,
        paidAmount: true,
        fine: true,
      },
    });

    // Get paid SPP records for current year
    const currentYear = currentDate.getFullYear();
    const paidRecords = await prisma.sPPRecord.findMany({
      where: {
        santriId: { in: santriIds },
        status: "PAID",
        year: currentYear,
      },
      select: {
        amount: true,
        paidAmount: true,
      },
    });

    // Calculate totals
    const totalPending = pendingRecords.reduce((sum, record) => {
      return sum + (record.amount - record.paidAmount + record.fine);
    }, 0);

    const totalOverdue = overdueRecords.reduce((sum, record) => {
      return sum + (record.amount - record.paidAmount + record.fine);
    }, 0);

    const totalPaid = paidRecords.reduce((sum, record) => {
      return sum + record.paidAmount;
    }, 0);

    // Filter out overdue from pending to avoid double counting
    const actualPendingRecords = pendingRecords.filter(
      (record) => new Date(record.dueDate) >= currentDate,
    );

    const stats = {
      totalPending,
      totalOverdue,
      totalPaid,
      pendingCount: actualPendingRecords.length,
      overdueCount: overdueRecords.length,
      paidCount: paidRecords.length,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error getting SPP stats:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik SPP" },
      { status: 500 },
    );
  }
}

// GET /api/spp/stats/monthly - Get monthly SPP statistics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { waliId, year } = body;

    if (!waliId) {
      return NextResponse.json(
        { success: false, message: "Wali ID diperlukan" },
        { status: 400 },
      );
    }

    const targetYear = year || new Date().getFullYear();

    // Get all santri for this wali
    const santriList = await prisma.santri.findMany({
      where: { waliId },
      select: { id: true },
    });

    if (santriList.length === 0) {
      return NextResponse.json({
        success: true,
        monthlyStats: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          monthName: new Date(targetYear, i).toLocaleDateString("id-ID", {
            month: "long",
          }),
          paid: 0,
          pending: 0,
          overdue: 0,
          total: 0,
        })),
      });
    }

    const santriIds = santriList.map((santri) => santri.id);

    // Get SPP records for the year
    const sppRecords = await prisma.sPPRecord.findMany({
      where: {
        santriId: { in: santriIds },
        year: targetYear,
      },
      select: {
        month: true,
        amount: true,
        paidAmount: true,
        fine: true,
        status: true,
        dueDate: true,
      },
    });

    // Group by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthRecords = sppRecords.filter(
        (record) => record.month === month,
      );

      let paid = 0;
      let pending = 0;
      let overdue = 0;

      monthRecords.forEach((record) => {
        const totalAmount = record.amount - record.paidAmount + record.fine;

        if (record.status === "PAID") {
          paid += record.paidAmount;
        } else if (
          record.status === "OVERDUE" ||
          (record.status === "PENDING" && new Date(record.dueDate) < new Date())
        ) {
          overdue += totalAmount;
        } else if (record.status === "PENDING") {
          pending += totalAmount;
        }
      });

      return {
        month,
        monthName: new Date(targetYear, i).toLocaleDateString("id-ID", {
          month: "long",
        }),
        paid,
        pending,
        overdue,
        total: paid + pending + overdue,
      };
    });

    return NextResponse.json({
      success: true,
      year: targetYear,
      monthlyStats: monthlyData,
    });
  } catch (error) {
    console.error("Error getting monthly SPP stats:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik bulanan SPP" },
      { status: 500 },
    );
  }
}
