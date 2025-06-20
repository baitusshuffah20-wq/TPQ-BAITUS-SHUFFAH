'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CharacterGoalForm from '@/components/behavior/CharacterGoalForm';
import {
  Target,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Star,
  BarChart3,
  Download,
  User,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  CharacterGoal,
  BehaviorCategory,
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
  formatBehaviorDate
} from '@/lib/behavior-data';

export default function CharacterGoalsPage() {
  const [goals, setGoals] = useState<CharacterGoal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<CharacterGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<CharacterGoal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for character goals
  const mockGoals: CharacterGoal[] = [
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
    },
    {
      id: 'goal_2',
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      title: 'Mengembangkan Kepemimpinan',
      description: 'Program pengembangan jiwa kepemimpinan dan tanggung jawab',
      category: 'LEADERSHIP',
      targetBehaviors: ['Memimpin doa bersama', 'Membantu mengatur teman', 'Menjadi contoh yang baik'],
      targetDate: '2024-04-30',
      startDate: '2024-02-01',
      status: 'ACTIVE',
      progress: 65,
      milestones: [
        {
          id: 'milestone_4',
          title: 'Memimpin doa pembuka',
          description: 'Memimpin doa pembuka pembelajaran selama 1 minggu',
          targetDate: '2024-02-15',
          isCompleted: true,
          completedAt: '2024-02-15T07:30:00Z',
          evidence: 'Berhasil memimpin doa dengan khusyuk dan lantang'
        },
        {
          id: 'milestone_5',
          title: 'Menjadi ketua kelompok',
          description: 'Memimpin kelompok kecil dalam kegiatan hafalan',
          targetDate: '2024-03-01',
          isCompleted: true,
          completedAt: '2024-02-28T09:00:00Z',
          evidence: 'Kelompok menunjukkan peningkatan hafalan yang signifikan'
        },
        {
          id: 'milestone_6',
          title: 'Mentoring santri junior',
          description: 'Membimbing santri baru dalam adaptasi di TPQ',
          targetDate: '2024-04-15',
          isCompleted: false
        }
      ],
      createdBy: 'musyrif_1',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-28T15:20:00Z',
      parentInvolved: true,
      musyrifNotes: 'Ahmad menunjukkan potensi kepemimpinan yang baik. Perlu diberi tanggung jawab lebih.',
      parentFeedback: 'Ahmad di rumah juga mulai membantu mengatur adik-adiknya. Alhamdulillah.'
    },
    {
      id: 'goal_3',
      santriId: 'santri_2',
      santriName: 'Siti Aisyah',
      title: 'Meningkatkan Hafalan Al-Quran',
      description: 'Target hafalan 2 surah baru dalam 3 bulan',
      category: 'IBADAH',
      targetBehaviors: ['Hafalan harian 5 ayat', 'Muroja\'ah rutin', 'Tartil yang baik'],
      targetDate: '2024-05-31',
      startDate: '2024-03-01',
      status: 'ACTIVE',
      progress: 25,
      milestones: [
        {
          id: 'milestone_7',
          title: 'Hafal Surah Al-Mulk',
          description: 'Menghafal Surah Al-Mulk dengan lancar dan tartil',
          targetDate: '2024-04-15',
          isCompleted: false
        },
        {
          id: 'milestone_8',
          title: 'Hafal Surah Ar-Rahman',
          description: 'Menghafal Surah Ar-Rahman dengan lancar dan tartil',
          targetDate: '2024-05-31',
          isCompleted: false
        }
      ],
      createdBy: 'musyrif_1',
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-15T11:45:00Z',
      parentInvolved: true,
      musyrifNotes: 'Aisyah sangat rajin dalam hafalan. Perlu dijaga konsistensinya.',
      parentFeedback: 'Di rumah Aisyah selalu muroja\'ah setelah maghrib. Semangat sekali.'
    },
    {
      id: 'goal_4',
      santriId: 'santri_4',
      santriName: 'Fatimah Zahra',
      title: 'Meningkatkan Interaksi Sosial',
      description: 'Program untuk meningkatkan kepercayaan diri dan interaksi dengan teman',
      category: 'SOCIAL',
      targetBehaviors: ['Aktif dalam diskusi', 'Membantu teman', 'Berani bertanya'],
      targetDate: '2024-06-30',
      startDate: '2024-03-01',
      status: 'ACTIVE',
      progress: 15,
      milestones: [
        {
          id: 'milestone_9',
          title: 'Bertanya minimal 1x per hari',
          description: 'Berani mengajukan pertanyaan saat pembelajaran',
          targetDate: '2024-04-01',
          isCompleted: false
        },
        {
          id: 'milestone_10',
          title: 'Presentasi di depan kelas',
          description: 'Mempresentasikan hafalan di depan teman-teman',
          targetDate: '2024-05-15',
          isCompleted: false
        }
      ],
      createdBy: 'musyrif_1',
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-10T14:30:00Z',
      parentInvolved: true,
      musyrifNotes: 'Fatimah perlu dorongan untuk lebih percaya diri. Potensinya sangat baik.',
      parentFeedback: 'Di rumah Fatimah masih pemalu. Mohon bimbingannya di TPQ.'
    }
  ];

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    filterGoals();
  }, [goals, searchTerm, statusFilter, categoryFilter]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGoals(mockGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Gagal memuat data goal');
    } finally {
      setLoading(false);
    }
  };

  const filterGoals = () => {
    let filtered = goals;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(goal =>
        goal.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(goal => goal.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(goal => goal.category === categoryFilter);
    }

    setFilteredGoals(filtered);
  };

  const handleSaveGoal = (goalData: Partial<CharacterGoal>) => {
    if (editingGoal) {
      // Update existing goal
      setGoals(prev => prev.map(goal =>
        goal.id === editingGoal.id ? { ...goal, ...goalData } : goal
      ));
    } else {
      // Add new goal
      const newGoal: CharacterGoal = {
        ...goalData as CharacterGoal,
        id: `goal_${Date.now()}`
      };
      setGoals(prev => [...prev, newGoal]);
    }
    setEditingGoal(null);
  };

  const handleEditGoal = (goal: CharacterGoal) => {
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  const getStatusColor = (status: CharacterGoal['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: CharacterGoal['status']) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'COMPLETED': return 'Selesai';
      case 'PAUSED': return 'Ditunda';
      case 'CANCELLED': return 'Dibatalkan';
      default: return status;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 60) return 'bg-blue-600';
    if (progress >= 40) return 'bg-yellow-600';
    if (progress >= 20) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const completedMilestones = (milestones: CharacterGoal['milestones']) => {
    return milestones.filter(m => m.isCompleted).length;
  };

  const goalStats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'ACTIVE').length,
    completed: goals.filter(g => g.status === 'COMPLETED').length,
    averageProgress: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goal Pengembangan Karakter</h1>
            <p className="text-gray-600">Kelola dan pantau goal pengembangan karakter santri</p>
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
            <Button onClick={() => setShowGoalForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Goal Baru
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Goal</p>
                  <p className="text-2xl font-bold text-gray-900">{goalStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Goal Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{goalStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Award className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Goal Selesai</p>
                  <p className="text-2xl font-bold text-teal-600">{goalStats.completed}</p>
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
                  <p className="text-2xl font-bold text-purple-600">{goalStats.averageProgress}%</p>
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
                    placeholder="Cari goal atau santri..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="PAUSED">Ditunda</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="AKHLAQ">Akhlaq</option>
                  <option value="IBADAH">Ibadah</option>
                  <option value="ACADEMIC">Akademik</option>
                  <option value="SOCIAL">Sosial</option>
                  <option value="DISCIPLINE">Disiplin</option>
                  <option value="LEADERSHIP">Kepemimpinan</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => (
            <Card key={goal.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <p className="text-sm text-gray-600">{goal.santriName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getBehaviorCategoryColor(goal.category)}`}>
                      {getBehaviorCategoryText(goal.category)}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(goal.status)}`}>
                      {getStatusText(goal.status)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-gray-900">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600">{goal.description}</p>

                {/* Milestones */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Milestone Progress</h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">
                      {completedMilestones(goal.milestones)} dari {goal.milestones.length} milestone selesai
                    </span>
                  </div>
                </div>

                {/* Target Date */}
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">
                    Target: {formatBehaviorDate(goal.targetDate)}
                  </span>
                </div>

                {/* Parent Involvement */}
                {goal.parentInvolved && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600">Melibatkan orang tua</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Detail
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditGoal(goal)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada goal</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Tidak ada goal yang sesuai dengan filter'
                : 'Belum ada goal karakter yang dibuat'
              }
            </p>
            <Button onClick={() => setShowGoalForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Goal Pertama
            </Button>
          </div>
        )}

        {/* Goal Form Modal */}
        <CharacterGoalForm
          isOpen={showGoalForm}
          onClose={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
          onSave={handleSaveGoal}
          editData={editingGoal}
        />
      </div>
    </DashboardLayout>
  );
}
