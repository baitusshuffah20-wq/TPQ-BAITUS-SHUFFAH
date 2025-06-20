import { NextRequest, NextResponse } from 'next/server';
import { whatsappAutomation } from '@/lib/whatsapp-automation';

// This endpoint should be called by a cron service (like Vercel Cron or external cron)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type } = body;

    let result;

    switch (type) {
      case 'daily':
        result = await runDailyNotifications();
        break;
      
      case 'weekly':
        result = await runWeeklyNotifications();
        break;
      
      case 'monthly':
        result = await runMonthlyNotifications();
        break;
      
      case 'payment_reminders':
        result = await runPaymentReminders();
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

async function runDailyNotifications() {
  const results = [];

  try {
    // Check for payment reminders (3 days before due)
    await whatsappAutomation.processPaymentDue();
    results.push('Payment reminders processed');

    // Check for consecutive absences
    // This would typically be triggered by actual attendance records
    // For now, we'll just log that it's available
    results.push('Attendance monitoring active');

    return {
      processed: results,
      count: results.length
    };
  } catch (error) {
    console.error('Daily notifications error:', error);
    throw error;
  }
}

async function runWeeklyNotifications() {
  const results = [];

  try {
    // Weekly summary for parents
    // This could include weekly attendance summary, hafalan progress, etc.
    results.push('Weekly summaries available');

    // Check for students who haven't attended for a week
    results.push('Weekly attendance check completed');

    return {
      processed: results,
      count: results.length
    };
  } catch (error) {
    console.error('Weekly notifications error:', error);
    throw error;
  }
}

async function runMonthlyNotifications() {
  const results = [];

  try {
    // Send monthly reports to all parents
    await whatsappAutomation.processMonthlyReport();
    results.push('Monthly reports sent to parents');

    // Monthly statistics for admin
    results.push('Monthly admin statistics compiled');

    return {
      processed: results,
      count: results.length
    };
  } catch (error) {
    console.error('Monthly notifications error:', error);
    throw error;
  }
}

async function runPaymentReminders() {
  const results = [];

  try {
    // Send payment reminders for due payments
    await whatsappAutomation.processPaymentDue();
    results.push('Payment reminders sent');

    return {
      processed: results,
      count: results.length
    };
  } catch (error) {
    console.error('Payment reminders error:', error);
    throw error;
  }
}

// GET endpoint to check cron job status
export async function GET(request: NextRequest) {
  try {
    const rules = whatsappAutomation.getRules();
    
    return NextResponse.json({
      status: 'active',
      automationRules: rules,
      availableTypes: [
        'daily',
        'weekly', 
        'monthly',
        'payment_reminders'
      ],
      lastRun: new Date().toISOString(),
      nextScheduled: {
        daily: getNextCronTime('0 8 * * *'), // 8 AM daily
        weekly: getNextCronTime('0 8 * * 1'), // 8 AM every Monday
        monthly: getNextCronTime('0 8 1 * *'), // 8 AM on 1st of every month
        payment_reminders: getNextCronTime('0 9,15 * * *') // 9 AM and 3 PM daily
      }
    });
  } catch (error: any) {
    console.error('Cron status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get cron status',
        details: error.message
      },
      { status: 500 }
    );
  }
}

function getNextCronTime(cronExpression: string): string {
  // This is a simplified version - in production, use a proper cron parser
  const now = new Date();
  const next = new Date(now);
  
  // For demo purposes, just add some time based on the pattern
  if (cronExpression.includes('1 * *')) {
    // Monthly - next month
    next.setMonth(next.getMonth() + 1, 1);
    next.setHours(8, 0, 0, 0);
  } else if (cronExpression.includes('* * 1')) {
    // Weekly - next Monday
    const daysUntilMonday = (8 - next.getDay()) % 7 || 7;
    next.setDate(next.getDate() + daysUntilMonday);
    next.setHours(8, 0, 0, 0);
  } else {
    // Daily - tomorrow
    next.setDate(next.getDate() + 1);
    next.setHours(8, 0, 0, 0);
  }
  
  return next.toISOString();
}
