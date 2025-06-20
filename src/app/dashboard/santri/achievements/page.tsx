'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Award,
  Trophy,
  Star,
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
  Plus,
  BookOpen,
  Clock
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
import AchievementBadge from '@/components/achievements/AchievementBadge';
import AchievementProgress from '@/components/achievements/AchievementProgress';
import AchievementLeaderboard from '@/components/achievements/AchievementLeaderboard';

// Mock data for the current santri
const CURRENT_SANTRI = {
  id: 'santri_1',
  name: 'Ahmad Fauzi',
  nis: 'TPQ001',
  halaqahId: 'halaqah_1',
  halaqahName: 'Halaqah Al-Fatihah',
  photo: '/images/santri/ahmad.jpg',
  stats: {
    surahsCompleted: 2,
    ayahsMemorized: 13,
    perfectScores: 1,
    streakDays: 7,
    customData: {}
  }
};

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
  }
];

// Mock data for leaderboard
const MOCK_LEADERBOARD = [
  {
    santriId: 'santri_2',
    santriName: 'Siti Aisyah',
    santriNis: 'TPQ002',
    halaqahName: 'Halaqah Al-Fatihah',
    totalPoints: 1250,
    totalAchievements: 6,
    rank: 1
  },
  {
    santriId: 'santri_1',
    santriName: 'Ahmad Fauzi',
    santriNis: 'TPQ001',
    halaqahName: 'Halaqah Al-Fatihah',
    totalPoints: 750,
    totalAchievements: 4,
    rank: 2
  },
  {
    santriId: 'santri_3',
    santriName: 'Muhammad Rizki',
    santriNis: 'TPQ003',
    halaqahName: 'Halaqah Al-Baqarah',
    totalPoints: 600,
    totalAchievements: 3,
    rank: 3
  },
  {
    santriId: 'santri_4',
    santriName: 'Nur Fadilah',
    santriNis: 'TPQ004',
    halaqahName: 'Halaqah Al-Baqarah',
    totalPoints: 450,
    totalAchievements: 2,
    rank: 4
  },
  {
    santriId: 'santri_5',
    santriName: 'Abdul Rahman',
    santriNis: 'TPQ005',
    halaqahName: 'Halaqah Al-Imran',
    totalPoints: 300,
    totalAchievements: 1,
    rank: 5
  }
];

