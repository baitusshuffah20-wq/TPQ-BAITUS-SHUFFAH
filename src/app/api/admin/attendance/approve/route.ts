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
        { success: false, message: "Access denied. Only admin can approve attendance." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { attendanceId, action, notes } = body;

    if (!attendanceId || !action) {
      return NextResponse.json(
        { success: false, message: "Attendance ID and action are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    console.log(`🔌 ${action} attendance: ${attendanceId}`);

    // Get attendance record with related data
    const attendance = await prisma.musyrifAttendance.findUnique({
      where: { id: attendanceId },
      include: {
        musyrif: {
          include: {
            user: true,
          },
        },
        halaqah: true,
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 }
      );
    }

    if (attendance.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "Attendance has already been processed" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update attendance status
      const updatedAttendance = await tx.musyrifAttendance.update({
        where: { id: attendanceId },
        data: {
          status: action as "APPROVED" | "REJECTED",
          approvedBy: session.user.id,
          approvedAt: new Date(),
          notes: notes || null,
        },
      });

      return updatedAttendance;
    });

    // If approved, auto-create earning record
    let earningId = null;
    if (action === "APPROVED") {
      console.log(`🔌 Auto-creating earning for approved attendance: ${attendanceId}`);
      earningId = await autoCreateEarningFromAttendance(attendanceId, session.user.id);
      
      if (earningId) {
        console.log(`✅ Auto-created earning: ${earningId}`);
      } else {
        console.log(`⚠️ Failed to auto-create earning for attendance: ${attendanceId}`);
      }
    }

    console.log(`✅ Attendance ${action.toLowerCase()}: ${result.id}`);

    return NextResponse.json({
      success: true,
      message: `Attendance berhasil ${action.toLowerCase()}${earningId ? ' dan earning otomatis dibuat' : ''}`,
      data: {
        attendanceId: result.id,
        status: result.status,
        approvedBy: result.approvedBy,
        approvedAt: result.approvedAt,
        earningId: earningId,
      },
    });

  } catch (error) {
    console.error("❌ Error processing attendance:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat memproses attendance",
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
        { success: false, message: "Access denied. Only admin can view attendance." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const limit = parseInt(searchParams.get("limit") || "20");

    console.log(`🔌 Fetching attendance with status: ${status}`);

    // Get attendance records with musyrif info
    const attendanceList = await prisma.musyrifAttendance.findMany({
      where: {
        status: status as "PENDING" | "APPROVED" | "REJECTED",
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
          },
        },
        halaqah: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
    });

    const formattedAttendance = attendanceList.map(attendance => ({
      id: attendance.id,
      musyrifId: attendance.musyrifId,
      musyrifName: attendance.musyrif.name,
      halaqahId: attendance.halaqahId,
      halaqahName: attendance.halaqah.name,
      date: attendance.date,
      sessionType: attendance.sessionType,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      status: attendance.status,
      qrCodeData: attendance.qrCodeData,
      location: attendance.location,
      notes: attendance.notes,
      approvedBy: attendance.approvedBy,
      approvedAt: attendance.approvedAt,
      createdAt: attendance.createdAt,
    }));

    console.log(`✅ Found ${formattedAttendance.length} attendance records`);

    return NextResponse.json({
      success: true,
      data: formattedAttendance,
    });

  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil data attendance",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
