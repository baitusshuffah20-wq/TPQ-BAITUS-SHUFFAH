import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/halaqah/materials - Get materials (with optional halaqahId filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get("halaqahId");
    const status = searchParams.get("status") || "ACTIVE";

    const where: any = {};

    if (halaqahId) {
      where.halaqahId = halaqahId;
    }

    if (status !== "ALL") {
      where.status = status;
    }

    const materials = await prisma.halaqahMaterial.findMany({
      where,
      include: {
        halaqah: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
      orderBy: [{ halaqahId: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({
      success: true,
      materials,
      total: materials.length,
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data materi" },
      { status: 500 },
    );
  }
}

// POST /api/halaqah/materials - Create new material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, content, fileUrl, order, halaqahId } = body;

    // Validation
    if (!title || !halaqahId) {
      return NextResponse.json(
        { success: false, message: "Judul dan ID halaqah wajib diisi" },
        { status: 400 },
      );
    }

    // Check if halaqah exists
    const halaqah = await prisma.halaqah.findUnique({
      where: { id: halaqahId },
    });

    if (!halaqah) {
      return NextResponse.json(
        { success: false, message: "Halaqah tidak ditemukan" },
        { status: 400 },
      );
    }

    // Get max order if not provided
    let materialOrder = order;
    if (!materialOrder) {
      const maxOrder = await prisma.halaqahMaterial.findFirst({
        where: { halaqahId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      materialOrder = maxOrder ? maxOrder.order + 1 : 1;
    }

    // Create material
    const material = await prisma.halaqahMaterial.create({
      data: {
        title,
        description: description || "",
        content: content || "",
        fileUrl: fileUrl || "",
        order: materialOrder,
        halaqahId,
      },
      include: {
        halaqah: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Materi berhasil dibuat",
      material,
    });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat materi" },
      { status: 500 },
    );
  }
}
