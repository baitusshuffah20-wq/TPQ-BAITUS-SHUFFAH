import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyEarningApproved, notifyEarningRejected } from "@/lib/salary-notifications";

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
        { success: false, message: "Access denied. Only admin can approve earnings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { earningId, action, notes } = body;

    if (!earningId || !action) {
      return NextResponse.json(
        { success: false, message: "Earning ID and action are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    console.log(`🔌 ${action} earning: ${earningId}`);

    // Get earning record
    const earning = await prisma.musyrifEarning.findUnique({
      where: { id: earningId },
      include: {
        musyrif: {
          include: {
            user: true,
          },
        },
        attendance: true,
      },
    });

    if (!earning) {
      return NextResponse.json(
        { success: false, message: "Earning record not found" },
        { status: 404 }
      );
    }

    if (earning.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "Earning has already been processed" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update earning status
      const updatedEarning = await tx.musyrifEarning.update({
        where: { id: earningId },
        data: {
          status: action as "APPROVED" | "REJECTED",
          approvedBy: session.user.id,
          approvedAt: new Date(),
          notes: notes || null,
        },
      });

      // If approved, update wallet balance
      if (action === "APPROVED") {
        // Get or create wallet
        let wallet = await tx.musyrifWallet.findUnique({
          where: { musyrifId: earning.musyrifId },
        });

        if (!wallet) {
          wallet = await tx.musyrifWallet.create({
            data: {
              musyrifId: earning.musyrifId,
              balance: 0,
              totalEarned: 0,
              totalWithdrawn: 0,
            },
          });
        }

        // Update wallet balance
        await tx.musyrifWallet.update({
          where: { musyrifId: earning.musyrifId },
          data: {
            balance: {
              increment: earning.amount,
            },
            totalEarned: {
              increment: earning.amount,
            },
          },
        });

        console.log(`✅ Wallet updated for musyrif ${earning.musyrifId} - Added: ${earning.amount}`);
      }

      return updatedEarning;
    });

    console.log(`✅ Earning ${action.toLowerCase()}: ${result.id}`);

    // Send notification to musyrif
    if (action === "APPROVED" && earning.musyrif.user && earning.attendance) {
      await notifyEarningApproved(
        earning.musyrif.user.id,
        Number(earning.amount),
        earning.attendance.date,
        earning.id
      );
    } else if (action === "REJECTED" && earning.musyrif.user && earning.attendance) {
      await notifyEarningRejected(
        earning.musyrif.user.id,
        Number(earning.amount),
        earning.attendance.date,
        earning.id,
        rejectionReason
      );
    }

    return NextResponse.json({
      success: true,
      message: `Earning berhasil ${action.toLowerCase()}`,
      data: {
        id: result.id,
        status: result.status,
        amount: Number(result.amount),
        approvedBy: result.approvedBy,
        approvedAt: result.approvedAt,
      },
    });

  } catch (error) {
    console.error("❌ Error processing earning:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat memproses earning",
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
        { success: false, message: "Access denied. Only admin can view earnings." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const limit = parseInt(searchParams.get("limit") || "20");

    console.log(`🔌 Fetching earnings with status: ${status}`);

    // Get earnings with musyrif and attendance info
    const earnings = await prisma.musyrifEarning.findMany({
      where: {
        status: status as "PENDING" | "APPROVED" | "REJECTED",
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
          },
        },
        attendance: {
          select: {
            date: true,
            sessionType: true,
            checkInTime: true,
            checkOutTime: true,
          },
        },
        approver: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const formattedEarnings = earnings.map(earning => ({
      id: earning.id,
      musyrifId: earning.musyrifId,
      musyrifName: earning.musyrif.name,
      amount: Number(earning.amount),
      calculationType: earning.calculationType,
      sessionDuration: earning.sessionDuration,
      rate: Number(earning.rate),
      status: earning.status,
      attendanceDate: earning.attendance.date,
      sessionType: earning.attendance.sessionType,
      checkInTime: earning.attendance.checkInTime,
      checkOutTime: earning.attendance.checkOutTime,
      approvedBy: earning.approver?.name || null,
      approvedAt: earning.approvedAt,
      notes: earning.notes,
      createdAt: earning.createdAt,
    }));

    console.log(`✅ Found ${formattedEarnings.length} earnings`);

    return NextResponse.json({
      success: true,
      data: formattedEarnings,
    });

  } catch (error) {
    console.error("❌ Error fetching earnings:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil data earnings",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
