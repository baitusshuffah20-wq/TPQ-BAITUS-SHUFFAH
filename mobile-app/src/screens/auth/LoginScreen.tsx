import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Heading2, Body1, Body2 } from "../../components/ui/Typography";
import { SPACING, BORDER_RADIUS } from "../../constants/theme";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login } = useAuth();
  const { colors } = useTheme();

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Email wajib diisi");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Format email tidak valid");
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password wajib diisi");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password minimal 6 karakter");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient colors={colors.gradientPrimary} style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={40} color={colors.white} />
          </View>
          <Heading2 color={colors.white} align="center" style={styles.title}>
            TPQ Baitus Shuffah
          </Heading2>
          <Body1 color={colors.white} align="center" style={styles.subtitle}>
            Aplikasi Wali Santri
          </Body1>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.welcomeSection}>
              <Heading2 color={colors.textPrimary} align="center">
                Selamat Datang
              </Heading2>
              <Body2
                color={colors.textSecondary}
                align="center"
                style={styles.welcomeText}
              >
                Masuk untuk memantau perkembangan putra/putri Anda
              </Body2>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Masukkan email Anda"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={emailError}
              />

              <Input
                label="Password"
                placeholder="Masukkan password Anda"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
                error={passwordError}
              />

              <Button
                title={isLoading ? "Masuk..." : "Masuk"}
                onPress={handleLogin}
                variant="gradient"
                size="lg"
                fullWidth
                loading={isLoading}
                style={styles.loginButton}
              />
            </View>

            <View style={styles.footer}>
              <Body2 color={colors.textSecondary} align="center">
                Lupa password? Hubungi admin TPQ
              </Body2>
              <Body2
                color={colors.textSecondary}
                align="center"
                style={styles.contactInfo}
              >
                📞 (021) 123-4567 | 📧 admin@tpqbaitusshuffah.com
              </Body2>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING["2xl"],
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: BORDER_RADIUS["2xl"],
    borderTopRightRadius: BORDER_RADIUS["2xl"],
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING["2xl"],
    paddingBottom: SPACING.lg,
  },
  welcomeSection: {
    marginBottom: SPACING["2xl"],
  },
  welcomeText: {
    marginTop: SPACING.sm,
  },
  form: {
    marginBottom: SPACING["2xl"],
  },
  loginButton: {
    marginTop: SPACING.lg,
  },
  footer: {
    alignItems: "center",
  },
  contactInfo: {
    marginTop: SPACING.sm,
  },
});

export default LoginScreen;
