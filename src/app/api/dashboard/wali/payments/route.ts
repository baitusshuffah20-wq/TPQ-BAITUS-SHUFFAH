import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API /dashboard/wali/payments GET called");

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow WALI role
    if (session.user.role !== "WALI") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only wali can access this data." },
        { status: 403 }
      );
    }

    console.log(`💳 Loading payments data for wali: ${session.user.id}`);

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const santriId = searchParams.get('santriId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      santri: {
        waliId: session.user.id,
      },
    };

    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.type = type;
    }

    if (santriId) {
      whereClause.santriId = santriId;
    }

    // Get payments with pagination
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          santri: {
            select: {
              id: true,
              name: true,
              nis: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.payment.count({
        where: whereClause,
      }),
    ]);

    console.log(`💳 Found ${payments.length} payments (total: ${totalCount})`);

    // Get summary statistics
    const summaryStats = await prisma.payment.groupBy({
      by: ['status'],
      where: {
        santri: {
          waliId: session.user.id,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    // Get wali's children for filter options
    const children = await prisma.santri.findMany({
      where: {
        waliId: session.user.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        nis: true,
      },
    });

    // Format payments data
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      type: payment.type,
      amount: Number(payment.amount),
      status: payment.status,
      dueDate: payment.dueDate,
      paidDate: payment.paidDate,
      method: payment.method,
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      santri: {
        id: payment.santri.id,
        name: payment.santri.name,
        nis: payment.santri.nis,
      },
    }));

    // Calculate summary
    const summary = {
      total: totalCount,
      pending: summaryStats.find(s => s.status === 'PENDING')?._count.id || 0,
      paid: summaryStats.find(s => s.status === 'PAID')?._count.id || 0,
      overdue: summaryStats.find(s => s.status === 'OVERDUE')?._count.id || 0,
      totalPendingAmount: summaryStats.find(s => s.status === 'PENDING')?._sum.amount || 0,
      totalPaidAmount: summaryStats.find(s => s.status === 'PAID')?._sum.amount || 0,
    };

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log("✅ Payments data compiled successfully");

    return NextResponse.json({
      success: true,
      data: {
        payments: formattedPayments,
        summary,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          children,
          statuses: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
          types: ['SPP', 'DONATION', 'REGISTRATION', 'BOOK', 'UNIFORM', 'OTHER'],
        },
      },
    });

  } catch (error) {
    console.error("❌ Error fetching wali payments data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch payments data",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
