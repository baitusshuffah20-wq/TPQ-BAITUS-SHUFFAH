import { prisma } from "@/lib/prisma";

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
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
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
    },
  ): Promise<PaymentAnalytics> {
    const start =
      startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    // Build where clause
    const whereClause: Record<string, unknown> = {
      createdAt: {
        gte: start,
        lte: end,
      },
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
      trends,
    ] = await Promise.all([
      this.getOverviewStats(whereClause),
      this.getRevenueByPeriod(start, end, filters),
      this.getPaymentMethodStats(whereClause),
      this.getCategoryBreakdown(whereClause),
      this.getTopStudents(start, end),
      this.getRecentTransactions(10),
      this.getTrends(start, end, filters),
    ]);

    return {
      overview,
      revenueByPeriod,
      paymentMethodStats,
      categoryBreakdown,
      topStudents,
      recentTransactions,
      trends,
    };
  }

  // Get overview statistics
  private static async getOverviewStats(whereClause: Record<string, unknown>) {
    const [orders, previousMonthOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        select: {
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1,
              1,
            ),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        select: {
          totalAmount: true,
          status: true,
        },
      }),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status === "PAID")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalTransactions = orders.length;
    const successfulTransactions = orders.filter(
      (o) => o.status === "PAID",
    ).length;
    const successRate =
      totalTransactions > 0
        ? (successfulTransactions / totalTransactions) * 100
        : 0;
    const averageTransactionValue =
      successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0;
    const pendingAmount = orders
      .filter((o) => o.status === "PENDING")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Calculate monthly growth
    const previousRevenue = previousMonthOrders
      .filter((o) => o.status === "PAID")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const monthlyGrowth =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    return {
      totalRevenue,
      totalTransactions,
      successRate,
      averageTransactionValue,
      monthlyGrowth,
      pendingAmount,
    };
  }

  // Get revenue by period (daily/weekly/monthly)
  private static async getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    filters?: Record<string, unknown>,
  ) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
        ...(filters?.paymentMethod && { paymentMethod: filters.paymentMethod }),
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by month
    const monthlyData = new Map<
      string,
      { revenue: number; transactions: number }
    >();

    orders.forEach((order) => {
      const monthKey = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(monthKey) || {
        revenue: 0,
        transactions: 0,
      };
      monthlyData.set(monthKey, {
        revenue: existing.revenue + order.totalAmount,
        transactions: existing.transactions + 1,
      });
    });

    const result = Array.from(monthlyData.entries()).map(
      ([period, data], index, array) => {
        const previousData =
          index > 0 ? array[index - 1][1] : { revenue: 0, transactions: 0 };
        const growth =
          previousData.revenue > 0
            ? ((data.revenue - previousData.revenue) / previousData.revenue) *
              100
            : 0;

        return {
          period,
          revenue: data.revenue,
          transactions: data.transactions,
          growth,
        };
      },
    );

    return result;
  }

  // Get payment method statistics
  private static async getPaymentMethodStats(
    whereClause: Record<string, unknown>,
  ) {
    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        paymentMethod: true,
        totalAmount: true,
        status: true,
      },
    });

    const methodStats = new Map<
      string,
      { count: number; revenue: number; successful: number }
    >();
    let totalRevenue = 0;

    orders.forEach((order) => {
      const method = order.paymentMethod || "Unknown";
      const existing = methodStats.get(method) || {
        count: 0,
        revenue: 0,
        successful: 0,
      };

      methodStats.set(method, {
        count: existing.count + 1,
        revenue:
          existing.revenue + (order.status === "PAID" ? order.totalAmount : 0),
        successful: existing.successful + (order.status === "PAID" ? 1 : 0),
      });

      if (order.status === "PAID") {
        totalRevenue += order.totalAmount;
      }
    });

    return Array.from(methodStats.entries())
      .map(([method, stats]) => ({
        method,
        count: stats.count,
        revenue: stats.revenue,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
        successRate:
          stats.count > 0 ? (stats.successful / stats.count) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // Get category breakdown (SPP vs Donations)
  private static async getCategoryBreakdown(
    whereClause: Record<string, unknown>,
  ) {
    const orders = await prisma.order.findMany({
      where: {
        ...whereClause,
        status: "PAID",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    const categoryStats = new Map<
      string,
      { revenue: number; transactions: number }
    >();
    let totalRevenue = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product?.category || "Other";
        const existing = categoryStats.get(category) || {
          revenue: 0,
          transactions: 0,
        };

        categoryStats.set(category, {
          revenue: existing.revenue + item.price * item.quantity,
          transactions: existing.transactions + 1,
        });

        totalRevenue += item.price * item.quantity;
      });
    });

    return Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        revenue: stats.revenue,
        transactions: stats.transactions,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // Get top paying students
  private static async getTopStudents(startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
        santriId: {
          not: null,
        },
      },
      include: {
        santri: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const studentStats = new Map<
      string,
      {
        studentName: string;
        totalPaid: number;
        transactionCount: number;
        lastPayment: Date;
      }
    >();

    transactions.forEach((transaction) => {
      if (transaction.santri) {
        const existing = studentStats.get(transaction.santriId!) || {
          studentName: transaction.santri.name,
          totalPaid: 0,
          transactionCount: 0,
          lastPayment: transaction.createdAt,
        };

        studentStats.set(transaction.santriId!, {
          studentName: transaction.santri.name,
          totalPaid: existing.totalPaid + transaction.amount,
          transactionCount: existing.transactionCount + 1,
          lastPayment: transaction.createdAt,
        });
      }
    });

    return Array.from(studentStats.entries())
      .map(([studentId, stats]) => ({
        studentId,
        ...stats,
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 10);
  }

  // Get recent transactions
  private static async getRecentTransactions(limit: number = 10) {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderId: order.orderNumber,
      customerName: order.user?.name || "Unknown",
      amount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod || "Unknown",
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.product?.name || "Unknown",
        price: item.price,
        quantity: item.quantity,
      })),
    }));
  }

  // Get trends data
  private static async getTrends(
    startDate: Date,
    endDate: Date,
    filters?: Record<string, unknown>,
  ) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
        ...(filters?.paymentMethod && { paymentMethod: filters.paymentMethod }),
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Daily trends
    const dailyData = new Map<
      string,
      { revenue: number; transactions: number }
    >();

    orders.forEach((order) => {
      const dayKey = order.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD
      const existing = dailyData.get(dayKey) || { revenue: 0, transactions: 0 };
      dailyData.set(dayKey, {
        revenue: existing.revenue + order.totalAmount,
        transactions: existing.transactions + 1,
      });
    });

    const daily = Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions,
    }));

    // For now, weekly and monthly will be derived from daily
    // In a real implementation, you might want separate calculations
    return {
      daily,
      weekly: [], // Implement weekly grouping if needed
      monthly: [], // Implement monthly grouping if needed
    };
  }

  // Export analytics data
  static async exportAnalytics(
    format: "CSV" | "PDF",
    filters?: Record<string, unknown>,
  ) {
    const analytics = await this.getPaymentAnalytics(
      filters?.startDate as Date,
      filters?.endDate as Date,
      filters,
    );

    if (format === "CSV") {
      return this.generateCSVReport(analytics);
    } else {
      return this.generatePDFReport(analytics);
    }
  }

  // Generate CSV report
  private static generateCSVReport(analytics: PaymentAnalytics): string {
    const csvData = [
      ["Payment Analytics Report"],
      ["Generated on:", new Date().toISOString()],
      [""],
      ["Overview"],
      ["Total Revenue", analytics.overview.totalRevenue],
      ["Total Transactions", analytics.overview.totalTransactions],
      ["Success Rate (%)", analytics.overview.successRate],
      ["Average Transaction Value", analytics.overview.averageTransactionValue],
      ["Monthly Growth (%)", analytics.overview.monthlyGrowth],
      [""],
      ["Payment Methods"],
      ["Method", "Count", "Revenue", "Percentage", "Success Rate"],
      ...analytics.paymentMethodStats.map((stat) => [
        stat.method,
        stat.count,
        stat.revenue,
        stat.percentage,
        stat.successRate,
      ]),
    ];

    return csvData.map((row) => row.join(",")).join("\n");
  }

  // Generate PDF report (placeholder)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static generatePDFReport(_analytics: PaymentAnalytics): string {
    // In a real implementation, you'd use a PDF library like jsPDF or puppeteer
    // The analytics parameter would be used to generate the PDF content
    return "PDF generation not implemented yet";
  }
}
