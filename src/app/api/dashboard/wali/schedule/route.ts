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
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Get wali's children
    const children = await prisma.santri.findMany({
      where: { waliId: session.user.id },
      select: {
        id: true,
        name: true,
        nis: true,
        halaqah: {
          select: {
            id: true,
            name: true,
            schedules: {
              select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                room: true
              }
            },
            musyrif: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Get regular halaqah schedules
    const regularSchedules = [];
    children.forEach(child => {
      if (child.halaqah?.schedules) {
        child.halaqah.schedules.forEach(schedule => {
          regularSchedules.push({
            id: `schedule-${schedule.id}`,
            title: `Hafalan ${child.halaqah.name}`,
            type: "hafalan",
            dayOfWeek: schedule.dayOfWeek,
            time: `${schedule.startTime} - ${schedule.endTime}`,
            location: schedule.room || child.halaqah.name,
            musyrif: child.halaqah.musyrif?.name || "Belum ditentukan",
            description: `Kegiatan hafalan untuk ${child.name}`,
            participants: [child.name],
            color: "bg-teal-500",
            recurring: true
          });
        });
      }
    });

    // Get special events from notifications or create mock events
    const currentDate = new Date();
    const startOfMonth = month && year ? 
      new Date(parseInt(year), parseInt(month) - 1, 1) : 
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = month && year ? 
      new Date(parseInt(year), parseInt(month), 0) : 
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get notifications that might represent events
    const eventNotifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: { in: ["EVENT", "EVALUATION", "MEETING"] },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        createdAt: true,
        metadata: true
      }
    });

    // Convert notifications to events
    const specialEvents = eventNotifications.map(notification => {
      let eventType = "event";
      let color = "bg-blue-500";
      
      switch (notification.type) {
        case "EVALUATION":
          eventType = "evaluation";
          color = "bg-blue-500";
          break;
        case "MEETING":
          eventType = "meeting";
          color = "bg-purple-500";
          break;
        default:
          eventType = "event";
          color = "bg-green-500";
      }

      return {
        id: notification.id,
        title: notification.title,
        type: eventType,
        date: notification.createdAt.toISOString().split('T')[0],
        time: "09:00 - 11:00", // Default time, could be stored in metadata
        location: "TPQ Baitus Shuffah",
        musyrif: "Kepala TPQ",
        description: notification.message,
        participants: children.map(child => child.name),
        color: color
      };
    });

    // Add some default recurring events if no special events exist
    if (specialEvents.length === 0) {
      const defaultEvents = [
        {
          id: "eval-monthly",
          title: "Evaluasi Bulanan",
          type: "evaluation",
          date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 20).toISOString().split('T')[0],
          time: "09:00 - 11:00",
          location: "Aula TPQ",
          musyrif: "Kepala TPQ",
          description: "Evaluasi progress hafalan dan akhlak bulanan",
          participants: children.map(child => child.name),
          color: "bg-blue-500"
        },
        {
          id: "meeting-monthly",
          title: "Pertemuan Wali Santri",
          type: "meeting",
          date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).toISOString().split('T')[0],
          time: "19:00 - 21:00",
          location: "Aula TPQ",
          musyrif: "Kepala TPQ",
          description: "Pertemuan rutin wali santri membahas perkembangan anak",
          participants: ["Semua Wali"],
          color: "bg-purple-500"
        }
      ];
      specialEvents.push(...defaultEvents);
    }

    // Combine all events
    const allEvents = [...specialEvents];

    // Generate recurring schedule events for the month
    const recurringEvents = [];
    for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      regularSchedules.forEach(schedule => {
        if (schedule.dayOfWeek === dayOfWeek) {
          recurringEvents.push({
            ...schedule,
            id: `${schedule.id}-${date.toISOString().split('T')[0]}`,
            date: date.toISOString().split('T')[0]
          });
        }
      });
    }

    allEvents.push(...recurringEvents);

    // Get event statistics
    const hafalanCount = allEvents.filter(e => e.type === "hafalan").length;
    const evaluationCount = allEvents.filter(e => e.type === "evaluation").length;
    const eventCount = allEvents.filter(e => e.type === "event").length;
    const meetingCount = allEvents.filter(e => e.type === "meeting").length;

    // Get upcoming events (next 5)
    const now = new Date();
    const upcomingEvents = allEvents
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        events: allEvents,
        upcomingEvents,
        statistics: {
          hafalan: hafalanCount,
          evaluation: evaluationCount,
          event: eventCount,
          meeting: meetingCount,
          total: allEvents.length
        },
        children,
        regularSchedules
      }
    });

  } catch (error) {
    console.error("Error fetching schedule data:", error);
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
    const { action, eventId, reminderTime } = body;

    if (action === "set_reminder") {
      if (!eventId || !reminderTime) {
        return NextResponse.json(
          { error: "Event ID and reminder time are required" },
          { status: 400 }
        );
      }

      // Create a notification reminder
      const reminder = await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: "Pengingat Kegiatan",
          message: `Pengingat untuk kegiatan yang akan datang`,
          type: "REMINDER",
          priority: "NORMAL",
          status: "PENDING",
          channels: "IN_APP,WHATSAPP",
          scheduledAt: new Date(reminderTime),
          relatedId: eventId,
          metadata: JSON.stringify({ eventId, reminderTime }),
          createdBy: session.user.id
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          message: "Reminder set successfully",
          reminderId: reminder.id
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error processing schedule request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
