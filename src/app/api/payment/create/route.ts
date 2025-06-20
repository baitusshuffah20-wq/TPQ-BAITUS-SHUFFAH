import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSPPPayment, createDonationPayment } from '@/lib/midtrans';

export async function POST(request: NextRequest) {
  try {
    // First try to parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body', 
          details: 'Could not parse JSON request body'
        },
        { status: 400 }
      );
    }
    
    const session = await getServerSession(authOptions);
    const { type, santriId, amount, paymentType, donationData } = body;
    
    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Missing payment type', details: 'Payment type is required' },
        { status: 400 }
      );
    }
    
    // Only require authentication for SPP payments, not for donations
    if (type === 'spp' && !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate unique order ID
    const orderId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (type === 'spp') {
      // Handle SPP Payment
      if (!santriId || !amount || !paymentType) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for SPP payment' },
          { status: 400 }
        );
      }

      // Get santri data
      const santri = await prisma.santri.findUnique({
        where: { id: santriId },
        include: { wali: true }
      });

      if (!santri) {
        return NextResponse.json(
          { success: false, error: 'Santri not found' },
          { status: 404 }
        );
      }

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          type: paymentType,
          amount: amount,
          dueDate: new Date(),
          santriId: santriId,
          reference: orderId
        }
      });

      // Create Midtrans payment
      const paymentRequest = {
        orderId: orderId,
        amount: amount,
        customerDetails: {
          firstName: santri.wali.name,
          email: santri.wali.email!,
          phone: santri.wali.phone || '08123456789'
        },
        itemDetails: [
          {
            id: payment.id,
            price: amount,
            quantity: 1,
            name: `${paymentType} - ${santri.name}`
          }
        ]
      };

      const midtransResponse = await createSPPPayment(paymentRequest);

      if (!midtransResponse.success) {
        // Delete payment record if Midtrans fails
        await prisma.payment.delete({ where: { id: payment.id } });
        
        return NextResponse.json(
          { success: false, error: midtransResponse.error },
          { status: 500 }
        );
      }

      // Update payment with Midtrans token
      await prisma.payment.update({
        where: { id: payment.id },
        data: { midtransToken: midtransResponse.token }
      });

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        token: midtransResponse.token,
        redirectUrl: midtransResponse.redirectUrl
      });

    } else if (type === 'donation') {
      // Handle Donation Payment
      if (!donationData || !amount) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for donation' },
          { status: 400 }
        );
      }

      // Create donation record in database
      // Prepare data for donation creation
      const donationCreateData = {
        donorName: donationData.donorName || 'Donatur Anonim',
        donorEmail: donationData.donorEmail || 'anonymous@example.com',
        donorPhone: donationData.donorPhone || '08123456789',
        amount: parseFloat(amount.toString()), // Convert to Float as per the schema
        type: donationData.type || 'GENERAL',
        message: donationData.message || '',
        isAnonymous: donationData.isAnonymous || false,
        status: 'PENDING', // Set initial status to PENDING
        reference: orderId // Add reference field for webhook processing
      };
      
      // Add categoryId if it exists and is valid
      if (donationData.categoryId) {
        try {
          // Check if the category exists
          const category = await prisma.donationCategory.findUnique({
            where: { id: donationData.categoryId }
          });
          
          if (category) {
            // @ts-ignore - We know categoryId exists in the schema
            donationCreateData.categoryId = donationData.categoryId;
          }
        } catch (error) {
          console.warn('Invalid categoryId provided:', error);
          // Continue without categoryId
        }
      }
      
      console.log('Creating donation with data:', donationCreateData);
      
      // Create donation record
      const donation = await prisma.donation.create({
        data: donationCreateData
      });

      // Create Midtrans payment
      const paymentRequest = {
        orderId: orderId,
        amount: amount,
        customerDetails: {
          firstName: donationData.donorName,
          email: donationData.donorEmail || 'donor@rumahtahfidz.com',
          phone: donationData.donorPhone || '08123456789'
        },
        itemDetails: [
          {
            id: donation.id,
            price: amount,
            quantity: 1,
            name: `Donasi ${donationData.categoryName || donationData.type} - ${donationData.donorName}`
          }
        ]
      };

      console.log('Creating Midtrans payment for donation:', paymentRequest);
      const midtransResponse = await createDonationPayment(paymentRequest);
      console.log('Midtrans response:', midtransResponse);

      if (!midtransResponse.success) {
        // Delete donation record if Midtrans fails
        try {
          await prisma.donation.delete({ where: { id: donation.id } });
        } catch (deleteError) {
          console.error('Error deleting failed donation:', deleteError);
          // Continue even if delete fails
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: midtransResponse.error || 'Failed to create payment with payment gateway',
            details: midtransResponse.details || 'No additional details provided'
          },
          { status: 500 }
        );
      }

      // Update donation with payment status and token
      try {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { 
            status: 'PROCESSING',
            paymentMethod: 'MIDTRANS',
            midtransToken: midtransResponse.token
          }
        });
      } catch (updateError) {
        console.error('Error updating donation status:', updateError);
        // Continue even if update fails
      }

      return NextResponse.json({
        success: true,
        donationId: donation.id,
        token: midtransResponse.token,
        redirectUrl: midtransResponse.redirectUrl,
        devMode: midtransResponse.devMode || false,
        donationData: {
          categoryName: donationData.categoryName,
          amount: amount,
          donorName: donationData.donorName,
          isAnonymous: donationData.isAnonymous
        }
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid payment type' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
