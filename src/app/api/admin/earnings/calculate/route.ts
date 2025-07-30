import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        { success: false, message: "Access denied. Only admin can calculate earnings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { attendanceId } = body;

    if (!attendanceId) {
      return NextResponse.json(
        { success: false, message: "Attendance ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔌 Calculating earnings for attendance: ${attendanceId}`);

    // Get attendance record with musyrif info
    const attendance = await prisma.musyrifAttendance.findUnique({
      where: { id: attendanceId },
      include: {
        musyrif: {
          include: {
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
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 }
      );
    }

    if (attendance.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Attendance must be approved first" },
        { status: 400 }
      );
    }

    // Check if earning already exists for this attendance
    const existingEarning = await prisma.musyrifEarning.findFirst({
      where: {
        attendanceId: attendanceId,
      },
    });

    if (existingEarning) {
      return NextResponse.json(
        { success: false, message: "Earning already calculated for this attendance" },
        { status: 400 }
      );
    }

    // Get musyrif record
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: attendance.musyrifId, // attendance.musyrifId is actually userId
      },
      include: {
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
    });

    if (!musyrifRecord || !musyrifRecord.salaryRates[0]) {
      return NextResponse.json(
        { success: false, message: "No active salary rate found for this musyrif" },
        { status: 400 }
      );
    }

    const salaryRate = musyrifRecord.salaryRates[0];

    // Calculate session duration and amount
    let sessionDuration = 0;
    let amount = 0;
    let calculationType: "PER_SESSION" | "PER_HOUR" = "PER_SESSION";

    if (attendance.checkInTime && attendance.checkOutTime) {
      // Calculate duration in minutes
      sessionDuration = Math.floor(
        (new Date(attendance.checkOutTime).getTime() - new Date(attendance.checkInTime).getTime()) / (1000 * 60)
      );
      
      // Use hourly rate if session is longer than 2 hours
      if (sessionDuration > 120) {
        calculationType = "PER_HOUR";
        const hours = sessionDuration / 60;
        amount = hours * Number(salaryRate.ratePerHour);
      } else {
        calculationType = "PER_SESSION";
        amount = Number(salaryRate.ratePerSession);
      }
    } else {
      // Default to per session if no check-in/out time
      calculationType = "PER_SESSION";
      amount = Number(salaryRate.ratePerSession);
    }

    // Create earning record
    const earning = await prisma.musyrifEarning.create({
      data: {
        musyrifId: musyrifRecord.id,
        attendanceId: attendanceId,
        amount: amount,
        calculationType: calculationType,
        sessionDuration: sessionDuration || null,
        rate: calculationType === "PER_HOUR" ? salaryRate.ratePerHour : salaryRate.ratePerSession,
        status: "PENDING",
        notes: `Auto-calculated from attendance on ${attendance.date.toDateString()}`,
      },
    });

    console.log(`✅ Earning calculated: ${earning.id} - Amount: ${amount}`);

    return NextResponse.json({
      success: true,
      message: "Earning berhasil dihitung",
      data: {
        id: earning.id,
        amount: Number(earning.amount),
        calculationType: earning.calculationType,
        sessionDuration: earning.sessionDuration,
        rate: Number(earning.rate),
        status: earning.status,
      },
    });

  } catch (error) {
    console.error("❌ Error calculating earnings:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat menghitung earning",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
