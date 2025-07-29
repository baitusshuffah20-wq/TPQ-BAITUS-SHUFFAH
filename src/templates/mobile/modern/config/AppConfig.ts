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

  // Index signature for additional properties
  [key: string]: unknown;

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
}

// Default TPQ Baitus Shuffah Configuration
export const defaultAppConfig: AppConfig = {
  // App Information
  appName: "TPQ Baitus Shuffah",
  appVersion: "1.0.0",
  appDescription: "Aplikasi Sistem Informasi TPQ Baitus Shuffah",

  // Colors - Modern Islamic Theme
  primaryColor: "#2E7D32", // Islamic Green
  secondaryColor: "#4CAF50", // Light Green
  accentColor: "#FF9800", // Orange accent
  backgroundColor: "#F8F9FA",
  surfaceColor: "#FFFFFF",
  textPrimaryColor: "#2C3E50",
  textSecondaryColor: "#7F8C8D",
  errorColor: "#E74C3C",
  successColor: "#27AE60",
  warningColor: "#F39C12",
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
    enableDarkMode: true,
    enableOfflineMode: true,
    enableAnalytics: false,
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
    email: "info@tpq-baitus-shuffah.com",
    address: "Jl. Masjid No. 123, Kelurahan ABC, Kecamatan XYZ, Kota DEF",
    whatsapp: "+62 812-3456-7890",
  },
};

// Alternative Modern Configuration (Kitabisa-inspired)
export const modernAppConfig: AppConfig = {
  ...defaultAppConfig,

  // Modern Colors (Kitabisa-inspired)
  primaryColor: "#667eea",
  secondaryColor: "#764ba2",
  accentColor: "#f093fb",

  // Enhanced Features
  features: {
    ...defaultAppConfig.features,
    enableAnalytics: true,
  },
};

// Blue Theme Configuration
export const blueThemeConfig: AppConfig = {
  ...defaultAppConfig,

  primaryColor: "#3498DB",
  secondaryColor: "#5DADE2",
  accentColor: "#E74C3C",
};

// Purple Theme Configuration
export const purpleThemeConfig: AppConfig = {
  ...defaultAppConfig,

  primaryColor: "#9B59B6",
  secondaryColor: "#BB8FCE",
  accentColor: "#F39C12",
};

export default defaultAppConfig;
