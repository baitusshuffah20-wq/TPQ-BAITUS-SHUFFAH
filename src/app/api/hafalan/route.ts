import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AchievementEngine } from "@/lib/achievement-engine";

// GET /api/hafalan - Get all hafalan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get("santriId");
    const musyrifId = searchParams.get("musyrifId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = {};

    if (santriId) {
      where.santriId = santriId;
    }

    if (musyrifId) {
      where.musyrifId = musyrifId;
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

// POST /api/hafalan - Create new hafalan
export async function POST(request: NextRequest) {
  try {
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
      !type ||
      !musyrifId
    ) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
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

    // Check if musyrif exists
    const musyrif = await prisma.user.findUnique({
      where: { id: musyrifId, role: "MUSYRIF" },
    });

    if (!musyrif) {
      return NextResponse.json(
        { success: false, message: "Musyrif tidak ditemukan" },
        { status: 400 },
      );
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
        musyrifId,
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
