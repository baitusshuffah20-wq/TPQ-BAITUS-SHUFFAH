'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  GraduationCap, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BookOpen,
  User,
  Calendar,
  Star,
  BarChart2,
  Target,
  BookMarked
} from 'lucide-react';

interface HafalanProgress {
  id: string;
  santriId: string;
  santriName?: string;
  santriNis?: string;
  surahId: number;
  surahName: string;
  totalAyah: number;
  memorized: number;
  inProgress: number;
  lastAyah: number;
  startDate: string;
  targetDate?: string;
  completedAt?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ProgressHafalanPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showInputModal, setShowInputModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<HafalanProgress | null>(null);
  const [progressList, setProgressList] = useState<HafalanProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [surahList, setSurahList] = useState<any[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    santriId: '',
    surahId: '',
    surahName: '',
    totalAyah: 0,
    memorized: 0,
    inProgress: 0,
    lastAyah: 0,
    targetDate: '',
    status: 'IN_PROGRESS',
    notes: ''
  });

  const [updateData, setUpdateData] = useState({
    memorized: 0,
    inProgress: 0,
    lastAyah: 0,
    targetDate: '',
    status: 'IN_PROGRESS',
    notes: ''
  });

  // Check authentication and role
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      if (user.role !== 'ADMIN') {
        console.log('User is not admin, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('User authenticated as admin:', user.name);
      loadProgressData();
      loadSantriData();
      loadSurahData();
    }
  }, [user, authLoading, router]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching hafalan progress data from API...');
      const response = await fetch('/api/hafalan-progress', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Disable caching
      });
      
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        // Process the data to ensure it has the expected format
        const processedData = data.progress.map((p: any) => ({
          id: p.id,
          santriId: p.santriId,
          santriName: p.santri?.name || 'Unknown',
          santriNis: p.santri?.nis || 'Unknown',
          surahId: p.surahId,
          surahName: p.surahName,
          totalAyah: p.totalAyah,
          memorized: p.memorized,
          inProgress: p.inProgress,
          lastAyah: p.lastAyah,
          startDate: p.startDate,
          targetDate: p.targetDate,
          completedAt: p.completedAt,
          status: p.status,
          notes: p.notes,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }));
        
        setProgressList(processedData);
        console.log('Loaded progress data:', processedData);
      } else {
        console.error('Failed to load progress data:', data.message);
        // Fallback to empty array if API fails
        setProgressList([]);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Fallback to empty array if API fails
      setProgressList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSantriData = async () => {
    try {
      console.log('Fetching santri data from API...');
      const response = await fetch('/api/santri?status=ACTIVE', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Disable caching
      });
      
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success && Array.isArray(data.santri) && data.santri.length > 0) {
        setSantriList(data.santri);
        console.log('Loaded santri data:', data.santri);
      } else {
        console.error('Failed to load santri data:', data.message || 'No data returned');
        // Fallback data
        setSantriList([
          { id: 'cmbvv5c9l000a6c3rghiwpa5l', name: 'Muhammad Fauzi', nis: 'STR001' },
          { id: 'cmbvv5c9t000c6c3rseqcys7w', name: 'Aisyah Zahra', nis: 'STR002' },
          { id: 'cmbvv5ca0000e6c3rofasqmzp', name: 'Abdullah Rahman', nis: 'STR003' }
        ]);
      }
    } catch (error) {
      console.error('Error loading santri data:', error);
      // Fallback data
      setSantriList([
        { id: 'cmbvv5c9l000a6c3rghiwpa5l', name: 'Muhammad Fauzi', nis: 'STR001' },
        { id: 'cmbvv5c9t000c6c3rseqcys7w', name: 'Aisyah Zahra', nis: 'STR002' },
        { id: 'cmbvv5ca0000e6c3rofasqmzp', name: 'Abdullah Rahman', nis: 'STR003' }
      ]);
    }
  };

  const loadSurahData = async () => {
    try {
      console.log('Fetching surah data from API...');
      const response = await fetch('/api/quran/surahs', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        setSurahList(data.surahs);
        console.log('Loaded surah data:', data.surahs);
      } else {
        console.error('Failed to load surah data:', data.message);
        // Fallback to static list if API fails
        setSurahList([
          { id: 1, name: 'Al-Fatihah', totalAyah: 7 },
          { id: 2, name: 'Al-Baqarah', totalAyah: 286 },
          { id: 3, name: 'Ali Imran', totalAyah: 200 },
          { id: 4, name: 'An-Nisa', totalAyah: 176 },
          { id: 5, name: 'Al-Ma\'idah', totalAyah: 120 },
          { id: 36, name: 'Ya-Sin', totalAyah: 83 },
          { id: 55, name: 'Ar-Rahman', totalAyah: 78 },
          { id: 56, name: 'Al-Waqi\'ah', totalAyah: 96 },
          { id: 67, name: 'Al-Mulk', totalAyah: 30 },
          { id: 78, name: 'An-Naba', totalAyah: 40 },
          { id: 93, name: 'Ad-Duha', totalAyah: 11 },
          { id: 94, name: 'Ash-Sharh', totalAyah: 8 },
          { id: 112, name: 'Al-Ikhlas', totalAyah: 4 },
          { id: 113, name: 'Al-Falaq', totalAyah: 5 },
          { id: 114, name: 'An-Nas', totalAyah: 6 }
        ]);
      }
    } catch (error) {
      console.error('Error loading surah data:', error);
      // Fallback to static list if API fails
      setSurahList([
        { id: 1, name: 'Al-Fatihah', totalAyah: 7 },
        { id: 2, name: 'Al-Baqarah', totalAyah: 286 },
        { id: 3, name: 'Ali Imran', totalAyah: 200 },
        { id: 4, name: 'An-Nisa', totalAyah: 176 },
        { id: 5, name: 'Al-Ma\'idah', totalAyah: 120 },
        { id: 36, name: 'Ya-Sin', totalAyah: 83 },
        { id: 55, name: 'Ar-Rahman', totalAyah: 78 },
        { id: 56, name: 'Al-Waqi\'ah', totalAyah: 96 },
        { id: 67, name: 'Al-Mulk', totalAyah: 30 },
        { id: 78, name: 'An-Naba', totalAyah: 40 },
        { id: 93, name: 'Ad-Duha', totalAyah: 11 },
        { id: 94, name: 'Ash-Sharh', totalAyah: 8 },
        { id: 112, name: 'Al-Ikhlas', totalAyah: 4 },
        { id: 113, name: 'Al-Falaq', totalAyah: 5 },
        { id: 114, name: 'An-Nas', totalAyah: 6 }
      ]);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If surahId changes, update surahName and totalAyah
    if (field === 'surahId') {
      const selectedSurah = surahList.find(s => s.id.toString() === value.toString());
      if (selectedSurah) {
        setFormData(prev => ({ 
          ...prev, 
          surahId: value,
          surahName: selectedSurah.name,
          totalAyah: selectedSurah.totalAyah
        }));
      }
    }
  };

  const handleUpdateInputChange = (field: string, value: any) => {
    setUpdateData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitProgress = async () => {
    try {
      if (!formData.santriId || !formData.surahId) {
        alert('Mohon lengkapi semua field yang diperlukan');
        return;
      }
      
      setLoading(true);
      
      const response = await fetch('/api/hafalan-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add the new progress to the list
        const newProgress: HafalanProgress = {
          id: data.progress.id,
          santriId: data.progress.santriId,
          santriName: data.progress.santri.name,
          santriNis: data.progress.santri.nis,
          surahId: data.progress.surahId,
          surahName: data.progress.surahName,
          totalAyah: data.progress.totalAyah,
          memorized: data.progress.memorized,
          inProgress: data.progress.inProgress,
          lastAyah: data.progress.lastAyah,
          startDate: data.progress.startDate,
          targetDate: data.progress.targetDate,
          completedAt: data.progress.completedAt,
          status: data.progress.status,
          notes: data.progress.notes,
          createdAt: data.progress.createdAt,
          updatedAt: data.progress.updatedAt
        };
        
        setProgressList(prev => [newProgress, ...prev]);
        
        // Reset form
        setFormData({
          santriId: '',
          surahId: '',
          surahName: '',
          totalAyah: 0,
          memorized: 0,
          inProgress: 0,
          lastAyah: 0,
          targetDate: '',
          status: 'IN_PROGRESS',
          notes: ''
        });
        
        alert('Progress hafalan berhasil disimpan!');
        setShowInputModal(false);
      } else {
        console.error('Failed to submit progress:', data.message);
        alert('Gagal menyimpan progress: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting progress:', error);
      alert('Terjadi kesalahan saat menyimpan progress');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedProgress) return;
    
    try {
      setLoading(true);
      
      console.log('Updating progress for ID:', selectedProgress.id);
      console.log('Update data:', updateData);
      
      // Ensure all numeric fields are actually numbers
      const processedUpdateData = {
        ...updateData,
        memorized: parseInt(updateData.memorized.toString()),
        inProgress: parseInt(updateData.inProgress.toString()),
        lastAyah: parseInt(updateData.lastAyah.toString())
      };
      
      console.log('Processed update data:', processedUpdateData);
      
      const response = await fetch(`/api/hafalan-progress/${selectedProgress.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedUpdateData),
        cache: 'no-store'
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        // Update the progress list
        setProgressList(prev => 
          prev.map(p => 
            p.id === selectedProgress.id 
              ? {
                  ...p,
                  memorized: data.progress.memorized,
                  inProgress: data.progress.inProgress,
                  lastAyah: data.progress.lastAyah,
                  targetDate: data.progress.targetDate,
                  completedAt: data.progress.completedAt,
                  status: data.progress.status,
                  notes: data.progress.notes,
                  updatedAt: data.progress.updatedAt
                }
              : p
          )
        );
        
        alert('Progress hafalan berhasil diupdate!');
        setShowUpdateModal(false);
        setSelectedProgress(null);
      } else {
        console.error('Failed to update progress:', data.message, data.error || '');
        alert('Gagal mengupdate progress: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Terjadi kesalahan saat mengupdate progress: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (progress: HafalanProgress) => {
    setSelectedProgress(progress);
    setShowDetailModal(true);
  };

  const handleEditProgress = (progress: HafalanProgress) => {
    setSelectedProgress(progress);
    setUpdateData({
      memorized: progress.memorized,
      inProgress: progress.inProgress,
      lastAyah: progress.lastAyah,
      targetDate: progress.targetDate || '',
      status: progress.status,
      notes: progress.notes || ''
    });
    setShowUpdateModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ON_HOLD':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (memorized: number, totalAyah: number) => {
    return Math.round((memorized / totalAyah) * 100);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredProgress = progressList.filter(progress => {
    const matchesSearch = 
      (progress.santriName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (progress.santriNis?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      progress.surahName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || progress.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: progressList.length,
    completed: progressList.filter(p => p.status === 'COMPLETED').length,
    inProgress: progressList.filter(p => p.status === 'IN_PROGRESS').length,
    onHold: progressList.filter(p => p.status === 'ON_HOLD').length
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Progress Hafalan</h1>
            <p className="text-gray-600 mt-1">
              Pantau dan kelola progress hafalan santri
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setShowInputModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Progress
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sedang Berlangsung</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ditunda</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.onHold}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Progress Hafalan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Cari santri, NIS, atau surah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="IN_PROGRESS">Sedang Berlangsung</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="ON_HOLD">Ditunda</option>
                </select>
              </div>
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProgress.map((progress) => (
                <Card key={progress.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-teal-600">
                            {progress.santriName?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{progress.santriName}</h3>
                          <p className="text-sm text-gray-500">NIS: {progress.santriNis}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(progress.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(progress.status)}`}>
                          {progress.status === 'COMPLETED' ? 'Selesai' : 
                           progress.status === 'IN_PROGRESS' ? 'Berlangsung' : 'Ditunda'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {progress.surahName}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {progress.memorized}/{progress.totalAyah} ayat
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-teal-600 h-2.5 rounded-full" 
                          style={{ width: `${getProgressPercentage(progress.memorized, progress.totalAyah)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {getProgressPercentage(progress.memorized, progress.totalAyah)}% selesai
                        </span>
                        {progress.inProgress > 0 && (
                          <span className="text-xs text-blue-600">
                            +{progress.inProgress} ayat dalam progress
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Mulai:</span>
                        <span className="text-gray-900">{formatDateTime(progress.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Target:</span>
                        <span className="text-gray-900">{progress.targetDate ? formatDateTime(progress.targetDate) : '-'}</span>
                      </div>
                      {progress.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Selesai:</span>
                          <span className="text-green-600">{formatDateTime(progress.completedAt)}</span>
                        </div>
                      )}

                      {progress.notes && (
                        <div className="text-sm text-gray-600">
                          <p className="italic">"{progress.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetail(progress)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditProgress(progress)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProgress.length === 0 && (
              <div className="text-center py-12">
                <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada progress hafalan ditemukan
                </h3>
                <p className="text-gray-500">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input Modal */}
        {showInputModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Progress Hafalan</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Santri</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.santriId}
                      onChange={(e) => handleInputChange('santriId', e.target.value)}
                    >
                      <option value="">Pilih Santri</option>
                      {santriList.map((santri) => (
                        <option key={santri.id} value={santri.id}>
                          {santri.name} ({santri.nis})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surah</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.surahId}
                      onChange={(e) => handleInputChange('surahId', e.target.value)}
                    >
                      <option value="">Pilih Surah</option>
                      {surahList.map((surah) => (
                        <option key={surah.id} value={surah.id}>
                          {surah.name} ({surah.totalAyah} ayat)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ayat Dihafal</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={formData.totalAyah}
                        value={formData.memorized}
                        onChange={(e) => handleInputChange('memorized', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ayat Dalam Progress</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={formData.totalAyah - formData.memorized}
                        value={formData.inProgress}
                        onChange={(e) => handleInputChange('inProgress', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ayat Terakhir</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={formData.totalAyah}
                      value={formData.lastAyah}
                      onChange={(e) => handleInputChange('lastAyah', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Selesai</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.targetDate}
                      onChange={(e) => handleInputChange('targetDate', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="IN_PROGRESS">Sedang Berlangsung</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="ON_HOLD">Ditunda</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowInputModal(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleSubmitProgress}
                    disabled={loading}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Detail Progress Hafalan</h2>
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedProgress.santriName}</h3>
                      <p className="text-sm text-gray-500">NIS: {selectedProgress.santriNis}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Surah</span>
                      <span className="text-gray-900">{selectedProgress.surahName}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Total Ayat</span>
                      <span className="text-gray-900">{selectedProgress.totalAyah}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Ayat Dihafal</span>
                      <span className="text-gray-900">{selectedProgress.memorized}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Ayat Dalam Progress</span>
                      <span className="text-gray-900">{selectedProgress.inProgress}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Ayat Terakhir</span>
                      <span className="text-gray-900">{selectedProgress.lastAyah}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="text-gray-900">
                        {getProgressPercentage(selectedProgress.memorized, selectedProgress.totalAyah)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProgress.status)}`}>
                        {selectedProgress.status === 'COMPLETED' ? 'Selesai' : 
                         selectedProgress.status === 'IN_PROGRESS' ? 'Berlangsung' : 'Ditunda'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Tanggal Mulai</span>
                      <span className="text-gray-900">{formatDateTime(selectedProgress.startDate)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Target Selesai</span>
                      <span className="text-gray-900">
                        {selectedProgress.targetDate ? formatDateTime(selectedProgress.targetDate) : '-'}
                      </span>
                    </div>
                    {selectedProgress.completedAt && (
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Tanggal Selesai</span>
                        <span className="text-green-600">{formatDateTime(selectedProgress.completedAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedProgress.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="font-medium text-gray-700 block mb-2">Catatan</span>
                      <p className="text-gray-900 italic">"{selectedProgress.notes}"</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Dibuat Pada</span>
                      <span className="text-gray-900">{formatDateTime(selectedProgress.createdAt)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Diperbarui Pada</span>
                      <span className="text-gray-900">{formatDateTime(selectedProgress.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Tutup
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditProgress(selectedProgress);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && selectedProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Update Progress Hafalan
                </h2>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-teal-600">
                        {selectedProgress.santriName?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedProgress.santriName}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedProgress.surahName} ({selectedProgress.totalAyah} ayat)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ayat Dihafal</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={selectedProgress.totalAyah}
                        value={updateData.memorized}
                        onChange={(e) => handleUpdateInputChange('memorized', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ayat Dalam Progress</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={selectedProgress.totalAyah - updateData.memorized}
                        value={updateData.inProgress}
                        onChange={(e) => handleUpdateInputChange('inProgress', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ayat Terakhir</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={selectedProgress.totalAyah}
                      value={updateData.lastAyah}
                      onChange={(e) => handleUpdateInputChange('lastAyah', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Selesai</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={updateData.targetDate}
                      onChange={(e) => handleUpdateInputChange('targetDate', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={updateData.status}
                      onChange={(e) => handleUpdateInputChange('status', e.target.value)}
                    >
                      <option value="IN_PROGRESS">Sedang Berlangsung</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="ON_HOLD">Ditunda</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={updateData.notes}
                      onChange={(e) => handleUpdateInputChange('notes', e.target.value)}
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowUpdateModal(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleUpdateProgress}
                    disabled={loading}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProgressHafalanPage;