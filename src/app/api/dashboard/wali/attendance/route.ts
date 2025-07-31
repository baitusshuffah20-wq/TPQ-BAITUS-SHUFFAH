import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is WALI
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "WALI") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Get wali's children
    const children = await prisma.santri.findMany({
      where: { 
        waliId: session.user.id,
        ...(childId ? { id: childId } : {})
      },
      select: {
        id: true,
        name: true,
        nis: true,
        halaqah: {
          select: {
            name: true,
            musyrif: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (children.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          children: [],
          attendanceRecords: [],
          statistics: {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            attendanceRate: 0
          }
        }
      });
    }

    const selectedChild = children[0];
    const childIds = children.map(child => child.id);

    // Determine date range
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        santriId: { in: childIds },
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        santri: {
          select: {
            id: true,
            name: true
          }
        },
        recordedByUser: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: { date: "desc" }
    });

    // Process attendance data for calendar view
    const attendanceCalendar = [];
    const daysInMonth = endDate.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(targetYear, targetMonth, day);
      const dayOfWeek = currentDay.getDay();
      
      // Skip Sundays (0) as TPQ is usually closed
      if (dayOfWeek === 0) {
        continue;
      }

      const attendanceForDay = attendanceRecords.find(record => 
        record.date.getDate() === day &&
        record.date.getMonth() === targetMonth &&
        record.date.getFullYear() === targetYear
      );

      let status = "no-data";
      let statusText = "Tidak ada data";
      let statusColor = "bg-gray-200";

      if (attendanceForDay) {
        switch (attendanceForDay.status) {
          case "PRESENT":
            status = "present";
            statusText = "Hadir";
            statusColor = "bg-green-500";
            break;
          case "ABSENT":
            status = "absent";
            statusText = "Tidak Hadir";
            statusColor = "bg-red-500";
            break;
          case "LATE":
            status = "late";
            statusText = "Terlambat";
            statusColor = "bg-yellow-500";
            break;
          case "SICK":
            status = "sick";
            statusText = "Sakit";
            statusColor = "bg-blue-500";
            break;
          case "PERMISSION":
            status = "permission";
            statusText = "Izin";
            statusColor = "bg-purple-500";
            break;
        }
      }

      attendanceCalendar.push({
        date: currentDay.toISOString().split('T')[0],
        day: day,
        dayOfWeek: currentDay.toLocaleDateString('id-ID', { weekday: 'short' }),
        status: status,
        statusText: statusText,
        statusColor: statusColor,
        notes: attendanceForDay?.notes || "",
        recordedBy: attendanceForDay?.recordedByUser?.name || "",
        recordedAt: attendanceForDay?.recordedAt?.toISOString() || ""
      });
    }

    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === "PRESENT").length;
    const lateDays = attendanceRecords.filter(record => record.status === "LATE").length;
    const absentDays = attendanceRecords.filter(record => record.status === "ABSENT").length;
    const sickDays = attendanceRecords.filter(record => record.status === "SICK").length;
    const permissionDays = attendanceRecords.filter(record => record.status === "PERMISSION").length;

    const attendanceRate = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

    // Get attendance trend (last 3 months)
    const trendMonths = [];
    for (let i = 2; i >= 0; i--) {
      const trendDate = new Date(targetYear, targetMonth - i, 1);
      const trendEndDate = new Date(targetYear, targetMonth - i + 1, 0);
      
      const trendRecords = await prisma.attendance.findMany({
        where: {
          santriId: { in: childIds },
          date: {
            gte: trendDate,
            lte: trendEndDate
          }
        }
      });

      const trendTotal = trendRecords.length;
      const trendPresent = trendRecords.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
      const trendRate = trendTotal > 0 ? Math.round((trendPresent / trendTotal) * 100) : 0;

      trendMonths.push({
        month: trendDate.toLocaleDateString('id-ID', { month: 'short' }),
        rate: trendRate,
        present: trendPresent,
        total: trendTotal
      });
    }

    // Get recent attendance issues (absences without permission)
    const attendanceIssues = attendanceRecords
      .filter(record => record.status === "ABSENT" && !record.notes)
      .slice(0, 5)
      .map(record => ({
        date: record.date.toISOString().split('T')[0],
        santriName: record.santri.name,
        reason: record.notes || "Tidak ada keterangan",
        followUpNeeded: true
      }));

    // List view data (recent records)
    const recentAttendance = attendanceRecords.slice(0, 20).map(record => ({
      id: record.id,
      date: record.date.toISOString().split('T')[0],
      day: record.date.toLocaleDateString('id-ID', { weekday: 'long' }),
      status: record.status,
      statusText: record.status === "PRESENT" ? "Hadir" :
                  record.status === "ABSENT" ? "Tidak Hadir" :
                  record.status === "LATE" ? "Terlambat" :
                  record.status === "SICK" ? "Sakit" : "Izin",
      statusColor: record.status === "PRESENT" ? "bg-green-500" :
                   record.status === "ABSENT" ? "bg-red-500" :
                   record.status === "LATE" ? "bg-yellow-500" :
                   record.status === "SICK" ? "bg-blue-500" : "bg-purple-500",
      notes: record.notes || "",
      recordedBy: record.recordedByUser?.name || "",
      santriName: record.santri.name
    }));

    return NextResponse.json({
      success: true,
      data: {
        children,
        selectedChild,
        attendanceCalendar,
        recentAttendance,
        attendanceIssues,
        statistics: {
          totalDays,
          presentDays,
          lateDays,
          absentDays,
          sickDays,
          permissionDays,
          attendanceRate,
          trend: trendMonths
        },
        period: {
          month: targetMonth + 1,
          year: targetYear,
          monthName: startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        }
      }
    });

  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is WALI
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true }
    });

    if (user?.role !== "WALI") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, childId, date, reason } = body;

    if (action === "request_permission") {
      if (!childId || !date || !reason) {
        return NextResponse.json(
          { error: "Child ID, date, and reason are required" },
          { status: 400 }
        );
      }

      // Verify child belongs to wali
      const child = await prisma.santri.findFirst({
        where: {
          id: childId,
          waliId: session.user.id
        },
        include: {
          halaqah: {
            include: {
              musyrif: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });

      if (!child) {
        return NextResponse.json(
          { error: "Child not found or access denied" },
          { status: 404 }
        );
      }

      // Create notification to musyrif for permission request
      if (child.halaqah?.musyrif?.user) {
        await prisma.notification.create({
          data: {
            userId: child.halaqah.musyrif.user.id,
            title: "Permohonan Izin Tidak Hadir",
            message: `${user.name} memohon izin untuk ${child.name} tidak hadir pada tanggal ${new Date(date).toLocaleDateString('id-ID')}. Alasan: ${reason}`,
            type: "PERMISSION_REQUEST",
            priority: "NORMAL",
            status: "SENT",
            channels: "IN_APP,WHATSAPP",
            recipientType: "MUSYRIF",
            relatedId: childId,
            metadata: JSON.stringify({ date, reason, childId }),
            createdBy: session.user.id,
            sentAt: new Date()
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          message: "Permission request sent successfully",
          childId,
          date,
          reason
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error processing attendance request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
