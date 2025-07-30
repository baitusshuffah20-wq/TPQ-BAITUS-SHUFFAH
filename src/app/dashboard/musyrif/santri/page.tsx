"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  BookOpen,
  Calendar,
  Award,
  Phone,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface SantriData {
  id: string;
  name: string;
  nis: string;
  age: number;
  halaqah: string;
  progress: number;
  lastHafalan: string;
  attendanceRate: number;
  phone: string;
  address: string;
  parentName: string;
  status: string;
  joinDate: string;
  photo: string | null;
}

const MusyrifSantriPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [santriList, setSantriList] = useState<SantriData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSantriData();
  }, []);

  const fetchSantriData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/musyrif/santri");
      const data = await response.json();

      if (data.success) {
        setSantriList(data.data || []);
      } else {
        setError("Gagal memuat data santri: " + data.message);
        setSantriList([]);
      }
    } catch (error) {
      console.error("Error fetching santri data:", error);
      setError("Terjadi kesalahan saat memuat data santri");
      setSantriList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSantri = santriList.filter((santri) => {
    const matchesSearch =
      santri.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      santri.nis.includes(searchTerm);
    const matchesFilter =
      selectedFilter === "all" ||
      santri.halaqah.toLowerCase().includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600 bg-green-100";
    if (progress >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data santri...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchSantriData} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Santri
            </h1>
            <p className="text-gray-600">Kelola santri binaan Anda</p>
          </div>
          <Button className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Santri
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Santri
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {santriList.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Rata-rata Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      santriList.reduce((acc, s) => acc + s.progress, 0) /
                        santriList.length,
                    )}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Rata-rata Kehadiran
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      santriList.reduce((acc, s) => acc + s.attendanceRate, 0) /
                        santriList.length,
                    )}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Halaqah Aktif
                  </p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari santri berdasarkan nama atau NIS..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">Semua Halaqah</option>
                  <option value="fatihah">Al-Fatihah</option>
                  <option value="baqarah">Al-Baqarah</option>
                  <option value="imran">Ali Imran</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Santri List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Santri ({filteredSantri.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSantri.map((santri) => (
                <div
                  key={santri.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
                        {santri.photo ? (
                          <img
                            src={santri.photo}
                            alt={santri.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-teal-600 font-semibold">
                            {santri.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {santri.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          NIS: {santri.nis} � Umur: {santri.age} tahun
                        </p>
                        <p className="text-sm text-gray-500">
                          Halaqah: {santri.halaqah}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(santri.progress)}`}
                        >
                          {santri.progress}% Progress
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hafalan</p>
                      </div>

                      <div className="text-center">
                        <div
                          className={`text-sm font-semibold ${getAttendanceColor(santri.attendanceRate)}`}
                        >
                          {santri.attendanceRate}%
                        </div>
                        <p className="text-xs text-gray-500">Kehadiran</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Terakhir: {santri.lastHafalan}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {santri.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {santri.address}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MusyrifSantriPage;
