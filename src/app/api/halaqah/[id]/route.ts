import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/halaqah/[id] - Get halaqah by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const halaqah = await prisma.halaqah.findUnique({
      where: { id: params.id },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
            status: true,
            enrollmentDate: true
          },
          orderBy: {
            name: 'asc'
          }
        },
        schedules: {
          orderBy: {
            dayOfWeek: 'asc'
          }
        },
        _count: {
          select: {
            santri: true
          }
        }
      }
    });

    if (!halaqah) {
      return NextResponse.json(
        { success: false, message: 'Halaqah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      halaqah
    });

  } catch (error) {
    console.error('Error fetching halaqah:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data halaqah' },
      { status: 500 }
    );
  }
}

// PUT /api/halaqah/[id] - Update halaqah
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      level, 
      capacity,
      musyrifId,
      schedules = []
    } = body;

    // Check if halaqah exists
    const existingHalaqah = await prisma.halaqah.findUnique({
      where: { id: params.id }
    });

    if (!existingHalaqah) {
      return NextResponse.json(
        { success: false, message: 'Halaqah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if name is already used by another halaqah
    if (name !== existingHalaqah.name) {
      const nameExists = await prisma.halaqah.findFirst({
        where: { 
          name,
          id: { not: params.id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, message: 'Nama halaqah sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Check if musyrif exists
    const musyrif = await prisma.musyrif.findUnique({
      where: { id: musyrifId }
    });

    if (!musyrif) {
      return NextResponse.json(
        { success: false, message: 'Musyrif tidak ditemukan' },
        { status: 400 }
      );
    }

    // Update halaqah with schedules
    const halaqah = await prisma.halaqah.update({
      where: { id: params.id },
      data: {
        name,
        description: description || '',
        level,
        capacity: capacity || 20,
        musyrifId,
        schedules: {
          deleteMany: {}, // Delete existing schedules
          create: schedules.map((schedule: any) => ({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: schedule.room || ''
          }))
        }
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        schedules: {
          orderBy: {
            dayOfWeek: 'asc'
          }
        },
        _count: {
          select: {
            santri: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Halaqah berhasil diupdate',
      halaqah
    });

  } catch (error) {
    console.error('Error updating halaqah:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate halaqah' },
      { status: 500 }
    );
  }
}

// DELETE /api/halaqah/[id] - Delete halaqah
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if halaqah exists
    const existingHalaqah = await prisma.halaqah.findUnique({
      where: { id: params.id },
      include: {
        santri: true,
        schedules: true
      }
    });

    if (!existingHalaqah) {
      return NextResponse.json(
        { success: false, message: 'Halaqah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if halaqah has santri
    if (existingHalaqah.santri.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Halaqah tidak dapat dihapus karena masih memiliki ${existingHalaqah.santri.length} santri. Pindahkan santri terlebih dahulu.` 
        },
        { status: 400 }
      );
    }

    // Delete halaqah (schedules will be deleted automatically due to cascade)
    await prisma.halaqah.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Halaqah berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting halaqah:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus halaqah' },
      { status: 500 }
    );
  }
}
