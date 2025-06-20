import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService, PaymentStatus } from '@/lib/payment-gateway';
import { NotificationTriggerService } from '@/lib/notification-triggers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// POST /api/payment/webhook/cart - Handle cart-based payment webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature') || request.headers.get('x-callback-token');
    const gateway = request.headers.get('x-gateway') || 'MIDTRANS';

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, gateway)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const webhookData = JSON.parse(body);
    console.log('Cart payment webhook received:', { gateway, data: webhookData });

    // Process webhook based on gateway
    switch (gateway.toUpperCase()) {
      case 'MIDTRANS':
        await processMidtransWebhook(webhookData);
        break;
      case 'XENDIT':
        await processXenditWebhook(webhookData);
        break;
      default:
        console.error('Unsupported gateway:', gateway);
        return NextResponse.json(
          { success: false, message: 'Unsupported gateway' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing cart payment webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Process Midtrans webhook
async function processMidtransWebhook(data: any) {
  const {
    order_id,
    transaction_id,
    transaction_status,
    fraud_status,
    payment_type,
    gross_amount,
    transaction_time,
    settlement_time
  } = data;

  let paymentStatus = PaymentStatus.PENDING;

  // Map Midtrans status to our status
  switch (transaction_status) {
    case 'capture':
      paymentStatus = fraud_status === 'accept' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
      break;
    case 'settlement':
      paymentStatus = PaymentStatus.SUCCESS;
      break;
    case 'pending':
      paymentStatus = PaymentStatus.PENDING;
      break;
    case 'deny':
    case 'cancel':
    case 'expire':
      paymentStatus = PaymentStatus.FAILED;
      break;
    case 'refund':
    case 'partial_refund':
      paymentStatus = PaymentStatus.REFUNDED;
      break;
    default:
      paymentStatus = PaymentStatus.FAILED;
  }

  // Update payment transaction
  const paymentGatewayService = new PaymentGatewayService();
  await paymentGatewayService.updatePaymentStatus(transaction_id, paymentStatus, data);

  // Update order status
  await updateOrderStatus(order_id, paymentStatus, {
    paymentId: transaction_id,
    paymentType: payment_type,
    paidAt: settlement_time || transaction_time,
    gatewayData: data
  });

  // Trigger notifications if payment successful
  if (paymentStatus === PaymentStatus.SUCCESS) {
    await handleSuccessfulPayment(order_id, transaction_id);
  }
}

// Process Xendit webhook
async function processXenditWebhook(data: any) {
  const {
    id,
    external_id,
    status,
    channel_code,
    amount,
    created,
    updated
  } = data;

  let paymentStatus = PaymentStatus.PENDING;

  // Map Xendit status to our status
  switch (status) {
    case 'SUCCEEDED':
      paymentStatus = PaymentStatus.SUCCESS;
      break;
    case 'PENDING':
      paymentStatus = PaymentStatus.PENDING;
      break;
    case 'FAILED':
    case 'EXPIRED':
      paymentStatus = PaymentStatus.FAILED;
      break;
    default:
      paymentStatus = PaymentStatus.FAILED;
  }

  // Update payment transaction
  const paymentGatewayService = new PaymentGatewayService();
  await paymentGatewayService.updatePaymentStatus(id, paymentStatus, data);

  // Update order status
  await updateOrderStatus(external_id, paymentStatus, {
    paymentId: id,
    paymentType: channel_code,
    paidAt: updated,
    gatewayData: data
  });

  // Trigger notifications if payment successful
  if (paymentStatus === PaymentStatus.SUCCESS) {
    await handleSuccessfulPayment(external_id, id);
  }
}

// Update order status
async function updateOrderStatus(orderId: string, status: string, paymentData: any) {
  try {
    const updateData: any = {
      status: status === PaymentStatus.SUCCESS ? 'PAID' : 
              status === PaymentStatus.FAILED ? 'FAILED' : 'PENDING',
      updatedAt: new Date()
    };

    if (status === PaymentStatus.SUCCESS && paymentData.paidAt) {
      updateData.paidAt = new Date(paymentData.paidAt);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    console.log(`Order ${orderId} status updated to ${updateData.status}`);
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}

// Handle successful payment
async function handleSuccessfulPayment(orderId: string, paymentId: string) {
  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true
      }
    });

    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    const orderItems = JSON.parse(order.items);

    // Process each item in the order
    for (const item of orderItems) {
      if (item.itemType === 'SPP') {
        // Create SPP payment record
        await createSPPPaymentRecord(item, order, paymentId);
      } else if (item.itemType === 'DONATION') {
        // Create donation record
        await createDonationRecord(item, order, paymentId);
      }
    }

    // Send payment confirmation notification
    if (order.customerId) {
      try {
        // Create a transaction record for notification trigger
        const transaction = await prisma.transaction.findFirst({
          where: { reference: order.id }
        });
        
        if (transaction) {
          await NotificationTriggerService.sendPaymentConfirmation(transaction.id);
        }
      } catch (notificationError) {
        console.error('Error sending payment confirmation:', notificationError);
      }
    }

    console.log(`Successfully processed cart payment for order ${orderId}`);
  } catch (error) {
    console.error('Error handling successful cart payment:', error);
  }
}

// Create SPP payment record
async function createSPPPaymentRecord(item: any, order: any, paymentId: string) {
  try {
    const studentId = item.metadata?.studentId;
    if (!studentId) return;

    // Get default account (you should create this in your database)
    let defaultAccount = await prisma.financialAccount.findFirst({
      where: { type: 'CASH', name: 'Kas Utama' }
    });

    if (!defaultAccount) {
      // Create default account if it doesn't exist
      defaultAccount = await prisma.financialAccount.create({
        data: {
          name: 'Kas Utama',
          type: 'CASH',
          balance: 0,
          description: 'Akun kas utama untuk penerimaan'
        }
      });
    }

    // Create transaction record
    await prisma.transaction.create({
      data: {
        type: 'INCOME',
        amount: item.price * item.quantity,
        description: item.name,
        accountId: defaultAccount.id,
        santriId: studentId,
        status: 'PAID',
        paidAt: order.paidAt || new Date(),
        paymentMethod: order.paymentMethod || 'ONLINE',
        receiptNumber: `SPP-${Date.now()}`,
        reference: order.id,
        createdBy: order.customerId || 'system'
      }
    });

    console.log(`SPP payment record created for student ${studentId}`);
  } catch (error) {
    console.error('Error creating SPP payment record:', error);
  }
}

// Create donation record
async function createDonationRecord(item: any, order: any, paymentId: string) {
  try {
    await prisma.donation.create({
      data: {
        donorName: order.customerName,
        donorEmail: order.customerEmail,
        donorPhone: order.customerPhone,
        amount: item.price * item.quantity,
        type: item.metadata?.donationType || 'GENERAL',
        method: 'ONLINE',
        message: item.metadata?.message || item.description,
        isAnonymous: false,
        status: 'CONFIRMED',
        confirmedAt: order.paidAt || new Date(),
        confirmedBy: 'system',
        reference: order.id
      }
    });

    console.log(`Donation record created for ${order.customerName}`);
  } catch (error) {
    console.error('Error creating donation record:', error);
  }
}

// Verify webhook signature
function verifyWebhookSignature(body: string, signature: string | null, gateway: string): boolean {
  if (!signature) return false;

  try {
    switch (gateway.toUpperCase()) {
      case 'MIDTRANS':
        return verifyMidtransSignature(body, signature);
      case 'XENDIT':
        return verifyXenditSignature(body, signature);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Verify Midtrans signature
function verifyMidtransSignature(body: string, signature: string): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;

  const data = JSON.parse(body);
  const orderId = data.order_id;
  const statusCode = data.status_code;
  const grossAmount = data.gross_amount;

  const signatureKey = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  return signatureKey === signature;
}

// Verify Xendit signature
function verifyXenditSignature(body: string, signature: string): boolean {
  const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!webhookToken) return false;

  const computedSignature = crypto
    .createHmac('sha256', webhookToken)
    .update(body)
    .digest('hex');

  return computedSignature === signature;
}
