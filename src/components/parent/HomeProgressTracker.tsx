'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Home,
  Plus,
  CheckCircle,
  Clock,
  Star,
  Heart,
  BookOpen,
  Target,
  Calendar,
  Save,
  Edit,
  Trash2,
  Award,
  TrendingUp,
  Activity,
  MessageSquare,
  Send,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HomeActivity {
  id: string;
  santriId: string;
  date: string;
  time: string;
  activity: string;
  category: 'IBADAH' | 'HAFALAN' | 'AKHLAQ' | 'ACADEMIC' | 'CHORES' | 'SOCIAL';
  description: string;
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_IMPROVEMENT';
  points: number;
  isCompleted: boolean;
  parentNotes?: string;
  evidence?: {
    type: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'NOTE';
    url?: string;
    description: string;
  };
  sharedWithTPQ: boolean;
  musyrifFeedback?: string;
}

interface HomeGoal {
  id: string;
  santriId: string;
  title: string;
  description: string;
  category: 'IBADAH' | 'HAFALAN' | 'AKHLAQ' | 'ACADEMIC' | 'CHORES' | 'SOCIAL';
  targetDate: string;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  progress: number;
  dailyTarget: string;
  weeklyTarget: string;
  parentNotes: string;
  isSharedWithTPQ: boolean;
}

interface HomeProgressTrackerProps {
  santriId: string;
  santriName: string;
}

