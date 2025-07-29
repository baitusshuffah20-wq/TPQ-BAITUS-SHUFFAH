import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  BORDER_RADIUS,
  SPACING,
} from "../../constants/theme";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const getContainerStyle = (): ViewStyle => ({
    borderWidth: 1.5,
    borderColor: error
      ? COLORS.error
      : isFocused
        ? COLORS.primary
        : COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: disabled ? COLORS.gray100 : COLORS.white,
    flexDirection: "row",
    alignItems: multiline ? "flex-start" : "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: multiline ? SPACING.md : SPACING.sm,
    minHeight: multiline ? numberOfLines * 24 + 32 : 48,
  });

  const getInputStyle = (): TextStyle => ({
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    textAlignVertical: multiline ? "top" : "center",
  });

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setIsPasswordVisible(!isPasswordVisible);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={getContainerStyle()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={COLORS.gray400}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={
                secureTextEntry
                  ? isPasswordVisible
                    ? "eye-off-outline"
                    : "eye-outline"
                  : (rightIcon as any)
              }
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  error: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});

export default Input;
