import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from "../../constants/theme";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "flat" | "gradient";
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  style,
  padding = SPACING.md,
  margin = 0,
  onPress,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.lg,
      padding,
      margin,
    };

    const variantStyles = {
      default: {
        backgroundColor: COLORS.white,
        ...SHADOWS.sm,
      },
      elevated: {
        backgroundColor: COLORS.white,
        ...SHADOWS.lg,
      },
      flat: {
        backgroundColor: COLORS.gray50,
        borderWidth: 1,
        borderColor: COLORS.border,
      },
      gradient: {
        ...SHADOWS.md,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  if (variant === "gradient") {
    return (
      <LinearGradient
        colors={COLORS.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[getCardStyle(), style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

export default Card;
