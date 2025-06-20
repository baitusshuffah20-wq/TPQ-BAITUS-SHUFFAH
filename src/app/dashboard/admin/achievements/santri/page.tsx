'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Award,
  Search,
  Filter,
  Download,
  Bell,
  Star,
  Calendar,
  User,
  Trophy,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  ACHIEVEMENT_BADGES, 
  AchievementBadge,
  SantriAchievement,
  getRarityColor,
  getRarityText,
  getCategoryColor,
  getCategoryText
} from '@/lib/achievement-data';

// Mock data for santri achievements
const MOCK_SANTRI_ACHIEVEMENTS: SantriAchievement[] = [
  {
    id: 'achievement_1',
    santriId: 'santri_1',
    santriName: 'Ahmad Fauzi',
    badgeId: 'badge_first_surah',
    badgeName: 'Surah Pertama',
    achievedAt: '2024-01-15T10:00:00Z',
    progress: 100,
    isUnlocked: true,
    notificationSent: true,
    certificateGenerated: true,
    certificateUrl: '/certificates/ahmad_first_surah.pdf',
    metadata: {
      surahsCompleted: 1,
      ayahsMemorized: 6,
      perfectScores: 0,
      streakDays: 0
    }
  },
  {
    id: 'achievement_2',
    santriId: 'santri_1',
    santriName: 'Ahmad Fauzi',
    badgeId: 'badge_al_fatihah_master',
    badgeName: 'Master Al-Fatihah',
    achievedAt: '2024-01-20T14:30:00Z',
    progress: 100,
    isUnlocked: true,
    notificationSent: true,
    certificateGenerated: true,
    certificateUrl: '/certificates/ahmad_al_fatihah.pdf',
    metadata: {
      surahsCompleted: 2,
      ayahsMemorized: 13,
      perfectScores: 1,
      streakDays: 7
    }
  },
  {
    id: 'achievement_3',
    santriId: 'santri_2',
    santriName: 'Siti Aisyah',
    badgeId: 'badge_100_ayahs',
    badgeName: 'Hafidz 100 Ayat',
    achievedAt: '2024-01-18T16:00:00Z',
    progress: 100,
    isUnlocked: true,
    notificationSent: true,
    certificateGenerated: true,
    metadata: {
      surahsCompleted: 8,
      ayahsMemorized: 120,
      perfectScores: 3,
      streakDays: 15
    }
  },
  {
    id: 'achievement_4',
    santriId: 'santri_2',
    santriName: 'Siti Aisyah',
    badgeId: 'badge_consistent_learner',
    badgeName: 'Santri Istiqomah',
    achievedAt: '2024-01-25T09:00:00Z',
    progress: 100,
    isUnlocked: true,
    notificationSent: false,
    certificateGenerated: false,
    metadata: {
      surahsCompleted: 8,
      ayahsMemorized: 120,
      perfectScores: 3,
      streakDays: 30
    }
  }
];

// Mock data for santri
const MOCK_SANTRI = [
  { id: 'santri_1', name: 'Ahmad Fauzi', nis: 'TPQ001', halaqah: 'Halaqah Al-Fatihah' },
  { id: 'santri_2', name: 'Siti Aisyah', nis: 'TPQ002', halaqah: 'Halaqah Al-Fatihah' },
  { id: 'santri_3', name: 'Muhammad Rizki', nis: 'TPQ003', halaqah: 'Halaqah Al-Baqarah' },
  { id: 'santri_4', name: 'Nur Fadilah', nis: 'TPQ004', halaqah: 'Halaqah Al-Baqarah' },
  { id: 'santri_5', name: 'Abdul Rahman', nis: 'TPQ005', halaqah: 'Halaqah Al-Imran' }
];

interface SantriAchievementSummary {
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahName: string;
  totalAchievements: number;
  totalPoints: number;
  lastAchievement?: string;
  lastAchievementDate?: string;
}

