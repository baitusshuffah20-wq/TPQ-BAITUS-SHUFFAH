import { NextRequest, NextResponse } from 'next/server';
import { NotificationService, NotificationType, NotificationChannel, RecipientType } from '@/lib/notification-service';
import { prisma } from '@/lib/prisma';

// POST /api/notifications/send - Send notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateName,
      recipientId,
      recipientType,
      variables = {},
      createdBy,
      // Or direct notification data
      title,
      message,
      type,
      channels,
      priority,
      scheduledAt
    } = body;

    if (!createdBy) {
      return NextResponse.json(
        { success: false, message: 'createdBy is required' },
        { status: 400 }
      );
    }

    let notification;

    if (templateName) {
      // Send from template
      if (!recipientId) {
        return NextResponse.json(
          { success: false, message: 'recipientId is required when using template' },
          { status: 400 }
        );
      }

      notification = await NotificationService.sendFromTemplate(
        templateName,
        recipientId,
        variables,
        createdBy
      );
    } else {
      // Send direct notification
      if (!title || !message || !type) {
        return NextResponse.json(
          { success: false, message: 'title, message, and type are required for direct notification' },
          { status: 400 }
        );
      }

      notification = await NotificationService.createNotification({
        title,
        message,
        type,
        priority,
        channels: channels || [NotificationChannel.IN_APP],
        recipientId,
        recipientType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        createdBy
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/send/bulk - Send bulk notifications
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateName,
      recipientType,
      recipientIds,
      variables = {},
      createdBy,
      // Or direct notification data
      title,
      message,
      type,
      channels,
      priority
    } = body;

    if (!createdBy) {
      return NextResponse.json(
        { success: false, message: 'createdBy is required' },
        { status: 400 }
      );
    }

    let recipients: string[] = [];

    // Determine recipients
    if (recipientIds && Array.isArray(recipientIds)) {
      recipients = recipientIds;
    } else if (recipientType) {
      // Get recipients based on type
      switch (recipientType) {
        case RecipientType.ALL_USERS:
          const allUsers = await prisma.user.findMany({
            where: { isActive: true },
            select: { id: true }
          });
          recipients = allUsers.map(u => u.id);
          break;

        case RecipientType.ALL_WALI:
          const waliUsers = await prisma.user.findMany({
            where: { role: 'WALI', isActive: true },
            select: { id: true }
          });
          recipients = waliUsers.map(u => u.id);
          break;

        case RecipientType.ALL_MUSYRIF:
          const musyrifUsers = await prisma.user.findMany({
            where: { role: 'MUSYRIF', isActive: true },
            select: { id: true }
          });
          recipients = musyrifUsers.map(u => u.id);
          break;

        default:
          return NextResponse.json(
            { success: false, message: 'Invalid recipient type' },
            { status: 400 }
          );
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'recipientIds or recipientType is required' },
        { status: 400 }
      );
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No recipients found' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Send notification to each recipient
    for (const recipientId of recipients) {
      try {
        let notification;

        if (templateName) {
          notification = await NotificationService.sendFromTemplate(
            templateName,
            recipientId,
            variables,
            createdBy
          );
        } else {
          if (!title || !message || !type) {
            throw new Error('title, message, and type are required for direct notification');
          }

          notification = await NotificationService.createNotification({
            title,
            message,
            type,
            priority,
            channels: channels || [NotificationChannel.IN_APP],
            recipientId,
            createdBy
          });
        }

        results.push({ recipientId, notificationId: notification.id, success: true });
      } catch (error) {
        console.error(`Error sending notification to ${recipientId}:`, error);
        errors.push({
          recipientId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk notification sent to ${results.length} recipients`,
      results: {
        successful: results.length,
        failed: errors.length,
        total: recipients.length,
        details: results,
        errors
      }
    });
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send bulk notification' },
      { status: 500 }
    );
  }
}
