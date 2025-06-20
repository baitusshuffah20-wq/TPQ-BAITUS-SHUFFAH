import { PrismaClient } from '@prisma/client';
import { WhatsAppService } from './whatsapp-service';
import { EmailService } from './email-service';

const prisma = new PrismaClient();

// Notification Types
export const NotificationType = {
  PAYMENT_REMINDER: 'PAYMENT_REMINDER',
  PAYMENT_CONFIRMATION: 'PAYMENT_CONFIRMATION',
  SPP_OVERDUE: 'SPP_OVERDUE',
  ATTENDANCE_ALERT: 'ATTENDANCE_ALERT',
  HAFALAN_PROGRESS: 'HAFALAN_PROGRESS',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
  ACCOUNT_UPDATE: 'ACCOUNT_UPDATE',
  REPORT_READY: 'REPORT_READY',
  MAINTENANCE_NOTICE: 'MAINTENANCE_NOTICE',
  EMERGENCY_ALERT: 'EMERGENCY_ALERT'
} as const;

// Notification Priorities
export const NotificationPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

// Notification Channels
export const NotificationChannel = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  SMS: 'SMS'
} as const;

// Notification Status
export const NotificationStatus = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
} as const;

// Recipient Types
export const RecipientType = {
  USER: 'USER',
  SANTRI: 'SANTRI',
  WALI: 'WALI',
  MUSYRIF: 'MUSYRIF',
  ADMIN: 'ADMIN',
  ALL_USERS: 'ALL_USERS',
  ALL_WALI: 'ALL_WALI',
  ALL_MUSYRIF: 'ALL_MUSYRIF'
} as const;

// Delivery Status
export const DeliveryStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED'
} as const;

interface CreateNotificationData {
  title: string;
  message: string;
  type: string;
  priority?: string;
  channels: string[];
  recipientId?: string;
  recipientType?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  createdBy: string;
}

