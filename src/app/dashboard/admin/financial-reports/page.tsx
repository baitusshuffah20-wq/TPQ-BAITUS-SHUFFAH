'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ExportUtils } from '@/lib/export-utils';

interface ReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    totalBalance: number;
  };
  spp: {
    totalAmount: number;
    collectedAmount: number;
    outstandingAmount: number;
    collectionRate: number;
    recordsCount: number;
  };
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
  }>;
  transactionsByCategory: Record<string, { income: number; expense: number }>;
}

export default function FinancialReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'spp' | 'transactions' | 'outstanding'>('summary');
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'summary'
  });

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        reportType: filters.reportType,
        startDate: filters.startDate,
        endDate: filters.endDate
      });

      const response = await fetch(`/api/financial/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data.report);
      } else {
        toast.error('Gagal memuat data laporan');
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const exportReport = async (format: 'csv' | 'html' | 'print') => {
    try {
      if (!reportData) {
        toast.error('Tidak ada data untuk diekspor');
        return;
      }

      const exportData = {
        title: 'Laporan Keuangan TPQ Baitus Shuffah',
        period: reportData.period,
        summary: reportData.summary,
        spp: reportData.spp,
        accounts: reportData.accounts,
        transactionsByCategory: reportData.transactionsByCategory
      };

      const filename = `laporan-keuangan-${filters.startDate}-${filters.endDate}`;

      switch (format) {
        case 'csv':
          ExportUtils.downloadCSV(exportData, filename);
          toast.success('Laporan berhasil diekspor ke CSV');
          break;
        case 'html':
          ExportUtils.downloadHTML(exportData, filename);
          toast.success('Laporan berhasil diekspor ke HTML');
          break;
        case 'print':
          ExportUtils.printReport(exportData);
          toast.success('Membuka jendela print...');
          break;
        default:
          toast.error('Format export tidak valid');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Gagal mengekspor laporan');
    }
  };

  const tabs = [
    { id: 'summary', name: 'Ringkasan', icon: BarChart3 },
    { id: 'spp', name: 'Laporan SPP', icon: DollarSign },
    { id: 'transactions', name: 'Transaksi', icon: FileText },
    { id: 'outstanding', name: 'Tunggakan', icon: AlertTriangle }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat laporan...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => exportReport('csv')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => exportReport('html')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export HTML
            </Button>
            <Button
              onClick={() => exportReport('print')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={loadReportData}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Laporan
                </label>
                <select
                  name="reportType"
                  value={filters.reportType}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="summary">Ringkasan</option>
                  <option value="spp">SPP</option>
                  <option value="transactions">Transaksi</option>
                  <option value="outstanding">Tunggakan</option>
                  <option value="collection">Tingkat Koleksi</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={loadReportData}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period Info */}
        {reportData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Periode Laporan: {formatDate(reportData.period.startDate)} - {formatDate(reportData.period.endDate)}
              </span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.summary.totalIncome)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.summary.totalExpense)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendapatan Bersih</p>
                    <p className={`text-2xl font-bold ${reportData.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportData.summary.netIncome)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${reportData.summary.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <DollarSign className={`h-6 w-6 ${reportData.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Saldo</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(reportData.summary.totalBalance)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SPP Summary */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Ringkasan SPP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total SPP</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(reportData.spp.totalAmount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Terkumpul</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(reportData.spp.collectedAmount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Belum Terbayar</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(reportData.spp.outstandingAmount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tingkat Koleksi</p>
                  <p className="text-xl font-bold text-blue-600">
                    {reportData.spp.collectionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Jumlah Record</p>
                  <p className="text-xl font-bold text-gray-900">
                    {reportData.spp.recordsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accounts Summary */}
        {reportData && reportData.accounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Saldo Akun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-600">{account.type}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {reportData && Object.keys(reportData.transactionsByCategory).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Transaksi per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reportData.transactionsByCategory).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category}</p>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-sm text-gray-600">Pemasukan</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(data.income)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pengeluaran</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(data.expense)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
