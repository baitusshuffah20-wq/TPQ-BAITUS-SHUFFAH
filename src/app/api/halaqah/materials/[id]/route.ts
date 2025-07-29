import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/halaqah/materials/[id] - Get material by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    const material = await prisma.halaqahMaterial.findUnique({
      where: { id },
      include: {
        halaqah: {
          select: {
            id: true,
            name: true,
            type: true,
            musyrif: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        progress: {
          include: {
            santri: {
              select: {
                id: true,
                nis: true,
                name: true,
                status: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Materi tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data materi" },
      { status: 500 },
    );
  }
}

// PUT /api/halaqah/materials/[id] - Update material
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { title, description, content, fileUrl, order, status } = body;

    // Check if material exists
    const existingMaterial = await prisma.halaqahMaterial.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, message: "Materi tidak ditemukan" },
        { status: 404 },
      );
    }

    // Update material
    const material = await prisma.halaqahMaterial.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingMaterial.title,
        description:
          description !== undefined
            ? description
            : existingMaterial.description,
        content: content !== undefined ? content : existingMaterial.content,
        fileUrl: fileUrl !== undefined ? fileUrl : existingMaterial.fileUrl,
        order: order !== undefined ? order : existingMaterial.order,
        status: status !== undefined ? status : existingMaterial.status,
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
      message: "Materi berhasil diperbarui",
      material,
    });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui materi" },
      { status: 500 },
    );
  }
}

// DELETE /api/halaqah/materials/[id] - Delete material
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    // Check if material exists
    const existingMaterial = await prisma.halaqahMaterial.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, message: "Materi tidak ditemukan" },
        { status: 404 },
      );
    }

    // Delete material
    await prisma.halaqahMaterial.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Materi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus materi" },
      { status: 500 },
    );
  }
}
