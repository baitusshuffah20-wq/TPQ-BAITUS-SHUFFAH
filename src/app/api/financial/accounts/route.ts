import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/financial/accounts - Get all financial accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (isActive && isActive !== 'ALL') {
      where.isActive = isActive === 'true';
    }

    const accounts = await prisma.financialAccount.findMany({
      where,
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            transactionDate: true
          },
          orderBy: {
            transactionDate: 'desc'
          },
          take: 5
        },
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate actual balance from transactions
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const transactions = await prisma.transaction.findMany({
          where: { accountId: account.id },
          select: {
            type: true,
            amount: true
          }
        });

        const actualBalance = transactions.reduce((balance, transaction) => {
          return transaction.type === 'INCOME' 
            ? balance + transaction.amount 
            : balance - transaction.amount;
        }, 0);

        return {
          ...account,
          actualBalance
        };
      })
    );

    return NextResponse.json({
      success: true,
      accounts: accountsWithBalance,
      total: accountsWithBalance.length
    });

  } catch (error) {
    console.error('Error fetching financial accounts:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data akun keuangan' },
      { status: 500 }
    );
  }
}

// POST /api/financial/accounts - Create new financial account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      type, 
      accountNumber, 
      balance = 0, 
      isActive = true, 
      description 
    } = body;

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { success: false, message: 'Nama dan tipe akun wajib diisi' },
        { status: 400 }
      );
    }

    // Check if account name already exists
    const existingAccount = await prisma.financialAccount.findFirst({
      where: { name }
    });

    if (existingAccount) {
      return NextResponse.json(
        { success: false, message: 'Nama akun sudah digunakan' },
        { status: 400 }
      );
    }

    // Create account
    const account = await prisma.financialAccount.create({
      data: {
        name,
        type,
        accountNumber: accountNumber || null,
        balance: parseFloat(balance.toString()),
        isActive,
        description: description || null
      },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Akun keuangan berhasil dibuat',
      account
    });

  } catch (error) {
    console.error('Error creating financial account:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat akun keuangan' },
      { status: 500 }
    );
  }
}
