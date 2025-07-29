import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Color Palette - Modern Islamic Theme
export const COLORS = {
  // Primary Colors - Islamic Green & Blue
  primary: "#1e40af", // Deep Blue
  primaryLight: "#3b82f6",
  primaryDark: "#1e3a8a",

  // Secondary Colors - Warm Gold
  secondary: "#f59e0b",
  secondaryLight: "#fbbf24",
  secondaryDark: "#d97706",

  // Islamic Green
  islamic: "#059669",
  islamicLight: "#10b981",
  islamicDark: "#047857",

  // Neutral Colors
  white: "#ffffff",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",

  // Status Colors
  success: "#10b981",
  successLight: "#34d399",
  successDark: "#047857",
  warning: "#f59e0b",
  warningLight: "#fbbf24",
  warningDark: "#d97706",
  error: "#ef4444",
  errorLight: "#f87171",
  errorDark: "#dc2626",
  info: "#3b82f6",
  infoLight: "#60a5fa",
  infoDark: "#2563eb",

  // Background Colors
  background: "#ffffff",
  backgroundSecondary: "#f9fafb",
  backgroundDark: "#1f2937",
  surface: "#ffffff",

  // Text Colors
  text: "#111827",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textLight: "#9ca3af",
  textWhite: "#ffffff",

  // Border Colors
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  borderDark: "#d1d5db",

  // Shadow Colors
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowDark: "rgba(0, 0, 0, 0.25)",
  overlay: "rgba(0, 0, 0, 0.5)",
  transparent: "transparent",

  // Gradient Colors
  gradientPrimary: ["#1e40af", "#3b82f6"] as const,
  gradientSecondary: ["#f59e0b", "#fbbf24"] as const,
  gradientIslamic: ["#059669", "#10b981"] as const,
  gradientSunset: ["#f59e0b", "#ef4444"] as const,
};

// Typography
export const FONTS = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

// Border Radius
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 8,
  },
};

// Screen Dimensions
export const SCREEN = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 414,
  isLarge: width >= 414,
};

// Layout
export const LAYOUT = {
  padding: SPACING.md,
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.lg,
  headerHeight: 60,
  tabBarHeight: 80,
  buttonHeight: 48,
  inputHeight: 48,
};

// Animation
export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
};

// Islamic Theme Specific
export const ISLAMIC_THEME = {
  colors: {
    mosque: "#1e40af",
    quran: "#059669",
    prayer: "#f59e0b",
    kaaba: "#374151",
    crescent: "#fbbf24",
  },
  patterns: {
    geometric: "geometric",
    arabesque: "arabesque",
    calligraphy: "calligraphy",
  },
};

// Component Variants
export const VARIANTS = {
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      color: COLORS.white,
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      color: COLORS.white,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: COLORS.primary,
      color: COLORS.primary,
    },
    ghost: {
      backgroundColor: "transparent",
      color: COLORS.primary,
    },
  },
  card: {
    default: {
      backgroundColor: COLORS.white,
      borderRadius: BORDER_RADIUS.lg,
      ...SHADOWS.md,
    },
    elevated: {
      backgroundColor: COLORS.white,
      borderRadius: BORDER_RADIUS.xl,
      ...SHADOWS.lg,
    },
    flat: {
      backgroundColor: COLORS.gray50,
      borderRadius: BORDER_RADIUS.lg,
    },
  },
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  SCREEN,
  LAYOUT,
  ANIMATION,
  ISLAMIC_THEME,
  VARIANTS,
};
