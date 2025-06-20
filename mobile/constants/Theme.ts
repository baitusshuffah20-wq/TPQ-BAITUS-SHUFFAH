// Islamic-themed design system
export const Theme = {
  colors: {
    // Primary colors
    primary: '#1E8449', // Islamic Green
    primaryDark: '#145A32',
    primaryLight: '#58D68D',
    
    // Secondary colors
    secondary: '#2E86C1', // Blue
    secondaryDark: '#1B4F72',
    secondaryLight: '#85C1E9',
    
    // Accent colors
    accent: '#D4AC0D', // Gold
    accentDark: '#9A7D0A',
    accentLight: '#F4D03F',
    
    // Neutral colors
    background: '#F8F9F9',
    backgroundDark: '#121212',
    surface: '#FFFFFF',
    surfaceDark: '#1E1E1E',
    
    // Text colors
    text: '#2C3E50',
    textDark: '#ECEFF1',
    textLight: '#7F8C8D',
    textLightDark: '#B2B2B2',
    
    // Status colors
    success: '#27AE60',
    error: '#C0392B',
    warning: '#F39C12',
    info: '#3498DB',
    
    // Special colors
    quran: '#4A6741', // Special green for Quran-related features
    prayer: '#7D3C98', // Purple for prayer-related features
    hafalan: '#D35400', // Orange for hafalan tracking
  },
  
  // Typography
  typography: {
    fontFamily: {
      regular: 'SpaceMono',
      arabic: 'Amiri', // Will be loaded
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  
  // Islamic patterns and decorations
  patterns: {
    geometric: require('../assets/images/pattern-geometric.png'),
    arabesque: require('../assets/images/pattern-arabesque.png'),
  },
};

// Dark theme overrides
export const DarkTheme = {
  ...Theme,
  colors: {
    ...Theme.colors,
    background: Theme.colors.backgroundDark,
    surface: Theme.colors.surfaceDark,
    text: Theme.colors.textDark,
    textLight: Theme.colors.textLightDark,
  },
};

export default Theme;