import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { email, name, phone, role, password, isActive } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if email is already used by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'Email sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      email,
      name,
      phone,
      role,
      isActive
    };

    // Hash password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
      user
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user has related data (santri, halaqah, etc.)
    const relatedData = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        santriAsWali: true,
        halaqahAsMusyrif: true,
        hafalanAsMusyrif: true,
        attendanceAsMusyrif: true
      }
    });

    if (relatedData) {
      const hasRelatedData = 
        relatedData.santriAsWali.length > 0 ||
        relatedData.halaqahAsMusyrif.length > 0 ||
        relatedData.hafalanAsMusyrif.length > 0 ||
        relatedData.attendanceAsMusyrif.length > 0;

      if (hasRelatedData) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'User tidak dapat dihapus karena masih memiliki data terkait (santri, halaqah, dll)' 
          },
          { status: 400 }
        );
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}
