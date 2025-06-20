'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Plus,
  QrCode,
  MapPin,
  Bell,
  Eye,
  Edit,
  BarChart3,
  UserCheck,
  UserX,
  Timer,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceStats,
  AttendanceStatus,
  SessionType,
  getAttendanceStatusColor,
  getAttendanceStatusText,
  getSessionTypeText,
  getSessionTypeColor,
  calculateAttendanceRate,
  calculatePunctualityRate,
  formatTime,
  formatDuration
} from '@/lib/attendance-data';

export default function AdvancedAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [halaqahFilter, setHalaqahFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');

  // Mock data
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: 'att_1',
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      santriNis: 'TPQ001',
      halaqahId: 'halaqah_1',
      halaqahName: 'Halaqah Al-Fatihah',
      musyrifId: 'musyrif_1',
      musyrifName: 'Ustadz Ahmad',
      date: selectedDate,
      sessionType: 'MORNING',
      status: 'PRESENT',
      checkInTime: '07:30:00',
      checkOutTime: '09:00:00',
      method: 'QR_CODE',
      recordedBy: 'system',
      recordedAt: `${selectedDate}T07:30:00Z`,
      metadata: {
        qrCodeId: 'qr_morning_001',
        deviceId: 'tablet_001'
      }
    },
    {
      id: 'att_2',
      santriId: 'santri_2',
      santriName: 'Siti Aisyah',
      santriNis: 'TPQ002',
      halaqahId: 'halaqah_1',
      halaqahName: 'Halaqah Al-Fatihah',
      musyrifId: 'musyrif_1',
      musyrifName: 'Ustadz Ahmad',
      date: selectedDate,
      sessionType: 'MORNING',
      status: 'LATE',
      checkInTime: '07:45:00',
      checkOutTime: '09:00:00',
      lateMinutes: 15,
      method: 'MANUAL',
      notes: 'Terlambat karena macet',
      recordedBy: 'musyrif_1',
      recordedAt: `${selectedDate}T07:45:00Z`
    },
    {
      id: 'att_3',
      santriId: 'santri_3',
      santriName: 'Muhammad Rizki',
      santriNis: 'TPQ003',
      halaqahId: 'halaqah_2',
      halaqahName: 'Halaqah Al-Baqarah',
      musyrifId: 'musyrif_2',
      musyrifName: 'Ustadzah Fatimah',
      date: selectedDate,
      sessionType: 'MORNING',
      status: 'ABSENT',
      method: 'MANUAL',
      notes: 'Tidak hadir tanpa keterangan',
      recordedBy: 'musyrif_2',
      recordedAt: `${selectedDate}T08:00:00Z`
    },
    {
      id: 'att_4',
      santriId: 'santri_4',
      santriName: 'Fatimah Zahra',
      santriNis: 'TPQ004',
      halaqahId: 'halaqah_1',
      halaqahName: 'Halaqah Al-Fatihah',
      musyrifId: 'musyrif_1',
      musyrifName: 'Ustadz Ahmad',
      date: selectedDate,
      sessionType: 'MORNING',
      status: 'SICK',
      excuseReason: 'Demam tinggi',
      excuseDocument: '/documents/surat_sakit_004.pdf',
      method: 'MANUAL',
      recordedBy: 'admin_1',
      recordedAt: `${selectedDate}T07:00:00Z`
    },
    {
      id: 'att_5',
      santriId: 'santri_5',
      santriName: 'Abdullah Rahman',
      santriNis: 'TPQ005',
      halaqahId: 'halaqah_2',
      halaqahName: 'Halaqah Al-Baqarah',
      musyrifId: 'musyrif_2',
      musyrifName: 'Ustadzah Fatimah',
      date: selectedDate,
      sessionType: 'MORNING',
      status: 'PRESENT',
      checkInTime: '07:25:00',
      checkOutTime: '09:00:00',
      method: 'QR_CODE',
      recordedBy: 'system',
      recordedAt: `${selectedDate}T07:25:00Z`,
      metadata: {
        qrCodeId: 'qr_morning_002',
        deviceId: 'tablet_002'
      }
    }
  ];

  const mockAttendanceStats: AttendanceStats = {
    period: {
      startDate: selectedDate,
      endDate: selectedDate,
      type: 'DAILY'
    },
    overall: {
      totalSessions: 5,
      totalStudents: 5,
      averageAttendanceRate: 80,
      averagePunctualityRate: 60
    },
    byStatus: {
      present: 2,
      late: 1,
      absent: 1,
      excused: 0,
      sick: 1,
      permission: 0
    },
    byHalaqah: [
      {
        halaqahId: 'halaqah_1',
        halaqahName: 'Halaqah Al-Fatihah',
        attendanceRate: 75,
        studentCount: 3
      },
      {
        halaqahId: 'halaqah_2',
        halaqahName: 'Halaqah Al-Baqarah',
        attendanceRate: 50,
        studentCount: 2
      }
    ],
    trends: [],
    topPerformers: [],
    alerts: {
      chronic_absentees: 1,
      chronic_late: 0,
      perfect_attendance: 2
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, searchTerm, statusFilter, halaqahFilter, sessionFilter]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAttendanceRecords(mockAttendanceRecords);
      setAttendanceStats(mockAttendanceStats);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = attendanceRecords;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.santriNis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.halaqahName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filter by halaqah
    if (halaqahFilter !== 'all') {
      filtered = filtered.filter(record => record.halaqahId === halaqahFilter);
    }

    // Filter by session
    if (sessionFilter !== 'all') {
      filtered = filtered.filter(record => record.sessionType === sessionFilter);
    }

    setFilteredRecords(filtered);
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'LATE': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'ABSENT': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'EXCUSED': return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'SICK': return <AlertCircle className="h-4 w-4 text-purple-600" />;
      case 'PERMISSION': return <UserX className="h-4 w-4 text-indigo-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Attendance System</h1>
          <p className="text-gray-600">Sistem absensi canggih dengan QR Code dan analytics</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Absensi
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Tanggal:</label>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Button variant="outline" onClick={loadAttendanceData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {attendanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Santri</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.overall.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hadir</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.byStatus.present}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-yellow-600">{attendanceStats.byStatus.late}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tidak Hadir</p>
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.byStatus.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sakit</p>
                  <p className="text-2xl font-bold text-purple-600">{attendanceStats.byStatus.sick}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
                  <p className="text-2xl font-bold text-teal-600">{attendanceStats.overall.averageAttendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari santri, NIS, atau halaqah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="PRESENT">Hadir</option>
                <option value="LATE">Terlambat</option>
                <option value="ABSENT">Tidak Hadir</option>
                <option value="EXCUSED">Izin</option>
                <option value="SICK">Sakit</option>
                <option value="PERMISSION">Izin Khusus</option>
              </select>
              <select
                value={halaqahFilter}
                onChange={(e) => setHalaqahFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Halaqah</option>
                <option value="halaqah_1">Halaqah Al-Fatihah</option>
                <option value="halaqah_2">Halaqah Al-Baqarah</option>
              </select>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Sesi</option>
                <option value="MORNING">Pagi</option>
                <option value="AFTERNOON">Siang</option>
                <option value="EVENING">Sore</option>
                <option value="WEEKEND">Weekend</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Absensi - {new Date(selectedDate).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Santri</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Halaqah</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Sesi</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Waktu</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Metode</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Catatan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{record.santriName}</div>
                        <div className="text-sm text-gray-500">{record.santriNis}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{record.halaqahName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSessionTypeColor(record.sessionType)}`}>
                        {getSessionTypeText(record.sessionType)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAttendanceStatusColor(record.status)}`}>
                          {getAttendanceStatusText(record.status)}
                        </span>
                      </div>
                      {record.lateMinutes && record.lateMinutes > 0 && (
                        <div className="text-xs text-yellow-600 mt-1">
                          +{formatDuration(record.lateMinutes)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {record.checkInTime ? (
                          <>
                            <div>Masuk: {formatTime(record.checkInTime)}</div>
                            {record.checkOutTime && (
                              <div className="text-xs text-gray-500">Keluar: {formatTime(record.checkOutTime)}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {record.method === 'QR_CODE' && <QrCode className="h-4 w-4 text-blue-600" />}
                        {record.method === 'MANUAL' && <Edit className="h-4 w-4 text-gray-600" />}
                        <span className="text-xs text-gray-600">{record.method}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {record.notes || record.excuseReason || '-'}
                      </div>
                      {record.excuseDocument && (
                        <a 
                          href={record.excuseDocument} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Lihat Dokumen
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data absensi</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || halaqahFilter !== 'all' || sessionFilter !== 'all'
                    ? 'Tidak ada absensi yang sesuai dengan filter'
                    : 'Belum ada data absensi untuk tanggal ini'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
