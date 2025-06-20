import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting database audit...');

    // Check all tables and their data
    const [
      users,
      santri,
      halaqah,
      hafalan,
      attendance,
      payments,
      donations,
      news,
      notifications
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      }),
      prisma.santri.findMany({
        select: {
          id: true,
          nis: true,
          name: true,
          status: true,
          wali: {
            select: {
              name: true,
              email: true
            }
          },
          halaqah: {
            select: {
              name: true,
              musyrif: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.halaqah.findMany({
        select: {
          id: true,
          name: true,
          currentCapacity: true,
          maxCapacity: true,
          level: true,
          status: true,
          musyrif: {
            select: {
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              santri: true
            }
          }
        }
      }),
      prisma.hafalan.findMany({
        select: {
          id: true,
          surahName: true,
          ayahStart: true,
          ayahEnd: true,
          type: true,
          status: true,
          grade: true,
          recordedAt: true,
          santri: {
            select: {
              name: true,
              nis: true
            }
          },
          musyrif: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          recordedAt: 'desc'
        },
        take: 10
      }),
      prisma.attendance.findMany({
        select: {
          id: true,
          date: true,
          status: true,
          checkInTime: true,
          checkOutTime: true,
          santri: {
            select: {
              name: true,
              nis: true
            }
          },
          halaqah: {
            select: {
              name: true
            }
          },
          musyrif: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        take: 10
      }),
      prisma.payment.findMany({
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          dueDate: true,
          paidDate: true,
          santri: {
            select: {
              name: true,
              nis: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      prisma.donation.findMany({
        select: {
          id: true,
          donorName: true,
          amount: true,
          type: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      prisma.news.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          featured: true,
          views: true,
          publishedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      prisma.notification.findMany({
        select: {
          id: true,
          title: true,
          type: true,
          isRead: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    // Calculate statistics
    const stats = {
      users: {
        total: users.length,
        byRole: {
          ADMIN: users.filter(u => u.role === 'ADMIN').length,
          MUSYRIF: users.filter(u => u.role === 'MUSYRIF').length,
          WALI: users.filter(u => u.role === 'WALI').length,
          SANTRI: users.filter(u => u.role === 'SANTRI').length
        },
        active: users.filter(u => u.isActive).length
      },
      santri: {
        total: santri.length,
        byStatus: {
          ACTIVE: santri.filter(s => s.status === 'ACTIVE').length,
          INACTIVE: santri.filter(s => s.status === 'INACTIVE').length,
          GRADUATED: santri.filter(s => s.status === 'GRADUATED').length
        },
        withHalaqah: santri.filter(s => s.halaqah).length,
        withWali: santri.filter(s => s.wali).length
      },
      halaqah: {
        total: halaqah.length,
        active: halaqah.filter(h => h.status === 'ACTIVE').length,
        totalCapacity: halaqah.reduce((sum, h) => sum + h.maxCapacity, 0),
        currentOccupancy: halaqah.reduce((sum, h) => sum + h.currentCapacity, 0)
      },
      hafalan: {
        total: hafalan.length,
        byStatus: {
          PENDING: hafalan.filter(h => h.status === 'PENDING').length,
          APPROVED: hafalan.filter(h => h.status === 'APPROVED').length,
          NEEDS_IMPROVEMENT: hafalan.filter(h => h.status === 'NEEDS_IMPROVEMENT').length
        },
        byType: {
          SETORAN: hafalan.filter(h => h.type === 'SETORAN').length,
          MURAJAAH: hafalan.filter(h => h.type === 'MURAJAAH').length,
          TASMI: hafalan.filter(h => h.type === 'TASMI').length
        },
        averageGrade: hafalan.filter(h => h.grade !== null).length > 0
          ? Math.round(hafalan.filter(h => h.grade !== null).reduce((sum, h) => sum + (h.grade || 0), 0) / hafalan.filter(h => h.grade !== null).length)
          : 0
      },
      attendance: {
        total: attendance.length,
        byStatus: {
          PRESENT: attendance.filter(a => a.status === 'PRESENT').length,
          ABSENT: attendance.filter(a => a.status === 'ABSENT').length,
          LATE: attendance.filter(a => a.status === 'LATE').length,
          EXCUSED: attendance.filter(a => a.status === 'EXCUSED').length
        },
        attendanceRate: attendance.length > 0
          ? Math.round((attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100)
          : 0
      },
      payments: {
        total: payments.length,
        byStatus: {
          PENDING: payments.filter(p => p.status === 'PENDING').length,
          PAID: payments.filter(p => p.status === 'PAID').length,
          OVERDUE: payments.filter(p => p.status === 'OVERDUE').length
        },
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        paidAmount: payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)
      },
      donations: {
        total: donations.length,
        totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
        byStatus: {
          PENDING: donations.filter(d => d.status === 'PENDING').length,
          PAID: donations.filter(d => d.status === 'PAID').length
        }
      },
      news: {
        total: news.length,
        published: news.filter(n => n.status === 'PUBLISHED').length,
        featured: news.filter(n => n.featured).length,
        totalViews: news.reduce((sum, n) => sum + n.views, 0)
      },
      notifications: {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        byType: notifications.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    };

    // Check data relationships
    const relationships = {
      santriWithWali: santri.filter(s => s.wali).length,
      santriWithHalaqah: santri.filter(s => s.halaqah).length,
      hafalanWithSantri: hafalan.filter(h => h.santri).length,
      hafalanWithMusyrif: hafalan.filter(h => h.musyrif).length,
      attendanceWithSantri: attendance.filter(a => a.santri).length,
      attendanceWithHalaqah: attendance.filter(a => a.halaqah).length,
      paymentsWithSantri: payments.filter(p => p.santri).length,
      notificationsWithUser: notifications.filter(n => n.user).length
    };

    // Sample data for verification
    const sampleData = {
      users: users.slice(0, 3),
      santri: santri.slice(0, 3),
      halaqah: halaqah.slice(0, 2),
      hafalan: hafalan.slice(0, 3),
      attendance: attendance.slice(0, 3),
      payments: payments.slice(0, 3),
      donations: donations.slice(0, 2),
      news: news.slice(0, 2),
      notifications: notifications.slice(0, 3)
    };

    console.log('✅ Database audit completed');

    return NextResponse.json({
      success: true,
      message: 'Database audit completed successfully',
      timestamp: new Date().toISOString(),
      stats,
      relationships,
      sampleData,
      summary: {
        totalTables: 9,
        tablesWithData: Object.values(stats).filter(stat => 
          typeof stat === 'object' && 'total' in stat && stat.total > 0
        ).length,
        totalRecords: Object.values(stats).reduce((sum, stat) => 
          typeof stat === 'object' && 'total' in stat ? sum + stat.total : sum, 0
        ),
        dataIntegrity: {
          score: Math.round((Object.values(relationships).filter(count => count > 0).length / Object.keys(relationships).length) * 100),
          details: relationships
        }
      }
    });

  } catch (error) {
    console.error('❌ Database audit error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database audit failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
