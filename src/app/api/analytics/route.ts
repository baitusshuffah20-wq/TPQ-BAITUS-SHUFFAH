import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    const endDate = new Date();
    const startDate = new Date();
    let daysInPeriod = 30;

    switch (timeRange) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        daysInPeriod = 7;
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        daysInPeriod = 30;
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        daysInPeriod = 90;
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        daysInPeriod = 365;
        break;
    }

    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousEndDate.getDate() - daysInPeriod);

    const [
      totalSantri,
      totalHafalan,
      totalPembayaran,
      totalKehadiran,
      hafalanProgress,
      payments,
      attendance,
      totalHafalanLastPeriod,
      totalPembayaranLastPeriod,
      totalKehadiranLastPeriod,
    ] = await Promise.all([
      prisma.santri.count({ where: { status: "ACTIVE" } }),
      prisma.hafalan.count({
        where: { recordedAt: { gte: startDate, lte: endDate } },
      }),
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.attendance.count({
        where: {
          status: "PRESENT",
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.hafalan.groupBy({
        by: ["surahName"],
        _count: { surahName: true },
        orderBy: { _count: { surahName: "desc" } },
        take: 5,
      }),
      prisma.payment.findMany({
        where: { paidDate: { gte: startDate, lte: endDate } },
      }),
      prisma.attendance.findMany({
        where: { date: { gte: startDate, lte: endDate } },
      }),
      prisma.hafalan.count({
        where: {
          recordedAt: { gte: previousStartDate, lte: previousEndDate },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidDate: { gte: previousStartDate, lte: previousEndDate },
        },
        _sum: { amount: true },
      }),
      prisma.attendance.count({
        where: {
          status: "PRESENT",
          date: { gte: previousStartDate, lte: previousEndDate },
        },
      }),
    ]);

    // Placeholder for santriBerprestasi as achievement model is not available
    const santriBerprestasi = 0;

    const totalSantriLastPeriod = await prisma.santri.count({
      where: {
        status: "ACTIVE",
        enrollmentDate: { lt: previousStartDate },
      },
    });

    const totalPossibleAttendance = totalSantri * daysInPeriod;
    const efisiensiPembelajaran =
      totalPossibleAttendance > 0
        ? (totalKehadiran / totalPossibleAttendance) * 100
        : 0;

    const getChange = (current: number, previous: number) => {
      if (previous === 0) return "100%";
      const change = ((current - previous) / previous) * 100;
      return `${change.toFixed(1)}%`;
    };

    const summaryCards = [
      {
        title: "Total Santri",
        value: totalSantri.toString(),
        change: getChange(totalSantri, totalSantriLastPeriod),
        trend: totalSantri >= totalSantriLastPeriod ? "up" : "down",
        icon: "Users",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Hafalan Selesai",
        value: totalHafalan.toString(),
        change: getChange(totalHafalan, totalHafalanLastPeriod),
        trend: totalHafalan >= totalHafalanLastPeriod ? "up" : "down",
        icon: "GraduationCap",
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Pendapatan",
        value: `Rp ${(totalPembayaran._sum.amount || 0).toLocaleString(
          "id-ID",
        )}`,
        change: getChange(
          totalPembayaran._sum.amount || 0,
          totalPembayaranLastPeriod._sum.amount || 0,
        ),
        trend:
          (totalPembayaran._sum.amount || 0) >=
          (totalPembayaranLastPeriod._sum.amount || 0)
            ? "up"
            : "down",
        icon: "DollarSign",
        color: "text-teal-600",
        bgColor: "bg-teal-50",
      },
      {
        title: "Tingkat Kehadiran",
        value: totalKehadiran.toString(),
        change: getChange(totalKehadiran, totalKehadiranLastPeriod),
        trend: totalKehadiran >= totalKehadiranLastPeriod ? "up" : "down",
        icon: "Calendar",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        summaryCards,
        hafalanProgress: hafalanProgress.map(
          (h: { surahName: string | null; _count: { surahName: number } }) => ({
            surah: h.surahName,
            completed: h._count.surahName,
            total: totalSantri,
            percentage:
              totalSantri > 0 ? (h._count.surahName / totalSantri) * 100 : 0,
          }),
        ),
        payments,
        attendance,
        detailedMetrics: {
          hafalanTarget: {
            title: "Target Hafalan Bulan Ini",
            value: 200,
            progress: totalHafalan,
            percentage: (totalHafalan / 200) * 100,
          },
          santriBerprestasi: {
            title: "Santri Berprestasi",
            value: santriBerprestasi,
            description: `Nilai rata-rata ≥ 90`,
          },
          efisiensiPembelajaran: {
            title: "Efisiensi Pembelajaran",
            value: `${efisiensiPembelajaran.toFixed(0)}%`,
            description: "Berdasarkan kehadiran & nilai",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
