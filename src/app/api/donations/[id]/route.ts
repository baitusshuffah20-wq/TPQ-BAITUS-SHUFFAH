import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if the ID is a Midtrans order ID
    if (id.startsWith('donation_')) {
      // Try to find donation by reference field
      const donationByReference = await prisma.donation.findFirst({
        where: { reference: id }
      });
      
      if (donationByReference) {
        return NextResponse.json({
          success: true,
          donation: donationByReference
        });
      }
    }
    
    // Try to find by ID
    const donation = await prisma.donation.findUnique({
      where: { id }
    });
    
    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      donation
    });
    
  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch donation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}