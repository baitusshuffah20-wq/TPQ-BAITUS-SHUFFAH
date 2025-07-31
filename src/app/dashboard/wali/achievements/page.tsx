"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Award,
  Star,
  Trophy,
  Medal,
  Crown,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Heart,
  Users,
  Download,
  Filter,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  earnedDate: string;
  childName: string;
  icon: string;
  color: string;
  certificateUrl?: string;
}

interface AchievementData {
  achievements: Achievement[];
  statistics: {
    total: number;
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
    thisMonth: number;
  };
  children: Array<{
    id: string;
    name: string;
    nis: string;
    totalAchievements: number;
    latestAchievement?: Achievement;
  }>;
  categories: Array<{
    name: string;
    count: number;
    color: string;
  }>;
}

const WaliAchievementsPage = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AchievementData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievementsData();
  }, [selectedChild, selectedCategory]);

  const fetchAchievementsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedChild !== "all") params.append("childId", selectedChild);
      if (selectedCategory !== "all") params.append("category", selectedCategory);

      const response = await fetch(`/api/dashboard/wali/achievements?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch achievements data');
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

  const handleDownloadCertificate = async (achievementId: string) => {
    try {
      const response = await fetch('/api/dashboard/wali/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'download_certificate',
          achievementId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${achievementId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Gagal mengunduh sertifikat');
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
            <Button onClick={fetchAchievementsData} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock children data (keeping for fallback)
  const children = [
    {
      id: "1",
      name: "Muhammad Fauzi",
      nis: "2024001",
      class: "Juz 1",
      photo: "/api/placeholder/60/60",
    },
  ];

  // Mock achievements data
  const achievements = [
    {
      id: "1",
      title: "Hafal Al-Fatihah",
      description: "Berhasil menghafal surat Al-Fatihah dengan sempurna",
      category: "hafalan",
      type: "milestone",
      date: "2024-01-15",
      points: 100,
      badge: "gold",
      musyrif: "Ustadz Ahmad Fauzi",
      icon: BookOpen,
      color: "bg-yellow-500",
    },
    {
      id: "2",
      title: "Kehadiran Sempurna",
      description: "Hadir setiap hari selama 1 bulan penuh",
      category: "attendance",
      type: "consistency",
      date: "2024-01-31",
      points: 50,
      badge: "silver",
      musyrif: "Ustadz Ahmad Fauzi",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      id: "3",
      title: "Akhlak Terpuji",
      description: "Menunjukkan akhlak yang baik dan sopan santun",
      category: "behavior",
      type: "character",
      date: "2024-01-20",
      points: 75,
      badge: "gold",
      musyrif: "Ustadz Ahmad Fauzi",
      icon: Heart,
      color: "bg-green-500",
    },
    {
      id: "4",
      title: "Juara Muraja'ah",
      description: "Juara 1 dalam kompetisi muraja'ah tingkat TPQ",
      category: "competition",
      type: "achievement",
      date: "2024-01-25",
      points: 200,
      badge: "platinum",
      musyrif: "Kepala TPQ",
      icon: Trophy,
      color: "bg-purple-500",
    },
    {
      id: "5",
      title: "Helper Terbaik",
      description: "Membantu teman-teman dalam belajar hafalan",
      category: "social",
      type: "leadership",
      date: "2024-01-28",
      points: 60,
      badge: "silver",
      musyrif: "Ustadz Ahmad Fauzi",
      icon: Users,
      color: "bg-teal-500",
    },
  ];

  const categories = [
    { id: "all", name: "Semua", icon: Award },
    { id: "hafalan", name: "Hafalan", icon: BookOpen },
    { id: "attendance", name: "Kehadiran", icon: Calendar },
    { id: "behavior", name: "Akhlak", icon: Heart },
    { id: "competition", name: "Kompetisi", icon: Trophy },
    { id: "social", name: "Sosial", icon: Users },
  ];

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'platinum':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'gold':
        return <Medal className="h-5 w-5 text-yellow-600" />;
      case 'silver':
        return <Award className="h-5 w-5 text-gray-600" />;
      default:
        return <Star className="h-5 w-5 text-orange-600" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const totalAchievements = achievements.length;
  const latestAchievement = achievements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prestasi Anak</h1>
            <p className="text-gray-600">Lihat pencapaian dan prestasi anak Anda di TPQ</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Unduh Sertifikat
            </Button>
          </div>
        </div>

        {/* Child Selector */}
        {data?.children && data.children.length > 1 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Pilih Anak:</span>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedChild === "all" ? "default" : "outline"}
                    onClick={() => setSelectedChild("all")}
                  >
                    Semua Anak
                  </Button>
                  {data.children.map((child) => (
                    <Button
                      key={child.id}
                      variant={selectedChild === child.id ? "default" : "outline"}
                      onClick={() => setSelectedChild(child.id)}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-xs font-bold text-blue-600">
                          {child.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <span>{child.name}</span>
                      <Badge variant="secondary" className="ml-1">
                        {child.totalAchievements}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievement Summary */}
        {data?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Prestasi</p>
                    <p className="text-2xl font-bold">{data.statistics.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Platinum</p>
                    <p className="text-2xl font-bold">{data.statistics.platinum}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Medal className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Gold</p>
                    <p className="text-2xl font-bold">{data.statistics.gold}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Silver</p>
                    <p className="text-2xl font-bold">{data.statistics.silver}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Bulan Ini</p>
                    <p className="text-2xl font-bold">{data.statistics.thisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Target className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ranking Kelas</p>
                  <p className="text-2xl font-bold text-gray-900">#2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Latest Achievement Highlight */}
        {latestAchievement && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Crown className="h-5 w-5 mr-2" />
                Prestasi Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className={`p-3 ${latestAchievement.color} rounded-lg`}>
                  <latestAchievement.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{latestAchievement.title}</h3>
                  <p className="text-gray-600 text-sm">{latestAchievement.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">
                      {new Date(latestAchievement.date).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-sm font-medium text-yellow-600">
                      +{latestAchievement.points} poin
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getBadgeIcon(latestAchievement.badge)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(latestAchievement.badge)}`}>
                    {latestAchievement.badge.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Prestasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAchievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-3 ${achievement.color} rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        {getBadgeIcon(achievement.badge)}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(achievement.date).toLocaleDateString('id-ID')}</span>
                        <span>•</span>
                        <span>{achievement.musyrif}</span>
                        <span>•</span>
                        <span className="font-medium text-teal-600">+{achievement.points} poin</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(achievement.badge)}`}>
                        {achievement.badge.toUpperCase()}
                      </span>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliAchievementsPage;
