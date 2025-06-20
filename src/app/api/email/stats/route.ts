import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30'); // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Get basic statistics
    const [
      totalSent,
      successful,
      failed,
      templateStats,
      dailyStats
    ] = await Promise.all([
      // Total emails sent
      prisma.emailLog.count({
        where: {
          sentAt: { gte: startDate }
        }
      }),

      // Successful emails
      prisma.emailLog.count({
        where: {
          sentAt: { gte: startDate },
          status: 'SENT'
        }
      }),

      // Failed emails
      prisma.emailLog.count({
        where: {
          sentAt: { gte: startDate },
          status: 'FAILED'
        }
      }),

      // Email templates breakdown
      prisma.emailLog.groupBy({
        by: ['template'],
        where: {
          sentAt: { gte: startDate }
        },
        _count: {
          id: true
        }
      }),

      // Daily statistics for the last 7 days
      prisma.$queryRaw`
        SELECT 
          DATE(sent_at) as date,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
        FROM email_logs 
        WHERE sent_at >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE(sent_at)
        ORDER BY date DESC
      `
    ]);

    // Calculate rates
    const successRate = totalSent > 0 ? Math.round((successful / totalSent) * 100) : 0;
    const failureRate = totalSent > 0 ? Math.round((failed / totalSent) * 100) : 0;

    // Get top recipients
    const topRecipients = await prisma.emailLog.groupBy({
      by: ['recipient'],
      where: {
        sentAt: { gte: startDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get recent email activity
    const recentEmails = await prisma.emailLog.findMany({
      where: {
        sentAt: { gte: startDate }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 20,
      select: {
        id: true,
        recipient: true,
        subject: true,
        status: true,
        template: true,
        sentAt: true,
        error: true
      }
    });

    // Calculate average response time (if we had read receipts)
    // For now, we'll just return 0
    const avgResponseTime = 0;

    return NextResponse.json({
      overview: {
        totalSent,
        successful,
        failed,
        successRate,
        failureRate
      },
      templates: templateStats.map(ts => ({
        template: ts.template || 'custom',
        count: ts._count.id
      })),
      dailyStats,
      topRecipients: topRecipients.map(tr => ({
        recipient: tr.recipient,
        count: tr._count.id
      })),
      recentEmails,
      performance: {
        avgResponseTime
      },
      period
    });

  } catch (error) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
