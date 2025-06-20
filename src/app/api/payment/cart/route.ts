import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/lib/payment-gateway';
import { CartService } from '@/lib/cart-service';
import { prisma } from '@/lib/prisma';

// POST /api/payment/cart - Create payment from cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cartId,
      gateway = 'MIDTRANS',
      paymentMethod,
      customerInfo,
      billingInfo,
      redirectUrl
    } = body;

    // Validation
    if (!cartId || !customerInfo) {
      return NextResponse.json(
        { success: false, message: 'Cart ID and customer info are required' },
        { status: 400 }
      );
    }

    // Get cart summary
    const cartSummary = await CartService.getCartSummary(cartId);
    
    if (cartSummary.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (cartSummary.total <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid cart total' },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `TPQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare payment request
    const paymentRequest = {
      orderId,
      amount: cartSummary.total,
      currency: 'IDR',
      items: cartSummary.items.map(item => ({
        id: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.itemType.toLowerCase(),
        description: item.description
      })),
      customer: {
        id: customerInfo.id || 'guest',
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      billing: billingInfo,
      metadata: {
        cartId,
        paymentMethod,
        itemCount: cartSummary.itemCount,
        originalItems: cartSummary.items
      },
      redirectUrl,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    // Create payment with selected gateway
    const paymentGatewayService = new PaymentGatewayService();
    let paymentResponse;

    switch (gateway.toUpperCase()) {
      case 'MIDTRANS':
        paymentResponse = await paymentGatewayService.createMidtransPayment(paymentRequest);
        break;
      case 'XENDIT':
        paymentResponse = await paymentGatewayService.createXenditPayment(paymentRequest);
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Unsupported payment gateway' },
          { status: 400 }
        );
    }

    if (!paymentResponse.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment creation failed',
          error: paymentResponse.error
        },
        { status: 500 }
      );
    }

    // Create order record
    const order = await prisma.order.create({
      data: {
        id: orderId,
        customerId: customerInfo.id || null,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        items: JSON.stringify(cartSummary.items),
        subtotal: cartSummary.subtotal,
        tax: cartSummary.tax,
        discount: cartSummary.discount,
        total: cartSummary.total,
        status: 'PENDING',
        paymentId: paymentResponse.paymentId,
        paymentGateway: gateway,
        paymentMethod: paymentMethod || 'unknown',
        metadata: JSON.stringify({
          cartId,
          billingInfo,
          originalCartSummary: cartSummary
        })
      }
    });

    // Clear cart after successful payment creation
    await CartService.clearCart(cartId);

    return NextResponse.json({
      success: true,
      message: 'Payment created successfully',
      data: {
        orderId,
        paymentId: paymentResponse.paymentId,
        paymentUrl: paymentResponse.paymentUrl,
        qrCode: paymentResponse.qrCode,
        vaNumber: paymentResponse.vaNumber,
        bankCode: paymentResponse.bankCode,
        amount: paymentResponse.amount,
        status: paymentResponse.status,
        expiryTime: paymentResponse.expiryTime,
        instructions: paymentResponse.instructions,
        gateway
      }
    });
  } catch (error) {
    console.error('Error creating payment from cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
