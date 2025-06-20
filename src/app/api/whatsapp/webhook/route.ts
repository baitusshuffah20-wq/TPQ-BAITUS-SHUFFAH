import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'your_verify_token';
const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || 'your_webhook_secret';

// Verify webhook (GET request)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('WhatsApp webhook verification:', { mode, token, challenge });

    if (!mode || !token || !challenge) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const verificationResult = WhatsAppService.verifyWebhook(mode, token, challenge);

    if (verificationResult) {
      console.log('WhatsApp webhook verified successfully');
      return new NextResponse(verificationResult, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      console.log('WhatsApp webhook verification failed');
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('WhatsApp webhook verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle webhook events (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('x-hub-signature-256');
    if (signature) {
      const bodyText = JSON.stringify(body);
      const isValid = verifyWebhookSignature(bodyText, signature);
      if (!isValid) {
        console.log('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }
    }

    const whatsappService = new WhatsAppService();
    await whatsappService.processWebhook(body);

    // Process auto-responses for incoming messages
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages' && change.value.messages) {
            for (const message of change.value.messages) {
              await processIncomingMessage(message);
            }
          }
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook processing error:', error);

    // Still return 200 to avoid webhook retries
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

async function processMessageUpdate(value: any) {
  try {
    // Handle message status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        await updateMessageStatus(status);
      }
    }

    // Handle incoming messages (replies from parents)
    if (value.messages) {
      for (const message of value.messages) {
        await processIncomingMessage(message);
      }
    }
  } catch (error) {
    console.error('Error processing message update:', error);
  }
}

async function updateMessageStatus(status: any) {
  try {
    const { id, status: messageStatus, timestamp, recipient_id } = status;
    
    // Update message status in database
    await prisma.whatsAppLog.updateMany({
      where: { messageId: id },
      data: {
        status: messageStatus.toUpperCase(),
        deliveredAt: messageStatus === 'delivered' ? new Date(parseInt(timestamp) * 1000) : undefined,
        readAt: messageStatus === 'read' ? new Date(parseInt(timestamp) * 1000) : undefined,
        failedAt: messageStatus === 'failed' ? new Date(parseInt(timestamp) * 1000) : undefined
      }
    });

    console.log(`Message ${id} status updated to ${messageStatus}`);
  } catch (error) {
    console.error('Error updating message status:', error);
  }
}

async function processIncomingMessage(message: any) {
  try {
    const { from, text, timestamp, type } = message;
    
    // Find user by phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: from },
          { parent: { phone: from } }
        ]
      },
      include: {
        parent: true,
        children: true
      }
    });

    if (!user) {
      console.log(`Unknown sender: ${from}`);
      return;
    }

    // Log incoming message
    await prisma.whatsAppIncoming.create({
      data: {
        senderId: user.id,
        senderPhone: from,
        messageType: type,
        messageContent: text?.body || '',
        receivedAt: new Date(parseInt(timestamp) * 1000),
        processed: false
      }
    });

    // Process message content for auto-responses
    if (text?.body) {
      await processAutoResponse(from, text.body.toLowerCase(), user);
    }

    console.log(`Incoming message from ${from}: ${text?.body}`);
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}

async function processAutoResponse(phone: string, messageText: string, user: any) {
  try {
    const whatsappService = new WhatsAppService();

    // Auto-response for common queries
    if (messageText.includes('jadwal') || messageText.includes('schedule')) {
      const response = `🕌 *Jadwal Rumah Tahfidz Baitus Shuffah*

📅 *Senin - Jumat:*
🕐 08:00 - 10:00 | Hafalan Pagi
🕐 13:00 - 15:00 | Hafalan Siang
🕐 15:30 - 17:00 | Muraja'ah

📅 *Sabtu:*
🕐 08:00 - 11:00 | Hafalan & Evaluasi

📅 *Minggu:* Libur

Barakallahu fiikum 🤲`;

      await whatsappService.sendTextMessage(phone, response);
    }
    
    else if (messageText.includes('pembayaran') || messageText.includes('spp')) {
      const response = `💳 *Informasi Pembayaran*

🏦 *Transfer Bank:*
Bank BCA: 1234567890
Bank Mandiri: 0987654321
a.n. Yayasan Rumah Tahfidz Baitus Shuffah

💳 *E-Wallet:*
GoPay: 081234567890
OVO: 081234567890
DANA: 081234567890

📱 Atau melalui aplikasi Rumah Tahfidz

Barakallahu fiikum 🤲`;

      await whatsappService.sendTextMessage(phone, response);
    }
    
    else if (messageText.includes('kontak') || messageText.includes('alamat')) {
      const response = `📞 *Kontak Rumah Tahfidz Baitus Shuffah*

📍 *Alamat:*
Jl. Islamic Center No. 123
Jakarta Pusat 10110

📞 *Telepon:* +62 21 1234 5678
📱 *WhatsApp:* +62 812 3456 7890
📧 *Email:* info@rumahtahfidz.com
🌐 *Website:* www.rumahtahfidz.com

🕐 *Jam Operasional:*
Senin - Jumat: 07:00 - 17:00
Sabtu: 07:00 - 12:00

Barakallahu fiikum 🤲`;

      await whatsappService.sendTextMessage(phone, response);
    }
    
    else if (messageText.includes('terima kasih') || messageText.includes('syukron')) {
      const response = `Wa iyyakum, barakallahu fiikum 🤲

Semoga Allah senantiasa memberkahi putra/putri Anda dalam menghafal Al-Quran.

_Tim Rumah Tahfidz Baitus Shuffah_`;

      await whatsappService.sendTextMessage(phone, response);
    }
    
    // Mark as processed
    await prisma.whatsAppIncoming.updateMany({
      where: {
        senderPhone: phone,
        processed: false
      },
      data: {
        processed: true,
        processedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error processing auto-response:', error);
  }
}
