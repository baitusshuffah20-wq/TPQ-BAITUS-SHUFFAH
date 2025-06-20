'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Users,
  Target,
  Award,
  BookOpen,
  Calendar,
  CreditCard,
  Zap,
  Eye,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SystemInsights {
  totalStudents: number;
  activeStudents: number;
  averageAttendance: number;
  averagePerformance: number;
  monthlyTrends: {
    month: string;
    attendance: number;
    performance: number;
    newEnrollments: number;
  }[];
  alerts: {
    type: string;
    message: string;
    severity: string;
    count: number;
  }[];
}

interface StudentInsight {
  studentId: string;
  studentName: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: string;
  trends: {
    hafalan: string;
    attendance: string;
    performance: string;
  };
}

export default function AIInsightsDashboard() {
  const [systemInsights, setSystemInsights] = useState<SystemInsights | null>(null);
  const [selectedStudentInsights, setSelectedStudentInsights] = useState<StudentInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSystemInsights();
  }, []);

  const loadSystemInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insights/system');
      if (response.ok) {
        const result = await response.json();
        setSystemInsights(result.data);
      } else {
        toast.error('Gagal memuat insights sistem');
      }
    } catch (error) {
      console.error('Error loading system insights:', error);
      toast.error('Gagal memuat insights sistem');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentInsights = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/insights/student/${studentId}`);
      if (response.ok) {
        const result = await response.json();
        setSelectedStudentInsights(result.data.basic);
      } else {
        toast.error('Gagal memuat insights santri');
      }
    } catch (error) {
      console.error('Error loading student insights:', error);
      toast.error('Gagal memuat insights santri');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    setRefreshing(true);
    await loadSystemInsights();
    setRefreshing(false);
    toast.success('Insights berhasil diperbarui');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ATTENDANCE':
        return <Calendar className="h-4 w-4" />;
      case 'PERFORMANCE':
        return <BookOpen className="h-4 w-4" />;
      case 'PAYMENT':
        return <CreditCard className="h-4 w-4" />;
      case 'CAPACITY':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DECLINING':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return <Badge variant="destructive">Risiko Tinggi</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Risiko Sedang</Badge>;
      case 'LOW':
        return <Badge variant="success">Risiko Rendah</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading && !systemInsights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Menganalisis data dengan AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Insights Dashboard</h1>
            <p className="text-gray-600">Analisis cerdas untuk optimasi pembelajaran</p>
          </div>
        </div>
        <Button
          onClick={refreshInsights}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      {systemInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Santri</p>
                  <p className="text-2xl font-bold text-gray-900">{systemInsights.totalStudents}</p>
                  <p className="text-xs text-green-600">{systemInsights.activeStudents} aktif</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rata-rata Kehadiran</p>
                  <p className="text-2xl font-bold text-gray-900">{systemInsights.averageAttendance}%</p>
                  <p className="text-xs text-gray-500">30 hari terakhir</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold text-gray-900">{systemInsights.averagePerformance}</p>
                  <p className="text-xs text-gray-500">Hafalan terbaru</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alert Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{systemInsights.alerts.length}</p>
                  <p className="text-xs text-red-500">Perlu perhatian</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Trends Analysis</TabsTrigger>
          <TabsTrigger value="students">Student Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {systemInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tren Bulanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemInsights.monthlyTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{trend.month}</p>
                          <p className="text-sm text-gray-500">{trend.newEnrollments} santri baru</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Kehadiran: {trend.attendance}%</p>
                          <p className="text-sm">Nilai: {trend.performance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Distribusi Performa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Excellent (85-100)</span>
                      </div>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Good (70-84)</span>
                      </div>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Average (60-69)</span>
                      </div>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Needs Improvement (&lt;60)</span>
                      </div>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {systemInsights && (
            <div className="space-y-4">
              {systemInsights.alerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Zap className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Semua Baik!</h3>
                    <p className="text-gray-600">Tidak ada alert yang memerlukan perhatian saat ini.</p>
                  </CardContent>
                </Card>
              ) : (
                systemInsights.alerts.map((alert, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{alert.message}</h4>
                            <Badge variant={getAlertColor(alert.severity) as any}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Tipe: {alert.type} • Jumlah: {alert.count}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Tren Mendalam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analisis Tren AI</h3>
                <p className="text-gray-600 mb-4">
                  Fitur analisis tren mendalam sedang dalam pengembangan
                </p>
                <Button variant="outline">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insights Individual Santri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Student Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Pilih santri dari dashboard untuk melihat insights individual
                </p>
                <Button variant="outline">
                  Lihat Daftar Santri
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
