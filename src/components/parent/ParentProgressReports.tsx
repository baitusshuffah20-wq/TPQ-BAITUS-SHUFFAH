'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Eye,
  Star,
  Target,
  Award,
  Heart,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  School,
  Home,
  Activity,
  FileText,
  Mail,
  MessageSquare,
  Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  BehaviorSummary,
  CharacterGoal,
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
  getCharacterGrade,
  getGradeColor,
  formatBehaviorDate
} from '@/lib/behavior-data';

interface ParentProgressReportsProps {
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahName: string;
  musyrifName: string;
}

export default function ParentProgressReports({
  santriId,
  santriName,
  santriNis,
  halaqahName,
  musyrifName
}: ParentProgressReportsProps) {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');
  const [reportType, setReportType] = useState('COMPREHENSIVE');

  // Mock comprehensive report data
  const mockProgressReport = {
    period: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      type: 'MONTHLY' as const
    },
    overview: {
      behaviorScore: 85,
      characterGrade: 'B+' as const,
      attendanceRate: 95,
      academicProgress: 88,
      overallRank: 3,
      totalStudents: 25
    },
    behaviorSummary: {
      totalRecords: 18,
      positiveCount: 15,
      negativeCount: 3,
      neutralCount: 0,
      totalPoints: 42,
      averagePoints: 2.3,
      behaviorScore: 85,
      characterGrade: 'B+' as const,
      byCategory: [
        { category: 'AKHLAQ' as const, count: 8, points: 28, percentage: 44 },
        { category: 'IBADAH' as const, count: 5, points: 18, percentage: 28 },
        { category: 'ACADEMIC' as const, count: 3, points: 9, percentage: 17 },
        { category: 'SOCIAL' as const, count: 2, points: 6, percentage: 11 }
      ],
      trends: {
        improving: true,
        stable: false,
        declining: false,
        trendPercentage: 15
      },
      strengths: [
        'Sangat jujur dalam berkata dan bertindak',
        'Rajin melaksanakan shalat berjamaah',
        'Aktif membantu teman yang kesulitan',
        'Menunjukkan empati yang tinggi',
        'Konsisten dalam perilaku positif'
      ],
      areasForImprovement: [
        'Perlu meningkatkan kedisiplinan waktu',
        'Lebih aktif dalam bertanya saat pembelajaran',
        'Mengembangkan kemampuan kepemimpinan',
        'Meningkatkan fokus saat pembelajaran'
      ],
      recommendations: [
        'Berikan apresiasi atas kejujuran yang konsisten',
        'Latih tanggung jawab sebagai ketua kelompok kecil',
        'Dorong untuk lebih berani mengungkapkan pendapat',
        'Berikan kesempatan memimpin kegiatan di rumah',
        'Konsisten dalam memberikan reward untuk perilaku positif'
      ],
      lastUpdated: '2024-01-31T23:59:59Z'
    },
    academicProgress: {
      hafalanProgress: {
        currentSurah: 'Al-Mulk',
        completedAyat: 15,
        totalAyat: 30,
        percentage: 50,
        quality: 'BAIK',
        nextTarget: 'Menyelesaikan Surah Al-Mulk'
      },
      tajwidProgress: {
        level: 'MENENGAH',
        masteredRules: 8,
        totalRules: 12,
        percentage: 67,
        currentFocus: 'Hukum Nun Sukun dan Tanwin'
      },
      readingFluency: {
        level: 'LANCAR',
        wpm: 45, // words per minute
        accuracy: 92,
        improvement: 'MENINGKAT'
      }
    },
    attendance: {
      totalDays: 20,
      presentDays: 19,
      lateDays: 1,
      absentDays: 0,
      attendanceRate: 95,
      punctualityScore: 95
    },
    achievements: [
      {
        id: 'ach_1',
        title: 'Santri Teladan Minggu Ini',
        description: 'Menunjukkan perilaku teladan dan membantu teman',
        date: '2024-01-28',
        category: 'BEHAVIOR',
        points: 10
      },
      {
        id: 'ach_2',
        title: 'Hafalan Terbaik',
        description: 'Hafalan 15 ayat dengan tartil yang sempurna',
        date: '2024-01-25',
        category: 'ACADEMIC',
        points: 8
      },
      {
        id: 'ach_3',
        title: 'Helper of the Week',
        description: 'Aktif membantu teman yang kesulitan',
        date: '2024-01-20',
        category: 'SOCIAL',
        points: 6
      }
    ],
    goals: [
      {
        id: 'goal_1',
        title: 'Mengembangkan Kepemimpinan',
        description: 'Program pengembangan jiwa kepemimpinan dan tanggung jawab',
        category: 'LEADERSHIP' as const,
        progress: 65,
        targetDate: '2024-04-30',
        status: 'ACTIVE' as const,
        milestones: [
          {
            id: 'milestone_1',
            title: 'Memimpin doa pembuka',
            isCompleted: true,
            completedAt: '2024-02-15T07:30:00Z'
          },
          {
            id: 'milestone_2',
            title: 'Menjadi ketua kelompok',
            isCompleted: false
          }
        ]
      }
    ],
    parentFeedback: {
      homeObservations: [
        'Ahmad semakin rajin shalat di rumah',
        'Mulai membantu mengatur adik-adiknya',
        'Lebih bertanggung jawab dengan tugas rumah',
        'Sering menceritakan pembelajaran di TPQ'
      ],
      concerns: [
        'Kadang masih perlu diingatkan untuk muroja\'ah',
        'Perlu motivasi lebih untuk bangun subuh'
      ],
      supportNeeded: [
        'Panduan metode muroja\'ah yang efektif',
        'Tips memotivasi anak untuk konsisten ibadah',
        'Cara mendukung goal kepemimpinan di rumah'
      ]
    },
    musyrifNotes: {
      strengths: [
        'Ahmad menunjukkan karakter yang sangat baik',
        'Potensi kepemimpinan yang menonjol',
        'Hubungan sosial yang positif dengan teman',
        'Konsistensi dalam perilaku positif'
      ],
      improvements: [
        'Perlu peningkatan dalam kedisiplinan waktu',
        'Dapat lebih aktif dalam bertanya',
        'Pengembangan kepercayaan diri dalam memimpin'
      ],
      recommendations: [
        'Berikan tanggung jawab lebih di rumah',
        'Dorong untuk memimpin kegiatan keluarga',
        'Konsisten dalam memberikan apresiasi',
        'Libatkan dalam pengambilan keputusan keluarga'
      ],
      nextSteps: [
        'Fokus pada pengembangan kepemimpinan',
        'Peningkatan kedisiplinan waktu',
        'Penguatan hafalan dengan muroja\'ah rutin'
      ]
    }
  };

  useEffect(() => {
    loadProgressReport();
  }, [selectedPeriod, reportType]);

  const loadProgressReport = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading progress report:', error);
      toast.error('Gagal memuat laporan progress');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (format: 'PDF' | 'EXCEL') => {
    toast.success(`Laporan ${format} sedang diproses...`);
    // Simulate download
    setTimeout(() => {
      toast.success(`Laporan ${format} berhasil diunduh!`);
    }, 2000);
  };

  const shareReport = (method: 'EMAIL' | 'WHATSAPP') => {
    toast.success(`Laporan berhasil dibagikan via ${method}!`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Laporan Progress {santriName}</h2>
          <p className="text-gray-600">
            {santriNis} • {halaqahName} • Periode: {formatBehaviorDate(mockProgressReport.period.startDate)} - {formatBehaviorDate(mockProgressReport.period.endDate)}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => downloadReport('PDF')}>
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => shareReport('EMAIL')}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Periode Laporan:</label>
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
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="COMPREHENSIVE">Laporan Lengkap</option>
              <option value="BEHAVIOR_ONLY">Perilaku Saja</option>
              <option value="ACADEMIC_ONLY">Akademik Saja</option>
              <option value="SUMMARY">Ringkasan</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Grade Karakter</p>
                <p className={`text-2xl font-bold ${getGradeColor(mockProgressReport.overview.characterGrade).split(' ')[0]}`}>
                  {mockProgressReport.overview.characterGrade}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Skor Perilaku</p>
                <p className="text-2xl font-bold text-blue-600">{mockProgressReport.overview.behaviorScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kehadiran</p>
                <p className="text-2xl font-bold text-teal-600">{mockProgressReport.overview.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress Akademik</p>
                <p className="text-2xl font-bold text-purple-600">{mockProgressReport.overview.academicProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Behavior Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Ringkasan Perilaku</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{mockProgressReport.behaviorSummary.positiveCount}</div>
                <div className="text-xs text-gray-600">Positif</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{mockProgressReport.behaviorSummary.negativeCount}</div>
                <div className="text-xs text-gray-600">Negatif</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{mockProgressReport.behaviorSummary.totalPoints}</div>
                <div className="text-xs text-gray-600">Total Poin</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Distribusi Kategori:</h4>
              {mockProgressReport.behaviorSummary.byCategory.map((category) => (
                <div key={category.category} className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${getBehaviorCategoryColor(category.category)}`}>
                    {getBehaviorCategoryText(category.category)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{category.count} catatan</span>
                    <span className={`font-medium ${category.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {category.points > 0 ? '+' : ''}{category.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {mockProgressReport.behaviorSummary.trends.improving && (
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Berkembang {mockProgressReport.behaviorSummary.trends.trendPercentage}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Academic Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span>Progress Akademik</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Hafalan Al-Quran</h4>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">{mockProgressReport.academicProgress.hafalanProgress.currentSurah}</span>
                <span className="text-sm font-medium">{mockProgressReport.academicProgress.hafalanProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${mockProgressReport.academicProgress.hafalanProgress.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {mockProgressReport.academicProgress.hafalanProgress.completedAyat} dari {mockProgressReport.academicProgress.hafalanProgress.totalAyat} ayat
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tajwid</h4>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Level {mockProgressReport.academicProgress.tajwidProgress.level}</span>
                <span className="text-sm font-medium">{mockProgressReport.academicProgress.tajwidProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${mockProgressReport.academicProgress.tajwidProgress.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Fokus: {mockProgressReport.academicProgress.tajwidProgress.currentFocus}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Kelancaran Baca</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{mockProgressReport.academicProgress.readingFluency.wpm}</div>
                  <div className="text-xs text-gray-600">WPM</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{mockProgressReport.academicProgress.readingFluency.accuracy}%</div>
                  <div className="text-xs text-gray-600">Akurasi</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Pencapaian & Penghargaan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockProgressReport.achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatBehaviorDate(achievement.date)}</span>
                  <span className="font-medium text-green-600">+{achievement.points} poin</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Kekuatan & Area Pengembangan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Kekuatan:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {mockProgressReport.behaviorSummary.strengths.slice(0, 3).map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Area Pengembangan:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {mockProgressReport.behaviorSummary.areasForImprovement.slice(0, 3).map((area, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Target className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-blue-600" />
              <span>Rekomendasi untuk Orang Tua</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Saran Pendampingan di Rumah:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                {mockProgressReport.behaviorSummary.recommendations.slice(0, 4).map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Musyrif Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-teal-600" />
            <span>Catatan dari Musyrif: {musyrifName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Observasi Musyrif:</h4>
              <div className="space-y-2">
                {mockProgressReport.musyrifNotes.strengths.map((note, index) => (
                  <p key={index} className="text-sm text-gray-600 p-2 bg-green-50 rounded border-l-4 border-green-400">
                    {note}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Langkah Selanjutnya:</h4>
              <div className="space-y-2">
                {mockProgressReport.musyrifNotes.nextSteps.map((step, index) => (
                  <p key={index} className="text-sm text-gray-600 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    {step}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
