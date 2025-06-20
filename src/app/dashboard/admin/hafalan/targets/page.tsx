'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SetTargetModal from '@/components/modals/SetTargetModal';
import {
  Target,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Zap,
  Bell
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  HafalanTarget,
  getSurahById,
  getTargetStatusColor,
  getTargetStatusText,
  getPriorityColor,
  getPriorityText,
  getTargetTypeText,
  calculateTargetProgress,
  calculateDaysRemaining,
  isTargetOverdue
} from '@/lib/quran-data';

export default function HafalanTargetsPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<HafalanTarget[]>([]);
  const [filteredTargets, setFilteredTargets] = useState<HafalanTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<HafalanTarget | null>(null);
  const [editingTarget, setEditingTarget] = useState<HafalanTarget | null>(null);

  // Mock data
  const mockTargets: HafalanTarget[] = [
    {
      id: 'target_1',
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      surahId: 114,
      surahName: 'An-Nas',
      targetType: 'WEEKLY',
      targetAyahs: 6,
      completedAyahs: 6,
      targetDate: '2024-01-20T00:00:00Z',
      startDate: '2024-01-13T00:00:00Z',
      createdBy: 'admin_1',
      createdByName: 'Admin TPQ',
      createdAt: '2024-01-13T08:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      status: 'COMPLETED',
      progress: 100,
      priority: 'MEDIUM',
      description: 'Target hafalan surah An-Nas untuk pemula',
      notes: 'Santri sudah menguasai dengan baik',
      reminders: {
        enabled: true,
        frequency: 'DAILY',
        lastSent: '2024-01-15T07:00:00Z'
      },
      milestones: [
        { percentage: 25, achievedAt: '2024-01-14T09:00:00Z', reward: 'Sticker Bintang' },
        { percentage: 50, achievedAt: '2024-01-14T15:00:00Z', reward: 'Sertifikat Progress' },
        { percentage: 75, achievedAt: '2024-01-15T09:00:00Z', reward: 'Hadiah Kecil' },
        { percentage: 100, achievedAt: '2024-01-15T10:00:00Z', reward: 'Sertifikat Completion' }
      ]
    },
    {
      id: 'target_2',
      santriId: 'santri_2',
      santriName: 'Siti Aisyah',
      surahId: 112,
      surahName: 'Al-Ikhlas',
      targetType: 'WEEKLY',
      targetAyahs: 4,
      completedAyahs: 3,
      targetDate: '2024-01-25T00:00:00Z',
      startDate: '2024-01-18T00:00:00Z',
      createdBy: 'admin_1',
      createdByName: 'Admin TPQ',
      createdAt: '2024-01-18T08:00:00Z',
      updatedAt: '2024-01-20T14:00:00Z',
      status: 'ACTIVE',
      progress: 75,
      priority: 'HIGH',
      description: 'Target hafalan surah Al-Ikhlas',
      notes: 'Progress sangat baik, tinggal 1 ayat lagi',
      reminders: {
        enabled: true,
        frequency: 'DAILY'
      },
      milestones: [
        { percentage: 25, achievedAt: '2024-01-19T10:00:00Z', reward: 'Sticker Bintang' },
        { percentage: 50, achievedAt: '2024-01-19T16:00:00Z', reward: 'Sertifikat Progress' },
        { percentage: 75, achievedAt: '2024-01-20T14:00:00Z', reward: 'Hadiah Kecil' }
      ]
    },
    {
      id: 'target_3',
      santriId: 'santri_3',
      santriName: 'Muhammad Rizki',
      surahId: 1,
      surahName: 'Al-Fatihah',
      targetType: 'MONTHLY',
      targetAyahs: 7,
      completedAyahs: 2,
      targetDate: '2024-01-15T00:00:00Z',
      startDate: '2024-01-01T00:00:00Z',
      createdBy: 'admin_1',
      createdByName: 'Admin TPQ',
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-10T11:00:00Z',
      status: 'OVERDUE',
      progress: 28,
      priority: 'URGENT',
      description: 'Target hafalan surah Al-Fatihah',
      notes: 'Perlu perhatian khusus, progress lambat',
      reminders: {
        enabled: true,
        frequency: 'DAILY',
        lastSent: '2024-01-16T07:00:00Z'
      },
      milestones: [
        { percentage: 25, achievedAt: '2024-01-08T11:00:00Z', reward: 'Sticker Bintang' }
      ]
    },
    {
      id: 'target_4',
      santriId: 'santri_4',
      santriName: 'Fatimah Zahra',
      surahId: 110,
      surahName: 'An-Nasr',
      targetType: 'WEEKLY',
      targetAyahs: 3,
      completedAyahs: 1,
      targetDate: '2024-01-30T00:00:00Z',
      startDate: '2024-01-23T00:00:00Z',
      createdBy: 'admin_1',
      createdByName: 'Admin TPQ',
      createdAt: '2024-01-23T08:00:00Z',
      updatedAt: '2024-01-24T09:00:00Z',
      status: 'ACTIVE',
      progress: 33,
      priority: 'LOW',
      description: 'Target hafalan surah An-Nasr untuk pemula',
      notes: 'Baru memulai, progress sesuai rencana',
      reminders: {
        enabled: false,
        frequency: 'WEEKLY'
      },
      milestones: []
    }
  ];

  useEffect(() => {
    loadTargets();
  }, []);

  useEffect(() => {
    filterTargets();
  }, [targets, searchTerm, statusFilter, priorityFilter, typeFilter]);

  const loadTargets = async () => {
    try {
      setLoading(true);
      
      // Cek apakah database sudah siap
      try {
        // Fetch targets from API
        const response = await fetch('/api/hafalan-targets');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Update target status based on current date
          const updatedTargets = (data.targets || []).map((target: HafalanTarget) => {
            if (isTargetOverdue(target) && target.status === 'ACTIVE') {
              return { ...target, status: 'OVERDUE' as const };
            }
            return target;
          });
          
          setTargets(updatedTargets);
          console.log('Berhasil memuat data target dari API:', updatedTargets.length);
          return;
        } else {
          console.error('Failed to load targets:', data.message);
          throw new Error(data.message || 'Gagal memuat data target');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error loading targets:', error);
      toast.error(`Gagal memuat data target: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to mock data if API fails
      console.log('Menggunakan data contoh sebagai fallback');
      const updatedTargets = mockTargets.map(target => {
        if (isTargetOverdue(target) && target.status === 'ACTIVE') {
          return { ...target, status: 'OVERDUE' as const };
        }
        return target;
      });
      
      setTargets(updatedTargets);
    } finally {
      setLoading(false);
    }
  };

  const filterTargets = () => {
    let filtered = targets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(target =>
        target.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.surahName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(target => target.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(target => target.priority === priorityFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(target => target.targetType === typeFilter);
    }

    setFilteredTargets(filtered);
  };

  const handleCreateTarget = async (target: HafalanTarget) => {
    try {
      const response = await fetch('/api/hafalan-targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(target),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTargets(prev => [data.target, ...prev]);
        toast.success('Target berhasil dibuat!');
      } else {
        console.error('Failed to create target:', data.message);
        toast.error('Gagal membuat target: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating target:', error);
      toast.error('Gagal membuat target');
    }
  };

  const handleUpdateTarget = async (updatedTarget: HafalanTarget) => {
    try {
      const response = await fetch(`/api/hafalan-targets/${updatedTarget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTarget),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTargets(prev => prev.map(target => 
          target.id === updatedTarget.id ? data.target : target
        ));
        setEditingTarget(null);
        toast.success('Target berhasil diperbarui!');
      } else {
        console.error('Failed to update target:', data.message);
        toast.error('Gagal memperbarui target: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating target:', error);
      toast.error('Gagal memperbarui target');
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus target ini?')) return;

    try {
      const response = await fetch(`/api/hafalan-targets/${targetId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTargets(prev => prev.filter(target => target.id !== targetId));
        toast.success('Target berhasil dihapus!');
      } else {
        console.error('Failed to delete target:', data.message);
        toast.error('Gagal menghapus target: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting target:', error);
      toast.error('Gagal menghapus target');
    }
  };

  const calculateStats = () => {
    const totalTargets = targets.length;
    const activeTargets = targets.filter(t => t.status === 'ACTIVE').length;
    const completedTargets = targets.filter(t => t.status === 'COMPLETED').length;
    const overdueTargets = targets.filter(t => t.status === 'OVERDUE').length;
    const averageProgress = targets.reduce((sum, t) => sum + t.progress, 0) / totalTargets || 0;

    return {
      totalTargets,
      activeTargets,
      completedTargets,
      overdueTargets,
      averageProgress: Math.round(averageProgress)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Target Hafalan</h1>
          <p className="text-gray-600">Kelola target hafalan santri dan monitor progress</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsSetTargetModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Set Target
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Target</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTargets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeTargets}</p>
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
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTargets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueTargets}</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</p>
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
                  placeholder="Cari santri, surah, atau deskripsi..."
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
                <option value="OVERDUE">Terlambat</option>
                <option value="PAUSED">Dijeda</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Prioritas</option>
                <option value="URGENT">Mendesak</option>
                <option value="HIGH">Tinggi</option>
                <option value="MEDIUM">Sedang</option>
                <option value="LOW">Rendah</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Jenis</option>
                <option value="DAILY">Harian</option>
                <option value="WEEKLY">Mingguan</option>
                <option value="MONTHLY">Bulanan</option>
                <option value="YEARLY">Tahunan</option>
                <option value="CUSTOM">Kustom</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Targets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Target Hafalan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Santri</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Surah</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Jenis</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Prioritas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Deadline</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((target) => {
                  const daysRemaining = calculateDaysRemaining(target.targetDate);
                  const isOverdue = isTargetOverdue(target);
                  
                  return (
                    <tr key={target.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{target.santriName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{target.surahName}</div>
                          <div className="text-sm text-gray-500">
                            {target.completedAyahs}/{target.targetAyahs} ayat
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {getTargetTypeText(target.targetType)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(target.progress, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">{target.progress}%</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTargetStatusColor(target.status)}`}>
                          {getTargetStatusText(target.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(target.priority)}`}>
                          {getPriorityText(target.priority)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          {new Date(target.targetDate).toLocaleDateString('id-ID')}
                        </div>
                        <div className={`text-xs ${isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {isOverdue 
                            ? `Terlambat ${Math.abs(daysRemaining)} hari`
                            : daysRemaining === 0 
                              ? 'Hari ini'
                              : `${daysRemaining} hari lagi`
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/admin/hafalan/targets/${target.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTarget(target);
                              setIsSetTargetModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTarget(target.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTargets.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada target</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
                    ? 'Tidak ada target yang sesuai dengan filter'
                    : 'Belum ada target hafalan yang dibuat'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Set Target Modal */}
      <SetTargetModal
        isOpen={isSetTargetModalOpen}
        onClose={() => {
          setIsSetTargetModalOpen(false);
          setEditingTarget(null);
        }}
        onSuccess={editingTarget ? handleUpdateTarget : handleCreateTarget}
        existingTarget={editingTarget || undefined}
      />

      {/* Detail Target Modal */}
      {selectedTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detail Target Hafalan</h2>
                <button 
                  onClick={() => setSelectedTarget(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Informasi Santri</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-2"><span className="font-medium">Nama:</span> {selectedTarget.santriName}</p>
                      {selectedTarget.santriNis && (
                        <p className="text-gray-700 mb-2"><span className="font-medium">NIS:</span> {selectedTarget.santriNis}</p>
                      )}
                      {selectedTarget.halaqah && (
                        <p className="text-gray-700"><span className="font-medium">Halaqah:</span> {selectedTarget.halaqah.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Informasi Surah</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-2"><span className="font-medium">Surah:</span> {selectedTarget.surahName}</p>
                      <p className="text-gray-700 mb-2"><span className="font-medium">Target Ayat:</span> {selectedTarget.targetAyahs} ayat</p>
                      <p className="text-gray-700"><span className="font-medium">Ayat Selesai:</span> {selectedTarget.completedAyahs} ayat</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Detail Target</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">Jenis Target:</span> {getTargetTypeText(selectedTarget.targetType)}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTargetStatusColor(selectedTarget.status)}`}>
                          {getTargetStatusText(selectedTarget.status)}
                        </span>
                      </p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">Prioritas:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTarget.priority)}`}>
                          {getPriorityText(selectedTarget.priority)}
                        </span>
                      </p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">Tanggal Mulai:</span> {new Date(selectedTarget.startDate).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">Deadline:</span> {new Date(selectedTarget.targetDate).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Sisa Waktu:</span> {
                          isTargetOverdue(selectedTarget) 
                            ? `Terlambat ${Math.abs(calculateDaysRemaining(selectedTarget.targetDate))} hari` 
                            : `${calculateDaysRemaining(selectedTarget.targetDate)} hari lagi`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div
                          className="bg-teal-500 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(selectedTarget.progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-gray-700 text-center font-medium">{selectedTarget.progress}% Selesai</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTarget.description && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedTarget.description}</p>
                  </div>
                </div>
              )}

              {selectedTarget.notes && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Catatan</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedTarget.notes}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTarget(null);
                    setEditingTarget(selectedTarget);
                    setIsSetTargetModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Target
                </Button>
                <Button
                  onClick={() => setSelectedTarget(null)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
