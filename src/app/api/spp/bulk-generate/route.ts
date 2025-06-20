import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MonthData {
  month: number;
  year: number;
  dueDate: string;
}

interface BulkGenerateData {
  sppSettingId: string;
  santriIds: string[];
  months: MonthData[];
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkGenerateData = await request.json();
    const { sppSettingId, santriIds, months } = body;

    // Validation
    if (!sppSettingId || !santriIds || !months) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    if (santriIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Minimal pilih 1 santri' },
        { status: 400 }
      );
    }

    if (months.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Minimal pilih 1 bulan' },
        { status: 400 }
      );
    }

    // Validate SPP setting exists and is active
    const sppSetting = await prisma.sPPSetting.findUnique({
      where: { id: sppSettingId }
    });

    if (!sppSetting || !sppSetting.isActive) {
      return NextResponse.json(
        { success: false, message: 'Pengaturan SPP tidak valid atau tidak aktif' },
        { status: 400 }
      );
    }

    // Validate all santri exist
    const santriList = await prisma.santri.findMany({
      where: {
        id: {
          in: santriIds
        }
      },
      select: {
        id: true,
        nis: true,
        name: true
      }
    });

    if (santriList.length !== santriIds.length) {
      return NextResponse.json(
        { success: false, message: 'Beberapa santri tidak ditemukan' },
        { status: 400 }
      );
    }

    // Check for existing SPP records to avoid duplicates
    const existingSPPRecords = await prisma.sPPRecord.findMany({
      where: {
        santriId: {
          in: santriIds
        },
        sppSettingId: sppSettingId,
        OR: months.map(month => ({
          month: month.month,
          year: month.year
        }))
      },
      select: {
        santriId: true,
        month: true,
        year: true,
        santri: {
          select: {
            name: true,
            nis: true
          }
        }
      }
    });

    if (existingSPPRecords.length > 0) {
      const duplicateInfo = existingSPPRecords.map(record => 
        `${record.santri.name} (${record.santri.nis}) - ${getMonthName(record.month)} ${record.year}`
      ).join(', ');
      
      return NextResponse.json(
        { 
          success: false, 
          message: `SPP sudah ada untuk: ${duplicateInfo}`,
          duplicates: existingSPPRecords
        },
        { status: 400 }
      );
    }

    // Generate SPP records
    const sppRecordsToCreate = [];
    
    for (const santriId of santriIds) {
      for (const monthData of months) {
        sppRecordsToCreate.push({
          santriId: santriId,
          sppSettingId: sppSettingId,
          month: monthData.month,
          year: monthData.year,
          amount: sppSetting.amount,
          paidAmount: 0,
          status: 'PENDING' as const,
          dueDate: new Date(monthData.dueDate),
          discount: 0,
          fine: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Create SPP records in batch
    const createdSPPRecords = await prisma.sPPRecord.createMany({
      data: sppRecordsToCreate,
      skipDuplicates: true
    });

    // Get created records with relations for response
    const createdRecordsWithDetails = await prisma.sPPRecord.findMany({
      where: {
        santriId: {
          in: santriIds
        },
        sppSettingId: sppSettingId,
        OR: months.map(month => ({
          month: month.month,
          year: month.year
        }))
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true
          }
        },
        sppSetting: {
          select: {
            id: true,
            name: true,
            amount: true,
            level: true
          }
        }
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
        { santri: { name: 'asc' } }
      ]
    });

    // Calculate summary
    const totalAmount = createdSPPRecords.count * sppSetting.amount;
    const summary = {
      totalRecords: createdSPPRecords.count,
      totalSantri: santriIds.length,
      totalMonths: months.length,
      totalAmount: totalAmount,
      sppSetting: {
        name: sppSetting.name,
        amount: sppSetting.amount,
        level: sppSetting.level
      },
      periods: months.map(month => ({
        month: getMonthName(month.month),
        year: month.year,
        dueDate: month.dueDate
      }))
    };

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat ${createdSPPRecords.count} SPP untuk ${santriIds.length} santri`,
      count: createdSPPRecords.count,
      summary: summary,
      records: createdRecordsWithDetails
    });

  } catch (error) {
    console.error('Error bulk generating SPP:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat SPP massal' },
      { status: 500 }
    );
  }
}

// Helper function to get month name
function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1];
}

// GET /api/spp/bulk-generate - Get bulk generate preview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sppSettingId = searchParams.get('sppSettingId');
    const santriIds = searchParams.get('santriIds')?.split(',') || [];
    const months = searchParams.get('months')?.split(',') || [];

    if (!sppSettingId || santriIds.length === 0 || months.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Parameter tidak lengkap' },
        { status: 400 }
      );
    }

    // Get SPP setting
    const sppSetting = await prisma.sPPSetting.findUnique({
      where: { id: sppSettingId }
    });

    if (!sppSetting) {
      return NextResponse.json(
        { success: false, message: 'Pengaturan SPP tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get santri details
    const santriList = await prisma.santri.findMany({
      where: {
        id: {
          in: santriIds
        }
      },
      select: {
        id: true,
        nis: true,
        name: true
      }
    });

    // Parse months (format: "month:year")
    const monthsData = months.map(monthStr => {
      const [month, year] = monthStr.split(':');
      return {
        month: parseInt(month),
        year: parseInt(year),
        monthName: getMonthName(parseInt(month))
      };
    });

    // Calculate preview
    const totalRecords = santriList.length * monthsData.length;
    const totalAmount = totalRecords * sppSetting.amount;

    const preview = {
      sppSetting: {
        name: sppSetting.name,
        amount: sppSetting.amount,
        level: sppSetting.level
      },
      santri: santriList,
      periods: monthsData,
      summary: {
        totalSantri: santriList.length,
        totalMonths: monthsData.length,
        totalRecords: totalRecords,
        totalAmount: totalAmount
      }
    };

    return NextResponse.json({
      success: true,
      preview: preview
    });

  } catch (error) {
    console.error('Error getting bulk generate preview:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat preview' },
      { status: 500 }
    );
  }
}
