import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription-service';
import { prisma } from '@/lib/prisma';

// GET /api/subscriptions - Get subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (studentId) whereClause.studentId = studentId;
    if (status) whereClause.status = status;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: whereClause,
        include: {
          student: {
            select: { id: true, name: true, email: true, phone: true }
          },
          billings: {
            where: { status: 'PENDING' },
            orderBy: { dueDate: 'asc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.subscription.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get subscriptions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      planType,
      amount,
      billingCycle,
      startDate,
      endDate,
      paymentMethod,
      gateway,
      trialDays,
      autoRenewal,
      metadata,
      createdBy
    } = body;

    // Validation
    if (!studentId || !planType || !amount || !billingCycle) {
      return NextResponse.json(
        { success: false, message: 'Student ID, plan type, amount, and billing cycle are required' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, role: true }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Check for existing active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        studentId,
        planType,
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, message: 'Student already has an active subscription for this plan' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await SubscriptionService.createSubscription({
      studentId,
      planType,
      amount,
      billingCycle,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      paymentMethod,
      gateway,
      trialDays,
      autoRenewal,
      metadata,
      createdBy
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create subscription',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
