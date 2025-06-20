'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Heart,
  Star,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Award,
  BookOpen,
  Target,
  Bell,
  Download,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  BehaviorRecord,
  BehaviorSummary,
  BehaviorCategory,
  BehaviorType,
  BehaviorSeverity,
  BEHAVIOR_CRITERIA,
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
  getBehaviorTypeColor,
  getBehaviorTypeText,
  getBehaviorSeverityColor,
  getBehaviorSeverityText,
  getBehaviorStatusColor,
  getBehaviorStatusText,
  calculateBehaviorScore,
  getCharacterGrade,
  getGradeColor,
  formatBehaviorDate,
  formatBehaviorTime
} from '@/lib/behavior-data';

export default function BehaviorPage() {
  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BehaviorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Mock data
  const mockBehaviorRecords: BehaviorRecord[] = [
    {
      id: 'beh_1',
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      santriNis: 'TPQ001',
      halaqahId: 'halaqah_1',
      halaqahName: 'Halaqah Al-Fatihah',
      criteriaId: 'akhlaq_honest',
      criteriaName: 'Jujur',
      category: 'AKHLAQ',
      type: 'POSITIVE',
      severity: 'LOW',
      points: 5,
      date: selectedDate,
      time: '08:30:00',
      description: 'Ahmad mengakui kesalahan dengan jujur ketika tidak mengerjakan PR',
      context: 'Saat ditanya tentang PR yang tidak dikerjakan',
      location: 'Ruang Kelas A',
      status: 'ACTIVE',
      recordedBy: 'musyrif_1',
      recordedByName: 'Ustadz Ahmad',
      recordedAt: `${selectedDate}T08:30:00Z`,
      followUpRequired: false,
      parentNotified: true,
      parentNotifiedAt: `${selectedDate}T09:00:00Z`,
      metadata: {
        mood: 'CALM',
        energy: 'MEDIUM',
        participation: 'ACTIVE',
        socialInteraction: 'POSITIVE'
      }
    },
    {
      id: 'beh_2',
      santriId: 'santri_2',
      santriName: 'Siti Aisyah',
      santriNis: 'TPQ002',
      halaqahId: 'halaqah_1',
      halaqahName: 'Halaqah Al-Fatihah',
      criteriaId: 'akhlaq_helping',
      criteriaName: 'Membantu Teman',
      category: 'AKHLAQ',
      type: 'POSITIVE',
      severity: 'LOW',
      points: 4,
      date: selectedDate,
      time: '09:15:00',
      description: 'Siti membantu temannya yang kesulitan membaca Al-Quran',
      context: 'Saat sesi hafalan bersama',
      location: 'Ruang Kelas A',
      status: 'ACTIVE',
      recordedBy: 'musyrif_1',
      recordedByName: 'Ustadz Ahmad',
      recordedAt: `${selectedDate}T09:15:00Z`,
      followUpRequired: false,
      parentNotified: true,
      parentNotifiedAt: `${selectedDate}T10:00:00Z`,
      metadata: {
        mood: 'HAPPY',
        energy: 'HIGH',
        participation: 'ACTIVE',
        socialInteraction: 'POSITIVE'
      }
    },
    {
      id: 'beh_3',
      santriId: 'santri_3',
      santriName: 'Muhammad Rizki',
      santriNis: 'TPQ003',
      halaqahId: 'halaqah_2',
      halaqahName: 'Halaqah Al-Baqarah',
      criteriaId: 'discipline_disrupt',
      criteriaName: 'Mengganggu Kelas',
      category: 'DISCIPLINE',
      type: 'NEGATIVE',
      severity: 'MEDIUM',
      points: -4,
      date: selectedDate,
      time: '10:30:00',
      description: 'Rizki berbicara dan mengganggu teman saat ustadzah menjelaskan',
      context: 'Saat pembelajaran tajwid',
      location: 'Ruang Kelas B',
      status: 'FOLLOW_UP',
      recordedBy: 'musyrif_2',
      recordedByName: 'Ustadzah Fatimah',
      recordedAt: `${selectedDate}T10:30:00Z`,
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      followUpNotes: 'Perlu konseling dan pemahaman tentang adab menuntut ilmu',
      parentNotified: true,
      parentNotifiedAt: `${selectedDate}T11:00:00Z`,
      metadata: {
        mood: 'EXCITED',
        energy: 'HIGH',
        participation: 'DISRUPTIVE',
        socialInteraction: 'NEGATIVE'
      }
    },
    {
      id: 'beh_4',
      santriId: 'santri_4',
      santriName: 'Fatimah Zahra',
      santriNis: 'TPQ004',
      halaqahId: 'halaqah_1',
      halaqahName: 'Halaqah Al-Fatihah',
      criteriaId: 'ibadah_prayer',
      criteriaName: 'Rajin Shalat',
      category: 'IBADAH',
      type: 'POSITIVE',
      severity: 'MEDIUM',
      points: 6,
      date: selectedDate,
      time: '12:00:00',
      description: 'Fatimah selalu datang tepat waktu untuk shalat berjamaah dan khusyuk',
      context: 'Saat shalat Dzuhur berjamaah',
      location: 'Musholla TPQ',
      status: 'ACTIVE',
      recordedBy: 'musyrif_1',
      recordedByName: 'Ustadz Ahmad',
      recordedAt: `${selectedDate}T12:00:00Z`,
      followUpRequired: false,
      parentNotified: true,
      parentNotifiedAt: `${selectedDate}T12:30:00Z`,
      metadata: {
        mood: 'CALM',
        energy: 'MEDIUM',
        participation: 'ACTIVE',
        socialInteraction: 'POSITIVE'
      }
    }
  ];

  const behaviorStats = {
    totalRecords: mockBehaviorRecords.length,
    positiveCount: mockBehaviorRecords.filter(r => r.type === 'POSITIVE').length,
    negativeCount: mockBehaviorRecords.filter(r => r.type === 'NEGATIVE').length,
    neutralCount: mockBehaviorRecords.filter(r => r.type === 'NEUTRAL').length,
    totalPoints: mockBehaviorRecords.reduce((sum, r) => sum + r.points, 0),
    averageScore: 78,
    followUpRequired: mockBehaviorRecords.filter(r => r.followUpRequired).length,
    parentNotifications: mockBehaviorRecords.filter(r => r.parentNotified).length
  };

  useEffect(() => {
    loadBehaviorData();
  }, [selectedDate]);

  useEffect(() => {
    filterRecords();
  }, [behaviorRecords, searchTerm, categoryFilter, typeFilter, severityFilter]);

  const loadBehaviorData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBehaviorRecords(mockBehaviorRecords);
    } catch (error) {
      console.error('Error loading behavior data:', error);
      toast.error('Gagal memuat data perilaku');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = behaviorRecords;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.santriNis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.criteriaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(record => record.category === categoryFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === typeFilter);
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(record => record.severity === severityFilter);
    }

    setFilteredRecords(filtered);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Evaluasi Perilaku Santri</h1>
          <p className="text-gray-600">Pantau dan evaluasi perkembangan akhlaq santri</p>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Catat Perilaku
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Tanggal:</label>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Catatan</p>
                <p className="text-2xl font-bold text-gray-900">{behaviorStats.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perilaku Positif</p>
                <p className="text-2xl font-bold text-green-600">{behaviorStats.positiveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perlu Perhatian</p>
                <p className="text-2xl font-bold text-red-600">{behaviorStats.negativeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tindak Lanjut</p>
                <p className="text-2xl font-bold text-yellow-600">{behaviorStats.followUpRequired}</p>
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
                  placeholder="Cari santri, kriteria, atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
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
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="POSITIVE">Positif</option>
                <option value="NEGATIVE">Negatif</option>
                <option value="NEUTRAL">Netral</option>
              </select>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Level</option>
                <option value="LOW">Rendah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HIGH">Tinggi</option>
                <option value="CRITICAL">Kritis</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan Perilaku - {formatBehaviorDate(selectedDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Santri</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Kriteria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Kategori</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tipe</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Poin</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Waktu</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{record.santriName}</div>
                        <div className="text-sm text-gray-500">{record.santriNis}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{record.criteriaName}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{record.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBehaviorCategoryColor(record.category)}`}>
                        {getBehaviorCategoryText(record.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBehaviorTypeColor(record.type)}`}>
                        {getBehaviorTypeText(record.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${record.points > 0 ? 'text-green-600' : record.points < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {record.points > 0 ? '+' : ''}{record.points}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {formatBehaviorTime(record.time)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBehaviorStatusColor(record.status)}`}>
                        {getBehaviorStatusText(record.status)}
                      </span>
                      {record.followUpRequired && (
                        <div className="flex items-center mt-1">
                          <Bell className="h-3 w-3 text-yellow-600 mr-1" />
                          <span className="text-xs text-yellow-600">Tindak Lanjut</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada catatan perilaku</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || severityFilter !== 'all'
                    ? 'Tidak ada catatan yang sesuai dengan filter'
                    : 'Belum ada catatan perilaku untuk tanggal ini'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
