import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification-service';

const prisma = new PrismaClient();

// Trigger Types
export const TriggerType = {
  PAYMENT_DUE: 'PAYMENT_DUE',
  PAYMENT_OVERDUE: 'PAYMENT_OVERDUE',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  ATTENDANCE_ABSENT: 'ATTENDANCE_ABSENT',
  HAFALAN_MILESTONE: 'HAFALAN_MILESTONE',
  MONTHLY_REPORT: 'MONTHLY_REPORT',
  BIRTHDAY_REMINDER: 'BIRTHDAY_REMINDER',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  LOW_BALANCE: 'LOW_BALANCE',
  NEW_ANNOUNCEMENT: 'NEW_ANNOUNCEMENT'
} as const;

// Trigger Conditions
export const TriggerCondition = {
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  CONTAINS: 'CONTAINS',
  DATE_BEFORE: 'DATE_BEFORE',
  DATE_AFTER: 'DATE_AFTER',
  DATE_EQUALS: 'DATE_EQUALS'
} as const;

interface TriggerRule {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  schedule?: {
    frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
  };
}

interface TriggerCondition {
  field: string;
  operator: string;
  value: any;
  dataType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN';
}

interface TriggerAction {
  type: 'SEND_NOTIFICATION' | 'UPDATE_STATUS' | 'CREATE_TASK' | 'SEND_EMAIL' | 'SEND_WHATSAPP';
  config: {
    channels?: string[];
    template?: string;
    recipients?: string[];
    priority?: string;
    data?: Record<string, any>;
  };
}

export class NotificationTriggerService {
  
