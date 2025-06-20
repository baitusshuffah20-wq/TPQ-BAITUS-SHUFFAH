'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  UserCheck,
  UserX,
  Edit,
  TrendingUp,
  QrCode,
  MapPin,
  Bell,
  BarChart3,
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

// Using AttendanceRecord interface from attendance-data.ts

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [halaqahFilter, setHalaqahFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  
  // Attendance list state
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [editingAttendance, setEditingAttendance] = useState<any>(null);

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

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  // Fungsi untuk memfilter data kehadiran
  const filterRecords = () => {
    if (attendanceRecords.length === 0) {
      setFilteredRecords([]);
      return;
    }

    let filtered = [...attendanceRecords];

    // Filter berdasarkan pencarian
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.santriNis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.halaqahName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.musyrifName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filter berdasarkan halaqah
    if (halaqahFilter !== 'all') {
      filtered = filtered.filter(record => record.halaqahId === halaqahFilter);
    }

    // Filter berdasarkan sesi
    if (sessionFilter !== 'all') {
      filtered = filtered.filter(record => record.sessionType === sessionFilter);
    }

    setFilteredRecords(filtered);
  };

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, searchTerm, statusFilter, halaqahFilter, sessionFilter]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      // Mock attendance data
      const mockAttendance = [
        {
          id: '1',
          date: '2024-01-15',
          session: 'MORNING',
          halaqah: 'Halaqah Al-Fatihah',
          musyrifId: '1',
          musyrifName: 'Ustadz Abdullah',
          location: 'Ruang Kelas A',
          topic: 'Hafalan Surah Al-Fatihah',
          notes: 'Pembelajaran berjalan lancar',
          totalSantri: 5,
          presentCount: 4,
          absentCount: 1,
          lateCount: 0,
          sickCount: 0,
          permissionCount: 0,
          attendanceList: [
            {
              santriId: '1',
              santriName: 'Ahmad Fauzi',
              santriNis: '24001',
              status: 'PRESENT',
              arrivalTime: '07:30',
              notes: ''
            },
            {
              santriId: '2',
              santriName: 'Siti Aisyah',
              santriNis: '24002',
              status: 'PRESENT',
              arrivalTime: '07:25',
              notes: ''
            },
            {
              santriId: '3',
              santriName: 'Muhammad Rizki',
              santriNis: '24003',
              status: 'ABSENT',
              arrivalTime: '',
              notes: 'Sakit demam'
            }
          ],
          createdAt: '2024-01-15T07:00:00Z',
          updatedAt: '2024-01-15T07:30:00Z'
        },
        {
          id: '2',
          date: '2024-01-14',
          session: 'AFTERNOON',
          halaqah: 'Halaqah Al-Baqarah',
          musyrifId: '2',
          musyrifName: 'Ustadzah Fatimah',
          location: 'Ruang Kelas B',
          topic: 'Murajaah Surah Al-Baqarah',
          notes: 'Perlu lebih fokus pada tajwid',
          totalSantri: 3,
          presentCount: 3,
          absentCount: 0,
          lateCount: 0,
          sickCount: 0,
          permissionCount: 0,
          attendanceList: [
            {
              santriId: '4',
              santriName: 'Fatimah Zahra',
              santriNis: '24004',
              status: 'PRESENT',
              arrivalTime: '13:00',
              notes: ''
            },
            {
              santriId: '5',
              santriName: 'Abdullah Rahman',
              santriNis: '24005',
              status: 'PRESENT',
              arrivalTime: '13:05',
              notes: ''
            }
          ],
          createdAt: '2024-01-14T13:00:00Z',
          updatedAt: '2024-01-14T13:30:00Z'
        }
      ];

      setAttendanceList(mockAttendance);
    } catch (error) {
      console.error('Error loading attendance:', error);
      alert('Gagal memuat data kehadiran');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttendance = async (attendanceData: any) => {
    try {
      // Mock create - add to local state
      const newAttendance = {
        ...attendanceData,
        id: `attendance_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAttendanceList(prev => [...prev, newAttendance]);
      alert('Data kehadiran berhasil disimpan!');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating attendance:', error);
      alert('Gagal menyimpan data kehadiran');
    }
  };

  const handleUpdateAttendance = async (attendanceData: any) => {
    try {
      // Mock update - update local state
      setAttendanceList(prev => prev.map(a =>
        a.id === editingAttendance?.id ? { ...attendanceData, id: editingAttendance.id, updatedAt: new Date().toISOString() } : a
      ));
      alert('Data kehadiran berhasil diperbarui!');
      setEditingAttendance(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Gagal memperbarui data kehadiran');
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kehadiran ini?')) return;

    try {
      // Mock delete - remove from local state
      setAttendanceList(prev => prev.filter(a => a.id !== attendanceId));
      alert('Data kehadiran berhasil dihapus!');
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Gagal menghapus data kehadiran');
    }
  };

  const handleViewDetail = (attendance: any) => {
    setSelectedAttendance(attendance);
    setShowDetailModal(true);
  };

  const handleEditAttendance = (attendance: any) => {
    setEditingAttendance(attendance);
    setShowDetailModal(false);
    setShowAddModal(true);
  };

  // Filter attendance data
  const filteredAttendance = attendanceList.filter(attendance => {
    const matchesSearch = attendance.halaqah.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendance.musyrifName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendance.location?.toLowerCase().includes(searchTerm.toLowerCase());

    // For now, we'll filter by overall session status rather than individual student status
    return matchesSearch;
  });

  // Calculate stats
  const stats = {
    totalSessions: attendanceList.length,
    totalSantri: attendanceList.reduce((sum, a) => sum + a.totalSantri, 0),
    totalPresent: attendanceList.reduce((sum, a) => sum + a.presentCount, 0),
    totalAbsent: attendanceList.reduce((sum, a) => sum + a.absentCount, 0),
    totalLate: attendanceList.reduce((sum, a) => sum + a.lateCount, 0),
    attendanceRate: attendanceList.length > 0
      ? Math.round((attendanceList.reduce((sum, a) => sum + a.presentCount, 0) /
          attendanceList.reduce((sum, a) => sum + a.totalSantri, 0)) * 100)
      : 0
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data kehadiran...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'LATE':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ABSENT':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'EXCUSED':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionText = (session: string) => {
    switch (session) {
      case 'MORNING': return 'Pagi';
      case 'AFTERNOON': return 'Siang';
      case 'EVENING': return 'Sore';
      default: return session;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Kehadiran
            </h1>
            <p className="text-gray-600">
              Kelola dan pantau kehadiran santri TPQ
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Catat Kehadiran
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sesi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hadir</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalPresent}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Terlambat</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.totalLate}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tidak Hadir</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalAbsent}</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.attendanceRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Cari halaqah, musyrif, atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  <option value="ALL">Semua Tanggal</option>
                  <option value="TODAY">Hari Ini</option>
                  <option value="WEEK">Minggu Ini</option>
                  <option value="MONTH">Bulan Ini</option>
                </select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Attendance Sessions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal & Sesi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Halaqah</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Musyrif</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Lokasi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Kehadiran</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tingkat Kehadiran</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((attendance) => (
                    <tr key={attendance.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(attendance.date).toLocaleDateString('id-ID')}
                          </p>
                          <p className="text-sm text-gray-500">{getSessionText(attendance.session)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{attendance.halaqah}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{attendance.musyrifName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{attendance.location || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-600 font-medium">
                            {attendance.presentCount} hadir
                          </span>
                          <span className="text-red-600">
                            {attendance.absentCount} tidak hadir
                          </span>
                          {attendance.lateCount > 0 && (
                            <span className="text-yellow-600">
                              {attendance.lateCount} terlambat
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{
                                width: `${Math.round((attendance.presentCount / attendance.totalSantri) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {Math.round((attendance.presentCount / attendance.totalSantri) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(attendance)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditAttendance(attendance)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modals - Placeholder for actual modal components */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">
                {editingAttendance ? 'Edit Kehadiran' : 'Catat Kehadiran'}
              </h3>
              <p className="mb-4">Form kehadiran akan ditampilkan di sini.</p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAttendance(null);
                  }}
                >
                  Batal
                </Button>
                <Button onClick={() => {
                  setShowAddModal(false);
                  toast.success('Data kehadiran berhasil disimpan');
                }}>
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && selectedAttendance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Detail Kehadiran</h3>
              <p className="mb-4">Detail kehadiran akan ditampilkan di sini.</p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </Button>
                <Button onClick={() => {
                  setShowDetailModal(false);
                  setEditingAttendance(selectedAttendance);
                  setShowAddModal(true);
                }}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
