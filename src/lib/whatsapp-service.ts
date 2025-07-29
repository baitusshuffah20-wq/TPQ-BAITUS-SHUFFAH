import { prisma } from "@/lib/prisma";

// WhatsApp Message Types
export const WhatsAppMessageType = {
  TEXT: "text",
  TEMPLATE: "template",
  INTERACTIVE: "interactive",
  DOCUMENT: "document",
  IMAGE: "image",
} as const;

// WhatsApp Message Status
export const WhatsAppMessageStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED",
} as const;

// WhatsApp Template Categories
export const WhatsAppTemplateCategory = {
  AUTHENTICATION: "AUTHENTICATION",
  MARKETING: "MARKETING",
  UTILITY: "UTILITY",
} as const;

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  apiVersion: string;
  baseUrl: string;
}

interface WhatsAppMessageResponse {
  messages?: Array<{
    id: string;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

interface MessageContext {
  [key: string]: unknown;
}

interface SendMessageData {
  to: string;
  type: string;
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
      apiVersion: process.env.WHATSAPP_API_VERSION || "v18.0",
      baseUrl:
        process.env.WHATSAPP_API_BASE_URL || "https://graph.facebook.com",
    };
  }

  // Send text message
  async sendTextMessage(
    to: string,
    message: string,
    context?: MessageContext,
  ): Promise<WhatsAppMessageResponse> {
    try {
      const messageData: SendMessageData = {
        to: this.formatPhoneNumber(to),
        type: WhatsAppMessageType.TEXT,
        text: {
          body: message,
        },
      };

      const response = await this.sendMessage(messageData);

      // Log message to database
      await this.logMessage({
        recipient: to,
        messageType: WhatsAppMessageType.TEXT,
        content: message,
        status: WhatsAppMessageStatus.SENT,
        whatsappMessageId: response.messages?.[0]?.id,
        context: context ? JSON.stringify(context) : null,
      });

      return response;
    } catch (error) {
      console.error("Error sending WhatsApp text message:", error);

      // Log failed message
      await this.logMessage({
        recipient: to,
        messageType: WhatsAppMessageType.TEXT,
        content: message,
        status: WhatsAppMessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        context: context ? JSON.stringify(context) : null,
      });

      throw error;
    }
  }

