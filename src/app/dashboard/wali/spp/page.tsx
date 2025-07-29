"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SPPCartSection from "@/components/wali/SPPCartSection";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Receipt,
  Building,
  History,
  ShoppingCart,
} from "lucide-react";

const WaliSPPPage = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("current");
  const [stats, setStats] = useState({
    totalPending: 0,
    totalOverdue: 0,
    totalPaid: 0,
    pendingCount: 0,
    overdueCount: 0,
    paidCount: 0,
  });

  useEffect(() => {
    if (user) {
      loadSPPStats();
    }
  }, [user]);

  const loadSPPStats = async () => {
    try {
      const response = await fetch(`/api/spp/stats?waliId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Error loading SPP stats:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const tabs = [
    { id: "current", label: "Tagihan Aktif", icon: Clock },
    { id: "history", label: "Riwayat Pembayaran", icon: History },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pembayaran SPP</h1>
            <p className="text-gray-600">
              Kelola pembayaran SPP anak Anda dengan mudah
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Riwayat Kwitansi
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Belum Dibayar
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.totalPending)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overdueCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.totalOverdue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Sudah Dibayar
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.paidCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.totalPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Tahun Ini
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.paidCount + stats.pendingCount + stats.overdueCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(
                      stats.totalPaid + stats.totalPending + stats.totalOverdue,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                className="h-20 flex-col bg-blue-600 hover:bg-blue-700"
                onClick={() => setSelectedTab("current")}
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-sm">Bayar SPP</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => setSelectedTab("history")}
              >
                <Receipt className="h-6 w-6 mb-2" />
                <span className="text-sm">Lihat Riwayat</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                <span className="text-sm">Unduh Kwitansi</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-sm">Jadwal Bayar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    selectedTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === "current" && <SPPCartSection />}

        {selectedTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Riwayat Pembayaran SPP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Riwayat Pembayaran
                </h3>
                <p className="text-gray-600 mb-4">
                  Fitur riwayat pembayaran akan segera tersedia
                </p>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Unduh Laporan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Informasi Pembayaran SPP
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>� SPP dapat dibayar melalui transfer bank atau e-wallet</p>
                  <p>� Pembayaran manual akan diverifikasi dalam 1x24 jam</p>
                  <p>
                    � Kwitansi digital akan dikirim setelah pembayaran
                    dikonfirmasi
                  </p>
                  <p>� Hubungi admin jika ada kendala dalam pembayaran</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliSPPPage;
