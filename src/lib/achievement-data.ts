// Achievement Badge Types
export interface AchievementBadge {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  icon: string;
  color: string;
  category: "HAFALAN" | "ATTENDANCE" | "BEHAVIOR" | "ACADEMIC" | "SPECIAL";
  criteriaType:
    | "SURAH_COUNT"
    | "AYAH_COUNT"
    | "PERFECT_SCORE"
    | "STREAK"
    | "TIME_BASED"
    | "CUSTOM";
  criteriaValue: number;
  criteriaCondition: "GREATER_THAN" | "EQUAL" | "LESS_THAN" | "BETWEEN";
  timeframe?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "ALL_TIME";
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  points: number;
  isActive: boolean;
  unlockMessage: string;
  shareMessage: string;
}

// Santri Achievement
export interface SantriAchievement {
  id: string;
  santriId: string;
  santriName: string;
  badgeId: string;
  badgeName: string;
  achievedAt: string;
  progress: number; // 0-100
  isUnlocked: boolean;
  notificationSent: boolean;
  certificateGenerated: boolean;
  certificateUrl?: string;
  sharedAt?: string;
  metadata?: {
    surahsCompleted?: number;
    ayahsMemorized?: number;
    perfectScores?: number;
    streakDays?: number;
    customData?: any;
  };
}

// Sample Achievement Badges
export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: "badge_first_surah",
    name: "Surah Pertama",
    nameArabic: "السورة الأولى",
    description: "Menyelesaikan hafalan surah pertama",
    icon: "🌟",
    color: "#10b981",
    category: "HAFALAN",
    criteriaType: "SURAH_COUNT",
    criteriaValue: 1,
    criteriaCondition: "GREATER_THAN",
    timeframe: "ALL_TIME",
    rarity: "COMMON",
    points: 100,
    isActive: true,
    unlockMessage: "Selamat! Anda telah menyelesaikan hafalan surah pertama!",
    shareMessage:
      "Alhamdulillah, saya telah menyelesaikan hafalan surah pertama di TPQ Baitus Shuffah! 🌟",
  },
  {
    id: "badge_juz_amma",
    name: "Juz Amma Master",
    nameArabic: "حافظ جزء عم",
    description: "Menguasai seluruh surah dalam Juz 30",
    icon: "📖",
    color: "#3b82f6",
    category: "HAFALAN",
    criteriaType: "CUSTOM",
    criteriaValue: 37,
    criteriaCondition: "GREATER_THAN",
    timeframe: "ALL_TIME",
    rarity: "RARE",
    points: 1000,
    isActive: true,
    unlockMessage: "Masya Allah! Anda telah menguasai Juz Amma!",
    shareMessage:
      "Alhamdulillah, saya telah menguasai Juz Amma di TPQ Baitus Shuffah! 📖✨",
  },
  {
    id: "badge_perfect_score",
    name: "Hafidz Sempurna",
    nameArabic: "الحافظ المتقن",
    description: "Mendapat nilai sempurna (A+) dalam 5 evaluasi berturut-turut",
    icon: "⭐",
    color: "#f59e0b",
    category: "ACADEMIC",
    criteriaType: "PERFECT_SCORE",
    criteriaValue: 5,
    criteriaCondition: "GREATER_THAN",
    timeframe: "ALL_TIME",
    rarity: "EPIC",
    points: 500,
    isActive: true,
    unlockMessage: "Luar biasa! Anda adalah Hafidz Sempurna!",
    shareMessage:
      "Alhamdulillah, saya meraih gelar Hafidz Sempurna di TPQ Baitus Shuffah! ⭐",
  },
  {
    id: "badge_consistent_learner",
    name: "Santri Istiqomah",
    nameArabic: "الطالب المستقيم",
    description: "Hadir konsisten selama 30 hari berturut-turut",
    icon: "🔥",
    color: "#ef4444",
    category: "ATTENDANCE",
    criteriaType: "STREAK",
    criteriaValue: 30,
    criteriaCondition: "GREATER_THAN",
    timeframe: "ALL_TIME",
    rarity: "UNCOMMON",
    points: 300,
    isActive: true,
    unlockMessage: "Masya Allah! Istiqomah adalah kunci kesuksesan!",
    shareMessage:
      "Alhamdulillah, saya meraih badge Santri Istiqomah di TPQ Baitus Shuffah! 🔥",
  },
  {
    id: "badge_speed_learner",
    name: "Hafidz Kilat",
    nameArabic: "الحافظ السريع",
    description: "Menyelesaikan target hafalan lebih cepat dari deadline",
    icon: "⚡",
    color: "#8b5cf6",
    category: "HAFALAN",
    criteriaType: "TIME_BASED",
    criteriaValue: 1,
    criteriaCondition: "GREATER_THAN",
    timeframe: "ALL_TIME",
    rarity: "RARE",
    points: 400,
    isActive: true,
    unlockMessage: "Subhanallah! Kecepatan hafalan Anda luar biasa!",
    shareMessage:
      "Alhamdulillah, saya meraih badge Hafidz Kilat di TPQ Baitus Shuffah! ⚡",
  },
  {
    id: "badge_al_fatihah_master",
    name: "Master Al-Fatihah",
    nameArabic: "حافظ الفاتحة",
    description: "Menguasai surah Al-Fatihah dengan sempurna",
    icon: "🕌",
    color: "#059669",
    category: "HAFALAN",
    criteriaType: "CUSTOM",
    criteriaValue: 1,
    criteriaCondition: "EQUAL",
    timeframe: "ALL_TIME",
    rarity: "COMMON",
    points: 150,
    isActive: true,
    unlockMessage: "Barakallahu fiik! Al-Fatihah adalah kunci shalat!",
    shareMessage:
      "Alhamdulillah, saya telah menguasai Al-Fatihah di TPQ Baitus Shuffah! 🕌",
  },
  {
    id: "badge_100_ayahs",
    name: "Hafidz 100 Ayat",
    nameArabic: "حافظ مائة آية",
    description: "Menghafal 100 ayat Al-Quran",
    icon: "💯",
    color: "#dc2626",
    category: "HAFALAN",
    criteriaType: "AYAH_COUNT",
    criteriaValue: 100,
    criteriaCondition: "GREATER_THAN",
    timeframe: "ALL_TIME",
    rarity: "UNCOMMON",
    points: 250,
    isActive: true,
    unlockMessage: "Masya Allah! 100 ayat telah tersimpan di hati Anda!",
    shareMessage:
      "Alhamdulillah, saya telah menghafal 100 ayat Al-Quran di TPQ Baitus Shuffah! 💯",
  },
  {
    id: "badge_monthly_champion",
    name: "Juara Bulanan",
    nameArabic: "بطل الشهر",
    description: "Santri terbaik bulan ini",
    icon: "🏆",
    color: "#f59e0b",
    category: "SPECIAL",
    criteriaType: "CUSTOM",
    criteriaValue: 1,
    criteriaCondition: "EQUAL",
    timeframe: "MONTHLY",
    rarity: "LEGENDARY",
    points: 1000,
    isActive: true,
    unlockMessage: "Subhanallah! Anda adalah Juara Bulanan!",
    shareMessage:
      "Alhamdulillah, saya meraih gelar Juara Bulanan di TPQ Baitus Shuffah! 🏆",
  },
];

