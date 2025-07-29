import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
  Alert,
} from "react-native";

// Icon component fallback for when @expo/vector-icons is not available
// In a real React Native project, replace this with:
// import { Ionicons } from '@expo/vector-icons';
// and replace all IconComponent usage with Ionicons
const IconComponent: React.FC<{
  name: string;
  size: number;
  color: string;
}> = ({ size, color }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size / 2,
    }}
  />
);

// LinearGradient component fallback for when expo-linear-gradient is not available
// In a real React Native project, replace this with:
// import { LinearGradient } from 'expo-linear-gradient';
const LinearGradientComponent: React.FC<{
  colors: string[];
  style?: object;
  children?: React.ReactNode;
}> = ({ colors, style, children }) => (
  <View style={[{ backgroundColor: colors[0] }, style]}>{children}</View>
);

import CustomHeader from "../components/CustomHeader";

interface AppConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textSecondaryColor: string;
  textPrimaryColor: string;
  cardBackgroundColor: string;
}

interface ProfileScreenProps {
  appConfig: AppConfig;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  class: string;
  joinDate: string;
  totalHafalan: number;
  avatar?: string;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: "navigation" | "switch" | "action";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ appConfig }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const userProfile: UserProfile = {
    name: "Ahmad Fauzi",
    email: "ahmad.fauzi@email.com",
    phone: "+62 812-3456-7890",
    studentId: "TPQ-2024-001",
    class: "Tahfidz Intensif",
    joinDate: "2024-01-15",
    totalHafalan: 15,
  };

  const profileStats = [
    {
      label: "Juz Hafalan",
      value: userProfile.totalHafalan,
      icon: "book",
      color: "#2ECC71",
    },
    { label: "Bulan Bergabung", value: 9, icon: "calendar", color: "#3498DB" },
    { label: "Prestasi", value: 3, icon: "trophy", color: "#F39C12" },
    {
      label: "Kehadiran",
      value: "95%",
      icon: "checkmark-circle",
      color: "#9B59B6",
    },
  ];

  const settingSections: SettingSection[] = [
    {
      title: "Akun",
      items: [
        {
          id: "edit-profile",
          title: "Edit Profil",
          subtitle: "Ubah informasi pribadi",
          icon: "person-outline",
          type: "navigation",
          onPress: () => console.log("Edit Profile"),
        },
        {
          id: "change-password",
          title: "Ubah Password",
          subtitle: "Keamanan akun",
          icon: "lock-closed-outline",
          type: "navigation",
          onPress: () => console.log("Change Password"),
        },
        {
          id: "privacy",
          title: "Privasi & Keamanan",
          subtitle: "Pengaturan privasi",
          icon: "shield-outline",
          type: "navigation",
          onPress: () => console.log("Privacy Settings"),
        },
      ],
    },
    {
      title: "Pengaturan",
      items: [
        {
          id: "notifications",
          title: "Notifikasi",
          subtitle: "Push notifications",
          icon: "notifications-outline",
          type: "switch",
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: "biometric",
          title: "Biometric Login",
          subtitle: "Fingerprint/Face ID",
          icon: "finger-print-outline",
          type: "switch",
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
        {
          id: "dark-mode",
          title: "Mode Gelap",
          subtitle: "Tema aplikasi",
          icon: "moon-outline",
          type: "switch",
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
      ],
    },
    {
      title: "Bantuan",
      items: [
        {
          id: "help",
          title: "Pusat Bantuan",
          subtitle: "FAQ dan panduan",
          icon: "help-circle-outline",
          type: "navigation",
          onPress: () => console.log("Help Center"),
        },
        {
          id: "contact",
          title: "Hubungi Kami",
          subtitle: "Customer support",
          icon: "call-outline",
          type: "navigation",
          onPress: () => console.log("Contact Us"),
        },
        {
          id: "about",
          title: "Tentang Aplikasi",
          subtitle: "Versi 1.0.0",
          icon: "information-circle-outline",
          type: "navigation",
          onPress: () => console.log("About App"),
        },
      ],
    },
    {
      title: "Lainnya",
      items: [
        {
          id: "logout",
          title: "Keluar",
          subtitle: "Logout dari akun",
          icon: "log-out-outline",
          type: "action",
          onPress: () => handleLogout(),
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: () => console.log("Logout"),
        },
      ],
    );
  };

  const renderProfileHeader = () => (
    <LinearGradientComponent
      colors={[appConfig.primaryColor, appConfig.secondaryColor]}
      style={styles.profileHeader}
    >
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          {userProfile.avatar ? (
            <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <IconComponent name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userClass}>{userProfile.class}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          <Text style={styles.userId}>ID: {userProfile.studentId}</Text>
        </View>
      </View>
    </LinearGradientComponent>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Statistik</Text>
      <View style={styles.statsGrid}>
        {profileStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}
            >
              <IconComponent name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === "switch"}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIcon,
            item.id === "logout" && { backgroundColor: "#E74C3C20" },
          ]}
        >
          <IconComponent
            name={item.icon}
            size={20}
            color={item.id === "logout" ? "#E74C3C" : "#7f8c8d"}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              item.id === "logout" && { color: "#E74C3C" },
            ]}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.settingRight}>
        {item.type === "switch" ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{
              false: "#e9ecef",
              true: appConfig.primaryColor + "50",
            }}
            thumbColor={item.value ? appConfig.primaryColor : "#f4f3f4"}
          />
        ) : (
          <IconComponent name="chevron-forward" size={20} color="#bdc3c7" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSettingSection = (section: SettingSection) => (
    <View key={section.title} style={styles.settingSection}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.settingCard}>
        {section.items.map((item: SettingItem, index: number) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < section.items.length - 1 && (
              <View style={styles.settingDivider} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: appConfig.backgroundColor }]}
    >
      <CustomHeader
        title="Profil"
        subtitle="Kelola akun Anda"
        showNotification={true}
        appConfig={appConfig}
        notificationCount={3}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderStatsSection()}

        {settingSections.map(renderSettingSection)}

        <View style={styles.footer}>
          <Text style={styles.footerText}>TPQ Baitus Shuffah</Text>
          <Text style={styles.footerVersion}>Versi 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  userClass: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 2,
  },
  userId: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.7,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    textAlign: "center",
  },
  settingSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  settingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 10,
  },
  settingDivider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginLeft: 62,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: "#bdc3c7",
  },
});

export default ProfileScreen;
