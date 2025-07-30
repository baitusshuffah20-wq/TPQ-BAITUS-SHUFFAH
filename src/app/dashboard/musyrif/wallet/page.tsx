"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import WithdrawalRequestForm from "@/components/musyrif/WithdrawalRequestForm";
import WithdrawalHistory from "@/components/musyrif/WithdrawalHistory";

interface WalletData {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  monthlyEarnings: number;
  recentEarnings: Array<{
    id: string;
    amount: number;
    date: string;
    sessionType: string;
    calculationType: string;
    sessionDuration?: number;
    rate: number;
    createdAt: string;
  }>;
  pendingWithdrawals: Array<{
    id: string;
    amount: number;
    bankName: string;
    accountHolder: string;
    status: string;
    requestedAt: string;
  }>;
}

export default function MusyrifWalletPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

  // Check if user has musyrif role
  if (!user || user.role !== "MUSYRIF") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-gray-600">
              Hanya musyrif yang dapat mengakses halaman wallet.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/musyrif/wallet");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch wallet data");
      }

      if (result.success) {
        setWalletData(result.data);
      } else {
        setError(result.message || "Failed to load wallet data");
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data wallet...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchWalletData} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!walletData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Data Wallet
            </h3>
            <p className="text-gray-600">
              Data wallet akan muncul setelah Anda melakukan absensi.
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
            <h1 className="text-2xl font-bold text-gray-900">Wallet Saya</h1>
            <p className="text-gray-600">Kelola penghasilan dan penarikan dana Anda</p>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowWithdrawalForm(!showWithdrawalForm)}
          >
            {showWithdrawalForm ? (
              <>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Tutup Form
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Tarik Dana
              </>
            )}
          </Button>
        </div>

        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Saldo Tersedia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wallet className="h-8 w-8 opacity-80" />
                <div className="ml-3">
                  <p className="text-2xl font-bold">
                    {formatCurrency(walletData.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Penghasilan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(walletData.totalEarned)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Withdrawn */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Penarikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(walletData.totalWithdrawn)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Earnings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Penghasilan Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(walletData.monthlyEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Request Form */}
        {showWithdrawalForm && walletData && (
          <WithdrawalRequestForm
            availableBalance={walletData.balance}
            onSuccess={() => {
              setShowWithdrawalForm(false);
              fetchWalletData(); // Refresh wallet data
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Penghasilan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {walletData.recentEarnings.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada penghasilan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {walletData.recentEarnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(earning.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(earning.date)} • {earning.sessionType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {earning.calculationType === "PER_HOUR" ? "Per Jam" : "Per Sesi"}
                        </p>
                        {earning.sessionDuration && (
                          <p className="text-xs text-gray-500">
                            {Math.floor(earning.sessionDuration / 60)}j {earning.sessionDuration % 60}m
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Withdrawals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowDownRight className="h-5 w-5 mr-2 text-orange-500" />
                Penarikan Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              {walletData.pendingWithdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowDownRight className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Tidak ada penarikan pending</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {walletData.pendingWithdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(withdrawal.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {withdrawal.bankName} • {withdrawal.accountHolder}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          withdrawal.status === "PENDING" 
                            ? "bg-yellow-100 text-yellow-800"
                            : withdrawal.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {withdrawal.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(withdrawal.requestedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <WithdrawalHistory />
      </div>
    </DashboardLayout>
  );
}
