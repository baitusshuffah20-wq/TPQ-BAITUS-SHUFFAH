'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';

interface RevenueData {
  period: string;
  revenue: number;
  transactions: number;
  growth: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  loading?: boolean;
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  const [viewType, setViewType] = useState<'revenue' | 'transactions'>('revenue');

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

  const formatPeriod = (period: string) => {
    const date = new Date(period + '-01');
    return date.toLocaleDateString('id-ID', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const maxValue = Math.max(...data.map(d => viewType === 'revenue' ? d.revenue : d.transactions));
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalTransactions = data.reduce((sum, d) => sum + d.transactions, 0);
  const averageGrowth = data.length > 0 ? data.reduce((sum, d) => sum + d.growth, 0) / data.length : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
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
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
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
            <BarChart3 className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setViewType('revenue')}
              variant={viewType === 'revenue' ? 'default' : 'outline'}
              size="sm"
            >
              Revenue
            </Button>
            <Button
              onClick={() => setViewType('transactions')}
              variant={viewType === 'transactions' ? 'default' : 'outline'}
              size="sm"
            >
              Transaksi
            </Button>
          </div>
        </div>
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
              <p className="text-xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Total Transaksi</span>
              </div>
              <p className="text-xl font-bold text-green-900">{formatNumber(totalTransactions)}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Rata-rata Growth</span>
              </div>
              <p className="text-xl font-bold text-purple-900">
                {averageGrowth >= 0 ? '+' : ''}{averageGrowth.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">
                {viewType === 'revenue' ? 'Revenue' : 'Jumlah Transaksi'} per Bulan
              </h3>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {data.length} bulan
              </Badge>
            </div>
            
            <div className="space-y-3">
              {data.map((item, index) => {
                const value = viewType === 'revenue' ? item.revenue : item.transactions;
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {formatPeriod(item.period)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          {viewType === 'revenue' 
                            ? formatCurrency(item.revenue)
                            : formatNumber(item.transactions)
                          }
                        </span>
                        {item.growth !== 0 && (
                          <Badge 
                            variant={item.growth >= 0 ? 'success' : 'destructive'}
                            className="text-xs"
                          >
                            {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          viewType === 'revenue' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {data.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Tidak ada data revenue</p>
              <p className="text-sm text-gray-500">Data akan muncul setelah ada transaksi pembayaran</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
