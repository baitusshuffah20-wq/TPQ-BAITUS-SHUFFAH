import React from "react";
import {
  Award,
  Star,
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Share2,
  Bell,
} from "lucide-react";
import {
  getRarityColor,
  getRarityText,
  getCategoryColor,
  getCategoryText,
} from "@/lib/achievement-data";
import { Button } from "@/components/ui/button";

interface AchievementBadgeProps {
  badge: {
    id: string;
    name: string;
    nameArabic?: string;
    description?: string;
    icon: string;
    color: string;
    category: string;
    rarity: string;
    points: number;
    isActive?: boolean;
  };
  progress?: number;
  isUnlocked?: boolean;
  achievedAt?: string;
  showActions?: boolean;
  onShare?: () => void;
  onDownload?: () => void;
  onNotify?: () => void;
  size?: "sm" | "md" | "lg";
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  badge,
  progress = 0,
  isUnlocked = false,
  achievedAt,
  showActions = false,
  onShare,
  onDownload,
  onNotify,
  size = "md",
}) => {
  const rarityColorClass = getRarityColor(badge.rarity);
  const categoryColorClass = getCategoryColor(badge.category);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const sizeClasses = {
    sm: {
      container: "w-24 h-24",
      icon: "text-3xl",
      name: "text-xs",
      nameArabic: "text-xs",
      badges: "text-xs px-1 py-0.5",
    },
    md: {
      container: "w-32 h-32",
      icon: "text-4xl",
      name: "text-sm",
      nameArabic: "text-sm",
      badges: "text-xs px-2 py-1",
    },
    lg: {
      container: "w-40 h-40",
      icon: "text-5xl",
      name: "text-base",
      nameArabic: "text-base",
      badges: "text-sm px-2 py-1",
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${sizeClasses[size].container} rounded-full flex items-center justify-center relative`}
        style={{
          backgroundColor: isUnlocked ? badge.color : "#e5e7eb",
          opacity: isUnlocked ? 1 : 0.7,
          boxShadow: isUnlocked ? "0 0 15px rgba(0,0,0,0.2)" : "none",
        }}
      >
        {/* Progress circle */}
        {!isUnlocked && progress > 0 && progress < 100 && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={badge.color}
              strokeWidth="5"
              strokeDasharray={`${(2 * Math.PI * 45 * progress) / 100} ${(2 * Math.PI * 45 * (100 - progress)) / 100}`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
          </svg>
        )}

        {/* Badge icon */}
        <span className={`${sizeClasses[size].icon}`}>{badge.icon}</span>

        {/* Locked/unlocked indicator */}
        {isUnlocked ? (
          <CheckCircle className="absolute bottom-0 right-0 text-green-500 bg-white rounded-full" />
        ) : (
          <XCircle className="absolute bottom-0 right-0 text-gray-500 bg-white rounded-full" />
        )}
      </div>

      {/* Badge name */}
      <h3
        className={`mt-2 font-semibold text-center ${sizeClasses[size].name}`}
      >
        {badge.name}
      </h3>

      {/* Arabic name */}
      {badge.nameArabic && (
        <p
          className={`text-gray-600 text-center ${sizeClasses[size].nameArabic}`}
        >
          {badge.nameArabic}
        </p>
      )}

      {/* Badge metadata */}
      <div className="flex flex-wrap justify-center gap-1 mt-1">
        <span
          className={`inline-flex items-center rounded-full ${rarityColorClass} ${sizeClasses[size].badges}`}
        >
          <Star className="w-3 h-3 mr-1" />
          {getRarityText(badge.rarity)}
        </span>

        <span
          className={`inline-flex items-center rounded-full ${categoryColorClass} ${sizeClasses[size].badges}`}
        >
          <Award className="w-3 h-3 mr-1" />
          {getCategoryText(badge.category)}
        </span>

        <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-600 text-xs px-2 py-1">
          <Trophy className="w-3 h-3 mr-1" />
          {badge.points} pts
        </span>
      </div>

      {/* Achievement date */}
      {achievedAt && (
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(achievedAt)}
        </p>
      )}

      {/* Progress text */}
      {!isUnlocked && progress > 0 && (
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Progress: {progress}%
        </p>
      )}

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-2 mt-2">
          {onShare && (
            <Button size="sm" variant="outline" onClick={onShare}>
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
          )}

          {onDownload && (
            <Button size="sm" variant="outline" onClick={onDownload}>
              <Download className="w-3 h-3 mr-1" />
              Certificate
            </Button>
          )}

          {onNotify && (
            <Button size="sm" variant="outline" onClick={onNotify}>
              <Bell className="w-3 h-3 mr-1" />
              Notify
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
