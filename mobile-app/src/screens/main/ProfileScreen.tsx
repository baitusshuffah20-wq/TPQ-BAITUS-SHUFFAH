import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotifications } from "../../contexts/NotificationContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Heading3,
  Heading4,
  Body1,
  Body2,
  Caption,
} from "../../components/ui/Typography";
import { SPACING, BORDER_RADIUS } from "../../constants/theme";

interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  color?: string;
}

const ProfileScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { user, logout } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { requestPermissions } = useNotifications();

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Keluar", style: "destructive", onPress: logout },
      ],
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (granted) {
        setNotificationsEnabled(true);
      } else {
        Alert.alert(
          "Izin Notifikasi",
          "Untuk mengaktifkan notifikasi, silakan berikan izin di pengaturan aplikasi.",
        );
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const menuItems: ProfileMenuItem[] = [
    {
      id: "edit-profile",
      title: "Edit Profil",
      subtitle: "Ubah informasi pribadi",
      icon: "person-outline",
      action: () => console.log("Edit profile"),
      showArrow: true,
    },
    {
      id: "notifications",
      title: "Notifikasi",
      subtitle: "Kelola pengaturan notifikasi",
      icon: "notifications-outline",
      action: () => {},
      showSwitch: true,
      switchValue: notificationsEnabled,
    },
    {
      id: "dark-mode",
      title: "Mode Gelap",
      subtitle: "Ubah tema aplikasi",
      icon: "moon-outline",
      action: () => {},
      showSwitch: true,
      switchValue: isDarkMode,
    },
    {
      id: "payment-methods",
      title: "Metode Pembayaran",
      subtitle: "Kelola metode pembayaran",
      icon: "card-outline",
      action: () => console.log("Payment methods"),
      showArrow: true,
    },
    {
      id: "donation-history",
      title: "Riwayat Donasi",
      subtitle: "Lihat riwayat donasi Anda",
      icon: "heart-outline",
      action: () => console.log("Donation history"),
      showArrow: true,
    },
    {
      id: "help",
      title: "Bantuan & FAQ",
      subtitle: "Dapatkan bantuan dan jawaban",
      icon: "help-circle-outline",
      action: () => console.log("Help"),
      showArrow: true,
    },
    {
      id: "about",
      title: "Tentang Aplikasi",
      subtitle: "Informasi aplikasi dan versi",
      icon: "information-circle-outline",
      action: () => console.log("About"),
      showArrow: true,
    },
    {
      id: "contact",
      title: "Hubungi TPQ",
      subtitle: "Kontak admin dan ustadz",
      icon: "call-outline",
      action: () => console.log("Contact"),
      showArrow: true,
    },
    {
      id: "logout",
      title: "Keluar",
      subtitle: "Keluar dari aplikasi",
      icon: "log-out-outline",
      action: handleLogout,
      color: colors.error,
    },
  ];

  const renderHeader = () => (
    <LinearGradient colors={colors.gradientPrimary} style={styles.header}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color={colors.white} />
        </View>
        <View style={styles.profileInfo}>
          <Heading3 color={colors.white}>{user?.name}</Heading3>
          <Body2 color={colors.white} style={styles.profileEmail}>
            {user?.email}
          </Body2>
          <Body2 color={colors.white} style={styles.profilePhone}>
            {user?.phone}
          </Body2>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSantriInfo = () => (
    <View style={styles.section}>
      <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
        Santri Terdaftar
      </Heading4>
      {user?.santri?.map((santri, index) => (
        <Card key={santri.id} variant="flat" style={styles.santriCard}>
          <View style={styles.santriInfo}>
            <View style={styles.santriAvatar}>
              <Ionicons
                name={santri.gender === "MALE" ? "person" : "person-outline"}
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.santriDetails}>
              <Body1 color={colors.textPrimary} weight="semiBold">
                {santri.name}
              </Body1>
              <Body2 color={colors.textSecondary}>NIS: {santri.nis}</Body2>
              {santri.halaqah && (
                <Caption color={colors.textSecondary}>
                  Halaqah: {santri.halaqah.name} - {santri.halaqah.ustadz.name}
                </Caption>
              )}
            </View>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    santri.status === "ACTIVE" ? colors.success : colors.error,
                },
              ]}
            />
          </View>
        </Card>
      ))}
    </View>
  );

  const renderMenuItem = (item: ProfileMenuItem) => (
    <TouchableOpacity
      key={item.id}
      onPress={item.action}
      style={styles.menuItem}
      disabled={item.showSwitch}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <Ionicons
            name={item.icon as any}
            size={24}
            color={item.color || colors.textSecondary}
          />
          <View style={styles.menuItemText}>
            <Body1 color={item.color || colors.textPrimary} weight="medium">
              {item.title}
            </Body1>
            {item.subtitle && (
              <Caption color={colors.textSecondary}>{item.subtitle}</Caption>
            )}
          </View>
        </View>

        <View style={styles.menuItemRight}>
          {item.showSwitch && (
            <Switch
              value={item.switchValue}
              onValueChange={
                item.id === "notifications"
                  ? handleNotificationToggle
                  : item.id === "dark-mode"
                    ? toggleTheme
                    : () => {}
              }
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={colors.white}
            />
          )}
          {item.showArrow && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAppInfo = () => (
    <View style={styles.appInfo}>
      <Caption color={colors.textSecondary} align="center">
        TPQ Baitus Shuffah Mobile App
      </Caption>
      <Caption color={colors.textSecondary} align="center">
        Versi 1.0.0
      </Caption>
      <Caption
        color={colors.textSecondary}
        align="center"
        style={styles.copyright}
      >
        © 2024 TPQ Baitus Shuffah
      </Caption>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSantriInfo()}

        <View style={styles.section}>
          <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
            Pengaturan
          </Heading4>
          <Card variant="default" style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <View key={item.id}>
                {renderMenuItem(item)}
                {index < menuItems.length - 1 && (
                  <View style={styles.menuDivider} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {renderAppInfo()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  profilePhone: {
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.lg,
    backgroundColor: "white",
    borderTopLeftRadius: BORDER_RADIUS["2xl"],
    borderTopRightRadius: BORDER_RADIUS["2xl"],
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  santriCard: {
    marginBottom: SPACING.sm,
  },
  santriInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  santriAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  santriDetails: {
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  menuItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  menuItemRight: {
    alignItems: "center",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: SPACING.lg + 24 + SPACING.md,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  copyright: {
    marginTop: SPACING.sm,
  },
  bottomSpacing: {
    height: SPACING["2xl"],
  },
});

export default ProfileScreen;
