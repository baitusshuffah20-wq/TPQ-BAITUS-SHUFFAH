"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  type: "SPP" | "DONATION" | "OTHER";
  method: "CASH" | "BANK_TRANSFER" | "E_WALLET" | "QRIS" | "CREDIT_CARD";
  reference?: string;
  description: string;
  paidAt?: string;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    nis: string;
  };
  donor?: {
    name: string;
    email?: string;
  };
}

interface PaymentSummary {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalFailed: number;
  totalTransactions: number;
  successRate: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    totalFailed: 0,
    totalTransactions: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "ALL",
    type: "ALL",
    method: "ALL",
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadPayments();
  }, [pagination.page, filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== "ALL" && { status: filters.status }),
        ...(filters.type !== "ALL" && { type: filters.type }),
        ...(filters.method !== "ALL" && { method: filters.method }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/payments?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPayments(data.payments || []);
        setSummary(
          data.summary || {
            totalAmount: 0,
            totalPaid: 0,
            totalPending: 0,
            totalFailed: 0,
            totalTransactions: 0,
            successRate: 0,
          },
        );
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        console.error("Failed to load payments:", data.error);
        setPayments([]);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Gagal memuat data pembayaran");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        export: "true",
        ...(filters.status !== "ALL" && { status: filters.status }),
        ...(filters.type !== "ALL" && { type: filters.type }),
        ...(filters.method !== "ALL" && { method: filters.method }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/payments?${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data berhasil diekspor");
      } else {
        toast.error("Gagal mengekspor data");
      }
    } catch (error) {
      console.error("Error exporting payments:", error);
      toast.error("Gagal mengekspor data");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PAID: "default",
      PENDING: "secondary",
      FAILED: "destructive",
      CANCELLED: "outline",
    };

    return (
      <Badge
        variant={variants[status] || "outline"}
        className="flex items-center gap-1"
      >
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
          <p className="text-gray-600">Kelola semua transaksi pembayaran</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadPayments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pembayaran
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Berhasil</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalPaid)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalPending)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold">
                  {summary.successRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="ALL">Semua Status</option>
                <option value="PAID">Berhasil</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Gagal</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="SPP">SPP</option>
                <option value="DONATION">Donasi</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Metode</label>
              <select
                value={filters.method}
                onChange={(e) => handleFilterChange("method", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="ALL">Semua Metode</option>
                <option value="CASH">Tunai</option>
                <option value="BANK_TRANSFER">Transfer Bank</option>
                <option value="E_WALLET">E-Wallet</option>
                <option value="QRIS">QRIS</option>
                <option value="CREDIT_CARD">Kartu Kredit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Dari Tanggal
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cari</label>
              <Input
                placeholder="Cari pembayaran..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada pembayaran
              </h3>
              <p className="text-gray-600">
                Belum ada data pembayaran yang sesuai dengan filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Payer</th>
                    <th className="text-left p-3">Tipe</th>
                    <th className="text-left p-3">Jumlah</th>
                    <th className="text-left p-3">Metode</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Tanggal</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">
                        {payment.id.slice(0, 8)}
                      </td>
                      <td className="p-3">
                        {payment.student ? (
                          <div>
                            <p className="font-medium">
                              {payment.student.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {payment.student.nis}
                            </p>
                          </div>
                        ) : payment.donor ? (
                          <div>
                            <p className="font-medium">{payment.donor.name}</p>
                            <p className="text-sm text-gray-600">
                              {payment.donor.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{payment.type}</Badge>
                      </td>
                      <td className="p-3 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="p-3">{payment.method}</td>
                      <td className="p-3">{getStatusBadge(payment.status)}</td>
                      <td className="p-3 text-sm">
                        {payment.paidAt
                          ? formatDate(payment.paidAt)
                          : formatDate(payment.createdAt)}
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} pembayaran
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
