'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  Building,
  Smartphone,
  QrCode,
  Wallet,
  CheckCircle,
  Clock,
  Info,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  gateway: string;
  icon: React.ReactNode;
  description: string;
  fees?: number;
  processingTime: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

interface PaymentMethodSelectorProps {
  amount: number;
  onSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
  className?: string;
}

export default function PaymentMethodSelector({ 
  amount, 
  onSelect, 
  selectedMethod, 
  className 
}: PaymentMethodSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const paymentMethods: PaymentMethod[] = [
    // Credit Card
    {
      id: 'credit_card',
      name: 'Kartu Kredit',
      code: 'CC',
      gateway: 'MIDTRANS',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Visa, Mastercard, JCB',
      fees: 2.9,
      processingTime: 'Instan',
      isRecommended: true,
      minAmount: 10000
    },
    
    // Bank Transfer
    {
      id: 'bca_va',
      name: 'BCA Virtual Account',
      code: 'BCA_VA',
      gateway: 'MIDTRANS',
      icon: <Building className="h-6 w-6 text-blue-600" />,
      description: 'Transfer melalui ATM/Mobile Banking BCA',
      processingTime: '1-5 menit',
      isPopular: true,
      minAmount: 10000
    },
    {
      id: 'bni_va',
      name: 'BNI Virtual Account',
      code: 'BNI_VA',
      gateway: 'MIDTRANS',
      icon: <Building className="h-6 w-6 text-orange-600" />,
      description: 'Transfer melalui ATM/Mobile Banking BNI',
      processingTime: '1-5 menit',
      minAmount: 10000
    },
    {
      id: 'bri_va',
      name: 'BRI Virtual Account',
      code: 'BRI_VA',
      gateway: 'MIDTRANS',
      icon: <Building className="h-6 w-6 text-blue-800" />,
      description: 'Transfer melalui ATM/Mobile Banking BRI',
      processingTime: '1-5 menit',
      minAmount: 10000
    },
    {
      id: 'mandiri_va',
      name: 'Mandiri Virtual Account',
      code: 'MANDIRI_VA',
      gateway: 'MIDTRANS',
      icon: <Building className="h-6 w-6 text-yellow-600" />,
      description: 'Transfer melalui ATM/Mobile Banking Mandiri',
      processingTime: '1-5 menit',
      minAmount: 10000
    },

    // E-Wallets
    {
      id: 'gopay',
      name: 'GoPay',
      code: 'GOPAY',
      gateway: 'MIDTRANS',
      icon: <Smartphone className="h-6 w-6 text-green-600" />,
      description: 'Bayar dengan aplikasi Gojek',
      processingTime: 'Instan',
      isPopular: true,
      minAmount: 1000,
      maxAmount: 2000000
    },
    {
      id: 'shopeepay',
      name: 'ShopeePay',
      code: 'SHOPEEPAY',
      gateway: 'MIDTRANS',
      icon: <Smartphone className="h-6 w-6 text-orange-500" />,
      description: 'Bayar dengan aplikasi Shopee',
      processingTime: 'Instan',
      minAmount: 1000,
      maxAmount: 2000000
    },
    {
      id: 'dana',
      name: 'DANA',
      code: 'DANA',
      gateway: 'XENDIT',
      icon: <Wallet className="h-6 w-6 text-blue-500" />,
      description: 'Bayar dengan aplikasi DANA',
      processingTime: 'Instan',
      minAmount: 1000,
      maxAmount: 2000000
    },
    {
      id: 'ovo',
      name: 'OVO',
      code: 'OVO',
      gateway: 'XENDIT',
      icon: <Wallet className="h-6 w-6 text-purple-600" />,
      description: 'Bayar dengan aplikasi OVO',
      processingTime: 'Instan',
      minAmount: 1000,
      maxAmount: 2000000
    },

    // QRIS
    {
      id: 'qris',
      name: 'QRIS',
      code: 'QRIS',
      gateway: 'MIDTRANS',
      icon: <QrCode className="h-6 w-6 text-red-600" />,
      description: 'Scan QR dengan aplikasi bank/e-wallet apapun',
      processingTime: 'Instan',
      isRecommended: true,
      minAmount: 1000
    }
  ];

  const categories = [
    { id: 'all', name: 'Semua', icon: <Wallet className="h-4 w-4" /> },
    { id: 'card', name: 'Kartu', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'bank', name: 'Bank', icon: <Building className="h-4 w-4" /> },
    { id: 'ewallet', name: 'E-Wallet', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'qris', name: 'QRIS', icon: <QrCode className="h-4 w-4" /> }
  ];

  const getFilteredMethods = () => {
    let filtered = paymentMethods.filter(method => {
      // Check amount limits
      if (method.minAmount && amount < method.minAmount) return false;
      if (method.maxAmount && amount > method.maxAmount) return false;
      return true;
    });

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(method => {
        switch (selectedCategory) {
          case 'card':
            return method.code === 'CC';
          case 'bank':
            return method.code.includes('_VA');
          case 'ewallet':
            return ['GOPAY', 'SHOPEEPAY', 'DANA', 'OVO'].includes(method.code);
          case 'qris':
            return method.code === 'QRIS';
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const calculateFee = (method: PaymentMethod) => {
    if (!method.fees) return 0;
    return (amount * method.fees) / 100;
  };

  const filteredMethods = getFilteredMethods();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pilih Metode Pembayaran
        </CardTitle>
        <p className="text-sm text-gray-600">
          Total pembayaran: <span className="font-semibold text-blue-600">{formatCurrency(amount)}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {filteredMethods.map((method) => {
            const fee = calculateFee(method);
            const totalAmount = amount + fee;
            const isSelected = selectedMethod?.id === method.id;

            return (
              <div
                key={method.id}
                onClick={() => onSelect(method)}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {method.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        {method.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Populer
                          </Badge>
                        )}
                        {method.isRecommended && (
                          <Badge variant="default" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Direkomendasikan
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {method.processingTime}
                        </div>
                        {fee > 0 && (
                          <div className="text-xs text-orange-600">
                            Biaya: {formatCurrency(fee)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {fee > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
                      </div>
                    )}
                    
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                    `}>
                      {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMethods.length === 0 && (
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Tidak ada metode pembayaran yang tersedia</p>
            <p className="text-sm text-gray-500">
              Untuk jumlah {formatCurrency(amount)}
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Pembayaran Aman</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Semua transaksi dienkripsi dan diproses melalui gateway pembayaran yang tersertifikasi PCI DSS.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
