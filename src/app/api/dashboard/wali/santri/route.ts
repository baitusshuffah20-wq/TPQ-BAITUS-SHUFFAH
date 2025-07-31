import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API /dashboard/wali/santri GET called");

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
        { success: false, message: "Access denied. Only wali can access this data." },
        { status: 403 }
      );
    }

    console.log(`📊 Loading santri data for wali: ${session.user.id}`);

    // Get wali's children (santri) with detailed information
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
                phone: true,
                email: true,
              },
            },
          },
        },
        hafalan: {
          orderBy: {
            recordedAt: "desc",
          },
          take: 10,
          include: {
            musyrif: {
              select: {
                name: true,
              },
            },
          },
        },
        attendance: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        wali: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    console.log(`👥 Found ${children.length} children for wali`);

    // Format children data with detailed information
    const formattedChildren = children.map(child => {
      // Calculate attendance statistics
      const totalAttendance = child.attendance.length;
      const presentCount = child.attendance.filter(att => att.status === "PRESENT").length;
      const lateCount = child.attendance.filter(att => att.status === "LATE").length;
      const absentCount = child.attendance.filter(att => att.status === "ABSENT").length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      // Calculate hafalan progress
      const approvedHafalan = child.hafalan.filter(h => h.status === "APPROVED").length;
      const pendingHafalan = child.hafalan.filter(h => h.status === "PENDING").length;
      const rejectedHafalan = child.hafalan.filter(h => h.status === "REJECTED").length;
      
      // Get latest hafalan
      const latestHafalan = child.hafalan[0];
      
      // Calculate average grade
      const approvedHafalanWithGrades = child.hafalan.filter(h => h.status === "APPROVED" && h.grade);
      const averageGrade = approvedHafalanWithGrades.length > 0 
        ? Math.round(approvedHafalanWithGrades.reduce((sum, h) => sum + (h.grade || 0), 0) / approvedHafalanWithGrades.length)
        : 0;

      // Payment statistics
      const pendingPayments = child.payments.filter(p => p.status === "PENDING").length;
      const totalPendingAmount = child.payments
        .filter(p => p.status === "PENDING")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        id: child.id,
        name: child.name,
        nis: child.nis,
        birthDate: child.birthDate,
        address: child.address,
        phone: child.phone,
        status: child.status,
        joinDate: child.joinDate,
        
        // Halaqah information
        halaqah: {
          name: child.halaqah?.name || "Belum ditentukan",
          musyrif: {
            name: child.halaqah?.musyrif?.name || "Belum ditentukan",
            phone: child.halaqah?.musyrif?.phone,
            email: child.halaqah?.musyrif?.email,
          },
        },

        // Wali information
        wali: child.wali,

        // Hafalan progress
        hafalan: {
          approved: approvedHafalan,
          pending: pendingHafalan,
          rejected: rejectedHafalan,
          total: child.hafalan.length,
          averageGrade,
          latest: latestHafalan ? {
            surah: latestHafalan.surah,
            ayahStart: latestHafalan.ayahStart,
            ayahEnd: latestHafalan.ayahEnd,
            status: latestHafalan.status,
            grade: latestHafalan.grade,
            date: latestHafalan.recordedAt,
            musyrif: latestHafalan.musyrif?.name,
            notes: latestHafalan.notes,
          } : null,
          progress: Math.min(100, (approvedHafalan / 30) * 100), // Assuming 30 is target
          currentLevel: `Juz ${Math.ceil(approvedHafalan / 10) || 1}`,
        },

        // Attendance statistics
        attendance: {
          rate: attendanceRate,
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          total: totalAttendance,
          recent: child.attendance.slice(0, 7).map(att => ({
            date: att.date,
            status: att.status,
            notes: att.notes,
          })),
        },

        // Payment information
        payments: {
          pending: pendingPayments,
          totalPendingAmount,
          recent: child.payments.map(payment => ({
            id: payment.id,
            type: payment.type,
            amount: Number(payment.amount),
            status: payment.status,
            dueDate: payment.dueDate,
            paidDate: payment.paidDate,
            notes: payment.notes,
          })),
        },

        // Overall statistics
        stats: {
          attendanceRate,
          hafalanProgress: Math.min(100, (approvedHafalan / 30) * 100),
          averageGrade,
          pendingPayments,
          achievements: [], // Can be expanded later
        },
      };
    });

    console.log("✅ Santri data compiled successfully");

    return NextResponse.json({
      success: true,
      data: {
        children: formattedChildren,
        summary: {
          totalChildren: children.length,
          totalPendingPayments: formattedChildren.reduce((sum, child) => sum + child.payments.pending, 0),
          averageAttendanceRate: formattedChildren.length > 0 
            ? Math.round(formattedChildren.reduce((sum, child) => sum + child.attendance.rate, 0) / formattedChildren.length)
            : 0,
          totalApprovedHafalan: formattedChildren.reduce((sum, child) => sum + child.hafalan.approved, 0),
        },
      },
    });

  } catch (error) {
    console.error("❌ Error fetching wali santri data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch santri data",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
