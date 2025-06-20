'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AchievementCard from '@/components/achievements/AchievementCard';
import {
  Award,
  Trophy,
  Star,
  Users,
  TrendingUp,
  Filter,
  Search,
  Download,
  Share2,
  Bell,
  Crown,
  Medal,
  Target,
  Calendar,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  ACHIEVEMENT_BADGES,
  AchievementBadge,
  SantriAchievement,
  getBadgesByCategory,
  getBadgesByRarity,
  checkAchievementCriteria
} from '@/lib/achievement-data';

interface SantriAchievementData {
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahName: string;
  totalPoints: number;
  unlockedBadges: number;
  recentAchievements: SantriAchievement[];
  achievements: SantriAchievement[];
  stats: {
    surahsCompleted: number;
    ayahsMemorized: number;
    perfectScores: number;
    streakDays: number;
    customData?: any;
  };
}

export default function AchievementsPage() {
  const [santriAchievements, setSantriAchievements] = useState<SantriAchievementData[]>([]);
  const [filteredBadges, setFilteredBadges] = useState<AchievementBadge[]>(ACHIEVEMENT_BADGES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSantri, setSelectedSantri] = useState<string>('all');

  // Mock data
  const mockSantriAchievements: SantriAchievementData[] = [
    {
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      santriNis: 'TPQ001',
      halaqahName: 'Halaqah Al-Fatihah',
      totalPoints: 750,
      unlockedBadges: 4,
      recentAchievements: [],
      achievements: [
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
        }
      ],
      stats: {
        surahsCompleted: 2,
        ayahsMemorized: 13,
        perfectScores: 1,
        streakDays: 7
      }
    },
    {
      santriId: 'santri_2',
      santriName: 'Siti Aisyah',
      santriNis: 'TPQ002',
      halaqahName: 'Halaqah Al-Fatihah',
      totalPoints: 1250,
      unlockedBadges: 6,
      recentAchievements: [],
      achievements: [
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
      ],
      stats: {
        surahsCompleted: 8,
        ayahsMemorized: 120,
        perfectScores: 3,
        streakDays: 30
      }
    }
  ];

  useEffect(() => {
    loadAchievements();
  }, []);

  useEffect(() => {
    filterBadges();
  }, [searchTerm, categoryFilter, rarityFilter, statusFilter, selectedSantri, santriAchievements]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSantriAchievements(mockSantriAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Gagal memuat data achievements');
    } finally {
      setLoading(false);
    }
  };

  const filterBadges = () => {
    let filtered = ACHIEVEMENT_BADGES.filter(badge => badge.isActive);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(badge =>
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.nameArabic.includes(searchTerm)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(badge => badge.category === categoryFilter);
    }

    // Filter by rarity
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(badge => badge.rarity === rarityFilter);
    }

    // Filter by status (unlocked/locked for selected santri)
    if (statusFilter !== 'all' && selectedSantri !== 'all') {
      const santriData = santriAchievements.find(s => s.santriId === selectedSantri);
      if (santriData) {
        filtered = filtered.filter(badge => {
          const isUnlocked = santriData.achievements.some(a => a.badgeId === badge.id && a.isUnlocked);
          return statusFilter === 'unlocked' ? isUnlocked : !isUnlocked;
        });
      }
    }

    setFilteredBadges(filtered);
  };

  const calculateOverallStats = () => {
    const totalSantri = santriAchievements.length;
    const totalAchievements = santriAchievements.reduce((sum, s) => sum + s.achievements.length, 0);
    const totalPoints = santriAchievements.reduce((sum, s) => sum + s.totalPoints, 0);
    const averagePoints = totalSantri > 0 ? Math.round(totalPoints / totalSantri) : 0;

    return {
      totalSantri,
      totalAchievements,
      totalPoints,
      averagePoints,
      totalBadges: ACHIEVEMENT_BADGES.filter(b => b.isActive).length
    };
  };

  const getAchievementProgress = (badge: AchievementBadge, santriData?: SantriAchievementData) => {
    if (!santriData) return 0;
    
    const achievement = santriData.achievements.find(a => a.badgeId === badge.id);
    if (achievement?.isUnlocked) return 100;

    // Calculate progress based on criteria
    return checkAchievementCriteria(badge, santriData.stats) ? 100 : 
           Math.min((santriData.stats.surahsCompleted / badge.criteriaValue) * 100, 99);
  };

  const handleShareAchievement = (badge: AchievementBadge) => {
    if (navigator.share) {
      navigator.share({
        title: `Achievement: ${badge.name}`,
        text: badge.shareMessage,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(badge.shareMessage);
      toast.success('Pesan berhasil disalin ke clipboard!');
    }
  };

  const handleDownloadCertificate = (achievement: SantriAchievement) => {
    if (achievement.certificateUrl) {
      window.open(achievement.certificateUrl, '_blank');
    } else {
      toast.error('Sertifikat belum tersedia');
    }
  };

  const stats = calculateOverallStats();

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
          <h1 className="text-2xl font-bold text-gray-900">Achievement System</h1>
          <p className="text-gray-600">Kelola dan monitor pencapaian santri</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/admin/achievements/badges'}>
            <Award className="h-4 w-4 mr-2" />
            Kelola Badge
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/admin/achievements/santri'}>
            <Trophy className="h-4 w-4 mr-2" />
            Pencapaian Santri
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/admin/achievements/santri/add'}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pencapaian
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Santri</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSantri}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Badge</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalBadges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Achievement</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalAchievements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Poin</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Poin</p>
                <p className="text-2xl font-bold text-teal-600">{stats.averagePoints}</p>
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
                  placeholder="Cari achievement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedSantri}
                onChange={(e) => setSelectedSantri(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Santri</option>
                {santriAchievements.map(santri => (
                  <option key={santri.santriId} value={santri.santriId}>
                    {santri.santriName}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                <option value="HAFALAN">Hafalan</option>
                <option value="ATTENDANCE">Kehadiran</option>
                <option value="BEHAVIOR">Perilaku</option>
                <option value="ACADEMIC">Akademik</option>
                <option value="SPECIAL">Khusus</option>
              </select>
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Rarity</option>
                <option value="COMMON">Umum</option>
                <option value="UNCOMMON">Tidak Umum</option>
                <option value="RARE">Langka</option>
                <option value="EPIC">Epik</option>
                <option value="LEGENDARY">Legendaris</option>
              </select>
              {selectedSantri !== 'all' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="unlocked">Terbuka</option>
                  <option value="locked">Terkunci</option>
                </select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map((badge) => {
          const selectedSantriData = selectedSantri !== 'all' 
            ? santriAchievements.find(s => s.santriId === selectedSantri)
            : undefined;
          
          const achievement = selectedSantriData?.achievements.find(a => a.badgeId === badge.id);
          const isUnlocked = achievement?.isUnlocked || false;
          const progress = getAchievementProgress(badge, selectedSantriData);

          return (
            <AchievementCard
              key={badge.id}
              badge={badge}
              santriAchievement={achievement}
              isUnlocked={isUnlocked}
              progress={progress}
              onShare={() => handleShareAchievement(badge)}
              onDownloadCertificate={achievement ? () => handleDownloadCertificate(achievement) : undefined}
              showActions={selectedSantri !== 'all'}
            />
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada achievement</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' || rarityFilter !== 'all'
              ? 'Tidak ada achievement yang sesuai dengan filter'
              : 'Belum ada achievement yang tersedia'
            }
          </p>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
