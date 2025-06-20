// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MUSYRIF = 'MUSYRIF',
  WALI = 'WALI'
}

// Santri Types
export interface Santri {
  id: string;
  nis: string; // Nomor Induk Santri
  name: string;
  birthDate: Date;
  birthPlace: string;
  gender: Gender;
  address: string;
  phone?: string;
  email?: string;
  photo?: string;
  waliId: string;
  halaqahId?: string;
  status: SantriStatus;
  enrollmentDate: Date;
  graduationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum SantriStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  GRADUATED = 'GRADUATED',
  DROPPED_OUT = 'DROPPED_OUT'
}

// Halaqah Types
export interface Halaqah {
  id: string;
  name: string;
  description?: string;
  musyrifId: string;
  maxCapacity: number;
  currentCapacity: number;
  schedule: HalaqahSchedule[];
  level: HalaqahLevel;
  status: HalaqahStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface HalaqahSchedule {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  location: string;
}

export enum HalaqahLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum HalaqahStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Hafalan Types
export interface Hafalan {
  id: string;
  santriId: string;
  surahId: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  type: HafalanType;
  status: HafalanStatus;
  grade?: number; // 1-100
  notes?: string;
  musyrifId: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum HafalanType {
  SETORAN = 'SETORAN', // New memorization
  MURAJAAH = 'MURAJAAH', // Review
  TASMI = 'TASMI' // Listening/Testing
}

export enum HafalanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  REJECTED = 'REJECTED'
}

// Attendance Types
export interface Attendance {
  id: string;
  santriId: string;
  halaqahId: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

// Financial Types
export interface Payment {
  id: string;
  santriId: string;
  type: PaymentType;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentType {
  SPP = 'SPP',
  REGISTRATION = 'REGISTRATION',
  BOOK = 'BOOK',
  UNIFORM = 'UNIFORM',
  EVENT = 'EVENT',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  QRIS = 'QRIS',
  E_WALLET = 'E_WALLET'
}

// Donation Types
export interface Donation {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  type: DonationType;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  message?: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum DonationType {
  GENERAL = 'GENERAL',
  BUILDING = 'BUILDING',
  SCHOLARSHIP = 'SCHOLARSHIP',
  EQUIPMENT = 'EQUIPMENT',
  RAMADAN = 'RAMADAN',
  QURBAN = 'QURBAN'
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PAYMENT_DUE = 'PAYMENT_DUE',
  ATTENDANCE = 'ATTENDANCE',
  HAFALAN = 'HAFALAN',
  ANNOUNCEMENT = 'ANNOUNCEMENT'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterSantriForm {
  name: string;
  nis: string;
  birthDate: string;
  birthPlace: string;
  gender: Gender;
  address: string;
  phone?: string;
  email?: string;
  waliName: string;
  waliEmail: string;
  waliPhone: string;
  waliAddress: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalSantri: number;
  totalMusyrif: number;
  totalHalaqah: number;
  totalDonations: number;
  monthlyRevenue: number;
  attendanceRate: number;
  hafalanProgress: number;
  pendingPayments: number;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}
