import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { COLORS, FONTS, FONT_SIZES } from "../../constants/theme";

interface TypographyProps {
  children: React.ReactNode;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body1"
    | "body2"
    | "caption"
    | "overline";
  color?: string;
  align?: "left" | "center" | "right";
  weight?: "regular" | "medium" | "semiBold" | "bold";
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "body1",
  color = COLORS.textPrimary,
  align = "left",
  weight,
  style,
  numberOfLines,
}) => {
  const getTextStyle = (): TextStyle => {
    const variantStyles = {
      h1: {
        fontSize: FONT_SIZES["4xl"],
        fontFamily: FONTS.bold,
        lineHeight: FONT_SIZES["4xl"] * 1.2,
      },
      h2: {
        fontSize: FONT_SIZES["3xl"],
        fontFamily: FONTS.bold,
        lineHeight: FONT_SIZES["3xl"] * 1.2,
      },
      h3: {
        fontSize: FONT_SIZES["2xl"],
        fontFamily: FONTS.semiBold,
        lineHeight: FONT_SIZES["2xl"] * 1.3,
      },
      h4: {
        fontSize: FONT_SIZES.xl,
        fontFamily: FONTS.semiBold,
        lineHeight: FONT_SIZES.xl * 1.3,
      },
      body1: {
        fontSize: FONT_SIZES.base,
        fontFamily: FONTS.regular,
        lineHeight: FONT_SIZES.base * 1.5,
      },
      body2: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.regular,
        lineHeight: FONT_SIZES.sm * 1.5,
      },
      caption: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.regular,
        lineHeight: FONT_SIZES.xs * 1.4,
      },
      overline: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        textTransform: "uppercase" as const,
        letterSpacing: 1,
        lineHeight: FONT_SIZES.xs * 1.4,
      },
    };

    const weightStyles = {
      regular: { fontFamily: FONTS.regular },
      medium: { fontFamily: FONTS.medium },
      semiBold: { fontFamily: FONTS.semiBold },
      bold: { fontFamily: FONTS.bold },
    };

    return {
      ...variantStyles[variant],
      ...(weight && weightStyles[weight]),
      color,
      textAlign: align,
    };
  };

  return (
    <Text style={[getTextStyle(), style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

// Convenience components
export const Heading1: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="h4" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="overline" {...props} />
);

export default Typography;
