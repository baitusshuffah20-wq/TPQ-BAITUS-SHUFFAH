import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../contexts/ThemeContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Heading3, Heading4, Body1, Body2, Caption } from "../ui/Typography";
import { SPACING, BORDER_RADIUS } from "../../constants/theme";

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  gateway: string;
  icon: string;
  description: string;
  fees?: number;
  processingTime: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  minAmount?: number;
  maxAmount?: number;
  isManual?: boolean;
}

interface CartSummary {
  items: any[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface UniversalCheckoutProps {
  cartSummary: CartSummary;
  customerInfo: CustomerInfo;
  onBack?: () => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

const UniversalCheckout: React.FC<UniversalCheckoutProps> = ({
  cartSummary,
  customerInfo,
  onBack,
  onSuccess,
  onError,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [showManualTransfer, setShowManualTransfer] = useState(false);

  const { colors } = useTheme();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "credit_card",
      name: "Kartu Kredit",
      code: "CC",
      gateway: "MIDTRANS",
      icon: "card",
      description: "Visa, Mastercard, JCB",
      fees: 2.9,
      processingTime: "Instan",
      isRecommended: true,
      minAmount: 10000,
    },
    {
      id: "bca_va",
      name: "BCA Virtual Account",
      code: "BCA_VA",
      gateway: "MIDTRANS",
      icon: "business",
      description: "Transfer melalui ATM/Mobile Banking BCA",
      processingTime: "1-5 menit",
      isPopular: true,
      minAmount: 10000,
    },
    {
      id: "gopay",
      name: "GoPay",
      code: "GOPAY",
      gateway: "MIDTRANS",
      icon: "phone-portrait",
      description: "Bayar dengan aplikasi Gojek",
      processingTime: "Instan",
      minAmount: 10000,
      maxAmount: 2000000,
    },
    {
      id: "qris",
      name: "QRIS",
      code: "QRIS",
      gateway: "MIDTRANS",
      icon: "qr-code",
      description: "Scan QR Code untuk pembayaran",
      processingTime: "Instan",
      minAmount: 10000,
    },
    {
      id: "manual_bca",
      name: "Transfer Bank BCA",
      code: "MANUAL_BCA",
      gateway: "MANUAL",
      icon: "business",
      description: "Transfer manual ke rekening BCA",
      processingTime: "1-24 jam",
      isManual: true,
    },
    {
      id: "manual_mandiri",
      name: "Transfer Bank Mandiri",
      code: "MANUAL_MANDIRI",
      gateway: "MANUAL",
      icon: "business",
      description: "Transfer manual ke rekening Mandiri",
      processingTime: "1-24 jam",
      isManual: true,
    },
  ];

  const bankAccounts = {
    MANUAL_BCA: {
      bank: "BCA",
      accountNumber: "1234567890",
      accountName: "Yayasan Rumah Tahfidz Baitus Shuffah",
    },
    MANUAL_MANDIRI: {
      bank: "Mandiri",
      accountNumber: "0987654321",
      accountName: "Yayasan Rumah Tahfidz Baitus Shuffah",
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const calculateFee = (method: PaymentMethod) => {
    if (method.fees) {
      return (cartSummary.total * method.fees) / 100;
    }
    return 0;
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method.isManual) {
      setShowManualTransfer(true);
    } else {
      setShowManualTransfer(false);
    }
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Pilih metode pembayaran terlebih dahulu");
      return;
    }

    try {
      setProcessing(true);

      if (selectedMethod.isManual) {
        await processManualTransfer();
      } else {
        await processGatewayPayment();
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      onError?.("Gagal memproses pembayaran");
      Alert.alert("Error", "Gagal memproses pembayaran");
    } finally {
      setProcessing(false);
    }
  };

  const processGatewayPayment = async () => {
    // Simulate payment gateway processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = {
      success: true,
      paymentId: `gateway_${Date.now()}`,
      paymentUrl: `https://payment.example.com/pay/${Date.now()}`,
      amount: cartSummary.total,
      status: "PENDING",
    };

    onSuccess?.(result);
  };

  const processManualTransfer = async () => {
    // Simulate manual transfer processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = {
      success: true,
      orderId: `manual_${Date.now()}`,
      status: "PENDING_VERIFICATION",
      amount: cartSummary.total,
      bankAccount:
        bankAccounts[selectedMethod!.code as keyof typeof bankAccounts],
    };

    onSuccess?.(result);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Heading3 style={[styles.headerTitle, { color: colors.text }]}>
            Pilih Metode Pembayaran
          </Heading3>
          <Body2
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Total:{" "}
            <Body1 style={{ color: colors.primary, fontWeight: "bold" }}>
              {formatCurrency(cartSummary.total)}
            </Body1>
          </Body2>
        </View>
      </View>

      {/* Payment Methods */}
      {!showManualTransfer && (
        <Card style={styles.methodsCard}>
          <Heading4 style={[styles.sectionTitle, { color: colors.text }]}>
            Metode Pembayaran
          </Heading4>

          {paymentMethods.map((method) => {
            const fee = calculateFee(method);
            const totalAmount = cartSummary.total + fee;
            const isSelected = selectedMethod?.id === method.id;

            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodItem,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected
                      ? colors.primary + "10"
                      : "transparent",
                  },
                ]}
                onPress={() => handlePaymentMethodSelect(method)}
              >
                <View style={styles.methodContent}>
                  <View style={styles.methodLeft}>
                    <View
                      style={[
                        styles.methodIcon,
                        { backgroundColor: colors.primary + "20" },
                      ]}
                    >
                      <Ionicons
                        name={method.icon as any}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.methodInfo}>
                      <View style={styles.methodHeader}>
                        <Body1
                          style={[styles.methodName, { color: colors.text }]}
                        >
                          {method.name}
                        </Body1>
                        {method.isPopular && (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: colors.secondary },
                            ]}
                          >
                            <Caption style={styles.badgeText}>Populer</Caption>
                          </View>
                        )}
                        {method.isRecommended && (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: colors.success },
                            ]}
                          >
                            <Caption style={styles.badgeText}>
                              Rekomendasi
                            </Caption>
                          </View>
                        )}
                        {method.isManual && (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: colors.warning },
                            ]}
                          >
                            <Caption style={styles.badgeText}>Manual</Caption>
                          </View>
                        )}
                      </View>
                      <Body2
                        style={[
                          styles.methodDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {method.description}
                      </Body2>
                      <View style={styles.methodMeta}>
                        <Caption
                          style={[
                            styles.processingTime,
                            { color: colors.textSecondary },
                          ]}
                        >
                          <Ionicons
                            name="time"
                            size={12}
                            color={colors.textSecondary}
                          />{" "}
                          {method.processingTime}
                        </Caption>
                        {fee > 0 && (
                          <Caption
                            style={[styles.fee, { color: colors.warning }]}
                          >
                            Biaya: {formatCurrency(fee)}
                          </Caption>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.methodRight}>
                    <Body1
                      style={[styles.methodAmount, { color: colors.text }]}
                    >
                      {formatCurrency(totalAmount)}
                    </Body1>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>
      )}

      {/* Manual Transfer Instructions */}
      {showManualTransfer && selectedMethod?.isManual && (
        <Card style={styles.instructionsCard}>
          <Heading4 style={[styles.sectionTitle, { color: colors.text }]}>
            Instruksi Transfer Manual
          </Heading4>

          {/* Bank Account Info */}
          <View
            style={[
              styles.bankInfo,
              { backgroundColor: colors.primary + "10" },
            ]}
          >
            <Heading4 style={[styles.bankInfoTitle, { color: colors.primary }]}>
              Informasi Rekening Tujuan
            </Heading4>
            <View style={styles.bankDetails}>
              <View style={styles.bankDetailRow}>
                <Body2
                  style={[
                    styles.bankDetailLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Bank:
                </Body2>
                <Body1 style={[styles.bankDetailValue, { color: colors.text }]}>
                  {
                    bankAccounts[
                      selectedMethod.code as keyof typeof bankAccounts
                    ]?.bank
                  }
                </Body1>
              </View>
              <View style={styles.bankDetailRow}>
                <Body2
                  style={[
                    styles.bankDetailLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  No. Rekening:
                </Body2>
                <Body1
                  style={[
                    styles.bankDetailValue,
                    { color: colors.text, fontFamily: "monospace" },
                  ]}
                >
                  {
                    bankAccounts[
                      selectedMethod.code as keyof typeof bankAccounts
                    ]?.accountNumber
                  }
                </Body1>
              </View>
              <View style={styles.bankDetailRow}>
                <Body2
                  style={[
                    styles.bankDetailLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Atas Nama:
                </Body2>
                <Body1 style={[styles.bankDetailValue, { color: colors.text }]}>
                  {
                    bankAccounts[
                      selectedMethod.code as keyof typeof bankAccounts
                    ]?.accountName
                  }
                </Body1>
              </View>
              <View
                style={[
                  styles.bankDetailRow,
                  styles.totalRow,
                  { borderTopColor: colors.border },
                ]}
              >
                <Body2
                  style={[
                    styles.bankDetailLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Jumlah Transfer:
                </Body2>
                <Heading4
                  style={[styles.totalAmount, { color: colors.primary }]}
                >
                  {formatCurrency(cartSummary.total)}
                </Heading4>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View
            style={[
              styles.instructions,
              { backgroundColor: colors.warning + "10" },
            ]}
          >
            <View style={styles.instructionHeader}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.warning}
              />
              <Body1
                style={[styles.instructionTitle, { color: colors.warning }]}
              >
                Petunjuk:
              </Body1>
            </View>
            <View style={styles.instructionList}>
              <Body2 style={[styles.instructionItem, { color: colors.text }]}>
                • Transfer sesuai jumlah yang tertera
              </Body2>
              <Body2 style={[styles.instructionItem, { color: colors.text }]}>
                • Simpan bukti transfer untuk verifikasi
              </Body2>
              <Body2 style={[styles.instructionItem, { color: colors.text }]}>
                • Pembayaran akan diverifikasi dalam 1x24 jam
              </Body2>
              <Body2 style={[styles.instructionItem, { color: colors.text }]}>
                • Anda akan mendapat notifikasi setelah verifikasi
              </Body2>
            </View>
          </View>
        </Card>
      )}

      {/* Process Payment Button */}
      <View style={styles.footer}>
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Caption
            style={[styles.securityText, { color: colors.textSecondary }]}
          >
            Pembayaran aman dan terenkripsi
          </Caption>
        </View>

        <Button
          title={
            processing
              ? "Memproses..."
              : showManualTransfer
                ? "Konfirmasi Transfer"
                : "Bayar Sekarang"
          }
          onPress={processPayment}
          disabled={!selectedMethod || processing}
          loading={processing}
          style={styles.paymentButton}
          icon={showManualTransfer ? "checkmark" : "card"}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {},
  methodsCard: {
    marginBottom: SPACING.lg,
  },
  instructionsCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  methodItem: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  methodContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  methodName: {
    fontWeight: "600",
    marginRight: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  methodDescription: {
    marginBottom: SPACING.xs,
  },
  methodMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  processingTime: {
    fontSize: 12,
  },
  fee: {
    fontSize: 12,
  },
  methodRight: {
    alignItems: "flex-end",
  },
  methodAmount: {
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  bankInfo: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  bankInfoTitle: {
    marginBottom: SPACING.md,
    fontWeight: "bold",
  },
  bankDetails: {},
  bankDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  bankDetailLabel: {},
  bankDetailValue: {
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalAmount: {
    fontWeight: "bold",
  },
  instructions: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  instructionTitle: {
    marginLeft: SPACING.sm,
    fontWeight: "600",
  },
  instructionList: {},
  instructionItem: {
    marginBottom: SPACING.xs,
  },
  footer: {
    marginTop: SPACING.lg,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  securityText: {
    marginLeft: SPACING.sm,
  },
  paymentButton: {},
});

export default UniversalCheckout;
