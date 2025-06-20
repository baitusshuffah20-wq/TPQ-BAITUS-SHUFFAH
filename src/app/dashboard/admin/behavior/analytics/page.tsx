'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  Eye,
  Star,
  Heart,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  BehaviorRecord,
  BehaviorSummary,
  BehaviorCategory,
  BehaviorType,
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
  getCharacterGrade,
  getGradeColor,
  calculateBehaviorScore,
  calculateTrend
} from '@/lib/behavior-data';

export default function BehaviorAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');
  const [selectedHalaqah, setSelectedHalaqah] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock analytics data
  const mockAnalyticsData = {
    overview: {
      totalStudents: 25,
      totalRecords: 156,
      averageScore: 78.5,
      improvingStudents: 18,
      needsAttention: 3,
      perfectBehavior: 4
    },
    categoryStats: [
      { category: 'AKHLAQ', count: 45, positiveCount: 38, negativeCount: 7, averagePoints: 3.2 },
      { category: 'IBADAH', count: 32, positiveCount: 29, negativeCount: 3, averagePoints: 4.1 },
      { category: 'ACADEMIC', count: 28, positiveCount: 22, negativeCount: 6, averagePoints: 2.8 },
      { category: 'SOCIAL', count: 25, positiveCount: 18, negativeCount: 7, averagePoints: 1.9 },
      { category: 'DISCIPLINE', count: 20, positiveCount: 8, negativeCount: 12, averagePoints: -1.2 },
      { category: 'LEADERSHIP', count: 6, positiveCount: 6, negativeCount: 0, averagePoints: 5.0 }
    ],
    topPerformers: [
      { santriId: 'santri_1', santriName: 'Ahmad Fauzi', score: 95, grade: 'A+', totalPoints: 48, trend: 'improving' },
      { santriId: 'santri_2', santriName: 'Siti Aisyah', score: 92, grade: 'A', totalPoints: 45, trend: 'stable' },
      { santriId: 'santri_4', santriName: 'Fatimah Zahra', score: 89, grade: 'A-', totalPoints: 42, trend: 'improving' },
      { santriId: 'santri_5', santriName: 'Abdullah Rahman', score: 85, grade: 'B+', totalPoints: 38, trend: 'improving' },
      { santriId: 'santri_8', santriName: 'Khadijah Binti Ali', score: 83, grade: 'B+', totalPoints: 36, trend: 'stable' }
    ],
    needsAttention: [
      { santriId: 'santri_3', santriName: 'Muhammad Rizki', score: 45, grade: 'D', totalPoints: -8, trend: 'declining', issues: ['Sering mengganggu kelas', 'Kurang disiplin'] },
      { santriId: 'santri_7', santriName: 'Umar Ibn Khattab', score: 52, grade: 'C-', totalPoints: -2, trend: 'declining', issues: ['Terlambat berulang', 'Kurang partisipasi'] },
      { santriId: 'santri_12', santriName: 'Zaynab Binti Ahmad', score: 58, grade: 'C', totalPoints: 2, trend: 'stable', issues: ['Interaksi sosial kurang', 'Perlu motivasi'] }
    ],
    weeklyTrends: [
      { week: 'Minggu 1', positiveCount: 28, negativeCount: 8, averageScore: 76 },
      { week: 'Minggu 2', positiveCount: 32, negativeCount: 6, averageScore: 79 },
      { week: 'Minggu 3', positiveCount: 35, negativeCount: 5, averageScore: 81 },
      { week: 'Minggu 4', positiveCount: 38, negativeCount: 4, averageScore: 83 }
    ],
    halaqahComparison: [
      { halaqahId: 'halaqah_1', halaqahName: 'Halaqah Al-Fatihah', studentCount: 12, averageScore: 82, positiveRate: 85 },
      { halaqahId: 'halaqah_2', halaqahName: 'Halaqah Al-Baqarah', studentCount: 8, averageScore: 75, positiveRate: 78 },
      { halaqahId: 'halaqah_3', halaqahName: 'Halaqah Ali Imran', studentCount: 5, averageScore: 73, positiveRate: 72 }
    ]
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedHalaqah, selectedCategory]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Gagal memuat data analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'declining': return 'text-red-600 bg-red-100';
      case 'stable': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Perilaku Santri</h1>
          <p className="text-gray-600">Analisis mendalam perkembangan karakter dan akhlaq santri</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Period:</label>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="WEEKLY">Mingguan</option>
              <option value="MONTHLY">Bulanan</option>
              <option value="QUARTERLY">Triwulan</option>
              <option value="YEARLY">Tahunan</option>
            </select>
            <select
              value={selectedHalaqah}
              onChange={(e) => setSelectedHalaqah(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Semua Halaqah</option>
              <option value="halaqah_1">Halaqah Al-Fatihah</option>
              <option value="halaqah_2">Halaqah Al-Baqarah</option>
              <option value="halaqah_3">Halaqah Ali Imran</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              <option value="AKHLAQ">Akhlaq</option>
              <option value="IBADAH">Ibadah</option>
              <option value="ACADEMIC">Akademik</option>
              <option value="SOCIAL">Sosial</option>
              <option value="DISCIPLINE">Disiplin</option>
              <option value="LEADERSHIP">Kepemimpinan</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Santri</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.overview.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Catatan</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.overview.totalRecords}</p>
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
                <p className="text-sm font-medium text-gray-600">Rata-rata Skor</p>
                <p className="text-2xl font-bold text-teal-600">{mockAnalyticsData.overview.averageScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Berkembang</p>
                <p className="text-2xl font-bold text-green-600">{mockAnalyticsData.overview.improvingStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perlu Perhatian</p>
                <p className="text-2xl font-bold text-red-600">{mockAnalyticsData.overview.needsAttention}</p>
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
                <p className="text-sm font-medium text-gray-600">Perilaku Sempurna</p>
                <p className="text-2xl font-bold text-yellow-600">{mockAnalyticsData.overview.perfectBehavior}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik per Kategori Perilaku</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAnalyticsData.categoryStats.map((category) => (
              <div key={category.category} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getBehaviorCategoryColor(category.category)}`}>
                    {getBehaviorCategoryText(category.category)}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{category.count}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Positif:</span>
                    <span className="font-medium">{category.positiveCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Negatif:</span>
                    <span className="font-medium">{category.negativeCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rata-rata Poin:</span>
                    <span className={`font-medium ${category.averagePoints > 0 ? 'text-green-600' : category.averagePoints < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {category.averagePoints > 0 ? '+' : ''}{category.averagePoints}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(category.positiveCount / category.count) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>Santri Berprestasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.topPerformers.map((student, index) => (
              <div key={student.santriId} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{student.santriName}</h4>
                    <p className="text-sm text-gray-600">Total Poin: {student.totalPoints}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{student.score}</p>
                    <p className="text-xs text-gray-600">Skor</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(student.grade)}`}>
                    {student.grade}
                  </span>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendColor(student.trend)}`}>
                    {getTrendIcon(student.trend)}
                    <span className="text-xs font-medium capitalize">{student.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Santri yang Memerlukan Perhatian</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.needsAttention.map((student) => (
              <div key={student.santriId} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{student.santriName}</h4>
                    <p className="text-sm text-gray-600">Total Poin: {student.totalPoints}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-600">{student.score}</p>
                      <p className="text-xs text-gray-600">Skor</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(student.grade)}`}>
                      {student.grade}
                    </span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendColor(student.trend)}`}>
                      {getTrendIcon(student.trend)}
                      <span className="text-xs font-medium capitalize">{student.trend}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800 mb-2">Area yang perlu diperbaiki:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {student.issues.map((issue, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <XCircle className="h-3 w-3" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Halaqah Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Antar Halaqah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.halaqahComparison.map((halaqah) => (
              <div key={halaqah.halaqahId} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{halaqah.halaqahName}</h4>
                    <p className="text-sm text-gray-600">{halaqah.studentCount} santri</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{halaqah.averageScore}</p>
                      <p className="text-xs text-gray-600">Rata-rata Skor</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{halaqah.positiveRate}%</p>
                      <p className="text-xs text-gray-600">Tingkat Positif</p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full"
                    style={{ width: `${halaqah.positiveRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
