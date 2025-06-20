import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        santriAsWali: {
          include: {
            halaqah: {
              include: {
                musyrif: true
              }
            },
            hafalan: {
              orderBy: { recordedAt: 'desc' },
              take: 5,
              include: {
                musyrif: true
              }
            },
            attendance: {
              orderBy: { date: 'desc' },
              take: 10
            },
            payments: {
              where: { status: 'PENDING' },
              orderBy: { dueDate: 'asc' }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare dashboard data based on role
    let dashboardData;

    if (userRole === 'WALI') {
      // Parent dashboard
      const children = user.santriAsWali.map(santri => {
        // Calculate attendance rate for last 30 days
        const recentAttendance = santri.attendance.slice(0, 10);
        const attendanceRate = recentAttendance.length > 0
          ? Math.round((recentAttendance.filter(a => a.status === 'PRESENT').length / recentAttendance.length) * 100)
          : 0;

        // Get latest hafalan
        const latestHafalan = santri.hafalan[0];

        // Calculate average grade
        const grades = santri.hafalan.filter(h => h.grade !== null).map(h => h.grade!);
        const averageGrade = grades.length > 0
          ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length)
          : 0;

        return {
          id: santri.id,
          name: santri.name,
          nis: santri.nis,
          halaqah: {
            name: santri.halaqah?.name,
            musyrif: santri.halaqah?.musyrif?.name
          },
          stats: {
            attendanceRate,
            averageGrade,
            totalHafalan: santri.hafalan.length,
            pendingPayments: santri.payments.length
          },
          latestHafalan: latestHafalan ? {
            surahName: latestHafalan.surahName,
            grade: latestHafalan.grade,
            status: latestHafalan.status,
            date: latestHafalan.recordedAt,
            musyrif: latestHafalan.musyrif.name
          } : null,
          recentAttendance: recentAttendance.slice(0, 5).map(a => ({
            date: a.date,
            status: a.status,
            checkInTime: a.checkInTime
          })),
          pendingPayments: santri.payments.map(p => ({
            id: p.id,
            type: p.type,
            amount: p.amount,
            dueDate: p.dueDate
          }))
        };
      });

      dashboardData = {
        type: 'parent',
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        children,
        summary: {
          totalChildren: children.length,
          averageAttendance: children.length > 0
            ? Math.round(children.reduce((sum, child) => sum + child.stats.attendanceRate, 0) / children.length)
            : 0,
          averageGrade: children.length > 0
            ? Math.round(children.reduce((sum, child) => sum + child.stats.averageGrade, 0) / children.length)
            : 0,
          totalPendingPayments: children.reduce((sum, child) => sum + child.stats.pendingPayments, 0)
        }
      };

    } else if (userRole === 'SANTRI') {
      // Student dashboard (if students have direct access)
      const santri = await prisma.santri.findFirst({
        where: { waliId: userId }, // Assuming santri account is linked to wali
        include: {
          halaqah: {
            include: {
              musyrif: true
            }
          },
          hafalan: {
            orderBy: { recordedAt: 'desc' },
            take: 10
          },
          attendance: {
            orderBy: { date: 'desc' },
            take: 20
          },
          payments: {
            where: { status: 'PENDING' }
          }
        }
      });

      if (santri) {
        const recentAttendance = santri.attendance.slice(0, 20);
        const attendanceRate = recentAttendance.length > 0
          ? Math.round((recentAttendance.filter(a => a.status === 'PRESENT').length / recentAttendance.length) * 100)
          : 0;

        const grades = santri.hafalan.filter(h => h.grade !== null).map(h => h.grade!);
        const averageGrade = grades.length > 0
          ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length)
          : 0;

        dashboardData = {
          type: 'student',
          user: {
            name: user.name,
            email: user.email
          },
          student: {
            id: santri.id,
            name: santri.name,
            nis: santri.nis,
            halaqah: {
              name: santri.halaqah?.name,
              musyrif: santri.halaqah?.musyrif?.name
            },
            stats: {
              attendanceRate,
              averageGrade,
              totalHafalan: santri.hafalan.length,
              pendingPayments: santri.payments.length
            },
            recentHafalan: santri.hafalan.slice(0, 5),
            recentAttendance: recentAttendance.slice(0, 10)
          }
        };
      }

    } else if (userRole === 'MUSYRIF') {
      // Teacher dashboard
      const halaqah = await prisma.halaqah.findMany({
        where: { musyrifId: userId },
        include: {
          santri: {
            include: {
              hafalan: {
                where: {
                  recordedAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                  }
                }
              },
              attendance: {
                where: {
                  date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                  }
                }
              }
            }
          }
        }
      });

      dashboardData = {
        type: 'teacher',
        user: {
          name: user.name,
          email: user.email
        },
        halaqah: halaqah.map(h => ({
          id: h.id,
          name: h.name,
          studentCount: h.santri.length,
          capacity: h.maxCapacity,
          recentActivity: {
            newHafalan: h.santri.reduce((sum, s) => sum + s.hafalan.length, 0),
            attendanceRate: h.santri.length > 0
              ? Math.round((h.santri.reduce((sum, s) => 
                  sum + s.attendance.filter(a => a.status === 'PRESENT').length, 0
                ) / (h.santri.length * 7)) * 100)
              : 0
          }
        })),
        summary: {
          totalStudents: halaqah.reduce((sum, h) => sum + h.santri.length, 0),
          totalHalaqah: halaqah.length,
          weeklyHafalan: halaqah.reduce((sum, h) => 
            sum + h.santri.reduce((s, santri) => s + santri.hafalan.length, 0), 0
          )
        }
      };

    } else {
      // Admin dashboard
      const [totalStudents, totalHalaqah, recentHafalan, recentPayments] = await Promise.all([
        prisma.santri.count({ where: { status: 'ACTIVE' } }),
        prisma.halaqah.count({ where: { status: 'ACTIVE' } }),
        prisma.hafalan.count({
          where: {
            recordedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.payment.count({
          where: {
            status: 'PENDING',
            dueDate: {
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due in next 7 days
            }
          }
        })
      ]);

      dashboardData = {
        type: 'admin',
        user: {
          name: user.name,
          email: user.email
        },
        summary: {
          totalStudents,
          totalHalaqah,
          weeklyHafalan: recentHafalan,
          upcomingPayments: recentPayments
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mobile dashboard error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