// Helper Functions
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case "COMMON":
      return "text-gray-600 bg-gray-100";
    case "UNCOMMON":
      return "text-green-600 bg-green-100";
    case "RARE":
      return "text-blue-600 bg-blue-100";
    case "EPIC":
      return "text-purple-600 bg-purple-100";
    case "LEGENDARY":
      return "text-yellow-600 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getRarityText = (rarity: string): string => {
  switch (rarity) {
    case "COMMON":
      return "Umum";
    case "UNCOMMON":
      return "Tidak Umum";
    case "RARE":
      return "Langka";
    case "EPIC":
      return "Epik";
    case "LEGENDARY":
      return "Legendaris";
    default:
      return rarity;
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case "HAFALAN":
      return "text-teal-600 bg-teal-100";
    case "ATTENDANCE":
      return "text-blue-600 bg-blue-100";
    case "BEHAVIOR":
      return "text-green-600 bg-green-100";
    case "ACADEMIC":
      return "text-purple-600 bg-purple-100";
    case "SPECIAL":
      return "text-yellow-600 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getCategoryText = (category: string): string => {
  switch (category) {
    case "HAFALAN":
      return "Hafalan";
    case "ATTENDANCE":
      return "Kehadiran";
    case "BEHAVIOR":
      return "Perilaku";
    case "ACADEMIC":
      return "Akademik";
    case "SPECIAL":
      return "Khusus";
    default:
      return category;
  }
};

export const getBadgesByCategory = (category: string): AchievementBadge[] => {
  if (category === "all") return ACHIEVEMENT_BADGES;
  return ACHIEVEMENT_BADGES.filter((badge) => badge.category === category);
};

export const getBadgesByRarity = (rarity: string): AchievementBadge[] => {
  if (rarity === "all") return ACHIEVEMENT_BADGES;
  return ACHIEVEMENT_BADGES.filter((badge) => badge.rarity === rarity);
};

export const checkAchievementCriteria = (
  badge: AchievementBadge,
  santriData: {
    surahsCompleted: number;
    ayahsMemorized: number;
    perfectScores: number;
    streakDays: number;
    customData?: any;
  },
): boolean => {
  if (!santriData) return false;

  let actualValue = 0;

  switch (badge.criteriaType) {
    case "SURAH_COUNT":
      actualValue = santriData.surahsCompleted;
      break;
    case "AYAH_COUNT":
      actualValue = santriData.ayahsMemorized;
      break;
    case "PERFECT_SCORE":
      actualValue = santriData.perfectScores;
      break;
    case "STREAK":
      actualValue = santriData.streakDays;
      break;
    case "CUSTOM":
      actualValue = santriData.customData?.[badge.id] || 0;
      break;
    default:
      return false;
  }

  switch (badge.criteriaCondition) {
    case "GREATER_THAN":
      return actualValue >= badge.criteriaValue;
    case "EQUAL":
      return actualValue === badge.criteriaValue;
    case "LESS_THAN":
      return actualValue <= badge.criteriaValue;
    default:
      return false;
  }
};
