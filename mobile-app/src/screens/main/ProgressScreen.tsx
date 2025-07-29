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

interface ProgressData {
  santriId: string;
  hafalan: {
    currentSurah: string;
    currentAyah: number;
    totalAyah: number;
    percentage: number;
    recentProgress: Array<{
      date: string;
      surah: string;
      ayah: number;
      status: "completed" | "review" | "new";
    }>;
  };
  akademik: {
    subjects: Array<{
      name: string;
      score: number;
      grade: string;
      lastUpdate: string;
    }>;
    average: number;
  };
  kehadiran: {
    thisMonth: number;
    totalDays: number;
    percentage: number;
    recentAttendance: Array<{
      date: string;
      status: "present" | "absent" | "late" | "sick";
      note?: string;
    }>;
  };
  behavior: {
    score: number;
    categories: Array<{
      name: string;
      score: number;
      maxScore: number;
    }>;
    recentEvaluations: Array<{
      date: string;
      category: string;
      score: number;
      note: string;
    }>;
  };
}

const ProgressScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<string>("");
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "hafalan" | "akademik" | "kehadiran" | "behavior"
  >("hafalan");

  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (user?.santri && user.santri.length > 0) {
      setSelectedSantri(user.santri[0].id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedSantri) {
      loadProgressData();
    }
  }, [selectedSantri]);

  const loadProgressData = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProgressData({
        santriId: selectedSantri,
        hafalan: {
          currentSurah: "Al-Baqarah",
          currentAyah: 156,
          totalAyah: 286,
          percentage: 55,
          recentProgress: [
            {
              date: "2024-02-10",
              surah: "Al-Baqarah",
              ayah: 156,
              status: "completed",
            },
            {
              date: "2024-02-09",
              surah: "Al-Baqarah",
              ayah: 155,
              status: "review",
            },
            {
              date: "2024-02-08",
              surah: "Al-Baqarah",
              ayah: 154,
              status: "completed",
            },
          ],
        },
        akademik: {
          subjects: [
            {
              name: "Tahfidz",
              score: 85,
              grade: "A",
              lastUpdate: "2024-02-10",
            },
            {
              name: "Tajwid",
              score: 78,
              grade: "B+",
              lastUpdate: "2024-02-08",
            },
            {
              name: "Hadits",
              score: 82,
              grade: "A-",
              lastUpdate: "2024-02-07",
            },
            { name: "Fiqh", score: 75, grade: "B", lastUpdate: "2024-02-05" },
          ],
          average: 80,
        },
        kehadiran: {
          thisMonth: 18,
          totalDays: 20,
          percentage: 90,
          recentAttendance: [
            { date: "2024-02-10", status: "present" },
            { date: "2024-02-09", status: "present" },
            { date: "2024-02-08", status: "late", note: "Terlambat 15 menit" },
            { date: "2024-02-07", status: "absent", note: "Sakit" },
          ],
        },
        behavior: {
          score: 85,
          categories: [
            { name: "Akhlak", score: 90, maxScore: 100 },
            { name: "Kedisiplinan", score: 80, maxScore: 100 },
            { name: "Kerjasama", score: 85, maxScore: 100 },
          ],
          recentEvaluations: [
            {
              date: "2024-02-10",
              category: "Akhlak",
              score: 90,
              note: "Sangat sopan dan ramah",
            },
            {
              date: "2024-02-08",
              category: "Kedisiplinan",
              score: 80,
              note: "Perlu peningkatan ketepatan waktu",
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error loading progress data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.warning;
    return colors.error;
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case "present":
        return "checkmark-circle";
      case "late":
        return "time";
      case "sick":
        return "medical";
      case "absent":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case "present":
        return colors.success;
      case "late":
        return colors.warning;
      case "sick":
        return colors.info;
      case "absent":
        return colors.error;
      default:
        return colors.gray400;
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={colors.gradientPrimary} style={styles.header}>
      <View style={styles.headerContent}>
        <Heading3 color={colors.white}>Progress Santri</Heading3>
        {user?.santri && user.santri.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.santriSelector}
          >
            {user.santri.map((santri) => (
              <TouchableOpacity
                key={santri.id}
                onPress={() => setSelectedSantri(santri.id)}
                style={[
                  styles.santriTab,
                  selectedSantri === santri.id && styles.santriTabActive,
                ]}
              >
                <Body2
                  color={
                    selectedSantri === santri.id ? colors.primary : colors.white
                  }
                  weight={selectedSantri === santri.id ? "semiBold" : "regular"}
                >
                  {santri.name}
                </Body2>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { key: "hafalan", label: "Hafalan", icon: "book" },
        { key: "akademik", label: "Akademik", icon: "school" },
        { key: "kehadiran", label: "Kehadiran", icon: "calendar" },
        { key: "behavior", label: "Perilaku", icon: "star" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key as any)}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.key ? colors.primary : colors.gray400}
          />
          <Caption
            color={activeTab === tab.key ? colors.primary : colors.gray400}
            weight={activeTab === tab.key ? "semiBold" : "regular"}
            style={styles.tabLabel}
          >
            {tab.label}
          </Caption>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHafalanContent = () => (
    <View style={styles.content}>
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="book" size={24} color={colors.islamic} />
          <View style={styles.summaryInfo}>
            <Heading4 color={colors.textPrimary}>
              {progressData?.hafalan.currentSurah}
            </Heading4>
            <Body2 color={colors.textSecondary}>
              Ayat {progressData?.hafalan.currentAyah} dari{" "}
              {progressData?.hafalan.totalAyah}
            </Body2>
          </View>
          <View style={styles.percentageContainer}>
            <Heading3 color={colors.islamic}>
              {progressData?.hafalan.percentage}%
            </Heading3>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressData?.hafalan.percentage || 0}%`,
                backgroundColor: colors.islamic,
              },
            ]}
          />
        </View>
      </Card>

      <Card variant="default" style={styles.detailCard}>
        <Heading4 color={colors.textPrimary} style={styles.cardTitle}>
          Progress Terbaru
        </Heading4>
        {progressData?.hafalan.recentProgress.map((progress, index) => (
          <View key={index} style={styles.progressItem}>
            <View style={styles.progressDate}>
              <Caption color={colors.textSecondary}>{progress.date}</Caption>
            </View>
            <View style={styles.progressDetails}>
              <Body1 color={colors.textPrimary} weight="medium">
                {progress.surah} - Ayat {progress.ayah}
              </Body1>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      progress.status === "completed"
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                <Caption color={colors.white}>
                  {progress.status === "completed" ? "Selesai" : "Review"}
                </Caption>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );

  const renderAkademikContent = () => (
    <View style={styles.content}>
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="school" size={24} color={colors.primary} />
          <View style={styles.summaryInfo}>
            <Heading4 color={colors.textPrimary}>Rata-rata Nilai</Heading4>
            <Body2 color={colors.textSecondary}>
              {progressData?.akademik.subjects.length} Mata Pelajaran
            </Body2>
          </View>
          <View style={styles.percentageContainer}>
            <Heading3
              color={getScoreColor(progressData?.akademik.average || 0)}
            >
              {progressData?.akademik.average}
            </Heading3>
          </View>
        </View>
      </Card>

      <Card variant="default" style={styles.detailCard}>
        <Heading4 color={colors.textPrimary} style={styles.cardTitle}>
          Detail Nilai
        </Heading4>
        {progressData?.akademik.subjects.map((subject, index) => (
          <View key={index} style={styles.subjectItem}>
            <View style={styles.subjectInfo}>
              <Body1 color={colors.textPrimary} weight="medium">
                {subject.name}
              </Body1>
              <Caption color={colors.textSecondary}>
                Update: {subject.lastUpdate}
              </Caption>
            </View>
            <View style={styles.subjectScore}>
              <Heading4 color={getScoreColor(subject.score)}>
                {subject.score}
              </Heading4>
              <Caption color={colors.textSecondary}>({subject.grade})</Caption>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {renderHeader()}
      {renderTabs()}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "hafalan" && renderHafalanContent()}
        {activeTab === "akademik" && renderAkademikContent()}
        {/* Add other tab contents here */}
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
  headerContent: {
    alignItems: "center",
  },
  santriSelector: {
    marginTop: SPACING.md,
  },
  santriTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  santriTabActive: {
    backgroundColor: "white",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
  },
  tabLabel: {
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  percentageContainer: {
    alignItems: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  detailCard: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    marginBottom: SPACING.md,
  },
  progressItem: {
    flexDirection: "row",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  progressDate: {
    width: 80,
    justifyContent: "center",
  },
  progressDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  subjectItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  subjectInfo: {
    flex: 1,
  },
  subjectScore: {
    alignItems: "center",
  },
  bottomSpacing: {
    height: SPACING["2xl"],
  },
});

export default ProgressScreen;