  // Send template message
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = "id",
    parameters: Array<{ type: string; text: string }> = [],
  ): Promise<WhatsAppMessageResponse> {
    try {
      const messageData: SendMessageData = {
        to: this.formatPhoneNumber(to),
        type: WhatsAppMessageType.TEMPLATE,
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      };

      // Add parameters if provided
      if (parameters.length > 0) {
        messageData.template!.components = [
          {
            type: "body",
            parameters: parameters,
          },
        ];
      }

      const response = await this.sendMessage(messageData);

      // Log message to database
      await this.logMessage({
        recipient: to,
        messageType: WhatsAppMessageType.TEMPLATE,
        content: `Template: ${templateName}`,
        status: WhatsAppMessageStatus.SENT,
        whatsappMessageId: response.messages?.[0]?.id,
        templateName,
        parameters: parameters.length > 0 ? JSON.stringify(parameters) : null,
      });

      return response;
    } catch (error) {
      console.error("Error sending WhatsApp template message:", error);

      // Log failed message
      await this.logMessage({
        recipient: to,
        messageType: WhatsAppMessageType.TEMPLATE,
        content: `Template: ${templateName}`,
        status: WhatsAppMessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        templateName,
        parameters: parameters.length > 0 ? JSON.stringify(parameters) : null,
      });

      throw error;
    }
  }

  // Send bulk messages
  async sendBulkMessages(
    recipients: string[],
    message: string,
    context?: MessageContext,
  ): Promise<
    Array<{
      recipient: string;
      success: boolean;
      result?: WhatsAppMessageResponse;
      error?: string;
    }>
  > {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendTextMessage(recipient, message, context);
        results.push({ recipient, success: true, result });

        // Add delay to avoid rate limiting
        await this.delay(1000);
      } catch (error) {
        console.error(`Error sending message to ${recipient}:`, error);
        results.push({
          recipient,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  // Send bulk template messages
  async sendBulkTemplateMessages(
    recipients: string[],
    templateName: string,
    languageCode: string = "id",
    parametersMap: Record<string, Array<{ type: string; text: string }>> = {},
  ): Promise<
    Array<{
      recipient: string;
      success: boolean;
      result?: WhatsAppMessageResponse;
      error?: string;
    }>
  > {
    const results = [];

    for (const recipient of recipients) {
      try {
        const parameters = parametersMap[recipient] || [];
        const result = await this.sendTemplateMessage(
          recipient,
          templateName,
          languageCode,
          parameters,
        );
        results.push({ recipient, success: true, result });

        // Add delay to avoid rate limiting
        await this.delay(1000);
      } catch (error) {
        console.error(`Error sending template message to ${recipient}:`, error);
        results.push({
          recipient,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  // Core send message method
  private async sendMessage(
    messageData: SendMessageData,
  ): Promise<WhatsAppMessageResponse> {
    const url = `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `WhatsApp API Error: ${errorData.error?.message || response.statusText}`,
      );
    }

    return await response.json();
  }

  // Format phone number for WhatsApp
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // Add country code if not present (assuming Indonesia +62)
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }

    return cleaned;
  }

  // Log message to database
  private async logMessage(data: {
    recipient: string;
    messageType: string;
    content: string;
    status: string;
    whatsappMessageId?: string;
    templateName?: string;
    parameters?: string;
    errorMessage?: string;
    context?: string;
  }) {
    try {
      // TODO: Fix Prisma schema field names
      // The current schema doesn't match these field names
      // Need to update either the schema or the field names
      console.log("WhatsApp message logged:", {
        recipient: data.recipient,
        messageType: data.messageType,
        content: data.content,
        status: data.status,
      });

      /*
      await prisma.whatsAppMessage.create({
        data: {
          // Update these field names to match the actual Prisma schema
          recipient: data.recipient,
          messageType: data.messageType,
          content: data.content,
          status: data.status,
          whatsappMessageId: data.whatsappMessageId,
          templateName: data.templateName,
          parameters: data.parameters,
          errorMessage: data.errorMessage,
          context: data.context,
          sentAt:
            data.status === WhatsAppMessageStatus.SENT ? new Date() : null,
        },
      });
      */
    } catch (error) {
      console.error("Error logging WhatsApp message:", error);
    }
  }

  // Update message status (for webhook)
  async updateMessageStatus(
    whatsappMessageId: string,
    status: string,
    timestamp?: string,
  ) {
    try {
      // TODO: Fix Prisma schema field names
      console.log("WhatsApp message status updated:", {
        whatsappMessageId,
        status,
        timestamp,
      });

      /*
      await prisma.whatsAppMessage.updateMany({
        where: { whatsappMessageId }, // Update field name to match schema
        data: {
          status,
          deliveredAt: // Update field name to match schema
            status === WhatsAppMessageStatus.DELIVERED
              ? new Date(timestamp || Date.now())
              : undefined,
          readAt: // Update field name to match schema
            status === WhatsAppMessageStatus.READ
              ? new Date(timestamp || Date.now())
              : undefined,
        },
      });
      */
    } catch (error) {
      console.error("Error updating WhatsApp message status:", error);
    }
  }

  // Get message statistics
  async getMessageStats(startDate?: Date, endDate?: Date) {
    try {
      const where: { createdAt?: { gte: Date; lte: Date } } = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const [total, byStatus, byType] = await Promise.all([
        prisma.whatsAppMessage.count({ where }),
        prisma.whatsAppMessage.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),
        prisma.whatsAppMessage.groupBy({
          by: ["messageType"],
          where,
          _count: true,
        }),
      ]);

      return {
        total,
        byStatus: byStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
        byType: byType.reduce(
          (acc, item) => {
            acc[item.messageType] = item._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };
    } catch (error) {
      console.error("Error getting WhatsApp message stats:", error);
      throw error;
    }
  }

  // Get recent messages
  async getRecentMessages(limit: number = 50, offset: number = 0) {
    try {
      return await prisma.whatsAppMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error getting recent WhatsApp messages:", error);
      throw error;
    }
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Verify webhook
  static verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
  ): string | null {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken) {
      return challenge;
    }

    return null;
  }

  // Process webhook data
  async processWebhook(body: {
    object: string;
    entry: Array<{
      changes: Array<{
        field: string;
        value: {
          statuses?: Array<{
            id: string;
            status: string;
            timestamp: string;
          }>;
          messages?: Array<{
            id: string;
            from: string;
            timestamp: string;
            type: string;
            text?: { body: string };
          }>;
        };
      }>;
    }>;
  }) {
    try {
      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === "messages") {
              // Process message status updates
              if (change.value.statuses) {
                for (const status of change.value.statuses) {
                  await this.updateMessageStatus(
                    status.id,
                    status.status.toUpperCase(),
                    status.timestamp,
                  );
                }
              }

              // Process incoming messages (for future use)
              if (change.value.messages) {
                for (const message of change.value.messages) {
                  console.log("Received incoming message:", message);
                  // Handle incoming messages here if needed
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
      throw error;
    }
  }
}
