import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/spp/settings - Get all SPP settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const level = searchParams.get('level');

    const where: any = {};

    if (isActive && isActive !== 'ALL') {
      where.isActive = isActive === 'true';
    }

    if (level && level !== 'ALL') {
      where.level = level;
    }

    const sppSettings = await prisma.sPPSetting.findMany({
      where,
      include: {
        _count: {
          select: {
            sppRecords: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      sppSettings,
      total: sppSettings.length
    });

  } catch (error) {
    console.error('Error fetching SPP settings:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengaturan SPP' },
      { status: 500 }
    );
  }
}

// POST /api/spp/settings - Create new SPP setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      amount, 
      description, 
      isActive = true, 
      level 
    } = body;

    // Validation
    if (!name || !amount) {
      return NextResponse.json(
        { success: false, message: 'Nama dan jumlah SPP wajib diisi' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Jumlah SPP harus lebih dari 0' },
        { status: 400 }
      );
    }

    // Check if SPP setting name already exists
    const existingSetting = await prisma.sPPSetting.findFirst({
      where: { name }
    });

    if (existingSetting) {
      return NextResponse.json(
        { success: false, message: 'Nama pengaturan SPP sudah digunakan' },
        { status: 400 }
      );
    }

    // Create SPP setting
    const sppSetting = await prisma.sPPSetting.create({
      data: {
        name,
        amount: parseFloat(amount.toString()),
        description: description || null,
        isActive,
        level: level || null
      },
      include: {
        _count: {
          select: {
            sppRecords: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan SPP berhasil dibuat',
      sppSetting
    });

  } catch (error) {
    console.error('Error creating SPP setting:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pengaturan SPP' },
      { status: 500 }
    );
  }
}
