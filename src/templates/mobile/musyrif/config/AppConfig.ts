export interface AppConfig {
  // App Information
  appName: string;
  appVersion: string;
  appDescription: string;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  errorColor: string;
  successColor: string;
  warningColor: string;
  cardBackgroundColor: string;

  // Typography
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };

  // Layout
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };

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

  // Features
  features: {
    enableNotifications: boolean;
    enableBiometric: boolean;
    enableDarkMode: boolean;
    enableOfflineMode: boolean;
    enableAnalytics: boolean;
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

  // Custom Menu Grid for Musyrif
  customMenuGrid?: MenuGridItem[];
  customBottomTabs?: BottomTabItem[];

  // Index signature for additional properties
  [key: string]: unknown;
}

export interface MenuGridItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  route: string;
}

export interface BottomTabItem {
  name: string;
  title: string;
  icon: string;
  active?: boolean;
}

// Default Menu Grid for Musyrif (Financial App Style)
export const defaultMusyrifMenuGrid: MenuGridItem[] = [
  { id: 1, title: "Data Santri", icon: "👥", color: "#3B82F6", route: "santri" },
  { id: 2, title: "Halaqah", icon: "📖", color: "#059669", route: "halaqah" },
  { id: 3, title: "Hafalan", icon: "📚", color: "#DC2626", route: "hafalan" },
  { id: 4, title: "Absensi", icon: "✅", color: "#F59E0B", route: "attendance" },
  { id: 5, title: "Penilaian", icon: "⭐", color: "#8B5CF6", route: "assessment" },
  { id: 6, title: "Perilaku", icon: "❤️", color: "#EC4899", route: "behavior" },
  { id: 7, title: "Laporan", icon: "📊", color: "#06B6D4", route: "reports" },
  { id: 8, title: "Profil", icon: "👤", color: "#84CC16", route: "profile" },
];

// Default Bottom Tabs for Musyrif
export const defaultMusyrifBottomTabs: BottomTabItem[] = [
  { name: "Dashboard", title: "Dashboard", icon: "🏠", active: true },
  { name: "Santri", title: "Santri", icon: "👥", active: false },
  { name: "Hafalan", title: "Hafalan", icon: "📚", active: false },
  { name: "Wallet", title: "Wallet", icon: "💰", active: false },
  { name: "Profil", title: "Profil", icon: "👤", active: false },
];

// Default Musyrif Configuration (Financial App Style)
export const defaultAppConfig: AppConfig = {
  // App Information
  appName: "TPQ Musyrif",
  appVersion: "1.0.0",
  appDescription: "Aplikasi Musyrif TPQ Baitus Shuffah",

  // Colors - Financial App Style (Green Theme)
  primaryColor: "#10b981", // Emerald Green
  secondaryColor: "#059669", // Dark Green
  accentColor: "#3B82F6", // Blue accent
  backgroundColor: "#f8fafc",
  surfaceColor: "#FFFFFF",
  textPrimaryColor: "#1f2937",
  textSecondaryColor: "#6b7280",
  errorColor: "#DC2626",
  successColor: "#10b981",
  warningColor: "#F59E0B",
  cardBackgroundColor: "#FFFFFF",

  // Typography
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },

  // Layout
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
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

  // Features
  features: {
    enableNotifications: true,
    enableBiometric: true,
    enableDarkMode: false,
    enableOfflineMode: true,
    enableAnalytics: true,
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
    email: "musyrif@tpq-baitus-shuffah.com",
    address: "Jl. Masjid No. 123, Kelurahan ABC, Kecamatan XYZ, Kota DEF",
    whatsapp: "+62 812-3456-7890",
  },

  // Custom Menu Grid
  customMenuGrid: defaultMusyrifMenuGrid,
  customBottomTabs: defaultMusyrifBottomTabs,
};

// Modern Financial App Configuration
export const modernAppConfig: AppConfig = {
  ...defaultAppConfig,

  // Modern Financial Colors
  primaryColor: "#10b981",
  secondaryColor: "#059669",
  accentColor: "#3B82F6",

  // Enhanced Features
  features: {
    ...defaultAppConfig.features,
    enableAnalytics: true,
    enableBiometric: true,
  },
};

// Alternative Color Themes
export const blueThemeConfig: AppConfig = {
  ...defaultAppConfig,
  primaryColor: "#3B82F6",
  secondaryColor: "#1D4ED8",
  accentColor: "#10b981",
};

export const purpleThemeConfig: AppConfig = {
  ...defaultAppConfig,
  primaryColor: "#8B5CF6",
  secondaryColor: "#7C3AED",
  accentColor: "#10b981",
};

export default defaultAppConfig;
