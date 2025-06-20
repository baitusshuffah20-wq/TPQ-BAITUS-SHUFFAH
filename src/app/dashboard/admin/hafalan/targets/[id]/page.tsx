'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SetTargetModal from '@/components/modals/SetTargetModal';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  User,
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

export default function HafalanTargetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [target, setTarget] = useState<HafalanTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTarget();
  }, []);

  const loadTarget = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch target from API
      const response = await fetch(`/api/hafalan-targets/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTarget(data.target);
      } else {
        console.error('Failed to load target:', data.message);
        setError(data.message || 'Gagal memuat data target');
        toast.error('Gagal memuat data target: ' + data.message);
      }
    } catch (error) {
      console.error('Error loading target:', error);
      setError('Gagal memuat data target');
      toast.error(`Gagal memuat data target: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTarget = async (updatedTarget: HafalanTarget) => {
    try {
      const response = await fetch(`/api/hafalan-targets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTarget),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTarget(data.target);
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

  const handleDeleteTarget = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus target ini?')) return;

    try {
      const response = await fetch(`/api/hafalan-targets/${params.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Target berhasil dihapus!');
        router.push('/dashboard/admin/hafalan/targets');
      } else {
        console.error('Failed to delete target:', data.message);
        toast.error('Gagal menghapus target: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting target:', error);
      toast.error('Gagal menghapus target');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/admin/hafalan/targets')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold">Memuat Data Target...</h1>
          </div>
          
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !target) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/admin/hafalan/targets')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {error || 'Target tidak ditemukan'}
                </h2>
                <p className="text-gray-600 mb-6">
                  Terjadi kesalahan saat memuat data target hafalan
                </p>
                <Button onClick={() => loadTarget()}>
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const daysRemaining = calculateDaysRemaining(target.targetDate);
  const isOverdue = isTargetOverdue(target);
  const surah = getSurahById(target.surahId);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/admin/hafalan/targets')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold">Detail Target Hafalan</h1>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsSetTargetModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Target
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteTarget}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Target
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Santri</h3>
                  <p className="text-gray-600">Informasi santri</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-medium text-gray-900">{target.santriName}</p>
                </div>
                {target.santriNis && (
                  <div>
                    <p className="text-sm text-gray-600">NIS</p>
                    <p className="font-medium text-gray-900">{target.santriNis}</p>
                  </div>
                )}
                {target.halaqah && (
                  <div>
                    <p className="text-sm text-gray-600">Halaqah</p>
                    <p className="font-medium text-gray-900">{target.halaqah.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Surah</h3>
                  <p className="text-gray-600">Informasi surah</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nama Surah</p>
                  <p className="font-medium text-gray-900">{target.surahName}</p>
                </div>
                {surah && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Jenis</p>
                      <p className="font-medium text-gray-900">{surah.revelation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tingkat Kesulitan</p>
                      <p className="font-medium text-gray-900">{surah.difficulty}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-gray-600">Jumlah Ayat</p>
                  <p className="font-medium text-gray-900">{target.targetAyahs} ayat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Progress</h3>
                  <p className="text-gray-600">Kemajuan hafalan</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-teal-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(target.progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{target.progress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ayat Selesai</span>
                  <span className="text-sm font-medium text-gray-900">{target.completedAyahs}/{target.targetAyahs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTargetStatusColor(target.status)}`}>
                    {getTargetStatusText(target.status)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Target</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jenis Target</span>
                  <span className="font-medium text-gray-900">{getTargetTypeText(target.targetType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prioritas</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(target.priority)}`}>
                    {getPriorityText(target.priority)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal Mulai</span>
                  <span className="font-medium text-gray-900">{new Date(target.startDate).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline</span>
                  <span className="font-medium text-gray-900">{new Date(target.targetDate).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sisa Waktu</span>
                  <span className={`font-medium ${isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-gray-900'}`}>
                    {isOverdue 
                      ? `Terlambat ${Math.abs(daysRemaining)} hari`
                      : daysRemaining === 0 
                        ? 'Hari ini'
                        : `${daysRemaining} hari lagi`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dibuat Oleh</span>
                  <span className="font-medium text-gray-900">{target.createdByName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal Dibuat</span>
                  <span className="font-medium text-gray-900">{new Date(target.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deskripsi & Catatan</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Deskripsi</h3>
                  <p className="text-gray-600">
                    {target.description || 'Tidak ada deskripsi'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Catatan</h3>
                  <p className="text-gray-600">
                    {target.notes || 'Tidak ada catatan'}
                  </p>
                </div>
                {target.reminders && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Pengingat</h3>
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-gray-600">
                        {target.reminders.enabled 
                          ? `Aktif (${target.reminders.frequency === 'DAILY' 
                              ? 'Harian' 
                              : target.reminders.frequency === 'WEEKLY' 
                                ? 'Mingguan' 
                                : 'Mendekati Deadline'
                            })` 
                          : 'Tidak Aktif'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {target.milestones && target.milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Milestone</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-8 relative">
                  {target.milestones.map((milestone, index) => {
                    const isAchieved = target.progress >= milestone.percentage;
                    return (
                      <div key={index} className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isAchieved ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {isAchieved ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : (
                            <span className="text-white font-medium">{milestone.percentage}%</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className={`text-lg font-medium ${isAchieved ? 'text-green-600' : 'text-gray-600'}`}>
                            {milestone.percentage}% Selesai
                          </h3>
                          {milestone.reward && (
                            <p className="text-gray-600">
                              Reward: {milestone.reward}
                            </p>
                          )}
                          {isAchieved && milestone.achievedAt && (
                            <p className="text-sm text-gray-500">
                              Dicapai pada: {new Date(milestone.achievedAt).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Set Target Modal */}
        <SetTargetModal
          isOpen={isSetTargetModalOpen}
          onClose={() => setIsSetTargetModalOpen(false)}
          onSuccess={handleUpdateTarget}
          existingTarget={target}
        />
      </div>
    </DashboardLayout>
  );
}