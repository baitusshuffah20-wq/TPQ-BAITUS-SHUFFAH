import { PrismaClient } from '@prisma/client';
import { PaymentGatewayService } from './payment-gateway';
import { NotificationTriggerService } from './notification-triggers';

const prisma = new PrismaClient();

// Subscription Status
export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  TRIAL: 'TRIAL'
} as const;

// Billing Cycle
export const BillingCycle = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY'
} as const;

// Billing Status
export const BillingStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  RETRYING: 'RETRYING'
} as const;

interface CreateSubscriptionData {
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
  metadata?: any;
  createdBy?: string;
}

interface SubscriptionBillingData {
  subscriptionId: string;
  billingDate: Date;
  amount: number;
  dueDate: Date;
  metadata?: any;
}

export class SubscriptionService {
  
  // Create new subscription
  static async createSubscription(data: CreateSubscriptionData) {
    try {
      const startDate = data.startDate || new Date();
      const nextBillingDate = this.calculateNextBillingDate(startDate, data.billingCycle);
      const trialEndDate = data.trialDays ? new Date(startDate.getTime() + (data.trialDays * 24 * 60 * 60 * 1000)) : null;

      const subscription = await prisma.subscription.create({
        data: {
          studentId: data.studentId,
          planType: data.planType,
          amount: data.amount,
          billingCycle: data.billingCycle,
          startDate,
          endDate: data.endDate,
          nextBillingDate,
          paymentMethod: data.paymentMethod,
          gateway: data.gateway,
          autoRenewal: data.autoRenewal ?? true,
          trialEndDate,
          status: trialEndDate ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          createdBy: data.createdBy
        },
        include: {
          student: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Create first billing record (if not in trial)
      if (!trialEndDate) {
        await this.createBillingRecord({
          subscriptionId: subscription.id,
          billingDate: nextBillingDate,
          amount: data.amount,
          dueDate: new Date(nextBillingDate.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days grace period
        });
      }

      // Send subscription confirmation notification
      try {
        await NotificationTriggerService.sendSubscriptionConfirmation(subscription.id);
      } catch (notificationError) {
        console.error('Error sending subscription confirmation:', notificationError);
      }

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Create billing record
  static async createBillingRecord(data: SubscriptionBillingData) {
    try {
      return await prisma.subscriptionBilling.create({
        data: {
          subscriptionId: data.subscriptionId,
          billingDate: data.billingDate,
          amount: data.amount,
          dueDate: data.dueDate,
          status: BillingStatus.PENDING,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
      });
    } catch (error) {
      console.error('Error creating billing record:', error);
      throw error;
    }
  }

  // Process subscription billing
  static async processBilling(billingId: string) {
    try {
      const billing = await prisma.subscriptionBilling.findUnique({
        where: { id: billingId },
        include: {
          subscription: {
            include: {
              student: true
            }
          }
        }
      });

      if (!billing) {
        throw new Error('Billing record not found');
      }

      if (billing.status !== BillingStatus.PENDING) {
        throw new Error('Billing already processed');
      }

      // Update billing status to processing
      await prisma.subscriptionBilling.update({
        where: { id: billingId },
        data: { status: BillingStatus.RETRYING }
      });

      // Create payment request
      const paymentGatewayService = new PaymentGatewayService();
      const orderId = `SUB_${billing.subscriptionId}_${Date.now()}`;

      const paymentRequest = {
        orderId,
        amount: billing.amount,
        currency: 'IDR',
        items: [{
          id: billing.subscription.planType,
          name: `SPP ${billing.subscription.student.name} - ${this.formatBillingPeriod(billing.billingDate, billing.subscription.billingCycle)}`,
          price: billing.amount,
          quantity: 1,
          category: 'subscription'
        }],
        customer: {
          id: billing.subscription.studentId,
          name: billing.subscription.student.name,
          email: billing.subscription.student.email || '',
          phone: billing.subscription.student.phone || ''
        },
        metadata: {
          subscriptionId: billing.subscriptionId,
          billingId: billing.id,
          type: 'subscription_billing'
        },
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Process payment based on gateway
      let paymentResponse;
      const gateway = billing.subscription.gateway || 'MIDTRANS';

      switch (gateway) {
        case 'MIDTRANS':
          paymentResponse = await paymentGatewayService.createMidtransPayment(paymentRequest);
          break;
        case 'XENDIT':
          paymentResponse = await paymentGatewayService.createXenditPayment(paymentRequest);
          break;
        default:
          throw new Error('Unsupported payment gateway');
      }

      if (paymentResponse.success) {
        // Update billing with payment info
        await prisma.subscriptionBilling.update({
          where: { id: billingId },
          data: {
            paymentId: paymentResponse.paymentId,
            orderId,
            status: BillingStatus.PENDING,
            updatedAt: new Date()
          }
        });

        // Send payment reminder notification
        try {
          await NotificationTriggerService.sendSubscriptionPaymentReminder(billingId);
        } catch (notificationError) {
          console.error('Error sending payment reminder:', notificationError);
        }

        return {
          success: true,
          paymentId: paymentResponse.paymentId,
          paymentUrl: paymentResponse.paymentUrl,
          billing
        };
      } else {
        // Mark billing as failed
        await this.markBillingFailed(billingId, paymentResponse.error || 'Payment creation failed');
        throw new Error(paymentResponse.error || 'Payment creation failed');
      }
    } catch (error) {
      console.error('Error processing billing:', error);
      throw error;
    }
  }

  // Mark billing as paid
  static async markBillingPaid(billingId: string, paymentId: string) {
    try {
      const billing = await prisma.subscriptionBilling.update({
        where: { id: billingId },
        data: {
          status: BillingStatus.PAID,
          paidAt: new Date(),
          paymentId,
          updatedAt: new Date()
        },
        include: {
          subscription: true
        }
      });

      // Update subscription next billing date
      const nextBillingDate = this.calculateNextBillingDate(
        billing.billingDate,
        billing.subscription.billingCycle
      );

      await prisma.subscription.update({
        where: { id: billing.subscriptionId },
        data: {
          nextBillingDate,
          status: SubscriptionStatus.ACTIVE,
          updatedAt: new Date()
        }
      });

      // Create next billing record
      await this.createBillingRecord({
        subscriptionId: billing.subscriptionId,
        billingDate: nextBillingDate,
        amount: billing.subscription.amount,
        dueDate: new Date(nextBillingDate.getTime() + (7 * 24 * 60 * 60 * 1000))
      });

      // Create SPP transaction record
      await this.createSPPTransaction(billing);

      // Send payment confirmation
      try {
        await NotificationTriggerService.sendSubscriptionPaymentConfirmation(billingId);
      } catch (notificationError) {
        console.error('Error sending payment confirmation:', notificationError);
      }

      return billing;
    } catch (error) {
      console.error('Error marking billing as paid:', error);
      throw error;
    }
  }

  // Mark billing as failed
  static async markBillingFailed(billingId: string, reason: string) {
    try {
      const billing = await prisma.subscriptionBilling.update({
        where: { id: billingId },
        data: {
          status: BillingStatus.FAILED,
          failureReason: reason,
          retryCount: { increment: 1 },
          nextRetryDate: new Date(Date.now() + (24 * 60 * 60 * 1000)), // Retry in 24 hours
          updatedAt: new Date()
        },
        include: {
          subscription: true
        }
      });

      // If max retries reached, pause subscription
      if (billing.retryCount >= 3) {
        await this.pauseSubscription(billing.subscriptionId, 'Max retry attempts reached');
      }

      return billing;
    } catch (error) {
      console.error('Error marking billing as failed:', error);
      throw error;
    }
  }

  // Pause subscription
  static async pauseSubscription(subscriptionId: string, reason?: string) {
    try {
      return await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.PAUSED,
          metadata: JSON.stringify({ pauseReason: reason, pausedAt: new Date() }),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  }

  // Resume subscription
  static async resumeSubscription(subscriptionId: string) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          updatedAt: new Date()
        }
      });

      // Create billing for current period if needed
      const now = new Date();
      if (subscription.nextBillingDate <= now) {
        await this.createBillingRecord({
          subscriptionId: subscription.id,
          billingDate: now,
          amount: subscription.amount,
          dueDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
        });
      }

      return subscription;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, reason?: string) {
    try {
      // Cancel pending billings
      await prisma.subscriptionBilling.updateMany({
        where: {
          subscriptionId,
          status: BillingStatus.PENDING
        },
        data: {
          status: BillingStatus.CANCELLED,
          updatedAt: new Date()
        }
      });

      // Update subscription status
      return await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELLED,
          metadata: JSON.stringify({ cancelReason: reason, cancelledAt: new Date() }),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Get subscription details
  static async getSubscription(subscriptionId: string) {
    try {
      return await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          student: {
            select: { id: true, name: true, email: true, phone: true }
          },
          billings: {
            orderBy: { billingDate: 'desc' },
            take: 10
          }
        }
      });
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  // Get student subscriptions
  static async getStudentSubscriptions(studentId: string) {
    try {
      return await prisma.subscription.findMany({
        where: { studentId },
        include: {
          billings: {
            where: { status: BillingStatus.PENDING },
            orderBy: { dueDate: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error getting student subscriptions:', error);
      throw error;
    }
  }

  // Process due billings (for cron job)
  static async processDueBillings() {
    try {
      const dueBillings = await prisma.subscriptionBilling.findMany({
        where: {
          status: BillingStatus.PENDING,
          billingDate: {
            lte: new Date()
          }
        },
        include: {
          subscription: {
            where: {
              status: SubscriptionStatus.ACTIVE
            }
          }
        }
      });

      const results = [];
      for (const billing of dueBillings) {
        if (billing.subscription) {
          try {
            const result = await this.processBilling(billing.id);
            results.push({ billingId: billing.id, success: true, result });
          } catch (error) {
            results.push({ 
              billingId: billing.id, 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing due billings:', error);
      throw error;
    }
  }

  // Helper methods
  private static calculateNextBillingDate(currentDate: Date, billingCycle: string): Date {
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

  private static formatBillingPeriod(billingDate: Date, billingCycle: string): string {
    const date = new Date(billingDate);
    
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      case BillingCycle.QUARTERLY:
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        return `Q${quarter} ${date.getFullYear()}`;
      case BillingCycle.YEARLY:
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString('id-ID');
    }
  }

  private static async createSPPTransaction(billing: any) {
    try {
      // Get default account
      let defaultAccount = await prisma.financialAccount.findFirst({
        where: { type: 'CASH', name: 'Kas Utama' }
      });

      if (!defaultAccount) {
        defaultAccount = await prisma.financialAccount.create({
          data: {
            name: 'Kas Utama',
            type: 'CASH',
            balance: 0,
            description: 'Akun kas utama untuk penerimaan'
          }
        });
      }

      // Create transaction record
      await prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: billing.amount,
          description: `SPP Subscription - ${billing.subscription.student.name}`,
          accountId: defaultAccount.id,
          santriId: billing.subscription.studentId,
          status: 'PAID',
          paidAt: billing.paidAt,
          paymentMethod: 'SUBSCRIPTION',
          receiptNumber: `SUB-${Date.now()}`,
          reference: billing.id,
          createdBy: 'system'
        }
      });
    } catch (error) {
      console.error('Error creating SPP transaction:', error);
    }
  }
}
