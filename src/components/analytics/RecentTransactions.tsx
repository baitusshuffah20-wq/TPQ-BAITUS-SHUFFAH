'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/Button';
import { 
  Clock,
  CreditCard,
  Building,
  Smartphone,
  QrCode,
  Wallet,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  items: any[];
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
  onViewDetails?: (transaction: Transaction) => void;
}

export default function RecentTransactions({ 
  transactions, 
  loading, 
  onViewDetails 
}: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method.toLowerCase();
    
    if (methodLower.includes('credit') || methodLower.includes('cc')) {
      return <CreditCard className="h-4 w-4 text-blue-600" />;
    }
    if (methodLower.includes('va') || methodLower.includes('bank')) {
      return <Building className="h-4 w-4 text-green-600" />;
    }
    if (methodLower.includes('gopay') || methodLower.includes('shopeepay') || 
        methodLower.includes('dana') || methodLower.includes('ovo')) {
      return <Smartphone className="h-4 w-4 text-purple-600" />;
    }
    if (methodLower.includes('qris')) {
      return <QrCode className="h-4 w-4 text-red-600" />;
    }
    return <Wallet className="h-4 w-4 text-gray-600" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <Badge variant="success">Paid</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      'credit_card': 'Kartu Kredit',
      'cc': 'Kartu Kredit',
      'bca_va': 'BCA VA',
      'bni_va': 'BNI VA',
      'bri_va': 'BRI VA',
      'mandiri_va': 'Mandiri VA',
      'gopay': 'GoPay',
      'shopeepay': 'ShopeePay',
      'dana': 'DANA',
      'ovo': 'OVO',
      'qris': 'QRIS',
      'bank_transfer': 'Transfer Bank'
    };
    return methods[method.toLowerCase()] || method;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaksi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaksi Terbaru
          </CardTitle>
          <Badge variant="outline">{transactions.length} transaksi</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Tidak ada transaksi terbaru</p>
            <p className="text-sm text-gray-500">Transaksi akan muncul di sini setelah ada pembayaran</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                {/* Payment Method Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getPaymentMethodIcon(transaction.paymentMethod)}
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {transaction.customerName}
                    </h4>
                    {getStatusIcon(transaction.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      {getPaymentMethodName(transaction.paymentMethod)}
                    </span>
                    <span>•</span>
                    <span>{formatDate(transaction.createdAt)}</span>
                  </div>
                  
                  <div className="mt-1">
                    <p className="text-xs text-gray-500">
                      Order ID: {transaction.orderId}
                    </p>
                    {transaction.items.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {transaction.items.length} item(s): {transaction.items[0].name}
                        {transaction.items.length > 1 && ` +${transaction.items.length - 1} lainnya`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-semibold text-gray-900 mb-1">
                    {formatCurrency(transaction.amount)}
                  </p>
                  {getStatusBadge(transaction.status)}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => onViewDetails?.(transaction)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
