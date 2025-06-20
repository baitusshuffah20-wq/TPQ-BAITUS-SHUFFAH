'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  X,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  Edit,
  Trash2,
  Download,
  BookOpen,
  TrendingUp
} from 'lucide-react';

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  attendance: any;
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  attendance
}) => {
  if (!isOpen || !attendance) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'SICK': return 'bg-blue-100 text-blue-800';
      case 'PERMISSION': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ABSENT': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'LATE': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'SICK': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'PERMISSION': return <AlertCircle className="h-4 w-4 text-purple-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Hadir';
      case 'ABSENT': return 'Tidak Hadir';
      case 'LATE': return 'Terlambat';
      case 'SICK': return 'Sakit';
      case 'PERMISSION': return 'Izin';
      default: return status;
    }
  };

  const getSessionText = (session: string) => {
    switch (session) {
      case 'MORNING': return 'Pagi (07:00 - 09:00)';
      case 'AFTERNOON': return 'Siang (13:00 - 15:00)';
      case 'EVENING': return 'Sore (15:30 - 17:30)';
      default: return session;
    }
  };

  const calculateAttendanceRate = () => {
    const total = attendance.totalSantri;
    const present = attendance.presentCount + attendance.lateCount; // Late still counts as attended
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Kehadiran</CardTitle>
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
                  <Calendar className="h-8 w-8 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {new Date(attendance.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {getSessionText(attendance.session)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {attendance.halaqah}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {attendance.musyrifName}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {attendance.location || 'Tidak dicatat'}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {attendance.totalSantri} santri
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Statistik Kehadiran
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{attendance.totalSantri}</div>
                    <div className="text-sm text-gray-600">Total Santri</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{attendance.presentCount}</div>
                    <div className="text-sm text-gray-600">Hadir</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{attendance.absentCount}</div>
                    <div className="text-sm text-gray-600">Tidak Hadir</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{attendance.lateCount}</div>
                    <div className="text-sm text-gray-600">Terlambat</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{attendance.sickCount}</div>
                    <div className="text-sm text-gray-600">Sakit</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{attendance.permissionCount}</div>
                    <div className="text-sm text-gray-600">Izin</div>
                  </div>
                </div>
                
                {/* Attendance Rate */}
                <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-teal-900">Tingkat Kehadiran</h4>
                      <p className="text-sm text-teal-700">
                        {attendance.presentCount + attendance.lateCount} dari {attendance.totalSantri} santri hadir
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-teal-600">
                      {calculateAttendanceRate()}%
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-teal-200 rounded-full h-2">
                    <div 
                      className="bg-teal-600 h-2 rounded-full" 
                      style={{ width: `${calculateAttendanceRate()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Detail Sesi
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tanggal & Waktu
                      </label>
                      <p className="text-gray-900">
                        {new Date(attendance.date).toLocaleDateString('id-ID')} - {getSessionText(attendance.session)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Halaqah
                      </label>
                      <p className="text-gray-900">{attendance.halaqah}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Musyrif
                      </label>
                      <p className="text-gray-900">{attendance.musyrifName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Lokasi
                      </label>
                      <p className="text-gray-900">{attendance.location || 'Tidak dicatat'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Topik Pembelajaran
                      </label>
                      <p className="text-gray-900">{attendance.topic || 'Tidak dicatat'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Catatan Sesi
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Catatan Umum
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-900">
                          {attendance.notes || 'Tidak ada catatan khusus'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Waktu Pencatatan
                      </label>
                      <p className="text-gray-900">
                        {new Date(attendance.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {attendance.updatedAt !== attendance.createdAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Terakhir Diupdate
                        </label>
                        <p className="text-gray-900">
                          {new Date(attendance.updatedAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Attendance List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Daftar Kehadiran Detail
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Santri</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Waktu Datang</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.attendanceList?.map((item: any, index: number) => (
                        <tr key={item.santriId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-teal-600">
                                  {item.santriName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.santriName}</p>
                                <p className="text-sm text-gray-500">NIS: {item.santriNis}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(item.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusText(item.status)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-900">
                              {item.arrivalTime || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {item.notes || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  Hapus Kehadiran
                </Button>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={onClose}>
                    Tutup
                  </Button>
                  <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Kehadiran
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

export default AttendanceDetailModal;
