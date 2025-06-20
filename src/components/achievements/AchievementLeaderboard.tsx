import React from 'react';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  Crown,
  Users,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface LeaderboardEntry {
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahName: string;
  totalPoints: number;
  totalAchievements: number;
  rank: number;
  photo?: string;
}

interface AchievementLeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  period?: string;
  limit?: number;
  onViewSantri?: (santriId: string) => void;
}

const AchievementLeaderboard: React.FC<AchievementLeaderboardProps> = ({
  entries,
  title = 'Leaderboard Pencapaian',
  period,
  limit = 10,
  onViewSantri
}) => {
  // Sort entries by total points (descending)
  const sortedEntries = [...entries]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
  
  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-gray-500';
    }
  };
  
  // Get medal icon based on rank
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-medium text-gray-500">{rank}</span>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          {title}
        </CardTitle>
        {period && (
          <p className="text-sm text-gray-500">{period}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Belum ada data pencapaian
            </div>
          ) : (
            sortedEntries.map((entry, index) => (
              <div 
                key={entry.santriId}
                className={`flex items-center p-3 rounded-lg ${index < 3 ? 'bg-gray-50' : ''}`}
                onClick={() => onViewSantri && onViewSantri(entry.santriId)}
                style={{ cursor: onViewSantri ? 'pointer' : 'default' }}
              >
                {/* Rank */}
                <div className="w-8 flex justify-center">
                  {getMedalIcon(entry.rank)}
                </div>
                
                {/* Santri info */}
                <div className="flex items-center flex-1 ml-2">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
                    {entry.photo ? (
                      <img 
                        src={entry.photo} 
                        alt={entry.santriName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                  
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">{entry.santriName}</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-2">{entry.santriNis}</span>
                      <Users className="w-3 h-3 mr-1" />
                      <span>{entry.halaqahName}</span>
                    </div>
                  </div>
                </div>
                
                {/* Points & achievements */}
                <div className="text-right">
                  <div className="font-bold text-purple-600">{entry.totalPoints} pts</div>
                  <div className="flex items-center justify-end text-xs text-gray-500">
                    <Award className="w-3 h-3 mr-1" />
                    <span>{entry.totalAchievements} badges</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementLeaderboard;