import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get musyrif attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    let musyrifId = searchParams.get("musyrifId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // If no musyrifId provided, try to get from session or fallback to test user
    if (!musyrifId) {
      if (session?.user?.id) {
        musyrifId = session.user.id;
      } else {
        // Fallback to test user for testing purposes
        const testUser = await prisma.user.findFirst({
          where: {
            email: "musyrif@test.com",
            role: "MUSYRIF"
          }
        });

        if (testUser) {
          musyrifId = testUser.id;
        } else {
          return NextResponse.json(
            { success: false, message: "Unauthorized - No valid user found" },
            { status: 401 }
          );
        }
      }
    }

    // Verify access - admin can see all, musyrif can only see their own
    // Skip access control for test user
    const isTestUser = (await prisma.user.findUnique({ where: { id: musyrifId } }))?.email === "musyrif@test.com";

    if (!isTestUser && session?.user && session.user.role !== "ADMIN" && musyrifId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const where: any = {
      musyrifId,
    };

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const attendance = await prisma.musyrifAttendance.findMany({
      where,
      include: {
        halaqah: {
          select: {
            id: true,
            name: true,
          },
        },
        musyrif: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
    });

    // Calculate statistics
    const stats = await prisma.musyrifAttendance.groupBy({
      by: ["status"],
      where,
      _count: {
        status: true,
      },
    });

    const totalSessions = stats.reduce((sum, stat) => sum + stat._count.status, 0);
    const presentSessions = stats
      .filter((stat) => stat.status === "PRESENT" || stat.status === "LATE")
      .reduce((sum, stat) => sum + stat._count.status, 0);
    const lateSessions = stats
      .filter((stat) => stat.status === "LATE")
      .reduce((sum, stat) => sum + stat._count.status, 0);

    const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    return NextResponse.json({
      success: true,
      attendance: attendance.map((record) => ({
        id: record.id,
        date: record.date.toISOString(),
        status: record.status,
        checkInTime: record.checkInTime?.toISOString(),
        checkOutTime: record.checkOutTime?.toISOString(),
        sessionType: record.sessionType,
        notes: record.notes,
        qrCodeUsed: record.qrCodeUsed,
        halaqah: record.halaqah,
        isLate: record.status === "LATE",
      })),
      statistics: {
        totalSessions,
        presentSessions,
        lateSessions,
        absentSessions: totalSessions - presentSessions,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
      message: "Data absensi berhasil dimuat",
    });
  } catch (error) {
    console.error("Error fetching musyrif attendance:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat data absensi",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Create manual attendance record (for admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      musyrifId,
      halaqahId,
      date,
      status,
      checkInTime,
      checkOutTime,
      sessionType = "REGULAR",
      notes,
    } = body;

    if (!musyrifId || !halaqahId || !date || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Data wajib tidak lengkap",
        },
        { status: 400 }
      );
    }

    // Verify musyrif exists and is assigned to halaqah
    const musyrif = await prisma.user.findUnique({
      where: { id: musyrifId },
      include: {
        musyrifProfile: {
          include: {
            halaqah: true,
          },
        },
      },
    });

    if (!musyrif || musyrif.role !== "MUSYRIF") {
      return NextResponse.json(
        {
          success: false,
          message: "Musyrif tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (musyrif.musyrifProfile?.halaqahId !== halaqahId) {
      return NextResponse.json(
        {
          success: false,
          message: "Musyrif tidak ditugaskan di halaqah ini",
        },
        { status: 400 }
      );
    }

    // Check if attendance already exists
    const existingAttendance = await prisma.musyrifAttendance.findFirst({
      where: {
        musyrifId,
        halaqahId,
        date: new Date(date),
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          message: "Absensi untuk tanggal ini sudah ada",
        },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendance = await prisma.musyrifAttendance.create({
      data: {
        musyrifId,
        halaqahId,
        date: new Date(date),
        status,
        checkInTime: checkInTime ? new Date(checkInTime) : null,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        sessionType,
        notes,
      },
      include: {
        halaqah: {
          select: {
            id: true,
            name: true,
          },
        },
        musyrif: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Auto-update payroll
    await updateMonthlyPayroll(musyrifId, halaqahId, new Date(date));

    return NextResponse.json({
      success: true,
      attendance,
      message: "Absensi berhasil dicatat",
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mencatat absensi",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to update monthly payroll (same as in qr-scan)
async function updateMonthlyPayroll(musyrifId: string, halaqahId: string, date: Date) {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Count attendance for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const attendanceStats = await prisma.musyrifAttendance.groupBy({
      by: ["status"],
      where: {
        musyrifId,
        halaqahId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _count: {
        status: true,
      },
    });

    const totalSessions = attendanceStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const attendedSessions = attendanceStats
      .filter((stat) => stat.status === "PRESENT" || stat.status === "LATE")
      .reduce((sum, stat) => sum + stat._count.status, 0);
    const lateSessions = attendanceStats
      .filter((stat) => stat.status === "LATE")
      .reduce((sum, stat) => sum + stat._count.status, 0);

    // Get salary settings for MUSYRIF
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "admin123",
      database: "db_tpq",
    });

    const [salaryRows] = await connection.execute(
      "SELECT * FROM salary_settings WHERE position = ? AND is_active = 1 LIMIT 1",
      ["MUSYRIF"]
    );

    const salarySettings = (salaryRows as any[])[0];
    const sessionRate = salarySettings?.base_amount || 50000;
    const baseSalary = attendedSessions * sessionRate;
    const attendanceBonus = (attendedSessions / Math.max(totalSessions, 1)) >= 0.9 ? 100000 : 0;
    const grossSalary = baseSalary + attendanceBonus;
    const netSalary = grossSalary;

    // Update payroll
    await connection.execute(
      `
      INSERT INTO payroll (
        employee_id, period_month, period_year, total_sessions, attended_sessions,
        absent_sessions, late_sessions, base_salary, session_rate, attendance_bonus,
        overtime_pay, allowances, deductions, gross_salary, net_salary, status,
        generated_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        total_sessions = VALUES(total_sessions),
        attended_sessions = VALUES(attended_sessions),
        absent_sessions = VALUES(absent_sessions),
        late_sessions = VALUES(late_sessions),
        base_salary = VALUES(base_salary),
        attendance_bonus = VALUES(attendance_bonus),
        gross_salary = VALUES(gross_salary),
        net_salary = VALUES(net_salary),
        updated_at = NOW()
      `,
      [
        musyrifId,
        month,
        year,
        totalSessions,
        attendedSessions,
        totalSessions - attendedSessions,
        lateSessions,
        baseSalary,
        sessionRate,
        attendanceBonus,
        0, 0, 0,
        grossSalary,
        netSalary,
        "DRAFT",
      ]
    );

    await connection.end();
  } catch (error) {
    console.error("Error updating payroll:", error);
  }
}
