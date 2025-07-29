import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Heading3,
  Heading4,
  Body1,
  Body2,
  Caption,
} from "../../components/ui/Typography";
import { SPACING, BORDER_RADIUS } from "../../constants/theme";

interface DonationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  target?: number;
  collected?: number;
  urgent?: boolean;
}

interface DonationHistory {
  id: string;
  amount: number;
  category: string;
  date: string;
  status: "completed" | "pending" | "failed";
  method: string;
  anonymous: boolean;
}

const DonationScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<"donate" | "history">("donate");

  const { user } = useAuth();
  const { colors } = useTheme();

  const predefinedAmounts = [50000, 100000, 250000, 500000, 1000000];

  const donationCategories: DonationCategory[] = [
    {
      id: "operational",
      name: "Operasional TPQ",
      description: "Biaya operasional harian TPQ",
      icon: "business",
      color: colors.primary,
      target: 10000000,
      collected: 6500000,
    },
    {
      id: "infrastructure",
      name: "Pembangunan",
      description: "Renovasi dan pembangunan fasilitas",
      icon: "construct",
      color: colors.secondary,
      target: 50000000,
      collected: 15000000,
      urgent: true,
    },
    {
      id: "scholarship",
      name: "Beasiswa Santri",
      description: "Bantuan biaya pendidikan santri kurang mampu",
      icon: "school",
      color: colors.islamic,
      target: 5000000,
      collected: 3200000,
    },
    {
      id: "quran",
      name: "Al-Quran & Buku",
      description: "Pengadaan Al-Quran dan buku pembelajaran",
      icon: "book",
      color: colors.info,
      target: 2000000,
      collected: 1800000,
    },
    {
      id: "general",
      name: "Donasi Umum",
      description: "Donasi untuk kebutuhan umum TPQ",
      icon: "heart",
      color: colors.error,
    },
  ];

  useEffect(() => {
    loadDonationHistory();
  }, []);

  const loadDonationHistory = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setDonationHistory([
        {
          id: "1",
          amount: 250000,
          category: "Operasional TPQ",
          date: "2024-02-08",
          status: "completed",
          method: "Transfer Bank",
          anonymous: false,
        },
        {
          id: "2",
          amount: 100000,
          category: "Beasiswa Santri",
          date: "2024-01-15",
          status: "completed",
          method: "E-Wallet",
          anonymous: true,
        },
      ]);
    } catch (error) {
      console.error("Error loading donation history:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (collected: number, target: number) => {
    return Math.min((collected / target) * 100, 100);
  };

  const handleAmountSelect = (amount: number) => {
    setCustomAmount(amount.toString());
  };

  const handleDonate = () => {
    if (!selectedCategory) {
      Alert.alert("Error", "Silakan pilih kategori donasi");
      return;
    }

    if (!customAmount || parseInt(customAmount) < 10000) {
      Alert.alert("Error", "Minimal donasi Rp 10.000");
      return;
    }

    const category = donationCategories.find((c) => c.id === selectedCategory);

    Alert.alert(
      "Konfirmasi Donasi",
      `Anda akan berdonasi ${formatCurrency(parseInt(customAmount))} untuk ${category?.name}.\n\nLanjutkan ke pembayaran?`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Lanjutkan", onPress: processDonation },
      ],
    );
  };

  const processDonation = () => {
    // Navigate to payment gateway
    console.log("Processing donation:", {
      category: selectedCategory,
      amount: parseInt(customAmount),
      anonymous: isAnonymous,
    });

    Alert.alert(
      "Donasi Berhasil",
      "Terima kasih atas donasi Anda. Semoga menjadi amal jariyah yang berkah.",
      [{ text: "OK", onPress: resetForm }],
    );
  };

  const resetForm = () => {
    setSelectedCategory("");
    setCustomAmount("");
    setIsAnonymous(false);
  };

  const renderHeader = () => (
    <LinearGradient colors={colors.gradientIslamic} style={styles.header}>
      <View style={styles.headerContent}>
        <Ionicons name="heart" size={32} color={colors.white} />
        <Heading3 color={colors.white} style={styles.headerTitle}>
          Donasi TPQ
        </Heading3>
        <Body2 color={colors.white} style={styles.headerSubtitle}>
          "Dan belanjakanlah sebagian dari apa yang telah Kami berikan kepadamu"
        </Body2>
      </View>
    </LinearGradient>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        onPress={() => setActiveTab("donate")}
        style={[styles.tab, activeTab === "donate" && styles.tabActive]}
      >
        <Body1
          color={activeTab === "donate" ? colors.primary : colors.textSecondary}
          weight={activeTab === "donate" ? "semiBold" : "regular"}
        >
          Berdonasi
        </Body1>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("history")}
        style={[styles.tab, activeTab === "history" && styles.tabActive]}
      >
        <Body1
          color={
            activeTab === "history" ? colors.primary : colors.textSecondary
          }
          weight={activeTab === "history" ? "semiBold" : "regular"}
        >
          Riwayat Donasi
        </Body1>
      </TouchableOpacity>
    </View>
  );

  const renderDonationCategories = () => (
    <View style={styles.section}>
      <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
        Pilih Kategori Donasi
      </Heading4>
      {donationCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryCard,
            selectedCategory === category.id && styles.categoryCardSelected,
          ]}
        >
          <Card variant="default" style={styles.categoryContent}>
            <View style={styles.categoryHeader}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color },
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={colors.white}
                />
              </View>
              <View style={styles.categoryInfo}>
                <View style={styles.categoryTitleRow}>
                  <Body1 color={colors.textPrimary} weight="semiBold">
                    {category.name}
                  </Body1>
                  {category.urgent && (
                    <View style={styles.urgentBadge}>
                      <Caption color={colors.white}>URGENT</Caption>
                    </View>
                  )}
                </View>
                <Body2 color={colors.textSecondary}>
                  {category.description}
                </Body2>
              </View>
            </View>

            {category.target && category.collected && (
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Caption color={colors.textSecondary}>
                    Terkumpul: {formatCurrency(category.collected)}
                  </Caption>
                  <Caption color={colors.textSecondary}>
                    Target: {formatCurrency(category.target)}
                  </Caption>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getProgressPercentage(category.collected, category.target)}%`,
                        backgroundColor: category.color,
                      },
                    ]}
                  />
                </View>
                <Caption
                  color={colors.textSecondary}
                  style={styles.progressPercentage}
                >
                  {getProgressPercentage(
                    category.collected,
                    category.target,
                  ).toFixed(1)}
                  %
                </Caption>
              </View>
            )}
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAmountSelection = () => (
    <View style={styles.section}>
      <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
        Pilih Nominal Donasi
      </Heading4>

      <View style={styles.amountGrid}>
        {predefinedAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            onPress={() => handleAmountSelect(amount)}
            style={[
              styles.amountButton,
              customAmount === amount.toString() && styles.amountButtonSelected,
            ]}
          >
            <Body2
              color={
                customAmount === amount.toString()
                  ? colors.white
                  : colors.textPrimary
              }
              weight="medium"
            >
              {formatCurrency(amount)}
            </Body2>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Atau masukkan nominal lain"
        placeholder="Minimal Rp 10.000"
        value={customAmount}
        onChangeText={setCustomAmount}
        keyboardType="numeric"
        leftIcon="cash-outline"
      />

      <TouchableOpacity
        onPress={() => setIsAnonymous(!isAnonymous)}
        style={styles.anonymousOption}
      >
        <Ionicons
          name={isAnonymous ? "checkbox" : "checkbox-outline"}
          size={24}
          color={colors.primary}
        />
        <Body2 color={colors.textPrimary} style={styles.anonymousText}>
          Donasi sebagai anonim
        </Body2>
      </TouchableOpacity>

      <Button
        title={`Donasi ${customAmount ? formatCurrency(parseInt(customAmount) || 0) : ""}`}
        onPress={handleDonate}
        variant="gradient"
        size="lg"
        fullWidth
        disabled={!selectedCategory || !customAmount}
        style={styles.donateButton}
      />
    </View>
  );

  const renderDonationHistory = () => (
    <View style={styles.section}>
      <Heading4 color={colors.textPrimary} style={styles.sectionTitle}>
        Riwayat Donasi Anda
      </Heading4>
      {donationHistory.length > 0 ? (
        donationHistory.map((donation) => (
          <Card key={donation.id} variant="flat" style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={styles.historyInfo}>
                <Body1 color={colors.textPrimary} weight="semiBold">
                  {formatCurrency(donation.amount)}
                </Body1>
                <Body2 color={colors.textSecondary}>{donation.category}</Body2>
                <Caption color={colors.textSecondary}>
                  {donation.date} • {donation.method}
                  {donation.anonymous && " • Anonim"}
                </Caption>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      donation.status === "completed"
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                <Caption color={colors.white}>
                  {donation.status === "completed" ? "Berhasil" : "Pending"}
                </Caption>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <Card variant="flat" style={styles.emptyState}>
          <Ionicons name="heart-outline" size={48} color={colors.gray400} />
          <Body2 color={colors.textSecondary} style={styles.emptyText}>
            Belum ada riwayat donasi
          </Body2>
        </Card>
      )}
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
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "donate" ? (
          <>
            {renderDonationCategories()}
            {selectedCategory && renderAmountSelection()}
          </>
        ) : (
          renderDonationHistory()
        )}
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
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    textAlign: "center",
    opacity: 0.9,
    fontStyle: "italic",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  categoryCard: {
    marginBottom: SPACING.md,
  },
  categoryCardSelected: {
    transform: [{ scale: 0.98 }],
  },
  categoryContent: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  urgentBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressPercentage: {
    textAlign: "center",
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  amountButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  amountButtonSelected: {
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
  },
  anonymousOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  anonymousText: {
    marginLeft: SPACING.sm,
  },
  donateButton: {
    marginTop: SPACING.md,
  },
  historyCard: {
    marginBottom: SPACING.md,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historyInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING["2xl"],
  },
  emptyText: {
    marginTop: SPACING.md,
  },
  bottomSpacing: {
    height: SPACING["2xl"],
  },
});

export default DonationScreen;
