'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  Building,
  Smartphone,
  QrCode,
  Wallet,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

interface PaymentMethodStats {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
  successRate: number;
}

interface PaymentMethodChartProps {
  data: PaymentMethodStats[];
  loading?: boolean;
}

export default function PaymentMethodChart({ data, loading }: PaymentMethodChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getMethodIcon = (method: string) => {
    const methodLower = method.toLowerCase();
    
    if (methodLower.includes('credit') || methodLower.includes('cc')) {
      return <CreditCard className="h-5 w-5 text-blue-600" />;
    }
    if (methodLower.includes('va') || methodLower.includes('bank')) {
      return <Building className="h-5 w-5 text-green-600" />;
    }
    if (methodLower.includes('gopay') || methodLower.includes('shopeepay') || 
        methodLower.includes('dana') || methodLower.includes('ovo')) {
      return <Smartphone className="h-5 w-5 text-purple-600" />;
    }
    if (methodLower.includes('qris')) {
      return <QrCode className="h-5 w-5 text-red-600" />;
    }
    return <Wallet className="h-5 w-5 text-gray-600" />;
  };

  const getMethodColor = (method: string) => {
    const methodLower = method.toLowerCase();
    
    if (methodLower.includes('credit') || methodLower.includes('cc')) {
      return 'bg-blue-500';
    }
    if (methodLower.includes('va') || methodLower.includes('bank')) {
      return 'bg-green-500';
    }
    if (methodLower.includes('gopay') || methodLower.includes('shopeepay') || 
        methodLower.includes('dana') || methodLower.includes('ovo')) {
      return 'bg-purple-500';
    }
    if (methodLower.includes('qris')) {
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  };

  const getMethodName = (method: string) => {
    const methods: Record<string, string> = {
      'credit_card': 'Kartu Kredit',
      'cc': 'Kartu Kredit',
      'bca_va': 'BCA Virtual Account',
      'bni_va': 'BNI Virtual Account',
      'bri_va': 'BRI Virtual Account',
      'mandiri_va': 'Mandiri Virtual Account',
      'gopay': 'GoPay',
      'shopeepay': 'ShopeePay',
      'dana': 'DANA',
      'ovo': 'OVO',
      'qris': 'QRIS',
      'bank_transfer': 'Transfer Bank'
    };
    return methods[method.toLowerCase()] || method;
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = data.reduce((sum, item) => sum + item.count, 0);
  const averageSuccessRate = data.length > 0 
    ? data.reduce((sum, item) => sum + item.successRate, 0) / data.length 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Metode Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Revenue</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Total Transaksi</span>
              </div>
              <p className="text-lg font-bold text-green-900">{formatNumber(totalTransactions)}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Avg Success Rate</span>
              </div>
              <p className="text-lg font-bold text-purple-900">{averageSuccessRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Breakdown per Metode</h3>
            
            {data.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Tidak ada data metode pembayaran</p>
                <p className="text-sm text-gray-500">Data akan muncul setelah ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((method, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getMethodIcon(method.method)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {getMethodName(method.method)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatNumber(method.count)} transaksi
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(method.revenue)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={method.successRate >= 90 ? 'success' : 
                                   method.successRate >= 70 ? 'warning' : 'destructive'}
                            className="text-xs"
                          >
                            {method.successRate.toFixed(1)}% success
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Market Share</span>
                        <span>{method.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getMethodColor(method.method)}`}
                          style={{ width: `${method.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-600">Avg per Transaksi</p>
                        <p className="text-sm font-medium text-gray-900">
                          {method.count > 0 ? formatCurrency(method.revenue / method.count) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Share dari Total</p>
                        <p className="text-sm font-medium text-gray-900">
                          {method.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