export default function HomeProgressTracker({
  santriId,
  santriName
}: HomeProgressTrackerProps) {
  const [activities, setActivities] = useState<HomeActivity[]>([]);
  const [homeGoals, setHomeGoals] = useState<HomeGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('today');

  // Mock data
  const mockActivities: HomeActivity[] = [
    {
      id: 'home_act_1',
      santriId,
      date: selectedDate,
      time: '05:30',
      activity: 'Shalat Subuh Berjamaah',
      category: 'IBADAH',
      description: 'Shalat subuh berjamaah dengan ayah di musholla rumah',
      quality: 'EXCELLENT',
      points: 5,
      isCompleted: true,
      parentNotes: 'Ahmad bangun sendiri tanpa dibangunkan',
      evidence: {
        type: 'NOTE',
        description: 'Bangun sendiri pukul 05:15, shalat dengan khusyuk'
      },
      sharedWithTPQ: true,
      musyrifFeedback: 'Alhamdulillah, semangat Ahmad dalam ibadah sangat baik'
    },
    {
      id: 'home_act_2',
      santriId,
      date: selectedDate,
      time: '06:00',
      activity: 'Muroja\'ah Hafalan',
      category: 'HAFALAN',
      description: 'Muroja\'ah Surah Al-Mulk ayat 1-15',
      quality: 'GOOD',
      points: 4,
      isCompleted: true,
      parentNotes: 'Masih ada 2 ayat yang perlu diperbaiki',
      evidence: {
        type: 'AUDIO',
        description: 'Rekaman muroja\'ah 15 menit'
      },
      sharedWithTPQ: true
    },
    {
      id: 'home_act_3',
      santriId,
      date: selectedDate,
      time: '19:30',
      activity: 'Membantu Adik Belajar',
      category: 'AKHLAQ',
      description: 'Membantu adik mengerjakan PR matematika',
      quality: 'EXCELLENT',
      points: 4,
      isCompleted: true,
      parentNotes: 'Ahmad sangat sabar mengajari adiknya',
      evidence: {
        type: 'NOTE',
        description: 'Mengajari dengan sabar selama 30 menit'
      },
      sharedWithTPQ: false
    },
    {
      id: 'home_act_4',
      santriId,
      date: selectedDate,
      time: '20:00',
      activity: 'Shalat Maghrib Berjamaah',
      category: 'IBADAH',
      description: 'Shalat maghrib berjamaah dengan keluarga',
      quality: 'GOOD',
      points: 3,
      isCompleted: true,
      parentNotes: 'Shalat dengan tertib',
      sharedWithTPQ: false
    }
  ];

  const mockHomeGoals: HomeGoal[] = [
    {
      id: 'home_goal_1',
      santriId,
      title: 'Shalat 5 Waktu Tepat Waktu',
      description: 'Melaksanakan shalat 5 waktu tepat waktu tanpa diingatkan',
      category: 'IBADAH',
      targetDate: '2024-03-31',
      startDate: '2024-02-01',
      status: 'ACTIVE',
      progress: 75,
      dailyTarget: 'Shalat 5 waktu tepat waktu',
      weeklyTarget: 'Tidak terlambat shalat lebih dari 1x dalam seminggu',
      parentNotes: 'Ahmad sudah sangat baik, hanya kadang terlambat shalat Ashar',
      isSharedWithTPQ: true
    },
    {
      id: 'home_goal_2',
      santriId,
      title: 'Muroja\'ah Harian 30 Menit',
      description: 'Muroja\'ah hafalan setiap hari minimal 30 menit',
      category: 'HAFALAN',
      targetDate: '2024-04-30',
      startDate: '2024-02-01',
      status: 'ACTIVE',
      progress: 60,
      dailyTarget: 'Muroja\'ah 30 menit setelah Maghrib',
      weeklyTarget: 'Konsisten 6 dari 7 hari dalam seminggu',
      parentNotes: 'Perlu diingatkan untuk konsisten, kadang lupa karena main',
      isSharedWithTPQ: true
    },
    {
      id: 'home_goal_3',
      santriId,
      title: 'Membantu Pekerjaan Rumah',
      description: 'Membantu orang tua dalam pekerjaan rumah setiap hari',
      category: 'AKHLAQ',
      targetDate: '2024-06-30',
      startDate: '2024-02-01',
      status: 'ACTIVE',
      progress: 80,
      dailyTarget: 'Membantu minimal 1 pekerjaan rumah',
      weeklyTarget: 'Inisiatif membantu tanpa diminta minimal 3x',
      parentNotes: 'Ahmad sangat membantu, terutama mengurus adik',
      isSharedWithTPQ: false
    }
  ];

  useEffect(() => {
    loadHomeProgress();
  }, [selectedDate]);

  const loadHomeProgress = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivities(mockActivities);
      setHomeGoals(mockHomeGoals);
    } catch (error) {
      console.error('Error loading home progress:', error);
      toast.error('Gagal memuat data progress rumah');
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (activityData: Partial<HomeActivity>) => {
    const newActivity: HomeActivity = {
      id: `home_act_${Date.now()}`,
      santriId,
      date: selectedDate,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      isCompleted: true,
      points: 3,
      sharedWithTPQ: false,
      ...activityData as HomeActivity
    };
    setActivities(prev => [newActivity, ...prev]);
    toast.success('Aktivitas berhasil ditambahkan!');
  };

  const shareWithTPQ = (activityId: string) => {
    setActivities(prev => prev.map(activity =>
      activity.id === activityId ? { ...activity, sharedWithTPQ: true } : activity
    ));
    toast.success('Aktivitas berhasil dibagikan ke TPQ!');
  };

  const getCategoryColor = (category: HomeActivity['category']) => {
    switch (category) {
      case 'IBADAH': return 'text-green-600 bg-green-100';
      case 'HAFALAN': return 'text-blue-600 bg-blue-100';
      case 'AKHLAQ': return 'text-purple-600 bg-purple-100';
      case 'ACADEMIC': return 'text-yellow-600 bg-yellow-100';
      case 'CHORES': return 'text-orange-600 bg-orange-100';
      case 'SOCIAL': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryText = (category: HomeActivity['category']) => {
    switch (category) {
      case 'IBADAH': return 'Ibadah';
      case 'HAFALAN': return 'Hafalan';
      case 'AKHLAQ': return 'Akhlaq';
      case 'ACADEMIC': return 'Akademik';
      case 'CHORES': return 'Pekerjaan Rumah';
      case 'SOCIAL': return 'Sosial';
      default: return category;
    }
  };

  const getQualityColor = (quality: HomeActivity['quality']) => {
    switch (quality) {
      case 'EXCELLENT': return 'text-green-600 bg-green-100';
      case 'GOOD': return 'text-blue-600 bg-blue-100';
      case 'FAIR': return 'text-yellow-600 bg-yellow-100';
      case 'NEEDS_IMPROVEMENT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityText = (quality: HomeActivity['quality']) => {
    switch (quality) {
      case 'EXCELLENT': return 'Sangat Baik';
      case 'GOOD': return 'Baik';
      case 'FAIR': return 'Cukup';
      case 'NEEDS_IMPROVEMENT': return 'Perlu Perbaikan';
      default: return quality;
    }
  };

  const todayActivities = activities.filter(a => a.date === selectedDate);
  const todayPoints = todayActivities.reduce((sum, a) => sum + a.points, 0);
  const completedActivities = todayActivities.filter(a => a.isCompleted).length;

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
          <h2 className="text-2xl font-bold text-gray-900">Progress di Rumah - {santriName}</h2>
          <p className="text-gray-600">Pantau dan catat aktivitas positif anak di rumah</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowGoalForm(true)}>
            <Target className="h-4 w-4 mr-2" />
            Buat Goal Rumah
          </Button>
          <Button onClick={() => setShowActivityForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Catat Aktivitas
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Tanggal:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktivitas Selesai</p>
                <p className="text-2xl font-bold text-green-600">{completedActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Poin Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">{todayPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Goal Aktif</p>
                <p className="text-2xl font-bold text-purple-600">{homeGoals.filter(g => g.status === 'ACTIVE').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'today', name: 'Aktivitas Hari Ini', icon: Activity },
            { id: 'goals', name: 'Goal Rumah', icon: Target },
            { id: 'summary', name: 'Ringkasan Mingguan', icon: BarChart3 }
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'today' && (
          <div className="space-y-4">
            {todayActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada aktivitas hari ini</h3>
                <p className="text-gray-600 mb-6">Mulai catat aktivitas positif anak di rumah</p>
                <Button onClick={() => setShowActivityForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Catat Aktivitas Pertama
                </Button>
              </div>
            ) : (
              todayActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{activity.activity}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(activity.category)}`}>
                            {getCategoryText(activity.category)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityColor(activity.quality)}`}>
                            {getQualityText(activity.quality)}
                          </span>
                          <span className="text-sm font-medium text-green-600">+{activity.points} poin</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Waktu: {activity.time}</span>
                          {activity.evidence && (
                            <span>Bukti: {activity.evidence.description}</span>
                          )}
                        </div>
                        {activity.parentNotes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Catatan:</strong> {activity.parentNotes}
                          </div>
                        )}
                        {activity.musyrifFeedback && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            <strong>Feedback Musyrif:</strong> {activity.musyrifFeedback}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {activity.sharedWithTPQ ? (
                          <span className="flex items-center space-x-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Dibagikan</span>
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareWithTPQ(activity.id)}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Bagikan ke TPQ
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {homeGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(goal.category)}`}>
                      {getCategoryText(goal.category)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{goal.description}</p>
                  
                  <div>
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
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Target Harian:</strong> {goal.dailyTarget}
                    </div>
                    <div>
                      <strong>Target Mingguan:</strong> {goal.weeklyTarget}
                    </div>
                    <div>
                      <strong>Target Selesai:</strong> {goal.targetDate}
                    </div>
                  </div>

                  {goal.parentNotes && (
                    <div className="p-3 bg-blue-50 rounded text-sm">
                      <strong>Catatan Orang Tua:</strong> {goal.parentNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {goal.isSharedWithTPQ ? (
                        <span className="flex items-center space-x-1 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Dibagikan ke TPQ</span>
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Belum dibagikan</span>
                      )}
                    </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
