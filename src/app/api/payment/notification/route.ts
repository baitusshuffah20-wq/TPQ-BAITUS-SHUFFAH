import { NextRequest, NextResponse } from 'next/server';
import MidtransService from '@/lib/midtrans-service';
import { STATUS_MAPPING } from '@/lib/midtrans-config';
import { NotificationService, NotificationType, NotificationChannel } from '@/lib/notification-service';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    
    console.log('Received Midtrans notification:', notification);

    // Initialize Midtrans service
    const midtransService = MidtransService.getInstance();

    // Validate notification signature
    const isValidSignature = midtransService.validateNotification(notification);
    
    if (!isValidSignature) {
      console.error('Invalid notification signature');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid signature' 
        },
        { status: 400 }
      );
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      gross_amount,
      transaction_time,
      transaction_id,
      status_code,
      status_message,
      va_numbers,
      biller_code,
      bill_key,
      permata_va_number,
      pdf_url
    } = notification;

    // Map Midtrans status to internal status
    const internalStatus = midtransService.mapStatus(transaction_status);

    // Log the status change
    console.log(`Payment status update: ${order_id} -> ${transaction_status} (${internalStatus})`);

    // Update payment status in database
    await updatePaymentStatus({
      orderId: order_id,
      status: internalStatus,
      transactionId: transaction_id,
      paymentType: payment_type,
      grossAmount: parseFloat(gross_amount),
      transactionTime: transaction_time,
      statusCode: status_code,
      statusMessage: status_message,
      fraudStatus: fraud_status,
      vaNumbers: va_numbers,
      billerCode: biller_code,
      billKey: bill_key,
      permataVaNumber: permata_va_number,
      pdfUrl: pdf_url
    });

    // Handle different payment statuses
    switch (transaction_status) {
      case 'settlement':
      case 'capture':
        await handleSuccessfulPayment(order_id, notification);
        break;
        
      case 'pending':
        await handlePendingPayment(order_id, notification);
        break;
        
      case 'deny':
      case 'cancel':
      case 'expire':
      case 'failure':
        await handleFailedPayment(order_id, notification);
        break;
        
      case 'refund':
      case 'partial_refund':
        await handleRefundPayment(order_id, notification);
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Notification processed successfully'
    });

  } catch (error: any) {
    console.error('Error processing payment notification:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to process notification',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Update payment status in database
async function updatePaymentStatus(data: {
  orderId: string;
  status: string;
  transactionId: string;
  paymentType: string;
  grossAmount: number;
  transactionTime: string;
  statusCode: string;
  statusMessage: string;
  fraudStatus?: string;
  vaNumbers?: any[];
  billerCode?: string;
  billKey?: string;
  permataVaNumber?: string;
  pdfUrl?: string;
}) {
  try {
    // Here you would update your database
    // This is a mock implementation since we don't have Prisma setup
    
    console.log('Updating payment status in database:', {
      orderId: data.orderId,
      status: data.status,
      transactionId: data.transactionId,
      paymentType: data.paymentType,
      amount: data.grossAmount
    });

    // Mock database update
    // In real implementation, you would:
    // 1. Find payment by order_id
    // 2. Update status and transaction details
    // 3. Save payment receipt/proof
    // 4. Update related records (santri payment history, etc.)
    
    return {
      success: true,
      message: 'Payment status updated successfully'
    };
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

// Handle successful payment
async function handleSuccessfulPayment(orderId: string, notification: any) {
  try {
    console.log(`Processing successful payment for order: ${orderId}`);
    
    // 1. Update payment status to PAID
    // 2. Generate receipt
    // 3. Send confirmation notifications (WhatsApp, Email)
    // 4. Update santri payment history
    // 5. Trigger any post-payment actions
    
    // Mock implementation
    await sendPaymentConfirmation(orderId, notification);
    await generatePaymentReceipt(orderId, notification);
    
    console.log(`Successfully processed payment for order: ${orderId}`);
    
  } catch (error) {
    console.error(`Error handling successful payment for ${orderId}:`, error);
    throw error;
  }
}

// Handle pending payment
async function handlePendingPayment(orderId: string, notification: any) {
  try {
    console.log(`Processing pending payment for order: ${orderId}`);
    
    // 1. Update payment status to PENDING
    // 2. Send payment instructions (for bank transfer, etc.)
    // 3. Set up payment reminder schedule
    
    await sendPaymentInstructions(orderId, notification);
    
    console.log(`Successfully processed pending payment for order: ${orderId}`);
    
  } catch (error) {
    console.error(`Error handling pending payment for ${orderId}:`, error);
    throw error;
  }
}

// Handle failed payment
async function handleFailedPayment(orderId: string, notification: any) {
  try {
    console.log(`Processing failed payment for order: ${orderId}`);
    
    // 1. Update payment status to FAILED/CANCELLED/EXPIRED
    // 2. Send failure notification
    // 3. Clean up any temporary data
    // 4. Optionally create new payment link
    
    await sendPaymentFailureNotification(orderId, notification);
    
    console.log(`Successfully processed failed payment for order: ${orderId}`);
    
  } catch (error) {
    console.error(`Error handling failed payment for ${orderId}:`, error);
    throw error;
  }
}

// Handle refund payment
async function handleRefundPayment(orderId: string, notification: any) {
  try {
    console.log(`Processing refund for order: ${orderId}`);
    
    // 1. Update payment status to REFUNDED
    // 2. Update financial records
    // 3. Send refund confirmation
    
    await sendRefundConfirmation(orderId, notification);
    
    console.log(`Successfully processed refund for order: ${orderId}`);
    
  } catch (error) {
    console.error(`Error handling refund for ${orderId}:`, error);
    throw error;
  }
}

// Send payment confirmation (WhatsApp, Email)
async function sendPaymentConfirmation(orderId: string, notification: any) {
  try {
    console.log(`Sending payment confirmation for order: ${orderId}`);

    // Mock customer data - in real app, get from database
    const customerData = {
      santriName: 'Ahmad Fauzi', // Get from database
      email: 'parent@example.com', // Get from database
      phone: '628123456789', // Get from database
      orderId: orderId,
      paymentType: getPaymentTypeFromOrderId(orderId),
      amount: parseFloat(notification.gross_amount),
      paymentDate: notification.transaction_time,
      paymentMethod: getPaymentMethodText(notification.payment_type)
    };

    // Send WhatsApp notification
    try {
      const whatsappService = new WhatsAppService();
      const whatsappMessage = `
🎉 *PEMBAYARAN BERHASIL* 🎉

Assalamu'alaikum Wr. Wb.
Yth. Bapak/Ibu Wali Santri

Pembayaran untuk santri *${customerData.santriName}* telah berhasil diproses.

📋 *Detail Pembayaran:*
• ID Transaksi: ${customerData.orderId}
• Jenis: ${customerData.paymentType}
• Jumlah: Rp ${customerData.amount.toLocaleString('id-ID')}
• Tanggal: ${new Date(customerData.paymentDate).toLocaleDateString('id-ID')}
• Status: ✅ LUNAS

💳 *Metode Pembayaran:*
${customerData.paymentMethod}

📄 *Kwitansi digital telah dikirim ke email Anda.*

Jazakallahu khairan atas kepercayaan Anda kepada TPQ Baitus Shuffah.

Wassalamu'alaikum Wr. Wb.

*TPQ Baitus Shuffah*
🏫 Jl. Contoh No. 123, Jakarta
📞 (021) 1234-5678
🌐 www.tpq-baitus-shuffah.com
      `.trim();

      await whatsappService.sendTextMessage(customerData.phone, whatsappMessage, {
        type: 'payment_confirmation',
        orderId: orderId
      });

      console.log(`WhatsApp confirmation sent for order: ${orderId}`);
    } catch (error) {
      console.error(`Error sending WhatsApp confirmation for ${orderId}:`, error);
    }

    // Send Email notification
    try {
      const emailService = new EmailService();
      await emailService.sendTemplateEmail(
        customerData.email,
        'payment_confirmation',
        customerData,
        { priority: 'HIGH' }
      );

      console.log(`Email confirmation sent for order: ${orderId}`);
    } catch (error) {
      console.error(`Error sending email confirmation for ${orderId}:`, error);
    }

    // Create in-app notification
    try {
      await NotificationService.createNotification({
        title: '✅ Pembayaran Berhasil',
        message: `Pembayaran ${customerData.paymentType} untuk santri ${customerData.santriName} sebesar Rp ${customerData.amount.toLocaleString('id-ID')} telah berhasil diproses.`,
        type: NotificationType.PAYMENT_CONFIRMATION,
        channels: [NotificationChannel.IN_APP],
        recipientId: 'parent_user_id', // Get from database
        metadata: {
          orderId: orderId,
          amount: customerData.amount,
          paymentType: customerData.paymentType
        },
        createdBy: 'system'
      });

      console.log(`In-app notification created for order: ${orderId}`);
    } catch (error) {
      console.error(`Error creating in-app notification for ${orderId}:`, error);
    }

  } catch (error) {
    console.error(`Error sending payment confirmation for ${orderId}:`, error);
  }
}

// Generate payment receipt
async function generatePaymentReceipt(orderId: string, notification: any) {
  try {
    // Mock implementation
    console.log(`Generating payment receipt for order: ${orderId}`);
    
    // Here you would:
    // 1. Create PDF receipt
    // 2. Store receipt in file system/cloud storage
    // 3. Update payment record with receipt URL
    
  } catch (error) {
    console.error(`Error generating payment receipt for ${orderId}:`, error);
  }
}

// Send payment instructions
async function sendPaymentInstructions(orderId: string, notification: any) {
  try {
    // Mock implementation
    console.log(`Sending payment instructions for order: ${orderId}`);
    
    // Here you would:
    // 1. Get payment instructions based on payment method
    // 2. Send instructions via WhatsApp/Email
    // 3. Set up payment reminder schedule
    
  } catch (error) {
    console.error(`Error sending payment instructions for ${orderId}:`, error);
  }
}

// Send payment failure notification
async function sendPaymentFailureNotification(orderId: string, notification: any) {
  try {
    // Mock implementation
    console.log(`Sending payment failure notification for order: ${orderId}`);
    
    // Here you would:
    // 1. Send failure notification to customer
    // 2. Optionally create new payment link
    // 3. Update customer support if needed
    
  } catch (error) {
    console.error(`Error sending payment failure notification for ${orderId}:`, error);
  }
}

// Send refund confirmation
async function sendRefundConfirmation(orderId: string, notification: any) {
  try {
    // Mock implementation
    console.log(`Sending refund confirmation for order: ${orderId}`);

    // Here you would:
    // 1. Send refund confirmation to customer
    // 2. Update financial records
    // 3. Generate refund receipt

  } catch (error) {
    console.error(`Error sending refund confirmation for ${orderId}:`, error);
  }
}

// Helper function to get payment type from order ID
function getPaymentTypeFromOrderId(orderId: string): string {
  // Extract payment type from order ID pattern
  // Example: TPQ-SPP-1234567890-ABC123
  if (orderId.includes('SPP')) return 'SPP Bulanan';
  if (orderId.includes('DAFTAR')) return 'Daftar Ulang';
  if (orderId.includes('SERAGAM')) return 'Seragam';
  if (orderId.includes('KEGIATAN')) return 'Kegiatan Khusus';
  return 'Pembayaran Lainnya';
}

// Helper function to get payment method text
function getPaymentMethodText(paymentType: string): string {
  switch (paymentType?.toLowerCase()) {
    case 'bank_transfer': return 'Transfer Bank';
    case 'credit_card': return 'Kartu Kredit';
    case 'gopay': return 'GoPay';
    case 'shopeepay': return 'ShopeePay';
    case 'dana': return 'DANA';
    case 'linkaja': return 'LinkAja';
    case 'ovo': return 'OVO';
    case 'qris': return 'QRIS';
    case 'cstore': return 'Convenience Store';
    default: return paymentType || 'Metode Pembayaran Digital';
  }
}
