'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FileText,
  Download,
  Search,
  Eye,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  AlertTriangle,
  Mail,
  MessageSquare,
  Printer,
  Edit
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  BehaviorSummary,
  CharacterGoal,
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
  getGradeColor,
  formatBehaviorDate
} from '@/lib/behavior-data';

export default function BehaviorReportsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');
  const [selectedHalaqah, setSelectedHalaqah] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState('INDIVIDUAL');

  // Mock data for reports
  const mockStudentReports: BehaviorSummary[] = [
    {
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'MONTHLY'
      },
      totalRecords: 18,
      positiveCount: 15,
      negativeCount: 3,
      neutralCount: 0,
      totalPoints: 42,
      averagePoints: 2.3,
      behaviorScore: 85,
      characterGrade: 'B+',
      byCategory: [
        { category: 'AKHLAQ', count: 8, points: 28, percentage: 44 },
        { category: 'IBADAH', count: 5, points: 18, percentage: 28 },
        { category: 'ACADEMIC', count: 3, points: 9, percentage: 17 },
        { category: 'SOCIAL', count: 2, points: 6, percentage: 11 }
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
        'Aktif membantu teman yang kesulitan'
      ],
      areasForImprovement: [
        'Perlu meningkatkan kedisiplinan waktu',
        'Lebih aktif dalam bertanya saat pembelajaran',
        'Mengembangkan kemampuan kepemimpinan'
      ],
      recommendations: [
        'Berikan apresiasi atas kejujuran yang konsisten',
        'Latih tanggung jawab sebagai ketua kelompok kecil',
        'Dorong untuk lebih berani mengungkapkan pendapat'
      ],
      lastUpdated: '2024-01-31T23:59:59Z'
    },
    {
      santriId: 'santri_2',
      santriName: 'Siti Aisyah',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'MONTHLY'
      },
      totalRecords: 22,
      positiveCount: 20,
      negativeCount: 2,
      neutralCount: 0,
      totalPoints: 58,
      averagePoints: 2.6,
      behaviorScore: 92,
      characterGrade: 'A',
      byCategory: [
        { category: 'AKHLAQ', count: 9, points: 32, percentage: 41 },
        { category: 'IBADAH', count: 7, points: 24, percentage: 32 },
        { category: 'ACADEMIC', count: 4, points: 12, percentage: 18 },
        { category: 'SOCIAL', count: 2, points: 8, percentage: 9 }
      ],
      trends: {
        improving: false,
        stable: true,
        declining: false,
        trendPercentage: 2
      },
      strengths: [
        'Konsisten dalam perilaku positif',
        'Sangat membantu teman-teman',
        'Rajin dalam ibadah dan hafalan'
      ],
      areasForImprovement: [
        'Dapat lebih berani memimpin diskusi',
        'Mengembangkan kreativitas dalam pembelajaran'
      ],
      recommendations: [
        'Berikan kesempatan untuk memimpin kegiatan',
        'Libatkan dalam mentoring santri junior',
        'Kembangkan bakat kepemimpinan'
      ],
      lastUpdated: '2024-01-31T23:59:59Z'
    },
    {
      santriId: 'santri_3',
      santriName: 'Muhammad Rizki',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'MONTHLY'
      },
      totalRecords: 16,
      positiveCount: 6,
      negativeCount: 10,
      neutralCount: 0,
      totalPoints: -12,
      averagePoints: -0.8,
      behaviorScore: 45,
      characterGrade: 'D',
      byCategory: [
        { category: 'DISCIPLINE', count: 8, points: -16, percentage: 50 },
        { category: 'SOCIAL', count: 4, points: -8, percentage: 25 },
        { category: 'AKHLAQ', count: 3, points: 9, percentage: 19 },
        { category: 'ACADEMIC', count: 1, points: 3, percentage: 6 }
      ],
      trends: {
        improving: false,
        stable: false,
        declining: true,
        trendPercentage: 25
      },
      strengths: [
        'Memiliki potensi kepemimpinan',
        'Kreatif dalam menyelesaikan masalah'
      ],
      areasForImprovement: [
        'Perlu meningkatkan disiplin secara signifikan',
        'Belajar mengendalikan emosi',
        'Mengembangkan empati terhadap teman',
        'Meningkatkan fokus saat pembelajaran'
      ],
      recommendations: [
        'Perlu konseling intensif dengan musyrif',
        'Libatkan orang tua dalam program perbaikan',
        'Berikan tanggung jawab kecil untuk membangun kepercayaan diri',
        'Program mentoring dengan santri senior'
      ],
      lastUpdated: '2024-01-31T23:59:59Z'
    }
  ];

  const mockCharacterGoals: CharacterGoal[] = [
    {
      id: 'goal_1',
      santriId: 'santri_3',
      santriName: 'Muhammad Rizki',
      title: 'Meningkatkan Kedisiplinan',
      description: 'Program khusus untuk meningkatkan kedisiplinan waktu dan perilaku di kelas',
      category: 'DISCIPLINE',
      targetBehaviors: ['Datang tepat waktu', 'Tidak mengganggu kelas', 'Mengikuti aturan TPQ'],
      targetDate: '2024-03-31',
      startDate: '2024-02-01',
      status: 'ACTIVE',
      progress: 35,
      milestones: [
        {
          id: 'milestone_1',
          title: 'Tidak terlambat selama 1 minggu',
          description: 'Datang tepat waktu setiap hari selama 1 minggu berturut-turut',
          targetDate: '2024-02-07',
          isCompleted: true,
          completedAt: '2024-02-07T08:00:00Z',
          evidence: 'Catatan kehadiran menunjukkan tidak ada keterlambatan'
        },
        {
          id: 'milestone_2',
          title: 'Tidak mengganggu kelas selama 2 minggu',
          description: 'Mengikuti pembelajaran dengan tenang tanpa mengganggu teman',
          targetDate: '2024-02-21',
          isCompleted: false
        },
        {
          id: 'milestone_3',
          title: 'Membantu teman dalam pembelajaran',
          description: 'Aktif membantu teman yang kesulitan belajar',
          targetDate: '2024-03-15',
          isCompleted: false
        }
      ],
      createdBy: 'musyrif_2',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-15T10:30:00Z',
      parentInvolved: true,
      musyrifNotes: 'Rizki menunjukkan perbaikan dalam kedisiplinan. Perlu konsistensi dan dukungan orang tua.',
      parentFeedback: 'Di rumah juga sudah mulai lebih disiplin. Terima kasih atas bimbingannya.'
    }
  ];

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod, selectedHalaqah, reportType]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading reports data:', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (santriId: string, format: 'PDF' | 'EXCEL' | 'WORD') => {
    const student = mockStudentReports.find(s => s.santriId === santriId);
    if (student) {
      toast.success(`Laporan ${format} untuk ${student.santriName} sedang diproses...`);
      // Simulate report generation
      setTimeout(() => {
        toast.success(`Laporan ${format} berhasil dibuat dan siap diunduh!`);
      }, 2000);
    }
  };

  const sendReportToParent = (santriId: string, method: 'EMAIL' | 'WHATSAPP') => {
    const student = mockStudentReports.find(s => s.santriId === santriId);
    if (student) {
      toast.success(`Laporan ${student.santriName} berhasil dikirim via ${method}!`);
    }
  };

  const filteredReports = mockStudentReports.filter(report =>
    report.santriName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Perkembangan Karakter</h1>
            <p className="text-gray-600">Laporan komprehensif perkembangan akhlaq dan karakter santri</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Batch
            </Button>
          </div>
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
                    placeholder="Cari santri..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="INDIVIDUAL">Laporan Individual</option>
                  <option value="CLASS">Laporan Kelas</option>
                  <option value="COMPARATIVE">Laporan Perbandingan</option>
                </select>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.santriId} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{report.santriName}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Periode: {formatBehaviorDate(report.period.startDate)} - {formatBehaviorDate(report.period.endDate)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{report.behaviorScore}</div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(report.characterGrade)}`}>
                      {report.characterGrade}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{report.positiveCount}</div>
                    <div className="text-xs text-gray-600">Positif</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{report.negativeCount}</div>
                    <div className="text-xs text-gray-600">Negatif</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{report.totalPoints}</div>
                    <div className="text-xs text-gray-600">Total Poin</div>
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center justify-center space-x-2">
                  {report.trends.improving && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Berkembang {report.trends.trendPercentage}%</span>
                    </div>
                  )}
                  {report.trends.declining && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm font-medium">Menurun {report.trends.trendPercentage}%</span>
                    </div>
                  )}
                  {report.trends.stable && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-medium">Stabil</span>
                    </div>
                  )}
                </div>

                {/* Category Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Distribusi Kategori:</h4>
                  {report.byCategory.map((category) => (
                    <div key={category.category} className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${getBehaviorCategoryColor(category.category)}`}>
                        {getBehaviorCategoryText(category.category)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">{category.count} catatan</span>
                        <span className={`font-medium ${category.points > 0 ? 'text-green-600' : category.points < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {category.points > 0 ? '+' : ''}{category.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Star className="h-4 w-4 text-yellow-600 mr-1" />
                    Kekuatan:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {report.strengths.slice(0, 2).map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Target className="h-4 w-4 text-orange-600 mr-1" />
                    Area Pengembangan:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {report.areasForImprovement.slice(0, 2).map((area, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={() => generateReport(report.santriId, 'PDF')}>
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendReportToParent(report.santriId, 'EMAIL')}>
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendReportToParent(report.santriId, 'WHATSAPP')}>
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Character Goals Section */}
        {mockCharacterGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-teal-600" />
                <span>Program Pengembangan Karakter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCharacterGoals.map((goal) => (
                  <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <p className="text-sm text-gray-600">{goal.santriName}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-teal-600">{goal.progress}%</div>
                          <div className="text-xs text-gray-600">Progress</div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          goal.status === 'ACTIVE' ? 'text-green-600 bg-green-100' : 
                          goal.status === 'COMPLETED' ? 'text-blue-600 bg-blue-100' : 
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Target: {formatBehaviorDate(goal.targetDate)}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
