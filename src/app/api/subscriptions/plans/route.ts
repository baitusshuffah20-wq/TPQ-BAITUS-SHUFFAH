import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subscriptions/plans - Get subscription plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const billingCycle = searchParams.get('billingCycle');

    // Build where clause
    const whereClause: any = {};
    if (isActive !== null) whereClause.isActive = isActive === 'true';
    if (billingCycle) whereClause.billingCycle = billingCycle;

    const plans = await prisma.subscriptionPlan.findMany({
      where: whereClause,
      orderBy: [
        { sortOrder: 'asc' },
        { amount: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get subscription plans',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/plans - Create subscription plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      amount,
      currency = 'IDR',
      billingCycle,
      trialDays = 0,
      features,
      isActive = true,
      sortOrder = 0,
      metadata
    } = body;

    // Validation
    if (!name || !amount || !billingCycle) {
      return NextResponse.json(
        { success: false, message: 'Name, amount, and billing cycle are required' },
        { status: 400 }
      );
    }

    // Validate billing cycle
    const validCycles = ['MONTHLY', 'QUARTERLY', 'YEARLY'];
    if (!validCycles.includes(billingCycle)) {
      return NextResponse.json(
        { success: false, message: 'Invalid billing cycle' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        amount,
        currency,
        billingCycle,
        trialDays,
        features: features ? JSON.stringify(features) : null,
        isActive,
        sortOrder,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create subscription plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions/plans - Update subscription plan
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Process features and metadata
    if (updateData.features) {
      updateData.features = JSON.stringify(updateData.features);
    }
    if (updateData.metadata) {
      updateData.metadata = JSON.stringify(updateData.metadata);
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update subscription plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/plans - Delete subscription plan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Check if plan is being used
    const subscriptionCount = await prisma.subscription.count({
      where: { planType: id }
    });

    if (subscriptionCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete plan that is being used by subscriptions' },
        { status: 400 }
      );
    }

    await prisma.subscriptionPlan.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete subscription plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
