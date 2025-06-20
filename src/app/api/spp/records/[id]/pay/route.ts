import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/spp/records/[id]/pay - Process SPP payment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      paidAmount, 
      paymentMethod, 
      accountId, 
      discount = 0, 
      fine = 0, 
      notes, 
      receiptNumber,
      createdBy
    } = body;

    const sppRecordId = params.id;

    // Validation
    if (!paidAmount || !paymentMethod || !accountId || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Data pembayaran tidak lengkap' },
        { status: 400 }
      );
    }

    if (paidAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Jumlah pembayaran harus lebih dari 0' },
        { status: 400 }
      );
    }

    // Get SPP record
    const sppRecord = await prisma.sPPRecord.findUnique({
      where: { id: sppRecordId },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true
          }
        },
        sppSetting: {
          select: {
            name: true,
            level: true
          }
        }
      }
    });

    if (!sppRecord) {
      return NextResponse.json(
        { success: false, message: 'SPP tidak ditemukan' },
        { status: 404 }
      );
    }

    if (sppRecord.status === 'PAID') {
      return NextResponse.json(
        { success: false, message: 'SPP sudah lunas' },
        { status: 400 }
      );
    }

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account || !account.isActive) {
      return NextResponse.json(
        { success: false, message: 'Akun keuangan tidak valid' },
        { status: 400 }
      );
    }

    // Calculate total amount with discount and fine
    const totalAmount = sppRecord.amount - discount + fine;
    const newPaidAmount = sppRecord.paidAmount + paidAmount;

    // Determine new status
    let newStatus = 'PARTIAL';
    if (newPaidAmount >= totalAmount) {
      newStatus = 'PAID';
    }

    // Create financial transaction
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const transactionDescription = `SPP ${monthNames[sppRecord.month - 1]} ${sppRecord.year} - ${sppRecord.santri.name} (${sppRecord.santri.nis})`;

    // Get or create SPP category
    let sppCategory = await prisma.category.findFirst({
      where: {
        name: 'SPP',
        type: 'INCOME'
      }
    });

    if (!sppCategory) {
      sppCategory = await prisma.category.create({
        data: {
          name: 'SPP',
          type: 'INCOME',
          description: 'Sumbangan Pembinaan Pendidikan (SPP)',
          color: '#10B981',
          isActive: true
        }
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: 'INCOME',
        category: 'SPP',
        amount: paidAmount,
        description: transactionDescription,
        reference: receiptNumber || null,
        accountId,
        santriId: sppRecord.santriId,
        categoryId: sppCategory.id,
        createdBy,
        transactionDate: new Date()
      }
    });

    // Update SPP record
    const updatedSppRecord = await prisma.sPPRecord.update({
      where: { id: sppRecordId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
        paidDate: newStatus === 'PAID' ? new Date() : sppRecord.paidDate,
        paymentMethod,
        discount,
        fine,
        notes: notes || sppRecord.notes,
        receiptNumber: receiptNumber || sppRecord.receiptNumber,
        transactionId: transaction.id
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            name: true
          }
        },
        sppSetting: {
          select: {
            name: true,
            level: true
          }
        },
        transaction: {
          select: {
            id: true,
            amount: true,
            transactionDate: true,
            account: {
              select: {
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    // Update account balance
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: paidAmount
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: newStatus === 'PAID' ? 'SPP berhasil dilunasi' : 'Pembayaran SPP berhasil dicatat',
      sppRecord: updatedSppRecord,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description
      }
    });

  } catch (error) {
    console.error('Error processing SPP payment:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pembayaran SPP' },
      { status: 500 }
    );
  }
}
