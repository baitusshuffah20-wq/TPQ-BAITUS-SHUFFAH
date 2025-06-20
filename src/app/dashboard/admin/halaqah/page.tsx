'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import HalaqahForm from '@/components/forms/HalaqahForm';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye,
  Download,
  Users,
  Clock,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

interface Halaqah {
  id: string;
  name: string;
  description: string;
  level: string;
  capacity: number;
  musyrif: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  santri: any[];
  schedules: Schedule[];
  _count: {
    santri: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function HalaqahPage() {
  const [halaqah, setHalaqah] = useState<Halaqah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [musyrifFilter, setMusyrifFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingHalaqah, setEditingHalaqah] = useState<Halaqah | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [musyrifList, setMusyrifList] = useState<any[]>([]);

  useEffect(() => {
    loadHalaqah();
    loadMusyrifList();
  }, []);

  const loadHalaqah = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/halaqah');
      if (response.ok) {
        const data = await response.json();
        setHalaqah(data.halaqah || []);
      } else {
        toast.error('Gagal memuat data halaqah');
      }
    } catch (error) {
      console.error('Error loading halaqah:', error);
      toast.error('Gagal memuat data halaqah');
    } finally {
      setLoading(false);
    }
  };

  const loadMusyrifList = async () => {
    try {
      const response = await fetch('/api/users?role=MUSYRIF');
      if (response.ok) {
        const data = await response.json();
        setMusyrifList(data.users || []);
      }
    } catch (error) {
      console.error('Error loading musyrif:', error);
    }
  };

  const handleCreateHalaqah = async (halaqahData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/halaqah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(halaqahData)
      });

      if (response.ok) {
        toast.success('Halaqah berhasil dibuat');
        setShowForm(false);
        loadHalaqah();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal membuat halaqah');
      }
    } catch (error) {
      console.error('Error creating halaqah:', error);
      toast.error('Gagal membuat halaqah');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateHalaqah = async (halaqahData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/halaqah/${editingHalaqah?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(halaqahData)
      });

      if (response.ok) {
        toast.success('Halaqah berhasil diupdate');
        setEditingHalaqah(null);
        setShowForm(false);
        loadHalaqah();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal mengupdate halaqah');
      }
    } catch (error) {
      console.error('Error updating halaqah:', error);
      toast.error('Gagal mengupdate halaqah');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteHalaqah = async (halaqahId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus halaqah ini?')) return;

    try {
      const response = await fetch(`/api/halaqah/${halaqahId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Halaqah berhasil dihapus');
        loadHalaqah();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menghapus halaqah');
      }
    } catch (error) {
      console.error('Error deleting halaqah:', error);
      toast.error('Gagal menghapus halaqah');
    }
  };

  const filteredHalaqah = halaqah.filter(h => {
    // Handle search with null checks
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (h.musyrif && h.musyrif.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         h.level.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle level filter
    const matchesLevel = levelFilter === 'ALL' || h.level === levelFilter;
    
    // Handle musyrif filter with null check
    const matchesMusyrif = musyrifFilter === 'ALL' || 
                          (h.musyrif && h.musyrif.id === musyrifFilter);
    
    return matchesSearch && matchesLevel && matchesMusyrif;
  });

  const getDayLabel = (dayOfWeek: number) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    // Check if dayOfWeek is a valid index
    if (dayOfWeek === null || dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek >= days.length) {
      return 'Hari';
    }
    return days[dayOfWeek];
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getLevels = () => {
    const levels = [...new Set(halaqah.map(h => h.level))];
    return levels.sort();
  };

  if (showForm) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <HalaqahForm
            halaqah={editingHalaqah ? {
              id: editingHalaqah.id,
              name: editingHalaqah.name,
              description: editingHalaqah.description,
              level: editingHalaqah.level,
              capacity: editingHalaqah.capacity,
              musyrifId: editingHalaqah.musyrif?.id || '',
              schedules: editingHalaqah.schedules || []
            } : undefined}
            onSubmit={editingHalaqah ? handleUpdateHalaqah : handleCreateHalaqah}
            onCancel={() => {
              setShowForm(false);
              setEditingHalaqah(null);
            }}
            isLoading={formLoading}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Halaqah</h1>
              <p className="text-gray-600">Kelola halaqah dan jadwal pembelajaran</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Halaqah
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Halaqah</p>
                  <p className="text-2xl font-bold text-gray-900">{halaqah.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Santri</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {halaqah.reduce((sum, h) => sum + h._count.santri, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Musyrif Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(halaqah
                      .filter(h => h.musyrif) // Filter out null musyrif
                      .map(h => h.musyrif.id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rata-rata Kapasitas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {halaqah.length > 0 ? Math.round(
                      halaqah.reduce((sum, h) => sum + (h._count.santri / h.capacity * 100), 0) / halaqah.length
                    ) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Halaqah
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nama halaqah atau musyrif..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="ALL">Semua Level</option>
                  {getLevels().map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Musyrif
                </label>
                <select
                  value={musyrifFilter}
                  onChange={(e) => setMusyrifFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="ALL">Semua Musyrif</option>
                  {musyrifList.map((musyrif) => (
                    <option key={musyrif.id} value={musyrif.id}>
                      {musyrif.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Halaqah Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Halaqah ({filteredHalaqah.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data halaqah...</p>
              </div>
            ) : filteredHalaqah.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada halaqah</h3>
                <p className="text-gray-600">Belum ada data halaqah atau tidak sesuai filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Halaqah</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Musyrif</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Jadwal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Kapasitas</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHalaqah.map((h) => (
                      <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{h.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {h.level}
                              </Badge>
                              {h.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {h.description.length > 50
                                    ? h.description.substring(0, 50) + '...'
                                    : h.description
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            {h.musyrif ? (
                              <>
                                <p className="font-medium text-gray-900">{h.musyrif.name}</p>
                                <p className="text-sm text-gray-600">{h.musyrif.phone || 'Tidak ada nomor'}</p>
                              </>
                            ) : (
                              <p className="text-gray-500">Belum ada musyrif</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {h.schedules && h.schedules.slice(0, 2).map((schedule, idx) => (
                              schedule && (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-600">
                                    {schedule.dayOfWeek !== null && schedule.dayOfWeek !== undefined 
                                      ? getDayLabel(schedule.dayOfWeek) 
                                      : 'Jadwal'} {schedule.startTime || '--'}-{schedule.endTime || '--'}
                                  </span>
                                  {schedule.room && (
                                    <>
                                      <MapPin className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-500">{schedule.room}</span>
                                    </>
                                  )}
                                </div>
                              )
                            ))}
                            {h.schedules && h.schedules.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{h.schedules.length - 2} jadwal lainnya
                              </p>
                            )}
                            {(!h.schedules || h.schedules.length === 0) && (
                              <span className="text-gray-400 text-sm">Belum ada jadwal</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium ${getCapacityColor(h._count.santri, h.capacity)}`}>
                                  {h._count.santri}/{h.capacity}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {Math.round((h._count.santri / h.capacity) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    (h._count.santri / h.capacity) * 100 >= 90
                                      ? 'bg-red-500'
                                      : (h._count.santri / h.capacity) * 100 >= 75
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((h._count.santri / h.capacity) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // View detail logic here
                              }}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Detail
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingHalaqah(h);
                                setShowForm(true);
                              }}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteHalaqah(h.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
