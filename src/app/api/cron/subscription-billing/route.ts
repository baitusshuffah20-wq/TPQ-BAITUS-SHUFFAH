import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription-service';

// POST /api/cron/subscription-billing - Process due subscription billings
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting subscription billing cron job...');
    
    // Process due billings
    const results = await SubscriptionService.processDueBillings();
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`Subscription billing cron completed: ${successCount} success, ${failureCount} failures`);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription billing cron job completed',
      data: {
        totalProcessed: results.length,
        successCount,
        failureCount,
        results
      }
    });
  } catch (error) {
    console.error('Error in subscription billing cron job:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Subscription billing cron job failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/cron/subscription-billing - Get cron job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkDue = searchParams.get('checkDue') === 'true';
    
    if (checkDue) {
      // Get due billings count
      const { prisma } = await import('@/lib/prisma');
      
      const dueBillingsCount = await prisma.subscriptionBilling.count({
        where: {
          status: 'PENDING',
          billingDate: {
            lte: new Date()
          },
          subscription: {
            status: 'ACTIVE'
          }
        }
      });
      
      const overdueCount = await prisma.subscriptionBilling.count({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: new Date()
          },
          subscription: {
            status: 'ACTIVE'
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          dueBillingsCount,
          overdueCount,
          lastChecked: new Date().toISOString()
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscription billing cron job is available',
      data: {
        endpoint: '/api/cron/subscription-billing',
        method: 'POST',
        description: 'Processes due subscription billings'
      }
    });
  } catch (error) {
    console.error('Error checking subscription billing cron status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check cron status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
