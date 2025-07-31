"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Users,
  Award,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Filter,
  Eye,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ReportData {
  reports: Array<{
    id: string;
    title: string;
    period: string;
    type: string;
    generatedDate: string;
    status: string;
    downloadUrl?: string;
    summary: {
      attendance: {
        present: number;
        absent: number;
        permission: number;
        percentage: number;
      };
      hafalan: {
        completed: number;
        inProgress: number;
        totalPages: number;
        percentage: number;
      };
      behavior: {
        excellent: number;
        good: number;
        needsImprovement: number;
        averageScore: number;
      };
      achievements: {
        total: number;
        thisMonth: number;
        categories: Array<{
          name: string;
          count: number;
        }>;
      };
    };
    musyrifNotes: string;
    recommendations: string[];
  }>;
  children: Array<{
    id: string;
    name: string;
    nis: string;
    class: string;
    musyrif: string;
  }>;
  availablePeriods: Array<{
    month: number;
    year: number;
    label: string;
  }>;
}

const WaliReportsPage = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedReport, setSelectedReport] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportsData();
  }, [selectedChild, selectedPeriod]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedChild !== "all") params.append("childId", selectedChild);
      params.append("period", selectedPeriod);
      params.append("reportType", selectedReport);

      const response = await fetch(`/api/dashboard/wali/reports?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId: string, format: 'pdf' | 'excel' = 'pdf') => {
    try {
      const response = await fetch('/api/dashboard/wali/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'download',
          reportId,
          format
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Gagal mengunduh laporan');
    }
  };

  const handleEmailReport = async (reportId: string) => {
    try {
      const response = await fetch('/api/dashboard/wali/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'email',
          reportId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      if (result.success) {
        alert('Laporan berhasil dikirim ke email Anda!');
      }
    } catch (err) {
      alert('Gagal mengirim laporan via email');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchReportsData} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock children data
  const children = [
    {
      id: "1",
      name: "Muhammad Fauzi",
      nis: "2024001",
      class: "Juz 1",
    },
  ];

  // Mock report data
  const monthlyReport = {
    period: "Januari 2024",
    child: "Muhammad Fauzi",
    summary: {
      attendance: {
        present: 22,
        absent: 3,
        percentage: 88,
        trend: "up",
      },
      hafalan: {
        completed: 5,
        target: 6,
        percentage: 83,
        currentLevel: "Al-Fatihah",
        trend: "up",
      },
      behavior: {
        score: 85,
        maxScore: 100,
        category: "Baik",
        trend: "stable",
      },
      achievements: {
        count: 3,
        points: 225,
        rank: 2,
        trend: "up",
      },
    },
    details: {
      hafalan: [
        {
          surah: "Al-Fatihah",
          status: "Completed",
          grade: "A",
          date: "2024-01-15",
          musyrif: "Ustadz Ahmad Fauzi",
        },
        {
          surah: "Al-Baqarah 1-10",
          status: "In Progress",
          grade: "B+",
          date: "2024-01-25",
          musyrif: "Ustadz Ahmad Fauzi",
        },
      ],
      behavior: [
        {
          aspect: "Kedisiplinan",
          score: 90,
          notes: "Selalu datang tepat waktu",
        },
        {
          aspect: "Sopan Santun",
          score: 85,
          notes: "Baik dalam berinteraksi dengan teman",
        },
        {
          aspect: "Kebersihan",
          score: 80,
          notes: "Perlu ditingkatkan dalam menjaga kebersihan",
        },
      ],
      attendance: [
        { date: "2024-01-01", status: "Present" },
        { date: "2024-01-02", status: "Present" },
        { date: "2024-01-03", status: "Absent" },
        // ... more attendance data
      ],
    },
    recommendations: [
      "Tingkatkan konsistensi dalam muraja'ah harian",
      "Fokus pada perbaikan tajwid untuk surat Al-Baqarah",
      "Perhatikan kebersihan dan kerapihan seragam",
      "Lanjutkan semangat belajar yang sudah baik",
    ],
    musyrifNotes: "Muhammad menunjukkan progress yang baik dalam hafalan. Perlu sedikit perbaikan dalam hal kedisiplinan waktu dan kebersihan. Secara keseluruhan, perkembangannya sangat memuaskan.",
  };

  const reportTypes = [
    { id: "overview", name: "Ringkasan", icon: BarChart3 },
    { id: "hafalan", name: "Progress Hafalan", icon: BookOpen },
    { id: "attendance", name: "Kehadiran", icon: Calendar },
    { id: "behavior", name: "Akhlak & Perilaku", icon: Users },
    { id: "achievements", name: "Prestasi", icon: Award },
  ];

  const periods = [
    { id: "weekly", name: "Mingguan" },
    { id: "monthly", name: "Bulanan" },
    { id: "quarterly", name: "Triwulan" },
    { id: "yearly", name: "Tahunan" },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Bulanan</h1>
            <p className="text-gray-600">Laporan perkembangan dan progress anak Anda</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Kirim Email
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Download className="h-4 w-4 mr-2" />
              Unduh PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Child Selector */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Anak
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({child.nis})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Period Selector */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode Laporan
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Report Type Selector */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Laporan
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Report Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Laporan {reportTypes.find(t => t.id === selectedReport)?.name}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  {monthlyReport.child} - {monthlyReport.period}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Dibuat pada</p>
                <p className="font-medium">{new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kehadiran</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyReport.summary.attendance.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {monthlyReport.summary.attendance.present} dari {monthlyReport.summary.attendance.present + monthlyReport.summary.attendance.absent} hari
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(monthlyReport.summary.attendance.trend)}
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress Hafalan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyReport.summary.hafalan.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {monthlyReport.summary.hafalan.currentLevel}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(monthlyReport.summary.hafalan.trend)}
                  <BookOpen className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nilai Akhlak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyReport.summary.behavior.score}
                  </p>
                  <p className="text-xs text-gray-500">
                    {monthlyReport.summary.behavior.category}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(monthlyReport.summary.behavior.trend)}
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prestasi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyReport.summary.achievements.count}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ranking #{monthlyReport.summary.achievements.rank}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(monthlyReport.summary.achievements.trend)}
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Report Content */}
        {selectedReport === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Hafalan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Progress Hafalan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyReport.details.hafalan.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.surah}</p>
                        <p className="text-sm text-gray-600">{item.musyrif}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">Grade: {item.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Evaluasi Akhlak */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Evaluasi Akhlak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyReport.details.behavior.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{item.aspect}</span>
                        <span className="text-sm font-bold text-teal-600">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Rekomendasi & Catatan Musyrif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Rekomendasi untuk Orang Tua:</h4>
                <ul className="space-y-2">
                  {monthlyReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Catatan Musyrif:</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg italic">
                  "{monthlyReport.musyrifNotes}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliReportsPage;
