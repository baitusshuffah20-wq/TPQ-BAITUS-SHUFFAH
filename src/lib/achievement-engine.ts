import { prisma } from "@/lib/prisma";

export interface AchievementCriteria {
  badgeId: string;
  criteriaType: string;
  criteriaValue: number;
  criteriaCondition: string;
  timeframe?: string;
}

export class AchievementEngine {
  /**
   * Check and award achievements for a santri based on their activities
   */
  static async checkAndAwardAchievements(santriId: string) {
    try {
      // Get all active badges
      const badges = await prisma.achievementBadge.findMany({
        where: { isActive: true },
      });

      // Get santri's existing achievements
      const existingAchievements = await prisma.santriAchievement.findMany({
        where: { santriId },
        select: { badgeId: true },
      });

      const existingBadgeIds = new Set(
        existingAchievements.map((a) => a.badgeId),
      );
      const newAchievements = [];

      for (const badge of badges) {
        // Skip if santri already has this badge
        if (existingBadgeIds.has(badge.id)) continue;

        const isEligible = await this.checkBadgeEligibility(santriId, badge);
        if (isEligible) {
          // Award the badge
          const achievement = await prisma.santriAchievement.create({
            data: {
              santriId,
              badgeId: badge.id,
            },
            include: {
              badge: {
                select: { name: true, points: true },
              },
            },
          });

          newAchievements.push(achievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error("Error in achievement engine:", error);
      return [];
    }
  }

  /**
   * Check if santri is eligible for a specific badge
   */
  private static async checkBadgeEligibility(
    santriId: string,
    badge: any,
  ): Promise<boolean> {
    try {
      switch (badge.criteriaType) {
        case "SURAH_COUNT":
          return await this.checkSurahCount(santriId, badge);
        case "AYAH_COUNT":
          return await this.checkAyahCount(santriId, badge);
        case "PERFECT_SCORE":
          return await this.checkPerfectScore(santriId, badge);
        case "STREAK":
          return await this.checkAttendanceStreak(santriId, badge);
        case "TIME_BASED":
          return await this.checkTimeBased(santriId, badge);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error checking eligibility for badge ${badge.id}:`, error);
      return false;
    }
  }

  /**
   * Check surah count achievement
   */
  private static async checkSurahCount(
    santriId: string,
    badge: any,
  ): Promise<boolean> {
    try {
      // Simple count of hafalan records for now
      const hafalanCount = await prisma.hafalan.count({
        where: {
          santriId,
          grade: { gte: 7.0 }, // Minimum grade 7.0 to count as completed
        },
      });

      return this.evaluateCondition(
        hafalanCount,
        badge.criteriaValue,
        badge.criteriaCondition,
      );
    } catch (error) {
      console.error("Error checking surah count:", error);
      return false;
    }
  }

  /**
   * Check ayah count achievement
   */
  private static async checkAyahCount(
    santriId: string,
    badge: any,
  ): Promise<boolean> {
    try {
      // Sum total ayahs from hafalan
      const hafalanRecords = await prisma.hafalan.findMany({
        where: {
          santriId,
          grade: { gte: 7.0 },
        },
        select: { ayahStart: true, ayahEnd: true },
      });

      const totalAyahs = hafalanRecords.reduce((total, record) => {
        if (record.ayahStart && record.ayahEnd) {
          return total + (record.ayahEnd - record.ayahStart + 1);
        }
        return total;
      }, 0);

      return this.evaluateCondition(
        totalAyahs,
        badge.criteriaValue,
        badge.criteriaCondition,
      );
    } catch (error) {
      console.error("Error checking ayah count:", error);
      return false;
    }
  }

  /**
   * Check perfect score achievement
   */
  private static async checkPerfectScore(
    santriId: string,
    badge: any,
  ): Promise<boolean> {
    try {
      const perfectScoreCount = await prisma.hafalan.count({
        where: {
          santriId,
          grade: 10.0, // Perfect score
        },
      });

      return this.evaluateCondition(
        perfectScoreCount,
        badge.criteriaValue,
        badge.criteriaCondition,
      );
    } catch (error) {
      console.error("Error checking perfect score:", error);
      return false;
    }
  }

  /**
   * Check attendance streak achievement
   */
  private static async checkAttendanceStreak(
    santriId: string,
    badge: any,
  ): Promise<boolean> {
    try {
      // Get recent attendance records
      const attendanceRecords = await prisma.attendance.findMany({
        where: { santriId },
        orderBy: { date: "desc" },
        take: badge.criteriaValue + 10, // Get a bit more to check streak
        select: { date: true, status: true },
      });

      // Calculate current streak
      let currentStreak = 0;
      for (const record of attendanceRecords) {
        if (record.status === "PRESENT") {
          currentStreak++;
        } else {
          break;
        }
      }

      return this.evaluateCondition(
        currentStreak,
        badge.criteriaValue,
        badge.criteriaCondition,
      );
    } catch (error) {
      console.error("Error checking attendance streak:", error);
      return false;
    }
  }

  /**
   * Check time-based achievement
   */
  private static async checkTimeBased(
    santriId: string,
    badge: any,
  ): Promise<boolean> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (badge.timeframe) {
        case "DAILY":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "WEEKLY":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "MONTHLY":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "YEARLY":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          return false;
      }

      // Count activities in timeframe (example: attendance)
      const activityCount = await prisma.attendance.count({
        where: {
          santriId,
          date: { gte: startDate },
          status: "PRESENT",
        },
      });

      return this.evaluateCondition(
        activityCount,
        badge.criteriaValue,
        badge.criteriaCondition,
      );
    } catch (error) {
      console.error("Error checking time-based achievement:", error);
      return false;
    }
  }

  /**
   * Evaluate condition based on criteria
   */
  private static evaluateCondition(
    actualValue: number,
    targetValue: number,
    condition: string,
  ): boolean {
    switch (condition) {
      case "GREATER_THAN":
        return actualValue >= targetValue;
      case "EQUAL":
        return actualValue === targetValue;
      case "LESS_THAN":
        return actualValue <= targetValue;
      default:
        return false;
    }
  }

  /**
   * Trigger achievement check after hafalan entry
   */
  static async onHafalanAdded(santriId: string) {
    return await this.checkAndAwardAchievements(santriId);
  }

  /**
   * Trigger achievement check after attendance entry
   */
  static async onAttendanceAdded(santriId: string) {
    return await this.checkAndAwardAchievements(santriId);
  }

  /**
   * Trigger achievement check after assessment
   */
  static async onAssessmentAdded(santriId: string) {
    return await this.checkAndAwardAchievements(santriId);
  }
}
