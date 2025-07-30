import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AchievementEngine } from "@/lib/achievement-engine";
import { requireAuth, ApiResponse } from "@/lib/auth-middleware";
import { hasPermission } from "@/lib/permissions";

// GET /api/hafalan - Get hafalan (Admin can see all, Musyrif only their santri)
export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check permission
    if (!hasPermission(authResult.role, 'hafalan:view')) {
      return ApiResponse.forbidden("Access denied to hafalan data");
    }
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get("santriId");
    const musyrifId = searchParams.get("musyrifId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = {};

    // Role-based filtering
    if (authResult.role === 'MUSYRIF') {
      // Musyrif can only see hafalan for santri in their halaqah
      where.santri = {
        halaqah: {
          musyrifId: authResult.id
        }
      };
      console.log("Musyrif access: filtering hafalan for santri in their halaqah");
    } else if (authResult.role === 'ADMIN') {
      // Admin can see all hafalan, apply requested filters
      if (santriId) {
        where.santriId = santriId;
      }

      if (musyrifId) {
        where.musyrifId = musyrifId;
      }
    } else {
      // Other roles have limited access
      return ApiResponse.forbidden("Access denied to hafalan data");
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { surahName: { contains: search, mode: "insensitive" } },
        { santri: { name: { contains: search, mode: "insensitive" } } },
        { santri: { nis: { contains: search, mode: "insensitive" } } },
      ];
    }

    const hafalan = await prisma.hafalan.findMany({
      where,
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
            status: true,
            photo: true,
          },
        },
        musyrif: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      hafalan,
      total: hafalan.length,
    });
  } catch (error) {
    console.error("Error fetching hafalan:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data hafalan" },
      { status: 500 },
    );
  }
}

// POST /api/hafalan - Create new hafalan (Admin and Musyrif can create for their santri)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check permission
    if (!hasPermission(authResult.role, 'hafalan:create')) {
      return ApiResponse.forbidden("Access denied to create hafalan");
    }
    const body = await request.json();
    const {
      santriId,
      surahId,
      surahName,
      ayahStart,
      ayahEnd,
      type,
      status = "PENDING",
      notes,
      musyrifId,
    } = body;

    // Validation
    if (
      !santriId ||
      !surahId ||
      !surahName ||
      !ayahStart ||
      !ayahEnd ||
      !type
    ) {
      return ApiResponse.error("Semua field wajib diisi");
    }

    // For musyrif, validate they can only create hafalan for santri in their halaqah
    let finalMusyrifId = musyrifId;
    if (authResult.role === 'MUSYRIF') {
      // Verify the santri is in the musyrif's halaqah
      const santri = await prisma.santri.findUnique({
        where: { id: santriId },
        include: { halaqah: true }
      });

      if (!santri || santri.halaqah?.musyrifId !== authResult.id) {
        return ApiResponse.forbidden("You can only create hafalan for santri in your halaqah");
      }

      // Use the authenticated musyrif's ID
      finalMusyrifId = authResult.id;
    } else if (!musyrifId) {
      return ApiResponse.error("Musyrif ID is required");
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

    // Check if musyrif exists (only for admin)
    if (authResult.role === 'ADMIN' && finalMusyrifId) {
      const musyrif = await prisma.user.findUnique({
        where: { id: finalMusyrifId, role: "MUSYRIF" },
      });

      if (!musyrif) {
        return ApiResponse.error("Musyrif tidak ditemukan");
      }
    }

    // Create hafalan
    const hafalan = await prisma.hafalan.create({
      data: {
        santriId,
        surahId,
        surahName,
        ayahStart,
        ayahEnd,
        type,
        status,
        notes,
        musyrifId: finalMusyrifId,
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
            status: true,
            photo: true,
          },
        },
        musyrif: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Trigger achievement check after hafalan creation
    try {
      await AchievementEngine.onHafalanAdded(santriId);
    } catch (achievementError) {
      console.error(
        "Error checking achievements after hafalan creation:",
        achievementError,
      );
      // Don't fail the hafalan creation if achievement check fails
    }

    return NextResponse.json({
      success: true,
      message: "Hafalan berhasil dibuat",
      hafalan,
    });
  } catch (error) {
    console.error("Error creating hafalan:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat hafalan" },
      { status: 500 },
    );
  }
}
