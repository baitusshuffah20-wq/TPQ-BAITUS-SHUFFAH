// Global type definitions for the mobile app

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Auth: undefined;
      Main: undefined;
      SantriDetail: { santriId: string };
      PaymentDetail: { paymentId: string };
      Donation: undefined;
      Notification: undefined;
    }
  }
}

// Module declarations for missing types
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.jpg" {
  const content: any;
  export default content;
}

declare module "*.jpeg" {
  const content: any;
  export default content;
}

declare module "*.gif" {
  const content: any;
  export default content;
}

declare module "*.webp" {
  const content: any;
  export default content;
}

// React Native specific types
declare module "react-native" {
  interface TextStyle {
    fontFamily?: string;
    textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  }
}

// Expo specific types
declare module "expo-constants" {
  export interface Constants {
    statusBarHeight: number;
    deviceName?: string;
    platform?: {
      ios?: any;
      android?: any;
    };
  }
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Theme types
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
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textLight: string;
  shadow: string;
  overlay: string;
  transparent: string;
  gradientPrimary: string[];
  gradientSecondary: string[];
  gradientIslamic: string[];
  gradientSuccess: string[];
  gradientWarning: string[];
  gradientError: string[];
  gradientSunset: string[];
}

// Navigation types
export interface NavigationProps {
  navigation: any;
  route: any;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Santri types
export interface Santri {
  id: string;
  name: string;
  class: string;
  progress: number;
  avatar?: string;
}

// Payment types
export interface Payment {
  id: string;
  amount: number;
  status: string;
  date: string;
  description: string;
}

export {};
