"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";
import { PageLoading, CardLoading } from "@/components/ui/LoadingSpinner";
import useFetch from "@/hooks/useFetch";
import errorHandler from "@/lib/errorHandler";

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  userAgent?: string;
  severity: string;
  context?: string;
  metadata?: string;
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const ErrorLogsPage = () => {
  const [filter, setFilter] = useState("all"); // 'all', 'resolved', 'unresolved'
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const {
    data: errorLogsData,
    isLoading,
    error,
    get: fetchErrorLogs,
  } = useFetch<{ success: boolean; errorLogs: ErrorLog[] }>();

  const { isLoading: isUpdating, post: updateErrorLog } = useFetch();

  useEffect(() => {
    fetchErrorLogs("/api/admin/error-logs");
  }, [fetchErrorLogs]);

  const handleRefresh = () => {
    fetchErrorLogs("/api/admin/error-logs");
  };

  const handleResolve = async (id: string) => {
    try {
      const result = await updateErrorLog("/api/admin/error-logs/resolve", {
        id,
      });
      if (result && result.success) {
        errorHandler.showSuccess(
          "Log error berhasil ditandai sebagai terselesaikan",
        );
        handleRefresh();
      }
    } catch (error) {
      console.error("Error resolving error log:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus log error ini?")) {
      return;
    }

    try {
      const result = await updateErrorLog("/api/admin/error-logs/delete", {
        id,
      });
      if (result && result.success) {
        errorHandler.showSuccess("Log error berhasil dihapus");
        handleRefresh();
      }
    } catch (error) {
      console.error("Error deleting error log:", error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredLogs =
    errorLogsData?.errorLogs?.filter((log) => {
      // Apply status filter
      if (filter === "resolved" && !log.resolved) return false;
      if (filter === "unresolved" && log.resolved) return false;

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(query) ||
          (log.context && log.context.toLowerCase().includes(query)) ||
          (log.url && log.url.toLowerCase().includes(query))
        );
      }

      return true;
    }) || [];

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "ERROR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </span>
        );
      case "INFO":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Info className="w-3 h-3 mr-1" />
            Info
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {severity}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <CardLoading text="Memuat data log error..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Log Error Sistem
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari log error..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Semua</option>
                <option value="resolved">Terselesaikan</option>
                <option value="unresolved">Belum Terselesaikan</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
                <p>Gagal memuat data log error: {error}</p>
              </div>
              <Button
                variant="link"
                size="sm"
                className="text-red-600 mt-1 p-0"
                onClick={handleRefresh}
              >
                Coba lagi
              </Button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Tidak ada log error
              </h3>
              <p className="text-gray-500">
                {filter !== "all"
                  ? `Tidak ada log error yang ${
                      filter === "resolved"
                        ? "terselesaikan"
                        : "belum terselesaikan"
                    }`
                  : searchQuery
                    ? "Tidak ada hasil pencarian"
                    : "Sistem berjalan dengan baik tanpa error"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-lg overflow-hidden ${
                    log.resolved
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(log.severity)}
                        {log.resolved && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Terselesaikan
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-medium text-gray-900">
                        {log.message}
                      </h3>
                      {log.context && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Konteks:</span>{" "}
                          {log.context}
                        </p>
                      )}
                      {log.url && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">URL:</span> {log.url}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(log.id)}
                      >
                        {expandedLogs[log.id]
                          ? "Sembunyikan Detail"
                          : "Lihat Detail"}
                      </Button>
                      {!log.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleResolve(log.id)}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Tandai Terselesaikan
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(log.id)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                  {expandedLogs[log.id] && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-3">
                        {log.stack && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Stack Trace
                            </h4>
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                              {log.stack}
                            </pre>
                          </div>
                        )}
                        {log.userAgent && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              User Agent
                            </h4>
                            <p className="text-xs text-gray-600">
                              {log.userAgent}
                            </p>
                          </div>
                        )}
                        {log.metadata && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Metadata
                            </h4>
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                              {JSON.stringify(
                                JSON.parse(log.metadata),
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        )}
                        {log.resolved && log.resolvedAt && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Terselesaikan Pada
                            </h4>
                            <p className="text-xs text-gray-600">
                              {formatDate(log.resolvedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ErrorLogsPage;
