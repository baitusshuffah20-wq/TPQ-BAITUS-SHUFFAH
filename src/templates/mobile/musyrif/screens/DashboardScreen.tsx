import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// Mock Ionicons for web preview
const Ionicons = ({ name, size, color }: any) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.6,
      color: "white",
    }}
  >
    {name?.charAt(0)?.toUpperCase()}
  </div>
);

interface DashboardScreenProps {
  appConfig: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ appConfig }) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Banner data
  const banners = [
    {
      id: 1,
      title: "Selamat Datang Ustadz!",
      subtitle: "Kelola santri dengan mudah",
      image: "https://via.placeholder.com/350x150/059669/FFFFFF?text=Banner+1",
      color: "#059669",
    },
    {
      id: 2,
      title: "Fitur Wallet Terbaru",
      subtitle: "Kelola penghasilan lebih praktis",
      image: "https://via.placeholder.com/350x150/3B82F6/FFFFFF?text=Banner+2",
      color: "#3B82F6",
    },
    {
      id: 3,
      title: "Update Sistem",
      subtitle: "Fitur baru untuk evaluasi hafalan",
      image: "https://via.placeholder.com/350x150/F59E0B/FFFFFF?text=Banner+3",
      color: "#F59E0B",
    },
  ];

  // Auto slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Menu grid data (customizable by admin)
  const menuGrid = [
    { id: 1, title: "Data Santri", icon: "people", color: "#3B82F6", route: "santri" },
    { id: 2, title: "Halaqah", icon: "book", color: "#059669", route: "halaqah" },
    { id: 3, title: "Hafalan", icon: "library", color: "#DC2626", route: "hafalan" },
    { id: 4, title: "Absensi", icon: "checkmark-circle", color: "#F59E0B", route: "attendance" },
    { id: 5, title: "Penilaian", icon: "star", color: "#8B5CF6", route: "assessment" },
    { id: 6, title: "Perilaku", icon: "heart", color: "#EC4899", route: "behavior" },
    { id: 7, title: "Prestasi", icon: "trophy", color: "#10B981", route: "achievements" },
    { id: 8, title: "Laporan", icon: "document-text", color: "#6B7280", route: "reports" },
  ];

  // Wallet data with modern design
  const walletData = {
    balance: "Rp 1.500.000",
    monthlyEarning: "Rp 750.000",
    pendingWithdrawal: "Rp 200.000",
    totalEarned: "Rp 5.250.000",
  };

  // Quick wallet actions
  const walletActions = [
    { id: 1, title: "Tarik Dana", icon: "arrow-down", color: "#059669" },
    { id: 2, title: "Riwayat", icon: "time", color: "#3B82F6" },
    { id: 3, title: "Transfer", icon: "swap-horizontal", color: "#F59E0B" },
    { id: 4, title: "Top Up", icon: "add-circle", color: "#8B5CF6" },
  ];

  const quickActions = [
    {
      title: "Input Absensi",
      icon: "checkmark-circle",
      color: "#059669",
      action: "attendance",
    },
    {
      title: "Evaluasi Hafalan",
      icon: "book",
      color: "#3B82F6",
      action: "hafalan",
    },
    {
      title: "Penilaian Santri",
      icon: "star",
      color: "#F59E0B",
      action: "assessment",
    },
    {
      title: "Lihat Wallet",
      icon: "wallet",
      color: "#8B5CF6",
      action: "wallet",
    },
  ];

  const recentActivities = [
    {
      title: "Hafalan Ahmad Fauzi disetujui",
      subtitle: "Al-Baqarah 1-10 • Nilai: 85",
      time: "2 jam lalu",
      type: "hafalan",
    },
    {
      title: "Absensi hari ini selesai",
      subtitle: "23 dari 25 santri hadir",
      time: "4 jam lalu",
      type: "attendance",
    },
    {
      title: "Penghasilan diterima",
      subtitle: "Rp 50.000 dari sesi pagi",
      time: "1 hari lalu",
      type: "earning",
    },
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: appConfig.primaryColor }]}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Assalamu'alaikum</Text>
          <Text style={styles.userName}>Ustadz Ahmad</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="white" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBannerSlider = () => (
    <View style={styles.bannerContainer}>
      <FlatList
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentBannerIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.bannerSlide, { backgroundColor: item.color }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.bannerImageContainer}>
              <Ionicons name="megaphone" size={40} color="white" />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <View style={styles.bannerIndicators}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: index === currentBannerIndex ? "#FFFFFF" : "#FFFFFF80" },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Statistik Hari Ini</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon} size={20} color="white" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderWalletCard = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.walletCard}
    >
      {/* Wallet Header */}
      <View style={styles.walletHeader}>
        <View style={styles.walletHeaderLeft}>
          <Ionicons name="wallet" size={24} color="white" />
          <Text style={styles.walletTitle}>Wallet Saya</Text>
        </View>
        <TouchableOpacity style={styles.walletEyeButton}>
          <Ionicons name="eye" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Balance */}
      <View style={styles.walletBalance}>
        <Text style={styles.balanceLabel}>Saldo Tersedia</Text>
        <Text style={styles.balanceAmount}>{walletData.balance}</Text>
      </View>

      {/* Wallet Stats Row */}
      <View style={styles.walletStatsRow}>
        <View style={styles.walletStatItem}>
          <Text style={styles.walletStatLabel}>Penghasilan Bulan Ini</Text>
          <Text style={styles.walletStatValue}>{walletData.monthlyEarning}</Text>
        </View>
        <View style={styles.walletStatDivider} />
        <View style={styles.walletStatItem}>
          <Text style={styles.walletStatLabel}>Penarikan Pending</Text>
          <Text style={styles.walletStatValue}>{walletData.pendingWithdrawal}</Text>
        </View>
      </View>

      {/* Wallet Actions */}
      <View style={styles.walletActions}>
        {walletActions.map((action) => (
          <TouchableOpacity key={action.id} style={styles.walletActionButton}>
            <View style={[styles.walletActionIcon, { backgroundColor: action.color + "20" }]}>
              <Ionicons name={action.icon as any} size={20} color={action.color} />
            </View>
            <Text style={styles.walletActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  const renderMenuGrid = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Menu Utama</Text>
      <View style={styles.menuGrid}>
        {menuGrid.map((menu) => (
          <TouchableOpacity key={menu.id} style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: menu.color + "20" }]}>
              <Ionicons name={menu.icon as any} size={24} color={menu.color} />
            </View>
            <Text style={styles.menuTitle}>{menu.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecentActivities = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
      <View style={styles.activitiesList}>
        {recentActivities.map((activity, index) => (
          <View key={index} style={styles.activityCard}>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderBannerSlider()}
      {renderWalletCard()}
      {renderMenuGrid()}
      {renderRecentActivities()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  userName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Banner Slider Styles
  bannerContainer: {
    marginBottom: 20,
  },
  bannerSlide: {
    width: width - 40,
    height: 120,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  bannerImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  // Modern Wallet Card Styles
  walletCard: {
    backgroundColor: "#667eea", // Fallback color
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  walletHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  walletEyeButton: {
    padding: 8,
  },
  walletBalance: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  walletStatsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  walletStatItem: {
    flex: 1,
  },
  walletStatDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 16,
  },
  walletStatLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  walletStatValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  walletActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  walletActionButton: {
    alignItems: "center",
    flex: 1,
  },
  walletActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  walletActionText: {
    fontSize: 12,
    color: "white",
    textAlign: "center",
  },
  // Menu Grid Styles
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: (width - 80) / 4,
    alignItems: "center",
    marginBottom: 20,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
    lineHeight: 16,
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});

export default DashboardScreen;
