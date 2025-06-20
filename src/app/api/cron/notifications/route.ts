import { NextRequest, NextResponse } from 'next/server';
import { NotificationTriggerService } from '@/lib/notification-triggers';

// POST /api/cron/notifications - Run scheduled notification triggers
export async function POST(request: NextRequest) {
  try {
    // Verify cron job authorization (optional)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled notification triggers...');
    const startTime = Date.now();

    // Run all scheduled triggers
    const results = await NotificationTriggerService.runScheduledTriggers();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Count successful and failed triggers
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Notification triggers completed in ${duration}ms`);
    console.log(`Successful: ${successful}, Failed: ${failed}`);

    return NextResponse.json({
      success: true,
      message: 'Scheduled notification triggers completed',
      data: {
        duration,
        successful,
        failed,
        results: results.map((result, index) => ({
          trigger: ['Payment Due', 'Payment Overdue', 'Birthday Reminders'][index],
          status: result.status,
          value: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason?.message : null
        }))
      }
    });
  } catch (error) {
    console.error('Error running scheduled notification triggers:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to run scheduled notification triggers',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/cron/notifications - Get trigger status and next run time
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // Calculate next run times (example: daily at 9 AM)
    const nextRun = new Date();
    nextRun.setHours(9, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    // Get recent trigger logs (if available)
    const recentLogs = await getRecentTriggerLogs();

    return NextResponse.json({
      success: true,
      data: {
        currentTime: now.toISOString(),
        nextScheduledRun: nextRun.toISOString(),
        triggers: [
          {
            name: 'Payment Due Reminders',
            description: 'Send reminders 3 days before payment due date',
            frequency: 'Daily at 9:00 AM',
            enabled: true
          },
          {
            name: 'Payment Overdue Notifications',
            description: 'Send notifications for overdue payments',
            frequency: 'Daily at 9:00 AM',
            enabled: true
          },
          {
            name: 'Birthday Reminders',
            description: 'Send birthday wishes to students',
            frequency: 'Daily at 9:00 AM',
            enabled: true
          },
          {
            name: 'Monthly Reports',
            description: 'Generate and send monthly progress reports',
            frequency: 'Monthly on 1st at 9:00 AM',
            enabled: true
          }
        ],
        recentLogs
      }
    });
  } catch (error) {
    console.error('Error getting trigger status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get trigger status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get recent trigger logs
async function getRecentTriggerLogs() {
  try {
    // This would typically come from a database table
    // For now, return mock data
    return [
      {
        id: '1',
        triggerType: 'Payment Due Reminders',
        executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'SUCCESS',
        notificationsSent: 5,
        duration: 1250
      },
      {
        id: '2',
        triggerType: 'Birthday Reminders',
        executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'SUCCESS',
        notificationsSent: 2,
        duration: 800
      },
      {
        id: '3',
        triggerType: 'Payment Overdue Notifications',
        executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'SUCCESS',
        notificationsSent: 1,
        duration: 600
      }
    ];
  } catch (error) {
    console.error('Error getting recent trigger logs:', error);
    return [];
  }
}
