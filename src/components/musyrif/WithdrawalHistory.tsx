"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  History, 
  ArrowDownRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calendar,
  Building,
  User,
  Loader2,
  RefreshCw
} from "lucide-react";

interface WithdrawalRecord {
  id: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export default function WithdrawalHistory() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawalHistory();
  }, []);

  const fetchWithdrawalHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/musyrif/withdrawal/request");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch withdrawal history");
      }

      if (result.success) {
        setWithdrawals(result.data);
      } else {
        setError(result.message || "Failed to load withdrawal history");
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Menunggu Persetujuan";
      case "APPROVED":
        return "Disetujui";
      case "COMPLETED":
        return "Selesai";
      case "REJECTED":
        return "Ditolak";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-500" />
            Riwayat Penarikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Memuat riwayat...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-500" />
            Riwayat Penarikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchWithdrawalHistory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-500" />
            Riwayat Penarikan
          </div>
          <Button onClick={fetchWithdrawalHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <ArrowDownRight className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada riwayat penarikan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getStatusIcon(withdrawal.status)}
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(withdrawal.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.status)}`}>
                    {getStatusText(withdrawal.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    <span>{withdrawal.bankName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{withdrawal.accountHolder}</span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <p>Rekening: {withdrawal.bankAccount}</p>
                </div>

                {withdrawal.status === "REJECTED" && withdrawal.rejectionReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <strong>Alasan Penolakan:</strong> {withdrawal.rejectionReason}
                    </p>
                  </div>
                )}

                {withdrawal.status === "COMPLETED" && withdrawal.completedAt && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Selesai pada: {formatDateTime(withdrawal.completedAt)}
                    </p>
                  </div>
                )}

                {withdrawal.notes && (
                  <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Catatan:</strong> {withdrawal.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
