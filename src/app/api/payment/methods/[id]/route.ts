import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/payment/methods/[id] - Update payment method
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const methodId = params.id;
    const body = await request.json();
    
    // Check if method exists
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { id: methodId }
    });

    if (!existingMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Update payment method
    const updatedMethod = await prisma.paymentMethod.update({
      where: { id: methodId },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : existingMethod.isActive,
        name: body.name || existingMethod.name,
        description: body.description || existingMethod.description,
        fees: body.fees !== undefined ? body.fees : existingMethod.fees,
        minAmount: body.minAmount !== undefined ? body.minAmount : existingMethod.minAmount,
        maxAmount: body.maxAmount !== undefined ? body.maxAmount : existingMethod.maxAmount,
        icon: body.icon || existingMethod.icon,
      }
    });

    return NextResponse.json({
      success: true,
      method: updatedMethod
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update payment method',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/payment/methods/[id] - Delete payment method
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const methodId = params.id;
    
    // Check if method exists
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { id: methodId }
    });

    if (!existingMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Delete payment method
    await prisma.paymentMethod.delete({
      where: { id: methodId }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete payment method',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}