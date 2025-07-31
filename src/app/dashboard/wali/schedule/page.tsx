"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Loader2,
  AlertCircle,
  Award,
  MessageSquare,
} from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  musyrif: string;
  description: string;
  participants: string[];
  color: string;
  recurring?: boolean;
}

interface ScheduleData {
  events: ScheduleEvent[];
  upcomingEvents: ScheduleEvent[];
  statistics: {
    hafalan: number;
    evaluation: number;
    event: number;
    meeting: number;
    total: number;
  };
  children: Array<{
    id: string;
    name: string;
    nis: string;
    halaqah: {
      name: string;
    } | null;
  }>;
  regularSchedules: Array<{
    id: string;
    title: string;
    type: string;
    dayOfWeek: number;
    time: string;
    location: string;
    musyrif: string;
    description: string;
    participants: string[];
    color: string;
    recurring: boolean;
  }>;
}

const WaliSchedulePage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("month"); // month, week, day
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScheduleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduleData();
  }, [currentDate]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const response = await fetch(`/api/dashboard/wali/schedule?month=${month}&year=${year}`);

      if (!response.ok) {
        throw new Error('Failed to fetch schedule data');
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

  const handleSetReminder = async (eventId: string) => {
    try {
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + 1); // Set reminder 1 hour from now

      const response = await fetch('/api/dashboard/wali/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set_reminder',
          eventId,
          reminderTime: reminderTime.toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set reminder');
      }

      const result = await response.json();
      if (result.success) {
        alert('Pengingat berhasil diatur!');
      }
    } catch (err) {
      alert('Gagal mengatur pengingat');
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
            <Button onClick={fetchScheduleData} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'hafalan':
        return <BookOpen className="h-4 w-4" />;
      case 'evaluation':
        return <Users className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'hafalan':
        return 'Hafalan';
      case 'evaluation':
        return 'Evaluasi';
      case 'event':
        return 'Kegiatan';
      case 'meeting':
        return 'Pertemuan';
      default:
        return 'Acara';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jadwal Kegiatan TPQ</h1>
            <p className="text-gray-600">Lihat jadwal kegiatan dan acara TPQ untuk anak Anda</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Semua Kegiatan</option>
              <option value="hafalan">Hafalan</option>
              <option value="evaluation">Evaluasi</option>
              <option value="event">Kegiatan</option>
              <option value="meeting">Pertemuan</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        {data?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-600">Hafalan</p>
                    <p className="text-2xl font-bold">{data.statistics.hafalan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Evaluasi</p>
                    <p className="text-2xl font-bold">{data.statistics.evaluation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Kegiatan</p>
                    <p className="text-2xl font-bold">{data.statistics.event}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Pertemuan</p>
                    <p className="text-2xl font-bold">{data.statistics.meeting}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={selectedView === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView('month')}
                >
                  Bulan
                </Button>
                <Button
                  variant={selectedView === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView('week')}
                >
                  Minggu
                </Button>
                <Button
                  variant={selectedView === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView('day')}
                >
                  Hari
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Kalender Kegiatan</CardTitle>
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
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const hasEvent = scheduleEvents.some(event => 
                    new Date(event.date).toDateString() === date.toDateString()
                  );

                  return (
                    <div
                      key={i}
                      className={`p-2 h-20 border border-gray-100 ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'bg-teal-50 border-teal-200' : ''}`}
                    >
                      <div className={`text-sm ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'font-bold text-teal-600' : ''}`}>
                        {date.getDate()}
                      </div>
                      {hasEvent && (
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Kegiatan Mendatang ({data?.upcomingEvents.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
                  data.upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getEventTypeIcon(event.type)}
                            <Badge variant="secondary" className="text-xs">
                              {getEventTypeName(event.type)}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-2" />
                              {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-2" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-2" />
                              {event.musyrif}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{event.description}</p>
                          <p className="text-xs font-medium text-blue-600 mt-1">
                            {formatDate(event.date)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetReminder(event.id)}
                          className="ml-2"
                        >
                          <Bell className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Tidak ada kegiatan mendatang</p>
                    <p className="text-sm">Kegiatan akan muncul di sini</p>
                  </div>
                )}
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kegiatan Hafalan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduleEvents.filter(e => e.type === 'hafalan').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Evaluasi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduleEvents.filter(e => e.type === 'evaluation').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Acara Khusus</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduleEvents.filter(e => e.type === 'event').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pertemuan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduleEvents.filter(e => e.type === 'meeting').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WaliSchedulePage;
