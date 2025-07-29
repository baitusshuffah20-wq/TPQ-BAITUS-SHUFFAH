import { prisma } from "@/lib/prisma";

// Subscription Status (for future use when schema is updated)
export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
  TRIAL: "TRIAL",
} as const;

// Billing Cycle (for future use when schema is updated)
export const BillingCycle = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
} as const;

// Billing Status (for future use when schema is updated)
export const BillingStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  RETRYING: "RETRYING",
} as const;

// Current schema-compatible interfaces
interface CreateSubscriptionData {
  email: string;
  name?: string;
  userId?: string;
  isActive?: boolean;
}

// Legacy interfaces for backward compatibility (kept for reference)
// These interfaces are preserved for documentation purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UpdateSubscriptionData {
  email?: string;
  name?: string;
  isActive?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LegacyCreateSubscriptionData {
  studentId: string;
  planType: string;
  amount: number;
  billingCycle: string;
  startDate?: Date;
  endDate?: Date;
  paymentMethod?: string;
  gateway?: string;
  trialDays?: number;
  autoRenewal?: boolean;
  metadata?: Record<string, unknown>;
  createdBy?: string;
}

interface SubscriptionBillingData {
  subscriptionId: string;
  billingDate: Date;
  amount: number;
  dueDate: Date;
  metadata?: Record<string, unknown>;
}

// Mock services for missing dependencies
class MockNotificationTriggerService {
  static async sendSubscriptionNotification(type: string, data: unknown) {
    console.warn(`MockNotificationTriggerService: ${type}`, data);
    return { success: true, message: "Notification service not implemented" };
  }
}

class MockPaymentGatewayService {
  static async createPayment(data: unknown) {
    console.warn("MockPaymentGatewayService: createPayment", data);
    return {
      success: false,
      message: "Payment gateway service not implemented",
    };
  }
}

// Use mock services
const NotificationTriggerService = MockNotificationTriggerService;
// PaymentGatewayService is available but not currently used in the mock implementations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PaymentGatewayService = MockPaymentGatewayService;