export default function SantriAchievementsPage() {
  const [achievements, setAchievements] = useState<SantriAchievement[]>([...MOCK_SANTRI_ACHIEVEMENTS]);
  const [filteredAchievements, setFilteredAchievements] = useState<SantriAchievement[]>([...MOCK_SANTRI_ACHIEVEMENTS]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [santriFilter, setSantriFilter] = useState('all');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('achievedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [santriSummary, setSantriSummary] = useState<SantriAchievementSummary[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('summary');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAchievements();
  }, [searchTerm, santriFilter, badgeFilter, statusFilter, sortField, sortDirection, achievements]);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch from an API
      // For now, we'll use our mock data
      setAchievements(MOCK_SANTRI_ACHIEVEMENTS);
      
      // Calculate summary data
      const summary = calculateSantriSummary(MOCK_SANTRI_ACHIEVEMENTS);
      setSantriSummary(summary);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Gagal memuat data pencapaian santri');
      setLoading(false);
    }
  };

  const calculateSantriSummary = (achievementData: SantriAchievement[]): SantriAchievementSummary[] => {
    const summaryMap = new Map<string, SantriAchievementSummary>();
    
    // Initialize with all santri
    MOCK_SANTRI.forEach(santri => {
      summaryMap.set(santri.id, {
        santriId: santri.id,
        santriName: santri.name,
        santriNis: santri.nis,
        halaqahName: santri.halaqah,
        totalAchievements: 0,
        totalPoints: 0
      });
    });
    
    // Add achievement data
    achievementData.forEach(achievement => {
      if (achievement.isUnlocked) {
        const santriId = achievement.santriId;
        const summary = summaryMap.get(santriId);
        
        if (summary) {
          const badge = ACHIEVEMENT_BADGES.find(b => b.id === achievement.badgeId);
          const points = badge ? badge.points : 0;
          
          summary.totalAchievements += 1;
          summary.totalPoints += points;
          
          // Track latest achievement
          if (!summary.lastAchievementDate || new Date(achievement.achievedAt) > new Date(summary.lastAchievementDate)) {
            summary.lastAchievement = achievement.badgeName;
            summary.lastAchievementDate = achievement.achievedAt;
          }
        }
      }
    });
    
    return Array.from(summaryMap.values());
  };

  const filterAchievements = () => {
    let filtered = [...achievements];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(achievement =>
        achievement.santriName.toLowerCase().includes(searchLower) ||
        achievement.badgeName.toLowerCase().includes(searchLower)
      );
    }

    // Filter by santri
    if (santriFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.santriId === santriFilter);
    }

    // Filter by badge
    if (badgeFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.badgeId === badgeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'unlocked') {
        filtered = filtered.filter(achievement => achievement.isUnlocked);
      } else if (statusFilter === 'locked') {
        filtered = filtered.filter(achievement => !achievement.isUnlocked);
      } else if (statusFilter === 'certificate') {
        filtered = filtered.filter(achievement => achievement.certificateGenerated);
      } else if (statusFilter === 'notification') {
        filtered = filtered.filter(achievement => !achievement.notificationSent);
      }
    }

    // Sort achievements
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'achievedAt':
          comparison = new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime();
          break;
        case 'santriName':
          comparison = a.santriName.localeCompare(b.santriName);
          break;
        case 'badgeName':
          comparison = a.badgeName.localeCompare(b.badgeName);
          break;
        default:
          comparison = new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredAchievements(filtered);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSendNotification = (achievementId: string) => {
    // In a real app, we'd call an API here
    const updatedAchievements = achievements.map(achievement => 
      achievement.id === achievementId 
        ? { ...achievement, notificationSent: true } 
        : achievement
    );
    
    setAchievements(updatedAchievements);
    toast.success('Notifikasi berhasil dikirim');
  };

  const handleGenerateCertificate = (achievementId: string) => {
    // In a real app, we'd call an API here
    const updatedAchievements = achievements.map(achievement => 
      achievement.id === achievementId 
        ? { 
            ...achievement, 
            certificateGenerated: true,
            certificateUrl: `/certificates/${achievement.santriId}_${achievement.badgeId}.pdf`
          } 
        : achievement
    );
    
    setAchievements(updatedAchievements);
    toast.success('Sertifikat berhasil dibuat');
  };

  const handleDownloadCertificate = (certificateUrl: string) => {
    // In a real app, we'd download the file
    toast.success('Mengunduh sertifikat...');
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
            <h1 className="text-2xl font-bold text-gray-900">Pencapaian Santri</h1>
            <p className="text-gray-600">Kelola dan monitor pencapaian santri</p>
          </div>
          <div className="flex space-x-4">
            <Button 
              variant={viewMode === 'summary' ? 'primary' : 'outline'}
              onClick={() => setViewMode('summary')}
            >
              <User className="h-4 w-4 mr-2" />
              Ringkasan Santri
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Daftar Pencapaian
            </Button>
          </div>
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
                    placeholder={viewMode === 'summary' ? "Cari santri..." : "Cari pencapaian..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {viewMode === 'list' && (
                  <>
                    <select
                      value={santriFilter}
                      onChange={(e) => setSantriFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">Semua Santri</option>
                      {MOCK_SANTRI.map(santri => (
                        <option key={santri.id} value={santri.id}>
                          {santri.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={badgeFilter}
                      onChange={(e) => setBadgeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">Semua Badge</option>
                      {ACHIEVEMENT_BADGES.map(badge => (
                        <option key={badge.id} value={badge.id}>
                          {badge.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">Semua Status</option>
                      <option value="unlocked">Terbuka</option>
                      <option value="locked">Terkunci</option>
                      <option value="certificate">Dengan Sertifikat</option>
                      <option value="notification">Belum Dinotifikasi</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on view mode */}
        {viewMode === 'summary' ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center space-x-1"
                          onClick={() => handleSort('santriName')}
                        >
                          <span>Santri</span>
                          {sortField === 'santriName' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Halaqah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center space-x-1"
                          onClick={() => handleSort('totalAchievements')}
                        >
                          <span>Total Pencapaian</span>
                          {sortField === 'totalAchievements' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center space-x-1"
                          onClick={() => handleSort('totalPoints')}
                        >
                          <span>Total Poin</span>
                          {sortField === 'totalPoints' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pencapaian Terakhir
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {santriSummary.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          Tidak ada data pencapaian santri
                        </td>
                      </tr>
                    ) : (
                      santriSummary
                        .filter(summary => 
                          searchTerm === '' || 
                          summary.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          summary.santriNis.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((summary) => (
                        <tr key={summary.santriId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-teal-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{summary.santriName}</div>
                                <div className="text-sm text-gray-500">{summary.santriNis}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{summary.halaqahName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm text-gray-900">{summary.totalAchievements}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm text-gray-900">{summary.totalPoints}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {summary.lastAchievement ? (
                              <div>
                                <div className="text-sm text-gray-900">{summary.lastAchievement}</div>
                                <div className="text-xs text-gray-500">
                                  {summary.lastAchievementDate && new Date(summary.lastAchievementDate).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center space-x-1"
                          onClick={() => handleSort('santriName')}
                        >
                          <span>Santri</span>
                          {sortField === 'santriName' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center space-x-1"
                          onClick={() => handleSort('badgeName')}
                        >
                          <span>Badge</span>
                          {sortField === 'badgeName' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center space-x-1"
                          onClick={() => handleSort('achievedAt')}
                        >
                          <span>Tanggal</span>
                          {sortField === 'achievedAt' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAchievements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          Tidak ada pencapaian yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredAchievements.map((achievement) => {
                        const badge = ACHIEVEMENT_BADGES.find(b => b.id === achievement.badgeId);
                        
                        return (
                          <tr key={achievement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-teal-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{achievement.santriName}</div>
                                  <div className="text-sm text-gray-500">
                                    {MOCK_SANTRI.find(s => s.id === achievement.santriId)?.nis || ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-2xl">
                                  {badge?.icon || '🏆'}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{achievement.badgeName}</div>
                                  {badge && (
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(badge.category)}`}>
                                      {getCategoryText(badge.category)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(achievement.achievedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(achievement.achievedAt).toLocaleTimeString('id-ID')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  {achievement.isUnlocked ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                  )}
                                  <span className="text-xs text-gray-700">
                                    {achievement.isUnlocked ? 'Terbuka' : 'Terkunci'}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  {achievement.notificationSent ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                  )}
                                  <span className="text-xs text-gray-700">
                                    {achievement.notificationSent ? 'Notifikasi Terkirim' : 'Belum Dinotifikasi'}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  {achievement.certificateGenerated ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                  )}
                                  <span className="text-xs text-gray-700">
                                    {achievement.certificateGenerated ? 'Sertifikat Tersedia' : 'Belum Ada Sertifikat'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                {achievement.isUnlocked && !achievement.notificationSent && (
                                  <button
                                    onClick={() => handleSendNotification(achievement.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Kirim Notifikasi"
                                  >
                                    <Bell className="h-4 w-4" />
                                  </button>
                                )}
                                {achievement.isUnlocked && !achievement.certificateGenerated && (
                                  <button
                                    onClick={() => handleGenerateCertificate(achievement.id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Buat Sertifikat"
                                  >
                                    <Award className="h-4 w-4" />
                                  </button>
                                )}
                                {achievement.certificateGenerated && achievement.certificateUrl && (
                                  <button
                                    onClick={() => handleDownloadCertificate(achievement.certificateUrl!)}
                                    className="text-purple-600 hover:text-purple-900"
                                    title="Unduh Sertifikat"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}