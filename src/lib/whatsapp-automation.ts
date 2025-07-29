import { whatsappService } from "./whatsapp";
import { prisma } from "./prisma";

interface AutomationConditions {
  minGrade?: number;
  daysOverdue?: number;
  consecutiveDays?: number;
  [key: string]: unknown;
}

interface AttendanceRecord {
  id: string;
  status: string;
  date: Date;
  santriId: string;
}

interface HafalanRecord {
  id: string;
  status: string;
  grade?: number;
  nilai?: number;
  progress?: number;
  santriId: string;
}

interface StudentProfile {
  attendance: AttendanceRecord[];
  hafalan: HafalanRecord[];
}

interface AutomationRule {
  id: string;
  name: string;
  trigger:
    | "hafalan_completed"
    | "attendance_absent"
    | "payment_due"
    | "monthly_report";
  enabled: boolean;
  conditions: AutomationConditions;
  template: string;
  recipients: "parents" | "students" | "teachers" | "all";
}

class WhatsAppAutomation {
  private rules: AutomationRule[] = [
    {
      id: "hafalan_completed",
      name: "Hafalan Selesai",
      trigger: "hafalan_completed",
      enabled: true,
      conditions: { minGrade: 80 },
      template: "hafalan_progress",
      recipients: "parents",
    },
    {
      id: "attendance_absent",
      name: "Absensi Alpha",
      trigger: "attendance_absent",
      enabled: true,
      conditions: { consecutiveDays: 2 },
      template: "attendance_notification",
      recipients: "parents",
    },
    {
      id: "payment_due",
      name: "Pengingat Pembayaran",
      trigger: "payment_due",
      enabled: true,
      conditions: { daysBefore: 3 },
      template: "payment_reminder",
      recipients: "parents",
    },
    {
      id: "monthly_report",
      name: "Laporan Bulanan",
      trigger: "monthly_report",
      enabled: true,
      conditions: { dayOfMonth: 1 },
      template: "monthly_report",
      recipients: "parents",
    },
  ];

  /**
   * Process hafalan completion notification
   */
  async processHafalanCompleted(
    hafalanId: string,
    studentId: string,
    grade: number,
  ) {
    const rule = this.rules.find((r) => r.trigger === "hafalan_completed");
    if (!rule || !rule.enabled) return;

    // Check conditions
    if (grade < rule.conditions.minGrade) return;

    try {
      // Get student and hafalan data
      const student = await prisma.user.findUnique({
        where: { id: studentId },
      });

      const hafalan = await prisma.hafalan.findUnique({
        where: { id: hafalanId },
      });

      // TODO: Get parent phone from student profile or separate parent table
      // For now, using student's phone as fallback
      const parentPhone = student?.phone; // This should be replaced with actual parent phone

      if (!student || !hafalan || !parentPhone) return;

      // Send WhatsApp notification
      const result = await whatsappService.sendHafalanProgressToParent(
        parentPhone,
        student.name,
        hafalan.surahName, // Using surahName field from schema
        100, // completed
        grade,
      );

      if (result.success) {
        console.log(`Hafalan completion notification sent to ${parentPhone}`);
      }
    } catch (error) {
      console.error("Error processing hafalan completion notification:", error);
    }
  }

