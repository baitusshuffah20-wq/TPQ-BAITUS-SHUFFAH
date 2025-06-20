import { NextRequest, NextResponse } from 'next/server';
import { NotificationTriggerService } from '@/lib/notification-triggers';

// POST /api/notifications/triggers - Run specific trigger manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { triggerType, targetId } = body;

    if (!triggerType) {
      return NextResponse.json(
        { success: false, message: 'Trigger type is required' },
        { status: 400 }
      );
    }

    let result;
    const startTime = Date.now();

    switch (triggerType) {
      case 'PAYMENT_DUE_REMINDERS':
        result = await NotificationTriggerService.checkPaymentDueReminders();
        break;

      case 'PAYMENT_OVERDUE_NOTIFICATIONS':
        result = await NotificationTriggerService.checkPaymentOverdueNotifications();
        break;

      case 'PAYMENT_CONFIRMATION':
        if (!targetId) {
          return NextResponse.json(
            { success: false, message: 'Payment ID is required for payment confirmation' },
            { status: 400 }
          );
        }
        await NotificationTriggerService.sendPaymentConfirmation(targetId);
        result = 1;
        break;

      case 'ATTENDANCE_ALERT':
        if (!targetId) {
          return NextResponse.json(
            { success: false, message: 'Attendance ID is required for attendance alert' },
            { status: 400 }
          );
        }
        await NotificationTriggerService.sendAttendanceAlert(targetId);
        result = 1;
        break;

      case 'HAFALAN_MILESTONE':
        if (!targetId) {
          return NextResponse.json(
            { success: false, message: 'Progress ID is required for hafalan milestone' },
            { status: 400 }
          );
        }
        await NotificationTriggerService.sendHafalanMilestone(targetId);
        result = 1;
        break;

      case 'MONTHLY_REPORTS':
        result = await NotificationTriggerService.generateMonthlyReports();
        break;

      case 'BIRTHDAY_REMINDERS':
        result = await NotificationTriggerService.sendBirthdayReminders();
        break;

      case 'ALL_SCHEDULED':
        const results = await NotificationTriggerService.runScheduledTriggers();
        const successful = results.filter(r => r.status === 'fulfilled').length;
        result = successful;
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid trigger type' },
          { status: 400 }
        );
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    return NextResponse.json({
      success: true,
      message: `Trigger ${triggerType} executed successfully`,
      data: {
        triggerType,
        notificationsSent: result,
        duration,
        executedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error running manual trigger:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to run trigger',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/notifications/triggers - Get available triggers
export async function GET(request: NextRequest) {
  try {
    const triggers = [
      {
        type: 'PAYMENT_DUE_REMINDERS',
        name: 'Payment Due Reminders',
        description: 'Send reminders for payments due in 3 days',
        category: 'Payment',
        requiresTarget: false,
        schedule: 'Daily at 9:00 AM'
      },
      {
        type: 'PAYMENT_OVERDUE_NOTIFICATIONS',
        name: 'Payment Overdue Notifications',
        description: 'Send notifications for overdue payments',
        category: 'Payment',
        requiresTarget: false,
        schedule: 'Daily at 9:00 AM'
      },
      {
        type: 'PAYMENT_CONFIRMATION',
        name: 'Payment Confirmation',
        description: 'Send confirmation when payment is received',
        category: 'Payment',
        requiresTarget: true,
        targetType: 'paymentId',
        schedule: 'Immediate'
      },
      {
        type: 'ATTENDANCE_ALERT',
        name: 'Attendance Alert',
        description: 'Send alert when student is absent',
        category: 'Attendance',
        requiresTarget: true,
        targetType: 'attendanceId',
        schedule: 'Immediate'
      },
      {
        type: 'HAFALAN_MILESTONE',
        name: 'Hafalan Milestone',
        description: 'Send notification for hafalan achievements',
        category: 'Academic',
        requiresTarget: true,
        targetType: 'progressId',
        schedule: 'Immediate'
      },
      {
        type: 'MONTHLY_REPORTS',
        name: 'Monthly Reports',
        description: 'Generate and send monthly progress reports',
        category: 'Reports',
        requiresTarget: false,
        schedule: 'Monthly on 1st at 9:00 AM'
      },
      {
        type: 'BIRTHDAY_REMINDERS',
        name: 'Birthday Reminders',
        description: 'Send birthday wishes to students',
        category: 'Social',
        requiresTarget: false,
        schedule: 'Daily at 9:00 AM'
      },
      {
        type: 'ALL_SCHEDULED',
        name: 'All Scheduled Triggers',
        description: 'Run all scheduled triggers at once',
        category: 'System',
        requiresTarget: false,
        schedule: 'Manual'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        triggers,
        categories: ['Payment', 'Attendance', 'Academic', 'Reports', 'Social', 'System']
      }
    });
  } catch (error) {
    console.error('Error getting triggers:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get triggers',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
