import { NextRequest, NextResponse } from "next/server";
import { 
  NOTIFICATION_TEMPLATES, 
  getTemplateById, 
  replaceVariables 
} from "@/lib/notification-templates";
import { NotificationService } from "@/lib/notification-service";

// GET /api/notifications/templates/predefined - Get predefined template by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({
        success: true,
        templates: NOTIFICATION_TEMPLATES,
      });
    }

    const template = getTemplateById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Error getting predefined template:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get predefined template" },
      { status: 500 }
    );
  }
}

// POST /api/notifications/templates/predefined - Send notification using predefined template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateId,
      recipientId,
      recipientType,
      variables = {},
      createdBy,
      scheduledAt,
      channels,
    } = body;

    // Validation
    if (!templateId || !recipientId || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: "templateId, recipientId, and createdBy are required",
        },
        { status: 400 }
      );
    }

    // Get predefined template
    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    // Replace variables in title and message
    const title = replaceVariables(template.title, variables);
    const message = replaceVariables(template.message, variables);

    // Create notification using the template
    const notification = await NotificationService.createNotification({
      title,
      message,
      type: template.type,
      priority: "NORMAL",
      channels: channels || template.channels,
      recipientId,
      recipientType,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy,
      metadata: {
        templateId,
        variables,
        templateName: template.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully using predefined template",
      notification,
      template: {
        id: template.id,
        name: template.name,
        title,
        message,
      },
    });
  } catch (error) {
    console.error("Error sending notification with predefined template:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send notification" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/templates/predefined - Send bulk notifications using predefined template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateId,
      recipients, // Array of {recipientId, recipientType, variables}
      createdBy,
      scheduledAt,
      channels,
    } = body;

    // Validation
    if (!templateId || !recipients || !Array.isArray(recipients) || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: "templateId, recipients array, and createdBy are required",
        },
        { status: 400 }
      );
    }

    // Get predefined template
    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];

    // Send notification to each recipient
    for (const recipient of recipients) {
      try {
        const { recipientId, recipientType, variables = {} } = recipient;

        if (!recipientId) {
          errors.push({
            recipient,
            error: "recipientId is required",
          });
          continue;
        }

        // Replace variables in title and message
        const title = replaceVariables(template.title, variables);
        const message = replaceVariables(template.message, variables);

        // Create notification
        const notification = await NotificationService.createNotification({
          title,
          message,
          type: template.type,
          priority: "NORMAL",
          channels: channels || template.channels,
          recipientId,
          recipientType,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
          createdBy,
          metadata: {
            templateId,
            variables,
            templateName: template.name,
          },
        });

        results.push({
          recipientId,
          notificationId: notification.id,
          success: true,
        });
      } catch (error) {
        console.error(`Error sending notification to ${recipient.recipientId}:`, error);
        errors.push({
          recipient,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk notifications sent. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
      template: {
        id: template.id,
        name: template.name,
      },
    });
  } catch (error) {
    console.error("Error sending bulk notifications with predefined template:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send bulk notifications" },
      { status: 500 }
    );
  }
}
