import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Scan QR Code untuk absensi musyrif
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { qrCode, latitude, longitude, notes } = body;

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          message: "QR Code wajib diisi",
        },
        { status: 400 }
      );
    }

    // Find QR session
    const qrSession = await prisma.qRCodeSession.findUnique({
      where: { qrCode },
      include: {
        halaqah: {
          include: {
            musyrif: {
              include: {
                user: true,
              },
            },
            schedules: true,
          },
        },
      },
    });

    if (!qrSession) {
      return NextResponse.json(
        {
          success: false,
          message: "QR Code tidak valid",
        },
        { status: 404 }
      );
    }

    // Check if QR session is still active
    if (!qrSession.isActive || new Date() > qrSession.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: "QR Code sudah tidak aktif atau expired",
        },
        { status: 400 }
      );
    }

    // Check if usage limit exceeded
    if (qrSession.usageCount >= qrSession.maxUsage) {
      return NextResponse.json(
        {
          success: false,
          message: "QR Code sudah mencapai batas penggunaan",
        },
        { status: 400 }
      );
    }

    // Verify user is the assigned musyrif
    if (session.user.id !== qrSession.halaqah.musyrif?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses untuk halaqah ini",
        },
        { status: 403 }
      );
    }

    // Check if attendance already exists for today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingAttendance = await prisma.musyrifAttendance.findFirst({
      where: {
        musyrifId: session.user.id,
        halaqahId: qrSession.halaqahId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda sudah melakukan absensi hari ini",
          attendance: existingAttendance,
        },
        { status: 400 }
      );
    }

    // Determine attendance status based on schedule
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    let status = "PRESENT";
    let isLate = false;

    // Check if there's a schedule for today
    const dayOfWeek = currentTime.getDay();
    const todaySchedule = qrSession.halaqah.schedules.find(
      (schedule) => schedule.dayOfWeek === dayOfWeek
    );

    if (todaySchedule) {
      const [startHour, startMinute] = todaySchedule.startTime.split(":").map(Number);
      const scheduleStartMinutes = startHour * 60 + startMinute;
      
      // Consider late if more than 15 minutes after start time
      if (currentTimeMinutes > scheduleStartMinutes + 15) {
        status = "LATE";
        isLate = true;
      }
    }

    // Create musyrif attendance record
    const attendance = await prisma.musyrifAttendance.create({
      data: {
        musyrifId: session.user.id,
        halaqahId: qrSession.halaqahId,
        date: qrSession.sessionDate,
        status,
        checkInTime: currentTime,
        sessionType: qrSession.sessionType,
        qrCodeUsed: qrCode,
        latitude,
        longitude,
        notes,
      },
    });

    // Update QR session usage count
    await prisma.qRCodeSession.update({
      where: { id: qrSession.id },
      data: {
        usageCount: qrSession.usageCount + 1,
        isActive: qrSession.usageCount + 1 >= qrSession.maxUsage ? false : true,
      },
    });

    // Auto-generate or update payroll for this month
    await updateMonthlyPayroll(session.user.id, qrSession.halaqahId, currentTime);

    return NextResponse.json({
      success: true,
      attendance: {
        ...attendance,
        halaqah: {
          id: qrSession.halaqah.id,
          name: qrSession.halaqah.name,
        },
        isLate,
      },
      message: `Absensi berhasil dicatat${isLate ? " (Terlambat)" : ""}`,
    });
  } catch (error) {
    console.error("Error scanning QR code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses absensi",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to update monthly payroll
async function updateMonthlyPayroll(musyrifId: string, halaqahId: string, date: Date) {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Get musyrif data
    const musyrif = await prisma.user.findUnique({
      where: { id: musyrifId },
      include: {
        musyrifProfile: true,
      },
    });

    if (!musyrif || musyrif.role !== "MUSYRIF") {
      return;
    }

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
    const salarySettings = await getSalarySettings("MUSYRIF");
    
    // Calculate salary
    const sessionRate = salarySettings?.base_amount || 50000; // Default 50k per session
    const baseSalary = attendedSessions * sessionRate;
    const attendanceBonus = (attendedSessions / Math.max(totalSessions, 1)) >= 0.9 ? 100000 : 0;
    const grossSalary = baseSalary + attendanceBonus;
    const netSalary = grossSalary; // No deductions for now

    // Create or update payroll record using raw MySQL
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "admin123",
      database: "db_tpq",
    });

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
        totalSessions - attendedSessions, // absent sessions
        lateSessions,
        baseSalary,
        sessionRate,
        attendanceBonus,
        0, // overtime_pay
        0, // allowances
        0, // deductions
        grossSalary,
        netSalary,
        "DRAFT", // status
      ]
    );

    await connection.end();
  } catch (error) {
    console.error("Error updating payroll:", error);
  }
}

// Helper function to get salary settings
async function getSalarySettings(position: string) {
  try {
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "admin123",
      database: "db_tpq",
    });

    const [rows] = await connection.execute(
      "SELECT * FROM salary_settings WHERE position = ? AND is_active = 1 LIMIT 1",
      [position]
    );

    await connection.end();
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error("Error getting salary settings:", error);
    return null;
  }
}
