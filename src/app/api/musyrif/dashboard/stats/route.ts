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

    // Only allow MUSYRIF role
    if (session.user.role !== "MUSYRIF") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only musyrif can access dashboard stats." },
        { status: 403 }
      );
    }

    console.log(`🔌 Fetching dashboard stats for musyrif user ID: ${session.user.id}`);

    // Get musyrif record
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (!musyrifRecord) {
      console.log(`No musyrif record found for user ID: ${session.user.id}`);
      return NextResponse.json({
        success: true,
        message: "Belum ada data musyrif untuk user ini",
        data: {
          totalSantri: 0,
          activeHalaqah: 0,
          completedHafalan: 0,
          attendanceRate: 0,
          recentActivities: [],
        },
      });
    }

    console.log(`✅ Musyrif record found: ${musyrifRecord.id}`);

    // Get total santri binaan
    const totalSantri = await prisma.santri.count({
      where: {
        halaqah: {
          musyrifId: musyrifRecord.id,
        },
        status: "ACTIVE",
      },
    });

    // Get active halaqah
    const activeHalaqah = await prisma.halaqah.count({
      where: {
        musyrifId: musyrifRecord.id,
        status: "ACTIVE",
      },
    });

    // Get completed hafalan this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const completedHafalan = await prisma.hafalanProgress.count({
      where: {
        santri: {
          halaqah: {
            musyrifId: musyrifRecord.id,
          },
        },
        status: "COMPLETED",
        completedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculate attendance rate this month
    const totalAttendances = await prisma.attendance.count({
      where: {
        musyrifId: musyrifRecord.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const presentAttendances = await prisma.attendance.count({
      where: {
        musyrifId: musyrifRecord.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: "PRESENT",
      },
    });

    const attendanceRate = totalAttendances > 0 
      ? Math.round((presentAttendances / totalAttendances) * 100)
      : 0;

    // Get recent activities (earnings, hafalan approvals, etc.)
    const recentEarnings = await prisma.musyrifEarning.findMany({
      where: {
        musyrifId: musyrifRecord.id,
        status: "APPROVED",
      },
      include: {
        attendance: {
          select: {
            date: true,
            sessionType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const recentActivities = recentEarnings.map(earning => ({
      id: earning.id,
      type: "EARNING" as const,
      description: `Penghasilan dari ${earning.attendance.sessionType} - Rp ${earning.amount.toLocaleString('id-ID')}`,
      date: earning.createdAt.toISOString(),
      status: earning.status,
    }));

    console.log(`✅ Dashboard stats retrieved for musyrif ${musyrifRecord.id}`);

    return NextResponse.json({
      success: true,
      data: {
        totalSantri,
        activeHalaqah,
        completedHafalan,
        attendanceRate,
        recentActivities,
      },
    });

  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil data dashboard",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
