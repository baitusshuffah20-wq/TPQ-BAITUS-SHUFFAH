import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  notifyWithdrawalApproved,
  notifyWithdrawalRejected,
  notifyWithdrawalCompleted
} from "@/lib/salary-notifications";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can approve withdrawals." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { withdrawalId, action, rejectionReason, notes } = body;

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { success: false, message: "Withdrawal ID and action are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED", "COMPLETED"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action must be APPROVED, REJECTED, or COMPLETED" },
        { status: 400 }
      );
    }

    if (action === "REJECTED" && !rejectionReason) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required when rejecting withdrawal" },
        { status: 400 }
      );
    }

    console.log(`🔌 ${action} withdrawal: ${withdrawalId}`);

    // Get withdrawal record
    const withdrawal = await prisma.musyrifWithdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        musyrif: {
          include: {
            user: true,
          },
        },
        wallet: true,
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, message: "Withdrawal record not found" },
        { status: 404 }
      );
    }

    if (withdrawal.status === "COMPLETED" || withdrawal.status === "REJECTED") {
      return NextResponse.json(
        { success: false, message: "Withdrawal has already been processed" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      let updatedWithdrawal;

      if (action === "APPROVED") {
        // Check if wallet has sufficient balance
        const wallet = await tx.musyrifWallet.findUnique({
          where: { musyrifId: withdrawal.musyrifId },
        });

        if (!wallet || Number(wallet.balance) < Number(withdrawal.amount)) {
          throw new Error("Insufficient wallet balance");
        }

        // Update withdrawal status to APPROVED
        updatedWithdrawal = await tx.musyrifWithdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "APPROVED",
            approvedBy: session.user.id,
            approvedAt: new Date(),
            notes: notes || null,
          },
        });

      } else if (action === "COMPLETED") {
        // Check if withdrawal is approved first
        if (withdrawal.status !== "APPROVED") {
          throw new Error("Withdrawal must be approved before completing");
        }

        // Update withdrawal status to COMPLETED and deduct from wallet
        updatedWithdrawal = await tx.musyrifWithdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            notes: notes || withdrawal.notes,
          },
        });

        // Deduct amount from wallet balance
        await tx.musyrifWallet.update({
          where: { musyrifId: withdrawal.musyrifId },
          data: {
            balance: {
              decrement: withdrawal.amount,
            },
            totalWithdrawn: {
              increment: withdrawal.amount,
            },
          },
        });

        console.log(`✅ Wallet updated for musyrif ${withdrawal.musyrifId} - Deducted: ${withdrawal.amount}`);

      } else if (action === "REJECTED") {
        // Update withdrawal status to REJECTED
        updatedWithdrawal = await tx.musyrifWithdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "REJECTED",
            approvedBy: session.user.id,
            approvedAt: new Date(),
            rejectionReason: rejectionReason,
            notes: notes || null,
          },
        });
      }

      return updatedWithdrawal;
    });

    console.log(`✅ Withdrawal ${action.toLowerCase()}: ${result.id}`);

    // Send notification to musyrif
    if (withdrawal.musyrif.user) {
      if (action === "APPROVED") {
        await notifyWithdrawalApproved(
          withdrawal.musyrif.user.id,
          Number(withdrawal.amount),
          withdrawal.bankName,
          withdrawal.id
        );
      } else if (action === "REJECTED") {
        await notifyWithdrawalRejected(
          withdrawal.musyrif.user.id,
          Number(withdrawal.amount),
          withdrawal.bankName,
          withdrawal.id,
          rejectionReason
        );
      } else if (action === "COMPLETED") {
        await notifyWithdrawalCompleted(
          withdrawal.musyrif.user.id,
          Number(withdrawal.amount),
          withdrawal.bankName,
          withdrawal.id
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal berhasil ${action.toLowerCase()}`,
      data: {
        id: result.id,
        status: result.status,
        amount: Number(result.amount),
        approvedBy: result.approvedBy,
        approvedAt: result.approvedAt,
        completedAt: result.completedAt,
        rejectionReason: result.rejectionReason,
      },
    });

  } catch (error) {
    console.error("❌ Error processing withdrawal:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat memproses withdrawal",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can view withdrawals." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const limit = parseInt(searchParams.get("limit") || "20");

    console.log(`🔌 Fetching withdrawals with status: ${status}`);

    // Get withdrawal records with musyrif info
    const withdrawals = await prisma.musyrifWithdrawal.findMany({
      where: {
        status: status as "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED",
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
      take: limit,
    });

    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      id: withdrawal.id,
      musyrifId: withdrawal.musyrifId,
      musyrifName: withdrawal.musyrif.name,
      amount: Number(withdrawal.amount),
      bankName: withdrawal.bankName,
      bankAccount: withdrawal.bankAccount,
      accountHolder: withdrawal.accountHolder,
      status: withdrawal.status,
      requestedAt: withdrawal.requestedAt,
      approvedBy: withdrawal.approver?.name || null,
      approvedAt: withdrawal.approvedAt,
      completedAt: withdrawal.completedAt,
      rejectionReason: withdrawal.rejectionReason,
      notes: withdrawal.notes,
    }));

    console.log(`✅ Found ${formattedWithdrawals.length} withdrawal records`);

    return NextResponse.json({
      success: true,
      data: formattedWithdrawals,
    });

  } catch (error) {
    console.error("❌ Error fetching withdrawals:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil data withdrawals",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
