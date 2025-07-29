"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Users,
  Trophy,
  Star,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

// Mock data for achievements overview
const MOCK_ACHIEVEMENT_STATS = {
  totalBadges: 25,
  activeBadges: 20,
  totalAchievements: 156,
  thisMonthAchievements: 23,
  topPerformers: [
    { name: "Ahmad Fauzi", achievements: 12, points: 450 },
    { name: "Siti Aisyah", achievements: 10, points: 380 },
    { name: "Muhammad Rizki", achievements: 9, points: 340 },
  ],
  recentAchievements: [
    {
      id: "1",
      santriName: "Ahmad Fauzi",
      badgeName: "Hafidz 100 Ayat",
      achievedAt: "2024-01-20T10:00:00Z",
      points: 50,
    },
    {
      id: "2",
      santriName: "Siti Aisyah",
      badgeName: "Master Al-Fatihah",
      achievedAt: "2024-01-19T15:30:00Z",
      points: 30,
    },
    {
      id: "3",
      santriName: "Muhammad Rizki",
      badgeName: "Surah Pertama",
      achievedAt: "2024-01-18T09:15:00Z",
      points: 20,
    },
  ],
};

export default function AchievementsPage() {
  const [stats, setStats] = useState(MOCK_ACHIEVEMENT_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch from an API
      // For now, we'll use our mock data
      setStats(MOCK_ACHIEVEMENT_STATS);
      setLoading(false);
    } catch (error) {
      console.error("Error loading achievement stats:", error);
      toast.error("Gagal memuat data pencapaian");
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Pencapaian
            </h1>
            <p className="text-gray-600">
              Kelola sistem pencapaian dan badge untuk santri
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/admin/achievements/badges">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Kelola Badge
              </Button>
            </Link>
            <Link href="/dashboard/admin/achievements/santri">
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                Lihat Pencapaian
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Badge
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalBadges}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {stats.activeBadges} aktif
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Pencapaian
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalAchievements}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">
                  +{stats.thisMonthAchievements} bulan ini
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Santri Aktif
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.topPerformers.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">Top performers</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Rata-rata Poin
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      stats.topPerformers.reduce(
                        (acc, p) => acc + p.points,
                        0,
                      ) / stats.topPerformers.length,
                    )}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">Per santri</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topPerformers.map((performer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {performer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {performer.achievements} pencapaian
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {performer.points} poin
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/admin/achievements/santri">
                  <Button variant="outline" className="w-full">
                    Lihat Semua Pencapaian
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Pencapaian Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Award className="h-4 w-4 text-yellow-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {achievement.santriName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {achievement.badgeName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(achievement.achievedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +{achievement.points} poin
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/admin/achievements/santri">
                  <Button variant="outline" className="w-full">
                    Lihat Riwayat Lengkap
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/admin/achievements/badges">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Award className="h-6 w-6 mb-2" />
                  Kelola Badge
                </Button>
              </Link>
              <Link href="/dashboard/admin/achievements/santri">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Pencapaian Santri
                </Button>
              </Link>
              <Link href="/dashboard/admin/achievements/santri/add">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Plus className="h-6 w-6 mb-2" />
                  Tambah Pencapaian
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
