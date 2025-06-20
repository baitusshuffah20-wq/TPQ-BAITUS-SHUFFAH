import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      subject,
      html,
      text,
      attachments,
      priority = 'NORMAL',
      replyTo,
      cc,
      bcc,
      templateName,
      variables = {},
      context,
      // Legacy support
      type,
      recipientId,
      data,
      recipients
    } = body;

    const emailService = new EmailService();

    // Handle legacy format
    if (type && (recipientId || recipients)) {
      return await handleLegacyRequest(type, recipientId, data, recipients, emailService);
    }

    // Validation for new format
    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Recipient email address is required' },
        { status: 400 }
      );
    }

    if (!templateName && !subject) {
      return NextResponse.json(
        { success: false, message: 'Subject is required when not using template' },
        { status: 400 }
      );
    }

    if (!templateName && !html && !text) {
      return NextResponse.json(
        { success: false, message: 'Email content (html or text) is required when not using template' },
        { status: 400 }
      );
    }

    let result;

    if (templateName) {
      // Send template email
      result = await emailService.sendTemplateEmail(
        to,
        templateName,
        variables,
        {
          priority,
          attachments,
          replyTo,
          cc,
          bcc
        }
      );
    } else {
      // Send regular email
      result = await emailService.sendEmail({
        to,
        subject,
        html,
        text,
        attachments,
        priority,
        replyTo,
        cc,
        bcc
      }, context);
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/email/send - Send bulk emails
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipients,
      subject,
      html,
      text,
      templateName,
      variablesMap = {},
      priority = 'NORMAL',
      attachments,
      batchSize = 10,
      delay = 1000,
      context
    } = body;

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Recipients array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!templateName && !subject) {
      return NextResponse.json(
        { success: false, message: 'Subject is required when not using template' },
        { status: 400 }
      );
    }

    if (!templateName && !html && !text) {
      return NextResponse.json(
        { success: false, message: 'Email content is required when not using template' },
        { status: 400 }
      );
    }

    const emailService = new EmailService();
    let results;

    if (templateName) {
      // Send bulk template emails
      results = await emailService.sendBulkTemplateEmails(
        recipients,
        templateName,
        variablesMap,
        {
          priority,
          batchSize,
          delay
        }
      );
    } else {
      // Send bulk regular emails
      results = await emailService.sendBulkEmails(
        recipients,
        subject,
        { html, text },
        {
          priority,
          attachments,
          batchSize,
          delay
        }
      );
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Bulk emails processed: ${successful} successful, ${failed} failed`,
      data: {
        total: recipients.length,
        successful,
        failed,
        results
      }
    });
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send bulk emails',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/email/send - Send test email
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Recipient email address is required' },
        { status: 400 }
      );
    }

    const emailService = new EmailService();
    const result = await emailService.sendTestEmail(to);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle legacy request format
async function handleLegacyRequest(
  type: string,
  recipientId: string,
  data: any,
  recipients: string[],
  emailService: EmailService
) {
  try {
    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(recipientId, data, emailService);
        break;

      case 'hafalan_progress':
        result = await sendHafalanProgressEmail(recipientId, data, emailService);
        break;

      case 'monthly_report':
        result = await sendMonthlyReportEmail(recipientId, data, emailService);
        break;

      case 'payment_invoice':
        result = await sendPaymentInvoiceEmail(recipientId, data, emailService);
        break;

      case 'payment_confirmation':
        result = await sendPaymentConfirmationEmail(recipientId, data, emailService);
        break;

      case 'attendance_notification':
        result = await sendAttendanceNotificationEmail(recipientId, data, emailService);
        break;

      case 'newsletter':
        result = await sendNewsletterEmail(recipients, data, emailService);
        break;

      case 'custom':
        result = await sendCustomEmail(recipientId, data, emailService);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Legacy email API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(recipientId: string, data: Record<string, unknown>, emailService: EmailService) {
  const user = await prisma.user.findUnique({
    where: { id: recipientId }
  });

  if (!user || !user.email) {
    throw new Error('User or email not found');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Assalamu'alaikum ${user.name}</h2>
      <p>Selamat datang di sistem TPQ Baitus Shuffah!</p>
      <p>Akun Anda telah berhasil dibuat dengan role: <strong>${user.role}</strong></p>
      <p>Anda dapat mengakses sistem melalui dashboard yang tersedia.</p>
      <hr style="margin: 20px 0;">
      <p style="color: #6b7280; font-size: 14px;">
        Email ini dikirim secara otomatis dari sistem TPQ Baitus Shuffah.
      </p>
      <p style="color: #059669; font-weight: bold;">Barakallahu fiikum</p>
    </div>
  `;

  return emailService.sendEmail({
    to: user.email,
    subject: 'Selamat Datang di TPQ Baitus Shuffah',
    html
  }, { type: 'welcome', userId: recipientId });
}

