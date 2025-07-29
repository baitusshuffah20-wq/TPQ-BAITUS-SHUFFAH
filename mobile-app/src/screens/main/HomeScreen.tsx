import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotifications } from "../../contexts/NotificationContext";
import Card from "../../components/ui/Card";
import {
  Heading3,
  Heading4,
  Body1,
  Body2,
  Caption,
} from "../../components/ui/Typography";
import { SPACING, BORDER_RADIUS } from "../../constants/theme";

const { width } = Dimensions.get("window");

interface DashboardData {
  santriProgress: {
    hafalan: number;
    kehadiran: number;
    nilai: number;
  };
  payments: {
    outstanding: number;
    nextDue: string;
    amount: number;
  };
  announcements: Array<{
    id: string;
    title: string;
    date: string;
    type: "info" | "warning" | "success";
  }>;
  schedule: Array<{
    id: string;
    activity: string;
    time: string;
    location: string;
  }>;
}

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  const { user } = useAuth();
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDashboardData({
        santriProgress: {
          hafalan: 75,
          kehadiran: 92,
          nilai: 85,
        },
        payments: {
          outstanding: 1,
          nextDue: "2024-02-15",
          amount: 150000,
        },
        announcements: [
          {
            id: "1",
            title: "Libur Hari Raya Idul Fitri",
            date: "2024-02-10",
            type: "info",
          },
          {
            id: "2",
            title: "Pembayaran SPP Februari",
            date: "2024-02-08",
            type: "warning",
          },
        ],
        schedule: [
          {
            id: "1",
            activity: "Tahfidz Al-Quran",
            time: "07:00 - 09:00",
            location: "Ruang Utama",
          },
          {
            id: "2",
            activity: "Kajian Hadits",
            time: "09:30 - 11:00",
            location: "Ruang B",
          },
        ],
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return colors.success;
    if (percentage >= 60) return colors.warning;
    return colors.error;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Body1 color={colors.white} style={styles.greeting}>
            Assalamu'alaikum
          </Body1>
          <Heading3
            color={colors.white}
            numberOfLines={1}
            style={styles.userName}
          >
            {user?.name || "Wali Santri"}
          </Heading3>
          <View style={styles.subtitleContainer}>
            <Ionicons
              name="people"
              size={16}
              color={colors.white}
              style={styles.subtitleIcon}
            />
            <Caption color={colors.white} style={styles.subtitle}>
              {user?.santri?.length || 0} Santri terdaftar
            </Caption>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationIconContainer}>
              <Ionicons name="notifications" size={24} color={colors.white} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Caption color={colors.white} style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Caption>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Decorative elements */}
      <View style={styles.headerDecorations}>
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
        <View style={[styles.decorativeCircle, styles.circle3]} />
      </View>
    </LinearGradient>
  );

  const renderSantriCards = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
          Santri Anda
        </Heading4>
        <TouchableOpacity style={styles.seeAllButton}>
          <Caption color={colors.primary} weight="semiBold">
            Lihat Semua
          </Caption>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.santriScrollView}
      >
        {user?.santri?.length > 0 ? (
          user.santri.map((santri, index) => (
            <TouchableOpacity key={santri.id} style={styles.santriCard}>
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={styles.santriCardContent}
              >
                <View style={styles.santriAvatar}>
                  <LinearGradient
                    colors={
                      santri.gender === "MALE"
                        ? ["#667eea", "#764ba2"]
                        : ["#f093fb", "#f5576c"]
                    }
                    style={styles.santriAvatarGradient}
                  >
                    <Ionicons
                      name={
                        santri.gender === "MALE" ? "person" : "person-outline"
                      }
                      size={24}
                      color="white"
                    />
                  </LinearGradient>
                </View>
                <Body1
                  color={colors.textPrimary}
                  weight="semiBold"
                  numberOfLines={1}
                  style={styles.santriName}
                >
                  {santri.name}
                </Body1>
                <Body2
                  color={colors.textSecondary}
                  numberOfLines={1}
                  style={styles.santriNis}
                >
                  {santri.nis}
                </Body2>
                <View style={styles.santriStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          santri.status === "ACTIVE" ? "#10b981" : "#ef4444",
                      },
                    ]}
                  />
                  <Caption color={colors.textSecondary}>
                    {santri.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                  </Caption>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptySantriCard}>
            <Ionicons
              name="person-add"
              size={32}
              color={colors.textSecondary}
            />
            <Body2 color={colors.textSecondary} style={styles.emptySantriText}>
              Belum ada santri terdaftar
            </Body2>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderProgressCards = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
          Progress Pembelajaran
        </Heading4>
        <TouchableOpacity style={styles.seeAllButton}>
          <Caption color={colors.primary} weight="semiBold">
            Detail
          </Caption>
        </TouchableOpacity>
      </View>
      <View style={styles.progressGrid}>
        {dashboardData &&
          Object.entries(dashboardData.santriProgress).map(
            ([key, value], index) => (
              <TouchableOpacity key={key} style={styles.progressCard}>
                <LinearGradient
                  colors={
                    key === "hafalan"
                      ? ["#667eea", "#764ba2"]
                      : key === "kehadiran"
                        ? ["#4facfe", "#00f2fe"]
                        : ["#f093fb", "#f5576c"]
                  }
                  style={styles.progressCardContent}
                >
                  <View style={styles.progressHeader}>
                    <View style={styles.progressIconContainer}>
                      <Ionicons
                        name={
                          key === "hafalan"
                            ? "book"
                            : key === "kehadiran"
                              ? "checkmark-circle"
                              : "star"
                        }
                        size={24}
                        color="white"
                      />
                    </View>
                    <Caption color="white" style={styles.progressLabel}>
                      {key === "hafalan"
                        ? "Hafalan"
                        : key === "kehadiran"
                          ? "Kehadiran"
                          : "Nilai"}
                    </Caption>
                  </View>
                  <Heading3 color="white" style={styles.progressValue}>
                    {value}%
                  </Heading3>
                  <View style={styles.progressBar}>
                    <View style={styles.progressBarBackground} />
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${value}%`,
                        },
                      ]}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ),
          )}
      </View>
    </View>
  );

  const renderPaymentCard = () => (
    <View style={styles.section}>
      <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
        Pembayaran SPP
      </Heading4>
      <Card variant="elevated" style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentIcon}>
            <Ionicons name="card" size={24} color={colors.white} />
          </View>
          <View style={styles.paymentInfo}>
            <Body1 color={colors.textPrimary} weight="semiBold">
              Tagihan Tertunggak
            </Body1>
            <Body2 color={colors.textSecondary}>
              {dashboardData?.payments.outstanding} bulan
            </Body2>
          </View>
        </View>
        <View style={styles.paymentAmount}>
          <Heading3 color={colors.error}>
            {dashboardData && formatCurrency(dashboardData.payments.amount)}
          </Heading3>
          <Body2 color={colors.textSecondary}>
            Jatuh tempo: {dashboardData?.payments.nextDue}
          </Body2>
        </View>
        <TouchableOpacity style={styles.payButton}>
          <LinearGradient
            colors={colors.gradientSecondary}
            style={styles.payButtonGradient}
          >
            <Body1 color={colors.white} weight="semiBold">
              Bayar Sekarang
            </Body1>
          </LinearGradient>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderAnnouncements = () => (
    <View style={styles.section}>
      <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
        Pengumuman Terbaru
      </Heading4>
      {dashboardData?.announcements.map((announcement) => (
        <Card
          key={announcement.id}
          variant="flat"
          style={styles.announcementCard}
        >
          <View style={styles.announcementHeader}>
            <Ionicons
              name={
                announcement.type === "info"
                  ? "information-circle"
                  : announcement.type === "warning"
                    ? "warning"
                    : "checkmark-circle"
              }
              size={20}
              color={
                announcement.type === "info"
                  ? colors.info
                  : announcement.type === "warning"
                    ? colors.warning
                    : colors.success
              }
            />
            <Body1
              color={colors.textPrimary}
              weight="semiBold"
              style={styles.announcementTitle}
            >
              {announcement.title}
            </Body1>
          </View>
          <Caption color={colors.textSecondary}>{announcement.date}</Caption>
        </Card>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
        Menu Utama
      </Heading4>
      <View style={styles.quickActionsGrid}>
        {[
          {
            icon: "analytics",
            label: "Dashboard",
            color: "#667eea",
            description: "Ringkasan informasi santri",
          },
          {
            icon: "trending-up",
            label: "Progress",
            color: "#f093fb",
            description: "Perkembangan belajar santri",
          },
          {
            icon: "card",
            label: "Pembayaran",
            color: "#4facfe",
            description: "Sistem pembayaran SPP online",
          },
          {
            icon: "chatbubbles",
            label: "Pesan",
            color: "#43e97b",
            description: "Komunikasi dengan musyrif dan admin",
          },
          {
            icon: "person",
            label: "Profil",
            color: "#fa709a",
            description: "Kelola profil dan pengaturan",
          },
          {
            icon: "checkmark-done",
            label: "Tugas",
            color: "#ffecd2",
            description: "Tugas dan penilaian",
          },
        ].map((action, index) => (
          <TouchableOpacity key={index} style={styles.quickActionItem}>
            <LinearGradient
              colors={[action.color, action.color + "80"]}
              style={styles.quickActionCard}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name={action.icon as any} size={28} color="white" />
              </View>
              <Body2
                color="white"
                weight="semiBold"
                style={styles.quickActionTitle}
              >
                {action.label}
              </Body2>
              <Caption color="white" style={styles.quickActionDescription}>
                {action.description}
              </Caption>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {renderHeader()}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderSantriCards()}
        {renderProgressCards()}
        {renderPaymentCard()}
        {renderAnnouncements()}
        {renderQuickActions()}
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING["2xl"],
    paddingHorizontal: SPACING.lg,
    position: "relative",
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  greeting: {
    opacity: 0.9,
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: SPACING.xs,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  subtitleIcon: {
    marginRight: SPACING.xs,
    opacity: 0.8,
  },
  subtitle: {
    opacity: 0.8,
  },
  notificationButton: {
    padding: SPACING.sm,
  },
  notificationIconContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4757",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  headerDecorations: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorativeCircle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle1: {
    width: 120,
    height: 120,
    top: -60,
    right: -30,
  },
  circle2: {
    width: 80,
    height: 80,
    top: 20,
    right: 100,
  },
  circle3: {
    width: 60,
    height: 60,
    bottom: -30,
    left: -20,
  },
  content: {
    flex: 1,
    marginTop: -SPACING["2xl"],
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: BORDER_RADIUS["3xl"] || 24,
    borderTopRightRadius: BORDER_RADIUS["3xl"] || 24,
    paddingTop: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    flex: 1,
  },
  seeAllButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  santriScrollView: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  santriCard: {
    marginRight: SPACING.md,
  },
  santriCardContent: {
    width: 160,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  santriAvatar: {
    marginBottom: SPACING.md,
  },
  santriAvatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  santriName: {
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  santriNis: {
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  santriStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  emptySantriCard: {
    width: 160,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    marginLeft: SPACING.lg,
  },
  emptySantriText: {
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  progressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -SPACING.xs,
  },
  progressCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  progressCardContent: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  progressHeader: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  progressIconContainer: {
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    opacity: 0.9,
    textAlign: "center",
  },
  progressValue: {
    textAlign: "center",
    marginBottom: SPACING.md,
    fontSize: 28,
    fontWeight: "bold",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    position: "relative",
    overflow: "hidden",
  },
  progressBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 3,
  },
  paymentCard: {
    padding: SPACING.lg,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    marginBottom: SPACING.lg,
  },
  payButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  payButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -SPACING.xs,
  },
  quickActionItem: {
    width: "48%",
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  quickActionCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    minHeight: 120,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActionIconContainer: {
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    marginBottom: SPACING.xs,
  },
  quickActionDescription: {
    opacity: 0.9,
    lineHeight: 16,
  },
  announcementCard: {
    marginBottom: SPACING.sm,
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  announcementTitle: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  bottomSpacing: {
    height: SPACING["2xl"],
  },
});

export default HomeScreen;
