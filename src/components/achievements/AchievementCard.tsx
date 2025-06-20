'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Award,
  Lock,
  Share2,
  Download,
  Star,
  Trophy,
  Medal,
  Crown
} from 'lucide-react';
import {
  AchievementBadge,
  SantriAchievement,
  getRarityColor,
  getRarityText,
  getCategoryColor,
  getCategoryText
} from '@/lib/achievement-data';

interface AchievementCardProps {
  badge: AchievementBadge;
  santriAchievement?: SantriAchievement;
  isUnlocked?: boolean;
  progress?: number;
  onShare?: () => void;
  onDownloadCertificate?: () => void;
  showActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AchievementCard({
  badge,
  santriAchievement,
  isUnlocked = false,
  progress = 0,
  onShare,
  onDownloadCertificate,
  showActions = true,
  size = 'md'
}: AchievementCardProps) {
  const getRarityIcon = (rarity: AchievementBadge['rarity']) => {
    switch (rarity) {
      case 'COMMON': return Star;
      case 'UNCOMMON': return Award;
      case 'RARE': return Medal;
      case 'EPIC': return Trophy;
      case 'LEGENDARY': return Crown;
      default: return Star;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'p-4';
      case 'md': return 'p-6';
      case 'lg': return 'p-8';
      default: return 'p-6';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'text-2xl';
      case 'md': return 'text-4xl';
      case 'lg': return 'text-6xl';
      default: return 'text-4xl';
    }
  };

  const RarityIcon = getRarityIcon(badge.rarity);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isUnlocked 
        ? 'border-2 border-teal-200 bg-gradient-to-br from-white to-teal-50' 
        : 'border border-gray-200 bg-gray-50 opacity-75'
    }`}>
      {/* Rarity Indicator */}
      <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold rounded-bl-lg ${getRarityColor(badge.rarity)}`}>
        {getRarityText(badge.rarity)}
      </div>

      {/* Lock Overlay for Locked Achievements */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">Terkunci</p>
          </div>
        </div>
      )}

      <CardContent className={getSizeClasses()}>
        <div className="text-center space-y-4">
          {/* Badge Icon */}
          <div className="relative">
            <div className={`${getIconSize()} ${isUnlocked ? '' : 'grayscale'} transition-all duration-300`}>
              {badge.icon}
            </div>
            {isUnlocked && (
              <div className="absolute -top-1 -right-1">
                <RarityIcon className="h-5 w-5 text-yellow-500" />
              </div>
            )}
          </div>

          {/* Badge Info */}
          <div className="space-y-2">
            <h3 className={`font-bold ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-lg'
            } ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
              {badge.name}
            </h3>
            
            <p className={`text-xs ${isUnlocked ? 'text-teal-600' : 'text-gray-500'} font-medium`}>
              {badge.nameArabic}
            </p>

            <p className={`${
              size === 'sm' ? 'text-xs' : 'text-sm'
            } ${isUnlocked ? 'text-gray-700' : 'text-gray-500'} leading-relaxed`}>
              {badge.description}
            </p>

            {/* Category Badge */}
            <div className="flex justify-center">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(badge.category)}`}>
                {getCategoryText(badge.category)}
              </span>
            </div>

            {/* Points */}
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className={`text-sm font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                {badge.points} poin
              </span>
            </div>
          </div>

          {/* Progress Bar (for locked achievements) */}
          {!isUnlocked && progress > 0 && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                Progress: {progress.toFixed(0)}%
              </p>
            </div>
          )}

          {/* Achievement Date */}
          {isUnlocked && santriAchievement && (
            <div className="text-xs text-gray-500">
              Diraih pada: {new Date(santriAchievement.achievedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && isUnlocked && (
            <div className="flex justify-center space-x-2 pt-2">
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Bagikan
                </Button>
              )}
              {onDownloadCertificate && santriAchievement?.certificateGenerated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadCertificate}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Sertifikat
                </Button>
              )}
            </div>
          )}

          {/* Unlock Message (for newly unlocked achievements) */}
          {isUnlocked && santriAchievement && !santriAchievement.notificationSent && (
            <div className="bg-gradient-to-r from-green-100 to-teal-100 border border-green-200 rounded-lg p-3 mt-4">
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Baru Diraih!
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1 text-center">
                {badge.unlockMessage}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
