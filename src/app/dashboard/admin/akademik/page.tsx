"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  BookText,
  GraduationCap,
  Heart,
  Users,
  Calendar,
  ChevronRight,
  BarChart3,
  Award,
  FileText,
  Layers,
  PenTool,
} from "lucide-react";
import Link from "next/link";

export default function AkademikPage() {
  const [stats, setStats] = useState({
    halaqah: 0,
    santri: 0,
    musyrif: 0,
    prestasi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("?? Fetching academic stats...");
        const response = await fetch("/api/akademik/stats");

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const { overview } = result.data;
            setStats({
              halaqah: overview.totalHalaqah || 0,
              santri: overview.totalSantri || 0,
              musyrif: overview.totalMusyrif || 0,
              prestasi: overview.totalPrestasi || 0,
            });
            console.log("? Academic stats loaded successfully:", overview);
          } else {
            throw new Error(result.error || "Failed to load stats");
          }
        } else {
          throw new Error("Failed to fetch academic stats");
        }
      } catch (error) {
        console.error("? Error fetching academic stats:", error);
        // Set default values on error
        setStats({
          halaqah: 2,
          santri: 4,
          musyrif: 2,
          prestasi: 5,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Akademik
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola semua aspek akademik TPQ Baitus Shuffah
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Halaqah
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.halaqah}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Santri
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.santri}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Musyrif
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.musyrif}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Prestasi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.prestasi}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Halaqah Terpadu */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <span>Halaqah Terpadu</span>
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {loading ? "..." : stats.halaqah} Halaqah
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Kelola semua halaqah (Al-Qur'an, Tahsin, Akhlaq) dalam satu
                  tempat dengan sistem penilaian terintegrasi.
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {loading ? "..." : stats.santri} Santri
                  </div>
                  <div className="flex items-center text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {loading ? "..." : stats.musyrif} Musyrif
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />3 Domain
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fleksibel
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/dashboard/admin/halaqah-terpadu">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Kelola Halaqah Terpadu
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights & Analytics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <span>AI Insights & Analytics</span>
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Smart Analytics
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Dashboard AI dengan trend analysis, predictive insights, dan
                  comprehensive analytics untuk monitoring TPQ.
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    {loading ? "..." : stats.prestasi} Prestasi
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trend Analysis
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    Smart Reports
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    AI Predictions
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/dashboard/admin/insights">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Lihat AI Insights
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Academic Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Evaluasi & Penilaian */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Evaluasi & Penilaian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Kelola evaluasi dan penilaian santri untuk semua program
                  pembelajaran.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/admin/evaluasi/hafalan">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Evaluasi Hafalan
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/evaluasi/tahsin">
                    <Button variant="outline" className="w-full justify-start">
                      <BookText className="h-4 w-4 mr-2" />
                      Evaluasi Tahsin
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/evaluasi/akhlak">
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Evaluasi Akhlak
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/evaluasi/laporan">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Laporan Evaluasi
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catatan Santri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-teal-600" />
                Catatan Santri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Kelola catatan perkembangan, prestasi, dan perilaku santri.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/admin/catatan/perkembangan">
                    <Button variant="outline" className="w-full justify-start">
                      <Layers className="h-4 w-4 mr-2" />
                      Perkembangan
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/catatan/prestasi">
                    <Button variant="outline" className="w-full justify-start">
                      <Award className="h-4 w-4 mr-2" />
                      Prestasi
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/catatan/perilaku">
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Perilaku
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/catatan/laporan">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Laporan Catatan
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
