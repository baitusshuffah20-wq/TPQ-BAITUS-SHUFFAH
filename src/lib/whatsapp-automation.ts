import { whatsappService } from './whatsapp';
import { prisma } from './prisma';

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'hafalan_completed' | 'attendance_absent' | 'payment_due' | 'monthly_report';
  enabled: boolean;
  conditions: any;
  template: string;
  recipients: 'parents' | 'students' | 'teachers' | 'all';
}

class WhatsAppAutomation {
  private rules: AutomationRule[] = [
    {
      id: 'hafalan_completed',
      name: 'Hafalan Selesai',
      trigger: 'hafalan_completed',
      enabled: true,
      conditions: { minGrade: 80 },
      template: 'hafalan_progress',
      recipients: 'parents'
    },
    {
      id: 'attendance_absent',
      name: 'Absensi Alpha',
      trigger: 'attendance_absent',
      enabled: true,
      conditions: { consecutiveDays: 2 },
      template: 'attendance_notification',
      recipients: 'parents'
    },
    {
      id: 'payment_due',
      name: 'Pengingat Pembayaran',
      trigger: 'payment_due',
      enabled: true,
      conditions: { daysBefore: 3 },
      template: 'payment_reminder',
      recipients: 'parents'
    },
    {
      id: 'monthly_report',
      name: 'Laporan Bulanan',
      trigger: 'monthly_report',
      enabled: true,
      conditions: { dayOfMonth: 1 },
      template: 'monthly_report',
      recipients: 'parents'
    }
  ];

  /**
   * Process hafalan completion notification
   */
  async processHafalanCompleted(hafalanId: string, studentId: string, grade: number) {
    const rule = this.rules.find(r => r.trigger === 'hafalan_completed');
    if (!rule || !rule.enabled) return;

    // Check conditions
    if (grade < rule.conditions.minGrade) return;

    try {
      // Get student and hafalan data
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          parent: true
        }
      });

      const hafalan = await prisma.hafalan.findUnique({
        where: { id: hafalanId },
        include: {
          surah: true
        }
      });

      if (!student || !hafalan || !student.parent?.phone) return;

      // Send WhatsApp notification
      const result = await whatsappService.sendHafalanProgressToParent(
        student.parent.phone,
        student.name,
        hafalan.surah.name,
        100, // completed
        grade
      );

      if (result.success) {
        console.log(`Hafalan completion notification sent to ${student.parent.phone}`);
      }
    } catch (error) {
      console.error('Error processing hafalan completion notification:', error);
    }
  }

  /**
   * Process attendance absence notification
   */
  async processAttendanceAbsent(studentId: string, date: string) {
    const rule = this.rules.find(r => r.trigger === 'attendance_absent');
    if (!rule || !rule.enabled) return;

    try {
      // Check consecutive absent days
      const recentAttendance = await prisma.attendance.findMany({
        where: {
          santriId: studentId,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: { date: 'desc' }
      });

      const consecutiveAbsent = this.countConsecutiveAbsent(recentAttendance);
      
      if (consecutiveAbsent < rule.conditions.consecutiveDays) return;

      // Get student data
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          parent: true
        }
      });

      if (!student || !student.parent?.phone) return;

      // Send WhatsApp notification
      const result = await whatsappService.sendAttendanceNotification(
        student.parent.phone,
        student.name,
        'ALPHA',
        date
      );

      if (result.success) {
        console.log(`Attendance absence notification sent to ${student.parent.phone}`);
      }
    } catch (error) {
      console.error('Error processing attendance absence notification:', error);
    }
  }

  /**
   * Process payment due notification
   */
  async processPaymentDue() {
    const rule = this.rules.find(r => r.trigger === 'payment_due');
    if (!rule || !rule.enabled) return;

    try {
      // Get payments due in the next few days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + rule.conditions.daysBefore);

      const duePayments = await prisma.payment.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lte: dueDate
          }
        },
        include: {
          santri: {
            include: {
              wali: true
            }
          }
        }
      });

      for (const payment of duePayments) {
        if (!payment.santri.wali?.phone) continue;

        const result = await whatsappService.sendPaymentReminder(
          payment.santri.wali.phone,
          payment.santri.name,
          payment.type,
          payment.amount,
          payment.dueDate.toLocaleDateString('id-ID')
        );

        if (result.success) {
          console.log(`Payment reminder sent to ${payment.santri.wali.phone}`);
        }

        // Add delay to avoid rate limiting
        await this.delay(1000);
      }
    } catch (error) {
      console.error('Error processing payment due notifications:', error);
    }
  }

  /**
   * Process monthly report
   */
  async processMonthlyReport() {
    const rule = this.rules.find(r => r.trigger === 'monthly_report');
    if (!rule || !rule.enabled) return;

    try {
      // Get all active students
      const students = await prisma.user.findMany({
        where: {
          role: 'SANTRI',
          isActive: true
        },
        include: {
          parent: true,
          santriProfile: {
            include: {
              hafalan: true,
              attendance: {
                where: {
                  date: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  }
                }
              }
            }
          }
        }
      });

      for (const student of students) {
        if (!student.parent?.phone || !student.santriProfile) continue;

        // Calculate monthly statistics
        const stats = this.calculateMonthlyStats(student.santriProfile);

        const result = await whatsappService.sendMonthlyReport(
          student.parent.phone,
          student.name,
          stats
        );

        if (result.success) {
          console.log(`Monthly report sent to ${student.parent.phone}`);
        }

        // Add delay to avoid rate limiting
        await this.delay(2000);
      }
    } catch (error) {
      console.error('Error processing monthly reports:', error);
    }
  }

  /**
   * Count consecutive absent days
   */
  private countConsecutiveAbsent(attendance: any[]): number {
    let count = 0;
    for (const record of attendance) {
      if (record.status === 'ALPHA') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Calculate monthly statistics for a student
   */
  private calculateMonthlyStats(santriProfile: any) {
    const attendance = santriProfile.attendance || [];
    const hafalan = santriProfile.hafalan || [];

    const totalAttendance = attendance.length;
    const presentCount = attendance.filter((a: any) => a.status === 'HADIR').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const completedHafalan = hafalan.filter((h: any) => h.status === 'COMPLETED');
    const averageGrade = completedHafalan.length > 0 
      ? Math.round(completedHafalan.reduce((sum: number, h: any) => sum + (h.nilai || 0), 0) / completedHafalan.length)
      : 0;

    const currentHafalan = hafalan.find((h: any) => h.status === 'PROGRESS');
    const hafalanProgress = currentHafalan?.progress || 0;

    return {
      attendanceRate,
      hafalanProgress,
      currentSurah: currentHafalan?.surah?.name || 'Belum ada',
      averageGrade,
      totalHafalan: completedHafalan.length
    };
  }

  /**
   * Add delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get automation rules
   */
  getRules(): AutomationRule[] {
    return this.rules;
  }

  /**
   * Update automation rule
   */
  updateRule(ruleId: string, updates: Partial<AutomationRule>): boolean {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return false;

    this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    return true;
  }

  /**
   * Enable/disable automation rule
   */
  toggleRule(ruleId: string, enabled: boolean): boolean {
    return this.updateRule(ruleId, { enabled });
  }
}

export const whatsappAutomation = new WhatsAppAutomation();
export default WhatsAppAutomation;
