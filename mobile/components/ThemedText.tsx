import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Theme } from '@/constants/Theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'arabic' | 'quranVerse' | 'prayer' | 'hafalan';
  isArabic?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  isArabic = false,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  // Special colors for specific content types
  let specialColor = color;
  if (type === 'quranVerse') specialColor = Theme.colors.quran;
  if (type === 'prayer') specialColor = Theme.colors.prayer;
  if (type === 'hafalan') specialColor = Theme.colors.hafalan;

  return (
    <Text
      style={[
        { color: specialColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'arabic' || isArabic ? styles.arabic : undefined,
        type === 'quranVerse' ? styles.quranVerse : undefined,
        type === 'prayer' ? styles.prayer : undefined,
        type === 'hafalan' ? styles.hafalan : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 24,
    fontWeight: Theme.typography.fontWeight.semiBold,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.fontSize.xxxl,
    fontWeight: Theme.typography.fontWeight.bold,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    lineHeight: 28,
  },
  link: {
    fontFamily: Theme.typography.fontFamily.regular,
    lineHeight: 30,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.secondary,
    textDecorationLine: 'underline',
  },
  arabic: {
    fontFamily: Theme.typography.fontFamily.arabic,
    fontSize: Theme.typography.fontSize.lg,
    lineHeight: 36,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  quranVerse: {
    fontFamily: Theme.typography.fontFamily.arabic,
    fontSize: Theme.typography.fontSize.lg,
    lineHeight: 36,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: Theme.typography.fontWeight.medium,
  },
  prayer: {
    fontFamily: Theme.typography.fontFamily.arabic,
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: Theme.typography.fontWeight.medium,
  },
  hafalan: {
    fontFamily: Theme.typography.fontFamily.arabic,
    fontSize: Theme.typography.fontSize.lg,
    lineHeight: 36,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});