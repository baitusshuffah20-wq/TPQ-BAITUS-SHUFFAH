'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import HafalanProgressCard from '@/components/hafalan/HafalanProgressCard';
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Search,
  Filter,
  Download,
  Target,
  Calendar,
  BarChart3,
  Plus,
  Eye,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  QURAN_SURAHS, 
  HafalanRecord, 
  HafalanProgress,
  calculateHafalanProgress,
  getSurahById
} from '@/lib/quran-data';

interface SantriProgress {
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahName: string;
  totalSurahs: number;
  completedSurahs: number;
  masteredSurahs: number;
  averageScore: number;
  totalAyahs: number;
  completedAyahs: number;
  progressPercentage: number;
  lastActivity: string;
  surahProgresses: HafalanProgress[];
}

export default function HafalanProgressPage() {
  const [santriProgresses, setSantriProgresses] = useState<SantriProgress[]>([]);
  const [filteredProgresses, setFilteredProgresses] = useState<SantriProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [halaqahFilter, setHalaqahFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');
  const [selectedSantri, setSelectedSantri] = useState<SantriProgress | null>(null);

  // Mock data
  const mockHafalanRecords: HafalanRecord[] = [
    {
      id: 'hafalan_1',
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      surahId: 114,
      surahName: 'An-Nas',
      ayahStart: 1,
      ayahEnd: 6,
      type: 'SETORAN',
      status: 'APPROVED',
      grade: 'A',
      score: 85,
      notes: 'Bacaan sudah baik',
      musyrifId: 'musyrif_1',
      musyrifName: 'Ustadz Ahmad',
      recordedAt: '2024-01-15T08:30:00Z',
      evaluatedAt: '2024-01-15T09:00:00Z',
      metadata: {
        tajwid: 80,
        makhorijul_huruf: 90,
        kelancaran: 85,
        adab: 95
      }
    },
    {
      id: 'hafalan_2',
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      surahId: 113,
      surahName: 'Al-Falaq',
      ayahStart: 1,
      ayahEnd: 5,
      type: 'SETORAN',
      status: 'APPROVED',
      grade: 'A-',
      score: 82,
      musyrifId: 'musyrif_1',
      musyrifName: 'Ustadz Ahmad',
      recordedAt: '2024-01-16T08:30:00Z',
      evaluatedAt: '2024-01-16T09:00:00Z',
      metadata: {
        tajwid: 80,
        makhorijul_huruf: 85,
        kelancaran: 80,
        adab: 85
      }
    },
    {
      id: 'hafalan_3',
      santriId: 'santri_2',
      santriName: 'Siti Aisyah',
      surahId: 112,
      surahName: 'Al-Ikhlas',
      ayahStart: 1,
      ayahEnd: 4,
      type: 'SETORAN',
      status: 'APPROVED',
      grade: 'A+',
      score: 95,
      musyrifId: 'musyrif_2',
      musyrifName: 'Ustadzah Fatimah',
      recordedAt: '2024-01-14T10:00:00Z',
      evaluatedAt: '2024-01-14T10:15:00Z',
      metadata: {
        tajwid: 95,
        makhorijul_huruf: 95,
        kelancaran: 95,
        adab: 100
      }
    }
  ];

  useEffect(() => {
    loadProgressData();
  }, []);

  useEffect(() => {
    filterProgresses();
  }, [santriProgresses, searchTerm, halaqahFilter, progressFilter]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate progress for each santri
      const santriIds = [...new Set(mockHafalanRecords.map(r => r.santriId))];
      const progresses: SantriProgress[] = santriIds.map(santriId => {
        const santriRecords = mockHafalanRecords.filter(r => r.santriId === santriId);
        const santriName = santriRecords[0]?.santriName || '';
        
        // Calculate progress for each surah
        const surahIds = [...new Set(santriRecords.map(r => r.surahId))];
        const surahProgresses = surahIds.map(surahId => 
          calculateHafalanProgress(santriRecords, surahId)
        );

        const completedSurahs = surahProgresses.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length;
        const masteredSurahs = surahProgresses.filter(p => p.status === 'MASTERED').length;
        const totalAyahs = surahProgresses.reduce((sum, p) => sum + p.totalAyahs, 0);
        const completedAyahs = surahProgresses.reduce((sum, p) => sum + p.completedAyahs, 0);
        const averageScore = surahProgresses.reduce((sum, p) => sum + (p.averageScore || 0), 0) / surahProgresses.length;

        return {
          santriId,
          santriName,
          santriNis: `TPQ${santriId.slice(-3).padStart(3, '0')}`,
          halaqahName: 'Halaqah Al-Fatihah',
          totalSurahs: surahIds.length,
          completedSurahs,
          masteredSurahs,
          averageScore: Math.round(averageScore),
          totalAyahs,
          completedAyahs,
          progressPercentage: totalAyahs > 0 ? (completedAyahs / totalAyahs) * 100 : 0,
          lastActivity: santriRecords[santriRecords.length - 1]?.recordedAt || new Date().toISOString(),
          surahProgresses
        };
      });

      setSantriProgresses(progresses);
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Gagal memuat data progress hafalan');
    } finally {
      setLoading(false);
    }
  };

  const filterProgresses = () => {
    let filtered = santriProgresses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(progress =>
        progress.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        progress.santriNis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        progress.halaqahName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by halaqah
    if (halaqahFilter !== 'all') {
      filtered = filtered.filter(progress => progress.halaqahName === halaqahFilter);
    }

    // Filter by progress level
    if (progressFilter !== 'all') {
      filtered = filtered.filter(progress => {
        switch (progressFilter) {
          case 'excellent': return progress.progressPercentage >= 80;
          case 'good': return progress.progressPercentage >= 60 && progress.progressPercentage < 80;
          case 'average': return progress.progressPercentage >= 40 && progress.progressPercentage < 60;
          case 'needs_improvement': return progress.progressPercentage < 40;
          default: return true;
        }
      });
    }

    setFilteredProgresses(filtered);
  };

  const calculateOverallStats = () => {
    const totalSantri = santriProgresses.length;
    const totalSurahs = santriProgresses.reduce((sum, p) => sum + p.totalSurahs, 0);
    const totalCompleted = santriProgresses.reduce((sum, p) => sum + p.completedSurahs, 0);
    const totalMastered = santriProgresses.reduce((sum, p) => sum + p.masteredSurahs, 0);
    const averageProgress = santriProgresses.reduce((sum, p) => sum + p.progressPercentage, 0) / totalSantri || 0;

    return {
      totalSantri,
      totalSurahs,
      totalCompleted,
      totalMastered,
      averageProgress: Math.round(averageProgress)
    };
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Hafalan</h1>
          <p className="text-gray-600">Monitoring progress hafalan Al-Quran santri</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Set Target
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Santri</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSantri}</p>
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
                <p className="text-sm font-medium text-gray-600">Surah Selesai</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
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
                <p className="text-sm font-medium text-gray-600">Surah Dikuasai</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalMastered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Star className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Surah</p>
                <p className="text-2xl font-bold text-teal-600">{stats.totalSurahs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari santri, NIS, atau halaqah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={halaqahFilter}
                onChange={(e) => setHalaqahFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Halaqah</option>
                <option value="Halaqah Al-Fatihah">Halaqah Al-Fatihah</option>
                <option value="Halaqah Al-Baqarah">Halaqah Al-Baqarah</option>
                <option value="Halaqah Ali Imran">Halaqah Ali Imran</option>
              </select>
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Progress</option>
                <option value="excellent">Excellent (80%+)</option>
                <option value="good">Good (60-79%)</option>
                <option value="average">Average (40-59%)</option>
                <option value="needs_improvement">Perlu Perbaikan (&lt;40%)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProgresses.map((santriProgress) => (
          <Card key={santriProgress.santriId} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {santriProgress.santriName}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{santriProgress.santriNis} • {santriProgress.halaqahName}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">
                    {santriProgress.progressPercentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Progress</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(santriProgress.progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Surah Selesai:</span>
                  <div className="font-medium text-gray-900">
                    {santriProgress.completedSurahs}/{santriProgress.totalSurahs}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Dikuasai:</span>
                  <div className="font-medium text-yellow-600">{santriProgress.masteredSurahs}</div>
                </div>
                <div>
                  <span className="text-gray-600">Ayat Selesai:</span>
                  <div className="font-medium text-gray-900">
                    {santriProgress.completedAyahs}/{santriProgress.totalAyahs}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Rata-rata Nilai:</span>
                  <div className="font-medium text-gray-900">{santriProgress.averageScore}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSantri(santriProgress)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detail
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </div>

              {/* Last Activity */}
              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                Aktivitas terakhir: {new Date(santriProgress.lastActivity).toLocaleDateString('id-ID')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProgresses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data progress</h3>
          <p className="text-gray-600">
            {searchTerm || halaqahFilter !== 'all' || progressFilter !== 'all'
              ? 'Tidak ada progress yang sesuai dengan filter'
              : 'Belum ada data progress hafalan'
            }
          </p>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
