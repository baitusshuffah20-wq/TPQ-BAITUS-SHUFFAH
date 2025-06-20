'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import ShoppingCart from '@/components/payment/ShoppingCart';
import { CartService } from '@/lib/cart-service';
import { useAuth } from '@/components/providers/AuthProvider';
import PublicLayout from '@/components/layout/PublicLayout';
import {
  ShoppingCart as CartIcon,
  Plus,
  Building,
  Heart,
  BookOpen,
  Users,
  Gift,
  CreditCard,
  ArrowRight,
  Loader2,
  Star,
  TrendingUp,
  LogIn
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentItem {
  type: string;
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isCustomAmount?: boolean;
  metadata?: any;
}

interface CartSummary {
  items: any[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [availableItems, setAvailableItems] = useState<PaymentItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customDonationAmount, setCustomDonationAmount] = useState<number>(0);
  const [donationMessage, setDonationMessage] = useState<string>('');

  const categories = [
    { id: 'all', name: 'Semua', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'spp', name: 'SPP', icon: <Building className="h-4 w-4" /> },
    { id: 'donasi', name: 'Donasi', icon: <Heart className="h-4 w-4" /> }
  ];

  useEffect(() => {
    // Redirect logged-in users to dashboard payment
    if (!authLoading && user) {
      router.push(`/dashboard/${user.role.toLowerCase()}/payment`);
      return;
    }

    // Initialize payment for guest users
    if (!authLoading && !user) {
      initializePayment();
    }
  }, [authLoading, user, router]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      // Generate or get cart ID
      const guestCartId = CartService.generateCartId();
      setCartId(guestCartId);
      
      // Load available items (mock user ID for now)
      await loadAvailableItems('mock-user-id');
      
      // Load cart summary
      await loadCartSummary(guestCartId);
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error('Gagal memuat halaman pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableItems = async (userId: string) => {
    try {
      const response = await fetch(`/api/cart/items?userId=${userId}&category=${selectedCategory}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableItems(data.data.items);
      }
    } catch (error) {
      console.error('Error loading available items:', error);
    }
  };

  const loadCartSummary = async (cartId: string) => {
    try {
      const response = await fetch(`/api/cart?cartId=${cartId}`);
      if (response.ok) {
        const data = await response.json();
        setCartSummary(data.data);
      }
    } catch (error) {
      console.error('Error loading cart summary:', error);
    }
  };

  const addToCart = async (item: PaymentItem, customAmount?: number) => {
    try {
      const requestBody = {
        cartId,
        itemType: item.type,
        itemId: item.id,
        name: item.name,
        description: item.description,
        price: customAmount || item.price,
        quantity: 1,
        metadata: item.metadata
      };

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        toast.success('Item berhasil ditambahkan ke keranjang');
        await loadCartSummary(cartId);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menambahkan item');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Gagal menambahkan item ke keranjang');
    }
  };

  const addSPPToCart = async (studentId: string) => {
    try {
      const response = await fetch('/api/cart/items/spp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, studentId })
      });

      if (response.ok) {
        toast.success('SPP berhasil ditambahkan ke keranjang');
        await loadCartSummary(cartId);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menambahkan SPP');
      }
    } catch (error) {
      console.error('Error adding SPP to cart:', error);
      toast.error('Gagal menambahkan SPP ke keranjang');
    }
  };

  const addDonationToCart = async (donationType: string, amount: number, message: string) => {
    try {
      const response = await fetch('/api/cart/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cartId, 
          donationType, 
          amount, 
          message 
        })
      });

      if (response.ok) {
        toast.success('Donasi berhasil ditambahkan ke keranjang');
        await loadCartSummary(cartId);
        setCustomDonationAmount(0);
        setDonationMessage('');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menambahkan donasi');
      }
    } catch (error) {
      console.error('Error adding donation to cart:', error);
      toast.error('Gagal menambahkan donasi ke keranjang');
    }
  };

  const proceedToCheckout = () => {
    if (!cartSummary || cartSummary.items.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }
    router.push(`/checkout?cartId=${cartId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getItemIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'spp':
        return <Building className="h-6 w-6 text-blue-600" />;
      case 'donasi':
        return <Heart className="h-6 w-6 text-red-600" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-600" />;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? availableItems 
    : availableItems.filter(item => item.category.toLowerCase() === selectedCategory);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {authLoading ? 'Memeriksa autentikasi...' : 'Memuat halaman pembayaran...'}
          </p>
        </div>
      </div>
    );
  }

  // Show login prompt for guest users
  if (!user) {
    return (
      <PublicLayout>
        <div className="py-16 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran TPQ Baitus Shuffah</h1>
                <p className="text-gray-600 mb-6">
                  Silakan login terlebih dahulu untuk mengakses sistem pembayaran online
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login untuk Melanjutkan
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Belum punya akun? Hubungi admin TPQ untuk mendaftar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran Online</h1>
          <p className="text-gray-600">Kelola pembayaran SPP dan donasi TPQ Baitus Shuffah</p>
        </div>
        <div className="flex items-center gap-4">
          {cartSummary && cartSummary.itemCount > 0 && (
            <Button
              onClick={proceedToCheckout}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <CartIcon className="h-4 w-4" />
              Checkout ({cartSummary.itemCount})
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Kategori Pembayaran</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      {category.icon}
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Items */}
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={`${item.type}-${item.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          {getItemIcon(item.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <Badge variant="outline">{item.category}</Badge>
                            {item.type === 'SPP' && (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                <Star className="h-3 w-3 mr-1" />
                                Populer
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                          {!item.isCustomAmount && (
                            <p className="text-lg font-bold text-blue-600 mt-2">
                              {formatCurrency(item.price)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {item.isCustomAmount ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Jumlah donasi"
                              value={customDonationAmount || ''}
                              onChange={(e) => setCustomDonationAmount(Number(e.target.value))}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="10000"
                            />
                            <Button
                              onClick={() => {
                                if (customDonationAmount >= 10000) {
                                  addDonationToCart(item.id, customDonationAmount, donationMessage);
                                } else {
                                  toast.error('Minimum donasi Rp 10,000');
                                }
                              }}
                              disabled={customDonationAmount < 10000}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Tambah
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              if (item.type === 'SPP') {
                                addSPPToCart(item.id);
                              } else {
                                addToCart(item);
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Tambah ke Keranjang
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredItems.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada item tersedia</h3>
                    <p className="text-gray-600">Pilih kategori lain atau coba lagi nanti.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Custom Donation Message */}
            {selectedCategory === 'donasi' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Pesan Donasi (Opsional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    placeholder="Tulis pesan atau doa untuk TPQ Baitus Shuffah..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Shopping Cart */}
          <div className="lg:col-span-1">
            <ShoppingCart
              cartId={cartId}
              onCheckout={proceedToCheckout}
              className="sticky top-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
