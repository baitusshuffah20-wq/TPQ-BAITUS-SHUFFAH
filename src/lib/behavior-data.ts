// Behavior Data Models for TPQ Management System

export type BehaviorCategory = 'AKHLAQ' | 'IBADAH' | 'ACADEMIC' | 'SOCIAL' | 'DISCIPLINE' | 'LEADERSHIP';
export type BehaviorType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
export type BehaviorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BehaviorStatus = 'ACTIVE' | 'RESOLVED' | 'FOLLOW_UP' | 'ESCALATED';

// Behavior Criteria
export interface BehaviorCriteria {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  category: BehaviorCategory;
  type: BehaviorType;
  severity: BehaviorSeverity;
  points: number; // positive for good behavior, negative for bad
  isActive: boolean;
  ageGroup: string; // e.g., "5-8", "9-12", "13+"
  examples: string[];
  consequences?: string[];
  rewards?: string[];
  islamicReference?: {
    quranVerse?: string;
    hadith?: string;
    explanation?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Behavior Record
export interface BehaviorRecord {
  id: string;
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahId: string;
  halaqahName: string;
  criteriaId: string;
  criteriaName: string;
  category: BehaviorCategory;
  type: BehaviorType;
  severity: BehaviorSeverity;
  points: number;
  date: string;
  time: string;
  description: string;
  context?: string; // situation/context when behavior occurred
  witnesses?: string[]; // other people who witnessed
  location?: string;
  status: BehaviorStatus;
  recordedBy: string;
  recordedByName: string;
  recordedAt: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  parentNotified: boolean;
  parentNotifiedAt?: string;
  resolution?: {
    action: string;
    result: string;
    resolvedBy: string;
    resolvedAt: string;
    notes: string;
  };
  attachments?: {
    type: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
    url: string;
    description: string;
  }[];
  metadata?: {
    mood?: 'HAPPY' | 'SAD' | 'ANGRY' | 'CALM' | 'EXCITED';
    energy?: 'HIGH' | 'MEDIUM' | 'LOW';
    participation?: 'ACTIVE' | 'PASSIVE' | 'DISRUPTIVE';
    socialInteraction?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  };
}

// Behavior Summary
export interface BehaviorSummary {
  santriId: string;
  santriName: string;
  period: {
    startDate: string;
    endDate: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  };
  totalRecords: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalPoints: number;
  averagePoints: number;
  behaviorScore: number; // 0-100 scale
  characterGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'E';
  byCategory: {
    category: BehaviorCategory;
    count: number;
    points: number;
    percentage: number;
  }[];
  trends: {
    improving: boolean;
    stable: boolean;
    declining: boolean;
    trendPercentage: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  lastUpdated: string;
}

// Character Development Goal
export interface CharacterGoal {
  id: string;
  santriId: string;
  santriName: string;
  title: string;
  description: string;
  category: BehaviorCategory;
  targetBehaviors: string[];
  targetDate: string;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  progress: number; // 0-100
  milestones: {
    id: string;
    title: string;
    description: string;
    targetDate: string;
    isCompleted: boolean;
    completedAt?: string;
    evidence?: string;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  parentInvolved: boolean;
  musyrifNotes?: string;
  parentFeedback?: string;
}

// Behavior Alert
export interface BehaviorAlert {
  id: string;
  santriId: string;
  santriName: string;
  alertType: 'PATTERN' | 'SEVERITY' | 'FREQUENCY' | 'GOAL_RISK' | 'IMPROVEMENT';
  title: string;
  message: string;
  severity: BehaviorSeverity;
  triggerCriteria: {
    type: string;
    threshold: number;
    period: string;
  };
  isRead: boolean;
  isResolved: boolean;
  actionRequired: boolean;
  assignedTo: string[];
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  metadata?: {
    behaviorCount?: number;
    pointsTotal?: number;
    patternDays?: number;
    relatedRecords?: string[];
  };
}

// Behavior Template
export interface BehaviorTemplate {
  id: string;
  name: string;
  description: string;
  category: BehaviorCategory;
  criteria: BehaviorCriteria[];
  isDefault: boolean;
  ageGroup: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

// Helper Functions
export const getBehaviorCategoryColor = (category: BehaviorCategory): string => {
  switch (category) {
    case 'AKHLAQ': return 'text-green-600 bg-green-100';
    case 'IBADAH': return 'text-blue-600 bg-blue-100';
    case 'ACADEMIC': return 'text-purple-600 bg-purple-100';
    case 'SOCIAL': return 'text-orange-600 bg-orange-100';
    case 'DISCIPLINE': return 'text-red-600 bg-red-100';
    case 'LEADERSHIP': return 'text-yellow-600 bg-yellow-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getBehaviorCategoryText = (category: BehaviorCategory): string => {
  switch (category) {
    case 'AKHLAQ': return 'Akhlaq';
    case 'IBADAH': return 'Ibadah';
    case 'ACADEMIC': return 'Akademik';
    case 'SOCIAL': return 'Sosial';
    case 'DISCIPLINE': return 'Disiplin';
    case 'LEADERSHIP': return 'Kepemimpinan';
    default: return category;
  }
};

export const getBehaviorTypeColor = (type: BehaviorType): string => {
  switch (type) {
    case 'POSITIVE': return 'text-green-600 bg-green-100';
    case 'NEGATIVE': return 'text-red-600 bg-red-100';
    case 'NEUTRAL': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getBehaviorTypeText = (type: BehaviorType): string => {
  switch (type) {
    case 'POSITIVE': return 'Positif';
    case 'NEGATIVE': return 'Negatif';
    case 'NEUTRAL': return 'Netral';
    default: return type;
  }
};

export const getBehaviorSeverityColor = (severity: BehaviorSeverity): string => {
  switch (severity) {
    case 'LOW': return 'text-blue-600 bg-blue-100';
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
    case 'HIGH': return 'text-orange-600 bg-orange-100';
    case 'CRITICAL': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getBehaviorSeverityText = (severity: BehaviorSeverity): string => {
  switch (severity) {
    case 'LOW': return 'Rendah';
    case 'MEDIUM': return 'Sedang';
    case 'HIGH': return 'Tinggi';
    case 'CRITICAL': return 'Kritis';
    default: return severity;
  }
};

export const getBehaviorStatusColor = (status: BehaviorStatus): string => {
  switch (status) {
    case 'ACTIVE': return 'text-blue-600 bg-blue-100';
    case 'RESOLVED': return 'text-green-600 bg-green-100';
    case 'FOLLOW_UP': return 'text-yellow-600 bg-yellow-100';
    case 'ESCALATED': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getBehaviorStatusText = (status: BehaviorStatus): string => {
  switch (status) {
    case 'ACTIVE': return 'Aktif';
    case 'RESOLVED': return 'Selesai';
    case 'FOLLOW_UP': return 'Tindak Lanjut';
    case 'ESCALATED': return 'Eskalasi';
    default: return status;
  }
};

export const calculateBehaviorScore = (summary: BehaviorSummary): number => {
  if (summary.totalRecords === 0) return 50; // neutral score
  
  // Base score calculation
  const baseScore = 50;
  const pointsImpact = Math.min(Math.max(summary.totalPoints * 2, -40), 40);
  const score = baseScore + pointsImpact;
  
  return Math.min(Math.max(score, 0), 100);
};

export const getCharacterGrade = (score: number): BehaviorSummary['characterGrade'] => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'E';
};

export const getGradeColor = (grade: BehaviorSummary['characterGrade']): string => {
  switch (grade) {
    case 'A+':
    case 'A':
    case 'A-': return 'text-green-600 bg-green-100';
    case 'B+':
    case 'B':
    case 'B-': return 'text-blue-600 bg-blue-100';
    case 'C+':
    case 'C':
    case 'C-': return 'text-yellow-600 bg-yellow-100';
    case 'D': return 'text-orange-600 bg-orange-100';
    case 'E': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const formatBehaviorDate = (date: string): string => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatBehaviorTime = (time: string): string => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateTrend = (records: BehaviorRecord[], days: number = 7): { improving: boolean; stable: boolean; declining: boolean; trendPercentage: number } => {
  if (records.length < 2) {
    return { improving: false, stable: true, declining: false, trendPercentage: 0 };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentRecords = records.filter(r => new Date(r.date) >= cutoffDate);
  const olderRecords = records.filter(r => new Date(r.date) < cutoffDate);

  if (recentRecords.length === 0 || olderRecords.length === 0) {
    return { improving: false, stable: true, declining: false, trendPercentage: 0 };
  }

  const recentAverage = recentRecords.reduce((sum, r) => sum + r.points, 0) / recentRecords.length;
  const olderAverage = olderRecords.reduce((sum, r) => sum + r.points, 0) / olderRecords.length;
  
  const difference = recentAverage - olderAverage;
  const trendPercentage = Math.abs(difference) / Math.abs(olderAverage) * 100;

  if (Math.abs(difference) < 0.5) {
    return { improving: false, stable: true, declining: false, trendPercentage: 0 };
  }

  return {
    improving: difference > 0,
    stable: false,
    declining: difference < 0,
    trendPercentage: Math.round(trendPercentage)
  };
};

// Predefined Behavior Criteria
export const BEHAVIOR_CRITERIA: BehaviorCriteria[] = [
  // AKHLAQ - Positive
  {
    id: 'akhlaq_honest',
    name: 'Jujur',
    nameArabic: 'الصدق',
    description: 'Berkata dan bertindak dengan jujur',
    category: 'AKHLAQ',
    type: 'POSITIVE',
    severity: 'LOW',
    points: 5,
    isActive: true,
    ageGroup: '5+',
    examples: [
      'Mengakui kesalahan dengan jujur',
      'Tidak berbohong kepada guru atau teman',
      'Mengembalikan barang yang bukan miliknya'
    ],
    rewards: ['Pujian di depan kelas', 'Sticker bintang', 'Sertifikat kejujuran'],
    islamicReference: {
      hadith: 'عليكم بالصدق فإن الصدق يهدي إلى البر',
      explanation: 'Hendaklah kalian berlaku jujur, karena kejujuran menuntun kepada kebaikan'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'akhlaq_respect',
    name: 'Menghormati Guru',
    nameArabic: 'احترام المعلم',
    description: 'Menunjukkan rasa hormat kepada guru dan ustadz',
    category: 'AKHLAQ',
    type: 'POSITIVE',
    severity: 'LOW',
    points: 4,
    isActive: true,
    ageGroup: '5+',
    examples: [
      'Mengucapkan salam ketika bertemu guru',
      'Mendengarkan dengan baik saat guru mengajar',
      'Tidak memotong pembicaraan guru'
    ],
    rewards: ['Pujian', 'Hadiah kecil', 'Dipuji di depan orang tua'],
    islamicReference: {
      hadith: 'ليس منا من لم يرحم صغيرنا ويوقر كبيرنا',
      explanation: 'Bukan termasuk golongan kami yang tidak menyayangi yang kecil dan tidak menghormati yang besar'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'akhlaq_helping',
    name: 'Membantu Teman',
    nameArabic: 'مساعدة الأصدقاء',
    description: 'Membantu teman yang membutuhkan',
    category: 'AKHLAQ',
    type: 'POSITIVE',
    severity: 'LOW',
    points: 4,
    isActive: true,
    ageGroup: '5+',
    examples: [
      'Membantu teman yang kesulitan belajar',
      'Berbagi alat tulis dengan teman',
      'Membantu teman yang terjatuh'
    ],
    rewards: ['Apresiasi guru', 'Badge helper', 'Cerita positif ke orang tua'],
    islamicReference: {
      quranVerse: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ',
      explanation: 'Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan dan takwa'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // IBADAH - Positive
  {
    id: 'ibadah_prayer',
    name: 'Rajin Shalat',
    nameArabic: 'المحافظة على الصلاة',
    description: 'Melaksanakan shalat dengan tertib dan khusyuk',
    category: 'IBADAH',
    type: 'POSITIVE',
    severity: 'MEDIUM',
    points: 6,
    isActive: true,
    ageGroup: '7+',
    examples: [
      'Shalat berjamaah di TPQ',
      'Datang tepat waktu untuk shalat',
      'Khusyuk dalam shalat'
    ],
    rewards: ['Sertifikat rajin shalat', 'Hadiah Al-Quran kecil', 'Pujian khusus'],
    islamicReference: {
      quranVerse: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ',
      explanation: 'Dan dirikanlah shalat, tunaikanlah zakat'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ibadah_quran',
    name: 'Rajin Membaca Al-Quran',
    nameArabic: 'المواظبة على قراءة القرآن',
    description: 'Aktif dalam membaca dan menghafal Al-Quran',
    category: 'IBADAH',
    type: 'POSITIVE',
    severity: 'MEDIUM',
    points: 5,
    isActive: true,
    ageGroup: '5+',
    examples: [
      'Membaca Al-Quran dengan tartil',
      'Menghafal ayat dengan baik',
      'Membantu teman belajar Al-Quran'
    ],
    rewards: ['Sertifikat hafalan', 'Hadiah mushaf', 'Apresiasi khusus'],
    islamicReference: {
      hadith: 'خيركم من تعلم القرآن وعلمه',
      explanation: 'Sebaik-baik kalian adalah yang belajar Al-Quran dan mengajarkannya'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ACADEMIC - Positive
  {
    id: 'academic_active',
    name: 'Aktif Bertanya',
    nameArabic: 'النشاط في السؤال',
    description: 'Aktif bertanya dan berpartisipasi dalam pembelajaran',
    category: 'ACADEMIC',
    type: 'POSITIVE',
    severity: 'LOW',
    points: 3,
    isActive: true,
    ageGroup: '5+',
    examples: [
      'Bertanya hal yang tidak dipahami',
      'Menjawab pertanyaan guru',
      'Berpartisipasi dalam diskusi'
    ],
    rewards: ['Pujian guru', 'Sticker pintar', 'Pencatatan positif'],
    islamicReference: {
      hadith: 'العلم خزائن ومفاتيحها السؤال',
      explanation: 'Ilmu adalah perbendaharaan dan kuncinya adalah bertanya'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // DISCIPLINE - Negative
  {
    id: 'discipline_late',
    name: 'Terlambat',
    nameArabic: 'التأخير',
    description: 'Datang terlambat ke TPQ atau kelas',
    category: 'DISCIPLINE',
    type: 'NEGATIVE',
    severity: 'LOW',
    points: -2,
    isActive: true,
    ageGroup: '5+',
    examples: [
      'Datang terlambat lebih dari 10 menit',
      'Tidak memberitahu alasan keterlambatan',
      'Sering terlambat tanpa alasan jelas'
    ],
    consequences: ['Teguran lisan', 'Pencatatan keterlambatan', 'Pemberitahuan ke orang tua'],
    islamicReference: {
      hadith: 'الوقت كالسيف إن لم تقطعه قطعك',
      explanation: 'Waktu seperti pedang, jika kamu tidak memanfaatkannya maka ia akan merugikanmu'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'discipline_disrupt',
    name: 'Mengganggu Kelas',
    nameArabic: 'إزعاج الفصل',
    description: 'Mengganggu jalannya pembelajaran di kelas',
    category: 'DISCIPLINE',
    type: 'NEGATIVE',
    severity: 'MEDIUM',
    points: -4,
    isActive: true,
    ageGroup: '5+',
    examples: [
      'Berbicara saat guru menjelaskan',
      'Mengganggu teman saat belajar',
      'Membuat keributan di kelas'
    ],
    consequences: ['Teguran keras', 'Duduk terpisah', 'Panggilan orang tua'],
    islamicReference: {
      hadith: 'من كان يؤمن بالله واليوم الآخر فليقل خيرا أو ليصمت',
      explanation: 'Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // SOCIAL - Negative
  {
    id: 'social_fight',
    name: 'Berkelahi',
    nameArabic: 'الشجار',
    description: 'Berkelahi atau bertengkar dengan teman',
    category: 'SOCIAL',
    type: 'NEGATIVE',
    severity: 'HIGH',
    points: -8,
    isActive: true,
    ageGroup: '5+',
    examples: [
      'Memukul atau mendorong teman',
      'Bertengkar secara fisik',
      'Menggunakan kata-kata kasar'
    ],
    consequences: ['Teguran keras', 'Mediasi konflik', 'Panggilan orang tua', 'Konseling'],
    islamicReference: {
      hadith: 'المسلم من سلم المسلمون من لسانه ويده',
      explanation: 'Muslim adalah orang yang kaum muslimin selamat dari lisan dan tangannya'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Behavior Templates
export const BEHAVIOR_TEMPLATES: BehaviorTemplate[] = [
  {
    id: 'template_basic_akhlaq',
    name: 'Akhlaq Dasar',
    description: 'Template perilaku akhlaq dasar untuk santri pemula',
    category: 'AKHLAQ',
    criteria: BEHAVIOR_CRITERIA.filter(c => c.category === 'AKHLAQ'),
    isDefault: true,
    ageGroup: '5-8',
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template_ibadah_basic',
    name: 'Ibadah Dasar',
    description: 'Template perilaku ibadah untuk santri',
    category: 'IBADAH',
    criteria: BEHAVIOR_CRITERIA.filter(c => c.category === 'IBADAH'),
    isDefault: true,
    ageGroup: '7+',
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template_comprehensive',
    name: 'Evaluasi Komprehensif',
    description: 'Template lengkap untuk evaluasi perilaku santri',
    category: 'AKHLAQ',
    criteria: BEHAVIOR_CRITERIA,
    isDefault: false,
    ageGroup: '5+',
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z'
  }
];
