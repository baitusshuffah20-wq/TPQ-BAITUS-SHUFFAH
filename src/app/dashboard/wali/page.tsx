'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import {
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  Heart,
  Target,
  Eye,
  MessageSquare,
  Bell,
  Star,
  BarChart3,
  Activity,
  Send,
  Phone,
  Mail,
  Home,
  School
} from 'lucide-react';

const WaliDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChild, setSelectedChild] = useState('1');

  // Check authentication and role
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user.role !== 'WALI') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user is not wali, don't render anything (redirect will happen)
  if (status === 'authenticated' && session?.user.role !== 'WALI') {
    return null;
  }

  // Mock data for Wali
  const children = [
    {
      id: '1',
      name: 'Ahmad Fauzi',
      nis: '24001',
      halaqah: 'Halaqah Al-Fatihah',
      musyrif: 'Ustadz Abdullah',
      progress: 75, // percentage of Quran memorized
      lastHafalan: 'Al-Baqarah 1-10',
      attendanceRate: 95,
      photo: null
    }
  ];

  const recentHafalan = [
    {
      id: 1,
      surah: 'Al-Baqarah',
      ayah: '1-10',
      status: 'APPROVED',
      grade: 85,
      date: '2024-02-10',
      musyrif: 'Ustadz Abdullah'
    },
    {
      id: 2,
      surah: 'Al-Baqarah',
      ayah: '11-20',
      status: 'PENDING',
      grade: null,
      date: '2024-02-11',
      musyrif: 'Ustadz Abdullah'
    },
    {
      id: 3,
      surah: 'Al-Fatihah',
      ayah: '1-7',
      status: 'APPROVED',
      grade: 90,
      date: '2024-02-08',
      musyrif: 'Ustadz Abdullah'
    }
  ];

  const payments = [
    {
      id: '1',
      type: 'SPP',
      amount: 500000,
      dueDate: '2024-02-15',
      status: 'PENDING'
    },
    {
      id: '2',
      type: 'SPP',
      amount: 500000,
      dueDate: '2024-01-15',
      paidDate: '2024-01-10',
      status: 'PAID'
    },
    {
      id: '3',
      type: 'BOOK',
      amount: 200000,
      dueDate: '2024-02-20',
      status: 'PENDING'
    }
  ];

  const recentAttendance = [
    { date: '2024-02-12', status: 'PRESENT' },
    { date: '2024-02-11', status: 'PRESENT' },
    { date: '2024-02-10', status: 'LATE' },
    { date: '2024-02-09', status: 'PRESENT' },
    { date: '2024-02-08', status: 'PRESENT' }
  ];

  // Parent Collaboration Data
  const behaviorSummary = {
    totalRecords: 18,
    positiveCount: 15,
    negativeCount: 3,
    behaviorScore: 85,
    characterGrade: 'B+',
    strengths: [
      'Sangat jujur dalam berkata dan bertindak',
      'Rajin melaksanakan shalat berjamaah',
      'Aktif membantu teman yang kesulitan'
    ],
    areasForImprovement: [
      'Perlu meningkatkan kedisiplinan waktu',
      'Lebih aktif dalam bertanya saat pembelajaran'
    ]
  };

  const activeGoals = [
    {
      id: 'goal_1',
      title: 'Mengembangkan Kepemimpinan',
      description: 'Program pengembangan jiwa kepemimpinan dan tanggung jawab',
      category: 'LEADERSHIP',
      progress: 65,
      targetDate: '2024-04-30',
      milestones: 3,
      completedMilestones: 2
    }
  ];

  const recentActivities = [
    {
      id: 'activity_1',
      type: 'BEHAVIOR_POSITIVE',
      title: 'Perilaku Positif',
      description: 'Ahmad membantu teman yang kesulitan membaca Al-Quran',
      date: '2024-02-12',
      time: '09:15:00',
      points: 4,
      musyrifName: 'Ustadz Abdullah'
    },
    {
      id: 'activity_2',
      type: 'GOAL_PROGRESS',
      title: 'Progress Goal',
      description: 'Milestone "Memimpin doa pembuka" berhasil diselesaikan',
      date: '2024-02-11',
      time: '08:00:00',
      points: 5,
      musyrifName: 'Ustadz Abdullah'
    },
    {
      id: 'activity_3',
      type: 'ACHIEVEMENT',
      title: 'Pencapaian',
      description: 'Mendapat penghargaan "Santri Teladan Minggu Ini"',
      date: '2024-02-10',
      time: '10:00:00',
      points: 10,
      musyrifName: 'Ustadz Abdullah'
    }
  ];

  const messages = [
    {
      id: 'msg_1',
      from: 'Ustadz Abdullah',
      subject: 'Progress Ahmad Minggu Ini',
      message: 'Assalamu\'alaikum. Ahmad menunjukkan perkembangan yang sangat baik minggu ini. Dia aktif membantu teman dan rajin dalam hafalan.',
      date: '2024-02-12',
      time: '15:30:00',
      isRead: false,
      type: 'PROGRESS_UPDATE'
    },
    {
      id: 'msg_2',
      from: 'Admin TPQ',
      subject: 'Undangan Pertemuan Wali',
      message: 'Kami mengundang Bapak/Ibu untuk menghadiri pertemuan wali santri pada Sabtu, 17 Februari 2024 pukul 09:00 WIB.',
      date: '2024-02-11',
      time: '10:00:00',
      isRead: true,
      type: 'ANNOUNCEMENT'
    }
  ];

  const unreadMessages = messages.filter(m => !m.isRead).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'NEEDS_IMPROVEMENT':
      case 'OVERDUE':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'LATE':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'NEEDS_IMPROVEMENT':
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'LATE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const child = children[0]; // For demo, we'll show data for one child

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Wali Santri
            </h1>
            <p className="text-gray-600">
              Selamat datang kembali, {session?.user.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {unreadMessages > 0 && (
              <div className="relative">
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifikasi
                </Button>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              </div>
            )}
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Hubungi Musyrif
            </Button>
          </div>
        </div>

        {/* Child Profile Card */}
        <Card className="bg-gradient-to-r from-teal-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                <p className="text-gray-600">NIS: {child.nis}</p>
                <p className="text-sm text-gray-500">{child.halaqah} • {child.musyrif}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">{child.progress}%</div>
                <div className="text-sm text-gray-500">Progress Hafalan</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{child.attendanceRate}%</div>
                <div className="text-xs text-gray-500">Kehadiran</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">15</div>
                <div className="text-xs text-gray-500">Juz Selesai</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">A</div>
                <div className="text-xs text-gray-500">Rata-rata Nilai</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Hafalan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-teal-600" />
                  Hafalan Terbaru
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat Semua
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentHafalan.map((hafalan) => (
                  <div key={hafalan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {hafalan.surah} ayat {hafalan.ayah}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(hafalan.date).toLocaleDateString('id-ID')} • {hafalan.musyrif}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hafalan.grade && (
                        <span className="text-sm font-medium text-gray-900">
                          {hafalan.grade}
                        </span>
                      )}
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(hafalan.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hafalan.status)}`}>
                          {hafalan.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                  Kehadiran Terbaru
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat Semua
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAttendance.map((attendance, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(attendance.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(attendance.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                        {attendance.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-teal-600" />
                Status Pembayaran
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Lihat Semua
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {payment.type}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Jatuh tempo: {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                      {payment.paidDate && (
                        <span> • Dibayar: {new Date(payment.paidDate).toLocaleDateString('id-ID')}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    {payment.status === 'PENDING' && (
                      <Button size="sm">
                        Bayar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Ringkasan', icon: BarChart3 },
              { id: 'behavior', name: 'Perilaku', icon: Heart },
              { id: 'goals', name: 'Goal Karakter', icon: Target },
              { id: 'activities', name: 'Aktivitas', icon: Activity },
              { id: 'messages', name: 'Pesan', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {tab.id === 'messages' && unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
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
                      <div className="text-lg font-bold text-green-600">{behaviorSummary.positiveCount}</div>
                      <div className="text-xs text-gray-600">Positif</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">{behaviorSummary.negativeCount}</div>
                      <div className="text-xs text-gray-600">Negatif</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{behaviorSummary.behaviorScore}</div>
                      <div className="text-xs text-gray-600">Skor</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Kekuatan:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {behaviorSummary.strengths.slice(0, 2).map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Area Pengembangan:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {behaviorSummary.areasForImprovement.map((area, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Active Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Goal Karakter Aktif</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeGoals.map((goal) => (
                    <div key={goal.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <span className="px-2 py-1 text-xs font-medium rounded-full text-purple-600 bg-purple-100">
                          {goal.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-900">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Target: {goal.targetDate}</span>
                        <span>{goal.completedMilestones}/{goal.milestones} milestone</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'activities' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Aktivitas Terbaru</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="p-2 rounded-lg bg-blue-100">
                        {activity.type === 'BEHAVIOR_POSITIVE' && <Heart className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'GOAL_PROGRESS' && <Target className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'ACHIEVEMENT' && <Award className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <span className="text-sm font-medium text-green-600">+{activity.points} poin</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <span>{activity.date}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                          <span>•</span>
                          <span>{activity.musyrifName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'messages' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span>Pesan dari TPQ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg ${
                        message.isRead ? 'border-gray-200 bg-white' : 'border-teal-200 bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{message.subject}</h4>
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {message.date} {message.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Dari: {message.from}</p>
                      <p className="text-sm text-gray-700">{message.message}</p>
                      <div className="flex space-x-2 mt-3">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Balas
                        </Button>
                        {!message.isRead && (
                          <Button variant="outline" size="sm">
                            Tandai Dibaca
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WaliDashboard;
