'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart as CartIcon,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Wallet,
  Building,
  Smartphone,
  QrCode,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

interface ShoppingCartProps {
  cartId: string;
  userId?: string;
  onCheckout?: (cartSummary: CartSummary) => void;
  className?: string;
}

export default function ShoppingCart({ cartId, userId, onCheckout, className }: ShoppingCartProps) {
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
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Gagal memuat keranjang');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setUpdating(itemId);
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, itemId, quantity })
      });

      if (response.ok) {
        await loadCart();
        toast.success('Keranjang diperbarui');
      } else {
        toast.error('Gagal memperbarui keranjang');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Gagal memperbarui keranjang');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      const response = await fetch(`/api/cart?cartId=${cartId}&itemId=${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCart();
        toast.success('Item dihapus dari keranjang');
      } else {
        toast.error('Gagal menghapus item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Gagal menghapus item');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`/api/cart?cartId=${cartId}&action=clear`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCart();
        toast.success('Keranjang dikosongkan');
      } else {
        toast.error('Gagal mengosongkan keranjang');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Gagal mengosongkan keranjang');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'SPP':
        return <Building className="h-5 w-5 text-blue-600" />;
      case 'DONATION':
        return <Wallet className="h-5 w-5 text-green-600" />;
      default:
        return <CartIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getItemBadge = (itemType: string) => {
    switch (itemType) {
      case 'SPP':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">SPP</Badge>;
      case 'DONATION':
        return <Badge variant="outline" className="text-green-600 border-green-200">Donasi</Badge>;
      default:
        return <Badge variant="outline">{itemType}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat keranjang...</span>
          </div>
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
        <CardContent>
          <div className="text-center py-8">
            <CartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Keranjang belanja kosong</p>
            <p className="text-sm text-gray-500">Tambahkan item untuk melanjutkan pembayaran</p>
          </div>
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
          <Button
            onClick={clearCart}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Kosongkan
          </Button>
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
              <div className="flex-shrink-0">
                {getItemIcon(item.itemType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                  {getItemBadge(item.itemType)}
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 truncate">{item.description}</p>
                )}
                <p className="text-sm font-medium text-blue-600">
                  {formatCurrency(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                  disabled={updating === item.id || item.quantity <= 1}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                
                <Button
                  onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                  disabled={updating === item.id}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>

                <Button
                  onClick={() => removeItem(item.id!)}
                  disabled={updating === item.id}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  {updating === item.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(cartSummary.subtotal)}</span>
          </div>
          
          {cartSummary.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pajak</span>
              <span className="font-medium">{formatCurrency(cartSummary.tax)}</span>
            </div>
          )}
          
          {cartSummary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Diskon</span>
              <span className="font-medium text-green-600">-{formatCurrency(cartSummary.discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-blue-600">{formatCurrency(cartSummary.total)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={() => onCheckout?.(cartSummary)}
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          size="lg"
        >
          <CreditCard className="h-5 w-5" />
          Lanjutkan Pembayaran
        </Button>

        {/* Payment Methods Preview */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Metode pembayaran yang tersedia:</p>
          <div className="flex justify-center gap-2">
            <div className="p-1 border rounded">
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
            <div className="p-1 border rounded">
              <Building className="h-4 w-4 text-gray-400" />
            </div>
            <div className="p-1 border rounded">
              <Smartphone className="h-4 w-4 text-gray-400" />
            </div>
            <div className="p-1 border rounded">
              <QrCode className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
