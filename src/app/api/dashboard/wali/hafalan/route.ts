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
                id: true,
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
          hafalanProgress: [],
          statistics: {
            totalCompleted: 0,
            totalInProgress: 0,
            averageGrade: 0,
            currentLevel: "Belum ada data"
          }
        }
      });
    }

    const selectedChild = children[0];
    const childIds = children.map(child => child.id);

    // Get hafalan records
    const hafalanRecords = await prisma.hafalan.findMany({
      where: {
        santriId: { in: childIds }
      },
      include: {
        santri: {
          select: {
            id: true,
            name: true
          }
        },
        musyrif: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { surahNumber: "asc" },
        { ayahStart: "asc" }
      ]
    });

    // Process hafalan data
    const hafalanProgress = hafalanRecords.map(hafalan => {
      let statusText = "Belum Dimulai";
      let statusColor = "bg-gray-500";
      
      switch (hafalan.status) {
        case "IN_PROGRESS":
          statusText = "Sedang Dihafal";
          statusColor = "bg-blue-500";
          break;
        case "COMPLETED":
          statusText = "Selesai";
          statusColor = "bg-green-500";
          break;
        case "REVIEW":
          statusText = "Muraja'ah";
          statusColor = "bg-yellow-500";
          break;
        case "PENDING":
          statusText = "Menunggu";
          statusColor = "bg-orange-500";
          break;
      }

      return {
        id: hafalan.id,
        surah: hafalan.surahName,
        surahNumber: hafalan.surahNumber,
        ayahRange: `${hafalan.ayahStart}-${hafalan.ayahEnd}`,
        status: statusText,
        statusColor: statusColor,
        grade: hafalan.grade || 0,
        notes: hafalan.notes || "",
        recordedAt: hafalan.recordedAt.toISOString(),
        musyrif: hafalan.musyrif.name,
        santriId: hafalan.santriId,
        santriName: hafalan.santri.name,
        audioUrl: hafalan.audioUrl || null,
        difficulty: hafalan.difficulty || "MEDIUM"
      };
    });

    // Calculate statistics
    const completedHafalan = hafalanRecords.filter(h => h.status === "COMPLETED");
    const inProgressHafalan = hafalanRecords.filter(h => h.status === "IN_PROGRESS");
    const totalCompleted = completedHafalan.length;
    const totalInProgress = inProgressHafalan.length;
    
    const averageGrade = hafalanRecords.length > 0 ? 
      Math.round(hafalanRecords.reduce((sum, h) => sum + (h.grade || 0), 0) / hafalanRecords.length) : 0;

    // Determine current level
    const latestCompleted = completedHafalan
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
    const currentLevel = latestCompleted ? latestCompleted.surahName : "Belum ada hafalan selesai";

    // Get recent activity (last 10 records)
    const recentActivity = hafalanRecords
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, 10)
      .map(hafalan => ({
        id: hafalan.id,
        action: hafalan.status === "COMPLETED" ? "Menyelesaikan" : 
                hafalan.status === "IN_PROGRESS" ? "Memulai" : "Mengulang",
        surah: hafalan.surahName,
        date: hafalan.recordedAt.toISOString(),
        musyrif: hafalan.musyrif.name,
        grade: hafalan.grade,
        santriName: hafalan.santri.name
      }));

    // Get progress by surah (group by surah)
    const surahProgress = hafalanRecords.reduce((acc, hafalan) => {
      const surahName = hafalan.surahName;
      if (!acc[surahName]) {
        acc[surahName] = {
          surahName: surahName,
          surahNumber: hafalan.surahNumber,
          totalAyah: 0,
          completedAyah: 0,
          inProgressAyah: 0,
          averageGrade: 0,
          records: []
        };
      }
      
      const ayahCount = hafalan.ayahEnd - hafalan.ayahStart + 1;
      acc[surahName].totalAyah += ayahCount;
      acc[surahName].records.push(hafalan);
      
      if (hafalan.status === "COMPLETED") {
        acc[surahName].completedAyah += ayahCount;
      } else if (hafalan.status === "IN_PROGRESS") {
        acc[surahName].inProgressAyah += ayahCount;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate average grade for each surah
    Object.values(surahProgress).forEach((surah: any) => {
      const grades = surah.records.filter((r: any) => r.grade > 0).map((r: any) => r.grade);
      surah.averageGrade = grades.length > 0 ? 
        Math.round(grades.reduce((sum: number, grade: number) => sum + grade, 0) / grades.length) : 0;
      surah.progress = surah.totalAyah > 0 ? 
        Math.round((surah.completedAyah / surah.totalAyah) * 100) : 0;
    });

    const surahProgressArray = Object.values(surahProgress)
      .sort((a: any, b: any) => a.surahNumber - b.surahNumber);

    // Get musyrif notes (from latest hafalan records)
    const musyrifNotes = hafalanRecords
      .filter(h => h.notes && h.notes.trim() !== "")
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, 5)
      .map(hafalan => ({
        id: hafalan.id,
        surah: hafalan.surahName,
        note: hafalan.notes,
        date: hafalan.recordedAt.toISOString(),
        musyrif: hafalan.musyrif.name,
        grade: hafalan.grade
      }));

    return NextResponse.json({
      success: true,
      data: {
        children,
        selectedChild,
        hafalanProgress,
        surahProgress: surahProgressArray,
        recentActivity,
        musyrifNotes,
        statistics: {
          totalCompleted,
          totalInProgress,
          averageGrade,
          currentLevel,
          totalRecords: hafalanRecords.length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching hafalan data:", error);
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
      select: { role: true }
    });

    if (user?.role !== "WALI") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, hafalanId, childId, notes } = body;

    if (action === "add_parent_note") {
      if (!hafalanId || !notes) {
        return NextResponse.json(
          { error: "Hafalan ID and notes are required" },
          { status: 400 }
        );
      }

      // Verify the hafalan belongs to wali's child
      const hafalan = await prisma.hafalan.findFirst({
        where: {
          id: hafalanId,
          santri: {
            waliId: session.user.id
          }
        }
      });

      if (!hafalan) {
        return NextResponse.json(
          { error: "Hafalan not found or access denied" },
          { status: 404 }
        );
      }

      // Add parent note (could be stored in a separate table or appended to existing notes)
      const parentNote = `[Catatan Wali - ${new Date().toLocaleDateString('id-ID')}]: ${notes}`;
      const updatedNotes = hafalan.notes ? `${hafalan.notes}\n\n${parentNote}` : parentNote;

      await prisma.hafalan.update({
        where: { id: hafalanId },
        data: { notes: updatedNotes }
      });

      return NextResponse.json({
        success: true,
        data: {
          message: "Parent note added successfully",
          hafalanId
        }
      });
    }

    if (action === "request_review") {
      if (!childId) {
        return NextResponse.json(
          { error: "Child ID is required" },
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

      // Create notification to musyrif
      if (child.halaqah?.musyrif?.user) {
        await prisma.notification.create({
          data: {
            userId: child.halaqah.musyrif.user.id,
            title: "Permintaan Review Hafalan",
            message: `Wali dari ${child.name} meminta review hafalan. Mohon untuk melakukan evaluasi hafalan terbaru.`,
            type: "REVIEW_REQUEST",
            priority: "NORMAL",
            status: "SENT",
            channels: "IN_APP,WHATSAPP",
            recipientType: "MUSYRIF",
            relatedId: childId,
            createdBy: session.user.id,
            sentAt: new Date()
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          message: "Review request sent to musyrif",
          childId
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error processing hafalan request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
