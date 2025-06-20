'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PaymentChart, {
  generatePaymentRevenueData,
  generatePaymentStatusData,
  generatePaymentTypeData,
  generateWeeklyTrendData
} from '@/components/charts/PaymentChart';
import AttendanceChart, {
  generateWeeklyAttendanceData,
  generateMonthlyAttendanceTrend,
  generateAttendanceStatusData,
  generateClassAttendanceData
} from '@/components/charts/AttendanceChart';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  GraduationCap, 
  DollarSign,
  Calendar,
  BookOpen,
  Award,
  Target,
  Activity,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const AnalyticsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
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

  // Mock data for analytics
  const monthlyStats = [
    { month: 'Jan', santri: 45, hafalan: 120, pembayaran: 22500000, kehadiran: 92 },
    { month: 'Feb', santri: 48, hafalan: 135, pembayaran: 24000000, kehadiran: 94 },
    { month: 'Mar', santri: 52, hafalan: 148, pembayaran: 26000000, kehadiran: 91 },
    { month: 'Apr', santri: 55, hafalan: 162, pembayaran: 27500000, kehadiran: 93 },
    { month: 'May', santri: 58, hafalan: 175, pembayaran: 29000000, kehadiran: 95 },
    { month: 'Jun', santri: 62, hafalan: 188, pembayaran: 31000000, kehadiran: 96 }
  ];

  const hafalanProgress = [
    { surah: 'Al-Fatihah', completed: 58, total: 62, percentage: 94 },
    { surah: 'Al-Baqarah', completed: 35, total: 62, percentage: 56 },
    { surah: 'Ali Imran', completed: 28, total: 62, percentage: 45 },
    { surah: 'An-Nisa', completed: 22, total: 62, percentage: 35 },
    { surah: 'Al-Maidah', completed: 18, total: 62, percentage: 29 }
  ];

  const attendanceData = [
    { day: 'Sen', hadir: 55, terlambat: 3, tidak_hadir: 4 },
    { day: 'Sel', hadir: 58, terlambat: 2, tidak_hadir: 2 },
    { day: 'Rab', hadir: 56, terlambat: 4, tidak_hadir: 2 },
    { day: 'Kam', hadir: 59, terlambat: 1, tidak_hadir: 2 },
    { day: 'Jum', hadir: 57, terlambat: 3, tidak_hadir: 2 },
    { day: 'Sab', hadir: 60, terlambat: 1, tidak_hadir: 1 }
  ];

  const donationCategories = [
    { name: 'Donasi Umum', value: 45000000, color: '#0ea5e9' },
    { name: 'Pembangunan', value: 32000000, color: '#10b981' },
    { name: 'Beasiswa', value: 18000000, color: '#f59e0b' },
    { name: 'Peralatan', value: 12000000, color: '#ef4444' },
    { name: 'Program Khusus', value: 8000000, color: '#8b5cf6' }
  ];

  const performanceMetrics = [
    {
      title: 'Total Santri',
      value: '62',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Hafalan Selesai',
      value: '188',
      change: '+12.5%',
      trend: 'up',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pendapatan Bulan Ini',
      value: 'Rp 31M',
      change: '+6.8%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Tingkat Kehadiran',
      value: '96%',
      change: '+1.2%',
      trend: 'up',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const exportReport = () => {
    // Mock export functionality
    alert('Laporan akan didownload dalam format PDF');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Analisis mendalam performa rumah tahfidz
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
            >
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="90d">3 Bulan Terakhir</option>
              <option value="1y">1 Tahun Terakhir</option>
            </select>
            
            <Button variant="outline" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            const isPositive = metric.trend === 'up';
            
            return (
              <Card key={metric.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </p>
                      <div className="flex items-center mt-2">
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          vs bulan lalu
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-teal-600" />
                Pendapatan Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentChart
                type="bar"
                data={generatePaymentRevenueData([
                  { paymentDate: '2024-01-15', amount: 22500000, status: 'PAID' },
                  { paymentDate: '2024-02-15', amount: 24000000, status: 'PAID' },
                  { paymentDate: '2024-03-15', amount: 26000000, status: 'PAID' },
                  { paymentDate: '2024-04-15', amount: 27500000, status: 'PAID' },
                  { paymentDate: '2024-05-15', amount: 29000000, status: 'PAID' },
                  { paymentDate: '2024-06-15', amount: 31000000, status: 'PAID' }
                ])}
                height={300}
              />
            </CardContent>
          </Card>

          {/* Weekly Payment Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
                Tren Pembayaran Mingguan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentChart
                type="line"
                data={generateWeeklyTrendData([
                  { paymentDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), amount: 1500000, status: 'PAID' },
                  { paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), amount: 2200000, status: 'PAID' },
                  { paymentDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), amount: 1800000, status: 'PAID' },
                  { paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), amount: 2500000, status: 'PAID' },
                  { paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), amount: 1900000, status: 'PAID' },
                  { paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), amount: 2800000, status: 'PAID' },
                  { paymentDate: new Date().toISOString(), amount: 2100000, status: 'PAID' }
                ])}
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                Kehadiran Mingguan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceChart
                type="bar"
                data={generateWeeklyAttendanceData([
                  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'PRESENT' },
                  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'PRESENT' },
                  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'LATE' },
                  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'PRESENT' },
                  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'PRESENT' },
                  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'ABSENT' },
                  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'PRESENT' },
                  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'PRESENT' },
                  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'LATE' },
                  { date: new Date().toISOString(), status: 'PRESENT' }
                ])}
                height={300}
              />
            </CardContent>
          </Card>

          {/* Payment Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-teal-600" />
                Status Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentChart
                type="doughnut"
                data={generatePaymentStatusData([
                  { status: 'PAID', amount: 45000000 },
                  { status: 'PENDING', amount: 12000000 },
                  { status: 'OVERDUE', amount: 8000000 }
                ])}
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Hafalan Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
              Progress Hafalan per Surah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hafalanProgress.map((surah) => (
                <div key={surah.surah} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {surah.surah}
                      </span>
                      <span className="text-sm text-gray-500">
                        {surah.completed}/{surah.total} ({surah.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${surah.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Target Hafalan Bulan Ini
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    200
                  </p>
                  <p className="text-sm text-blue-700">
                    Progress: 188/200 (94%)
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Santri Berprestasi
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    15
                  </p>
                  <p className="text-sm text-green-700">
                    Nilai rata-rata ≥ 90
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Efisiensi Pembelajaran
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    87%
                  </p>
                  <p className="text-sm text-purple-700">
                    Berdasarkan kehadiran & nilai
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
