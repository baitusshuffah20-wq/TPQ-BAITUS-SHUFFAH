import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get basic statistics
    const [
      totalSent,
      delivered,
      read,
      failed,
      messageTypes,
      dailyStats
    ] = await Promise.all([
      // Total messages sent
      prisma.whatsAppLog.count({
        where: {
          sentAt: { gte: startDate }
        }
      }),

      // Delivered messages
      prisma.whatsAppLog.count({
        where: {
          sentAt: { gte: startDate },
          status: 'DELIVERED'
        }
      }),

      // Read messages
      prisma.whatsAppLog.count({
        where: {
          sentAt: { gte: startDate },
          status: 'READ'
        }
      }),

      // Failed messages
      prisma.whatsAppLog.count({
        where: {
          sentAt: { gte: startDate },
          status: 'FAILED'
        }
      }),

      // Message types breakdown
      prisma.whatsAppLog.groupBy({
        by: ['messageType'],
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
          COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered,
          COUNT(CASE WHEN status = 'READ' THEN 1 END) as read,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
        FROM whatsapp_logs 
        WHERE sent_at >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE(sent_at)
        ORDER BY date DESC
      `
    ]);

    // Calculate rates
    const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0;
    const readRate = totalSent > 0 ? Math.round((read / totalSent) * 100) : 0;
    const failureRate = totalSent > 0 ? Math.round((failed / totalSent) * 100) : 0;

    // Get top recipients
    const topRecipients = await prisma.whatsAppLog.groupBy({
      by: ['recipientId'],
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

    // Get recipient details
    const recipientIds = topRecipients.map(r => r.recipientId);
    const recipients = await prisma.user.findMany({
      where: {
        id: { in: recipientIds }
      },
      select: {
        id: true,
        name: true,
        phone: true
      }
    });

    const topRecipientsWithDetails = topRecipients.map(tr => {
      const recipient = recipients.find(r => r.id === tr.recipientId);
      return {
        ...tr,
        recipient
      };
    });

    // Response time analysis
    const responseTimeStats = await prisma.$queryRaw`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at))) as avg_delivery_time,
        AVG(EXTRACT(EPOCH FROM (read_at - sent_at))) as avg_read_time
      FROM whatsapp_logs 
      WHERE sent_at >= ${startDate}
        AND delivered_at IS NOT NULL
    ` as any[];

    const avgDeliveryTime = responseTimeStats[0]?.avg_delivery_time || 0;
    const avgReadTime = responseTimeStats[0]?.avg_read_time || 0;

    return NextResponse.json({
      overview: {
        totalSent,
        delivered,
        read,
        failed,
        deliveryRate,
        readRate,
        failureRate
      },
      messageTypes: messageTypes.map(mt => ({
        type: mt.messageType,
        count: mt._count.id
      })),
      dailyStats,
      topRecipients: topRecipientsWithDetails,
      performance: {
        avgDeliveryTime: Math.round(avgDeliveryTime),
        avgReadTime: Math.round(avgReadTime)
      },
      period: parseInt(period)
    });

  } catch (error) {
    console.error('Error fetching WhatsApp stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
