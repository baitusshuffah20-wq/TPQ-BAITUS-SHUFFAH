import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaymentAnalytics {
  overview: {
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    averageTransactionValue: number;
    monthlyGrowth: number;
    pendingAmount: number;
  };
  revenueByPeriod: {
    period: string;
    revenue: number;
    transactions: number;
    growth: number;
  }[];
  paymentMethodStats: {
    method: string;
    count: number;
    revenue: number;
    percentage: number;
    successRate: number;
  }[];
  categoryBreakdown: {
    category: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }[];
  topStudents: {
    studentId: string;
    studentName: string;
    totalPaid: number;
    transactionCount: number;
    lastPayment: Date;
  }[];
  recentTransactions: {
    id: string;
    orderId: string;
    customerName: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: Date;
    items: any[];
  }[];
  trends: {
    daily: { date: string; revenue: number; transactions: number }[];
    weekly: { week: string; revenue: number; transactions: number }[];
    monthly: { month: string; revenue: number; transactions: number }[];
  };
}

export class PaymentAnalyticsService {
  
  // Get comprehensive payment analytics
  static async getPaymentAnalytics(
    startDate?: Date,
    endDate?: Date,
    filters?: {
      paymentMethod?: string;
      status?: string;
      category?: string;
    }
  ): Promise<PaymentAnalytics> {
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    };

    if (filters?.paymentMethod) {
      whereClause.paymentMethod = filters.paymentMethod;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    const [
      overview,
      revenueByPeriod,
      paymentMethodStats,
      categoryBreakdown,
      topStudents,
      recentTransactions,
      trends
    ] = await Promise.all([
      this.getOverviewStats(whereClause),
      this.getRevenueByPeriod(start, end, filters),
      this.getPaymentMethodStats(whereClause),
      this.getCategoryBreakdown(whereClause),
      this.getTopStudents(start, end),
      this.getRecentTransactions(10),
      this.getTrends(start, end, filters)
    ]);

    return {
      overview,
      revenueByPeriod,
      paymentMethodStats,
      categoryBreakdown,
      topStudents,
      recentTransactions,
      trends
    };
  }

  // Get overview statistics
  private static async getOverviewStats(whereClause: any) {
    const [orders, previousMonthOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        select: {
          total: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.order.findMany({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        select: {
          total: true,
          status: true
        }
      })
    ]);

    const totalRevenue = orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.total, 0);
    const totalTransactions = orders.length;
    const successfulTransactions = orders.filter(o => o.status === 'PAID').length;
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
    const averageTransactionValue = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0;
    const pendingAmount = orders.filter(o => o.status === 'PENDING').reduce((sum, o) => sum + o.total, 0);

