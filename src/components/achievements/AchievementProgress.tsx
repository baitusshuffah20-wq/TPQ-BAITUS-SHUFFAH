import React from "react";
import {
  Award,
  Star,
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
} from "lucide-react";
import { AchievementBadge } from "@/lib/achievement-data";

interface AchievementProgressProps {
  badge: AchievementBadge;
  currentValue: number;
  targetValue: number;
  isUnlocked?: boolean;
  showDetails?: boolean;
}

const AchievementProgress: React.FC<AchievementProgressProps> = ({
  badge,
  currentValue,
  targetValue,
  isUnlocked = false,
  showDetails = true,
}) => {
  // Calculate progress percentage
  const progress = Math.min(
    Math.round((currentValue / targetValue) * 100),
    100,
  );

  // Format criteria type for display
  const formatCriteriaType = (type: string) => {
    switch (type) {
      case "SURAH_COUNT":
        return "Jumlah Surah";
      case "AYAH_COUNT":
        return "Jumlah Ayat";
      case "PERFECT_SCORE":
        return "Nilai Sempurna";
      case "STREAK":
        return "Hari Berturut-turut";
      case "TIME_BASED":
        return "Berbasis Waktu";
      case "CUSTOM":
        return "Kustom";
      default:
        return type;
    }
  };

  // Format criteria condition for display
  const formatCriteriaCondition = (condition: string) => {
    switch (condition) {
      case "GREATER_THAN":
        return "≥";
      case "EQUAL":
        return "=";
      case "LESS_THAN":
        return "≤";
      case "BETWEEN":
        return "antara";
      default:
        return condition;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-center mb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: badge.color }}
        >
          <span className="text-xl">{badge.icon}</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{badge.name}</h3>
          <p className="text-sm text-gray-500">{badge.description}</p>
        </div>
        {isUnlocked ? (
          <CheckCircle className="ml-auto text-green-500" />
        ) : (
          <div className="ml-auto text-sm font-medium text-gray-700">
            {progress}%
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className="h-2.5 rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: badge.color,
          }}
        ></div>
      </div>

      {/* Progress details */}
      {showDetails && (
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <div className="flex items-center">
            <Target className="w-3 h-3 mr-1" />
            <span>
              Target: {formatCriteriaCondition(badge.criteriaCondition)}{" "}
              {badge.criteriaValue}
            </span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Saat ini: {currentValue}</span>
          </div>
        </div>
      )}

      {/* Criteria details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Jenis Kriteria:</span>
              <span className="ml-1 font-medium">
                {formatCriteriaType(badge.criteriaType)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Poin:</span>
              <span className="ml-1 font-medium">{badge.points}</span>
            </div>
            {badge.timeframe && (
              <div>
                <span className="text-gray-500">Periode:</span>
                <span className="ml-1 font-medium">
                  {badge.timeframe === "DAILY"
                    ? "Harian"
                    : badge.timeframe === "WEEKLY"
                      ? "Mingguan"
                      : badge.timeframe === "MONTHLY"
                        ? "Bulanan"
                        : badge.timeframe === "YEARLY"
                          ? "Tahunan"
                          : badge.timeframe === "ALL_TIME"
                            ? "Sepanjang Waktu"
                            : badge.timeframe}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementProgress;
