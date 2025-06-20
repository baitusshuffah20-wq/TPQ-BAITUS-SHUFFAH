import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationTriggerService } from '@/lib/notification-triggers';

// GET /api/financial/transactions/[id] - Get specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        santri: {
          select: {
            id: true,
            nis: true,
            name: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

// PUT /api/financial/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      status, 
      paidAt, 
      receiptNumber, 
      notes,
      paymentMethod,
      amount,
      description 
    } = body;

    // Get current transaction
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        santri: {
          include: {
            parent: true
          }
        }
      }
    });

    if (!currentTransaction) {
      return NextResponse.json(
        { success: false, message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paidAt && { paidAt: new Date(paidAt) }),
        ...(receiptNumber && { receiptNumber }),
        ...(notes && { notes }),
        ...(paymentMethod && { paymentMethod }),
        ...(amount && { amount }),
        ...(description && { description }),
        updatedAt: new Date()
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        santri: {
          select: {
            id: true,
            nis: true,
            name: true
          }
        }
      }
    });

    // Trigger payment confirmation notification if status changed to PAID
    if (status === 'PAID' && currentTransaction.status !== 'PAID') {
      try {
        await NotificationTriggerService.sendPaymentConfirmation(id);
        console.log(`Payment confirmation notification triggered for transaction ${id}`);
      } catch (notificationError) {
        console.error('Error triggering payment confirmation notification:', notificationError);
        // Don't fail the transaction update if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil diperbarui',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui transaksi' },
      { status: 500 }
    );
  }
}

// DELETE /api/financial/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus transaksi' },
      { status: 500 }
    );
  }
}
