import { NextRequest, NextResponse } from "next/server";
// Temporary implementation without database
// import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Temporary in-memory storage for manual payments
const manualPayments = new Map<string, any>();

// POST /api/payment/manual - Process manual transfer payment
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const paymentDataStr = formData.get("paymentData") as string;
    const proofFile = formData.get("proofFile") as File | null;

    if (!paymentDataStr) {
      return NextResponse.json(
        { success: false, message: "Data pembayaran tidak lengkap" },
        { status: 400 },
      );
    }

    const paymentData = JSON.parse(paymentDataStr);
    const { type, method, amount, customerInfo, items, bankAccount } =
      paymentData;

    // Validation
    if (!type || !method || !amount || !customerInfo || !items) {
      return NextResponse.json(
        { success: false, message: "Data pembayaran tidak lengkap" },
        { status: 400 },
      );
    }

    if (!proofFile) {
      return NextResponse.json(
        { success: false, message: "Bukti transfer wajib diupload" },
        { status: 400 },
      );
    }

    // Generate order ID
    const orderId = `MANUAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save proof file
    let proofFilePath = null;
    if (proofFile) {
      const uploadsDir = join(
        process.cwd(),
        "public",
        "uploads",
        "payment-proofs",
      );

      // Create directory if it doesn't exist
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const fileName = `${orderId}_${Date.now()}_${proofFile.name}`;
      const filePath = join(uploadsDir, fileName);

      const bytes = await proofFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(filePath, buffer);
      proofFilePath = `/uploads/payment-proofs/${fileName}`;
    }

    // Create order record (in-memory storage)
    const order = {
      id: orderId,
      customerId: customerInfo.id || null,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      items: JSON.stringify(items),
      subtotal: amount,
      tax: 0,
      discount: 0,
      total: amount,
      status: "PENDING_VERIFICATION",
      paymentMethod: method,
      paymentStatus: "PENDING",
      notes: `Manual transfer via ${bankAccount?.bank || method}`,
      metadata: JSON.stringify({
        type: "MANUAL_TRANSFER",
        bankAccount,
        proofFilePath,
        customerInfo,
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in memory
    manualPayments.set(orderId, order);

    // Log payment for debugging
    console.log("Manual payment created:", {
      orderId,
      customerName: customerInfo.name,
      amount,
      method,
      itemCount: items.length,
    });

    // Create notification for admin (mock)
    console.log("Admin notification created for manual payment:", orderId);

    return NextResponse.json({
      success: true,
      message:
        "Pembayaran manual berhasil disubmit. Menunggu verifikasi admin.",
      data: {
        orderId,
        status: "PENDING_VERIFICATION",
        amount,
        paymentMethod: method,
        proofFilePath,
        estimatedVerification: "1x24 jam",
      },
    });
  } catch (error) {
    console.error("Error processing manual payment:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses pembayaran manual" },
      { status: 500 },
    );
  }
}

// GET /api/payment/manual - Get manual payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID diperlukan" },
        { status: 400 },
      );
    }

    const order = manualPayments.get(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    const metadata = order.metadata ? JSON.parse(order.metadata) : {};

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        amount: order.total,
        paymentMethod: order.paymentMethod,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        proofFilePath: metadata.proofFilePath,
        bankAccount: metadata.bankAccount,
        createdAt: order.createdAt,
        verifiedAt: order.paidAt,
        notes: order.notes,
      },
    });
  } catch (error) {
    console.error("Error getting manual payment status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil status pembayaran" },
      { status: 500 },
    );
  }
}

// PUT /api/payment/manual - Verify manual payment (Admin only)
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

    // Get order from memory
    const order = manualPayments.get(orderId);

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

    const updatedOrder = {
      ...order,
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
      updatedAt: new Date(),
    };

    // Update in memory
    manualPayments.set(orderId, updatedOrder);

    // Log verification
    console.log(
      `Payment ${orderId} ${action === "APPROVE" ? "approved" : "rejected"} by admin ${adminId}`,
    );

    // Create notification for customer (mock)
    console.log(`Customer notification sent for order ${orderId}: ${action}`);

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
    console.error("Error verifying manual payment:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memverifikasi pembayaran" },
      { status: 500 },
    );
  }
}

// Helper functions (commented out - database dependent)
/*
async function createSPPPaymentRecord(item: any, order: any, paymentId: string) {
  try {
    // Find the santri
    const santri = await prisma.santri.findFirst({
      where: { id: item.metadata?.studentId || item.itemId },
    });

    if (!santri) {
      console.error("Santri not found for SPP payment:", item.itemId);
      return;
    }

    // Find or create SPP record
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    let sppRecord = await prisma.sPPRecord.findFirst({
      where: {
        santriId: santri.id,
        month,
        year,
      },
    });

    if (!sppRecord) {
      // Get default SPP setting
      const sppSetting = await prisma.sPPSetting.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      if (sppSetting) {
        sppRecord = await prisma.sPPRecord.create({
          data: {
            santriId: santri.id,
            sppSettingId: sppSetting.id,
            month,
            year,
            amount: item.price,
            dueDate: new Date(year, month, 10), // Due on 10th of the month
            status: "PENDING",
          },
        });
      }
    }

    if (sppRecord) {
      // Update SPP record status to pending verification
      await prisma.sPPRecord.update({
        where: { id: sppRecord.id },
        data: {
          status: "PENDING_VERIFICATION",
          paymentMethod: "MANUAL_TRANSFER",
          notes: `Manual transfer - Order: ${order.id}`,
        },
      });
    }

  } catch (error) {
    console.error("Error creating SPP payment record:", error);
  }
}

async function createDonationRecord(item: any, order: any, paymentId: string) {
  try {
    await prisma.donation.create({
      data: {
        amount: item.price,
        donorName: order.customerName,
        donorEmail: order.customerEmail,
        donorPhone: order.customerPhone,
        purpose: item.name,
        message: item.description,
        status: "PENDING_VERIFICATION",
        paymentMethod: "MANUAL_TRANSFER",
        reference: order.id,
        categoryId: item.metadata?.categoryId,
      },
    });

  } catch (error) {
    console.error("Error creating donation record:", error);
  }
}

async function createAdminNotification(orderId: string, amount: number, customerName: string, method: string) {
  try {
    // Get admin users
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Pembayaran Manual Baru",
          message: `${customerName} telah melakukan pembayaran manual sebesar ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount)} via ${method}. Silakan verifikasi pembayaran.`,
          type: "PAYMENT_VERIFICATION",
          data: JSON.stringify({ orderId, amount, customerName, method }),
        },
      });
    }

  } catch (error) {
    console.error("Error creating admin notification:", error);
  }
}

async function createCustomerNotification(orderId: string, action: string, customerEmail: string) {
  try {
    // This would typically send an email notification
    console.log(`Sending ${action} notification for order ${orderId} to ${customerEmail}`);
    
    // You can implement email sending here using your email service
    
  } catch (error) {
    console.error("Error creating customer notification:", error);
  }
}

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
          createdById: "system", // You might want to use the admin ID who approved
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
*/
