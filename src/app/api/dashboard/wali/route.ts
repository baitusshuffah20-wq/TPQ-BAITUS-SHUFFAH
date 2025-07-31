import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API /dashboard/wali GET called");

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow WALI role
    if (session.user.role !== "WALI") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only wali can access this dashboard." },
        { status: 403 }
      );
    }

    console.log(`📊 Loading dashboard data for wali: ${session.user.id}`);

    // Get wali's children (santri)
    const children = await prisma.santri.findMany({
      where: {
        waliId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        halaqah: {
          include: {
            musyrif: {
              select: {
                name: true,
              },
            },
          },
        },
        hafalan: {
          where: {
            status: "APPROVED",
          },
          orderBy: {
            recordedAt: "desc",
          },
          take: 1,
        },
        attendance: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    });

    console.log(`👥 Found ${children.length} children for wali`);

    // Get pending payments for wali's children
    const pendingPayments = await prisma.payment.findMany({
      where: {
        santri: {
          waliId: session.user.id,
        },
        status: "PENDING",
      },
      include: {
        santri: {
          select: {
            name: true,
            nis: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    console.log(`💳 Found ${pendingPayments.length} pending payments`);

    // Get recent payments (last 3 months)
    const recentPayments = await prisma.payment.findMany({
      where: {
        santri: {
          waliId: session.user.id,
        },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      include: {
        santri: {
          select: {
            name: true,
            nis: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Get notifications for wali
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    console.log(`🔔 Found ${notifications.length} unread notifications`);

    // Calculate statistics
    const totalChildren = children.length;
    const pendingPaymentsCount = pendingPayments.length;
    
    // Calculate completed hafalan count
    const completedHafalan = children.reduce((total, child) => {
      return total + child.hafalan.length;
    }, 0);

    // Calculate average attendance rate
    let totalAttendanceRate = 0;
    let childrenWithAttendance = 0;

    children.forEach(child => {
      if (child.attendance.length > 0) {
        const presentCount = child.attendance.filter(att => att.status === "PRESENT").length;
        const attendanceRate = (presentCount / child.attendance.length) * 100;
        totalAttendanceRate += attendanceRate;
        childrenWithAttendance++;
      }
    });

    const averageAttendanceRate = childrenWithAttendance > 0 
      ? Math.round(totalAttendanceRate / childrenWithAttendance) 
      : 0;

    // Get recent hafalan progress
    const recentHafalan = await prisma.hafalan.findMany({
      where: {
        santri: {
          waliId: session.user.id,
        },
      },
      include: {
        santri: {
          select: {
            name: true,
            nis: true,
          },
        },
        musyrif: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        recordedAt: "desc",
      },
      take: 5,
    });

    // Format children data
    const formattedChildren = children.map(child => {
      const presentCount = child.attendance.filter(att => att.status === "PRESENT").length;
      const attendanceRate = child.attendance.length > 0 
        ? Math.round((presentCount / child.attendance.length) * 100) 
        : 0;

      const approvedHafalan = child.hafalan.length;
      const lastHafalan = child.hafalan[0];

      return {
        id: child.id,
        name: child.name,
        nis: child.nis,
        halaqah: child.halaqah?.name || "Belum ditentukan",
        musyrif: child.halaqah?.musyrif?.name || "Belum ditentukan",
        progress: approvedHafalan * 5, // Simplified progress calculation
        lastHafalan: lastHafalan ? `${lastHafalan.surah} ${lastHafalan.ayahStart}-${lastHafalan.ayahEnd}` : "Belum ada",
        attendanceRate,
        currentLevel: `Juz ${Math.ceil(approvedHafalan / 10) || 1}`,
        achievements: [], // Can be expanded later
      };
    });

    const dashboardData = {
      totalChildren,
      pendingPayments: pendingPaymentsCount,
      completedHafalan,
      attendanceRate: averageAttendanceRate,
      unreadMessages: 0, // Will be implemented when message system is ready
      unreadNotifications: notifications.length,
      totalDonations: 0, // Will be implemented when donation system is ready
      monthlyProgress: averageAttendanceRate, // Simplified for now
    };

    console.log("✅ Dashboard data compiled successfully");

    return NextResponse.json({
      success: true,
      data: {
        stats: dashboardData,
        children: formattedChildren,
        pendingPayments: pendingPayments.map(payment => ({
          id: payment.id,
          type: payment.type,
          amount: Number(payment.amount),
          dueDate: payment.dueDate,
          status: payment.status,
          description: `${payment.type} ${payment.santri.name}`,
          santriName: payment.santri.name,
          santriNis: payment.santri.nis,
        })),
        recentPayments: recentPayments.map(payment => ({
          id: payment.id,
          type: payment.type,
          amount: Number(payment.amount),
          status: payment.status,
          paidDate: payment.paidDate,
          description: `${payment.type} ${payment.santri.name}`,
          santriName: payment.santri.name,
          santriNis: payment.santri.nis,
        })),
        recentHafalan: recentHafalan.map(hafalan => ({
          id: hafalan.id,
          surah: hafalan.surah,
          ayah: `${hafalan.ayahStart}-${hafalan.ayahEnd}`,
          status: hafalan.status,
          grade: hafalan.grade,
          date: hafalan.recordedAt,
          musyrif: hafalan.musyrif?.name || "Unknown",
          santriName: hafalan.santri.name,
        })),
        notifications: notifications.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          createdAt: notif.createdAt,
          isRead: notif.isRead,
        })),
      },
    });

  } catch (error) {
    console.error("❌ Error fetching wali dashboard data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch dashboard data",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
