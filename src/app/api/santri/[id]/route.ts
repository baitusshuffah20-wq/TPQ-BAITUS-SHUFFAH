import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/santri/[id] - Get santri by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const santri = await prisma.santri.findUnique({
      where: { id: params.id },
      include: {
        wali: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true,
            musyrif: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        hafalan: {
          include: {
            musyrif: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attendance: {
          include: {
            musyrif: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        },
        payments: {
          orderBy: {
            dueDate: 'desc'
          }
        }
      }
    });

    if (!santri) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      santri
    });

  } catch (error) {
    console.error('Error fetching santri:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data santri' },
      { status: 500 }
    );
  }
}

// PUT /api/santri/[id] - Update santri
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      nis, 
      name, 
      birthDate, 
      birthPlace, 
      gender, 
      address, 
      phone, 
      email, 
      photo, 
      status,
      waliId,
      halaqahId,
      enrollmentDate,
      graduationDate
    } = body;

    // Check if santri exists
    const existingSantri = await prisma.santri.findUnique({
      where: { id: params.id }
    });

    if (!existingSantri) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if NIS is already used by another santri
    if (nis !== existingSantri.nis) {
      const nisExists = await prisma.santri.findUnique({
        where: { nis }
      });

      if (nisExists) {
        return NextResponse.json(
          { success: false, message: 'NIS sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Check if wali exists
    const wali = await prisma.user.findUnique({
      where: { id: waliId, role: 'WALI' }
    });

    if (!wali) {
      return NextResponse.json(
        { success: false, message: 'Wali tidak ditemukan' },
        { status: 400 }
      );
    }

    // Check if halaqah exists (if provided)
    if (halaqahId) {
      const halaqah = await prisma.halaqah.findUnique({
        where: { id: halaqahId }
      });

      if (!halaqah) {
        return NextResponse.json(
          { success: false, message: 'Halaqah tidak ditemukan' },
          { status: 400 }
        );
      }
    }

    // Update santri
    const santri = await prisma.santri.update({
      where: { id: params.id },
      data: {
        nis,
        name,
        birthDate: new Date(birthDate),
        birthPlace,
        gender,
        address,
        phone: phone || null,
        email: email || null,
        photo: photo || null,
        status,
        waliId,
        halaqahId: halaqahId || null,
        enrollmentDate: new Date(enrollmentDate),
        graduationDate: graduationDate ? new Date(graduationDate) : null
      },
      include: {
        wali: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Santri berhasil diupdate',
      santri
    });

  } catch (error) {
    console.error('Error updating santri:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate santri' },
      { status: 500 }
    );
  }
}

// DELETE /api/santri/[id] - Delete santri
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if santri exists
    const existingSantri = await prisma.santri.findUnique({
      where: { id: params.id },
      include: {
        hafalan: true,
        attendance: true,
        payments: true
      }
    });

    if (!existingSantri) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if santri has related data
    const hasRelatedData = 
      existingSantri.hafalan.length > 0 ||
      existingSantri.attendance.length > 0 ||
      existingSantri.payments.length > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Santri tidak dapat dihapus karena masih memiliki data hafalan, absensi, atau pembayaran' 
        },
        { status: 400 }
      );
    }

    // Delete santri
    await prisma.santri.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Santri berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting santri:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus santri' },
      { status: 500 }
    );
  }
}
