// Attendance Data Models for TPQ Management System

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'SICK' | 'PERMISSION';
export type AttendanceMethod = 'MANUAL' | 'QR_CODE' | 'RFID' | 'BIOMETRIC' | 'AUTO';
export type SessionType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'WEEKEND' | 'SPECIAL';

// Attendance Record
export interface AttendanceRecord {
  id: string;
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahId: string;
  halaqahName: string;
  musyrifId: string;
  musyrifName: string;
  date: string;
  sessionType: SessionType;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  lateMinutes?: number;
  method: AttendanceMethod;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;
  excuseReason?: string;
  excuseDocument?: string;
  recordedBy: string;
  recordedAt: string;
  updatedAt?: string;
  metadata?: {
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    qrCodeId?: string;
    temperature?: number;
    photoUrl?: string;
  };
}

// Attendance Summary
export interface AttendanceSummary {
  santriId: string;
  santriName: string;
  halaqahId: string;
  period: {
    startDate: string;
    endDate: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  };
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  sickCount: number;
  permissionCount: number;
  attendanceRate: number; // percentage
  punctualityRate: number; // percentage
  streak: {
    current: number;
    longest: number;
    type: 'PRESENT' | 'PUNCTUAL';
  };
  averageCheckInTime?: string;
  totalLateMinutes: number;
  lastAttendance?: AttendanceRecord;
}

// Attendance Schedule
export interface AttendanceSchedule {
  id: string;
  halaqahId: string;
  halaqahName: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  sessionType: SessionType;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  lateThreshold: number; // minutes
  isActive: boolean;
  location?: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  requirements?: {
    qrCodeRequired: boolean;
    locationRequired: boolean;
    photoRequired: boolean;
    temperatureCheck: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Attendance Alert
export interface AttendanceAlert {
  id: string;
  type: 'ABSENT' | 'LATE' | 'STREAK_BROKEN' | 'PERFECT_ATTENDANCE' | 'CHRONIC_LATE';
  santriId: string;
  santriName: string;
  halaqahId: string;
  date: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  notificationSent: boolean;
  recipients: string[]; // user IDs
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  metadata?: {
    consecutiveDays?: number;
    attendanceRate?: number;
    streakDays?: number;
  };
}

// QR Code Session
export interface QRCodeSession {
  id: string;
  halaqahId: string;
  sessionType: SessionType;
  date: string;
  qrCode: string;
  isActive: boolean;
  expiresAt: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // meters
  };
  createdBy: string;
  createdAt: string;
  usageCount: number;
  maxUsage?: number;
}

// Attendance Statistics
export interface AttendanceStats {
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
  overall: {
    totalSessions: number;
    totalStudents: number;
    averageAttendanceRate: number;
    averagePunctualityRate: number;
  };
  byStatus: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    sick: number;
    permission: number;
  };
  byHalaqah: {
    halaqahId: string;
    halaqahName: string;
    attendanceRate: number;
    studentCount: number;
  }[];
  trends: {
    date: string;
    attendanceRate: number;
    presentCount: number;
    totalCount: number;
  }[];
  topPerformers: {
    santriId: string;
    santriName: string;
    attendanceRate: number;
    streak: number;
  }[];
  alerts: {
    chronic_absentees: number;
    chronic_late: number;
    perfect_attendance: number;
  };
}

