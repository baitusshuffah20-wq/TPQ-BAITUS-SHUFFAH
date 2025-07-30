"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Bug,
  AlertCircle,
  Info,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  level: "ERROR" | "WARNING" | "INFO";
  source?: string;
  userId?: string;
  userAgent?: string;
  url?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function ErrorLogsPage() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    level: "",
    source: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    loadErrorLogs();
  }, [filters, pagination.page]);

  const loadErrorLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      
      if (filters.search) params.append("search", filters.search);
      if (filters.level) params.append("level", filters.level);
      if (filters.source) params.append("source", filters.source);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const response = await fetch(`/api/system/error-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setErrorLogs(data.logs || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
        }));
      } else {
        toast.error("Gagal memuat error logs");
      }
    } catch (error) {
      console.error("Error loading error logs:", error);
      toast.error("Gagal memuat error logs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearLogs = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua error logs?")) {
      return;
    }

    try {
      const response = await fetch("/api/system/error-logs", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Error logs berhasil dihapus");
        loadErrorLogs();
      } else {
        toast.error("Gagal menghapus error logs");
      }
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast.error("Gagal menghapus error logs");
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "INFO":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bug className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      ERROR: "destructive",
      WARNING: "warning", 
      INFO: "default",
    };
    return variants[level as keyof typeof variants] || "secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const viewDetails = (errorLog: ErrorLog) => {
    setSelectedError(errorLog);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat error logs...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
          <div className="flex gap-3">
            <Button
              onClick={loadErrorLogs}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={clearLogs}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Error Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Cari error message..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Level</option>
                  <option value="ERROR">Error</option>
                  <option value="WARNING">Warning</option>
                  <option value="INFO">Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <Input
                  type="text"
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                  placeholder="Source/Component"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <Input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <Input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Error Logs ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {errorLogs.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada error logs ditemukan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {errorLogs.map((errorLog) => (
                  <div
                    key={errorLog.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getLevelIcon(errorLog.level)}
                          <Badge variant={getLevelBadge(errorLog.level) as any}>
                            {errorLog.level}
                          </Badge>
                          {errorLog.source && (
                            <Badge variant="outline">{errorLog.source}</Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          {errorLog.message}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(errorLog.createdAt)}
                          </span>
                          {errorLog.user && (
                            <span>User: {errorLog.user.name}</span>
                          )}
                          {errorLog.url && (
                            <span>URL: {errorLog.url}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => viewDetails(errorLog)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}

        {/* Error Details Modal */}
        {showDetails && selectedError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Error Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level:
                    </label>
                    <Badge variant={getLevelBadge(selectedError.level) as any}>
                      {selectedError.level}
                    </Badge>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {selectedError.message}
                    </div>
                  </div>

                  {selectedError.stack && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stack Trace:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <pre className="text-xs whitespace-pre-wrap">
                          {selectedError.stack}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        {selectedError.source || "N/A"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        {selectedError.url || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Agent:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {selectedError.userAgent || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timestamp:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {formatDate(selectedError.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setShowDetails(false)}
                    className="bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
