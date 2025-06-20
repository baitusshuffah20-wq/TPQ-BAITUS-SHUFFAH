import { View, type ViewProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Theme } from '@/constants/Theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'primary' | 'secondary' | 'accent' | 'quran' | 'prayer' | 'hafalan';
  withShadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'round';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  withShadow = 'none',
  rounded = 'none',
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  
  // Get variant background color
  let bgColor = backgroundColor;
  if (variant === 'card') bgColor = useThemeColor({}, 'surface');
  if (variant === 'primary') bgColor = Theme.colors.primary;
  if (variant === 'secondary') bgColor = Theme.colors.secondary;
  if (variant === 'accent') bgColor = Theme.colors.accent;
  if (variant === 'quran') bgColor = Theme.colors.quran;
  if (variant === 'prayer') bgColor = Theme.colors.prayer;
  if (variant === 'hafalan') bgColor = Theme.colors.hafalan;
  
  // Get shadow style
  let shadowStyle = {};
  if (withShadow === 'sm') shadowStyle = Theme.shadows.sm;
  if (withShadow === 'md') shadowStyle = Theme.shadows.md;
  if (withShadow === 'lg') shadowStyle = Theme.shadows.lg;
  
  // Get border radius
  let borderRadius = 0;
  if (rounded === 'xs') borderRadius = Theme.borderRadius.xs;
  if (rounded === 'sm') borderRadius = Theme.borderRadius.sm;
  if (rounded === 'md') borderRadius = Theme.borderRadius.md;
  if (rounded === 'lg') borderRadius = Theme.borderRadius.lg;
  if (rounded === 'xl') borderRadius = Theme.borderRadius.xl;
  if (rounded === 'round') borderRadius = Theme.borderRadius.round;

  return (
    <View 
      style={[
        { backgroundColor: bgColor, borderRadius },
        shadowStyle,
        styles.container,
        style
      ]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
  },
});