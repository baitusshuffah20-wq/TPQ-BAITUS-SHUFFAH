import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Only allow MUSYRIF role to access their own wallet
    if (session.user.role !== "MUSYRIF") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only musyrif can access wallet." },
        { status: 403 }
      );
    }

    console.log(`🔌 Fetching wallet for musyrif user ID: ${session.user.id}`);

    // Get musyrif record for this user
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (!musyrifRecord) {
      console.log(`No musyrif record found for user ID: ${session.user.id}`);
      return NextResponse.json({
        success: true,
        message: "Belum ada data musyrif untuk user ini",
        data: {
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          monthlyEarnings: 0,
          recentEarnings: [],
          pendingWithdrawals: [],
        },
      });
    }

    console.log(`✅ Musyrif record found: ${musyrifRecord.id}`);

    // Get or create wallet
    let wallet = await prisma.musyrifWallet.findUnique({
      where: { musyrifId: musyrifRecord.id },
      include: {
        earnings: {
          where: {
            status: "APPROVED",
          },
          include: {
            attendance: {
              select: {
                date: true,
                sessionType: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        withdrawals: {
          where: {
            status: {
              in: ["PENDING", "APPROVED"],
            },
          },
          orderBy: {
            requestedAt: "desc",
          },
          take: 3,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.musyrifWallet.create({
        data: {
          musyrifId: musyrifRecord.id,
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
        include: {
          earnings: {
            where: {
              status: "APPROVED",
            },
            include: {
              attendance: {
                select: {
                  date: true,
                  sessionType: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
          withdrawals: {
            where: {
              status: {
                in: ["PENDING", "APPROVED"],
              },
            },
            orderBy: {
              requestedAt: "desc",
            },
            take: 3,
          },
        },
      });
    }



    // Calculate this month's earnings
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyEarnings = await prisma.musyrifEarning.aggregate({
      where: {
        musyrifId: musyrifRecord.id,
        status: "APPROVED",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    console.log(`✅ Wallet data retrieved for musyrif ${musyrifRecord.id}`);

    return NextResponse.json({
      success: true,
      data: {
        balance: Number(wallet.balance),
        totalEarned: Number(wallet.totalEarned),
        totalWithdrawn: Number(wallet.totalWithdrawn),
        monthlyEarnings: Number(monthlyEarnings._sum.amount || 0),
        recentEarnings: wallet.earnings.map(earning => ({
          id: earning.id,
          amount: Number(earning.amount),
          date: earning.attendance.date,
          sessionType: earning.attendance.sessionType,
          calculationType: earning.calculationType,
          sessionDuration: earning.sessionDuration,
          rate: Number(earning.rate),
          createdAt: earning.createdAt,
        })),
        pendingWithdrawals: wallet.withdrawals.map(withdrawal => ({
          id: withdrawal.id,
          amount: Number(withdrawal.amount),
          bankName: withdrawal.bankName,
          accountHolder: withdrawal.accountHolder,
          status: withdrawal.status,
          requestedAt: withdrawal.requestedAt,
        })),
      },
    });

  } catch (error) {
    console.error("❌ Error fetching wallet:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil data wallet",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
