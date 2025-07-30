"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Download,
  Filter,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface SalaryReportData {
  summary: {
    totalEarnings: number;
    totalWithdrawals: number;
    netAmount: number;
    totalSessions: number;
    totalWithdrawalRequests: number;
    uniqueMusyrif: number;
  };
  earningsByMusyrif: Array<{
    musyrifId: string;
    musyrifName: string;
    totalEarnings: number;
    totalSessions: number;
    totalHours: number;
  }>;
  withdrawalsByMusyrif: Array<{
    musyrifId: string;
    musyrifName: string;
    totalWithdrawals: number;
    withdrawalCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    totalEarnings: number;
    totalSessions: number;
    uniqueMusyrif: number;
  }>;
}

export default function AdminSalaryReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<SalaryReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    musyrifId: "",
  });
  const [exporting, setExporting] = useState(false);

  // Check if user has admin role
  if (!user || user.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-gray-600">
              Hanya administrator yang dapat mengakses halaman ini.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.musyrifId) params.append("musyrifId", filters.musyrifId);

      const response = await fetch(`/api/admin/salary-reports?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch salary reports");
      }

      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.message || "Failed to load salary reports");
      }
    } catch (error) {
      console.error("Error fetching salary reports:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    fetchReportData();
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      musyrifId: "",
    });
    setTimeout(() => {
      fetchReportData();
    }, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };

  const handleExport = async (format: "excel" | "csv") => {
    try {
      setExporting(true);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.musyrifId) params.append("musyrifId", filters.musyrifId);
      params.append("format", format);

      const response = await fetch(`/api/admin/salary-reports/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to export report");
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `salary_report.${format === 'excel' ? 'xlsx' : 'csv'}`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`✅ Report exported: ${filename}`);
    } catch (error) {
      console.error("Error exporting report:", error);
      setError("Gagal export report. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat laporan salary...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchReportData} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak Ada Data
            </h3>
            <p className="text-gray-600">
              Belum ada data salary untuk ditampilkan.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Salary</h1>
            <p className="text-gray-600">Analytics dan laporan penghasilan musyrif</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchReportData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("excel")}
                className="bg-green-600 hover:bg-green-700"
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Excel
              </Button>
              <Button
                onClick={() => handleExport("csv")}
                variant="outline"
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Akhir</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="musyrifId">Musyrif (Opsional)</Label>
                <Input
                  id="musyrifId"
                  type="text"
                  placeholder="ID Musyrif"
                  value={filters.musyrifId}
                  onChange={(e) => handleFilterChange("musyrifId", e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Terapkan Filter
              </Button>
              <Button onClick={resetFilters} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Total Penghasilan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 opacity-80" />
                <div className="ml-3">
                  <p className="text-2xl font-bold">
                    {formatCurrency(reportData.summary.totalEarnings)}
                  </p>
                  <p className="text-sm opacity-80">
                    {reportData.summary.totalSessions} sesi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Total Penarikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 opacity-80" />
                <div className="ml-3">
                  <p className="text-2xl font-bold">
                    {formatCurrency(reportData.summary.totalWithdrawals)}
                  </p>
                  <p className="text-sm opacity-80">
                    {reportData.summary.totalWithdrawalRequests} penarikan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Saldo Bersih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 opacity-80" />
                <div className="ml-3">
                  <p className="text-2xl font-bold">
                    {formatCurrency(reportData.summary.netAmount)}
                  </p>
                  <p className="text-sm opacity-80">
                    {reportData.summary.uniqueMusyrif} musyrif aktif
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed reports */}
        <Tabs defaultValue="earnings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="earnings">Penghasilan per Musyrif</TabsTrigger>
            <TabsTrigger value="withdrawals">Penarikan per Musyrif</TabsTrigger>
            <TabsTrigger value="trends">Trend Bulanan</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Penghasilan per Musyrif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.earningsByMusyrif.map((musyrif) => (
                    <div key={musyrif.musyrifId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900">{musyrif.musyrifName}</h3>
                          <p className="text-sm text-gray-500">
                            {musyrif.totalSessions} sesi • {Math.round(musyrif.totalHours)} jam
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(musyrif.totalEarnings)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rata-rata: {formatCurrency(musyrif.totalEarnings / musyrif.totalSessions)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Penarikan per Musyrif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.withdrawalsByMusyrif.map((musyrif) => (
                    <div key={musyrif.musyrifId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <TrendingDown className="h-8 w-8 text-red-500" />
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900">{musyrif.musyrifName}</h3>
                          <p className="text-sm text-gray-500">
                            {musyrif.withdrawalCount} penarikan
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(musyrif.totalWithdrawals)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rata-rata: {formatCurrency(musyrif.totalWithdrawals / musyrif.withdrawalCount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Trend Penghasilan Bulanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.monthlyTrends.map((trend) => (
                    <div key={trend.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-purple-500" />
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900">{formatMonth(trend.month)}</h3>
                          <p className="text-sm text-gray-500">
                            {trend.totalSessions} sesi • {trend.uniqueMusyrif} musyrif
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-600">
                          {formatCurrency(trend.totalEarnings)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rata-rata per sesi: {formatCurrency(trend.totalEarnings / trend.totalSessions)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
