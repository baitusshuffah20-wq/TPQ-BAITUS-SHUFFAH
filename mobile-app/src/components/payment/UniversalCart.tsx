import React, { useState, useEffect } from "react";
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

interface CartItem {
  id: string;
  cartId: string;
  itemType: string;
  itemId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  metadata?: any;
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

interface UniversalCartProps {
  cartId: string;
  userId?: string;
  onCheckout?: (cartSummary: CartSummary) => void;
  onItemUpdate?: (cartSummary: CartSummary) => void;
  showCheckoutButton?: boolean;
  compact?: boolean;
}

const UniversalCart: React.FC<UniversalCartProps> = ({
  cartId,
  userId,
  onCheckout,
  onItemUpdate,
  showCheckoutButton = true,
  compact = false,
}) => {
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const { colors } = useTheme();

  useEffect(() => {
    loadCart();
  }, [cartId]);

  const loadCart = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For now, simulate with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockCartSummary: CartSummary = {
        items: [
          {
            id: "1",
            cartId,
            itemType: "SPP",
            itemId: "spp1",
            name: "SPP Ahmad Fauzi - Februari 2024",
            description: "Pembayaran SPP bulanan",
            price: 150000,
            quantity: 1,
            metadata: {
              studentName: "Ahmad Fauzi",
              month: 2,
              year: 2024,
            },
          },
        ],
        subtotal: 150000,
        tax: 0,
        discount: 0,
        total: 150000,
        itemCount: 1,
      };

      setCartSummary(mockCartSummary);
      onItemUpdate?.(mockCartSummary);
    } catch (error) {
      console.error("Error loading cart:", error);
      Alert.alert("Error", "Gagal memuat keranjang");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setUpdating(itemId);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (cartSummary) {
        const updatedItems = cartSummary.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        );

        const updatedSummary = {
          ...cartSummary,
          items: updatedItems,
          subtotal: updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
        };
        updatedSummary.total =
          updatedSummary.subtotal +
          updatedSummary.tax -
          updatedSummary.discount;
        updatedSummary.itemCount = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        setCartSummary(updatedSummary);
        onItemUpdate?.(updatedSummary);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Gagal memperbarui keranjang");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    Alert.alert(
      "Hapus Item",
      "Apakah Anda yakin ingin menghapus item ini dari keranjang?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdating(itemId);
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 500));

              if (cartSummary) {
                const updatedItems = cartSummary.items.filter(
                  (item) => item.id !== itemId,
                );
                const updatedSummary = {
                  ...cartSummary,
                  items: updatedItems,
                  subtotal: updatedItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                  ),
                };
                updatedSummary.total =
                  updatedSummary.subtotal +
                  updatedSummary.tax -
                  updatedSummary.discount;
                updatedSummary.itemCount = updatedItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                );

                setCartSummary(updatedSummary);
                onItemUpdate?.(updatedSummary);
              }
            } catch (error) {
              console.error("Error removing item:", error);
              Alert.alert("Error", "Gagal menghapus item");
            } finally {
              setUpdating(null);
            }
          },
        },
      ],
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType.toLowerCase()) {
      case "spp":
        return "school";
      case "donation":
        return "heart";
      default:
        return "card";
    }
  };

  const getStatusColor = (itemType: string) => {
    switch (itemType.toLowerCase()) {
      case "spp":
        return colors.primary;
      case "donation":
        return colors.error;
      default:
        return colors.text;
    }
  };

  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Body1 style={[styles.loadingText, { color: colors.text }]}>
            Memuat keranjang...
          </Body1>
        </View>
      </Card>
    );
  }

  if (!cartSummary || cartSummary.items.length === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="basket-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Heading4 style={[styles.emptyTitle, { color: colors.text }]}>
            Keranjang Kosong
          </Heading4>
          <Body2
            style={[styles.emptyDescription, { color: colors.textSecondary }]}
          >
            Tambahkan item untuk melanjutkan pembayaran
          </Body2>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="basket" size={20} color={colors.primary} />
          <Heading4 style={[styles.headerTitle, { color: colors.text }]}>
            Keranjang Belanja
          </Heading4>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Caption style={styles.badgeText}>{cartSummary.itemCount}</Caption>
        </View>
      </View>

      {/* Cart Items */}
      <ScrollView
        style={styles.itemsContainer}
        showsVerticalScrollIndicator={false}
      >
        {cartSummary.items.map((item) => (
          <View
            key={item.id}
            style={[styles.itemCard, { borderColor: colors.border }]}
          >
            <View style={styles.itemHeader}>
              <View style={styles.itemIcon}>
                <Ionicons
                  name={getItemIcon(item.itemType)}
                  size={20}
                  color={getStatusColor(item.itemType)}
                />
              </View>
              <View style={styles.itemInfo}>
                <Body1
                  style={[styles.itemName, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.name}
                </Body1>
                {item.description && (
                  <Body2
                    style={[
                      styles.itemDescription,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Body2>
                )}
                <View style={styles.itemMeta}>
                  <View
                    style={[
                      styles.typeTag,
                      { backgroundColor: getStatusColor(item.itemType) + "20" },
                    ]}
                  >
                    <Caption
                      style={[
                        styles.typeText,
                        { color: getStatusColor(item.itemType) },
                      ]}
                    >
                      {item.itemType}
                    </Caption>
                  </View>
                  <Body1 style={[styles.itemPrice, { color: colors.text }]}>
                    {formatCurrency(item.price)}
                  </Body1>
                </View>
              </View>
            </View>

            {/* Quantity Controls */}
            {!compact && item.itemType !== "DONATION" && (
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { borderColor: colors.border },
                  ]}
                  onPress={() =>
                    updateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  disabled={updating === item.id || item.quantity <= 1}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Body1 style={[styles.quantityText, { color: colors.text }]}>
                  {item.quantity}
                </Body1>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { borderColor: colors.border },
                  ]}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updating === item.id}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            )}

            {/* Remove Button */}
            {!compact && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
                disabled={updating === item.id}
              >
                {updating === item.id ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.error}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={[styles.summary, { borderTopColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Body2 style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Subtotal
          </Body2>
          <Body2 style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(cartSummary.subtotal)}
          </Body2>
        </View>
        {cartSummary.discount > 0 && (
          <View style={styles.summaryRow}>
            <Body2 style={[styles.summaryLabel, { color: colors.success }]}>
              Diskon
            </Body2>
            <Body2 style={[styles.summaryValue, { color: colors.success }]}>
              -{formatCurrency(cartSummary.discount)}
            </Body2>
          </View>
        )}
        {cartSummary.tax > 0 && (
          <View style={styles.summaryRow}>
            <Body2
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Pajak
            </Body2>
            <Body2 style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(cartSummary.tax)}
            </Body2>
          </View>
        )}
        <View
          style={[
            styles.summaryRow,
            styles.totalRow,
            { borderTopColor: colors.border },
          ]}
        >
          <Heading4 style={[styles.totalLabel, { color: colors.text }]}>
            Total
          </Heading4>
          <Heading4 style={[styles.totalValue, { color: colors.primary }]}>
            {formatCurrency(cartSummary.total)}
          </Heading4>
        </View>
      </View>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Button
          title="Lanjut ke Pembayaran"
          onPress={() => onCheckout?.(cartSummary)}
          style={styles.checkoutButton}
          icon="card"
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    marginLeft: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
  },
  itemsContainer: {
    maxHeight: 300,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  itemDescription: {
    marginBottom: SPACING.sm,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemPrice: {
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: SPACING.md,
    minWidth: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  removeButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  summary: {
    borderTopWidth: 1,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  summaryLabel: {},
  summaryValue: {
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  totalLabel: {},
  totalValue: {
    fontWeight: "bold",
  },
  checkoutButton: {
    marginTop: SPACING.md,
  },
});

export default UniversalCart;
