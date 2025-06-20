import { NextRequest, NextResponse } from 'next/server';
import { NotificationService, NotificationType, NotificationChannel, NotificationPriority } from '@/lib/notification-service';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (statsOnly) {
      const stats = await NotificationService.getNotificationStats(userId);
      return NextResponse.json({
        success: true,
        stats
      });
    }

    const notifications = await NotificationService.getUserNotifications(userId, limit, offset);
    const stats = await NotificationService.getNotificationStats(userId);

    return NextResponse.json({
      success: true,
      notifications,
      stats,
      pagination: {
        limit,
        offset,
        total: stats.total
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      type,
      priority = NotificationPriority.NORMAL,
      channels = [NotificationChannel.IN_APP],
      recipientId,
      recipientType,
      metadata,
      scheduledAt,
      createdBy
    } = body;

    // Validation
    if (!title || !message || !type || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Title, message, type, and createdBy are required' },
        { status: 400 }
      );
    }

    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification type' },
        { status: 400 }
      );
    }

    const notification = await NotificationService.createNotification({
      title,
      message,
      type,
      priority,
      channels,
      recipientId,
      recipientType,
      metadata,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy
    });

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, action } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'Notification ID is required' },
        { status: 400 }
      );
    }

    if (action === 'mark_read') {
      const notification = await NotificationService.markAsRead(notificationId);
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
        notification
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
