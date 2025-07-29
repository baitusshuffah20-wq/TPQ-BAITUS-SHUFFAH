// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "WALI" | "USTADZ" | "ADMIN";
  santri?: Santri[];
}

// Santri Types
export interface Santri {
  id: string;
  nis: string;
  name: string;
  birthDate: string;
  birthPlace?: string;
  gender: "MALE" | "FEMALE";
  address?: string;
  phone?: string;
  email?: string;
  waliId?: string;
  halaqahId?: string;
  enrollmentDate: string;
  status: "ACTIVE" | "INACTIVE";
  notes?: string;
  halaqah?: Halaqah;
  wali?: User;
}

// Halaqah Types
export interface Halaqah {
  id: string;
  name: string;
  level: string;
  description?: string;
  ustadz: User;
  santri?: Santri[];
}

// Progress Types
export interface HafalanProgress {
  id: string;
  santriId: string;
  surahId: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  totalAyah: number;
  completedAyah: number;
  percentage: number;
  status: "IN_PROGRESS" | "COMPLETED" | "REVIEW";
  lastUpdated: string;
  santri?: Santri;
}

// Attendance Types
export interface Attendance {
  id: string;
  santriId: string;
  halaqahId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "SICK" | "PERMISSION";
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  santri?: Santri;
  halaqah?: Halaqah;
}

// Payment Types
export interface SPPRecord {
  id: string;
  santriId: string;
  month: number;
  year: number;
  amount: number;
  paidAmount: number;
  discount: number;
  fine: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  santri?: Santri;
}

// Donation Types
export interface Donation {
  id: string;
  donorId?: string;
  amount: number;
  category: string;
  description?: string;
  anonymous: boolean;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod?: string;
  donationDate: string;
  donor?: User;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "FILE";
  timestamp: string;
  read: boolean;
  sender?: User;
  receiver?: User;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "PAYMENT" | "PROGRESS" | "ANNOUNCEMENT" | "MESSAGE";
  data?: any;
  read: boolean;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SantriDetail: { santriId: string };
  PaymentDetail: { paymentId: string };
  Donation: undefined;
  Notification: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  Payment: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Theme Types
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  islamic: string;
  islamicLight: string;
  islamicDark: string;
  white: string;
  black: string;
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  backgroundSecondary: string;
  backgroundDark: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  textWhite: string;
  border: string;
  borderLight: string;
  borderDark: string;
  shadow: string;
  shadowDark: string;
  gradientPrimary: string[];
  gradientSecondary: string[];
  gradientIslamic: string[];
  gradientSunset: string[];
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Dashboard Types
export interface DashboardStats {
  totalSantri: number;
  totalHalaqah: number;
  totalProgress: number;
  totalPayments: number;
}

export interface ProgressSummary {
  hafalan: number;
  kehadiran: number;
  nilai: number;
}

export interface PaymentSummary {
  totalOutstanding: number;
  nextDueDate: string;
  totalPaid: number;
  thisYear: number;
}

// Export all types
export * from "./api";
export * from "./components";

// Re-export commonly used React Native types
export type { ViewStyle, TextStyle, ImageStyle } from "react-native";
