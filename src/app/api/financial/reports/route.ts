import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  type?: 'spp' | 'general' | 'all';
  santriId?: string;
  accountId?: string;
  status?: string;
}

// GET /api/financial/reports - Generate financial reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('reportType') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') as 'spp' | 'general' | 'all';
    const santriId = searchParams.get('santriId');
    const accountId = searchParams.get('accountId');

    // Set default date range (current month)
    const defaultStartDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const defaultEndDate = endDate || new Date().toISOString();

    const filters: ReportFilters = {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      type: type || 'all',
      santriId: santriId || undefined,
      accountId: accountId || undefined
    };

    switch (reportType) {
      case 'summary':
        return await generateSummaryReport(filters);
      case 'spp':
        return await generateSPPReport(filters);
      case 'transactions':
        return await generateTransactionReport(filters);
      case 'outstanding':
        return await generateOutstandingReport(filters);
      case 'collection':
        return await generateCollectionReport(filters);
      default:
        return NextResponse.json(
          { success: false, message: 'Tipe laporan tidak valid' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat laporan keuangan' },
      { status: 500 }
    );
  }
}

// Generate summary report
async function generateSummaryReport(filters: ReportFilters) {
  const dateFilter = {
    gte: new Date(filters.startDate!),
    lte: new Date(filters.endDate!)
  };

  // Get transaction summary
  const transactions = await prisma.transaction.findMany({
    where: {
      transactionDate: dateFilter,
      ...(filters.accountId && { accountId: filters.accountId })
    },
    select: {
      type: true,
      amount: true,
      category: true
    }
  });

  // Calculate totals
  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = income - expense;

  // Get SPP summary
  const sppRecords = await prisma.sPPRecord.findMany({
    where: {
      createdAt: dateFilter,
      ...(filters.santriId && { santriId: filters.santriId })
    },
    select: {
      amount: true,
      paidAmount: true,
      status: true
    }
  });

  const sppTotal = sppRecords.reduce((sum, spp) => sum + spp.amount, 0);
  const sppCollected = sppRecords.reduce((sum, spp) => sum + spp.paidAmount, 0);
  const sppOutstanding = sppTotal - sppCollected;
  const sppCollectionRate = sppTotal > 0 ? (sppCollected / sppTotal) * 100 : 0;

  // Get account balances
  const accounts = await prisma.account.findMany({
    where: {
      isActive: true,
      ...(filters.accountId && { id: filters.accountId })
    },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true
    }
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return NextResponse.json({
    success: true,
    report: {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate
      },
      summary: {
        totalIncome: income,
        totalExpense: expense,
        netIncome: netIncome,
        totalBalance: totalBalance
      },
      spp: {
        totalAmount: sppTotal,
        collectedAmount: sppCollected,
        outstandingAmount: sppOutstanding,
        collectionRate: sppCollectionRate,
        recordsCount: sppRecords.length
      },
      accounts: accounts,
      transactionsByCategory: getTransactionsByCategory(transactions)
    }
  });
}

// Generate SPP-specific report
async function generateSPPReport(filters: ReportFilters) {
  const dateFilter = {
    gte: new Date(filters.startDate!),
    lte: new Date(filters.endDate!)
  };

  const sppRecords = await prisma.sPPRecord.findMany({
    where: {
      createdAt: dateFilter,
      ...(filters.santriId && { santriId: filters.santriId })
    },
    include: {
      santri: {
        select: {
          id: true,
          nis: true,
          name: true,
          halaqah: {
            select: {
              name: true,
              level: true
            }
          }
        }
      },
      sppSetting: {
        select: {
          name: true,
          level: true,
          amount: true
        }
      }
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { santri: { name: 'asc' } }
    ]
  });

  // Group by status
  const statusSummary = sppRecords.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by month
  const monthlyData = sppRecords.reduce((acc, record) => {
    const key = `${record.year}-${record.month.toString().padStart(2, '0')}`;
    if (!acc[key]) {
      acc[key] = {
        period: `${getMonthName(record.month)} ${record.year}`,
        totalAmount: 0,
        collectedAmount: 0,
        recordsCount: 0
      };
    }
    acc[key].totalAmount += record.amount;
    acc[key].collectedAmount += record.paidAmount;
    acc[key].recordsCount += 1;
    return acc;
  }, {} as Record<string, any>);

  return NextResponse.json({
    success: true,
    report: {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate
      },
      summary: {
        totalRecords: sppRecords.length,
        totalAmount: sppRecords.reduce((sum, r) => sum + r.amount, 0),
        collectedAmount: sppRecords.reduce((sum, r) => sum + r.paidAmount, 0),
        outstandingAmount: sppRecords.reduce((sum, r) => sum + (r.amount - r.paidAmount), 0)
      },
      statusBreakdown: statusSummary,
      monthlyData: Object.values(monthlyData),
      records: sppRecords
    }
  });
}