async function sendHafalanProgressEmail(recipientId: string, data: Record<string, unknown>, emailService: EmailService) {
  const student = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!student || !student.parent?.email) {
    throw new Error('Student or parent email not found');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Laporan Progress Hafalan</h2>
      <p>Assalamu'alaikum ${student.parent.name},</p>
      <p>Berikut adalah laporan progress hafalan untuk <strong>${student.name}</strong>:</p>

      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Detail Progress</h3>
        <p><strong>Surah:</strong> ${data.surah}</p>
        <p><strong>Progress:</strong> ${data.progress}</p>
        <p><strong>Nilai:</strong> ${data.grade}</p>
        <p><strong>Tanggal:</strong> ${data.date}</p>
        <p><strong>Musyrif:</strong> ${data.musyrif}</p>
        ${data.notes ? `<p><strong>Catatan:</strong> ${data.notes}</p>` : ''}
      </div>

      <p>Alhamdulillah, semoga Allah mudahkan perjalanan hafalan putra/putri Anda.</p>
      <hr style="margin: 20px 0;">
      <p style="color: #6b7280; font-size: 14px;">
        Email ini dikirim secara otomatis dari sistem TPQ Baitus Shuffah.
      </p>
      <p style="color: #059669; font-weight: bold;">Barakallahu fiikum</p>
    </div>
  `;

  return emailService.sendEmail({
    to: student.parent.email,
    subject: `Progress Hafalan ${student.name} - ${data.surah}`,
    html
  }, { type: 'hafalan_progress', studentId: recipientId });
}

async function sendMonthlyReportEmail(recipientId: string, data: any) {
  const student = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!student || !student.parent?.email) {
    throw new Error('Student or parent email not found');
  }

  return emailService.sendMonthlyReport(
    student.parent.email,
    student.name,
    data
  );
}

async function sendPaymentInvoiceEmail(recipientId: string, data: any) {
  const user = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const email = user.parent?.email || user.email;
  if (!email) {
    throw new Error('Email not found');
  }

  return emailService.sendPaymentInvoice(email, data);
}

async function sendPaymentConfirmationEmail(recipientId: string, data: any) {
  const user = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const email = user.parent?.email || user.email;
  if (!email) {
    throw new Error('Email not found');
  }

  return emailService.sendPaymentConfirmation(email, data);
}

async function sendAttendanceNotificationEmail(recipientId: string, data: any) {
  const student = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!student || !student.parent?.email) {
    throw new Error('Student or parent email not found');
  }

  return emailService.sendAttendanceNotification(
    student.parent.email,
    student.name,
    data
  );
}

async function sendNewsletterEmail(recipients: string[], data: any) {
  // Get email addresses for recipients
  const users = await prisma.user.findMany({
    where: {
      id: { in: recipients }
    },
    select: {
      email: true,
      parent: {
        select: {
          email: true
        }
      }
    }
  });

  const emailAddresses = users
    .map(user => user.parent?.email || user.email)
    .filter(Boolean) as string[];

  if (emailAddresses.length === 0) {
    throw new Error('No valid email addresses found');
  }

  return emailService.sendNewsletter(emailAddresses, data);
}

async function sendCustomEmail(recipientId: string, data: any, emailService: EmailService) {
  const user = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const email = user.parent?.email || user.email;
  if (!email) {
    throw new Error('Email not found');
  }

  return emailService.sendEmail({
    to: email,
    subject: data.subject,
    html: data.html,
    text: data.text
  }, { type: 'custom', recipientId });
}
