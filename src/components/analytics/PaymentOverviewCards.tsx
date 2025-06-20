'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  BarChart3,
  Target
} from 'lucide-react';

interface OverviewStats {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  averageTransactionValue: number;
  monthlyGrowth: number;
  pendingAmount: number;
}

interface PaymentOverviewCardsProps {
  stats: OverviewStats;
  loading?: boolean;
}

export default function PaymentOverviewCards({ stats, loading }: PaymentOverviewCardsProps) {
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

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total pendapatan bulan ini',
      trend: stats.monthlyGrowth,
      trendLabel: 'vs bulan lalu'
    },
    {
      title: 'Total Transaksi',
      value: formatNumber(stats.totalTransactions),
      icon: CreditCard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Jumlah transaksi bulan ini',
      trend: null,
      trendLabel: 'transaksi'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'Tingkat keberhasilan pembayaran',
      trend: null,
      trendLabel: 'dari total transaksi'
    },
    {
      title: 'Rata-rata Transaksi',
      value: formatCurrency(stats.averageTransactionValue),
      icon: BarChart3,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Nilai rata-rata per transaksi',
      trend: null,
      trendLabel: 'per transaksi'
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(stats.pendingAmount),
      icon: Clock,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Total pembayaran pending',
      trend: null,
      trendLabel: 'menunggu pembayaran'
    },
    {
      title: 'Monthly Growth',
      value: formatPercentage(stats.monthlyGrowth),
      icon: stats.monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
      iconColor: stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.monthlyGrowth >= 0 ? 'bg-green-100' : 'bg-red-100',
      description: 'Pertumbuhan bulan ini',
      trend: stats.monthlyGrowth,
      trendLabel: 'dibanding bulan lalu'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
                
                {card.trend !== null && (
                  <div className="flex items-center gap-1">
                    {card.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      card.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(card.trend)}
                    </span>
                    <span className="text-xs text-gray-500">{card.trendLabel}</span>
                  </div>
                )}
              </div>
              
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