interface NotificationTemplate {
  name: string;
  title: string;
  message: string;
  type: string;
  channels: string[];
  variables?: Record<string, any>;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority || NotificationPriority.NORMAL,
          status: NotificationStatus.PENDING,
          channels: data.channels.join(','),
          recipientId: data.recipientId,
          recipientType: data.recipientType,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          scheduledAt: data.scheduledAt,
          createdBy: data.createdBy
        }
      });

      // Process notification immediately if not scheduled
      if (!data.scheduledAt) {
        await this.processNotification(notification.id);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Process a notification (send through all channels)
  static async processNotification(notificationId: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        include: {
          recipient: true
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Update status to sending
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: NotificationStatus.SENDING }
      });

      const channels = notification.channels.split(',');
      const results = [];

      // Send through each channel
      for (const channel of channels) {
        try {
          let result;
          switch (channel.trim()) {
            case NotificationChannel.IN_APP:
              result = await this.sendInAppNotification(notification);
              break;
            case NotificationChannel.EMAIL:
              result = await this.sendEmailNotification(notification);
              break;
            case NotificationChannel.WHATSAPP:
              result = await this.sendWhatsAppNotification(notification);
              break;
            case NotificationChannel.SMS:
              result = await this.sendSMSNotification(notification);
              break;
            default:
              result = { success: false, error: 'Unknown channel' };
          }

          // Log the result
          await prisma.notificationLog.create({
            data: {
              notificationId: notification.id,
              channel: channel.trim(),
              recipient: this.getRecipientAddress(notification, channel.trim()),
              status: result.success ? DeliveryStatus.SENT : DeliveryStatus.FAILED,
              response: JSON.stringify(result),
              errorMessage: result.error || null
            }
          });

          results.push({ channel, ...result });
        } catch (error) {
          console.error(`Error sending notification via ${channel}:`, error);
          
          // Log the error
          await prisma.notificationLog.create({
            data: {
              notificationId: notification.id,
              channel: channel.trim(),
              recipient: this.getRecipientAddress(notification, channel.trim()),
              status: DeliveryStatus.FAILED,
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
          });

          results.push({ channel, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      // Update notification status
      const allSuccessful = results.every(r => r.success);
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: allSuccessful ? NotificationStatus.SENT : NotificationStatus.FAILED,
          sentAt: new Date()
        }
      });

      return { success: allSuccessful, results };
    } catch (error) {
      console.error('Error processing notification:', error);
      
      // Update notification status to failed
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: NotificationStatus.FAILED }
      });

      throw error;
    }
  }

  // Send in-app notification
  private static async sendInAppNotification(notification: any) {
    try {
      // In-app notifications are already stored in database
      // Just mark as delivered
      return { success: true, messageId: notification.id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send email notification
  private static async sendEmailNotification(notification: any) {
    try {
      if (!notification.recipient?.email) {
        throw new Error('Recipient email address not found');
      }

      const emailService = new EmailService();

      // Create HTML content for email
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #059669; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TPQ Baitus Shuffah</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #374151;">${notification.title}</h2>
            <div style="color: #6b7280; line-height: 1.6;">
              ${notification.message.replace(/\n/g, '<br>')}
            </div>
            ${notification.data ? `
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Detail Informasi</h3>
                ${Object.entries(notification.data).map(([key, value]) =>
                  `<p><strong>${key}:</strong> ${value}</p>`
                ).join('')}
              </div>
            ` : ''}
          </div>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Email ini dikirim secara otomatis dari sistem TPQ Baitus Shuffah.</p>
            <p style="color: #059669; font-weight: bold;">Barakallahu fiikum</p>
          </div>
        </div>
      `;

      const result = await emailService.sendEmail({
        to: notification.recipient.email,
        subject: notification.title,
        html,
        priority: notification.priority || 'NORMAL'
      }, {
        notificationId: notification.id,
        type: notification.type,
        priority: notification.priority
      });

      return {
        success: true,
        messageId: result.messageId || `email_${Date.now()}`
      };
    } catch (error) {
      console.error('Email notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send WhatsApp notification
  private static async sendWhatsAppNotification(notification: any) {
    try {
      if (!notification.recipient?.phone) {
        throw new Error('Recipient phone number not found');
      }

      const whatsappService = new WhatsAppService();
      const message = `${notification.title}\n\n${notification.message}`;

      const result = await whatsappService.sendTextMessage(
        notification.recipient.phone,
        message,
        {
          notificationId: notification.id,
          type: notification.type,
          priority: notification.priority
        }
      );

      return {
        success: true,
        messageId: result.messages?.[0]?.id || `whatsapp_${Date.now()}`
      };
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send SMS notification
  private static async sendSMSNotification(notification: any) {
    try {
      // TODO: Implement SMS API integration
      // For now, just simulate success
      console.log('Sending SMS notification:', {
        to: notification.recipient?.phone,
        message: `${notification.title}: ${notification.message}`
      });

      return { success: true, messageId: `sms_${Date.now()}` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get recipient address for specific channel
  private static getRecipientAddress(notification: any, channel: string): string {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return notification.recipient?.email || 'unknown@email.com';
      case NotificationChannel.WHATSAPP:
      case NotificationChannel.SMS:
        return notification.recipient?.phone || 'unknown-phone';
      case NotificationChannel.IN_APP:
        return notification.recipientId || 'unknown-user';
      default:
        return 'unknown';
    }
  }

  // Create notification template
  static async createTemplate(template: NotificationTemplate & { createdBy: string }) {
    try {
      return await prisma.notificationTemplate.create({
        data: {
          name: template.name,
          title: template.title,
          message: template.message,
          type: template.type,
          channels: template.channels.join(','),
          variables: template.variables ? JSON.stringify(template.variables) : null,
          createdBy: template.createdBy
        }
      });
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  }

  // Send notification from template
  static async sendFromTemplate(
    templateName: string,
    recipientId: string,
    variables: Record<string, any> = {},
    createdBy: string
  ) {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name: templateName, isActive: true }
      });

      if (!template) {
        throw new Error(`Template '${templateName}' not found or inactive`);
      }

      // Replace variables in title and message
      let title = template.title;
      let message = template.message;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        title = title.replace(new RegExp(placeholder, 'g'), String(value));
        message = message.replace(new RegExp(placeholder, 'g'), String(value));
      });

      return await this.createNotification({
        title,
        message,
        type: template.type,
        channels: template.channels.split(','),
        recipientId,
        createdBy
      });
    } catch (error) {
      console.error('Error sending notification from template:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      return await prisma.notification.findMany({
        where: {
          recipientId: userId,
          channels: {
            contains: NotificationChannel.IN_APP
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      return await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId?: string) {
    try {
      const where = userId ? { recipientId: userId } : {};

      const [total, unread, byType, byStatus] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.count({ 
          where: { ...where, readAt: null, channels: { contains: NotificationChannel.IN_APP } }
        }),
        prisma.notification.groupBy({
          by: ['type'],
          where,
          _count: true
        }),
        prisma.notification.groupBy({
          by: ['status'],
          where,
          _count: true
        })
      ]);

      return {
        total,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}
