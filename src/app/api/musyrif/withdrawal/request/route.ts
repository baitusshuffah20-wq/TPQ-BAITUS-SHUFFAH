import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Only allow MUSYRIF role
    if (session.user.role !== "MUSYRIF") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only musyrif can request withdrawal." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, bankName, accountNumber, accountHolder, notes } = body;

    // Validate required fields
    if (!amount || !bankName || !accountNumber || !accountHolder) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount
    if (amount < 50000) {
      return NextResponse.json(
        { success: false, message: "Minimum withdrawal amount is Rp 50.000" },
        { status: 400 }
      );
    }

    console.log(`🔌 Processing withdrawal request for user: ${session.user.id}`);

    // Get musyrif record
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        wallet: true,
      },
    });

    if (!musyrifRecord) {
      return NextResponse.json(
        { success: false, message: "Musyrif record not found" },
        { status: 404 }
      );
    }

    // Get or create wallet
    let wallet = musyrifRecord.wallet;
    if (!wallet) {
      wallet = await prisma.musyrifWallet.create({
        data: {
          musyrifId: musyrifRecord.id,
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
      });
    }

    // Check if balance is sufficient
    if (Number(wallet.balance) < amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Insufficient balance. Available: Rp ${Number(wallet.balance).toLocaleString("id-ID")}` 
        },
        { status: 400 }
      );
    }

    // Check for pending withdrawals
    const pendingWithdrawal = await prisma.musyrifWithdrawal.findFirst({
      where: {
        musyrifId: musyrifRecord.id,
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
    });

    if (pendingWithdrawal) {
      return NextResponse.json(
        { 
          success: false, 
          message: "You have a pending withdrawal request. Please wait for it to be processed." 
        },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await prisma.musyrifWithdrawal.create({
      data: {
        musyrifId: musyrifRecord.id,
        amount: amount,
        bankAccount: accountNumber.trim(),
        bankName: bankName.trim(),
        accountHolder: accountHolder.trim(),
        status: "PENDING",
        notes: notes?.trim() || null,
      },
    });

    console.log(`✅ Withdrawal request created: ${withdrawal.id} - Amount: Rp ${amount.toLocaleString("id-ID")}`);

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: {
        id: withdrawal.id,
        amount: Number(withdrawal.amount),
        bankName: withdrawal.bankName,
        accountHolder: withdrawal.accountHolder,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt,
      },
    });

  } catch (error) {
    console.error("❌ Error processing withdrawal request:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat memproses permintaan penarikan",
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

    // Only allow MUSYRIF role
    if (session.user.role !== "MUSYRIF") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only musyrif can view withdrawal history." },
        { status: 403 }
      );
    }

    console.log(`🔌 Fetching withdrawal history for user: ${session.user.id}`);

    // Get musyrif record
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (!musyrifRecord) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get withdrawal history
    const withdrawals = await prisma.musyrifWithdrawal.findMany({
      where: {
        musyrifId: musyrifRecord.id,
      },
      orderBy: {
        requestedAt: "desc",
      },
      take: 20,
      include: {
        approver: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      id: withdrawal.id,
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
    console.error("❌ Error fetching withdrawal history:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil riwayat penarikan",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
