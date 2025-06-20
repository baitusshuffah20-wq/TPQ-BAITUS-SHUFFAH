import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationTriggerService } from '@/lib/notification-triggers';

// GET /api/financial/transactions - Get all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (accountId && accountId !== 'ALL') {
      where.accountId = accountId;
    }

    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
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
          donation: {
            select: {
              id: true,
              donorName: true,
              type: true
            }
          },
          payment: {
            select: {
              id: true,
              type: true,
              amount: true,
              status: true,
              dueDate: true,
              paidDate: true
            }
          },
          createdByUser: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          transactionDate: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);

    // Calculate summary
    const summary = await prisma.transaction.aggregate({
      where,
      _sum: {
        amount: true
      }
    });

    const incomeSum = await prisma.transaction.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: {
        amount: true
      }
    });

    const expenseSum = await prisma.transaction.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalIncome: incomeSum._sum.amount || 0,
        totalExpense: expenseSum._sum.amount || 0,
        netIncome: (incomeSum._sum.amount || 0) - (expenseSum._sum.amount || 0)
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

// POST /api/financial/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      category, 
      amount, 
      description, 
      reference, 
      accountId, 
      santriId, 
      donationId, 
      paymentId, 
      transactionDate, 
      createdBy,
      attachments,
      tags
    } = body;

    // Validation
    if (!type || !category || !amount || !description || !accountId || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Check if account exists
    const account = await prisma.financialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Akun keuangan tidak ditemukan' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: createdBy }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        type,
        category,
        amount: parseFloat(amount.toString()),
        description,
        reference: reference || null,
        accountId,
        santriId: santriId || null,
        donationId: donationId || null,
        paymentId: paymentId || null,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        createdBy,
        attachments: attachments ? JSON.stringify(attachments) : null,
        tags: tags ? JSON.stringify(tags) : null
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
        },
        createdByUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update account balance
    const balanceChange = type === 'INCOME' ? amount : -amount;
    await prisma.financialAccount.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dibuat',
      transaction
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat transaksi' },
      { status: 500 }
    );
  }
}
