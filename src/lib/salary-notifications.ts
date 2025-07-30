import { prisma } from "@/lib/prisma";

export interface SalaryNotificationData {
  userId: string;
  title: string;
  message: string;
  type: "EARNING_APPROVED" | "EARNING_REJECTED" | "WITHDRAWAL_APPROVED" | "WITHDRAWAL_REJECTED" | "WITHDRAWAL_COMPLETED" | "SALARY_RATE_UPDATED";
  relatedId?: string;
  metadata?: any;
}

/**
 * Create a new salary-related notification
 */
export async function createSalaryNotification(data: SalaryNotificationData): Promise<string | null> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        relatedId: data.relatedId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        isRead: false,
        createdBy: null, // System-generated notification
      },
    });

    console.log(`✅ Salary notification created: ${notification.id} for user: ${data.userId}`);
    return notification.id;
  } catch (error) {
    console.error("❌ Error creating salary notification:", error);
    return null;
  }
}

/**
 * Notify musyrif when earning is approved
 */
export async function notifyEarningApproved(
  musyrifUserId: string,
  earningAmount: number,
  attendanceDate: Date,
  earningId: string
): Promise<void> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  await createSalaryNotification({
    userId: musyrifUserId,
    title: "Penghasilan Disetujui! 🎉",
    message: `Penghasilan Anda sebesar ${formatCurrency(earningAmount)} untuk sesi tanggal ${formatDate(attendanceDate)} telah disetujui dan ditambahkan ke wallet.`,
    type: "EARNING_APPROVED",
    relatedId: earningId,
    metadata: {
      amount: earningAmount,
      attendanceDate: attendanceDate.toISOString(),
    },
  });
}

/**
 * Notify musyrif when earning is rejected
 */
export async function notifyEarningRejected(
  musyrifUserId: string,
  earningAmount: number,
  attendanceDate: Date,
  earningId: string,
  rejectionReason?: string
): Promise<void> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  await createSalaryNotification({
    userId: musyrifUserId,
    title: "Penghasilan Ditolak ❌",
    message: `Penghasilan Anda sebesar ${formatCurrency(earningAmount)} untuk sesi tanggal ${formatDate(attendanceDate)} ditolak. ${rejectionReason ? `Alasan: ${rejectionReason}` : ''}`,
    type: "EARNING_REJECTED",
    relatedId: earningId,
    metadata: {
      amount: earningAmount,
      attendanceDate: attendanceDate.toISOString(),
      rejectionReason,
    },
  });
}

/**
 * Notify musyrif when withdrawal is approved
 */
export async function notifyWithdrawalApproved(
  musyrifUserId: string,
  withdrawalAmount: number,
  bankName: string,
  withdrawalId: string
): Promise<void> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  await createSalaryNotification({
    userId: musyrifUserId,
    title: "Penarikan Disetujui! ✅",
    message: `Permintaan penarikan Anda sebesar ${formatCurrency(withdrawalAmount)} ke rekening ${bankName} telah disetujui dan sedang diproses.`,
    type: "WITHDRAWAL_APPROVED",
    relatedId: withdrawalId,
    metadata: {
      amount: withdrawalAmount,
      bankName,
    },
  });
}

/**
 * Notify musyrif when withdrawal is rejected
 */
export async function notifyWithdrawalRejected(
  musyrifUserId: string,
  withdrawalAmount: number,
  bankName: string,
  withdrawalId: string,
  rejectionReason: string
): Promise<void> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  await createSalaryNotification({
    userId: musyrifUserId,
    title: "Penarikan Ditolak ❌",
    message: `Permintaan penarikan Anda sebesar ${formatCurrency(withdrawalAmount)} ke rekening ${bankName} ditolak. Alasan: ${rejectionReason}`,
    type: "WITHDRAWAL_REJECTED",
    relatedId: withdrawalId,
    metadata: {
      amount: withdrawalAmount,
      bankName,
      rejectionReason,
    },
  });
}

/**
 * Notify musyrif when withdrawal is completed
 */
export async function notifyWithdrawalCompleted(
  musyrifUserId: string,
  withdrawalAmount: number,
  bankName: string,
  withdrawalId: string
): Promise<void> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  await createSalaryNotification({
    userId: musyrifUserId,
    title: "Penarikan Selesai! 🎉",
    message: `Penarikan Anda sebesar ${formatCurrency(withdrawalAmount)} ke rekening ${bankName} telah berhasil diproses dan saldo wallet telah dikurangi.`,
    type: "WITHDRAWAL_COMPLETED",
    relatedId: withdrawalId,
    metadata: {
      amount: withdrawalAmount,
      bankName,
    },
  });
}

/**
 * Notify musyrif when salary rate is updated
 */
export async function notifySalaryRateUpdated(
  musyrifUserId: string,
  newRatePerSession: number,
  newRatePerHour: number,
  effectiveDate: Date,
  salaryRateId: string
): Promise<void> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  await createSalaryNotification({
    userId: musyrifUserId,
    title: "Salary Rate Diperbarui! 💰",
    message: `Rate gaji Anda telah diperbarui. Per Sesi: ${formatCurrency(newRatePerSession)}, Per Jam: ${formatCurrency(newRatePerHour)}. Berlaku mulai ${formatDate(effectiveDate)}.`,
    type: "SALARY_RATE_UPDATED",
    relatedId: salaryRateId,
    metadata: {
      ratePerSession: newRatePerSession,
      ratePerHour: newRatePerHour,
      effectiveDate: effectiveDate.toISOString(),
    },
  });
}

/**
 * Get salary notifications for a user
 */
export async function getUserSalaryNotifications(
  userId: string,
  limit: number = 10,
  unreadOnly: boolean = false
) {
  try {
    const salaryNotificationTypes = [
      "EARNING_APPROVED",
      "EARNING_REJECTED", 
      "WITHDRAWAL_APPROVED",
      "WITHDRAWAL_REJECTED",
      "WITHDRAWAL_COMPLETED",
      "SALARY_RATE_UPDATED"
    ];

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        type: {
          in: salaryNotificationTypes,
        },
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      relatedId: notification.relatedId,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
    }));
  } catch (error) {
    console.error("❌ Error getting user salary notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markSalaryNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        isRead: true,
        readAt: new Date(),
      },
    });

    console.log(`✅ Salary notification marked as read: ${notificationId}`);
    return true;
  } catch (error) {
    console.error("❌ Error marking salary notification as read:", error);
    return false;
  }
}
