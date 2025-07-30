import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/musyrif/halaqah - Get halaqah assigned to the logged-in musyrif
export async function GET(request: NextRequest) {
  try {
    console.log("🔌 Fetching halaqah for musyrif...");
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow MUSYRIF role to access this endpoint
    if (session.user.role !== "MUSYRIF") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only musyrif can access this endpoint." },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    console.log(`Fetching halaqah for musyrif user ID: ${userId}`);

    // First, get the musyrif record for this user
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
    });

    if (!musyrifRecord) {
      console.log(`No musyrif record found for user ID: ${userId}`);
      return NextResponse.json({
        success: true,
        message: "Belum ada data musyrif untuk user ini",
        data: [],
        summary: {
          totalHalaqah: 0,
          totalStudents: 0,
          totalCapacity: 0,
          averageProgress: 0,
          capacityUtilization: 0,
        },
      });
    }

    console.log(`Found musyrif record: ${musyrifRecord.id}`);

    // Get halaqah assigned to this musyrif through the halaqah.musyrifId field
    const halaqahList = await prisma.halaqah.findMany({
      where: {
        musyrifId: musyrifRecord.id,
        status: "ACTIVE",
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        santri: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            nis: true,
            name: true,
            status: true,
            enrollmentDate: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        schedules: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
        _count: {
          select: {
            santri: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`✅ Found ${halaqahList.length} halaqah for musyrif ${userId}`);

    // Transform data to include additional computed fields
    const transformedHalaqah = halaqahList.map((halaqah) => {
      // Calculate average progress from hafalan data (if needed)
      const averageProgress = 75; // Placeholder - can be calculated from actual hafalan data

      // Format schedule for display
      const scheduleDisplay = halaqah.schedules.map(schedule => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return `${days[schedule.dayOfWeek]} ${schedule.startTime}-${schedule.endTime}`;
      }).join(', ');

      return {
        id: halaqah.id,
        name: halaqah.name,
        description: halaqah.description || "",
        level: halaqah.level,
        capacity: halaqah.capacity,
        currentStudents: halaqah._count.santri,
        room: halaqah.room || "",
        schedule: scheduleDisplay,
        schedules: halaqah.schedules,
        status: halaqah.status,
        createdAt: halaqah.createdAt,
        updatedAt: halaqah.updatedAt,
        musyrif: halaqah.musyrif,
        santri: halaqah.santri,
        averageProgress,
        // Additional computed fields
        capacityPercentage: Math.round((halaqah._count.santri / halaqah.capacity) * 100),
        isNearCapacity: (halaqah._count.santri / halaqah.capacity) >= 0.8,
        totalSessions: halaqah.schedules.length * 4, // Assuming 4 weeks per month
      };
    });

    // Calculate summary statistics
    const totalStudents = transformedHalaqah.reduce((acc, h) => acc + h.currentStudents, 0);
    const totalCapacity = transformedHalaqah.reduce((acc, h) => acc + h.capacity, 0);
    const averageProgress = transformedHalaqah.length > 0 
      ? transformedHalaqah.reduce((acc, h) => acc + h.averageProgress, 0) / transformedHalaqah.length 
      : 0;

    const summary = {
      totalHalaqah: transformedHalaqah.length,
      totalStudents,
      totalCapacity,
      averageProgress: Math.round(averageProgress),
      capacityUtilization: totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0,
    };

    return NextResponse.json({
      success: true,
      message: "Halaqah berhasil dimuat",
      data: transformedHalaqah,
      summary,
    });

  } catch (error) {
    console.error("Error fetching musyrif halaqah:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat data halaqah",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
