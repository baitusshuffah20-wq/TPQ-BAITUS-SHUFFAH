'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSession } from 'next-auth/react';
import {
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

const MusyrifDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check authentication and role
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user.role !== 'MUSYRIF') {
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

  // If user is not musyrif, don't render anything (redirect will happen)
  if (status === 'authenticated' && session?.user.role !== 'MUSYRIF') {
    return null;
  }

  // Mock data for Musyrif
  const stats = [
    {
      title: 'Santri Binaan',
      value: '25',
      change: '+2',
      changeType: 'increase',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Halaqah Aktif',
      value: '3',
      change: '0',
      changeType: 'stable',
      icon: BookOpen,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Hafalan Selesai Bulan Ini',
      value: '12',
      change: '+4',
      changeType: 'increase',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tingkat Kehadiran',
      value: '92%',
      change: '+3%',
      changeType: 'increase',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const recentHafalan = [
    {
      id: 1,
      santriName: 'Ahmad Fauzi',
      surah: 'Al-Baqarah',
      ayah: '1-10',
      status: 'APPROVED',
      grade: 85,
      date: '2024-02-10'
    },
    {
      id: 2,
      santriName: 'Siti Aisyah',
      surah: 'Ali Imran',
      ayah: '1-20',
      status: 'PENDING',
      grade: null,
      date: '2024-02-11'
    },
    {
      id: 3,
      santriName: 'Muhammad Rizki',
      surah: 'An-Nisa',
      ayah: '1-15',
      status: 'NEEDS_IMPROVEMENT',
      grade: 65,
      date: '2024-02-09'
    }
  ];

  const todaySchedule = [
    {
      id: 1,
      time: '08:00 - 09:30',
      halaqah: 'Halaqah Al-Fatihah',
      location: 'Ruang A',
      participants: 8
    },
    {
      id: 2,
      time: '10:00 - 11:30',
      halaqah: 'Halaqah Al-Baqarah',
      location: 'Ruang B',
      participants: 10
    },
    {
      id: 3,
      time: '14:00 - 15:30',
      halaqah: 'Halaqah Ali Imran',
      location: 'Ruang C',
      participants: 7
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'NEEDS_IMPROVEMENT':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'NEEDS_IMPROVEMENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Musyrif
          </h1>
          <p className="text-gray-600">
            Selamat datang kembali, {session?.user.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      {stat.change !== '0' && (
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            dari bulan lalu
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Hafalan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-teal-600" />
                Hafalan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentHafalan.map((hafalan) => (
                  <div key={hafalan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {hafalan.santriName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {hafalan.surah} ayat {hafalan.ayah}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(hafalan.date).toLocaleDateString('id-ID')}
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

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                Jadwal Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {schedule.halaqah}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {schedule.time} • {schedule.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-teal-600">
                        {schedule.participants}
                      </p>
                      <p className="text-xs text-gray-500">
                        santri
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 text-center bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                <GraduationCap className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-teal-900">
                  Input Hafalan
                </span>
              </button>
              
              <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">
                  Absensi
                </span>
              </button>
              
              <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">
                  Kelola Santri
                </span>
              </button>
              
              <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">
                  Target Hafalan
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MusyrifDashboard;
