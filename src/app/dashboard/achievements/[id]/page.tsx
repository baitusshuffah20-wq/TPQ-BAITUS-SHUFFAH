'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Award,
  Trophy,
  Star,
  Calendar,
  Clock,
  Download,
  Share2,
  ArrowLeft,
  User,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Info
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
  }
];

export default function AchievementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const achievementId = params.id as string;
  
  const [achievement, setAchievement] = useState<SantriAchievement | null>(null);
  const [badge, setBadge] = useState<AchievementBadge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadAchievementData();
  }, [achievementId]);
  
  const loadAchievementData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we'd fetch from an API
      // For now, we'll use our mock data
      
      // Check if it's a badge ID or achievement ID
      const isBadge = achievementId.startsWith('badge_');
      
      if (isBadge) {
        // Get badge details
        const badgeData = ACHIEVEMENT_BADGES.find(b => b.id === achievementId);
        
        if (!badgeData) {
          setError('Badge tidak ditemukan');
          setLoading(false);
          return;
        }
        
        setBadge(badgeData);
        
        // Get santri who have earned this badge
        const achievementsWithBadge = MOCK_SANTRI_ACHIEVEMENTS.filter(
          a => a.badgeId === achievementId && a.isUnlocked
        );
        
        if (achievementsWithBadge.length > 0) {
          setAchievement(achievementsWithBadge[0]);
        }
      } else {
        // Get achievement details
        const achievementData = MOCK_SANTRI_ACHIEVEMENTS.find(a => a.id === achievementId);
        
        if (!achievementData) {
          setError('Achievement tidak ditemukan');
          setLoading(false);
          return;
        }
        
        setAchievement(achievementData);
        
        // Get badge details
        const badgeData = ACHIEVEMENT_BADGES.find(b => b.id === achievementData.badgeId);
        
        if (badgeData) {
          setBadge(badgeData);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading achievement:', error);
      setError('Gagal memuat data achievement');
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleShareAchievement = () => {
    if (!badge) return;
    
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
  
  const handleDownloadCertificate = () => {
    if (!achievement || !achievement.certificateUrl) {
      toast.error('Sertifikat belum tersedia');
      return;
    }
    
    window.open(achievement.certificateUrl, '_blank');
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data achievement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="text-center">
            <div className="bg-red-100 text-red-600 p-3 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <Info className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!badge) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <Info className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Badge Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Badge yang Anda cari tidak ditemukan</p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center">
          <Button variant="outline" onClick={handleGoBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Achievement</h1>
            <p className="text-gray-600">Informasi lengkap tentang achievement</p>
          </div>
        </div>
        
        {/* Badge details */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Badge icon */}
              <div className="flex-shrink-0">
                <div 
                  className="w-40 h-40 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: badge.color }}
                >
                  <span className="text-5xl">{badge.icon}</span>
                </div>
              </div>
              
              {/* Badge info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{badge.name}</h2>
                <p className="text-xl text-gray-600 mb-3">{badge.nameArabic}</p>
                
                <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                  <span className={`inline-flex items-center rounded-full ${getRarityColor(badge.rarity)} px-3 py-1`}>
                    <Star className="w-4 h-4 mr-1" />
                    {getRarityText(badge.rarity)}
                  </span>
                  
                  <span className={`inline-flex items-center rounded-full ${getCategoryColor(badge.category)} px-3 py-1`}>
                    <Award className="w-4 h-4 mr-1" />
                    {getCategoryText(badge.category)}
                  </span>
                  
                  <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-600 px-3 py-1">
                    <Trophy className="w-4 h-4 mr-1" />
                    {badge.points} poin
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{badge.description}</p>
                
                {/* Achievement status */}
                {achievement && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      {achievement.isUnlocked ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="font-medium">Achievement Diperoleh</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-600">
                          <XCircle className="w-5 h-5 mr-2" />
                          <span className="font-medium">Belum Diperoleh</span>
                        </div>
                      )}
                    </div>
                    
                    {achievement.isUnlocked && (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center mb-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Diperoleh pada: {formatDate(achievement.achievedAt)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Oleh: {achievement.santriName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button onClick={handleShareAchievement}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                  
                  {achievement?.certificateGenerated && (
                    <Button variant="outline" onClick={handleDownloadCertificate}>
                      <Download className="h-4 w-4 mr-2" />
                      Unduh Sertifikat
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievement criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kriteria Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Jenis Kriteria</h3>
                  <p className="text-gray-700">
                    {badge.criteriaType === 'SURAH_COUNT' ? 'Jumlah Surah' :
                     badge.criteriaType === 'AYAH_COUNT' ? 'Jumlah Ayat' :
                     badge.criteriaType === 'PERFECT_SCORE' ? 'Nilai Sempurna' :
                     badge.criteriaType === 'STREAK' ? 'Hari Berturut-turut' :
                     badge.criteriaType === 'TIME_BASED' ? 'Berbasis Waktu' :
                     badge.criteriaType === 'CUSTOM' ? 'Kustom' :
                     badge.criteriaType}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Nilai Target</h3>
                  <p className="text-gray-700">
                    {badge.criteriaCondition === 'GREATER_THAN' ? '≥ ' :
                     badge.criteriaCondition === 'EQUAL' ? '= ' :
                     badge.criteriaCondition === 'LESS_THAN' ? '≤ ' :
                     badge.criteriaCondition === 'BETWEEN' ? 'antara ' :
                     ''}
                    {badge.criteriaValue}
                  </p>
                </div>
                
                {badge.timeframe && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Periode Waktu</h3>
                    <p className="text-gray-700">
                      {badge.timeframe === 'DAILY' ? 'Harian' :
                       badge.timeframe === 'WEEKLY' ? 'Mingguan' :
                       badge.timeframe === 'MONTHLY' ? 'Bulanan' :
                       badge.timeframe === 'YEARLY' ? 'Tahunan' :
                       badge.timeframe === 'ALL_TIME' ? 'Sepanjang Waktu' :
                       badge.timeframe}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                <h3 className="font-medium text-teal-800 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Pesan Saat Membuka
                </h3>
                <p className="text-teal-700">{badge.unlockMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievement metadata */}
        {achievement?.metadata && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Tambahan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievement.metadata.surahsCompleted !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Surah Selesai</h3>
                    <p className="text-xl font-bold text-teal-600">{achievement.metadata.surahsCompleted}</p>
                  </div>
                )}
                
                {achievement.metadata.ayahsMemorized !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Ayat Dihafal</h3>
                    <p className="text-xl font-bold text-blue-600">{achievement.metadata.ayahsMemorized}</p>
                  </div>
                )}
                
                {achievement.metadata.perfectScores !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Nilai Sempurna</h3>
                    <p className="text-xl font-bold text-yellow-600">{achievement.metadata.perfectScores}</p>
                  </div>
                )}
                
                {achievement.metadata.streakDays !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Hari Berturut-turut</h3>
                    <p className="text-xl font-bold text-red-600">{achievement.metadata.streakDays}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}