export class SubscriptionService {
  // Create new subscription (compatible with current schema)
  static async createSubscription(data: CreateSubscriptionData) {
    try {
      const subscription = await prisma.subscription.create({
        data: {
          email: data.email,
          name: data.name,
          isActive: data.isActive ?? true,
          userId: data.userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Send subscription confirmation notification
      try {
        await NotificationTriggerService.sendSubscriptionNotification(
          "subscription_created",
          { subscriptionId: subscription.id, email: subscription.email },
        );
      } catch (notificationError) {
        console.error(
          "Error sending subscription confirmation:",
          notificationError,
        );
      }

      return subscription;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  // Create billing record (mock implementation - billing not supported in current schema)
  static async createBillingRecord(data: SubscriptionBillingData) {
    console.warn(
      "createBillingRecord: Billing functionality not implemented in current schema",
    );
    return {
      id: `mock-billing-${Date.now()}`,
      subscriptionId: data.subscriptionId,
      billingDate: data.billingDate,
      amount: data.amount,
      dueDate: data.dueDate,
      status: BillingStatus.PENDING,
      metadata: data.metadata,
    };
  }

  // Process subscription billing (mock implementation)
  static async processBilling(billingId: string) {
    console.warn(
      "processBilling: Billing functionality not implemented in current schema",
    );
    return {
      success: false,
      message: "Billing functionality not implemented in current schema",
      billingId,
    };
  }

  // Mark billing as paid (mock implementation)
  static async markBillingPaid(billingId: string, paymentId: string) {
    console.warn(
      "markBillingPaid: Billing functionality not implemented in current schema",
    );
    return {
      id: billingId,
      paymentId,
      status: BillingStatus.PAID,
      paidAt: new Date(),
    };
  }

  // Mark billing as failed (mock implementation)
  static async markBillingFailed(billingId: string, reason: string) {
    console.warn(
      "markBillingFailed: Billing functionality not implemented in current schema",
    );
    return {
      id: billingId,
      status: BillingStatus.FAILED,
      failureReason: reason,
      retryCount: 1,
    };
  }

  // Pause subscription (mock implementation - status field not available)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async pauseSubscription(subscriptionId: string, _reason?: string) {
    console.warn(
      "pauseSubscription: Status field not available in current schema",
    );
    // Update isActive instead of status
    try {
      return await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      console.error("Error pausing subscription:", error);
      throw error;
    }
  }

  // Resume subscription (mock implementation - status field not available)
  static async resumeSubscription(subscriptionId: string) {
    console.warn(
      "resumeSubscription: Status field not available in current schema",
    );
    // Update isActive instead of status
    try {
      return await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          isActive: true,
        },
      });
    } catch (error) {
      console.error("Error resuming subscription:", error);
      throw error;
    }
  }

  // Cancel subscription (mock implementation - status field not available)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async cancelSubscription(subscriptionId: string, _reason?: string) {
    console.warn(
      "cancelSubscription: Status field not available in current schema",
    );
    // Update isActive instead of status
    try {
      return await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  }

  // Get subscription details (compatible with current schema)
  static async getSubscription(subscriptionId: string) {
    try {
      return await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      console.error("Error getting subscription:", error);
      throw error;
    }
  }

  // Get user subscriptions (compatible with current schema)
  static async getUserSubscriptions(userId: string) {
    try {
      return await prisma.subscription.findMany({
        where: { userId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error getting user subscriptions:", error);
      throw error;
    }
  }

  // Legacy function for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getStudentSubscriptions(_studentId: string) {
    console.warn(
      "getStudentSubscriptions: Use getUserSubscriptions instead. Student relations not available in current schema",
    );
    return [];
  }

  // Process due billings (mock implementation)
  static async processDueBillings() {
    console.warn(
      "processDueBillings: Billing functionality not implemented in current schema",
    );
    return [];
  }

  // Helper methods for future billing functionality
  // These methods will be used when billing functionality is implemented

  /**
   * Calculate next billing date based on billing cycle
   * @param currentDate Current billing date
   * @param billingCycle Billing cycle (MONTHLY, QUARTERLY, YEARLY)
   * @returns Next billing date
   */
  static calculateNextBillingDate(
    currentDate: Date,
    billingCycle: string,
  ): Date {
    const date = new Date(currentDate);

    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        date.setMonth(date.getMonth() + 3);
        break;
      case BillingCycle.YEARLY:
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }

    return date;
  }

  /**
   * Format billing period for display
   * @param billingDate Billing date
   * @param billingCycle Billing cycle
   * @returns Formatted period string
   */
  static formatBillingPeriod(billingDate: Date, billingCycle: string): string {
    const date = new Date(billingDate);

    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        return date.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
      case BillingCycle.QUARTERLY: {
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        return `Q${quarter} ${date.getFullYear()}`;
      }
      case BillingCycle.YEARLY:
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString("id-ID");
    }
  }

  /**
   * Create SPP transaction record (experimental - may not work with current schema)
   * @param billing Billing data
   */
  static async createSPPTransaction(billing: Record<string, unknown>) {
    console.warn(
      "createSPPTransaction: Transaction functionality may not be fully compatible with current schema",
    );
    try {
      // Check if FinancialAccount model exists and has the expected fields
      const accountExists = await prisma.financialAccount.findFirst({
        where: { name: "Kas Utama" },
      });

      if (!accountExists) {
        console.warn("FinancialAccount model or expected fields not found");
        return;
      }

      // Create transaction record with available fields
      await prisma.transaction.create({
        data: {
          transactionType: "INCOME",
          amount: Number(billing.amount) || 0,
          description: `SPP Subscription Payment`,
          date: new Date(),
          accountId: accountExists.id,
          status: "COMPLETED",
          reference: String(billing.id || "unknown"),
          createdById: "system", // This should be a valid user ID
        },
      });
    } catch (error) {
      console.error("Error creating SPP transaction:", error);
    }
  }
}
