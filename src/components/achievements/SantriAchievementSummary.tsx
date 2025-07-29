import React from "react";
import { Award, Trophy, Calendar, User, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AchievementBadge from "./AchievementBadge";
import {
  SantriAchievement,
  AchievementBadge as AchievementBadgeType,
} from "@/lib/achievement-data";

interface SantriAchievementSummaryProps {
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahName: string;
  totalPoints: number;
  unlockedBadges: number;
  recentAchievements: SantriAchievement[];
  badges: AchievementBadgeType[];
  onViewDetails?: () => void;
}

const SantriAchievementSummary: React.FC<SantriAchievementSummaryProps> = ({
  santriName,
  santriNis,
  halaqahName,
  totalPoints,
  unlockedBadges,
  recentAchievements,
  badges,
  onViewDetails,
}) => {
  // Get the most recent achievement
  const latestAchievement =
    recentAchievements.length > 0 ? recentAchievements[0] : null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get badge details for an achievement
  const getBadgeDetails = (badgeId: string) => {
    return badges.find((badge) => badge.id === badgeId);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header with santri info */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-500">
              <User className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-lg">{santriName}</h3>
              <div className="flex items-center text-teal-100 text-sm">
                <span className="mr-3">{santriNis}</span>
                <Users className="w-3 h-3 mr-1" />
                <span>{halaqahName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement stats */}
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Poin</p>
              <p className="font-bold text-lg text-purple-600">{totalPoints}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Badge</p>
              <p className="font-bold text-lg text-blue-600">
                {unlockedBadges}
              </p>
            </div>
          </div>
        </div>

        {/* Latest achievement */}
        {latestAchievement && (
          <div className="p-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <Medal className="w-4 h-4 mr-1" />
              Pencapaian Terbaru
            </h4>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getBadgeDetails(latestAchievement.badgeId) && (
                  <AchievementBadge
                    badge={getBadgeDetails(latestAchievement.badgeId)!}
                    isUnlocked={true}
                    achievedAt={latestAchievement.achievedAt}
                    size="sm"
                  />
                )}
              </div>

              <div className="ml-4">
                <h5 className="font-medium">{latestAchievement.badgeName}</h5>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(latestAchievement.achievedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View details button */}
        {onViewDetails && (
          <div className="p-4 border-t border-gray-100">
            <Button
              variant="outline"
              className="w-full"
              onClick={onViewDetails}
            >
              Lihat Detail Pencapaian
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SantriAchievementSummary;
