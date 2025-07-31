"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  User,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  Download,
  Bell,
  Target,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const WaliSantriPage = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState("");
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load children data from API
  useEffect(() => {
    loadChildrenData();
  }, []);

  const loadChildrenData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading children data from API...");

      const response = await fetch("/api/dashboard/wali/santri");
      console.log("📡 Children API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Children data received:", data);

        if (data.success && data.data.children) {
          setChildren(data.data.children);
          // Set first child as selected if none selected
          if (data.data.children.length > 0 && !selectedChild) {
            setSelectedChild(data.data.children[0].id);
          }
          console.log("✅ Children data set:", data.data.children);
        } else {
          console.error("❌ API returned error:", data.message);
          setError(data.message || "Failed to load children data");
        }
      } else {
        const errorText = await response.text();
        console.error("❌ Children API Error:", response.status, errorText);
        setError(`Failed to load children data: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error loading children data:", error);
      setError("Failed to load children data");
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback (keeping structure for compatibility)
  const mockChildren = [
    {
      id: "1",
      name: "Ahmad Fauzi",
      nis: "24001",
      age: 12,
      class: "6 SD",
      halaqah: "Al-Fatihah",
      musyrif: "Ustadz Abdullah",
      joinDate: "2024-01-15",
      photo: null,
      progress: {
        currentSurah: "Al-Baqarah",
        currentAyah: 45,
        totalAyah: 286,
        percentage: 75,
        weeklyTarget: 10,
        weeklyAchieved: 8,
        lastEvaluation: {
          date: "2024-01-15",
          score: 85,
          tajwid: 80,
          kelancaran: 90,
          notes: "Baik, perlu perbaikan mad",
        },
      },
      attendance: {
        thisMonth: 22,
        totalDays: 24,
        percentage: 92,
        lastAbsent: "2024-01-10",
        reason: "Sakit",
      },
      achievements: [
        { id: "1", title: "Hafal Juz 1", date: "2023-12-01", type: "hafalan" },
        {
          id: "2",
          title: "Santri Terbaik Bulan Ini",
          date: "2024-01-01",
          type: "prestasi",
        },
        {
          id: "3",
          title: "Kehadiran 100%",
          date: "2023-11-30",
          type: "kehadiran",
        },
      ],
      schedule: [
        { day: "Senin", time: "08:00-09:30", activity: "Hafalan Al-Baqarah" },
        { day: "Rabu", time: "08:00-09:30", activity: "Hafalan Al-Baqarah" },
        { day: "Jumat", time: "08:00-09:30", activity: "Hafalan Al-Baqarah" },
        { day: "Sabtu", time: "10:00-11:00", activity: "Muraja'ah" },
      ],
    },
    {
      id: "2",
      name: "Siti Aisyah",
      nis: "24002",
      age: 10,
      class: "4 SD",
      halaqah: "Al-Fatihah",
      musyrif: "Ustadzah Fatimah",
      joinDate: "2024-02-01",
      photo: null,
      progress: {
        currentSurah: "Ali Imran",
        currentAyah: 120,
        totalAyah: 200,
        percentage: 60,
        weeklyTarget: 8,
        weeklyAchieved: 9,
        lastEvaluation: {
          date: "2024-01-14",
          score: 95,
          tajwid: 95,
          kelancaran: 95,
          notes: "Excellent, sangat baik",
        },
      },
      attendance: {
        thisMonth: 24,
        totalDays: 24,
        percentage: 100,
        lastAbsent: null,
        reason: null,
      },
      achievements: [
        {
          id: "4",
          title: "Hafal Al-Fatihah",
          date: "2024-01-15",
          type: "hafalan",
        },
        {
          id: "5",
          title: "Kehadiran Perfect",
          date: "2024-01-31",
          type: "kehadiran",
        },
      ],
      schedule: [
        { day: "Selasa", time: "14:00-15:30", activity: "Hafalan Ali Imran" },
        { day: "Kamis", time: "14:00-15:30", activity: "Hafalan Ali Imran" },
        { day: "Sabtu", time: "08:00-09:00", activity: "Muraja'ah" },
      ],
    },
  ];

  const selectedChildData = children.find((child) => child.id === selectedChild) || children[0];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600";
    if (percentage >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "hafalan":
        return BookOpen;
      case "prestasi":
        return Award;
      case "kehadiran":
        return Calendar;
      default:
        return CheckCircle;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data santri...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadChildrenData} className="bg-teal-600 hover:bg-teal-700">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Data Santri</h2>
            <p className="text-gray-600">Belum ada santri yang terdaftar untuk akun Anda.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pantau Perkembangan Anak
            </h1>
            <p className="text-gray-600">
              Lihat progress dan aktivitas anak Anda di TPQ
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Notifikasi
            </Button>
          </div>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">
                  Pilih Anak:
                </span>
                <div className="flex space-x-2">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChild(child.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedChild === child.id
                          ? "bg-teal-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Child Profile */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
                {selectedChildData.photo ? (
                  <img
                    src={selectedChildData.photo}
                    alt={selectedChildData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-teal-600">
                    {selectedChildData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedChildData.name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">NIS:</span>{" "}
                    {selectedChildData.nis}
                  </div>
                  <div>
                    <span className="font-medium">Bergabung:</span>{" "}
                    {selectedChildData.joinDate ? new Date(selectedChildData.joinDate).toLocaleDateString('id-ID') : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedChildData.status}
                  </div>
                  <div>
                    <span className="font-medium">Halaqah:</span>{" "}
                    {selectedChildData.halaqah?.name || 'Belum ditentukan'}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Musyrif:</span>{" "}
                  {selectedChildData.halaqah?.musyrif?.name || 'Belum ditentukan'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Progress Hafalan
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedChildData.hafalan?.progress || 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedChildData.hafalan?.currentLevel || 'Juz 1'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kehadiran</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedChildData.attendance?.rate || 0}%
                  </p>
                  <p className="text-xs text-gray-500">30 hari terakhir</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Nilai Terakhir
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedChildData.hafalan?.averageGrade || 0}
                  </p>
                  <p className="text-xs text-gray-500">Rata-rata Nilai</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Target Mingguan
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedChildData.hafalan?.approved || 0}
                  </p>
                  <p className="text-xs text-gray-500">Hafalan Disetujui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Progress Hafalan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedChildData.progress.currentSurah}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedChildData.progress.currentAyah}/
                      {selectedChildData.progress.totalAyah}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-teal-600 h-3 rounded-full"
                      style={{
                        width: `${selectedChildData.progress.percentage}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedChildData.progress.percentage}% selesai
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Evaluasi Terakhir
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tajwid:</span>
                      <span className="ml-2 font-semibold">
                        {selectedChildData.progress.lastEvaluation.tajwid}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kelancaran:</span>
                      <span className="ml-2 font-semibold">
                        {selectedChildData.progress.lastEvaluation.kelancaran}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {selectedChildData.progress.lastEvaluation.notes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Pembelajaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedChildData.schedule.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.day}</p>
                      <p className="text-sm text-gray-600">{item.activity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements and Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Prestasi & Pencapaian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedChildData.achievements.map((achievement) => {
                  const Icon = getAchievementIcon(achievement.type);
                  return (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Icon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {achievement.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {achievement.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Kehadiran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedChildData.attendance.thisMonth}
                    </p>
                    <p className="text-sm text-gray-600">Hari Hadir</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {selectedChildData.attendance.totalDays -
                        selectedChildData.attendance.thisMonth}
                    </p>
                    <p className="text-sm text-gray-600">Hari Tidak Hadir</p>
                  </div>
                </div>

                {selectedChildData.attendance.lastAbsent && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Terakhir tidak hadir:{" "}
                          {selectedChildData.attendance.lastAbsent}
                        </p>
                        <p className="text-sm text-yellow-700">
                          Alasan: {selectedChildData.attendance.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriPage;
