import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription-service';
import { prisma } from '@/lib/prisma';

// GET /api/subscriptions/billing - Get billing records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const status = searchParams.get('status');
    const studentId = searchParams.get('studentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (subscriptionId) whereClause.subscriptionId = subscriptionId;
    if (status) whereClause.status = status;
    if (studentId) {
      whereClause.subscription = {
        studentId: studentId
      };
    }

    const [billings, total] = await Promise.all([
      prisma.subscriptionBilling.findMany({
        where: whereClause,
        include: {
          subscription: {
            include: {
              student: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        },
        orderBy: { billingDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.subscriptionBilling.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        billings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting billing records:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get billing records',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/billing - Process billing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billingId, action } = body;

    if (!billingId) {
      return NextResponse.json(
        { success: false, message: 'Billing ID is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'process':
        result = await SubscriptionService.processBilling(billingId);
        break;
      
      case 'mark_paid':
        const { paymentId } = body;
        if (!paymentId) {
          return NextResponse.json(
            { success: false, message: 'Payment ID is required for mark_paid action' },
            { status: 400 }
          );
        }
        result = await SubscriptionService.markBillingPaid(billingId, paymentId);
        break;
      
      case 'mark_failed':
        const { reason } = body;
        result = await SubscriptionService.markBillingFailed(billingId, reason || 'Manual failure');
        break;
      
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Billing ${action} completed successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error processing billing:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process billing',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
