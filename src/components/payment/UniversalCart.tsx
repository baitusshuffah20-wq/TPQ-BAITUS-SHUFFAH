"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart as CartIcon,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Building,
  Heart,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

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
  className?: string;
  showCheckoutButton?: boolean;
  compact?: boolean;
  platform?: "web" | "mobile" | "dashboard";
}

export default function UniversalCart({
  cartId,
  userId,
  onCheckout,
  onItemUpdate,
  className = "",
  showCheckoutButton = true,
  compact = false,
  platform = "web",
}: UniversalCartProps) {
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, [cartId]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?cartId=${cartId}`);
      if (response.ok) {
        const data = await response.json();
        setCartSummary(data.data);
        onItemUpdate?.(data.data);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Gagal memuat keranjang");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setUpdating(itemId);
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, itemId, quantity }),
      });

      if (response.ok) {
        await loadCart();
        toast.success("Keranjang diperbarui");
      } else {
        toast.error("Gagal memperbarui keranjang");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Gagal memperbarui keranjang");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, itemId }),
      });

      if (response.ok) {
        await loadCart();
        toast.success("Item dihapus dari keranjang");
      } else {
        toast.error("Gagal menghapus item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Gagal menghapus item");
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, clearAll: true }),
      });

      if (response.ok) {
        await loadCart();
        toast.success("Keranjang dikosongkan");
      } else {
        toast.error("Gagal mengosongkan keranjang");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Gagal mengosongkan keranjang");
    }
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
        return <Building className="h-5 w-5 text-blue-600" />;
      case "donation":
        return <Heart className="h-5 w-5 text-red-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (itemType: string) => {
    switch (itemType.toLowerCase()) {
      case "spp":
        return "bg-blue-100 text-blue-800";
      case "donation":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Memuat keranjang...</span>
        </CardContent>
      </Card>
    );
  }

  if (!cartSummary || cartSummary.items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            Keranjang Belanja
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Keranjang masih kosong</p>
          <p className="text-sm text-gray-500">
            Tambahkan item untuk melanjutkan pembayaran
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            Keranjang Belanja
            <Badge variant="secondary">{cartSummary.itemCount} item</Badge>
          </CardTitle>
          {!compact && (
            <Button
              onClick={clearCart}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Kosongkan
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cartSummary.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex-shrink-0">{getItemIcon(item.itemType)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(item.itemType)}>
                        {item.itemType}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>

                  {!compact && (
                    <div className="flex items-center gap-2 ml-4">
                      {/* Quantity Controls */}
                      {item.itemType !== "DONATION" && (
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={
                              updating === item.id || item.quantity <= 1
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={updating === item.id}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        onClick={() => removeItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        disabled={updating === item.id}
                      >
                        {updating === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(cartSummary.subtotal)}</span>
          </div>
          {cartSummary.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Diskon</span>
              <span>-{formatCurrency(cartSummary.discount)}</span>
            </div>
          )}
          {cartSummary.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Pajak</span>
              <span>{formatCurrency(cartSummary.tax)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span className="text-blue-600">
              {formatCurrency(cartSummary.total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        {showCheckoutButton && (
          <Button
            onClick={() => onCheckout?.(cartSummary)}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Lanjut ke Pembayaran
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
