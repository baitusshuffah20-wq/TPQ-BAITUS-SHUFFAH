import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting simple database check...');

    // Test basic connection first
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    // Count records in each table
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);

    const santriCount = await prisma.santri.count();
    console.log(`🎓 Santri: ${santriCount}`);

    const halaqahCount = await prisma.halaqah.count();
    console.log(`📚 Halaqah: ${halaqahCount}`);

    const hafalanCount = await prisma.hafalan.count();
    console.log(`📖 Hafalan: ${hafalanCount}`);

    const attendanceCount = await prisma.attendance.count();
    console.log(`📅 Attendance: ${attendanceCount}`);

    const paymentCount = await prisma.payment.count();
    console.log(`💰 Payments: ${paymentCount}`);

    // Get sample data
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    const sampleSantri = await prisma.santri.findFirst({
      select: {
        id: true,
        nis: true,
        name: true,
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Database check completed',
      timestamp: new Date().toISOString(),
      counts: {
        users: userCount,
        santri: santriCount,
        halaqah: halaqahCount,
        hafalan: hafalanCount,
        attendance: attendanceCount,
        payments: paymentCount
      },
      samples: {
        user: sampleUser,
        santri: sampleSantri
      },
      database: {
        connected: true,
        type: 'MySQL',
        location: 'tpq_baitus_shuffah@localhost:3306'
      }
    });

  } catch (error) {
    console.error('❌ Database check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

