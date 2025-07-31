"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  BarChart3,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle,
  Send,
  MessageSquare,
  User,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  reason?: string;
  musyrifNotes?: string;
  childName: string;
  session: string;
}

interface AttendanceData {
  calendar: {
    [date: string]: AttendanceRecord[];
  };
  statistics: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    permissionDays: number;
    attendanceRate: number;
    thisMonthRate: number;
    trend: string;
    consecutivePresent: number;
  };
  children: Array<{
    id: string;
    name: string;
    nis: string;
    class: string;
    attendanceRate: number;
    lastAttendance: string;
    status: string;
  }>;
  recentAttendance: AttendanceRecord[];
  monthlyData: Array<{
    month: string;
    present: number;
    absent: number;
    permission: number;
    rate: number;
  }>;
}

const WaliAttendancePage = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("calendar");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttendanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [excuseNote, setExcuseNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedChild, selectedMonth, selectedYear]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedChild !== "all") params.append("childId", selectedChild);
      params.append("month", selectedMonth.toString());
      params.append("year", selectedYear.toString());

      const response = await fetch(`/api/dashboard/wali/attendance?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExcuse = async (attendanceId: string) => {
    if (!excuseNote.trim()) return;

    try {
      setSending(true);
      const response = await fetch('/api/dashboard/wali/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_excuse',
          attendanceId,
          excuse: excuseNote.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit excuse');
      }

      const result = await response.json();
      if (result.success) {
        setExcuseNote("");
        fetchAttendanceData(); // Refresh data
        alert('Keterangan berhasil dikirim!');
      }
    } catch (err) {
      alert('Gagal mengirim keterangan');
    } finally {
      setSending(false);
    }
  };

  const handleRequestPermission = async (date: string, reason: string) => {
    try {
      const response = await fetch('/api/dashboard/wali/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_permission',
          date,
          reason,
          childId: selectedChild
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to request permission');
      }

      const result = await response.json();
      if (result.success) {
        alert('Permohonan izin berhasil dikirim!');
        fetchAttendanceData(); // Refresh data
      }
    } catch (err) {
      alert('Gagal mengirim permohonan izin');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchAttendanceData} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock children data
  const children = [
    {
      id: "1",
      name: "Muhammad Fauzi",
      nis: "2024001",
      class: "Juz 1",
    },
  ];

  // Mock attendance data
  const attendanceData = [
    { date: "2024-01-01", status: "present", time: "08:00", notes: "" },
    { date: "2024-01-02", status: "present", time: "08:05", notes: "" },
    { date: "2024-01-03", status: "absent", time: null, notes: "Sakit demam" },
    { date: "2024-01-04", status: "present", time: "07:55", notes: "" },
    { date: "2024-01-05", status: "late", time: "08:15", notes: "Terlambat 15 menit" },
    { date: "2024-01-08", status: "present", time: "08:00", notes: "" },
    { date: "2024-01-09", status: "present", time: "08:02", notes: "" },
    { date: "2024-01-10", status: "present", time: "07:58", notes: "" },
    { date: "2024-01-11", status: "absent", time: null, notes: "Izin keperluan keluarga" },
    { date: "2024-01-12", status: "present", time: "08:00", notes: "" },
    { date: "2024-01-15", status: "present", time: "08:03", notes: "" },
    { date: "2024-01-16", status: "present", time: "07:59", notes: "" },
    { date: "2024-01-17", status: "late", time: "08:20", notes: "Terlambat 20 menit" },
    { date: "2024-01-18", status: "present", time: "08:01", notes: "" },
    { date: "2024-01-19", status: "present", time: "08:00", notes: "" },
    { date: "2024-01-22", status: "present", time: "07:57", notes: "" },
    { date: "2024-01-23", status: "present", time: "08:04", notes: "" },
    { date: "2024-01-24", status: "present", time: "08:00", notes: "" },
    { date: "2024-01-25", status: "absent", time: null, notes: "Sakit flu" },
    { date: "2024-01-26", status: "present", time: "08:02", notes: "" },
  ];

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const currentMonthData = attendanceData.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
  });

  const presentCount = currentMonthData.filter(record => record.status === "present").length;
  const absentCount = currentMonthData.filter(record => record.status === "absent").length;
  const lateCount = currentMonthData.filter(record => record.status === "late").length;
  const totalDays = currentMonthData.length;
  const attendanceRate = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'absent':
        return 'Tidak Hadir';
      case 'late':
        return 'Terlambat';
      default:
        return 'Tidak Ada Data';
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendanceRecord = attendanceData.find(record => record.date === dateString);
      const isToday = new Date().toDateString() === new Date(dateString).toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 h-16 border border-gray-100 ${
            isToday ? 'bg-teal-50 border-teal-200' : 'bg-white'
          }`}
        >
          <div className={`text-sm ${isToday ? 'font-bold text-teal-600' : 'text-gray-900'}`}>
            {day}
          </div>
          {attendanceRecord && (
            <div className="mt-1 flex items-center justify-center">
              {getStatusIcon(attendanceRecord.status)}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kehadiran Anak</h1>
            <p className="text-gray-600">Pantau kehadiran dan kedisiplinan anak Anda</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Kalender
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Daftar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
          </div>
        </div>

        {/* Child Selector */}
        {data?.children && data.children.length > 1 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Pilih Anak:</span>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedChild === "all" ? "default" : "outline"}
                    onClick={() => setSelectedChild("all")}
                  >
                    Semua Anak
                  </Button>
                  {data.children.map((child) => (
                    <Button
                      key={child.id}
                      variant={selectedChild === child.id ? "default" : "outline"}
                      onClick={() => setSelectedChild(child.id)}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-xs font-bold text-blue-600">
                          {child.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <span>{child.name}</span>
                      <Badge
                        variant={child.attendanceRate >= 90 ? "default" : child.attendanceRate >= 75 ? "secondary" : "destructive"}
                        className="ml-1"
                      >
                        {child.attendanceRate}%
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Summary */}
        {data?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Tingkat Kehadiran</p>
                    <p className="text-2xl font-bold">{data.statistics.attendanceRate}%</p>
                    <p className="text-xs text-gray-500">
                      {data.statistics.presentDays} dari {data.statistics.totalDays} hari
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Hadir</p>
                    <p className="text-2xl font-bold">{data.statistics.presentDays}</p>
                    <p className="text-xs text-gray-500">hari</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Tidak Hadir</p>
                    <p className="text-2xl font-bold">{data.statistics.absentDays}</p>
                    <p className="text-xs text-gray-500">hari</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className={`h-8 w-8 ${data.statistics.trend === 'up' ? 'text-green-500' : data.statistics.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`} />
                  <div>
                    <p className="text-sm text-gray-600">Streak Hadir</p>
                    <p className="text-2xl font-bold">{data.statistics.consecutivePresent}</p>
                    <p className="text-xs text-gray-500">hari berturut</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hadir</p>
                  <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
                  <p className="text-xs text-gray-500">Hari</p>
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
                  <p className="text-2xl font-bold text-gray-900">{lateCount}</p>
                  <p className="text-xs text-gray-500">Hari</p>
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
                  <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
                  <p className="text-xs text-gray-500">Hari</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Month Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {months[selectedMonth]} {selectedYear}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar or List View */}
        {viewMode === "calendar" ? (
          <Card>
            <CardHeader>
              <CardTitle>Kalender Kehadiran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Kehadiran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentMonthData.map((record) => (
                  <div key={record.date} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        {record.time && (
                          <p className="text-sm text-gray-600">Waktu: {record.time}</p>
                        )}
                        {record.notes && (
                          <p className="text-sm text-gray-600">Catatan: {record.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Keterangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Hadir tepat waktu</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-700">Terlambat</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-gray-700">Tidak hadir</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance Issues */}
        {(absentCount > 0 || lateCount > 0) && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Perhatian Kehadiran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {absentCount > 0 && (
                  <p className="text-sm text-yellow-800">
                    • Anak Anda tidak hadir sebanyak {absentCount} hari bulan ini
                  </p>
                )}
                {lateCount > 0 && (
                  <p className="text-sm text-yellow-800">
                    • Anak Anda terlambat sebanyak {lateCount} hari bulan ini
                  </p>
                )}
                <p className="text-sm text-yellow-700 mt-2">
                  Mohon perhatikan kedisiplinan waktu anak untuk mendukung proses pembelajaran yang optimal.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WaliAttendancePage;
