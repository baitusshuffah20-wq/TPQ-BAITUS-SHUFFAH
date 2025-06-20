import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hafalan/[id] - Get hafalan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hafalan = await prisma.hafalan.findUnique({
      where: { id: params.id },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
            status: true,
            photo: true
          }
        },
        musyrif: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!hafalan) {
      return NextResponse.json(
        { success: false, message: 'Hafalan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hafalan
    });

  } catch (error) {
    console.error('Error fetching hafalan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data hafalan' },
      { status: 500 }
    );
  }
}

// PUT /api/hafalan/[id] - Update hafalan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      santriId, 
      surahId, 
      surahName, 
      ayahStart, 
      ayahEnd, 
      type, 
      status,
      grade,
      notes,
      musyrifId
    } = body;

    // Check if hafalan exists
    const existingHafalan = await prisma.hafalan.findUnique({
      where: { id: params.id }
    });

    if (!existingHafalan) {
      return NextResponse.json(
        { success: false, message: 'Hafalan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update hafalan
    const hafalan = await prisma.hafalan.update({
      where: { id: params.id },
      data: {
        santriId,
        surahId,
        surahName,
        ayahStart,
        ayahEnd,
        type,
        status,
        grade,
        notes,
        musyrifId
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true,
            status: true,
            photo: true
          }
        },
        musyrif: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Hafalan berhasil diupdate',
      hafalan
    });

  } catch (error) {
    console.error('Error updating hafalan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate hafalan' },
      { status: 500 }
    );
  }
}

// DELETE /api/hafalan/[id] - Delete hafalan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if hafalan exists
    const existingHafalan = await prisma.hafalan.findUnique({
      where: { id: params.id }
    });

    if (!existingHafalan) {
      return NextResponse.json(
        { success: false, message: 'Hafalan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete hafalan
    await prisma.hafalan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Hafalan berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting hafalan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus hafalan' },
      { status: 500 }
    );
  }
}