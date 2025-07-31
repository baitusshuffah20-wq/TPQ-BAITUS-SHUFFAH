"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Heart,
  Target,
  Eye,
  MessageSquare,
  Bell,
  BarChart3,
  Activity,
  Receipt,
  CalendarCheck,
  Trophy,
  Send,
  DollarSign,
  PlusCircle,
  BookOpen,
  TrendingUp,
  Settings,
  Users,
} from "lucide-react";

interface DashboardStats {
  totalChildren: number;
  pendingPayments: number;
  completedHafalan: number;
  attendanceRate: number;
  unreadMessages: number;
  unreadNotifications: number;
  totalDonations: number;
  monthlyProgress: number;
}

interface Child {
  id: string;
  name: string;
  nis: string;
  halaqah: string;
  musyrif: string;
  progress: number;
  lastHafalan: string;
  attendanceRate: number;
  photo?: string;
  currentLevel: string;
  achievements: string[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  route: string;
  enabled: boolean;
}

const WaliDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [showBalance, setShowBalance] = useState(false);

  // Check authentication and role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user.role !== "WALI") {
      router.push("/dashboard");
      return;
    }

    // Load dashboard data when authenticated
    if (status === "authenticated" && session?.user.role === "WALI") {
      loadDashboardData();
    }
  }, [session, status, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading real dashboard data from API...");

      const response = await fetch("/api/dashboard/wali");
      console.log("📡 Dashboard API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Dashboard data received:", data);

        if (data.success) {
          setDashboardData(data.data.stats);
          console.log("✅ Dashboard stats set:", data.data.stats);
        } else {
          console.error("❌ API returned error:", data.message);
          // Fallback to mock data
          setDashboardData({
            totalChildren: 0,
            pendingPayments: 0,
            completedHafalan: 0,
            attendanceRate: 0,
            unreadMessages: 0,
            unreadNotifications: 0,
            totalDonations: 0,
            monthlyProgress: 0,
          });
        }
      } else {
        const errorText = await response.text();
        console.error("❌ Dashboard API Error:", response.status, errorText);
        // Fallback to mock data
        setDashboardData({
          totalChildren: 0,
          pendingPayments: 0,
          completedHafalan: 0,
          attendanceRate: 0,
          unreadMessages: 0,
          unreadNotifications: 0,
          totalDonations: 0,
          monthlyProgress: 0,
        });
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      // Fallback to mock data
      setDashboardData({
        totalChildren: 0,
        pendingPayments: 0,
        completedHafalan: 0,
        attendanceRate: 0,
        unreadMessages: 0,
        unreadNotifications: 0,
        totalDonations: 0,
        monthlyProgress: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Memuat Dashboard Wali
            </h3>
            <p className="text-gray-500">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user is not wali, don't render anything (redirect will happen)
  if (status === "authenticated" && session?.user.role !== "WALI") {
    return null;
  }

  // Mock data for Wali - sesuai permission wali
  const children: Child[] = [
    {
      id: "1",
      name: "Ahmad Fauzi",
      nis: "24001",
      halaqah: "Halaqah Al-Fatihah",
      musyrif: "Ustadz Abdullah",
      progress: 75,
      lastHafalan: "Al-Baqarah 1-10",
      attendanceRate: 95,
      photo: null,
      currentLevel: "Juz 1",
      achievements: ["Hafal Juz 30", "Juara 1 Tilawah"],
    },
    {
      id: "2",
      name: "Fatimah Zahra",
      nis: "24002",
      halaqah: "Halaqah An-Nur",
      musyrif: "Ustadzah Aisyah",
      progress: 60,
      lastHafalan: "Al-Fatihah",
      attendanceRate: 88,
      photo: null,
      currentLevel: "Juz 30",
      achievements: ["Hafal Al-Fatihah", "Rajin Mengaji"],
    },
  ];

  // Quick Actions sesuai permission wali
  const quickActions: QuickAction[] = [
    {
      id: "children-progress",
      title: "Perkembangan Anak",
      description: "Pantau progress hafalan dan nilai anak",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      route: "/dashboard/wali/santri",
      enabled: true,
    },
    {
      id: "spp-payment",
      title: "Tagihan SPP",
      description: "Cek dan bayar tagihan SPP bulanan",
      icon: Receipt,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      route: "/dashboard/wali/spp",
      enabled: true,
    },
    {
      id: "donations",
      title: "Donasi",
      description: "Lihat kategori dan campaign donasi",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      route: "/dashboard/wali/donations",
      enabled: true,
    },
    {
      id: "attendance",
      title: "Kehadiran",
      description: "Lihat kehadiran anak di TPQ",
      icon: CalendarCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      route: "/dashboard/wali/attendance",
      enabled: true,
    },
    {
      id: "messages",
      title: "Pesan Ustadz",
      description: "Komunikasi dengan ustadz dan admin",
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      route: "/dashboard/wali/messages",
      enabled: true,
    },
    {
      id: "notifications",
      title: "Notifikasi",
      description: "Lihat notifikasi terbaru",
      icon: Bell,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      route: "/dashboard/wali/notifications",
      enabled: true,
    },
    {
      id: "profile",
      title: "Edit Profil",
      description: "Kelola informasi profil",
      icon: User,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      route: "/dashboard/wali/profile",
      enabled: true,
    },
    {
      id: "payments",
      title: "Riwayat Pembayaran",
      description: "Lihat riwayat pembayaran SPP dan donasi",
      icon: CreditCard,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      route: "/dashboard/wali/payments",
      enabled: true,
    },
  ];

  const recentHafalan = [
    {
      id: 1,
      surah: "Al-Baqarah",
      ayah: "1-10",
      status: "APPROVED" as const,
      grade: 85,
      date: "2024-02-10",
      musyrif: "Ustadz Abdullah",
    },
    {
      id: 2,
      surah: "Al-Baqarah",
      ayah: "11-20",
      status: "PENDING" as const,
      grade: null,
      date: "2024-02-11",
      musyrif: "Ustadz Abdullah",
    },
    {
      id: 3,
      surah: "Al-Fatihah",
      ayah: "1-7",
      status: "APPROVED" as const,
      grade: 90,
      date: "2024-02-08",
      musyrif: "Ustadz Abdullah",
    },
  ];

  const payments = [
    {
      id: "1",
      type: "SPP" as const,
      amount: 150000,
      dueDate: "2024-02-15",
      status: "PENDING" as const,
      description: "SPP Februari 2024",
      month: "Februari 2024",
    },
    {
      id: "2",
      type: "SPP" as const,
      amount: 150000,
      dueDate: "2024-01-15",
      status: "PAID" as const,
      description: "SPP Januari 2024",
      month: "Januari 2024",
    },
    {
      id: "3",
      type: "DONATION" as const,
      amount: 500000,
      dueDate: "2024-02-20",
      status: "PENDING" as const,
      description: "Donasi Pembangunan Masjid",
    },
  ];

  const donationCategories = [
    {
      id: "1",
      name: "Pembangunan Masjid",
      description: "Donasi untuk pembangunan masjid TPQ",
      target: 50000000,
      collected: 35000000,
      progress: 70,
    },
    {
      id: "2",
      name: "Beasiswa Santri",
      description: "Bantuan biaya pendidikan untuk santri kurang mampu",
      target: 20000000,
      collected: 12000000,
      progress: 60,
    },
  ];

  const recentAttendance = [
    { date: "2024-02-12", status: "PRESENT" },
    { date: "2024-02-11", status: "PRESENT" },
    { date: "2024-02-10", status: "LATE" },
    { date: "2024-02-09", status: "PRESENT" },
    { date: "2024-02-08", status: "PRESENT" },
  ];

  // Parent Collaboration Data
  const behaviorSummary = {
    totalRecords: 18,
    positiveCount: 15,
    negativeCount: 3,
    behaviorScore: 85,
    characterGrade: "B+",
    strengths: [
      "Sangat jujur dalam berkata dan bertindak",
      "Rajin melaksanakan shalat berjamaah",
      "Aktif membantu teman yang kesulitan",
    ],
    areasForImprovement: [
      "Perlu meningkatkan kedisiplinan waktu",
      "Lebih aktif dalam bertanya saat pembelajaran",
    ],
  };

  const activeGoals = [
    {
      id: "goal_1",
      title: "Mengembangkan Kepemimpinan",
      description: "Program pengembangan jiwa kepemimpinan dan tanggung jawab",
      category: "LEADERSHIP",
      progress: 65,
      targetDate: "2024-04-30",
      milestones: 3,
      completedMilestones: 2,
    },
  ];

  const recentActivities = [
    {
      id: "activity_1",
      type: "BEHAVIOR_POSITIVE",
      title: "Perilaku Positif",
      description: "Ahmad membantu teman yang kesulitan membaca Al-Quran",
      date: "2024-02-12",
      time: "09:15:00",
      points: 4,
      musyrifName: "Ustadz Abdullah",
    },
    {
      id: "activity_2",
      type: "GOAL_PROGRESS",
      title: "Progress Goal",
      description: 'Milestone "Memimpin doa pembuka" berhasil diselesaikan',
      date: "2024-02-11",
      time: "08:00:00",
      points: 5,
      musyrifName: "Ustadz Abdullah",
    },
    {
      id: "activity_3",
      type: "ACHIEVEMENT",
      title: "Pencapaian",
      description: 'Mendapat penghargaan "Santri Teladan Minggu Ini"',
      date: "2024-02-10",
      time: "10:00:00",
      points: 10,
      musyrifName: "Ustadz Abdullah",
    },
  ];

  const messages = [
    {
      id: "msg_1",
      from: "Ustadz Abdullah",
      subject: "Progress Ahmad Minggu Ini",
      message:
        "Assalamu'alaikum. Ahmad menunjukkan perkembangan yang sangat baik minggu ini. Dia aktif membantu teman dan rajin dalam hafalan.",
      date: "2024-02-12",
      time: "15:30:00",
      isRead: false,
      type: "PROGRESS_UPDATE",
    },
    {
      id: "msg_2",
      from: "Admin TPQ",
      subject: "Undangan Pertemuan Wali",
      message:
        "Kami mengundang Bapak/Ibu untuk menghadiri pertemuan wali santri pada Sabtu, 17 Februari 2024 pukul 09:00 WIB.",
      date: "2024-02-11",
      time: "10:00:00",
      isRead: true,
      type: "ANNOUNCEMENT",
    },
  ];

  const unreadMessages = messages.filter((m) => !m.isRead).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "PAID":
      case "PRESENT":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "NEEDS_IMPROVEMENT":
      case "OVERDUE":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "LATE":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "PAID":
      case "PRESENT":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "NEEDS_IMPROVEMENT":
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "LATE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const child = children[0]; // For demo, we'll show data for one child

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Wali Santri
            </h1>
            <p className="text-gray-600">
              Selamat datang kembali,{" "}
              <span className="font-medium text-teal-600">
                {session?.user.name}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/wali/notifications")}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifikasi
              </Button>
              {dashboardData?.unreadNotifications && dashboardData.unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {dashboardData.unreadNotifications}
                </span>
              )}
            </div>
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/wali/messages")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Pesan
              </Button>
              {dashboardData?.unreadMessages && dashboardData.unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {dashboardData.unreadMessages}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Anak Terdaftar</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalChildren || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tagihan Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.pendingPayments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hafalan Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.completedHafalan || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CalendarCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kehadiran</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.attendanceRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-teal-600" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.filter(action => action.enabled).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.bgColor} hover:${action.bgColor} border-gray-200`}
                  onClick={() => router.push(action.route)}
                >
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informasi Anak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-teal-600" />
                  Informasi Anak
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/wali/santri")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat Detail
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {child.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {child.halaqah} • {child.musyrif}
                      </p>
                      <p className="text-xs text-gray-400">
                        Progress: {child.progress}% • Kehadiran: {child.attendanceRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-teal-600">
                        {child.currentLevel}
                      </div>
                      <div className="text-xs text-gray-500">
                        {child.lastHafalan}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tagihan & Pembayaran */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-red-600" />
                  Tagihan & Pembayaran
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/wali/payments")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat Semua
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.slice(0, 3).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {payment.description}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Jatuh tempo: {new Date(payment.dueDate).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {payment.status === "PENDING" ? "Belum Bayar" :
                         payment.status === "PAID" ? "Lunas" : payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {payments.filter(p => p.status === "PENDING").length > 0 && (
                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={() => router.push("/dashboard/wali/spp")}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bayar Sekarang
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kategori Donasi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-600" />
                Kategori Donasi
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/wali/donations")}
              >
                <Eye className="h-4 w-4 mr-1" />
                Lihat Semua
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donationCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {category.name}
                    </h4>
                    <span className="text-sm font-medium text-gray-600">
                      {category.progress}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {category.description}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${category.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Terkumpul: {formatCurrency(category.collected)}</span>
                    <span>Target: {formatCurrency(category.target)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/dashboard/wali/donations")}
              >
                <Heart className="h-4 w-4 mr-2" />
                Berdonasi Sekarang
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Pesan Terbaru
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/wali/messages")}
              >
                <Eye className="h-4 w-4 mr-1" />
                Lihat Semua
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border rounded-lg ${
                    message.isRead
                      ? "border-gray-200 bg-white"
                      : "border-teal-200 bg-teal-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {message.subject}
                      </h4>
                      {!message.isRead && (
                        <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(message.date).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    Dari: {message.from}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                </div>
              ))}
            </div>
            {messages.filter(m => !m.isRead).length > 0 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/wali/messages")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Baca Semua Pesan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliDashboard;
