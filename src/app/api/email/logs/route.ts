import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const template = searchParams.get('template');
    const recipient = searchParams.get('recipient');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (template) {
      where.template = template;
    }
    
    if (recipient) {
      where.recipient = {
        contains: recipient,
        mode: 'insensitive'
      };
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: {
          sentAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.emailLog.count({ where })
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching email logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    // Delete logs older than specified days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.emailLog.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate
        }
      }
    });

    return NextResponse.json({
      message: `Deleted ${result.count} old email logs`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Error deleting email logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
