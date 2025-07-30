"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Target,
  Loader2,
  Wallet,
  DollarSign,
} from "lucide-react";

interface DashboardStats {
  totalSantri: number;
  activeHalaqah: number;
  completedHafalan: number;
  attendanceRate: number;
  monthlyEarnings: number;
  walletBalance: number;
}

interface RecentActivity {
  id: string;
  type: "HAFALAN" | "ATTENDANCE" | "EARNING";
  description: string;
  date: string;
  status: string;
}

const MusyrifDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user.role !== "MUSYRIF") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user.role === "MUSYRIF") {
      fetchDashboardData();
    }
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const [statsResponse, walletResponse] = await Promise.all([
        fetch("/api/musyrif/dashboard/stats"),
        fetch("/api/musyrif/wallet"),
      ]);

      if (!statsResponse.ok || !walletResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsResponse.json();
      const walletData = await walletResponse.json();

      if (statsData.success && walletData.success) {
        setStats({
          totalSantri: statsData.data.totalSantri || 0,
          activeHalaqah: statsData.data.activeHalaqah || 0,
          completedHafalan: statsData.data.completedHafalan || 0,
          attendanceRate: statsData.data.attendanceRate || 0,
          monthlyEarnings: walletData.data.monthlyEarnings || 0,
          walletBalance: walletData.data.balance || 0,
        });

        setRecentActivities(statsData.data.recentActivities || []);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user is not musyrif, don't render anything (redirect will happen)
  if (status === "authenticated" && session?.user.role !== "MUSYRIF") {
    return null;
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Create stats cards from real data
  const statsCards = stats ? [
    {
      title: "Santri Binaan",
      value: stats.totalSantri.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Halaqah Aktif",
      value: stats.activeHalaqah.toString(),
      icon: BookOpen,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Hafalan Selesai",
      value: stats.completedHafalan.toString(),
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tingkat Kehadiran",
      value: `${stats.attendanceRate}%`,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Penghasilan Bulan Ini",
      value: `Rp ${stats.monthlyEarnings.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Saldo Wallet",
      value: `Rp ${stats.walletBalance.toLocaleString('id-ID')}`,
      icon: Wallet,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ] : [];



  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "NEEDS_IMPROVEMENT":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "NEEDS_IMPROVEMENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Musyrif
          </h1>
          <p className="text-gray-600">
            Selamat datang kembali, {session?.user.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-teal-600" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.type}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(activity.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada aktivitas terbaru</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 text-center bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                <GraduationCap className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-teal-900">
                  Input Hafalan
                </span>
              </button>

              <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">
                  Absensi
                </span>
              </button>

              <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">
                  Kelola Santri
                </span>
              </button>

              <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">
                  Target Hafalan
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MusyrifDashboard;
