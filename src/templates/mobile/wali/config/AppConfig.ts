export interface AppConfig {
  // App Information
  appName: string;
  appVersion: string;
  appDescription: string;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardBackgroundColor: string;
  
  // Status Bar
  statusBarStyle: "light" | "dark" | "auto";
  statusBarColor: string;
  
  // Typography
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  
  // Spacing
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  
  // Features for Wali
  features: {
    enableNotifications: boolean;
    enableBiometric: boolean;
    enableDarkMode: boolean;
    enableOfflineMode: boolean;
    enableAnalytics: boolean;
    enablePaymentReminder: boolean;
    enableProgressTracking: boolean;
    enableMessaging: boolean;
  };
  
  // Social Media
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  
  // Contact Information
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
  };
  
  // Wali-specific Menu Items
  waliMenuItems?: WaliMenuItem[];
  
  // Index signature for additional properties
  [key: string]: unknown;
}

export interface WaliMenuItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  route: string;
  description: string;
  enabled: boolean;
}

// Default configuration for Wali App
export const defaultAppConfig: AppConfig = {
  // App Information
  appName: "TPQ Baitus Shuffah - Wali",
  appVersion: "1.0.0",
  appDescription: "Aplikasi untuk Wali Santri TPQ Baitus Shuffah",
  
  // Colors - Islamic Green Theme
  primaryColor: "#0D9488",
  secondaryColor: "#14B8A6",
  backgroundColor: "#F0FDFA",
  textColor: "#134E4A",
  cardBackgroundColor: "#FFFFFF",
  
  // Status Bar
  statusBarStyle: "dark",
  statusBarColor: "#0D9488",
  
  // Typography
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 20,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // API Configuration
  apiBaseUrl: "https://api.tpq-baitus-shuffah.com",
  apiTimeout: 30000,
  
  // Features for Wali
  features: {
    enableNotifications: true,
    enableBiometric: false,
    enableDarkMode: false,
    enableOfflineMode: true,
    enableAnalytics: false,
    enablePaymentReminder: true,
    enableProgressTracking: true,
    enableMessaging: true,
  },
  
  // Social Media
  socialMedia: {
    facebook: "https://facebook.com/tpq.baitus.shuffah",
    instagram: "https://instagram.com/tpq.baitus.shuffah",
    youtube: "https://youtube.com/@tpqbaitusshuffah",
    website: "https://tpq-baitus-shuffah.com",
  },
  
  // Contact Information
  contact: {
    phone: "+62 812-3456-7890",
    email: "wali@tpq-baitus-shuffah.com",
    address: "Jl. Masjid No. 123, Kelurahan ABC, Kecamatan XYZ, Kota DEF",
    whatsapp: "+62 812-3456-7890",
  },
  
  // Wali-specific Menu Items
  waliMenuItems: [
    {
      id: 1,
      title: "Perkembangan Anak",
      icon: "trending-up",
      color: "#059669",
      route: "ChildProgress",
      description: "Lihat progress hafalan dan nilai anak",
      enabled: true,
    },
    {
      id: 2,
      title: "Tagihan SPP",
      icon: "receipt",
      color: "#DC2626",
      route: "SPPBills",
      description: "Cek dan bayar tagihan SPP",
      enabled: true,
    },
    {
      id: 3,
      title: "Kehadiran",
      icon: "calendar-check",
      color: "#2563EB",
      route: "Attendance",
      description: "Lihat kehadiran anak di TPQ",
      enabled: true,
    },
    {
      id: 4,
      title: "Donasi",
      icon: "heart",
      color: "#7C3AED",
      route: "Donations",
      description: "Berdonasi untuk TPQ",
      enabled: true,
    },
    {
      id: 5,
      title: "Pesan Ustadz",
      icon: "chatbubble",
      color: "#EA580C",
      route: "Messages",
      description: "Komunikasi dengan ustadz",
      enabled: true,
    },
    {
      id: 6,
      title: "Jadwal Pelajaran",
      icon: "time",
      color: "#0891B2",
      route: "Schedule",
      description: "Lihat jadwal pelajaran anak",
      enabled: true,
    },
    {
      id: 7,
      title: "Prestasi",
      icon: "trophy",
      color: "#CA8A04",
      route: "Achievements",
      description: "Lihat prestasi dan pencapaian",
      enabled: true,
    },
    {
      id: 8,
      title: "Pengaturan",
      icon: "settings",
      color: "#6B7280",
      route: "Settings",
      description: "Pengaturan aplikasi",
      enabled: true,
    },
  ],
};

// Modern configuration for Wali App
export const modernAppConfig: AppConfig = {
  ...defaultAppConfig,
  
  // Modern Colors
  primaryColor: "#3B82F6",
  secondaryColor: "#8B5CF6",
  backgroundColor: "#F8FAFC",
  textColor: "#1E293B",
  cardBackgroundColor: "#FFFFFF",
  
  // Status Bar
  statusBarStyle: "dark",
  statusBarColor: "#3B82F6",
  
  features: {
    ...defaultAppConfig.features,
    enableDarkMode: true,
    enableBiometric: true,
    enableAnalytics: true,
  },
};
