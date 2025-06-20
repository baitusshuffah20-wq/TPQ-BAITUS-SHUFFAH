import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Email Message Types
export const EmailMessageType = {
  NOTIFICATION: 'NOTIFICATION',
  REPORT: 'REPORT',
  NEWSLETTER: 'NEWSLETTER',
  VERIFICATION: 'VERIFICATION',
  RESET_PASSWORD: 'RESET_PASSWORD',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT'
} as const;

// Email Status
export const EmailStatus = {
  PENDING: 'PENDING',
  SENDING: 'SENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  REJECTED: 'REJECTED'
} as const;

// Email Priority
export const EmailPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

interface SendEmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
    contentType?: string;
  }>;
  priority?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables?: Record<string, any>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      },
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TPQ Baitus Shuffah',
        address: process.env.EMAIL_FROM_ADDRESS || 'noreply@tpqbaitusshuffah.com'
      }
    };

    this.transporter = nodemailer.createTransporter({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth
    });
  }

  // Send email
  async sendEmail(data: SendEmailData, context?: any): Promise<any> {
    try {
      const mailOptions = {
        from: `${this.config.from.name} <${this.config.from.address}>`,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
        attachments: data.attachments,
        replyTo: data.replyTo,
        cc: Array.isArray(data.cc) ? data.cc.join(', ') : data.cc,
        bcc: Array.isArray(data.bcc) ? data.bcc.join(', ') : data.bcc,
        priority: this.mapPriority(data.priority || EmailPriority.NORMAL)
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Log email to database
      await this.logEmail({
        recipient: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        content: data.html || data.text || '',
        status: EmailStatus.SENT,
        messageId: result.messageId,
        priority: data.priority || EmailPriority.NORMAL,
        context: context ? JSON.stringify(context) : null
      });

      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error('Error sending email:', error);

      // Log failed email
      await this.logEmail({
        recipient: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        content: data.html || data.text || '',
        status: EmailStatus.FAILED,
        priority: data.priority || EmailPriority.NORMAL,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        context: context ? JSON.stringify(context) : null
      });

      throw error;
    }
  }

  // Send template email
  async sendTemplateEmail(
    to: string | string[],
    templateName: string,
    variables: Record<string, any> = {},
    options: {
      priority?: string;
      attachments?: any[];
      replyTo?: string;
      cc?: string | string[];
      bcc?: string | string[];
    } = {}
  ): Promise<any> {
    try {
      const template = await this.getTemplate(templateName);
      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }

      // Replace variables in subject and content
      let subject = template.subject;
      let html = template.html;
      let text = template.text || '';

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(placeholder, String(value));
        html = html.replace(placeholder, String(value));
        text = text.replace(placeholder, String(value));
      });

      return await this.sendEmail({
        to,
        subject,
        html,
        text: text || undefined,
        ...options
      }, { templateName, variables });
    } catch (error) {
      console.error('Error sending template email:', error);
      throw error;
    }
  }

  // Send bulk emails
  async sendBulkEmails(
    recipients: string[],
    subject: string,
    content: { html?: string; text?: string },
    options: {
      priority?: string;
      attachments?: any[];
      batchSize?: number;
      delay?: number;
    } = {}
  ): Promise<any[]> {
    const results = [];
    const batchSize = options.batchSize || 10;
    const delay = options.delay || 1000;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const recipient of batch) {
        try {
          const result = await this.sendEmail({
            to: recipient,
            subject,
            html: content.html,
            text: content.text,
            priority: options.priority,
            attachments: options.attachments
          });

          results.push({ recipient, success: true, result });
        } catch (error) {
          console.error(`Error sending email to ${recipient}:`, error);
          results.push({
            recipient,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await this.delay(delay);
      }
    }

    return results;
  }

  // Send bulk template emails
  async sendBulkTemplateEmails(
    recipients: string[],
    templateName: string,
    variablesMap: Record<string, Record<string, any>> = {},
    options: {
      priority?: string;
      batchSize?: number;
      delay?: number;
    } = {}
  ): Promise<any[]> {
    const results = [];
    const batchSize = options.batchSize || 10;
    const delay = options.delay || 1000;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const recipient of batch) {
        try {
          const variables = variablesMap[recipient] || {};
          const result = await this.sendTemplateEmail(
            recipient,
            templateName,
            variables,
            { priority: options.priority }
          );

          results.push({ recipient, success: true, result });
        } catch (error) {
          console.error(`Error sending template email to ${recipient}:`, error);
          results.push({
            recipient,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await this.delay(delay);
      }
    }

    return results;
  }

  // Get email template
  private async getTemplate(name: string): Promise<EmailTemplate | null> {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { name, isActive: true }
      });

      if (!template) return null;

      return {
        name: template.name,
        subject: template.subject,
        html: template.html,
        text: template.text || undefined,
        variables: template.variables ? JSON.parse(template.variables) : {}
      };
    } catch (error) {
      console.error('Error getting email template:', error);
      return null;
    }
  }

  // Create email template
  async createTemplate(template: EmailTemplate & { createdBy: string }): Promise<any> {
    try {
      return await prisma.emailTemplate.create({
        data: {
          name: template.name,
          subject: template.subject,
          html: template.html,
          text: template.text,
          variables: template.variables ? JSON.stringify(template.variables) : null,
          createdBy: template.createdBy
        }
      });
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  // Log email to database
  private async logEmail(data: {
    recipient: string;
    subject: string;
    content: string;
    status: string;
    messageId?: string;
    priority: string;
    errorMessage?: string;
    context?: string;
  }) {
    try {
      await prisma.emailMessage.create({
        data: {
          recipient: data.recipient,
          subject: data.subject,
          content: data.content,
          status: data.status,
          messageId: data.messageId,
          priority: data.priority,
          errorMessage: data.errorMessage,
          context: data.context,
          sentAt: data.status === EmailStatus.SENT ? new Date() : null
        }
      });
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  // Update email status (for webhooks)
  async updateEmailStatus(messageId: string, status: string, timestamp?: string) {
    try {
      await prisma.emailMessage.updateMany({
        where: { messageId },
        data: {
          status,
          deliveredAt: status === EmailStatus.DELIVERED ? new Date(timestamp || Date.now()) : undefined,
          bouncedAt: status === EmailStatus.BOUNCED ? new Date(timestamp || Date.now()) : undefined
        }
      });
    } catch (error) {
      console.error('Error updating email status:', error);
    }
  }

  // Get email statistics
  async getEmailStats(startDate?: Date, endDate?: Date) {
    try {
      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate
        };
      }

      const [total, byStatus, byPriority] = await Promise.all([
        prisma.emailMessage.count({ where }),
        prisma.emailMessage.groupBy({
          by: ['status'],
          where,
          _count: true
        }),
        prisma.emailMessage.groupBy({
          by: ['priority'],
          where,
          _count: true
        })
      ]);

      return {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      throw error;
    }
  }

  // Get recent emails
  async getRecentEmails(limit: number = 50, offset: number = 0) {
    try {
      return await prisma.emailMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting recent emails:', error);
      throw error;
    }
  }

  // Map priority to nodemailer priority
  private mapPriority(priority: string): 'high' | 'normal' | 'low' {
    switch (priority) {
      case EmailPriority.URGENT:
      case EmailPriority.HIGH:
        return 'high';
      case EmailPriority.LOW:
        return 'low';
      default:
        return 'normal';
    }
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  // Send test email
  async sendTestEmail(to: string): Promise<any> {
    return await this.sendEmail({
      to,
      subject: 'Test Email dari TPQ Baitus Shuffah',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Assalamu'alaikum</h2>
          <p>Ini adalah email test dari sistem TPQ Baitus Shuffah.</p>
          <p>Jika Anda menerima email ini, berarti konfigurasi email sudah berfungsi dengan baik.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Email ini dikirim secara otomatis dari sistem TPQ Baitus Shuffah.<br>
            Mohon jangan membalas email ini.
          </p>
          <p style="color: #059669; font-weight: bold;">Barakallahu fiikum</p>
        </div>
      `,
      text: 'Assalamu\'alaikum. Ini adalah email test dari sistem TPQ Baitus Shuffah. Jika Anda menerima email ini, berarti konfigurasi email sudah berfungsi dengan baik. Barakallahu fiikum.'
    }, { type: 'test_email' });
  }
}
