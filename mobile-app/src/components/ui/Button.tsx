import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
} from "../../constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.lg,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };

    // Size styles
    const sizeStyles = {
      sm: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        minHeight: 48,
      },
      lg: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        minHeight: 56,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.sm,
      },
      secondary: {
        backgroundColor: COLORS.secondary,
        ...SHADOWS.sm,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: COLORS.primary,
      },
      ghost: {
        backgroundColor: "transparent",
      },
      gradient: {
        ...SHADOWS.md,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: "100%" }),
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: FONTS.semiBold,
      textAlign: "center",
    };

    // Size styles
    const sizeStyles = {
      sm: { fontSize: FONT_SIZES.sm },
      md: { fontSize: FONT_SIZES.base },
      lg: { fontSize: FONT_SIZES.lg },
    };

    // Variant styles
    const variantStyles = {
      primary: { color: COLORS.white },
      secondary: { color: COLORS.white },
      outline: { color: COLORS.primary },
      ghost: { color: COLORS.primary },
      gradient: { color: COLORS.white },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "ghost"
              ? COLORS.primary
              : COLORS.white
          }
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <View style={[styles.icon, { marginRight: SPACING.sm }]}>
              {icon}
            </View>
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === "right" && (
            <View style={[styles.icon, { marginLeft: SPACING.sm }]}>
              {icon}
            </View>
          )}
        </>
      )}
    </View>
  );

  if (variant === "gradient") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={getButtonStyle()}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Button;
