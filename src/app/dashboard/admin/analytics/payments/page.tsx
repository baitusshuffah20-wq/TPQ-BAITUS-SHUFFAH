'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import PaymentOverviewCards from '@/components/analytics/PaymentOverviewCards';
import RevenueChart from '@/components/analytics/RevenueChart';
import PaymentMethodChart from '@/components/analytics/PaymentMethodChart';
import RecentTransactions from '@/components/analytics/RecentTransactions';
import { 
  BarChart3,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  TrendingUp,
  Users,
  CreditCard,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentAnalytics {
  overview: {
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    averageTransactionValue: number;
    monthlyGrowth: number;
    pendingAmount: number;
  };
  revenueByPeriod: {
    period: string;
    revenue: number;
    transactions: number;
    growth: number;
  }[];
  paymentMethodStats: {
    method: string;
    count: number;
    revenue: number;
    percentage: number;
    successRate: number;
  }[];
  categoryBreakdown: {
    category: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }[];
  topStudents: {
    studentId: string;
    studentName: string;
    totalPaid: number;
    transactionCount: number;
    lastPayment: Date;
  }[];
  recentTransactions: any[];
}

export default function PaymentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    status: '',
    category: ''
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);

      const response = await fetch(`/api/analytics/payments?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        toast.error('Gagal memuat data analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Gagal memuat data analytics');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    loadAnalytics();
  };

  const resetFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      status: '',
      category: ''
    });
  };

  const exportData = async (format: 'CSV' | 'PDF') => {
    try {
      setExporting(true);
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      queryParams.append('export', format);

      const response = await fetch(`/api/analytics/payments?${queryParams.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-analytics-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Report ${format} berhasil diunduh`);
      } else {
        toast.error('Gagal mengunduh report');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Gagal mengunduh report');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Analytics</h1>
          <p className="text-gray-600">Analisis komprehensif data pembayaran TPQ Baitus Shuffah</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => loadAnalytics()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => exportData('CSV')}
            variant="outline"
            size="sm"
            disabled={exporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportData('PDF')}
            variant="outline"
            size="sm"
            disabled={exporting}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Metode</option>
                <option value="credit_card">Kartu Kredit</option>
                <option value="bca_va">BCA VA</option>
                <option value="bni_va">BNI VA</option>
                <option value="bri_va">BRI VA</option>
                <option value="mandiri_va">Mandiri VA</option>
                <option value="gopay">GoPay</option>
                <option value="shopeepay">ShopeePay</option>
                <option value="qris">QRIS</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button
                onClick={applyFilters}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Filter className="h-4 w-4" />
                Apply
              </Button>
              <Button
                onClick={resetFilters}
                variant="outline"
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      {analytics && (
        <PaymentOverviewCards 
          stats={analytics.overview} 
          loading={loading}
        />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {analytics && (
          <RevenueChart 
            data={analytics.revenueByPeriod} 
            loading={loading}
          />
        )}

        {/* Payment Method Chart */}
        {analytics && (
          <PaymentMethodChart 
            data={analytics.paymentMethodStats} 
            loading={loading}
          />
        )}
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        {analytics && analytics.categoryBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Breakdown Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{category.category}</h4>
                      <p className="text-sm text-gray-600">{category.transactions} transaksi</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(category.revenue)}</p>
                      <Badge variant="outline">{category.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Students */}
        {analytics && analytics.topStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Paying Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topStudents.slice(0, 5).map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                        <p className="text-sm text-gray-600">{student.transactionCount} transaksi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(student.totalPaid)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(student.lastPayment).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Transactions */}
      {analytics && (
        <RecentTransactions
          transactions={analytics.recentTransactions}
          loading={loading}
          onViewDetails={(transaction) => {
            // Handle view details - could open a modal or navigate to detail page
            console.log('View transaction details:', transaction);
          }}
        />
      )}
    </div>
  );
}
