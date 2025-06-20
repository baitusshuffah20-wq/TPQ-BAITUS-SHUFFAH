import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPaymentStatus } from '@/lib/midtrans';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    const donationId = searchParams.get('donationId');
    const type = searchParams.get('type');

    if (!orderId && !paymentId && !donationId) {
      return NextResponse.json(
        { success: false, error: 'Order ID, Payment ID, or Donation ID is required' },
        { status: 400 }
      );
    }

    // Check payment by type
    if (type === 'spp' || (!type && (orderId?.startsWith('spp_') || paymentId))) {
      // Handle SPP payment check
      let payment;
      
      if (paymentId) {
        payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: {
            santri: {
              select: {
                id: true,
                name: true,
                nis: true,
                wali: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        });
      } else if (orderId) {
        payment = await prisma.payment.findFirst({
          where: { reference: orderId },
          include: {
            santri: {
              select: {
                id: true,
                name: true,
                nis: true,
                wali: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        });
      }

      if (!payment) {
        return NextResponse.json(
          { success: false, error: 'Payment not found' },
          { status: 404 }
        );
      }

      // If payment is still pending, check with Midtrans
      if (payment.status === 'PENDING' && payment.reference) {
        try {
          const midtransStatus = await checkPaymentStatus(payment.reference);
          
          if (midtransStatus.success && midtransStatus.data.transaction_status === 'settlement') {
            // Update payment status
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'PAID',
                paidDate: new Date(),
                method: getPaymentMethod(midtransStatus.data.payment_type)
              }
            });
            
            // Update payment object for response
            payment.status = 'PAID';
            payment.paidDate = new Date();
          }
        } catch (error) {
          console.error('Error checking Midtrans status:', error);
          // Continue with current status
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          id: payment.id,
          type: payment.type,
          amount: payment.amount,
          status: payment.status,
          dueDate: payment.dueDate,
          paidDate: payment.paidDate,
          method: payment.method,
          reference: payment.reference,
          santri: payment.santri,
          createdAt: payment.createdAt
        }
      });
      
    } else if (type === 'donation' || (!type && (orderId?.startsWith('donation_') || donationId))) {
      // Handle donation payment check
      let donation;
      
      if (donationId) {
        donation = await prisma.donation.findUnique({
          where: { id: donationId }
        });
      } else if (orderId) {
        donation = await prisma.donation.findFirst({
          where: { reference: orderId }
        });
      }

      if (!donation) {
        return NextResponse.json(
          { success: false, error: 'Donation not found' },
          { status: 404 }
        );
      }

      // If donation is still pending, check with Midtrans
      if ((donation.status === 'PENDING' || donation.status === 'PROCESSING') && donation.reference) {
        try {
          const midtransStatus = await checkPaymentStatus(donation.reference);
          
          if (midtransStatus.success && midtransStatus.data.transaction_status === 'settlement') {
            // Update donation status
            await prisma.donation.update({
              where: { id: donation.id },
              data: {
                status: 'PAID',
                confirmedAt: new Date(),
                paymentMethod: getPaymentMethod(midtransStatus.data.payment_type)
              }
            });
            
            // Update donation object for response
            donation.status = 'PAID';
            donation.confirmedAt = new Date();
          }
        } catch (error) {
          console.error('Error checking Midtrans status:', error);
          // Continue with current status
        }
      }

      // Prepare response data
      const responseData = {
        id: donation.id,
        donorName: donation.donorName,
        amount: donation.amount,
        type: donation.type,
        status: donation.status,
        paymentMethod: donation.paymentMethod,
        isAnonymous: donation.isAnonymous,
        message: donation.message,
        createdAt: donation.createdAt,
        confirmedAt: donation.confirmedAt
      };

      return NextResponse.json({
        success: true,
        data: responseData
      });
    }

    // If no specific type was handled
    return NextResponse.json(
      { success: false, error: 'Invalid payment type' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getPaymentMethod(paymentType: string): string {
  switch (paymentType) {
    case 'credit_card':
      return 'CREDIT_CARD';
    case 'bank_transfer':
    case 'echannel':
    case 'permata':
    case 'bca_va':
    case 'bni_va':
    case 'bri_va':
      return 'BANK_TRANSFER';
    case 'gopay':
    case 'shopeepay':
    case 'dana':
    case 'ovo':
      return 'E_WALLET';
    case 'qris':
      return 'QRIS';
    default:
      return 'BANK_TRANSFER';
  }
}