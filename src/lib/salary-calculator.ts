import { prisma } from "@/lib/prisma";

export interface EarningCalculation {
  amount: number;
  calculationType: "PER_SESSION" | "PER_HOUR";
  sessionDuration?: number;
  rate: number;
}

/**
 * Calculate earning amount based on attendance and salary rate
 */
export async function calculateEarningFromAttendance(
  attendanceId: string
): Promise<EarningCalculation | null> {
  try {
    // Get attendance record
    const attendance = await prisma.musyrifAttendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      console.error(`Attendance not found: ${attendanceId}`);
      return null;
    }

    // Get musyrif record from userId
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: attendance.musyrifId, // attendance.musyrifId is actually userId
        status: "ACTIVE",
      },
      include: {
        salaryRates: {
          where: {
            isActive: true,
          },
          orderBy: {
            effectiveDate: "desc",
          },
          take: 1,
        },
      },
    });

    if (!musyrifRecord || !musyrifRecord.salaryRates[0]) {
      console.error(`No active salary rate found for musyrif with userId: ${attendance.musyrifId}`);
      return null;
    }

    const salaryRate = musyrifRecord.salaryRates[0];

    // Calculate session duration and amount
    let sessionDuration = 0;
    let amount = 0;
    let calculationType: "PER_SESSION" | "PER_HOUR" = "PER_SESSION";

    if (attendance.checkInTime && attendance.checkOutTime) {
      // Calculate duration in minutes
      sessionDuration = Math.floor(
        (new Date(attendance.checkOutTime).getTime() - new Date(attendance.checkInTime).getTime()) / (1000 * 60)
      );
      
      // Use hourly rate if session is longer than 2 hours (120 minutes)
      if (sessionDuration > 120) {
        calculationType = "PER_HOUR";
        const hours = sessionDuration / 60;
        amount = hours * Number(salaryRate.ratePerHour);
      } else {
        calculationType = "PER_SESSION";
        amount = Number(salaryRate.ratePerSession);
      }
    } else {
      // Default to per session if no check-in/out time
      calculationType = "PER_SESSION";
      amount = Number(salaryRate.ratePerSession);
    }

    return {
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      calculationType,
      sessionDuration: sessionDuration || undefined,
      rate: Number(calculationType === "PER_HOUR" ? salaryRate.ratePerHour : salaryRate.ratePerSession),
    };

  } catch (error) {
    console.error("Error calculating earning:", error);
    return null;
  }
}

/**
 * Auto-create earning record when attendance is approved
 */
export async function autoCreateEarningFromAttendance(
  attendanceId: string,
  approvedBy: string
): Promise<string | null> {
  try {
    // Check if earning already exists
    const existingEarning = await prisma.musyrifEarning.findFirst({
      where: {
        attendanceId: attendanceId,
      },
    });

    if (existingEarning) {
      console.log(`Earning already exists for attendance: ${attendanceId}`);
      return existingEarning.id;
    }

    // Calculate earning
    const calculation = await calculateEarningFromAttendance(attendanceId);
    
    if (!calculation) {
      console.error(`Failed to calculate earning for attendance: ${attendanceId}`);
      return null;
    }

    // Get attendance to get musyrif info
    const attendance = await prisma.musyrifAttendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      console.error(`Attendance not found: ${attendanceId}`);
      return null;
    }

    // Get musyrif record
    const musyrifRecord = await prisma.musyrif.findFirst({
      where: {
        userId: attendance.musyrifId,
        status: "ACTIVE",
      },
    });

    if (!musyrifRecord) {
      console.error(`Musyrif record not found for userId: ${attendance.musyrifId}`);
      return null;
    }

    // Create earning record
    const earning = await prisma.musyrifEarning.create({
      data: {
        musyrifId: musyrifRecord.id,
        attendanceId: attendanceId,
        amount: calculation.amount,
        calculationType: calculation.calculationType,
        sessionDuration: calculation.sessionDuration,
        rate: calculation.rate,
        status: "PENDING", // Will need admin approval
        notes: `Auto-calculated from attendance on ${attendance.date.toDateString()}`,
      },
    });

    console.log(`✅ Auto-created earning: ${earning.id} for attendance: ${attendanceId}`);
    return earning.id;

  } catch (error) {
    console.error("Error auto-creating earning:", error);
    return null;
  }
}

/**
 * Approve earning and update wallet balance
 */
export async function approveEarningAndUpdateWallet(
  earningId: string,
  approvedBy: string,
  notes?: string
): Promise<boolean> {
  try {
    // Get earning record
    const earning = await prisma.musyrifEarning.findUnique({
      where: { id: earningId },
    });

    if (!earning) {
      console.error(`Earning not found: ${earningId}`);
      return false;
    }

    if (earning.status !== "PENDING") {
      console.error(`Earning ${earningId} is not pending`);
      return false;
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update earning status
      await tx.musyrifEarning.update({
        where: { id: earningId },
        data: {
          status: "APPROVED",
          approvedBy: approvedBy,
          approvedAt: new Date(),
          notes: notes || null,
        },
      });

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
    });

    console.log(`✅ Approved earning ${earningId} and updated wallet for musyrif ${earning.musyrifId}`);
    return true;

  } catch (error) {
    console.error("Error approving earning:", error);
    return false;
  }
}

/**
 * Get pending earnings count for admin dashboard
 */
export async function getPendingEarningsCount(): Promise<number> {
  try {
    const count = await prisma.musyrifEarning.count({
      where: {
        status: "PENDING",
      },
    });

    return count;
  } catch (error) {
    console.error("Error getting pending earnings count:", error);
    return 0;
  }
}

/**
 * Get musyrif wallet summary
 */
export async function getMusyrifWalletSummary(musyrifId: string) {
  try {
    const wallet = await prisma.musyrifWallet.findUnique({
      where: { musyrifId },
      include: {
        earnings: {
          where: {
            status: "APPROVED",
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
      return {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        recentEarnings: [],
        pendingWithdrawals: [],
      };
    }

    return {
      balance: Number(wallet.balance),
      totalEarned: Number(wallet.totalEarned),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      recentEarnings: wallet.earnings,
      pendingWithdrawals: wallet.withdrawals,
    };
  } catch (error) {
    console.error("Error getting wallet summary:", error);
    return null;
  }
}
