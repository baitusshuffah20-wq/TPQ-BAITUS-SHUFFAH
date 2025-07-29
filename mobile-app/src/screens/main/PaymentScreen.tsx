import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
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
import UniversalCart from "../../components/payment/UniversalCart";
import UniversalCheckout from "../../components/payment/UniversalCheckout";

interface PaymentData {
  summary: {
    totalOutstanding: number;
    nextDueDate: string;
    totalPaid: number;
    thisYear: number;
  };
  outstanding: Array<{
    id: string;
    month: string;
    year: number;
    amount: number;
    dueDate: string;
    status: "overdue" | "due" | "upcoming";
    santriId: string;
    santriName: string;
  }>;
  history: Array<{
    id: string;
    month: string;
    year: number;
    amount: number;
    paidDate: string;
    method: string;
    status: "paid" | "partial" | "refunded";
    santriId: string;
    santriName: string;
  }>;
}

const PaymentScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "outstanding" | "history" | "cart" | "checkout"
  >("outstanding");
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(
    new Set(),
  );
  const [cartId, setCartId] = useState<string>("");
  const [cartSummary, setCartSummary] = useState<any>(null);

  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    // Initialize cart ID
    const newCartId = `spp_mobile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setCartId(newCartId);
  }, []);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPaymentData({
        summary: {
          totalOutstanding: 450000,
          nextDueDate: "2024-02-15",
          totalPaid: 1800000,
          thisYear: 2024,
        },
        outstanding: [
          {
            id: "1",
            month: "Februari",
            year: 2024,
            amount: 150000,
            dueDate: "2024-02-15",
            status: "due",
            santriId: "santri1",
            santriName: "Ahmad Fauzi",
          },
          {
            id: "2",
            month: "Januari",
            year: 2024,
            amount: 150000,
            dueDate: "2024-01-15",
            status: "overdue",
            santriId: "santri1",
            santriName: "Ahmad Fauzi",
          },
          {
            id: "3",
            month: "Februari",
            year: 2024,
            amount: 150000,
            dueDate: "2024-02-15",
            status: "due",
            santriId: "santri2",
            santriName: "Siti Aisyah",
          },
        ],
        history: [
          {
            id: "1",
            month: "Desember",
            year: 2023,
            amount: 150000,
            paidDate: "2023-12-10",
            method: "Transfer Bank",
            status: "paid",
            santriId: "santri1",
            santriName: "Ahmad Fauzi",
          },
          {
            id: "2",
            month: "November",
            year: 2023,
            amount: 150000,
            paidDate: "2023-11-08",
            method: "E-Wallet",
            status: "paid",
            santriId: "santri1",
            santriName: "Ahmad Fauzi",
          },
        ],
      });
    } catch (error) {
      console.error("Error loading payment data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return colors.error;
      case "due":
        return colors.warning;
      case "upcoming":
        return colors.info;
      case "paid":
        return colors.success;
      case "partial":
        return colors.warning;
      case "refunded":
        return colors.gray400;
      default:
        return colors.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "overdue":
        return "Terlambat";
      case "due":
        return "Jatuh Tempo";
      case "upcoming":
        return "Akan Datang";
      case "paid":
        return "Lunas";
      case "partial":
        return "Sebagian";
      case "refunded":
        return "Dikembalikan";
      default:
        return status;
    }
  };

  const handlePayment = (paymentId: string) => {
    Alert.alert(
      "Konfirmasi Pembayaran",
      "Anda akan diarahkan ke halaman pembayaran. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Lanjutkan", onPress: () => processPayment(paymentId) },
      ],
    );
  };

  const processPayment = (paymentId: string) => {
    // Navigate to payment gateway or process payment
    console.log("Processing payment for:", paymentId);
  };

  const handlePaymentSelect = (paymentId: string, selected: boolean) => {
    const newSelected = new Set(selectedPayments);
    if (selected) {
      newSelected.add(paymentId);
    } else {
      newSelected.delete(paymentId);
    }
    setSelectedPayments(newSelected);
  };

  const handleSelectAll = () => {
    if (!paymentData) return;

    const unpaidPayments = paymentData.outstanding.filter(
      (payment) => payment.status === "due" || payment.status === "overdue",
    );

    if (selectedPayments.size === unpaidPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(unpaidPayments.map((payment) => payment.id)));
    }
  };

  const handleAddToCart = async () => {
    if (selectedPayments.size === 0) {
      Alert.alert("Error", "Pilih SPP yang akan dibayar");
      return;
    }

    try {
      // Simulate adding to cart
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        "Berhasil",
        `${selectedPayments.size} SPP berhasil ditambahkan ke keranjang`,
        [
          {
            text: "OK",
            onPress: () => {
              setActiveTab("cart");
              setSelectedPayments(new Set());
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Gagal menambahkan SPP ke keranjang");
    }
  };

  const handleCartUpdate = (summary: any) => {
    setCartSummary(summary);
  };

  const handleCheckout = (summary: any) => {
    setCartSummary(summary);
    setActiveTab("checkout");
  };

  const handlePaymentSuccess = (result: any) => {
    Alert.alert(
      "Pembayaran Berhasil",
      "Terima kasih, pembayaran SPP Anda telah diproses",
      [
        {
          text: "OK",
          onPress: () => {
            setActiveTab("outstanding");
            loadPaymentData();
          },
        },
      ],
    );
  };

  const handlePaymentError = (error: string) => {
    Alert.alert("Pembayaran Gagal", error);
  };

  const handleBackToList = () => {
    setActiveTab("outstanding");
  };

  const handleBackToCart = () => {
    setActiveTab("cart");
  };

  const renderHeader = () => (
    <LinearGradient colors={colors.gradientPrimary} style={styles.header}>
      <View style={styles.headerContent}>
        <Heading3 color={colors.white}>Pembayaran SPP</Heading3>
        <Body2 color={colors.white} style={styles.headerSubtitle}>
          Kelola pembayaran SPP santri Anda
        </Body2>
      </View>
    </LinearGradient>
  );

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIcon}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
          </View>
          <View style={styles.summaryInfo}>
            <Caption color={colors.textSecondary}>Total Tunggakan</Caption>
            <Heading4 color={colors.error}>
              {paymentData &&
                formatCurrency(paymentData.summary.totalOutstanding)}
            </Heading4>
          </View>
        </View>
      </Card>

      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success}
            />
          </View>
          <View style={styles.summaryInfo}>
            <Caption color={colors.textSecondary}>
              Total Dibayar {paymentData?.summary.thisYear}
            </Caption>
            <Heading4 color={colors.success}>
              {paymentData && formatCurrency(paymentData.summary.totalPaid)}
            </Heading4>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        onPress={() => setActiveTab("outstanding")}
        style={[styles.tab, activeTab === "outstanding" && styles.tabActive]}
      >
        <Body1
          color={
            activeTab === "outstanding" ? colors.primary : colors.textSecondary
          }
          weight={activeTab === "outstanding" ? "semiBold" : "regular"}
        >
          Tagihan ({paymentData?.outstanding.length || 0})
        </Body1>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("cart")}
        style={[styles.tab, activeTab === "cart" && styles.tabActive]}
      >
        <Body1
          color={activeTab === "cart" ? colors.primary : colors.textSecondary}
          weight={activeTab === "cart" ? "semiBold" : "regular"}
        >
          Keranjang ({cartSummary?.itemCount || 0})
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
          Riwayat ({paymentData?.history.length || 0})
        </Body1>
      </TouchableOpacity>
    </View>
  );

  const renderOutstandingPayments = () => (
    <View style={styles.content}>
      {paymentData?.outstanding.map((payment) => (
        <Card key={payment.id} variant="default" style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Body1 color={colors.textPrimary} weight="semiBold">
                SPP {payment.month} {payment.year}
              </Body1>
              <Body2 color={colors.textSecondary}>{payment.santriName}</Body2>
              <Caption color={colors.textSecondary}>
                Jatuh tempo: {payment.dueDate}
              </Caption>
            </View>
            <View style={styles.paymentAmount}>
              <Heading4 color={colors.textPrimary}>
                {formatCurrency(payment.amount)}
              </Heading4>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(payment.status) },
                ]}
              >
                <Caption color={colors.white}>
                  {getStatusText(payment.status)}
                </Caption>
              </View>
            </View>
          </View>

          <Button
            title="Bayar Sekarang"
            onPress={() => handlePayment(payment.id)}
            variant="gradient"
            size="sm"
            style={styles.payButton}
          />
        </Card>
      ))}
    </View>
  );

  const renderPaymentHistory = () => (
    <View style={styles.content}>
      {paymentData?.history.map((payment) => (
        <Card key={payment.id} variant="flat" style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View style={styles.historyInfo}>
              <Body1 color={colors.textPrimary} weight="semiBold">
                SPP {payment.month} {payment.year}
              </Body1>
              <Body2 color={colors.textSecondary}>{payment.santriName}</Body2>
              <Caption color={colors.textSecondary}>
                Dibayar: {payment.paidDate} • {payment.method}
              </Caption>
            </View>
            <View style={styles.historyAmount}>
              <Heading4 color={colors.textPrimary}>
                {formatCurrency(payment.amount)}
              </Heading4>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(payment.status) },
                ]}
              >
                <Caption color={colors.white}>
                  {getStatusText(payment.status)}
                </Caption>
              </View>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderCart = () => {
    const customerInfo = {
      name: user?.name || "Wali Santri",
      email: user?.email || "wali@example.com",
      phone: user?.phone || "08123456789",
    };

    return (
      <View style={styles.content}>
        <UniversalCart
          cartId={cartId}
          userId={user?.id}
          onCheckout={handleCheckout}
          onItemUpdate={handleCartUpdate}
          showCheckoutButton={true}
          compact={false}
        />
        <View style={styles.cartActions}>
          <Button
            title="Kembali ke Daftar"
            onPress={handleBackToList}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </View>
    );
  };

  const renderCheckout = () => {
    const customerInfo = {
      name: user?.name || "Wali Santri",
      email: user?.email || "wali@example.com",
      phone: user?.phone || "08123456789",
    };

    return (
      <View style={styles.content}>
        <UniversalCheckout
          cartSummary={cartSummary}
          customerInfo={customerInfo}
          onBack={handleBackToCart}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "cart":
        return renderCart();
      case "checkout":
        return renderCheckout();
      case "history":
        return renderPaymentHistory();
      default:
        return renderOutstandingPayments();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab !== "checkout" && renderSummaryCards()}
        {activeTab !== "checkout" && renderTabs()}
        {renderContent()}
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
  headerSubtitle: {
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    marginTop: -SPACING.lg,
    backgroundColor: "white",
    borderTopLeftRadius: BORDER_RADIUS["2xl"],
    borderTopRightRadius: BORDER_RADIUS["2xl"],
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    gap: SPACING.md,
  },
  summaryCard: {
    flex: 1,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIcon: {
    marginRight: SPACING.md,
  },
  summaryInfo: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
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
  content: {
    padding: SPACING.lg,
  },
  paymentCard: {
    marginBottom: SPACING.md,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  payButton: {
    marginTop: SPACING.sm,
  },
  historyCard: {
    marginBottom: SPACING.md,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyInfo: {
    flex: 1,
  },
  historyAmount: {
    alignItems: "flex-end",
  },
  bottomSpacing: {
    height: SPACING["2xl"],
  },
  cartActions: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    marginTop: SPACING.md,
  },
});

export default PaymentScreen;
