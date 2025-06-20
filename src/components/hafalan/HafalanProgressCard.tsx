'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
  Star,
  Calendar,
  Play,
  Eye
} from 'lucide-react';
import { 
  Surah, 
  HafalanProgress, 
  HafalanRecord,
  getSurahById,
  getGradeColor,
  getStatusColor
} from '@/lib/quran-data';

interface HafalanProgressCardProps {
  santriId: string;
  santriName: string;
  surahId: number;
  progress: HafalanProgress;
  recentRecords: HafalanRecord[];
  onViewDetails: () => void;
  onAddHafalan: () => void;
}

export default function HafalanProgressCard({
  santriId,
  santriName,
  surahId,
  progress,
  recentRecords,
  onViewDetails,
  onAddHafalan
}: HafalanProgressCardProps) {
  const surah = getSurahById(surahId);
  
  if (!surah) {
    return null;
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const getStatusIcon = (status: HafalanProgress['status']) => {
    switch (status) {
      case 'MASTERED':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'NOT_STARTED':
        return <BookOpen className="h-5 w-5 text-gray-400" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: HafalanProgress['status']) => {
    switch (status) {
      case 'MASTERED': return 'Dikuasai';
      case 'COMPLETED': return 'Selesai';
      case 'IN_PROGRESS': return 'Berlangsung';
      case 'NOT_STARTED': return 'Belum Dimulai';
      default: return status;
    }
  };

  const getStatusColor = (status: HafalanProgress['status']) => {
    switch (status) {
      case 'MASTERED': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {surah.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{surah.nameArabic}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(progress.status)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(progress.status)}`}>
              {getStatusText(progress.status)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress Hafalan</span>
            <span className="text-sm font-bold text-gray-900">{progress.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress.percentage)}`}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{progress.completedAyahs} ayat</span>
            <span>{progress.totalAyahs} ayat total</span>
          </div>
        </div>

        {/* Surah Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Kategori:</span>
            <div className="font-medium text-gray-900">{surah.category}</div>
          </div>
          <div>
            <span className="text-gray-600">Tingkat:</span>
            <div className="font-medium text-gray-900">
              <span className={`px-2 py-1 rounded text-xs ${
                surah.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                surah.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {surah.difficulty === 'EASY' ? 'Mudah' : 
                 surah.difficulty === 'MEDIUM' ? 'Sedang' : 'Sulit'}
              </span>
            </div>
          </div>
          <div>
            <span className="text-gray-600">Total Sesi:</span>
            <div className="font-medium text-gray-900">{progress.totalSessions}</div>
          </div>
          <div>
            <span className="text-gray-600">Rata-rata Nilai:</span>
            <div className="font-medium text-gray-900">
              {progress.averageScore ? progress.averageScore.toFixed(0) : '-'}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentRecords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Aktivitas Terakhir</h4>
            <div className="space-y-2">
              {recentRecords.slice(0, 2).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      record.status === 'APPROVED' ? 'bg-green-500' :
                      record.status === 'PENDING' ? 'bg-yellow-500' :
                      record.status === 'REVISION' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-xs text-gray-600">
                      Ayat {record.ayahStart}-{record.ayahEnd}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.recordedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  {record.grade && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getGradeColor(record.grade)}`}>
                      {record.grade}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Detail
          </Button>
          <Button
            size="sm"
            onClick={onAddHafalan}
            className="flex-1"
          >
            <Target className="h-4 w-4 mr-2" />
            Tambah Hafalan
          </Button>
        </div>

        {/* Achievement Badge */}
        {progress.status === 'MASTERED' && (
          <div className="flex items-center justify-center p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
            <Award className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              🎉 Surah Dikuasai dengan Sempurna!
            </span>
          </div>
        )}

        {/* Recommendation */}
        {progress.status === 'COMPLETED' && progress.averageScore && progress.averageScore >= 85 && (
          <div className="flex items-center justify-center p-3 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg border border-green-200">
            <Star className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Siap lanjut ke surah berikutnya!
            </span>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          Terakhir diperbarui: {new Date(progress.lastUpdated).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </CardContent>
    </Card>
  );
}
