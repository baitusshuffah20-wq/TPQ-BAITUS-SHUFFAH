/**
 * Islamic-themed colors for the app.
 * These colors are designed to create a beautiful, modern, and informative Islamic UI.
 */

import { Theme } from './Theme';

const tintColorLight = Theme.colors.primary; // Islamic Green
const tintColorDark = Theme.colors.primaryLight;

export const Colors = {
  light: {
    text: Theme.colors.text,
    background: Theme.colors.background,
    tint: tintColorLight,
    icon: Theme.colors.textLight,
    tabIconDefault: Theme.colors.textLight,
    tabIconSelected: tintColorLight,
    
    // Additional Islamic theme colors
    primary: Theme.colors.primary,
    secondary: Theme.colors.secondary,
    accent: Theme.colors.accent,
    surface: Theme.colors.surface,
    quran: Theme.colors.quran,
    prayer: Theme.colors.prayer,
    hafalan: Theme.colors.hafalan,
  },
  dark: {
    text: Theme.colors.textDark,
    background: Theme.colors.backgroundDark,
    tint: tintColorDark,
    icon: Theme.colors.textLightDark,
    tabIconDefault: Theme.colors.textLightDark,
    tabIconSelected: tintColorDark,
    
    // Additional Islamic theme colors
    primary: Theme.colors.primaryLight,
    secondary: Theme.colors.secondaryLight,
    accent: Theme.colors.accentLight,
    surface: Theme.colors.surfaceDark,
    quran: Theme.colors.quran,
    prayer: Theme.colors.prayer,
    hafalan: Theme.colors.hafalan,
  },
};