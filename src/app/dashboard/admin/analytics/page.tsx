"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentChart, {
  generatePaymentRevenueData,
  generatePaymentStatusData,
  generateWeeklyTrendData,
} from "@/components/charts/PaymentChart";
import AttendanceChart, {
  generateWeeklyAttendanceData,
} from "@/components/charts/AttendanceChart";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  DollarSign,
  Calendar,
  BookOpen,
  Award,
  Target,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";

// Type definitions

interface SummaryCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  color: string;
  bgColor: string;
}

interface HafalanProgress {
  surah: string;
  completed: number;
  total: number;
  percentage: number;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  paidDate: Date | null;
  // Add other payment fields as needed
}

interface Attendance {
  id: string;
  status: string;
  date: Date;
  // Add other attendance fields as needed
}

interface DetailedMetrics {
  hafalanTarget: {
    title: string;
    value: number;
    progress: number;
    percentage: number;
  };
  santriBerprestasi: {
    title: string;
    value: number;
    description: string;
  };
  efisiensiPembelajaran: {
    title: string;
    value: string;
    description: string;
  };
}

interface AnalyticsData {
  summaryCards: SummaryCard[];
  hafalanProgress: HafalanProgress[];
  payments: Payment[];
  attendance: Attendance[];
  detailedMetrics: DetailedMetrics;
}

const iconMap = {
  Users,
  GraduationCap,
  DollarSign,
  Calendar,
};

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [session, timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?timeRange=${timeRange}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        console.error("API returned error:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render if not authenticated or not admin
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  const refreshData = () => {
    fetchData();
  };

  const exportReport = () => {
    alert("Laporan akan didownload dalam format PDF");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Analisis mendalam performa rumah tahfidz
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
            >
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="90d">3 Bulan Terakhir</option>
              <option value="1y">1 Tahun Terakhir</option>
            </select>

            <Button
              variant="outline"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData?.summaryCards?.map((metric: SummaryCard) => {
            const Icon =
              iconMap[metric.icon as keyof typeof iconMap] || Activity;
            const isPositive = metric.trend === "up";

            return (
              <Card
                key={metric.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </p>
                      <div className="flex items-center mt-2">
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {metric.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          vs periode sebelumnya
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-teal-600" />
                Pendapatan Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <PaymentChart
                  type="bar"
                  data={generatePaymentRevenueData(
                    analyticsData.payments || [],
                  )}
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          {/* Weekly Payment Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
                Tren Pembayaran Mingguan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <PaymentChart
                  type="line"
                  data={generateWeeklyTrendData(analyticsData.payments || [])}
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-teal-600" /> Kehadiran
                Mingguan
              </CardTitle>
            </CardHeader>
            {/* CORRECTED */}
            <CardContent>
              {analyticsData && (
                <AttendanceChart
                  type="bar"
                  data={generateWeeklyAttendanceData(
                    analyticsData.attendance || [],
                  )}
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          {/* Payment Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-teal-600" />
                Status Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <PaymentChart
                  type="doughnut"
                  data={generatePaymentStatusData(analyticsData.payments || [])}
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hafalan Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
              Progress Hafalan per Surah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.hafalanProgress?.map((surah: HafalanProgress) => (
                <div
                  key={surah.surah}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {surah.surah}
                      </span>
                      <span className="text-sm text-gray-500">
                        {surah.completed}/{surah.total} (
                        {surah.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${surah.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Metrics */}
        {analyticsData?.detailedMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hafalan Target */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      {analyticsData.detailedMetrics.hafalanTarget.title}
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {analyticsData.detailedMetrics.hafalanTarget.value}
                    </p>
                    <p className="text-sm text-blue-700">
                      Progress:{" "}
                      {analyticsData.detailedMetrics.hafalanTarget.progress}/
                      {analyticsData.detailedMetrics.hafalanTarget.value} (
                      {analyticsData.detailedMetrics.hafalanTarget.percentage.toFixed(
                        0,
                      )}
                      %)
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Santri Berprestasi */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      {analyticsData.detailedMetrics.santriBerprestasi.title}
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {analyticsData.detailedMetrics.santriBerprestasi.value}
                    </p>
                    <p className="text-sm text-green-700">
                      {
                        analyticsData.detailedMetrics.santriBerprestasi
                          .description
                      }
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Efisiensi Pembelajaran */}
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      {
                        analyticsData.detailedMetrics.efisiensiPembelajaran
                          .title
                      }
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {
                        analyticsData.detailedMetrics.efisiensiPembelajaran
                          .value
                      }
                    </p>
                    <p className="text-sm text-purple-700">
                      {
                        analyticsData.detailedMetrics.efisiensiPembelajaran
                          .description
                      }
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
