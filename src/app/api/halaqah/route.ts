import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/halaqah - Get all halaqah
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const musyrifId = searchParams.get('musyrifId');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    const where: any = {};

    if (musyrifId && musyrifId !== 'ALL') {
      where.musyrifId = musyrifId;
    }

    if (level && level !== 'ALL') {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const halaqah = await prisma.halaqah.findMany({
      where,
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
            status: true
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
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      halaqah,
      total: halaqah.length
    });

  } catch (error) {
    console.error('Error fetching halaqah:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data halaqah' },
      { status: 500 }
    );
  }
}

// POST /api/halaqah - Create new halaqah
export async function POST(request: NextRequest) {
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

    // Validation
    if (!name || !level || !musyrifId) {
      return NextResponse.json(
        { success: false, message: 'Nama, level, dan musyrif wajib diisi' },
        { status: 400 }
      );
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

    // Check if halaqah name already exists
    const existingHalaqah = await prisma.halaqah.findFirst({
      where: { name }
    });

    if (existingHalaqah) {
      return NextResponse.json(
        { success: false, message: 'Nama halaqah sudah digunakan' },
        { status: 400 }
      );
    }

    // Create halaqah with schedules
    const halaqah = await prisma.halaqah.create({
      data: {
        name,
        description: description || '',
        level,
        capacity: capacity || 20,
        musyrifId,
        schedules: {
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
        schedules: true,
        _count: {
          select: {
            santri: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Halaqah berhasil dibuat',
      halaqah
    });

  } catch (error) {
    console.error('Error creating halaqah:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat halaqah' },
      { status: 500 }
    );
  }
}
