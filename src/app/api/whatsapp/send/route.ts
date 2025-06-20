import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      message,
      type = 'text',
      templateName,
      languageCode = 'id',
      parameters = [],
      context,
      // Legacy support
      recipientId,
      data
    } = body;

    const whatsappService = new WhatsAppService();

    // Handle legacy format
    if (recipientId && data) {
      return await handleLegacyRequest(recipientId, data, whatsappService);
    }

    // Validation for new format
    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Recipient phone number is required' },
        { status: 400 }
      );
    }

    if (type === 'text' && !message) {
      return NextResponse.json(
        { success: false, message: 'Message content is required for text messages' },
        { status: 400 }
      );
    }

    if (type === 'template' && !templateName) {
      return NextResponse.json(
        { success: false, message: 'Template name is required for template messages' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'template') {
      result = await whatsappService.sendTemplateMessage(
        to,
        templateName,
        languageCode,
        parameters
      );
    } else {
      result = await whatsappService.sendTextMessage(to, message, context);
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send WhatsApp message',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/whatsapp/send - Send bulk WhatsApp messages
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipients,
      message,
      type = 'text',
      templateName,
      languageCode = 'id',
      parametersMap = {},
      context
    } = body;

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Recipients array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (type === 'text' && !message) {
      return NextResponse.json(
        { success: false, message: 'Message content is required for text messages' },
        { status: 400 }
      );
    }

    if (type === 'template' && !templateName) {
      return NextResponse.json(
        { success: false, message: 'Template name is required for template messages' },
        { status: 400 }
      );
    }

    const whatsappService = new WhatsAppService();
    let results;

    if (type === 'template') {
      results = await whatsappService.sendBulkTemplateMessages(
        recipients,
        templateName,
        languageCode,
        parametersMap
      );
    } else {
      results = await whatsappService.sendBulkMessages(recipients, message, context);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Bulk WhatsApp messages processed: ${successful} successful, ${failed} failed`,
      data: {
        total: recipients.length,
        successful,
        failed,
        results
      }
    });
  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send bulk WhatsApp messages',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle legacy request format
async function handleLegacyRequest(recipientId: string, data: any, whatsappService: WhatsAppService) {
  try {
    let result;

    switch (data.type) {
      case 'hafalan_progress':
        result = await sendHafalanProgress(recipientId, data, whatsappService);
        break;

      case 'attendance_notification':
        result = await sendAttendanceNotification(recipientId, data, whatsappService);
        break;

      case 'payment_reminder':
        result = await sendPaymentReminder(recipientId, data, whatsappService);
        break;

      case 'monthly_report':
        result = await sendMonthlyReport(recipientId, data, whatsappService);
        break;

      case 'custom_message':
        result = await sendCustomMessage(recipientId, data, whatsappService);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid message type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      message: 'WhatsApp message sent successfully'
    });
  } catch (error) {
    console.error('Legacy WhatsApp API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendHafalanProgress(recipientId: string, data: any, whatsappService: WhatsAppService) {
  // Get student and parent information
  const student = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!student || !student.parent?.phone) {
    throw new Error('Student or parent phone not found');
  }

  const message = `Assalamu'alaikum ${student.parent.name},

${student.name} telah menyelesaikan hafalan ${data.surah} dengan progress ${data.progress} dan mendapat nilai ${data.grade}.

Alhamdulillah, semoga Allah mudahkan perjalanan hafalan putra/putri Anda.

Barakallahu fiikum.
TPQ Baitus Shuffah`;

  return whatsappService.sendTextMessage(student.parent.phone, message, { type: 'hafalan_progress', studentId: recipientId });
}

async function sendAttendanceNotification(recipientId: string, data: any, whatsappService: WhatsAppService) {
  const student = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!student || !student.parent?.phone) {
    throw new Error('Student or parent phone not found');
  }

  const statusText = data.status === 'HADIR' ? 'hadir' : 'tidak hadir';
  const message = `Assalamu'alaikum ${student.parent.name},

Kami informasikan bahwa ${student.name} ${statusText} pada kegiatan TPQ hari ${data.date} pukul ${data.time}.

${data.notes ? `Catatan: ${data.notes}` : ''}

Barakallahu fiikum.
TPQ Baitus Shuffah`;

  return whatsappService.sendTextMessage(student.parent.phone, message, { type: 'attendance_notification', studentId: recipientId });
}

async function sendPaymentReminder(recipientId: string, data: any, whatsappService: WhatsAppService) {
  const student = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!student || !student.parent?.phone) {
    throw new Error('Student or parent phone not found');
  }

  const message = `Assalamu'alaikum ${student.parent.name},

Kami mengingatkan bahwa pembayaran ${data.paymentType} untuk ${student.name} sebesar ${data.amount} akan jatuh tempo pada ${data.dueDate}.

Mohon untuk segera melakukan pembayaran. Terima kasih.

Barakallahu fiikum.
TPQ Baitus Shuffah`;

  return whatsappService.sendTextMessage(student.parent.phone, message, { type: 'payment_reminder', studentId: recipientId });
}

async function sendMonthlyReport(recipientId: string, data: any, whatsappService: WhatsAppService) {
  const student = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      parent: true
    }
  });

  if (!student || !student.parent?.phone) {
    throw new Error('Student or parent phone not found');
  }

  const message = `Assalamu'alaikum ${student.parent.name},

Laporan bulanan untuk ${student.name}:

📖 Progress Hafalan: ${data.hafalanProgress || 'Belum ada data'}
📅 Kehadiran: ${data.attendance || 'Belum ada data'}
📝 Catatan Musyrif: ${data.notes || 'Tidak ada catatan khusus'}

Semoga Allah mudahkan perjalanan hafalan putra/putri Anda.

Barakallahu fiikum.
TPQ Baitus Shuffah`;

  return whatsappService.sendTextMessage(student.parent.phone, message, { type: 'monthly_report', studentId: recipientId });
}

async function sendCustomMessage(recipientId: string, data: any, whatsappService: WhatsAppService) {
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId }
  });

  if (!recipient?.phone) {
    throw new Error('Recipient phone not found');
  }

  return whatsappService.sendTextMessage(recipient.phone, data.message, { type: 'custom_message', recipientId });
}

// Legacy logging function - now handled by WhatsAppService
// Kept for backward compatibility
