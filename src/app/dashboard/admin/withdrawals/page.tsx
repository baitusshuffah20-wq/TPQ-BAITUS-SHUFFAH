"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowDownRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Building,
  User,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  Eye
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface WithdrawalRecord {
  id: string;
  musyrifId: string;
  musyrifName: string;
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

export default function AdminWithdrawalsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);

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
    fetchWithdrawals(activeTab);
  }, [activeTab]);

  const fetchWithdrawals = async (status: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/withdrawal/approve?status=${status}&limit=50`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch withdrawals");
      }

      if (result.success) {
        setWithdrawals(result.data);
      } else {
        setError(result.message || "Failed to load withdrawals");
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (
    withdrawalId: string, 
    action: "APPROVED" | "REJECTED" | "COMPLETED",
    rejectionReason?: string
  ) => {
    try {
      setProcessingId(withdrawalId);

      const response = await fetch("/api/admin/withdrawal/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawalId,
          action,
          rejectionReason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to process withdrawal");
      }

      if (result.success) {
        // Refresh the list
        fetchWithdrawals(activeTab);
      } else {
        setError(result.message || "Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setProcessingId(null);
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

  const renderWithdrawalCard = (withdrawal: WithdrawalRecord) => (
    <Card key={withdrawal.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {getStatusIcon(withdrawal.status)}
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">{withdrawal.musyrifName}</h3>
              <p className="text-sm text-gray-500">
                {formatDate(withdrawal.requestedAt)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(withdrawal.amount)}
            </p>
            <Badge className={getStatusColor(withdrawal.status)}>
              {withdrawal.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-gray-600">
            <Building className="h-4 w-4 mr-2" />
            <span>{withdrawal.bankName}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span>{withdrawal.accountHolder}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Rekening: {withdrawal.bankAccount}</p>
        </div>

        {withdrawal.status === "REJECTED" && withdrawal.rejectionReason && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              <strong>Alasan Penolakan:</strong> {withdrawal.rejectionReason}
            </p>
          </div>
        )}

        {withdrawal.notes && (
          <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded">
            <p className="text-sm text-gray-700">
              <strong>Catatan:</strong> {withdrawal.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {withdrawal.status === "PENDING" && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleWithdrawalAction(withdrawal.id, "APPROVED")}
                disabled={processingId === withdrawal.id}
              >
                {processingId === withdrawal.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Setujui
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  const reason = prompt("Alasan penolakan:");
                  if (reason) {
                    handleWithdrawalAction(withdrawal.id, "REJECTED", reason);
                  }
                }}
                disabled={processingId === withdrawal.id}
              >
                <XCircle className="h-4 w-4" />
                Tolak
              </Button>
            </>
          )}
          
          {withdrawal.status === "APPROVED" && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleWithdrawalAction(withdrawal.id, "COMPLETED")}
              disabled={processingId === withdrawal.id}
            >
              {processingId === withdrawal.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Selesaikan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Penarikan Dana</h1>
            <p className="text-gray-600">Approve dan kelola permintaan penarikan musyrif</p>
          </div>
          <Button onClick={() => fetchWithdrawals(activeTab)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Memuat data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => fetchWithdrawals(activeTab)} variant="outline">
                  Coba Lagi
                </Button>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <ArrowDownRight className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada penarikan dengan status {activeTab.toLowerCase()}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map(renderWithdrawalCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
