'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import ShoppingCart from '@/components/payment/ShoppingCart';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import {
  ShoppingCart as CartIcon,
  User,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  gateway: string;
  icon: React.ReactNode;
  description: string;
  fees?: number;
  processingTime: string;
}

function CheckoutPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const cartId = searchParams.get('cartId') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const steps = [
    { id: 1, name: 'Keranjang', icon: CartIcon, description: 'Review items' },
    { id: 2, name: 'Informasi', icon: User, description: 'Customer details' },
    { id: 3, name: 'Pembayaran', icon: CreditCard, description: 'Payment method' },
    { id: 4, name: 'Konfirmasi', icon: CheckCircle, description: 'Review & pay' }
  ];

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Redirect to dashboard checkout if user is logged in and accessing public checkout
    if (!authLoading && user && window.location.pathname === '/checkout') {
      const newUrl = `/dashboard/${user.role.toLowerCase()}/checkout${window.location.search}`;
      router.push(newUrl);
      return;
    }

    if (cartId) {
      loadCart();
    } else {
      const paymentUrl = user ? `/dashboard/${user.role.toLowerCase()}/payment` : '/payment';
      router.push(paymentUrl);
    }
  }, [cartId, authLoading, user, router]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?cartId=${cartId}`);
      if (response.ok) {
        const data = await response.json();
        setCartSummary(data.data);
        
        if (data.data.items.length === 0) {
          toast.error('Keranjang kosong');
          router.push('/payment');
        }
      } else {
        toast.error('Gagal memuat keranjang');
        router.push('/payment');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Gagal memuat keranjang');
      router.push('/payment');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return cartSummary !== null && cartSummary.items.length > 0;
      case 2:
        return customerInfo.name !== '' && customerInfo.email !== '' && customerInfo.phone !== '';
      case 3:
        return selectedPaymentMethod !== null;
      default:
        return true;
    }
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processPayment = async () => {
    if (!validateStep(3) || !cartSummary || !selectedPaymentMethod) {
      toast.error('Mohon lengkapi semua informasi');
      return;
    }

    try {
      setProcessing(true);
      
      const paymentRequest = {
        cartId,
        gateway: selectedPaymentMethod.gateway,
        paymentMethod: selectedPaymentMethod.code,
        customerInfo: {
          id: null, // Guest checkout
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        billingInfo: customerInfo.address ? {
          address: customerInfo.address,
          city: customerInfo.city || '',
          postalCode: customerInfo.postalCode || '',
          countryCode: 'ID'
        } : undefined,
        redirectUrl: `${window.location.origin}/payment/success`
      };

      const response = await fetch('/api/payment/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.data.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = data.data.paymentUrl;
        } else {
          // Show payment instructions
          router.push(`/payment/instructions?orderId=${data.data.orderId}&paymentId=${data.data.paymentId}`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal membuat pembayaran');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Gagal memproses pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Selesaikan pembayaran Anda</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-gray-600">Pembayaran Aman</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                        ${currentStep >= step.id 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-gray-300 text-gray-400'
                        }
                      `}>
                        {currentStep > step.id ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <p className={`text-sm font-medium ${
                          currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`
                          w-12 h-0.5 mx-4 transition-colors
                          ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}
                        `} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            {currentStep === 1 && cartSummary && (
              <ShoppingCart
                cartId={cartId}
                onCheckout={() => handleNextStep()}
                className="w-full"
              />
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Pembeli
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="08123456789"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat (Opsional)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <textarea
                        value={customerInfo.address || ''}
                        onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Alamat lengkap"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota (Opsional)
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={customerInfo.city || ''}
                          onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nama kota"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Pos (Opsional)
                      </label>
                      <input
                        type="text"
                        value={customerInfo.postalCode || ''}
                        onChange={(e) => handleCustomerInfoChange('postalCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && cartSummary && (
              <PaymentMethodSelector
                amount={cartSummary.total}
                onSelect={setSelectedPaymentMethod}
                selectedMethod={selectedPaymentMethod}
                className="w-full"
              />
            )}

            {currentStep === 4 && cartSummary && selectedPaymentMethod && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Konfirmasi Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Info Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Informasi Pembeli</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Nama:</span> {customerInfo.name}</p>
                      <p><span className="text-gray-600">Email:</span> {customerInfo.email}</p>
                      <p><span className="text-gray-600">Telepon:</span> {customerInfo.phone}</p>
                      {customerInfo.address && (
                        <p><span className="text-gray-600">Alamat:</span> {customerInfo.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Metode Pembayaran</h3>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        {selectedPaymentMethod.icon}
                      </div>
                      <div>
                        <p className="font-medium">{selectedPaymentMethod.name}</p>
                        <p className="text-sm text-gray-600">{selectedPaymentMethod.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{selectedPaymentMethod.processingTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Ringkasan Pesanan</h3>
                    <div className="space-y-2">
                      {cartSummary.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span className="text-blue-600">{formatCurrency(cartSummary.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Process Payment Button */}
                  <Button
                    onClick={processPayment}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Memproses Pembayaran...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Bayar Sekarang
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={!validateStep(currentStep)}
                  className="flex items-center gap-2"
                >
                  Selanjutnya
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            {cartSummary && (
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CartIcon className="h-5 w-5" />
                    Ringkasan Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartSummary.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartSummary.subtotal)}</span>
                    </div>
                    {cartSummary.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Pajak</span>
                        <span>{formatCurrency(cartSummary.tax)}</span>
                      </div>
                    )}
                    {cartSummary.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Diskon</span>
                        <span>-{formatCurrency(cartSummary.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="text-blue-600">{formatCurrency(cartSummary.total)}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Pembayaran Aman</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Transaksi dienkripsi dan diproses melalui gateway pembayaran tersertifikasi.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
