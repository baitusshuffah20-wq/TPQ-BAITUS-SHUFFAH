import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Only allow MUSYRIF role
    if (session.user.role !== "MUSYRIF") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only musyrif can access santri data." },
        { status: 403 }
      );
    }

    console.log(`🔌 Fetching santri data for musyrif user ID: ${session.user.id}`);

    // Get musyrif record
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (!musyrifRecord) {
      console.log(`No musyrif record found for user ID: ${session.user.id}`);
      return NextResponse.json({
        success: true,
        message: "Belum ada data musyrif untuk user ini",
        data: [],
      });
    }

    console.log(`✅ Musyrif record found: ${musyrifRecord.id}`);

    // Get santri data for this musyrif
    const santriData = await prisma.santri.findMany({
      where: {
        halaqah: {
          musyrifId: musyrifRecord.id,
        },
        status: "ACTIVE",
      },
      include: {
        halaqah: {
          select: {
            name: true,
          },
        },
        hafalanProgress: {
          where: {
            status: "COMPLETED",
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 1,
          include: {
            surah: {
              select: {
                name: true,
              },
            },
          },
        },
        attendances: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            },
          },
        },
      },
    });

    // Process santri data
    const processedSantriData = santriData.map(santri => {
      // Calculate attendance rate for current month
      const totalAttendances = santri.attendances.length;
      const presentAttendances = santri.attendances.filter(att => att.status === "PRESENT").length;
      const attendanceRate = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 0;

      // Get last hafalan
      const lastHafalan = santri.hafalanProgress.length > 0 
        ? `${santri.hafalanProgress[0].surah.name} ${santri.hafalanProgress[0].ayahStart}-${santri.hafalanProgress[0].ayahEnd}`
        : "Belum ada hafalan";

      // Calculate progress (simplified - could be more complex)
      const totalHafalanCompleted = santri.hafalanProgress.length;
      const progress = Math.min(totalHafalanCompleted * 10, 100); // Simple calculation

      return {
        id: santri.id,
        name: santri.name,
        nis: santri.nis,
        age: santri.age || 0,
        halaqah: santri.halaqah?.name || "Tidak ada halaqah",
        progress,
        lastHafalan,
        attendanceRate,
        phone: santri.phone || "",
        address: santri.address || "",
        parentName: santri.parentName || "",
        status: santri.status,
        joinDate: santri.createdAt.toISOString().split('T')[0],
        photo: santri.photo,
      };
    });

    console.log(`✅ Santri data retrieved for musyrif ${musyrifRecord.id}: ${processedSantriData.length} santri`);

    return NextResponse.json({
      success: true,
      data: processedSantriData,
    });

  } catch (error) {
    console.error("❌ Error fetching santri data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil data santri",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
