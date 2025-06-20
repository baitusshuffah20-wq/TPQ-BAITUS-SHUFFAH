import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/spp/records - Get SPP records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const santriId = searchParams.get('santriId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (month) {
      where.month = parseInt(month);
    }

    if (year) {
      where.year = parseInt(year);
    }

    if (santriId) {
      where.santriId = santriId;
    }

    const skip = (page - 1) * limit;

    const [sppRecords, total] = await Promise.all([
      prisma.sPPRecord.findMany({
        where,
        include: {
          santri: {
            select: {
              id: true,
              nis: true,
              name: true,
              halaqah: {
                select: {
                  id: true,
                  name: true,
                  level: true
                }
              }
            }
          },
          sppSetting: {
            select: {
              id: true,
              name: true,
              amount: true,
              level: true
            }
          },
          transaction: {
            select: {
              id: true,
              amount: true,
              transactionDate: true,
              account: {
                select: {
                  name: true,
                  type: true
                }
              }
            }
          }
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { santri: { name: 'asc' } }
        ],
        skip,
        take: limit
      }),
      prisma.sPPRecord.count({ where })
    ]);

    // Calculate summary
    const summary = await prisma.sPPRecord.aggregate({
      where,
      _sum: {
        amount: true,
        paidAmount: true,
        discount: true,
        fine: true
      },
      _count: {
        _all: true
      }
    });

    const statusCounts = await Promise.all([
      prisma.sPPRecord.count({ where: { ...where, status: 'PENDING' } }),
      prisma.sPPRecord.count({ where: { ...where, status: 'PAID' } }),
      prisma.sPPRecord.count({ where: { ...where, status: 'OVERDUE' } }),
      prisma.sPPRecord.count({ where: { ...where, status: 'PARTIAL' } })
    ]);

    return NextResponse.json({
      success: true,
      sppRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalPaid: summary._sum.paidAmount || 0,
        totalDiscount: summary._sum.discount || 0,
        totalFine: summary._sum.fine || 0,
        totalRecords: summary._count._all || 0,
        statusCounts: {
          pending: statusCounts[0],
          paid: statusCounts[1],
          overdue: statusCounts[2],
          partial: statusCounts[3]
        }
      }
    });

  } catch (error) {
    console.error('Error fetching SPP records:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data SPP' },
      { status: 500 }
    );
  }
}

// POST /api/spp/records - Create SPP record or bulk generate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, // 'single' or 'bulk'
      santriId,
      sppSettingId,
      month,
      year,
      amount,
      dueDate,
      notes,
      // For bulk generation
      santriIds,
      months
    } = body;

    if (type === 'bulk') {
      // Bulk generation for multiple santri and months
      if (!santriIds || !months || !sppSettingId) {
        return NextResponse.json(
          { success: false, message: 'Data untuk bulk generation tidak lengkap' },
          { status: 400 }
        );
      }

      const sppSetting = await prisma.sPPSetting.findUnique({
        where: { id: sppSettingId }
      });

      if (!sppSetting) {
        return NextResponse.json(
          { success: false, message: 'Pengaturan SPP tidak ditemukan' },
          { status: 400 }
        );
      }

      const records = [];
      for (const santriId of santriIds) {
        for (const monthData of months) {
          // Check if record already exists
          const existingRecord = await prisma.sPPRecord.findUnique({
            where: {
              santriId_month_year: {
                santriId,
                month: monthData.month,
                year: monthData.year
              }
            }
          });

          if (!existingRecord) {
            records.push({
              santriId,
              sppSettingId,
              month: monthData.month,
              year: monthData.year,
              amount: sppSetting.amount,
              dueDate: new Date(monthData.dueDate),
              status: 'PENDING'
            });
          }
        }
      }

      if (records.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Semua SPP untuk periode tersebut sudah ada' },
          { status: 400 }
        );
      }

      const createdRecords = await prisma.sPPRecord.createMany({
        data: records,
        skipDuplicates: true
      });

      return NextResponse.json({
        success: true,
        message: `${createdRecords.count} SPP berhasil dibuat`,
        count: createdRecords.count
      });

    } else {
      // Single SPP record creation
      if (!santriId || !sppSettingId || !month || !year || !amount || !dueDate) {
        return NextResponse.json(
          { success: false, message: 'Data SPP tidak lengkap' },
          { status: 400 }
        );
      }

      // Check if record already exists
      const existingRecord = await prisma.sPPRecord.findUnique({
        where: {
          santriId_month_year: {
            santriId,
            month: parseInt(month),
            year: parseInt(year)
          }
        }
      });

      if (existingRecord) {
        return NextResponse.json(
          { success: false, message: 'SPP untuk bulan dan tahun tersebut sudah ada' },
          { status: 400 }
        );
      }

      const sppRecord = await prisma.sPPRecord.create({
        data: {
          santriId,
          sppSettingId,
          month: parseInt(month),
          year: parseInt(year),
          amount: parseFloat(amount.toString()),
          dueDate: new Date(dueDate),
          notes: notes || null
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
              level: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'SPP berhasil dibuat',
        sppRecord
      });
    }

  } catch (error) {
    console.error('Error creating SPP record:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat SPP' },
      { status: 500 }
    );
  }
}