export default function SantriAchievementsPage() {
  const [myAchievements, setMyAchievements] = useState<SantriAchievement[]>([]);
  const [availableBadges, setAvailableBadges] = useState<AchievementBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  // Stats
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [nextBadge, setNextBadge] = useState<AchievementBadge | null>(null);
  const [nextBadgeProgress, setNextBadgeProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch from an API
      // For now, we'll use our mock data
      
      // Get my achievements
      const achievements = MOCK_SANTRI_ACHIEVEMENTS.filter(
        a => a.santriId === CURRENT_SANTRI.id
      );
      setMyAchievements(achievements);
      
      // Calculate total points and badges
      let points = 0;
      const unlockedBadgeIds = new Set<string>();
      
      achievements.forEach(achievement => {
        if (achievement.isUnlocked) {
          const badge = ACHIEVEMENT_BADGES.find(b => b.id === achievement.badgeId);
          if (badge) {
            points += badge.points;
            unlockedBadgeIds.add(badge.id);
          }
        }
      });
      
      setTotalPoints(points);
      setTotalBadges(unlockedBadgeIds.size);
      
      // Get available badges (excluding already unlocked ones)
      const available = ACHIEVEMENT_BADGES.filter(
        badge => badge.isActive && !unlockedBadgeIds.has(badge.id)
      );
      
      // Calculate progress for each available badge
      const badgesWithProgress = available.map(badge => {
        const progress = calculateBadgeProgress(badge, CURRENT_SANTRI.stats);
        return { ...badge, progress };
      });
      
      // Sort by progress (descending)
      badgesWithProgress.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      
      setAvailableBadges(badgesWithProgress);
      
      // Set next badge to unlock (the one with highest progress)
      if (badgesWithProgress.length > 0) {
        setNextBadge(badgesWithProgress[0]);
        setNextBadgeProgress(badgesWithProgress[0].progress || 0);
      }
      
      // Set leaderboard data
      setLeaderboard(MOCK_LEADERBOARD);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Gagal memuat data pencapaian');
      setLoading(false);
    }
  };
  
  const calculateBadgeProgress = (badge: AchievementBadge, stats: any): number => {
    if (!stats) return 0;
    
    let actualValue = 0;
    let targetValue = badge.criteriaValue;
    
    switch (badge.criteriaType) {
      case 'SURAH_COUNT':
        actualValue = stats.surahsCompleted || 0;
        break;
      case 'AYAH_COUNT':
        actualValue = stats.ayahsMemorized || 0;
        break;
      case 'PERFECT_SCORE':
        actualValue = stats.perfectScores || 0;
        break;
      case 'STREAK':
        actualValue = stats.streakDays || 0;
        break;
      case 'CUSTOM':
        actualValue = stats.customData?.[badge.id] || 0;
        break;
      default:
        return 0;
    }
    
    // Calculate progress percentage
    let progress = 0;
    
    switch (badge.criteriaCondition) {
      case 'GREATER_THAN':
      case 'EQUAL':
        progress = Math.min(Math.round((actualValue / targetValue) * 100), 100);
        break;
      case 'LESS_THAN':
        // For 'less than', progress increases as the value decreases
        progress = actualValue >= targetValue ? 0 : Math.round(((targetValue - actualValue) / targetValue) * 100);
        break;
      default:
        progress = 0;
    }
    
    return progress;
  };

  const handleShareAchievement = (achievement: SantriAchievement) => {
    const badge = ACHIEVEMENT_BADGES.find(b => b.id === achievement.badgeId);
    
    if (badge && navigator.share) {
      navigator.share({
        title: `Achievement: ${badge.name}`,
        text: badge.shareMessage,
        url: window.location.href
      });
    } else {
      const message = badge?.shareMessage || `Saya telah mendapatkan badge ${achievement.badgeName}!`;
      navigator.clipboard.writeText(message);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pencapaian...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pencapaian Saya</h1>
          <p className="text-gray-600">Lihat dan bagikan pencapaian Anda</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Poin</p>
                  <p className="text-2xl font-bold text-purple-600">{totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Badge Diperoleh</p>
                  <p className="text-2xl font-bold text-blue-600">{totalBadges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Peringkat</p>
                  <p className="text-2xl font-bold text-green-600">
                    {leaderboard.find(entry => entry.santriId === CURRENT_SANTRI.id)?.rank || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Badge to Unlock */}
        {nextBadge && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2 text-teal-600" />
                Badge Selanjutnya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AchievementProgress
                badge={nextBadge}
                currentValue={
                  nextBadge.criteriaType === 'SURAH_COUNT' ? CURRENT_SANTRI.stats.surahsCompleted :
                  nextBadge.criteriaType === 'AYAH_COUNT' ? CURRENT_SANTRI.stats.ayahsMemorized :
                  nextBadge.criteriaType === 'PERFECT_SCORE' ? CURRENT_SANTRI.stats.perfectScores :
                  nextBadge.criteriaType === 'STREAK' ? CURRENT_SANTRI.stats.streakDays :
                  CURRENT_SANTRI.stats.customData?.[nextBadge.id] || 0
                }
                targetValue={nextBadge.criteriaValue}
                isUnlocked={false}
                showDetails={true}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* My Badges */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Badge Saya
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myAchievements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Anda belum memiliki badge pencapaian</p>
                    <p className="text-sm mt-1">Teruslah belajar untuk mendapatkan badge!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {myAchievements.map(achievement => {
                      const badge = ACHIEVEMENT_BADGES.find(b => b.id === achievement.badgeId);
                      if (!badge) return null;
                      
                      return (
                        <AchievementBadge
                          key={achievement.id}
                          badge={badge}
                          isUnlocked={achievement.isUnlocked}
                          achievedAt={achievement.achievedAt}
                          showActions={true}
                          onShare={() => handleShareAchievement(achievement)}
                          onDownload={
                            achievement.certificateGenerated 
                              ? () => handleDownloadCertificate(achievement) 
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <AchievementLeaderboard
              entries={leaderboard}
              title="Peringkat Pencapaian"
              period="Bulan Ini"
              limit={5}
            />
          </div>
        </div>

        {/* Available Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Medal className="h-5 w-5 mr-2 text-yellow-600" />
              Badge yang Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableBadges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Crown className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Anda telah mendapatkan semua badge yang tersedia!</p>
                </div>
              ) : (
                availableBadges.slice(0, 3).map(badge => (
                  <AchievementProgress
                    key={badge.id}
                    badge={badge}
                    currentValue={
                      badge.criteriaType === 'SURAH_COUNT' ? CURRENT_SANTRI.stats.surahsCompleted :
                      badge.criteriaType === 'AYAH_COUNT' ? CURRENT_SANTRI.stats.ayahsMemorized :
                      badge.criteriaType === 'PERFECT_SCORE' ? CURRENT_SANTRI.stats.perfectScores :
                      badge.criteriaType === 'STREAK' ? CURRENT_SANTRI.stats.streakDays :
                      CURRENT_SANTRI.stats.customData?.[badge.id] || 0
                    }
                    targetValue={badge.criteriaValue}
                    isUnlocked={false}
                    showDetails={true}
                  />
                ))
              )}
              
              {availableBadges.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline">
                    Lihat Semua Badge ({availableBadges.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}