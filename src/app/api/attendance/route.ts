import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationTriggerService } from '@/lib/notification-triggers';

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const santriId = searchParams.get('santriId');
    const halaqahId = searchParams.get('halaqahId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (santriId) {
      where.santriId = santriId;
    }

    if (halaqahId) {
      where.halaqahId = halaqahId;
    }

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

    const [attendanceRecords, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          santri: {
            select: {
              id: true,
              nis: true,
              name: true
            }
          },
          halaqah: {
            select: {
              id: true,
              name: true,
              level: true
            }
          },
          musyrif: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.attendance.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        attendanceRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch attendance records',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/attendance - Create attendance record
export async function POST(request: NextRequest) {
  try {
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
      photo
    } = body;

    // Validation
    if (!santriId || !halaqahId || !musyrifId || !date || !status) {
      return NextResponse.json(
        { success: false, message: 'Santri ID, Halaqah ID, Musyrif ID, date, and status are required' },
        { status: 400 }
      );
    }

    // Check if attendance record already exists for this date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        santriId_halaqahId_date: {
          santriId,
          halaqahId,
          date: new Date(date)
        }
      }
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance record already exists for this date' },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        santriId,
        halaqahId,
        musyrifId,
        date: new Date(date),
        status,
        checkInTime: checkInTime ? new Date(checkInTime) : null,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        notes,
        latitude,
        longitude,
        photo
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true
          }
        },
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        musyrif: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Trigger attendance alert if student is absent
    if (status === 'ABSENT') {
      try {
        await NotificationTriggerService.sendAttendanceAlert(attendance.id);
        console.log(`Attendance alert triggered for attendance ${attendance.id}`);
      } catch (notificationError) {
        console.error('Error triggering attendance alert:', notificationError);
        // Don't fail the attendance creation if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance record created successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create attendance record',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
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
      photo
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Attendance ID is required' },
        { status: 400 }
      );
    }

    // Get current attendance record
    const currentAttendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        santri: {
          include: {
            wali: true
          }
        }
      }
    });

    if (!currentAttendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
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
        updatedAt: new Date()
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true
          }
        },
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        musyrif: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Trigger attendance alert if status changed to absent
    if (status === 'ABSENT' && currentAttendance.status !== 'ABSENT') {
      try {
        await NotificationTriggerService.sendAttendanceAlert(id);
        console.log(`Attendance alert triggered for updated attendance ${id}`);
      } catch (notificationError) {
        console.error('Error triggering attendance alert:', notificationError);
        // Don't fail the update if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: updatedAttendance
    });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update attendance record',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
