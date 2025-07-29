import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { Heading3, Body1 } from "../../components/ui/Typography";
import { SPACING } from "../../constants/theme";

const PaymentDetailScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Heading3 color={colors.textPrimary} align="center">
          Detail Pembayaran
        </Heading3>
        <Body1
          color={colors.textSecondary}
          align="center"
          style={styles.subtitle}
        >
          Fitur ini akan segera tersedia
        </Body1>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  subtitle: {
    marginTop: SPACING.md,
  },
});

export default PaymentDetailScreen;
