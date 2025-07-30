import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationTriggerService } from "@/lib/notification-triggers";
import { AchievementEngine } from "@/lib/achievement-engine";
import { requireAuth, ApiResponse } from "@/lib/auth-middleware";
import { hasPermission } from "@/lib/permissions";

// GET /api/attendance - Get attendance records based on user permissions
export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API attendance called");

    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check permission
    if (!hasPermission(authResult.role, 'attendance:view')) {
      return ApiResponse.forbidden("Access denied to attendance data");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const santriId = searchParams.get("santriId");
    const halaqahId = searchParams.get("halaqahId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    console.log("📊 Query params:", {
      page,
      limit,
      santriId,
      halaqahId,
      status,
      dateFrom,
      dateTo,
    });
    console.log("User role:", authResult.role, "User ID:", authResult.id);

    const skip = (page - 1) * limit;

    // Build where clause with role-based filtering
    const where: any = {};

    // Apply role-based filtering
    if (authResult.role === 'MUSYRIF') {
      // Musyrif can only see attendance for santri in their halaqah
      const musyrifHalaqah = await prisma.halaqah.findMany({
        where: { musyrifId: authResult.id },
        select: { id: true }
      });

      const halaqahIds = musyrifHalaqah.map(h => h.id);

      if (halaqahIds.length === 0) {
        return ApiResponse.success([], "No attendance found - no halaqah assigned");
      }

      where.halaqahId = { in: halaqahIds };
      console.log("Musyrif access: filtering by halaqahIds =", halaqahIds);
    } else if (authResult.role === 'SANTRI') {
      // Santri can only see their own attendance
      where.santriId = authResult.id;
    } else if (authResult.role === 'WALI') {
      // Wali can see attendance of their children
      const children = await prisma.santri.findMany({
        where: { waliId: authResult.id },
        select: { id: true }
      });

      const childrenIds = children.map(c => c.id);

      if (childrenIds.length === 0) {
        return ApiResponse.success([], "No attendance found - no children assigned");
      }

      where.santriId = { in: childrenIds };
    } else if (authResult.role === 'ADMIN') {
      // Admin can see all attendance, apply requested filters
      if (halaqahId) {
        where.halaqahId = halaqahId;
      }
      if (santriId) {
        where.santriId = santriId;
      }
    }

    // Apply common filters (only if not already set by role-based filtering)
    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    console.log("🔍 Where clause:", JSON.stringify(where, null, 2));

    // First, try a simple query without includes to test basic connectivity
    console.log("🔄 Testing basic attendance query...");
    const basicAttendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limit,
    });

    console.log("✅ Basic query successful:", {
      recordsFound: basicAttendance.length,
    });

    // Now try with includes
    console.log("🔄 Testing query with includes...");
    const [attendanceRecords, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          santri: {
            select: {
              id: true,
              nis: true,
              name: true,
            },
          },
          halaqah: {
            select: {
              id: true,
              name: true,
              level: true,
            },
          },
          musyrif: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    console.log("✅ Query with includes successful:", {
      recordsFound: attendanceRecords.length,
      total,
    });

    return NextResponse.json({
      success: true,
      data: {
        attendanceRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch attendance records",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/attendance - Create attendance record (Musyrif and Admin can create)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check permission
    if (!hasPermission(authResult.role, 'attendance:create')) {
      return ApiResponse.forbidden("Access denied to create attendance");
    }

    const body = await request.json();
    const {
      santriId,
      halaqahId,
      musyrifId,
      date,
      status,
      checkInTime,
      checkOutTime,
      notes,
      latitude,
      longitude,
      photo,
    } = body;

    // Validation
    if (!santriId || !halaqahId || !date || !status) {
      return ApiResponse.error("Santri ID, Halaqah ID, date, and status are required");
    }

    // For musyrif, validate they can only create attendance for their own halaqah
    let finalMusyrifId = musyrifId;
    if (authResult.role === 'MUSYRIF') {
      // Verify the halaqah belongs to the musyrif
      const halaqah = await prisma.halaqah.findUnique({
        where: { id: halaqahId }
      });

      if (!halaqah || halaqah.musyrifId !== authResult.id) {
        return ApiResponse.forbidden("You can only create attendance for your own halaqah");
      }

      // Use the authenticated musyrif's ID
      finalMusyrifId = authResult.id;

      // Verify the santri is in the musyrif's halaqah
      const santri = await prisma.santri.findUnique({
        where: { id: santriId }
      });

      if (!santri || santri.halaqahId !== halaqahId) {
        return ApiResponse.forbidden("Santri is not in your halaqah");
      }
    }

    // Check if attendance record already exists for this date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        santriId_halaqahId_date: {
          santriId,
          halaqahId,
          date: new Date(date),
        },
      },
    });

    if (existingAttendance) {
      return ApiResponse.error("Attendance record already exists for this date");
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        santriId,
        halaqahId,
        musyrifId: finalMusyrifId,
        date: new Date(date),
        status,
        checkInTime: checkInTime ? new Date(checkInTime) : null,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        notes,
        latitude,
        longitude,
        photo,
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
          },
        },
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true,
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

    // Trigger attendance alert if student is absent
    if (status === "ABSENT") {
      try {
        await NotificationTriggerService.sendAttendanceAlert(attendance.id);
        console.log(
          `Attendance alert triggered for attendance ${attendance.id}`,
        );
      } catch (notificationError) {
        console.error("Error triggering attendance alert:", notificationError);
        // Don't fail the attendance creation if notification fails
      }
    }

    // Trigger achievement check after attendance creation
    try {
      await AchievementEngine.onAttendanceAdded(santriId);
    } catch (achievementError) {
      console.error(
        "Error checking achievements after attendance creation:",
        achievementError,
      );
      // Don't fail the attendance creation if achievement check fails
    }

    return NextResponse.json({
      success: true,
      message: "Attendance record created successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error creating attendance record:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create attendance record",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT /api/attendance - Update attendance record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      checkInTime,
      checkOutTime,
      notes,
      latitude,
      longitude,
      photo,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Attendance ID is required" },
        { status: 400 },
      );
    }

    // Get current attendance record
    const currentAttendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        santri: {
          include: {
            wali: true,
          },
        },
      },
    });

    if (!currentAttendance) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 },
      );
    }

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(checkInTime && { checkInTime: new Date(checkInTime) }),
        ...(checkOutTime && { checkOutTime: new Date(checkOutTime) }),
        ...(notes !== undefined && { notes }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
        ...(photo !== undefined && { photo }),
        updatedAt: new Date(),
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
          },
        },
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true,
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

    // Trigger attendance alert if status changed to absent
    if (status === "ABSENT" && currentAttendance.status !== "ABSENT") {
      try {
        await NotificationTriggerService.sendAttendanceAlert(id);
        console.log(`Attendance alert triggered for updated attendance ${id}`);
      } catch (notificationError) {
        console.error("Error triggering attendance alert:", notificationError);
        // Don't fail the update if notification fails
      }
    }

    // Trigger achievement check after attendance update
    try {
      await AchievementEngine.onAttendanceAdded(currentAttendance.santriId);
    } catch (achievementError) {
      console.error(
        "Error checking achievements after attendance update:",
        achievementError,
      );
      // Don't fail the attendance update if achievement check fails
    }

    return NextResponse.json({
      success: true,
      message: "Attendance record updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update attendance record",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