// Helper Functions
export const getAttendanceStatusColor = (status: AttendanceStatus): string => {
  switch (status) {
    case 'PRESENT': return 'text-green-600 bg-green-100';
    case 'LATE': return 'text-yellow-600 bg-yellow-100';
    case 'ABSENT': return 'text-red-600 bg-red-100';
    case 'EXCUSED': return 'text-blue-600 bg-blue-100';
    case 'SICK': return 'text-purple-600 bg-purple-100';
    case 'PERMISSION': return 'text-indigo-600 bg-indigo-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getAttendanceStatusText = (status: AttendanceStatus): string => {
  switch (status) {
    case 'PRESENT': return 'Hadir';
    case 'LATE': return 'Terlambat';
    case 'ABSENT': return 'Tidak Hadir';
    case 'EXCUSED': return 'Izin';
    case 'SICK': return 'Sakit';
    case 'PERMISSION': return 'Izin Khusus';
    default: return status;
  }
};

export const getSessionTypeText = (type: SessionType): string => {
  switch (type) {
    case 'MORNING': return 'Pagi';
    case 'AFTERNOON': return 'Siang';
    case 'EVENING': return 'Sore';
    case 'WEEKEND': return 'Weekend';
    case 'SPECIAL': return 'Khusus';
    default: return type;
  }
};

export const getSessionTypeColor = (type: SessionType): string => {
  switch (type) {
    case 'MORNING': return 'text-blue-600 bg-blue-100';
    case 'AFTERNOON': return 'text-orange-600 bg-orange-100';
    case 'EVENING': return 'text-purple-600 bg-purple-100';
    case 'WEEKEND': return 'text-green-600 bg-green-100';
    case 'SPECIAL': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const calculateAttendanceRate = (summary: AttendanceSummary): number => {
  if (summary.totalSessions === 0) return 0;
  return Math.round((summary.presentCount / summary.totalSessions) * 100);
};

export const calculatePunctualityRate = (summary: AttendanceSummary): number => {
  if (summary.totalSessions === 0) return 0;
  const punctualSessions = summary.presentCount - summary.lateCount;
  return Math.round((punctualSessions / summary.totalSessions) * 100);
};

export const isLate = (checkInTime: string, scheduledTime: string, threshold: number): boolean => {
  const checkIn = new Date(`1970-01-01T${checkInTime}`);
  const scheduled = new Date(`1970-01-01T${scheduledTime}`);
  const diffMinutes = (checkIn.getTime() - scheduled.getTime()) / (1000 * 60);
  return diffMinutes > threshold;
};

export const calculateLateMinutes = (checkInTime: string, scheduledTime: string): number => {
  const checkIn = new Date(`1970-01-01T${checkInTime}`);
  const scheduled = new Date(`1970-01-01T${scheduledTime}`);
  const diffMinutes = (checkIn.getTime() - scheduled.getTime()) / (1000 * 60);
  return Math.max(0, Math.round(diffMinutes));
};

export const getAttendanceStreak = (records: AttendanceRecord[]): { current: number; longest: number } => {
  if (records.length === 0) return { current: 0, longest: 0 };

  // Sort by date descending
  const sortedRecords = records
    .filter(r => r.status === 'PRESENT' || r.status === 'LATE')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  // Calculate current streak
  for (let i = 0; i < sortedRecords.length; i++) {
    if (sortedRecords[i].status === 'PRESENT' || sortedRecords[i].status === 'LATE') {
      current++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  for (const record of sortedRecords) {
    if (record.status === 'PRESENT' || record.status === 'LATE') {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { current, longest };
};

export const generateQRCode = (halaqahId: string, sessionType: SessionType, date: string): string => {
  const data = {
    halaqahId,
    sessionType,
    date,
    timestamp: Date.now()
  };
  return btoa(JSON.stringify(data));
};

export const validateQRCode = (qrCode: string, expectedHalaqah: string, expectedDate: string): boolean => {
  try {
    const data = JSON.parse(atob(qrCode));
    return data.halaqahId === expectedHalaqah && data.date === expectedDate;
  } catch {
    return false;
  }
};

export const getAlertSeverityColor = (severity: AttendanceAlert['severity']): string => {
  switch (severity) {
    case 'LOW': return 'text-blue-600 bg-blue-100';
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
    case 'HIGH': return 'text-orange-600 bg-orange-100';
    case 'CRITICAL': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const formatTime = (time: string): string => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}j ${mins}m`;
  }
  return `${mins}m`;
};