    // Calculate monthly growth
    const previousRevenue = previousMonthOrders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.total, 0);
    const monthlyGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalTransactions,
      successRate,
      averageTransactionValue,
      monthlyGrowth,
      pendingAmount
    };
  }

  // Get revenue by period (daily/weekly/monthly)
  private static async getRevenueByPeriod(startDate: Date, endDate: Date, filters?: any) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'PAID',
        ...(filters?.paymentMethod && { paymentMethod: filters.paymentMethod })
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by month
    const monthlyData = new Map<string, { revenue: number; transactions: number }>();
    
    orders.forEach(order => {
      const monthKey = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(monthKey) || { revenue: 0, transactions: 0 };
      monthlyData.set(monthKey, {
        revenue: existing.revenue + order.total,
        transactions: existing.transactions + 1
      });
    });

    const result = Array.from(monthlyData.entries()).map(([period, data], index, array) => {
      const previousData = index > 0 ? array[index - 1][1] : { revenue: 0, transactions: 0 };
      const growth = previousData.revenue > 0 ? ((data.revenue - previousData.revenue) / previousData.revenue) * 100 : 0;
      
      return {
        period,
        revenue: data.revenue,
        transactions: data.transactions,
        growth
      };
    });

    return result;
  }

  // Get payment method statistics
  private static async getPaymentMethodStats(whereClause: any) {
    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        paymentMethod: true,
        total: true,
        status: true
      }
    });

    const methodStats = new Map<string, { count: number; revenue: number; successful: number }>();
    let totalRevenue = 0;

    orders.forEach(order => {
      const method = order.paymentMethod || 'Unknown';
      const existing = methodStats.get(method) || { count: 0, revenue: 0, successful: 0 };
      
      methodStats.set(method, {
        count: existing.count + 1,
        revenue: existing.revenue + (order.status === 'PAID' ? order.total : 0),
        successful: existing.successful + (order.status === 'PAID' ? 1 : 0)
      });

      if (order.status === 'PAID') {
        totalRevenue += order.total;
      }
    });

    return Array.from(methodStats.entries()).map(([method, stats]) => ({
      method,
      count: stats.count,
      revenue: stats.revenue,
      percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
      successRate: stats.count > 0 ? (stats.successful / stats.count) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }

  // Get category breakdown (SPP vs Donations)
  private static async getCategoryBreakdown(whereClause: any) {
    const orders = await prisma.order.findMany({
      where: {
        ...whereClause,
        status: 'PAID'
      },
      select: {
        items: true,
        total: true
      }
    });

    const categoryStats = new Map<string, { revenue: number; transactions: number }>();
    let totalRevenue = 0;

    orders.forEach(order => {
      const items = JSON.parse(order.items);
      items.forEach((item: any) => {
        const category = item.itemType || 'Other';
        const existing = categoryStats.get(category) || { revenue: 0, transactions: 0 };
        
        categoryStats.set(category, {
          revenue: existing.revenue + (item.price * item.quantity),
          transactions: existing.transactions + 1
        });

        totalRevenue += (item.price * item.quantity);
      });
    });

    return Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      revenue: stats.revenue,
      transactions: stats.transactions,
      percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }

  // Get top paying students
  private static async getTopStudents(startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'PAID',
        santriId: {
          not: null
        }
      },
      include: {
        santri: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        paidAt: 'desc'
      }
    });

    const studentStats = new Map<string, { 
      studentName: string; 
      totalPaid: number; 
      transactionCount: number; 
      lastPayment: Date 
    }>();

    transactions.forEach(transaction => {
      if (transaction.santri) {
        const existing = studentStats.get(transaction.santriId!) || {
          studentName: transaction.santri.name,
          totalPaid: 0,
          transactionCount: 0,
          lastPayment: transaction.paidAt || transaction.createdAt
        };

        studentStats.set(transaction.santriId!, {
          studentName: transaction.santri.name,
          totalPaid: existing.totalPaid + transaction.amount,
          transactionCount: existing.transactionCount + 1,
          lastPayment: transaction.paidAt || transaction.createdAt
        });
      }
    });

    return Array.from(studentStats.entries())
      .map(([studentId, stats]) => ({
        studentId,
        ...stats
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 10);
  }

  // Get recent transactions
  private static async getRecentTransactions(limit: number = 10) {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        customerName: true,
        total: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        items: true
      }
    });

    return orders.map(order => ({
      id: order.id,
      orderId: order.id,
      customerName: order.customerName,
      amount: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod || 'Unknown',
      createdAt: order.createdAt,
      items: JSON.parse(order.items)
    }));
  }

  // Get trends data
  private static async getTrends(startDate: Date, endDate: Date, filters?: any) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'PAID',
        ...(filters?.paymentMethod && { paymentMethod: filters.paymentMethod })
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Daily trends
    const dailyData = new Map<string, { revenue: number; transactions: number }>();
    
    orders.forEach(order => {
      const dayKey = order.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD
      const existing = dailyData.get(dayKey) || { revenue: 0, transactions: 0 };
      dailyData.set(dayKey, {
        revenue: existing.revenue + order.total,
        transactions: existing.transactions + 1
      });
    });

    const daily = Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions
    }));

    // For now, weekly and monthly will be derived from daily
    // In a real implementation, you might want separate calculations
    return {
      daily,
      weekly: [], // Implement weekly grouping if needed
      monthly: [] // Implement monthly grouping if needed
    };
  }

  // Export analytics data
  static async exportAnalytics(format: 'CSV' | 'PDF', filters?: any) {
    const analytics = await this.getPaymentAnalytics(
      filters?.startDate,
      filters?.endDate,
      filters
    );

    if (format === 'CSV') {
      return this.generateCSVReport(analytics);
    } else {
      return this.generatePDFReport(analytics);
    }
  }

  // Generate CSV report
  private static generateCSVReport(analytics: PaymentAnalytics): string {
    const csvData = [
      ['Payment Analytics Report'],
      ['Generated on:', new Date().toISOString()],
      [''],
      ['Overview'],
      ['Total Revenue', analytics.overview.totalRevenue],
      ['Total Transactions', analytics.overview.totalTransactions],
      ['Success Rate (%)', analytics.overview.successRate],
      ['Average Transaction Value', analytics.overview.averageTransactionValue],
      ['Monthly Growth (%)', analytics.overview.monthlyGrowth],
      [''],
      ['Payment Methods'],
      ['Method', 'Count', 'Revenue', 'Percentage', 'Success Rate'],
      ...analytics.paymentMethodStats.map(stat => [
        stat.method,
        stat.count,
        stat.revenue,
        stat.percentage,
        stat.successRate
      ])
    ];

    return csvData.map(row => row.join(',')).join('\n');
  }

  // Generate PDF report (placeholder)
  private static generatePDFReport(analytics: PaymentAnalytics): string {
    // In a real implementation, you'd use a PDF library like jsPDF or puppeteer
    return 'PDF generation not implemented yet';
  }
}
