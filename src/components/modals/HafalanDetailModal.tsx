'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  X,
  BookOpen,
  User,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Award,
  Edit,
  Trash2,
  Download,
  Play,
  Volume2
} from 'lucide-react';

interface HafalanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hafalan: any;
}

const HafalanDetailModal: React.FC<HafalanDetailModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  hafalan
}) => {
  if (!isOpen || !hafalan) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SETORAN': return 'bg-blue-100 text-blue-800';
      case 'MURAJAAH': return 'bg-green-100 text-green-800';
      case 'TASMI': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SETORAN': return 'Setoran';
      case 'MURAJAAH': return 'Murajaah';
      case 'TASMI': return 'Tasmi';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'NEEDS_IMPROVEMENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Disetujui';
      case 'PENDING': return 'Menunggu Review';
      case 'NEEDS_IMPROVEMENT': return 'Perlu Perbaikan';
      default: return status;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeText = (grade: number) => {
    if (grade >= 90) return 'Sangat Baik';
    if (grade >= 80) return 'Baik';
    if (grade >= 70) return 'Cukup';
    return 'Perlu Perbaikan';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Hafalan</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Header with Basic Info */}
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{hafalan.surah}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(hafalan.type)}`}>
                      {getTypeText(hafalan.type)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hafalan.status)}`}>
                      {getStatusText(hafalan.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {hafalan.santriName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(hafalan.date).toLocaleDateString('id-ID')}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ayat {hafalan.ayahRange}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {hafalan.duration ? `${hafalan.duration} menit` : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Scores */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Hasil Evaluasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{hafalan.tajwid || '-'}</div>
                    <div className="text-sm text-gray-600">Tajwid</div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${hafalan.tajwid || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{hafalan.kelancaran || '-'}</div>
                    <div className="text-sm text-gray-600">Kelancaran</div>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${hafalan.kelancaran || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{hafalan.fashahah || '-'}</div>
                    <div className="text-sm text-gray-600">Fashahah</div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${hafalan.fashahah || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getGradeColor(hafalan.grade || 0)}`}>
                      {hafalan.grade || '-'}
                    </div>
                    <div className="text-sm text-gray-600">Rata-rata</div>
                    <div className={`text-xs font-medium mt-1 ${getGradeColor(hafalan.grade || 0)}`}>
                      {hafalan.grade ? getGradeText(hafalan.grade) : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Detail Hafalan
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Santri
                      </label>
                      <p className="text-gray-900">{hafalan.santriName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Surah
                      </label>
                      <p className="text-gray-900">{hafalan.surah}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Range Ayat
                      </label>
                      <p className="text-gray-900">Ayat {hafalan.ayahRange}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Jenis Hafalan
                      </label>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(hafalan.type)}`}>
                        {getTypeText(hafalan.type)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tanggal
                      </label>
                      <p className="text-gray-900">{new Date(hafalan.date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Musyrif
                      </label>
                      <p className="text-gray-900">{hafalan.musyrifName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Durasi
                      </label>
                      <p className="text-gray-900">{hafalan.duration ? `${hafalan.duration} menit` : 'Tidak dicatat'}</p>
                    </div>
                  </div>
                </div>

                {/* Evaluation Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Detail Evaluasi
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Status
                      </label>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hafalan.status)}`}>
                        {getStatusText(hafalan.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Nilai Akhir
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold ${getGradeColor(hafalan.grade || 0)}`}>
                          {hafalan.grade || '-'}
                        </span>
                        <span className={`text-sm font-medium ${getGradeColor(hafalan.grade || 0)}`}>
                          ({hafalan.grade ? getGradeText(hafalan.grade) : '-'})
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Breakdown Nilai
                      </label>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tajwid:</span>
                          <span className="font-medium">{hafalan.tajwid || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Kelancaran:</span>
                          <span className="font-medium">{hafalan.kelancaran || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Fashahah:</span>
                          <span className="font-medium">{hafalan.fashahah || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tanggal Evaluasi
                      </label>
                      <p className="text-gray-900">{new Date(hafalan.updatedAt || hafalan.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Feedback */}
              {(hafalan.notes || hafalan.corrections || hafalan.recommendations) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Catatan & Feedback
                  </h3>
                  <div className="space-y-4">
                    {hafalan.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Catatan Evaluasi
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{hafalan.notes}</p>
                      </div>
                    )}
                    {hafalan.corrections && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Koreksi & Perbaikan
                        </label>
                        <p className="text-gray-900 bg-red-50 p-3 rounded-lg border border-red-200">{hafalan.corrections}</p>
                      </div>
                    )}
                    {hafalan.recommendations && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Rekomendasi
                        </label>
                        <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200">{hafalan.recommendations}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audio Recording Section (Future Feature) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Volume2 className="h-5 w-5 mr-2" />
                  Rekaman Audio
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <Volume2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Fitur rekaman audio akan tersedia dalam update mendatang</p>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <Play className="h-4 w-4 mr-2" />
                      Putar Rekaman
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Unduh Audio
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={onDelete}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Evaluasi
                </Button>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={onClose}>
                    Tutup
                  </Button>
                  <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Evaluasi
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HafalanDetailModal;
