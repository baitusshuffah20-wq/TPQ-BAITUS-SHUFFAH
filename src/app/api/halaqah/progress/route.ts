import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/halaqah/progress - Get progress (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get("santriId");
    const materialId = searchParams.get("materialId");
    const halaqahId = searchParams.get("halaqahId");
    const status = searchParams.get("status");

    const where: any = {};

    if (santriId) {
      where.santriId = santriId;
    }

    if (materialId) {
      where.materialId = materialId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    // If halaqahId is provided, we need to filter by materials that belong to this halaqah
    if (halaqahId) {
      where.material = {
        halaqahId: halaqahId,
      };
    }

    const progress = await prisma.halaqahProgress.findMany({
      where,
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
            status: true,
          },
        },
        material: {
          include: {
            halaqah: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      progress,
      total: progress.length,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data progres" },
      { status: 500 },
    );
  }
}

// POST /api/halaqah/progress - Create or update progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { santriId, materialId, status, notes, grade } = body;

    // Validation
    if (!santriId || !materialId) {
      return NextResponse.json(
        { success: false, message: "ID santri dan ID materi wajib diisi" },
        { status: 400 },
      );
    }

    // Check if santri exists
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
    });

    if (!santri) {
      return NextResponse.json(
        { success: false, message: "Santri tidak ditemukan" },
        { status: 400 },
      );
    }

    // Check if material exists
    const material = await prisma.halaqahMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Materi tidak ditemukan" },
        { status: 400 },
      );
    }

    // Check if progress already exists
    const existingProgress = await prisma.halaqahProgress.findUnique({
      where: {
        santriId_materialId: {
          santriId,
          materialId,
        },
      },
    });

    let progress;
    const now = new Date();

    if (existingProgress) {
      // Update existing progress
      progress = await prisma.halaqahProgress.update({
        where: {
          id: existingProgress.id,
        },
        data: {
          status: status || existingProgress.status,
          notes: notes !== undefined ? notes : existingProgress.notes,
          grade: grade !== undefined ? grade : existingProgress.grade,
          completedAt:
            status === "COMPLETED" && existingProgress.status !== "COMPLETED"
              ? now
              : status !== "COMPLETED" &&
                  existingProgress.status === "COMPLETED"
                ? null
                : existingProgress.completedAt,
        },
        include: {
          santri: {
            select: {
              id: true,
              nis: true,
              name: true,
            },
          },
          material: {
            include: {
              halaqah: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Create new progress
      progress = await prisma.halaqahProgress.create({
        data: {
          santriId,
          materialId,
          status: status || "NOT_STARTED",
          notes,
          grade,
          startDate: now,
          completedAt: status === "COMPLETED" ? now : null,
        },
        include: {
          santri: {
            select: {
              id: true,
              nis: true,
              name: true,
            },
          },
          material: {
            include: {
              halaqah: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: existingProgress
        ? "Progres berhasil diperbarui"
        : "Progres berhasil dibuat",
      progress,
    });
  } catch (error) {
    console.error("Error creating/updating progress:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat/memperbarui progres" },
      { status: 500 },
    );
  }
}
