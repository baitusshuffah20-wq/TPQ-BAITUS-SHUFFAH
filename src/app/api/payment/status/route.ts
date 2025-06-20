import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/lib/payment-gateway';
import { prisma } from '@/lib/prisma';

// GET /api/payment/status - Check payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Order ID or Payment ID is required' },
        { status: 400 }
      );
    }

    let order;
    let paymentTransaction;

    // Get order details
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      if (!order) {
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        );
      }

      // Get payment transaction
      if (order.paymentId) {
        paymentTransaction = await prisma.paymentTransaction.findUnique({
          where: { paymentId: order.paymentId }
        });
      }
    } else if (paymentId) {
      paymentTransaction = await prisma.paymentTransaction.findUnique({
        where: { paymentId }
      });

      if (paymentTransaction) {
        order = await prisma.order.findUnique({
          where: { id: paymentTransaction.orderId },
          include: {
            customer: {
              select: { id: true, name: true, email: true }
            }
          }
        });
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check payment status from gateway if payment is still pending
    if (order.status === 'PENDING' && paymentTransaction) {
      try {
        const paymentGatewayService = new PaymentGatewayService();
        const gatewayStatus = await paymentGatewayService.getPaymentStatus(
          paymentTransaction.paymentId,
          paymentTransaction.gateway
        );

        // Update status if changed
        if (gatewayStatus.transaction_status === 'settlement' || gatewayStatus.status === 'SUCCEEDED') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              paidAt: new Date(),
              updatedAt: new Date()
            }
          });

          await prisma.paymentTransaction.update({
            where: { paymentId: paymentTransaction.paymentId },
            data: {
              status: 'SUCCESS',
              paidAt: new Date(),
              updatedAt: new Date()
            }
          });

          order.status = 'PAID';
          order.paidAt = new Date();
        }
      } catch (gatewayError) {
        console.error('Error checking gateway status:', gatewayError);
        // Continue with current status if gateway check fails
      }
    }

    // Parse order items
    const orderItems = JSON.parse(order.items);

    // Prepare response data
    const responseData = {
      orderId: order.id,
      paymentId: order.paymentId,
      amount: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentGateway: order.paymentGateway,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: orderItems,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      metadata: order.metadata ? JSON.parse(order.metadata) : null
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
