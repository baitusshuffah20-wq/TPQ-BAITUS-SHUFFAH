import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/payments/manual - Get manual payments for admin verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING_VERIFICATION";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    // Build where clause
    const whereClause: any = {};

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    // Only show manual transfer orders
    whereClause.paymentMethod = {
      in: ["MANUAL_BCA", "MANUAL_MANDIRI", "MANUAL_BNI", "MANUAL_TRANSFER"],
    };

    // Get total count
    const totalCount = await prisma.order.count({
      where: whereClause,
    });

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform orders to payment format
    const payments = orders.map((order) => {
      const metadata = order.metadata ? JSON.parse(order.metadata) : {};
      const items = order.items ? JSON.parse(order.items) : [];

      return {
        id: order.id,
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        amount: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        paymentStatus: order.paymentStatus,
        proofFilePath: metadata.proofFilePath,
        bankAccount: metadata.bankAccount,
        items: items,
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt?.toISOString(),
        metadata: metadata,
      };
    });

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting manual payments:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pembayaran manual" },
      { status: 500 },
    );
  }
}

// POST /api/admin/payments/manual - Bulk actions on manual payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderIds, adminId, notes } = body;

    if (
      !action ||
      !orderIds ||
      !Array.isArray(orderIds) ||
      orderIds.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    if (!["APPROVE_ALL", "REJECT_ALL"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action tidak valid" },
        { status: 400 },
      );
    }

    const results = [];

    for (const orderId of orderIds) {
      try {
        // Get order
        const order = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (!order) {
          results.push({
            orderId,
            success: false,
            message: "Order tidak ditemukan",
          });
          continue;
        }

        if (order.status !== "PENDING_VERIFICATION") {
          results.push({
            orderId,
            success: false,
            message: "Order sudah diverifikasi",
          });
          continue;
        }

        // Update order status
        const newStatus = action === "APPROVE_ALL" ? "COMPLETED" : "CANCELLED";
        const paymentStatus = action === "APPROVE_ALL" ? "PAID" : "FAILED";

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            paymentStatus,
            paidAt: action === "APPROVE_ALL" ? new Date() : null,
            notes: notes || order.notes,
            metadata: JSON.stringify({
              ...JSON.parse(order.metadata || "{}"),
              verifiedBy: adminId,
              verifiedAt: new Date().toISOString(),
              verificationAction: action,
              verificationNotes: notes,
              bulkAction: true,
            }),
          },
        });

        if (action === "APPROVE_ALL") {
          // Process approved payment
          await processApprovedPayment(orderId);
        }

        results.push({
          orderId,
          success: true,
          message: `Pembayaran berhasil ${action === "APPROVE_ALL" ? "disetujui" : "ditolak"}`,
        });
      } catch (error) {
        console.error(`Error processing order ${orderId}:`, error);
        results.push({
          orderId,
          success: false,
          message: "Gagal memproses pembayaran",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} pembayaran berhasil diproses, ${failCount} gagal`,
      results,
      summary: {
        total: orderIds.length,
        success: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error("Error processing bulk manual payments:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses pembayaran secara bulk" },
      { status: 500 },
    );
  }
}

// Helper function to process approved payment
async function processApprovedPayment(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    const items = JSON.parse(order.items);

    // Process each item
    for (const item of items) {
      if (item.itemType === "SPP") {
        // Update SPP record to PAID
        const sppRecord = await prisma.sPPRecord.findFirst({
          where: {
            santriId: item.metadata?.studentId || item.itemId,
            status: "PENDING_VERIFICATION",
          },
        });

        if (sppRecord) {
          await prisma.sPPRecord.update({
            where: { id: sppRecord.id },
            data: {
              status: "PAID",
              paidDate: new Date(),
              paidAmount: item.price,
              receiptNumber: `SPP-${orderId}`,
            },
          });
        }
      } else if (item.itemType === "DONATION") {
        // Update donation to CONFIRMED
        await prisma.donation.updateMany({
          where: {
            reference: orderId,
            status: "PENDING_VERIFICATION",
          },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        });
      }
    }

    // Create financial transaction
    const defaultAccount = await prisma.financialAccount.findFirst({
      where: { accountType: "CASH" },
    });

    if (defaultAccount) {
      await prisma.transaction.create({
        data: {
          transactionType: "INCOME",
          amount: order.total,
          description: `Manual transfer payment - Order: ${orderId}`,
          date: new Date(),
          reference: orderId,
          status: "COMPLETED",
          accountId: defaultAccount.id,
          createdById: "system",
        },
      });

      // Update account balance
      await prisma.financialAccount.update({
        where: { id: defaultAccount.id },
        data: {
          balance: {
            increment: order.total,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error processing approved payment:", error);
  }
}

// PUT /api/admin/payments/manual - Update manual payment status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action, adminId, notes } = body;

    if (!orderId || !action || !adminId) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action tidak valid" },
        { status: 400 },
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    if (order.status !== "PENDING_VERIFICATION") {
      return NextResponse.json(
        { success: false, message: "Order sudah diverifikasi" },
        { status: 400 },
      );
    }

    // Update order status
    const newStatus = action === "APPROVE" ? "COMPLETED" : "CANCELLED";
    const paymentStatus = action === "APPROVE" ? "PAID" : "FAILED";

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        paymentStatus,
        paidAt: action === "APPROVE" ? new Date() : null,
        notes: notes || order.notes,
        metadata: JSON.stringify({
          ...JSON.parse(order.metadata || "{}"),
          verifiedBy: adminId,
          verifiedAt: new Date().toISOString(),
          verificationAction: action,
          verificationNotes: notes,
        }),
      },
    });

    if (action === "APPROVE") {
      // Process approved payment
      await processApprovedPayment(orderId);
    }

    return NextResponse.json({
      success: true,
      message: `Pembayaran berhasil ${action === "APPROVE" ? "disetujui" : "ditolak"}`,
      data: {
        orderId,
        status: newStatus,
        paymentStatus,
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId,
      },
    });
  } catch (error) {
    console.error("Error updating manual payment:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memverifikasi pembayaran" },
      { status: 500 },
    );
  }
}
