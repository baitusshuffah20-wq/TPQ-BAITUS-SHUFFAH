import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const method = searchParams.get("method");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const exportData = searchParams.get("export") === "true";

    const where: any = {};

    // Filter by status
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Filter by type
    if (type && type !== "ALL") {
      where.type = type;
    }

    // Filter by method
    if (method && method !== "ALL") {
      where.method = method;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          santri: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { nis: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Handle export
    if (exportData) {
      const allPayments = await prisma.transaction.findMany({
        where,
        include: {
          santri: {
            select: {
              id: true,
              name: true,
              nis: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Generate CSV
      const csvHeaders = [
        "ID",
        "Payer Name",
        "Payer ID",
        "Type",
        "Amount",
        "Method",
        "Status",
        "Reference",
        "Description",
        "Created At",
        "Paid At",
      ];

      const csvRows = allPayments.map((payment) => [
        payment.id,
        payment.santri?.name || "N/A",
        payment.santri?.nis || "N/A",
        payment.type || "OTHER",
        payment.amount,
        payment.method || "UNKNOWN",
        payment.status || "UNKNOWN",
        payment.reference || "",
        payment.description || "",
        payment.createdAt.toISOString(),
        payment.paidAt?.toISOString() || "",
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="payments-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const skip = (page - 1) * limit;

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          santri: {
            select: {
              id: true,
              name: true,
              nis: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate summary
    const summary = await prisma.transaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    // Get status-specific summaries
    const [paidSum, pendingSum, failedSum] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, status: "PAID" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, status: "PENDING" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, status: "FAILED" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const totalTransactions = summary._count._all;
    const successfulTransactions = paidSum._count._all;
    const successRate =
      totalTransactions > 0
        ? (successfulTransactions / totalTransactions) * 100
        : 0;

    // Transform payments for response
    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status || "UNKNOWN",
      type: payment.type || "OTHER",
      method: payment.method || "UNKNOWN",
      reference: payment.reference,
      description: payment.description,
      paidAt: payment.paidAt?.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      student: payment.santri
        ? {
            id: payment.santri.id,
            name: payment.santri.name,
            nis: payment.santri.nis,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      payments: transformedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalPaid: paidSum._sum.amount || 0,
        totalPending: pendingSum._sum.amount || 0,
        totalFailed: failedSum._sum.amount || 0,
        totalTransactions,
        successRate,
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/payments - Create new payment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.amount || !data.type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: amount, type",
        },
        { status: 400 },
      );
    }

    // Create payment
    const payment = await prisma.transaction.create({
      data: {
        amount: parseFloat(data.amount),
        type: data.type,
        method: data.method || "CASH",
        status: data.status || "PENDING",
        reference: data.reference,
        description: data.description || "",
        santriId: data.santriId,
        accountId: data.accountId,
        category: data.category,
        transactionDate: data.transactionDate
          ? new Date(data.transactionDate)
          : new Date(),
      },
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            nis: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      message: "Payment created successfully",
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