  // Payment Due Reminder (3 days before due date)
  static async checkPaymentDueReminders() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const duePayments = await prisma.transaction.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: threeDaysFromNow
          },
          // Don't send reminder if already sent today
          NOT: {
            notifications: {
              some: {
                type: 'PAYMENT_REMINDER',
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            }
          }
        },
        include: {
          student: {
            include: {
              parent: true
            }
          }
        }
      });

      for (const payment of duePayments) {
        if (payment.student?.parent) {
          await NotificationService.createNotification({
            type: 'PAYMENT_REMINDER',
            title: 'Pengingat Pembayaran SPP',
            message: `Pembayaran SPP untuk ${payment.student.name} akan jatuh tempo pada ${payment.dueDate?.toLocaleDateString('id-ID')}. Jumlah: ${this.formatCurrency(payment.amount)}`,
            priority: 'HIGH',
            channels: ['EMAIL', 'WHATSAPP'],
            recipientId: payment.student.parent.id,
            data: {
              studentName: payment.student.name,
              amount: payment.amount,
              dueDate: payment.dueDate,
              paymentId: payment.id
            }
          });
        }
      }

      console.log(`Sent ${duePayments.length} payment due reminders`);
      return duePayments.length;
    } catch (error) {
      console.error('Error checking payment due reminders:', error);
      throw error;
    }
  }

  // Payment Overdue Notification (1 day after due date)
  static async checkPaymentOverdueNotifications() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const overduePayments = await prisma.transaction.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: new Date()
          },
          // Don't send overdue notice if already sent today
          NOT: {
            notifications: {
              some: {
                type: 'PAYMENT_OVERDUE',
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            }
          }
        },
        include: {
          student: {
            include: {
              parent: true
            }
          }
        }
      });

      for (const payment of overduePayments) {
        if (payment.student?.parent) {
          const daysOverdue = Math.floor((new Date().getTime() - (payment.dueDate?.getTime() || 0)) / (1000 * 60 * 60 * 24));
          
          await NotificationService.createNotification({
            type: 'PAYMENT_OVERDUE',
            title: 'Pembayaran SPP Terlambat',
            message: `Pembayaran SPP untuk ${payment.student.name} telah terlambat ${daysOverdue} hari. Mohon segera melakukan pembayaran. Jumlah: ${this.formatCurrency(payment.amount)}`,
            priority: 'URGENT',
            channels: ['EMAIL', 'WHATSAPP'],
            recipientId: payment.student.parent.id,
            data: {
              studentName: payment.student.name,
              amount: payment.amount,
              dueDate: payment.dueDate,
              daysOverdue,
              paymentId: payment.id
            }
          });
        }
      }

      console.log(`Sent ${overduePayments.length} payment overdue notifications`);
      return overduePayments.length;
    } catch (error) {
      console.error('Error checking payment overdue notifications:', error);
      throw error;
    }
  }

  // Payment Confirmation (when payment is received)
  static async sendPaymentConfirmation(paymentId: string) {
    try {
      const payment = await prisma.transaction.findUnique({
        where: { id: paymentId },
        include: {
          student: {
            include: {
              parent: true
            }
          }
        }
      });

      if (payment && payment.student?.parent) {
        await NotificationService.createNotification({
          type: 'PAYMENT_CONFIRMATION',
          title: 'Konfirmasi Pembayaran SPP',
          message: `Pembayaran SPP untuk ${payment.student.name} sebesar ${this.formatCurrency(payment.amount)} telah diterima. Terima kasih atas pembayarannya.`,
          priority: 'NORMAL',
          channels: ['EMAIL', 'WHATSAPP'],
          recipientId: payment.student.parent.id,
          data: {
            studentName: payment.student.name,
            amount: payment.amount,
            paymentDate: payment.paidAt,
            paymentId: payment.id,
            receiptNumber: payment.receiptNumber
          }
        });
      }
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw error;
    }
  }

  // Attendance Alert (when student is absent)
  static async sendAttendanceAlert(attendanceId: string) {
    try {
      const attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId },
        include: {
          student: {
            include: {
              parent: true
            }
          }
        }
      });

      if (attendance && attendance.student?.parent && attendance.status === 'ABSENT') {
        await NotificationService.createNotification({
          type: 'ATTENDANCE_ALERT',
          title: 'Notifikasi Ketidakhadiran',
          message: `${attendance.student.name} tidak hadir pada kegiatan TPQ hari ini (${attendance.date.toLocaleDateString('id-ID')}). Mohon konfirmasi jika ada keperluan khusus.`,
          priority: 'HIGH',
          channels: ['EMAIL', 'WHATSAPP'],
          recipientId: attendance.student.parent.id,
          data: {
            studentName: attendance.student.name,
            date: attendance.date,
            status: attendance.status,
            notes: attendance.notes
          }
        });
      }
    } catch (error) {
      console.error('Error sending attendance alert:', error);
      throw error;
    }
  }

  // Hafalan Progress Milestone
  static async sendHafalanMilestone(progressId: string) {
    try {
      const progress = await prisma.hafalanProgress.findUnique({
        where: { id: progressId },
        include: {
          student: {
            include: {
              parent: true
            }
          }
        }
      });

      if (progress && progress.student?.parent) {
        // Check if this is a milestone (completed surah, reached certain percentage, etc.)
        const isMilestone = progress.status === 'COMPLETED' || 
                           (progress.percentage && progress.percentage >= 100);

        if (isMilestone) {
          await NotificationService.createNotification({
            type: 'HAFALAN_MILESTONE',
            title: 'Pencapaian Hafalan',
            message: `Alhamdulillah! ${progress.student.name} telah menyelesaikan hafalan ${progress.surah} dengan nilai ${progress.grade}. Semoga Allah mudahkan perjalanan hafalannya.`,
            priority: 'NORMAL',
            channels: ['EMAIL', 'WHATSAPP'],
            recipientId: progress.student.parent.id,
            data: {
              studentName: progress.student.name,
              surah: progress.surah,
              grade: progress.grade,
              percentage: progress.percentage,
              completedAt: progress.updatedAt
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending hafalan milestone:', error);
      throw error;
    }
  }

  // Monthly Report Generation
  static async generateMonthlyReports() {
    try {
      const students = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          isActive: true
        },
        include: {
          parent: true,
          attendances: {
            where: {
              date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
              }
            }
          },
          hafalanProgress: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
              }
            }
          },
          transactions: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
              }
            }
          }
        }
      });

      for (const student of students) {
        if (student.parent) {
          const attendanceRate = this.calculateAttendanceRate(student.attendances);
          const hafalanProgress = this.calculateHafalanProgress(student.hafalanProgress);
          const paymentStatus = this.calculatePaymentStatus(student.transactions);

          await NotificationService.createNotification({
            type: 'MONTHLY_REPORT',
            title: 'Laporan Bulanan',
            message: `Laporan bulanan untuk ${student.name} telah tersedia. Tingkat kehadiran: ${attendanceRate}%, Progress hafalan: ${hafalanProgress.completed} surah selesai.`,
            priority: 'NORMAL',
            channels: ['EMAIL'],
            recipientId: student.parent.id,
            data: {
              studentName: student.name,
              month: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
              attendanceRate,
              hafalanProgress,
              paymentStatus,
              totalAttendances: student.attendances.length
            }
          });
        }
      }

      console.log(`Generated ${students.length} monthly reports`);
      return students.length;
    } catch (error) {
      console.error('Error generating monthly reports:', error);
      throw error;
    }
  }

  // Birthday Reminders
  static async sendBirthdayReminders() {
    try {
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDate = today.getDate();

      const birthdayStudents = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          isActive: true,
          dateOfBirth: {
            not: null
          }
        },
        include: {
          parent: true
        }
      });

      const todayBirthdays = birthdayStudents.filter(student => {
        if (!student.dateOfBirth) return false;
        const birthDate = new Date(student.dateOfBirth);
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDate;
      });

      for (const student of todayBirthdays) {
        if (student.parent) {
          const age = today.getFullYear() - (student.dateOfBirth?.getFullYear() || 0);
          
          await NotificationService.createNotification({
            type: 'BIRTHDAY_REMINDER',
            title: 'Selamat Ulang Tahun',
            message: `Selamat ulang tahun untuk ${student.name} yang berusia ${age} tahun hari ini! Semoga Allah memberikan keberkahan dan kemudahan dalam menghafal Al-Quran.`,
            priority: 'NORMAL',
            channels: ['EMAIL', 'WHATSAPP'],
            recipientId: student.parent.id,
            data: {
              studentName: student.name,
              age,
              birthDate: student.dateOfBirth
            }
          });
        }
      }

      console.log(`Sent ${todayBirthdays.length} birthday reminders`);
      return todayBirthdays.length;
    } catch (error) {
      console.error('Error sending birthday reminders:', error);
      throw error;
    }
  }

  // Run all scheduled triggers
  static async runScheduledTriggers() {
    try {
      console.log('Running scheduled notification triggers...');
      
      const results = await Promise.allSettled([
        this.checkPaymentDueReminders(),
        this.checkPaymentOverdueNotifications(),
        this.sendBirthdayReminders()
      ]);

      // Log results
      results.forEach((result, index) => {
        const triggerNames = ['Payment Due', 'Payment Overdue', 'Birthday Reminders'];
        if (result.status === 'fulfilled') {
          console.log(`${triggerNames[index]}: ${result.value} notifications sent`);
        } else {
          console.error(`${triggerNames[index]} failed:`, result.reason);
        }
      });

      return results;
    } catch (error) {
      console.error('Error running scheduled triggers:', error);
      throw error;
    }
  }

  // Helper methods
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  private static calculateAttendanceRate(attendances: any[]): number {
    if (attendances.length === 0) return 0;
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
    return Math.round((presentCount / attendances.length) * 100);
  }

  private static calculateHafalanProgress(progress: any[]): { completed: number; inProgress: number; total: number } {
    const completed = progress.filter(p => p.status === 'COMPLETED').length;
    const inProgress = progress.filter(p => p.status === 'IN_PROGRESS').length;
    return {
      completed,
      inProgress,
      total: progress.length
    };
  }

  private static calculatePaymentStatus(transactions: any[]): { paid: number; pending: number; overdue: number } {
    const paid = transactions.filter(t => t.status === 'PAID').length;
    const pending = transactions.filter(t => t.status === 'PENDING' && new Date(t.dueDate) >= new Date()).length;
    const overdue = transactions.filter(t => t.status === 'PENDING' && new Date(t.dueDate) < new Date()).length;
    return { paid, pending, overdue };
  }
}