  /**
   * Process attendance absence notification
   */
  async processAttendanceAbsent(studentId: string, date: string) {
    const rule = this.rules.find((r) => r.trigger === "attendance_absent");
    if (!rule || !rule.enabled) return;

    try {
      // Check consecutive absent days
      const recentAttendance = await prisma.attendance.findMany({
        where: {
          santriId: studentId,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: { date: "desc" },
      });

      const consecutiveAbsent = this.countConsecutiveAbsent(recentAttendance);

      if (consecutiveAbsent < rule.conditions.consecutiveDays) return;

      // Get student data
      const student = await prisma.user.findUnique({
        where: { id: studentId },
      });

      // TODO: Get parent phone from student profile or separate parent table
      const parentPhone = student?.phone; // This should be replaced with actual parent phone

      if (!student || !parentPhone) return;

      // Send WhatsApp notification
      const result = await whatsappService.sendAttendanceNotification(
        parentPhone,
        student.name,
        "ALPHA",
        date,
      );

      if (result.success) {
        console.log(`Attendance absence notification sent to ${parentPhone}`);
      }
    } catch (error) {
      console.error("Error processing attendance absence notification:", error);
    }
  }

  /**
   * Process payment due notification
   */
  async processPaymentDue() {
    const rule = this.rules.find((r) => r.trigger === "payment_due");
    if (!rule || !rule.enabled) return;

    try {
      // Get payments due in the next few days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + rule.conditions.daysBefore);

      const duePayments = await prisma.payment.findMany({
        where: {
          status: "PENDING",
          dueDate: {
            lte: dueDate,
          },
        },
        include: {
          santri: {
            include: {
              wali: true,
            },
          },
        },
      });

      for (const payment of duePayments) {
        if (!payment.santri.wali?.phone) continue;

        const result = await whatsappService.sendPaymentReminder(
          payment.santri.wali.phone,
          payment.santri.name,
          payment.type,
          payment.amount,
          payment.dueDate.toLocaleDateString("id-ID"),
        );

        if (result.success) {
          console.log(`Payment reminder sent to ${payment.santri.wali.phone}`);
        }

        // Add delay to avoid rate limiting
        await this.delay(1000);
      }
    } catch (error) {
      console.error("Error processing payment due notifications:", error);
    }
  }

  /**
   * Process monthly report
   */
  async processMonthlyReport() {
    const rule = this.rules.find((r) => r.trigger === "monthly_report");
    if (!rule || !rule.enabled) return;

    try {
      // Get all active students
      const students = await prisma.user.findMany({
        where: {
          role: "SANTRI",
          isActive: true,
        },
      });

      // TODO: Get attendance and hafalan data separately since relations don't exist
      for (const student of students) {
        // TODO: Get parent phone from student profile or separate parent table
        const parentPhone = student.phone; // This should be replaced with actual parent phone

        if (!parentPhone) continue;

        // Get attendance data for the current month
        const attendance = await prisma.attendance.findMany({
          where: {
            santriId: student.id,
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        });

        // Get hafalan data
        const hafalan = await prisma.hafalan.findMany({
          where: {
            santriId: student.id,
          },
        });

        // Calculate monthly statistics
        const stats = this.calculateMonthlyStats({ attendance, hafalan });

        const result = await whatsappService.sendMonthlyReport(
          parentPhone,
          student.name,
          stats,
        );

        if (result.success) {
          console.log(`Monthly report sent to ${parentPhone}`);
        }

        // Add delay to avoid rate limiting
        await this.delay(2000);
      }
    } catch (error) {
      console.error("Error processing monthly reports:", error);
    }
  }

  /**
   * Count consecutive absent days
   */
  private countConsecutiveAbsent(attendance: AttendanceRecord[]): number {
    let count = 0;
    for (const record of attendance) {
      if (record.status === "ALPHA") {
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
  private calculateMonthlyStats(santriProfile: StudentProfile) {
    const attendance = santriProfile.attendance || [];
    const hafalan = santriProfile.hafalan || [];

    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(
      (a: AttendanceRecord) => a.status === "HADIR",
    ).length;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    const completedHafalan = hafalan.filter(
      (h: HafalanRecord) => h.status === "COMPLETED",
    );
    const averageGrade =
      completedHafalan.length > 0
        ? Math.round(
            completedHafalan.reduce(
              (sum: number, h: HafalanRecord) =>
                sum + (h.nilai || h.grade || 0),
              0,
            ) / completedHafalan.length,
          )
        : 0;

    const currentHafalan = hafalan.find(
      (h: HafalanRecord) => h.status === "PROGRESS",
    );
    const hafalanProgress = currentHafalan?.progress || 0;

    return {
      attendanceRate,
      hafalanProgress,
      currentSurah: "Belum ada", // TODO: Get surah name from surahName field
      averageGrade,
      totalHafalan: completedHafalan.length,
    };
  }

  /**
   * Add delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    const ruleIndex = this.rules.findIndex((r) => r.id === ruleId);
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
