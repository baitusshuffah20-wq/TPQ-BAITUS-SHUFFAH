import { NextRequest, NextResponse } from 'next/server';
import { NotificationService, NotificationType, NotificationChannel } from '@/lib/notification-service';
import { prisma } from '@/lib/prisma';

// GET /api/notifications/templates - Get notification templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const templates = await prisma.notificationTemplate.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting notification templates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get notification templates' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/templates - Create notification template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      title,
      message,
      type,
      channels = [NotificationChannel.IN_APP],
      variables,
      createdBy
    } = body;

    // Validation
    if (!name || !title || !message || !type || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Name, title, message, type, and createdBy are required' },
        { status: 400 }
      );
    }

    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification type' },
        { status: 400 }
      );
    }

    const template = await NotificationService.createTemplate({
      name,
      title,
      message,
      type,
      channels,
      variables,
      createdBy
    });

    return NextResponse.json({
      success: true,
      message: 'Notification template created successfully',
      template
    });
  } catch (error) {
    console.error('Error creating notification template:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create notification template' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/templates - Update notification template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      title,
      message,
      type,
      channels,
      variables,
      isActive
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (type !== undefined) updateData.type = type;
    if (channels !== undefined) updateData.channels = channels.join(',');
    if (variables !== undefined) updateData.variables = JSON.stringify(variables);
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await prisma.notificationTemplate.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Notification template updated successfully',
      template
    });
  } catch (error) {
    console.error('Error updating notification template:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notification template' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/templates - Delete notification template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      );
    }

    await prisma.notificationTemplate.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Notification template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification template:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete notification template' },
      { status: 500 }
    );
  }
}
