import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/financial/categories/spp - Get or create SPP category
export async function GET(request: NextRequest) {
  try {
    // Check if SPP category exists
    let sppCategory = await prisma.category.findFirst({
      where: {
        name: 'SPP',
        type: 'INCOME'
      }
    });

    // Create SPP category if it doesn't exist
    if (!sppCategory) {
      sppCategory = await prisma.category.create({
        data: {
          name: 'SPP',
          type: 'INCOME',
          description: 'Sumbangan Pembinaan Pendidikan (SPP)',
          color: '#10B981', // Green color
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      category: sppCategory
    });

  } catch (error) {
    console.error('Error getting SPP category:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat kategori SPP' },
      { status: 500 }
    );
  }
}

// POST /api/financial/categories/spp - Create SPP category
export async function POST(request: NextRequest) {
  try {
    // Check if SPP category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: 'SPP',
        type: 'INCOME'
      }
    });

    if (existingCategory) {
      return NextResponse.json({
        success: true,
        message: 'Kategori SPP sudah ada',
        category: existingCategory
      });
    }

    // Create SPP category
    const sppCategory = await prisma.category.create({
      data: {
        name: 'SPP',
        type: 'INCOME',
        description: 'Sumbangan Pembinaan Pendidikan (SPP)',
        color: '#10B981', // Green color
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori SPP berhasil dibuat',
      category: sppCategory
    });

  } catch (error) {
    console.error('Error creating SPP category:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat kategori SPP' },
      { status: 500 }
    );
  }
}
