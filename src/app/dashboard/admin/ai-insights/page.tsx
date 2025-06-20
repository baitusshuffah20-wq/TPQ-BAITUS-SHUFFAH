'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AIEngine from '@/lib/ai-engine';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Target,
  Lightbulb,
  Users,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  RefreshCw,
  Download
} from 'lucide-react';

const AIInsightsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [aiEngine] = useState(new AIEngine());
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/login');
      } else {
        setUser(parsedUser);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock student data for AI analysis
  const mockStudents = [
    {
      id: '1',
      name: 'Ahmad Fauzi',
      age: 14,
      enrollmentDate: '2024-01-15',
      currentLevel: 3,
      grades: [85, 88, 82, 90, 87, 89, 91, 86],
      hafalanHistory: [
        { surahId: 1, surahName: 'Al-Fatihah', ayahCount: 7, grade: 85, date: '2024-01-20', difficulty: 2 },
        { surahId: 2, surahName: 'Al-Baqarah', ayahCount: 20, grade: 88, date: '2024-02-01', difficulty: 4 },
        { surahId: 3, surahName: 'Ali Imran', ayahCount: 15, grade: 90, date: '2024-02-10', difficulty: 3 }
      ],
      attendanceHistory: [
        { date: '2024-02-01', status: 'PRESENT' as const, punctualityScore: 95 },
        { date: '2024-02-02', status: 'PRESENT' as const, punctualityScore: 90 },
        { date: '2024-02-03', status: 'LATE' as const, punctualityScore: 75 },
        { date: '2024-02-04', status: 'PRESENT' as const, punctualityScore: 100 },
        { date: '2024-02-05', status: 'PRESENT' as const, punctualityScore: 95 }
      ]
    },
    {
      id: '2',
      name: 'Siti Aisyah',
      age: 13,
      enrollmentDate: '2024-01-20',
      currentLevel: 2,
      grades: [92, 89, 94, 88, 91, 93, 90, 95],
      hafalanHistory: [
        { surahId: 1, surahName: 'Al-Fatihah', ayahCount: 7, grade: 92, date: '2024-01-25', difficulty: 2 },
        { surahId: 2, surahName: 'Al-Baqarah', ayahCount: 25, grade: 89, date: '2024-02-05', difficulty: 4 }
      ],
      attendanceHistory: [
        { date: '2024-02-01', status: 'PRESENT' as const, punctualityScore: 100 },
        { date: '2024-02-02', status: 'PRESENT' as const, punctualityScore: 100 },
        { date: '2024-02-03', status: 'PRESENT' as const, punctualityScore: 95 },
        { date: '2024-02-04', status: 'PRESENT' as const, punctualityScore: 100 },
        { date: '2024-02-05', status: 'PRESENT' as const, punctualityScore: 100 }
      ]
    }
  ];

  // Generate AI insights
  const selectedStudentData = selectedStudent === 'all' ? null : mockStudents.find(s => s.id === selectedStudent);
  const classTrends = aiEngine.analyzeClassTrends(mockStudents);
  const studentPrediction = selectedStudentData ? aiEngine.predictCompletionTime(selectedStudentData, 30) : null;
  const studentRecommendations = selectedStudentData ? aiEngine.generateRecommendations(selectedStudentData) : [];

  const refreshAnalysis = () => {
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const exportReport = () => {
    alert('AI Insights report akan didownload dalam format PDF');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'STUDY_PLAN': return <Calendar className="h-5 w-5" />;
      case 'MOTIVATION': return <Zap className="h-5 w-5" />;
      case 'DIFFICULTY_ADJUSTMENT': return <Target className="h-5 w-5" />;
      case 'SCHEDULE_OPTIMIZATION': return <Clock className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="h-8 w-8 mr-3 text-purple-600" />
              AI Insights Dashboard
            </h1>
            <p className="text-gray-600">
              Analisis cerdas dan prediksi berbasis AI untuk optimasi pembelajaran
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
            >
              <option value="all">Analisis Kelas</option>
              {mockStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            
            <Button variant="outline" onClick={refreshAnalysis} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Analyzing...' : 'Refresh AI'}
            </Button>
            
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* AI Processing Status */}
        {isLoading && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <div>
                    <p className="font-medium text-purple-900">AI sedang menganalisis data...</p>
                    <p className="text-sm text-purple-700">Memproses pola pembelajaran dan prediksi</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Class Overview (when "all" is selected) */}
        {selectedStudent === 'all' && (
          <>
            {/* Class Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Trend Kelas</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {classTrends.overallTrend === 'IMPROVING' ? 'Meningkat' : 
                         classTrends.overallTrend === 'DECLINING' ? 'Menurun' : 'Stabil'}
                      </p>
                    </div>
                    {classTrends.overallTrend === 'IMPROVING' ? (
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    ) : classTrends.overallTrend === 'DECLINING' ? (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    ) : (
                      <Activity className="h-8 w-8 text-yellow-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Rata-rata Nilai</p>
                      <p className="text-2xl font-bold text-green-900">
                        {classTrends.averageGrade.toFixed(1)}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Tingkat Kehadiran</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {(classTrends.attendanceRate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Perlu Perhatian</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {classTrends.needsAttention.length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classTrends.topPerformers.map((name, index) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                          </div>
                          <span className="font-medium text-gray-900">{name}</span>
                        </div>
                        <Award className="h-5 w-5 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Students Needing Attention */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                    Perlu Perhatian Khusus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {classTrends.needsAttention.length > 0 ? (
                    <div className="space-y-3">
                      {classTrends.needsAttention.map((name) => (
                        <div key={name} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium text-gray-900">{name}</span>
                          <Button size="sm" variant="outline">
                            Lihat Detail
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600">Semua santri menunjukkan performa yang baik!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  AI Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classTrends.insights.map((insight, index) => (
                    <div key={index} className="flex items-start p-4 bg-purple-50 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                      <p className="text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Individual Student Analysis */}
        {selectedStudentData && studentPrediction && (
          <>
            {/* Student Prediction */}
            <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-teal-600" />
                  Prediksi AI untuk {selectedStudentData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Prediksi Selesai 30 Juz</p>
                    <p className="text-2xl font-bold text-teal-600">{studentPrediction.completionDate}</p>
                    <p className="text-sm text-gray-500">Confidence: {studentPrediction.confidence.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Pace Rekomendasi</p>
                    <p className="text-2xl font-bold text-blue-600">{studentPrediction.recommendedPace}</p>
                    <p className="text-sm text-gray-500">Surah per minggu</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                    <p className={`text-2xl font-bold ${studentPrediction.riskFactors.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {studentPrediction.riskFactors.length > 0 ? 'Medium' : 'Low'}
                    </p>
                    <p className="text-sm text-gray-500">{studentPrediction.riskFactors.length} faktor risiko</p>
                  </div>
                </div>

                {studentPrediction.riskFactors.length > 0 && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Risk Factors:</h4>
                    <ul className="space-y-1">
                      {studentPrediction.riskFactors.map((risk, index) => (
                        <li key={index} className="text-sm text-orange-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Smart Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentRecommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {getRecommendationIcon(rec.type)}
                          <h4 className="font-medium text-gray-900 ml-2">{rec.title}</h4>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{rec.description}</p>
                      
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900 mb-2">Action Items:</h5>
                        <ul className="space-y-1">
                          {rec.actionItems.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-sm text-gray-600 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Expected Impact:</strong> {rec.expectedImpact}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* AI Model Info */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">AI Model Information</h3>
                <p className="text-sm text-gray-600">
                  Menggunakan algoritma Linear Regression, Weighted Moving Average, dan Pattern Recognition
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">{new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIInsightsPage;