// Generate transaction report
async function generateTransactionReport(filters: ReportFilters) {
  const dateFilter = {
    gte: new Date(filters.startDate!),
    lte: new Date(filters.endDate!)
  };

  const transactions = await prisma.transaction.findMany({
    where: {
      transactionDate: dateFilter,
      ...(filters.accountId && { accountId: filters.accountId }),
      ...(filters.type === 'spp' && { category: 'SPP' })
    },
    include: {
      account: {
        select: {
          name: true,
          type: true
        }
      },
      santri: {
        select: {
          name: true,
          nis: true
        }
      }
    },
    orderBy: {
      transactionDate: 'desc'
    }
  });

  // Group by type
  const typeBreakdown = transactions.reduce((acc, transaction) => {
    acc[transaction.type] = (acc[transaction.type] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group by category
  const categoryBreakdown = transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Lainnya';
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    success: true,
    report: {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate
      },
      summary: {
        totalTransactions: transactions.length,
        totalIncome: typeBreakdown.INCOME || 0,
        totalExpense: typeBreakdown.EXPENSE || 0,
        netAmount: (typeBreakdown.INCOME || 0) - (typeBreakdown.EXPENSE || 0)
      },
      typeBreakdown: typeBreakdown,
      categoryBreakdown: categoryBreakdown,
      transactions: transactions
    }
  });
}

// Generate outstanding payments report
async function generateOutstandingReport(filters: ReportFilters) {
  const outstandingSPP = await prisma.sPPRecord.findMany({
    where: {
      status: {
        in: ['PENDING', 'PARTIAL', 'OVERDUE']
      },
      ...(filters.santriId && { santriId: filters.santriId })
    },
    include: {
      santri: {
        select: {
          id: true,
          nis: true,
          name: true,
          halaqah: {
            select: {
              name: true,
              level: true
            }
          }
        }
      },
      sppSetting: {
        select: {
          name: true,
          level: true
        }
      }
    },
    orderBy: [
      { dueDate: 'asc' },
      { santri: { name: 'asc' } }
    ]
  });

  // Calculate overdue
  const now = new Date();
  const overdueSPP = outstandingSPP.filter(spp => new Date(spp.dueDate) < now);

  const totalOutstanding = outstandingSPP.reduce((sum, spp) => sum + (spp.amount - spp.paidAmount), 0);
  const totalOverdue = overdueSPP.reduce((sum, spp) => sum + (spp.amount - spp.paidAmount), 0);

  return NextResponse.json({
    success: true,
    report: {
      summary: {
        totalOutstandingRecords: outstandingSPP.length,
        totalOutstandingAmount: totalOutstanding,
        totalOverdueRecords: overdueSPP.length,
        totalOverdueAmount: totalOverdue
      },
      outstandingRecords: outstandingSPP,
      overdueRecords: overdueSPP
    }
  });
}

// Generate collection rate report
async function generateCollectionReport(filters: ReportFilters) {
  const dateFilter = {
    gte: new Date(filters.startDate!),
    lte: new Date(filters.endDate!)
  };

  // Get all SPP records in period
  const sppRecords = await prisma.sPPRecord.findMany({
    where: {
      createdAt: dateFilter
    },
    include: {
      santri: {
        select: {
          name: true,
          halaqah: {
            select: {
              name: true,
              level: true
            }
          }
        }
      }
    }
  });

  // Group by halaqah
  const halaqahData = sppRecords.reduce((acc, record) => {
    const halaqahName = record.santri.halaqah?.name || 'Tidak ada halaqah';
    if (!acc[halaqahName]) {
      acc[halaqahName] = {
        name: halaqahName,
        level: record.santri.halaqah?.level || '',
        totalAmount: 0,
        collectedAmount: 0,
        recordsCount: 0
      };
    }
    acc[halaqahName].totalAmount += record.amount;
    acc[halaqahName].collectedAmount += record.paidAmount;
    acc[halaqahName].recordsCount += 1;
    return acc;
  }, {} as Record<string, any>);

  // Calculate collection rates
  Object.values(halaqahData).forEach((halaqah: any) => {
    halaqah.collectionRate = halaqah.totalAmount > 0 
      ? (halaqah.collectedAmount / halaqah.totalAmount) * 100 
      : 0;
  });

  return NextResponse.json({
    success: true,
    report: {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate
      },
      halaqahData: Object.values(halaqahData),
      overallCollectionRate: sppRecords.length > 0 
        ? (sppRecords.reduce((sum, r) => sum + r.paidAmount, 0) / sppRecords.reduce((sum, r) => sum + r.amount, 0)) * 100
        : 0
    }
  });
}

// Helper functions
function getTransactionsByCategory(transactions: any[]) {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Lainnya';
    if (!acc[category]) {
      acc[category] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'INCOME') {
      acc[category].income += transaction.amount;
    } else {
      acc[category].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);
}

function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1];
}
