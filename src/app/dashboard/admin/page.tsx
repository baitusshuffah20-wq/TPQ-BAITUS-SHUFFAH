'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSession } from 'next-auth/react';
import {
  Users,
  GraduationCap,
  Heart,
  TrendingUp,
  Calendar,
  CreditCard,
  BookOpen,
  Award,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication and role
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/admin');
        const data = await response.json();

        if (data.success) {
          setDashboardData(data.data);
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');

        // Fallback data
        setDashboardData({
          stats: [
            {
              title: 'Total Santri',
              value: '250',
              change: '+12%',
              changeType: 'increase',
              icon: 'Users',
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              title: 'Total Musyrif',
              value: '15',
              change: '+2%',
              changeType: 'increase',
              icon: 'GraduationCap',
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            {
              title: 'Total Donasi',
              value: 'Rp 25.5jt',
              change: '+8%',
              changeType: 'increase',
              icon: 'Heart',
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            }
          ],
          recentActivities: [],
          upcomingEvents: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session) {
      fetchDashboardData();
    }
  }, [session, status]);

  if (status === 'loading' || loading) {
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

  // If user is not admin, don't render anything (redirect will happen)
  if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
    return null;
  }

  // Icon mapping
  const iconMap: Record<string, React.ElementType> = {
    Users,
    GraduationCap,
    Heart,
    CreditCard,
    BookOpen,
    Calendar,
    Award,
    TrendingUp
  };

  const stats = dashboardData?.stats || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Admin
          </h1>
          <p className="text-gray-600">
            Selamat datang kembali, {session?.user.name}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <p className="text-red-500 text-sm">Menampilkan data fallback</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat: any) => {
            const Icon = iconMap[stat.icon] || Users;
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
                      <div className="flex items-center mt-2">
                        {stat.changeType === 'increase' ? (
                          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          dari bulan lalu
                        </span>
                      </div>
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
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? recentActivities.map((activity: any) => {
                  const Icon = iconMap[activity.icon] || CreditCard;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full bg-gray-50`}>
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada aktivitas terbaru</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                Kegiatan Mendatang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('id-ID')} • {event.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-teal-600">
                        {event.participants}
                      </p>
                      <p className="text-xs text-gray-500">
                        peserta
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada kegiatan mendatang</p>
                  </div>
                )}
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
                <Users className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-teal-900">
                  Tambah Santri
                </span>
              </button>
              
              <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">
                  Buat Halaqah
                </span>
              </button>
              
              <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">
                  Kelola Pembayaran
                </span>
              </button>
              
              <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">
                  Lihat Laporan
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
