"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Eye,
  MapPin,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface HalaqahData {
  id: string;
  name: string;
  description: string;
  level: string;
  capacity: number;
  currentStudents: number;
  room: string;
  schedule: string;
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  }>;
  status: string;
  averageProgress: number;
  capacityPercentage: number;
  isNearCapacity: boolean;
  totalSessions: number;
  santri: Array<{
    id: string;
    nis: string;
    name: string;
    status: string;
    enrollmentDate: string;
  }>;
  musyrif: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
}

interface SummaryData {
  totalHalaqah: number;
  totalStudents: number;
  totalCapacity: number;
  averageProgress: number;
  capacityUtilization: number;
}

const MusyrifHalaqahPage = () => {
  const { user } = useAuth();
  const [halaqahList, setHalaqahList] = useState<HalaqahData[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalHalaqah: 0,
    totalStudents: 0,
    totalCapacity: 0,
    averageProgress: 0,
    capacityUtilization: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch halaqah data from API
  useEffect(() => {
    const fetchHalaqahData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/musyrif/halaqah");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch halaqah data");
        }

        if (result.success) {
          setHalaqahList(result.data || []);
          setSummary(result.summary || {
            totalHalaqah: 0,
            totalStudents: 0,
            totalCapacity: 0,
            averageProgress: 0,
            capacityUtilization: 0,
          });
        } else {
          throw new Error(result.message || "Failed to load halaqah data");
        }
      } catch (error) {
        console.error("Error fetching halaqah data:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "MUSYRIF") {
      fetchHalaqahData();
    }
  }, [user]);

  // Helper functions
  const formatLevel = (level: string) => {
    switch (level.toUpperCase()) {
      case "BEGINNER":
        return "Pemula";
      case "INTERMEDIATE":
        return "Menengah";
      case "ADVANCED":
        return "Lanjutan";
      default:
        return level;
    }
  };

  const getLevelColor = (level: string) => {
    const formattedLevel = formatLevel(level);
    switch (formattedLevel) {
      case "Pemula":
        return "bg-blue-100 text-blue-800";
      case "Menengah":
        return "bg-yellow-100 text-yellow-800";
      case "Lanjutan":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCapacityColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data halaqah...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header - Removed "Buat Halaqah Baru" button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Halaqah Saya
            </h1>
            <p className="text-gray-600">
              Halaqah yang dijadwalkan untuk Anda
            </p>
          </div>
          {halaqahList.length > 0 && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">
                {halaqahList.length} halaqah aktif
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Halaqah
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.totalHalaqah}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Santri
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.totalStudents}
                  </p>
                  <p className="text-xs text-gray-500">
                    dari {summary.totalCapacity} kapasitas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Rata-rata Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.averageProgress}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Kapasitas Terisi
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.capacityUtilization}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {halaqahList.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Halaqah
              </h3>
              <p className="text-gray-600 mb-4">
                Anda belum dijadwalkan untuk mengajar halaqah manapun.
                Silakan hubungi admin untuk mendapatkan jadwal halaqah.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Halaqah List */}
        {halaqahList.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {halaqahList.map((halaqah) => (
              <Card
                key={halaqah.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{halaqah.name}</CardTitle>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(halaqah.level)}`}
                    >
                      {formatLevel(halaqah.level)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{halaqah.schedule || "Jadwal belum diatur"}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{halaqah.room || "Ruang belum ditentukan"}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Target className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Level {formatLevel(halaqah.level)}</span>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Kapasitas Santri
                        </span>
                        <span
                          className={`text-sm font-semibold ${getCapacityColor(halaqah.currentStudents, halaqah.capacity)}`}
                        >
                          {halaqah.currentStudents}/{halaqah.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            halaqah.isNearCapacity ? "bg-yellow-500" : "bg-teal-600"
                          }`}
                          style={{
                            width: `${halaqah.capacityPercentage}%`,
                          }}
                        ></div>
                      </div>
                      {halaqah.isNearCapacity && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Kapasitas hampir penuh
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    {halaqah.description && (
                      <p className="text-sm text-gray-600">{halaqah.description}</p>
                    )}

                    {/* Santri List */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Daftar Santri ({halaqah.santri.length})
                      </h4>
                      {halaqah.santri.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {halaqah.santri.slice(0, 5).map((santri) => (
                            <div
                              key={santri.id}
                              className="flex items-center justify-between text-sm py-1"
                            >
                              <div className="flex-1">
                                <span className="text-gray-700 font-medium">{santri.name}</span>
                                <span className="text-gray-500 text-xs ml-2">({santri.nis})</span>
                              </div>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                Aktif
                              </span>
                            </div>
                          ))}
                          {halaqah.santri.length > 5 && (
                            <p className="text-xs text-gray-500 text-center py-1">
                              +{halaqah.santri.length - 5} santri lainnya
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Belum ada santri terdaftar
                        </p>
                      )}
                    </div>

                    {/* Actions - Only view actions, no edit permissions */}
                    <div className="flex space-x-2 pt-4 border-t border-gray-200">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Detail Santri
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Lihat Jadwal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions - Only view actions for musyrif */}
        {halaqahList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Lihat Santri</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Jadwal Saya</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Award className="h-6 w-6 mb-2" />
                  <span className="text-sm">Penilaian</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MusyrifHalaqahPage;
